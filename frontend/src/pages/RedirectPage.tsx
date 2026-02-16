import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { AlertCircle, ExternalLink, ChevronLeft } from 'lucide-react';
import { usePageLoading } from '@/hooks/use-page-loading';


interface RedirectPageProps {
  onSearchClick: () => void;
}

const isExternalUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const siteHostname = import.meta.env.VITE_SITE_HOSTNAME;
    const hostname = urlObj.hostname;

    return hostname !== siteHostname && 
           hostname !== 'localhost' && 
           hostname !== '127.0.0.1';
  } catch {
    return false;
  }
};

export default function RedirectPage({ onSearchClick }: RedirectPageProps) {
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [isInvalid, setIsInvalid] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Complete loading bar when page is initialized
  usePageLoading(isLoaded);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get('url');
    
    if (url && isExternalUrl(url)) {
      setTargetUrl(url);
    } else {
      setIsInvalid(true);
    }

    setIsLoaded(true);
  }, []);

  const handleConfirm = () => {
    if (targetUrl) {
      window.location.href = targetUrl;
    }
  };

    const handleCancel = () => {
    window.history.back();
    
    window.onpageshow = (event) => {
        if (event.persisted) {
        window.location.reload();
        }
    };
    };

  return (
    <Layout onSearchClick={onSearchClick}>
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          {isInvalid ? (
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h2 className="font-semibold text-destructive mb-2">无效的链接</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      很抱歉，无法获取有效的链接信息。
                    </p>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      返回上一页
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="duration-300 hover:shadow-lg hover:border-primary/50">
              <CardTitle className="p-6 pb-0">
                <div className="flex items-start gap-3">
                  <ExternalLink className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h2>确认跳转到外部链接</h2>
                    <CardDescription className="mt-1">
                      提醒您，即将离开本网站并访问以下链接：
                    </CardDescription>
                  </div>
                </div>
              </CardTitle>
              <CardContent className="pt-4">
                <div className="bg-muted p-4 rounded-lg mb-4 break-all text-sm">
                  <p className="font-mono text-foreground">{targetUrl}</p>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  请确保您信任此链接，然后继续。
                </p>
                <div className="flex gap-4 justify-end">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    确认跳转
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
