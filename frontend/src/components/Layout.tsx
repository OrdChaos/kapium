import { ReactNode, useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  onSearchClick?: () => void;
}

export default function Layout({ children, onSearchClick }: LayoutProps) {
  const [showTopButton, setShowTopButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // 当页面滚动超过一定距离时显示返回顶部按钮
      if (window.scrollY > 300) {
        setShowTopButton(true);
      } else {
        setShowTopButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="flex min-h-[calc(100vh+2px)] flex-col">
      <Navbar onSearchClick={onSearchClick} />
      <main className="flex-1">{children}</main>
      <Footer />
      
      {/* 返回顶部按钮 */}
      {showTopButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 rounded-lg bg-card text-foreground border border-border shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/50 z-50 p-3 active:scale-95"
          aria-label="返回顶部"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chevron-up"
          >
            <path d="m18 15-6-6-6 6" />
          </svg>
        </button>
      )}
    </div>
  );
}