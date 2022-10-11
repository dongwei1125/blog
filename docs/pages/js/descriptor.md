# JavaScript 属性描述符

![](/js/descriptor/banner.jpg)

## 前言

&emsp;&emsp;此文总结了属性描述符的作用和特性，以及限制对象操作的部分方法。

## Object.defineProperty

&emsp;&emsp;;[Object.defineProperty](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) 用于指定对象属性的描述符。

&emsp;&emsp;函数的第三个参数`descriptor`为属性的描述符，包括数据描述符和存取描述符两种。

```javascript
var object = {}

// 数据描述符
Object.defineProperty(object, 'foo', {
  configurable: true,
  enumerable: true,
  writable: true,
  value: 1,
})

// 存取描述符
Object.defineProperty(object, 'bar', {
  configurable: true,
  enumerable: true,
  get() {},
  set() {},
})
```

&emsp;&emsp;注意属性描述符固定包括`configurable`、`enumerable`、`writable`和`value`四个键，存取描述符固定包括`configurable`、`enumerable`、`get`和`set`四个键。

> 描述符中公共键为`configurable`和`enumerable`，数据描述符的`writable`与`value`键成对，存取描述符的`get`和`set`键成对

### 默认键值

&emsp;&emsp;属性描述符的键是有默认值的，但是由于对象属性的指定方式不同，存在差异。

> [Object.getOwnPropertyDescriptors](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptors) 用于获取对象自身所有属性的描述符

&emsp;&emsp;字面量方式。

```javascript
var object = {
  foo: 1,
  get bar() {},
}

Object.getOwnPropertyDescriptors(object)
// {
//   bar: {
//     configurable: true,
//     enumerable: true,
//     get: f bar(),
//     set: undefined,
//   },
//   foo: {
//     configurable: true,
//     enumerable: true,
//     value: 1,
//     writable: true,
//   },
// }
```

&emsp;&emsp;;`defineProperty`方式。

```javascript
var object = {}

Object.defineProperty(object, 'foo', {
  value: 1,
})
Object.defineProperty(object, 'bar', {
  get() {},
})
Object.defineProperty(object, 'baz', {})

Object.getOwnPropertyDescriptors(object)
// {
//   bar: {
//     configurable: false,
//     enumerable: false,
//     get: f bar(),
//     set: undefined,
//   },
//   baz: {
//     configurable: false,
//     enumerable: false,
//     value: undefined,
//     writable: false,
//   },
//   foo: {
//     configurable: false,
//     enumerable: false,
//     value: 1,
//     writable: false,
//   },
// }
```

&emsp;&emsp;比较发现，字面量方式指定的属性的描述符默认键值都为`true`。

&emsp;&emsp;而`defineProperty`方式则相对为`false`，很好理解，`defineProperty`旨在细化地描述属性，即指定什么就是什么，未指定的当然为`false`。

&emsp;&emsp;另外`defineProperty`指定为空描述符时，默认为数据描述符形式。存取描述符中的`get`和`set`指定了才会有，不指定默认为`undefined`。

### configurable

&emsp;&emsp;是否可以删除此属性。

&emsp;&emsp;注意非严格模式下删除静默失败，严格模式将抛出错误。

```javascript
'use strict'

var object = {}

Object.defineProperty(object, 'foo', {
  value: 1,
  configurable: false,
})

delete object.foo // Uncaught TypeError: Cannot delete property 'foo' of #<Object>

object // {foo: 1}
```

&emsp;&emsp;是否可以修改描述符的键值，例如修改`enumerable`。

```javascript
var object = {}

Object.defineProperty(object, 'foo', {
  configurable: false,
  enumerable: true,
  value: 1,
})

Object.defineProperty(object, 'foo', {
  enumerable: false, // Uncaught TypeError: Cannot redefine property: foo at Function.defineProperty (<anonymous>)
})
```

&emsp;&emsp;注意有两个特例，`value`和`writable`。

&emsp;&emsp;;`value`键的值可以修改。

```javascript
var object = {}

Object.defineProperty(object, 'foo', {
  configurable: false,
  writable: true,
  value: 1,
})

Object.defineProperty(object, 'foo', {
  value: 12,
})

object // {foo: 12}
```

&emsp;&emsp;;`writable`键的值只能由`true`修改为`false`。

