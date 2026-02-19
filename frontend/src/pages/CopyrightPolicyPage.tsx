import Layout from '@/components/Layout';
import Banner from '@/components/Banner';
import { useEffect, useState } from 'react';
import { usePageLoading } from '@/hooks/use-page-loading';

interface CopyrightPolicyPageProps {
  onSearchClick: () => void;
}

export default function CopyrightPolicyPage({ onSearchClick }: CopyrightPolicyPageProps) {
  const [isLoaded, setIsLoaded] = useState(true);

  usePageLoading(isLoaded);

  return (
    <>
      <Layout onSearchClick={onSearchClick}>
        <Banner
          title="版权政策"
          subtitle="谐元场域内容使用说明"
          height="standard"
        />
        <div className="container mx-auto px-4 py-12">
          <article>
            <div className="mx-auto max-w-4xl prose prose-lg dark:prose-invert">
              <p>欢迎访问 <a href="https://www.ordchaos.com" target="_blank" rel="noopener noreferrer">https://www.ordchaos.com</a>（下称"谐元场域"（原"序炁的博客"））。本博客的所有内容均受到版权保护，请在使用本博客内容时遵守以下版权政策。</p>

              <h2>一、版权协议</h2>
              <p>除特别声明外，本博客的所有文章均采用 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh" target="_blank" rel="noopener noreferrer">署名-非商业性使用-相同方式共享 4.0 国际 (CC BY-NC-SA 4.0)</a> 协议进行许可。</p>

              <p>这意味着您可以自由地分享、转载或修改本博客的内容，但需遵守以下条件：</p>

              <ul>
                <li><strong>署名</strong>：您必须为内容提供适当的署名，注明来源为"谐元场域"（原"序炁的博客"）或作者为"序炁"（For English post, you can use "OrdChaos' Blog", "Synchaos Field", "OrdChaos" or "OrdChaosXQ"），并附上原文链接。如果您对内容进行了修改，您必须明确指出这些修改。</li>
                <li><strong>非商业性使用</strong>：您不得将本博客的内容用于商业目的。任何涉及商业用途的行为均需事先获得我的明确书面许可。</li>
                <li><strong>相同方式共享</strong>：如果您对本博客的内容进行了修改、翻译或其他衍生创作，您必须在相同的许可条款下分享这些作品。</li>
              </ul>

              <p>其中原创内容的非商用转载必须为完整转载且标注出处的带有完整 url 链接或"访问原文"之类字样的超链接。</p>

              <h3>会被保护的内容</h3>
              <ul>
                <li>博文正文</li>
                <li>博文摘要</li>
                <li>博文封面与配图</li>
                <li>"序炁""谐元场域（原'序炁的博客'）"的名称及衍生形象</li>
              </ul>

              <h3>关于源代码</h3>
              <p>本博客使用 <a href="https://github.com/OrdChaos/kapium" target="_blank" rel="noopener noreferrer">Kapium</a> 构建。</p>
              <p>除此以外的，完全由我原创的代码均使用 <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer">MIT</a> 协议进行授权。</p>

              <h2>二、特别声明内容</h2>
              <p>对于本博客中特别声明不适用上述署名-非商业性使用-相同方式共享 4.0 国际协议的内容，您需要遵守相关内容所附的具体版权声明。如果您对特定内容的使用有疑问，请联系我以获取更多信息。</p>

              <p>将博文作为参考资料的情况可以无需完整转载，摘录所需要的部分内容即可，但仍需标注出处。</p>

              <p>此外，如果您希望将本博客的内容用于商业用途，请通过访问关于页面获取我的联系与我取得联系，以讨论获取相应的许可。</p>

              <h2>三、您的权利</h2>
              <p>只要你遵守本页的许可，你可以自由地共享文章的内容，及在任何媒介以任何形式复制、发行本作品。并且无需通知我。</p>

              <h2>四、其它</h2>
              <p>除文章摘要以外，我承诺谐元场域（原"序炁的博客"）的所有非转载博文均为我的原创作品，不由 AI 生成。</p>

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
