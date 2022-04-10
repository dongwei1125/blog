# ES6 copyWithin

![](/js/copyWithin/banner.jpg)

## 前言

&emsp;&emsp;;[copyWithin](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/copyWithin) 用于浅复制数组的一部分到另一位置。

```javascript
[1, 2, 3, 4, 5].copyWithin(0, 2, 4) // [3, 4, 3, 4, 5]
```

&emsp;&emsp;其中参数分别为`target`（复制到的索引）、`start`（开始复制的索引）、`end`（结束复制的索引，不包括`end`位置的元素）。

![](/js/copyWithin/animate.gif)

## 参数

&emsp;&emsp;参数`start`默认值为`0`，`end`默认值为数组长度，若参数为负数，函数`toAbsoluteIndex`会将其转换为正数。

```javascript
function toAbsoluteIndex(target, len) {
  return target < 0 ? len + target : Math.min(target, len)
}

Array.prototype.copyWithin = function (target, start, end) {
  var len = this.length
  target = toAbsoluteIndex(target, len)
  start = toAbsoluteIndex(start || 0, len)
  end = end === undefined ? len : toAbsoluteIndex(end, len)
  var count = Math.min(len - target, end - start)
  var inc = 1

  while (count--) {
    if (start in this) {
      this[target] = this[start]
    }

    target += inc
    start += inc
  }

  return this
}
```

## 移动次数

&emsp;&emsp;;`count`为移动次数，取值分为两种情况，第一种由`length`和`target`决定。

```javascript
[1, 2, 3, 4, 5].copyWithin(-2) // [1, 2, 3, 1, 2]
```

&emsp;&emsp;以上相当于`copyWithin(3, 0, 5)`，其中`length - target = 2`，`end - start = 5`，移动次数为两者较小值`2`。

![](/js/copyWithin/2.png)

&emsp;&emsp;另外一种情况由`end`和`start`决定。

```javascript
[1, 2, 3, 4, 5].copyWithin(0, 3, 4) // [4, 2, 3, 4, 5]             
```

&emsp;&emsp;;`length - target = 5`，`end - start = 1`，移动次数为两者较小值`1`。

![](/js/copyWithin/1.png)

&emsp;&emsp;故移动次数为`Math.min(length - target, end - start)`。

## 类数组

&emsp;&emsp;;`copyWithin`对于类数组也是适用的。

```javascript
[].copyWithin.call({length: 5, 3: 1}, 0, 3) // {0: 1, 3: 1, length: 5}
```

&emsp;&emsp;对象仅含有此属性时，才复制到对应位置。

```javascript
if (start in this) {
  this[target] = this[start]
}
```

&emsp;&emsp;注意只能用`in`操作符判断，不能用`this[start] !== undefined`来判断，原因在于可能属性值就是`undefined`。

```javascript
const foo = {}
const bar = { key: undefined }

foo.key // undefined
'key' in foo // false

bar.key // undefined
'key' in bar // true
```

## 倒序移动

&emsp;&emsp;以上代码运行如下示例，输出`[1, 2, 3, 3, 3, 6]`，并不是正确的结果。

```javascript
[1, 2, 3, 4, 5, 6].copyWithin(3, 2, 4) // [1, 2, 3, 3, 4, 6]
```

&emsp;&emsp;我们将`start`和`end`固定为`2`和`4`，看看不同`target`值时的情况。

![](/js/copyWithin/target.png)

<table>
  <tr>
    <th>start</th>
    <th>end</th>
    <th>count</th>
    <th>target</th>
    <th>start < target</th>
    <th>target < start + count</th>
    <th>输出结果</th>
    <th>正确结果</th>
    <th>一致</th>
  </tr>
  <tr align='center'>
    <td><code>2</code></td>
    <td><code>4</code></td>
    <td><code>2</code></td>
    <td><code>0</code></td>
    <td>否</td>
    <td>是</td>
    <td><code>[3, 4, 3, 4, 5, 6]</code></td>
    <td><code>[3, 4, 3, 4, 5, 6]</code></td>
    <td>是</td>
  </tr>
  <tr align='center'>
    <td><code>2</code></td>
    <td><code>4</code></td>
    <td><code>2</code></td>
    <td><code>1</code></td>
    <td>否</td>
    <td>是</td>
    <td><code>[1, 3, 4, 4, 5, 6]</code></td>
    <td><code>[1, 3, 4, 4, 5, 6]</code></td>
    <td>是</td>
  </tr>
  <tr align='center'>
    <td><code>2</code></td>
    <td><code>4</code></td>
    <td><code>2</code></td>
    <td><code>2</code></td>
    <td>否</td>
    <td>是</td>
    <td><code>[1, 2, 3, 4, 5, 6]</code></td>
    <td><code>[1, 2, 3, 4, 5, 6]</code></td>
    <td>是</td>
  </tr>
  <tr align='center'>
    <td><code>2</code></td>
    <td><code>4</code></td>
    <td><code>2</code></td>
    <td><code>3</code></td>
    <td>是</td>
    <td>是</td>
    <td><code>[1, 2, 3, 3, <b>3</b>, 6]</code></td>
    <td><code>[1, 2, 3, 3, <b>4</b>, 6]</code></td>
    <td>否</td>
  </tr>
  <tr align='center'>
    <td><code>2</code></td>
    <td><code>4</code></td>
    <td><code>2</code></td>
    <td><code>4</code></td>
    <td>是</td>
    <td>否</td>
    <td><code>[1, 2, 3, 4, 3, 4]</code></td>
    <td><code>[1, 2, 3, 4, 3, 4]</code></td>
    <td>是</td>
  </tr>
  <tr align='center'>
    <td><code>2</code></td>
    <td><code>4</code></td>
    <td><code>2</code></td>
    <td><code>5</code></td>
    <td>是</td>
    <td>否</td>
    <td><code>[1, 2, 3, 4, 5, 3]</code></td>
    <td><code>[1, 2, 3, 4, 5, 3]</code></td>
    <td>是</td>
  </tr>
</table>

&emsp;&emsp;可以发现，唯独运行`copyWithin(3, 2, 4)`时结果错误。

&emsp;&emsp;原因在于移动过程中前面的元素会覆盖后面的元素。

![](/js/copyWithin/12.png)

&emsp;&emsp;倒序移动问题将得到解决。

![](/js/copyWithin/21.png)

&emsp;&emsp;注意仅有`start < target`和`target < start + count`都满足时，才倒序移动，剩余情况还是正常移动。另外`target`应该从`target + count - 1`递减，例如以上`target`应该从索引为`4`（`3 + 2 - 1`）的位置开始，`start`也同理。

```javascript
if (start < target && target < start + count) {
  inc = -1
  target += count - 1
  start += count - 1
}
```

## ES5 兼容

```javascript
function toAbsoluteIndex(target, len) {
  return target < 0 ? len + target : Math.min(target, len)
}

Array.prototype.copyWithin = function (target, start, end) {
  var len = this.length
  target = toAbsoluteIndex(target, len)
  start = toAbsoluteIndex(start || 0, len)
  end = end === undefined ? len : toAbsoluteIndex(end, len)
  var count = Math.min(len - target, end - start)
  var inc = 1

  if (start < target && target < start + count) {
    inc = -1
    target += count - 1
    start += count - 1
  }

  while (count--) {
    if (start in this) {
      this[target] = this[start]
    }

    target += inc
    start += inc
  }

  return this
}
```

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125) / [Gitee](https://gitee.com/dongwei1125)、[GitHub Pages](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~