```javascript
var object = {}

Object.defineProperty(object, 'foo', {
  configurable: false,
  writable: true,
  value: 1,
})

Object.defineProperty(object, 'foo', {
  writable: false,
})

object // {foo: 1}
```

&emsp;&emsp;但是不能由`false`修改为`true`。

```javascript
var object = {}

Object.defineProperty(object, 'foo', {
  configurable: false,
  writable: false,
  value: 1,
})

Object.defineProperty(object, 'foo', {
  writable: true, // Uncaught TypeError: Cannot redefine property: foo at Function.defineProperty (<anonymous>)
})
```

&emsp;&emsp;所以`configurable`用于表示属性是否可删除，描述符的键是否可修改。

&emsp;&emsp;当`configurable`为`false`时，属性不能被删除。除了`writable`和`value`之外的键（包括`configurable`、`enumerable`、`set`和`get`）不能修改，注意`writable`也只能修改为`false`。

### enumerable

&emsp;&emsp;是否可以枚举此属性。

```javascript
var object = { foo: 1 }

Object.defineProperty(object, 'bar', {
  enumerable: false,
  value: 2,
})

for (var prop in object) {
  console.log(prop) // foo
}

Object.keys(object) // ['foo']

JSON.stringify(object) // {"foo":1}

Object.assign({}, object) // {foo: 1}

object // {foo: 1, bar: 2}
```

> [Object.prototype.propertyIsEnumerable](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/propertyIsEnumerable) 可用于判断对象的属性值是否可枚举

&emsp;&emsp;几种遍历对象的方式。

 - `for...in`：遍历对象自身和继承的可枚举属性，不包括`Symbol`属性
 - `Objects.keys / Objects.values / Objects.entries`：返回对象自身的键或值组成的数组，也是可枚举属性，不包括`Symbol`键
 - `Object.getOwnPropertyNames`：返回对象自身的属性，不包括`Symbol`属性
 - `Object.getOwnPropertySymbols`：返回对象自身的`Symbol`属性
 - `Reflect.ownKeys`：返回对象自身的所有属性

### writable

&emsp;&emsp;是否可以修改此属性。

&emsp;&emsp;注意非严格模式下修改静默失败，严格模式将抛出错误。

```javascript
'use strict'

var object = {}

Object.defineProperty(object, 'foo', {
  writable: false,
  value: 1,
})

object.foo = 2 // Uncaught TypeError: Cannot assign to read only property 'foo' of object '#<Object>'

object // {foo: 1}
```

&emsp;&emsp;;`configurable`为`true`时，可以先删除，再添加属性，达到修改属性的目的。

```javascript
'use strict'

var object = {}

Object.defineProperty(object, 'foo', {
  configurable: true,
  writable: false,
  value: 1,
})

delete object.foo
object.foo = 2

object // {foo: 2}
```

### 小结

 - 描述符分为数据和存取两种类型，数据类型包括`configurable`、`enumerable`、<code><b>writable</b></code>和<code><b>value</b></code>，存取类型包括`configurable`、`enumerable`、<code><b>get</b></code>和<code><b>set</b></code>
 - 字面量指定的属性描述符的默认键值为`true`，`defineProperty`为`false`
 - 若属性的`configurable`键值为`false`，不能删除此属性，也不能修改除了`writable`和`value`之外的键，且`writable`也只能修改为`false`
 - 若属性的`enumerable`为`false`，不可枚举此属性，或者说会被忽略。例如`for...in`、`Object.keys`、`JSON.stringify`和`Object.assign`
 - 若属性的`writable`为`false`，不可修改此属性

## 对象

&emsp;&emsp;除了属性描述符可以限制对象的操作之外，`Object`上也有方法限制对象的操作。

### Object.preventExtensions

&emsp;&emsp;;[Object.preventExtensions](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/preventExtensions) 表示让对象不可拓展。

&emsp;&emsp;不能添加新的属性。

&emsp;&emsp;注意非严格模式下添加属性静默失败，严格模式将抛出错误。

```javascript
'use strict'

var object = {}

Object.preventExtensions(object)

object.foo = 1 // Uncaught TypeError: Cannot add property foo, object is not extensible

object // {}
```

&emsp;&emsp;另外对象的内部槽`[[prototype]]`也不可变，即不能修改原型的指向。

&emsp;&emsp;;`__proto__`修改将抛出错误。

