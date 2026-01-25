import { toast } from 'sonner';
import { Link2 } from 'lucide-react';
import { Icon } from '@iconify/react';

interface SocialShareProps {
  title: string;
  url?: string;
}

export default function SocialShare({ title, url }: SocialShareProps) {
  const shareUrl = url || window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

    const handleCopyLink = async () => {
        const showSuccess = () => {
            toast.success('链接已复制', { duration: 2000 });
        };

        if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(shareUrl)
            .then(showSuccess)
            .catch(() => fallbackCopy());
        } else {
            fallbackCopy();
        }

        function fallbackCopy() {
            try {
                const textarea = document.createElement('textarea');
                textarea.value = shareUrl;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();

                const success = document.execCommand('copy');
                document.body.removeChild(textarea);

                if (success) {
                showSuccess();
                } else {
                console.error('execCommand copy 失败');
                }
            } catch (err) {
                toast.error('复制失败', { duration: 2000 });
            }
        }
    }

  // 社交媒体分享链接
  const shareLinks = [
    {
      name: 'QQ空间',
      icon: (
        <Icon icon="ri:qq-line" className="h-5 w-5" />
      ),
      url: `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${encodedUrl}&title=${encodedTitle}`,
    },
    {
      name: '微博',
      icon: (
        <Icon icon="ri:weibo-line" className="h-5 w-5" />
      ),
      url: `https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedTitle}`,
    },
    {
      name: '豆瓣',
      icon: (
        <Icon icon="ri:douban-line" className="h-5 w-5" />
      ),
      url: `https://www.douban.com/share/service?href=${encodedUrl}&name=${encodedTitle}`,
    },
    {
      name: 'X',
      icon: (
        <Icon icon="ri:twitter-x-fill" className="h-5 w-5" />
      ),
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      name: 'Facebook',
      icon: (
        <Icon icon="ri:facebook-fill" className="h-5 w-5" />
      ),
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'LinkedIn',
      icon: (
        <Icon icon="ri:linkedin-box-line" className="h-5 w-5" />
      ),
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
    {shareLinks.map((platform) => (
        <button
        key={platform.name}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-border/70 bg-background text-foreground transition-all shadow hover:shadow-lg hover:border-primary/50 active:scale-95"
        onClick={() => window.open(platform.url, '_blank', 'width=600,height=400')}
        title={platform.name}
        >
        <div className="scale-90">{platform.icon}</div>
        </button>
    ))}

    <button
        className="flex h-9 w-9 items-center justify-center rounded-md border border-border/70 bg-background text-foreground transition-all shadow hover:shadow-lg hover:border-primary/50 active:scale-95"
        onClick={handleCopyLink}
        title="复制链接"
    >
        <Link2 className="h-4.5 w-4.5" />
    </button>
    </div>
  );
}
