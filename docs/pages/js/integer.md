# JavaScript 浮点数取整

![](/js/integer/banner.jpg)

## 前言

&emsp;&emsp;此文整理了`JavaScript`中常见的浮点数取整函数，当然也包括一些更为高效的位操作取整。

## Math.trunc

&emsp;&emsp;;[Math.trunc](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc) 用于返回数字的整数部分。

```javascript
Math.trunc(-11.25) // -11
Math.trunc(NaN) // NaN
Math.trunc(Infinity) // Infinity
Math.trunc() // NaN
```

&emsp;&emsp;;`Math.trunc`内部也会调用`Number`将参数隐式转换为数值，然后再取整。

```javascript
const object = {
  valueOf() {
    return 11.25
  }
}
Math.trunc(object) // 11
```

## Math.round

&emsp;&emsp;;[Math.round](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math/round) 用于四舍五入取整。

```javascript
Math.round(-11.25) // -11
Math.round(NaN) // NaN
Math.round(Infinity) // Infinity
Math.round() // NaN
Math.round({ valueOf() { return 11.25 } }) // 11
```

## Math.ceil

&emsp;&emsp;;[Math.ceil](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math/ceil) 用于向上取整。

```javascript
Math.ceil(-11.25) // -11
Math.ceil(NaN) // NaN
Math.ceil(Infinity) // Infinity
Math.ceil() // NaN
Math.ceil({ valueOf() { return 11.25 } }) // 12
```

## Math.floor

&emsp;&emsp;;[Math.floor](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math/floor) 用于向下取整。

```javascript
Math.floor(-11.25) // -12
Math.floor(NaN) // NaN
Math.floor(Infinity) // Infinity
Math.floor() // NaN
Math.floor({ valueOf() { return 11.25 } }) // 11
```

## parseInt / Number.parseInt

&emsp;&emsp;;`parseInt`也能用于取整，只取出参数的整数部分。

> `ES6`中将全局方法`parseInt`移植到了`Number`上，[Number.parseInt](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number/parseInt) 与 [parseInt](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/parseInt) 函数行为是一样的

```javascript
Number.parseInt(11.25) // 11
Number.parseInt(Infinity) // NaN
Number.parseInt(NaN) // NaN
Number.parseInt() // NaN
```

&emsp;&emsp;另外`parseInt`会将参数转换为字符串，将忽略字符串开头的空白符，从不是空格的字符开始处理，若第一个字符不是`+`、`-`或者数字，将返回`NaN`，否则一直处理到不是数字字符为止。

```javascript
Number.parseInt(' -11.25a') // -11
Number.parseInt('a11') // NaN
Number.parseInt({ toString() { return 11.25 } }) // 11
```

## Number.prototype.toFixed

&emsp;&emsp;;[Number.prototype.toFixed](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed) 可以用来格式化数值，当然也可以用来取整，并且根据小数位来决定四舍五入。

```javascript
(-11.25).toFixed() // "-11"
(-11.55).toFixed() // "-12"
```

&emsp;&emsp;但是注意`toFixed`可能会存在错误。

```javascript
(1.005).toFixed(2) // "1.00"
```

## 位操作

&emsp;&emsp;位运算中，参与运算的两个值会被转为`有符号`的`32`位二进制数值（`>>>`无符号右移除外，会被转为`无符号`类型），超过`32`位的数值会被`截断`，而小数部分则会被`舍弃`。

> 有符号`32`位的整型数值包括`1`个符号位和`31`个数值位，可表示的整数范围为`[-(2 ^ 31 - 1), 2 ^ 31 - 1]`，即`[-2147483647, 2147483647]`。但是注意由于负数的表示方式为补码，`1000 0000 0000 0000 0000 0000 0000 0000`（`-0`）用来表示`-2147483648`，因此有符号的`32`位整型数的表示范围为`[-2147483648, 2147483647]`

&emsp;&emsp;例一，数值`4294967297`（`2 ^ 32 + 2 ^ 0`）与`0`或，其中左边第一位为符号位，结果中左边第一二位被截掉。

```javascript
  01 0000 0000 0000 0000 0000 0000 0000 0001 // 4294967297
|    0000 0000 0000 0000 0000 0000 0000 0000 // 0
     0000 0000 0000 0000 0000 0000 0000 0001 // 1
```

&emsp;&emsp;例二，数值`2147483648`（`2 ^ 31`）与`0`或，结果中左边第一位符号位截掉。

```javascript
  0 1000 0000 0000 0000 0000 0000 0000 0000 // 2147483648
|   0000 0000 0000 0000 0000 0000 0000 0000 // 0
    1000 0000 0000 0000 0000 0000 0000 0000 // -2147483648
```

> `1000 0000 0000 0000 0000 0000 0000 0000`在有符号的`32`位中表示`-2147483648`

&emsp;&emsp;例三，数值`-2147483649`（`-(2 ^ 31 + 2 ^ 0)`）的二进制表示。

```javascript
1 1000 0000 0000 0000 0000 0000 0000 0001 // 原码
1 0111 1111 1111 1111 1111 1111 1111 1110 // 反码
1 0111 1111 1111 1111 1111 1111 1111 1111 // 补码
```

&emsp;&emsp;与`0`或，结果中左边第一位符号位被截掉。

```javascript
  1 0111 1111 1111 1111 1111 1111 1111 1111 // -2147483649
|   0000 0000 0000 0000 0000 0000 0000 0000 // 0
    0111 1111 1111 1111 1111 1111 1111 1111 // 2147483647
```

### x|0

&emsp;&emsp;与`0`进行或运算。

```javascript
-11.25|0 // -11
```

&emsp;&emsp;小数部分被舍弃。

