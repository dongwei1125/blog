# ES6 Proxy

![](/js/proxy/banner.jpg)

## 前言

&emsp;&emsp;全文共计`5`万字左右，大约可阅读两小时，并不定时持续更新中。

&emsp;&emsp;此文可能是关于`Proxy`相对较全的文章之一，总结了`Proxy`代理几乎所有的用法、示例和注意事项，也有对部分代码的细节分析。结合语法和`ECMAScript`规范，系统性地阐释了`JavaScript`对象的内部方法和内部槽，对比了普通对象与代理对象之间的差异和共同点。另外也包括一些运用场景，如何分析代理的错误问题，以及如何优化解决等等。

&emsp;&emsp;建议阅读中根据目录细化拆分，并试着回答以下问题。

 - 什么是`trap`？
 - 内部方法与`trap`、不变量三者的关系
 - `Proxy`与`Reflect`之间的联系和作用
 - 实例如何在规范层面获取私有属性
 - `Proxy`的缺点和局限性

## 语法

&emsp;&emsp;;[Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy) 为构造函数，用于创建代理对象。参数`target`为被代理的对象，`handler`为配置对象，用于自定义不同的代理行为。

```javascript
var proxy = new Proxy(target, handler)
```

&emsp;&emsp;两个参数都不能为非对象，否则将抛出错误。

```javascript
new Proxy(1, 2)
// Uncaught TypeError: Cannot create proxy with a non-object as target or handler
```

&emsp;&emsp;;`Proxy`构造函数不能继承，原因在于`Proxy`上没有`prototype`原型属性。

```javascript
class P extends Proxy {}
// Uncaught TypeError: Class extends value does not have valid prototype property undefined
```

&emsp;&emsp;手动添加上`prototype`属性则可以继承。

```javascript
Proxy.prototype = {}

class P extends Proxy {}

var p = new P({}, {})
// Proxy {}
```

### get

&emsp;&emsp;;[get(target, property, receiver)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/get) 用于代理对象的读取操作，包括`proxy[prop]`或者`proxy.prop`、`Object.create(proxy)[prop]`或者`Reflect.get(proxy, property)`。

```javascript
var object = {}
var handler = {
  get(target, property, receiver) {
    return 15
  },
}
var proxy = new Proxy(object, handler)

proxy.value // 15
```

&emsp;&emsp;函数参数`target`为目标对象（被代理的对象），`property`为属性名称，`receiver`为代理对象，或者继承代理对象的对象。

&emsp;&emsp;;`receiver`为代理对象`proxy`。

```javascript
var object = {}
var handler = {
  get(target, property, receiver) {
    return receiver
  },
}
var proxy = new Proxy(object, handler)

proxy.value === proxy // true
```

&emsp;&emsp;对象`o`不存在`value`属性，将沿着原型链读取`proxy`的`value`属性，进而被`get`函数代理，`receiver`则为继承代理对象`proxy`的对象`o`。

```javascript
var object = {}
var handler = {
  get(target, property, receiver) {
    return receiver
  },
}
var proxy = new Proxy(object, handler)
var o = Object.create(proxy)

o.value === o // true
```

&emsp;&emsp;观察发现，在执行`proxy.value`或`o.value`时，点运算符（`.`）左边的对象是谁，`receiver`就指向谁。

&emsp;&emsp;换句话说`receiver`是触发读取操作时的对象。

### set

&emsp;&emsp;;[set(target, property, value, receiver)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/set) 用于代理对象属性的赋值操作，包括`proxy.prop = value`或者`proxy[prop] = value`、`Object.create(proxy)[prop] = value`或者`Reflect.set(proxy, property, value)`。返回布尔值，表示是否设置成功。

```javascript
var object = {}
var handler = {
  set(target, property, value, receiver) {
    object.value = 15
  },
}
var proxy = new Proxy(object, handler)

proxy.value = 1

proxy.value // 15
```

&emsp;&emsp;函数参数`target`为目标对象（被代理的对象），`property`为属性名称，`value`为设置的属性值，`receiver`为代理对象，或者继承代理对象的对象。

&emsp;&emsp;;`receiver`与`get`一致，点运算符左边的对象是谁，`receiver`就是谁，即触发赋值操作时的对象。

&emsp;&emsp;严格模式下若返回`false`，将抛出错误。

```javascript
'use strict'

var object = {}
var handler = {
  set(target, property, value, receiver) {
    return false
  },
}
var proxy = new Proxy(object, handler)

proxy.value = 15
// Uncaught TypeError: 'set' on proxy: trap returned falsish for property 'value'
```

### has

&emsp;&emsp;;[has(target, property)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/has) 用于代理判断对象是否有属性，例如`in`和`with`，包括`prop in proxy`或者`prop in Object.create(proxy)`、`with(proxy){ prop; }`或者`with(Object.create(proxy)){ prop; }`、`Reflect.has(proxy, property)`。返回布尔值，表示是否有属性。

```javascript
var object = {}
var handler = {
  has(target, property) {
    return true
  },
}
var proxy = new Proxy(object, handler)

'value' in proxy // true
```

&emsp;&emsp;参数`target`为目标对象（被代理的对象），`property`为属性名。

```javascript
var object = {}
var handler = {
  has(target, property) {
    return true
  },
}
var proxy = new Proxy(object, handler)

with (proxy) {
  console.log(value)
  // Uncaught TypeError: Cannot read properties of undefined (reading 'log')
}
```

&emsp;&emsp;简单分析以上代码的报错原因，执行到`console.log`语句时，引擎会确认`proxy`上是否有`console`属性。此时将调用`handler.has()`方法，默认返回`true`，表示`proxy`上存在`console`属性。

&emsp;&emsp;然后去获取`proxy.console`的属性值，即`undefined`，紧接着执行`undefined.log`，由于`undefined`上并无`log`方法，将抛出错误。

&emsp;&emsp;可选链`?.`比较适用此场景。

```javascript
with (proxy) {
  console?.log(value)
}
```

### deleteProperty

&emsp;&emsp;;[deleteProperty(target, property)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/deleteProperty) 用于代理`delete`操作，包括`delete proxy.prop`或者`delete proxy[prop]`、`Reflect.deleteProperty(proxy, property)`。返回布尔值，表示是否删除成功。

```javascript
var object = {}
var handler = {
  deleteProperty(target, property) {
    return true
  },
}
var proxy = new Proxy(object, handler)

delete proxy.value // true
```

&emsp;&emsp;参数`target`为目标对象（被代理的对象），`property`为属性名。

### ownKeys

&emsp;&emsp;;[ownKeys(target)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/ownKeys) 用于代理枚举对象属性的操作，包括。

 - `for...in`
 - `Object.keys(proxy) / Object.values(proxy) / Object.entries(proxy)`
 - `Object.getOwnPropertyNames(proxy)`
 - `Object.getOwnPropertySymbols(proxy)`
 - `Reflect.ownKeys(proxy)`

#### for...in

&emsp;&emsp;;`for...in`返回对象自身和继承的可枚举属性，不包括`Symbol`属性。

```javascript
var object = { x: 1, [Symbol('y')]: 2 }

Object.defineProperty(object, 'z', {
  value: 3,
  configurable: true,
  writable: true,
  enumerable: false,
})

Object.setPrototypeOf(object, { m: 1, [Symbol('n')]: 2 })

for (var key in object) {
  console.log(key)
  // x
  // m
}
```

&emsp;&emsp;代理`for...in`时，有三种属性会被`ownKeys`过滤，包括。

 - 目标对象上不存在的属性
 - `Symbol`属性
 - 目标对象上不可枚举（`non-enumerable`）的属性

```javascript
var y = Symbol('y')
var object = { x: 1, [y]: 2 }

Object.defineProperty(object, 'z', {
  value: 3,
  configurable: true,
  writable: true,
  enumerable: false,
})

var handler = {
  ownKeys(target) {
    return ['w', 'x', y, 'z']
  },
}
var proxy = new Proxy(object, handler)

for (var key in proxy) {
  console.log(key)
  // x
}
```

#### Object.keys

&emsp;&emsp;;`Object.keys`返回对象自身的可枚举属性，不包括`Symbol`属性。

```javascript
var object = { x: 1, [Symbol('y')]: 2 }

Object.defineProperty(object, 'z', {
  value: 3,
  configurable: true,
  writable: true,
  enumerable: false,
})

Object.keys(object) // ['x']
```

&emsp;&emsp;代理`Object.keys`时，与`for...in`一致，也会被`ownKeys`过滤。

```javascript
var y = Symbol('y')
var object = { x: 1, [y]: 2 }

Object.defineProperty(object, 'z', {
  value: 3,
  configurable: true,
  writable: true,
  enumerable: false,
})

var handler = {
  ownKeys(target) {
    return ['w', 'x', y, 'z']
  },
}
var proxy = new Proxy(object, handler)

Object.keys(proxy) // ['x']
Object.values(proxy) // [1]
Object.entries(proxy) // [['x', 1]]
```

&emsp;&emsp;注意`Object.values`和`Object.entries`也会被`ownKeys`代理，且会被过滤。

#### Object.getOwnPropertyNames

&emsp;&emsp;;`Object.getOwnPropertyNames`返回对象自身的属性，不包括`Symbol`属性。

```javascript
var object = { x: 1, [Symbol('y')]: 2 }

Object.defineProperty(object, 'z', {
  value: 3,
  configurable: true,
  writable: true,
  enumerable: false,
})

Object.getOwnPropertyNames(object) // ['x', 'z']
```

&emsp;&emsp;与`for...in`和`Object.keys`的区别在于，代理`Object.getOwnPropertyNames`可返回目标对象不存在的属性。

```javascript
var object = { x: 1 }

var handler = {
  ownKeys(target) {
    return ['x', 'y']
  },
}
var proxy = new Proxy(object, handler)

Object.getOwnPropertyNames(proxy) // ['x', 'y']
```

