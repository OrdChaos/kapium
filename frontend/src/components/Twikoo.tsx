import { useEffect, lazy, Suspense} from 'react'

import overrideUrl from '@/styles/twikoo.override.css?url'

interface TwikooProps {
  envId: string
  path?: string
}

const LazyTwikoo = lazy(async () => {
  const twikoo = (await import('twikoo/dist/twikoo.min')).default
  
  return {
    default: function TwikooComponent({ envId, path }: TwikooProps) {
      useEffect(() => {
        twikoo.init({
          envId,
          el: '#twikoo',
          path: path || window.location.pathname,
        })

        if (!document.getElementById('twikoo-overrides')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = overrideUrl;
          document.head.appendChild(link);
        }
      }, [envId, path])

      return <div id="twikoo" />
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