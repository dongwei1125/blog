# ES6 Symbol

![](/js/symbol/banner.jpg)

## 前言

&emsp;&emsp;此文对`ES6`中涉及的`Symbol`类型做了简单说明，也包括部分开放的内置`Symbol`。

## 属性方法

&emsp;&emsp;;[Symbol](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol) 为符号类型，属于基本数据类型之一。

> [基本数据类型](https://developer.mozilla.org/zh-CN/docs/Glossary/Primitive) 也称为原始数据类型，包括`String`、`Number`、`Boolean`、`undefined`、`null`、`Symbol`、`BigInt`，其中`Symbol`和`BigInt`为`ES6`新增

&emsp;&emsp;;`Symbol()`可以用来生成`唯一`值，也是`ES6`引入`Symbol`的原因。

```javascript
Symbol() === Symbol() // false
```

&emsp;&emsp;创建一个`Symbol`包装对象。

```javascript
var sym = Symbol()
var object = Object(sym) // Symbol {Symbol(), description: undefined}

typeof sym // symbol
typeof object // object
```

### Symbol.prototype.description

&emsp;&emsp;;[Symbol.prototype.description](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/description) 用于返回`Symbol`的描述信息，`String`或`toString`方法会包含`Symbol()`字符串。

```javascript
var sym = Symbol('desc')

sym.description // desc
sym.toString() // Symbol(desc)
String(sym) // Symbol(desc)
```

### Symbol.for

&emsp;&emsp;与`Symbol()`不同的是，[Symbol.for](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/for) 除了会创建`Symbol`符号之外，还会把它放入全局的`Symbol`注册表。

> 注册表可以想象为一个对象，键`key`为`Symbol`的描述信息，键值为`Symbol`符号

&emsp;&emsp;;`Symbol.for()`并非每次都会创建一个新的`Symbol`，而是检查指定`key`是否已经在注册表中，若在则返回已保存的`Symbol`，否则就新建一个并放入全局注册表。

```javascript
Symbol.for('desc') === Symbol.for('desc') // true
```

### Symbol.keyFor

&emsp;&emsp;;[Symbol.keyFor](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/keyFor) 用于获取指定的`Symbol`符号，存储在全局注册表里对应的`key`键。

```javascript
var s = Symbol(),
  y = Symbol.for(),
  m = Symbol.for('desc')

Symbol.keyFor(s) // undefined
Symbol.keyFor(y) // 'undefined'
Symbol.keyFor(m) // 'desc'
```

> 注意`s`和`y`符号，分别返回`undefined`和字符串`'undefined'`

&emsp;&emsp;可封装工具函数，判断是否位于全局注册表中。

```javascript
function inGlobalRegistry(sym) {
  return !!Symbol.keyFor(sym)
}
```

## Symbol

&emsp;&emsp;;`ES6`开放了一部分内置的`Symbol`符号，注意规范中内置符号前缀为`@@`，例如`@@hasInstance`表示`Symbol.hasInstance`。

### Symbol.hasInstance

&emsp;&emsp;;[instanceof](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/instanceof) 用于检测构造函数的原型是否在实例对象的原型链上。

```javascript
function F() { }
var f = new F()

f instanceof F // true
f instanceof Object // true
```

&emsp;&emsp;函数实现。

```javascript
function instanceOf(object, constructor) {
  // or object.__proto__
  while ((object = Object.getPrototypeOf(object))) {
    if (object === constructor.prototype) {
      return true
    }
  }

  return false
}

instanceOf(String, Object) // true
```

&emsp;&emsp;;`instanceof`在语言内部将执行 [Symbol.hasInstance](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/hasInstance)，例如`f instanceof F`即执行的是`F[Symbol.hasInstance](f)`。

```javascript
function F() { }
var f = new F()

f instanceof F // true
F[Symbol.hasInstance](f) // true
```

&emsp;&emsp;自定义`instanceof`。

```javascript
var F = {
  [Symbol.hasInstance](v) {
    return v % 2 === 0
  },
}

1 instanceof F // false
2 instanceof F // true
```

### Symbol.isConcatSpreadable

&emsp;&emsp;;[Symbol.isConcatSpreadable](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/isConcatSpreadable) 即数组或类数组在被`concat`拼接时，控制是否能展开。

&emsp;&emsp;数组`Symbol.isConcatSpreadable`属性默认为`undefined`，可以展开。

```javascript
var array = [1, 2]

[0].concat(array, 3) // [0, 1, 2, 3]

array[Symbol.isConcatSpreadable] = false

[0].concat(array, 3) // [0, [1, 2], 3]
```

&emsp;&emsp;而类数组默认不可展开。

```javascript
var arrayLike = {
  0: 1,
  1: 2,
  length: 2,
}

[0].concat(arrayLike, 3) // [0, { 0: 1, 1: 2, length: 2 }, 3]

arrayLike[Symbol.isConcatSpreadable] = true

[0].concat(arrayLike, 3) // [0, 1, 2, 3]
```

### Symbol.species

&emsp;&emsp;;`ES6`中`extends`存在一个有趣的现象，即内置方法返回的对象都将默认成为派生类的实例。

&emsp;&emsp;什么意思呢？

&emsp;&emsp;例如`SortedArray`继承自`Array`，而内置方法`map`返回的数组成为了`SortedArray`的实例。

```javascript
class SortedArray extends Array {}

const sortedArray = new SortedArray(3, 1, 2)
const array = sortedArray.map(e => e)

array instanceof SortedArray // true
```

&emsp;&emsp;如何做到的呢？

&emsp;&emsp;以下为`Array`类内部的大致结构。

```javascript
class Array {
  static get [Symbol.species]() {
    return this
  }
  
  ...

  map(callback) {
    const Constructor = this.constructor[Symbol.species]()
    const result = new Constructor(this.length)

    for (var i = 0; index < result.length; i++) {
      result[i] = callback(i, this[i], this)
    }

    return result
  }
}
```

&emsp;&emsp;运行`sortedArray.map()`时，`map`函数内`this`为`sortedArray`实例，`this.constructor`为`SortedArray`派生类。另外静态取值方法`[Symbol.species]()`内部返回调用者，则`this.constructor[Symbol.species]()`为`SortedArray`类。

&emsp;&emsp;故`sortedArray.map()`返回的数组也就是由`SortedArray`类创建的，`array instanceof SortedArray`也就必然为`true`了。

&emsp;&emsp;;`ES6`中将`Symbol.species`开放，子类可以覆盖父类的`[Symbol.species]()`静态方法。

```javascript
class SortedArray extends Array {
  static get [Symbol.species]() {
    return Array
  }
}

const sortedArray = new SortedArray(3, 1, 2)
const array = sortedArray.map(e => e)

array instanceof SortedArray // false
array instanceof Array // true
```

&emsp;&emsp;根据刚才的分析，结合`Array`的内部结构，容易知道`sortedArray.map()`返回的数组是由`Array`类创建的，因此`array instanceof SortedArray`为`false`。

&emsp;&emsp;有何作用呢？

&emsp;&emsp;某些类库可能继承至基类，子类使用基类的方法时，更多的，希望返回的对象是基类的实例，而非子类的实例。例如以上`SortedArray`继承至基类`Array`，子类实例`sortedArray`使用`map`方法时，希望返回的数组是`Array`的实例。

&emsp;&emsp;所以 [Symbol.species](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/species) 作用为，子类继承基类，子类方法返回新对象时，指定新对象的类（或者说构造函数）。

### Symbol.match

&emsp;&emsp;;[Symbol.match](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/match) 即`String.prototype.math`在语言内部将执行`RegExp.prototype[Symbol.match]`。

```javascript
var regexp = /llo/, s = 'hello'

s.match(regexp) // ['llo', index: 2, input: 'hello', groups: undefined]
regexp[Symbol.match](s) // ['llo', index: 2, input: 'hello', groups: undefined]
```

### Symbol.replace

&emsp;&emsp;;[Symbol.replace](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/replace) 即`String.prototype.replace`在语言内部将执行`RegExp.prototype[Symbol.replace]`。

```javascript
var regexp = /llo/, s = 'hello'

s.replace(regexp, 'he') // hehe
regexp[Symbol.replace](s, 'he') // hehe
```

### Symbol.search

&emsp;&emsp;;[Symbol.search](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/search) 即`String.prototype.search`在语言内部将执行`RegExp.prototype[Symbol.search]`。

```javascript
var regexp = /llo/, s = 'hello'

s.search(regexp) // 2
regexp[Symbol.search](s) // 2
```

### Symbol.split

&emsp;&emsp;;[Symbol.split](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/split) 即`String.prototype.split`在语言内部将执行`RegExp.prototype[Symbol.split]`。

```javascript
var regexp = new RegExp(''), s = 'hello'

s.split(regexp, 3) // ['h', 'e', 'l']
regexp[Symbol.split](s, 3) // ['h', 'e', 'l']
```

> `String.prototype.split()`方法中第一个参数为字符串或者正则表达式，第二个参数用于限制分割后的数组长度。

### Symbol.iterator

&emsp;&emsp;;[Symbol.iterator](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/iterator) 为对象部署迭代器，可被用于`for...of`循环、拓展运算符和解构等。

```javascript
const object = { foo: 1, bar: 2 }

object[Symbol.iterator] = function () {
  const keys = Object.keys(this)
  var index = 0

  return {
    next() {
      return {
        done: index === keys.length,
        value: keys[index++],
      }
    },
  }
}

for (const key of object) {
  console.log(key)
  // foo
  // bar
}

[...object] // ['foo', 'bar']
```

### Symbol.toPrimitive

&emsp;&emsp;对象转换为原始值时，在`JavaScript`内部会进行 [ToPrimitive](https://tc39.es/ecma262/#sec-toprimitive) 抽象运算。

&emsp;&emsp;例如将对象转换为字符串类型。

```javascript
String({ foo: 1 }) // [object Object]
```

&emsp;&emsp;;`ToPrimitive`抽象运算可以想象为一个`ToPrimitive(input, preferredType)`方法，`input`为被转换对象，`preferredType`为期望返回的结果类型。

&emsp;&emsp;;`preferredType`包括`number`、`string`和`default`三种，不同场景下`preferredType`值不同。

 - `number`：`+object`正运算、`Number(object)`等
 - `string`：`${object}`模板字符串插值、`foo[object]`对象用作属性、`string.search(object)`、`String(object)`、`parseInt(object)`等
 - `default`：`object + x`加法运算、`object == x`相等判断等

> 例如`Number(object)`运算场景下，`preferredType`为`number`

#### ToPrimitive

&emsp;&emsp;;`ToPrimitive(input, preferredType)`运算过程简述为。

 - 判断`input`是否为非对象（原始值），是则返回`input`
 - 否则，判断对象是否有`[Symbol.toPrimitive](hint){}`方法，若有
     - 将`hint`参数值初始化为`preferredType`。注意若`preferredType`不存在，`hint`默认为`default`
     - 若方法的执行结果为非对象（原始值），则返回，否则抛出`TypeError`错误
 - 否则，执行`OrdinaryToPrimitive(input, preferredType)`

```javascript
const foo = {
  [Symbol.toPrimitive](hint) {
    return '1.00'
  },
}
const bar = {
  [Symbol.toPrimitive](hint) {
    return {}
  },
}

Number(foo) // 1
Number(bar) // Uncaught TypeError: Cannot convert object to primitive value at Number
```

#### OrdinaryToPrimitive

&emsp;&emsp;;`OrdinaryToPrimitive(input, hint)`运算过程简述为。

 - 若`hint`为`string`，先调用`toString()`，如果为非对象（原始值）那么返回它。否则再调用`valueOf()`，如果为非对象（原始值）那么返回它，否则抛出`TypeError`错误
  - 若`hint`为`number/default`，恰好相反，会先调用`valueOf()`，再调用`toString()`

```javascript
const foo = {
  valueOf() {
    return {}
  },
  toString() {
    return '1.00'
  },
}
const bar = {
  valueOf() {
    return {}
  },
  toString() {
    return {}
  },
}

Number(foo) // 1
Number(bar) // Uncaught TypeError: Cannot convert object to primitive value at Number
```

#### 用例

&emsp;&emsp;可能你会问，抽象方法很少用到吧。

&emsp;&emsp;并非哦，我们以计算`[1, 2] + {}`结果为例。

&emsp;&emsp;实际形如 [x + y](https://262.ecma-international.org/7.0/#sec-addition-operator-plus-runtime-semantics-evaluation) 的表达式，将分别对`x`和`y`执行`ToPrimitive(input, preferredType)`抽象运算，转化为原始值。

&emsp;&emsp;参考刚才的场景，容易知道`preferredType`为`default`，即调用`valueOf()`和`toString()`。

```javascript
var x = [1, 2],  y = {}

x.valueOf() // [1, 2]
x.toString() // '1, 2'
y.valueOf() // {}
y.toString() // '[object Object]'
```

&emsp;&emsp;所以`x + y`结果为`1, 2[object Object]`。

### Symbol.toStringTag

&emsp;&emsp;;[Symbol.toStringTag](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toStringTag) 用于向`Object.prototype.toString`提供标签。

```javascript
var object = {
  [Symbol.toStringTag]: 'Hello',
}

object.toString() // [object Hello]
Object.prototype.toString.call(object) // [object Hello]
```

> `object.toString()`与`Object.prototype.toString.call(object)`两者是等价的

### Symbol.unscopables

#### with

&emsp;&emsp;以下代码中，`console.log`将沿着`fn`函数作用域、全局作用域依次寻找`foo`。

```javascript
var foo = 1

function fn() {
  console.log(foo) // 1
}

fn()
```

&emsp;&emsp;函数`fn`引入`with`，`console.log`将沿着`object`对象、`fn`函数作用域、全局作用域寻找`foo`。

```javascript
var foo = 1

function fn() {
  var object = { foo: 2 }

  with (object) {
    console.log(foo) // 2
  }
}

fn()
```

&emsp;&emsp;因此 [with](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/with) 作用非常简单，即扩展了语句的作用域。

&emsp;&emsp;注意若对象上没有某个属性，则将会沿着作用域向上寻找对应变量，若都没有则将抛出错误。

```javascript
var foo = 1, bar = 3

function fn() {
  var object = { foo: 2 }

  with (object) {
    console.log(bar) // 3
    console.log(baz) // Uncaught ReferenceError: baz is not defined
  }
}

fn()
```

&emsp;&emsp;;`with`优势即可以使内部表达式更加简洁，但是语义会不明显，且属性的寻找实际上更加耗时，得不偿失。

```javascript
function fn() {
  var object = { foo: 1, bar: 2, baz: 3 }

  with (object) {
    // 等价于 object.foo + object.bar + object.baz
    console.log(foo + bar + baz) // 6
  }
}

fn()
```

&emsp;&emsp;缺点也很明显，严重时将造成代码歧义。例如以下`y`可能是`x`的属性值，也可能是函数的第二个参数`y`。

```javascript
function fn(x, y) {
  with (x) {
    console.log(y)
  }
}

fn({ y: 1 }) // 1
fn({}, 2) // 2
```

#### 兼容性

&emsp;&emsp;在框架 [extjs](https://www.sencha.com/products/extjs) 中存在类似如下的代码。

```javascript
function fn(values) {
  with (values) {
    console.log(values)
  }
}

fn([])
```

&emsp;&emsp;在`ES5`浏览器中（例如`IE10`），可能为`values.values`属性值或者为函数参数`values`。而`values.values`属性并不存在，则将沿着作用域寻找到`values`变量，输出`[]`。

&emsp;&emsp;实际上并没有什么问题，对吧？

&emsp;&emsp;但是在`ES6`中，数组原型上部署了`values`方法，`values.values`将会获取为数组原型的`values`方法，输出`values(){ }`。

&emsp;&emsp;呐，问题就严重咯~

&emsp;&emsp;代码在行为上与以前不一致了，规范的兼容性被破坏了。

&emsp;&emsp;思考下怎么解决呢？

&emsp;&emsp;能不能在`with (object) { }`上定义一个规则，让内部不会在对象`object`上寻找属性呢。

&emsp;&emsp;也就有了 [Symbol.unscopables](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/unscopables)，用于排除`with`环境中的属性。

```javascript
var foo = 1

function fn() {
  var object = {
    foo: 2,
    [Symbol.unscopables]: {
      foo: true,
    },
  }

  with (object) {
    console.log(foo) // 1
  }
}

fn()
```

&emsp;&emsp;数组原型上的`Symbol.unscopables`属性。

```javascript
Array.prototype[Symbol.unscopables]
// {
//   ...
//   keys: true,
//   values: true,
// }
```

&emsp;&emsp;也就表示数组默认包含`Symbol.unscopables`属性，因此以下代码在`with`环境中就排除了`values`属性。在`ES6`浏览器中，将输出`[]`，与`ES5`的结果一致。

```javascript
function fn(values) {
  with (values) {
    console.log(values)
  }
}

fn([])
```

&emsp;&emsp;所以引入`Symbol.unscopables`，仅仅是为了解决`with`执行环境下的历史兼容性问题。

#### 严格模式

&emsp;&emsp;可能你会问，`ES5`中严格模式不是已经禁用了`with`，为何还要在`ES6`中解决禁用语句的遗留问题？

&emsp;&emsp;个人认为目前浏览器还处在支持严格和非严格两种模式的阶段，非严格模式下还是能正常运行`with`语句，所以始终都存在着潜在的问题。

&emsp;&emsp;即由于规范的差异，导致代码的行为不一致。所以终究还是要解决掉，保证向下兼容，即使解决方式不是太友好。

## 参考

 - [EcmaScript 为什么要引入 @@species](https://www.zhihu.com/question/515913009)
 - [Symbol.unscopables 存在的历史原因](https://www.zhihu.com/question/364970876)
 - [Array.prototype.flatten ？](https://zhuanlan.zhihu.com/p/34741293)

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125) / [Gitee](https://gitee.com/dongwei1125)、[GitHub Pages](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~