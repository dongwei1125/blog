# JavaScript 严格模式差异性对比

![](/js/strict/banner.jpg)

## 前言

&emsp;&emsp;;[严格模式](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Strict_mode)（`strict mode`）由`ES5`引入，用于消除部分语法错误，提高运行效率，规范`JavaScript`语法等。

&emsp;&emsp;此文细致梳理了严格模式与非严格模式的差异， 目的仅是为了加深对严格模式的认识。

## 开启

### 脚本文件

&emsp;&emsp;为脚本文件开启严格模式，以下第一个脚本未开启严格模式，第二个脚本将开启严格模式。

```javascript
<body>
  <script>
    foo = 33
    console.log(window.foo) // 33 
  </script>

  <script>
    'use strict'
    bar = 33 // Uncaught ReferenceError: bar is not defined
  </script>
</body>
```

> 注意代码中除了注释之外，`'use strict'`一定要位于脚本首行，否则将不会生效

### 函数

&emsp;&emsp;为函数开启严格模式。

```javascript
function fn() {
  'use strict'
  ...
}
```

&emsp;&emsp;另外如果函数参数指定了默认值、使用了解构或者剩余参数，函数内部将不能显示声明严格模式，否则将报错。

```javascript
function fn(first = 1) { // Uncaught SyntaxError: Illegal 'use strict' directive in function with non-simple parameter list
  'use strict'
}

function fn({ foo }) {
  'use strict'
}

function fn(...rest) {
  'use strict'
}
```

&emsp;&emsp;那么为什么以上三种情况将会报错呢？

&emsp;&emsp;;`'use strict'`原意是让函数参数和函数体都以严格模式运行，注意函数执行时，是先执行参数，然后再执行函数体。

&emsp;&emsp;而不合理的地方在于，函数内指定了严格模式，运行时，参数没有办法确定以何种模式运行，因为函数体还未执行。

&emsp;&emsp;;`V8`引擎在`ES5`时考虑过延迟报错，即解析了函数体之后再来判断参数是否满足严格模式，但是会有性能问题，同时也会增加复杂性，因此干脆统统禁用掉。

&emsp;&emsp;解决方式也很简单，无非就是考虑如何让参数也开启严格模式。第一种方式就是全局开启严格模式。

&emsp;&emsp;第二种方式可利用自执行函数，形成闭包结构。

```javascript
var fn = (function () {
  'use strict'
  return function (first = 1) {
	...
  }
})()
```

## 变量

### 创建全局变量

&emsp;&emsp;非严格模式，将创建为全局变量。

```javascript
foo = 22
console.log(window.foo) // 22
```

&emsp;&emsp;严格模式，无法再意外创建全局变量。

```javascript
'use strict'
foo = 22 // Uncaught ReferenceError: foo is not defined
console.log(window.foo)
```

### 删除变量

&emsp;&emsp;非严格模式，删除变量允许操作，但是不会生效。

```javascript
var foo = 22
delete foo
console.log(foo) // 22
```

&emsp;&emsp;严格模式，删除变量将抛出错误。

```javascript
'use strict'
var foo = 22
delete foo // Uncaught SyntaxError: Delete of an unqualified identifier in strict mode
console.log(foo)
```

### 保留的关键字

&emsp;&emsp;非严格模式，允许关键字作为变量名。

```javascript
var let = 22
console.log(let) // 22
```

&emsp;&emsp;严格模式，禁止`implements`、`interface`、`let`、`package`、`private`、`protected`、`public`、`static`和`yield`作为变量名。

```javascript
'use strict'
var let = 22 // Uncaught SyntaxError: Unexpected strict mode reserved word
console.log(let)
```

### 八进制数值

&emsp;&emsp;非严格模式，允许`0`开头的八进制数值。

```javascript
var foo = 012
console.log(foo) // 10
```

&emsp;&emsp;严格模式，禁止`0`开头的八进制数值，`ES6`中可用`0o`或`0O`声明八进制数值。

```javascript
'use strict'
var foo = 012 // Uncaught SyntaxError: Octal literals are not allowed in strict mode
console.log(foo)
```

### eval / arguments

&emsp;&emsp;非严格模式，允许对关键字`eval`和`arguments`修改赋值。

