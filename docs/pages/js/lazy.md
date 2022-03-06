# 进行浏览器原生的图片懒加载的几种方式和原理

![](/js/lazy/banner.jpg)

## 前言

&emsp;&emsp;对于图片较多的网站，倘若一次性加载所有图片，一方面由于同时加载的图片较多，页面的`DOM`元素将非常多，会造成页面卡顿性能严重下降，另外服务器的压力也会很大。另一方面若加载了很多图片，而用户浏览的图片仅有几张，将会耗费大量流量，造成浪费。

&emsp;&emsp;而懒加载就是针对此情况做的优化，同时会极大地提升用户体验。一句话总结就是，懒加载即延时加载，当图片要用到的时候再去加载。

## offsetTop

&emsp;&emsp;懒加载的图片一般是固定宽高的，为避免图片较大时拉伸，可运用`object-fit: cover`来裁剪。

```javascript
<style>
  img {
    display: block;
    margin-bottom: 10px;
    width: 100%;
    height: 200px;
    object-fit: cover;
  }

  body {
    margin: 0;
  }
</style>

<img data-src="1.jpg" alt="">
<img data-src="2.jpg" alt="">
<img data-src="3.jpg" alt="">
<img data-src="4.jpg" alt="">
<img data-src="5.jpg" alt="">
<img data-src="6.jpg" alt="">
<img data-src="7.jpg" alt="">
```

&emsp;&emsp;其中`loadImg`用来加载图片`src`属性。

&emsp;&emsp;而滚动条频繁滚动会对浏览器性能有影响，因此封装`debounce`防抖函数来限制触发频率。注意`debounce`内部返回函数不能为箭头函数，会导致函数内`this`指向改变，只有为普通函数，`this`才能指向绑定事件的对象，例如`el.addEventListener(event, fn)`，`fn`内部`this`应指向`el`。

&emsp;&emsp;理论上图片位于视口就可以加载，但是为了提升用户体验，可以在图片距离视口固定距离就开始提前加载，因此全局定义了`offset`偏移变量。

### 滚动条高度

&emsp;&emsp;;`lazyLoad`函数中，`window.innerHeight`为视口高度，`document.documentElement.scrollTop`和`document.body.scrollTop`都是获取滚动条滚动距离，两者差异主要取决于文档是否声明`doctype`。

<table>
  <tr>
    <th>方式</th>
    <th>类型</th>
    <th>Chrome</th>
    <th>Firefox</th>
    <th>IE11</th>
    <th>IE10</th>
    <th>IE9</th>
  </tr>
  <tr>
    <td rowspan="2"><code>HTML</code>文档声明<code>doctype</code></td>
    <td><code>document.documentElement.clientHeight</code></td>
    <td>可获取</td>
    <td>可获取</td>
    <td>可获取</td>
    <td>可获取</td>
    <td>可获取</td>
  </tr>
  <tr>
    <td><code>document.body.scrollTop</code></td>
    <td><code>0</code></td>
    <td><code>0</code></td>
    <td><code>0</code></td>
    <td><code>0</code></td>
    <td><code>0</code></td>
  </tr>
  <tr>
    <td rowspan="2"><code>HTML</code>文档未声明<code>doctype</code></td>
    <td><code>document.documentElement.clientHeight</code></td>
    <td><code>0</code></td>
    <td><code>0</code></td>
    <td>可获取</td>
    <td>可获取</td>
    <td>可获取</td>
  </tr>
  <tr>
    <td><code>document.body.scrollTop</code></td>
    <td>可获取</td>
    <td>可获取</td>
    <td>可获取</td>
    <td>可获取</td>
    <td><code>0</code></td>
  </tr>
</table>
    
&emsp;&emsp;可以明显观察到`document.documentElement.scrollTop`和`document.body.scrollTop`中总有一个可以获取到滚动距离，因此可以`document.documentElement.scrollTop || document.body.scrollTop`来兼容。

```javascript
<script>
  const loadImg = el => {
    if (!el.src) {
      el.src = el.dataset.src
    }
  }

  const debounce = (fn, delay = 100) => {
    var timer = null

    return function (...args) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }

      timer = setTimeout(() => {
        fn.call(this, ...args)
      }, delay)
    }
  }

  const imgs = document.querySelectorAll('img')

  const offset = 20

  var loaded = 0

  const lazyLoad = () => {
    const clientHeight = window.innerHeight
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop

    for (var i = loaded; i < imgs.length; i++) {
      if (imgs[i].offsetTop <= clientHeight + scrollTop + offset) {
        loadImg(imgs[i])
        loaded++
      } else {
        break
      }
    }
  }

  lazyLoad()

  window.addEventListener('scroll', debounce(lazyLoad, 200))
</script>
```

### loaded 变量