```javascript
var object = {}

Object.preventExtensions(object)

object.__proto__ = {} // Uncaught TypeError: #<Object> is not extensible at set __proto__ [as __proto__] (<anonymous>)
```

&emsp;&emsp;;`setPrototypeOf`也会抛出错误。

```javascript
var object = {}

Object.preventExtensions(object)

Object.setPrototypeOf(object, {}) // Uncaught TypeError: #<Object> is not extensible at Function.setPrototypeOf (<anonymous>)
```

&emsp;&emsp;所以`preventExtensions`作用的对象，不能添加新的属性，也不能修改原型的指向。

> [Object.isExtensible](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/isExtensible) 可用于判断对象是否可扩展

### Object.seal

&emsp;&emsp;;[Object.seal](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/seal) 表示封闭对象。

&emsp;&emsp;;`seal`封闭对象时，也会将对象变为不可拓展。所以封闭的对象也有类似`preventExtensions`的性质，例如不能添加属性，不可修改原型的指向。

```javascript
var object = { foo: 1 }

Object.seal(object)

Object.isExtensible(object) // false
```

&emsp;&emsp;;`seal`还会将对象的所有属性的描述符中的`configurable`置为`false`。

&emsp;&emsp;所以`seal`作用的对象上的所有属性，都不能删除，也不能修改描述符中除了`writable`和`value`之外的键，且`writable`只能修改为`false`。

```javascript
var object = {
  foo: 1,
  get bar() {},
}

Object.defineProperty(object, 'baz', {
  configurable: true,
  value: 2,
})

Object.seal(object)

Object.getOwnPropertyDescriptors(object)
// {
//   bar: {
//     configurable: false,
//     enumerable: true,
//     get: f bar(),
//     set: undefined,
//   },
//   baz: {
//     configurable: false,
//     enumerable: false,
//     value: 2,
//     writable: false,
//   },
//   foo: {
//     configurable: false,
//     enumerable: true,
//     value: 1,
//     writable: true,
//   },
// }
```

> [Object.isSealed](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/isSealed) 用于判断对象是否封闭

### Object.freeze

&emsp;&emsp;;[Object.freeze](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) 表示冻结对象。

&emsp;&emsp;;`freeze`冻结对象时，会将对象封闭并变为不可拓展。

```javascript
var object = { foo: 1 }

Object.freeze(object)

Object.isSealed(object) // true

Object.isExtensible(object) // false
```

&emsp;&emsp;非严格模式修改属性静默失败，严格模式将抛出错误。

```javascript
'use strict'

var object = { foo: 1 }

Object.freeze(object)

object.foo = 2 // ncaught TypeError: Cannot assign to read only property 'foo' of object '#<Object>'

object // {foo: 1}
```

&emsp;&emsp;;`freeze`还会将对象的所有属性的数据描述符中的`writable`置为`false`。

```javascript
var object = { foo: 1 }

Object.defineProperty(object, 'bar', {
  configurable: true,
  writable: true,
  value: 2
})

Object.freeze(object)

Object.getOwnPropertyDescriptors(object)
// {
//   bar: {
//     configurable: false,
//     enumerable: false,
//     value: 2,
//     writable: false,
//   },
//   foo: {
//     configurable: false,
//     enumerable: true,
//     value: 1,
//     writable: false,
//   },
// }
```

&emsp;&emsp;所以`freeze`冻结的对象几乎不能做任何操作，但是注意`freeze`只是浅冻结。

```javascript
var object = {
  foo: 1,
  bar: {
    baz: 2,
  },
}

Object.freeze(object)

object.bar.baz = 3

object
// {
//   bar: { baz: 3 },
//   foo: 1,
// }
```

> [Object.isFrozen](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/isFrozen) 用于判断对象是否冻结

#### 深度冻结

&emsp;&emsp;兼容`IE9`。

```javascript
Object.deepFreeze = function (object) {
  var prop, value, propNames = Object.getOwnPropertyNames(object)

  for (var i = 0; i < propNames.length; i++) {
    prop = propNames[i]
    value = object[prop]

    if (typeof value === 'object' && value !== null) {
      Object.deepFreeze(value)
    }
  }

  return Object.freeze(object)
}
```

> 注意`Object.keys`只能获取到对象自身的不可枚举属性，而`getOwnPropertyNames`可以获取对象自身的所有非`Symbol`属性

