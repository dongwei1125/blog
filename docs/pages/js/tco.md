# 关于取消 ES6 函数尾递归的相关探究

![](/js/tco/banner.jpg)

## 前言

&emsp;&emsp;;`ES6`中的尾递归优化非常实用，于是乎去初步探究。但是你会非常失望，发现绝大多数浏览器已经不支持，`node`也在很早的版本中取消了支持。关于尾递归优化的相关文档，也都仅仅是简单提及，只言片语，优化点原理几乎就不提，了解起来非常麻烦。

&emsp;&emsp;因此查阅了很多文档，并简单汇总，希望可以由斐波那契数列，逐步展开，引导你了解尾递归的知识点。

&emsp;&emsp;以下内容中的知识点包括。

 - `STC`、`TCO`和`STC`分别是什么
 - 尾调用优化的优化点是什么
 - `V8`为何取消支持尾调用优化
 - `PTC`与`STC`的优缺点

## 尾调用

### 调用栈

&emsp;&emsp;;`JavaScript`调用栈用于存储代码执行期间的所有上下文，每一个执行上下文也叫调用帧，栈内活动通常为。

 - 运行全局代码，创建全局执行上下文并压入栈中
 - 函数被调用时，创建函数执行上下文并压入栈顶。函数执行完成后，对应的上下文弹出
 - 全局代码执行结束，全局执行上下文弹出，调用栈清空

```javascript
function bar(x) {
  return x // A
}

function foo(x) {
  return bar(x) + 2 // B
}

foo(1) // C
```

&emsp;&emsp;以上代码调用栈的活动情况如下。

```javascript
	                                  bar context
	                                   ├── x
	                                   └── Line B
				   foo context        foo context        foo context
		            ├── x              ├── x              ├── x
		            └── Line C	       └── Line C         └── Line C  
global context --> global context --> global context --> global context --> global context
 ├── bar            ├── bar            ├── bar            ├── bar            ├── bar
 └── foo            └── foo            └── foo            └── foo            └── foo
```

&emsp;&emsp;函数在执行前， 除了初始化变量对象、作用域链和`this`之外，调用帧上还将保存函数返回位置的地址信息。例如`bar`函数执行完成后，返回代码行`B`，在`bar`函数的调用帧就保存了代码行`B`的位置地址。

### 尾调用优化

&emsp;&emsp;将代码改造为尾调用，即在函数的最后一步只调用函数。

```javascript
function bar(x, y) {
  return x + y // A
}

function foo(x) {
  return bar(x, 2) // B
}

foo(1) // C
```

&emsp;&emsp;现在来思考一个问题，函数`foo`运行完最后一行代码后，将执行权交接给了`bar`函数，`foo`剩下的唯一用处就是将返回值传递给代码行`C`。

&emsp;&emsp;如果我们将`bar`函数的返回位置直接修改为`C`，不再通过`B`，那么`foo`是不就没用了啊。

&emsp;&emsp;因此我们就可以将`foo`的调用帧删除了，但是注意要在`foo`运行后，交出执行权给`bar`之前删除，因为`foo`函数中可能有其它的代码要执行。

&emsp;&emsp;再来看看调用栈的活动情况。

```javascript
				                      bar context
		           foo context         ├── x    
		            ├── x              ├── y
		            └── Line C	       └── Line C 
global context --> global context --> global context --> global context
 ├── bar            ├── bar            ├── bar            ├── bar
 └── foo            └── foo            └── foo            └── foo
```

&emsp;&emsp;以上则是我们经常说的尾调用优化（`TCO`，`Tail Call Optimization`），与规范中提到的`PTO`（`Proper Tail Calls`）是同一个东西，只是叫法不同。

&emsp;&emsp;尾调用优化的优点也很明显，当函数关系复杂时，调用栈的长度会大大减小，从而节省内存，避免出现堆栈溢出的情况。缺点则是，为了改造为尾调用，部分函数的参数将调整，函数的语义将不同于原本的语义，出现偏差，造成维护成本增加。另外此优化是浏览器层面的，依赖引擎支持，会出现兼容性差异。

## 斐波那契

&emsp;&emsp;普通形式的斐波那契数列。

