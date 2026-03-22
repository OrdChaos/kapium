import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ThumbsUp, ThumbsDown, MessageCircle, ChevronDown, ChevronUp, Smile } from "lucide-react"
import { toast } from "sonner"
import { marked } from "marked"
import { callTwikoo } from "@/lib/twikoo-api"
import { StickerPicker } from "./ui/emoji-picker"
import { loadEmojis } from '@/lib/emojis'
import { useLocation } from "wouter";

const emojiMap = new Map<string, string>();

const preprocessEmojis = (markdown: string): string => {
  const emojiRegex = /:([a-zA-Z0-9_\-\u4e00-\u9fa5]+):/g;
  
  return markdown.replace(emojiRegex, (match, id) => {
    const src = emojiMap.get(id);
    if (src) {
      return `<img src="${src}" alt="${id}" class="tk-owo-emotion" title="${id}" loading="lazy" />`;
    }
    return match;
  });
};

const preprocessText = (text: string): string => {
  const processedMarkdown = preprocessEmojis(text);
  return marked.parse(processedMarkdown, {
    async: false,
    breaks: true,
    gfm: true
  }) as string;
};

// 评论数据类型（适配 Twikoo 后端）
interface Comment {
  id: string
  nick: string
  mail: string
  link?: string
  comment: string
  avatar?: string
  mailMd5: string
  created: number
  ups: number
  downs: number
  liked?: boolean
  disliked?: boolean
  replies: Comment[]
  master?: boolean
  isSpam?: boolean
}

const isExternalUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    const siteHostname = import.meta.env.VITE_SITE_HOSTNAME
    const hostname = urlObj.hostname
    
    return hostname !== siteHostname && 
           hostname !== 'localhost' && 
           hostname !== '127.0.0.1'
  } catch {
    return false
  }
}

const handleExternalLinkClick = (e: React.MouseEvent, url: string, setLocation: (path: string) => void) => {
  if (isExternalUrl(url)) {
    e.preventDefault()
    setLocation(`/redirect?url=${encodeURIComponent(url)}&from=${encodeURIComponent(window.location.pathname + window.location.search)}`)
  }
}

// 排序类型
type SortBy = 'time' | 'hot' | 'popular'
type SortOrder = 'asc' | 'desc'

// 表单数据类型
interface FormData {
  nick: string
  mail: string
  link: string
  comment: string
  turnstileToken?: string | null
}

// Twikoo 评论数据转换
const convertToComment = (twikooComment: any): Comment => {
  const convertedReplies = twikooComment.replies?.map((reply: any) => convertToComment(reply)) || []
  
  return {
    id: twikooComment.id,
    nick: twikooComment.nick,
    mail: twikooComment.mail || '',
    link: twikooComment.link || '',
    comment: twikooComment.comment,
    avatar: twikooComment.avatar || undefined,
    mailMd5: twikooComment.mailMd5,
    created: twikooComment.created,
    ups: twikooComment.ups || 0,
    downs: twikooComment.downs || 0,
    liked: twikooComment.liked || false,
    disliked: twikooComment.disliked || false,
    master: twikooComment.master || false,
    replies: convertedReplies,
    isSpam: twikooComment.isSpam || false
  }
}

// 获取 Gravatar 头像
const getAvatarUrl = (mailMd5: string): string => {
  return `https://weavatar.com/avatar/${mailMd5}?d=mp`
}

