# ES6 flat 与数组扁平化

![](/js/flat/banner.jpg)

## 前言

&emsp;&emsp;;[flat](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/flat) 用于将多维数组拉平（扁平化），不影响原数组，返回新的数组。

```javascript
[1, 2, [3, [4]]].flat() // [1, 2, 3, [4]]
```

&emsp;&emsp;仅有一个参数`depth`，用于指定拉平的深度，默认值为`1`。若`depth`指定为非正数，将返回原数组，指定为`Infinity`，无论多少层都将扁平化为一维数组。

```javascript
[1, 2, [3, [4]]].flat(2) // [1, 2, 3, 4]
[1, 2, [3, [4]]].flat(0) // [1, 2, [3, [4]]]
[1, 2, [3, [4]]].flat(Infinity) // [1, 2, 3, 4]
```

## 二维扁平化

&emsp;&emsp;有很多种替代的实现方案，但是无论是哪一种，核心思路或者原理都是一样的。即不论是多少维的数组，都是一层一层降维下来的，解决了一层的降维问题，多维也就迎刃而解。而至于多维扁平化，无非就是还要配合递归或者循环。

&emsp;&emsp;因此先来实现二维数组的扁平化，为什么不是一维呢，因为一维本身就是扁平的。主要的核心函数是 [concat](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/concat)，结合相关的操作，将实现降维的功能。另外`contat`也会返回新的数组，并不会影响原数组，此特性也与`flat`相契合。

### 扩展运算符

&emsp;&emsp;;`flat`与扩展运算符（`...`）结合，可将数组降维。

```javascript
var list = [1, 2, [3, 4]]

[].concat(...list) // [1, 2, 3, 4]
```

### apply

&emsp;&emsp;;`apply`可以将数组转换为参数序列，相当于对数组降维。

```javascript
var list = [1, 2, [3, 4]]

[].concat.apply([], list) // [1, 2, 3, 4]
```

### 循环遍历

&emsp;&emsp;普通循环也能对数组降维。

```javascript
var list = [1, 2, [3, 4]]

for (var i = 0, result = []; i < list.length; i++) {
  result = result.concat(list[i])
}
result // [1, 2, 3, 4]
```

&emsp;&emsp;;`reduce`循环。

```javascript
var list = [1, 2, [3, 4]]

var result = list.reduce((pre, cur) => {
  return pre.concat(cur)
}, [])
result // [1, 2, 3, 4]
```

## 多维扁平化

&emsp;&emsp;解决了二维扁平化的问题，而对于多维，结合上递归或者循环即可。

### 循环递归

&emsp;&emsp;其中`Array.isArray`用于判断元素是否为数组类型。

```javascript
function flatten(arr) {
  for (var i = 0, result = []; i < arr.length; i++) {
    var item = arr[i]

    result = result.concat(Array.isArray(item) ? flatten(item) : item)
  }

  return result
}

var list = [1, 2, [3, [4]]]
flatten(list) // [1, 2, 3, 4]
```

&emsp;&emsp;指定深度的形式。

```javascript
function flatten(arr, depth = 1) {
  var result = []

  if (depth > 0) {
    for (var i = 0; i < arr.length; i++) {
      var item = arr[i]

      result = result.concat(Array.isArray(item) ? flatten(item, depth - 1) : item)
    }
  } else {
    result = arr.slice()
  }

  return result
}

var list = [1, 2, [3, [4]]]
flatten(list) // [1, 2, 3, [4]]
```

### reduce 递归

&emsp;&emsp;相较于普通循环，`reduce`会简洁很多。

```javascript
function flatten(arr) {
  return arr.reduce((pre, cur) => {
    return pre.concat(Array.isArray(cur) ? flatten(cur) : cur)
  }, [])
}

var list = [1, 2, [3, [4]]]
flatten(list) // [1, 2, 3, 4]
```

&emsp;&emsp;指定深度的形式。

```javascript
function flatten(arr, depth = 1) {
  return depth > 0
    ? arr.reduce((pre, cur) => {
      return pre.concat(Array.isArray(cur) ? flatten(cur, depth - 1) : cur)
    }, [])
    : arr.slice()
}

var list = [1, 2, [3, [4]]]
flatten(list) // [1, 2, 3, [4]]
```

### some 循环

```javascript
function flatten(arr) {
  while (arr.some(item => Array.isArray(item))) {
    arr = [].concat(...arr)
    // 或者扩展运算符
    // arr = [].concat.apply([], arr)
  }

  return [...arr]
}

var list = [1, 2, [3, [4]]]
flatten(list) // [1, 2, 3, 4]
```

&emsp;&emsp;指定深度的形式。

```javascript
function flatten(arr, depth = 1) {
  while (arr.some(item => Array.isArray(item)) && depth > 0) {
    arr = [].concat(...arr)
    depth--
  }

  return [...arr]
}

var list = [1, 2, [3, [4]]]
flatten(list) // [1, 2, 3, [4]]
```

### 堆栈

&emsp;&emsp;注意堆栈的原理是利用`unshift`与扩展运算符。

```javascript
function flatten(arr) {
  var result = []
  var stack = [...arr]

  while (stack.length) {
    var item = stack.shift()

    if (Array.isArray(item)) {
      stack.unshift(...item)
    } else {
      result.push(item)
    }
  }

  return result
}

var list = [1, 2, [3, [4]]]
flatten(list) // [1, 2, 3, 4]
```

&emsp;&emsp;指定深度的形式，由于每个成员都将由`toDepthArray`保存深度，相对来说执行比较低效。