```javascript
// 1 1 2 3 5 8 13 21 34 55
function f(n) {
  if (n <= 2) {
    return 1
  }

  return f(n - 1) + f(n - 2)
}
```

### 最大栈长度

&emsp;&emsp;执行`f(4)`时的调用栈活动。

```javascript
                           f(1)              f(0)
                  f(2)     f(2)     f(2)     f(2)     f(2)              f(1)                                f(1)              f(0)
		 f(3)     f(3)     f(3)     f(3)     f(3)     f(3)     f(3)     f(3)     f(3)              f(2)     f(2)     f(2)     f(2)     f(2)
f(4) --> f(4) --> f(4) --> f(4) --> f(4) --> f(4) --> f(4) --> f(4) --> f(4) --> f(4) --> f(4) --> f(4) --> f(4) --> f(4) --> f(4) --> f(4) --> f(4)
```

&emsp;&emsp;更加直观的节点图。

![](/js/tco/f4.png)

&emsp;&emsp;可以归纳出`f(n)`执行期间的最大调用栈长度为`n`。

### 节点数

&emsp;&emsp;斐波那契的通项公式`a(n)`为。

<LaTeX>a(n)=\frac{(\frac{1+\sqrt5}{2})^n-(\frac{1-\sqrt5}{2})^n}{\sqrt5}</LaTeX>

&emsp;&emsp;节点数量`g(n)`为。

<LaTeX>g(n)=2a(n+1)-1=2\frac{(\frac{1+\sqrt5}{2})^{n+1}-(\frac{1-\sqrt5}{2})^{n+1}}{\sqrt5}-1</LaTeX>

&emsp;&emsp;;`JavaScript`代码也贴一下，你可以测试验证。

```javascript
function a(n) {
  const sqrt5 = Math.sqrt(5)

  return (Math.pow(((1 + sqrt5) / 2), n) - Math.pow(((1 - sqrt5) / 2), n)) / sqrt5
}

function g(n) {
  return 2 * a(n + 1) - 1
}
```

### 浏览器

&emsp;&emsp;以下代码可用于测试浏览器的调用栈长度。

```javascript
function getDeep() {
  try {
    return 1 + getDeep()
  } catch (err) {
    return 1
  }
}

getDeep()
```

&emsp;&emsp;相关浏览器的调用栈长度为。

 - `Chrome`：`11419`
 - `Firefox`：`25607`
 - `Opera`：`22862`
 - `Edge`：`3718`
 - `IE11`：`1982`

&emsp;&emsp;然后看另外一种情况。

```javascript
function getDeep() {
  try {
    new Array(10000).fill(new Array(100).fill(0))

    return 1 + getDeep()
  } catch (err) {
    return 1
  }
}

getDeep()
```

&emsp;&emsp;;`Chrome`浏览器下打印`8973`，因此可以发现，除了浏览器和浏览器版本的不同，会影响执行栈长度之外，函数体的大小和函数内变量的数量也会影响栈的长度。

### 常见误区

&emsp;&emsp;;`f(40)`运行耗时大概`800ms`左右，另外根据刚才的结论，`f(40)`的最大栈长度为`40`，节点数为`331160281`。

```javascript
console.time('f(40)')
console.log(f(40)) // 102334155
console.timeEnd('f(40)') // f(40): 800.323974609375 ms
```

&emsp;&emsp;然后运行`f(100)`试试，容易知道最大栈长度为`100`，节点数`g(100)`约为`1.146295688027638e+21`。

> 注意节点数为约数，原因在于`JavaScript`中数值的有效位数为`16`位，运算过程中可能存在舍入，造成精度丢失

&emsp;&emsp;实际你会发现，浏览器将无响应，且长时间处于加载状态。

&emsp;&emsp;我们用`f(40)`来粗略地估计`f(100)`的执行时长，假设每个节点运行耗时相同，注意实际每个节点耗时肯定不一样，但是足够说明问题了。

```javascript
var cost = 800 / 331160281 // 单个节点耗时
var millisecond = 12 * 30 * 24 * 60 * 60 * 1000 // 一年的毫秒数

// f(100) 耗时（年）
1.146295688027638e+21 * cost / millisecond // 89029
```

