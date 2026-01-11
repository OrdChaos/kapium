购买了[十年之约](https://www.foreverblog.cn/)的优惠价[硅云](https://www.vpsor.cn/)虚拟主机用于加速访问，记录一下部署过程。

<!--more-->

## 前提条件

你需要已经配置好了GitHub Action的Hexo自动部署，若是没有，推荐观看以下文章：

- [GitHub Actions 来自动部署 Hexo](https://zhuanlan.zhihu.com/p/170563000)
- [Github Actions 初体验之自动化部署 Hexo 博客](https://razeen.me/posts/use-github-action-to-deploy-your-hexo-blog/)
- [hexo配合github action 自动构建（多种形式）](https://segmentfault.com/a/1190000040767893)

这里就不讲了。

## 编辑Action

打开`(本地博客仓库目录)/.github/workflows/(Action配置文件).yml`，在最后添加：

```yaml
- name: Deploy Files on Ftp Server
  uses: SamKirkland/FTP-Deploy-Action@4.3.0
  with:
    server: (FTP服务器地址)
    username: (FTP用户名)
    password: (FTP密码)
    local-dir: ./public/
    server-dir: (FTP服务器文件目录)
    port: (FTP服务器端口，一般是21)
```

将括号及内部内容换成自己的信息即可。

这里的方法是使用ftp来上传文件到虚拟主机，是对于所有虚拟主机而言最通用的一种方式了。`./public`是Hexo默认的静态文件生成本地地址，无需更改。

最后推流到GitHub即可使用。

## 题外话

本来以为挺复杂，结果就这么点。

最开始使用的是`hexo-deployer-ftpsync`插件，结果却根本无法正常使用，于是便转为使用docker镜像。

对了，如果有兴趣购买硅云的主机，那请帮个小忙，用我的邀请链接注册吧：[邀请链接](https://www.vpsor.cn?userCode=jh1e1af)

那就这样，886
