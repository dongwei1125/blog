# Link

![](/html/label/link/banner.jpg)

&emsp;&emsp;;[link](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/link) 元素用于链接外部`css`样式表等其他相关外部资源。

## link

&emsp;&emsp;其中`link`中包括如下属性。

- `href`：指明外部资源文件的路径，即告诉浏览器外部资源的位置
- `hreflang`：说明外部资源使用的语言
- `media`：说明外部资源用于哪种设备
- `rel`：必填，表明当前文档和外部资源的关系
- `sizes`：指定图标的大小，只对属性`rel="icon"`生效
- `type`：说明外部资源的 [MIME](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/MIME_types) 类型，如`text/css`、`image/x-icon`

## rel

&emsp;&emsp;;`rel`核心属性的参数值如下，也可参考 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Link_types)。

- `alternate`：链接到文档的替代版本
- `archives`：链接到文档集或历史数据
- `author`：提供指向文档作者的链接
- `bookmark`：定义文档在收藏夹中显示的书签图标
- `canonical`：指明网站的规范版本
- `dns-prefetch`：指定浏览器预先执行目标资源的`DNS`解析
- `external`：链接到外部，即告知搜索引擎，此链接不是本站链接
- `first`：链接到集合中的首个文档
- `help`：链接帮助信息
- `icon`：定义网站或网页在浏览器标题栏中的图标
- `license`：链接到文档的版权信息
- `last`：链接到集合中的末个文档
- `nofollow`：指定文档不被搜索引擎跟踪，即某些页面不被爬虫抓取
- `next`：记录文档的下一页（浏览器可以提前加载此页）
- `noreferrer`：可以阻止浏览器发送访问来源信息
- `preload`：对资源进行预加载
- `pingback`：提供处理当前文档的`pingback`服务器地址
- `prefetch`：对资源进行预加载并缓存，通常`preload`用于加载当前页面的资源，而`prefetch`用于加载将来页面可能需要的资源
- `preconnect`：预先连接到目标资源的地址
- `prev`：记录文档的下一页
- `search`：链接到文档的搜索工具
- `stylesheet`：指定作为样式表的外部资源
- `sidebar`：指定浏览器边栏中显示的文档
- `tag`：指定当前文档使用的标签、关键词
- `up`：指向一个文档，此文档提供此网页的上下文关系

## rel 应用

### alternate

&emsp;&emsp;;`alternate`可用于主题样式切换，将`css`作为预备样式，通过对`link`使用`disabled`进行切换。

&emsp;&emsp;其优点是由于浏览器提前把`css`文件预加载好了，网站主题或样式切换时几乎是瞬间的，用户无感知，缺点是只能局限在当前页的`css`切换，很难做到多页的`css`切换。

&emsp;&emsp;如下根目录中包括`index.html`、`foo.css`、`bar.css`。

&emsp;&emsp;注意`title`属性会控制`css`样式文件的加载方式。

- 无`title`属性：`ref=stylesheet`时`css`样式始终都会加载并渲染
- 有`title`属性：`ref=stylesheet`时`css`样式会作为默认样式加载并渲染
- 有`title`属性：`ref=alternate stylesheet`时`css`样式会作为预备样式渲染，默认不加载

```javascript
// index.html
<!DOCTYPE HTML>
<html>

<head>
    <link rel="stylesheet" type="text/css" href="foo.css" title="foo">
    <link rel="alternate stylesheet" type="text/css" href="bar.css" title="bar">
</head>

<body>
    <p>hello world</p>
    <button class="foo">foo</button>
    <button class="bar">bar</button>

    <script>
        var foo = document.querySelector('.foo')
        var bar = document.querySelector('.bar')

        foo.addEventListener("click", toggleTheme)
        bar.addEventListener("click", toggleTheme)

        function toggleTheme() {
            var btnClass = this.getAttribute('class')
            var links = document.querySelectorAll('link')

            links.forEach(link => {
                var linkTitle = link.getAttribute('title')

                link.disabled = true

                if (linkTitle === btnClass) {
                    link.disabled = false
                }
            })
        }
    </script>
</body>

</html>

// foo.css
p {
  color: red;
}

// bar.css
p {
  color: red;
}
```

&emsp;&emsp;对于具有`pc`端和移动端的网页，`alternate`也有利于搜索引擎对于不同设备的用户提供不同类型的页面。

&emsp;&emsp;;`pc`版`head`添加如下，其中`href`为移动端页面地址。

```javascript
<link rel="alternate" media="only screen and (max-width:640px)" href="http://m.xxx.com">
```

&emsp;&emsp;移动端`head`添加如下，`href`为`pc`端页面地址。

```javascript
<link rel="canonical" href="http://xxx.com">
```

### archives

&emsp;&emsp;链接到一个描述历史记录、文档或其他具有历史意义的材料等的集合文档。

```javascript
<link rel="archives" href="https://www.xxx.com">
```

### author

&emsp;&emsp;表明文档作者的链接。

```javascript
<link rel="author" href="http://www.xxx.com">
```

### bookmark

&emsp;&emsp;页面在收藏夹中显示的图标。

```javascript
<link rel="bookmark" href="fav.ico">
```

### canonical

&emsp;&emsp;一个网站很可能有多个不同的网址指向同一个网页，或者在不同网址上有重复网页或非常类似的网页，比较常见的就是为了支持多种设备类型，同一个网页会包含多个用户端。

```javascript
http://www.xxx.com
http://m.www.xxx.com
```

&emsp;&emsp;在搜索引擎同时收录如下三个网站时，由于三个网址的页面内容是相同的，搜索引擎会根据算法自动推荐一个版本的`URL`展示在搜索结果中，而此`URL`很可能不是最希望展现的版本。