&emsp;&emsp;另外全局还定义了`loaded`变量，用来存储图片即将加载的索引，以此避免每次从第一张图片开始遍历。

&emsp;&emsp;;`for`循环体内`if`语句为关键部分，只要图片的`offset`属性小于视口高度、滚动距离与偏移值之和，则必然加载图片。某张图片不满足加载条件，则后续图片必然也不满足，因此`break`提前终止循环。

![](/js/lazy/offsetTop.gif)

## getBoundingClientRect

&emsp;&emsp;;[getBoundingClientRect](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getBoundingClientRect) 用于返回元素的大小及相对于视口的位置。

&emsp;&emsp;浏览器兼容性方面，`Chrome`、`Firefox`和`IE5`及以上浏览器等均兼容。

&emsp;&emsp;标准盒模型，元素的宽高尺寸为`width/height + padding + border-width`总和。若其`CSS`属性为`box-sizing: border-box`，则元素尺寸为`width/height`。

```javascript
#img {
  display: block;
  margin-bottom: 10px;
  width: 300px;
  height: 200px;
  border: 10px solid lightblue;
  padding: 20px;
}

<img id="img" src="image.png" alt="">

const img = document.getElementById('img')
console.log(img.getBoundingClientRect())
```

### 浏览器差异

&emsp;&emsp;;`Chrome`浏览器打印参数。

![](/js/lazy/Chrome.png)

&emsp;&emsp;;`IE8`浏览器打印参数，注意`IE8`及以下浏览器返回的对象中不含`width`、`height`属性。

![](/js/lazy/IE8.png)

&emsp;&emsp;;`IE7`浏览器打印参数，注意`IE7`浏览器中的页面内的`HTML`元素的坐标会从`(2, 2)`开始计算。

![](/js/lazy/IE7.png)

&emsp;&emsp;因此封装为工具函数，兼容`IE7`及以上浏览器。

```javascript
function getBoundingClientRect(el) {
  var rect = el.getBoundingClientRect()
  var l = document.documentElement.clientLeft
  var t = document.documentElement.clientTop

  return {
    left: rect.left - l,
    right: rect.right - l,
    bottom: rect.bottom - t,
    top: rect.top - t,
    width: rect.right - rect.left,
    height: rect.bottom - rect.top,
  }
}
```

&emsp;&emsp;根据此工具函数，针对`offsetTop`方式的懒加载稍作修改。

```javascript
const lazyLoad = () => {
  for (var i = loaded; i < imgs.length; i++) {
    if (getBoundingClientRect(imgs[i]).top <= window.innerHeight + offset) {
      loadImg(imgs[i])
      loaded++
    } else {
      break
    }
  }
}
```

## IntersectionObserver