&emsp;&emsp;粗略估计`f(100)`将运行约`89029`年（无参考性），因此浏览器无响应的根本原因是，节点数过于庞大，浏览器长时间处在运算中。

&emsp;&emsp;注意不是爆栈，不是爆栈，`f(100)`的最大栈长度仅为`100`，远远小于浏览器的调用栈长度（`Chrome`调用栈长度`11419`）。除非是执行`f(11419)`，才会存在爆栈的情况，另外受函数体的大小和变量数量的影响，实际根本不用达到`11419`就会爆栈。

> 由于一些官方文档排版错误，很容易被误导是爆栈导致浏览器无响应，注意区分

### 尾递归

&emsp;&emsp;节点数过多造成运行超时，现在来考虑优化。

&emsp;&emsp;尝试将斐波那契修改为尾递归形式，尾递归即函数尾调用自身。

```javascript
function f(n, m = 1, o = 1) {
  if (n <= 2) {
    return o
  }
  return f(n - 1, o, m + o)
}
```

&emsp;&emsp;;`f(4)`的调用栈活动。

```javascript
                              f(2, 2, 3)
               f(3, 1, 2)     f(3, 1, 2)     f(3, 1, 2)
f(4, 1, 1) --> f(4, 1, 1) --> f(4, 1, 1) --> f(4, 1, 1) --> f(4, 1, 1)
```

&emsp;&emsp;更加直观的节点图。

![](/js/tco/f411.png)

&emsp;&emsp;可归纳出`f(n)`执行期间的最大调用栈长度和节点数均为`n - 1`。

&emsp;&emsp;;`f(100)`的节点数仅`99`，浏览器运行非常流畅。

```javascript
console.time('f(100)')
console.log(f(100)) // 354224848179262000000
console.timeEnd('f(100)') // f(100): 0.107177734375 ms
```

&emsp;&emsp;甚至可以运算`f(6000)`，`Infinity`说明`f(6000)`的数值已经非常大了。

```javascript
console.time('f(6000)')
console.log(f(6000)) // Infinity
console.timeEnd('f(6000)') // f(6000): 1.869873046875 ms
```

&emsp;&emsp;斐波那契的普通方式运行`f(100)`浏览器长时间无响应，而递归方式可以轻松运行`f(6000)`，对代码的执行效率提升可以说是爆炸级的。

&emsp;&emsp;应当明确的是，尾递归方式仅仅优化了节点数，即减少了函数的调用次数，以此避免程序超时，但是代码还是会存在堆栈溢出爆栈的情况的，例如`f(10000)`。

![](/js/tco/stack.png)

### 尾递归优化

&emsp;&emsp;文初提及的尾调用优化（`PTC`），可用来减少调用栈，避免堆栈溢出，实际就是用来解决爆栈问题的，另外递归函数中的`PTC`又被称为尾递归优化。

&emsp;&emsp;目前`PTC`仅在`Safari`浏览器和部分`node`版本中支持，`node`中仅`6.0.0 ~ 8.6.0`版本支持，`5.12.0`及之前的版本不支持，从`8.7.0`开始不再提供支持。

&emsp;&emsp;查看当前`node`版本选项，包含`--harmony_tailcalls`即表示支持`PTC`。

![](/js/tco/tc.png)

&emsp;&emsp;我们在`node`的`8.6.0`版本中运行斐波那契（尾递归形式）`f(100000)`。

![](/js/tco/f100000.png)

&emsp;&emsp;;`node`的调用栈长度为`8961`，必然会爆栈。

&emsp;&emsp;尝试开启`PTC`优化。

```javascript
node --use-strict --harmony-tailcalls tco.js
```

> `--use-strict`表示开启严格模式，`--harmony-tailcalls`或者`--harmony`选项都能开启`PTC`

&emsp;&emsp;;`f(100000)`成功运行，理论上`f(n)`参数多大都能运行，但是注意节点数会影响运行时间。

```javascript
console.time('f(100000)')
console.log(f(100000)) // Infinity
console.timeEnd('f(100000)') // f(100000): 13.768ms
```

&emsp;&emsp;为什么仅严格模式`PTC`才会生效呢？

&emsp;&emsp;我们在非严格模式运行以下代码，注意`baz`不是尾调用。

