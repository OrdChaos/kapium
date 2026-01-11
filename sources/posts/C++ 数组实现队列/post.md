队列是常用的数据结构，是广度优先算法中不可或缺的一部分。队列一般使用数组或链表构建，这里会介绍使用数组实现队列的方法。
<!-- more -->

## 结构搭建

首先，定义队列结构：
```cpp
#define MAXSIZE 10000

struct myqueue {
    int first;
    int last;
    int v[MAXSIZE];
};
```
变量first指向首项，last指向尾项<span class="heimu" title="你知道的太多了">其实不是</span>，数据则存在数组v中。为了防止数据溢出，此时定义数组v的范围要尽量大，此处是10000。

再就是初始化队列：
```cpp
void init(myqueue &t) {
    t.first = t.last = 0;
    return;
}
```
让first与last都指向数组开头的第0项，很好理解。

之后，开始数据操作。第一个是push函数，将数值存入队列的最后：
```cpp
void push(myqueue &t, int s) {
    t.v[t.last] = s;
    t.last++;
    return;
}
```
注意将last指向后面一项，此时变量last始终指向队列最后一项的下一项，是一个空值。

第二个是pop函数，删除队列首项。不过这里有一个坑，如果队列为空删除便有可能出错，所以要先判断队列是否为空：
```cpp
bool isempty(myqueue &t) {
    if(t.last == t.first) return 1;
    else return 0;
}

void pop(myqueue &t) {
    if(isempty(t)) return;
    t.first++;
    return;
}
```
判断队列是否为空很简单，当first=last时，有队列为空(队列非空时，last在最后的数据项的后一位，所以first不可能等于last)。

pop时只需要移动首项的标识，避免了繁琐的数据移送，也无需置空数组的某一项，原因显而易见。但永远抛弃了一部分内存，故而要小心溢出。

再就是获取队列的首项、尾项、第n项以及长度，代码相对简单：
```cpp
int getf(myqueue t) {
    return t.v[t.first];
}

int getl(myqueue t) {
    return t.v[t.last - 1];
}

int getn(myqueue t, int n) {
    return t.v[t.first + n];
}

int getlength(myqueue &t) {
    return (t.last - t.first);
}
```
这里对于长度的获取需要说一下，理论上长度应当是(last - first + 1)，但这里last本身就是数据项的后一项，所以自然就省掉了。

## 解决问题

现在整个队列已经完全可用了，我们可以尝试用其解决一些实际问题。

### 问题背景
有n(n <= 100)个小朋友排队打针，他们每个人都有依次自己的编号为1, 2, 3, 4, ......, n。他们都很害怕打针，所以当排在自己前面的小朋友打针时就会跑走到队伍最后。试设计一程序，输入小朋友数量，输出他们打针的顺序。

样例输入：5
样例输出：1 3 5 4 2

### 问题分析

很显然，这样需要模拟过程的题目用队列解答会非常容易，直接使用队列出入队模拟这一过程即可。

代码如下：
```cpp
int main() {
    myqueue test;
    init(test);
    int n;
    cin>>n;
    for(int i = 1;i <=n;i++) push(test, i); //编号依次入队
    for(int i = 1;!isempty(test);i++) {
        if(i%2 == 0) { //如果是第偶数个打针的，排到最后
            int temp = getf(test);
            pop(test);
            push(test, temp);
        }
        else { //如果是第奇数个打针的，输出后出队
            cout<<getf(test)<<" ";
            pop(test);
        }
    }
    return 0;
}
```
代码比较简单，关键还是在于前面对整个队列结构的搭建。

## 总结

队列的用处非常大，后面广度优先算法也会用到，建议多理解、多练习，掌握的越熟练越好。

本次完整代码如下：
```cpp
#include <bits/stdc++.h>
using namespace std;

#define MAXSIZE 10000

struct myqueue {
    int first;
    int last;
    int v[MAXSIZE];
};

void init(myqueue &t) {
    t.first = t.last = 0;
    return;
}

bool isempty(myqueue &t) {
    if(t.last == t.first) return 1;
    else return 0;
}

void push(myqueue &t, int s) {
    t.v[t.last] = s;
    t.last++;
    return;
}

void pop(myqueue &t) {
    if(isempty(t)) return;
    t.first++;
    return;
}

int getf(myqueue t) {
    return t.v[t.first];
}

int getl(myqueue t) {
    return t.v[t.last - 1];
}

int getn(myqueue t, int n) {
    return t.v[t.first + n];
}

int getlength(myqueue &t) {
    return (t.last - t.first);
}

int main() {
    myqueue test;
    init(test);
    int n;
    cin>>n;
    for(int i = 1;i <=n;i++) push(test, i); //编号依次入队
    for(int i = 1;!isempty(test);i++) {
        if(i%2 == 0) { //如果是第偶数个打针的，排到最后
            int temp = getf(test);
            pop(test);
            push(test, temp);
        }
        else { //如果是第奇数个打针的，输出后出队
            cout<<getf(test)<<" ";
            pop(test);
        }
    }
    return 0;
}
```