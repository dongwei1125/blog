# A

![](/html/label/a/banner.jpg)

&emsp;&emsp;;[a](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/a) 元素可通过其`href`属性创建指向其他网页、文件、同一页面内的位置或其他`URL`的超链接。

&emsp;&emsp;其基本属性及含义如下。

- `href`：链接目标的`URL`
- `hreflang`：指定目标`URL`的语言
- `rel`：指定当前文档和被链接文档的关系
- `target`：指定打开目标`URL`的方式
- `media`：指定目标`URL`的媒体类型
- `type`：指定目标`URL`的 [MIME](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/MIME_types) 类型
- `download`：指示浏览器下载`URL`

## 链接样式

&emsp;&emsp;在浏览器中`a`标签的默认样式带有下划线，其状态和颜色如下。

- `link`：未访问状态，字体颜色为蓝色
- `visited`：已访问状态，字体颜色为紫色
- `hover`：鼠标悬停状态
- `active`：鼠标点击时状态，字体颜色为红色
- `focus`：聚焦时的状态，可通过`Tab`键聚焦元素，聚焦时会出现边框（不同浏览器样式不一致）

```javascript
<a href="https://www.baidu.com/">百度</a>
```

&emsp;&emsp;可通过伪类自定义不同状态的样式，注意`link`和`visited`必须在最前面，且没有先后顺序，而`focus`、`hover`和`active` 必须在后面，并且一定是`focus`、`hover`、`active`的顺序。

&emsp;&emsp;首先静态时（元素未被聚焦、鼠标点击或悬浮），`a`标签只能为未访问和已访问状态中的一种，进而只会命中`link`和`visited`伪类中的一种，另一种不会生效，因此`link`和`visited`没有先后顺序。

&emsp;&emsp;而在动态时（比如鼠标悬浮），`a`标签此时的样式应该是呈现悬浮的样式，由于伪类的权重都是一样的，因此`hover`伪类的样式必然要位于`link`和`visited`后面，才能覆盖其样式。

&emsp;&emsp;可以通过`Tab`键聚焦`a`标签，聚焦后，若鼠标悬浮在标签上，此时则需要呈现悬浮的样式，因此`hover`位于`focus`后面。

&emsp;&emsp;而在`a`标签被悬浮时，若此时点击鼠标不松开，则此时需要呈现点击的样式，因此`active`位于`hover`后面。

&emsp;&emsp;所以伪类顺序只能为`link`、`visited`、`focus`、`hover`、`active`或者`visited`、`link`、`focus`、`hover`、`active`两种。

```javascript
a:link {
    color: pink;
}

a:visited {
    color: orange;
}

a:focus {
    color: blue;
}

a:hover {
    color: red;
}

a:active {
    color: green;
}
```

## 指定链接打开方式

&emsp;&emsp;;`target`用于指定链接的打开方式，包括如下四种。

- `_self`：当前页面打开链接
- `_blank`：新窗口打开链接
- `_parent`：在当前框架的父框架打开页面
- `_top`：在当前框架的顶层框架打开页面

&emsp;&emsp;如下为`main.html`、`top.html`、`center.html`、`left.html`和`right.html`的页面结构，其中`main.html`通过`iframe`方式引入`top.html`和`center.html`，`center.html`也通过`iframe`方式引入`left.html`和`right.html`。

![](/html/label/a/target.png)

&emsp;&emsp;页面部分代码如下。

```javascript
// main.html
<head>
    <style>
        body {
            width: 1500px;
            margin: 10px auto;
            display: flex;
            flex-direction: column;
        }

        iframe {
            width: 100%;
        }
    </style>
</head>

<body>
    <iframe src="top.html" frameborder="0" height="300px"></iframe>
    <iframe src="center.html" frameborder="0" height="600px"></iframe>
</body>

// top.html
<head>
    <style>
        body {
            width: 100%;
            height: 300px;
            margin: 0;
            background-color: #FF952C;
        }
    </style>
</head>

<body></body>

// center.html
<head>
    <style>
        body {
            height: 600px;
            background-color: #FFCC00;
            display: flex;
            margin: 0;
        }

        iframe {
            height: 500px;
        }
    </style>
</head>

<body>
    <iframe src="left.html" frameborder="0" style="width: 200px;"></iframe>
    <iframe src="right.html" frameborder="0" style="width: 1300px"></iframe>
</body>

// left.html
<head>
    <style>
        body {
            margin: 0;
            width: 100%;
            height: 500px;
            background-color: #02BF0F;
        }
    </style>
</head>

<body></body>

// right.html
<head>
    <style>
        body {
            margin: 0;
            width: 100%;
            height: 500px;
            background-color: #2196F3;
        }
    </style>
</head>

<body>
    <a href="http://www.baidu.com" target="_self"  style="color: #fff;text-decoration: none;">百度</a>
</body>
```