```javascript
function flatten(arr, depth = 1) {
  var result = []
  var stack = toDepthArray(arr, depth)

  while (stack.length) {
    var { value, depth } = stack.shift()

    if (Array.isArray(value) && depth > 0) {
      stack.unshift(...toDepthArray(value, depth - 1))
    } else {
      result.push(value)
    }
  }

  function toDepthArray(arr, depth) {
    return arr.map(value => ({ value, depth }))
  }

  return result
}

var list = [1, 2, [3, [4]]]
flatten(list) // [1, 2, 3, [4]]
```

### Generator

&emsp;&emsp;注意`flat`将返回遍历器，还要用扩展运算符来获取最终结果。

```javascript
function flatten(arr) {
  function* flat(arr) {
    for (var item of arr) {
      if (Array.isArray(item)) {
        yield* flat(item)
      } else {
        yield item
      }
    }
  }

  return [...flat(arr)]
}

var list = [1, 2, [3, [4]]]
flatten(list) // [1, 2, 3, 4]
```

&emsp;&emsp;指定深度的形式。

```javascript
function flatten(arr, depth = 1) {
  function* flat(arr, depth) {
    for (var item of arr) {
      if (Array.isArray(item) && depth > 0) {
        yield* flat(item, depth - 1)
      } else {
        yield item
      }
    }
  }

  return [...flat(arr, depth)]
}

var list = [1, 2, [3, [4]]]
flatten(list) // [1, 2, 3, [4]]
```

## 常见问题

### 原型重写

&emsp;&emsp;以循环递归为例。

```javascript
Array.prototype.flat = function (depth = 1) {
  var result = []

  if (depth > 0) {
    for (var i = 0; i < this.length; i++) {
      var item = this[i]

      result = result.concat(Array.isArray(item) ? item.flat(depth - 1) : item)
    }
  } else {
    result = this.slice()
  }

  return result
}

var list = [1, 2, [3, [4]]]
list.flat() // [1, 2, 3, [4]]
```

### 数组空位

&emsp;&emsp;以上多维扁平化的替代方案，运行如下示例。

```javascript
var arr = [, 1, undefined, [2, [3]]] // [empty, 1, undefined, [2, [3]]]
console.log(flatten(arr, 2))
```

> `node`版本`v16.14.2`打印结果为`[1, undefined, 2, 3]`

&emsp;&emsp;很容易发现，除了`reduce`递归执行正确之外，剩余的都将输出`[undefined, 1, undefined, 2, 3]`。

&emsp;&emsp;那么是为什么呢？

&emsp;&emsp;原因在于，循环递归时，`for`循环不会忽略空位，并且将其转换为了`undefined`。

```javascript
var arr = [, 1, undefined, [2, [3]]]

for (var i = 0; i < arr.length; i++) {
  console.log(arr[i])
  // undefined
  // 1
  // undefined
  // [2, [3]]
}
```

&emsp;&emsp;;`reduce`循环时将忽略掉空位。

```javascript
var arr = [, 1, undefined, [2, [3]]]

arr.reduce((pre, cur) => {
  console.log(cur)
  // 1
  // undefined
  // [2, [3]]
}, [])
```

&emsp;&emsp;而对于`some`循环和堆栈的情况，原因则是扩展运算符会将`empty`转换为`undefined`。

```javascript
var arr = [, 1, undefined, [2, [3]]]
[...arr] // [undefined, 1, undefined, [2, [3]]]
```

&emsp;&emsp;;`Generator`形式也是`for...of`循环没有忽略空位，将其转换为`undefined`造成的。

```javascript
var arr = [, 1, undefined, [2, [3]]]

for (var item of arr) {
  console.log(item)
  // undefined
  // 1
  // undefined
  // [2, [3]]
}
```

&emsp;&emsp;有两种解决方式，第一种就是将一般循环修改为忽略空位的循环（`forEach`、`reduce`或者`filter`等），例如可以将`for`循环修改为`forEach`。

&emsp;&emsp;第二种方式，要明确的是，数组是没有空位的索引的。

![](/js/flat/empty.png)

&emsp;&emsp;因此可以利用`in`操作符。
```javascript
var arr = [, 1]
0 in arr // false
1 in arr // true
```

&emsp;&emsp;还是以循环递归为例。

```javascript
function flatten(arr, depth = 1) {
  var result = []

  if (depth > 0) {
    for (var i = 0; i < arr.length; i++) {
      var item = arr[i]

      result = result.concat(Array.isArray(item) ? flatten(item, depth - 1) : (i in arr ? item : []))
    }
  } else {
    result = arr.filter(() => true)
  }

  return result
}

var arr = [, 1, undefined, [2, [3]]]
flatten(arr, 2)) // [1, undefined, 2, 3]
console.log(flatten(arr, 0) // [1, undefined, [2, [3]]]
```

&emsp;&emsp;注意用`arr.slice()`确实也能复制数组，但是会将空位也复制下来，可以利用`filter`来跳过空位。

```javascript
var arr = [, 1]

arr.slice() // [empty, 1]
arr.filter(() => true) // [1]
```

## 小结

&emsp;&emsp;;`flat`的替代方案很多，不论以上中的哪一种，都是将数组一维一维降下来的，由此思路，解决了二维数组的扁平化，然后在其基础上，结合递归或者循环，多维扁平化也就能解决了。

&emsp;&emsp;对于唯一参数`depth`深度，循环中要把握好判断条件，另外注意堆栈的方式引入`depth`将会非常低效，原因在于要保存每一个成员的深度。

&emsp;&emsp;针对数组空位的情况，若数据格式非常标准，大可不必考虑。当然也有解决方式，可以将普通循环替换为忽略空位的循环，或者也可以利用`in`操作符。

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125) / [Gitee](https://gitee.com/dongwei1125)、[GitHub Pages](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~