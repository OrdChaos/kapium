import Layout from '@/components/Layout';
import Banner from '@/components/Banner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { useSEO } from '@/hooks/use-seo';
import { createWebsiteSchema } from '@/lib/seo';

interface HomePageProps {
  onSearchClick: () => void;
}

export default function HomePage({ onSearchClick }: HomePageProps) {
  const [posts, setPosts] = useState<any[] | null>(null);
  const [visible, setVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 21;
  
  const [location] = useLocation();
  const pageFromUrl = parseInt(location.split('/')[2]) || 1;

  // SEO Management
  useSEO({
    title: pageFromUrl > 1 ? `第 ${pageFromUrl} 页` : '',
    description: import.meta.env.VITE_SITE_DESCRIPTION,
    ogType: 'website',
    robots: pageFromUrl > 1 ? 'noindex, follow' : 'index, follow',
    structuredData: createWebsiteSchema({
      name: import.meta.env.VITE_SITE_TITLE,
      description: import.meta.env.VITE_SITE_DESCRIPTION,
      url: window.location.origin,
      logo: import.meta.env.VITE_SITE_OG_IMAGE,
    }),
    structuredDataId: 'website-schema',
  });

  useEffect(() => {
    document.title = pageFromUrl > 1 
      ? `第 ${pageFromUrl} 页 - ${import.meta.env.VITE_SITE_TITLE}`
      : import.meta.env.VITE_SITE_TITLE;

    fetch('/data/posts.json')
      .then(res => res.json())
      .then(data => setPosts(data));
  }, [pageFromUrl]);

  useEffect(() => {
    if (!visible && posts) {
      requestAnimationFrame(() => setVisible(true));
    }
  }, [posts, visible]);

  useEffect(() => {
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }
  }, [pageFromUrl]);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts ? posts.slice(indexOfFirstPost, indexOfLastPost) : [];
  const totalPages = posts ? Math.ceil(posts.length / postsPerPage) : 0;

  const goToPage = (pageNumber: number) => {
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
        title={import.meta.env.VITE_SITE_TITLE}
        subtitle={import.meta.env.VITE_SITE_DESCRIPTION}
        height="tall"
      />
      <div className="container mx-auto px-4 py-12">
        <div
          className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
        >
          {currentPosts &&
            currentPosts.map((post) => (
              <Card key={post.id} className="flex flex-col h-[280px] transition-all duration-300 hover:shadow-lg hover:border-primary/50">
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
                      <CardTitle className="line-clamp-2 leading-6 transition-colors hover:text-primary h-[3rem]">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 leading-6 h-[3rem] mt-2">
                        {post.excerpt}
                      </CardDescription>
                    </div>
                  </Link>
                </CardHeader>
                <CardContent className="flex flex-col justify-between flex-1">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{post.date.slice(0,10)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{post.readTime} 分钟</span>
                    </div>
                  </div>
                  <div className="mt-3 relative">
                    <div className="flex gap-2 overflow-hidden whitespace-nowrap">
                      {post.tags.map((tag) => (
                        <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`}>
                          <Badge
                            variant="outline"
                            className="text-xs shrink-0 cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
                          >
                            {tag}
                          </Badge>
                        </Link>
                      ))}
                    </div>

                    <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-card to-transparent flex items-center justify-end pr-1 text-xs"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

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