### _self

&emsp;&emsp;修改`right.html`中`a`标签的`target`为`_self`，单击`a`标签。

&emsp;&emsp;可以看到在`right.html`框架中打开了百度，即在自身页面中单击`target`为`_self`属性的链接，将在本页面框架中打开目标页面。

![](/html/label/a/self.gif)

### _parant

&emsp;&emsp;修改`right.html`中`a`标签的`target`为`_parent`，单击`a`标签。

&emsp;&emsp;可以看到在`center.html`框架中打开了百度，即在自身页面中单击`target`为`_parent`属性的链接，将在本页面的父框架中打开目标页面。

![](/html/label/a/parent.gif)

### _top

&emsp;&emsp;修改`right.html`中`a`标签的`target`为`_top`，单击`a`标签。

&emsp;&emsp;可以看到在`main.html`框架中打开了百度，即在自身页面中单击`target`为`_top`属性的链接，将在本页面的顶层框架中打开目标页面。

![](/html/label/a/top.gif)

### _blank

&emsp;&emsp;;`_blank`则是打开一个新标签页显示目标页面。

## 锚点

&emsp;&emsp;页面内跳转，如下将跳转至本页面的`h1`锚点位置。

```javascript
<a href="#h1">a</a>
<h1 id="h1">h1<h1>
```

&emsp;&emsp;跳转至其他页面的指定位置，如下将跳转至`other.html`页面中的`p`锚点位置。

```javascript
<a href="other.html#p">a</a>
```

## 电话

&emsp;&emsp;拨打`10086`。

```javascript
<a href="tel:10086">10086</a>
```

&emsp;&emsp;拨打客服电话`400`。

```javascript
<a href="tel:400-888-8888">400-888-8888</a>
```

## 短信

&emsp;&emsp;发送短信至单个号码。

```javascript
<a href="sms:10086">10086</a>
```

&emsp;&emsp;发送短信至多个号码。

```javascript
<a href="sms:10086,10000">10086,10000</a>
```

&emsp;&emsp;发送短信`DX`到`10086`，注意安卓系统使用`?`连接发送内容，`IOS`系统使用`&`连接发送内容。

&emsp;&emsp;由于不同手机厂商或浏览器厂商对此标准支持度不同，最好还是不带`body`。

```javascript
<a href="sms:10086?body=DX">DX</a>
```

## 邮箱

&emsp;&emsp;发送单个邮箱。

```javascript
<a href="mailto:xxx@email.com">email</a>
```

&emsp;&emsp;发送多个邮箱。

```javascript
<a href="mailto:xxx@email.com; xx@email.com">email</a>
```

&emsp;&emsp;;`mailto`相关参数如下。

- `mailto`：收件人邮箱地址，若有多个收件人邮件地址，用分号`;`隔开
- `cc`：抄送人员邮箱地址，多人使用分号`;`隔开
- `bcc`：密送人员邮箱地址，多人使用分号`;`隔开
- `subject`：邮件主题
- `body`：邮件内容

```javascript
<a href="mailto:xxx@email.com?cc=cc@email.com&bcc=bcc@email.com&subject=subject&body=body">email</a>
```

## 下载文件

&emsp;&emsp;下载图片，其中`href`为图片路径。

```javascript
<a href="./image.png" download>image</a>
```

&emsp;&emsp;下载图片并指定下载名。

```javascript
<a href="./image.png" download="name.png">image</a>
```

&emsp;&emsp;;`download`属性注意事项如下。

- 浏览器不能直接打开的文件（如`txt`、`zip`等），不指定`download`属性也会直接下载
- 浏览器可以直接打开的文件（如`png`、`css`、`js`、`html`等），需指定`download`属性才能下载
- `download`属性值可以不指定后缀名，下载时浏览器会自动补充
- `download`属性值指定了错误的后缀名，文件下载后将无法打开预览

### 同源策略