// 评论表单组件
function CommentForm({
  onSubmit,
  onCancel,
  isReply = false,
  replyTo,
  config
}: {
  onSubmit: (data: FormData) => void
  onCancel?: () => void
  isReply?: boolean
  replyTo?: string
  config?: { TURNSTILE_SITE_KEY?: string; GEETEST_CAPTCHA_ID?: string }
}) {
  const [formData, setFormData] = useState<FormData>({
    nick: '',
    mail: '',
    link: '',
    comment: ''
  })
  const [showPreview, setShowPreview] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const [turnstileLoad, setTurnstileLoad] = useState<Promise<void> | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileWidgetId, setTurnstileWidgetId] = useState<number | null>(null)
  const turnstileRef = React.useRef<HTMLDivElement>(null)

  // 初始化 Turnstile
  React.useEffect(() => {
    if (config?.TURNSTILE_SITE_KEY && (window as any).turnstile) {
      setTurnstileLoad(Promise.resolve())
      return
    }

    if (config?.TURNSTILE_SITE_KEY && !(window as any).turnstile) {
      const loadPromise = new Promise<void>((resolve, reject) => {
        const scriptEl = document.createElement('script')
        scriptEl.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
        scriptEl.onload = () => resolve()
        scriptEl.onerror = reject
        if (turnstileRef.current) {
          turnstileRef.current.appendChild(scriptEl)
        }
      })
      setTurnstileLoad(loadPromise)
    }
  }, [config?.TURNSTILE_SITE_KEY])

  // 获取 Turnstile token
  const getTurnstileToken = async () => {
    if (!config?.TURNSTILE_SITE_KEY || !turnstileLoad) return null
    
    await turnstileLoad
    
    return new Promise<string>((resolve, reject) => {
      if (!(window as any).turnstile || !turnstileRef.current) {
        reject(new Error('Turnstile 未加载'))
        return
      }

      // 移除之前的 widget
      if (turnstileWidgetId !== null) {
        (window as any).turnstile?.remove(turnstileWidgetId)
        setTurnstileWidgetId(null)
      }

      const widgetId = (window as any).turnstile?.render(turnstileRef.current, {
        sitekey: config.TURNSTILE_SITE_KEY,
        callback: (token) => {
          setTurnstileToken(token)
          resolve(token)
          setTimeout(() => {
            (window as any).turnstile?.remove(widgetId)
            setTurnstileWidgetId(null)
          }, 5000)
        },
        'error-callback': reject,
        'expired-callback': () => {
          reject(new Error('验证码已过期，请重试'))
        },
        'timeout-callback': () => {
          reject(new Error('验证码超时，请重试'))
        }
      })
      setTurnstileWidgetId(widgetId)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nick.trim() || !formData.mail.trim() || !formData.comment.trim()) {
      toast.error('请填写昵称、邮箱和评论内容')
      return
    }
    
    let token: string | null = null;
    if (config?.TURNSTILE_SITE_KEY) {
      try {
        token = (await getTurnstileToken()) || null
      } catch (error) {
        toast.error('验证码验证失败')
        return
      }
    }

    const commentText = preprocessText(formData.comment)
    const commentHtml = await marked(commentText, {
      breaks: true,
      gfm: true
    })
    
    onSubmit({ 
      ...formData, 
      comment: commentHtml,
      turnstileToken: token 
    })
    setFormData({ nick: '', mail: '', link: '', comment: '' })
    setShowPreview(false)
    setTurnstileToken(null)
  }

  return (
    <div className={`${isReply ? 'ml-12 mt-4 p-4 bg-muted/50 rounded-lg' : ''}`}>
      {isReply && replyTo && (
        <div className="text-sm text-muted-foreground mb-4">
          回复 <span className="font-medium text-foreground">{replyTo}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            name="nick"
            placeholder="昵称"
            value={formData.nick}
            onChange={(e) => setFormData({ ...formData, nick: e.target.value })}
            required
          />
          <Input
            name="email"
            type="email"
            placeholder="邮箱"
            value={formData.mail}
            onChange={(e) => setFormData({ ...formData, mail: e.target.value })}
            required
          />
          <Input
            name="url"
            type="url"
            placeholder="网站（可选）"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          />
        </div>
        <Textarea
          placeholder={"写下你的评论...\n请确保您输入的评论符合中国大陆相关法律法规\n可在 Gravatar 上传头像或输入 QQ 邮箱以自动使用 QQ 头像\n支持 Markdown 语法"}
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          rows={4}
          required
          className={isReply ? 'bg-muted/30' : ''}
        />
        
        {/* 预览区域 - 实时预览 */}
        {showPreview && (
          <div className="mt-4 p-4 rounded-lg border border-border bg-muted/30">
            <div className="text-sm font-medium text-muted-foreground mb-2">预览</div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {formData.comment ? (
                <div dangerouslySetInnerHTML={{ __html: preprocessText(formData.comment) }} />
              ) : (
                <p className="text-muted-foreground">暂无内容</p>
              )}
            </div>
          </div>
        )}

        {/* Turnstile 验证码 */}
        {config?.TURNSTILE_SITE_KEY && (
          <div className="flex justify-end my-2" ref={turnstileRef}></div>
        )}

        <div className="flex justify-between items-start gap-2 mt-0">
          <div className="flex items-start gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Smile className="h-5 w-5" />
              </button>
              {showEmojiPicker && (
                <div className="absolute left-0 bottom-full mb-2 z-50">
                  <div className="relative w-[300px]">
                    <StickerPicker onSelect={(emoji) => {
                      setFormData(prev => ({ ...prev, comment: (prev.comment || '') + emoji }))
                      setShowEmojiPicker(false)
                    }} />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                取消
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? '关闭' : '预览'}
            </Button>
            <Button type="submit">发表</Button>
          </div>
        </div>
      </form>
    </div>
  )
}

// 单条评论组件
function CommentItem({
  comment,
  isReply = false,
  onReply,
  onLike,
  onDislike,
  replyingTo,
  onSubmitReply,
  onCancelReply,
  config
}: {
  comment: Comment
  isReply?: boolean
  onReply: (commentId: string) => void
  onLike: (commentId: string) => void
  onDislike: (commentId: string) => void
  replyingTo: string | null
  onSubmitReply: (commentId: string, data: FormData) => void
  onCancelReply: () => void
  config?: { TURNSTILE_SITE_KEY?: string; GEETEST_CAPTCHA_ID?: string }
}) {
  const [, setLocation] = useLocation()
  
  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    const months = Math.floor(days / 30)

    if (months > 3) return `${new Date(timestamp).toLocaleDateString()}`
    if (months > 0) return `${months}个月前`
    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小时前`
    if (minutes > 0) return `${minutes}分钟前`
    return '刚刚'
  }

  return (
    <div>
      <div className={`flex gap-3 ${isReply ? 'py-3' : 'py-4'}`}>
        <Avatar className={isReply ? 'h-8 w-8' : 'h-10 w-10'}>
          <AvatarImage 
            src={comment.avatar || getAvatarUrl(comment.mailMd5)} 
            alt={comment.nick}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
          <AvatarFallback className="bg-muted">
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {comment.link ? (
              <a
                href={comment.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handleExternalLinkClick(e, comment.link || '', setLocation)}
                className={`font-medium hover:text-primary transition-colors ${isReply ? 'text-sm' : ''}`}
              >
                {comment.nick}
              </a>
            ) : (
              <span className={`font-medium ${isReply ? 'text-sm' : ''}`}>
                {comment.nick}
              </span>
            )}
            {comment.master && (
              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">博主</span>
            )}
            {comment.isSpam && (
              <span className="text-xs bg-yellow-500 dark:bg-yellow-600 text-yellow-950 dark:text-yellow-50 px-2 py-0.5 rounded-full">审核中</span>
            )}
            <span className="text-xs text-muted-foreground translate-y-[1px]">
              {formatTime(comment.created)}
            </span>
          </div>

          <div className={`mt-2 text-foreground prose prose-sm dark:prose-invert max-w-none ${isReply ? 'text-sm' : ''}`}>
            <div 
              dangerouslySetInnerHTML={{ __html: comment.comment }} 
              onClick={(e) => {
                const target = e.target as HTMLElement
                const link = target.closest('a')
                if (link?.href) {
                  handleExternalLinkClick(e, link.href, setLocation)
                }
              }}
            />
          </div>

          <div className="mt-3 flex items-center gap-4">
            <button
              onClick={() => onLike(comment.id)}
              className={`flex items-center gap-1 text-sm transition-colors ${
                comment.liked
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{comment.ups > 0 ? comment.ups : ''}</span>
            </button>

            <button
              onClick={() => onDislike(comment.id)}
              className={`flex items-center gap-1 text-sm transition-colors ${
                comment.disliked
                  ? 'text-destructive'
                  : 'text-muted-foreground hover:text-destructive'
              }`}
            >
              <ThumbsDown className="h-4 w-4" />
              <span>{comment.downs > 0 ? comment.downs : ''}</span>
            </button>

            {!isReply && (
              <button
                onClick={() => onReply(comment.id)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>回复</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 回复表单 */}
      {replyingTo === comment.id && (
        <CommentForm
          onSubmit={(data) => onSubmitReply(comment.id, data)}
          onCancel={onCancelReply}
          isReply
          replyTo={comment.nick}
          config={config}
        />
      )}
    </div>
  )
}

// 回复列表组件
function ReplyList({
  replies,
  onReply,
  onLike,
  onDislike,
  replyingTo,
  onSubmitReply,
  onCancelReply
}: {
  replies: Comment[]
  onReply: (commentId: string) => void
  onLike: (commentId: string) => void
  onDislike: (commentId: string) => void
  replyingTo: string | null
  onSubmitReply: (commentId: string, data: FormData) => void
  onCancelReply: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  if (replies.length === 0) return null

  const displayedReplies = expanded ? replies : [replies[0]]
  const hiddenCount = replies.length - 1

  return (
    <div className="ml-12 mt-2 border-l-2 border-border pl-4">
      {displayedReplies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          isReply
          onReply={onReply}
          onLike={onLike}
          onDislike={onDislike}
          replyingTo={replyingTo}
          onSubmitReply={onSubmitReply}
          onCancelReply={onCancelReply}
        />
      ))}

      {hiddenCount > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-sm text-primary hover:underline py-2"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              收起回复
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              展开 {hiddenCount} 条回复
            </>
          )}
        </button>
      )}
    </div>
  )
}

// 主评论系统组件
export default function CommentSystem({ url, envId }: { url: string; envId?: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [sortBy, setSortBy] = useState<SortBy>('time')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [config, setConfig] = useState<{ TURNSTILE_SITE_KEY?: string } | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [emojiLoaded, setEmojiLoaded] = useState(false)
  const commentsEndRef = React.useRef<HTMLDivElement>(null)
  const ITEMS_PER_PAGE = 10

  // 加载表情数据
  useEffect(() => {
    loadEmojis().then(() => {
      const categories = (window as any).customCategories || []
      categories.forEach((cat: any) => {
        cat.emojis.forEach((e: any) => {
          emojiMap.set(e.id, e.skins[0].src);
        });
      });
      setEmojiLoaded(true)
    })
  }, [])

  // 加载评论
  const loadComments = async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      
      const result = await callTwikoo('COMMENT_GET', {
        url,
        sort: sortBy === 'popular' ? 'popular' : (sortOrder === 'desc' ? 'newest' : 'oldest'),
        r: ITEMS_PER_PAGE,
        p: loadMore ? page : 1
      }, { envId })
      
      const commentsData = result.data || result.result?.data
      const totalCount = result.count || (result.result?.count as number) || 0
      
      if (commentsData) {
        const convertedComments = commentsData.map(convertToComment)
        
        if (loadMore) {
          setComments(prev => [...prev, ...convertedComments])
          setPage(prev => prev + 1)
          setHasMore(convertedComments.length === ITEMS_PER_PAGE)
        } else {
          setComments(convertedComments)
          setTotalCount(totalCount)
          setHasMore(convertedComments.length === ITEMS_PER_PAGE)
        }
      }

      const configResult = await callTwikoo('GET_CONFIG', {}, { envId })
      const configData = configResult.config || configResult.result?.config || {}
      if (configData) {
        setConfig({
          TURNSTILE_SITE_KEY: configData.TURNSTILE_SITE_KEY
        })
      }
    } catch (error) {
      toast.error(loadMore ? '加载更多评论失败' : '加载评论失败')
    } finally {
      if (loadMore) {
        setLoadingMore(false)
      } else {
        setLoading(false)
      }
    }
  }

  // 处理 URL hash 滚动和高亮
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash && hash.length > 1) {
        const element = document.querySelector(hash)
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            element.classList.add('bg-primary/10', 'transition-colors')
            setTimeout(() => {
              element.classList.remove('bg-primary/10')
            }, 1000)
          }, 100)
        }
      }
    }
    
    window.addEventListener('hashchange', handleHashChange)
    handleHashChange()
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  // 组件挂载时加载评论
  React.useEffect(() => {
    setPage(1)
    setHasMore(true)
    loadComments(false)
  }, [url, sortBy, sortOrder, emojiLoaded])

  // 滚动加载更多评论
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight
      
      // 距离底部 200px 时加载更多
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        if (hasMore && !loadingMore && !loading) {
          loadComments(true)
        }
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMore, loadingMore, loading])

  // 处理主评论提交
  const handleSubmitComment = async (data: FormData) => {
    try {
      const result = await callTwikoo('COMMENT_SUBMIT', {
        nick: data.nick,
        mail: data.mail,
        link: data.link,
        ua: navigator.userAgent,
        url,
        href: window.location.href,
        comment: data.comment,
        turnstileToken: data.turnstileToken || undefined
      }, { envId })

      if (result.result?.id) {
        const newComment: Comment = {
          id: result.result.id,
          nick: data.nick,
          mail: data.mail,
          link: data.link,
          comment: data.comment,
          mailMd5: '',
          created: Date.now(),
          ups: 0,
          downs: 0,
          liked: false,
          disliked: false,
          master: false,
          replies: []
        }
        
        setComments([newComment, ...comments])
        setTotalCount(totalCount + 1)
        toast.success('评论发表成功！')
        
        setTimeout(() => {
          loadComments(false)
        }, 300)
      }
    } catch (error) {
      toast.error('发表评论失败')
    }
  }

  // 处理回复提交
  const handleSubmitReply = async (commentId: string, data: FormData) => {
    try {
      const result = await callTwikoo('COMMENT_SUBMIT', {
        nick: data.nick,
        mail: data.mail,
        link: data.link,
        ua: navigator.userAgent,
        url,
        href: window.location.href,
        comment: data.comment,
        pid: commentId,
        turnstileToken: data.turnstileToken || undefined
      }, { envId })

      if (result.result?.id) {
        const newReply: Comment = {
          id: result.result.id,
          nick: data.nick,
          mail: data.mail,
          link: data.link,
          comment: data.comment,
          mailMd5: '',
          created: Date.now(),
          ups: 0,
          downs: 0,
          liked: false,
          disliked: false,
          master: false,
          replies: []
        }

        setComments(
          comments.map((comment) =>
            comment.id === commentId
              ? { ...comment, replies: [...comment.replies, newReply] }
              : comment
          )
        )
        setTotalCount(totalCount + 1)
        setReplyingTo(null)
        toast.success('回复发表成功！')
        
        setTimeout(() => {
          loadComments(false)
        }, 300)
      }
    } catch (error) {
      toast.error('发表回复失败')
    }
  }

  // 处理回复
  const handleReply = (commentId: string) => {
    setReplyingTo(commentId)
  }

  // 取消回复
  const handleCancelReply = () => {
    setReplyingTo(null)
  }

  // 处理点赞
  const handleLike = async (commentId: string) => {
    try {
      const result = await callTwikoo('COMMENT_LIKE', { id: commentId, type: 'up' }, { envId })
      
      if (result.updated) {
        setComments(
          comments.map((comment) => {
            if (comment.id === commentId) {
              return {
                ...comment,
                ups: comment.liked ? comment.ups - 1 : comment.ups + 1,
                liked: !comment.liked,
                disliked: false,
                downs: comment.disliked ? comment.downs - 1 : comment.downs
              }
            }
            // 处理回复中的点赞
            return {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply.id === commentId
                  ? {
                      ...reply,
                      ups: reply.liked ? reply.ups - 1 : reply.ups + 1,
                      liked: !reply.liked,
                      disliked: false,
                      downs: reply.disliked ? reply.downs - 1 : reply.downs
                    }
                  : reply
              )
            }
          })
        )
      }
    } catch (error) {
      toast.error('点赞失败')
    }
  }

  // 处理踩
  const handleDislike = async (commentId: string) => {
    try {
      const result = await callTwikoo('COMMENT_LIKE', { id: commentId, type: 'down' }, { envId })
      
      if (result.updated) {
        setComments(
          comments.map((comment) => {
            if (comment.id === commentId) {
              return {
                ...comment,
                downs: comment.disliked ? comment.downs - 1 : comment.downs + 1,
                disliked: !comment.disliked,
                liked: false,
                ups: comment.liked ? comment.ups - 1 : comment.ups
              }
            }
            // 处理回复中的踩
            return {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply.id === commentId
                  ? {
                      ...reply,
                      downs: reply.disliked ? reply.downs - 1 : reply.downs + 1,
                      disliked: !reply.disliked,
                      liked: false,
                      ups: reply.liked ? reply.ups - 1 : reply.ups
                    }
                  : reply
              )
            }
          })
        )
      }
    } catch (error) {
      toast.error('踩失败')
    }
  }

  // 获取排序后的评论
  const getSortedComments = () => {
    if (sortBy === 'popular') {
      return [...comments].sort((a, b) => b.ups - a.ups)
    }
    
    return [...comments].sort((a, b) => {
      if (sortBy === 'time') {
        return sortOrder === 'desc'
          ? b.created - a.created
          : a.created - b.created
      } else {
        // 热度 = 点赞数 - 踩数 + 回复数 * 2
        const hotA = a.ups - a.downs + a.replies.length * 2
        const hotB = b.ups - b.downs + b.replies.length * 2
        return sortOrder === 'desc' ? hotB - hotA : hotA - hotB
      }
    })
  }

  const totalComments = totalCount

  return (
    <div className="w-full z-[60]">
      <Separator className="my-8" />

      <CommentForm onSubmit={handleSubmitComment} config={config} />

      <div className="flex items-center justify-between mb-6 mt-6">
        <h3 className="text-lg font-semibold">
          评论 <span className="text-muted-foreground">({totalComments})</span>
        </h3>

        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time">时间</SelectItem>
              <SelectItem value="popular">热度</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={(value: SortOrder) => setSortOrder(value)}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">倒序</SelectItem>
              <SelectItem value="asc">正序</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 加载状态 */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">加载中...</div>
      ) : (
        /* 评论列表 */
        <div className="space-y-2">
          {getSortedComments().map((comment, index) => (
            <div key={comment.id} id={`comment-${comment.id}`}>
              <CommentItem
                comment={comment}
                onReply={handleReply}
                onLike={handleLike}
                onDislike={handleDislike}
                replyingTo={replyingTo}
                onSubmitReply={handleSubmitReply}
                onCancelReply={handleCancelReply}
              />
              <ReplyList
                replies={comment.replies}
                onReply={handleReply}
                onLike={handleLike}
                onDislike={handleDislike}
                replyingTo={replyingTo}
                onSubmitReply={handleSubmitReply}
                onCancelReply={handleCancelReply}
              />
            </div>
          ))}
        </div>
      )}

      {loadingMore && (
        <div className="text-center py-4 text-muted-foreground">
          加载中...
        </div>
      )}

      {!hasMore && comments.length > 0 && !loading && (
        <div className="text-center py-4 text-muted-foreground">
          已经到底啦
        </div>
      )}

      {comments.length === 0 && !loading && (
        <div className="text-center py-12 text-muted-foreground">
          还没有评论呢，快来发表一条吧
        </div>
      )}
      
      <div ref={commentsEndRef} />
    </div>
  )
}
