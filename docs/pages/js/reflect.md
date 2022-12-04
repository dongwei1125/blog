# ES6 Reflect

![](/js/reflect/banner.jpg)

## 前言

&emsp;&emsp;此文总结了`Reflect`对象的部分语法，对比了与`Object`方法的差异性，希望对你有用。

## 语法

&emsp;&emsp;;`Reflect`与`Math`类似，都是`JavaScript`内置对象，提供了工具方法。

```javascript
typeof Reflect // object
```

### get

&emsp;&emsp;;[Reflect.get(target, property, receiver)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect/get) 用于读取对象属性，其中`target`为目标对象，`property`为属性名称。

```javascript
var object = { x: 1 }

Reflect.get(object, 'x') // 1
```

&emsp;&emsp;读取目标对象的访问器属性时，访问器`getter`内`this`上下文就是参数`receiver`。未指定参数`receiver`，默认为目标对象。

```javascript
var object = {
  y: 1,
  get x() {
    return this
  },
}
var receiver = {}

Reflect.get(object, 'x') === object // true
Reflect.get(object, 'x', receiver) === receiver // true
```

### set

&emsp;&emsp;;[Reflect.set(target, property, value, receiver)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect/set) 用于设置对象属性，其中`target`为目标对象，`property`为属性名称，`value`为属性值。

```javascript
var object = { x: 1 }

Reflect.set(object, 'x', 2)

object // {x: 2}
```

&emsp;&emsp;类似的，访问器`setter`内`this`上下文就是参数`receiver`，默认为目标对象。

```javascript
var object = {
  y: 1,
  set x(v) {
    this.y = v
  },
}
var receiver = {}

Reflect.set(object, 'x', 2)
object // {y: 2}

Reflect.set(object, 'x', 3, receiver)
receiver // {y: 3}
```

### has

&emsp;&emsp;;[Reflect.has(object, property)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect/has) 判断对象是否有此属性，本质上与`in`操作符功能相同。

```javascript
var object = { x: undefined }

Reflect.has(object, 'x') // true
```

### deleteProperty

&emsp;&emsp;;[Reflect.deleteProperty(target, property)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect/deleteProperty) 用于删除对象属性，本质上与`delete`操作符功能相同。

```javascript
var object = { x: 1 }

Reflect.deleteProperty(object, 'x')

object // {}
```

### ownKeys

&emsp;&emsp;;[Reflect.ownKeys(target)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect/ownKeys) 返回对象自身所有属性，等价于`Object.getOwnPropertyNames(target)`与`Object.getOwnPropertySymbols(target)`之和。

```javascript
var object = { x: 1, [Symbol('y')]: 2 }

Object.defineProperty(object, 'z', {
  value: 3,
  enumerable: false,
})

Reflect.ownKeys(object) // ['x', 'z', Symbol(y)]
```

### getOwnPropertyDescriptor

&emsp;&emsp;;[Reflect.getOwnPropertyDescriptor(target, property)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect/getOwnPropertyDescriptor) 用于获取对象属性描述符。

```javascript
var object = { x: 1 }

Reflect.getOwnPropertyDescriptor(object, 'x')
// {
//   configurable: true,
//   enumerable: true,
//   value: 1,
//   writable: true,
// }
```

&emsp;&emsp;与`Object.getOwnPropertyDescriptor`不同之处在于，`target`为非对象时，`Object`版本静默失败并返回`undefined`。而`Reflect`版本则抛出错误，提示开发者注意参数类型。

```javascript
Object.getOwnPropertyDescriptor(1, 'x')
// undefined

Reflect.getOwnPropertyDescriptor(1, 'x')
// Uncaught TypeError: Reflect.getOwnPropertyDescriptor called on non-object
```

### defineProperty

&emsp;&emsp;;[Reflect.defineProperty(target, property, descriptor)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect/defineProperty) 用于定义对象属性，其中`target`为目标对象，`value`为属性名称，`descriptor`为属性描述符。

```javascript
var object = {}

Reflect.defineProperty(object, 'x', { value: 1 })

Reflect.getOwnPropertyDescriptor(object, 'x')
// {
//   configurable: false,
//   enumerable: false,
//   value: 1,
//   writable: false,
// }
```

&emsp;&emsp;若属性定义失败，`Object`版本将抛出错误，而`Reflect`版本将返回`false`。

```javascript
var object = Object.freeze({})

Reflect.defineProperty(object, 'x', { value: 1 })
// false

Object.defineProperty(object, 'x', { value: 1 })
// Uncaught TypeError: Cannot define property x, object is not extensible
```

### preventExtensions

