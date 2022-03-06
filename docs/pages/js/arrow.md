# JavaScript 箭头函数

![](/js/arrow/banner.jpg)

## 前言

&emsp;&emsp;;`ES6`中的 [箭头函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Arrow_functions) 作用非常简单，即简化函数且不绑定`this`。

&emsp;&emsp;内容仅是记录箭头函数的部分特性，包括一些发散和总结，希望对你有用。

## 语法特性

### 没有 this

&emsp;&emsp;箭头函数没有`this`，它的`this`是根据词法作用域派生而来，由上下文决定。

```javascript
function fn() {
  setTimeout(() => {
    console.log(this)
  })
}

fn() // Window {}
```

&emsp;&emsp;结合`babel`转换后的`es5`代码，简单概括就是，箭头函数的`this`总是指向定义时的上层作用域中的`this`。

```javascript
"use strict"

function fn() {
  var _this = this

  setTimeout(function () {
    console.log(_this)
  })
}

fn()
```

&emsp;&emsp;没有`this`，`call`、`apply`或者`bind`也就不能改变指向。

```javascript
var foo = 'outer'
var fn = () => {
  console.log(this.foo)
}

fn.call({ foo: 'inner' }) // outer
```

### 没有 prototype 原型对象

&emsp;&emsp;在`ECMA-262`规范中的第 [20.2.4.3](https://tc39.es/ecma262/#sec-function-instances-prototype) 小节中。

> `20.2.4.3 prototype`</br>
`Function objects created using Function.prototype.bind, or by evaluating a MethodDefinition (that is not a GeneratorMethod or AsyncGeneratorMethod) or an ArrowFunction do not have a "prototype" property.`

&emsp;&emsp;大致意思就是使用`Function.prototype.bind`、箭头函数或者一类特殊方法创建的函数对象都没有`prototype`属性。

&emsp;&emsp;如果还是不太清楚，可以看以下几个栗子。

```javascript
function f() { }
f.bind().prototype // undefined

(() => { }).prototype // undefined

const foo = {
  method() { }
}
foo.method.prototype // undefined
```

&emsp;&emsp;注意第三种类型中，构造器方法是有`prototype`的。

```javascript
const foo = {
  *method() { }
}
foo.method.prototype // Generator {}

const foo = {
  async *method() { }
}
foo.method.prototype // AsyncGenerator {}
```

### 不能作为构造函数

&emsp;&emsp;箭头函数不能作为构造函数，或者说不能通过`new`关键字调用。

&emsp;&emsp;简写一个`_new`函数来辅助分析。

```javascript
function _new(constructor, ...args) {
  const result = {}

  Object.setPrototypeOf(result, constructor.prototype)
  constructor.apply(result, args)

  return result
}
```

&emsp;&emsp;若箭头函数可以通过`new`调用，首先空对象创建后，要将空对象的原型指向箭头函数`Person`的`prototype`。另外还要将箭头函数`Person`内部的`this`指向空对象。

```javascript
const Person = age => {
  this.age = age
}

_new(Person, 12)
```

&emsp;&emsp;而根据文初内容，箭头函数是没有`prototype`属性的，并且它的内部`this`是无法通过`apply`来改变指向的，`new`的过程也就无法实现。

&emsp;&emsp;此处仅可以辅助说明，箭头函数不能作为构造函数。

&emsp;&emsp;你应该了解的是，`JavaScript`的函数有`[[Call]]`和`[[Construct]]`两个内部槽，注意控制台是访问不到不可见的，你可以理解为是浏览器层面的东西，是引擎定义的内部槽。

&emsp;&emsp;当函数直接调用时，将执行`[[Call]]`方法，运行函数体。而当通过`new`调用函数时，将执行`[[Construct]]`方法，运行类似刚才`_new`函数的一系列操作。

&emsp;&emsp;在`ECMA262`规范的 [20.2.3](https://tc39.es/ecma262/#sec-properties-of-the-function-prototype-object) 中表明，没有`[[Construct]]`内部槽，是不能够作为构造函数的。

> `20.2.3 Properties of the Function Prototype Object`</br>
`The Function prototype object:`</br>
`...`</br>
`does not have a [[Construct]] internal method; it cannot be used as a constructor with the new operator.`

&emsp;&emsp;所以最`根本`的原因是，浏览器引擎没有赋予箭头函数`[[Construct]]`这个内部槽，因此也就不能作为构造函数调用，而作为构造函数所应该具有的那些属性，浏览器也就没必要去实现，都返回`undefined`就行了。

### 没有 arguments 实参列表

&emsp;&emsp;箭头函数没有`arguments`对象。

```javascript
const foo = first => {
  console.log(arguments)
}
foo(1) // Uncaught ReferenceError: arguments is not defined
```

&emsp;&emsp;控制台下，箭头函数作用域内确实没有`arguments`对象。

![](/js/arrow/arrow.png)

&emsp;&emsp;看下普通函数的情况呢。

![](/js/arrow/default.png)

&emsp;&emsp;注意虽然说箭头函数没有`arguments`对象，但是它的`arguments`由外层最近的非箭头函数决定。

```javascript
function outer(first) {
  var inner = second => {
    console.log(arguments) // Arguments [1, callee: ƒ, Symbol(Symbol.iterator): ƒ]
  }
  inner(2)
}
outer(1)
```

&emsp;&emsp;看下作用域情况呢。

![](/js/arrow/multiple.png)

&emsp;&emsp;另外若想访问箭头函数的实参列表，可以使用剩余参数。

```javascript
var foo = (...args) => {
  console.log(args) // [1]
}
foo(1)
```

### 没有 new.target

&emsp;&emsp;;[new.target](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/new.target) 用于检测函数是否为`new`调用，若通过`new`调用，将返回构造函数的引用，而在普通函数中，`new.target`返回`undefined`。

```javascript
function F() {
  console.log(new.target === F) // true
}
new F()

function fn() {
  console.log(new.target) // undefined
}
fn()
```

&emsp;&emsp;箭头函数不能作为构造函数，无法通过`new`来调用，而`new.target`用来检测是否为`new`调用就毫无意义，所以箭头函数必然也没有`new.target`。

&emsp;&emsp;与`arguments`和`this`类似，虽然自身没有，但是也是由外层最近的非箭头函数决定。

```javascript
function Outer() {
  console.log(new.target === Outer) // true

  function center() {
    console.log(new.target) // undefined

    const inner = () => {
      console.log(new.target) // undefined
    }
    inner()
  }
  center()
}
new Outer()
```

### 没有 super

&emsp;&emsp;;[super](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/super) 在子类方法中指向父类原型，在子类静态方法中指向父类。

```javascript
class Parent {
  static func() {
    console.log('hello Parent func')
  }

  constructor() { }

  method() {
    console.log('hello Parent method')
  }
}

class Child extends Parent {
  static func() {
    super.func()
  }

  constructor() {
    super()
  }

  method() {
    super.method()
  }
}

const instance = new Child()

Child.func() // hello Parent func
instance.method() // hello Parent method
```

&emsp;&emsp;另外注意形如`super.property = value`的赋值方式，`super`等价于`this`。

```javascript
class Parent {
  constructor() { }
}

class Child extends Parent {
  static func() {
    super.func = 3
  }

  constructor() {
    super()
  }

  method() {
    super.func = 99
  }
}

const instance = new Child()
Child.func()
instance.method()

instance // Child {func: 99}
Child // class Child {func: 3}
```

&emsp;&emsp;;`setPrototypeOf`实现的继承。

```javascript
const instance = {
  func() {
    super.func()
  }
}

const prototype = {
  func() {
    console.log('hello world')
  }
}

Object.setPrototypeOf(instance, prototype)
instance.func() // hello world
```

&emsp;&emsp;箭头函数没有`super`，也是与`arguments`类似，虽然自身没有，但是可以由外层最近的非箭头函数决定。

```javascript
const instance = {
  func() {
    const fn = () => {
      super.func()
    }
    fn()
  }
}

const prototype = {
  func() {
    console.log('hello world')
  }
}

Object.setPrototypeOf(instance, prototype)
instance.func() // hello world
```

### 不允许重复的参数名

&emsp;&emsp;箭头函数不允许形参名重复，无论是否是处在严格模式中，另外注意代码将在解析阶段就会抛出错误。

```javascript
const f = (first, ...first) => { } // Uncaught SyntaxError: Duplicate parameter name not allowed in this context
```

## 小结
 - 箭头函数没有`this`，它的`this`是根据词法作用域派生而来，由上下文决定。总是指向定义时的上层作用域下的`this`
 - 箭头函数没有原型`prototype`
 - 箭头函数不能作为构造函数，根本原因在于浏览器没有赋予箭头函数`[[Construct]]`内部槽
 - 箭头函数没有`arguments`、`super`和`new.taget`，但是可由外层最近的非箭头函数决定
 - 箭头函数不允许形参名重复，无论是否在严格模式下

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125) / [Gitee](https://gitee.com/dongwei1125)、[GitHub Pages](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~