```javascript
var eval = 22
console.log(eval) // 22

function fn(arguments) {
  console.log(arguments) // 3
}
fn(3)
```

&emsp;&emsp;严格模式，禁止对关键字`eval`和`arguments`修改赋值。

```javascript
'use strict'
var eval = 22 // Uncaught SyntaxError: Unexpected eval or arguments in strict mode
console.log(eval)

'use strict'
function fn(arguments) { // Uncaught SyntaxError: Unexpected eval or arguments in strict mode
  console.log(arguments)
}
fn(3)
```

### 小结

 - 无法意外创建全局变量
 - 不能使用`delete`删除变量
 - 禁止使用`implements`、`interface`、`let`、`package`、`private`、`protected`、`public`、`static`和`yield`等关键字作为变量名
 - 禁止`0`开头的八进制数值
 - 禁止对关键字`eval`和`arguments`修改赋值

## 对象

### 属性赋值

&emsp;&emsp;非严格模式，对象上的只读属性和不可修改属性赋值时均不会生效。

```javascript
const foo = { get x() { return 1 } }
foo.x = 5
console.log(foo) // {x: 1}

const bar = {}
Object.defineProperty(bar, 'x', {
  value: 2,
  writable: false
})
bar.x = 6
console.log(bar) // {x: 2}
```

&emsp;&emsp;严格模式，赋值时将抛出错误。

```javascript
'use strict'
const foo = { get x() { return 1 } }
foo.x = 5 // Uncaught TypeError: Cannot set property x of #<Object> which has only a getter
console.log(foo)

'use strict'
const bar = {}
Object.defineProperty(bar, 'x', {
  value: 2,
  writable: false
})
bar.x = 6 // Uncaught TypeError: Cannot assign to read only property 'x' of object '#<Object>'
console.log(bar)
```

### 删除属性

&emsp;&emsp;非严格模式，不可配置属性删除时不会生效。

```javascript
const foo = {}
Object.defineProperty(foo, 'x', { value: 2, configurable: false })
delete foo.x
console.log(foo) // {x: 2}
```

&emsp;&emsp;严格模式，不可配置属性删除时会报错。

```javascript
'use strict'
const foo = {}
Object.defineProperty(foo, 'x', { value: 2, configurable: false })
delete foo.x // Uncaught TypeError: Cannot delete property 'x' of #<Object>
console.log(foo)
```

### 添加属性

&emsp;&emsp;非严格模式，为不可拓展的对象添加属性不会生效。

```javascript
const foo = {}
Object.preventExtensions(foo)
foo.x = 2
console.log(foo) // {}
```

&emsp;&emsp;严格模式，为不可拓展的对象添加属性将报错。

```javascript
'use strict'
const foo = {}
Object.preventExtensions(foo)
foo.x = 2 // Uncaught TypeError: Cannot add property x, object is not extensible
console.log(foo)
```

### 小结

 - 只读属性和不可修改属性赋值时将抛出错误
 - 不可配置属性修改时将抛出错误
 - 不可拓展对象添加属性时将抛出错误

## 函数

### 形参重复

&emsp;&emsp;非严格模式，参数名可以重复。

```javascript
function fn(foo, foo, bar) {
  console.log(foo, foo, bar) // 2 2 3
}
fn(1, 2, 3)
```

&emsp;&emsp;严格模式，要求形参名唯一。

```javascript
'use strict'
function fn(foo, foo, bar) { // Uncaught SyntaxError: Duplicate parameter name not allowed in this context
  console.log(foo, foo, bar)
}
fn(1, 2, 3)
```

### arguments 与 形参关系

&emsp;&emsp;非严格模式，`arguments`与形参严格绑定。

```javascript
function fn(foo) {
  foo = 22
  console.log(foo, [...arguments]) // 22 [22, 2]
  arguments[0] = 99
  console.log(foo, [...arguments]) // 99 [99, 2]
}
fn(1, 2)
```

&emsp;&emsp;严格模式，`arguments`与形参不再绑定。

```javascript
'use strict'
function fn(foo) {
  foo = 22
  console.log(foo, [...arguments]) // 22 [1, 2]
  arguments[0] = 99
  console.log(foo, [...arguments]) // 22 [99, 2]
}
fn(1, 2)
```

### arguments.callee

&emsp;&emsp;非严格模式，可以访问 [arguments.callee](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/arguments/callee)。

