// 缓存版本号 - 需要更新资源时改变这个版本号
const CACHE_VERSION = 'v1';
const CACHE_STATIC = `static-${CACHE_VERSION}`;
const CACHE_IMAGES = `images-${CACHE_VERSION}`;

// 需要缓存的静态资源（安装时）
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.css',
];

const IMAGE_TYPES = ['.jpg', '.jpeg', '.png'];

// Install: 缓存核心资源
self.addEventListener('install', (event) => {
  console.log(`%c[SW Install]%c Caching static assets...`, 'color: #007bff; font-weight: bold;', 'color: inherit;');
  
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn(`%c[SW Install]%c Some assets failed to cache:`, 'color: #dc3545; font-weight: bold;', 'color: inherit;', err);
        // 继续执行，不因为某个资源失败而阻止安装
      });
    })
  );
  
  // 强制立即激活
  self.skipWaiting();
});

// Activate: 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log(`%c[SW Activate]%c Cleaning old caches...`, 'color: #28a745; font-weight: bold;', 'color: inherit;');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 保留当前版本的缓存，删除旧版本
          if (cacheName !== CACHE_STATIC && cacheName !== CACHE_IMAGES && !cacheName.startsWith('images-')) {
            console.log(`%c[SW Activate]%c Deleting old cache: ${cacheName}`, 'color: #ffc107; font-weight: bold;', 'color: inherit;');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // 立即控制所有客户端
  self.clients.claim();
});

// Fetch: 处理所有请求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 只处理 GET 请求
  if (request.method !== 'GET') {
    return;
  }

  // 处理 img.ordchaos.com 的图片格式转换
  const isImage = IMAGE_TYPES.some(ext => url.pathname.toLowerCase().endsWith(ext));
  const isTargetHost = url.hostname === 'img.ordchaos.com';

  if (isImage && isTargetHost) {
    handleImageFormatConversion(event, request, url);
    return;
  }

  // 根据请求类型处理
  const isJsonRequest = url.pathname.endsWith('.json');
  const isHtmlRequest = request.headers.get('accept')?.includes('text/html') || 
                        (!url.pathname.includes('.') && !url.pathname.includes('/api/'));
  const isStaticAsset = /\.(js|css|woff|woff2|ttf|otf|eot|svg)$/i.test(url.pathname);

  if (isJsonRequest) {
    // JSON 请求：网络优先，不缓存
    handleJsonRequest(event, request);
  } else if (isHtmlRequest) {
    // HTML 页面请求：网络优先，离线时返回 index.html
    handleHtmlRequest(event, request);
  } else if (isStaticAsset) {
    // 静态资源：缓存优先
    handleStaticAsset(event, request);
  }
});

// 处理图片格式转换逻辑
function handleImageFormatConversion(event, request, url) {
  const acceptHeader = request.headers.get('accept') || '';
  let targetUrl = url.href;
  let format = '';

  if (acceptHeader.includes('image/avif')) {
    format = 'AVIF';
    targetUrl = url.href.replace(/\.(jpg|jpeg|png)$/i, '.avif');
  } else if (acceptHeader.includes('image/webp')) {
    format = 'WebP';
    targetUrl = url.href.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }

  if (format && targetUrl !== url.href) {
    console.log(
      `%c[SW Redirect]%c ${url.pathname} -> %c${format}`,
      'color: #007bff; font-weight: bold;', 
      'color: inherit;',
      'color: #28a745; font-weight: bold;'
    );

    event.respondWith(
      fetch(targetUrl, { mode: 'no-cors' }).catch((err) => {
        console.warn(`%c[SW Fallback]%c Failed to fetch ${format}, returning original.`, 'color: #dc3545; font-weight: bold;', 'color: inherit;');
        return fetch(request);
      })
    );
  } else {
    console.log(
      `%c[SW Skip]%c Browser does not support AVIF/WebP. Loading original: ${url.pathname}`,
      'color: #6c757d; font-weight: bold;',
      'color: inherit;'
    );
  }
}

// 处理 JSON 请求（API）：网络优先，不缓存
function handleJsonRequest(event, request) {
  event.respondWith(
    fetch(request)
      .catch(() => {
        // 离线时：返回错误响应，让前端处理离线状态
        console.warn(`%c[SW JSON]%c Offline, rejecting JSON request: ${event.request.url}`, 'color: #dc3545; font-weight: bold;', 'color: inherit;');
        return new Response(JSON.stringify({ error: 'offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
  );
}

// 处理 HTML 页面请求：网络优先，离线时返回 index.html
function handleHtmlRequest(event, request) {
  event.respondWith(
    fetch(request)
      .then((response) => {
        // 在线：缓存新的页面
        if (response.ok) {
          const cacheClone = response.clone();
          caches.open(CACHE_STATIC).then((cache) => {
            cache.put(request, cacheClone);
          });
        }
        return response;
      })
      .catch(() => {
        // 离线：返回 index.html（路由会处理离线页面）
        console.log(`%c[SW HTML]%c Offline, returning index.html for: ${event.request.url}`, 'color: #ffc107; font-weight: bold;', 'color: inherit;');
        return caches.match('/')
          .catch(() => {
            // 如果 index.html 也不在缓存中，返回一个空的 HTML 响应
            return new Response('<!DOCTYPE html><html><body>Offline</body></html>', {
              status: 200,
              headers: { 'Content-Type': 'text/html' }
            });
          });
      })
  );
}

// 处理静态资源：缓存优先，然后网络
function handleStaticAsset(event, request) {
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log(`%c[SW Cache]%c ${request.url}`, 'color: #28a745; font-weight: bold;', 'color: inherit;');
          return cachedResponse;
        }

        // 缓存中没有，尝试网络
        return fetch(request)
          .then((response) => {
            // 成功时缓存
            if (response.ok) {
              const cacheClone = response.clone();
              caches.open(CACHE_STATIC).then((cache) => {
                cache.put(request, cacheClone);
              });
            }
            return response;
          })
          .catch(() => {
            console.warn(`%c[SW Asset]%c Offline, no cache for: ${request.url}`, 'color: #ffc107; font-weight: bold;', 'color: inherit;');
            // 离线且缓存中没有，返回错误响应让浏览器处理
            return new Response('Resource offline', { status: 503 });
          });
      })
  );
}