```javascript
function bar(x, y, z) {
  console.log(bar.caller === foo) // true
  console.log(bar.arguments.callee.caller === foo) // true

  return x + y + z // A
}

function foo(x, y) {
  return bar(x, y, 3) // B
}

function baz(x) {
  foo(x, 2) // C
}

baz(1) // D
```

&emsp;&emsp;;`bar.caller`将返回调用`bar`的那个函数`foo`，`bar.arguments.callee`将返回`bar`函数。

&emsp;&emsp;那么引擎是如何获取的呢？

&emsp;&emsp;对于`bar.caller`，在调用栈中引擎将根据当前栈帧（`bar`栈帧），查找到它的上一个栈帧`foo`，然后返回那个栈帧所对应的函数，即`foo`函数。

```javascript
bar context
 ├── x
 ├── y
 ├── z
 └── Line B
foo context
 ├── x
 ├── y
 └── Line C
baz context
 ├── x
 └── Line D
global context
 ├── bar
 ├── foo
 └── baz
```

&emsp;&emsp;假设`PTC`在非严格模式下支持，优化后`foo`栈帧将被删除，`bar`返回的代码行被修改为`C`。那么`bar.caller`和`bar.arguments.callee.caller`都将返回`baz`。

```javascript
bar context
 ├── x
 ├── y
 ├── z
 └── Line C
baz context
 ├── x
 └── Line D
global context
 ├── bar
 ├── foo
 └── baz
```

&emsp;&emsp;能够发现优化后，造成`bar.caller`和`bar.arguments.callee.caller`都失真了，显然不是我们想看到的，为了保证结果正确，如果禁用`func.caller`和`func.arguments`问题将迎刃而解。

&emsp;&emsp;而恰好，严格模式就禁用了它们，但是注意禁用不单单是因为`PTC`，还有其他原因。

### 主要原因

&emsp;&emsp;既然尾递归优化如此好用，那么为何绝大多数浏览器都不支持呢？

#### 隐式优化

&emsp;&emsp;有两个主要原因，第一个原因就是隐式优化的问题，看了很多关于此问题的文章，讲的都是含糊不清，模棱两可。

&emsp;&emsp;现在来换一个角度，我来问你来答。

&emsp;&emsp;你如何确定写出了正确的尾递归？

&emsp;&emsp;你可能会说，我来一行一行检查代码，保证递归函数确实为尾部调用。

&emsp;&emsp;如果浏览器支持`PTC`，你将如何确定你的尾递归是被`PTC`优化了呢？

&emsp;&emsp;你可能会说，可以找一个没有开启`PTC`的浏览器，互相对比运行时间。

&emsp;&emsp;现在，你有没有发现，相较于你的日常开发，以上工作完全就是在浪费时间。另外为了写出正确的尾递归，你还要不断修改代码，不断调试。

&emsp;&emsp;如果你的尾递归正确，并且你也成功验证了浏览器的`PTC`优化。

```javascript
function f() {
  ...
  return f()
}

f()
```

&emsp;&emsp;以上代码在你的网页里时，当你打开浏览器，浏览器将无响应，且长时间处在加载状态。紧接着你将打开控制台，但是你会发现，控制台并没有任何报错，因为死循环被`PTC`优化了，将很难抛出爆栈错误。

&emsp;&emsp;那么你能否确定是资源加载慢的问题，还是别的代码有问题，还是死循环的问题等？以上代码可能还相对容易，但是代码体量大了之后，几乎很难排查出来。

&emsp;&emsp;最后一个问题，倘若浏览器不支持`PTC`，排查出原因最快多久呢？

&emsp;&emsp;哈哈，抢答，分分钟的事，浏览器抛出爆栈，很快就能定位。

&emsp;&emsp;因此概况来讲，也就是`隐式优化的过程是不受开发者控制和了解的`。

#### 栈帧丢失

&emsp;&emsp;第二个原因，由于`PTC`会删除中间帧，造成堆栈不连续，开发者在断点调试时，将难以理解执行情况。例如堆栈为`A B C D E F`（栈顶`F`），优化后为`A F`，你会非常纳闷，怎么就从函数`A`执行到函数`F`了呢。

&emsp;&emsp;其次，栈帧丢失也会影响`error.stack`的错误原因收集，进而造成客户端错误收集和分析工具失效。

