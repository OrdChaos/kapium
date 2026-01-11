近来无事，想着博客推流时的指令有好几条，于是决定写一个小工具简化这个流程<!-- more --><span class="heimu" title="你知道的太多了">这甚至是我第一个实用性的程序</span>

## 在此之前

我的博客配置好后每次从本地推送源码的指令有四条：
```shell
git pull origin master
git add .
git commit -m"xxxxxx"
git push origin master
```
这四条指令都在本地执行，所以每次推流都需要依次输入，而这显然是不方便的，于是我就想写一个能够自动执行这四条指令的工具。

## 程序设计

很简单，我们可以使用system()函数，其原型如下：
```cpp
int system(const char *command);
```
给函数传入字符串型的命令行参数就可以在程序中执行命令，于是很容易想到执行这三条命令的代码：
```cpp
system("git pull origin master");
system("git add .");
//怎么样获取需要的commit呢？
system("git push origin master");
```
这样除了commit提交外，其他的指令都可以自动执行。但这肯定是不完善且不可用的，因为commit的提交信息需要在`git add`与`git push`之间确定而不能在`git push`之后。

于是我们需要在程序中获取commit信息，这样就可以在`git add`之后自动执行commit提交指令。很容易我们就可以想到一种方法：
```cpp
string commit;
getline(cin, commit);
string commitInput = "git commit -m\"" + commit + "\"";
system(commitInput.c_str());
```
但我认为这样还不够简洁，我们需要的是一行可以直接推流的指令而不是一个需要用户输入的软件，所以我们需要另一种方式——获取命令行。

### 获取命令行

一般的c++程序中，我们的main函数都是这样定义的：
```cpp
int main(void) {
    //...
}
```
但为了获取命令行参数，我们就需要像这样定义：
```cpp
int main(int argc, char **argv) {
    //...
}
```
其中，argc是命令行参数的个数，argv则是一个指针数组，每个指针指向一个字符串，每个字符串是一个命令行参数。当我们执行一个可执行文件时，若是只在命令提示符中输入可执行文件的文件名，像这样：
```shell
BlogPusher
```
那么argc的值就是1，而argv&#91;0&#93;的值就是BlogPusher，而若是在命令提示符中输入可执行文件的文件名和参数，像这样：
```shell
BlogPusher Update About
```
此时argc的值就是3，argv&#91;0&#93;的值仍是BlogPusher，但后面argv&#91;1&#93;的值则会是Update，argv&#91;2&#93;的值是About。

所以，我们就可以这样获取到我们需要的commit信息了。

### Commit信息处理

光是获取还不够，现在我们需要处理我们获取到的参数。在刚刚的例子中，我们可以看到argv数组的分割是以空格为基础的，但commit中可以包含空格，这就使得直接使用argv&#91;1&#93;是不可行的。

所以，我们需要一种方法来处理commit信息，使其可以正确包含空格。其实很简单，只需要加入一个循环，每次循环获取一个字符串并把它放入字符串commit中，在每一个字符串之间加入空格即可。
```cpp
string commit;
    string commit;
    for(int i = 1; i < argc; i++){
        commit += argv[i];
        if(i != argc - 1){
            commit += " ";
        }
    }
```
加了一个判断，使得程序不会给commit信息加入多余的空格。现在，commit信息就可以正确的包含空格了。

## 总结

所有程序合在一起差不多是这样：
```cpp
#include <iostream>
using namespace std;

int main(int argc, char** argv){
    string commit;
    for(int i = 1; i < argc; i++){
        commit += argv[i];
        if(i != argc - 1){
            commit += " ";
        }
    }
    string commitInput = "git commit -m\"" + commit + "\"";
    system("git pull origin master");
    system("git add .");
    cout<<"git add success"<<endl;
    system(commitInput.c_str());
    system("git push origin master");
    return 0;
}
```
编译，放入博客源码文件夹下。注意此时不要忘记在.gitignore中添加一行`blogpusher.*`，防止git上传时上传blogpusher文件。

在命令提示符中输入`blogpusher Update .gitignore`，测试一下，非常完美！

最后优化一下，差不多像这样：
```cpp
#include <iostream>
using namespace std;

int main(int argc, char** argv){
    string commit;
    for(int i = 1; i < argc; i++){
        commit += argv[i];
        if(i != argc - 1){
            commit += " ";
        }
    }
    string commitInput = "git commit -m\"" + commit + "\"";
    cout<<"==========BEGIN PULL=========="<<endl;
    system("git pull origin master");
    cout<<"==========BEGIN ADD=========="<<endl;
    system("git add .");
    cout<<"git add success"<<endl;
    cout<<"==========BEGIN COMMIT=========="<<endl;
    system(commitInput.c_str());
    cout<<"==========BEGIN PUSH=========="<<endl;
    system("git push origin master");
    return 0;
}
```
大功告成！

## 题外话
这个东西很早就想做了的说......现在做出来了还是十分欣慰。

程序已经开源到了[github](https://github.com/OrdChaos/BlogPusher)，欢迎查看。若是帮到了您的话，麻烦点个star，谢谢。