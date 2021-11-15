# Img

![](/html/label/img/banner.jpg)

&emsp;&emsp;;[img](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/img) 用于将图片嵌入文档。

&emsp;&emsp;;`img`是行内单标签元素，同时`img`也是可替换元素（可修改宽高）。

## 可替换元素

&emsp;&emsp;;`HTML`元素可分为可替换元素和不可替换元素，[详细参考](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Replaced_element)。

&emsp;&emsp;绝大多数的`HTML`元素都是不可替换元素，其内容由`DOM`内容决定。例如`<p>hello world</p>`，展示的内容就是文本节点`hello world`。

&emsp;&emsp;而对于可替换元素，其内容则由元素的标签和属性决定。例如`<img>`元素的内容实际是由`src`属性读取的图片的原始宽高来确定的。

&emsp;&emsp;典型的可替换元素有`<iframe>`、`<video>`、`<embed>`、`<img>`。其它元素仅在特定情况下为可替换元素，例如`type="image"`的`input`元素则是可替换元素，其余类型的`input`元素则为不可替换元素。

&emsp;&emsp;可替换元素一般有内在尺寸，所以具有`width`和`height`，因此可以修改，默认显示为图片的原始宽高。

## 属性

### src

&emsp;&emsp;指定嵌入图片的路径。

```javascript
<img src="image.png" alt="">
```

### alt

&emsp;&emsp;指定图像无法显示或用户禁用时的替代文本，就可访问性来说会非常有用。注意`IE7`及以下浏览器，鼠标悬浮至图像上时会显示`alt`属性值。

```javascript
<img src="" alt="橙子">
```

![](/html/label/img/alt.png)

### width

&emsp;&emsp;指定图像的宽度，单位为`px`或者百分比。

### height

