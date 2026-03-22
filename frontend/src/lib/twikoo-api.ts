interface TwikooResponse<T = any> {
  code?: number
  result?: T
  data?: T
  message?: string
  accessToken?: string
  [key: string]: any
}

interface TwikooConfig {
  envId?: string
  funcName?: string
}

interface CommentData {
  id?: string
  nick: string
  mail: string
  link?: string
  ua: string
  url: string
  href?: string
  comment: string
  pid?: string
  rid?: string
  turnstileToken?: string
  geeTestLotNumber?: string
  geeTestCaptchaOutput?: string
  geeTestPassToken?: string
  geeTestGenTime?: string
}

interface GetCommentsParams {
  url: string | string[]
  sort?: 'newest' | 'oldest' | 'popular'
  before?: number
  per?: number
  page?: number
  keyword?: string
  type?: 'VISIBLE' | 'HIDDEN'
}

export class TwikooError extends Error {
  constructor(
    message: string,
    public code?: number,
    public status?: number
  ) {
    super(message)
    this.name = 'TwikooError'
  }
}

export const isUrl = (s: string): boolean => {
  return /^http(s)?:\/\//.test(s)
}

export const callTwikoo = async <T = any>(
  event: string,
  data: Record<string, any> = {},
  config: TwikooConfig = {}
): Promise<TwikooResponse<T>> => {
  const { envId = 'http://localhost:8080' } = config

  console.log('[TwikooAPI] 调用事件:', event)
  console.log('[TwikooAPI] 请求数据:', data)
  console.log('[TwikooAPI] 配置:', config)

  if (!isUrl(envId)) {
    throw new TwikooError('缺少 envId 配置，请提供有效的服务器地址', undefined, 0)
  }

  return await new Promise<TwikooResponse<T>>((resolve, reject) => {
    try {
      const accessToken = localStorage.getItem('twikoo-access-token') || ''
      const xhr = new XMLHttpRequest()

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          console.log('[TwikooAPI] readyState:', xhr.readyState)
          console.log('[TwikooAPI] HTTP 状态:', xhr.status)
          console.log('[TwikooAPI] 响应文本:', xhr.responseText)

          if (xhr.status === 200) {
            try {
              const result = JSON.parse(xhr.responseText)

              if (result.accessToken) {
                localStorage.setItem('twikoo-access-token', result.accessToken)
              }

              if (result.code !== 0 && result.code !== undefined) {
                reject(
                  new TwikooError(
                    result.message || '请求失败',
                    result.code,
                    xhr.status
                  )
                )
                return
              }

              console.log('[TwikooAPI] 解析成功，返回结果:', result)
              resolve(result)
            } catch (e) {
              reject(
                new TwikooError(
                  'JSON 解析失败',
                  undefined,
                  xhr.status
                )
              )
            }
          } else {
            reject(
              new TwikooError(
                `HTTP 错误: ${xhr.status}`,
                undefined,
                xhr.status
              )
            )
          }
        }
      }

      xhr.onerror = () => {
        console.error('[TwikooAPI] 网络请求出错')
        reject(
          new TwikooError(
            '网络请求失败',
            undefined,
            xhr.status
          )
        )
      }

      xhr.open('POST', envId)
      xhr.setRequestHeader('Content-Type', 'application/json')
      const requestBody = JSON.stringify({ event, accessToken, ...data })
      console.log('[TwikooAPI] 请求体:', requestBody)
      xhr.send(requestBody)
    } catch (e) {
      reject(
        new TwikooError(
          e instanceof Error ? e.message : '未知错误',
          undefined,
          0
        )
      )
    }
  })
}

export const getCommentsCount = async (
  urls: string[],
  config?: TwikooConfig
): Promise<{ data: { url: string; count: number }[] }> => {
  if (!Array.isArray(urls) || urls.length === 0) {
    throw new TwikooError('urls 参数必须是非空数组', 1001)
  }

  const result = await callTwikoo('GET_COMMENTS_COUNT', { urls }, config)
  return result.data || result.result?.data || []
}

export const getRecentComments = async (
  limit: number = 10,
  config?: TwikooConfig
): Promise<any[]> => {
  const result = await callTwikoo('GET_RECENT_COMMENTS', { limit }, config)
  return result.data || result.result?.data || []
}

export const getComments = async (
  params: GetCommentsParams,
  config?: TwikooConfig
): Promise<{
  data: any[]
  count: number
  more: boolean
}> => {
  const result = await callTwikoo('COMMENT_GET', params, config)
  return {
    data: result.data || result.result?.data || [],
    count: result.count || 0,
    more: result.more || false
  }
}

export const submitComment = async (
  comment: CommentData,
  config?: TwikooConfig
): Promise<{ id: string }> => {
  const result = await callTwikoo('COMMENT_SUBMIT', comment, config)
  return { id: result.id || result.result?.id || '' }
}

export const likeComment = async (
  id: string,
  type: 'up' | 'down' = 'up',
  config?: TwikooConfig
): Promise<{ updated: number }> => {
  const result = await callTwikoo('COMMENT_LIKE', { id, type }, config)
  return { updated: result.updated || 1 }
}

export const adminLogin = async (
  password: string,
  config?: TwikooConfig
): Promise<{ code: number }> => {
  const result = await callTwikoo('LOGIN', { password }, config)
  return {
    code: result.code || 0
  }
}

export const getConfig = async (
  config?: TwikooConfig
): Promise<{ config: any }> => {
  const result = await callTwikoo('GET_CONFIG', {}, config)
  return { config: result.config || result.result?.config || {} }
}

export const setConfig = async (
  configData: any,
  config?: TwikooConfig
): Promise<{ code: number }> => {
  const result = await callTwikoo('SET_CONFIG', { config: configData }, config)
  return {
    code: result.code || 0
  }
}

export const getAdminComments = async (
  per: number,
  page: number,
  config?: TwikooConfig
): Promise<{
  data: any[]
  count: number
}> => {
  const result = await callTwikoo('COMMENT_GET_FOR_ADMIN', { per, page }, config)
  return {
    data: result.data || result.result?.data || [],
    count: result.count || 0
  }
}

export const updateAdminComment = async (
  id: string,
  set: Record<string, any>,
  config?: TwikooConfig
): Promise<{ code: number; updated: number }> => {
  const result = await callTwikoo('COMMENT_SET_FOR_ADMIN', { id, set }, config)
  return {
    code: result.code || 0,
    updated: result.updated || 1
  }
}

export const deleteAdminComment = async (
  id: string,
  config?: TwikooConfig
): Promise<{ code: number; deleted: number }> => {
  const result = await callTwikoo('COMMENT_DELETE_FOR_ADMIN', { id }, config)
  return {
    code: result.code || 0,
    deleted: result.deleted || 1
  }
}

export const uploadImage = async (
  fileName: string,
  photo: string, // base64
  config?: TwikooConfig
): Promise<{ data?: { url: string }; code?: number }> => {
  const result = await callTwikoo('UPLOAD_IMAGE', { fileName, photo }, config)
  return {
    data: result.data || result.result?.data || {},
    code: result.code || 0
  }
}

export const getQQNick = async (
  qq: string,
  config?: TwikooConfig
): Promise<{ nick: string }> => {
  const result = await callTwikoo('GET_QQ_NICK', { qq }, config)
  return {
    nick: result.nick || result.result?.nick || ''
  }
}

export const getFuncVersion = async (
  config?: TwikooConfig
): Promise<{ version: string }> => {
  const result = await callTwikoo('GET_FUNC_VERSION', {}, config)
  return {
    version: result.version || result.result?.version || ''
  }
}

export default callTwikoo
