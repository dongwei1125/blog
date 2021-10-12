# 解析图片的瀑布流（含懒加载）原理，并搭配服务端交互数据

![](/js/waterfall/banner.gif)

&emsp;&emsp;瀑布流是一种很常见的网页图片交互方式，效果可以参考 [花瓣网](https://huaban.com/)。

## 准备工作

&emsp;&emsp;首先来查看一下目录结构，其中`app.js`为服务端启动文件，主要用来提供接口，返回所需的图片数据，`index.html`为瀑布流页面。

```javascript
├── app.js
├── index.html
├── package.json
├── node_modules/
```

&emsp;&emsp;服务端`app.js`利用`express`搭建本地服务器，其中访问`http://127.0.0.1:3000`默认返回瀑布流页面，获取图片接口一般是以`pageNo`和`pageSize`的分页模式，由于仅是提供简单的数据服务，根据请求参数返回图片列表即可，不必太多纠结逻辑，注意图片数量一般有限，假定大于`300`则不再返回数据只返回空数组。

```javascript
// app.js
const express = require("express")
const fs = require("fs")
const app = new express()
const port = 3000

app.get("/", (req, res) => {
  fs.readFile("./index.html", "UTF-8", (err, data) => {
    if (err) return "404 not found"

    res.send(data)
  })
})

app.get("/imgs", (req, res) => {
  const { pageSize, pageNo } = req.query
  const lists = []
  const total = 300

  for (var i = 0; i < pageSize; i++) {
    lists.push("http://127.0.0.1/images/img.png")
  }

  res.send({
    pageNo,
    pageSize,
    total,
    lists: pageNo * pageSize > total ? [] : lists
  })
})

app.listen(port, () => {
  console.log(`app is running at http://127.0.0.1:${port}/`)
})
```

&emsp;&emsp;;`index.html`页面内，为了支持`IE9`及以上浏览器，`Promise`需引入第三方`CDN`，同时页面`ajax`请求需要用到`axios`库，另外页面所有函数均为普通函数，变量声明也仅用`var`，别问为什么，问就是兼容`IE`。

```javascript
<head>
    <meta charset="UTF-8">
    <title>waterfall</title>
    <script src="promise-polyfill.js"></script>
    <script src="axios.js"></script>
</head>
```

&emsp;&emsp;;`CSS`中将`waterfall`块水平居中，内部`item`元素加了阴影，效果上会更加好一点。

```javascript
<style>
    body {
        margin: 0;
        min-width: 600px;
    }

    #waterfall {
        margin: 16px auto;
        position: relative;
    }

    .item {
        width: 230px;
        border-radius: 10px;
        position: absolute;
        box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    }

    #msg {
        font-size: 18px;
        font-weight: bold;
        text-align: center;
        margin: 0;
        height: 80px;
        line-height: 80px;
        color: #3d3d3d;
    }
</style>

