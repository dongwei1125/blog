# 关于 ES6 参数默认值形成的第三作用域问题

![](/js/es6/banner.jpg)

## 前言

&emsp;&emsp;最近系统回顾[《ES6 标准入门》](https://es6.ruanyifeng.com/#docs/function#%E4%BD%9C%E7%94%A8%E5%9F%9F)时，在函数的拓展一章下的作用域小节，又看到了以下代码。

```javascript
var x = 1
function foo(x, y = function () { x = 2 }) {
  var x = 3
  y()
  console.log(x)
}
foo()
console.log(x)
```

&emsp;&emsp;大约一分钟时间思考一下结果吧😁。

![](/js/default-params/60.gif)

&emsp;&emsp;如果你有仔细阅读文初的结论，`一旦设置了参数的默认值，函数进行声明初始化时，参数会形成一个单独的作用域`，结果想必一目了然。

```javascript
foo() // 3
console.log(x) // 1
```

## 有无默认值的作用域情况

&emsp;&emsp;那到底形成了一个怎样的作用域呢？

&emsp;&emsp;打上断点在浏览器看下作用域情况。

![](/js/default-params/default.png)

&emsp;&emsp;确实含有全局作用域`Global`、`Local`和`Block`三个作用域，`Local`和`Block`是什么作用域暂时先不管，接着往下看。

&emsp;&emsp;不指定参数默认值时的情况。

![](/js/default-params/dot.png)

&emsp;&emsp;仅有全局作用域`Global`和函数作用域`Local`。

&emsp;&emsp;暂时可以确定的是，形参指定默认值将形成第三个作用域。

## ECMA 的相关规范

&emsp;&emsp;还是去规范中寻找答案吧。

&emsp;&emsp;在`ECMA-262`规范中的第 [9.2.12](https://262.ecma-international.org/6.0/#sec-functiondeclarationinstantiation) 小节中可以看到相关说明。

> `9.2.12FunctionDeclarationInstantiation(func, argumentsList)`</br>
> `...`</br>
> `If the function’s formal parameters do not include any default value initializers then the body declarations are instantiated in the same Environment Record as the parameters. If default value parameter initializers exist, a second Environment Record is created for the body declarations. Formal parameters and functions are initialized as part of FunctionDeclarationInstantiation. All other bindings are initialized during evaluation of the function body.`

&emsp;&emsp;大致语义就是如果函数形参不含默认值，那么参数和函数体将在同一个`Environment Record`中初始化。如果形参含有默认值，则将为函数体创建第二个`Environment Record`。可以简单将`Environment Record`理解为作用域。

&emsp;&emsp;因此结合浏览器的调试情况可以得出，形参指定默认值后，将形成全局作用域`Global`、参数作用域`Local`和函数作用域`Block`。不指定默认值，仅有全局作用域`Global`和函数作用域`Local`。

&emsp;&emsp;另外三作用域之间是包含的关系，为全局作用域`⊃`参数作用域`⊃`函数作用域，进一步的，参数作用域将是函数作用域的父级。

&emsp;&emsp;代码结果可大致分析为，函数`foo`指定了参数默认值，参数`x`和`y`将形成一个参数作用域。运行`y`函数，执行`x = 2`时，由于`y`函数当前作用域下没有变量`x`，因此沿着作用域链往上查找至函数`foo`的参数作用域，此作用域下包含形参变量`x`，因此将`x`修改为`2`。

&emsp;&emsp;然后运行`foo`函数内`console.log(x)`时，当前作用域下含有局部变量`x`，因此输出`3`。最后全局变量`x`为`1`，全局下`console.log(x)`将输出`1`。

## 转译为 ES5 代码

&emsp;&emsp;为了搞清楚`ES5`的实现，用`babel`转译以上代码。

```javascript
"use strict"

var x = 1
function foo(x) {
  var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () { x = 2 }

  return function (x) {
    var x = 3
    y()
    console.log(x)
  }(x)
}
foo()
console.log(x)
```

&emsp;&emsp;根据转译后的结果，可以明显发现，`ES5`利用了自执行函数，将原函数的参数与函数体隔离为了两个不同的作用域，关系上确实也是参数所在的作用域包含函数体所在的作用域，是符合`ECMA`的规范的。

## 变量的声明方式为 let 时

&emsp;&emsp;既然函数包含默认值时，会形成额外的第三个作用域，即参数作用域，那么以下代码是否将是可行的呢？

```javascript
function foo(x, y = 2) {
  let x
}
foo()
```

&emsp;&emsp;按照分析参数中的`x`与函数体中的`x`位于两个不同的作用域，是可行的。

&emsp;&emsp;但是运行后将会报出`SyntaxError`错误。

![](/js/default-params/error.png)

&emsp;&emsp;解释以上错误可以根据`ECMA-262`的 [14.1.2](https://262.ecma-international.org/6.0/#sec-function-definitions-static-semantics-early-errors) 小结中的规范。

> `14.1.2 Static Semantics: Early Errors`</br>
> `...`</br>
> `It is a Syntax Error if any element of the BoundNames of FormalParameters also occurs in the LexicallyDeclaredNames of FunctionBody.`

&emsp;&emsp;即是说参数名和函数体内的变量名相同，将会是一个`SyntaxError`。另外注意也是一个`EarlyErrors`错误，也就是说在解析阶段就会报错。

&emsp;&emsp;所以只是声明函数并不执行也将报错。

```javascript
function foo(x, y = 2) {
  let x
}
```

&emsp;&emsp;也就顺带解释了以下变型报错的原因。

```javascript
var x = 1
function foo(x, y = function () { x = 2 }) {
  let x = 3
  y()
  console.log(x)
}
foo()
console.log(x)
```

## 变量的声明方式为 var 时

&emsp;&emsp;将代码变型为`var`声明。

```javascript
var x = 1
function foo(x = 3, y = function () { x = 2 }) {
  var x
  y()
  console.log(x)
}
foo()
console.log(x)
```

&emsp;&emsp;你会发现竟然能运行，并且还输出了`3` `1`。

&emsp;&emsp;不是按照`14.1.2`的规范会在解析阶段就报错吗？

&emsp;&emsp;不要慌，只能说明一个问题，那就是此规范仅针对`ES6`的`let`和`const`等声明，对于`var`将没有此限制。

&emsp;&emsp;但是话说回来，指定了形参默认值，参数中的`x`和函数体中的`x`位于两个不同的作用域，`foo`内的`console.log(x)`是不是应该输出`undefined`呢？

&emsp;&emsp;啊这`...`，我也不知道，啊你听我狡辩。

&emsp;&emsp;在浏览器打个断点看看呢。

![](/js/default-params/var.png)

&emsp;&emsp;可以看到由于指定了参数默认值，形成了三个作用域。但是在函数`y`运行前，函数作用域中的局部变量`x`竟然为`3`了。

&emsp;&emsp;啊这`...`

&emsp;&emsp;简化以上代码，运行后将输出`3`。

```javascript
function foo(x = 3, y = 5) {
  var x
  console.log(x)
}
foo()
```

&emsp;&emsp;然后参考规范 [9.2.12](https://262.ecma-international.org/6.0/#sec-functiondeclarationinstantiation) 节。

> `NOTE vars whose names are the same as a formal parameter, initially have the same value as the corresponding initialized parameter.`

&emsp;&emsp;大致意思是说，对于函数内`var`声明的局部变量名与形参名相同时，局部变量初始值与形参值相同。

&emsp;&emsp;;`babel`转换为`ES5`看看。

```javascript
"use strict"

function foo() {
  var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 3
  var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5
  console.log(x)
}
foo()
```

&emsp;&emsp;你会发现实际上`var x`代码行被直接丢弃了。

&emsp;&emsp;所以变型中的`var x`代码行就可以忽略掉了，结果显然输出`3` `1`。

## 小结

&emsp;&emsp;绕了一大堆，记住三点就可以了。

 - 函数形参指定了默认值时，将形成一个第三作用域，即参数作用域，此作用域将作为函数作用域的父级
 - 函数内`let`声明的局部变量名与形参名一致时，在解析阶段就会报错
 - 函数内诸如`var x`（未赋值）声明的局部变量名与形参名一致时，可忽略当前代码行

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125) / [Gitee](https://gitee.com/dongwei1125)、[GitHub Pages](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~