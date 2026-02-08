import Layout from '@/components/Layout';
import Banner from '@/components/Banner';
import { useEffect, useState } from 'react';
import { Copy, Rss, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface FeedPageProps {
  onSearchClick: () => void;
}

export default function FeedPage({ onSearchClick }: FeedPageProps) {
  const [feedUrl, setFeedUrl] = useState('');
  const siteTitle = import.meta.env.VITE_SITE_TITLE;

  useEffect(() => {
    document.title = `订阅 - ${siteTitle}`;
    setFeedUrl(`${import.meta.env.VITE_SITE_URL}/rss.xml`);
  }, []);

  const handleCopy = () => {
    const showSuccess = () => {
      toast.success('链接已复制', { duration: 2000 });
    };

    const showError = () => {
      toast.error('复制失败，请手动复制', { duration: 3000 });
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(feedUrl)
        .then(showSuccess)
        .catch(showError);
    } else {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = feedUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        const success = document.execCommand('copy');
        document.body.removeChild(textarea);

        if (success) {
          showSuccess();
        } else {
          showError();
        }
      } catch {
        showError();
      }
    }
  };

return (
    <Layout onSearchClick={onSearchClick}>
      <Banner
        title="订阅"
        subtitle="通过 RSS 随时获取最新文章，无广告、无算法干扰"
        height="standard"
      />

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl prose prose-neutral dark:prose-invert">

          <div className="rounded-lg border border-border shadow-md overflow-hidden bg-card duration-300 hover:shadow-lg hover:border-primary/50 p-4">
            <div className="grid grid-flow-col auto-cols-max items-center gap-3 mb-4">
              <Rss className="h-6 w-6 text-primary translate-y-[5px]" />
              <h3 className="text-xl font-semibold leading-none">本站 RSS 订阅地址</h3>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                value={feedUrl}
                readOnly
                className="font-mono text-sm"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button onClick={handleCopy} className="gap-2 whitespace-nowrap duration-300 active:scale-95">
                <Copy className="h-4 w-4" />
                复制链接
              </Button>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              直接把以上地址粘贴到你的 RSS 阅读器即可订阅。
            </p>
          </div>

          <div className="mt-12 text-center text-muted-foreground">
            <div className="mb-2">
              <p className="italic">
                “阅读不是为了逃避生活，而是为了更清晰地看见世界。”
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}