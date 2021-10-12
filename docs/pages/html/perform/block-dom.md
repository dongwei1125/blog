# 关于 JS 与 CSS 是否阻塞 DOM 的渲染和解析

![](/html/perform/block-dom/banner.jpg)

&emsp;&emsp;最近系统梳理`HTML5`所有涉及到的标签时，梳理至`<link>`和`<script>`标签时，碰巧想到一个困扰很久的问题，即一般把`<script>`放在`<body>`尾部，`<link>`标签放在`<head>`内部，而页面通过`CDN`引入第三方框架或库时，基本都是将其`<script>`标签放在`<link>`标签前面。

&emsp;&emsp;可能此方式已经成为了约定俗成，但是究竟其好处在哪里，或者说其它的方式为什么不可取，想必你也和我有同样的疑问，那就接着来往下看吧。

## 准备工作

&emsp;&emsp;首先需要做的准备工作是，搭建一个服务器，目的是为了返回`css`样式和`js`脚本，并且让服务器根据传递的参数，固定延时返回数据。

&emsp;&emsp;其目录结构如下，其中`index.js`和`style.css`就是用于返回的数据，`app.js`为服务器启动文件，`index.html`是用来测试案例的文件，剩余文件或文件夹可以忽略。

```javascript
├── static
│   ├── index.js
│   ├── style.css
├── app.js
├── index.html
├── package.json
├── node_modules/
```

&emsp;&emsp;涉及的相关代码也贴一下吧，方便复制调试。有必要说明一下，本地运行`node app.js`启动后，浏览器输入`http://127.0.0.1:3000/`就能访问到`index.html`，而访问`style.css`可以输入`http://127.0.0.1:3000/static/style.css?sleep=3000`，其中`sleep`参数则可自由控制`css`文件延时返回，例如想要文件`5s`后返回就设置`sleep=5000`。

```javascript
// app.js
const express = require('express')
const fs = require('fs')
const app = new express()
const port = 3000

const sleepFun = time => {
    return new Promise(res => {
        setTimeout(() => {
            res()
        }, time)
    })
}

const filter = (req, res, next) => {
    const { sleep } = req.query || 0

    if (sleep) {
        sleepFun(sleep).then(() => next())
    } else {
        next()
    }
}

app.use(filter)

app.use('/static/', express.static('./static/'))

app.get('/', function (req, res, next) {
    fs.readFile('./index.html', 'UTF-8', (err, data) => {
        if (err) return

        res.send(data)
    })
})

app.listen(port, () => {
    console.log(`app is running at http://127.0.0.1:${port}/`)
})

// static/index.js
var p = document.querySelector('p')

console.log(p)

// static/style.css
p {
    color: lightblue;
}
```

&emsp;&emsp;接着就是`index.html`的准备工作，其中`HTML`部分的架子就长下面那样，然后你只需要记住`DOMContentLoaded`事件将在页面`DOM`解析完成后触发。

```javascript
<!DOCTYPE html>
<html lang="zh-CN">

<head>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            var p = document.querySelector('p')

            console.log(p)
        })
    </script>
</head>

<body>
    <p>hello world</p>
</body>

</html>
```

## CSS 不会阻塞 DOM 解析，但是会阻塞 DOM 渲染

&emsp;&emsp;首先在`index.html`插入如下`<link>`标签，然后在浏览器输入`http://127.0.0.1:3000/`访问此页面。

```javascript
<head>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            var p = document.querySelector('p')

            console.log(p)
        })
    </script>
    <link rel="stylesheet" href="./static/style.css?sleep=3000">
</head>

<body>
    <p>hello world</p>
</body>
```

&emsp;&emsp;页面初始显示为空白，控制台打印出了`p`元素，同时浏览器标签页上加载`loading`，`3s`后页面显示出浅蓝色的`hello world`。

![](/html/perform/block-dom/css.gif)

&emsp;&emsp;以上情况也就说明，`CSS`不会阻塞`DOM`的解析，如果说`CSS`阻塞`DOM`解析的话，那么`p`标签不会被解析，进而`DOM`不会被解析完成，`CSS`请求过程中也就不可能会触发`DOMContentLoaded`事件。而且在`css`请求过程中，控制台立即打印出了`p`元素，因此`CSS`不会阻塞`DOM`的解析。

