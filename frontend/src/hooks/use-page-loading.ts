import { useEffect } from 'react';
import { useLoading } from "@/contexts/LoadingContext";

/**
 * Hook to control loading state via LoadingContext
 * @param isLoaded - boolean indicating if data has finished loading
 */
export function usePageLoading(isLoaded: boolean) {
  const { startLoading, completeLoading } = useLoading();

  useEffect(() => {
    if (!isLoaded) {
      startLoading();
    } else {
      completeLoading();
    }

    return () => {
      // 组件卸载时确保清理
    };
  }, [isLoaded, startLoading, completeLoading]);
}
