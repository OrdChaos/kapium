import Layout from '@/components/Layout';
import Banner from '@/components/Banner';
import { useEffect, useState } from 'react';
import { usePageLoading } from '@/hooks/use-page-loading';

interface CookiesPolicyPageProps {
  onSearchClick: () => void;
}

export default function CookiesPolicyPage({ onSearchClick }: CookiesPolicyPageProps) {
  const [isLoaded, setIsLoaded] = useState(true);

  usePageLoading(isLoaded);

  return (
    <>
      <Layout onSearchClick={onSearchClick}>
        <Banner
          title="Cookies 政策"
          subtitle="关于我们使用 Cookies 的说明"
          height="standard"
        />
        <div className="container mx-auto px-4 py-12">
          <article>
            <div className="mx-auto max-w-4xl prose prose-lg dark:prose-invert">
              <h2>1. 什么是 Cookies？</h2>
              <p>Cookies 是存储在您设备上的小型文本文件，用于记住您的偏好和改善您的在线体验。</p>

              <h2>2. 我们使用的 Cookies 类型</h2>
              
              <h3>必要的 Cookies</h3>
              <p>这些 Cookies 对于网站的基本功能是必需的，无法关闭。它们通常仅在响应您的操作时设置，例如设置隐私偏好、登录或填写表单。</p>

              <h3>功能 Cookies</h3>
              <p>这些 Cookies 使网站能够提供增强的功能和个性化。它们可能由我们或我们已将其服务添加到页面的第三方提供商设置。</p>

              <h3>分析 Cookies</h3>
              <p>这些 Cookies 帮助我们了解访问者如何与网站交互，帮助我们改进网站。所有这些 Cookies 收集的信息都是汇总的，因此是匿名的。</p>

              <h2>3. 我们使用的具体 Cookies</h2>
              <ul>
                <li><strong>主题偏好 Cookie</strong> - 记住您选择的深色/浅色主题</li>
                <li><strong>Umami 分析 Cookie</strong> - 用于统计网站访问数据</li>
                <li><strong>Twikoo 评论系统 Cookie</strong> - 用于评论功能</li>
              </ul>

              <h3>本地存储</h3>
              <p>除了 Cookies，我们还使用浏览器的本地存储（LocalStorage）来存储以下信息：</p>
              <ul>
                <li><strong>搜索历史</strong> - 记录您在本站的搜索历史，方便您快速重复搜索，最多保存 10 条记录</li>
              </ul>
              <p>搜索历史仅存储在您的本地设备上，不会上传到我们的服务器。您可以随时在搜索界面中删除单条记录或清空全部历史。</p>

              <h2>4. 如何管理 Cookies</h2>
              <p>您可以通过浏览器设置来控制和/或删除 Cookies。您可以删除计算机上已存在的所有 Cookies，也可以设置大多数浏览器阻止放置它们。但是，如果您这样做，每次访问网站时可能需要手动调整一些偏好设置，某些服务和功能可能无法正常工作。</p>

              <h2>5. 第三方 Cookies</h2>
              <p>在某些情况下，我们使用由受信任的第三方提供的 Cookies：</p>
              <ul>
                <li>Umami - 网站分析</li>
                <li>Twikoo - 评论系统</li>
              </ul>
              <p>这些 Cookies 与我们的网站直接相关，不会被用于其他目的。它们都是第一方自部署的开源项目，您可以在 <a href="https://github.com/umami-software/umami">Umami GitHub 仓库</a> 和 <a href="https://github.com/imaegoo/twikoo">Twikoo GitHub 仓库</a> 查看其源代码。</p>

              <h2>6. 更多信息</h2>
              <p>如需了解更多信息，请查阅我们的 <a href="/privacy-policy">隐私政策</a>。</p>

              <h2>7. 联系我们</h2>
              <p>如果您对我们的 Cookies 政策有任何疑问，请通过网站联系方式与我们联系。</p>

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
