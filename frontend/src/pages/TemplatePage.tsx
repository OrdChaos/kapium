import Layout from '@/components/Layout';
import Banner from '@/components/Banner';
import { useEffect } from 'react';

/**
 * 空模板页面
 * 
 * 这是一个空白模板页面，展示了基本的页面结构。
 * 你可以使用这个模板作为创建新页面的起点。
 * 
 * 基本结构：
 * 1. Layout - 包含 Navbar 和 Footer
 * 2. Banner - 页面横幅（可选高度：'standard' 或 'tall'）
 * 3. 内容区域 - 使用 container 和响应式布局
 */

interface TemplatePageProps {
  onSearchClick: () => void;
}

export default function TemplatePage({ onSearchClick }: TemplatePageProps) {
  useEffect(() => {
    // 设置页面标题
    document.title = '模板 - ' + import.meta.env.VITE_SITE_TITLE;
  }, []);

  return (
    <Layout onSearchClick={onSearchClick}>
      <Banner
        title="模板页面"
        subtitle="这是一个模板页面"
        height="standard"
      />
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <p>这是一个模板页面，你可以基于它创建新的页面</p>
        </div>
      </div>
    </Layout>
  );
}