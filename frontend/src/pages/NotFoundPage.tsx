import Layout from '@/components/Layout';
import Banner from '@/components/Banner';
import { useEffect } from 'react';

interface NotFoundPageProps {
  onSearchClick: () => void;
}

export default function NotFoundPage({ onSearchClick }: NotFoundPageProps) {
  useEffect(() => {
    // 设置页面标题
    document.title = '404 - 页面未找到 - 序炁的博客';
  }, []);

  return (
    <Layout onSearchClick={onSearchClick}>
      <Banner
        title="404 - 页面未找到"
        subtitle="抱歉，您访问的页面不存在或已被移除"
        height="standard"
      />
    </Layout>
  );
}