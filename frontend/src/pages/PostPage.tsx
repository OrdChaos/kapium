import Layout from '@/components/Layout';
import Banner from '@/components/Banner';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Tag } from 'lucide-react';
import { Link, useParams } from 'wouter';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { useGlobalCopy } from '@/hooks/codeblock-copy';

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TocNode {
  id: string;
  text: string;
  parentId: string | null;
  children: { id: string; text: string }[];
}

interface PostPageProps {
  onSearchClick: () => void;
}

export default function PostPage({ onSearchClick }: PostPageProps) {
  const { id } = useParams();
  const [post, setPost] = useState<any | null>(null);
  const [visible, setVisible] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const headingOffsets = useRef<{ id: string; top: number; parentId: string | null }[]>([]);
  const isManualScrolling = useRef(false);
  const scrollEndTimeoutRef = useRef<number | null>(null);

  /* 1. 加载文章数据 */
  useEffect(() => {
    if (!id) return;
    fetch(`/data/posts/${id}.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setPost)
      .catch(() => setPost(null));
  }, [id]);

  /* 2. 入场动画与标题设置 */
  useEffect(() => {
    if (post) {
      document.title = `${post.title} - 序炁的博客`;
      if (!visible) {
        requestAnimationFrame(() => setVisible(true));
      }
    }
  }, [post, visible]);

  /* 3. 结构化 TOC (由后端的 post.toc 提供数据源) */
  const tocAndOffsets = useMemo(() => {
    if (!post || !post.toc) return { toc: [], offsets: [] };

    const rawToc: TocItem[] = post.toc;
    const nodes: TocNode[] = [];
    const offsets: { id: string; top: number; parentId: string | null }[] = [];

    let lastH2: TocNode | null = null;

    rawToc.forEach((item) => {
      if (item.level === 2) {
        lastH2 = {
          id: item.id,
          text: item.text,
          parentId: null,
          children: [],
        };
        nodes.push(lastH2);
        offsets.push({ id: item.id, top: 0, parentId: null });
      } else if (item.level === 3 && lastH2) {
        lastH2.children.push({ id: item.id, text: item.text });
        offsets.push({ id: item.id, top: 0, parentId: lastH2.id });
      }
    });

    return { toc: nodes, offsets };
  }, [post]);

  /* 4. 核心更新逻辑：计算所有标题相对于文档顶部的距离 */
  const updateOffsets = useCallback(() => {
    // 如果用户正在手动平滑滚动中，不更新位置，避免 Spy 逻辑冲突
    if (isManualScrolling.current) return;

    const newOffsets = tocAndOffsets.offsets.map((h) => {
      const el = document.getElementById(h.id);
      if (!el) return h;
      return { 
        ...h, 
        top: el.getBoundingClientRect().top + window.pageYOffset 
      };
    });
    headingOffsets.current = newOffsets;
  }, [tocAndOffsets]);

  /* 5. 纯监听机制：取代固定时间刷新 */
  useEffect(() => {
    const contentEl = document.getElementById('post-content');
    if (!post || !contentEl) return;

    // A. 监听内容容器高度变化 (处理 Lazyload 图片撑开、DOM 变化)
    const resizeObserver = new ResizeObserver(() => {
      updateOffsets();
    });
    resizeObserver.observe(contentEl);

    // B. 监听图片加载 (捕获阶段，确保所有子图片 load 时都能触发)
    const handleImgLoad = (e: Event) => {
      if ((e.target as HTMLElement).tagName === 'IMG') {
        updateOffsets();
      }
    };
    contentEl.addEventListener('load', handleImgLoad, true);

    // C. 监听窗口缩放
    window.addEventListener('resize', updateOffsets);

    // D. 初始渲染检测
    // 使用 requestAnimationFrame 代替 setTimeout，确保在下一帧渲染后计算
    requestAnimationFrame(updateOffsets);

    return () => {
      resizeObserver.disconnect();
      contentEl.removeEventListener('load', handleImgLoad, true);
      window.removeEventListener('resize', updateOffsets);
    };
  }, [post, updateOffsets]);

  /* 6. Scroll Spy 监听 */
  useEffect(() => {
    const onScroll = () => {
      if (isManualScrolling.current || headingOffsets.current.length === 0) return;

      const triggerPoint = window.scrollY + 100; // 这里的 100 对应 Header 高度 + 冗余
      let current: { id: string; parentId: string | null } | null = null;

      for (const h of headingOffsets.current) {
        if (h.top <= triggerPoint) {
          current = h;
        } else {
          break;
        }
      }

      if (current && current.id !== activeId) {
        setActiveId(current.id);
        setExpandedId(current.parentId || current.id);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [activeId]);

  /* 7. TOC 点击跳转处理 */
  const handleTocClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string,
    parentId: string | null
  ) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (!element) return;

    isManualScrolling.current = true;
    setActiveId(targetId);
    setExpandedId(parentId || targetId);

    const offset = 80; // 需与 CSS 中的 scroll-margin-top 对应
    const targetTop = element.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({ top: targetTop, behavior: 'smooth' });

    // 滚动完成后恢复监视
    // 这里使用 checkScrollEnd 来精准判断滚动结束
    const checkScrollEnd = () => {
      if (scrollEndTimeoutRef.current) window.clearTimeout(scrollEndTimeoutRef.current);
      scrollEndTimeoutRef.current = window.setTimeout(() => {
        isManualScrolling.current = false;
        window.removeEventListener('scroll', checkScrollEnd);
      }, 100);
    };
    window.addEventListener('scroll', checkScrollEnd, { passive: true });
  };

  /* 8. 代码块复制 */
  useGlobalCopy();

  /* 9. 图片灯箱 */
  const images = useMemo(() => {
    if (!post?.content) return [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(post.content, 'text/html');
    const imgs = Array.from(doc.querySelectorAll('img'));
    return imgs.map(img => ({ src: img.getAttribute('src') || '' }));
  }, [post?.content]);

  const handleContentClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      const src = target.getAttribute('src');
      const imgIndex = images.findIndex(img => img.src === src);
      if (imgIndex !== -1) {
        setIndex(imgIndex);
        setOpen(true);
      }
    }
  };

  return (
    <Layout onSearchClick={onSearchClick}>
      <Banner title={post?.title ?? ''} height="standard" />

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={images}
      />

      <div className={`transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        {post && (
          <div className="container mx-auto px-4 py-12 relative min-h-screen">
            <div className="flex justify-center">
              <main className="w-full max-w-[768px] min-w-0">
                <div className="mb-8 space-y-4">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{post.readTime} 分钟阅读</span>
                    </div>
                    <Link href={`/categories/${encodeURIComponent(post.category)}`}>
                      <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                        {post.category}
                      </Badge>
                    </Link>
                  </div>

                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag: string) => (
                        <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`}>
                          <Badge variant="outline" className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground">
                            {tag}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <article className="prose prose-neutral dark:prose-invert max-w-none">
                  {/* 内容注入点 */}
                  <div 
                    id="post-content" 
                    dangerouslySetInnerHTML={{ __html: post.content }} 
                    onClick={handleContentClick} // 绑定点击事件
                  />
                </article>
              </main>

              {/* TOC 侧边栏 */}
              {tocAndOffsets.toc.length > 0 && (
                <aside
                  className="hidden xl:block absolute h-full"
                  style={{
                    left: 'calc(50% + 384px + 40px)',
                    width: '260px',
                  }}
                >
                  <div className="sticky top-24">
                    <Card className="rounded-lg border-border shadow-md overflow-hidden bg-card/50 backdrop-blur-sm duration-300 hover:shadow-lg hover:border-primary/50 overflow-hidden">
                      <CardContent className="p-5">
                        <CardTitle className="text-sm font-bold m-0 leading-none mb-4 text-foreground/80">
                          目录
                        </CardTitle>
                        
                        <nav>
                          <ul className="space-y-1">
                            {tocAndOffsets.toc.map((h2) => {
                              const isActive = activeId === h2.id;
                              const isExpanded = expandedId === h2.id;
                              return (
                                <li key={h2.id}>
                                  <a
                                    href={`#${h2.id}`}
                                    onClick={(e) => handleTocClick(e, h2.id, null)}
                                    className={`block py-1.5 text-sm transition-all border-l-2 pl-3 ${
                                      isActive
                                        ? 'border-primary text-primary font-bold bg-primary/5'
                                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                                    }`}
                                  >
                                    {h2.text}
                                  </a>

                                  {isExpanded && h2.children.length > 0 && (
                                    <ul className="mt-1 mb-2 ml-4 space-y-1 border-l border-muted/20">
                                      {h2.children.map((h3) => (
                                        <li key={h3.id}>
                                          <a
                                            href={`#${h3.id}`}
                                            onClick={(e) => handleTocClick(e, h3.id, h2.id)}
                                            className={`block py-1 pl-4 text-xs transition-colors border-l-2 ${
                                              activeId === h3.id
                                                ? 'border-primary text-primary font-medium'
                                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                            }`}
                                          >
                                            {h3.text}
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </nav>
                      </CardContent>
                    </Card>
                  </div>
                </aside>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}