#### Object.getOwnPropertySymbols

&emsp;&emsp;;`Object.getOwnPropertySymbols`返回对象自身的`Symbol`属性。

```javascript
var object = { x: 1, [Symbol('y')]: 2 }

Object.defineProperty(object, Symbol('z'), {
  value: 3,
  configurable: true,
  writable: true,
  enumerable: false,
})

Object.getOwnPropertySymbols(object) // [Symbol(y), Symbol(z)]
```

&emsp;&emsp;代理`Object.getOwnPropertySymbols`也可返回目标对象不存在的`Symbol`属性。

```javascript
var x = Symbol('x')
var object = { [x]: 1 }

var handler = {
  ownKeys(target) {
    return [x, Symbol('y')]
  },
}
var proxy = new Proxy(object, handler)

Object.getOwnPropertySymbols(proxy) // [Symbol(x), Symbol(y)]
```

#### Reflect.ownKeys

&emsp;&emsp;;`Reflect.ownKeys`返回对象自身所有属性。

```javascript
var object = { x: 1, [Symbol('y')]: 2 }

Object.defineProperty(object, 'z', {
  value: 3,
  configurable: true,
  writable: true,
  enumerable: false,
})

Reflect.ownKeys(object) // ['x', 'z', Symbol(y)]
```

&emsp;&emsp;代理`Reflect.ownKeys`也可返回目标对象不存在的属性。

```javascript
var y = Symbol('y')
var object = { x: 1, [y]: 2 }

var handler = {
  ownKeys(target) {
    return ['v', Symbol('w'), 'x', y]
  },
}
var proxy = new Proxy(object, handler)

Reflect.ownKeys(proxy) // ['v', Symbol(w), 'x', Symbol(y)]
```

#### 小结

| 语句 | 特性 | `ownKeys`是否过滤 | `ownKeys`是否可返回目标对象不存在的属性 |
|:-:|:-:|:-:|:-:|
| `for...in` | 对象自身和继承的可枚举属性，不含`Symbol`属性 | 是 | 否 |
| `Object.keys` | 对象自身的可枚举属性，不含`Symbol`属性 | 是 | 否 |
| `Object.getOwnPropertyNames` | 对象自身的所有属性，不含`Symbol`属性 | 否 | 是 |
| `Object.getOwnPropertySymbols` | 对象自身的所有`Symbol`属性 | 否 | 是 |
| `Reflect.ownKeys` | 对象自身的所有属性 | 否 | 是 |

&emsp;&emsp;关系图。

![](/js/proxy/forin.png)

### getOwnPropertyDescriptor

&emsp;&emsp;;[getOwnPropertyDescriptor(target, property)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/getOwnPropertyDescriptor) 用于代理获取对象属性描述符的操作，包括`Object.getOwnPropertyDescriptor(proxy, prop)`或者`Reflect.getOwnPropertyDescriptor(proxy, prop)`、`Object.getOwnPropertyDescriptors(proxy)`。返回值为描述符对象或者`undefined`。

```javascript
var object = { value: 1 }
var handler = {
  getOwnPropertyDescriptor(target, property) {
    return {
      value: 2,
    }
  },
}
var proxy = new Proxy(object, handler)

Object.getOwnPropertyDescriptor(proxy, 'value')
// {
//   value: 2,
//   configurable: false,
//   writable: false,
//   enumerable: false,
// }
```

&emsp;&emsp;参数`target`为目标对象（被代理的对象），`property`为属性名。

&emsp;&emsp;;`Object.getOwnPropertyDescriptors`内部依赖于`Object.getOwnPropertyDescriptor`，则也可代理`Object.getOwnPropertyDescriptors`。

```javascript
var object = { x: 1, y: 2 }
var handler = {
  getOwnPropertyDescriptor(target, property) {
    return {
      value: 2,
    }
  },
}
var proxy = new Proxy(object, handler)

Object.getOwnPropertyDescriptors(proxy)
// {
//   x: {
//     value: 2,
//     configurable: true,
//     writable: false,
//     enumerable: false,
//   },
//   y: {
//     value: 2,
//     configurable: true,
//     writable: false,
//     enumerable: false,
//   },
// }
```

### defineProperty

&emsp;&emsp;;[defineProperty(target, property, descriptor)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/defineProperty) 用于代理定义属性的操作，包括`Object.defineProperty(proxy, prop, descriptor)`或者`Reflect.defineProperty(proxy, prop, descriptor)`、`Object.defineProperties(proxy, descriptors)`、`proxy.prop = value`或者`proxy[prop] = value`。返回值为布尔值，表示操作是否成功。

```javascript
var object = {}
var handler = {
  defineProperty(target, property, descriptor) {
	console.log(descriptor)
	// {
	//   configurable: true,
	//   enumerable: true,
	//   value: 1,
	//   writable: true,
	// }

    return true
  },
}
var proxy = new Proxy(object, handler)

proxy.value = 1
```

&emsp;&emsp;参数`target`为目标对象（被代理的对象），`property`为属性名，`descriptor`为属性描述符。

&emsp;&emsp;若`handler`中`set`与`defineProperty`都存在，将优先执行`set`。

```javascript
var object = {}
var handler = {
  defineProperty(target, property, descriptor) {
    console.log('defineProperty')

    return true
  },
  set(target, property, value, receiver) {
    console.log('set')

    return false
  },
}
var proxy = new Proxy(object, handler)

proxy.value = 1
// 'set'
```

&emsp;&emsp;与`set`一致，严格模式下若返回`false`，将抛出错误。

```javascript
'use strict'

var object = {}
var handler = {
  defineProperty(target, property, descriptor) {
    return false
  },
}
var proxy = new Proxy(object, handler)

proxy.value = 1
// Uncaught TypeError: 'defineProperty' on proxy: trap returned falsish for property 'value'
```

### preventExtensions

&emsp;&emsp;;[preventExtensions(target)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/preventExtensions) 用于代理阻止对象拓展的操作，包括`Object.preventExtensions(proxy)`或者`Reflect.preventExtensions(proxy)`。返回布尔值，表示阻止成功。

```javascript
var object = {}
var handler = {
  preventExtensions(target) {
    console.log('preventExtensions')

    return Reflect.preventExtensions(target)
  },
}
var proxy = new Proxy(object, handler)

Object.preventExtensions(proxy)
// 'preventExtensions'
```

### isExtensible

&emsp;&emsp;;[isExtensible(target)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/isExtensible) 用于代理判断对象是否可拓展的操作，包括`Object.isExtensible(proxy)`或者`Reflect.isExtensible(proxy)`。返回值将转换为布尔值，表示是否可拓展。

```javascript
var object = {}
var handler = {
  isExtensible(target) {
    return true
  },
}
var proxy = new Proxy(object, handler)

Object.isExtensible(proxy) // true
```

### getPrototypeOf

&emsp;&emsp;;[getPrototypeOf(target)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/getPrototypeOf) 用于代理获取对象原型的操作，包括。

 - `Object.getPrototypeOf(proxy)`
 - `Reflect.getPrototypeOf(proxy)`
 - `proxy.__proto__`
 - `Object.prototype.isPrototypeOf(proxy)`
 - `proxy instanceof Object`

```javascript
var object = {}
var handler = {
  getPrototypeOf(target) {
    return new Number(1)
  },
}
var proxy = new Proxy(object, handler)

Object.getPrototypeOf(proxy) // Number {1}
Reflect.getPrototypeOf(proxy) // Number {1}
proxy.__proto__ // Number {1}
Number.prototype.isPrototypeOf(proxy) // true
proxy instanceof Number // true
```

### setPrototypeOf

&emsp;&emsp;;[setPrototypeOf(target, prototype)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/setPrototypeOf) 用于代理设置原型的操作，包括`Object.setPrototypeOf(proxy, prototype)`或者`Reflect.setPrototypeOf(proxy, prototype)`。返回布尔值，表示是否设置成功。

```javascript
var object = {}
var handler = {
  setPrototypeOf(target, prototype) {
    return true
  },
}
var proxy = new Proxy(object, handler)

Reflect.setPrototypeOf(proxy, {}) // true
```

&emsp;&emsp;参数`target`为目标对象（被代理的对象），`prototype`为原型对象或者`null`。

### apply

&emsp;&emsp;;[apply(target, thisArg, args)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/apply) 用于代理函数的普通调用，包括`proxy(args)`、`proxy.call(thisArg, args)`或者`proxy.apply(thisArg, args)`、`Reflect.apply(proxy, thisArg, args)`。

```javascript
var func = function (x, y) {
  return x + y
}
var handler = {
  apply(target, thisArg, args) {
    return Reflect.apply(target, thisArg, args) * 3
  },
}
var proxy = new Proxy(func, handler)

proxy(1, 2) // 9
proxy.call(null, 3, 4) // 21
Reflect.apply(proxy, null, [5, 6]) // 33
```

&emsp;&emsp;参数`target`为目标对象（被代理的对象），`thisArg`为被调用时的上下文对象`this`，`args`为被调用时的参数数组。

```javascript
Function.prototype.apply.call(proxy, null, [3, 4]) // 21
```

&emsp;&emsp;分析以上语句，也就是`Function.prototype.apply`函数执行了`call`方法，函数内部`this`指向了`proxy`，参数为`null` `[3, 4]`，即`Function.prototype.apply(null, [3, 4])`（内部`this`为`proxy`），等价于运行`proxy.apply(null, [3, 4])`。

### construct

&emsp;&emsp;;[construct(target, args, newTarget)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/construct) 用于代理构造函数的`new`调用，包括`new proxy(args)`或者`Reflect.construct(proxy, args, newTarget)`。返回值为对象。

