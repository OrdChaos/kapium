import Layout from '@/components/Layout';
import Banner from '@/components/Banner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useEffect, useRef, useState } from 'react';

interface TimelinePageProps {
  onSearchClick: () => void;
}

interface PostItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
  category: string;
}

export default function TimelinePage({ onSearchClick }: TimelinePageProps) {
  const [, navigate] = useLocation();

  const [months, setMonths] = useState<
    Array<{
      key: string;
      year: string;
      month: number;
      label: string;
      posts: PostItem[];
    }>
  >([]);
  const [visibleMonths, setVisibleMonths] = useState(0);
  const [visible, setVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // 初始阈值：累计文章数达到 BATCH_SIZE 时停止初始加载
  const BATCH_SIZE = 30;

  useEffect(() => {
    document.title = '时间线 - 序炁的博客';
    
    fetch('/data/posts.json')
      .then((r) => r.json())
      .then((posts: PostItem[]) => {
        const sorted = posts.sort((a, b) => b.date.localeCompare(a.date));

        const map = new Map<string, any>();
        for (const p of sorted) {
          const year = p.date.slice(0, 4);
          const month = Number(p.date.slice(5, 7));
          const key = `${year}-${month}`;
          if (!map.has(key)) {
            map.set(key, { key, year, month, label: `${month}月`, posts: [] });
          }
          map.get(key).posts.push(p);
        }

        const arr = Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key));
        setMonths(arr);

        // 计算初始需要显示的月份数量
        let acc = 0;
        let count = 0;
        for (const m of arr) {
          acc += m.posts.length;
          count++;
          if (acc >= BATCH_SIZE) break;
        }
        setVisibleMonths(count || 1);
      });
  }, []);

  // 渐显控制
  useEffect(() => {
    if (!visible && months.length > 0) {
      requestAnimationFrame(() => setVisible(true));
    }
  }, [months, visible]);

  // 滚动监听逻辑
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || months.length === 0) return;

    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && visibleMonths < months.length) {
          // 触底时增加加载 2 个月份
          setVisibleMonths((v) => Math.min(v + 2, months.length));
        }
      },
      { rootMargin: '200px' } 
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [months, visibleMonths]);

  return (
    <Layout onSearchClick={onSearchClick}>
      <Banner title="时间线" subtitle="按时间顺序浏览文章" />

      <div
        className={`container mx-auto px-4 sm:px-6 py-12 transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="mx-auto max-w-5xl space-y-12">
          {months.slice(0, visibleMonths).map((m, idx) => (
            <section key={m.key}>
              {(idx === 0 || months[idx - 1].year !== m.year) && (
                <h2 className="mb-4 text-2xl font-bold">{m.year}</h2>
              )}
              <h3 className="mb-6 text-lg font-semibold">{m.label}</h3>

              <div className="relative space-y-6">
                <div className="absolute top-0 bottom-0 left-3 w-px bg-border" />

                {m.posts.map((post) => (
                  <div key={post.id} className="flex items-start gap-6 relative">
                    <div className="relative w-6 flex justify-center">
                      <span className="relative z-10 h-4 w-4 rounded-full bg-primary ring-2 ring-card" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link href={`/posts/${post.id}`}>
                        <div>
                          <Card className="w-full max-w-full transition-all duration-300 hover:shadow-lg hover:border-primary/50">
                            <CardHeader>
                              <CardTitle className="hover:text-primary transition-colors">{post.title}</CardTitle>
                              <CardDescription>{post.excerpt}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" /> {post.date}
                                </div>
                                {post.readTime && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" /> {post.readTime} 分钟
                                  </div>
                                )}
                                <Badge
                                  key={post.category}
                                  variant="secondary" 
                                  className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/categories/${encodeURIComponent(post.category)}`);
                                  }}
                                >
                                  {post.category}
                                </Badge>
                                <div className="flex flex-wrap gap-2">
                                  {post.tags.map((tag) => (
                                    <Badge
                                      key={tag}
                                      variant="outline"
                                      className="text-xs cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/tags/${encodeURIComponent(tag)}`);
                                      }}
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* 哨兵元素：用于触发加载更多 */}
          <div ref={sentinelRef} style={{ height: '20px' }} />
        </div>
      </div>
    </Layout>
  );
}