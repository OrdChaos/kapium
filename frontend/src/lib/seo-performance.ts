/**
 * SEO Performance Optimization Utils
 * 提供性能相关的SEO优化功能
 */

/**
 * LayoutShiftEntry 类型定义
 */
interface LayoutShiftEntry extends PerformanceEntry {
  hadRecentInput: boolean;
  value: number;
  sources: any[];
}

/**
 * PerformanceEventTiming 类型定义
 */
interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
  processingDuration: number;
  cancelable: boolean;
  target: EventTarget | null;
}

/**
 * 为重要资源添加preload/prefetch
 */
export interface PreloadResource {
  href: string;
  as: 'script' | 'style' | 'font' | 'image' | 'document' | 'iframe';
  type?: string;
  crossorigin?: boolean;
}

/**
 * 添加preload链接
 */
export function addPreload(resources: PreloadResource[]): void {
  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    
    if (resource.type) {
      link.type = resource.type;
    }
    if (resource.crossorigin) {
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
  });
}

/**
 * 添加prefetch链接（用于预期可能访问的资源）
 */
export function addPrefetch(urls: string[]): void {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * добавить dns-prefetch（用于DNS解析加速）
 */
export function addDnsPrefetch(domains: string[]): void {
  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  });
}

/**
 * 为图片添加loading lazy属性
 */
export function optimizeImages(): void {
  const images = document.querySelectorAll('img:not([loading])') as NodeListOf<HTMLImageElement>;
  images.forEach(img => {
    // 除了hero图片，其他都用lazy loading
    if (!img.classList.contains('hero-image')) {
      img.loading = 'lazy';
      // 添加decoding属性以提升性能
      img.decoding = 'async';
    }
  });
}

/**
 * 生成性能监测报告
 */
export interface PerformanceMetrics {
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  cls: number | null; // Cumulative Layout Shift
  fid: number | null; // First Input Delay
  ttfb: number | null; // Time to First Byte
}

/**
 * 获取核心Web指标（Core Web Vitals）
 */
export function getWebVitals(callback: (metrics: PerformanceMetrics) => void): void {
  const metrics: PerformanceMetrics = {
    fcp: null,
    lcp: null,
    cls: null,
    fid: null,
    ttfb: null,
  };

  // FCP - First Contentful Paint
  if ('PerformanceObserver' in window) {
    try {
      const fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          metrics.fcp = entries[0].startTime;
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
    } catch (e) {
      console.warn('FCP observer error:', e);
    }

    // LCP - Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          metrics.lcp = entries[entries.length - 1].startTime;
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP observer error:', e);
    }

    // CLS - Cumulative Layout Shift
    try {
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        let cls = 0;
        entries.forEach(entry => {
          const layoutShiftEntry = entry as LayoutShiftEntry;
          if (!layoutShiftEntry.hadRecentInput) {
            cls += layoutShiftEntry.value;
          }
        });
        metrics.cls = cls;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS observer error:', e);
    }
  }

  // FID - First Input Delay (deprecated in favor of INP)
  if ('PerformanceObserver' in window) {
    try {
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const perfEvent = entries[0] as PerformanceEventTiming;
          metrics.fid = perfEvent.processingStart - perfEvent.startTime;
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID observer error:', e);
    }
  }

  // TTFB - Time to First Byte
  if ('PerformanceNavigationTiming' in window) {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (perfData) {
      metrics.ttfb = perfData.responseStart - perfData.fetchStart;
    }
  }

  // 延迟返回结果，确保所有指标都被收集
  setTimeout(() => {
    callback(metrics);
  }, 3000);
}

/**
 * 内联关键CSS（用于首屏优化）
 * 注：实际应用中应在构建时处理
 */
export function inlineCriticalCSS(css: string): void {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.textContent = css;
  document.head.insertBefore(style, document.head.firstChild);
}
