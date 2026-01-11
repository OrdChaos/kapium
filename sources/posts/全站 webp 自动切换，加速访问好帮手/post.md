原本博客用的都是普通图片，就算有懒加载，一堆圈圈一起转也惹人心烦。现在改为了原图/webp的自适应切换，效果好上不少。

<!--more-->

## 前期准备

首要任务是拿到webp格式的图片，这个看自己。像我用的vps上的[Lsky Pro](https://www.lsky.pro/)，本地存储。有高性能vps可以试试用[Webp-Server](https://webp.sh)配合。但我的轻量应用承受不起，遂作罢。改为了定时shell脚本，一分钟触发一次：

```shell
#!/bin/bash

find . -type f -iname "*.png" | while read file; do
    if [ ! -f "${file%.*}.webp" ]; then
        cwebp -q 85 "$file" -o "${file%.*}.webp"
    fi
done

find . -type f -iname "*.jpg" | while read file; do
    if [ ! -f "${file%.*}.webp" ]; then
        cwebp -q 85 "$file" -o "${file%.*}.webp"
    fi
done
    
find . -type f -iname "*.jpeg" | while read file; do
    if [ ! -f "${file%.*}.webp" ]; then
        cwebp -q 85 "$file" -o "${file%.*}.webp"
    fi
done
    
find . -type f -iname "*.tif" | while read file; do
    if [ ! -f "${file%.*}.webp" ]; then
        cwebp -q 85 "$file" -o "${file%.*}.webp"
    fi
done
```

脚本运行时会遍历自己所在的文件夹及其子文件夹，转换所有没有对应webp格式的图片（`png`，`jpg`、`jpeg`与`tiff`）为webp图片（原图还在，放心）。

这段脚本中使用了`cwebp`指令，它来源于`libwebp`。安装可以参考下方：

```shell
# 安装编译器以及依赖包
yum install -y gcc make autoconf automake libtool libjpeg-devel libpng-devel
# 请到官网下载最新版本，版本列表：https://storage.googleapis.com/downloads.webmproject.org/releases/webp/
wget https://storage.googleapis.com/downloads.webmproject.org/releases/webp/libwebp-1.2.4.tar.gz
# 解压
tar -zxvf libwebp-1.2.4.tar.gz
# 进入目录
cd libwebp-1.2.4
# 源代码安装环境检查
./configure
# 编译
make
# 安装
make install
```

安装过程中遇到问题请善用百度/Google，本人不对此负责（bushi

做好以上所有工作后，就可以开始下面的内容。

## Service Worker

### 安装

不知道是什么、如何部署的，可以看看CYF大佬的这两篇文章：

- [欲善其事，必利其器 - 论如何善用ServiceWorker](https://blog.eurekac.cn/p/c0af86bb.html)
- [SpeedUp!使用黑科技为你的网站提速](https://blog.eurekac.cn/p/d3c51290.html)

如果你已经部署了Service Worker就可以继续了。

### 脚本

添加一个监听器，监听`fetch`事件：

```javascript
self.addEventListener('fetch', async event => {
    //...
});
```

（或者在本来的监听器里面加上）

然后判断流量是否是对图站的请求，可以用一个if来判断：

```javascript
if(event.request.url.indexOf('your.image.site') !== -1) {
    var requestUrl = event.request.url;
    //...
}
```

`event.request.url`是请求的地址，用`indexOf()`方法来判断地址中是否包含图站地址，若不反回代表没有的-1即为是对图站的请求。

接下来判断浏览器是否支持webp图片，定义一个变量`supportsWebp`

```javascript
var supportsWebp = false;
if (event.request.headers.has('accept')){
	supportsWebp = event.request.headers
			.get('accept')
			.includes('webp');
}
```

如果可以获取到浏览器的Accept头，且头中包含`image/webp`，即为支持webp，否则为不支持。

然后就可以进一步处理了，若浏览器支持webp，则进行下一步：

```javascript
if (supportsWebp) {
    //...
}
else {
	console.log("[SW] Don't support webp image, skip " + requestUrl + " .");
}
```

然后获取请求的文件类型。最开始的脚本只支持`png`，`jpg`、`jpeg`与`tiff`这四种格式的图片，所以我们也只能篡改这四种格式图片的请求到webp图片上：

```javascript
var imageUrl = requestUrl.split(".");
if(imageUrl[imageUrl.length - 1] === 'jpg' || imageUrl[imageUrl.length - 1] === 'tif' || imageUrl[imageUrl.length - 1] === 'png' || imageUrl[imageUrl.length - 1] === 'jpeg') {
    var newUrl = requestUrl.replace(imageUrl[imageUrl.length - 1], 'webp');
    //...
}
```

`newUrl`中存储了新的请求地址，接下来对它发起请求即可：

```javascript
var newRequest = new Request(newUrl);
event.respondWith(fetch(newRequest));
console.log("[SW] Redirect " + requestUrl + " to " + newUrl + " .");
```

当请求完成并图片被完整下载以后，进行缓存，代码如下：

```javascript
event.waitUntil(
	fetch(newRequest).then(function(response) {
		if (!response.ok) throw new Error("[SW] Failed to load image: " + newUrl);
			caches.open(CACHE_NAME).then(function(cache) {
				cache.put(newRequest, response);
			});
	}).catch(function(error) {
        console.log(error);
	})
);
```

若获取失败则提示，成功则缓存。

最后，要打断之前的请求，避免降低速度，可以调用`event.stopImmediatePropagation()`方法打断原始请求。

最后完整代码如下：

```javascript
if(event.request.url.indexOf('img.ordchaos.com') !== -1) {
    var requestUrl = event.request.url;
    var supportsWebp = false;
    if (event.request.headers.has('accept')){
        supportsWebp = event.request.headers
                            .get('accept')
                            .includes('webp');
    }
    if (supportsWebp) {
        var imageUrl = requestUrl.split(".");
        if(imageUrl[imageUrl.length - 1] === 'jpg' || imageUrl[imageUrl.length - 1] === 'tif' || imageUrl[imageUrl.length - 1] === 'png' || imageUrl[imageUrl.length - 1] === 'jpeg'){
            var newUrl = requestUrl.replace(imageUrl[imageUrl.length - 1], 'webp');
            var newRequest = new Request(newUrl);
            event.respondWith(fetch(newRequest));
            console.log("[SW] Redirect " + requestUrl + " to " + newUrl + " .");
            event.waitUntil(
                fetch(newRequest).then(function(response) {
                    if (!response.ok) throw new Error("[SW] Failed to load image: " + newUrl);
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(newRequest, response);
                    });
                }).catch(function(error) {
                    console.log(error);
                })
            );
            event.stopImmediatePropagation();
            return;
        }
    }
    else {
        console.log("[SW] Don't support webp image, skip " + requestUrl + " .");
    }
}
```

你学会了吗？

## 测试

进入网站，若一切正常，当加载到一张图片时，控制台（`F12`打开）会提示`[SW] Redirect https://your.image.site/path/to/img.png to https://your.image.site/path/to/img.webp .`这样的信息。

要测试无webp支持的情景，则点击右上角的三个点。

![](https://img.ordchaos.com/img/2023/01/01562686a8db1bb30defe61ffa333bd1.png)

![](https://img.ordchaos.com/img/2023/01/372ab8df519f78c5d59ea93fcd4caf78.png)

选择更多工具，找到“渲染”并点击。

![](https://img.ordchaos.com/img/2023/01/6a65c870cbafb3f9f5743d96749c549a.png)

勾选“停用webp”即可。

此时，加载图片时会提示`[SW] Don't support webp image, skip https://your.image.site/path/to/img.png .`

可以试试我这里的这张图片：（图片来自CYF大佬的`Client Worker`项目的文档）

![](https://img.ordchaos.com/img/2023/01/9f2975321779cda14980431c4595bb37.jpg)

若浏览器支持webp则会显示`Webp Accept!`，否则为`Webp Reject!This is a jpg file.`

**(2024.08.03)** 现在支持avif则会优先显示`Avif Accept!`

## 题外话

刚刚放寒假，舒坦。

但与之对应，九上已经结束，还有一学期就中考。。。

加油！我可以的！

那就这样，886！

## 2024.08.03 更新

看了Heo的[实现全站图片使用avif格式，替代臃肿的webp教程](https://blog.zhheo.com/p/6a933575.html)，好吧，再换一下。

服务器上使用`cavif`工具转换图片格式，`service worker`上简单改一下就好。

参考：

`img2webp.sh`内容：

```shell
#!/bin/bash

convert_to_formats() {
    local file="$1"
    local base="${file%.*}"

    if [ ! -f "${base}.webp" ]; then
        cwebp -q 85 "$file" -o "${base}.webp"
    fi

    if [ ! -f "${base}.avif" ]; then
        cavif -Q 80 "$file" -o "${base}.avif"
    fi
}

find . -type f -iname "*.png" | while read file; do
    convert_to_formats "$file"
done

find . -type f -iname "*.jpg" | while read file; do
    convert_to_formats "$file"
done

find . -type f -iname "*.jpeg" | while read file; do
    convert_to_formats "$file"
done
```

`sw.js`重定向段：
```javascript
if (event.request.url.indexOf('img.ordchaos.com') !== -1) {
    var supportsWebp = false;
    var supportsAvif = false;
    if (event.request.headers.has('accept')) {
        var acceptHeader = event.request.headers.get('accept');
        supportsWebp = acceptHeader.includes('webp');
        supportsAvif = acceptHeader.includes('avif');
    }

    var imageUrl = requestUrl.split(".");
    var fileExtension = imageUrl[imageUrl.length - 1];

    if (fileExtension === 'jpg' || fileExtension === 'png' || fileExtension === 'jpeg') {
        var newUrl;
        if (supportsAvif) {
            newUrl = requestUrl.replace(fileExtension, 'avif');
            console.log("[SW] Redirect " + requestUrl + " to " + newUrl + " (AVIF).");
        } else if (supportsWebp) {
            newUrl = requestUrl.replace(fileExtension, 'webp');
            console.log("[SW] Redirect " + requestUrl + " to " + newUrl + " (WebP).");
        } else {
            console.log("[SW] Don't support AVIF or WebP, using original format for " + requestUrl + ".");
            newUrl = requestUrl;
        }

        var newRequest = new Request(newUrl);
        event.respondWith(
            fetch(newRequest)
                .then(function (response) {
                    if (!response.ok) throw new Error("[SW] Failed to load image: " + newUrl);
                    return caches.open(CACHE_NAME).then(function (cache) {
                        cache.put(newRequest, response.clone());
                        return response;
                    });
                })
                .catch(function (error) {
                    console.log(error);
                    return fetch(event.request);
                })
        );
        return;
    }
}
```