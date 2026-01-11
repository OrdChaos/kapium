## 二叉树binary tree,BT

### 介绍

- 一种特殊的树形结构，是度数为2的树。即二叉树的每个节点最多具有两个子节点，每个节点的字节点分别称为左孩子、右孩子，子树则为左子树，右子树。
- 二叉树可以为空且一定有序。
- 在二叉树的第i层上至多有2<sup>i</sup>个节点\(i>=0\)。
- 深度为m的二叉树上至多有  $ \frac{1-2^{m+1}}{1-2}=2^{m+1}-1 $  个节点\(m>=0\)，一棵深度为m且有  $ 2^{m+1}-1 $  个节点的二叉树被称为满二叉树。
- 每一个节点都与深度为m的满二叉树中编号为1~n的节点一一对应的深度为m，有n个节点的二叉树被称为完全二叉树。
- 对于任意一棵二叉树，若其有n<sub>0</sub>个叶节点，n<sub>2</sub>个度为2的节点，则一定有n<sub>0</sub>=n<sub>2</sub>+1。
- 具有n个节点的完全二叉树的深度是  $ floor\left( \log _2n \right) $ 。
- 在有n个节点的完全二叉树中，对于编号为i的节点：
  - 若  $ i=1 $  ，则其无父节点，为根节点，否则其父节点编号为  $ floor\left( \frac{i}{2} \right) $ 。
  - 若  $ 2i>n $  ，则i为叶节点，否则其左孩子的编号为2i。
  - 若  $ 2i<n<2i+1 $  ，则i无右孩子，否则其右孩子的编号为2i+1。

如下图即二叉树示意图：

![](https://img.ordchaos.com/img/2022/08/8afad25dfbf7ac9ca2c9daf5571ada44.jpg)

### 存储结构

#### 单链表结构

```cpp
struct node {
    int data; //数据域
    node* lc, rc; //分别指向左孩子于右孩子
};
struct bt {
    node* root;
}t;
```

与树一样，其实就是孩子表示法。

#### 双链表结构

```cpp
struct node {
    int data; //数据域
    node* lc, rc; //分别指向左孩子于右孩子
    node* father; //指向父节点
};
struct bt {
    node* root;
}t;
```

同理，其实就是父亲孩子表示法。

### 遍历

- 先序遍历（输出-&gt;左孩子-&gt;右孩子）
- 中序遍历（左孩子-&gt;输出-&gt;右孩子）
- 后序遍历（左孩子-&gt;右孩子-&gt;输出）

### 普通树转二叉树

1. 对于每一个节点，去除除最左边的树枝之外的所有树枝。
2. 从最左边的节点开始，依次次将同层的每个兄弟节点横向相连。
3. 以根节点为中心，将图形顺时针旋转约45°。

如下图所示：

![](https://img.ordchaos.com/img/2022/08/94e52afbeee2c0f679ae8a88201b6e1b.jpg)

### 树的计数

具有n(n>=1且n为整数)个节点的二叉树的种类的数量可以用下方的函数来表示：
$$
f\left( n \right) =\begin{cases}
	\sum_{i=0}^{n-1}{f\left( i \right) \cdot f\left( n-i-1 \right)}&		\left( n>1 \right)\\
	1&		\left( 0\leqslant n\leqslant 1 \right)\\
\end{cases}
$$

## 题外话

这是第二篇学习笔记，上一篇可以点击[这里](https://www.ordchaos.com/posts/d4140423/)查看。
