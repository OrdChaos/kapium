## 起因

Google Play的版本更新总是慢一些，不知道你行不行，但是我是忍不了别人都玩上了新曲而我却还不能玩的感觉，遂决定迁移存档。

## 过程

大体参考这一篇文章[Phigros存档跨版本转移教程（免root）](https://www.bilibili.com/read/cv13597100)即可，在这里稍微提一下我遇到的问题

### 解决问题

在使用abe.jar时，Java报错：

```shell
Error: A JNI error has occurred, please check your installation and try again
```

首先在网上查询，找到的第一个方法是删除电脑里共存的JDK，只留下一个，使`java -version`与`javac -version`有相同的版本。

我照做，删除了java8，只留下了openjdk17，但是毫无卵用。

于是我继续查询，发现在[跨！系！统！转！移！支持安卓和IOS的跨系统存档转移工具！Phigros 存档 IOS 跨系统 备份 还原 转移 同步](https://www.bilibili.com/video/av344511919)这一视频中所提供的工具里的abe.jar可用。

## 总结

如果你也遇到了一样的问题，可以参考我的方法看看是否有效。

若不想下载整个备份工具而只想要abe.jar的话，可以从这里下载：[链接](https://www.lanzoui.com/i4D2S09yzwab)（如有侵权，请联系我删除）
