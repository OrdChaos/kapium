如题，CSP-S备赛中，复习一下STL库的用法节省时间。

<!--more-->

内容不会太详细到原理，只知道用法就好。

## 向量（Vector）

### 介绍

- 向量是STL中的一种动态数组，索引（下标）从0开始。
- 向量使用连续的内存块来存储元素，这使得它们在访问和迭代方面非常高效。
- 使用向量类型前，需要引入`vector`头文件

### 操作

使用以下代码创建存储`type`类型变量，名为`vec`的向量：

```cpp
std::vector<type> vec; //其中没有任何元素
```

当然，可以进行更细致的初始化：

```cpp
std::vector<int> v1(10); //创建一个包含10个元素的向量，默认初始化为0
std::vector<int> v2(10, 5); //创建一个包含10个元素的向量，初始化为5
std::vector<int> v3 = {1, 2, 3, 4, 5}; //使用列表初始化
```

而后，可以进行加入、插入、删除、清空、访问、获取元素数量等操作：

```cpp
struct type {
    int temp;
    type(int t) : temp(t) {}
};

std::vector<type> vec;
int var;
size_t offset;

vec.push_back(type(var)); //在末尾添加一个值为var的元素
vec.emplace_back(var); //同上，但是不重复进行构造，使得不需要进行多余的拷贝操作，节省时间
vec.insert(vec.begin() + offset, type(var)); //在第(offset + 1)个位置插入值为var的元素，注意使用迭代器而非索引
vec.pop_back(); //删除最后一个元素
vec.erase(vec.begin() + offset); //删除第(offset + 1)个位置的元素，注意同样使用迭代器而非索引
vec.clear(); //删除所有元素
vec[offset] //访问第(offset + 1)个位置的元素
vec.size(); //获取元素数量
```

### 用例

#### 题目描述

你被邀请参加一个图书仓库管理系统的编程挑战。系统需要处理一系列指令，对图书仓库进行操作。仓库开始时为空，你需要根据以下指令类型操作图书仓库：

- `A S` 向仓库最后添加一本名为`S`的图书。
- `D` 从仓库中移除最后一本图书（如果仓库非空）,如果仓库为空，则输出`Warehouse is empty`。
- `C` 清空仓库中所有图书。
- `I X S` 在仓库中的第`X`个位置（从`1`开始计数）插入一本名为`S`的图书。如果`X`大于当前图书总数，将图书添加到仓库末尾。
- `Q` 查询并返回当前仓库中图书的总数。
- `P X` 输出第`X`个位置（从`1`开始计数）的图书名称。如果位置`X`超出范围，则输出`Invalid Position`。

#### 输入描述

第一行包含一个整数`N`(1≤N≤10<sup>5</sup>)，表示指令的数量。
接下来的`N`行，每行包含一个指令，按照上述格式给出。

#### 输出描述

对于每个查询指令（`Q`），输出当前仓库中图书的总数。
对于每个位置查询指令（`P`），输出该位置的图书名称或`Invalid Position`。

#### 样例输入

```shell
10
D
A Harry Potter
A The Great Gatsby
Q
I 2 To Kill a Mockingbird
Q
D
Q
P 1
P 3
```

#### 样例输出

```shell
Warehouse is empty
2
3
2
Harry Potter
Invalid Position
```

#### 题解

没什么难度的模拟，直接写就好了。

难点不在向量，而在输入与字符串分割。

代码如下：

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int command_count;
    cin>>command_count;
    cin.ignore();

    vector<string> books;
    vector<string> log;

    string command;
    for(int i = 0; i < command_count; i++) {
        getline(cin, command);
        char action = command[0];
        size_t space_index, position;
        string book_name;

        switch(action) {
            case 'A':
                book_name = command.substr(2);
                books.push_back(book_name);
                break;

            case 'D':
                if(books.empty()) log.push_back("Warehouse is empty");
				else books.pop_back();
                break;

            case 'C':
                books.clear();
                break;

            case 'Q':
                log.push_back(to_string(books.size()));
                break;

            case 'P':
                position = stoi(command.substr(2));
                if(position <= 0 || position > books.size()) log.push_back("Invalid Position");
                else log.push_back(books[position - 1]);
                break;

            case 'I':
                space_index = command.find(' ', 2);
                position = stoi(command.substr(2, space_index - 2));
                book_name = command.substr(space_index + 1);
                if(position > books.size()) books.push_back(book_name);
                else books.insert(books.begin() + position - 1, book_name);
                break;

            default:
                break;
        }
    }

    for(const auto entry : log) {
        cout<<entry<<endl;
    }

    return 0;
}
```

## 队列（Queue）

### 介绍

- 队列是一种先进先出（FIFO）的数据结构。
- 使用队列类型前，需要引入`queue`头文件。

### 操作

使用以下代码创建存储`type`类型变量，名为`q`的队列：

```cpp
std::queue<type> q;
```

可以进行加入、移除、访问、获取元素数量等操作（注意没有清空，所有类型的队列都没有）：

```cpp
std::queue<int> q;
int var;

