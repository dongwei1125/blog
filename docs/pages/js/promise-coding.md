# 参考 Promise/A+ 规范和测试用例手写 Promise

![](/js/promise-coding/banner.jpg)

## 前言

&emsp;&emsp;这可能是手写`promise`较清晰的文章之一。

&emsp;&emsp;由浅至深逐步分析了原生测试用例，以及相关`Promise/A+`规范。阅读上推荐以疑问章节为切入重点，对比`Promise/A+`规范与`ECMAScript`规范的内在区别与联系，确定怎样构建异步任务和创建`promise`实例。然后开始手写章节，过程中代码与测试可参考 [promise-coding](https://github.com/dongwei1125/promise-coding) 仓库。

&emsp;&emsp;也试着回答以下关键问题。

 - 什么是广义对象？
 - 如何检验`promise`类型？
 - `promise`与`thenable`两类型有何区别？

## 疑问

&emsp;&emsp;如果不太清楚`Promise`，建议参考[《ECMAScript 6 入门》](https://es6.ruanyifeng.com/#docs/promise)，预习下`Promise`相关用法知识。

&emsp;&emsp;除此之外，对规范也要有大致认识，我们将根据几个疑问来细致阐述。

### 什么是 Promise/A+ 规范？

&emsp;&emsp;;`Promise`有多种社区规范，例如 [Promise/A](https://wiki.commonjs.org/wiki/Promises/A)、[Promise/B](https://wiki.commonjs.org/wiki/Promises/B)、[Promise/D](https://wiki.commonjs.org/wiki/Promises/D) 和 [Promises/KISS](https://wiki.commonjs.org/wiki/Promises/KISS) 等。

&emsp;&emsp;;[Promise/A+](https://promisesaplus.com/) 在`Promise/A`之上，规范了术语并拓展了参数行为，省略了一些有问题的部分。

&emsp;&emsp;;`Promise/A+`有很多实现，例如第三方库 [q](https://github.com/kriskowal/q)、[when](https://github.com/cujojs/when) 和 [bluebird](https://github.com/petkaantonov/bluebird) 等。实际上任何`Promise`通过测试，都被认为是对`Promise/A+`规范的一种实现。

> `Promise/A+`规范官方测试用例为 [promises-aplus-tests](https://github.com/promises-aplus/promises-tests)

### 原生 Promise 实现了 Promise/A+？

&emsp;&emsp;在`Promise/A+`规范 [The ECMAScript Specification](https://promisesaplus.com/implementations#the-ecmascript-specification) 章节中。

> `The ECMAScript Specification`</br>
> `...`</br>
> `Largely due to the actions of the Promises/A+ community, the Promise global specified by ECMAScript and present in any conforming JavaScript engine is indeed a Promises/A+ implementation!`

&emsp;&emsp;叙述了`JavaScript`引擎中的`Promise`也是对`Promise/A+`规范的一种实现。

&emsp;&emsp;为什么呢？

&emsp;&emsp;;`Promise/A+`规范内容上仅说明了`Promise`状态和`then`方法。

&emsp;&emsp;;`ECMAScript`规范不仅规定`Promise`为构造函数，还添加了静态方法，例如`Promise.resolve`、`Promise.all`和`Promise.race`等，新增了原型方法`Promise.prototype.catch`和`Promise.prototype.finally`等。其中`Promise.prototype.then`相关内容，则是根据`Promise/A+`规范转化而来。

&emsp;&emsp;我们知道，`JavaScript`就是对`ECMAScript`规范的一种实现，而`ECMAScript`规范中`Promise.prototype.then`相关内容又继承了`Promise/A+`规范。

&emsp;&emsp;那么可以说，`JavaScript`引擎中的`Promise`，即原生`Promise`，就是对`Promise/A+`规范的一种实现。

### 如何构建异步任务？

&emsp;&emsp;;`Promise/A+`规范规定`then`方法接收两个参数。

```javascript
promise.then(onFulfilled, onRejected)
```

&emsp;&emsp;在 [2.2.4](https://promisesaplus.com/#point-34) 小结中明确了参数必须以异步形式运行。

> `2.2.4. onFulfilled or onRejected must not be called until the execution context stack contains only platform code.`

&emsp;&emsp;注解 [3.1](https://promisesaplus.com/#point-67) 补充可用宏任务`setTimeout`和`setImmediate`，或者微任务`MutationObserver`（浏览器环境）和`process.nextTick`（`node`环境）达到异步。

> `3.1. ...In practice, this requirement ensures that onFulfilled and onRejected execute asynchronously, after the event loop turn in which then is called, and with a fresh stack. This can be implemented with either a "macro-task" mechanism such as setTimeout or setImmediate, or with a "micro-task" mechanism such as MutationObserver or process.nextTick.`

&emsp;&emsp;综上所述，`Promise/A+`规范仅规定了参数以异步形式运行，并未规定是宏任务还是微任务。

> 注意`V8`引擎内部为微任务，考虑一致性推荐 [queueMicrotask](https://developer.mozilla.org/zh-CN/docs/Web/API/queueMicrotask) 创建微任务，兼容性相对较好

### 如何创建 promise？

&emsp;&emsp;;`Promise/A+`规范并未提及如何创建`promise`。

&emsp;&emsp;;`ECMAScript6`规范发布以来，多数是以构造函数方式创建`promise`。

```javascript
new Promise(executor)
```

&emsp;&emsp;实际上在此之前，还流行一种`Deferred`方式，例如 [JQuery.Deferred](http://api.jquery.com/jQuery.Deferred/)。

```javascript
$.Deferred()
```

&emsp;&emsp;我们以定时器为例，对比下两者差异。

```javascript
// ECMAScript6 Promise
const promise = new Promise(resolve => {
  setTimeout(() => {
    resolve(1)
  }, 1000)
})

promise.then(v => {
  console.log(v) // 1
})

// JQuery Deferred
const deferred = $.Deferred()

deferred.promise().then(v => {
  console.log(v) // 1
})

setTimeout(() => {
  deferred.resolve(1)
}, 1000)
```

&emsp;&emsp;你也注意到了吧，`Deferred`方式相对更加灵活，可以在任何时机修改状态。而`Promise`方式自由度减少了很多，不仅代码层级多了一层，而且只能在函数参数中修改状态。

&emsp;&emsp;可能你会问，那为什么`TC39`放弃了`Deferred`，而决定了`Promise`构造器方式呢？

&emsp;&emsp;;`Deferred`方式存在一个较严重的缺陷，即在业务流程阶段，不容易捕获异常。

```javascript
const deferred = $.Deferred()

deferred.promise().catch(v => {
  console.log(v)
})

;(function () {
  throw new Error() // Uncaught Error

  deferred.resolve(1)
})()
```

&emsp;&emsp;如果想让`promise`捕获异常，业务代码可修改为。

```javascript
;(function () {
  try {
    throw new Error()
  } catch (error) {
    deferred.reject(error)
  }

  deferred.resolve(1)
})()
```

&emsp;&emsp;而`Promise`构造器方式则非常容易。

```javascript
const promise = new Promise(resolve => {
  throw new Error()

  resolve(1)
})

promise.catch(v => {
  console.log(v) // Error
})
```

&emsp;&emsp;两相比较下`ECMAScript6`确定了以构造器方式创建`promise`。

> 个人认为`Deferred`更多是一个发布订阅器，而`Promise`则相对更加强大，是一个异步流程解决方案，`ECMAScript6`规范将其独立为一个模块是相当合理的

## 手写

&emsp;&emsp;;`Promise/A+`更多地是规范了算法逻辑，并未规定语法层面的实现方式。

&emsp;&emsp;我们可以参考原生`Promise`语法，并结合简单用例，手写以符合`Promise/A+`规范。

> 注意`Promise/A+`规范相关内容将特别标注

### 实例初始属性

&emsp;&emsp;原生创建`Promise`实例。

```javascript
new Promise(() => {})
// {
//   [[PromiseState]]: 'pending',
//   [[PromiseResult]]: undefined,
// }
```

&emsp;&emsp;相关特征包括。

 - `Promise`为构造函数
 - 默认状态为`pending`，默认结果为`undefined`
 - 三种状态分别为等待态`pending`、解决态`fulfilled`和拒绝态`rejected`——[「Promise/A+ 2.1」](https://promisesaplus.com/#promise-states)

&emsp;&emsp;代码编写如下，其中属性`[[PromiseState]]`用于保存状态，`[[PromiseResult]]`用于保存结果。

```javascript
const PromiseState = '[[PromiseState]]'
const PromiseResult = '[[PromiseResult]]'

const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class Promise {
  [PromiseState] = PENDING;
  [PromiseResult] = undefined
}
```

> `ES2020`规范 [proposal-class-fields](https://github.com/tc39/proposal-class-fields#field-declarations) 允许实例属性定义在类内部的最顶层，相对更加清晰简洁

### executor 执行器

&emsp;&emsp;原生`Promise`传参函数。

```javascript
new Promise(function executor() {
  console.log(1) // 1
})
console.log(2) // 2

new Promise((resolve, reject) => {
  resolve(3)
})
// {
//   [[PromiseState]]: 'fulfilled',
//   [[PromiseResult]]: 3,
// }

new Promise((resolve, reject) => {
  reject(4)
})
// {
//   [[PromiseState]]: 'rejected',
//   [[PromiseResult]]: 4,
// }
```

&emsp;&emsp;相关特征包括。

 - 实例创建过程中参数`executor`将同步执行
 - 执行器`executor`包括`resolve`和`reject`两个函数参数，`resolve`执行实例状态修改为解决态，`reject`执行实例状态修改为拒绝态

&emsp;&emsp;以下为优化代码，注意私有方法用箭头函数，可将内部`this`指向实例对象。

```javascript
class Promise {
  ...

  #resolve = value => {
    this[PromiseState] = FULFILLED
    this[PromiseResult] = value
  }
  #reject = reason => {
    this[PromiseState] = REJECTED
    this[PromiseResult] = reason
  }

  constructor(executor) {
    executor(this.#resolve, this.#reject)
  }
}
```

> `ES2020`规范 [proposal-class-fields](https://github.com/tc39/proposal-class-fields#private-fields) 允许实例定义私有属性或方法，仅可在类内部使用，外部无法使用

### 状态不可变性

&emsp;&emsp;原生`Promise`修改状态。

```javascript
new Promise((resolve, reject) => {
  resolve(1)
  resolve(2)
})
// {
//   [[PromiseState]]: 'fulfilled',
//   [[PromiseResult]]: 1,
// }

new Promise((resolve, reject) => {
  resolve(3)
  reject(4)
})
// {
//   [[PromiseState]]: 'fulfilled',
//   [[PromiseResult]]: 3,
// }
```

&emsp;&emsp;相关特征包括。

 - 处于解决态或者拒绝态，一定不能再修改为任何状态——[「Promise/A+ 2.1.2 / 2.1.3」](https://promisesaplus.com/#point-14)
 - 处于等待态的时候，可能变为解决态或者拒绝态——[「Promise/A+ 2.1.1」](https://promisesaplus.com/#point-12)

&emsp;&emsp;代码优化为。

```javascript
#resolve = value => {
  if (this[PromiseState] === PENDING) {
    this[PromiseState] = FULFILLED
    this[PromiseResult] = value
  }
}
#reject = reason => {
  if (this[PromiseState] === PENDING) {
    this[PromiseState] = REJECTED
    this[PromiseResult] = reason
  }
}
```

### 方法传参

&emsp;&emsp;原生`Promise`上`then`方法传参。

```javascript
const p = new Promise((resolve, reject) => {
  resolve()
})

p.then(undefined, undefined)
```

&emsp;&emsp;相关特征包括。

 - `promise`必须有`then`方法，且接收两个参数`onFulfilled`和`onRejected`——[「Promise/A+ 2.2」](https://promisesaplus.com/#the-then-method)
 - `onFulfilled`和`onRejected`都是可选参数，若不是函数，必须被忽略——[「Promise/A+ 2.2.1」](https://promisesaplus.com/#point-23)
 - `onFulfilled`和`onRejected`一定被作为普通函数调用——[「Promise/A+ 2.2.5」](https://promisesaplus.com/#point-35)

&emsp;&emsp;代码修改为。

```javascript
class Promise {
  ...

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : () => {}
    onRejected = typeof onRejected === 'function' ? onRejected : () => {}
  }
}
```

> 参数为非函数时，为保证可被调用，暂时返回普通函数

### then 方法

&emsp;&emsp;原生`Promise`执行`then`方法。

```javascript
const p1 = new Promise((resolve, reject) => {
  resolve(1)
})
p1.then(v => {
  console.log(v) // 1
})

const p2 = new Promise((resolve, reject) => {
  reject(2)
})
p2.then(undefined, v => {
  console.log(v) // 2
})
```

&emsp;&emsp;相关特征包括。

- 如果`onFulfilled`或`onRejected`是一个函数，必须在`promise`被解决或被拒绝后调用，且`promise`值或原因作为第一个参数——[「Promise/A+ 2.2.2 / 2.2.3」](https://promisesaplus.com/#point-26)

&emsp;&emsp;代码修改为。

```javascript
then(onFulfilled, onRejected) {
  ...

  if (this[PromiseState] === FULFILLED) {
    onFulfilled(this[PromiseResult])
  }

  if (this[PromiseState] === REJECTED) {
    onRejected(this[PromiseResult])
  }
}
```

### 异步 executor

&emsp;&emsp;目前代码并未完全符合[「Promise/A+ 2.2.2 / 2.2.3」](https://promisesaplus.com/#point-26)规范，例如`executor`为异步情况时，还会存在一些问题。

```javascript
const p = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  }, 1000)
})

p.then(v => {
  console.log(v)
})
```

> 控制台没有打印任何内容

&emsp;&emsp;为什么呢？

&emsp;&emsp;实例`p`在创建完成后，还处在等待态。紧接着执行`then`方法，`then`方法内部没有等待态相关逻辑，也就没有任何操作。`1s`后`resolve`执行，也仅仅是将`p`状态修改为解决态。

&emsp;&emsp;如何解决呢？

&emsp;&emsp;可以在等待态就保存`onFulfilled`和`onRejected`函数，在`resolve`修改状态时再执行。

&emsp;&emsp;代码优化为。

```javascript
class Promise {
  ...

  #onFulfilledCallBack = undefined
  #onRejectedCallBack = undefined
  #resolve = value => {
    if (this[PromiseState] === PENDING) {
      ...

      this.#onFulfilledCallBack?.(this[PromiseResult])
    }
  }
  #reject = reason => {
    if (this[PromiseState] === PENDING) {
      ...

      this.#onRejectedCallBack?.(this[PromiseResult])
    }
  }

  ...

  then(onFulfilled, onRejected) {
    ...

    if (this[PromiseState] === PENDING) {
      this.#onFulfilledCallBack = onFulfilled
      this.#onRejectedCallBack = onRejected
    }
  }
}
```

> `?.`为`ES2020`规范中 [proposal-optional-chaining](https://github.com/tc39/proposal-optional-chaining) 可选链操作符

### 多次调用 then

&emsp;&emsp;原生`Promise`多次调用`then`方法。

```javascript
const p = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve()
  }, 1000)
})

p.then(() => {
  console.log(1) // 1
})

p.then(() => {
  console.log(2) // 2
})

p.then(() => {
  console.log(3) // 3
})
```

&emsp;&emsp;相关特征包括。

 - `then`方法函数参数按语法顺序执行
 - 同一`promise`上`then`方法可能被多次调用——[「Promise/A+ 2.2.6」](https://promisesaplus.com/#point-36)

&emsp;&emsp;代码优化如下，注意为了保证顺序，两数组内函数都是先进先出。

```javascript
class Promise {
  ...

  #onFulfilledCallBacks = []
  #onRejectedCallBacks = []
  #resolve = value => {
    if (this[PromiseState] === PENDING) {
      ...

      while (this.#onFulfilledCallBacks.length) {
        this.#onFulfilledCallBacks.shift()(this[PromiseResult])
      }
    }
  }
  #reject = reason => {
    if (this[PromiseState] === PENDING) {
      ...

      while (this.#onRejectedCallBacks.length) {
        this.#onRejectedCallBacks.shift()(this[PromiseResult])
      }
    }
  }

  ...

  then(onFulfilled, onRejected) {
    ...

    if (this[PromiseState] === PENDING) {
      this.#onFulfilledCallBacks.push(onFulfilled)
      this.#onRejectedCallBacks.push(onRejected)
    }
  }
}
```

### 返回 promise

&emsp;&emsp;原生`Promise`返回值。

```javascript
const p = new Promise(() => {})

p.then()
// {
//   [[PromiseState]]: 'pending',
//   [[PromiseResult]]: undefined,
// }
```

&emsp;&emsp;相关特征包括。

 - `then`方法必须返回一个新`promise`——[「Promise/A+ 2.2.7」](https://promisesaplus.com/#point-40)

&emsp;&emsp;代码暂时修改为。

```javascript
then(onFulfilled, onRejected) {
  ...

  if (this[PromiseState] === PENDING) {
    ...
  }

  const promise = new Promise(() => {})

  return promise
}
```

### 函数参数返回值

&emsp;&emsp;原生`Promise`函数参数`onFulfilled`返回数值。

```javascript
const p = new Promise((resolve, reject) => {
  resolve()
})

p.then(() => {
  return 1
})
// {
//   [[PromiseState]]: 'fulfilled',
//   [[PromiseResult]]: 1,
// }
```

&emsp;&emsp;相关特征包括。

 - 如果`onFulfilled`或`onRejected`返回一个值`x`，运行`promise`解决程序——[「Promise/A+ 2.2.7.1」](https://promisesaplus.com/#point-41)
 - 如果`x`不是一个对象或函数，用`x`解决`promise`——[「Promise/A+ 2.3.4」](https://promisesaplus.com/#point-64)

&emsp;&emsp;何为`promise`解决程序呢？

&emsp;&emsp;;[「Promise/A+ 2.3」](https://promisesaplus.com/#the-promise-resolution-procedure)叙述是一个抽象操作，可表示为`[[Resolve]](promise, x)`。其中主要根据`x`类型，决定新`promise`的状态和结果。

&emsp;&emsp;比如`x`不是一个对象或函数，例如数值，则新`promise`状态将确定为解决态，结果为`x`，即用`x`解决`promise`。

```javascript
// {
//   [[PromiseState]]: 'fulfilled',
//   [[PromiseResult]]: x,
// }
```

&emsp;&emsp;那么如何在`onFulfilled`或`onRejected`返回数值`x`时，又修改新`promise`状态和结果呢？

```javascript
then(onFulfilled, onRejected) {
  ...

  if (this[PromiseState] === FULFILLED) {
    const x = onFulfilled(this[PromiseResult])
  }

  ...

  const promise = new Promise(() => {})

  return promise
}
```

&emsp;&emsp;你可能想到了。

```javascript
then(onFulfilled, onRejected) {
  ...

  const promise = new Promise(() => {})

  if (this[PromiseState] === FULFILLED) {
    const x = onFulfilled(this[PromiseResult])

    promise.#resolve(x)
  }

  ...

  return promise
}
```

&emsp;&emsp;可修改状态也符合规范，但个人认为此方式存在一些缺陷。

&emsp;&emsp;将实例属性`resolve`私有化，就是为了限制外部访问。以`promise.#resolve`访问，而非`this.#resolve`，已经处于外部访问的范畴了，思路上不是很合理。

&emsp;&emsp;还有更好的办法吗？

&emsp;&emsp;我们知道在`executor`执行器上，`resolve`和`reject`两个参数也可修改状态。

&emsp;&emsp;如果将`if`语句体迁移至`executor`内部，有没有可能呢？答案是可以的。

```javascript
then(onFulfilled, onRejected) {
  ...

  const promise = new Promise((resolve, reject) => {
    if (this[PromiseState] === FULFILLED) {
      const x = onFulfilled(this[PromiseResult])

      resolve(x)
    }

    ...
  })

  return promise
}
```

> `if`语句体在`executor`外部时，同步执行。在`executor`内部时，也是同步执行

&emsp;&emsp;相关特征完全实现了吗？并没有。

&emsp;&emsp;若`executor`为异步情况时，还存在一些问题。

```javascript
const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve()
  }, 1000)
})

const p2 = p1.then(() => {
  return 2
})

setTimeout(() => {
  console.log(p2)
  // {
  //   [[PromiseState]]: 'pending',
  //   [[PromiseResult]]: undefined,
  // }
}, 2000)
```

> 控制台打印内容与原生不一致

&emsp;&emsp;为什么呢？

&emsp;&emsp;实例`p1`处于等待态，执行`then`方法将`onFulfilled`保存至数组中。`1s`后`resolve`执行，`p1`状态修改为解决态，紧接着取出运行`onFulfilled`，`p2`状态无任何变化。

&emsp;&emsp;我们可以在`onFulfilled`执行时，对返回值`x`稍加处理。

```javascript
const promise = new Promise((resolve, reject) => {
  ...

  if (this[PromiseState] === PENDING) {
    this.#onFulfilledCallBacks.push(() => {
      const x = onFulfilled(this[PromiseResult])

      resolve(x)
    })
    
    ...
  }
})
```

### 处理函数

&emsp;&emsp;为了统一处理不同类型`x`值，并严格实现规范[「Promise/A+ 2.3」](https://promisesaplus.com/#the-promise-resolution-procedure)中各子章节。

&emsp;&emsp;修改代码并创建`resolvePromise`函数，参数暂时为`x`和`resolve`。

```javascript
class Promise {
  ...

  then(onFulfilled, onRejected) {
    ...

    const promise = new Promise((resolve, reject) => {
      if (this[PromiseState] === FULFILLED) {
        const x = onFulfilled(this[PromiseResult])

        resolvePromise(x, resolve)
      }

      ...

      if (this[PromiseState] === PENDING) {
        this.#onFulfilledCallBacks.push(() => {
          const x = onFulfilled(this[PromiseResult])

          resolvePromise(x, resolve)
        })

        ...
      }
    })

    return promise
  }
}

function resolvePromise(x, resolve) {
  resolve(x)
}
```

&emsp;&emsp;研读部分子章节。

> <code>2.3.1. If **promise** and **x** refer to the same object, reject promise with a TypeError as the reason.</code></br>
> <code>2.3.2.2. If/when x is fulfilled, **fulfill** promise with the same value.</code>
> <code>2.3.2.3. If/when x is rejected, **reject** promise with the same reason.</code>

&emsp;&emsp;可确认参数`promise`和`x`、`resolve`、`reject`。

```javascript
const promise = new Promise((resolve, reject) => {
  if (this[PromiseState] === FULFILLED) {
    const x = onFulfilled(this[PromiseResult])

    resolvePromise(promise, x, resolve, reject)
  }

  ...

  if (this[PromiseState] === PENDING) {
    this.#onFulfilledCallBacks.push(() => {
      const x = onFulfilled(this[PromiseResult])

      resolvePromise(promise, x, resolve, reject)
    })
    
    ...
  }
})

function resolvePromise(promise, x, resolve, reject) {
  resolve(x)
}
```

### 抛出异常

&emsp;&emsp;原生`Promise`抛出异常。

```javascript
const p = new Promise((resolve, reject) => {
  resolve()
})

p.then(() => {
  throw new Error()
}).then(undefined, v => {
  console.log(v) // Error
})
```

&emsp;&emsp;相关特征包括。

 - 如果`onFulfilled`或`onRejected`抛出一个异常`e`，新`promise`为拒绝态且原因为`e`——[「Promise/A+ 2.2.7.2」](https://promisesaplus.com/#point-42)

&emsp;&emsp;代码优化为。

```javascript
const promise = new Promise((resolve, reject) => {
  if (this[PromiseState] === FULFILLED) {
    try {
      const x = onFulfilled(this[PromiseResult])

      resolvePromise(promise, x, resolve, reject)
    } catch (e) {
      reject(e)
    }
  }

  ...
})
```

&emsp;&emsp;类似地`executor`为异步情况时，也存在一些问题。

```javascript
const p = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve()
  }, 1000)
})

p.then(() => {
  throw new Error() // Uncaught Error
}).then(undefined, v => {
  console.log(v)
})
```

> 未捕获到异常

&emsp;&emsp;为什么呢？

&emsp;&emsp;实例`p`处于等待态，执行`then`方法将`onFulfilled`保存。`1s`后`resolve`执行，`p`状态修改为解决态，紧接着取出`onFulfilled`，运行内部抛出了异常。

&emsp;&emsp;代码优化为。

```javascript
const promise = new Promise((resolve, reject) => {
  ...

  if (this[PromiseState] === PENDING) {
    this.#onFulfilledCallBacks.push(() => {
      try {
        const x = onFulfilled(this[PromiseResult])

        resolvePromise(promise, x, resolve, reject)
      } catch (e) {
        reject(e)
      }
    })
    
    ...
  }
})
```

### 异步任务

&emsp;&emsp;原生`Promise`异步。

```javascript
const p = new Promise((resolve, reject) => {
  resolve(1)
})

console.log(2) // 2
p.then(v => {
  console.log(v) // 1
})
console.log(3) // 3
```

> 注意打印顺序`2 3 1`

&emsp;&emsp;相关特征包括。

 - `onFulfilled`或`onRejected`必须以异步形式运行——[「Promise/A+ 2.2.4」](https://promisesaplus.com/#point-34)

&emsp;&emsp;代码简单修改为。

```javascript
const queueTask = queueMicrotask

class Promise {
  ...

  then() {
    const promise = new Promise((resolve, reject) => {
      if (this[PromiseState] === FULFILLED) {
        try {
          queueTask(() => {
            const x = onFulfilled(this[PromiseResult])

            resolvePromise(promise, x, resolve, reject)
          })
        } catch (e) {
          reject(e)
        }
      }

      ...
    })

    return promise
  }
}
```

&emsp;&emsp;注意`try...catch`并不能捕获到异步函数内抛出的异常，例如。

```javascript
try {
  setTimeout(() => {
    throw new Error() // Uncaught Error
  })
} catch (error) {
  console.log(error)
}
```

&emsp;&emsp;那如何优化呢？

&emsp;&emsp;我们可以将全部`try...catch`语句放到异步函数中。

```javascript
const promise = new Promise((resolve, reject) => {
  if (this[PromiseState] === FULFILLED) {
    queueTask(() => {
      try {
        const x = onFulfilled(this[PromiseResult])

        resolvePromise(promise, x, resolve, reject)
      } catch (e) {
        reject(e)
      }
    })
  }

  ...
})
```

&emsp;&emsp;类似地`executor`为异步情况时，也存在一些问题。

```javascript
const p = new Promise(resolve => {
  setTimeout(() => {
    console.log(1) // 1

    resolve(2)

    console.log(3) // 3
  }, 1000)
})

p.then(v => {
  console.log(v) // 2
})
```

> 打印顺序`1 2 3`（原生打印顺序`1 3 2`）

&emsp;&emsp;为什么呢？

&emsp;&emsp;;`onFulfilled`没有以异步形式运行。

&emsp;&emsp;代码修改为。

```javascript
const promise = new Promise((resolve, reject) => {
  ...

  if (this[PromiseState] === PENDING) {
    this.#onFulfilledCallBacks.push(() => {
      queueTask(() => {
        try {
          const x = onFulfilled(this[PromiseResult])

          resolvePromise(promise, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      })
    })
    
    ...
  }
})
```

&emsp;&emsp;合并重复代码。

```javascript
const promise = new Promise((resolve, reject) => {
  const resolved = () => {
    queueTask(() => {
      try {
        const x = onFulfilled(this[PromiseResult])

        resolvePromise(promise, x, resolve, reject)
      } catch (e) {
        reject(e)
      }
    })
  }
  const rejected = () => {
    queueTask(() => {
      try {
        const x = onRejected(this[PromiseResult])

        resolvePromise(promise, x, resolve, reject)
      } catch (e) {
        reject(e)
      }
    })
  }

  if (this[PromiseState] === FULFILLED) {
    resolved()
  }

  if (this[PromiseState] === REJECTED) {
    rejected()
  }

  if (this[PromiseState] === PENDING) {
    this.#onFulfilledCallBacks.push(resolved)
    this.#onRejectedCallBacks.push(rejected)
  }
})
```

### 参数优化

&emsp;&emsp;原生`Promise`值穿透。

```javascript
const p1 = new Promise((resolve, reject) => {
  resolve(1)
})
p1.then(undefined)
// {
//   [[PromiseState]]: 'fulfilled',
//   [[PromiseResult]]: 1,
// }

const p2 = new Promise((resolve, reject) => {
  reject(2)
})
p2.then(undefined, undefined)
// {
//   [[PromiseState]]: 'rejected',
//   [[PromiseResult]]: 2,
// }
```

&emsp;&emsp;相关特征包括。

 - 如果`onFulfilled`不是一个函数且原`promise`被解决，新`promise`必须也被解决，且值与原`promise`相同——[「Promise/A+ 2.2.7.3」](https://promisesaplus.com/#point-43)
 - 如果`onRejected`不是一个函数且原`promise`被拒绝，新`promise`必须也被拒绝，且原因与原`promise`相同——[「Promise/A+ 2.2.7.4」](https://promisesaplus.com/#point-44)

&emsp;&emsp;代码优化如下。

```javascript
then(onFulfilled, onRejected) {
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
  onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }

  ...
}
```

> 注意`throw`抛出异常将被`try...catch`捕获，进而拒绝新`promise`

## 类型

&emsp;&emsp;如何处理不同类型`x`呢？

&emsp;&emsp;还是参考规范[「Promise/A+ 2.3」](https://promisesaplus.com/#the-promise-resolution-procedure)各子章节，以优化`resolvePromise`处理函数。

### 循环引用

&emsp;&emsp;原生`Promise`循环引用。

```javascript
const p1 = new Promise((resolve, reject) => {
  resolve()
})

const p2 = p1.then(() => {
  return p2
})
// {
//   [[PromiseState]]: 'rejected',
//   [[PromiseResult]]: TypeError: Chaining cycle detected for promise #<Promise>,
// }
```

&emsp;&emsp;相关特征包括。

 - 如果`promise`和`x`引用同一对象，则拒绝`promise`，原因为一个`TypeError`——[「Promise/A+ 2.3.1」](https://promisesaplus.com/#point-48)

&emsp;&emsp;代码优化为。

```javascript
function resolvePromise(promise, x, resolve, reject) {
  if (promise === x) {
    return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
  }

  resolve(x)
}
```

### 传递性

&emsp;&emsp;原生`Promise`函数参数`onFulfilled`返回`promise`。

```javascript
const p1 = new Promise((resolve, reject) => {
  resolve()
})
const p2 = new Promise((resolve, reject) => {
  reject(1)
})

p1.then(() => {
  return p2
})
// {
//   [[PromiseState]]: 'rejected',
//   [[PromiseResult]]: 1,
// }
```

&emsp;&emsp;相关特征包括。

 - 如果`x`是等待态，`promise`必须保持等待态，直到`x`被解决或被拒绝——[「Promise/A+ 2.3.2.1」](https://promisesaplus.com/#point-50)
 - 如果`x`是解决态，用相同的值解决`promise`——[「Promise/A+ 2.3.2.2」](https://promisesaplus.com/#point-51)
 - 如果`x`是拒绝态，用相同的原因拒绝`promise`——[「Promise/A+ 2.3.2.3」](https://promisesaplus.com/#point-52)

&emsp;&emsp;也就是`promise`状态与`x`始终都保持一致。

&emsp;&emsp;可能会存在`x`初始为等待态，然后又转变为解决态或拒绝态。过程中两者状态始终一致，若`x`状态转变，`promise`状态也将转变。

&emsp;&emsp;那如何知道`x`状态转变呢？答案就是`then`方法。

```javascript
x.then(onFulfilled, onRejected)
```

&emsp;&emsp;;`x`转变为解决态时将运行`onFulfilled`，转变为拒绝态时将运行`onRejected`。

&emsp;&emsp;那我们就可在`onFulfilled`或`onRejected`内部去修改`promise`状态。

&emsp;&emsp;代码优化为。

```javascript
function resolvePromise(promise, x, resolve, reject) {
  ...

  if (x instanceof Promise) {
    x.then(value => {
      resolve(value)
    }, reason => {
      reject(reason)
    })
  } else {
    resolve(x)
  }
}
```

&emsp;&emsp;简化为。

```javascript
function resolvePromise(promise, x, resolve, reject) {
  ...

  if (x instanceof Promise) {
    x.then(resolve, reject)
  } else {
    resolve(x)
  }
}
```

### 广义对象

&emsp;&emsp;何为广义对象呢？

&emsp;&emsp;能添加属性或方法的变量，都称之为广义上的对象，例如数组、函数等。

&emsp;&emsp;创建`isObject`工具函数，更多参考 [lodash.isObject](https://www.lodashjs.com/docs/lodash.isObject)。

```javascript
function isObject(value) {
  const type = typeof value

  return value !== null && (type === 'object' || type === 'function')
}
```

&emsp;&emsp;然后阅读规范[「Promise/A+ 2.3.3」](https://promisesaplus.com/#point-53)小节，省略部分暂时不考虑。

 - 如果`x`是一个对象或函数（广义对象）
   - 让`then`为`x.then`
   - 如果获取`x.then`导致抛出了一个异常`e`，用`e`作为原因拒绝`promise`
   - 如果`then`是一个函数，用`x`作为`this`调用它，且包含两个参数，分别为`resolvePromise`和`rejectPromise`
     - 如果`resolvePromise`用一个值`y`调用，运行`[[Resolve]](promise, y)`
     - 如果`rejectPromise`用一个原因`r`调用，用`r`拒绝`promise`
     - `...`
     - 如果调用`then`抛出了一个异常`e`
       - `...`
       - 否则用`e`作为作为原因拒绝`promise`
    - 如果`then`不是一个函数，用`x`解决`promise`

&emsp;&emsp;转译为代码。

```javascript
function resolvePromise(promise, x, resolve, reject) {
  ...

  if (x instanceof Promise) {
    ...
  } else {
    if (isObject(x)) {
      var then

      try {
        then = x.then
      } catch (e) {
        reject(e)
      }

      if (typeof then === 'function') {
        try {
          then.call(
            x,
            y => {
              resolvePromise(promise, y, resolve, reject)
            },
            r => {
              reject(r)
            }
          )
        } catch (e) {
          reject(e)
        }
      } else {
        resolve(x)
      }
    } else {
      resolve(x)
    }
  }
}
```

&emsp;&emsp;规范中运行`[[Resolve]](promise, y)`，即递归`resolvePromise`，为什么呢？

&emsp;&emsp;原因在于`y`值可能还是`promise`或者广义对象等等。

&emsp;&emsp;我们来看一个原生`Promise`示例。

```javascript
const p = new Promise(resolve => {
  resolve()
})
const thenable1 = {
  then(reslove) {
    reslove(1)
  },
}
const thenable2 = {
  then(resolve) {
    resolve(thenable1)
  },
}

p.then(() => {
  return thenable2
})
// {
//   [[PromiseState]]: 'fulfilled',
//   [[PromiseResult]]: 1,
// }
```

### 优先级

&emsp;&emsp;以下为刚才省略的部分。

 - 如果`then`是一个函数`...`
   - `...`
   - `...`
   - 如果`resolvePromise`和`rejectPromise`都被调用，或者对其中一个多次调用，那么第一次调用优先，以后的调用都会被忽略
   - 如果调用`then`抛出了`...`
     - 如果`resolvePromise`或`rejectPromise`已经被调用，则忽略它
     - `...`

&emsp;&emsp;为了限制哪种情况呢？

&emsp;&emsp;还是来看一个原生`Promise`示例。

```javascript
const p = new Promise(resolve => {
  resolve()
})
const thenable1 = {
  then(reslove) {
    setTimeout(() => {
      reslove(2)
    }, 0)
  },
}
const thenable2 = {
  then(resolve) {
    resolve(thenable1)
    resolve(1)
  },
}

p.then(() => {
  return thenable2
})
// {
//   [[PromiseState]]: 'fulfilled',
//   [[PromiseResult]]: 2,
// }
```

&emsp;&emsp;代码如何优化呢？

&emsp;&emsp;我们可定义布尔变量`called`，标记是否运行参数`resolvePromise`或`rejectPromise`。然后在第一次运行时将`called`修改为`true`，而以后的都会`return`被忽略。

```javascript
if (typeof then === 'function') {
  var called = false

  try {
    then.call(
      x,
      y => {
        if (called) return
        called = true

        resolvePromise(promise, y, resolve, reject)
      },
      r => {
        if (called) return
        called = true

        reject(r)
      }
    )
  } catch (e) {
    if (called) return
    called = true

    reject(e)
  }
}
```

### thenable

&emsp;&emsp;规范[「Promise/A+ 1.1」](https://promisesaplus.com/#point-6)小结陈述了。

&emsp;&emsp;;`promise`是一个对象或函数（广义对象），存在`then`方法且行为符合规范。

&emsp;&emsp;第三方`Promise`库、原生`Promise`以及我们手写版本`Promise`，创建的`promise`实例，其实都是标准的`promise`类型。

&emsp;&emsp;而代码中`x instanceof Promise`语句，检验是否为`promise`类型，就有问题了。例如`x`被第三方库创建，也是标准`promise`类型，但是并不会运行`if`语句体，而是错误地运行`else`语句体。

```javascript
function resolvePromise(promise, x, resolve, reject) {
  ...

  if (x instanceof Promise) {
    ...
  } else {
    ...
  }
}
```

&emsp;&emsp;还有方法可确定`x`为`promise`类型吗？答案是没有。

&emsp;&emsp;怎么办呢？

&emsp;&emsp;既然无法检验`promise`类型，那就退而求其次，检验类似`promise`类型的，即鸭式辩型。

> 鸭子类型（`duck typing`），也叫鸭式辩型，一只鸟走起来像鸭子、游泳起来像鸭子、叫起来也像鸭子，那么这只鸟就可以被称为鸭子

&emsp;&emsp;规范[「Promise/A+ 1.2」](https://promisesaplus.com/#point-6)提出了`thenable`类型，即定义了`then`方法的对象或函数。

```javascript
{
  then() {
    ...
  },
}
```

> `thenable`是`promise`的鸭子类型

&emsp;&emsp;检验是否为`promise`类型，则降级为检验是否为`thenable`类型。

&emsp;&emsp;代码修改为。

```javascript
function resolvePromise(promise, x, resolve, reject) {
  if (promise === x) {
    return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
  }

  if (isObject(x)) {
    var then

    try {
      then = x.then
    } catch (e) {
      reject(e)
    }

    if (typeof then === 'function') {
      var called = false

      try {
        then.call(
          x,
          y => {
            if (called) return
            called = true

            resolvePromise(promise, y, resolve, reject)
          },
          r => {
            if (called) return
            called = true

            reject(r)
          }
        )
      } catch (e) {
        if (called) return
        called = true

        reject(e)
      }
    } else {
      resolve(x)
    }
  } else {
    resolve(x)
  }
}
```

## 测试

&emsp;&emsp;安装官方测试用例 [promises-aplus-tests](https://github.com/promises-aplus/promises-tests)。

```javascript
npm i promises-aplus-tests -D
```

&emsp;&emsp;;`promise`代码中新增以下。

```javascript
// promise.js
class Promise {
  ...
}

Promise.deferred = () => {
  const result = {}

  result.promise = new Promise((resolve, reject) => {
    result.resolve = resolve
    result.reject = reject
  })

  return result
}

module.exports = Promise
```

&emsp;&emsp;新增测试命令。

```javascript
// package.json
{
  ...
  "scripts": {
    "test": "promises-aplus-tests promise.js"
  },
  ...
  "devDependencies": {
    "promises-aplus-tests": "^2.1.2"
  }
}
```

&emsp;&emsp;运行`npm run test`。

![](/js/promise-coding/test.gif)

## 小结

&emsp;&emsp;全文共计两万五千字有余，参考`Promise/A+`规范手写了`then`方法和`promise`解决程序。

&emsp;&emsp;相关代码可参考 [promise-coding](https://github.com/dongwei1125/promise-coding) 仓库，支持`node`和浏览器环境测试。

&emsp;&emsp;如何手写`Promise`到此就结束了。

## 扩展

&emsp;&emsp;学有余力或意犹未尽的伙伴们。

&emsp;&emsp;贴出两个代码片段，可在原生`Promise`与手写`Promise`环境下运行。

```javascript
// 1
new Promise(resolve => {
  resolve(Promise.resolve())
}).then(() => {
  console.log(3)
})

Promise.resolve()
  .then(() => {
    console.log(1)
  })
  .then(() => {
    console.log(2)
  })
  .then(() => {
    console.log(4)
  })

// 2
Promise.resolve()
  .then(() => {
    console.log(0)

    return Promise.resolve()
  })
  .then(() => {
    console.log(4)
  })

Promise.resolve()
  .then(() => {
    console.log(1)
  })
  .then(() => {
    console.log(2)
  })
  .then(() => {
    console.log(3)
  })
  .then(() => {
    console.log(5)
  })
  .then(() => {
    console.log(6)
  })
```

&emsp;&emsp;看看能否分析出两者之间的细微差异？答案是不能。

&emsp;&emsp;更多请持续关注更文，或在参考链接中探索一二。

## 参考

- [Promise/A+ 规范译文](https://www.ituring.com.cn/article/66566)
- [原生 Promise 和手写 Promise 的区别是什么？](https://www.zhihu.com/question/456775221)
- [resolve 时序](https://www.zhihu.com/question/430549238)
- [V8 源码解读 Promise](https://www.zhihu.com/question/453677175)

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125) / [Gitee](https://gitee.com/dongwei1125)、[GitHub Pages](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~