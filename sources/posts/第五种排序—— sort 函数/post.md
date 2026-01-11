上次讲了四种排序算法（没看过的点[这里](https://www.ordchaos.com/posts/6a062b97/)），但是在实际开发或是竞赛中可能没有足够的时间写出一个够用的排序函数，或是需要排序的并非数字，这时便是我们的大宝贝——std::sort\(\)函数登场的时候了。

<!--more-->

## 用法

需要先引用algorithm库，不过我更倾向于在竞赛时直接使用万能库节省记忆时间。然后，需要使用std命名空间，或是直接调用std::sort()。

sort\(\)函数的原型如下：

```cpp
template <class RandomAccessIterator>
void sort(RandomAccessIterator first, RandomAccessIterator last);

template <class RandomAccessIterator, class Compare>
void sort(RandomAccessIterator first, RandomAccessIterator last, Compare comp);
```

对，std::sort()是重载函数，其中包含了是否存在comp的两种版本。std::sort()函数默认从小到大按字典顺序对数据进行排序，用法如下：

```cpp
int arr[10] = {12, 10, 48, 28, 22, 33, 19, 13, 27, 38};
std::sort(arr, arr + 10);
for(int i = 0;i < 10;i++) std::cout<<arr[i]<<" ";
```

此时std::sort()函数便会将arr[0]到arr[9]共10个元素进行排列并放回arr数组，所以上述程序运行结果如下：

```shell
10 12 13 19 22 27 28 33 38 48
```

很容易就可以想到，对吧。

## 进阶

### 使用std::sort()对各类普通变量排序

#### 对std::string类型变量排序

前面提到了，std::sort()会对数组使用字典序从小到大排序，所以结果就很容易预想到。

看下列程序：

```cpp
std::string arr[10] = {"apple", "Apple", "APPLE", "zen", "ordchaos", "OrdChaos", "happy", "x-ray", "xyz", "123aa"};
std::sort(arr, arr + 10);
for(int i = 0;i < 10;i++) std::cout<<arr[i]<<" ";
```

想一想，结果会如何？

结果：<span class="heimu" title="没做出来就不要偷看哦">123aa APPLE Apple OrdChaos apple happy ordchaos x-ray xyz zen</span>

怎么样，是不是很简单。这种对std::sort()的使用方式可以做按照字母序排列姓名的题目，但是如果题目要求按长度排序怎么办？别着急，慢慢往下看。

#### 使用comp自定义排序顺序

刚刚说过，std::sort()是一个重载函数，有一个含有comp的变体，那么，comp是什么？用来干什么呢？简单来说，comp就是一个返回值为bool类型的函数，在这个函数里你可以自定义sort排序的顺序。这样说你可能不理解，那就来看看下面这个例子：

```cpp
bool cmp(int a, int b) {
    return a > b;
}

int main() {
    int arr[2][10] = {{12, 10, 48, 28, 22, 33, 19, 13, 27, 38},{12, 10, 48, 28, 22, 33, 19, 13, 27, 38}};
	std::sort(arr[0], arr[0] + 10);
    std::sort(arr[1], arr[1] + 10, cmp);
	for(int i = 0;i < 10;i++) std::cout<<arr[0][i]<<" ";
    std::cout<<std::endl;
    for(int i = 0;i < 10;i++) std::cout<<arr[1][i]<<" ";
    return 0;
}
```

在这里我定义了bool类型函数cmp()，其中若a>b则返回true，否则为false。然后两次调用std::sort()，分别为两个一模一样的数组arr[0]与arr[1]排序，不同的是第二次使用了我们定义的cmp()，那么，结果如何呢？

```shell
10 12 13 19 22 27 28 33 38 48 
48 38 33 28 27 22 19 13 12 10 
```

没错，第二次排序变为了从大到小排序。利用这种方法，我们就可以轻松解决刚刚的问题，像这样：

```cpp
bool cmp(std::string a, std::string b) {
    return a.length() < b.length();
}
```

把这个函数加入刚刚的程序，再次调用std::sort()，只不过要加入参数cmp。很容易想到结果如下：

（动动脑哦）<span class="heimu" title="自己动动脑">zen xyz apple Apple APPLE happy x-ray 123aa ordchaos OrdChaos</span>

#### 对std::string类型变量内部进行排序

联想到可以通过类似于str[i]的方式来访问字符串内字符，自认可以写出使用std::sort()排序字符串内字符的方法：

```cpp
std::string str = "rhuMJKhwHefJkUIGuw394y49h";
std::sort(str.begin(), str.end());
```

注意这里必须使用str.begin()与str.end()作为参数而非str与str+str.str.length()。

结果也就是可以料想的，编译运行，程序输出如下：

```shell
34499GHIJJKMUefhhhkruuwwy
```

整 整 齐 齐.jpg

利用comp同样可以实现逆序排序，那就请你自己想想怎么写吧！

### 使用std::sort()对结构体进行排序

设想一个场景，有一个结构体叫做student，其中含有单个学生的姓名和成绩。这时该如何通过学生成绩对学生姓名进行排序呢？这里用std::sort()就会使最快的方法。

先定义结构体：

```cpp
struct student {
	string name;
	int score;
};
```

然后写出对应的comp：

```cpp
bool cmp(student a, student b) {
	return a.score > b.score;
}
```

之后直接调用std::sort()就可以了，合起来代码如下：

```cpp
#include<bits/stdc++.h>
using namespace std;

struct student {
	string name;
	int score;
};

bool cmp(student a, student b) {
	return a.score > b.score;
}

int main() {
	student stu[3] = {(student){"Tony", 98}, (student){"Betty", 97}, (student){"Lucy", 99}};
	sort(stu,stu+3,cmp);
	for(int i=0;i<3;i++){
		cout<<stu[i].name<<endl;
	}
	return 0;
}
```

输出可以料想：

```shell
Lucy
Tony
Betty
```

这样做的好处是方便拓展，比如说现在结构体变了，存在四个科目的成绩与学生姓名，要求按平均分排序，从之前的程序上修改会非常容易：

```cpp
#include<bits/stdc++.h>
using namespace std;

struct student {
	string name;
	int chinese;
    int math;
    int english;
    int programming;
};

bool cmp(student a, student b) {
	return (a.chinese + a.math + a.english + a.programming)/4 > (b.chinese + b.math + b.english + b.programming)/4;
}

int main() {
	student stu[3] = {(student){"Tony", 98, 96, 100, 95}, (student){"Betty", 97, 80, 99, 95}, (student){"Lucy", 99, 96, 90, 100}};
	sort(stu,stu+3,cmp);
	for(int i=0;i<3;i++){
		cout<<stu[i].name<<endl;
	}
	return 0;
}
```

这时结果就会变为`Tony Lucy Betty`的顺序。比起手写排序，这种情景使用std::sort()会方便不少。

## 做道题吧

洛谷：[P1093 NOIP2007 普及组 奖学金](https://www.luogu.com.cn/problem/P1093)

### 题目描述

某小学最近得到了一笔赞助，打算拿出其中一部分为学习成绩优秀的前5名学生发奖学金。期末，每个学生都有3门课的成绩:语文、数学、英语。先按总分从高到低排序，如果两个同学总分相同，再按语文成绩从高到低排序，如果两个同学总分和语文成绩都相同，那么规定学号小的同学排在前面，这样，每个学生的排序是唯一确定的。

任务：先根据输入的3门课的成绩计算总分，然后按上述规则排序，最后按排名顺序输出前五名名学生的学号和总分。注意，在前5名同学中，每个人的奖学金都不相同，因此，你必须严格按上述规则排序。例如，在某个正确答案中，如果前两行的输出数据(每行输出两个数:学号、总分) 是:

```shell
77 279279
55 279279
```

这两行数据的含义是:总分最高的两个同学的学号依次是7号5号。这两名同学的总分都是279(总分等于输入的语文、数学、英语三科成绩之和)，但学号为7的学生语文成绩更高一些。如果你的前两名的输出数据是:

```shell
55 279279
77 279279
```

则按输出错误处理，不能得分。

### 输入格式

共n+1行。

第1行为一个正整数n（n≤300），表示该校参加评选的学生人数。

第2到n+1行，每行有3个用空格隔开的数字，每个数字都在0到100之间。第j行的3个数字依次表示学号为j-1的学生的语文、数学、英语的成绩。每个学生的学号按照输入顺序编号为1~n（恰好是输入数据的行号减1）。

所给的数据都是正确的，不必检验。

### 输出格式

共5行，每行是两个用空格隔开的正整数，依次表示前5名学生的学号和总分。

### 输入输出样例

#### 输入1

```shell
6
90 67 80
87 66 91
78 89 91
88 99 77
67 89 64
78 89 98
```

#### 输出1

```shell
6 265
4 264
3 258
2 244
1 237
```

#### 输入2

```shell
8
80 89 89
88 98 78
90 67 80
87 66 91
78 89 91
88 99 77
67 89 64
78 89 98
```

#### 输出2

```shell
8 265
2 264
6 264
1 258
5 258
```

### 分析

这是一道很好的练习结构体的题，核心就是刚刚说的使用std::sort()函数对结构体进行排序，只不过这次的comp会复杂那么一点点。

结构体定义与comp大致如下：

```cpp
struct student {
    int num, chinese, math, english;
};

bool cmp(student a,student b) {
    if((a.chinese + a.math + a.english) > (b.chinese + b.math + b.english)) return 1;
    else if((a.chinese + a.math + a.english) < (b.chinese + b.math + b.english)) return 0;
    else {
        if(a.chinese > b.chinese) return 1;
        else if(a.chinese < b.chinese) return 0;
        else {
            if(a.num > b.num) return 0;
            else return 1;
        }
    }
}
```

剩下的部分就不必多说了吧，直接上代码：

```cpp
int main() {
    int n;
    std::cin>>n;
    student stu[n];
    for(int i = 0;i < n;i++) {
        stu[i].num = i + 1;
        std::cin>>stu[i].chinese>>stu[i].math>>stu[i].english;
    }
    std::sort(stu,stu + n,cmp);
    for(int i = 0;i < 5;i++) std::cout<<stu[i].num<<' '<<stu[i].chinese + stu[i].math + stu[i].english<<std::endl;
    return 0;
}
```

完成！

![](https://img.ordchaos.com/img/2022/08/d3ff6fda7f0dc6532149d422709d611f.png)

完整代码如下：

```cpp
#include<bits/stdc++.h>
using namespace std;

struct student {
    int num, chinese, math, english;
};

bool cmp(student a,student b) {
    if((a.chinese + a.math + a.english) > (b.chinese + b.math + b.english)) return 1;
    else if((a.chinese + a.math + a.english) < (b.chinese + b.math + b.english)) return 0;
    else {
        if(a.chinese > b.chinese) return 1;
        else if(a.chinese < b.chinese) return 0;
        else {
            if(a.num > b.num) return 0;
            else return 1;
        }
    }
}

int main() {
    int n;
    cin>>n;
    student stu[n];
    for(int i = 0;i < n;i++) {
        stu[i].num = i + 1;
        cin>>stu[i].chinese>>stu[i].math>>stu[i].english;
    }
    sort(stu,stu + n,cmp);
    for(int i = 0;i < 5;i++) cout<<stu[i].num<<' '<<stu[i].chinese + stu[i].math + stu[i].english<<endl;
    return 0;
}
```

## 附加内容

std::sort()的平均时间复杂度是O\(nlog\(n\)\)，原理是在数据量大时采用快速排序进行分段递归排序，而一旦分段后的数据量小于某个门槛，为避免快速排序的递归调用带来过大的额外负荷，就改用直接插入排序（不是插入排序）。如果递归层次过深，还会改用堆排序。

sort的速度够快，但若是追求极致速度且数据量很大，仍建议手写快速排序或归并排序。

## 题外话

写这篇文章真的累死......

写了足足一个小时啊啊啊啊啊

白里个白（逃
