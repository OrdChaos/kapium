import Layout from '@/components/Layout';
import Banner from '@/components/Banner';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Hash, Loader2 } from 'lucide-react';
import { Link, useParams, useLocation } from 'wouter';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useSEO } from '@/hooks/use-seo';
import { usePageLoading } from '@/hooks/use-page-loading';

interface TagsPageProps {
  onSearchClick: () => void;
}

const ITEMS_PER_PAGE = 20;

export default function TagsPage({ onSearchClick }: TagsPageProps) {
  const [, navigate] = useLocation();
  const params = useParams();
  const tag = params.tag as string | undefined;

  const [allTags, setAllTags] = useState<any[] | null>(null);
  const [displayedTags, setDisplayedTags] = useState<any[]>([]);
  const [tagPosts, setTagPosts] = useState<Record<string, any[]> | null>(null);
  const [visible, setVisible] = useState(false);
  const [page, setPage] = useState(1);

  const observer = useRef<IntersectionObserver | null>(null);
  
  // Complete loading bar when both data are loaded
  usePageLoading(allTags !== null && tagPosts !== null);

  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && allTags && displayedTags.length < allTags.length) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [allTags, displayedTags.length]);

  // SEO Management
  const tagName = tag ? decodeURIComponent(tag) : null;
  const seoElement = useSEO({
    title: tagName ? `标签：${tagName}` : '标签',
    description: tagName ? `浏览标签下的所有文章：${tagName}` : '浏览本站所有标签',
  });

  useEffect(() => {
    Promise.all([
      fetch('/data/tags.json').then(res => res.json()),
      fetch('/data/tagPosts.json').then(res => res.json()),
    ]).then(([tagsData, tagPostsData]) => {
      setAllTags(tagsData);
      setTagPosts(tagPostsData);
      setDisplayedTags(tagsData.slice(0, ITEMS_PER_PAGE));
      setPage(1);
    });
  }, [tag]);

  useEffect(() => {
    if (allTags && page > 1) {
      const nextBatch = allTags.slice(0, page * ITEMS_PER_PAGE);
      setDisplayedTags(nextBatch);
    }
  }, [page, allTags]);

  useEffect(() => {
    if (!visible && allTags && tagPosts) {
      requestAnimationFrame(() => setVisible(true));
    }
  }, [allTags, tagPosts, visible]);

  const decodedTag = tag ? decodeURIComponent(tag) : null;
  const postsForTag = decodedTag && tagPosts ? (tagPosts[decodedTag] || []) : null;

  return (
    <Layout onSearchClick={onSearchClick}>
      {seoElement}
      <Banner
        title={decodedTag ? `标签：${decodedTag}` : "标签"}
        subtitle={decodedTag ? `共 ${postsForTag?.length ?? 0} 篇文章` : "按标签浏览文章"}
        height="standard"
      />
      
      <div className={`transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        {tag && allTags && tagPosts ? (
           <div className="container mx-auto px-4 py-12">
             <div className="mx-auto max-w-4xl space-y-2">
               {(postsForTag || []).map((post) => (
                 <div className="block mb-6 cursor-pointer" key={post.id} onClick={() => navigate(`/posts/${post.id}`)}>
                    <Card className="transition-all duration-300 hover:shadow-lg hover:border-primary/50">
                      <CardHeader>
                        <div className="mb-2">
                          <Badge
                            key={post.category}
                            variant="secondary"
                            className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/categories/${encodeURIComponent(post.category)}`);
                            }}
                          >
                            {post.category}
                          </Badge>
                        </div>
                        <CardTitle className="hover:text-primary transition-colors">{post.title}</CardTitle>
                        <CardDescription>{post.excerpt}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{post.date.slice(0,10)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{post.readTime} 分钟</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag: string) => (
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
               ))}
             </div>
           </div>
        ) : null}

        {!tag && allTags && tagPosts ? (
          <div className="container mx-auto px-4 py-12">
            <div className="mx-auto max-w-4xl">
              <div className="flex flex-wrap gap-2">
                {displayedTags.map((t, index) => {
                  const isLast = displayedTags.length === index + 1;
                  return (
                    <Link key={t.name} href={`/tags/${encodeURIComponent(t.name)}`}>
                      <div 
                        className="inline-block p-2" 
                        ref={isLast ? lastElementRef : null}
                      >
                        <Badge
                          variant="outline"
                          className="cursor-pointer px-4 py-2 text-base transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
                          style={{ fontSize: `${Math.min(1 + t.count * 0.1, 2)}rem` }}
                        >
                          <Hash className="mr-1 h-4 w-4" />
                          {t.name}
                          <span className="ml-2 text-xs opacity-70">({t.count})</span>
                        </Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
              
              {allTags && displayedTags.length < allTags.length && (
                <div className="flex justify-center mt-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}