<div id="waterfall"></div>
<p id="msg">正在加载中...</p>
```

## 工具函数

&emsp;&emsp;;`js`部分包括很多工具类函数，接下来逐个详述。

### getRandomInt

&emsp;&emsp;;`getRandomInt`函数用于获取指定范围内的随机整数，包括两端的边界值在内。

```javascript
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
```

### getRandomHeight

&emsp;&emsp;;`getRandomHeight`获取随机高度，介于`200`到`500`之间，几百张高度不一致的图片不太好收集，利用随机数模拟即可。

```javascript
function getRandomHeight() {
  return getRandomInt(200, 500) + "px"
}
```

### getRandomColor

&emsp;&emsp;;`getRandomColor`获取随机背景色，包括透明度，介于为`0.1`到`1`之间。

```javascript
function getRandomColor() {
  return "rgba(" + getRandomInt(0, 255) + ", " + getRandomInt(0, 255) + ", " + getRandomInt(0, 255) + ", " + getRandomInt(1, 10) / 10 + ")"
}
```

### createItem

&emsp;&emsp;;`createItem`用于创建`div`元素项，由于图片地址不可用，所以代码中注释了，元素项的高度和背景色根据上述其它工具函数生成。

```javascript
function createItem(src) {
  var div = document.createElement("div")

  // var img = document.createElement('img')
  // img.src = src
  // div.appendChild(img)

  div.className = "item"
  div.style.background = getRandomColor()
  div.style.height = getRandomHeight()

  return div
}
```

### request

&emsp;&emsp;;`request`用户请求获取图片，其中`params`为`pageNo`和`pageSize`。

```javascript
function request(params) {
  return new Promise(function(resolve, reject) {
    axios({
      url: "http://127.0.0.1:3000/imgs",
      params: params
    }).then(function(res) {
      resolve(res.data)
    })
  })
}
```

### debounce

&emsp;&emsp;;`debounce`防抖函数，用于限制触发频率，取个参数列表还把数组原型抬出来了，因为要兼容`IE`。

```javascript
function debounce(fn, delay) {
  delay = delay || 100
  var timer = null

  return function() {
    var args = Array.prototype.slice.apply(arguments)

    if (timer) {
      clearTimeout(timer)
      timer = null
    }

    timer = setTimeout(function() {
      fn.apply(this, args)
    }, delay)
  }
}
```

## 原理部分

&emsp;&emsp;瀑布流内部的元素要形成交错的样式风格，只能通过定位实现，因此外层`waterfall`需要相对定位，内部元素需要绝对定位。

### getCols

&emsp;&emsp;然后再确定页面具体显示几列，其中`width`为元素项宽，`gap`为项与项之间的间隙。其中`n * width + (n - 1) * gap`为多列元素项所占宽度，应默认小于`body`的宽度，但是`body`左右需要留部分间隙，因此默认小于`bodyWidth - margin * 2`。调整等式，再通过`~~`（类似`parseInt`）取整即可。

```javascript
function getCols() {
  // n * width + (n - 1) * gap <= bodyWidth - margin * 2
  return ~~((document.body.offsetWidth - 32 + gap) / (width + gap))
}
```

&emsp;&emsp;瀑布流的最根本原理就是，首行铺满元素后，后续元素均定位在高度最小的列的后面，依次往后定位铺满。因此全局下需要维护`heights`数组，用于存放每一列的当前高度。

![](/js/waterfall/theory.gif)

### getMinIndex

&emsp;&emsp;;`getMinIndex`用于获取`heights`数组中值最小的列的索引。

```javascript
function getMinIndex(array) {
  var min = Math.min.apply(null, array)

  return array.indexOf(min)
}
```

### setWaterFallRect

&emsp;&emsp;注意由于外层`waterfall`块和内层元素定位的原因，内层元素脱离文档流，造成外层高度塌陷了。因此需要根据列数和`heights`共同设置外层元素的宽高。

```javascript
function setWaterFallRect() {
  var wf = document.querySelector("#waterfall")
  var max = Math.max.apply(null, heights)

  wf.style.height = max + "px"
  wf.style.width = width * cols + (cols - 1) * gap + "px"
}
```

### waterfall

&emsp;&emsp;;`waterfall`函数即实现上述功能，首行铺满同时填充高度值到`heights`中，后续的元素需要判断`heights`数组中值最小的索引，计算出`left`和`top`定位值并应用于当前元素。`for`循环结束所有的元素项布局定位完成，此时再更新外层`waterfall`块的宽高。

&emsp;&emsp;注意`for`循环中变量`i`初始值为`loaded`，`loaded`用于对已经完成布局定位的元素计数。因为需要配合懒加载，每次懒加载新增元素时，都只对新增的元素进行布局定位，而之前的元素则不再布局，以此来优化性能。

```javascript
function waterfall() {
  cols = getCols()
  var items = document.querySelectorAll("#waterfall .item")

  for (var i = loaded; i < items.length; i++) {
    var item = items[i]
    var height = item.offsetHeight

    if (i < cols) {
      item.style.top = 0
      item.style.left = i * (width + gap) + "px"
      heights.push(height)
    } else {
      var minIndex = getMinIndex(heights)
      var top = heights[minIndex] + gap

      item.style.top = top + "px"
      item.style.left = minIndex * (width + gap) + "px"
      heights[minIndex] = top + height
    }

    loaded++
  }

  setWaterFallRect()
}
```

## 实现部分

&emsp;&emsp;基础的工具函数和功能函数都已经完成，首先需要初始化整个瀑布流界面，其中`isReq`用作节流阀，后面接入懒加载时，滚动条触发过于频繁，若接口处于请求过程中，则不再请求。

&emsp;&emsp;;`total`用于记录请求的图片总数，每次请求成功分页码加`1`，下次请求则请求下一页的数据。

&emsp;&emsp;;`createDocumentFragment`用于将创建的`DOM`元素加入到文档片中，待所有的`DOM`创建完成并加入到文档片中时，再将文档片一次性插入到`waterfall`块中。

&emsp;&emsp;常规的方式是创建完元素就`append`到`waterfall`中，但是每次插入都会造成页面重排，而由于`createDocumentFragment`存在于内存中，不在`DOM`树中，因此将文档片插入到`waterfall`块中时页面仅仅重排一次。

```javascript
function init() {
  if (isReq) return
  isReq = true

  request(params).then(function(res) {
    var lists = res.lists
    var frag = document.createDocumentFragment()

    total = res.total
    isReq = false
    params.pageNo++

    for (var i = 0; i < lists.length; i++) {
      frag.appendChild(createItem(lists[i]))
    }

    document.querySelector("#waterfall").appendChild(frag)

    waterfall()
  })
}
```

### 懒加载

&emsp;&emsp;;`window`绑定滚动条事件，每次滚动都会触发`lazyLoad`懒加载。

&emsp;&emsp;注意文档未显示的内容高度为`documentHeight - scrollTop - clientHeight`，一般此部分高度小于窗口高度的一半就加载新的数据。

&emsp;&emsp;满足此条件的同时，若完成布局的元素数量`loaded`大于或者等于请求的图片数量`total`，即表示服务端返回的数据已经全部加载完成，不用再请求数据，因此注销滚动条事件。

&emsp;&emsp;为什么此处不用做滚动条防抖呢？原因在于`init`函数做了节流处理，即便是`init`频繁触发，获取图片的请求也最多只会有一个。

```javascript
window.addEventListener("scroll", lazyLoad)