&emsp;&emsp;另一个情况就是，虽然`DOM`很早就被解析完成，但是`p`标签却迟迟没有渲染，原因在于`CSS`样式还未请求完成，在样式获取后`hello world`才被渲染出来，所以说`CSS`会阻塞页面渲染。

&emsp;&emsp;简单阐述一下浏览器的解析渲染过程，解析`DOM`生成`DOM Tree`，解析`CSS`生成`CSSOM Tree`，两者结合生成`render tree`渲染树，最后浏览器根据渲染树渲染至页面。由此可以看出`DOM Tree`的解析和`CSSOM Tree`的解析是互不影响的，两者是并行的。因此`CSS`不会阻塞页面`DOM`的解析，但是由于`render tree`的生成是依赖`DOM Tree`和`CSSOM Tree`的，因此`CSS`必然会阻塞`DOM`的渲染。

&emsp;&emsp;更为严谨一点的说，`CSS`会阻塞`render tree`的生成，进而会阻塞`DOM`的渲染。

## JS 会阻塞 DOM 解析

&emsp;&emsp;为了避免加载`CSS`造成的干扰，如下仅关注`JS`的执行情况，其中`for`循环的循环体中逻辑暂不考虑，仅仅是让`JS`执行更多时间。

```javascript
<head>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            var p = document.querySelector('p')

            console.log(p)
        })
    </script>
</head>

<body>
    <script>
        const p = document.querySelector('p')

        console.log(p)

        for (var i = 0, arr = []; i < 100000000; i++) {
            arr.push(i)
        }
    </script>
    <p>hello world</p>
</body>
```

&emsp;&emsp;浏览器访问页面，初始时为空白且控制台打印`null`，浏览器`loading`短暂延时后，控制台打印出`p`标签同时页面渲染出`hello world`。

![](/html/perform/block-dom/js.gif)

&emsp;&emsp;以上情况很容易说明`JS`会阻塞`DOM`解析了，`JS`执行初控制台打印`null`，因为此时`p`标签还未被解析，`for`循环执行时，可以明显感觉到执行耗时，执行完成`p`标签被解析，此时触发`DOMContentLoaded`事件，控制台打印出`p`标签，同时页面渲染出`hello world`。

&emsp;&emsp;比较合理的解释就是，首先浏览器无法知晓`JS`的具体内容，倘若先解析`DOM`，万一`JS`内部全部删除掉`DOM`，那么浏览器就白忙活了，所以就干脆暂停解析`DOM`，等到`JS`执行完成再继续解析。

## CSS 会阻塞 JS 的执行

&emsp;&emsp;如下在页内`JS`脚本前插入`<link>`标签，并且延时`3s`获取`CSS`样式。

```javascript
<head>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            var p = document.querySelector('p')

            console.log(p)
        })
    </script>
    <link rel="stylesheet" href="./static/style.css?sleep=3000">
    <script src="./static/index.js"></script>
</head>

<body>
    <p>hello world</p>
</body>
```

&emsp;&emsp;初始页面空白，浏览器`loading`加载`3s`后，控制台打印出`null`，紧接着打印出`p`标签，同时页面渲染出浅蓝色`p`标签。

![](/html/perform/block-dom/css-js.gif)

&emsp;&emsp;此情况好像是`CSS`不仅阻塞了`DOM`的解析，并且也阻塞了`DOM`渲染。

&emsp;&emsp;但是首先要思考下是什么阻塞了`DOM`的解析，刚刚已经证明了`CSS`不会阻塞`DOM`的解析，所以只可能是`JS`阻塞了`DOM`解析。但是`JS`只有两行代码，不会阻塞长达`3s`左右的时间。所以只有一个可能就是`CSS`会阻塞`JS`的执行。

&emsp;&emsp;因此输出结果也能大致分析出来了，首先解析到第一个`<script>`标签，`document`绑定上`DOMContentLoaded`事件，紧接着解析到`link`标签，浏览器请求`CSS`样式，由于`CSS`不会阻塞`DOM`解析，因此浏览器继续向下解析，发现第二个`<script>`标签，浏览器请求`JS`脚本，此时`JS`获取完成，但是由于`CSS`还在获取，`JS`需要一直等待其获取完成，所以不能立即执行。