```javascript
http://www.xxx.com/index
http://www.xxx.com/index.html
http://www.xxx.com/index.html?id=xxx
```

&emsp;&emsp;按照如下方式指定网页的规范版本，搜索引擎则会把权重集中到规范版本页面，由此提升网页的权重，排名更加靠前。

```javascript
<link rel="canonical" href="http://www.xxx.com/index">
```

### dns-prefetch

&emsp;&emsp;;`DNS Prefetch`是一种`DNS`预解析技术，用户在浏览网页时，浏览器会对网页中的域名进行解析缓存，而在用户单击页面的链接时，就不再进行`DNS`的解析，以此减少用户等待时间，提升用户体验。

&emsp;&emsp;默认情况下浏览器会对页面中和当前网页不在同一个域下的域名进行预解析，并缓存结果，即隐式的`DNS`解析，而对于页面中未出现的域进行预解析，则可通过`link`标签。

&emsp;&emsp;;`link`方式的`DNS`的预解析与页面的加载是并行处理的，不会影响到页面的加载性能。

```javascript
<link rel="dns-prefetch" href="http://www.xxx.com">
```

&emsp;&emsp;注意`dns-prefetch`不能滥用，多页面重复`DNS`预解析会增加重复的`DNS`查询次数。

&emsp;&emsp;如下可禁用隐式的`DNS`预解析。

```javascript
<meta http-equiv="x-dns-prefetch-control" content="off">
```

### external

&emsp;&emsp;链接到外部，告知浏览器，此链接非本站链接。

```javascript
<link rel="external" href="">
```

### first

&emsp;&emsp;链接到集合中的首个文档。

```javascript
<link rel="first" href="">
```

### help

&emsp;&emsp;链接帮助信息。

```javascript
<link rel="help" href="">
```

### icon

&emsp;&emsp;定义网站或网页在浏览器标题栏中的图标。

```javascript
<link rel="icon" href="favicon.ico">
```

### license

&emsp;&emsp;链接到文档的版权信息，即文档的版权声明。

```javascript
<link rel="license" href="">
```

### last

&emsp;&emsp;链接到集合中的末个文档。

```javascript
<link rel="last" href="">
```

### nofollow

&emsp;&emsp;指定页面不被搜索引擎跟踪，或者此页面不被搜索引擎爬取。

```javascript
<link rel="nofollow" href="">
```

&emsp;&emsp;若链接使用该属性，即告知搜索引擎不抓取此链接。

```javascript
<a href="http://www.baidu.com" rel="nofollow"></a>
```

### next

&emsp;&emsp;用于记录文档的下一页，可提示浏览器文章的开始`URL`，且浏览器可提前加载此页。

```javascript
<link rel="start" href="http://www.xxx.com">
```

### noreferrer

&emsp;&emsp;阻止浏览器发送访问来源信息。

```javascript
<link rel="noreferrer" href="">
```

### preload

&emsp;&emsp;在页面渲染之前对资源进行预加载，且不易阻塞页面的初步渲染。

&emsp;&emsp;其中`href`和`as`属性用于指定被加载资源的路径和类型，`as`指定资源的类型后，浏览器可以更加精确地优化资源加载优先级。

&emsp;&emsp;如下预加载了`css`和`js`文件，而在页面的渲染时，一旦需要此资源，则可以立即使用，详细参考 [preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/preload)。

```javascript
<!DOCTYPE HTML>
<html lang="zh-CN">

<head>
    <link rel="preload" href="style.css" as="style">
    <link rel="preload" href="main.js" as="script">

    <link rel="stylesheet" href="style.css">
</head>

<body>
    <p>hello world</p>

    <script src="main.js"></script>
</body>

</html>
```

### pingback

&emsp;&emsp;;`pingback`是博客中用来通知其他文章被引用的一种方式。

&emsp;&emsp;例如用户`A`发布了一篇文章`C`，然后用户`B`书写了一片文章`D`，其中文章`D`中引用了文章`C`的链接，当在用户`B`在发表文章`D`的时候，`WordPress`博客系统就会自动从文章`D`中拣出文章`C`的链接，并且尝试向文章`C`的`pingback`地址发送消息。

&emsp;&emsp;如下声明了网页的`pingback`地址。

```javascript
<link rel="pingback" href="http://www.xxx.com">
```

### prefetch

&emsp;&emsp;对资源进行预加载，一般用于加载非本页的其他页面所需要的资源，以便加快后续页面的首屏渲染速度。资源加载完成后，可以被缓存。

```javascript
<link rel="prefetch" href="">
```

### preconnect

&emsp;&emsp;告知浏览器提前打开与链接网站的连接，其中包括`DNS`预解析、`TLS`协商、`TCP`握手，消除了往返延迟并为用户节省了时间，以便后续可以更快地获取链接内容。

```javascript
<link rel="preconnect" href="">
```

### prev

&emsp;&emsp;用于记录文档的上一页。

```javascript
<link rel="prev" href="">
```

### search

&emsp;&emsp;链接到文档的搜索工具，详细参考 [search](https://developer.mozilla.org/en-US/docs/Web/OpenSearch)。

```javascript
<link rel="search" href="">
```

### stylesheet

&emsp;&emsp;指定作为样式表的外部资源，若未设置`type`，浏览器默认为`text/css`。

```javascript
<link rel="stylesheet" href="style.css">
```

### sidebar

&emsp;&emsp;指定浏览器边栏中显示的文档，`HTML`规范中已删除，仅由`Firefox63`之前的版本实现。

```javascript
<link rel="sidebar" href="">
```

### tag

&emsp;&emsp;指定当前文档使用的标签、关键词。

```javascript
<link rel="tag" href="">
```

### up

&emsp;&emsp;指向一个文档，此文档提供此网页的上下文关系。

```javascript
<link rel="up" href="">
```
