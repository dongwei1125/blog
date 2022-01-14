# JavaScript 浮点数陷阱

![](/js/float/banner.jpg)

## 前言

&emsp;&emsp;;`JavaScript`中的浮点数经常会有奇怪的运算结果，例如`0.1 + 0.2 != 0.3`或者是`1.005.toFixed(2)`结果为`1.00`，又或者`Number.MAX_VALUE`与`Number.MAX_SAFE_INTEGER`的区别等等。

&emsp;&emsp;此处对`JavaScript`浮点数的存储标准和以上疑问做了比较细致的整理，希望对你有用。

## IEEE 754

&emsp;&emsp;;`JavaScript`与其它语言不同，`Number`类型是不区分整型和浮点的。对于所有的数字包括整数和小数相同存储，遵循`IEEE 754`的双精度标准，`64`位固定长度，也即是常说的`double`类型。

&emsp;&emsp;由于整数和小数都采用`64`位存储，对于内存来说整型和浮点型也就没有区别了。

> 位运算上，会将操作数转为`32`位有符号数，小数部分直接丢弃

&emsp;&emsp;;`64`位比特包括三个部分。

 - 符号位（`S`，`sign`）：第`63`位，`0`表示正数，`1`表示负数
 - 指数位（`E`，`exponent`）：第`52`到`62`位，共`11`位，取值范围为`0~2047`。但是指数位是可以为负数的，偏移`2023`后取值范围变为`[-1023, 1024]`
 - 尾数位（`M`，`mantissa`）：第`0`到`51`位，共`52`位。

![](/js/float/ieee.png)

&emsp;&emsp;计算公式为。

![](/js/float/ieee-fn.png)

&emsp;&emsp;;`11.25`的`64`位表示。

 - 将整数和小数部分转换成二进制，即`11.25 = 1011.01`
 - 移动小数点，使其位于第`1`、`2`位之间，规范化为`1.01101 * 2 ^ 3`
 - `11.25`为正数，`S = 0`。另外指数为`3`，则`E = 1023 + 3 = 1026`，即`100 0000 0010`
 - 舍去整数部分`1`，剩下尾数部分`01101`，空位补`0`，即`0110 1000 ... 0000`（`52`位）
 - `11.25`的`64`位浮点数的二进制表示为`0 10000000010 01101000...0000`

![](/js/float/11.25.png)

