import { createContext, useContext, useState, useCallback, useRef } from 'react';
import NProgress from 'nprogress';

interface LoadingContextType {
  startLoading: () => void;
  completeLoading: () => void;
  isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const completionTimer = useRef<NodeJS.Timeout | null>(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    NProgress.start();
  }, []);

  const completeLoading = useCallback(() => {
    // 清除之前的定时器
    if (completionTimer.current) {
      clearTimeout(completionTimer.current);
    }

    NProgress.done();
    setIsLoading(false);
  }, []);

  // 清理函数
  const cleanup = useCallback(() => {
    if (completionTimer.current) {
      clearTimeout(completionTimer.current);
    }
    NProgress.remove();
  }, []);

  // 组件卸载时清理
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cleanupRef = useRef(cleanup);
  // cleanupRef.current = cleanup;

  return (
    <LoadingContext.Provider value={{ startLoading, completeLoading, isLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
}