本来一直在用阿里云的企业邮箱，但感觉总是不太好，主要每次都需要进`https://qiye.aliyun.com`登录。于是趁着黑色星期五[RackNerd](https://racknerd.com/)的优惠，搞了一台vps来搭电子邮局（如果你想搭建，请确认服务器是否支持rDNS以及是否开启25端口）。

<!--more-->

配置如下（年付$10.28）

| 硬件 | 配置  |
| :--: | :---: |
| CPU  |  1核  |
| RAM  | 768MB |
| SSD  | 10GB  |
| 流量 |  1TB  |

还是比较磕碜的，不过价格在这，无所谓了。

## 经历

首先，我需要为vps开通rDNS记录到`mx.ordchaos.com`上。后台可以自主设置，很方便......

![bang!](https://img.ordchaos.com/img/2022/11/319d4fa4d25c91e5fd4872d6004fac01.png)

好，很好，我沉得住气。发个工单问一下：

![工单截图](https://img.ordchaos.com/img/2022/11/497f1f27397c268b35dcccd1fd6c274c.png)

哦！原来如此！好的，继续交流后，rDNS设置成功，但然而我却发现无法访问？！一番探查之后，发现这样一个事实——被墙啦！

于是只得继续发工单：

![](https://img.ordchaos.com/img/2022/11/132fdf9f0fb03dbdd0298117cc331d30.png)

终于搞定。

## Mailu.io部署

### 设置主机名

在vps的bash中输入：

```shell
nano /etc/hosts
```

在其中具有服务器ip地址的一行中，将后面的内容改为（假设你的域名是`example.com`，服务器ip是`88.88.88.88`）：

```txt
88.88.88.88    mx.example.com   mx
```

编辑好后，在vps中执行：

```shell
echo "mx" > /etc/hostname
hostname -F /etc/hostname
```

这样就设置好了主机名，可以通过`hostname`命令确认是否设置成功：

```shell
hostname
hostname -f
```

前者只会输出`mx`，后者则会输出`mx.example.com`。如果不是，那就是设置错了。

### 设置DNS解析

去你的域名DNS解析服务商，设置以下DNS解析（假设你的域名是`example.com`，服务器ip是`88.88.88.88`）：

|           主机名           | 解析类型 |                             内容                             |
| :------------------------: | :------: | :----------------------------------------------------------: |
|             @              |    A     | （如果已有解析就不管，没有就解析到127.0.0.1，注意不能有CNAME记录） |
|             mx             |    A     |                         88.88.88.88                          |
|             @              |    MX    |                 mx.example.com（优先级为10）                 |
|             @              |   TXT    |               v=spf1 mx a:mx.example.com ~all                |
|           _dmarc           |   TXT    | v=DMARC1; p=reject; rua=mailto:admin@example.com; ruf=mailto:admin@example.com; adkim=s; aspf=s |
| example.com._report._dmarc |   TXT    |                           v=DMARC1                           |

然后去vps服务商，设置rDNS（或者叫做PTR）解析，将`88.88.88.88`解析到`mx.example.com`

### 获取配置

访问Mailu.io的配置生成网页：[https://setup.mailu.io](https://setup.mailu.io/)

![](https://img.ordchaos.com/img/2022/11/f467bf5ab91b12fdef1b84d6e2239b05.png)

写文时最新版本为1.9，保持不变。下方部署方式选择Compose.

![](https://img.ordchaos.com/img/2022/11/fb64a5b8475dd80944f74acbd558a224.png)

- 1：在此处填写自己的域名

- 2：自己起个名字（如“序炁的电子邮局”）

- 3：若你的域名为`example.com`，则在此处填写`https://mx.example.com`

- 4：点击勾选

![](https://img.ordchaos.com/img/2022/11/85105d9d486d31bb37aa25f69ef7376d.png)

- 1：推荐选择rainloop，更加现代好看

- 2：填写自己vps的ip地址

- 3：若你的域名为`example.com`，则在此处填写`mx.example.com`

最后，你会看到如下界面：

![](https://img.ordchaos.com/img/2022/11/decae2b8f721e07d24f8c7ef1b7ea38c.png)

照着界面的指示，回到vps执行指令：

```shell
mkdir /mailu
cd /mailu
```

然后回到刚刚的页面，下载配置文件：

```shell
wget http://setup.mailu.io/1.7/file/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/docker-compose.yaml
wget http://setup.mailu.io/1.7/file/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/mailu.env
```

最后执行（假设你的域名是`example.com`，密码设置为`PASSWORD`）：

```shell
docker-compose -p mailu up -d
docker-compose -p mailu exec admin flask mailu admin admin example.com PASSWORD
```

就安装完成了。

### 配置

在浏览器中访问`https://mx.example.com`登录您的管理员面板:

![管理员面板](https://img.ordchaos.com/img/2022/11/bb36706e2cf80fc26e6f1baa7bac5636.png)

使用账号`admin@example.com`和密码`PASSWORD`登录即可（假设你的域名是`example.com`，密码设置为`PASSWORD`）。

然后点击左侧的“邮件域”：

![](https://img.ordchaos.com/img/2022/11/0dbf970ce24ab1f18381955949ff2acf.png)

然后点击如下的按钮：

![](https://img.ordchaos.com/img/2022/11/ff977f14b7bc7c6775de3dcd3a0538f9.png)

在新界面中点击“生成密钥”，然后复制dkim配置：

```txt
dkim._domainkey.example.com. 600 IN TXT "v=DKIM1; k=rsa; p=xxxxxxxxxxxxxxxxxxxxxxxxxxxx" "xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

进行域名解析即可。

### 创建账号

邮件域>用户>添加用户，按需配置即可。

## 使用

退出管理员账号，访问`https://mx.example.com/webmail`，登录即可（选择“登录Webmail”）。

![主页面](https://img.ordchaos.com/img/2022/11/bbd43555ba6226a01d53b697174f8742.png)

## 测试

在[MailTester](https://www.mail-tester.com/)上可以进行测试，如下是我测试结果：

![](https://img.ordchaos.com/img/2022/11/84baf936fcbe9b4663cabce5a51252e0.png)

很完美了，对吧（

<span class="heimu" title="你知道的太多了">以前没有超过8过</span>

## 题外话

完成了很久以前的夙愿。

欢迎跟着做一遍哦！也欢迎提问！

## 2024.2.12 更新

用一段时间后服务器会出现403，此时重启docker即可。

有关于自动重启，参考这篇文章：[使用Github Action定时重启邮件服务](https://www.ordchaos.com/posts/e9c784c5/)