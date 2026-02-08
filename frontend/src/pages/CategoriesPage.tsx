import Layout from '@/components/Layout';
import Banner from '@/components/Banner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { Link, useParams, useLocation } from 'wouter';
import { useEffect, useState, useRef, useCallback } from 'react';

interface CategoriesPageProps {
  onSearchClick: () => void;
}

const ITEMS_PER_PAGE = 10;

export default function CategoriesPage({ onSearchClick }: CategoriesPageProps) {
  const [, navigate] = useLocation();
  const params = useParams();
  const category = params.category as string | undefined;

  const [categories, setCategories] = useState<any[] | null>(null);
  const [categoryPosts, setCategoryPosts] = useState<Record<string, any[]> | null>(null);
  const [visible, setVisible] = useState(false);
  
  const [displayLimit, setDisplayLimit] = useState(ITEMS_PER_PAGE);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (category) {
      document.title = `分类：${decodeURIComponent(category)} - ${import.meta.env.VITE_SITE_TITLE}`;
    } else {
      document.title = '文章分类 - ' + import.meta.env.VITE_SITE_TITLE;
    }
    
    setDisplayLimit(ITEMS_PER_PAGE);

    Promise.all([
      fetch('/data/categories.json').then(res => res.json()),
      fetch('/data/categoryPosts.json').then(res => res.json()),
    ]).then(([cats, catPosts]) => {
      setCategories(cats);
      setCategoryPosts(catPosts);
    });
  }, [category]);

  useEffect(() => {
    if (!visible && categories && categoryPosts) {
      requestAnimationFrame(() => setVisible(true));
    }
  }, [categories, categoryPosts, visible]);

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setDisplayLimit(prev => prev + ITEMS_PER_PAGE);
      }
    });

    if (node) observer.current.observe(node);
  }, []);

  const decodedCategory = category ? decodeURIComponent(category) : null;
  const allPostsForCategory = decodedCategory && categoryPosts ? (categoryPosts[decodedCategory] || []) : [];
  
  const visiblePosts = allPostsForCategory.slice(0, displayLimit);

  return (
    <Layout onSearchClick={onSearchClick}>
      <Banner
        title={decodedCategory ? `分类：${decodedCategory}` : "文章分类"}
        subtitle={decodedCategory ? `共 ${allPostsForCategory.length} 篇文章` : "按主题浏览文章"}
        height="standard"
      />
      <div className={`transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        
        {category && categories && categoryPosts ? (
          <div className="container mx-auto px-4 py-12">
            <div className="mx-auto max-w-4xl space-y-2">
              {visiblePosts.map((post, index) => {
                const isLast = index === visiblePosts.length - 1;
                const hasMore = visiblePosts.length < allPostsForCategory.length;

                return (
                  <div 
                    className="block mb-6 cursor-pointer" 
                    key={post.id} 
                    onClick={() => navigate(`/posts/${post.id}`)}
                    ref={isLast && hasMore ? lastElementRef : null}
                  >
                    <Card className="transition-all duration-300 hover:shadow-lg hover:border-primary/50">
                      <CardHeader>
                        <CardTitle className="hover:text-primary transition-colors">
                          {post.title}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {post.excerpt}
                        </CardDescription>
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
                );
              })}

              {visiblePosts.length < allPostsForCategory.length && (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
                </div>
              )}
            </div>
          </div>
        ) : null}

        {!category && categories && categoryPosts ? (
          <div className="container mx-auto px-4 py-12">
            <div className="mx-auto grid max-w-4xl gap-2 grid-cols-1">
              {categories.map((cat) => (
                <Link key={cat.name} href={`/categories/${encodeURIComponent(cat.name)}`}>
                  <div className="group block">
                    <Card className="transition-all duration-300 hover:shadow-lg hover:border-primary/50 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-l font-bold group-hover:text-primary transition-colors leading-none">
                            {cat.name}
                          </span>
                          <Badge variant="secondary" className="whitespace-nowrap">
                            {cat.count} 篇文章
                          </Badge>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </Card>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}