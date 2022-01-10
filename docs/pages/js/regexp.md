# JavaScript 正则表达式

![](/js/regexp/banner.jpg)

## 前言

&emsp;&emsp;;[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions) 对正则表达式有更为详细的描述，此文仅是学习正则表达式过程中的记录和发散，相关的内容后面会逐步进行完善。

## 方法

### test

&emsp;&emsp;;[test](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test) 用来检查字符串是否与正则表达式相匹配，返回布尔值。

```javascript
/hello/.test('hello_world') // true
```

&emsp;&emsp;来看一个特殊情况。

```javascript
const reg = /hello/
reg.test('hello_world') // true
reg.test('say_hello') // true

const reg = /hello/g
reg.test('hello_world') // true
reg.test('say_hello') // false
reg.test('hello_regexp') // true
```

&emsp;&emsp;你应该知道的是，每个正则表达式都有一个 [lastIndex](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/RegExp/lastIndex) 属性，用来指定下一次匹配的起始索引，可读也可写，默认值为`0`（表示从字符串头部开始匹配）。但是一般不会起作用，只有在正则表达式开启了全局匹配`g`时，`lastIndex`才会生效。

&emsp;&emsp;以上第一个正则表达式未开启全局匹配，`lastIndex`始终不生效，每次执行`test`时都是从字符串的头部开始匹配，所以都会输出`true`。而当开启全局匹配时，执行第一个`test`匹配成功输出`true`，此时会将`lastIndex`更新为`5`，以便下一次匹配，而执行第二个`test`时，由于`lastIndex`为`5`（即从`ello`开始匹配），将匹配失败输出`false`。而匹配失败后，`lastIndex`将被重置为`0`，所以第三个`test`又输出`true`。

&emsp;&emsp;因此若要在开启全局匹配下输出一致，可修改`lastIndex`属性（`4`表示从`hello`开始匹配）。

```javascript
const reg = /hello/g
reg.test('hello_world') // true
reg.lastIndex = 4
reg.test('say_hello') // true
reg.lastIndex // 9
```

### exec

&emsp;&emsp;;[exec](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec) 用于对字符串执行一次搜索匹配，返回一个结果数组或`null`。

&emsp;&emsp;其中数组中包括`[0]`（匹配的完整字符串）、`[1]...[n]`（捕获的分组）、`index`（匹配的内容在原字符串中的索引）、`input`（原字符串）、`group`（`ES6`的具名组）。

```javascript
const reg = /h(e)ll(o)/i
const str = 'Hello foo, hEllo bar, heLlo baz'
reg.exec(str) // ["Hello", "e", "o", index: 0, input: "Hello foo, hEllo bar, heLlo baz", groups: undefined]
```

&emsp;&emsp;注意`exec`也与`test`类似，开启全局匹配`g`后`lastIndex`才会生效，开启后`exec`可以获取单个字符串中的多次匹配结果。并且与`test`类似，`exec`若匹配失败，`lastIndex`也会归`0`。

```javascript
const reg = /h(e)ll(o)/ig
const str = 'Hello foo, hEllo bar, heLlo baz'
var res = null

while (res = reg.exec(str)) {
  console.log(res)
  // ["Hello", "e", "o", index: 0, input: "Hello foo, hEllo bar, heLlo baz", groups: undefined]
  // ["hEllo", "E", "o", index: 11, input: "Hello foo, hEllo bar, heLlo baz", groups: undefined]
  // ["heLlo", "e", "o", index: 22, input: "Hello foo, hEllo bar, heLlo baz", groups: undefined]
}
```

## 字符串方法

&emsp;&emsp;;`ES6`将`String.prototype`中的四个方法`search`、`split`、`replace`、`match`在语言内部都调用了`RegExp.prototype`上的方法，例如`String.prototype.search`调用`RegExp.prototype[Symbol.search]`。

&emsp;&emsp;另外若方法的参数为对象，都会存在隐式类型转换。

```javascript
const str = 'foo, bar, baz'
const reg = {
  toString() {
    return 'baz'
  }
}

str.search(reg) // 10
str.split(reg) // ["foo, bar, ", ""]
str.replace(reg, 'yes') // foo, bar, yes
str.match(reg) // ["baz", index: 10, input: "foo, bar, baz", groups: undefined]
```

### search

&emsp;&emsp;;[search](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/search) 用于返回正则表达式在字符串中首个匹配项的索引，若未匹配则返回`-1`。

```javascript
'hello world'.search(/world/) // 6
'hello world'.search(/say/) // -1
'hello world'.search('llo') // 2
```

### split

&emsp;&emsp;;[split](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/split) 用于分割字符串为数组。

&emsp;&emsp;其中第一个参数为字符串或者正则表达式，第二个参数用于限制分割后的数组长度。

