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
    setIsLoading(prev => {
      if (!prev) {
        NProgress.start();
        return true;
      }
      return prev;
    });
  }, []);

  const completeLoading = useCallback(() => {
    setIsLoading(prev => {
      if (prev) {
        NProgress.done();
        return false;
      }
      return prev;
    });
  }, []);

  const cleanup = useCallback(() => {
    if (completionTimer.current) {
      clearTimeout(completionTimer.current);
    }
    NProgress.remove();
  }, []);

  const cleanupRef = useRef(cleanup);

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