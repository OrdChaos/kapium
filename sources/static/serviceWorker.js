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

const IMAGE_TYPES = ['.jpg', '.jpeg', '.png'];

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

  const isImage = IMAGE_TYPES.some(ext => url.pathname.toLowerCase().endsWith(ext));
  const isTargetHost = url.hostname === 'img.ordchaos.com';

  if (isImage && isTargetHost) {
    handleImageFormatConversion(event, request, url);
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