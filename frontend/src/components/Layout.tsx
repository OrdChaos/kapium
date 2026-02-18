import { ReactNode, useState, useEffect, useRef } from 'react';
import { ChevronUp } from 'lucide-react';
import Navbar from './Navbar';
import LoadingBar from "./ui/loading-bar";
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  onSearchClick?: () => void;
}

export default function Layout({ children, onSearchClick }: LayoutProps) {
  const [showTopButton, setShowTopButton] = useState(false);
  const [postIds, setPostIds] = useState<string[]>([]);
  const topButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetch('/data/postIds.json')
      .then(res => res.json())
      .then(setPostIds)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const shouldBeVisible = window.scrollY > 300;
      // 使用防抖避免频繁的状态更新
      if (shouldBeVisible !== showTopButton) {
        setShowTopButton(shouldBeVisible);
      }
    };

    // 使用 requestAnimationFrame 优化滚动性能
    let ticking = false;
    const optimizedScrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
    return () => window.removeEventListener('scroll', optimizedScrollHandler);
  }, [showTopButton]);

  const scrollToTop = () => {
    try {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } catch (error) {
      // 降级处理：如果 smooth 滚动不支持
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh+2px)] flex-col">
      <Navbar 
        onSearchClick={onSearchClick}
        postIds={postIds}
      />

      <LoadingBar />

      <main className="flex-1">
        {children}
      </main>

      <Footer />

      {/* 使用 Portal 或条件渲染避免 DOM 插入错误 */}
      {showTopButton && (
        <button
          ref={topButtonRef}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 rounded-lg bg-card text-foreground border border-border shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/50 z-50 p-3 active:scale-95"
          aria-label="返回顶部"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}