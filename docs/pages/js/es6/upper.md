# ES6 不完全手册（上）

![](/js/es6/banner.jpg)

## 前言

&emsp;&emsp;此篇是阅读[《ES6 标准入门》](https://es6.ruanyifeng.com/)的记录小册，保留了阅读当时的记忆和拓展，以便于后续查阅，分享出来，希望对你有用。关于`ES6`的`API`更为详细的部分还是推荐参考[《ES6 标准入门》](https://es6.ruanyifeng.com/)，只是此文相对会精简很多，同时也包括一些未提及的内容。

> `2015`年`6`月`ECMAScript`的第六个版本发布了，即通常所说的`ES6`（或者`ES2015`）

## 语法提案

&emsp;&emsp;一个新语法从提出到成为正式标准，需要经历[5个阶段](https://tc39.es/process-document/)，一般只要能进入`Stage 2`阶段，就可能会包括在以后的正式标准中。

 - `Stage 0`：`Strawman`，稻草人阶段，只能由`TC39`成员或`TC39`构建者提出
 - `Stage 1`：`Proposal`，提案阶段，只能由`TC39`成员发起，且方案中必须书面包含示例、`API`以及相关的语义和算法
 - `Stage 2`：`Draft`，草案阶段，正式规范语言并且精确描述语法和语义
 - `Stage 3`：`Candidate`，候选阶段，基本实现，等待用户反馈以改进
 - `Stage 4`：`Finished`，定案阶段，必须通过`Test262`测试，准备纳入`ECMAScript`标准中

> 标准委员会，又称 [TC39](https://tc39.es/) 委员会，负责并管理着`ECMAScript`语言和标准化`API`

&emsp;&emsp;比如[可选链](https://github.com/tc39/proposal-optional-chaining/)（`Optional Chaining`）操作符`?.`，于`2017`年的`Stage 0`阶段，一直到`2020`年被正式地纳入了`ES2020`规范。

```javascript
a?.b
a == null ? undefined : a.b
```

## Babel

&emsp;&emsp;为了更好地理解一些`API`，或者了解`ES6`语法的`ES5`实现，可以安装 [Babel](https://www.babeljs.cn/) 来转码。

&emsp;&emsp;最为常用的就是命令行转码，最小安装`babel/core`、`babel/cli`和`babe/preset-env`，其中`babel/core`为`babel`的核心依赖，`babel/cli`用于命令行转码，`babel/preset-env`为官方提供的预制器，能够根据配置自动添加插件和补丁来编译`ES6+`的代码。

```javascript
npm install -D @babel/core @babel/cli @babel/preset-env
```

&emsp;&emsp;添加`.babelrc`以引入`babel/preset-env`，并配置`script`命令，运行后将转换`src`中的`ES6`代码并输出到`dist`下。

```javascript
// .babelrc
{
  "presets": [
    "@babel/preset-env"
  ],
  "plugins": []
}

// package.json
{
  ...
  "scripts": {
    "trans": "babel src -d dist"
  }
}
```

## 变量声明

&emsp;&emsp;;`ES6`声明变量的方式一共有六种，分别为`var`、`function`、`let`、`const`、`class`、`import`，其中`var`和`function`是`ES5`的。

### var

&emsp;&emsp;;`ES5`中只有全局作用域和函数作用域。

 - 存在变量提升，并且会被提升至函数或全局作用域的顶部
 - 全局声明的变量会成为顶层对象的属性
 - 可以重复声明变量

```javascript
console.log(foo) // undefined

if (true) {
  var foo = 2
  console.log(window.foo) // 2
}
```

> 注意`if`的判断条件无论是`true`还是`false`，都是不会影响变量提升的行为的

&emsp;&emsp;稍不注意`foo`就声明为了全局变量，以上代码相当于。

```javascript
var foo
console.log(foo) // undefined

if (true) {
  foo = 2
  console.log(window.foo) // 2
}
```

### let

&emsp;&emsp;而`let`声明的变量相对就合理很多，并且引入了块级作用域。

 - 声明的变量仅在当前块级作用域内有效
 - 没有变量的提升，存在暂时性死区（`TDZ`，`let`声明的变量之前，都是不可访问的）
 - 同一个作用域下不可重复声明同一个变量
 - 全局声明的变量不会挂在顶层对象上

&emsp;&emsp;推荐一篇文章[《两个月的时间理解 Let》](https://zhuanlan.zhihu.com/p/28140450)，大致概括为`js`的变量包括创建（`create`）、初始化（`initialize`）和赋值（`assign`）三个阶段，其中。

- 通常所说的`var`变量提升指的是提升了`创建`和`初始化`两个阶段
- `let/const`声明的变量将提升`创建`阶段，`初始化`阶段未被提升，因此严格来说没有变量提升也是对的
- `function`声明的函数将提升`创建`、`初始化`和`赋值`三个阶段

&emsp;&emsp;以下`{}`中`foo`仅`创建`阶段被提升，而`初始化`阶段没有被提升，因此会提示在初始化之前无法访问`foo`，也即是`TDZ`形成的根本原因。

```javascript
var foo = 1

{
  console.log(foo) // Uncaught ReferenceError: Cannot access 'foo' before initialization
  let foo = 2
}
```

&emsp;&emsp;;`ES5`中`typeof`是一个绝对安全的操作，对于不存在的变量返回`undefined`，但是由于`TDZ`的形成，将不再成立。

```javascript
typeof foo // Uncaught ReferenceError: Cannot access 'foo' before initialization
let foo = 1
```

### const

&emsp;&emsp;;`const`大体上与`let`一致，细微差异在于。

 - 一旦声明就要赋值，且以后不能再被修改
 - 声明复合类型时，可以修改其属性，但是不能将其指向另外的地址

```javascript
const foo = {
  prop: 1
}

foo.prop = 2 // {prop: 2}
foo = {} // Uncaught TypeError: Assignment to constant variable
```

### for 循环

&emsp;&emsp;;`for`循环中存在两个作用域（循环条件和循环体），其中循环条件为父作用域，循环体为子作用域。以下输出`3`次`a`，也印证了循环条件和循环体有着各自的作用域。

```javascript
for (let i = 0; i < 3; i++) {
  let i = 'a'
  console.log(i)
}
```

&emsp;&emsp;以下循环将连续输出`5`个`5`，未达到预期`0 1 2 3 4`的输出结果。

```javascript
for (var i = 0; i < 5; i++) {
  setTimeout(() => {
    console.log(i)
  })
}
```

&emsp;&emsp;以往`ES5`中是利用闭包来解决。

```javascript
for (var i = 0; i < 5; i++) {
  (function (i) {
    setTimeout(() => {
      console.log(i)
    })
  })(i)
}
```

&emsp;&emsp;而`ES6`中随着`let`的引入，问题得到很好的解决。

```javascript
for (let i = 0; i < 5; i++) {
  setTimeout(() => {
    console.log(i)
  })
}
```

&emsp;&emsp;注意在每一轮循环时，`JavaScript`引擎都会为循环变量`i`单独生成一个新的变量，并且它会记住上一轮循环的值，并初始化本轮的值，以上代码相当于。

```javascript
{
  let i = 0
  setTimeout(()=>{
    console.log(i)
  })
}
...
{
  let i = 4
  setTimeout(()=>{
    console.log(i)
  })
}
```

&emsp;&emsp;;`babel`转换`let`即是利用的闭包。

```javascript
"use strict";

var _loop = function _loop(i) {
  setTimeout(function () {
    console.log(i);
  });
};

for (var i = 0; i < 5; i++) {
  _loop(i);
}
```

### 块级作用域下函数声明

&emsp;&emsp;;`ES5`在块级作用域中声明函数是非法的（浏览器不会报错），而`ES6`中是允许的。

```javascript
function f() { console.log('outer') }

(function () {
  console.log(f)
  if (true) {
    console.log(f)
    function f() { console.log('inner') }
  }
  f()
}())
```

&emsp;&emsp;以上代码在`ES5`中（`IE10`浏览器）运行，`f`将提升至函数顶部，相当于。

```javascript
function f() { console.log('outer') }

(function () {
  function f() { console.log('inner') }
  console.log(f) // function f() { console.log('inner') }
  if (true) {
    console.log(f) // function f() { console.log('inner') }
  }
  f() // inner
}())
```

&emsp;&emsp;但是对于`ES6`，相当于。

```javascript
function f() { console.log('outer') }

(function () {
  var f
  console.log(f) // undefined
  if (true) {
    function f() { console.log('inner') }
    console.log(f) // function() { console.log('inner') }
  }
  f() // inner
}())
```

&emsp;&emsp;因此对于`ES6`浏览器。

 - 允许在块级作用域声明变量
 - 类似`var`，将提升至函数或全局作用域的顶部
 - 并且也会再提升至当前所在块级作用域的顶部

&emsp;&emsp;说了那么多，即由于环境差异较大，应当避免在块级作用域下声明函数，即使要使用，优先使用函数表达式，而不是声明语句。

```javascript
{
  let f = function () { }
}
```

### 顶层对象

&emsp;&emsp;;`ES2020`引入了`globalThis`指向顶层对象，在任何环境下都是存在的。

 - 浏览器中，顶层对象是`window`，`self`也指向`window`
 - `node`环境下，顶层对象是`global`

&emsp;&emsp;另外注意`js`文件在`node`环境下运行（例如`node index.js`）。

```javascript
// index.js
var foo = 2
console.log(global.foo) // undefined
```

&emsp;&emsp;打印`undefined`是必然的，原因是以上代码会被函数包裹，`var`声明的变量相当于只是函数中的局部变量，并不是全局变量。

```javascript
function(exports, require, module, filename, dirname){
   var foo = 2
   console.log(global.foo)
}
```

&emsp;&emsp;如果进入`node`指令窗口（命令行运行`node`即可），运行刚才的代码，`foo`将是`global`上的属性。

## 解构

### 数组

&emsp;&emsp;数组的元素是按次序排列的，解构时变量取值由它的位置决定。

&emsp;&emsp;若被解构的元素是不可遍历的结构，将会报错。

```javascript
const [foo] = 1 // Uncaught TypeError: 1 is not iterable
const [foo] = false // Uncaught TypeError: false is not iterable
const [foo] = NaN // Uncaught TypeError: NaN is not iterable
const [foo] = undefined // Uncaught TypeError: undefined is not iterable
const [foo] = null // Uncaught TypeError: null is not iterable
const [foo] = {} // Uncaught TypeError: {} is not iterable
```

&emsp;&emsp;对象若要能遍历可以部署`Symbol.iterator`接口。

```javascript
const foo = {
  [Symbol.iterator]() {
    return {
      next() {
        return {
          value: 1,
          done: false
        }
      }
    }
  }
}

const [first] = foo // 1
```

&emsp;&emsp;另外只有当数组成员严格等于（`===`）`undefined`时，默认值才会生效。

```javascript
const [foo = 1] = [undefined] // 1
const [foo = 1] = [null] // null
```

&emsp;&emsp;数组解构也可用于简化运算，以下实现了斐波那契数列。

```javascript
for (var i = 0, x = 1, y = 1; i < 10; i++) {
  [x, y] = [x + y, x]
  console.log(x) // 2 3 5 8 13 21 34 55 89 144
}
```

&emsp;&emsp;其它一些情况。

```javascript
const [foo, [[bar], baz]] = [1, [[2], 3]] // 1 2 3
const [first, , ...rest] = [1, 2, 3, 4] // 1 [3, 4]
const [, second, ...rest] = 'hello' // e ["l", "l", "o"]

const foo = Object.create([1, 2, 3])
const [first] = foo // 1
```

&emsp;&emsp;注意例`3`中由于字符串`hello`的原型上有`Symbol.iterator`，因此是可以遍历的。

&emsp;&emsp;例`4`中创建的空对象`foo`的原型指向了数组`[1, 2, 3]`，按理说空对象`foo`是不能遍历的，因为它没有部署遍历器接口，但是未获取到`foo[Symbol.iterator]`属性时，就会沿着原型链向上查找，即`foo.__proto__[Symbol.iterator]`，也就是`[1, 2, 3][Symbol.iterator]`，因此最终相当于是在解构数组`[1, 2, 3]`。

> 你可以改写数组的`Symbol.iterator`方法，看看是否会执行

### 对象

&emsp;&emsp;对象不同于数组的方式，变量与属性同名就能取到。另外对象解构也是当属性严格等于`undefined`时，默认值才生效。

&emsp;&emsp;指定变量名。

```javascript
const { foo: baz } = { foo: 1 }
console.log(baz) // 1
```

&emsp;&emsp;对象解构也能获取到原型链上的值。

```javascript
const foo = {}
Object.setPrototypeOf(foo, { baz: 'baz' })
const { baz } = foo // baz
```

&emsp;&emsp;解构对象上的复合类型，以下均是浅拷贝。

```javascript
const model = { value: 1 }
const list = [1, 2, 3]
const { prop: { model: foo, list: bar } } = { prop: { model, list } }
console.log(foo === model, list === bar) // true true
```

&emsp;&emsp;其它一些情况。

```javascript
const { foo, ...rest } = { foo: 1, bar: 2, baz: 3 } // 1 {bar: 2, baz: 3}
const { foo = 1, bar = 2, baz } = { foo: null } // null 2 undefined
const { foo, foo: { bar } } = { foo: { bar: 3 } } // {bar: 3} 3
const { 0: first, length } = [1, 2, 3] // 1 3
```

### 其它类型

&emsp;&emsp;对于数值或布尔值，会先转为对象再解构。例如数值`123`，会调用`Number`将其包装为数值对象，即`new Number(123)`。

```javascript
const { toString: fn } = 123
fn === Number.prototype.toString // true

const { toString: fn } = true
fn === Boolean.prototype.toString // true
```

&emsp;&emsp;对于字符串，对象方式的解构时会调用`String`将其包装为字符串对象，也就是类数组对象。

```javascript
// new String('hello') {0: "h", 1: "e", 2: "l", 3: "l", 4: "o", length: 5}
const { 1: second, ...rest } = 'hello' // e {0: "h", 2: "l", 3: "l", 4: "o"}
const { length } = 'hello' // 5
```

## 字符串

### 模板字符串

&emsp;&emsp;若插值内是一个对象，将默认调用它的`toString`方法。

```javascript
const msg = {
  toString() {
    return 'world'
  }
}
console.log(`hello ${msg}`) // hello world

const l = [1, 2, 3]
console.log(`${l}`) // 1,2,3
```

&emsp;&emsp;模板字符串中，若插值有`n`个，则调用它的标签函数的参数就有`n + 1`个，除第一个参数外，其余参数均为各个插值表达式的计算结果，而第一个参数为模板字符串切割掉各个插值所剩下的字符串组成的数组。

> 另外第一个参数上还有一个`raw`属性，也是数组，它的每一项对应第一个参数中的每一项，然后在它们的斜杠前面再加一个斜杠，使其转义效果都失效。

&emsp;&emsp;以下模板字符串中插值有`3`个，因此标签函数`tag`的参数有`4`个，除第一个参数外，标签函数剩余的参数分别为`1` `2` `3`，第一个参数为数组`["", " + ", " = ", ""]`，它的`raw`属性为`["", " \x2b ", " = ", ""]`，而`raw`中虽然显示的是`\x2b`，但是实际上返回的是`\\x2b`。

```javascript
const a = 1, b = 2
const tag = (array, ...args) => { // ["", " + ", " = ", "", raw: ["", " \x2b ", " = ", ""]] [1, 2, 3]
  console.log(array.raw[1] === ' \\x2b ') // true
  return array.reduce((prev, next, i) => {
    return prev + args[i - 1] + next
  })
}

tag`${a} \x2b ${b} = ${a + b}` // 1 + 2 = 3
```

&emsp;&emsp;唯一一个内置的标签函数是`String.raw()`，它的作用很简单，作为标签函数使用时，在其斜杠前面再加一个斜杠，作为普通函数时，模拟插值拼接参数。比如例`2`中模拟的是`h${0}e${1}l${2}lo`，例`3`模拟的是`foo${1 + 2}bar${'e' + 'f'}baz`，而例`4`则是将字符串打散再还原。

```javascript
String.raw`\\n` === '\\\\n' // true
String.raw({ raw: 'hello' }, 0, 1, 2) // h0e1l2lo
String.raw({ raw: ['foo', 'bar', 'baz'] }, 1 + 2, 'e' + 'f') // foo3barefbaz

const a = 1, b = 2
const tag = (raw, ...args) => { // ["", " + ", " = ", ""] [1, 2, 3]
  return String.raw({ raw }, ...args)
}
tag`${a} \x2b ${b} = ${a + b}` // 1 + 2 = 3
```

### ToPrimitive

&emsp;&emsp;深入一点来说，对象转换为原始值（原始类型包括`String`、`Number`、`Boolean`、`undefined`、`null`）时，都会进行 [ToPrimitive](https://tc39.es/ecma262/#sec-toprimitive) 抽象运算。

&emsp;&emsp;;`ToPrimitive(input, preferredType)`，`input`为被转换对象，`preferredType`为期望返回的结果类型，包括`number`、`string`和`default`。

&emsp;&emsp;一般的比如`+foo`正运算、`Number(object)`，`preferredType`为`number`。

&emsp;&emsp;;`foo + baz`加法运算、`==`对象的隐式转换，`preferredType`为`default`。

&emsp;&emsp;;`${foo}`模板字符串插值、`string.search(regexp)`、`String(object)`、`parseInt(object)`，`preferredType`为`string`。

&emsp;&emsp;;`ToPrimitive`运算流程简述为。

 - 判断`input`是否为对象，不是则返回`input`
 - 判断对象是否有`[Symbol.toPrimitive](hint){}`方法，若有，则令此方法的参数`hint`为`preferredType`（若`preferredType`不存在，将`hint`设为`number`）。若方法的执行结果为非对象（原始值），则返回，否则抛出`TypeError`错误
 - 执行`OrdinaryToPrimitive(input, preferredType)`运算

&emsp;&emsp;;`OrdinaryToPrimitive`运算流程简述为。

 - 若`hint`为`string`，先调用`toString()`，如果为非对象（原始值）那么返回它。否则再调用`valueOf()`，如果为非对象（原始值）那么返回它，否则抛出`TypeError`错误
  - 若`hint`为`number/default`，恰好相反，会先调用`valueOf()`，再调用`toString()`

###  includes / startWith / endsWith

&emsp;&emsp;;[includes](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/includes) 用于判断一个字符串是否在另一个字符串中，返回布尔值，注意第二个为可选参数，表示开始搜索的位置，默认为`0`。

```javascript
if (!String.prototype.includes) {
  String.prototype.includes = function (searchString, position) {
    return this.indexOf(searchString, position) !== -1
  }
}

'hello world'.includes('llo', 1) // true
```

&emsp;&emsp;;[startsWith](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith) 用于判断一个字符串是否在另一个字符串的头部，它的第二个参数与`includes`一致。

```javascript
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function (searchString, position) {
    return this.slice(position, position + searchString.length) === searchString
  }
}

'hello world'.startsWith('llo', 2) // true
```

&emsp;&emsp;;[endsWith](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith) 用于判断一个字符串是否在另一个字符串的尾部，注意它的第二个参数表示针对前`n`个字符。

```javascript
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function (searchString, length) {
    return this.slice(length - searchString.length, length) === searchString
  }
}

'hello world'.endsWith('llo', 5) // true
```

### repeat

&emsp;&emsp;;[repeat](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/repeat) 表示将字符串重复`n`次，返回一个新的字符串。

```javascript
if (!String.prototype.repeat) {
  String.prototype.repeat = function (count) {
    for (var result = '', weight = this, n = count; n > 0;) {
      if (n & 1) {
        result += weight
      }

      n = n >>> 1
      weight += weight
    }

    return result
  }
}

'ab'.repeat(5) // ababababab
```

&emsp;&emsp;注意`ES5`的实现中，`weight`为相对应二进制位的权值，例如二进制`...0111`中，第二、三、四位权值分别为`abababab`、`abab`、`ab`。另外`n & 1`表示取`n`的最后一个二进制位，若为`1`则加对应权值，为`0`不加。`n >>> 1`表示将数`n`的二进制位右移一位，利用`for`循环，从最后一位开始依次获取每一个二进制位的值。

&emsp;&emsp;因此当`n`为`5`时（二进制`...0101`），会经过三次循环，第一次`n & 1`获取最后一个二进制位的值，为`1`（对应权值为`ab`），拼接后`result`为`ab`，然后`n`右移一位（`...0010`），权值为`abab`。第二次`n & 1`获取的二进制位为`0`，不拼接，`n`右移一位（`...0001`），权值为`abababab`。第三次`n & 1`获取的二进制位为`1`（对应权值`abababab`），拼接后`result`为`ababababab`，然后`n`右移一位（`...000`），此时`n > 0`不再满足，退出循环。

### padStart / padEnd

&emsp;&emsp;;[padStart](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/padStart) 和 [padEnd](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/padEnd) 都是`ES2017`引入的，用于补全字符串长度，`padStart`用于补全头部，`padEnd`用于补全尾部。

&emsp;&emsp;注意以下`repeat`为字符串重复函数，另外`padEnd`和`padStart`的`ES5`实现类似。

```javascript
if (!String.prototype.padStart) {
  String.prototype.padStart = function (targetLength, padString) {
    padString = padString || ' '

    var fillLen = targetLength - this.length
    padString = padString.repeat(Math.ceil(fillLen / padString.length))
    return padString.slice(0, fillLen) + this
  }
}

'abc'.padStart(10, "foo") // "foofoofabc"
'abc'.padEnd(10, "foo") // "abcfoofoof"
```

### trimStart / trimEnd

&emsp;&emsp;;[trimStart](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/trimStart) 和 [trimEnd](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/trimEnd) 都是`ES2019`引入的，用于去除字符串头尾的空白符，`trimStart`（别名`trimLeft`）用于去除头部的空白符，`trimEnd`（别名`trimRight`）用于去除尾部的空白符。

&emsp;&emsp;注意此处的空白符包括空格、换行符`\n`、制表符`\t`等，另外`\s`表示匹配任何空白字符。

```javascript
if (!String.prototype.trimStart) {
  String.prototype.trimStart = function () {
    return this.replace(/^\s+/, '')
  }
}

if (!String.prototype.trimEnd) {
  String.prototype.trimEnd = function () {
    return this.replace(/\s+$/, '')
  }
}

const s = '  foo  '
s.trim() // 'foo'
s.trimStart() // 'foo  '
s.trimEnd() // '  foo'
```

## 正则

### 具名组匹配

&emsp;&emsp;;`ES6`提取组匹配结果。

```javascript
const reg = /(\d{4})-(\d{2})-(\d{2})/
const [, y, m, d] = reg.exec('2020-12-07') // 2020 12 07
const format = '2020-12-07'.replace(reg, '$1/$2/$3') // 2020/12/07
```

&emsp;&emsp;缺点也非常明显，无法直观了解每个组的匹配含义。`ES2018`引入了具名组匹配，便于描述组的匹配含义。

```javascript
const reg = /(?<y>\d{4})-(?<m>\d{2})-(?<d>\d{2})/
const { groups: { y, m, d } } = reg.exec('2020-12-07') // 2020 12 07
const format = '2020-12-07'.replace(reg, '$<y>/$<m>/$<d>') // 2020/12/07
```

## 数值

### 进制

&emsp;&emsp;在`ES5`中整数可由十六进制（`0x`或`0X`）、八进制（`0`）和十进制表示。`ES6`中新增了八进制（`0o`或`0O`）和二进制（`0b`或`0B`）表示。

> 注意在严格模式下，`ES5`的八进制（`0`）表示不允许使用

&emsp;&emsp;另外 [Number](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number)、[Number.prototype.toString](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number/toString) 和 [parsetInt](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/parseInt) 都是可用于进制转换的。其中`Number`可转为十进制数值，`Number.prototype.toString`可转为固定进制的字符串，`parseInt`可转为十进制数值。

```javascript
Number('0b11') // 3
Number(0x11) // 17
(0o11).toString(10) // "9"
parseInt(11, 3) // 4
parseInt('1f', 16) // 31
```

### Number.isFinite

&emsp;&emsp;;[Number.isFinite](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite) 用于检查一个数值是否有限，注意`NaN`也是数值，`typeof NaN`为`number`。

&emsp;&emsp;另外只要参数不是数值类型，均返回`false`。

```javascript
Number.isFinite(10) // true
Number.isFinite(NaN) // false
Number.isFinite(-Infinity) // false
Number.isFinite('10') // false
```

&emsp;&emsp;;`ES5`兼容。

```javascript
if (!Number.isFinite) {
  Number.isFinite = function (value) {
    return typeof value === 'number' && isFinite(value)
  }
}
```

&emsp;&emsp;全局方法 [isFinite](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/isFinite) 存在隐式类型转换，会将参数转换为数值，转换后若值为`NaN`或者`Infinity`则返回`false`，否则为`true`。

```javascript
isFinite('10') // true

const object = {
  valueOf() {
    return 10
  }
}
isFinite(object) // true
```

### Number.isNaN

&emsp;&emsp;;[Number.isNaN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN) 用于检查一个数值是否为`NaN`。若参数不是数值，也是均返回`false`。

```javascript
Number.isNaN(NaN) // true
Number.isNaN(Infinity) // false
Number.isNaN(10) // false
Number.isNaN('10') // false
```

&emsp;&emsp;;`ES5`兼容。

```javascript
if (!Number.isNaN) {
  Number.isNaN = function (value) {
    return typeof value === 'number' && isNaN(value)
  }
}
```

&emsp;&emsp;全局方法 [isNaN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN) 也存在隐式类型转换，将参数转换为数值后再判断是否为`NaN`。

```javascript
isNaN('NaN') // true

const object = {
  valueOf() {
    return NaN
  }
}
isNaN(object) // true
```

### Number.isInteger

&emsp;&emsp;;[Number.isInteger](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger) 用于判断一个数值是否为整数，若参数为非数值，则返回`false`。

```javascript
Number.isInteger(3) // true
Number.isInteger(3.1) // false
Number.isInteger(Infinity) // false
Number.isInteger(NaN) // false
Number.isInteger('3') // false
```

&emsp;&emsp;;`ES5`兼容，对比`Number.isFinite`的兼容方式，`Number.isInteger`要求参数先要是有限的数值。

```javascript
if (!Number.isInteger) {
  Number.isInteger = function (value) {
    return typeof value === "number" &&
      isFinite(value) &&
      Math.floor(value) === value
  }
}
```

&emsp;&emsp;注意由于`JavaScript`内部对于`Number`类型采用`IEEE 754`双精度浮点数存储，某些数值可能产生精度损失，因此若精度要求较高还是不要使用。

```javascript
Number.isInteger(3.0000000000000002) // true
```

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125)、[Blog](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~