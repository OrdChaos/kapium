import { useEffect, lazy, Suspense} from 'react'
//import twikoo from 'twikoo/dist/twikoo.nocss'
import 'twikoo/dist/twikoo.css'

import '@/styles/twikoo.override.css'

interface TwikooProps {
  envId: string
  path?: string
}

const LazyTwikoo = lazy(async () => {
  const twikoo = (await import('twikoo/dist/twikoo.nocss')).default
  return {
    default: function TwikooComponent({ envId, path }: TwikooProps) {
      useEffect(() => {
        twikoo.init({
          envId,
          el: '#twikoo',
          path: path || window.location.pathname,
        })
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