```javascript
function fn() {
  console.log(arguments.callee)
}
fn()
```

&emsp;&emsp;严格模式，不支持调用`arguments.callee`。

```javascript
'use strict'
function fn() {
  console.log(arguments.callee) // Uncaught TypeError: 'caller', 'callee', and 'arguments' properties may not be accessed on strict mode functions or the arguments objects for calls to them
}
fn()
```

&emsp;&emsp;为什么`arguments.callee`从`ES5`严格模式中删除了呢？

&emsp;&emsp;有两个主要原因，第一个原因是在实现`arguments.callee`的基础上，浏览器引擎不太可能实现尾递归。

&emsp;&emsp;另一个原因是递归调用时，`this`的指向会不一样。

&emsp;&emsp;以下递归代码中，运行`fn`函数时，内部`this`指向`window`。但是运行`arguments.callee`时，函数内部`this`却指向了`arguments`。

```javascript
var args
function fn(val) {
  if (val) {
    console.log(this === args, this) // true Arguments []
  } else {
  	console.log(this) // Window {}
    args = arguments
    arguments.callee(true)
  }
}
fn()
```

&emsp;&emsp;原因也很简单，`arguments.callee`指向当前函数，相当于在`arguments`对象上添加了`callee`方法。我们知道的是，对象方法内部的`this`一般指向调用者，也即是此处的`arguments`。

```javascript
// arguments.callee = fn
arguments.callee(true)
```

### this

&emsp;&emsp;非严格模式，普通函数内部`this`指向顶层对象。

```javascript
function fn() {
  console.log(this) // window {}
}
fn()
```

&emsp;&emsp;严格模式，普通函数内部`this`指向`undefined`。

```javascript
'use strict'
function fn() {
  console.log(this) // undefined
}
fn()
```

### Function.caller / Function.arguments

&emsp;&emsp;非严格模式，[Function.caller](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/caller) 返回调用当前函数的函数，[Function.arguments](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/arguments) 返回函数实参。

```javascript
function foo() {
  function bar() {
    console.log(bar.arguments) // 3 4
    console.log(bar.caller === foo) // true
  }
  bar(3, 4)
}
foo()
```

&emsp;&emsp;严格模式，禁用`Function.caller`和`Function.arguments`。

```javascript
'use strict'
function foo() {
  function bar() {
    console.log(bar.caller === foo) // Uncaught TypeError: 'caller', 'callee', and 'arguments' properties may not be accessed on strict mode functions or the arguments objects for calls to them
  }
  bar(3, 4)
}
foo(1, 2)
```

### 小结

 - 函数形参名唯一
 - 函数形参与`arguments`取消绑定关系
 - 删除`arguments.callee`、禁用`Function.caller`和`Function.arguments`
 - 普通函数内部`this`指向`undefined`

## 其它

### 简单数据设置属性

&emsp;&emsp;非严格模式，简单数据可设置属性，但是不会生效。

```javascript
var foo = 123
foo.true = 88
console.log(foo.true) // undefined
```

&emsp;&emsp;严格模式，简单数据设置属性将抛出错误。

```javascript
'use strict'
var foo = 123
foo.true = 88 // Uncaught TypeError: Cannot create property 'true' on number '123'
console.log(foo.true)
```

### with

&emsp;&emsp;非严格模式，支持`with`。

```javascript
var foo = { bar: 1 }
with (foo) {
  console.log(bar) // 1
}
```

&emsp;&emsp;严格模式，禁用`with`。

```javascript
'use strict'
var foo = { bar: 1 }
with (foo) { // Uncaught SyntaxError: Strict mode code may not include a with statement
  console.log(bar)
}
```

### eval

&emsp;&emsp;非严格模式，`eval`内声明的变量会注入到上层。

```javascript
var x = 1
var z = eval('var y = 2; x + y')
console.log(x, z) // 1 3
console.log(y) // 2
```

&emsp;&emsp;严格模式，`eval`内声明的变量仅在`eval`内部作用域有效，不会注入到上层。

```javascript
'use strict'
var x = 1
var z = eval('var y = 2; x + y')
console.log(x, z) // 1 3
console.log(y) // Uncaught ReferenceError: y is not defined
```