&emsp;&emsp;由于浏览器的 [同源策略](https://developer.mozilla.org/zh-CN/docs/Web/Security/Same-origin_policy) 限制，若下载的文件与页面不同源，浏览器不会执行下载而是直接打开，更多 [详细参考](http://www.ruanyifeng.com/blog/2016/04/same-origin-policy.html)。

&emsp;&emsp;如下若页面地址为`http://127.0.0.1:3000`，点击`a`标签将不会下载而是在浏览器打开。

```javascript
<a href="https://www.baidu.com/logo.png" download>baidu</a>
```

### data：URLs

&emsp;&emsp;如下使用`data：URLs`的方式下载图片，首先通过`canvas`绘制图片，然后再使用`canvas.toDataURL`获取图片`base64`编码，最后再通过`a`标签完成下载。

```javascript
<a href="javascript:void(0);" onclick="downloadFile(event)" src='https://www.baidu.com/logo.png'>download</a>
<script>
    function downloadFile(e) {
        var url = e.target.getAttribute('src')
        var image = new Image()
        image.setAttribute('crossOrigin', 'anonymous')
        image.src = url
        image.onload = () => {
            var canvas = document.createElement('canvas')
            canvas.width = image.width
            canvas.height = image.height
            var ctx = canvas.getContext('2d')
            ctx.drawImage(image, 0, 0, image.width, image.height)
            var ext = image.src.substring(image.src.lastIndexOf('.') + 1).toLowerCase()
            var name = image.src.substring(image.src.lastIndexOf('/') + 1)
            var dataURL = canvas.toDataURL('image/' + ext)

            var a = document.createElement('a')
            a.href = dataURL
            a.download = name
            a.click()
        }
    }
</script>
```

&emsp;&emsp;注意不设置`crossOrigin`，浏览器将会抛出如下错误。

![](/html/label/a/crossOrigin.png)

&emsp;&emsp;其原因也是浏览器的同源策略导致，`canvas`绘制跨域请求的图片，就会造成画布污染，此时也就不能再调用`toBlob()`、`toDataURL()`和`getImageData()`了。`img`、`form`等支持跨域的标签，请求获取资源时会自动带上`cookie`，如果不做数据读取限制，则`cookie`数据将被上传到图片网站后台进而导致数据泄露。

&emsp;&emsp;因此可以在图片请求发起时增加`crossOrigin="anonymous"`，不携带任何用户信息来获取图片。

### blob：URLs

&emsp;&emsp;如下使用`blob：URLs`的方式下载图片，通过使用`canvas.toBlob`获取到`blob`对象，然后再通过`URL.createObjectURL`获取到`blob`对象的一个内存`URL`，并且一直存储在内存中，直到`document`触发了`unload`事件或者执行`revokeObjectURL`来释放。

```javascript
<a href="javascript:void(0);" onclick="downloadFile(event)" src='https://www.baidu.com/logo.png'>download</a>
<script>
    function downloadFile(e) {
        var url = e.target.getAttribute('src')
        var image = new Image()
        image.setAttribute('crossOrigin', 'anonymous')
        image.src = url
        image.onload = () => {
            var canvas = document.createElement('canvas')
            canvas.width = image.width
            canvas.height = image.height
            var ctx = canvas.getContext('2d')
            ctx.drawImage(image, 0, 0, image.width, image.height)
            var name = image.src.substring(image.src.lastIndexOf('/') + 1)

            canvas.toBlob((blob) => {
                var url = window.URL.createObjectURL(blob)
                var a = document.createElement('a')
                a.href = url
                a.download = name
                a.click()
                a.remove()

                window.URL.revokeObjectURL(url)
            })
        }
    }
</script>
```

### ajax

&emsp;&emsp;上述两种方式只对图片适用，对于`pdf`或者`txt`等则不行。

&emsp;&emsp;可以通过`ajax`方式请求到文件的`blob`数据，再通过`blob：URLs`的方式下载。

&emsp;&emsp;注意`ajax`请求方式会存在跨域问题，需要服务器支持。

```javascript
<a href="javascript:void(0);" onclick="downloadFile(event)" src='http://www.baidu.com/txt.txt'>download</a>
<script>
    function downloadFile(e) {
        var url = e.target.getAttribute('src')
        var name = url.substring(url.lastIndexOf('/') + 1)

        axios.get(url, { responseType: 'blob' }).then(res => {
            var blob = res.data
            var url = URL.createObjectURL(blob)
            var a = document.createElement('a')
            a.href = url
            a.download = name
            a.click()
            a.remove()

            window.URL.revokeObjectURL(url)
        })
    }
</script>
```