function lazyLoad() {
  var scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  var documentHeight = document.documentElement.scrollHeight
  var clientHeight = window.innerHeight

  // documentHeight - scrollTop - clientHeight < 0.5 * clientHeight
  if (documentHeight - scrollTop < 1.5 * clientHeight) {
    if (loaded >= total) {
      document.querySelector("#msg").innerText = "没有更多了"
      window.removeEventListener("scroll", lazyLoad)
      return
    }

    init()
  }
}
```

### 响应式

&emsp;&emsp;在此基础上再做一个响应式功能，即浏览器窗口宽度改变，动态切换列数。

&emsp;&emsp;窗口宽度改变后，整个页面的元素项需要重新布局，因此`loaded`和`heights`都要重置。

&emsp;&emsp;窗口宽度低于`body`的最小宽度无需重新布局，即无论窗口如何改变，至少显示两列。

```javascript
window.addEventListener("resize", debounce(resize, 50))

function resize() {
  if (document.body.offsetWidth < 600) return

  loaded = 0
  heights = []
  waterfall()
}
```

## 完整代码

&emsp;&emsp;;[axios](http://www.axios-js.com/) 和 [promise-polyfill](https://github.com/taylorhakes/promise-polyfill) 下载本地或`CDN`引入都可。

```javascript
// index.html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>waterfall</title>
    <script src="promise-polyfill.js"></script>
    <script src="axios.js"></script>
    <style>
        body {
            margin: 0;
            min-width: 600px;
        }

        #waterfall {
            margin: 16px auto;
            position: relative;
        }

        .item {
            width: 230px;
            border-radius: 10px;
            position: absolute;
            box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
        }

        #msg {
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            margin: 0;
            height: 80px;
            line-height: 80px;
            color: #3d3d3d;
        }
    </style>
</head>