&emsp;&emsp;而第二个`<script>`不能立即执行，导致它后面的`p`标签也没办法解析，原因则是`JS`会阻塞`DOM`解析。只有等待到`CSS`样式获取成功后，此时`JS`立即执行，控制台输出`null`，然后浏览器继续解析到`p`标签，解析完成，`DOMContentLoaded`事件触发，控制台输出`p`标签，最后浅蓝色`hello world`渲染至页面。

&emsp;&emsp;其实这样做也是有道理的，设想`JS`脚本中的内容是获取`DOM`元素的`CSS`样式属性，如果`JS`想要获取到`DOM`最新的正确的样式，势必需要所有的`CSS`加载完成，否则获取的样式可能是错误或者不是最新的。因此要等到`JS`脚本前面的`CSS`加载完成，`JS`才能再执行，并且不管`JS`脚本中是否获取`DOM`元素的样式，浏览器都要这样做。

&emsp;&emsp;回溯文章开头的那个疑问，所以一般将`<script>`放在`<link>`标签前面是有道理的。

## JS 会触发页面渲染

&emsp;&emsp;如下`CSS`采用页内方式，其中颜色名及其`rgb`值分别为浅绿色`lightgreen`（`rgb(144, 238, 144)`）、粉色`pink`（`rgb(255, 192, 203)`）。

```javascript
// index.html
<head>
    <style>
        p {
            color: lightgreen;
        }
    </style>
</head>

<body>
    <p>hello</p>
    <script src="./static/index.js?sleep=2000"></script>
    <p>beautiful</p>
    <style>
        p {
            color: pink;
        }
    </style>
    <script src="./static/index.js?sleep=4000"></script>
    <p>world</p>
    <style>
        p {
            color: lightblue;
        }
    </style>
</body>

// static/index.js
var p = document.querySelector('p')
var style = window.getComputedStyle(p, null)

console.log(style.color)
```

&emsp;&emsp;页面初始渲染出浅绿色`hello`，紧接着`2s`后渲染出粉色`hello beautiful`且控制台打印`rgb(144, 238, 144)`，然后又`2s`后渲染出浅蓝色`hello beautiful world`且控制台打印`rgb(255, 192, 203)`。

![](/html/perform/block-dom/js-draw.gif)

&emsp;&emsp;上述结果大致分析为浏览器首先解析第一个`<style>`标签和`hello`文本的`p`标签，此时继续向下解析发现了第一个`<script>`标签，紧接着触发一次渲染，由于此过程非常快所以页面初始就能看到浅绿色`hello`。

&emsp;&emsp;然后浏览器发出`JS`请求，`2s`后`JS`获取完成立即运行控制台输出`rgb(144, 238, 144)`，`JS`运行完成后浏览器继续向下解析到`beautiful`文本的`p`标签和第二个`<style>`标签，再继续向下解析发现了第二个`<script>`标签，触发一次渲染，这个过程也是非常快，所以可以看到控制台输出结果和渲染粉色`hello beautiful`几乎是同时的。

&emsp;&emsp;解析到第二个`<script>`标签时，浏览器不会发出请求（稍作解释），`2s`后获取到`JS`脚本并执行，控制台输出`rgb(255, 192, 203)`，紧接着浏览器继续向下解析到`world`文本的`p`标签和第三个`<style>`标签，此时`DOM`解析完成，再进行正常的渲染，这个过程也是非常快，所以也能看到控制台输出结果和渲染浅蓝色`hello beautiful world`几乎是同时的。

&emsp;&emsp;现在来解答刚才那个问题，浏览器解析`DOM`时，虽然会一行一行向下解析，但是它会预先加载具有引用标记的外部资源（例如带有`src`标记的`<script>`标签），而在解析到此标签时，则无需再去加载，直接运行，以此提高运行效率。所以就会有上述两个输出结果间隔`2s`的情况，而不是`4s`，因为浏览器预先就一起加载了两个`<script>`脚本，第一个`<script>`脚本加载完成时，第二个`<script>`脚本还剩大概`2s`加载完成。

