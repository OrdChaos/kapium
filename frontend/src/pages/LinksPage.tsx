import Layout from '@/components/Layout';
import Banner from '@/components/Banner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSEO } from '@/hooks/use-seo';
import { usePageLoading } from '@/hooks/use-page-loading';

interface LinksPageProps {
  onSearchClick: () => void;
}

export default function LinksPage({ onSearchClick }: LinksPageProps) {
  const [links, setLinks] = useState<any[] | null>(null);
  const [visible, setVisible] = useState(false);

  // Complete loading bar when links are loaded
  usePageLoading(links !== null);

  // SEO Management
  const seoElement = useSEO({
    title: '友链',
    description: '志同道合的技术博客和网站友链',
  });

  useEffect(() => {
    fetch('/data/links.json')
      .then(res => res.json())
      .then(data => setLinks(data));
  }, []);

  useEffect(() => {
    if (!visible && links) {
      requestAnimationFrame(() => setVisible(true));
    }
  }, [links, visible]);

  return (
    <Layout onSearchClick={onSearchClick}>
      {seoElement}
      <Banner
        title="友情链接"
        subtitle="优秀博客推荐"
        height="standard"
      />
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 rounded-lg border border-border bg-muted/50 p-6">
            <h2 className="mb-2 text-lg font-semibold">交换友链</h2>
            <p className="text-sm text-muted-foreground">
              如果你想与我交换友链，欢迎通过邮件联系我。请确保你的博客内容原创且定期更新。
            </p>
          </div>

          <div className={`grid gap-6 md:grid-cols-2 transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
            {links &&
              links.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <img
                          src={link.avatar}
                          alt={link.name}
                          className="
                            h-24 w-24 md:h-16 md:w-16
                            rounded-full
                            object-cover
                            shrink-0
                            border-2 border-border
                            avatar
                          "
                        />
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                            {link.name}
                            <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{link.description}</CardDescription>
                    </CardContent>
                  </Card>
                </a>
              ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}