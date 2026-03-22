import Layout from '@/components/Layout';
import Banner from '@/components/Banner';
import { useEffect, useState } from 'react';
import { usePageLoading } from '@/hooks/use-page-loading';

interface TwikooInitOptions {
  envId: string;
  el: string | HTMLElement;
  path?: string;
  region?: string;
  lang?: string;
}

declare global {
  interface Window {
    twikoo: {
      init: (options: TwikooInitOptions) => void;
    };
  }
}

interface TwikooAdminPageProps {
  onSearchClick: () => void;
}

export default function TwikooAdminPage({ onSearchClick }: TwikooAdminPageProps) {
  const [isLoaded, setIsLoaded] = useState(true);
  usePageLoading(isLoaded);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/twikoo@1.7.4/dist/twikoo.min.js';
    script.async = true;

    script.onload = () => {
      if (window.twikoo) {
        window.twikoo.init({
          envId: import.meta.env.VITE_TWIKOO_ENV,
          el: '#tcomment',
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <Layout onSearchClick={onSearchClick}>
      <Banner
        title="Twikoo管理页面"
        subtitle="在这里放了一个原版twikoo前端"
        height="standard"
      />
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div id="tcomment"></div>
        </div>
      </div>
    </Layout>
  );
}