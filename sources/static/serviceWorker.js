const IMAGE_TYPES = ['.jpg', '.jpeg', '.png'];

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. 检查是否为目标图片格式
  const isImage = IMAGE_TYPES.some(ext => url.pathname.toLowerCase().endsWith(ext));

  if (isImage) {
    const acceptHeader = request.headers.get('accept') || '';
    let targetUrl = url.href;
    let format = '';

    // 2. 优先级判断
    if (acceptHeader.includes('image/avif')) {
      format = 'AVIF';
      targetUrl = url.href.replace(/\.(jpg|jpeg|png)$/i, '.avif');
    } else if (acceptHeader.includes('image/webp')) {
      format = 'WebP';
      targetUrl = url.href.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }

    // 3. 输出日志并处理请求
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
        `%c[SW Skip]%c Browser doesn't support AVIF/WebP. Loading original: ${url.pathname}`,
        'color: #6c757d; font-weight: bold;',
        'color: inherit;'
      );
    }
  }
});