q.push(var); // 在末尾添加一个值为var的元素
q.pop(); // 移除第一个元素
q.front(); // 访问第一个元素
q.back(); // 访问最后一个元素
q.empty(); // 判断队列是否为空
q.size(); // 获取元素数量
```

### 用例

此前写过两篇关于队列实现的文章（[C++ 数组实现队列](https://www.ordchaos.com/posts/da7075f0/)与[C++ 链表实现队列](https://www.ordchaos.com/posts/6270475f/)），可以看看。

问题、题解可以参考其中的“解决问题”部分。

这里给出使用STL队列的题解：

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    queue<int> q;
    int n;
    cin>>n;
    for(int i = 1;i <=n;i++) q.push(i);
    for(int i = 1;!q.empty();i++) {
        if(i%2 == 0) {
            int temp = q.front();
            q.pop();
            q.push(temp);
        }
        else {
            cout<<q.front()<<" ";
            q.pop();
        }
    }
    return 0;
}
```

### 双端队列（Deque）

#### 介绍

- 双端队列（Deque）是一种可以在两端进行插入和删除操作的队列。
- 使用双端队列类型前，需要引入`deque`头文件。

#### 操作

使用以下代码创建存储`type`类型变量，名为`dq`的双端队列：

```cpp
std::deque<type> dq;
```

同样，可以进行在两端加入、移除、访问、获取元素数量等操作：

```cpp
std::deque<int> dq;
int var;

dq.push_back(var); // 在末尾添加一个值为var的元素
dq.push_front(var); // 在开头添加一个值为var的元素
dq.pop_back(); // 移除最后一个元素
dq.pop_front(); // 移除第一个元素
dq.front(); // 访问第一个元素
dq.back(); // 访问最后一个元素
dq.empty(); // 判断队列是否为空
dq.size(); // 获取元素数量
```

### 优先队列（Priority Queue）或堆（Heap）

#### 介绍

- 优先队列（Priority Queue）是一种每次取出具有最高优先级元素的数据结构，一般按照从大到小的顺序存储（即大根堆）。
- 使用优先队列类型前，需要引入`queue`头文件。