&emsp;&emsp;指定图片的高度，单位为`px`或者百分比，[详细参考](https://www.w3school.com.cn/tags/att_img_height-width.asp#height-width)。

&emsp;&emsp;为图片指定`width`和`height`有很多优点，可在页面加载时为图像预留空间。

&emsp;&emsp;通常不指定图片宽高，浏览器在解析时无法知晓图片的尺寸，也就无法为图像保留合适的空间，因此图像加载完成时，页面的布局就会发生变化，造成页面重排。

&emsp;&emsp;而指定图片宽高，浏览器在解析时就预留了位置，图片加载完成时，浏览器则自动调整图片，使其适应此预留空间，避免了页面某些内容的移动。

```javascript
img {
    background: lightblue;
}
...

<div>
    <img src="orange.png" alt="">
    <p>hello world</p>
</div>
<div>
    <img src="orange.png" alt="" width="200px" height="200px" >
    <p>hello world</p>
</div>
```

&emsp;&emsp;如下为两种情况的对比图，视觉体验上也是第二种较好。

![](/html/label/img/height.gif)

&emsp;&emsp;注意虽然指定`width`和`height`有一定的好处，但同时指定`width`和`height`是可能会造成图片拉伸扭曲的。若要图片正常显示，可以使用标准宽高的图片或者利用`CSS`的 [object-fit](https://developer.mozilla.org/zh-CN/docs/Web/CSS/object-fit) 来调整。

&emsp;&emsp;另一个缺点是若用户禁用图片或者图片无法显示时，浏览器还是会把为图像预留的空间以指定的尺寸显示出来，造成页面空间浪费，视觉上显得大而空。

```javascript
<img src="" alt="" width="200px" height="200px">
<p>hello world</p>
```

![](/html/label/img/white.png)

&emsp;&emsp;解决方式则可使用`alt`属性去描述图片信息，此时若图片加载失败，浏览器将只会显示图像图标和`alt`信息。

```javascript
<img src="" alt="橙子" width="200px" height="200px">
<p>hello world</p>
```

![](/html/label/img/fail.png)

### intrinsicsize

&emsp;&emsp;提案属性已无效，用于指定图像加载的大小。

```javascript
<img intrinsicsize="250 x 200" width="" height="" src="image.png">
```

&emsp;&emsp;此提案包含如下三种情况，[详细参考](https://googlechrome.github.io/samples/intrinsic-size/index.html)。

- 未指定`width`和`height`时，图像尺寸由`intrinsicsize`决定
- 指定了`width`时，将按照`intrinsicsize`的长宽比计算出高度
- 指定了`width`和`height`时，`intrinsicsize`仅仅影响`naturalWidth`和`naturalHeight`的值

### srcset

&emsp;&emsp;用于提供多个图像源，以逗号分隔。

&emsp;&emsp;第一种格式为图像`URL`和像素比描述符，若未指定默认为`1x`，针对不同像素比的屏幕显示不同图片。

```javascript
<img srcset="orange.png 1x, apple.png 2x, pear.png 3x">
```

&emsp;&emsp;;`windows`系统显示器默认设备像素比为`1`，因此将呈现`orange.png`。而`iPhone 6`像素比为`2`，因此将呈现`apple.png`。`iPhone 6 Plus`像素比为`3`，将呈现`pear.png`。

&emsp;&emsp;另一种格式为图片`URL`和宽度描述符，通过计算像素比与`sizes`属性值的乘积呈现不同图片。

```javascript
<img srcset="orange.png 100w, apple.png 200w, beer.png 300w" sizes="100px">
```

&emsp;&emsp;;`window`系统下`100*1 = 100w`，将呈现`orange.png`。`iPhone 6`像素比为`2`，`100*2 = 200w`，将呈现 `apple.png`。而`iPhone 6 Plus`像素比为`3`，`100*3 = 300w`，将呈现`pear.png`。

### sizes

&emsp;&emsp;用于指定图像预期尺寸，以逗号分隔，格式为媒体条件和尺寸值。注意当`srcset`使用了宽度描述符`w`时，`sizes`才生效。

```javascript
<img srcset="orange.png 100w" sizes="(max-width: 360px) 340px, 128px">
```

&emsp;&emsp;即当屏幕宽度小于等于`360px`时，`sizes`属性值为`340px`，否则为`128px`。

&emsp;&emsp;关于`sizes`与`srcset`属性更多用法 [详细参考](https://www.zhangxinxu.com/wordpress/2014/10/responsive-images-srcset-size-w-descriptor/)。

### crossorigin

&emsp;&emsp;指定是否为元素启用`CROS`模式，并定义凭据模式，启用`CROS`的图片可在`canvas`元素中重复使用，而不会被污染，[详细参考](a.md#data-urls)。

&emsp;&emsp;;`crossorigin`可用值如下。

- `anonymous`：即匿名的意思，表示执行一个跨域请求且不会携带任何用户信息，仅根据`http`头校验数据是否可用
- `use-credentials`：即使用凭证，表示执行一个跨域请求并携带用户信息，服务端会校验凭证信息并响应，浏览器根据响应信息判断是否采用响应数据

&emsp;&emsp;注意指定`crossorigin`属性请求头中就会有`origin`字段。

&emsp;&emsp;;`anonymous`请求中不会携带用户信息（例如`cookie`），请求头中的`origin`需要与响应头的`access-control-allow-origin`字段值相匹配。

&emsp;&emsp;;`use-credentials`请求中会携带用户信息，而响应头中`access-control-allow-origin`则为具体的域名，不能为通配符`*`。响应头中`access-control-allow-credentials`为`true`，表示允许请求中携带凭证信息。而其它情况，不符合要求，浏览器将不会把响应内容返回。

### ismap

&emsp;&emsp;将图像定义为服务端图像映射。

&emsp;&emsp;当点击服务端图像映射时，会将点击坐标以`URL`查询字符串的形式发送到服务器。

```javascript
<a href="http://127.0.0.1:3000">
    <img src="static/apple.png" alt="" ismap>
</a>
```

&emsp;&emsp;点击坐标值相对于图像的左上角，若`CSS`指定了图片大小，则点击的坐标值也会变化。

&emsp;&emsp;注意只有`img`元素是某个`a`元素的后代，`ismap`属性才生效。

![](/html/label/img/ismap.gif)

### loading

&emsp;&emsp;指定浏览器加载图片的方式。

&emsp;&emsp;属性值包括如下。

- `eager`：立即加载图像
- `lazy`：延迟加载图像，即懒加载，滚动距离和加载策略由浏览器定义，[详细参考](https://www.zhangxinxu.com/wordpress/2019/09/native-img-loading-lazy/)

```javascript
<ul>
    <li>1</li>
    <li>2</li>
    <li>3</li>
    ...
</ul>
<img src="orange.png" alt="" loading='eager'>
<img src="apple.png" alt="" loading='lazy'>
```

![](/html/label/img/loading.gif)

### referrerpolicy

&emsp;&emsp;指定获取图片的请求的`Referrer`策略。

```javascript
<img src="apple.png" alt="" referrerpolicy="unsafe-url">
```

&emsp;&emsp;关于`Referer`和`Referter Policy`，[详细参考](meta.md#referrer)。

![](/html/label/img/referrerpolicy.png)

### usemap

&emsp;&emsp;将图像定义为客户端图像映射，与`map`元素的`id`相关联，建立`img`与`map`之间的关系。

```javascript
<img src="orange.png" usemap="#map">
<map name="map">
    <area coords="0,0,100,100" href="http://www.baidu.com">
    <area coords="100,100,200,200" href="http://www.jd.com">
</map>
```

&emsp;&emsp;可通过`Tab`键高亮`area`区域，[详细参考](html.md#area)。

![](/html/label/img/usemap.png)

### decoding

&emsp;&emsp;提示浏览器此图像的解码方式，属性值包括`sync`（同步解码）、`async`（异步解码）、`auto`（浏览器自主决定解码方式）。

### importance

&emsp;&emsp;指定图片资源下载的优先级，属性值包括`high`（高优先级）、`low`（低优先级）、`auto`（浏览器自主决定优先级）。

## 废弃属性

&emsp;&emsp;注意以下属性`HTML4`已经不推荐使用，`HTML5`中不再支持，但是目前几乎所有浏览器都支持。

### align

&emsp;&emsp;指定图像相对于周围上下文的对齐方式。

&emsp;&emsp;注意不同浏览器和同一版本浏览器的不同版本对`align`的处理方式不一致，如下为`Chrome`浏览器处理方式。

- `left`：左浮动，等价于`float: left`与`vertical-align: top`，注意`float`浮动使元素呈现类似块级元素，而`vertical-align`对行内元素生效，因此`vertical-align: top`实际不生效
- `right`：右浮动，等价于`float: right`与`vertical-align: top`
- `middle`：中央对齐，等价于`vertical-align: -moz-middle-with-baseline`
- `top`：顶部对齐，等价于`vertical-align: top`
- `bottom`：底部对齐，等价于`vertical-align: baseline`

### border

&emsp;&emsp;指定图像周围边框宽度。

&emsp;&emsp;以下等价于`border: 2px solid #000`。

```javascript
<img src="orange.png" border='2'>
```

### hspace

&emsp;&emsp;指定图片左右外边距。

&emsp;&emsp;以下等价于`margin: 0 10px`。

```javascript
<img src="orange.png" hspace='10'>
```

### vspace

&emsp;&emsp;指定图片上下外边距。

&emsp;&emsp;以下等价于`margin: 10 0px`。

```javascript
<img src="orange.png" vspace='10'>
```

### longdesc

&emsp;&emsp;指定图片长描述，属性值为图片描述信息页面的`URL`地址。

&emsp;&emsp;目前`longdesc`属性在`HTML5`有被提及到，但是仍然是移除状态。

```javascript
// index.html
<!DOCTYPE html>
<html lang="en">

<body>
    <img src="orange.png" longdesc='longdesc.html'>
</body>

</html>

// longdesc.html
<!DOCTYPE html>
<html lang="en">

<body>hello world</body>

</html>
```

&emsp;&emsp;;`FireFox`浏览器下右击图片，选择查看描述，将跳转至`longdesc.html`页面。

![](/html/label/img/right.png)

## 跨域图片下载

### crossOrigin

&emsp;&emsp;依赖于`crossOrigin`属性和`canvas`元素实现，[详细参考](a.html#data-urls)。

## 图片加载错误处理

### 占位图

&emsp;&emsp;;`src`源图片加载错误时，替换`src`为占位图。

```javascript
<img src="image.png" onerror=src="placeholder.png">
```

&emsp;&emsp;但是上述方式会有严重缺陷，若占位图加载错误，页面将一直连续请求获取图片。

![](/html/label/img/request.png)

&emsp;&emsp;因此需要在`src`被替换的同时关闭`onerror`事件。

```javascript
<img src="image.jpg" onerror="onerror=null; src='placeholder.png'">
```

&emsp;&emsp;以上虽然关闭了`onerror`事件，但是占位图加载失败，也就没有实际意义了，最好的方式是将占位图以`base64`的方式引入。

```javascript
<img src="image.jpg" onerror="onerror=null; src=placeholder_svg">
<img src="apple.png" alt="">

<script>
    window.placeholder_svg = "data:image/svg+xml,%3Csvg class='icon' viewBox='0 0 1024 1024' xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cpath d='M304.128 456.192c48.64 0 88.064-39.424 88.064-88.064s-39.424-88.064-88.064-88.064-88.064 39.424-88.064 88.064 39.424 88.064 88.064 88.064zm0-116.224c15.36 0 28.16 12.288 28.16 28.16s-12.288 28.16-28.16 28.16-28.16-12.288-28.16-28.16 12.288-28.16 28.16-28.16z' fill='%23e6e6e6'/%3E%3Cpath d='M887.296 159.744H136.704C96.768 159.744 64 192 64 232.448v559.104c0 39.936 32.256 72.704 72.704 72.704h198.144L500.224 688.64l-36.352-222.72 162.304-130.56-61.44 143.872 92.672 214.016-105.472 171.008h335.36C927.232 864.256 960 832 960 791.552V232.448c0-39.936-32.256-72.704-72.704-72.704zm-138.752 71.68v.512H857.6c16.384 0 30.208 13.312 30.208 30.208v399.872L673.28 408.064l75.264-176.64zM304.64 792.064H165.888c-16.384 0-30.208-13.312-30.208-30.208v-9.728l138.752-164.352 104.96 124.416-74.752 79.872zm81.92-355.84l37.376 228.864-.512.512-142.848-169.984c-3.072-3.584-9.216-3.584-12.288 0L135.68 652.8V262.144c0-16.384 13.312-30.208 30.208-30.208h474.624L386.56 436.224zm501.248 325.632c0 16.896-13.312 30.208-29.696 30.208H680.96l57.344-93.184-87.552-202.24 7.168-7.68 229.888 272.896z' fill='%23e6e6e6'/%3E%3C/svg%3E"
</script>
```

![](/html/label/img/base64.png)

### alt 属性

&emsp;&emsp;占位图方式有一个明显的缺点是用户无法知晓图片的具体内容或含义，因此可以在占位图的基础上再配合`alt`属性，[详细参考](https://www.zhangxinxu.com/wordpress/2020/10/css-style-image-load-fail/)。

```javascript
// placeholder.svg
<svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <path d="M304.128 456.192c48.64 0 88.064-39.424 88.064-88.064s-39.424-88.064-88.064-88.064-88.064 39.424-88.064 88.064 39.424 88.064 88.064 88.064zm0-116.224c15.36 0 28.16 12.288 28.16 28.16s-12.288 28.16-28.16 28.16-28.16-12.288-28.16-28.16 12.288-28.16 28.16-28.16z" fill="#e6e6e6"/><path d="M887.296 159.744H136.704C96.768 159.744 64 192 64 232.448v559.104c0 39.936 32.256 72.704 72.704 72.704h198.144L500.224 688.64l-36.352-222.72 162.304-130.56-61.44 143.872 92.672 214.016-105.472 171.008h335.36C927.232 864.256 960 832 960 791.552V232.448c0-39.936-32.256-72.704-72.704-72.704zm-138.752 71.68v.512H857.6c16.384 0 30.208 13.312 30.208 30.208v399.872L673.28 408.064l75.264-176.64zM304.64 792.064H165.888c-16.384 0-30.208-13.312-30.208-30.208v-9.728l138.752-164.352 104.96 124.416-74.752 79.872zm81.92-355.84l37.376 228.864-.512.512-142.848-169.984c-3.072-3.584-9.216-3.584-12.288 0L135.68 652.8V262.144c0-16.384 13.312-30.208 30.208-30.208h474.624L386.56 436.224zm501.248 325.632c0 16.896-13.312 30.208-29.696 30.208H680.96l57.344-93.184-87.552-202.24 7.168-7.68 229.888 272.896z" fill="#e6e6e6"/>
</svg>

// index.html
<style>
    img {
        display: inline-block;
        width: 200px;
        height: 200px;
        position: relative;
    }

    img.error::before {
        content: '';
        background: #f5f5f5 url(placeholder.svg) no-repeat center / 50% 50%;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
    }

    img.error::after {
        content: attr(alt);
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 24px;
        background-color: rgba(0, 0, 0, .5);
        text-align: center;
        color: #fff;
    }
</style>

<img src="image.jpg" onerror="classList.add('error')" alt="橙子">
<img src="apple.png" alt="">
```

&emsp;&emsp;来看一下最终效果。

![](/html/label/img/placeholder.png)

## 图片懒加载

### offsetTop

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

&emsp;&emsp;;`lazyLoad`函数中，`window.innerHeight`为视口高度，`document.documentElement.scrollTop`和`document.body.scrollTop`都是获取滚动条滚动距离，两者差异主要取决于文档是否声明`doctype`。

<table>
        <tr>
            <th>方式</th>
            <th>类型</th>
            <th>Chrome</th>
            <th>FireFox</th>
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

&emsp;&emsp;另外全局还定义了`loaded`变量，用来存储图片即将加载的索引，以此避免每次从第一张图片开始遍历。

&emsp;&emsp;;`for`循环体内`if`语句为关键部分，只要图片的`offset`属性小于视口高度、滚动距离与偏移值之和，则必然加载图片。某张图片不满足加载条件，则后续图片必然也不满足，因此`break`提前终止循环。

![](/html/label/img/offsetTop.gif)

### getBoundingClientRect

&emsp;&emsp;;[getBoundingClientRect](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getBoundingClientRect) 用于返回元素的大小及相对于视口的位置。

&emsp;&emsp;浏览器兼容性方面，`Chrome`、`FireFox`和`IE5`及以上浏览器等均兼容。

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

&emsp;&emsp;;`Chrome`浏览器打印参数。

![](/html/label/img/Chrome.png)

&emsp;&emsp;;`IE8`浏览器打印参数，注意`IE8`及以下浏览器返回的对象中不含`width`、`height`属性。

![](/html/label/img/IE8.png)

&emsp;&emsp;;`IE7`浏览器打印参数，注意`IE7`浏览器中的页面内的`HTML`元素的坐标会从`(2, 2)`开始计算。

![](/html/label/img/IE7.png)

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
    height: rect.bottom - rect.top
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

### IntersectionObserver

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

&emsp;&emsp;;`observer`为被调用的`IntersectionObserver`实例，即上述`io`实例。

&emsp;&emsp;;`entries`是一个 [IntersectionObserverEntry](https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserverEntry) 对象数组。若视窗观察了`3`个元素，则`entries`数组内就会有`3`个实例，且均是`IntersectionObserverEntry`对象。

&emsp;&emsp;;`Chrome`浏览器下`IntersectionObserverEntry`对象包括`8`个属性。

![](/html/label/img/IntersectionObserverEntry.png)

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
  threshold: [0, 0.5, 0.75, 1]
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
    const callback = (entries)=>{
        console.log(entries)
    }
    const io = new IntersectionObserver(callback, {
        root: ul
    })

    io.observe(li)
</script>
```

&emsp;&emsp;注意根元素必须为被观察元素的祖先元素。

![](/html/label/img/root.gif)

- `rootMargin`：定义视窗或者根元素的`margin`，用于拓展`rootBounds`区域的大小，默认值为`"0px 0px 0px 0px"`

&emsp;&emsp;如下视窗被拓展为红色区域部分，一般被观察元素仅在视窗中出现（或者出现指定比例）才会触发，若要被观察元素在距离视窗固定距离就提前触发，`rootMargin`则可派上用场了。

![](/html/label/img/rootMargin.png)

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
        rootMargin: `0px 0px ${offset}px 0px`
    })

    imgs.forEach(img => io.observe(img))
</script>
```

&emsp;&emsp;首先创建观察器`io`，由于未指定根元素，所以默认为视窗，然后视窗遍历观察`img`元素。

&emsp;&emsp;还是和`offsetTop`方式一致，距离视口`20px`就提前加载图片。因此添加`rootMargin`配置项。

&emsp;&emsp;;`callback`回调函数部分，元素只要出现在视口，则加载图片，同时`unobserve`取消观察对应的`img`元素。

&emsp;&emsp;以上对于`Chrome`或者`FireFox`等浏览器是完全可用的，对于`IE9-11`是不兼容的，利用 [intersection-observer-polyfill](https://www.npmjs.com/package/intersection-observer-polyfill) 插件来兼容一波吧。

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
        rootMargin: "0px 0px " + offset + "px 0px"
    })

    for (var i = 0; i < imgs.length; i++) {
        io.observe(imgs[i])
    }
</script>
```

&emsp;&emsp;;`IE9`浏览器下效果。

![](/html/label/img/IE9.gif)

## 瀑布流

&emsp;&emsp;;[解析图片的瀑布流（含懒加载）原理，并搭配服务端交互数据](/pages/js/waterfall.md)

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125)、[Blog](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~