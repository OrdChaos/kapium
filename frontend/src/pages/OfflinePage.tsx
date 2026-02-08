import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Wifi } from 'lucide-react';

interface OfflinePageProps {
  onSearchClick: () => void;
}

export default function OfflinePage({ onSearchClick }: OfflinePageProps) {
  document.title = '离线 - ' + import.meta.env.VITE_SITE_TITLE;
  
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <Layout onSearchClick={onSearchClick}>
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <div className="flex justify-center mb-4">
              <Wifi className="h-24 w-24 text-muted-foreground opacity-30" strokeWidth={1} />
            </div>
            <div className="relative mb-6">
              <h2 className="text-3xl font-bold text-foreground">
                暂无网络连接
              </h2>
            </div>
          </div>

          <p className="mb-8 text-muted-foreground">
            您当前处于离线状态。请检查网络连接并重试。
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button 
              size="lg"
              className="w-full gap-2"
              onClick={handleRetry}
            >
              <Wifi className="h-4 w-4" />
              重新连接
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
