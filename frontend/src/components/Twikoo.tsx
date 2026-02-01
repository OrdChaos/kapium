import { useEffect } from 'react'
import twikoo from 'twikoo/dist/twikoo.nocss'
import 'twikoo/dist/twikoo.css'

import '@/styles/twikoo.override.css'

interface TwikooProps {
  envId: string
  path?: string
}

export default function Twikoo({ envId, path }: TwikooProps) {
  useEffect(() => {
    twikoo.init({
      envId,
      el: '#twikoo',
      path: path || window.location.pathname,
    })
  }, [envId, path])

  return (
    <div>
        <div id="twikoo" />
    </div>
  )
}