记录一下最近的练习程序与做法，加深记忆，也当个教程吧，毕竟赠人玫瑰手留余香(bushi
<!--more-->

如果你不知道这些表达式分别指什么东西，可以百度一下，这里不再赘述。

## 后缀表达式

这个应该是最常见的了，下面讲一下实现。

首先，还是定义函数<span class="heimu" title="你知道的太多了">废话</span>：

```cpp
int main() {
	//...
}
```

然后，进行文件读取，可以用`freopen()`，不过我这里用的是`fopen()`：

```cpp
FILE* stream = fopen("input.txt", "r");
stack<double> nums;
while(true) {
	char tstr[100]; //temp
	fscanf(stream, "%s", tstr);
	if(feof(stream)) break;
	string input = tstr;

	//...
}
```

解释一下上面的程序：

- `stack<double> nums` 这个栈后面会用到，这里先不用管
- `fscanf()`和`scanf()`用法一样，唯一的区别是`fscanf()`用于读取文件流中的信息而非输入流
- `feof()`中的参数为文件流，用于判断是否读到结尾，读到则返回真

很显然，这段程序用于分别读入每一段字符，那么接下来便是判断输入了。

代码如下：

```cpp
while(true) {
	//...

	if(isdigit(input[0])) {
		nums.push(atof(input.c_cstr()));
	}
	else {
		//...
	}
}
```

如果输入为整数，则进入数字栈，否则开始计算。

这里使用了`isdigit()`函数，输入为`char`类型，用于判断参数是否在`'0'`与`'9'`之间。

计算过程很简单，弹出两个数字栈中的数，根据运算符计算即可：

```cpp
//...
else {
	double y = nums.top();
	nums.pop();
	double x = nums.top();
	nums.pop();

	double temp;
	switch(input[0]) {
		case '+':
			temp = x + y;
			break;

		case '-':
			temp = x - y;
			break;

		case '*':
			temp = x * y;
			break;

		case '/':
			temp = x / y;
			break;
	}

	nums.push(temp);
}
```

尤其要注意减法与除法的操作数与被操作数顺序，毕竟它们可没有交换律。

此时已经计算完成，结果作为栈中唯一的元素处在栈顶，直接输出即可：

```cpp
fclose(stream); //关文件是一个好习惯
cout<<nums.top()<<endl;

return 0;
```

大概就是这样。

完整代码还是放一下：

```cpp
#include<bits/stdc++.h>
using namespace std;

inline bool is_num(string str) {
	if(str[0] >= '0' && str[0] <= '9') return true;
	else return false;
}

int main() {
	FILE* stream = fopen("input.txt", "r");
	stack<double> nums;
	while(true) {
		char tstr[100];
		fscanf(stream, "%s", tstr);
		if(feof(stream)) break;
		string input = tstr;
		if(is_num(input)) {
			nums.push(atof(input.c_str()));
		}
		else {
			double y = nums.top();
			nums.pop();
			double x = nums.top();
			nums.pop();
			double temp;
			switch(input[0]) {
				case '+':
					temp = x + y;
					break;

				case '-':
					temp = x - y;
					break;

				case '*':
					temp = x * y;
					break;

				case '/':
					temp = x / y;
					break;
			}
			nums.push(temp);
		}
	}
	fclose(stream);
	cout<<nums.top()<<endl;
	
	return 0;
}
```

输入样例：

```txt
1 2 + 3 - 
```

输出样例：

```txt
0
```

## 前缀表达式

细心一点就能发现，它与后缀表达式几乎一样，只是顺序不同。

没错，这正是因为前、后、中缀表达式分别为表达式树的先序、后续与中序遍历。

利用这个性质，将后缀表达式的顺序稍稍更改即可得到前缀表达式求值的程序：

```cpp
#include<bits/stdc++.h>
using namespace std;

inline bool is_num(string str) {
    if(str[0] >= '0' && str[0] <= '9') return true;
    else return false;
}

int main(){
    FILE* stream = fopen("input.txt", "r");
    
    stack<double> nums;
    vector<string> input; //存储读取数据
    while(true) {
        char tstr[100];
        fscanf(stream, "%s", tstr);
        if(feof(stream)) break;
        input.push_back(string(tstr));
    }
    
    for(int i = input.size() - 1;i >= 0;i--) { //倒序读取
        if(is_num(input[i])) {
            nums.push(atof(input[i].c_str()));
        }
        else {
            double x = nums.top();
            nums.pop();
            double y = nums.top();
            nums.pop();
            
            double temp;
            switch(input[i][0]) {
                case '+':
                    temp = x + y;
                    break;
                
                case '-':
                    temp = x - y;
                    break;
                
                case '*':
                    temp = x * y;
                    break;
                
                case '/':
                    temp = x / y;
                    break;
            }
            
            nums.push(temp);
        }
    }
    
    fclose(stream);
    cout<<nums.top()<<endl;
    
    return 0;
}
```

改成倒序读取即可。

输入样例：

```txt
- + 1 2 3 
```

输出样例：

```txt
0
```

## 中缀表达式

我们最常用的表达式，处理起来却是最复杂的，因为现在需要考虑优先级与括号了。

这里有几种方法：

### 递归

首先，定义函数用于取多项式的因子：

```cpp
int factor() {
    int res = 0;
    char c = cin.peek();
    if(c == '(') {
        cin.get();
        res = expression();
        cin.get();
    }
    else {
        while(isdigit(c)) {
            res = 10 * res + c - '0';
            cin.get();
            c = cin.peek();
        }
    }
    return res;
}
```

先定义结果为0，然后判断输入。若为括号，则将其内容视为新表达式，交由马上要定义的`expression()`函数计算。否则，按位取出输入中的数即可。

顺带一提，这些代码中的`cin.get()`与`cin.peek()`尤其重要，切勿移动位置或轻易替换。至于原因，自己模拟想一下吧。

然后，计算单项式的值，代码如下：

```cpp
int term() {
    int res = factor();
    while(true) {
        char mark = cin.peek();
        if(mark == '*' || mark == '/') {
            cin.get();
            int v = factor();
            if(mark == '*') res *= v;
            else res /= v;
        }
        else break;
    }
    return res;
}
```

先用`factor()`函数读入因子，然后循环判断该单项式是否读完。若未读完（即该因子与下一个因子间仍用乘号或除号连接）则取下一个因子并计算，否则返回该单项式的值即可。并且很显然，这样的写法就代表输入的表达式中不应当含有任何空格，也只支持整数运算（要浮点数自己改<span class="heimu" title="你知道的太多了">我不干了</span>）。

最后是整个表达式，与计算单项式基本一样：

```cpp
int expression() {
    int res = term();
    while(true) {
        char mark = cin.peek();
        if(mark == '+' || mark == '-') {
            cin.get();
            int v = term();
            if(mark == '+') res += v;
            else res -= v;
        }
        else break;
    }
    return res;
}
```

读入单项式再计算，直到该表达式计算完毕（即`mark`取到`)`或`EOF`）

主函数其实已经一目了然了，重定向输入再调用`expression()`即可，就不写了。

输入样例：

```txt
(28/7)/2+(8-9)
```

输出样例：

```txt
1
```

### 栈

这里又分为两种方案：

#### 转为后/前缀表达式再计算

这里的重点是转换的过程，逻辑整体如下（中缀->后缀）：

- 输入若为数字，直接放入输出表达式中。若为符号：
  - 如果符号栈为空，则放入符号栈中
  - 如果符号栈栈顶元素优先级大于等于该符号，则出栈栈顶符号放入表达式，若此时栈顶符号优先级大于等于该符号，则重复以上流程直至小于，而后入栈该符号
  - 如果符号栈栈顶元素优先级小于该符号，该符号入栈
  - 如果该符号为左括号，直接入栈
  - 如果该符号为右括号，则依次出栈符号栈栈顶元素放入表达式中，直至左括号。最后抛弃左括号与右括号
- 若输入完毕，符号栈中仍有符号，则依次出栈放入表达式

代码如下（转为后缀表达式）：

```cpp
map<char, int> markl;

markl['+'] = 0;
markl['-'] = 0;
markl['*'] = 1;
markl['/'] = 1;

FILE* stream = fopen("input.txt", "r");

stack<char> marks;
vector<string> expression;
while(true) {
    char tstr[100];
    fscanf(stream, "%s", tstr);
    if(feof(stream)) break;
    string input = tstr;
    
    if(isdigit(input[0])) {
        expression.push_back(input);
    }
    else if(input[0] == '(') {
        marks.push('(');
    }
    else if(input[0] == ')') {
        while(true) {
            if(marks.top() == '(') {
                marks.pop();
                break;
            }
            char t[2] = {marks.top(), '\0'};
            expression.push_back(string(t));
            marks.pop();
        }
    }
    else {
        if(marks.empty() || marks.top() == '(') {
            marks.push(input[0]);
        }
        else if(markl[input[0]] <= markl[marks.top()]) {
	        while(!marks.empty() && markl[temp[0]] <= markl[marks.top()]) {
	            char t[2] = {marks.top(), '\0'};
	            expression.push_back(string(t));
	            marks.pop();
	        }
	        marks.push(input[0]);
        }
        else {
            marks.push(input[0]);
        }
    }
}

while(!marks.empty()) {
	char t[2] = {marks.top(), '\0'};
	expression.push_back(string(t));
	marks.pop();
}
```

和上面的逻辑完全一样，唯一要注意的是这里使用了`map`，可以理解为字典。

然后只需要计算就行，代码就不放了。

前缀表达式的逻辑与代码可以自己想想。

输入输出样例同下面。

#### 直接计算

逻辑和转换本身是一样的，只不过没有了表达式向量，而是直接计算后放入数字栈。

即将所有的对于`expression`的操作改为计算即可：

```cpp
#include <bits/stdc++.h>
using namespace std;

double calc(char mark, double x, double y) {
    double temp = 0;
    switch(mark) {
        case '+':
            temp = x + y;
            break;
        
        case '-':
            temp = x - y;
            break;
        
        case '*':
            temp = x * y;
            break;
        
        case '/':
            temp = x / y;
            break;
    }

    return temp;
}

int main() {
    FILE* stream = fopen("input.txt", "r");

    map<char, int> markl;
    markl['+'] = 0;
    markl['-'] = 0;
    markl['*'] = 1;
    markl['/'] = 1;

    stack<char> marks;
    stack<double> nums;
    while(true) {
        char tstr[100];
        fscanf(stream, "%s", tstr);
        if(feof(stream)) break;
        string temp = tstr;

        if(isdigit(temp[0])) {
            nums.push(atof(temp.c_str()));
        }
        else if(temp[0] == '(') {
            marks.push('(');
        }
        else if(temp[0] == ')') {
            while(true) {
                if(marks.top() == '(') {
                    marks.pop();
                    break;
                }

                double y = nums.top();
                nums.pop();
                double x = nums.top();
                nums.pop();
                nums.push(calc(marks.top(), x, y));

                marks.pop();
            }
        }
        else if(marks.empty() || marks.top() == '(') {
            marks.push(temp[0]);
        }
        else if(markl[temp[0]] <= markl[marks.top()]) {
	        while(!marks.empty() && markl[temp[0]] <= markl[marks.top()]) {
	            double y = nums.top();
	            nums.pop();
	            double x = nums.top();
	            nums.pop();
	            nums.push(calc(marks.top(), x, y));
	
	            marks.pop();
	        }
            marks.push(temp[0]);
        }
        else {
            marks.push(temp[0]);
        }
    }

    while(!marks.empty()) {
        double y = nums.top();
        nums.pop();
        double x = nums.top();
        nums.pop();
        nums.push(calc(marks.top(), x, y));

        marks.pop();
    }

	fclose(stream);
	
    cout<<nums.top()<<endl;
    return 0;
}
```

输入样例：

```txt
( 28 / 7 ) / 2 + ( 8 - 9 ) 
```

输出样例：

```txt
1
```

收工！

## 题外话

这篇大概是我最长的纯原创技术类博文了。。。。。。

好累QAQ

下次再见啦！886！

### 2023.04.03更新

让ChatGPT改了一个支持浮点数的递归版本：

```cpp
#include <iostream>
#include <cstdlib>
#include <cstdio>
using namespace std;

void print_tab(int);
void print_log(string, int);
void print_log(string, int, double);
double expression(int);
double term(int);
double factor(int);

int main() {
    freopen("input.txt", "r", stdin);
    cout << expression(0) << endl;
    return 0;
}

void print_tab(int deep) {
    for(int i = 0;i < deep;i++) {
        cout << "\t";
    }
    return;
}

void print_log(string name, int deep) {
    print_tab(deep);
    cout << name << " {" << endl;
    return;
}

void print_log(string name, int deep, double res) {
    print_tab(deep);
    cout << "} -> res =" << res << endl;
    return;
}

double expression(int deep) {
    print_log("expression", deep);

    double res = term(deep + 1);
    while(true) {
        char mark = cin.peek();             //get
        if(mark == '+' || mark == '-') {
            cin.get();                      //skip
            double v = term(deep + 1);
            if(mark == '+') res += v;
            else res -= v;
        }
        else break;
    }

    print_log("expression", deep, res);

    return res;
}

double term(int deep) {
    print_log("term", deep);

    double res = factor(deep + 1);
    while(true) {
        char mark = cin.peek();             //get
        if(mark == '*' || mark == '/') {
            cin.get();                      //skip
            double v = factor(deep + 1);
            if(mark == '*') res *= v;
            else res /= v;
        }
        else break;
    }

    print_log("term", deep, res);
    
    return res;
}

double factor(int deep) {
    print_log("factor", deep);

    double res = 0;
    double base = 1.0;
    char c = cin.peek();                    //get
    if(c == '(') {
        cin.get();                          //skip
        res = expression(deep + 1);
        cin.get();                          //skip
    }
    else {
        while(isdigit(c) || c == '.') {     // == GET A NUMBER ==
            if(c == '.') {
                cin.get();                  //skip the '.'
                c = cin.peek();             //get the next character
                while(isdigit(c)) {         //collect digits for the decimal part
                    res = res + (c - '0') * (base /= 10.0);
                    cin.get();
                    c = cin.peek();
                }
                break;
            }
            res = res * 10 + c - '0';       //get num
            cin.get();                      //skip
            c = cin.peek();                 //get
        }
    }

    print_tab(deep + 1);
    cout << "get_num();" << endl;
    print_log("factor", deep, res);

    return res;
}
```

神