<body>
    <div id="waterfall"></div>
    <p id="msg">正在加载中...</p>

    <script>
        (function () {
            function getRandomInt(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min
            }

            function getRandomHeight() {
                return getRandomInt(200, 500) + "px"
            }

            function getRandomColor() {
                return "rgba(" + getRandomInt(0, 255) + ", " + getRandomInt(0, 255) + ", " + getRandomInt(0, 255) + ", " + getRandomInt(1, 10) / 10 + ")"
            }

            function createItem(src) {
                var div = document.createElement('div')

                // var img = document.createElement('img')
                // img.src = src
                // div.appendChild(img)

                div.className = 'item'
                div.style.background = getRandomColor()
                div.style.height = getRandomHeight()

                return div
            }

            function request(params) {
                return new Promise(function (resolve, reject) {
                    axios({
                        url: 'http://127.0.0.1:3000/imgs',
                        params: params
                    }).then(function (res) {
                        resolve(res.data)
                    })
                })
            }

            function debounce(fn, delay) {
                delay = delay || 100
                var timer = null

                return function () {
                    var args = Array.prototype.slice.apply(arguments)

                    if (timer) {
                        clearTimeout(timer)
                        timer = null
                    }

                    timer = setTimeout(function () {
                        fn.apply(this, args)
                    }, delay)
                }
            }

            function getCols() {
                // n * width + (n - 1) * gap <= bodyWidth - margin * 2
                return ~~((document.body.offsetWidth - 32 + gap) / (width + gap))
            }

            function getMinIndex(array) {
                var min = Math.min.apply(null, array)

                return array.indexOf(min)
            }

            function setWaterFallRect() {
                var wf = document.querySelector("#waterfall")
                var max = Math.max.apply(null, heights)

                wf.style.height = max + 'px'
                wf.style.width = width * cols + (cols - 1) * gap + 'px'
            }

            function waterfall() {
                cols = getCols()
                var items = document.querySelector("#waterfall .item")

                for (var i = loaded; i < items.length; i++) {
                    var item = items[i]
                    var height = item.offsetHeight

                    if (i < cols) {
                        item.style.top = 0
                        item.style.left = i * (width + gap) + 'px'
                        heights.push(height)
                    } else {
                        var minIndex = getMinIndex(heights)
                        var top = heights[minIndex] + gap

                        item.style.top = top + 'px'
                        item.style.left = minIndex * (width + gap) + 'px'
                        heights[minIndex] = top + height
                    }

                    loaded++
                }

                setWaterFallRect()
            }

            function init() {
                if (isReq) return
                isReq = true

                request(params).then(function (res) {
                    var lists = res.lists
                    var frag = document.createDocumentFragment()

                    total = res.total
                    isReq = false
                    params.pageNo++

                    for (var i = 0; i < lists.length; i++) {
                        frag.appendChild(createItem(lists[i]))
                    }

                    document.querySelector("#waterfall").appendChild(frag)

                    waterfall()
                })
            }

            function lazyLoad() {
                var scrollTop = document.documentElement.scrollTop || document.body.scrollTop
                var documentHeight = document.documentElement.scrollHeight
                var clientHeight = window.innerHeight

                // documentHeight - scrollTop - clientHeight < 0.5 * clientHeight
                if (documentHeight - scrollTop < 1.5 * clientHeight) {
                    if (loaded >= total) {
                        document.querySelector('#msg').innerText = "没有更多了"
                        window.removeEventListener("scroll", lazyLoad)
                        return
                    }

                    init()
                }
            }

            function resize() {
                if (document.body.offsetWidth < 600) return

                loaded = 0
                heights = []
                waterfall()
            }

            var width = 230

            var gap = 16

            var loaded = 0

            var cols = 0

            var params = {
                pageNo: 1,
                pageSize: 20
            }

            var total = 0

            var heights = []

            var isReq = false

            init()

            window.addEventListener("scroll", lazyLoad)

            window.addEventListener('resize', debounce(resize, 50))
        })()
    </script>
</body>

</html>
```

## 效果图

### 懒加载

![](/js/waterfall/lazyload.gif)

### 响应式

![](/js/waterfall/reactive.gif)
