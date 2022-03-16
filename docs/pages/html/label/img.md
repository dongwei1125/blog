# Img

![](/html/label/img/banner.jpg)

## 概述

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
  <img src="orange.png" alt="" width="200px" height="200px">
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

&emsp;&emsp;指定是否为元素启用`CROS`模式，并定义凭据模式，启用`CROS`的图片可在`canvas`元素中重复使用，而不会被污染。

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

&emsp;&emsp;可通过`Tab`键高亮`area`区域。

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

&emsp;&emsp;;`Firefox`浏览器下右击图片，选择查看描述，将跳转至`longdesc.html`页面。

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

&emsp;&emsp;;[进行浏览器原生的图片懒加载的几种方式和原理](/pages/js/lazy.md)

## 瀑布流

&emsp;&emsp;;[解析图片的瀑布流（含懒加载）原理，并搭配服务端交互数据](/pages/js/waterfall.md)

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125) / [Gitee](https://gitee.com/dongwei1125)、[GitHub Pages](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~