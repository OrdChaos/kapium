没错，任何正常人都不会把标题里这两样东西联系起来，包括我。

<!--more-->

## NetlifyCMS

最开始看到这玩意是在fluid的官方博客的这一篇博文[Hexo Netlify CMS 在线编辑博客](https://hexo.fluid-dev.com/posts/hexo-netlify/)（转载的，原文地址在[这里](https://www.myql.xyz/post/e00ab0f6/)），当时就觉得非常不错，但可惜未能按照教程配置成功，只得转投于更贴合于Hexo的HexoPlusPlus<span class="heimu" title="你知道的太多了">Hexo艹</span>

直到~~前几天~~上个月看到 @Xingyang 在[一键推流工具——BlogPusher](https://www.ordchaos.com/posts/10824f12/)这一篇文章下的[评论](https://www.ordchaos.com/posts/10824f12/#7c90660dd62143d2bd9db227ab9db8a6)：

> 如果静态博客是部署在 Github 上的话可以试试用 Netlify CMS。相当于架设一个能进行 Git Commit 的 Web app，最重要的就是 0 花费，Private Repo 也可以用。我自己的博客也在用（虽然文章数不是很多()）
>
> 参考文章：https://cnly.github.io/2018/04/14/just-3-steps-adding-netlify-cms-to-existing-github-pages-site-within-10-minutes.html

很好，但是不太符合我的情况。于是随即翻了翻——

![](https://img.ordchaos.com/img/2022/09/c9dcce95c9ac5cc0b374d8f6f30977ee.png)

瞳 孔 地 震.jpg

完全可用！撒花！

如果你也没有成功配置Netlify CMS的话也可以试试，教程十分甚至九分简单，个人感觉几乎不存在出错的可能性。

感谢@Xingyang！

## ShareThis (2024.2.13更新 已失效)

最开始捣鼓了一阵子分享系统，share.js啊，Social Share Button啊等等都尝试过一遍，但我都不太满意，况且分享也不是刚需，于是就此作罢。

直到昨天，我妈问我：“你这个博客怎么分享给别人看啊？”

我突然感觉分享还是有必要的，遂继续开始寻觅，然后就发现了[ShareThis](https://sharethis.com/)

### 注册

非常简单，进入首页：[https://sharethis.com](https://sharethis.com)

![](https://img.ordchaos.com/img/2022/09/d4c3d172f93f30f67583d155923d9356.png)

点击“从分享按钮开始”，然后点击第一个选项：

![](https://img.ordchaos.com/img/2022/09/4b1cd38081ce95ec0d3f91679e4fbcc0.png)

不要急着点击下一步，先用滚轮滚动到页面下方，点击“Customize your Inline Share Buttons”按钮。

在弹出的选项中对按钮进行配置，可以配置包括颜色、媒体、形状等等内容。

![](https://img.ordchaos.com/img/2022/09/4f24034eb100769f87e8264232d51d65.png)

最下方的语言记得调整为中文，然后点击下一步，在新页面中注册登录即可。

随后，你会得到两串代码，分别是js安装代码与按钮引入代码。安装代码放在head中，按钮放在你想插入的地方就好。

大概如下：

```html
<!-- 安装 -->
<script type='text/javascript' src='https://platform-api.sharethis.com/js/sharethis.js#property=不告诉你&product=inline-share-buttons' async='async'></script>
```

```html
<!-- 按钮插入 -->
<div class="sharethis-inline-share-buttons"></div>
```



### 效果

滑到这篇文章底下看吧。

## 题外话

这篇博文算是对近期我对博客的大改动，但是单独发太短，所以就这么整合在一起了。

那就这样，这篇博文就到这里，886！
