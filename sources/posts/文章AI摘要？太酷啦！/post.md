看了HEO的[如何让博客支持AI摘要，使用TianliGPT自动生成文章的AI摘要](https://blog.zhheo.com/p/ec57d8b2.html)，甚是手痒……整一个！

<!--more-->

## 前情提要

的确，我可以直接把HEO现成的部署方案拿来用，但我是一个有追求的人（雾。事实上，直接使用这种解决方案得到的摘要栏与我博客的设计风格并不是很搭，这就要求我自己写一个前端<span class="heimu" title="你知道的太多了">后端是不可能的，这辈子也不可能的</span>。

好，开干！但首先，第一个问题出现了：我博客的设计风格本身就不太统一。首页的说说轮播和说说页面的数量统计用了fluid主题自带的info，而友链朋友圈页面又没有，直接使用了圆角矩形承载统计信息。

为了解决这个问题，我需要用一样东西代替info标签。经过再三深思熟虑，我选用圆角矩形统一替换info.

而后便有了枯燥的漫长（？）css编写时间：

```css
div.ocxqntcontainer {
    display: flex;
    align-items: center;
    justify-content: center;
    height: auto;
}

div.ocxqnt {
    border: 1px solid #e9e9e9;
    border-radius: 1rem;
    padding: 1rem;
    text-align: left;
    width: 100%;
}

span.memos-t {
    margin: 0 1rem;
}
```

就这样，圆角矩形大功告成。

## 摘要部署

现在这个步骤就变得很简单了，对于我用的fluid主题，编辑`layout/post.ejs`即可，在`article`标签中，类为`markdown-body`的`div`标签之前加入以下内容：

```html
<style>
  i.icon-ordchaos-blog-robot, span.ocxq-ai-title {
	font-weight: bold;
	font-size: 1.2em;
  }

  span.ocxq-ai-warn {
	font-weight: bold;
  }

  .ocxq-ai-text.typing::after {
	content: "_";
	margin-left: 2px;
	animation: blink 0.7s infinite;
  }

  @keyframes blink {
	50% {
	  opacity: 0;
	}
  }
</style>
<script>
  let tianliGPT_postSelector = '#board .post-content .markdown-body';
  let tianliGPT_key = '5Q5mpqRK5DkwT1X9Gi5e';
</script>
<div class="ocxqntcontainer">
  <div class="ocxqnt">
	<span id='memos-t'>
	  <i class="iconfont icon-ordchaos-blog-robot"></i><span id="memos-index-space"> </span><span class="ocxq-ai-title">AI摘要</span>
	  <br>
	  <span class="ocxq-ai-text">
		生成中...
	  </span>
	  <br>
	  <span class="ocxq-ai-warn">摘要由AI自动生成，仅供参考！</span>
	</span>
  </div>
</div>
<br>

<!--正文部分-->

<script src="https://www.ordchaos.com/js/aisummary.js"></script>
```

这里有几个问题：

- 为什么内容在`id`为`memos-t`的`span`标签中：因为它同样套用了刚刚写好的圆角矩形，而这个圆角矩形为了适配原有的`memos`说说而要求内部文字必须拥有`memos-t`的`id`.
- `iconfont icon-ordchaos-blog-robot`是什么图标：我在`iconfont.cn`中取用的，因为加入了我的图标库所以拥有图标库前缀`icon-ordchaos-blog`，若也想选用的话可以直接在`iconfont.cn`搜索关键词robot找到并添加到自己的图标库
- 为什么不把样式代码写到css里面去：我懒

最后在文件的末尾处加上对js文件的引用。

说到js，由于HEO提供的js文件中含有生成前端容器的部分，所以必须要删除这部分内容并对其做出部分修改。过程这里就不放了，实在看不懂的可以参考我改好的<span class="heimu" title="你知道的太多了">被压缩了怎么看啊</span><span class="heimu" title="你知道的太多了">自己想办法</span><span class="heimu" title="你知道的太多了">现在想看也看不到了（</span>。

而后去爱发电订阅TianliGPT并将api key填入即可。

## 效果

![](https://img.ordchaos.com/img/2023/07/89262b9071f3c4db0169b20c42cc1549.png)

## 题外话

最开始因为不想写css而拖了好久……最终因为实在眼馋，欲望盖过了懒病才动身做完。

话说我这样改别人写好的js应该没问题吧……

那就这样，886！

## 2024.08.14更新

自己整了一个无服务器的后端，已经换上了。

详见[无服务器AI摘要后端——OrdChaosGPT](https://www.ordchaos.com/posts/fd9dafa1/)