&emsp;&emsp;([图片来源](http://www.binaryconvert.com/convert_double.html))

> 规范化后的整数部分必然为`1`，存储时可以省略，只记录小数点之后的部分, 也就节约了一位内存

## 就近舍入

&emsp;&emsp;在四舍五入中，`0 ~ 9`十个数，`0`比较特殊，不会存在舍去的情况，舍不舍去都是当前数。而剩下的`9`个数中，`1 ~ 4`舍去，`5 ~ 9`上入，概率上舍去为`4 / 9`，上入为`5 / 9`，因此并不是公平的。

&emsp;&emsp;就近舍入，或者叫银行家舍入，是四舍六入五成双。即`1 ~ 4`舍去，`6 ~ 9`上入，`5`的情况则看前一位是奇数还是偶数，偶数则舍去，奇数则上入，因此概率都是`50%`，更加合理。

&emsp;&emsp;二进制中的就近舍入，其中`1001`大于`1000`则上入`1`，`0111`小于`1000`则舍去，而对于`1000`的情况，看前一位是奇数还是偶数，若为`0`则舍去，为`1`则上入`1`。

```javascript
1.001 1001 // 1.010
1.001 0111 // 1.001
1.001 1000 // 1.010

1.100 1001 // 1.101
1.100 0111 // 1.100
1.100 1000 // 1.100
```

## Number.MAX_VALUE

&emsp;&emsp;;[Number.MAX_VALUE](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE) 即`JavaScript`中所能表示的最大数值。

&emsp;&emsp;按照`IEEE 754`的`64`位标准，可以明显想到以下表示。

```javascript
0 11111111111 1111111111111111111111111111111111111111111111111111
```

&emsp;&emsp;但是注意指数位全为`1`用来表示`NaN`或`Infinity`，因此指数位最大为`111 1111 1110`。

```javascript
0 11111111110 1111111111111111111111111111111111111111111111111111
```

&emsp;&emsp;转为十进制。

```javascript
  1.1111111111111111111111111111111111111111111111111111 * 2 ^ (2046 - 1023)
= 1.1111111111111111111111111111111111111111111111111111 * 2 ^ 1023
= 1 1111111111111111111111111111111111111111111111111111 * 2 ^ (1023 - 52)
= 1 1111111111111111111111111111111111111111111111111111 * 2 ^ 971
= (2 ^ 53 - 1) * 2 ^ 971
= 1.7976931348623157e+308
```

&emsp;&emsp;也即是`Number.MAX_VALUE`。

```javascript
(Math.pow(2, 53) - 1) * Math.pow(2, 971) // 1.7976931348623157e+308
(Math.pow(2, 53) - 1) * Math.pow(2, 971) === Number.MAX_VALUE // true
```

## Number.MAX_SAFE_INTEGER

&emsp;&emsp;;[Number.MAX_SAFE_INTEGER](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER) 表示`JavaScript`中最大的安全整数。

&emsp;&emsp;;`Number.MAX_SAFE_INTEGER`二进制表示，注意指数刚好为`52`。

```javascript
0 10000110011 1111111111111111111111111111111111111111111111111111
```

&emsp;&emsp;转为十进制。

```javascript
  1.1111111111111111111111111111111111111111111111111111 * 2 ^ (1075 - 1023)
= 1.1111111111111111111111111111111111111111111111111111 * 2 ^ 52
= 1 1111111111111111111111111111111111111111111111111111
= 2 ^ 53 - 1
= 9007199254740991
```

&emsp;&emsp;然后来说说为什么叫安全整数，指的是当前整数转换为二进制时，可以完全存储在尾数位中，不会发生舍入。

&emsp;&emsp;而`Number.MAX_SAFE_INTEGER + 1`和`Number.MAX_SAFE_INTEGER + 2`都会存在舍去的情况。

&emsp;&emsp;;`Number.MAX_SAFE_INTEGER + 2`，`9007199254740993`的二进制表示。

```javascript
100000000000000000000000000000000000000000000000000001
```

&emsp;&emsp;规范化。

```javascript
1.00000000000000000000000000000000000000000000000000001 * 2 ^ 53
```

&emsp;&emsp;由于指数位只能容纳`52`位，低位为`1`且前一位为`0`，就近舍入时会被舍去。

```javascript
0000000000000000000000000000000000000000000000000000(1)
0000000000000000000000000000000000000000000000000000
```

&emsp;&emsp;;`64`位浮点数表示。

```javascript
0 10000110100 0000000000000000000000000000000000000000000000000000
```

&emsp;&emsp;另外`Number.MAX_SAFE_INTEGER + 1`，也会存在舍去的情况。

&emsp;&emsp;;`9007199254740992`的浮点数表示。

```javascript
0 10000110100 0000000000000000000000000000000000000000000000000000
```

&emsp;&emsp;因此会造成以下结果。

```javascript
Number.MAX_SAFE_INTEGER + 1 === Number.MAX_SAFE_INTEGER + 2 // true
```

## 0.1 + 0.2 != 0.3

### 0.1

&emsp;&emsp;先来将`0.1`转换为二进制，连续乘以`2`并取整。

```javascript
0.1 * 2 = 0.2 ----- 整 0 余 0.2
0.2 * 2 = 0.4 ----- 整 0 余 0.4
0.4 * 2 = 0.8 ----- 整 0 余 0.8
0.8 * 2 = 1.6 ----- 整 1 余 0.6
0.6 * 2 = 1.2 ----- 整 1 余 0.2
0.2 * 2 = 0.4 ----- 整 0 余 0.4
```

&emsp;&emsp;;`0.1`的二进制表示，`0011`将无限循环下去。

```javascript
0.0 0011 0011 0011 (0011)
```

&emsp;&emsp;规范化，另外`0.1`为正数，`S = 0`，指数为`-4 + 1023 = 1019`，即`011 1111 1011`。

```javascript
1.1 0011 0011 (0011) * 2 ^ -4
```

&emsp;&emsp;尾数位最多存储`52`位，且采用就近舍入模式，向前进`1`。

```javascript
1001100110011001100110011001100110011001100110011001(10011)
1001100110011001100110011001100110011001100110011010
```

&emsp;&emsp;;`0.1`的`64`位浮点数表示。

```javascript
0 01111111011 1001100110011001100110011001100110011001100110011010
```

![](/js/float/0.1.png)

### 0.2

&emsp;&emsp;;`0.2`的二进制。

```javascript
0.0011 0011 0011 (0011)
```

&emsp;&emsp;规范化`0.2`，`S = 0`，指数为`-3 + 1023 = 1020`，即`011 1111 1100`。

```javascript
1.1 0011 0011 (0011) * 2 ^ -3
```

&emsp;&emsp;存储`52`位，其余舍去，向前进`1`。

```javascript
1001100110011001100110011001100110011001100110011001(10011) 
1001100110011001100110011001100110011001100110011010
```

&emsp;&emsp;;`0.2`的`64`位浮点数表示。

```javascript
0 01111111100 1001100110011001100110011001100110011001100110011010
```

![](/js/float/0.2.png)

&emsp;&emsp;因此实际上`0.1`和`0.2`转换为`64`位的双精度浮点数时，都存在精度损失。

```javascript
0 01111111011 1001100110011001100110011001100110011001100110011010 // 0.1
0 01111111100 1001100110011001100110011001100110011001100110011010 // 0.2
```

> 浮点数运算三步骤，对阶、求和、规范化

### 对阶

&emsp;&emsp;;`0.1`和`0.2`的指数部分阶次不一致，要先统一阶次，且遵循小阶向大阶看齐的原则。

&emsp;&emsp;比如十进制的`1.5 * 10 ^ 10 + 1.23 * 10 ^ 13`，保留小数点前后`1`位。

 - 大阶向小阶看齐时，即`1.5 * 10 ^ 10 + 1230 * 10 ^ 10`，结果为`1231.5 * 10 ^ 10`，规则舍弃后为`1.5 * 10 ^ 10`
 - 小阶向大阶看齐时，即`0.0015 * 10 ^ 13 + 1.23 * 10 ^ 13`，结果为`1.2315 * 10 ^ 13`，规则舍弃后为`1.2 * 10 ^ 13`

&emsp;&emsp;明显看到小阶向大阶更能接近实际结果。另外阶次若加`1`，尾数位就要右移`1`位，阶次相同时对阶完成。

&emsp;&emsp;为什么阶次加`1`尾数位就右移`1`位呢？

&emsp;&emsp;;`0.1`的`64`位浮点数表示，值为`1.1001 1001 ... 1001 1001 1010 * 2 ^ -4`。

```javascript
0 01111111011 (1.)1001100110011001100110011001100110011001100110011010
```

&emsp;&emsp;此处若阶次加`1`，要保持值大小不变，小数点要左移`1`位，即`0.1 1001 1001 ... 1001 1001 1010 * 2 ^ -3`，也就相当于尾数位右移`1`位。右移后空位补`1`，也就是省略的整数部分的`1`。注意若还要右移，空位只能补`0`，原因在于整数部分后续都是`0`了。

```javascript
0 01111111110 (0.)1100110011001100110011001100110011001100110011001101(0)
```

&emsp;&emsp;因此对阶过程如下，由于低位为`0`，可以省去。

```javascript
0 01111111011 1001100110011001100110011001100110011001100110011010 // 0.1
0 01111111100  100110011001100110011001100110011001100110011001101(0) // 阶次加 1，尾数位右移 1 位
0 01111111100 1100110011001100110011001100110011001100110011001101 // 空位补 1
```

> 注意尾数位右移是将低位移出，会损失一定的精度，为了减小误差，将保留若干移出的位，在以后的规范化时再做舍入

### 求和

&emsp;&emsp;阶数相同，开始求和。

```javascript
  0 01111111100 1100110011001100110011001100110011001100110011001101 // 0.1
+ 0 01111111100 1001100110011001100110011001100110011001100110011010 // 0.2
```

&emsp;&emsp;更好理解的方式，注意尾数位产生了进位。

```javascript
  0.1100110011001100110011001100110011001100110011001101
+ 1.1001100110011001100110011001100110011001100110011010
 10.0110011001100110011001100110011001100110011001100111
```

### 规范化

&emsp;&emsp;求和结果为`10.0 1100 1100 ... 1100 1100 111 * 2 ^ -3`，即`1.00 1100 1100 ... 1100 1100 111 * 2 ^ -2`。

```javascript
1.00110011001100110011001100110011001100110011001100111
```

&emsp;&emsp;由于指数位只能容纳`52`位，就近舍入后向前进`1`。

```javascript
0011001100110011001100110011001100110011001100110011(1)
0011001100110011001100110011001100110011001100110100
```

&emsp;&emsp;;`IEEE 754`的双精度`64`位表示。

```javascript
0 01111111101 0011001100110011001100110011001100110011001100110100
```

&emsp;&emsp;即`1.0011 0011 ... 0011 0011 0100 * 2 ^ -2`，转换为十进制也就是`0.30000000000000004`。

### 小结

&emsp;&emsp;要明确的是，诸如`0.1`、`0.2`之类的数，虽然在十进制中能非常清晰地表达，但是在二进制中却是无穷尽的，无法精确表示。而`JavaScript`遵循`IEEE 754`的双精度标准，仅`64`位，进制的转换中要舍弃低位来存储，因此必然存在精度丢失。

&emsp;&emsp;另外在相加的过程中，对阶、求和、规范化都可能存在舍入，也会存在精度的丢失。

## 1.005.toFixed(2)

&emsp;&emsp;;`1.005`的二进制表示，`0000 1010 0011 1101 0111`将无限循环下去。

```javascript
1.000 (0000 1010 0011 1101 0111)
```

&emsp;&emsp;;`IEEE 754`的双精度`64`位表示。

```javascript
0 01111111111 0000000101000111101011100001010001111010111000010100(0)
0 01111111111 0000000101000111101011100001010001111010111000010100
```

&emsp;&emsp;;`1.005`截断后面位数后，已经小于`1.005`，利用 [Number.prototype.toPrecision](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number/toPrecision) 来看下`1.005`的`20`位精度。

![](/js/float/1.005.png)

&emsp;&emsp;因此`toFixed`保留两位小数，四舍五入时。

```javascript
1.005.toFixed(2) // 1.00
```

## Number.MAX_VALUE + 1 不是 Infinity

### Number.MAX_VALUE + 1 === Number.MAX_VALUE

&emsp;&emsp;;`Number.MAX_VALUE`与`1`的`64`位浮点数表示为。

```javascript
0 11111111110 1111111111111111111111111111111111111111111111111111 // Number.MAX_VALUE
0 01111111111 0000000000000000000000000000000000000000000000000000 // 1
```

&emsp;&emsp;相加对阶时`1`的阶数将由`0`升到`1023`，尾数位将右移`1023`位。

```javascript
  0 11111111110 1111111111111111111111111111111111111111111111111111 // Number.MAX_VALUE
+ 0 11111111110 0000000000000000000000000000000000000000000000000000(000...0001) // 1
```

&emsp;&emsp;求和。

```javascript
  1.1111111111111111111111111111111111111111111111111111
+ 0.0000000000000000000000000000000000000000000000000000(000...0001)
  1.1111111111111111111111111111111111111111111111111111(000...0001)
```

&emsp;&emsp;规范化时低位将舍弃，实际相当于`Number.MAX_VALUE`加`0`，所以会有以下结果。

```javascript
Number.MAX_VALUE + 1 === Number.MAX_VALUE // true
```

### 2 ^ 970

&emsp;&emsp;那到底`Number.MAX_VALUE`加上多少等于`Infinity`呢？

&emsp;&emsp;按照`IEEE 754`的规范，只要大于等于以下数，就会被表示为`Infinity`。

![](/js/float/infinity-fn.png)

&emsp;&emsp;;`64`位浮点数中，<code>E~max~</code>为`1023`，`p`为`53`。

```javascript
  2 ^ 1023 * (2 - 2 ^ (1 - 53) / 2)
= 2 ^ 1023 * (2 - 2 ^ -53)
= 2 ^ 970 * (2 ^ 54 - 1)
```

&emsp;&emsp;此结果与`Number.MAX_VALUE`差值为。

```javascript
  (2 ^ 54 - 1) * 2 ^ 970 - (2 ^ 53 - 1) * 2 ^ 971
= 2 ^ 970
```

&emsp;&emsp;因此`Number.MAX_VALUE`至少加上`2 ^ 970`才能等于`Infinity`。

### Number.MAX_VALUE + 2 ^ 970 === Infinity

&emsp;&emsp;;`Number.MAX_VALUE`与`2 ^ 970`的`64`位浮点数表示。

```javascript
0 11111111110 1111111111111111111111111111111111111111111111111111 // Number.MAX_VALUE
0 11111001001 0000000000000000000000000000000000000000000000000000 // 2 ^ 970
```

&emsp;&emsp;相加对阶时`2 ^ 970`阶数将由`970`升到`1023`，差值为`53`，尾数位将右移`53`位。

```javascript
  0 11111111110 1111111111111111111111111111111111111111111111111111 // Number.MAX_VALUE
+ 0 11111111110 0000000000000000000000000000000000000000000000000000(1) // 2 ^ 970
```

&emsp;&emsp;求和，就近舍入时，低位舍入，向前进`1`。

```javascript
  1.1111111111111111111111111111111111111111111111111111
+ 0.0000000000000000000000000000000000000000000000000000(1)
  1.1111111111111111111111111111111111111111111111111111(1)
 10.0000000000000000000000000000000000000000000000000000
```

&emsp;&emsp;注意尾数位产生了进位，指数位则加`1`，尾数位右移`1`位。

&emsp;&emsp;结果的`64`位浮点数表示，而以下表示实际就是`Infinity`的`64`位浮点数表示。

```javascript
0 11111111111 0000000000000000000000000000000000000000000000000000
```

## 参考

 - [JavaScript 浮点数陷阱及解法](https://github.com/camsong/blog/issues/9)
 - [0.30000000000000004](https://0.30000000000000004.com/)
 - [0.1 + 0.2 为什么不等于 0.3？](https://github.com/qufei1993/Nodejs-Roadmap/blob/master/docs/javascript/floating-point-number-0.1-0.2.md)
 - [为什么说 32 位浮点数的精度是 7 位有效数](https://zhuanlan.zhihu.com/p/343040291)
 - [为什么 Number.MAX_VALUE + 1 不是 Infinity?](https://www.zhihu.com/question/24423421)

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125)、[Blog](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~