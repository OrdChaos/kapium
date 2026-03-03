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

    const pagePath = `/posts/${abbrlink}`;

    try {
      const startAt = new Date("2020-01-01").getTime().toString();
      const endAt = Date.now().toString();

      const params = new URLSearchParams({
        startAt,
        endAt,
        path: pagePath,
      });

      const res = await fetch(
        `${umamiApiUrl}/websites/${websiteId}/stats?${params}`,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Umami API error: ${res.status} - ${errText}`);
      }

      const data = await res.json();

      const pv = typeof data?.pageviews === 'number' 
        ? data.pageviews 
        : (data?.pageviews?.value ?? 0);

      setPageViews(pv);
      setError(false);
    } catch (err) {
      console.error('Failed to fetch Umami:', err);
      setPageViews(null);
      setError(true);
    }
  }, [abbrlink, umamiApiUrl, websiteId, apiToken]);

  useEffect(() => {
    fetchPageViews();
  }, [fetchPageViews]);

  return { pageViews, error, isLoading: pageViews === null && !error };
}