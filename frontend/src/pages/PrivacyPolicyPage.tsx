import Layout from '@/components/Layout';
import Banner from '@/components/Banner';
import { useEffect, useState } from 'react';
import { usePageLoading } from '@/hooks/use-page-loading';

interface PrivacyPolicyPageProps {
  onSearchClick: () => void;
}

export default function PrivacyPolicyPage({ onSearchClick }: PrivacyPolicyPageProps) {
  const [isLoaded, setIsLoaded] = useState(true);

  usePageLoading(isLoaded);

  return (
    <>
      <Layout onSearchClick={onSearchClick}>
        <Banner
          title="隐私政策"
          subtitle="我们如何保护您的个人信息"
          height="standard"
        />
        <div className="container mx-auto px-4 py-12">
          <article>
            <div className="mx-auto max-w-4xl prose prose-lg dark:prose-invert">
              <h2>1. 信息收集</h2>
              <p>我们可能收集以下类型的信息：</p>
              <ul>
                <li>您主动提供的信息（如评论内容）</li>
                <li>自动收集的信息（如访问日志、浏览器类型）</li>
                <li>通过 Cookies 收集的信息</li>
              </ul>

              <h2>2. 信息使用</h2>
              <p>我们使用收集的信息来：</p>
              <ul>
                <li>提供和维护我们的服务</li>
                <li>改进用户体验</li>
                <li>分析网站流量</li>
                <li>发送重要通知</li>
              </ul>

              <h2>3. 信息共享</h2>
              <p>我们不会出售、交易或以其他方式向第三方转让您的个人信息，除非：</p>
              <ul>
                <li>获得您的明确同意</li>
                <li>法律要求</li>
                <li>保护我们的权利</li>
              </ul>

              <h2>4. 数据安全</h2>
              <p>我们采取适当的技术和组织措施来保护您的个人信息，防止未经授权的访问、使用或披露。</p>

              <h2>5. 您的权利</h2>
              <p>您有权：</p>
              <ul>
                <li>访问我们持有的关于您的信息</li>
                <li>请求更正不准确的信息</li>
                <li>请求删除您的信息</li>
                <li>撤回同意</li>
              </ul>

              <h2>6. Cookies</h2>
              <p>我们使用 Cookies 来改善您的浏览体验。更多信息请参阅我们的 <a href="/cookies-policy">Cookies 政策</a>。</p>

              <h2>7. 政策变更</h2>
              <p>我们可能会不时更新本隐私政策。任何变更将在此页面上发布。</p>

              <h2>8. 联系我们</h2>
              <p>如果您对本隐私政策有任何疑问，请通过网站联系方式与我们联系。</p>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
                最后更新：2026年2月19日
              </p>
            </div>
          </article>
        </div>
      </Layout>
    </>
  );
}