```javascript
  1000 0000 0000 0000 0000 0000 0000 1011 // -11
| 0000 0000 0000 0000 0000 0000 0000 0000 // 0
  1000 0000 0000 0000 0000 0000 0000 1011 // -11
```

### x&-1

&emsp;&emsp;与`-1`进行与运算

```javascript
-11.25&-1 // -11
```

&emsp;&emsp;;`-1`的`32`位二进制表示。

```javascript
1000 0000 0000 0000 0000 0000 0000 0001 // 原码
1111 1111 1111 1111 1111 1111 1111 1110 // 反码
1111 1111 1111 1111 1111 1111 1111 1111 // 补码
```

&emsp;&emsp;小数部分被舍弃。

```javascript
  1000 0000 0000 0000 0000 0000 0000 1011 // -11
& 1111 1111 1111 1111 1111 1111 1111 1111 // -1
  1000 0000 0000 0000 0000 0000 0000 1011 // -11
```

### x^0

&emsp;&emsp;与`0`异或。

```javascript
-11.25^0 // -11
```

&emsp;&emsp;小数部分被舍弃。

```javascript
  1000 0000 0000 0000 0000 0000 0000 1011 // -11
^ 0000 0000 0000 0000 0000 0000 0000 0000 // 0
  1000 0000 0000 0000 0000 0000 0000 1011 // -11
```

> 异或`^`可以想象为按位相加，但是不进位。比如`0^0=0`想象为`0+0=0`，`0^1=1`想象为`0+1=1`，而`1^1`想象为`1+1=(1)0`，不进位则为`0`

### ~~x

&emsp;&emsp;双非运算。

```javascript
~~-11.25 // -11
```

&emsp;&emsp;小数部分被舍弃。

```javascript
   1000 0000 0000 0000 0000 0000 0000 1011 // -11
~  0111 1111 1111 1111 1111 1111 1111 0100
~~ 1000 0000 0000 0000 0000 0000 0000 1011 // -11
```

<h3>x^n^n</h3>

&emsp;&emsp;两次异或一个数。

```javascript
-11.25^3^3 // -11
```

> 注意`n^n=0`，不管是`0^0`还是`1^1`，结果都是`0`。因此`x^n^n`等价于`x^0`

### x<<0

&emsp;&emsp;有符号左移`0`位，虽然没有进行移位，但是小数部分被舍弃。另外有符号移位意味着符号位保留不参与移位，只移动其余`31`位。

```javascript
-11.25<<0 // -11
```

&emsp;&emsp;;`11`左移`1`位。

```javascript
0000 0000 0000 0000 0000 0000 0000 1011 // 11
0000 0000 0000 0000 0000 0000 0001 0110 // 22
```

&emsp;&emsp;;`-11`左移`1`位。

```javascript
1111 1111 1111 1111 1111 1111 1111 0101 // -11
1111 1111 1111 1111 1111 1111 1110 1010 // -22
```

> 正负数左移空位都是补`0`，另外`<<`左移`n`位相当于乘以`2^n`倍。用一个十进制数来做类比，`20`左移`2`位为`2000`，相当于`20`乘以`10^2`倍，也就是`100`倍

### x>>0

&emsp;&emsp;有符号右移`0`位。

```javascript
-11.25>>0 // -11
```

&emsp;&emsp;;`-11`的`32`位二进制表示。

```javascript
1000 0000 0000 0000 0000 0000 0000 1011 // 原码
1111 1111 1111 1111 1111 1111 1111 0100 // 反码
1111 1111 1111 1111 1111 1111 1111 0101 // 补码
```

&emsp;&emsp;;`-11`右移`1`位。

```javascript
1111 1111 1111 1111 1111 1111 1111 0101 // -11
1111 1111 1111 1111 1111 1111 1111 1010 // -6
```

&emsp;&emsp;;`11`右移`1`位。

```javascript
0000 0000 0000 0000 0000 0000 0000 1011 // 11
0000 0000 0000 0000 0000 0000 0000 0101 // 5
```

> 注意负数右移空位补`1`，正数右移空位补`0`。另外`>>`右移`n`位相当于除以`2^n`倍，然后再向下取整（类似`Math.floor`）。

### x>>>0

&emsp;&emsp;无符号右移`0`位。

```javascript
11.25>>>0 // 11
```

&emsp;&emsp;但是无符号右移`>>>`只适用于正数的取整。

```javascript
-1>>>0 // 4294967295
```

&emsp;&emsp;出现以上现象是由于，`Javascript`会在移位之前做两种转换，第一是将非数值类型转换为`0`，第二则是将数值转换为无符号的`32`位二进制。

&emsp;&emsp;第一种转换。

```javascript
null>>>0 // 0

const fn = () => {}
fn>>>0 // 0
```

&emsp;&emsp;第二种转换可以理解为，`-1`的有符号的`32`位二进制表示为。

```javascript
1111 1111 1111 1111 1111 1111 1111 1111 // -1
```

&emsp;&emsp;然后`JavaScript`会使其符号位失效，或者说符号位上的`1`不再用来表示负号，而是充当数值位，因此`1111...1111`转换为十进制为`4294967295`（`Math.pow(2,32) - 1`）。

> `>>>0`右移`0`位的作用。
>  - 将任何非数值转换为`0`
>  - 取出非负数的整数部分

&emsp;&emsp;既然`>>>`使符号位失效了，那么可以使其再生效吗？

&emsp;&emsp;当然，进行普通的位运算从而将其转换为有符号的`32`位数值。

```javascript
-1>>>0|0 // -1
-1>>>0&-1 // -1
-1>>>0^0 // -1
~~(-1>>>0) // -1
(-1>>>0)>>0 // -1
```

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125) / [Gitee](https://gitee.com/dongwei1125)、[GitHub Pages](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~