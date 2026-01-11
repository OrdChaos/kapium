马上就是今年的CSP-J了，一想起自己还有那么多数据结构没学就有点头皮发麻......这篇博文里我就来讲一下堆\(Heap\)，一是方便他人，二是给自己巩固思路。

<!--more-->

## 讲解

按照惯例<span class="heimu" title="你知道的太多了">哪里来的惯例</span>，还是看一下堆是什么东西：

> 堆（heap）是计算机科学中一类特殊的数据结构的统称。堆通常是一个可以被看做一棵树的数组对象。堆总是满足下列性质：
>
> - 堆中某个结点的值总是不大于或不小于其父结点的值；
> - 堆总是一棵完全二叉树。
>
> 将根结点最大的堆叫做最大堆或大根堆，根结点最小的堆叫做最小堆或小根堆。
>
> ——百度百科 [堆](https://baike.baidu.com/item/%E5%A0%86/20606834)

很显然，为了储存堆，我们需要一棵完全二叉树。这里很多人就会想到建树，但其实不用。如果你看过我的[学习笔记——二叉树](https://www.ordchaos.com/posts/340b325e/)的话，应该会记得完全二叉树的性质之一：

>在有n个节点的完全二叉树中，对于编号为i的节点：
>
>- 若 $ i=1 $ ，则其无父节点，为根节点，否则其父节点编号为 $ floor\left( \frac{i}{2} \right) $ 。
>- 若 $ 2i>n $ ，则i为叶节点，否则其左孩子的编号为2i。
>- 若 $ 2i<n<2i+1 $ ，则i无右孩子，否则其右孩子的编号为2i+1。
>
>——序炁 [学习笔记——二叉树](https://www.ordchaos.com/posts/340b325e/)

所以我们只需要一个数组就可以存储堆了：数组最开始填入根节点，其左右孩子节点便依次为其后面的两个下标，再往后就以此类推。

那么现在建立一个数据结构用来建堆，很简单，参照下列代码：

```cpp
#define MAXSIZE 100000

struct myHeap {
  int value[MAXSIZE];
  int length;
};
```

对于每一个堆都申请一个MAXSIZE大小的数组用于存储，而后用length变量存储目前的总节点数即可。

那么如何初始化就显而易见，只需要

```cpp
inline void init(myHeap &heap) {
    heap.length = 0;
    return;
}
```

像这样将length设为0就大功告成。

### 插入元素

如果要往一个堆里插入元素，那我们就要先确定这个堆是小根堆还是大根堆，下面的所有代码均默认是小根堆，大根堆~~自己改去~~自己想想吧。

首先，在堆末尾加入要插入的元素：

```cpp
void push(myHeap &heap, int v) {
    heap.value[heap.length++] = v;
    //...
}
```

length永远指向数组中最后一个存储了数据的位置的下一个位置，所以在`value[length]`的位置存储数据，然后增加length即可。

但现在这个堆可能不满足小根堆的性质了，怎么办呢？很简单，进行调整即可。将新节点设为当前节点，如果它大于父节点则结束，若小于则交换，而后将交换后的父节点（没错，还是新插入的数据）设为当前节点，重复这个过程直到其大于父节点或其为根节点则结束。

听着有些复杂，但用while循环即可轻松实现：

```cpp
void push(myHeap &heap, int v) {
    //...
    int now = length;
    while(heap.value[now - 1] < heap.value[now / 2 - 1] && now != 1) {
        swap(heap.value[now - 1], heap.value[now / 2 - 1]);
        now /= 2;
    }
    return;
}
```

完事！

### 删除元素

删除元素即出队，会弹出根节点。故而这里的方法是把最后一个节点移到根节点的位置覆盖掉它，再进行调整。

覆盖很简单：

```cpp
void pop(myHeap &heap) {
    heap.value[0] = heap.value[--heap.length];
	//...
}
```

不要忘记将节点数减一即可。这里用了一个小技巧，本来要写成这样：

```cpp
heap.value[0] = heap.value[heap.length - 1];
heap.length--;
```

竞赛常考之一，`++i`与`i++`的区别。不要觉得没用，比如用在这里就非常合适。包括前面的

```cpp
heap.value[heap.length++] = v;
```

也用了这个方法。

好了，言归正传，下一步是调整节点。显然，这一次需要从上往下调整：将根节点设为当前节点，与自己左右孩子中较小的一个比较，若小于则结束，否则与其交换位置并将当前节点设为交换好的孩子节点（一样指向同样的数据），重复这个过程直到当前节点为叶节点或当前节点小于自己任何一个孩子为止。

同样，上代码：

```cpp
void pop(myHeap &heap) {
    //...
    int now = 1;
    while(2 * now <= heap.length) {
        int temp = 2 * now - 1;
        if(temp + 2 <= heap.length && heap.value[temp] > heap.value[temp + 1]) temp++;
        if(heap.value[now - 1] > heap.value[temp]) swap(heap.value[now - 1], heap.value[temp]);
        else break;
        now = temp + 1;
    }
    return;
}
```

需要额外注意的是对当前节点是否为叶节点以及是否拥有右孩子的判断，避免因失误导致数据溢出。

## 应用

其实堆的操作也只有插入与删除，不过就是这么简单的东西也可以玩出不同的花样，下面是两个例子。

### 洛谷 P1090 NOIP2004 提高组 合并果子

原题链接：[洛谷 P1090 NOIP2004 提高组 合并果子](https://www.luogu.com.cn/problem/P1090)

#### 题目描述

在一个果园里，多多已经将所有的果子打了下来，而且按果子的不同种类分成了不同的堆。多多决定把所有的果子合成一堆。

每一次合并，多多可以把两堆果子合并到一起，消耗的体力等于两堆果子的重量之和。可以看出，所有的果子经过n-1次合并之后，就只剩下一堆了。多多在合并果子时总共消耗的体力等于每次合并所耗体力之和。

因为还要花大力气把这些果子搬回家，所以多多在合并果子时要尽可能地节省体力。假定每个果子重量都为1，并且已知果子的种类 数和每种果子的数目，你的任务是设计出合并的次序方案，使多多耗费的体力最少，并输出这个最小的体力耗费值。

例如有3种果子，数目依次为1，2，9. 可以先将1、2堆合并，新堆数目为3，耗费体力为3. 接着，将新堆与原先的第三堆合并，又得到新的堆，数目为12，耗费体力为12。所以多多总共耗费体力为3+12=15。可以证明15为最小的体力耗费值。

#### 输入格式

共两行。

第一行是一个整数n(1≤n≤10000)，表示果子的种类数。

第二行包含n个整数，用空格分隔，第i个整数a<sub>i</sub>(1≤a<sub>i</sub>≤20000)是第i种果子的数目。

#### 输出格式

一个整数，也就是最小的体力耗费值。输入数据保证这个值小于2<sup>31</sup>.

#### 输入输出样例

输入

```shell
3
1 2 9
```

输出

```shell
15
```

#### 分析

简单的贪心算法，每次从所有果子中取两堆数量最小的合并，然后放回去即可。

不一定非要用堆，不过如果只是简单的排序的话会超时。不过你同样也可以用优先队列，或者看看洛谷上那些神犇的题解。

我的方法很简单，只需要建堆，然后从堆中取两个最小值（即小根堆堆顶元素）相加再插回去，直到只剩一个元素即可。其中每一次合并时用一个变量累计总体力，最后输出就行了。

代码如下：

```cpp
#include <bits/stdc++.h>
using namespace std;

#define MAXSIZE 100000

struct myHeap {
    int value[MAXSIZE];
    int length;
};

void push(myHeap &heap, int v) {
    heap.value[heap.length++] = v;
    int now = heap.length;
    while(heap.value[now - 1] < heap.value[now / 2 - 1] && now != 1) {
        swap(heap.value[now - 1], heap.value[now / 2 - 1]);
        now /= 2;
    }
    return;
}

void pop(myHeap &heap) {
    heap.value[0] = heap.value[--heap.length];
    int now = 1;
    while(2 * now <= heap.length) {
        int temp = 2 * now - 1;
        if(temp + 2 <= heap.length && heap.value[temp] > heap.value[temp + 1]) temp++;
        if(heap.value[now - 1] > heap.value[temp]) swap(heap.value[now - 1], heap.value[temp]);
        else break;
        now = temp + 1;
    }
    return;
}

inline int get(myHeap heap) {
    return heap.value[0];
}

int getPop(myHeap &heap) {
    int temp = get(heap);
    pop(heap);
    return temp;
}

int main() {
    int n;
    cin>>n;
    int temp;
    myHeap test;
    test.length = 0;
    for(int i = 0;i < n;i++) {
        cin>>temp;
        push(test, temp);
    }
    int power = 0;
    while(test.length != 1) {
        int quick[2] = {getPop(test), getPop(test)};
        power += quick[0] + quick[1];
        push(test, quick[0] + quick[1]);
    }
    cout<<power<<endl;
    return 0;
}
```

其中`get`函数用于返回堆顶元素，不要也可以，毕竟很简单。

对于这一题是可以AC的，没有问题。

### 堆排序

既然小根堆的堆顶元素永远最小，那么只要每次都取出堆顶元素直到堆为空不就可以排序了吗？没错，这就是堆排序，时间复杂度为O(nlogn)，十分优秀。

代码我就不讲了，自己看吧：

```cpp
//...
int main() {
    int n;
    cin>>n;
    int temp;
    myHeap test;
    test.length = 0;
    for(int i = 0;i < n;i++) {
        cin>>temp;
        push(test, temp);
    }
    for(int i = 0; i < n; i++) cout<<getPop(test)<<" ";
    cout<<endl;
    return 0;
}
```

数据量大的时候可以考虑堆排序，因为堆排序的耗时主要在建堆上，建好堆后的调整实际上非常快。

## 题外话

终于写完了......写了我整整三小时啊！

明天大概也许会有一篇关于图的，以及一篇关于类的。

886！
