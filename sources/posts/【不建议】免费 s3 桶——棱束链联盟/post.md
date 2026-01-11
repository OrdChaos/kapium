小品牌，无法保证SLA，故不再推荐。本站图片现已全部转移到[阿里云oss](https://oss.console.aliyun.com/overview)。

<!--more-->

我是在B站看到棱束链的[宣传视频](https://www.bilibili.com/video/av771453546)的，点进官网就看见了棱束链联盟的广告。想着免费嘛，就申请了一下。效率还不错，第二天就通过了。现在博客的图片就放在上面，感觉速度不错，至少比之前的blackbaze+cloudflare要快。

## 申请

很简单，首先进入官网[棱束链](https://www.lingshulian.com/)，在顶栏上点击产品，选择棱束链联盟。

![](https://img.ordchaos.com/img/2022/08/8409f4d334ef7e66ef54de7710ea63f7.png)

然后就抵达了申请页面：

![](https://img.ordchaos.com/img/2022/08/a7377b528525a29ca2cc1adb7b258fcd.png)

填写表单，按要求在网站底部加入棱束链提供的Logo，比如我的：（可以自己在网站底部看看）

![](https://img.ordchaos.com/img/2022/08/e30bf829e38f596c59c9d3a4748c1989.png)

提交表单，等着就可以了。

如果申请了就记得看一看自己提供的邮箱，通过了就会发邮件通知你。我的话第二天早上就发现通过了，处理速度还是不错的。给到了我10G的空间与20G的流量，诚意很足。

之后进入控制台，点击对象存储，再创建存储桶就可以使用了。

## PicGo配置

[PicGo](https://www.lingshulian.com/link?redirect=https%3A%2F%2Fmolunerfinn.com%2FPicGo%2F)作为一个图片上传工具是非常不错的，拓展性很高。同时作为一款开源软件，其发布在了[GitHub](https://github.com/Molunerfinn/PicGo/)上。这里默认已经安装完成了PicGo。

### 安装S3桶插件

打开PicGo，点击“插件设置”，在搜索框中搜索“s3”，安装第一个就可以了：

![](https://img.ordchaos.com/img/2022/08/dfafc2c6bb5acae1fa5a97b0988e1129.png)

我这里安装过了，所以就显示的是“已安装”。这个插件支持所有s3桶，比如之前的b2以及这个棱束链。

### 获取配置信息

#### secretID与secretKey

进入棱束链的控制台，点击个人中心，在“功能设置”中开启API并记下secretID与secretKey，若是忘了就只能重新获取。

![](https://img.ordchaos.com/img/2022/08/bed66b189347589ca1fde8434238c213.png)

#### 桶地域信息

前往存储桶列表，点击桶右侧的“配置”按钮，记下“桶信息”卡片中的地域与端点信息即可。

![](https://img.ordchaos.com/img/2022/08/061751a05597109431e77369bc615abb.png)

注意，这里的桶**一定**要是公开桶！

### 配置PicGo图床

点击图床设置-AmazonS3，填写对应参数即可，大致如下：

- 应用密钥ID：上述获取到的secretId
- 应用密钥：上述获取到的 secretKey
- 桶：上述存储桶的名字
- 权限：public-read（桶权限，公共读）
- 地区：上述获取到的地域
- 自定义节点：上述获取到的端点
- 文件路径：{year}/{month}/{md5}.{extName}（默认上传到桶的文件路径，格式如下：)

|     格式     |          描述          |
| :----------: | :--------------------: |
|   `{year}`   |     当前日期 - 年      |
|  `{month}`   |     当前日期 - 月      |
|   `{day}`    |     当前日期 - 日      |
| `{fullName}` | 完整文件名（含扩展名） |
| `{fileName}` |  文件名（不含扩展名）  |
| `{extName}`  |   扩展名（不含`.`）    |
|   `{md5}`    |    图片 MD5 计算值     |
|   `{sha1}`   |    图片 SHA1 计算值    |
|  `{sha256}`  |   图片 SHA256 计算值   |

然后点击“设为默认图床”并确定即可，之后只需要在“上传区”页面就可以一键上传图片并复制链接了。

## 题外话

文章部分参考[官方文档](https://www.lingshulian.com/article/1566546474d701797c794a3e2b748274)。

这篇博文不是广告，只是想大家都可以薅一把羊毛<span class="heimu" title="你知道的太多了">并水一篇博文（逃</span>

那就这样，886。
