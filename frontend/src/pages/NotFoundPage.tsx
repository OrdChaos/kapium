import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { Search, ChevronLeft } from 'lucide-react';

interface NotFoundPageProps {
  onSearchClick: () => void;
}

export default function NotFoundPage({ onSearchClick }: NotFoundPageProps) {
  return (
    <>
      <Helmet>
        <title>{`404 页面未找到 - ${import.meta.env.VITE_SITE_TITLE}`}</title>
        <meta name="description" content="您访问的页面不存在" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <Layout onSearchClick={onSearchClick}>
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-primary/20">404</h1>
            <div className="relative -mt-12 mb-6">
              <h2 className="text-3xl font-bold text-foreground">
                页面未找到
              </h2>
            </div>
          </div>

          <p className="mb-8 text-muted-foreground">
            抱歉，您访问的页面不存在。可能是链接已过期或输入错误。
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/">
              <Button 
                variant="outline" 
                size="lg"
                className="w-full gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                返回首页
              </Button>
            </Link>
            <Button 
              size="lg"
              className="w-full gap-2"
              onClick={onSearchClick}
            >
              <Search className="h-4 w-4" />
              搜索内容
            </Button>
          </div>
        </div>
      </div>
    </Layout>
    </>
  );
}
