在这里简单的以浅显易懂的方式写一下竞赛中常用的四种通用排序方式。

<!-- more -->

## 冒泡排序

大概是所有人第一次学到的排序方式，毕竟它实在是太经典了。

简单介绍一下原理：

>冒泡排序（Bubble Sort），是一种计算机科学领域的较简单的排序算法。<br>它重复地走访过要排序的元素列，依次比较两个相邻的元素，如果顺序（如从大到小、首字母从Z到A）错误就把他们交换过来。走访元素的工作是重复地进行，直到没有相邻元素需要交换，也就是说该元素列已经排序完成。<br>这个算法的名字由来是因为越小的元素会经由交换慢慢“浮”到数列的顶端（升序或降序排列），就如同碳酸饮料中二氧化碳的气泡最终会上浮到顶端一样，故名“冒泡排序”。<br>
>
>——来自 百度百科 [冒泡排序](https://baike.baidu.com/item/%E5%86%92%E6%B3%A1%E6%8E%92%E5%BA%8F/4602306)

一言以蔽之，即依次按规律交换相邻元素位置，直至不能交换为止。

知道这一点就好办了，很容易就可以写出程序：

```cpp
void bubbleSort(int f, int l) {
    bool flag = 1;
    while(true) {
        for(int i = f;i < l;i++) {
            if(a[i] > a[i + 1]) {
                swap(a[i], a[i + 1]); //交换
                flag = 0;
            }
        }
        if(flag) break; //直至不能交换位置为止
        else flag = 1;
    }
    return;
}
```

运行一下，成功排序。

## 选择排序

听名字就知道，这是一种通过“选择”来排序的算法，它通过每次选择未排序元素中的最大/最小值并与最后一个未排序元素交换位置来进行排序。

附一张原理图（来自[菜鸟教程](https://www.runoob.com/w3cnote/selection-sort.html)）：

![](https://img.ordchaos.com/img/2022/08/44be35da53ae9ee564ce444542a43d10.gif)

代码依旧很简单：

```cpp
void selectionSort(int f, int l) {
    for(int i = f;i <= l;i++) {
        int max = f;
        for(int j = f + 1;j <= l - i;j++) {
            if(a[j] > a[max]) max = j;
        }
        swap(a[max], a[l - i]); //难道你不会写swap()?
    }
    return;
}
```

（甚至比冒泡都简单）

同样的，正常运行。

## 快速排序

非常经典的排序算法，也是公认最快的的排序算法。原理是用基准数分割，把大于/小于基准数的数放在基准数左边，其余放在右边，此时右边部分个数据皆小于/大于左边所有数据，然后对左右两边区间分别递归调用即可。

先放上代码：

```cpp
void quickSort(int f, int l) {
    int i = f, j = l, mid = a[(f + l)/2];
    do {
        while(a[i] < mid) i++;
        while(a[j] > mid) j--;
        if(i <= j) {
            swap(a[i], a[j]);
            i++;
            j--;
        }
    } while(i <= j);
    if(f < j) quickSort(f, j);
    if(l > i) quickSort(i, l);
    return;
}
```

分别从基准数（这里是中间数）左右两边找到第一个大于/小于基准数的元素，交换，然后继续找，直到左右的寻找范围重叠，即代表寻找完毕，递归寻找剩余区间即可。

再放一张动图了解一下原理（图片依旧来自[菜鸟教程](https://www.runoob.com/w3cnote/quick-sort-2.html)）

![](https://img.ordchaos.com/img/2022/08/71c0f1c0ceb0e053c423426e7f343602.gif)

## 归并排序

归并排序是建立在归并操作上的一种排序算法，该算法是分治法的一个典型应用。方法是将已有序的子序列合并，得到完全有序的序列——即先使每个子序列有序，再使子序列段间有序，最常用的是二路或三路归并排序。这里给出二路归并排序的代码：

```cpp
void mergeSort(int f, int l) {
    if(f == l) return;

    int mid = (f + l)/2;
    mergeSort(f, mid);
    mergeSort(mid + 1, l);

    int i = f, j = mid + 1, k = 0, r[l - f + 1]; 
    while(i <= mid && j <= l) {
        if(a[i] <= a[j]) {
            r[k] = a[i];
            i++;
            k++;
        } else {
            r[k] = a[j];
            j++;
            k++;
        }
    }
    while(i <= mid) {
        r[k] = a[i];
        i++;
        k++;
    }
    while(j <= l) {
        r[k] = a[j];
        j++;
        k++;
    }
    for(int p = f;p <= l;p++) a[p] = r[p - f];
    return;
}
```

二路归并排序的原理是先以中间数为基准分割出两个子序列然后分别进行归并排序，然后对有序表进行合并，相信看代码也可以看出来。最后将临时数组的值赋给待排序数组就结束。

## 效率测试

### 时间复杂度

算法的时间复杂度是一个函数，它定性描述该算法的运行时间，常用大O来表述。若用函数f(n)描述算法执行所要时间的增长速度，用函数T(n)表示算法需要执行的运算次数存在常数c和函数f(n)，使得当n>=c时T(n)<=f(n)，记作T(n)=O(f(n))，其中n代表数据规模。显然，n越小，算法运行的越快。

常见时间复杂度等级如下表：

|    分类    |       写作       |
| :--------: | :--------------: |
|   常量阶   |       O(1)       |
|   对数阶   |    O(log(n))     |
|   线性阶   |       O(n)       |
| 线性对数阶 |    O(nlog(n))    |
|   n方阶    | O(n<sup>n</sup>) |
|   指数阶   | O(2<sup>n</sup>) |
|   阶乘阶   |      O(n!)       |

以及常用算法的时间复杂度如下表：

|   算法   |     平均时间复杂度     |     最好情况     |        最坏情况        |
| :------: | :--------------------: | :--------------: | :--------------------: |
| 冒泡排序 |    O(n<sup>2</sup>)    |       O(n)       |    O(n<sup>2</sup>)    |
| 选择排序 |    O(n<sup>2</sup>)    | O(n<sup>2</sup>) |    O(n<sup>2</sup>)    |
| 插入排序 |    O(n<sup>2</sup>)    |       O(n)       |    O(n<sup>2</sup>)    |
| 希尔排序 | O(nlog<sup>2</sup>(n)) | O(n<sup>2</sup>) | O(nlog<sup>2</sup>(n)) |
| 归并排序 |       O(nlog(n))       |    O(nlog(n))    |       O(nlog(n))       |
| 快速排序 |       O(nlog(n))       |    O(nlog(n))    |    O(n<sup>2</sup>)    |
|  堆排序  |       O(nlog(n))       |    O(nlog(n))    |       O(nlog(n))       |
| 计数排序 |         O(n+k)         |      O(n+k)      |         O(n+k)         |
|  桶排序  |         O(n+k)         |      O(n+k)      |    O(n<sup>2</sup>)    |
| 基数排序 |         O(n×k)         |      O(n×k)      |         O(n×k)         |

### 测时

除了时间复杂度，还有一种方式可以测试算法效率——对于相同的数据，直接测试算法排序用时并比较即可。使用ctime头文件中的clock()函数即可获取时间，运行前后的时间差即为运行用时。

于是有代码如下：

```cpp
int main() {
    int n;
    cin>>n;

    default_random_engine e;
    uniform_int_distribution<int> u(0,1000000);
    e.seed(time(0));

    for(int i = 0;i < n;i++) {
        b[i] = u(e);
    }
    clock_t begin, end;

    for(int i = 0;i < n;i++) a[i] = b[i];
    begin = clock();
    selectionSort(0, n - 1);
    end = clock();
    cout<<"selectionSort end"<<endl<<"time: "<<double(end - begin) / CLOCKS_PER_SEC * 1000<<"ms"<<endl<<endl;

    for(int i = 0;i < n;i++) a[i] = b[i];
    begin = clock();
    bubbleSort(0, n - 1);
    end = clock();
    cout<<"bubbleSort end"<<endl<<"time: "<<double(end - begin) / CLOCKS_PER_SEC * 1000<<"ms"<<endl<<endl;

    for(int i = 0;i < n;i++) a[i] = b[i];
    begin = clock();
    mergeSort(0, n - 1);
    end = clock();
    cout<<"mergeSort end"<<endl<<"time: "<<double(end - begin) / CLOCKS_PER_SEC * 1000<<"ms"<<endl<<endl;

    for(int i = 0;i < n;i++) a[i] = b[i];
    begin = clock();
    quickSort(0, n - 1);
    end = clock();
    cout<<"qsort end"<<endl<<"time: "<<double(end - begin) / CLOCKS_PER_SEC * 1000<<"ms"<<endl<<endl;

    return 0;
}
```

额外使用了random头文件中的函数用来生成在0到1000000间的随机数用于测试<span class="heimu" title="你知道的太多了">（我懒得写用法了，建议出门左拐Google）</span>，运行结果（可能）如下：

```shell
(input 100000)

selectionSort end
time: 2536ms

bubbleSort end
time: 14222ms

mergeSort end
time: 8ms

quickSort end
time: 6ms
```

简单易懂，对吧。

## 题外话

又水了一篇文（不是。

还是很开心的，因为以前都没有成功完成过归并排序与快速排序，这次写出来自我感觉非常好。

那就这样，886.
