我已经有了一台阿里云的香港轻量应用服务器，正好阿里云oss内网下行流量免费，再加上oss上行流量同样免费，于是就可以在省掉所有的流量费用的同时获得一个拥有不错速度的私人图床。

<!--more-->

## 创建

打开[阿里云oss](https://oss.console.aliyun.com/overview)页面，点击bucket列表，选择创建bucket：

![](https://img.ordchaos.com/img/2022/08/cac38bb76668f802362812e48bc14e0d.png)

名称随意，但是地域要选择于自己的服务器相同的地区，这样才可以通过内网访问。存储类型选择标准存储，读写权限选择公共读，其余一律默认。

oss桶默认是按量计费，标准可以参考[官方文档](https://www.aliyun.com/price/product#/oss/detail/ossbag)。你也可以像我一样购买资源包，点击资源包管理，再在新页面中点击购买资源包：

![](https://img.ordchaos.com/img/2022/08/148d980aabaccea58c0230e728ec50f1.png)

然后在资源包类型一栏中选择标准\(LRS\)存储包，其余按需选择即可：

![](https://img.ordchaos.com/img/2022/08/0b3001c8013bbb88b7e0b02ec2da5249.png)

一年仅需9元，个人认为十分划算。

此时存储桶便已创建完成。

## 服务器反向代理

内网下行流量免费，所以我们要先访问内网，通过服务器反向代理就可以做到这一点。这里通过宝塔面板进行配置。

点击侧栏的网站，然后点击新建站点：

![](https://img.ordchaos.com/img/2022/08/2e68985d436b72d564d602de0ffa418b.png)

域名填写最终用来访问图片的域名，如这里的 assets.ordchaos.com。其余默认即可，然后选择提交。

之后点击对应网站的设置——反向代理——添加反向代理。名称随意填写，目标URL填写内容如图所示：

![](https://img.ordchaos.com/img/2022/08/cc63b49e488b716abf4b88e5cc7ebdbb.png)

填写对应的内网Bucket域名。

然后点击提交即可。也可以配置缓存，在添加反向代理时点击开启缓存并配置时间就可以了。记得在域名供应商那里添加对应的域名解析到服务器上。

之后可以配置SSL证书，在SSL页面自行配置即可。现在你的桶已经可以通过反向代理来访问了，下面我们来做一些额外的工作。

## PicGo配置

[PicGo](https://www.lingshulian.com/link?redirect=https%3A%2F%2Fmolunerfinn.com%2FPicGo%2F)作为一个图片上传工具是非常不错的，拓展性很高。同时作为一款开源软件，其发布在了[GitHub](https://github.com/Molunerfinn/PicGo/)上。这里默认已经安装完成了PicGo。

### 安装S3桶插件

打开PicGo，点击“插件设置”，在搜索框中搜索“s3”，安装第一个就可以了：

![](https://img.ordchaos.com/img/2022/08/dfafc2c6bb5acae1fa5a97b0988e1129.png)

我这里安装过了，所以就显示的是“已安装”。这个插件支持所有s3桶，包括阿里云oss。其实可以直接配置阿里云oss，但是使用s3插件可以自动按规则重命名文件。

### 获取配置信息

把鼠标移到右上角头像上悬浮，在出现的界面上点击访问控制：

![](https://img.ordchaos.com/img/2022/08/3b5b13f8eeb576411648be98a0b48053.png)

然后点击侧栏的用户，再点击创建用户：

![](https://img.ordchaos.com/img/2022/08/5b11a2f303a9f46c0cf49614e6fc1515.png)

登陆名称与显示名称随意，然后勾选下方的“Open API 调用访问”：

![](https://img.ordchaos.com/img/2022/08/1188eac59b4a500457b13b7c253233b3.png)

点击确定，验证身份，然后就会出现AccessKey ID 与 Secret，记得保存下来：

![](https://img.ordchaos.com/img/2022/08/9d20e0dd982685cc6ef898b7e842a232.png)

然后返回到用户管理页面，点击刚刚创建的RAM账号旁边的添加权限，然后添加控制oss桶的权限即可：

![](https://img.ordchaos.com/img/2022/08/6aa38f2e26a714699ceb7257700dff98.png)

### 配置PicGo图床

点击图床设置-AmazonS3，填写对应参数即可，大致如下：

- 应用密钥ID：上述获取到的AccessKey ID
- 应用密钥：上述获取到的AccessKey Secret
- 桶：你创建的oss桶的名字
- 权限：public-read（桶权限，公共读）
- 地区：在对应桶的概览页面可以看到桶的外网访问Endpoint，假设是 oss-xxx.aliyuncs.com，则地区为oss-xxx
- 自定义节点：上述的Endpoint
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

然后点击确定并设为默认图床即可。

大功告成！之后只需要在“上传区”页面就可以一键上传图片并复制链接了。

## 题外话

目前全站图片都已更换为阿里云oss存储，不得不说速度是真的快。

还有这大概是我目前图最多的一篇博文了吧。