&emsp;&emsp;而这个结论才是解释为何`CSS`会阻塞`JS`的执行的真正原因，浏览器无法预先知道脚本的具体内容，因此在碰到`<script>`标签时，只好先渲染一次页面，确保`<script>`脚本内能获取到`DOM`的最新的样式。倘若在决定渲染页面时，还有尚未加载完成的`CSS`样式，只能等待其加载完成再去渲染页面。

## Body 内的 CSS

&emsp;&emsp;来看一个较为特殊的情况。

```javascript
<head>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            var p = document.querySelector('p')

            console.log(p)
        })
    </script>
</head>

<body>
    <p>hello</p>
    <link rel="stylesheet" href="./static/style.css?sleep=3000">
    <p>world</p>
</body>
```

&emsp;&emsp;按照上述的所有结论，预先分析一下运行结果，首先浏览器解析`<script>`脚本，`document`上绑定了`DOMContentLoaded`事件，紧接着浏览器继续向下解析，发现了文本为`hello`的`p`标签和`<link>`标签，浏览器发起`CSS`请求，由于`CSS`不会阻塞`DOM`解析，浏览器继续向下解析至文本为`world`的`p`标签，此时页面解析完成，`DOMContentLoaded`事件触发控制台输出`p`标签，`3s`后页面渲染出浅蓝色`hello world`。

&emsp;&emsp;因此初始时页面空白，浏览器`loading`加载`3s`后，控制台打印出`p`标签，同时页面渲染出浅蓝色`hello world`。

&emsp;&emsp;但是实际结果并不是这样，先来看看`Chrome`浏览器下的表现。

![](/html/perform/block-dom/Chrome.gif)

&emsp;&emsp;再来看看`Firefox`浏览器下的表现。

![](/html/perform/block-dom/Firefox.gif)

&emsp;&emsp;接着再来看看`Opera`浏览器下的表现。

![](/html/perform/block-dom/Opera.gif)

&emsp;&emsp;;`IE11`及以下浏览器的表现。

![](/html/perform/block-dom/IE11.gif)

&emsp;&emsp;;`Edge`浏览器下的表现。

![](/html/perform/block-dom/Edge.gif)

&emsp;&emsp;怎么样，蒙了吧，`5`种浏览器`3`种表现形式，并且没有一种表现与预先分析的一致。

&emsp;&emsp;其实造成这种差异的原因，是一种被称为浏览器样式闪烁（[FOUC](https://webkit.org/blog/66/the-fouc-problem/)，`Flash of Unstyled Content`）的现象。

&emsp;&emsp;由于浏览器引擎的架构方式不一致，在浏览器解析到`Body`内的`CSS`的时候，浏览器引擎是可以做出选择的。

&emsp;&emsp;一种选择是它可以在请求`CSS`的时候暂停后续`DOM`的解析，在`CSS`加载完成后再继续往后解析，此情况就会造成`CSS`阻塞`DOM`的解析，导致页面`DOM`解析及其样式渲染推迟，而此表现形式就与`JS`的情况相似。

&emsp;&emsp;另一种选择是它也可以在请求`CSS`的时候继续往后解析，此时`CSS`的加载与`DOM`的解析就是并行的，等到`CSS`加载完成后再更新样式，此情况下部分`DOM`样式就会从默认样式立即跳转到有样式状态，形成样式闪烁。

&emsp;&emsp;此小结不必太过于纠结，只需记住`Body`内的`CSS`会由于浏览器的差异，呈现不同的表现形式，而这种现象一般称为`FOUC`，代码中应当极力避免此种情况发生即可。

## 综上所述

&emsp;&emsp;综合上述所有情况，可以得出如下结论。

- `CSS`不会阻塞`DOM`解析，但是会阻塞`DOM`渲染，严谨一点则是`CSS`会阻塞`render tree`的生成，进而会阻塞`DOM`的渲染
- `JS`会阻塞`DOM`解析
- `CSS`会阻塞`JS`的执行
- 浏览器遇到`<script>`标签且没有`defer`或`async`属性时会触发页面渲染
- `Body`内部的外链`CSS`较为特殊，会形成`FOUC`现象，请慎用
