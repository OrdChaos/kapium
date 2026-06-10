import { useEffect, lazy, Suspense, useRef } from 'react'

import overrideUrl from '@/styles/twikoo.override.css?url'

interface TwikooProps {
  envId: string
  path?: string
}

/**
 * 派发全局 Twikoo 加载完成事件。
 * useHashScroll 等 hook 会监听此事件，在评论渲染完成后
 * 再次尝试滚动到 hash 锚点（如 #twikoo-xxx）。
 */
function notifyTwikooLoaded(el: HTMLElement) {
  el.setAttribute('data-twikoo-loaded', '');
  window.dispatchEvent(new CustomEvent('twikoo-loaded', { detail: el }));
}

/**
 * 主动触发 Twikoo 懒加载模块的下载（不等待 React 渲染到该组件）。
 * useHashScroll 在找不到 hash 锚点且 #twikoo 尚未出现在 DOM 中时调用，
 * 从而启动 下载 → 渲染 → 评论加载 的完整链路。
 */
export function preloadTwikoo() {
  return import('twikoo/dist/twikoo.min');
}

const LazyTwikoo = lazy(async () => {
  const twikoo = (await preloadTwikoo()).default
  
  return {
    default: function TwikooComponent({ envId, path }: TwikooProps) {
      const observerRef = useRef<MutationObserver | null>(null);

      useEffect(() => {
        const el = document.getElementById('twikoo');
        if (!el) return;

        // 如果已经标记为已加载（React StrictMode 双重挂载），直接返回
        if (el.hasAttribute('data-twikoo-loaded')) return;

        // 使用 MutationObserver 监听 Twikoo 何时真正渲染出评论 DOM
        observerRef.current = new MutationObserver((mutations, obs) => {
          // Twikoo 渲染完成后 #twikoo 内会有子元素（评论列表）
          if (el.children.length > 0) {
            obs.disconnect();
            notifyTwikooLoaded(el);
          }
        });

        observerRef.current.observe(el, { childList: true, subtree: true });

        twikoo.init({
          envId,
          el: '#twikoo',
          path: path || window.location.pathname,
        });

        if (!document.getElementById('twikoo-overrides')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = overrideUrl;
          document.head.appendChild(link);
        }

        // 兜底：如果 MutationObserver 在 5 秒内未触发（评论为空或网络异常），
        //       仍然派发事件，避免 useHashScroll 永远等待。
        const fallbackTimer = setTimeout(() => {
          if (!el.hasAttribute('data-twikoo-loaded')) {
            observerRef.current?.disconnect();
            notifyTwikooLoaded(el);
          }
        }, 5000);

        return () => {
          clearTimeout(fallbackTimer);
          observerRef.current?.disconnect();
        };
      }, [envId, path]);

      return <div id="twikoo" />;
    },
  }
})

export default function Twikoo(props: TwikooProps) {
  return (
    <Suspense fallback={<div>评论加载中...</div>}>
      <LazyTwikoo {...props} />
    </Suspense>
  )
}