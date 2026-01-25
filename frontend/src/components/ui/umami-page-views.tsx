import { Eye } from 'lucide-react';
import { useUmamiPageViews } from '@/hooks/use-umami-page-views';

interface UmamiPageViewsProps {
  abbrlink?: string;
  className?: string;
}

export function UmamiPageViews({ abbrlink, className = '' }: UmamiPageViewsProps) {
  const UMAMI_API_URL = import.meta.env.VITE_UMAMI_API_URL + '/api';
  const WEBSITE_ID = import.meta.env.VITE_UMAMI_WEBSITE_ID;
  const API_TOKEN = import.meta.env.VITE_UMAMI_API_TOKEN;

  const { pageViews, error, isLoading } = useUmamiPageViews({
    abbrlink,
    umamiApiUrl: UMAMI_API_URL,
    websiteId: WEBSITE_ID,
    apiToken: API_TOKEN,
  });

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Eye className="h-4 w-4" />
      <span id="umami-page-pv">
        {isLoading ? '...' : error ? '—' : pageViews?.toLocaleString() ?? '0'} 次浏览
      </span>
    </div>
  );
}