declare module 'twikoo/dist/twikoo.nocss' {
  export interface TwikooInitOptions {
    envId: string
    el: string | HTMLElement
    path?: string
    region?: string
    lang?: string
  }

  export interface GetCommentsCountOptions {
    envId: string
    urls: string[]
    includeReply?: boolean
    region?: string
  }

  export interface CommentsCountItem {
    url: string
    count: number
  }

  function init(options: TwikooInitOptions): void

  function getCommentsCount(
    options: GetCommentsCountOptions
  ): Promise<CommentsCountItem[]>

  const twikoo: {
    init: typeof init
    getCommentsCount: typeof getCommentsCount
  }

  export default twikoo
}