```javascript
var F = function (x, y) {
  this.x = x
  this.y = y
}
var handler = {
  construct(target, args, newTarget) {
	console.log(newTarget === Ctr) // true

    return Reflect.construct(target, args, newTarget)
  },
}
var Ctr = new Proxy(F, handler)

new Ctr(1, 2) // F {x: 1, y: 2}
```

&emsp;&emsp;参数`target`为目标对象（被代理的对象），`args`为被调用时的参数数组，`newTarget`为`new`命令作用的构造函数。

### Proxy.revocable

&emsp;&emsp;;[Proxy.revocable](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/revocable) 用于创建可撤销的代理对象。

```javascript
var revocable = Proxy.revocable(target, handler)
```

&emsp;&emsp;返回值为对象，包括`proxy`和`revoke`属性，`proxy`为新生成的代理对象，`revoke`为撤销代理的方法。

```javascript
var object = {}
var handler = {
  get() {
    return 1
  },
}
var { proxy, revoke } = Proxy.revocable(object, handler)

console.log(proxy)
// {
//   [[Handler]]: Object,
//   [[Target]]: Object,
//   [[IsRevoked]]: false,
// }

revoke()

console.log(proxy)
// {
//   [[Handler]]: null,
//   [[Target]]: null,
//   [[IsRevoked]]: true,
// }
```

&emsp;&emsp;代理对象被撤销后，执行任何的可代理操作都将抛出错误。

```javascript
var object = {}
var handler = {
  get() {
    return 1
  },
}
var { proxy, revoke } = Proxy.revocable(object, handler)

proxy.value // 1

revoke()

proxy.value // Uncaught TypeError: Cannot perform 'get' on a proxy that has been revoked
```

## 约束

### 内部方法

