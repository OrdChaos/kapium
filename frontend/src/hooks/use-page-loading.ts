import { useEffect } from 'react';
import { useLoading } from "@/contexts/LoadingContext";

export function usePageLoading(isLoaded: boolean) {
  const { startLoading, completeLoading } = useLoading();

  useEffect(() => {
    if (!isLoaded) {
      startLoading();
    } else {
      completeLoading();
    }

    return () => {
    };
  }, [isLoaded, startLoading, completeLoading]);
}
