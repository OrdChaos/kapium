博客的说说真的是一波三折......

<!--more-->

最开始用的是[HexoPlusPlus](https://hexoplusplus.js.org)的说说，很好用也很流畅小巧，但是自Hpp停止开发后就用不了了。

然后改用了[bber](https://immmmm.com/bb-by-wechat-pro/)，也很不错，但是<span class="heimu" title="你知道的太多了">辣鸡</span>腾讯云也是离谱，好好的羊毛突然就不让薅了，<span class="heimu" title="你知道的太多了">同时我的twikoo也被迫迁移到了vercel，</span>只得抛弃。

中途也用过别的说说系统，比如说大名鼎鼎的[Artitalk](https://artitalk.js.org/)亦或者是[iSpeak](https://github.com/kkfive/iSpeak/)等等，但是都不太满意，而后因为各式各样的原因放弃。

本来我会一直被这玩意困扰......现在不会了！只因为我发现了它——[Memos](https://usememos.com/)

开源，私有部署，这不就是我要的完美的说说系统吗？！

## 后端部署

很简单，首先你要有一台vps，然后装上docker.

随后一句指令即可搞定：

```shell
docker run -d --name memos -p 5230:5230 -v ${PWD}/.memos/:/var/opt/memos neosmemo/memos:latest
```

随后Memos就会被部署到5230端口，觉得不方便也可以反向代理，这个教程有很多，这里就不写了。

## 前端

### 单页

可以看看我的：[说说](https://www.ordchaos.com/talk/)

样式完全是自己写的......你知道对一位学C++的初三学生而言css是什么东西吗？！<span class="heimu" title="你知道的太多了">好吧随便写写也不算难</span>

js来自[immmmm](https://immmmm.com/)，稍微改了一点点，可以在[这里](https://www.ordchaos.com/js/talk.js)看看<span class="heimu" title="你知道的太多了">被压缩了根本看不了</span>。

总体而言，如果你也想要部署一个和我完全一样的页面，可以用以下html代码：（记得下载js文件）

```html
<div class='memo-nums'>
  <p class='note note-info memo-nums-text'>
    共有 <span id='memonums'>「数待载之」</span> 条说说
  </p>
</div>
<div id="bber"></div>
<script type="text/javascript">
  var bbMemos = {
    memos : 'https://memos.ordchaos.top/',//修改为自己部署Memos的网址，末尾有斜杠
    limit : '',//默认每次显示10条 
    creatorId:'1' ,//默认为101用户
    domId: '',//默认为bber类
  }
</script>
<script src="//jsd.ordchaos.top/marked/marked.min.js"></script>
<script src="/js/talk.js"></script>
```

注意这里用了Tag插件，如果用不了记得改改。

### 首页轮播

这个就比较简单了，直接在主题的`index.ejs`里加上以下代码即可：

```html
<p class='note note-info memo-nums-text'>
  <i class="iconfont icon-speakernotes"></i><span id="memos-index-space"> </span><span id='memos-t'>首页说说轮播加载中...</span>
</p>
<script src="/js/lately.min.js"></script>
<script>
  let jsonUrl =
      "https://memos.ordchaos.top/api/memo?creatorId=1&rowStatus=NORMAL" +
      "&t=" +
      Date.parse(new Date());

  fetch(jsonUrl)
      .then((res) => res.json())
      .then((resdata) => {
              data = resdata.data,
              resultIndexMemos = new Array(data.length);
          for (var i = 0; i < data.length; i++) {
              var talkTime = new Date(
                  data[i].createdTs * 1000
              ).toLocaleString();
              var talkContent = data[i].content;
              var newtalkContent = talkContent
                  .replace(/```([\s\S]*?)```[\s]*/g, " <code>$1</code> ") //全局匹配代码块
                  .replace(/`([\s\S ]*?)`[\s]*/g, " <code>$1</code> ") //全局匹配内联代码块
                  .replace(/<iframe([\s\S ]*?)iframe>[\s]*/g, "📺") //全局匹配视频
                  .replace(/\!\[[\s\S]*?\]\([\s\S]*?\)/g, "🌅") //全局匹配图片
                  .replace(/\[[\s\S]*?\]\([\s\S]*?\)/g, "🔗") //全局匹配连接
                  .replace(
                      /\bhttps?:\/\/(?!\S+(?:jpe?g|png|bmp|gif|webp|jfif|gif))\S+/g,
                      "🔗"
                  ); //全局匹配纯文本连接
              if(newtalkContent.length > 25) {
                  newtalkContent = newtalkContent.substring(0, 25) + '...';
              }
              resultIndexMemos[i] = `<span class="datetime">${talkTime}</span>： <a href="https://www.ordchaos.com/talk/">${newtalkContent}</a>`;
          }
      });

  // 滚动效果
  var i = 0;
  setInterval(function () {
      document.getElementById("memos-t").innerHTML = resultIndexMemos[i];
      window.Lately && Lately.init({ target: ".datetime" });
      i++;
      if(i == resultIndexMemos.length) i = 0;
  }, 3000);
</script>
```

Tag仍然是不能用就记得改。代码来自[eallion](https://eallion.com/)，仍然是改了一下<span class="heimu" title="你知道的太多了">原本的逻辑怎么看怎么怪</span><span class="heimu" title="你知道的太多了">好吧也可能是我没看懂——总而言之，无意冒犯</span>。

javascript总算是好些那么一点点，起码与c++还有那么一点像，外加上自己写GDScript的经验，稍稍改点也不算难事<span class="heimu" title="你知道的太多了">改了一小时</span>

## 效果

<span class="heimu" title="你知道的太多了">自己去看看不行吗，动动手指的事</span>

![说说页面](https://img.ordchaos.com/img/2022/11/4ace9417edf03d7d6b4bd95620f27f55.png)

![首页轮播](https://img.ordchaos.com/img/2022/11/598e03e4a296da3866f9c4404977e5fa.png)

## 题外话

前前后后搞了半个月了，终于是在学习的闲暇时间整完，中途也是收获良多。

那就这样，886！