&emsp;&emsp;;[Reflect.preventExtensions(target)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect/preventExtensions) 阻止对象拓展。

```javascript
var object = {}

Reflect.preventExtensions(object)

Reflect.isExtensible(object) // false
```

&emsp;&emsp;类似的，`target`为非对象时，`Object`版本静默失败，而`Reflect`版本将抛出错误。

```javascript
Object.preventExtensions(1)
// 1

Reflect.preventExtensions(1)
// Uncaught TypeError: Reflect.preventExtensions called on non-object
```

### isExtensible

&emsp;&emsp;;[Reflect.isExtensible(target)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect/isExtensible) 判断对象是否可拓展。

```javascript
var object = {}

Reflect.preventExtensions(object)

Reflect.isExtensible(object) // false
```

&emsp;&emsp;若参数为非对象，`Reflect`版本将抛出错误，而`Object`版本则静默失败并返回`false`。不合理之处在于参数为非对象，讨论是否可拓展并没有任何意义。

```javascript
Reflect.isExtensible(1)
// Uncaught TypeError: Reflect.isExtensible called on non-object

Object.isExtensible(1)
// false
```

### getPrototypeOf

&emsp;&emsp;;[Reflect.getPrototypeOf(target)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect/getPrototypeOf) 获取对象原型。

```javascript
Reflect.getPrototypeOf({}) === Object.prototype // true
```

&emsp;&emsp;参数`target`为非对象时，`Object`版本存在类型转换，而`Reflect`版本将抛出错误。

```javascript
Object.getPrototypeOf(1) === Number.prototype
// true

Reflect.getPrototypeOf(1)
// Uncaught TypeError: Reflect.getPrototypeOf called on non-object
```

### setPrototypeOf

&emsp;&emsp;;[Reflect.setPrototypeOf(target, prototype)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect/setPrototypeOf) 用于设置原型，返回值为布尔值。

```javascript
var object = {}

Reflect.setPrototypeOf(object, null)

Reflect.getPrototypeOf(object) // null
```

&emsp;&emsp;类似的，参数`target`为非对象时，`Object`版本静默失败并返回`target`，而`Reflect`版本将抛出错误。

```javascript
Object.setPrototypeOf(1, null)
// 1

Reflect.setPrototypeOf(1, null)
// Uncaught TypeError: Reflect.setPrototypeOf called on non-object
```

### apply

&emsp;&emsp;;[Reflect.apply(target, thisArg, args)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect/apply) 用于调用函数，其中`target`为目标函数，`thisArg`为函数被调用时的上下文对象`this`，`args`为函数参数。

```javascript
function fn(x, y) {
  return this.v + x + y
}

Reflect.apply(fn, { v: 1 }, [2, 3]) // 6
```

&emsp;&emsp;若函数`apply`属性被占用，运行`apply`方法绑定`this`将抛出错误。

```javascript
function fn(x, y) { return x + y }

fn.apply = 1

fn.apply(null, [3, 4])
// Uncaught TypeError: fn.apply is not a function
```

&emsp;&emsp;替换为原型`apply`方法可规避，但语义不明显。

```javascript
Function.prototype.apply.call(fn, null, [3, 4]) // 7
```

&emsp;&emsp;而`Reflect.apply`执行方式则更简洁清晰。

```javascript
Reflect.apply(fn, null, [3, 4]) // 7
```

### construct

&emsp;&emsp;;[Reflect.construct(target, args, newTarget)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect/construct) 与`new`操作符行为类似，其中`target`为构造函数，`args`为函数参数。

```javascript
function F(x, y) {
  this.x = x
  this.y = y
}

Reflect.construct(F, [1, 2]) // F {x: 1, y: 2}
```

&emsp;&emsp;参数`newTarget`有两个用处，第一个是指定新对象的原型为`newTarget`的原型对象。

```javascript
function F() {}
function NT() {}

var object = Reflect.construct(F, [], NT)

Reflect.getPrototypeOf(object) === NT.prototype // true
```

&emsp;&emsp;除此之外，原构造函数内部`new.target`会被指向`newTarget`函数。

```javascript
function F() {
  console.log(new.target === NT) // true
}
function NT() {}

Reflect.construct(F, [], NT)
```

## 小结

&emsp;&emsp;;`Reflect`对象的设计目的主要包括。 

- 语言内部的元编程行为，统一移动至`Reflect`，未来新的元编程行为将只添加到`Reflect` 
- `Object`部分函数的行为不合理，在`Reflect`版本进行修正 
- 符合函数式编程，语义更清晰 
-  `Proxy`与`Reflect`结合在代理同时还能保持默认行为

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125) / [Gitee](https://gitee.com/dongwei1125)、[GitHub Pages](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~