更多内容可以看看这篇[堆](https://www.ordchaos.com/posts/fab451a5/)

#### 操作

使用以下代码创建存储`type`类型变量，名为`pq`的优先队列：

```cpp
std::priority_queue<type> pq;
```

可以进行加入、移除、访问、获取元素数量等操作：

```cpp
std::priority_queue<int> pq;
int var;

pq.push(var); // 插入一个值为var的元素
pq.pop(); // 移除具有最高优先级的元素
pq.top(); // 访问具有最高优先级的元素
pq.empty(); // 判断优先队列是否为空
pq.size(); // 获取元素数量
```

也可以优先级，如下：

```cpp
#include <functional> //引入std::greater

std::priority_queue<int, std::vector<int>, std::greater<int>> pq_min_heap; //自定义优先级，得到小根堆
```

对于自定义类型，有：

```cpp
struct type {
    int value;
};

struct compare {
    bool operator()(const type& a, const type& b) {
        return a.value > b.value;
    }
}

std::priority_queue<type, std::vector<type>, compare> //自定义根据type.value决定的优先级，得到小根堆
```

#### 用例

可以查看[这里](https://www.ordchaos.com/posts/fab451a5/#%E5%BA%94%E7%94%A8)获取题目与题解，这里只给出使用优先队列的写法：

```cpp
#include <bits/stdc++.h>

using namespace std;

int main() {
    int n;
    cin>>n;
    priority_queue<int, vector<int>, greater<int>> min_heap;
    int temp;

    for(int i=0;i<n;i++) {
        cin>>temp;
        min_heap.push(temp);
    }

    int power = 0;
    while(min_heap.size() > 1) {
        int quick1 = min_heap.top();
        min_heap.pop();
        int quick2 = min_heap.top();
        min_heap.pop();
        int combined = quick1 + quick2;
        power += combined;
        min_heap.push(combined);
    }

    cout<<power<<endl;
    return 0;
}
```

## 键值对（Map）

### 介绍

- 顾名思义，一个键与一个值一一对应，通过键快速查找值。
- `map`通过红黑树实现。
- 使用键值对类型前，需要引入`map`头文件。
- 对于自定义类型的键，需要重载`<`操作符（键值对自带排序）。

### 操作

使用以下代码创建键类型为`KeyType`，值类型为`ValueType`，名为`mp`的键值对：

```cpp
std::map<KeyType, ValueType> mp;
```

可以进行插入、删除、访问、查找、获取元素数量等操作（由于键的唯一性，不支持修改操作，可以先删除再插入）：

```cpp
std::map<int, std::string> mp; //键为int，值为string

mp[1] = "one"; // 插入键为1，值为"one"的元素（直接赋值，无需插入）
mp.erase(1); // 删除键为1的元素
mp[1] // 访问键为1的元素
mp.find(1); // 查找键为1的元素，返回一个迭代器
mp.size(); // 获取元素数量
```

### 哈希表版本/不排序

#### 介绍

- 利用桶函数实现，相比键值对它不会排序，速度快一些。
- 使用上与键值对无区别（需引入`unordered_map`头文件），但内存利用率不够高。
- 对于自定义类型的键，需要重载哈希函数。

#### 操作

使用以下代码创建键类型为`KeyType`，值类型为`ValueType`，名为`ump`的不排序键值对：

```cpp
std::unordered_map<KeyType, ValueType> ump;
```

对于自定义类型的键：

```cpp
struct KeyType {
    int id;
    std::string name;

    bool operator==(const KeyType &other) const {
        return id == other.id && name == other.name;
    }
};

namespace std {
    template<>
    struct hash<KeyType> {
        std::size_t operator()(const KeyType& k) const {
            using std::hash;
            using std::size_t;
            using std::string;

            return ((hash<int>()(k.id)
                     ^ (hash<string>()(k.name) << 1)) >> 1); //自定义哈希函数即可，使用任何你喜欢的算法。
        }
    };
}
```

其它的不变。

## 集合（Set）

### 介绍

- 集合是一种不包含重复元素的数据结构（集合的互斥性）。
- 使用集合类型前，需要引入`set`头文件。
- 对于自定义类型，需要重载`<`操作符（集合自带排序）。

### 操作

使用以下代码创建存储`type`类型变量，名为`s`的集合：

```cpp
std::set<type> s;
```

可以进行插入、删除、访问、查找、获取元素数量等操作（由于集合的互斥性，不支持修改操作，可以先删除再插入）：

```cpp
std::set<int> s;

s.insert(1); // 插入元素1
s.erase(1); // 删除元素1
s.find(1); // 查找元素1，返回一个迭代器
s.size(); // 获取元素数量
```

### 哈希表版本/不排序

#### 介绍

- 引用`unordered_set`以使用。
- 同样，速度更快，内存利用率下降。
- 个人感觉这个更接近于数学意义上的集合（无序性）。
- 对于自定义类型，需要重载`==`操作符与哈希函数。

#### 操作

使用以下代码创建存储`type`类型变量，名为`us`的不排序集合：

```cpp
std::unordered_set<type> us;
```

对于自定义类型：

```cpp
struct type {
    int id;
    std::string name;

    bool operator==(const type &other) const {
        return id == other.id && name == other.name;
    }
};

namespace std {
    template<>
    struct hash<type> {
        std::size_t operator()(const type &myType) const {
            return std::hash<int>()(type.id) ^ std::hash<std::string>()(type.name);
        }
    };
}
```

其它的不变。

## 补充

除了粗暴的重载，`unordered_map`与`unordered_set`都可以通过自定义的哈希函数进行构造。

参考以下内容：

```cpp
struct type {
    int a;
    std::string b;

    bool operator==(const MyStruct &other) const {
        return a == other.a && b == other.b;
    }
};

struct TypeHash {
    std::size_t operator()(const type &s) const {
        std::size_t h1 = std::hash<int>()(s.a);
        std::size_t h2 = std::hash<std::string>()(s.b);
        return h1 ^ (h2 << 1); //或者使用其他组合哈希的方法
    }
};

//使用以下方法构造：
std::unordered_map<type, ValueType, TypeHash> ump;
std::unordered_set<type, TypeHash> us;
```

## 题外话

没什么可说的……<span class="heimu" title="你知道的太多了">What can I say?</span>马上升高二了。

最后一次CSP与NOIP，加油！
