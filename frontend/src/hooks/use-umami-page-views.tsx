import { useCallback, useEffect, useState } from 'react';

interface UseUmamiPageViewsProps {
  abbrlink?: string;
  umamiApiUrl: string;
  websiteId: string;
  apiToken: string;
}

export function useUmamiPageViews({
  abbrlink,
  umamiApiUrl,
  websiteId,
  apiToken,
}: UseUmamiPageViewsProps) {
  const [pageViews, setPageViews] = useState<number | null>(null);
  const [error, setError] = useState<boolean>(false);

  const fetchPageViews = useCallback(async () => {
    if (!abbrlink) {
      setPageViews(null);
      return;
    }

    const pagePath = `/posts/${abbrlink}/`;

    try {
      const params = new URLSearchParams({
        startAt: new Date(import.meta.env.VITE_UMAMI_START_AT).getTime().toString(),
        endAt: Date.now().toString(),
        url: pagePath,
      });

      const res = await fetch(
        `${umamiApiUrl}/websites/${websiteId}/stats?${params}`,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        }
      );

      if (!res.ok) throw new Error(`Umami API error: ${res.status}`);

      const data = await res.json();
      const pv = data?.pageviews?.value ?? 0;

      setPageViews(pv);
      setError(false);
    } catch (err) {
      console.error('Failed to fetch Umami page views:', err);
      setPageViews(null);
      setError(true);
    }
  }, [abbrlink, umamiApiUrl, websiteId, apiToken]);

  useEffect(() => {
    fetchPageViews();
  }, [fetchPageViews]);

  return { pageViews, error, isLoading: pageViews === null && !error };
}