&emsp;&emsp;;[IntersectionObserver](https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver/IntersectionObserver) 是浏览器提供的构造函数，用于创建一个观察器实例，[详细参考](https://www.ruanyifeng.com/blog/2016/11/intersectionobserver_api.html)。

```javascript
const io = new IntersectionObserver(callback, options)
```

&emsp;&emsp;此实例提供了部分方法。

- `io.observe()`：开始观察，参数为某个`DOM`节点对象
- `io.unobserve()`：取消观察，参数可为`DOM`节点对象，也可不传
- `io.disconnect()`：关闭观察器

&emsp;&emsp;再来看看`callback`回调函数，一般是视窗观察某个或多个元素，且`callback`通常会触发两次，一次是被观察元素刚进入视口时，另一次是被观察元素完全离开视口时。

```javascript
const io = new IntersectionObserver((entries, observer) => { })
```

### IntersectionObserverEntry

&emsp;&emsp;;`observer`为被调用的`IntersectionObserver`实例，即上述`io`实例。

&emsp;&emsp;;`entries`是一个 [IntersectionObserverEntry](https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserverEntry) 对象数组。若视窗观察了`3`个元素，则`entries`数组内就会有`3`个实例，且均是`IntersectionObserverEntry`对象。

&emsp;&emsp;;`Chrome`浏览器下`IntersectionObserverEntry`对象包括`8`个属性。

![](/js/lazy/IntersectionObserverEntry.png)

- `boundingClientRect`：被观察元素的矩形信息，即被观察元素执行`el.getBoundingClientRect()`的返回结果
- `intersectionRect`：被观察元素与视窗（或者根元素）的相交区域的矩形信息
- `intersectionRatio`：相交比例，即`intersectionRect`占`boundingClientRect`面积的比例，被观察元素完全可见时为`1`，完全不可见时为`0`
- `isIntersecting`：被观察元素是否在视窗中可见，可见则为`true`
- `rootBounds`：根元素矩形信息，未指定根元素则为视窗的矩形信息
- `target`：被观察元素，是一个`DOM`节点
- `time`：高精度时间戳，单位为毫秒。表示从`IntersectionObserver`的时间原点到`callback`被触发时两者之间的时间长度

&emsp;&emsp;构造函数`IntersectionObserver`的第二个参数`options`是一个对象，主要包括三个属性。

- `threshold`：即被观察元素在视口中可见部分为多少时，触发回调函数，`threshold`为一个数组，默认为`[0]`

&emsp;&emsp;如下被观察元素有`0%`、`50%`、`75%`、`100%`可见部分时，触发回调函数

```javascript
new IntersectionObserver(callback, {
  threshold: [0, 0.5, 0.75, 1],
})
```

- `root`：除了支持观察视窗内元素，也支持指定根元素

&emsp;&emsp;如下`ul`元素内部多个`li`滚动时，某个`li`出现在`ul`时触发。

```javascript
<style>
  ul {
    width: 300px;
    height: 100px;
    overflow: auto;
  }

  li {
    height: 24px;
    background-color: #ccc;
    margin-bottom: 1px;
  }

  li:nth-of-type(9) {
    background-color: lightblue;
  }
</style>

<ul>
  <li>1</li>
  <li>2</li>
  <li>3</li>
  <li>4</li>
  <li>5</li>
  <li>6</li>
  <li>7</li>
  <li>8</li>
  <li>9</li>
  <li>10</li>
</ul>
<script>
  const ul = document.querySelector('ul')
  const li = document.querySelectorAll('li')[8]
  const callback = entries => {
    console.log(entries)
  }
  const io = new IntersectionObserver(callback, {
    root: ul,
  })

  io.observe(li)
</script>
```

&emsp;&emsp;注意根元素必须为被观察元素的祖先元素。

![](/js/lazy/root.gif)

- `rootMargin`：定义视窗或者根元素的`margin`，用于拓展`rootBounds`区域的大小，默认值为`"0px 0px 0px 0px"`

&emsp;&emsp;如下视窗被拓展为红色区域部分，一般被观察元素仅在视窗中出现（或者出现指定比例）才会触发，若要被观察元素在距离视窗固定距离就提前触发，`rootMargin`则可派上用场了。

![](/js/lazy/rootMargin.png)

### 实现部分

&emsp;&emsp;现在来看图片懒加载的情况，代码比较少，先看代码。

```javascript
<script>
  const loadImg = el => {
    if (!el.src) {
      el.src = el.dataset.src
    }
  }

  const offset = 20

  const imgs = document.querySelectorAll('img')

  const callback = (entries, i) => {
    entries.forEach(el => {
      if (el.isIntersecting) {
        loadImg(el.target)
        io.unobserve(el.target)
      }
    })
  }

  const io = new IntersectionObserver(callback, {
    rootMargin: `0px 0px ${offset}px 0px`,
  })

  imgs.forEach(img => io.observe(img))
</script>
```

&emsp;&emsp;首先创建观察器`io`，由于未指定根元素，所以默认为视窗，然后视窗遍历观察`img`元素。

&emsp;&emsp;还是和`offsetTop`方式一致，距离视口`20px`就提前加载图片。因此添加`rootMargin`配置项。

&emsp;&emsp;;`callback`回调函数部分，元素只要出现在视口，则加载图片，同时`unobserve`取消观察对应的`img`元素。

### 兼容性

&emsp;&emsp;以上对于`Chrome`或者`Firefox`等浏览器是完全可用的，对于`IE9-11`是不兼容的，利用 [intersection-observer-polyfill](https://www.npmjs.com/package/intersection-observer-polyfill) 插件来兼容一波吧。

&emsp;&emsp;注意`IE`浏览器不支持`object-fit`样式，但是不是重点，不过多详述，感兴趣可以自己捣鼓。

```javascript
<script src="IntersectionObserver.js"></script>
<style>
  img {
    display: block;
    margin-bottom: 10px;
    width: 100%;
    height: 200px;
    /* object-fit: cover; */
  }

  body {
    margin: 0;
  }
</style>

<script>
  var loadImg = function (el) {
    if (!el.src) {
      el.src = el.getAttribute('data-src')
    }
  }

  var offset = 20

  var imgs = document.getElementsByClassName('aaa')

  var callback = function (entries, i) {
    entries.forEach(function (el) {
      if (el.isIntersecting || el.intersectionRatio > 0) {
        loadImg(el.target)
        io.unobserve(el.target)
      }
    })
  }

  var io = new IntersectionObserver(callback, {
    rootMargin: '0px 0px ' + offset + 'px 0px',
  })

  for (var i = 0; i < imgs.length; i++) {
    io.observe(imgs[i])
  }
</script>
```

&emsp;&emsp;;`IE9`浏览器下效果。

![](/js/lazy/IE9.gif)

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125) / [Gitee](https://gitee.com/dongwei1125)、[GitHub Pages](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~