```javascript
'say hello world'.split(/[er]/) // ["say h", "llo wo", "ld"]
'say hello world'.split(" ") // ["say", "hello", "world"]
'say hello world'.split(" ", 1) // ["say"]
```

### replace

&emsp;&emsp;;[replace](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/replace) 用于替换字符串中的字符为另一些字符，原字符串不变，返回一个新的字符串。

```javascript
'hello world'.replace('world', 'regexp') // hello regexp
'hello world'.replace(/[er]/g, 'm') // hmllo womld
```

&emsp;&emsp;另外第二个参数可以为一些特殊变量名。

 - `$&`：匹配的字符串
 - <code>&`</code>：匹配结果前面的内容
 - `&'`：匹配结果后面的内容
 - `$n`：分组捕获，捕获的第`n`组内容
 - `$$`：符号`$`
 - `&<name>`：具名组捕获，捕获的分组内容

```javascript
'hello_world'.replace(/world/, '$&') // hello_world
'hello_world'.replace(/world/, '$`') // hello_hello_
'hello_world'.replace(/world/, "$'") // hello_
'hello_world'.replace(/(world)/, '$1') // hello_world
'hello_world'.replace(/world/, '$$') // hello_$
'hello_world'.replace(/(?<key>world)/, '$<key>') // hello_world
```

### match

&emsp;&emsp;;[match](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/match) 用于返回一个字符串匹配正则表达式的结果。

&emsp;&emsp;注意若未开启全局匹配`g`，将返回第一个匹配结果和捕获组（等价于`exec`）。若开启全局匹配，将只返回匹配的所有结果。

```javascript
const reg = /h(e)ll(o)/i
const rege = /h(e)ll(o)/ig
const str = 'Hello foo, hEllo bar, heLlo baz'
str.match(reg) // ["Hello", "e", "o", index: 0, input: "Hello foo, hEllo bar, heLlo baz", groups: undefined]
str.match(rege) // ["Hello", "hEllo", "heLlo"]
```

## 修饰符

### i

&emsp;&emsp;忽略大小写。

```javascript
/hello/.test('Hello world') // false
/hello/i.test('Hello world') // true
```

&emsp;&emsp;正则表达式是否设置`i`修饰符。

```javascript
const reg = /a/i
reg.ignoreCase // true
```

### g

&emsp;&emsp;全局匹配。

```javascript
'hello'.replace(/l/, 'm') // hemlo
'hello'.replace(/l/g, 'm') // hemmo
```

&emsp;&emsp;正则表达式是否设置`g`修饰符。

```javascript
const reg = /a/g
reg.global // true
```

### m

&emsp;&emsp;多行匹配。

```javascript
const str = 'hello \nworld'

/^world/.test(str) // false
/^world/m.test(str) // true
```

> `world`位于第二行行首，指定多行匹配`m`后会被匹配上

&emsp;&emsp;正则表达式是否设置`m`修饰符。

```javascript
const reg = /a/m
reg.multiline // true
```

### s

&emsp;&emsp;正则表达式中`.`不匹配`\n`，`ES2018`引入了`s`修饰符，可以匹配任何单个字符。

```javascript
const str = 'hello\nworld'

/hello.world/.test(str) // false
/hello.world/s.test(str) // true
/hello[^]world/.test(str) // true
```

&emsp;&emsp;正则表达式是否设置`s`修饰符。

```javascript
const reg = /a/s
reg.dotAll // true
```

### u

&emsp;&emsp;;`Unicode`模式，用于正确识别大于`0xffff`的字符。

```javascript
/^.$/.test('𠮷') // false
/^.$/u.test('𠮷') // true
```

&emsp;&emsp;正则表达式是否设置`u`修饰符。

```javascript
const reg = /a/s
reg.unicode // true
```

### y

&emsp;&emsp;粘连模式，要求每次都是从剩余字符串的头部开始匹配。

```javascript
const str = 'aaa_aa_a'
const g = /a+/g
const y = /a+/y

g.exec(str) // ["aaa"]
g.exec(str) // ["aa"]

y.exec(str) // ["aaa"]
y.exec(str) // null
```

&emsp;&emsp;以上粘连模式中，第一次`exec`匹配后`lastIndex`为`3`，第二次`exec`匹配时，剩余的字符串为`_aa_a`，而粘连模式要求从剩余字符串的头部开始（即`/a+/y`等价于`/^a+/g`）匹配，因此匹配失败，返回`null`并且`lastIndex`重置为`0`。

```javascript
const str = 'aaa_aa_a'
const y = /a+_/y

y.exec(str) // ["aaa_"]
y.exec(str) // ["aa_"]
```

&emsp;&emsp;正则表达式是否设置`y`修饰符。

```javascript
const reg = /a/y
reg.sticky // true
```

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125)、[Blog](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~