```javascript
function bar() {
  throw new Error()
}

function foo() {
  return bar()
}

function baz() {
  foo()
}

baz()
```

&emsp;&emsp;以上代码未`PTC`优化的`error.stack`堆栈。

![](/js/tco/error.png)

&emsp;&emsp;;`PTC`优化（`v8.6.0`）的`error.stack`堆栈，对比发现，`foo`栈帧已被删除。

![](/js/tco/error-tco.png)

&emsp;&emsp;为了解决以上`error.stack`异常堆栈缺失的问题，又衍生了另外一种机制，即用 [shadow stack](https://bugs.webkit.org/attachment.cgi?id=274472&action=review)（影子堆栈）来恢复被删除的中间帧，为了区别，恢复的调用帧将被置为灰色。

&emsp;&emsp;在`Safari`浏览器已经实现了影子堆栈，但是，`V8`和`DevTools`团队认为，控制台的堆栈应当始终与真实情况一致，保证控制台是绝对可靠的。另外，由于是将删除的栈帧又恢复，对浏览器性能也会造成很大影响。

### STC

&emsp;&emsp;由于以上原因，`V8`强烈支持用特殊语法的方式来表示`PTC`，称为语法尾调用（`STC`，`Syntactic Tail Calls`）。

&emsp;&emsp;比较好看且直观的一种语法。

```javascript
// 普通函数
function f() {
  return continue f()
}

// 箭头函数
const f = () => continue f()
```

&emsp;&emsp;为什么更加推荐`STC`呢？

&emsp;&emsp;开发者可以确认是否写出了正确的尾递归，例如`return continue 1 + f()`的非尾递归将在编译阶段就抛出错误。另外对于尾递归死循环无响应的情况，可以通过增删关键字`continue`进一步确认。

&emsp;&emsp;因此可以说`STC`让隐式优化的过程可控了。但是栈帧丢失的问题，还是没有办法根本解决，毫无进展也是必然了（[已被遗弃](https://github.com/tc39/proposals/blob/main/inactive-proposals.md)）。

## 优化

&emsp;&emsp;既然浏览器层面暂时无法实现，那就来手动优化，原理也很简单，即减少调用栈长度，防止溢出爆栈。

&emsp;&emsp;尾递归的斐波那契。

```javascript
function f(n, m = 1, o = 1) {
  if (n <= 2) {
    return o
  }
  return f(n - 1, o, m + o)
}
```

### 循环

&emsp;&emsp;调用栈中仅包括`f(n)`一帧。

```javascript
function f(n, m = 1, o = 1) {
  while (n > 2 && n--) {
    [m, o] = [o, m + o]
  }
  return o
}

f(40) // 102334155
f(100000) // Infinity
```

&emsp;&emsp;缺点也很明显，递归不容易改写为循环，另外循环在语义上也不太容易理解。

### 蹦床函数

&emsp;&emsp;蹦床函数`trampoline`内部为循环结构。

```javascript
function trampoline(f) {
  while (f && typeof f === 'function') {
    f = f()
  }
  return f
}

function f(n, m = 1, o = 1) {
  if (n <= 2) {
    return o
  }
  return f.bind(null, n - 1, o, m + o)
}

trampoline(f(40)) // 102334155
trampoline(f(100000)) // Infinity
```

&emsp;&emsp;;`f(40)`调用栈活动。

```javascript
			                       f.bind(, 39)()                    f.bind(, 38)()                    f.bind(, 37)()
f(40) --> ___ --> trampoline() --> trampoline() --> trampoline() --> trampoline() --> trampoline() --> trampoline() --> trampoline() ...
```

&emsp;&emsp;原理上并不是函数内继续调用函数，而是返回一个新的函数，避开了递归执行。同时不会在原函数的调用帧上创建新的调用帧，而是原函数的调用帧弹出后，新的函数帧才会入栈，堆栈将始终在一帧或两帧之间弹跳。视觉上类似弹跳蹦床，蹦床函数名称也由此而来。

```javascript
   ___   ___   ___
___   ___   ___     
```

&emsp;&emsp;蹦床函数也存在一些缺点。

&emsp;&emsp;比如原递归函数要做改动，将返回值修改成返回新的函数。运行`f(n)`时，要嵌套执行`trampoline(f(n))`，不容易理解。性能上相对于原递归函数，也将会有所下降。

&emsp;&emsp;还有一个严重缺点，即只适用于返回结果为非函数的尾递归。

&emsp;&emsp;倘若递归结果就是返回一个函数。

```javascript
function f(n) {
  if (n <= 1) {
    return g
  }

  return f(n - 1)
}

function g() {
  return 1
}

f(4) // ƒ g()
```

&emsp;&emsp;引入蹦床函数。

```javascript
function f(n) {
  if (n <= 1) {
    return g
  }

  return f.bind(null, n - 1)
}

function g() {
  return 1
}

trampoline(f(4)) // 1
```

&emsp;&emsp;结果不一致了，原因很简单，返回的结果由于是函数，被蹦床函数执行了。

### 闭包

&emsp;&emsp;闭包形式的优化。

```javascript
function tco(func) {
  var value
  var active = false
  const accumulated = []

  return function accumulator(...args) {
    accumulated.push(args)

    if (!active) {
      active = true
      while (accumulated.length) {
        value = func.apply(this, accumulated.shift())
      }
      active = false

      return value
    }
  }
}

const f = tco(function fibonacci(n, m = 1, o = 1) {
  if (n <= 2) {
    return o
  }
  return f(n - 1, o, m + o)
})

f(40) // 102334155
f(100000) // Infinity
```

&emsp;&emsp;;`tco`为优化函数，返回`accumulator`函数。`fibonacci`为原始的尾递归函数，`f`为`tco`优化后的函数。

&emsp;&emsp;;`tco`闭包保存了四个私有变量，包括`value`、`active`和`accumulated`以及参数`func`。

&emsp;&emsp;以下为`f(40)`调用栈活动，注意`f(n)`运行之前，`fibonacci`等价于`func`，`f`等价于`accumulator`。

```javascript
                                  f(39)                                   f(38)                                   f(37)
		                func(40)  func(40)  func(40)            func(39)  func(39)  func(39)            func(38)  func(38)  func(38)
tco() --> ___ f(40) --> f(40) --> f(40) --> f(40) --> f(40) --> f(40) --> f(40) --> f(40) --> f(40) --> f(40) --> f(40) --> f(40) --> f(40) ...
```

&emsp;&emsp;堆栈可视化，保持在一帧到三帧之间活动。

```javascript
      ___         ___         ___
   ___   ___   ___   ___   ___   ___
___         ___         ___         ___
```

&emsp;&emsp;优点为原函数不用改动，语义清晰，容易迭代。缺点也很明显，调用栈活动时间长，造成性能大幅下降。

## 小结

 - 尾调用即函数尾部调用函数，若调用自身则为尾递归
 - 函数改写为尾递归，可减少函数的调用次数，避免程序超时，不能解决爆栈的问题
 - `PTC`或`TCO`，即尾调用优化，用以消除尾调用的中间帧，防止爆栈。
 - 递归函数的`PTC`，即为尾递归优化
 - `PTC`，存在隐式优化和栈帧丢失两个主要原因。隐式优化的过程很难受开发者的控制，栈帧丢失不利于调试和错误收集
 - 影子堆栈可解决栈帧丢失的问题，但是非常耗费性能
 - `STC`，用特殊语法来表示`PTC`，可解决隐式优化的问题，但是依然不能解决栈帧丢失
 - 尾递归的手动优化，包括改写为循环、蹦床函数、闭包，各有优缺点

## 参考

 - [哪些表达式为尾调用](https://2ality.com/2015/06/tail-call-optimization.html#checking-whether-a-function-call-is-in-a-tail-position)
 - [PTC 兼容性](http://kangax.github.io/compat-table/es6/#test-proper_tail_calls_(tail_call_optimisation))
 - [PTC 根本原因](https://v8.dev/blog/modern-javascript#proper-tail-calls)
 - [STC](https://github.com/tc39/proposal-ptc-syntax)
 - [STC / PTC 知乎讨论](https://www.zhihu.com/question/473997712)

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125) / [Gitee](https://gitee.com/dongwei1125)、[GitHub Pages](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~