&emsp;&emsp;;`JavaScript`中创建的对象，会被引擎赋予很多 [内部方法](https://262.ecma-international.org/13.0/#sec-object-internal-methods-and-internal-slots)，在开发者层面是不可见的。

&emsp;&emsp;普通对象上共有`11`个内部方法。

 - `[[GetPrototypeOf]]()`
 - `[[SetPrototypeOf]](V)`
 - `[[IsExtensible]]()`
 - `[[PreventExtensions]]()`
 - `[[GetOwnProperty]](P)`
 - `[[DefineOwnProperty]](P, Desc)`
 - `[[HasProperty]](P)`
 - `[[Get]](P, Receiver)`
 - `[[Set]](P, V, Receiver)`
 - `[[Delete]](P)`
 - `[[OwnPropertyKeys]]()`

&emsp;&emsp;内部方法什么时候执行呢？

&emsp;&emsp;举个例子，在删除对象属性时，引擎会去执行对象上的`[[Delete]](P)`内部方法。

```javascript
delete object.prop
```

&emsp;&emsp;函数作为一类特殊对象，还拓展了部分内部方法。在普通调用时，引擎会去执行`[[Call]]`内部方法。作为构造函数，被`new`调用时，引擎会去执行`[[Construct]]`内部方法。

&emsp;&emsp;例如箭头函数只拓展了`[[Call]]`，没有拓展`[[Construct]]`内部方法。因此只能普通调用，不能通过`new`调用，实际也就是箭头函数不能作为构造函数的根本原因。

### 对比

&emsp;&emsp;那开发者能调用内部方法吗？

&emsp;&emsp;答案是不能，内部方法是引擎层面的东西。

&emsp;&emsp;虽然不能调用，但是有替代实现，即`ES6`新引入的`Proxy`代理函数。我们可以用`JavaScript`代码，自定义刚刚那`13`个内部方法。

&emsp;&emsp;以获取属性值为例，对比普通对象和代理对象的差异。

```javascript
var object = {}
object.value

var handler = { get() {} }
var proxy = new Proxy({}, handler)
proxy.value
```

&emsp;&emsp;普通对象在获取属性值时，引擎会去执行对象上的`[[Get]](P, Receiver)`内部方法。而代理对象在获取属性值时，将会去执行`handler`对象上的`get`方法。

![](/js/proxy/get.png)

&emsp;&emsp;;`handler`对象中的`13`个方法刚好对应了引擎层面的`13`个内部方法。

| `Handler Method` | `Internal Method` |
|:-:| :-:|
| `getPrototypeOf` | `[[GetPrototypeOf]]()` |
| `setPrototypeOf` | `[[SetPrototypeOf]](V)` |
| `isExtensible` | `[[IsExtensible]]()` |
| `preventExtensions` | `[[PreventExtensions]]()` |
| `getOwnPropertyDescriptor` | `[[GetOwnProperty]](P)` |
| `defineProperty` | `[[DefineOwnProperty]](P, Desc)` |
| `has` | `[[HasProperty]](P)` |
| `get` | `[[Get]](P, Receiver)` |
| `set` | `[[Set]](P, V, Receiver)` |
| `deleteProperty` | `[[Delete]](P)` |
| `ownKeys` | `[[OwnPropertyKeys]]()` |
| `apply` | `[[Call]]` |
| `construct` | `[[Construct]]` |

### 不变量

&emsp;&emsp;你可能发现了图示中的`invariant`，是什么东西呢？

&emsp;&emsp;;`ECMA-262`规范中的第 [6.1.7.3](https://262.ecma-international.org/13.0/#sec-invariants-of-the-essential-internal-methods) 小节给出了答案。

> `6.1.7.3 Invariants of the Essential Internal Methods`</br>
> <code>The Internal Methods of Objects of an ECMAScript engine must conform to the list of invariants specified below. Ordinary ECMAScript Objects as well as all standard exotic objects in this specification maintain these invariants. **ECMAScript Proxy objects maintain these invariants by means of runtime checks on the result of traps invoked on the [[ProxyHandler]] object.**</code></br>
> `Any implementation provided exotic objects must also maintain these invariants for those objects. Violation of these invariants may cause ECMAScript code to have unpredictable behaviour and create security issues. However, violation of these invariants must never compromise the memory safety of an implementation.`

&emsp;&emsp;大致语义为，`ECMAScript`中内部方法有一些限制规则，称之为不变量（`invariant`）。目的是为了避免代码出现不可预测的行为从而导致产生安全问题。

&emsp;&emsp;我们来细读规范中`[[Construct]]()`的不变量。

> `[[Construct]]()`</br>
> `The normal return type is Object.`</br>
> `The target must also have a [[Call]] internal method.`

&emsp;&emsp;第一条是方法返回类型必须为对象，第二条是目标对象必须有`[[Call]]`内部方法。

&emsp;&emsp;接着再来看看刚才引用中加粗的部分，什么意思呢？

&emsp;&emsp;即是说`ECMAScript`代理对象在运行`trap`时，会检测返回结果是否符合对应的不变量，以保持与内部方法的统一性。

> `trap`，即`Handler Method`，也就是配置对象`handler`上的方法

&emsp;&emsp;换句话说，不管是内部方法（`Internal Method`）还是代理方法（`Handler Method`），都要符合规范中特定的不变量。

&emsp;&emsp;所以`handler.construct()`方法也要符合`[[Construct]]()`的不变量，例如第一条中返回值必须为对象。在运行时，不符合将抛出错误。

```javascript
var handler = {
  construct() {
    return 1
  },
}
var P = new Proxy(function () {}, handler)

var p = new P()
// Uncaught TypeError: 'construct' on proxy: trap returned non-object ('1')
```

#### get

&emsp;&emsp;若目标对象的属性是不可配置（`non-configurable`）且不可写（`non-writable`）的，则返回值必须与目标对象的属性值相同。

```javascript
var object = {}

Object.defineProperty(object, 'value', {
  value: 2,
  configurable: false,
  writable: false,
})

var handler = {
  get() {
    return 3
  },
}

var proxy = new Proxy(object, handler)

proxy.value
// Uncaught TypeError: 'get' on proxy: property 'value' is a read-only and non-configurable data property on the proxy target but the proxy did not return its actual value (expected '2' but got '3')
```

&emsp;&emsp;若目标对象的属性为不可配置（`non-configurable`）且没有`get`描述符，则返回值必须为`undefined`。

```javascript
var object = {}

Object.defineProperty(object, 'value', {
  configurable: false,
  set() {},
})

var handler = {
  get() {
    return 3
  },
}

var proxy = new Proxy(object, handler)

proxy.value
// Uncaught TypeError: 'get' on proxy: property 'value' is a non-configurable accessor property on the proxy target and does not have a getter function, but the trap did not return 'undefined' (got '3')
```

&emsp;&emsp;个人认为，属性为不可配置且不可写，或者为不可配置且没有`get`，获取属性值时都将返回固定值。而属性读取的代理操作，实际也就没有意义，为了一致性则约束返回值与原值相同。

#### set

&emsp;&emsp;若目标对象的属性是不可配置（`non-configurable`）且不可写（`non-writable`）的，则必须返回`false`。

```javascript
var object = {}

Object.defineProperty(object, 'value', {
  value: 2,
  configurable: false,
  writable: false,
})

var handler = {
  set() {
    return true
  },
}

var proxy = new Proxy(object, handler)

proxy.value = 15
// Uncaught TypeError: 'set' on proxy: trap returned truish for property 'value' which exists in the proxy target as a non-configurable and non-writable data property with a different value
```

&emsp;&emsp;若目标对象的属性为不可配置（`non-configurable`）且没有`set`描述符，则必须返回`false`。

```javascript
var object = {}

Object.defineProperty(object, 'value', {
  configurable: false,
  get() {},
})

var handler = {
  set() {
    return true
  },
}

var proxy = new Proxy(object, handler)

proxy.value = 15
// Uncaught TypeError: 'set' on proxy: trap returned truish for property 'value' which exists in the proxy target as a non-configurable and non-writable accessor property without a setter
```

&emsp;&emsp;类似的，属性为不可配置且不可写，或者为不可配置且没有`set`，都意味着原对象的属性值无法修改。而属性修改的代理操作，无论如何都不会成功，为了一致性则必须返回`false`。

#### has

&emsp;&emsp;若目标对象的属性为不可配置（`non-configurable`），则必须返回`true`。

```javascript
var object = {}

Object.defineProperty(object, 'value', {
  configurable: false,
})

var handler = {
  has(target, property) {
    return false
  },
}

var proxy = new Proxy(object, handler)

'value' in proxy
// Uncaught TypeError: 'has' on proxy: trap returned falsish for property 'value' which exists in the proxy target as non-configurable
```

&emsp;&emsp;属性为不可配置，原对象的属性不可能被删除，也就意味着原对象肯定有此属性。而是否有此属性的代理操作，也就没有任何意义了，为了一致性则必须返回`true`。

#### deleteProperty

&emsp;&emsp;若目标对象的属性为不可配置（`non-configurable`），则必须返回`false`。

```javascript
var object = {}

Object.defineProperty(object, 'value', {
  configurable: false,
})

var handler = {
  deleteProperty(target, property) {
    return true
  },
}

var proxy = new Proxy(object, handler)

delete proxy.value
// Uncaught TypeError: 'deleteProperty' on proxy: trap returned truish for property 'value' which is non-configurable in the proxy target
```

&emsp;&emsp;属性为不可配置，原对象的属性不可能被删除，而删除属性的代理操作，无论如何都不会成功，为了一致性则必须返回`false`。

#### ownKeys

&emsp;&emsp;返回的结果列表中，必须要包含所有不可配置（`non-configurable`）的自身属性。

```javascript
var object = {}

Object.defineProperty(object, 'x', {
  configurable: false,
})

var handler = {
  ownKeys(target) {
    return []
  },
}

var proxy = new Proxy(object, handler)

Reflect.ownKeys(proxy)
// Uncaught TypeError: 'ownKeys' on proxy: trap result did not include 'x'
```

&emsp;&emsp;若目标对象不可拓展，则必须返回所有的自身属性。

```javascript
var object = { x: 1 }

Object.preventExtensions(object)

var handler = {
  ownKeys(target) {
    return []
  },
}

var proxy = new Proxy(object, handler)

Reflect.ownKeys(proxy)
// Uncaught TypeError: 'ownKeys' on proxy: trap result did not include 'x'
```

&emsp;&emsp;并且不可返回目标对象不存在的属性。

```javascript
var object = {}

Object.preventExtensions(object)

var handler = {
  ownKeys(target) {
    return ['x']
  },
}

var proxy = new Proxy(object, handler)

Reflect.ownKeys(proxy)
// Uncaught TypeError: 'ownKeys' on proxy: trap returned extra keys but proxy target is non-extensible
```

#### getOwnPropertyDescriptor

&emsp;&emsp;若目标对象的属性为不可配置（`non-configurable`），不可返回`undefined`，必须返回属性描述符。

```javascript
var object = {}

Object.defineProperty(object, 'value', {
  value: 1,
  configurable: false,
})

var handler = {
  getOwnPropertyDescriptor(target, property) {
    return undefined
  },
}

var proxy = new Proxy(object, handler)

Object.getOwnPropertyDescriptor(proxy, 'value')
// Uncaught TypeError: 'getOwnPropertyDescriptor' on proxy: trap returned undefined for property 'value' which is non-configurable in the proxy target
```

&emsp;&emsp;并且描述符必须与目标对象的一致。

```javascript
var object = {}

Object.defineProperty(object, 'value', {
  value: 1,
  configurable: false,
})

var handler = {
  getOwnPropertyDescriptor(target, property) {
    return {
      value: 2,
      configurable: false,
    }
  },
}

var proxy = new Proxy(object, handler)

Object.getOwnPropertyDescriptor(proxy, 'value')
// Uncaught TypeError: 'getOwnPropertyDescriptor' on proxy: trap returned descriptor for property 'value' that is incompatible with the existing property in the proxy target
```

&emsp;&emsp;若目标对象的属性可配置，返回的属性描述符中`configurable`必须为`true`。

```javascript
var object = {}

Object.defineProperty(object, 'value', {
  value: 1,
  configurable: true,
})

var handler = {
  getOwnPropertyDescriptor(target, property) {
    return {
      configurable: false,
    }
  },
}

var proxy = new Proxy(object, handler)

Object.getOwnPropertyDescriptor(proxy, 'value')
// Uncaught TypeError: 'getOwnPropertyDescriptor' on proxy: trap reported non-configurability for property 'value' which is either non-existent or configurable in the proxy target
```

&emsp;&emsp;若目标对象的属性不存在，返回的属性描述符中`configurable`必须为`true`。

```javascript
var object = {}
var handler = {
  getOwnPropertyDescriptor(target, property) {
    return {
      configurable: false,
    }
  },
}
var proxy = new Proxy(object, handler)

Object.getOwnPropertyDescriptor(proxy, 'value')
// Uncaught TypeError: 'getOwnPropertyDescriptor' on proxy: trap reported non-configurability for property 'value' which is either non-existent or configurable in the proxy target
```

&emsp;&emsp;若目标对象不可拓展，且属性存在，不可返回`undefined`。

```javascript
var object = { value: 1 }

Object.preventExtensions(object)

var handler = {
  getOwnPropertyDescriptor(target, property) {
    return undefined
  },
}

var proxy = new Proxy(object, handler)

Object.getOwnPropertyDescriptor(proxy, 'value')
// Uncaught TypeError: 'getOwnPropertyDescriptor' on proxy: trap returned undefined for property 'value' which exists in the non-extensible proxy target
```

&emsp;&emsp;若目标对象不可拓展，且属性不存在，必须返回`undefined`。

```javascript
var object = {}

Object.preventExtensions(object)

var handler = {
  getOwnPropertyDescriptor(target, property) {
    return {
      value: 1,
    }
  },
}

var proxy = new Proxy(object, handler)

Object.getOwnPropertyDescriptor(proxy, 'value')
// Uncaught TypeError: 'getOwnPropertyDescriptor' on proxy: trap returned descriptor for property 'value' that is incompatible with the existing property in the proxy target
```

#### defineProperty

&emsp;&emsp;若目标对象不可拓展，必须返回`false`，表示不可添加新属性。

```javascript
var object = {}

Object.preventExtensions(object)

var handler = {
  defineProperty(target, property, descriptor) {
    return true
  },
}

var proxy = new Proxy(object, handler)

proxy.value = 1
// Uncaught TypeError: 'defineProperty' on proxy: trap returned truish for adding property 'value'  to the non-extensible proxy target
```

&emsp;&emsp;若目标对象的属性不存在，定义的属性描述符`configurable`必须为`true`。

```javascript
var object = {}
var handler = {
  defineProperty(target, property, descriptor) {
    return true
  },
}
var proxy = new Proxy(object, handler)

Object.defineProperty(proxy, 'value', {
  configurable: false,
})
// Uncaught TypeError: 'defineProperty' on proxy: trap returned truish for defining non-configurable property 'value' which is either non-existent or configurable in the proxy target
```

&emsp;&emsp;若目标对象的属性为可配置（`configurable`），定义的属性描述符`configurable`必须为`true`。

```javascript
var object = {}

Object.defineProperty(object, 'value', {
  configurable: true,
})

var handler = {
  defineProperty(target, property, descriptor) {
    return true
  },
}
var proxy = new Proxy(object, handler)

Object.defineProperty(proxy, 'value', {
  configurable: true,
})
// Uncaught TypeError: 'defineProperty' on proxy: trap returned truish for defining non-configurable property 'value' which is either non-existent or configurable in the proxy target
```

#### preventExtensions

&emsp;&emsp;若目标对象是可拓展的，必须返回`false`。

```javascript
var object = {}
var handler = {
  preventExtensions(target) {
    return true
  },
}
var proxy = new Proxy(object, handler)

Object.preventExtensions(proxy)
// Uncaught TypeError: 'preventExtensions' on proxy: trap returned truish but the proxy target is extensible
```

#### isExtensible

&emsp;&emsp;;`Object.isExtensible(proxy)`返回值必须与`Object.isExtensible(target)`一致。

```javascript
var object = {}
var handler = {
  isExtensible(target) {
    return false
  },
}
var proxy = new Proxy(object, handler)

Object.isExtensible(proxy)
// Uncaught TypeError: 'isExtensible' on proxy: trap result does not reflect extensibility of proxy target (which is 'true')
```

#### getPrototypeOf

&emsp;&emsp;若目标对象不可拓展，必须返回目标对象的实际原型。

```javascript
var object = {}

Object.preventExtensions(object)

var handler = {
  getPrototypeOf(target) {
    return {}
  },
}

var proxy = new Proxy(object, handler)

Object.getPrototypeOf(proxy)
// Uncaught TypeError: 'getPrototypeOf' on proxy: proxy target is non-extensible but the trap did not return its actual prototype
```

&emsp;&emsp;对象不可拓展，不能修改原型的指向，也就意味着原型是固定的。而代理获取原型的操作，也就没有任何意义了，为了一致性则必须返回对象的实际原型。

#### setPrototypeOf

&emsp;&emsp;若目标对象不可拓展，必须返回`false`。

```javascript
var object = {}

Object.preventExtensions(object)

var handler = {
  setPrototypeOf(target, prototype) {
    return true
  },
}

var proxy = new Proxy(object, handler)

Reflect.setPrototypeOf(proxy, {})
// Uncaught TypeError: 'setPrototypeOf' on proxy: trap returned truish for setting a new prototype on the non-extensible proxy target
```

&emsp;&emsp;目标对象不可拓展，不能修改原型指向。而代理设置原型的操作，无论如何都不会成功，为了一致性则必须返回`false`。

#### apply

&emsp;&emsp;无。

#### construct

&emsp;&emsp;必须返回对象。

```javascript
var F = function () {}
var handler = {
  construct(target, thisArg, args) {
    return 1
  },
}
var Ctr = new Proxy(F, handler)

new Ctr()
// Uncaught TypeError: 'construct' on proxy: trap returned non-object ('1')
```

### 小结

<table>
  <thead>
    <tr>
      <th>
        <code>Handler Method</code>
      </th>
      <th>代理行为</th>
      <th>不变量</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <code>get(target, property, receiver)</code>
      </td>
      <td align="left">
        <ul>
          <li>
            <code>proxy[prop]</code>
          </li>
          <li>
            <code>proxy.prop</code>
          </li>
          <li>
            <code>Object.create(proxy)[prop]</code>
          </li>
          <li>
            <code>Reflect.get(proxy, property)</code>
          </li>
        </ul>
      </td>
      <td align="left">
        <ul>
          <li>目标对象属性不可配置且不可写，返回值必须与目标对象的属性值相同</li>
          <li>目标对象属性不可配置且无<code>get</code>描述符，返回值必须为<code>undefined</code></li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        <code>set(target, property, value, receiver)</code>
      </td>
      <td align="left">
        <ul>
          <li>
            <code>proxy.prop = value</code>
          </li>
          <li>
            <code>proxy[prop] = value</code>
          </li>
          <li>
            <code>Object.create(proxy)[prop] = value</code>
          </li>
          <li>
            <code>Reflect.set(proxy, property, value)</code>
          </li>
        </ul>
      </td>
      <td align="left">
        <ul>
          <li>目标对象属性不可配置且不可写，必须返回<code>false</code></li>
          <li>目标对象属性不可配置且无<code>set</code>描述符，必须返回<code>false</code></li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        <code>has(target, property)</code>
      </td>
      <td align="left">
        <ul>
          <li>
            <code>prop in proxy</code>
          </li>
          <li>
            <code>prop in Object.create(proxy)</code>
          </li>
          <li>
            <code>with(proxy){ prop; }</code>
          </li>
          <li>
            <code>with(Object.create(proxy)){ prop; }</code>
          </li>
          <li>
            <code>Reflect.has(proxy, property)</code>
          </li>
        </ul>
      </td>
      <td align="left">
        <ul>
          <li>目标对象属性不可配置，必须返回<code>true</code></li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        <code>deleteProperty(target, property)</code>
      </td>
      <td align="left">
        <ul>
          <li>
            <code>delete proxy.prop</code>
          </li>
          <li>
            <code>delete proxy[prop]</code>
          </li>
          <li>
            <code>Reflect.deleteProperty(proxy, property)</code>
          </li>
        </ul>
      </td>
      <td align="left">
        <ul>
          <li>目标对象属性不可配置，必须返回<code>false</code></li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        <code>ownKeys(target)</code>
      </td>
      <td align="left">
        <ul>
          <li>
            <code>for...in</code>
          </li>
          <li>
            <code>Object.keys(proxy) / Object.values(proxy) / Object.entries(proxy)</code>
          </li>
          <li>
            <code>Object.getOwnPropertyNames(proxy)</code>
          </li>
          <li>
            <code>Object.getOwnPropertySymbols(proxy)</code>
          </li>
          <li>
            <code>Reflect.ownKeys(proxy)</code>
          </li>
        </ul>
      </td>
      <td align="left">
        <ul>
          <li>返回的结果列表，必须包含所有不可配置的自身属性</li>
          <li>目标对象不可拓展，必须返回所有的自身属性，且不可返回目标对象不存在的属性</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        <code>getOwnPropertyDescriptor(target, property)</code>
      </td>
      <td align="left">
        <ul>
          <li>
            <code>Object.getOwnPropertyDescriptor(proxy, prop)</code>
          </li>
          <li>
            <code>Reflect.getOwnPropertyDescriptor(proxy, prop)</code>
          </li>
          <li>
            <code>Object.getOwnPropertyDescriptors(proxy)</code>
          </li>
        </ul>
      </td>
      <td align="left">
        <ul>
          <li>
            目标对象属性不可配置，不可返回<code>undefined</code>，必须返回属性描述符，且描述符必须与目标对象的一致
          </li>
          <li>目标对象属性可配置，返回的属性描述符中<code>configurable</code>必须为<code>true</code></li>
          <li>目标对象属性不存在，返回的属性描述符中<code>configurable</code>必须为<code>true</code></li>
          <li>目标对象不可拓展，且属性存在，不可返回<code>undefined</code></li>
          <li>目标对象不可拓展，且属性不存在，必须返回<code>undefined</code></li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        <code>defineProperty(target, property, descriptor)</code>
      </td>
      <td align="left">
        <ul>
          <li>
            <code>Object.defineProperty(proxy, prop, descriptor)</code>
          </li>
          <li>
            <code>Reflect.defineProperty(proxy, prop, descriptor)</code>
          </li>
          <li>
            <code>Object.defineProperties(proxy, descriptors)</code>
          </li>
          <li>
            <code>proxy.prop = value</code>
          </li>
          <li>
            <code>proxy[prop] = value</code>
          </li>
        </ul>
      </td>
      <td align="left">
        <ul>
          <li>目标对象不可拓展，必须返回<code>false</code>，即不可添加新属性</li>
          <li>目标对象属性不存在，定义的属性描述符<code>configurable</code>必须为<code>true</code></li>
          <li>目标对象属性可配置，定义的属性描述符<code>configurable</code>必须为<code>true</code></li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        <code>preventExtensions(target)</code>
      </td>
      <td align="left">
        <ul>
          <li>
            <code>Object.preventExtensions(proxy)</code>
          </li>
          <li>
            <code>Reflect.preventExtensions(proxy)</code>
          </li>
        </ul>
      </td>
      <td align="left">
        <ul>
          <li>目标对象可拓展，必须返回<code>false</code></li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        <code>isExtensible(target)</code>
      </td>
      <td align="left">
        <ul>
          <li>
            <code>Object.isExtensible(proxy)</code>
          </li>
          <li>
            <code>Reflect.isExtensible(proxy)</code>
          </li>
        </ul>
      </td>
      <td align="left">
        <ul>
          <li>
            <code>Object.isExtensible(proxy)</code>返回值必须与<code>Object.isExtensible(target)</code>一致
          </li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        <code>getPrototypeOf(target)</code>
      </td>
      <td align="left">
        <ul>
          <li>
            <code>Object.getPrototypeOf(proxy)</code>
          </li>
          <li>
            <code>Reflect.getPrototypeOf(proxy)</code>
          </li>
          <li>
            <code>proxy.__proto__</code>
          </li>
          <li>
            <code>Object.prototype.isPrototypeOf(proxy)</code>
          </li>
          <li>
            <code>proxy instanceof Object</code>
          </li>
        </ul>
      </td>
      <td align="left">
        <ul>
          <li>目标对象不可拓展，必须返回目标对象的实际原型</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        <code>setPrototypeOf(target, prototype)</code>
      </td>
      <td align="left">
        <ul>
          <li>
            <code>Object.setPrototypeOf(proxy, prototype)</code>
          </li>
          <li>
            <code>Reflect.setPrototypeOf(proxy, prototype)</code>
          </li>
        </ul>
      </td>
      <td align="left">
        <ul>
          <li>目标对象不可拓展，必须返回<code>false</code></li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        <code>apply(target, thisArg, args)</code>
      </td>
      <td align="left">
        <ul>
          <li>
            <code>proxy(args)</code>
          </li>
          <li>
            <code>proxy.call(thisArg, args)</code>
          </li>
          <li>
            <code>proxy.apply(thisArg, args)</code>
          </li>
          <li>
            <code>Reflect.apply(proxy, thisArg, args)</code>
          </li>
        </ul>
      </td>
      <td>-</td>
    </tr>
    <tr>
      <td>
        <code>construct(target, args, newTarget)</code>
      </td>
      <td align="left">
        <ul>
          <li>
            <code>new proxy(args)</code>
          </li>
          <li>
            <code>Reflect.construct(proxy, args, newTarget)</code>
          </li>
        </ul>
      </td>
      <td align="left">
        <ul>
          <li>必须返回对象</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

## 应用场景

### 数组负索引

```javascript
function negative(array) {
  return new Proxy(array, {
    get(target, property, receiver) {
      if (typeof property === 'string' && property < 0) {
        property = target.length + Number(property)
      }

      return Reflect.get(target, property, receiver)
    },
  })
}

var array = negative([1, 2, 3])
array[-1] // 3
```

### 隐藏内部属性

```javascript
var object = { _id: 1 }
var handler = {
  get(target, property, receiver) {
    if (property[0] === '_') return undefined

    return Reflect.get(target, property, receiver)
  },
}
var proxy = new Proxy(object, handler)

proxy._id // undefined
```

### 创建只读对象

```javascript
function readonly(target) {
  return new Proxy(target, {
    set() {
      return true
    },
    deleteProperty() {
      return false
    },
    defineProperty() {
      return true
    },
    setPrototypeOf() {
      return false
    },
  })
}

var object = readonly({ value: 1 })
object.value = 2

object.value // 1
```

> 参考 [vue](https://cn.vuejs.org/api/reactivity-core.html#readonly) 响应式`api`核心方法 [readonly](https://github.com/vuejs/core/blob/v3.2.41/packages/reactivity/src/baseHandlers.ts#L222) 创建只读代理

### 支持链式属性

```javascript
function chaining(target) {
  return new Proxy(function () {}, {
    get(_, property) {
      return chaining((target ?? {})[property])
    },
    apply() {
      return target
    },
  })
}

var object = {x: 1}

console.log(object) // {x: 1}
console.log(object.x) // 1
console.log(object.x.y) // undefined
console.log(object.x.y.z) // Uncaught TypeError: Cannot read properties of undefined (reading 'z')

console.log(chaining(object)()) // {x: 1}
console.log(chaining(object).x()) // 1
console.log(chaining(object).x.y()) // undefined
console.log(chaining(object).x.y.z()) // undefined
```

### 属性值校验

```javascript
function validate(object) {
  return new Proxy(object, {
    set(target, property, value, receiver) {
      if (property === 'age') {
        if (!Number.isInteger(value)) {
          throw new TypeError('The age is not an integer')
        }
      }

      return Reflect.set(target, property, value, receiver)
    },
  })
}

var person = validate({ age: 18 })
person.age = 18.5 // Uncaught TypeError: The age is not an integer
```

### 管道

```javascript
function pipe(value) {
  var funcs = []
  var proxy = new Proxy(function () {}, {
    get(_, property) {
      funcs.push(window[property])

      return proxy
    },
    apply() {
      return funcs.reduce((result, func) => func(result), value)
    },
  })

  return proxy
}

var double = n => n * 2
var pow = n => n * n

pipe(3).double.pow() // 36
```

### 数据监听

```javascript
<span>1</span>
<button>按钮</button>

function watch(object, callback) {
  return new Proxy(object, {
    set(target, property, value, receiver) {
      callback(property, value)

      return Reflect.set(target, property, value, receiver)
    },
  })
}

var object = { value: 1 }
var proxy = watch(object, (key, value) => {
  if (key === 'value') document.querySelector('span').innerText = value
})

document.querySelector('button').addEventListener('click', () => {
  proxy.value++
})
```

## 常见问题

### 为什么 Proxy 大多与 Reflect 结合使用？

&emsp;&emsp;以属性赋值时打印日志为例。

```javascript
var proxy = new Proxy({}, {
  set(...args) {
    console.log('setter')

    return Reflect.set(...args)
  },
})

proxy.value = 1 // setter
```

&emsp;&emsp;;`Reflect`将`set`语义透传到目标对象上，保持了默认的赋值行为。

&emsp;&emsp;以上也可写成。

```javascript
var proxy = new Proxy({}, {
  set(target, property, value) {
    console.log('setter')

    target[property] = value

    return true
  },
})
```

&emsp;&emsp;两者没有太大区别，但是注意像`set/get`此类`trap`相对容易，有些`trap`例如`ownKeys`，开发者几乎很难编写出来。

&emsp;&emsp;相对合理的是，所有`trap`的默认行为都统一由`Reflect`来做。换句话说，无论`Proxy`代理何种操作，总是可以在`Reflect`上找到对应的默认行为，也说明了为什么`trap`与`Reflect`方法是一对一的。

&emsp;&emsp;另外`set/get`中额外的参数`receiver`，用来保证`this`的正确传递。

```javascript
var object = { get value() { return this } }
var x = new Proxy(object, {
  get(target, property, receiver) {
    return Reflect.get(target, property, receiver)
  },
})
var y = new Proxy(object, {
  get(target, property, receiver) {
    // or target[property]
    return Reflect.get(target, property)
  },
})

x.value === x // true
y.value === y // false
```

&emsp;&emsp;综上所述。

 - 保持默认行为，透传语义，且正确传递`this`
 - 函数式编程，语义清晰，代码可自解释
 - 语言内部操作统一部署至`Reflect`，有利于管理和维护

### Proxy 如何代理 Map？

&emsp;&emsp;;`JavaScript`对象除了会被引擎赋予内部方法，也会赋予内部槽。内部槽不是属性，类似属性，用于在对象上记录状态或数据。

&emsp;&emsp;以`Map`类型为例，引擎会赋予实例 [[[MapData]]](https://262.ecma-international.org/13.0/#sec-properties-of-array-instances) 内部槽，将各数据项存储在`[[MapData]]`上。

```javascript
var map = new Map()

map.set(1, 2)

map // Map(1) {1 => 2}
```

&emsp;&emsp;运行`map.set(1, 2)`时，由于实例上没有`set`方法，将沿着原型链寻找原型方法，则相当于运行`Map.prototype.set.call(map, 1, 2)`。紧接着`Map.prototype.set`方法内部将访问`this`实例对象的`[[MapData]]`内部槽，即`this.[[MapData]]`，也就是`map.[[MapData]]`，然后添加数据项。

```javascript
var map = new Map()
var proxy = new Proxy(map, {})

proxy.set(1, 2) // Uncaught TypeError: Method Map.prototype.set called on incompatible receiver #<Map>
```

&emsp;&emsp;而运行`proxy.set(1, 2)`时，`handler`为空`proxy`未代理任何操作，将获取`map.set`方法，则相当于<code>Map.prototype.set.call(**proxy**, 1, 2)</code>，`Map.prototype.set`即访问内部槽`proxy.[[MapData]]`。由于`proxy`对象没有此内部槽，将抛出错误。

&emsp;&emsp;那如何解决呢？

&emsp;&emsp;可将`set`方法内部`this`固定为`map`。

```javascript
var map = new Map()
var proxy = new Proxy(map, {
  get(target, property, receiver) {
    var value = Reflect.get(target, property, receiver)

    if (target instanceof Map) {
      value = value.bind(target)
    }

    return value
  },
})

proxy.set(1, 2)

map // Map(1) {1 => 2}
```

#### 内置对象

&emsp;&emsp;以上可总结出，即使`Proxy`未代理任何操作，也会将目标对象上方法或访问器内部`this`的指向修改为代理对象。

```javascript
var object = {
  method() {
    return this
  },
  get value() {
    return this
  },
}
var handler = {}
var proxy = new Proxy(object, handler)

proxy.value === proxy // true
proxy.method() === proxy // true
```

&emsp;&emsp;进一步的，在目标对象方法或访问器内部，若严格依赖`this`实例对象上的内部槽，而代理对象没有，运行可能会造成错误。

&emsp;&emsp;例如代理`Set`实例，`proxy`上没有 [[[SetData]]](https://262.ecma-international.org/13.0/#sec-properties-of-set-instances) 内部槽。

```javascript
var set = new Set()
var proxy = new Proxy(set, {})

proxy.add(1) // Uncaught TypeError: Method Set.prototype.add called on incompatible receiver #<Set>
```

&emsp;&emsp;优化为。

```javascript
var set = new Set()
var proxy = new Proxy(set, {
  get(target, property, receiver) {
    var value = Reflect.get(target, property, receiver)

    if (target instanceof Set) {
      value = value.bind(target)
    }

    return value
  },
})

proxy.add(1)

set // Set(1) {1}
```

&emsp;&emsp;或者代理`Promise`实例，`proxy`上没有 [[[PromiseState]]](https://262.ecma-international.org/13.0/#sec-properties-of-promise-instances) 内部槽。

```javascript
var promise = Promise.resolve()
var proxy = new Proxy(promise, {})

proxy.then(() => console.log(1))
// Uncaught TypeError: Method Promise.prototype.then called on incompatible receiver #<Promise>
```

&emsp;&emsp;优化为。

```javascript
var promise = Promise.resolve()
var proxy = new Proxy(promise, {
  get(target, property, receiver) {
    var value = Reflect.get(target, property, receiver)

    if (target instanceof Promise) {
      value = value.bind(target)
    }

    return value
  },
})

proxy.then(() => console.log(1)) // 1
```

&emsp;&emsp;又或者代理`Date`，`proxy`上没有 [[[DateValue]]](https://262.ecma-international.org/13.0/#sec-properties-of-date-instances) 内部槽。

```javascript
var date = new Date()
var proxy = new Proxy(date, {})

proxy.getFullYear() // Uncaught TypeError: this is not a Date object
```

&emsp;&emsp;优化为。

```javascript
var date = new Date()
var proxy = new Proxy(date, {
  get(target, property, receiver) {
    var value = Reflect.get(target, property, receiver)

    if (target instanceof Date) {
      value = value.bind(target)
    }

    return value
  },
})

proxy.getFullYear() // 2022
```

#### 私有属性

&emsp;&emsp;类的私有属性中也存在类似问题。

```javascript
class User {
  #name = 'xxx'
  
  getName() {
    return this.#name
  }
}
var user = new User()
var proxy = new Proxy(user, {})

proxy.getName() // Uncaught TypeError: Cannot read private member #name from an object whose class did not declare it
```

&emsp;&emsp;先来看看`ECMA-262`规范中与私有属性有关的内部槽。

> `6.1.7.2 Object Internal Methods and Internal Slots`</br>
> `All objects have an internal slot named [[PrivateElements]], which is a List of PrivateElements. This List represents the values of the private fields, methods, and accessors for the object. Initially, it is an empty List.`

&emsp;&emsp;大致语义为所有对象都有`[[PrivateElements]]`内部槽，是一个`PrivateElements`列表，记录对象的私有属性、方法和访问器。

&emsp;&emsp;;`PrivateElements`又是什么呢？

> `6.2.9 The PrivateElement Specification Type`</br>
> `...`</br>
> <code>Values of the PrivateElement type are Record values whose fields are defined by Table 9. Such values are referred to as **PrivateElements**.</code>

&emsp;&emsp;;`PrivateElement`是一种规范类型，字段包括。

 - `[[Key]]`：属性、方法或访问器的名称
 - `[[Kind]]`：种类，属性、方法或访问器的一种
 - `[[Value]]`：值
 - `[[Get]]`：访问器`getter`
 - `[[Set]]`：访问器`setter`

&emsp;&emsp;;`PrivateElement`字段与字段值一起称为`PrivateElements`。

&emsp;&emsp;以`user`实例为例，私有属性`#name`对应的`PrivateElements`为。

```javascript
{
  [[Key]]: #name,
  [[Kind]]: field,
  [[Value]]: 'xxx',
}
```

&emsp;&emsp;内部槽为。

```javascript
{
  [[PrivateElements]]: [
    {
      [[Key]]: #name,
      [[Kind]]: field,
      [[Value]]: 'xxx',
    }
  ]
  ...
}
```

&emsp;&emsp;而在`this.#name`获取私有属性时，将执行 [PrivateElementFind](https://262.ecma-international.org/13.0/#sec-privateelementfind) 抽象方法，返回`#name`对应的`PrivateElements`。然后执行 [PrivateGet](https://262.ecma-international.org/13.0/#sec-privateget) 抽象方法，返回`PrivateElements`上的`[[Value]]`字段值。

&emsp;&emsp;代理`user`导致`getName`方法内部`this`指向`proxy`，`proxy`虽为对象且有`[[PrivateElements]]`内部槽，但是`[[PrivateElements]]`值为空列表，获取属性时抽象方法`PrivateElementFind`会返回`empty`空值。继续执行抽象方法`PrivateGet`，空值将抛出错误。

&emsp;&emsp;类似的优化为。

```javascript
class User {
  #name = 'xxx'

  getName() {
    return this.#name
  }
}
var user = new User()
var proxy = new Proxy(user, {
  get(target, property, receiver) {
    var value = Reflect.get(target, property, receiver)

    if (typeof value === 'function') {
      value = value.bind(target)
    }

    return value
  },
})

proxy.getName() // xxx
```

#### 性能局限

&emsp;&emsp;;`Proxy`也存在一些性能问题。

```javascript
function normal(count) {
  var object = { value: 0 }

  console.time('normal')
  for (var i = 0; i < count; i++) {
    object.value++
  }
  console.timeEnd('normal')
}

function defaultTrap(count) {
  var object = { value: 0 }
  var proxy = new Proxy(object, {})

  console.time('defaultTrap')
  for (var i = 0; i < count; i++) {
    proxy.value++
  }
  console.timeEnd('defaultTrap')
}

function expressionTrap(count) {
  var object = { value: 0 }
  var proxy = new Proxy(object, {
    get(target, property) {
      return target[property]
    },
    set(target, property, value) {
      target[property] = value

      return true
    },
  })

  console.time('expressionTrap')
  for (var i = 0; i < count; i++) {
    proxy.value++
  }
  console.timeEnd('expressionTrap')
}

function reflectTrap(count) {
  var object = { value: 0 }
  var proxy = new Proxy(object, {
    get(target, property, receiver) {
      return Reflect.get(target, property, receiver)
    },
    set(target, property, value, receiver) {
      return Reflect.set(target, property, value, receiver)
    },
  })

  console.time('reflectTrap')
  for (var i = 0; i < count; i++) {
    proxy.value++
  }
  console.timeEnd('reflectTrap')
}

function defineProperty(count) {
  var object = { value: 0 }
  var proxy = {}

  Object.defineProperty(proxy, 'value', {
    get() {
      return object.value
    },
    set(val) {
      object.value = val
    },
  })

  console.time('defineProperty')
  for (var i = 0; i < count; i++) {
    proxy.value++
  }
  console.timeEnd('defineProperty')
}

var count = 1000000

normal(count)
defaultTrap(count)
expressionTrap(count)
reflectTrap(count)
defineProperty(count)
```

&emsp;&emsp;;`node`版本`v16.14.0`测试结果，其中`reflectTrap`相较于`normal`性能差了很多。

```javascript
normal: 3.681ms
defaultTrap: 386.346ms
expressionTrap: 61.572ms
reflectTrap: 430.464ms
defineProperty: 4.848ms
```

### Polyfill 原理是什么？

&emsp;&emsp;;`Proxy`的 [兼容性](https://caniuse.com/?search=proxy) 相对较好，但`IE`浏览器的任何版本都不支持。

&emsp;&emsp;相关`polyfill`库内部都是用`Object.defineProperty`模拟`Proxy`语法，`es6-proxy-polyfill`相对较新，逻辑更加清晰，符合函数式编程。

| `polyfill` | 兼容 | `traps` | 支持度 | 说明 |
|:-:|:-:|:-:|:-:|:-:|
| [proxy-polyfill](https://github.com/GoogleChrome/proxy-polyfill) | `IE9+` | `get`、`set`、`apply`和`construct` | 对象、函数 | 对象仅代理已存在属性，无法代理新属性 |
| [es6-proxy-polyfill](https://github.com/ambit-tsai/es6-proxy-polyfill) | `IE6+` | `get`、`set`、`apply`和`construct` | 对象、函数和数组 | 非数组对象，仅代理已存在属性，无法代理新属性。`IE8`及以下依赖`object-defineproperty-ie`库支持 |

&emsp;&emsp;以下将分析`es6-proxy-polyfill/src/index.js`核心部分。

#### 内部类

&emsp;&emsp;构造函数`Internal`创建内部实例，保存目标对象`target`和配置对象`handler`。外部统一调用实例方法来修改`target`，包括`GET`、`SET`、`CALL`和`CONSTRUCT`。

```javascript
var PROXY_TARGET = '[[ProxyTarget]]'
var PROXY_HANDLER = '[[ProxyHandler]]'
var GET = '[[Get]]'
var SET = '[[Set]]'
var CALL = '[[Call]]'
var CONSTRUCT = '[[Construct]]'

function Internal(target, handler) {
  this[PROXY_TARGET] = target
  this[PROXY_HANDLER] = handler
}

Internal.prototype[GET] = function () {}
Internal.prototype[SET] = function () {}
Internal.prototype[CALL] = function () {}
Internal.prototype[CONSTRUCT] = function () {}
```

&emsp;&emsp;以`SET`修改属性值为例。

```javascript
Internal.prototype[SET] = function (property, value, receiver) {
  var target = this[PROXY_TARGET], handler = this[PROXY_HANDLER]

  if (handler.set == undefined) {
    target[property] = value
  } else if (typeof handler.set === 'function') {
    var result = handler.set(target, property, value, receiver)

    return Boolean(result)
  }
}
```

&emsp;&emsp;第一种情况在未指定`handler.set`时，默认修改目标对象。

```javascript
var object = { x: 1 }
var handler = {}
var proxy = new Proxy(object, handler)

var internal = new Internal(object, handler)
internal[SET]('x', 2)

object // {x: 2}
```

&emsp;&emsp;第二种情况若指定了`handler.set`，则正确传递参数由`handler.set`来修改目标对象。

```javascript
var object = { x: 1 }
var handler = {
  set(target, property, value) {
    return Reflect.set(target, property, value * 3)
  },
}
var proxy = new Proxy(object, handler)

var internal = new Internal(object, handler)
internal[SET]('x', 2)

object // {x: 6}
```

#### 观察函数

&emsp;&emsp;;`observeProperty`观察对象已存在属性的读写操作，返回属性描述符。

```javascript
function observeProperty(obj, prop, internal) {
  var desc = getOwnPropertyDescriptor(obj, prop)

  return {
    get: function () { console.log('get') },
    set: function (value) { console.log('set') },
    enumerable: desc.enumerable,
    configurable: desc.configurable,
  }
}
```

&emsp;&emsp;先不考虑`get`和`set`内逻辑，修改为`log`函数。

&emsp;&emsp;;`observeProperties`观察对象自身所有属性。

```javascript
function observeProperties(obj, internal) {
  var names = getOwnPropertyNames(obj), descMap = {}

  for (var i = names.length - 1; i >= 0; --i) {
    descMap[names[i]] = observeProperty(obj, names[i], internal)
  }
  
  return descMap
}
```

&emsp;&emsp;配合`Object.defineProperties`，可拦截对象属性的读写操作。

```javascript
var object = { x: 1, y: 2 }

var descMap = observeProperties(object)
Object.defineProperties(object, descMap)

object.x // get
object.y = 2 // set
```

&emsp;&emsp;;`observeProto`观察对象原型链上所有属性，返回属性描述符。

```javascript
function observeProto(internal) {
  var descMap = {}, proto = internal[PROXY_TARGET]

  while ((proto = getPrototypeOf(proto))) {
    var props = observeProperties(proto, internal)
    objectAssign(descMap, props)
  }

  return descMap
}
```

&emsp;&emsp;例如观察数组原型。

```javascript
var object = [1, 2, 3]
var handler = {}

var internal = new Internal(object, handler)
observeProto(internal)
```

&emsp;&emsp;返回属性描述符，由数组每一级的原型对象的属性构成。

![](/js/proxy/proto.png)

&emsp;&emsp;暂时不关注`observeProto`作用，接着往下看。

#### 主函数

&emsp;&emsp;代理类型包括数组、对象和函数三种。

```javascript
function ProxyPolyfill(target, handler) {
  ...
  return createProxy(new Internal(target, handler))
}

function createProxy(internal) {
  var proxy, target = internal[PROXY_TARGET]

  if (typeof target === 'function') {
    proxy = proxyFunction(internal)
  } else if (target instanceof Array) {
    proxy = proxyArray(internal)
  } else {
    proxy = proxyObject(internal)
  }
  return proxy
}

window.Proxy = ProxyPolyfill
```

&emsp;&emsp;分类型的原因是什么呢？

&emsp;&emsp;返回值`proxy`类型与目标对象`target`类型存在一些关联。

&emsp;&emsp;例如代理函数，若支持`proxy()`函数式调用，`proxy`类型一定为函数。

```javascript
var proxy = new Proxy(function () {}, {})

proxy(1, 2)
```

#### 代理对象

&emsp;&emsp;我们来手动编写一个代理对象函数`proxyObject`。

```javascript
function proxyObject(internal) {
  var descMap, proxy = {}, target = internal[PROXY_TARGET]

  descMap = observeProperties(target, internal)
  Object.defineProperties(proxy, descMap)

  return proxy
}
```

&emsp;&emsp;观察并拦截了对象自身所有属性。

```javascript
var object = { x: 1, y: 2 }
var handler = {}

var internal = new Internal(object, handler)
var proxy = proxyObject(internal)

proxy.x // get
proxy.y = 2 // set
```

&emsp;&emsp;然后考虑补全`observeProperty`函数内`set`和`get`。

&emsp;&emsp;即修改和读取目标对象的属性，我们可以借助内部实例的`SET`和`GET`方法。

```javascript
function observeProperty(obj, prop, internal) {
  var desc = getOwnPropertyDescriptor(obj, prop)

  return {
    get: function () {
      return internal[GET](prop, this)
    },
    set: function (value) {
      internal[SET](prop, value, this)
    },
    ...
  }
}
```

&emsp;&emsp;特别注意`set`和`get`内`this`实例默认指向调用者，恰好传至内部实例`receiver`参数。

```javascript
proxy.x // 1
proxy.y = 3
object // {x: 1, y: 3}
```

#### 代理数组

&emsp;&emsp;;`proxyObject`也适用于数组类型。

```javascript
var object = [1, 2, 3]
var handler = {}

var internal = new Internal(object, handler)
var proxy = proxyObject(internal)

proxy[2] // 3
```

&emsp;&emsp;唯一差异在于无法代理数组的原型方法。

```javascript
proxy.join(',') // Uncaught TypeError: proxy.join is not a function
```

&emsp;&emsp;因为`proxy`并没有`join`属性，运行肯定报错。

```javascript
{
  0: 1,
  1: 2,
  2: 3,
  length: 3,
}
```

&emsp;&emsp;那就很简单了，`proxy`添加`join`属性。

```javascript
function proxyArray(internal) {
  var descMap, target = internal[PROXY_TARGET]
  var proxy = {
    get join() {
      console.log('get')
    },
    set join(value) { 
      console.log('set')
    },
  }

  descMap = observeProperties(target, internal)
  Object.defineProperties(proxy, descMap)

  return proxy
}
```

&emsp;&emsp;拦截了`join`属性。

```javascript
var object = [1, 2, 3]
var handler = {}

var internal = new Internal(object, handler)
var proxy = proxyArray(internal)

proxy.join // get
```

&emsp;&emsp;仍然借助内部实例方法，补全`get`和`set`。

```javascript
var proxy = {
  get join() {
    return internal[GET]('join', this)
  },
  set join(value) {
    internal[GET]('join', value, this)
  },
}
```

&emsp;&emsp;还存在一个问题，即无法支持别的数组方法，例如`pop`、`reverse`等。

&emsp;&emsp;刚才的`observeProto`就派上用场了，修改下`proxyArray`。

```javascript
function proxyArray(internal) {
  var descMap, proxy = {}, target = internal[PROXY_TARGET]

  descMap = observeProto(internal)
  delete descMap.length
  Object.defineProperties(proxy, descMap)

  descMap = observeProperties(target, internal)
  Object.defineProperties(proxy, descMap)

  return proxy
}
```

&emsp;&emsp;已经支持数组原型上的所有方法了。

```javascript
var object = [1, 2, 3]
var handler = {}

var internal = new Internal(object, handler)
var proxy = proxyArray(internal)

proxy.pop() // 3
proxy
// {
//   0: 1,
//   1: 2,
//   at: ƒ at(),
//   concat: ƒ concat(),
//   ...
//   hasOwnProperty: ƒ hasOwnProperty(),
//   ...
//   isPrototypeOf: ƒ isPrototypeOf(),
//   ...
//   valueOf: ƒ valueOf(),
//   values: ƒ values(),
// }
```

&emsp;&emsp;现在来看看`es6-proxy-polyfill`内部`proxyArray`，与我们编写的版本大同小异。

```javascript
function proxyArray(internal) {
  var descMap, newProto, target = internal[PROXY_TARGET]

  descMap = observeProto(internal)
  newProto = objectCreate(getPrototypeOf(target), descMap)

  descMap = observeProperties(target, internal)

  return objectCreate(newProto, descMap)
}
```

&emsp;&emsp;差异仅在`es6-proxy-polyfill`未将原型方法作为`proxy`的属性，个人猜测是为了不破坏`proxy`自身属性，将原型方法合并为对象放在`proxy`的原型链头部，并将其指向了目标对象的原型链，形成一条新原型链`newProto`，如橙色箭头指向。

![](/js/proxy/newProto.png)

#### 代理函数

##### CALL / CONSTRUCT

&emsp;&emsp;以下为内部实例上`CALL`方法，其中`target.apply(thisArg, argList)`用于将数组`argList`转换为参数数列。

```javascript
Internal.prototype[CALL] = function (thisArg, argList) {
  var target = this[PROXY_TARGET], handler = this[PROXY_HANDLER]

  if (handler.apply == undefined) {
    return target.apply(thisArg, argList)
  }
  if (typeof handler.apply === 'function') {
    return handler.apply(target, thisArg, argList)
  }
}
```

&emsp;&emsp;类似的在未指定`handler.apply`时，默认调用目标对象。

```javascript
var object = function (x, y) { return x + y }
var handler = {}
var proxy = new Proxy(object, handler)

var internal = new Internal(object, handler)
internal[CALL](null, [1, 2]) // 3
```

&emsp;&emsp;若指定了`handler.apply`，则正确传递参数由`handler.apply`来调用目标对象。

```javascript
var object = function (x, y) { return x + y }
var handler = {
  apply(target, thisArg, args) {
    return Reflect.apply(target, thisArg, args) * 3
  },
}
var proxy = new Proxy(object, handler)

var internal = new Internal(object, handler)
internal[CALL](null, [1, 2]) // 9
```

&emsp;&emsp;接着来看下`CONSTRUCT`方法。

```javascript
Internal.prototype[CONSTRUCT] = function (argList, newTarget) {
  var newObj, target = this[PROXY_TARGET], handler = this[PROXY_HANDLER]

  if (handler.construct == undefined) {
    newObj = evaluateNew(target, argList)
  } else if (typeof handler.construct === 'function') {
    newObj = handler.construct(target, argList, newTarget)
  }

  return newObj
}
```

&emsp;&emsp;也是类似的，在未指定`handler.construct`时，则默认`new`目标对象。

```javascript
var object = function (x, y) {
  this.x = x
  this.y = y
}
var handler = {}
var proxy = new Proxy(object, handler)

var internal = new Internal(object, handler)
internal[CONSTRUCT]([1, 2], function F() {}) // object {x: 1, y: 2}
```

&emsp;&emsp;注意`ES6`构造函数中数组转参数数列很容易。

```javascript
new target(...argList)
```

&emsp;&emsp;但在`ES5`中较困难，借助`eval`或者`new Function`拼接参数才可实现。

```javascript
function evaluateNew(F, argList) {
  argList = Array.prototype.slice.call(argList)

  var executor = new Function('Ctor', 'return new Ctor(' + argList + ')')

  return executor(F, argList)
}
```

&emsp;&emsp;若指定了`handler.construct`，则正确传递参数由`handler.construct`来调用目标对象。

```javascript
var object = function (x, y) {
  this.x = x
  this.y = y
}
var handler = {
  construct(target, args, newTarget) {
    return Reflect.construct(target, args, newTarget)
  },
}
var proxy = new Proxy(object, handler)

var internal = new Internal(object, handler)
internal[CONSTRUCT]([1, 2], function F() {}) // F {x: 1, y: 2}
```

##### proxyFunction

&emsp;&emsp;主函数部分提及到，`proxy()`支持函数式调用，则返回值一定为函数。

```javascript
function proxyFunction(internal) {
  function P() {
    console.log('function')
  }

  return P
}
```

&emsp;&emsp;拦截了函数式调用。

```javascript
var object = function (x, y) { return x + y }
var handler = {}

var internal = new Internal(object, handler)
var proxy = proxyFunction(internal)

proxy(1, 2) // function
```

&emsp;&emsp;借助内部实例，修改`P`函数。

```javascript
function P() {
  return internal[CALL](this, arguments)
}

proxy(1, 2) // 3
```

&emsp;&emsp;如何知晓外部是否`new`调用呢？

&emsp;&emsp;判断函数`P`内`this`是否为`P`函数实例即可。

```javascript
function P() {
  return this instanceof P
    ? internal[CONSTRUCT](arguments, P)
    : internal[CALL](this, arguments)
}
```

#### 小结

&emsp;&emsp;以上分析了`es6-proxy-polyfill`核心部分，包括代理对象、数组、函数三种类型，处理方式均大同小异，都是依赖`Object.defineProperty`或者`Object.create`拦截属性的修改和读取，注意`Object.create`第二个参数与`Object.defineProperty`作用类似，关于`Object.create`更多细节参考 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/create)。

&emsp;&emsp;外部读取属性、修改属性或者执行方法，都是借助内部实例原型上的方法。配置对象在未指定对应`trap`时，默认操作目标对象。若指定了对应`trap`，则正确传递参数由`trap`处理目标对象。

&emsp;&emsp;在代理数组时之所以支持数组方法，例如`proxy.join(',')`。原理是将数组每一级原型的属性取出并合并成一个对象，作为`proxy`原型链的头部，且将头部指向了目标对象。

## 小结

 - 构造函数`Proxy`没有`prototype`原型属性，无法继承
 - 为了内部方法的统一性，不变量也会限制`trap`的返回结果
 - 内置对象或者私有属性严格依赖`this`实例的内部槽，代理可能出错
 - `Proxy`也有局限性，例如无法代理`==`或`===`等操作
 - `Proxy`存在性能问题，即使没有任何`trap`

## 参考

 - [Trap 结果检测](https://www.zhihu.com/question/330408977/answer/811228034)
 - [Proxy 里面为什么要用 Reflect？](https://www.zhihu.com/question/460133198)
 - [Proxy 怎样代理 Map？](https://www.zhihu.com/question/426875859)
 - [关于 Proxy 代理的性能问题？](https://www.zhihu.com/question/460330154)

 ##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125) / [Gitee](https://gitee.com/dongwei1125)、[GitHub Pages](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~