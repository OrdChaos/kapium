之前介绍了数组队列的实现方法，若是没有看过建议[去看看](https://www.ordchaos.com/posts/da7075f0/)，这次来介绍如何用链表实现队列。
<!-- more -->

## 概念引入
首先让我们了解一下什么是链表：
> 链表是一种物理存储单元上非连续、非顺序的存储结构，数据元素的逻辑顺序是通过链表中的指针链接次序实现的。链表由一系列结点（链表中每一个元素称为结点）组成，结点可以在运行时动态生成。每个结点包括两个部分：一个是存储数据元素的数据域，另一个是存储下一个结点地址的指针域。  
> ——百度百科 [链表](https://baike.baidu.com/item/%E9%93%BE%E8%A1%A8/9794473)

所以，首先我们需要定义一个链表出来。

## 结构搭建

其实基本一样，不过这次要定义两个结构，一个是节点，一个是队列本身:
```cpp
struct node {
    int v;
    node * next;
};

struct myqueue {
    node * first;
    node * last;
};
```
对于每一个节点，我们需要它储存一个数据与其下一个节点的地址，分别储存在int型变量v与node型指针next中。

而后对于每一个队列或者是链表，我们需要储存其第一个与最后一个节点的地址，分别放在first与last中。

结构体定义完后，同样的初始化：
```cpp
void init(myqueue *t) {
    t->first = t->last = NULL;
    return;
}
```
这里让队列的首项与尾项同时为NULL，完成初始化

之后是数据操作的isempty函数，先行判断队列是否为空:
```cpp
bool isempty(myqueue *t) {
    if(t->last == NULL && t->first == NULL) return 1;
    else return 0;
}
```
原理很简单，如果队列的尾项与首项都为NULL，则显然此队列为空。

之后是push函数，将一个数据推入队列的最后:
```cpp
void push(myqueue *t, int s) {
    node * temp = new node;
    if(isempty(t)) t->first = t->last = temp;
    else {
        t->last->next = temp;
        t->last = t->last->next;
    }
    temp->v = s;
    return;
}
```
创建一个空节点，如果队列为空，则作为首项与尾项，否则作为尾项的下一项，然后给其赋值即可。

第二个是pop函数，删除队列首项，注意先判断队列是否为空：
```cpp
void pop(myqueue *t) {
    if(isempty(t)) return;
    if(t->first == t->last) {
        free(t->first);
        init(t);
    } else {
        node * temp = t->first;
        t->first = t->first->next;
        free(temp);
    }
    return;
}
```
若pop完队列为空则调用init函数重新化为空队列，否则将首项改为首项的下一项，但记住无论如何都要调用free函数释放原先首项的空间，节省内存。

再就是获取队列的首项、尾项、第n项以及长度，代码相对简单：
```cpp
int getf(myqueue *t) {
    if(!isempty(t)) return t->first->v;
    else return 0;
}

int getl(myqueue *t) {
    if(!isempty(t)) return t->last->v;
    else return 0;
}

int getlength(myqueue *t) {
    if(isempty(t)) return 0;
    int length;
    node * temp = t->first;
    for(length = 1;;length++) {
        if(temp == t->last) break;
        temp = temp->next;
    }
    return length;
}
```
特别注意若队列为空，则不应当返回队列所谓的首项与尾项。

对于长度的获取，只需要遍历整个队列，直到搜索到队列尾项再输出长度即可。

## 解决问题

与之前的问题是一样的，搭建的框架也很相似，故而解答同样基本一致。

### 问题背景
有n(n <= 100)个小朋友排队打针，他们每个人都有依次自己的编号为1, 2, 3, 4, ......, n。他们都很害怕打针，所以当排在自己前面的小朋友打针时就会跑走到队伍最后。试设计一程序，输入小朋友数量，输出他们打针的顺序。

样例输入：5
样例输出：1 3 5 4 2

### 问题分析

略，可以参考[之前的文章](https://www.ordchaos.com/posts/da7075f0/)。

注意这一次是使用指针来访问队列的，故而此次的程序与上次有略微区别。

代码如下：
```cpp
int main() {
    myqueue test;
    init(&test);
    int n;
    cin>>n;
    for(int i = 1;i <=n;i++) push(&test, i); //编号依次入队
    for(int i = 1;!isempty(&test);i++) {
        if(i%2 == 0) { //如果是第偶数个打针的，排到最后
            int temp = getf(&test);
            pop(&test);
            push(&test, temp);
        }
        else { //如果是第奇数个打针的，输出后出队
            cout<<getf(&test)<<" ";
            pop(&test);
        }
    }
    return 0;
}
```

## queue类型

这里对于队列的编写其实还是为了学习与方便理解，事实上可以方便的在引用了头文件queue后直接定义队列，更加方便，竞赛或开发时也更加节省时间。

使用格式如下：
```cpp
#include <queue> //引用头文件，若使用万能库可忽略
queue<int> Q; //定义一个int型队列，名称为Q，当然也可以是别的类型与别的名称
Q.empty(); //返回队列Q是否为空
Q.size(); //返回队列Q长度
Q.front(); //返回队列Q的第一个元素
Q.back(); //返回队列Q的最后一个元素
Q.push(); //在队列Q后面插入一个元素, 比如插入数字5: Q.push(5)
Q.pop(); //从队列Q里移出第一个元素
```

下面给出使用queue队列的同样问题的解答，请读者自行参考：
```cpp
int main() {
    queue<int> test;
    int n;
    cin>>n;
    for(int i = 1;i <=n;i++) test.push(i);
    for(int i = 1;!test.empty();i++) {
        if(i%2 == 0) {
            int temp = test.front();
            test.pop();
            test.push(temp);
        }
        else {
            cout<<test.front()<<" ";
            test.pop();
        }
    }
    return 0;
}
```

## 总结

本次完整代码如下：
```cpp
#include<bits/stdc++.h>
using namespace std;

struct node {
    int v;
    node * next;
};

struct myqueue {
    node * first;
    node * last;
};

void init(myqueue *t) {
    t->first = t->last = NULL;
    return;
}

bool isempty(myqueue *t) {
    if(t->last == NULL && t->first == NULL) return 1;
    else return 0;
}

void push(myqueue *t, int s) {
    node * temp = new node;
    if(isempty(t)) t->first = t->last = temp;
    else {
        t->last->next = temp;
        t->last = t->last->next;
    }
    temp->v = s;
    return;
}

void pop(myqueue *t) {
    if(isempty(t)) return;
    if(t->first == t->last) {
        free(t->first);
        init(t);
    } else {
        node * temp = t->first;
        t->first = t->first->next;
        free(temp);
    }
    return;
}

int getf(myqueue *t) {
    if(!isempty(t)) return t->first->v;
    else return 0;
}

int getl(myqueue *t) {
    if(!isempty(t)) return t->last->v;
    else return 0;
}

int getlength(myqueue *t) {
    if(isempty(t)) return 0;
    int length;
    node * temp = t->first;
    for(length = 1;;length++) {
        if(temp == t->last) break;
        temp = temp->next;
    }
    return length;
}

int main() {
    myqueue test;
    init(&test);
    int n;
    cin>>n;
    for(int i = 1;i <=n;i++) push(&test, i); //编号依次入队
    for(int i = 1;!isempty(&test);i++) {
        if(i%2 == 0) { //如果是第偶数个打针的，排到最后
            int temp = getf(&test);
            pop(&test);
            push(&test, temp);
        }
        else { //如果是第奇数个打针的，输出后出队
            cout<<getf(&test)<<" ";
            pop(&test);
        }
    }
    return 0;
}

/* 使用queue队列的版本
int main() {
    queue<int> test;
    int n;
    cin>>n;
    for(int i = 1;i <=n;i++) test.push(i);
    for(int i = 1;!test.empty();i++) {
        if(i%2 == 0) {
            int temp = test.front();
            test.pop();
            test.push(temp);
        }
        else {
            cout<<test.front()<<" ";
            test.pop();
        }
    }
    return 0;
}
*/
```