#### 解冻

&emsp;&emsp;冻结实际上是不可逆的，无法解冻原对象。

&emsp;&emsp;但是可以通过深度克隆并覆盖原对象，达到解冻的目的。

```javascript
var object = {
  foo: 1,
  bar: {},
}

Object.deepFreeze(object)

// or JSON.parse(JSON.stringify(object))
object = deepClone(object)

object.bar.baz = 2

object
// {
//   foo: 1,
//   bar: { baz: 2 },
// }
```

&emsp;&emsp;本质上仅仅是将变量的内存空间指向了另一个对象，原对象还是冻结的。另外若变量`object`以`const`的方式声明，此方式也将失效。

> 注意 [JSON.stringify](json.md) 深拷贝时，可能会丢失掉部分属性

### 数组

&emsp;&emsp;数组也是一类特殊的对象，数组下标相当于是对象的键。

```javascript
var array = [1]

Object.defineProperty(array, 1, {
  get() {},
})

Object.getOwnPropertyDescriptors(array)
// {
//   0: {
//     configurable: true,
//     enumerable: true,
//     value: 1,
//     writable: true,
//   },
//   1: {
//     configurable: false,
//     enumerable: false,
//     get: f get(),
//     set: undefined,
//   },
//   length: {
//     configurable: false,
//     enumerable: false,
//     value: 2,
//     writable: true,
//   },
// }
```

#### preventExtensions

&emsp;&emsp;;`preventExtensions`作用的数组不能添加元素，也不能修改原型的指向。

```javascript
var array = [1, 2]

Object.preventExtensions(array)

array.push(3) // Uncaught TypeError: Cannot add property 2, object is not extensible at Array.push (<anonymous>)
```

#### seal

&emsp;&emsp;;`seal`与对象类似，除了有`preventExtensions`特性外，也不能删除元素等。

```javascript
var array = [1]

Object.seal(array)

array.pop() // Uncaught TypeError: Cannot delete property '0' of [object Array] at Array.pop (<anonymous>)
```

#### freeze

&emsp;&emsp;;`freeze`也于对象类似，除了有`preventExtensions`和`seal`特性外，也不能修改元素。

&emsp;&emsp;非严格模式修改元素静默失败，严格模式将抛出错误。

```javascript
'use strict'

var array = [1]

Object.freeze(array)

array[0] = 2 // index.html:23 Uncaught TypeError: Cannot assign to read only property '0' of object '[object Array]'

array // [1]
```

### 小结

 - `preventExtensions`会将对象变为不可拓展，即不能添加属性，也不能修改原型的指向
 - `seal`封闭对象，不仅会将对象变为不可拓展，还会将所有属性的描述符中的`configurable`置为`false`。所以除了有`preventExtensions`的特性外，也不能删除属性，不能修改除了`writable`和`value`之外的键，`writable`只能修改为`false`
 - `freeze`冻结对象，不仅会将对象变为不可拓展和封闭，还会将所有属性的数据描述符的`writable`置为`false`。所以除了有`preventExtensions`和`seal`特性外，不能修改属性和任何描述符的键值
 - 数组是特殊的对象，`preventExtensions`、`seal`和`freeze`作用数组时，与作用对象的特性高度相似

> `preventExtensions`、`seal`和`freeze`均是不可逆的，并`浅`作用于对象或数组

&emsp;&emsp;特性表。

| 特性 | `preventExtensions` | `seal` | `freeze` |
| - | - | - | - |
| `isExtensible`| `false` | `false` | `false` |
| `isSealed` | `false` | `true` | `true` |
| `isFrozen` | `false` | `false` | `true` |
| 添加属性 | 否 | 否 | 否 |
| 修改原型的指向 | 否 | 否 | 否 |
| `configurable`置为`false` | 否 | 是 | 是 |
| 是否可删除属性 | 是 | 否 | 否 |
| 修改描述符的键值 | 可修改 | 不能修改除了`writable`和`value`之外的键，`writable`只能修改为`false` | 都不能修改 |
| `writable`置为`false` | 否 | 否 | 是 |

&emsp;&emsp;关系图。

![](/js/descriptor/relation.png)

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125) / [Gitee](https://gitee.com/dongwei1125)、[GitHub Pages](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~