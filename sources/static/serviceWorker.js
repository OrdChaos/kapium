const CACHE_VERSION = 'v1';
const CACHE_STATIC = `static-${CACHE_VERSION}`;
const CACHE_IMAGES = `images-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/owo.json',
  '/src/main.css',
];

const IMAGE_TYPES = ['.jpg', '.jpeg', '.png', '.avif', '.webp'];

const PRIMARY_HOST = 'base.pics.ordchaos.com';
const FALLBACK_HOSTS = [
  'n0.pics.ordchaos.com',
  'n1.pics.ordchaos.com',
  'n2.pics.ordchaos.com',
];

self.addEventListener('install', (event) => {
  console.log(`%c[SW Install]%c Caching static assets...`, 'color: #007bff; font-weight: bold;', 'color: inherit;');
  
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn(`%c[SW Install]%c Some assets failed to cache:`, 'color: #dc3545; font-weight: bold;', 'color: inherit;', err);
      });
    })
  );
  
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log(`%c[SW Activate]%c Cleaning old caches...`, 'color: #28a745; font-weight: bold;', 'color: inherit;');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_STATIC && cacheName !== CACHE_IMAGES && !cacheName.startsWith('images-')) {
            console.log(`%c[SW Activate]%c Deleting old cache: ${cacheName}`, 'color: #ffc107; font-weight: bold;', 'color: inherit;');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  const pathnameLower = url.pathname.toLowerCase();
  const isImage = IMAGE_TYPES.some(ext => pathnameLower.endsWith(ext));
  const isTargetImage = isImage && url.hostname === PRIMARY_HOST;

  if (isTargetImage) {
    event.respondWith(handleImageWithFallback(event.request, url));
    return;
  }

  const isJsonRequest = url.pathname.endsWith('.json');
  const isHtmlRequest = request.headers.get('accept')?.includes('text/html') || 
                        (!url.pathname.includes('.') && !url.pathname.includes('/api/'));
  const isStaticAsset = /\.(js|css|woff|woff2|ttf|otf|eot|svg)$/i.test(url.pathname);

  if (isJsonRequest) {
    handleJsonRequest(event, request);
  } else if (isHtmlRequest) {
    handleHtmlRequest(event, request);
  } else if (isStaticAsset) {
    handleStaticAsset(event, request);
  }
});

async function handleImageWithFallback(request, originalUrl) {
  const acceptHeader = request.headers.get('accept') || '';
  let targetExt = '';
  let targetPath = originalUrl.pathname;

  // 优先尝试更优格式
  if (acceptHeader.includes('image/avif')) {
    targetExt = '.avif';
  } else if (acceptHeader.includes('image/webp')) {
    targetExt = '.webp';
  }

  if (targetExt) {
    targetPath = originalUrl.pathname.replace(/\.(jpg|jpeg|png)$/i, targetExt);
  }

  // 先生成主域名的目标 URL
  const primaryTarget = new URL(originalUrl);
  primaryTarget.pathname = targetPath;

  console.log(`%c[SW Image Primary]%c Trying ${PRIMARY_HOST}${targetPath}`, 'color: #007bff; font-weight: bold;', 'color: inherit;');

  try {
    const primaryResp = await fetch(primaryTarget, { 
      mode: 'cors',
      credentials: 'omit',
      cache: 'default',
      redirect: 'follow'
    });

    if (primaryResp.ok) {
      console.log(`%c[SW Image Success]%c ${PRIMARY_HOST}${targetPath}`, 'color: #28a745; font-weight: bold;', 'color: inherit;');
      return primaryResp;
    }
  } catch (e) {
    console.warn(`%c[SW Primary Fail]%c ${PRIMARY_HOST} → ${e.message}`, 'color: #dc3545; font-weight: bold;', 'color: inherit;');
  }

  // 主域名失败 → 并发尝试三个 fallback
  console.log(`%c[SW Fallback]%c ${originalUrl.pathname} → concurrent n0/n1/n2`, 'color: #ffc107; font-weight: bold;', 'color: inherit;');

  const fallbackPromises = FALLBACK_HOSTS.map(host => {
    const fbUrl = new URL(primaryTarget);
    fbUrl.hostname = host;

    return fetch(fbUrl, { 
      mode: 'cors',
      credentials: 'omit',
      cache: 'default',
      redirect: 'follow',
      // 可选：设置较短超时避免卡住太久
      // signal: AbortSignal.timeout(8000),
    })
    .then(resp => {
      if (resp.ok) {
        console.log(`%c[SW Fallback OK]%c ${host}${fbUrl.pathname}`, 'color: #28a745; font-weight: bold;', 'color: inherit;');
        return resp;
      }
      throw new Error(`status ${resp.status}`);
    })
    .catch(err => {
      console.warn(`%c[SW Fallback Fail]%c ${host} → ${err.message}`, 'color: #dc3545; font-weight: bold;', 'color: inherit;');
      return null;
    });
  });

  // Promise.race + filter 出第一个成功的
  const firstSuccess = await Promise.race(fallbackPromises);

  if (firstSuccess) {
    return firstSuccess;
  }

  // 全部失败，返回原始请求（或占位图）
  console.error(`%c[SW All Failed]%c ${originalUrl.pathname}`, 'color: #dc3545; font-weight: bold;', 'color: inherit;');

  // 可选：返回 1x1 透明占位图
  return new Response(
    new Blob([new Uint8Array([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A,0x00,0x00,0x00,0x0D,0x49,0x48,0x44,0x52,
      0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,0x01,0x03,0x00,0x00,0x00,0x25,0xDB,0x56,0xCA,0x00,
      0x00,0x00,0x03,0x50,0x4C,0x54,0x45,0x00,0x00,0x00,0xA7,0x7A,0x5F,0x00,0x00,0x00,0x01,0x74,
      0x52,0x4E,0x53,0x00,0x40,0xE6,0xD8,0x66,0x00,0x00,0x00,0x0A,0x49,0x44,0x41,0x54,0x78,0x9C,
      0x63,0x00,0x01,0x00,0x00,0x05,0x00,0x01,0x0D,0x0A,0x2D,0xB4,0x00,0x00,0x00,0x00,0x49,0x45,
      0x4E,0x44,0xAE,0x42,0x60,0x82])]),
    { 
      status: 200, 
      headers: { 'Content-Type': 'image/png' } 
    }
  );
}

function handleJsonRequest(event, request) {
  event.respondWith(
    fetch(request)
      .catch(() => {
        console.warn(`%c[SW JSON]%c Offline, rejecting JSON request: ${event.request.url}`, 'color: #dc3545; font-weight: bold;', 'color: inherit;');
        return new Response(JSON.stringify({ error: 'offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
  );
}

function handleHtmlRequest(event, request) {
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const cacheClone = response.clone();
          caches.open(CACHE_STATIC).then((cache) => {
            cache.put(request, cacheClone);
          });
        }
        return response;
      })
      .catch(() => {
        console.log(`%c[SW HTML]%c Offline, returning index.html for: ${event.request.url}`, 'color: #ffc107; font-weight: bold;', 'color: inherit;');
        return caches.match('/')
          .catch(() => {
            return new Response('<!DOCTYPE html><html><body>Offline</body></html>', {
              status: 200,
              headers: { 'Content-Type': 'text/html' }
            });
          });
      })
  );
}

function handleStaticAsset(event, request) {
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log(`%c[SW Cache]%c ${request.url}`, 'color: #28a745; font-weight: bold;', 'color: inherit;');
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
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
            return new Response('Resource offline', { status: 503 });
          });
      })
  );
}