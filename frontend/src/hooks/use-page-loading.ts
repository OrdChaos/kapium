import { useEffect } from 'react';
import NProgress from 'nprogress';
import { useLoading } from "@/contexts/LoadingContext";

/**
 * Hook to complete the loading bar when data loading is finished
 * @param isLoaded - boolean indicating if data has finished loading
 */
export function usePageLoading(isLoaded: boolean) {
  const { completeLoading } = useLoading();

  useEffect(() => {
    if (isLoaded) {
      NProgress.done();
      completeLoading();
    }

    return () => {
      NProgress.done();
      NProgress.remove();
    };
  }, [isLoaded, completeLoading]);
}