### 小结

 - 简单数据设置属性将抛出错误
 - 禁用`with`
 - `eval`声明变量仅在`eval`内部作用域有效，不会再注入到上层

## 常见问题

### 块级作用域下的函数声明

&emsp;&emsp;由于浏览器差异，所支持的`ECMAScript`版本或者实现程度的不同，以下代码的结果将会有明显差异。

```javascript
// 'use strict'
function fn() { console.log('outer') }

(function () {
  console.log(fn)
  if (true) {
    console.log(fn)
    function fn() { console.log('inner') }
  }
  fn()
}())
```

&emsp;&emsp;;`ES5`（`IE10`浏览器）下非严格模式，函数`fn`将会提升至函数作用域的顶部。

```javascript
function fn() { console.log('outer') }

(function () {
  function fn() { console.log('inner') }
  console.log(fn) // function fn() { console.log('inner') }
  if (true) {
    console.log(fn) // function fn() { console.log('inner') }
  }
  fn() // inner
}())
```

&emsp;&emsp;;`IE10`浏览器严格模式下，解析阶段就会抛出错误，因为`ES5`中明确`if`块下的函数声明是非法的。

```javascript
'use strict'
function fn() { console.log('outer') }

(function () {
  console.log(fn)
  if (true) {
    console.log(fn)
    function fn() { console.log('inner') } // 在 strict 模式下，函数声明无法嵌套在语句或块内。这些声明仅出现在顶级或直接出现在函数体内。
  }
  fn()
}())
```

&emsp;&emsp;;`Chrome`、`Edge`、`IE11`等`ES6`浏览器下非严格模式，将类似于`var`声明，并提升至块级作用域顶部。

```javascript
function fn() { console.log('outer') }

(function () {
  console.log(fn) // undefined
  if (true) {
    var fn = function () { console.log('inner') }
    console.log(fn) // function fn() { console.log('inner') }
  }
  fn() // inner
}())
```

&emsp;&emsp;;`Chrome`、`Edge`、`IE11`等`ES6`浏览器下严格模式，将提升块级作用域的顶部。

```javascript
'use strict'
function fn() { console.log('outer') }

(function () {
  console.log(fn) // fn() { console.log('outer') }
  if (true) {
    function fn() { console.log('inner') }
    console.log(fn) // fn() { console.log('inner') }
  }
  fn() // outer
}())
```

&emsp;&emsp;那么是为什么呢？

&emsp;&emsp;目前绝大多数浏览器都是`ES6`了，`IE10`支持`ES5`。

&emsp;&emsp;先来说说`ES5`的情况，`ES5`中明确了`if`块中的函数声明是不正确的（浏览器不会报错）。为了兼容以前的旧代码，浏览器未完全遵循规范，可以运行不会报错。但是新代码想支持此方式，以此来规范代码呢？于是就可以部分开启严格模式。

&emsp;&emsp;再来说说`ES6`的情况，`ES6`引入了块级作用域，允许块级作用域下声明函数。同理为了兼容性，浏览器未严格遵循`ES6`规范，但是注意与`ES5`会有所差异。而`ES6`中的严格模式，明确遵循规范。

&emsp;&emsp;差异性在于，`ES5`中，没有块级作用域，非严格模式`if`块内的函数会被提升到函数作用域或全局作用域的顶部，严格模式解析阶段将抛出错误。`ES6`中，引入了块级作用域，非严格模式块级作用域下的函数声明类似`var`，并提升至块级作用域顶部，严格模式下函数将提升至块级作用域顶部。

&emsp;&emsp;此类情况出现的原因也能很好理解。

&emsp;&emsp;实际上一门语言最初不可能达到完美，随着时间的推移，你会发现`JavaScript`语言越来越趋于规范，而发展过程中难免会有很多过渡情况，对于严格模式和非严格模式而言，非严格模式用于浏览器满足部分规范的同时向下兼容，严格模式则用于严格遵循规范。

&emsp;&emsp;可以看出`JavaScript`目前处于向规范语言过渡的阶段，两种模式都是此阶段的产物，未来发展到一定时间，倘若绝大部分的网页都是以严格模式运行，那么将来的某一天`'use strict'`显示声明严格模式的方式也会被取消，浏览器也将默认为严格模式。

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125) / [Gitee](https://gitee.com/dongwei1125)、[GitHub Pages](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~