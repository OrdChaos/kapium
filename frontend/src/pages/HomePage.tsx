import Layout from '@/components/Layout';
import Banner from '@/components/Banner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useEffect, useState } from 'react';

interface HomePageProps {
  onSearchClick: () => void;
}

export default function HomePage({ onSearchClick }: HomePageProps) {
  const [posts, setPosts] = useState<any[] | null>(null);
  const [visible, setVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 21; // 每页最多7排，每排最多3篇（lg:grid-cols-3）
  
  // 使用路由参数获取当前页码
  const [location] = useLocation();
  const pageFromUrl = parseInt(location.split('/')[2]) || 1;

  useEffect(() => {
    document.title = '序炁的博客';

    fetch('/data/posts.json')
      .then(res => res.json())
      .then(data => setPosts(data));
  }, []);

  useEffect(() => {
    if (!visible && posts) {
      requestAnimationFrame(() => setVisible(true));
    }
  }, [posts, visible]);

  // 如果URL中的页码与状态不同，则更新状态
  useEffect(() => {
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }
  }, [pageFromUrl]);

  // 计算分页
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts ? posts.slice(indexOfFirstPost, indexOfLastPost) : [];
  const totalPages = posts ? Math.ceil(posts.length / postsPerPage) : 0;

  // 分页导航函数
  const goToPage = (pageNumber: number) => {
    // 使用 wouter 的路由跳转而不是 hash
    if (pageNumber === 1) {
      window.location.pathname = '/';
    } else {
      window.location.pathname = `/page/${pageNumber}`;
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  return (
    <Layout onSearchClick={onSearchClick}>
      <Banner
        title="序炁的博客"
        subtitle="等我想好放什么再改"
        height="tall"
      />
      <div className="container mx-auto px-4 py-12">
        <div
          className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
        >
          {currentPosts &&
            currentPosts.map((post) => (
              <Card key={post.id} className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50">
                <CardHeader>
                  <div className="mb-2 flex items-center gap-2">
                    <Link href={`/categories/${encodeURIComponent(post.category)}`}>
                      <div onClick={(e) => e.stopPropagation()}>
                        <Badge 
                          variant="secondary" 
                          className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
                        >
                          {post.category}
                        </Badge>
                      </div>
                    </Link>
                  </div>
                  <Link href={`/posts/${post.id}`}>
                    <div className="block">
                      <CardTitle className="line-clamp-2 transition-colors hover:text-primary">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3 mt-2">
                        {post.excerpt}
                      </CardDescription>
                    </div>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{post.readTime} 分钟</span>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`}>
                        <div onClick={(e) => e.stopPropagation()}>
                          <Badge 
                            variant="outline" 
                            className="text-xs cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
                          >
                            {tag}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* 分页导航 */}
        {totalPages > 1 && (
          <div className="mt-12 flex flex-col items-center">
            <div className="flex items-center gap-2">
              {currentPage > 1 && (
                <button 
                  onClick={prevPage}
                  className="px-4 py-2 rounded-md bg-card duration-300 hover:shadow-lg hover:border-primary/50 cursor-pointer border border-border"
                >
                  上一页
                </button>
              )}
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-4 py-2 rounded-md cursor-pointer ${
                    currentPage === page
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card duration-300 hover:shadow-lg hover:border-primary/50 border border-border'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              {currentPage < totalPages && (
                <button 
                  onClick={nextPage}
                  className="px-4 py-2 rounded-md bg-card duration-300 hover:shadow-lg hover:border-primary/50 cursor-pointer border border-border"
                >
                  下一页
                </button>
              )}
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              第 {currentPage} 页，共 {totalPages} 页 ({posts?.length} 篇文章)
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}