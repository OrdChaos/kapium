import Layout from '@/components/Layout';
import Banner from '@/components/Banner';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Tag, Bot, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useParams, useLocation } from 'wouter';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { useGlobalCopy } from '@/hooks/use-global-copy';
import { useSEO, createArticleSchema } from '@/hooks/use-seo';
import { usePageLoading } from '@/hooks/use-page-loading';
import { UmamiPageViews } from '@/components/ui/umami-page-views';
import LicenseBox from '@/components/LicenseBox';
import SocialShare from '@/components/SocialShare';
import Twikoo from '@/components/Twikoo';

import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

interface TocItem { id: string; text: string; level: number; }
interface TocNode { id: string; text: string; parentId: string | null; children: { id: string; text: string }[]; }
interface PostPageProps { onSearchClick: () => void; }
interface OffsetItem { id: string; top: number; parentId: string | null; }

export default function PostPage({ onSearchClick }: PostPageProps) {
  const { id } = useParams();
  const [location, setLocation] = useLocation();
  const [post, setPost] = useState<any | null>(null);
  const [navigation, setNavigation] = useState<{ prev: any; next: any } | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const headingOffsets = useRef<{ id: string; top: number; parentId: string | null }[]>([]);
  const isManualScrolling = useRef(false);
  const scrollEndTimeoutRef = useRef<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  usePageLoading(dataLoaded);

  // 1. 数据获取
  useEffect(() => {
    if (!id) return;
    setDataLoaded(false);
    const controller = new AbortController();
    
    const fetchData = async () => {
      try {
        const [postRes, navRes] = await Promise.all([
          fetch(`/data/posts/${id}.json`, { signal: controller.signal }),
          fetch('/data/postNavigation.json', { signal: controller.signal })
        ]);

        if (postRes.ok) setPost(await postRes.json());
        if (navRes.ok) {
          const navData = await navRes.json();
          setNavigation(navData[id] || { prev: null, next: null });
        }
        setDataLoaded(true);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error('Fetch error:', err);
          setDataLoaded(true);
        }
      }
    };

    fetchData();
    return () => controller.abort();
  }, [id]);

  // 2. SEO
  const seoElement = useSEO({
    title: post?.title,
    description: post?.excerpt || post?.summary,
    keywords: post?.tags || [],
    ogType: 'article',
    structuredData: post ? createArticleSchema({
      title: post.title,
      description: post.excerpt || post.summary || '',
      image: post.cover,
      datePublished: post.date,
      author: import.meta.env.VITE_SITE_AUTHOR || '序窡',
      url: `${window.location.origin}/posts/${id}`,
      keywords: post.tags,
    }) : undefined,
  });

  // 3. 渐显动画
  useEffect(() => {
    if (post && !visible) requestAnimationFrame(() => setVisible(true));
  }, [post, visible]);

  // 4. 目录与偏移量计算
  const tocAndOffsets = useMemo(() => {
    if (!post?.toc) return { toc: [], offsets: [] };
    const nodes: TocNode[] = [];
    const offsets: any[] = [];
    let lastH2: TocNode | null = null;

    post.toc.forEach((item: TocItem) => {
      if (item.level === 2) {
        lastH2 = { id: item.id, text: item.text, parentId: null, children: [] };
        nodes.push(lastH2);
        offsets.push({ id: item.id, top: 0, parentId: null });
      } else if (item.level === 3 && lastH2) {
        lastH2.children.push({ id: item.id, text: item.text });
        offsets.push({ id: item.id, top: 0, parentId: lastH2.id });
      }
    });
    return { toc: nodes, offsets };
  }, [post]);

  const updateOffsets = useCallback(() => {
    if (!contentRef.current?.isConnected || isManualScrolling.current) return;
    headingOffsets.current = tocAndOffsets.offsets.map((h) => {
      const el = document.getElementById(h.id);
      return el ? { ...h, top: el.getBoundingClientRect().top + window.pageYOffset } : h;
    });
  }, [tocAndOffsets]);

  const debouncedUpdateOffsets = useCallback(() => {
    window.requestAnimationFrame(updateOffsets);
  }, [updateOffsets]);

  // 5. 【核心修复】文章内容生命周期管理
  useEffect(() => {
    const contentEl = contentRef.current;
    if (!post || !contentEl) return;

    // 既然使用原生 loading="lazy"，我们只需要在图片加载完后更新 TOC 偏移量
    const handleImgLoad = (e: Event) => {
      if ((e.target as HTMLElement).tagName === 'IMG') {
        debouncedUpdateOffsets();
      }
    };

    contentEl.addEventListener('load', handleImgLoad, true);
    
    // 初始校准偏移量
    const timer = setTimeout(debouncedUpdateOffsets, 500);

    return () => {
      clearTimeout(timer);
      if (contentEl) {
        contentEl.removeEventListener('load', handleImgLoad, true);
        // 关键：在 React 销毁前手动清空内容，防止 Reconciliation 报错
        contentEl.innerHTML = ''; 
      }
    };
  }, [id, post?.content, debouncedUpdateOffsets]);

  // 6. 滚动监听
  useEffect(() => {
    const onScroll = () => {
      if (isManualScrolling.current || !headingOffsets.current.length) return;
      const triggerPoint = window.scrollY + 100;
      let current: OffsetItem | null = null;
      for (const h of headingOffsets.current) {
        if (h.top <= triggerPoint) current = h; else break;
      }
      if (current && current.id !== activeId) {
        setActiveId(current.id);
        setExpandedId(current.parentId || current.id);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [activeId]);

  // 7. 目录跳转
  const handleTocClick = (e: any, targetId: string, parentId: string | null) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (!element) return;

    isManualScrolling.current = true;
    setActiveId(targetId);
    setExpandedId(parentId || targetId);

    const targetTop = element.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: targetTop, behavior: 'smooth' });

    if (scrollEndTimeoutRef.current) window.clearTimeout(scrollEndTimeoutRef.current);
    scrollEndTimeoutRef.current = window.setTimeout(() => {
      isManualScrolling.current = false;
    }, 800);
  };

  // 8. 其他 Hook
  useGlobalCopy();
  const images = useMemo(() => {
    if (!post?.content) return [];
    const doc = new DOMParser().parseFromString(post.content, 'text/html');
    return Array.from(doc.querySelectorAll('img')).map(img => ({ src: img.getAttribute('src') || '' }));
  }, [post?.content]);

  const handleContentClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      const imgIndex = images.findIndex(img => img.src === target.getAttribute('src'));
      if (imgIndex !== -1) { setIndex(imgIndex); setOpen(true); }
      return;
    }
    const link = target.closest('a');
    if (link?.href && !link.href.includes(window.location.hostname)) {
      e.preventDefault();
      setLocation(`/redirect?url=${encodeURIComponent(link.href)}&from=${encodeURIComponent(location)}`);
    }
  };

  return (
    // 使用 id 作为 key 强制刷新 Layout 实例
    <Layout onSearchClick={onSearchClick} key={id}>
      {seoElement}
      <Banner title={post?.title ?? ''} height="standard" />

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={images}
        plugins={[Zoom]}
      />

      <div className={`transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        {post && (
          <div className="container mx-auto px-4 py-12 relative min-h-screen">
            <div className="flex justify-center">
              <main className="w-full max-w-[768px] min-w-0">
                {/* 顶部元数据 */}
                <div className="mb-8 space-y-4">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1"><Calendar className="h-4 w-4" /><span>{post.date.slice(0,10)}</span></div>
                    <div className="flex items-center gap-1"><Clock className="h-4 w-4" /><span>{post.readTime} 分钟</span></div>
                    <UmamiPageViews abbrlink={post?.abbrlink} />
                    <Link href={`/categories/${encodeURIComponent(post.category)}`}>
                      <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">{post.category}</Badge>
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag: string) => (
                        <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`}>
                          <Badge variant="outline" className="text-xs cursor-pointer hover:bg-primary">{tag}</Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 文章摘要 */}
                {post.summary && (
                  <div className="rounded-lg border border-border shadow-md bg-card p-4 mb-8">
                    <h3 className="text-base font-semibold mb-2 flex items-center gap-2"><Bot />文章摘要</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{post.summary}</p>
                  </div>
                )}

                {/* 正文内容：强制 Key 刷新 */}
                <article className="prose prose-neutral dark:prose-invert max-w-none">
                  <div 
                    key={`content-${id}`}
                    id="post-content"
                    ref={contentRef}
                    dangerouslySetInnerHTML={{ __html: post.content }} 
                    onClick={handleContentClick}
                  />
                </article>

                <LicenseBox 
                  title={post.title} 
                  permalink={import.meta.env.VITE_SITE_URL + `/posts/${post.abbrlink}`} 
                  author={import.meta.env.VITE_SITE_AUTHOR}
                  postedAt={post.date.slice(0,10)}
                  updatedAt={post.update}
                  license={import.meta.env.VITE_SITE_POSTS_LICENSE}
                />

                <SocialShare title={post.title} url={import.meta.env.VITE_SITE_URL + `/posts/${post.abbrlink}`} />

                {/* 上下篇导航 */}
                {navigation && (
                  <div className="mt-8 flex flex-col sm:flex-row justify-between gap-6 text-sm mb-12">
                    <div className="flex-1">
                      {navigation.next ? (
                        <Link to={`/posts/${navigation.next.id}`} className="group block p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                          <div className="flex items-center gap-2 text-muted-foreground mb-1"><ChevronLeft className="h-4 w-4" /><span>下一篇</span></div>
                          <div className="font-medium group-hover:text-primary">{navigation.next.title}</div>
                        </Link>
                      ) : <div className="p-4 rounded-lg border bg-muted/30 text-muted-foreground">已是最新文章</div>}
                    </div>
                    <div className="flex-1 text-right sm:text-left">
                      {navigation.prev ? (
                        <Link to={`/posts/${navigation.prev.id}`} className="group block p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                          <div className="flex items-center gap-2 text-muted-foreground mb-1"><span>上一篇</span><ChevronRight className="h-4 w-4" /></div>
                          <div className="font-medium group-hover:text-primary">{navigation.prev.title}</div>
                        </Link>
                      ) : <div className="p-4 rounded-lg border bg-muted/30 text-muted-foreground">已是最旧文章</div>}
                    </div>
                  </div>
                )}

                {/* 评论区：独立 Key */}
                <div key={`twikoo-${id}`} className="mt-8">
                  <Twikoo envId={import.meta.env.VITE_TWIKOO_ENV} />
                </div>
              </main>

              {/* 侧边栏目录 */}
              {tocAndOffsets.toc.length > 0 && (
                <aside className="hidden xl:block absolute h-full" style={{ left: 'calc(50% + 384px + 40px)', width: '260px' }}>
                  <div className="sticky top-24">
                    <Card className="rounded-lg border-border shadow-md bg-card">
                      <CardContent className="p-5">
                        <CardTitle className="text-sm font-bold mb-4">目录</CardTitle>
                        <nav>
                          <ul className="space-y-1">
                            {tocAndOffsets.toc.map((h2) => (
                              <li key={h2.id}>
                                <a
                                  href={`#${h2.id}`}
                                  onClick={(e) => handleTocClick(e, h2.id, null)}
                                  className={`block py-1.5 text-sm transition-all border-l-2 pl-3 ${
                                    activeId === h2.id ? 'border-primary text-primary font-bold bg-primary/5' : 'border-transparent text-muted-foreground hover:text-foreground'
                                  }`}
                                >{h2.text}</a>
                                {expandedId === h2.id && h2.children.length > 0 && (
                                  <ul className="mt-1 mb-2 ml-4 space-y-1 border-l border-muted/20">
                                    {h2.children.map((h3) => (
                                      <li key={h3.id}>
                                        <a
                                          href={`#${h3.id}`}
                                          onClick={(e) => handleTocClick(e, h3.id, h2.id)}
                                          className={`block py-1 pl-4 text-xs transition-colors border-l-2 ${
                                            activeId === h3.id ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground'
                                          }`}
                                        >{h3.text}</a>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            ))}
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