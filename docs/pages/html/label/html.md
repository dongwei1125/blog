# HTML5 标签汇总

![](/html/label/html/banner.jpg)

## 文档结构

&emsp;&emsp;;`html`页面的基本结构如下，其中`head`为页面的头部信息，`body`为页面的主体信息。

```javascript
<!DOCTYPE html>
<html lang="zh-CN">

<head></head>

<body></body>

</html>
```

### 文档元素

#### DOCTYPE

&emsp;&emsp;;[DOCTYPE](https://developer.mozilla.org/zh-CN/docs/Glossary/Doctype) 即文档类型（`document type`），用于声明当前文档类型，告知浏览器使用哪种`HTML`版本（`<!DOCTYPE html>`表示`html 5`版本）渲染页面。

&emsp;&emsp;;`DOCTYPE`不是`HTML`标签，没有结束标签，对大小写不敏感，并且必须位于`HTML`文档的首行。

```javascript
<!DOCTYPE html>
```

#### html

&emsp;&emsp;;[html](https://developer.mozilla.org/zh-CN/docs/Glossary/HTML) 为文档的根元素，指明了文档的开始点和结束点，其中的所有元素都是`html`元素的后代。

```javascript
<html lang="fr"></html>
```

&emsp;&emsp;;`lang`属性可用于设置网页的语言种类，同时触发浏览器不同语言翻译。包括`en`（英语）、`fr`（法语）、`zh-CN`（中文）等。

![](/html/label/html/lang.png)

#### head

&emsp;&emsp;;[head](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/head) 元素规定了文档的配置信息（元数据），包括文档标题、引用的样式和脚本等。

&emsp;&emsp;可用于`head`元素内的有`<title>`、`<base>`、`<link>`、`<style>`、`<meta>`、`<script>`、`<noscript>`。

&emsp;&emsp;若文档中忽略了`<head>`标签，绝大多数浏览器会自动创建`<head>`元素。

```javascript
<head></head>
```

#### body

&emsp;&emsp;文档的所有内容都在 [body](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/body) 元素中。

```javascript
<body></body>
```

### 元数据元素

&emsp;&emsp;元数据元素用来提供关于`HTML`文档的信息，其自身并不是文档内容，元数据元素均放在`<head>`标签中。

#### title

&emsp;&emsp;;[title](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/title) 元素定义文档的标题，显示在浏览器的标题或标签页上。

&emsp;&emsp;;`<title>`中应只包含文本，若其中包含有其他标签，浏览器不会解析对应的元素，而是显示为文本。

&emsp;&emsp;;`<title>`是`<head>`标签中唯一要求包含的元素。

&emsp;&emsp;注意良好的`title`标题更有助于搜索引擎优化（`SEO`）。

```javascript
<title>hello world</title>
```

#### base

&emsp;&emsp;;[base](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/base) 元素用来指定文档中的所有相对`URL`的根`URL`。

&emsp;&emsp;;`<a>`、`<img>`、`<link>`、`<video>`、`<audio>`、`<form>`等标签的相对`URL`都会与根`URL`拼接，注意若标签的`URL`为绝对`URL`，则不会发生拼接。`style`标签内的元素样式`background-image: url() `也会发生拼接。

&emsp;&emsp;如果指定了多个`<base>`元素，只会使用第一个`href`和`target`值, 其余都会被忽略。

```javascript
<base href="" target="">
```

&emsp;&emsp;一般标签的`URL`情况如下（以`link`标签的`URL`为例），当前`html`文件地址为`http://127.0.0.1:5500/dist/index.html`。

 - 不指定根`URL`，`link`标签`URL`为`http://127.0.0.1:5500/dist/style.css`

```javascript
<head>
  <link rel="stylesheet" href="style.css">
</head>
```

 - 指定根`URL`为绝对`URL`，`link`标签`URL`为`http://www.baidu.com/style.css`

```javascript
<head>
  <base href="http://www.baidu.com">
  <link rel="stylesheet" href="style.css">
</head>
```

 - 指定根`URL`为相对`URL`，`link`标签`URL`为`http://127.0.0.1:5500/dist/css/style.css`。注意`<base>`的相对`URL`需要添加`/`，否则不会生效，结果与不指定根`URL`一致

```javascript
<head>
  <base href="css/">
  <link rel="stylesheet" href="style.css">
</head>
```

&emsp;&emsp;;`base`元素的`target`属性（可选）用来设置页面中链接的打开方式，包括`_blank`（新窗口打开）、`_self`（当前窗口打开） 等，[详细参考](a.html#指定链接打开方式)。

#### meta

&emsp;&emsp;;[Meta](meta.md)

#### style

&emsp;&emsp;;[style](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/style) 元素用来定义`HTML`文档内嵌的`CSS`样式。其中属性包括`type`、`media`等，`type`以 [MIME](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/MIME_types) 类型定义样式语言，若未指定此属性，则默认为`text/css`，`media`指定样式适用于哪个媒体。

&emsp;&emsp;其中`css`媒体属性如下。

 - `screen`：计算机屏幕（默认值）
 - `tty`：电传打字机以及使用等宽字符网格的类似媒介
 - `tv`：电视类型设备（低分辨率、有限的屏幕翻滚能力）
 - `projection`：放映机
 - `handheld`：手持设备（小屏幕、有限的带宽）
 - `print`：打印预览模式 / 打印页
 - `braille`：盲人用点字法反馈设备
 - `aural`：语音合成器
 - `all`：适合所有设备
 
&emsp;&emsp;如下为浏览器窗口宽度`300px ≤ width < 500px`、`500px ≤ width < 700px`、打印预览模式中不同情况的样式。

```javascript
<style media="screen and (min-width: 300px) and (max-width: 500px)">
  p {
    color: blue;
  }
</style>
<style media="screen and (min-width: 500px) and (max-width: 700px)">
  p {
    color: red;
  }
</style>
<style media="print">
  p {
    color: yellow;
  }
</style>
```

#### link

&emsp;&emsp;;[Link](link.md)

#### script

&emsp;&emsp;;[Script](script.md)

#### noscript

&emsp;&emsp;在浏览器不支持`JavaScript`或者浏览器禁用了`JavaScript`时，显示`noscript`标签的内容。

&emsp;&emsp;;[noscript](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/noscript) 是`html`中比较早期的标签，其目的是为了帮助早期浏览器的升级过渡的，早期浏览器并不能支持`JavaScript`，而`noscript`标签可作为`JavaScript`不可用时的替代方案。

&emsp;&emsp;注意不同浏览器禁用`JavaScript`的方式不同，其中谷歌浏览器地址栏可以输入`chrome://settings/content/javascript`跳转至设置页面，火狐浏览器地址栏输入`about:config`后，点击接受风险并继续进入设置页面，接着搜索`javascript.enabled`即可。

&emsp;&emsp;浏览器在不支持脚本时，页面跳转到替代页。

```javascript
<!DOCTYPE html>
<html lang="zh-CN">

<head>
  <style>
    p {
      color: lightblue;
    }
  </style>
</head>

<body>
  <noscript>
    <p>We're sorry, but this page doesn't work properly without JavaScript enabled.</p>
    <meta http-equiv="refresh" content="1; https://www.baidu.com">
  </noscript>
</body>

</html>
```

&emsp;&emsp;也可以显示当前页面，但是部分元素显示对脚本启用和禁用的不同样式风格。

```javascript
<!DOCTYPE html>
<html lang="zh-CN" class="noscript">

<head>
  <script>
    const html = document.querySelector('html')
    html.classList.remove('noscript')
  </script>
  <style>
    p {
      color: lightblue;
    }

    .noscript p {
      color: lightgray;
    }
  </style>
</head>

<body>
  <p>hello world</p>
  <noscript>
    <p>We're sorry, but this page doesn't work properly without JavaScript enabled.</p>
  </noscript>
</body>

</html>
```

## 文档内容

### 文本

#### blockquote

&emsp;&emsp;;[blockquote](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/blockquote) 用于引用长文本。

&emsp;&emsp;;`block`是块级双标签，其中引用的文本内容会在左右两端缩进，增加`40px`的外边距。

&emsp;&emsp;其主要属性为`cite`，用于标记引用的信息的地址来源。

```javascript
<blockquote cite="https://www.baidu.com">
  This is a text from Baidu.
</blockquote>
```

#### dl dt dd

&emsp;&emsp;;[dl](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/dl) 用于定义列表，其中列表项包含标题（[dt](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/dt)）和描述（[dd](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/dd)）。

&emsp;&emsp;;`dl`是块级双标签，`dt`和`dd`仅能作为`dl`的子元素，绝大多数浏览器都支持。

##### 单个标题和描述

&emsp;&emsp;;`dl`中`dd`和`dt`一般为单个`dt`搭配单个`dd`，形成一个标题描述组。

```javascript
<dl>
  <dt>HTML</dt>
  <dd>HyperText Markup Language</dd>
  <dt>CSS</dt>
  <dd>Cascading Style Sheets</dd>
  <dt>ECMA</dt>
  <dd>European Computer Manufacturers Association</dd>
</dl>
```

&emsp;&emsp;;`dd`默认包含左外边距，不同浏览器的大小值有所差异。

![](/html/label/html/dd.png)

&emsp;&emsp;上述`dt`后接`dd`的结构显得冗余，单个组别的语义不是非常明显，并且作用于单个组别的`CSS`样式也不好描述，更好的方式是用`div`包装单个组别。

```javascript
<dl>
  <div>
    <dt>HTML</dt>
    <dd>HyperText Markup Language</dd>
  </div>
  <div>
    <dt>CSS</dt>
    <dd>Cascading Style Sheets</dd>
  </div>
  <div>
    <dt>ECMA</dt>
    <dd>European Computer Manufacturers Association</dd>
  </div>
</dl>
```

&emsp;&emsp;京东首页采用的就是单个`dt`与单个`dd`的形式。

```javascript
<dl>
  <dt>功能箱包</dt>
  <dd>
    <a href="">拉杆箱</a>
    <a href="">拉杆包</a>
    ...
  </dd>
</dl>
<dl>
  <dt>奢侈品</dt>
  <dd>
    <a href="">箱包</a>
    ...
  </dd>
</dl>
```

![](/html/label/html/jd.png)

##### 单标题多描述

&emsp;&emsp;也可采用单个`dt`对应多个`dd`的形式。

```javascript
<dl>
  <dt>HTML</dt>
  <dd>HyperText Markup Language</dd>
  <dd>HTML is not a programming language. </dd>
  <dd>It is a markup language that tells web browsers how to structure the web pages you visit.</dd>
</dl>
```

![](/html/label/html/dt-mul-dd.png)

##### 多标题多描述

&emsp;&emsp;多个标题对应多个描述。

```javascript
<dl>
  <dt>HTML</dt>
  <dt>HTML5</dt>
  <dd>HyperText Markup Language</dd>
  <dd>HTML is not a programming language. </dd>
  <dd>It is a markup language that tells web browsers how to structure the web pages you visit.</dd>
</dl>
```

![](/html/label/html/mul-dt-dd.png)

#### div

&emsp;&emsp;;[div](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/div) 用于结构上划分内容，没有具体语义。

&emsp;&emsp;;`div`是块级双标签元素。

```javascript
div {
  width: 200px;
  background: lightblue;
}

<div align="right">hello world</div>
```

&emsp;&emsp;属性包括`align`，绝大多数浏览器支持，但是已废弃，最好还是使用`CSS`。

![](/html/label/html/div.png)

#### figure figcaption

&emsp;&emsp;;[Figure Figcaption](figure-figcaption.md)

#### hr

&emsp;&emsp;;[hr](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/hr) 用于呈现一条水平线。

&emsp;&emsp;;`hr`是块级单标签元素，早期版本中表示水平线，现在则被定义为语义上段落的转换。

&emsp;&emsp;主要属性如下，注意`hr`标签属性在`HTML4`中被废弃，`HTML5`中则不再支持，出于兼容性考虑，目前绝大多数浏览器仍然支持。

 - `align`：水平线对齐方式，包括`left`（左对齐）、`center`（居中对齐）、`right`（右对齐）
 - `color`：指定水平线颜色，可指定`hex`或颜色名称
 - `noshade`：规定水平线颜色为纯色，而不是有阴影的颜色

```javascript
<div>
  <span>无阴影</span>
  <hr noshade>
  <span>CSS 无阴影</span>
  <hr style="background-color: #808080;">
  <span>有阴影</span>
  <hr>
</div>
```

![](/html/label/html/hr.png)

 - `size`：指定水平线高度，值为`px`或数值
 - `width`：指定水平线宽度，值为`px`、数值或百分比
 
&emsp;&emsp;借助伪元素和`HTML`元素自定义属性，可实现多种分割线效果，[详细参考](https://www.zhangxinxu.com/wordpress/2021/05/css-html-hr/)。

### 行内文本

#### a

&emsp;&emsp;;[A](a.md)

#### abbr

&emsp;&emsp;;[abbr](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/abbr) 用于表示缩写词或者缩略词，是单词`abbreviation`的缩写。

&emsp;&emsp;;`title`属性包含缩写词的完整描述，一般鼠标悬浮时会显示。

&emsp;&emsp;;`abbr`是一个双标签的行内元素，其默认样式在不同浏览器存在差别。

 - `IE`等浏览器：与`span`元素样式一致
 - `Firefox`、`Chrome`等浏览器：元素添加点状下划线
 - 其他浏览器：元素添加点状下划线和大小写字母的样式

```javascript
<span>hello <abbr title="Hyper Text Markup Language">HTML</abbr></span>
```

&emsp;&emsp;如下为`abbr`在`Crome`中的样式呈现。

![](/html/label/html/abbr.png)

#### b

&emsp;&emsp;;[b](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/b) 标签一般在没有其他合适的元素时使用。

&emsp;&emsp;;`HTML4`之前`b`标签用于加粗文本，但是`HTML4`之后不再推荐标签带有样式信息。若不是出于语义目的使用`b`标签，最好还是通过`CSS`的方式去呈现。

&emsp;&emsp;其它加粗标签中`strong`标签表示某些语义上的重要信息，`em`则表示强调文本，`mark`用于高亮文本。

```javascript
<b>hello world</b>
```

#### bdi

&emsp;&emsp;;[bdi](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/bdi) 标签用于与其它文本内容隔离开。

&emsp;&emsp;;`bdi`是`HTML5`新增的行内双标签。

```javascript
<ul>
  <li><span class="title">Evil Steven</span>: 1st place</li>
  <li><span class="title">François fatale</span>: 2nd place</li>
  <li><span class="title">تیز سمی</span>: 3rd place</li>
</ul>
```

&emsp;&emsp;浏览器下查看元素，其中的阿拉伯名字导致浏览器的文字方向算法将数字`3`显示在名字之前了。

![](/html/label/html/bdi.png)

&emsp;&emsp;解决此情况则可以用`bdi`元素，将阿拉伯名字与其它文本隔离开来。

```javascript
<ul>
  <li><span class="title">Evil Steven</span>: 1st place</li>
  <li><span class="title">François fatale</span>: 2nd place</li>
  <li><bdi class="title">تیز سمی</bdi>: 3rd place</li>
</ul>
```

&emsp;&emsp;浏览器呈现如下。

![](/html/label/html/bdi-style.png)

#### bdo

&emsp;&emsp;;[bdo](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/bdo) 用于改变文本的方向性。

&emsp;&emsp;其主要属性为 `dir`，包括`ltf`（文本由左至右方向）、`rtl`（文本由右至左方向）。

&emsp;&emsp;;`bdo`也是`HTML5`新增的行内双标签。

```javascript
<p>hello <bdo dir="ltr">bdo</bdo> element</p>
<p>hello <bdo dir="rtl">bdo</bdo> element</p>
<p>hello <bdo dir="rtl">bdo</bdo> 11 element</p>
```

&emsp;&emsp;注意若`bdo`标签后面是数字时，数字将会和`bdo`标签的文本按照`dir`属性设置的方向显示。

![](/html/label/html/bdo.png)

#### br

&emsp;&emsp;;[br](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/br) 用于在文档中生成换行。

&emsp;&emsp;;`br`是行内单标签元素，注意`br`元素的换行一般是自身内容的换行，例如`span`元素内容过长在浏览器中自动换行。而一般段落换行是通过增加其他元素的方式。

#### cite

&emsp;&emsp;;[cite](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/cite) 用于引用作品（散文、音乐、网页等）。

&emsp;&emsp;;`cite`元素是行内双标签，其中文本为斜体效果，`cite`一般是用来引用作品本身，并不是引用内容。若要引用作品的部分内容，可以使用`blockquote`或者`q`元素。

&emsp;&emsp;若引用的作品有`URL`可访问，还应当将其包含在`a`标签中，并且将`href`指向此`URL`。

```javascript
<p>The <a href="https://developer.mozilla.org/zh-CN/"><cite>MDN</cite></a> Web Docs site provides information about Open Web technologies.</p>
```

&emsp;&emsp;如下`cite`元素中文本为斜体，其中字体颜色和下划线是`a`标签的样式。

![](/html/label/html/cite.png)

#### code

&emsp;&emsp;;[code](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/code) 用于呈现一段代码。

&emsp;&emsp;;`code`是行内双标签，其中文本默认显示的是等宽字体。

```javascript
<p>console.log("hello world")</p>
<code>console.log("hello world")</code>
```

&emsp;&emsp;浏览器呈现样式如下。

![](/html/label/html/code.png)

#### data

&emsp;&emsp;;[data](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/data) 用于将内容与机器可读的信息关联。

&emsp;&emsp;;`data`是行内双标签，绝大多数浏览器支持，`IE8`及以下浏览器不支持。

&emsp;&emsp;;`value`属性值为提供给机器识别的信息，`data`元素内为用户可见的信息。

```javascript
<ul>
  <li><data value="1">HTML</data></li>
  <li><data value="2">CSS</data></li>
  <li><data value="3">JavaScript</data></li>
</ul>
```

&emsp;&emsp;浏览器呈现如下。

![](/html/label/html/data.png)

#### del

&emsp;&emsp;;[del](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/del) 用于标识一些从文档中删除的文本。

&emsp;&emsp;;`del`为行内双标签，其默认样式会在文本上显示删除线。属性包括`cite`和`datetime`，`cite`为`URL`，用于解释文本被删除的原因，`datetime`为特定时间格式，用于说明删除的日期时间。

&emsp;&emsp;时间格式为`YYYY-MM-DDThh:mm:ssTZD`。

 - `YYYY`：年
 - `MM`：月
 - `DD`：日
 - `T`或空格：分隔符
 - `hh`：时
 - `mm`：分
 - `ss`：秒
 - `TDZ`：时区，`Z`表为格林尼治标准时间

```javascript
<del datatime="2021-07-30T15:06:25Z" cite="http://www.baidu.com">hello world</del>
```

![](/html/label/html/del.png)

#### dfn

&emsp;&emsp;;[dfn](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/dfn) 用于标记专业术语或短语。

&emsp;&emsp;;`dfn`是行内双标签，内容一般为斜体。

```javascript
<p><dfn>有机食品</dfn>适用于那些不是使用化学制品而生成的食物。</p>
```

![](/html/label/html/dfn.png)

#### em

&emsp;&emsp;;[em](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/em) 用于定义一个强调文本。

&emsp;&emsp;;`em`是语义化行内双标签，对其中包含的文本以斜体显示，有强调的作用。

```javascript
<p>You<em>have to</em> do something</p>
```

![](/html/label/html/em.png)

#### i

&emsp;&emsp;;[i](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/i) 用于表现区分于普通文本的文本。

&emsp;&emsp;;`i`为行内双标签元素，默认样式为斜体。一般在没有合适的元素使用时，再考虑使用`i`元素。

```javascript
<span>hello <i>world</i></span>
```

![](/html/label/html/i.png)

### 表单

#### button

&emsp;&emsp;;[Button](button.md)

#### datalist

&emsp;&emsp;;[datalist](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/datalist) 用于定义选项列表，与`input`元素配合使用。

&emsp;&emsp;;`datalist`包含一组`option`选项，通过`input`的`list`属性来关联`datalist`，再控制其显隐。绝大部分浏览器都支持，`IE9`及以下不支持。

```javascript
<label>
  <span>Language</span>
  <input list="language" />
</label>
<datalist id="language">
  <option value="JavaScript">
  <option value="Python">
  <option value="C++">
  <option value="Golang">
  <option value="Java">
</datalist>
```

&emsp;&emsp;;`datalist`不仅可以像`select`进行选择，而且可以输入并且达到模糊匹配的效果。

![](/html/label/html/datalist.gif)

&emsp;&emsp;;`datalist`一个比较好的应用实例是可用作动态邮箱后缀填充，兼容性 [详细参考](https://www.zhangxinxu.com/wordpress/2013/03/html5-datalist-%E5%AE%9E%E9%99%85%E5%BA%94%E7%94%A8-%E5%8F%AF%E8%A1%8C%E6%80%A7/)。但是`datalist`的缺点也非常明显，就是不能随便定义其样式。

```javascript
<input type="email" list="suffix" />
<datalist id="suffix">
  <option value="*@qq.com">
  <option value="*@163.com">
  <option value="*@gmail.com">
  <option value="*@yahoo.com.cn">
  <option value="*@126.com">
</datalist>

<script>
  const input = document.querySelector('input')
  const datalist = document.querySelector('datalist')
  const options = datalist.querySelectorAll('option')
  const suffixs = [...options].map(option => option.value.slice(1))
  const datalistInnerHtml = datalist.innerHTML

  input.addEventListener('input', function () {
    if (!this.value.includes('@')) {
      datalist.innerHTML = datalistInnerHtml.replace(/\*/g, this.value)
    }
  })
</script>
```

#### fieldset 

&emsp;&emsp;;[Fieldset](fieldset.md)

#### form

&emsp;&emsp;;[Form](form.md)

### 表格

#### caption

&emsp;&emsp;;[caption](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/caption) 用来指定表格标题。

&emsp;&emsp;;`caption`是块级双标签，可位于`table`内任意位置，将始终显示在`table`上方且水平居中。

&emsp;&emsp;属性`align`用于指定`caption`相对于`table`的排列位置，但是`HTML5`已废弃，仅仅`IE8`及以下浏览器还支持。

 - `left`：顶部左方位
 - `top`：顶部居中
 - `right`：顶部右方位
 - `bottom`：底部居中

&emsp;&emsp;虽然绝大多数浏览器不支持`align`，但是可以通过`CSS`的 [caption-side](https://developer.mozilla.org/zh-CN/docs/Web/CSS/caption-side) 和`text-align`得到类似`align`属性的效果。

#### col colgroup

&emsp;&emsp;;[Col Colgroup](col-colgroup.md)

### 脚本

#### canvas

&emsp;&emsp;;[Canvas]()

### 多媒体

#### area

&emsp;&emsp;;[area](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/area) 用于定义图像可被点击区域，点击后可跳转至目标`URL`。

&emsp;&emsp;其中`shape`属性用于设置热点形状，包括矩形（`rect / rectangle`）、圆形（`circ / circle`）、多边形（`poly / polygon`），`coords`用于指定热点区域坐标。

 - `rect / rectangle`：`coords`属性为`4`个值，对应矩形区域左上角横纵坐标和右下角横纵坐标
 - `circ / circle`：`coords`属性为`3`个值，前两个值对应圆心横纵坐标，最后一个值为圆半径长度
 - `poly / polygon`：`coords`属性为`n`个值（至少为`6`个），表示多边形各个点的坐标

```javascript
<img src="./bg.jpg" alt="" usemap="#map">
<map name="map" id="map">
  <area shape="rect" coords="25,30,131,131" href="xxx.html">
  <area shape="circ" coords="200,75,46" href="xxx.html" target="_blank">
  <area shape="poly" coords="52,207,137,155,210,225,168,317,70,304" href="xxx.html" target="_blank">
</map>
```

&emsp;&emsp;注意通过`CSS`设置`area`的样式，只能改变元素自身的样式，而不能改变图片上热点区域的样式。一般很难直观查看热点区域，可通过`Tab`键索引高亮查看热点区域的轮廓。

&emsp;&emsp;;`area`另一个用处是可以解决`a`标签嵌套的问题，[详细参考](https://www.zhangxinxu.com/wordpress/2017/05/html-area-map/)。

#### audio

&emsp;&emsp;;[Audio](audio.md)

#### img

&emsp;&emsp;;[Img](img.md)

### 内容分区

#### address

&emsp;&emsp;;[address](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/address) 用于定义 html 文档或文章的联系信息。

&emsp;&emsp;;`<address>`元素位于`<body>`内部则表示文档联系信息，位于`<article>`内则表示文章的联系信息。

&emsp;&emsp;;`address`是一个块级的行内语义化标签，其内部的文本通常呈现斜体。

```javascript
<address>
  <ul style="list-style: none;">
    <li>作者：xx</li>
    <li>邮箱：xxx@email.com</li>
    <li>电话：123456789</li>
  </ul>
</address>
```

&emsp;&emsp;如下为`address`的样式呈现。

![](/html/label/html/address.png)

#### article

&emsp;&emsp;;[article](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/article) 用于定义文档、章节、段落相关的文本结构，内部可包含 `header`、`footer`等结构化标签，也可包含`h1-h6`、`p`等标签。

&emsp;&emsp;;`<article>`也是`HTML5`新增的块级语义化标签。 

&emsp;&emsp;;`IE8`及以下浏览器不支持`article`标签。

```javascript
<article>
  <header></header>
  <p></p>
  <footer></footer>
</article>
```

#### aside

&emsp;&emsp;;[aside](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/aside) 用来定义页面或文章的附属信息，通常作为页面的侧边栏，放置相关的网站信息。

&emsp;&emsp;;`<aside>`也是 `HTML5`新增的块级语义化标签。

&emsp;&emsp;;`IE8`及以下浏览器不支持`aside`标签。

```javascript
<body>
  <header>header</header>
  <main>main</main>
  <aside>aside</aside>
  <footer>footer</footer>
</body>
```

#### footer

&emsp;&emsp;;[footer](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/footer) 用于定义页面的页脚或者页面中其它区块的页脚。

&emsp;&emsp;;`footer`是块级双标签元素，于`HTML5`中新增，`IE8`及以下浏览器不支持。

#### h1-h6

&emsp;&emsp;;[h1-h6](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/Heading_Elements) 用于呈现六个不同级别的标题，`h1`到`h6`依次递减。

&emsp;&emsp;;`h1-h6`都是块级双标签，样式默认都是`font-weight: bold`，文字大小和行间距不一致。

&emsp;&emsp;应当避免跳过某一级标题，始终从`h1`开始（字体过大可用`CSS`调整），然后依次往后使用。同一页面最好只有一个`h1`，用于页面标题，避免在同一页面重复使用`h1`。

&emsp;&emsp;属性`align`可选值包括`left`（左对齐）、`center`（居中）、`right`（右对齐）等，`HTML4`不推荐使用，`HTML5`不被支持，可使用`CSS`。

```javascript
<h1 align='center'>hello world</h1>
```

![](/html/label/html/h.png)

#### header

&emsp;&emsp;;[header](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/header) 用于定义页面的头部或者页面中其它区块的头部。

&emsp;&emsp;;`header`是块级双标签元素，于`HTML5`新增，`IE8`及以下浏览器不支持。

```javascript
<body>
  <header>header</header>
  <div>
    <aside>aside</aside>
    <main>main</main>
  </div>
  <footer>footer</footer>
</body>
```

![](/html/label/html/header.png)

#### hgroup

&emsp;&emsp;;[hgroup](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/hgroup) 用于组合`h1-h6`元素形成多级标题。

&emsp;&emsp;;`hgroup`为块级双标签，于`HTML5`新增，`IE8`及以下浏览器不支持。

&emsp;&emsp;;`hgroup`存在的一个关键因素是实现`HTML`中标题的多层次结构，但是未在任何浏览器中实现。

```javascript
<body>
  <hgroup>
    <h1>HTML</h1>
    <h2>Table Element</h2>
  </hgroup>
  <h2>Form Element</h2>
  <h2>Other Element</h2>
</body>
```

&emsp;&emsp;以上结构按照多层次结构规范应渲染为如下。

![](/html/label/html/hgroup.png)

### 交互元素

#### details

&emsp;&emsp;;[details](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/details) 用于创建一个类似手风琴效果的交互式控件。

&emsp;&emsp;;`details`为块级双标签，`IE`浏览器不支持。

```javascript
<details>
  <summary>HTML</summary>
  <p>HTML is not a programming language.</p>
  <p>It is a markup language that tells web browsers how to structure the web pages you visit.</p>
</details>
```

&emsp;&emsp;;`details`默认不显示内容，仅显示`summary`指定的文本，若不包含`summary`元素，将显示缺省文本`详细信息`。注意鼠标点击或者`Tab`键都可以聚焦`details`元素，聚焦后有聚焦样式，可通过空格键、`Enter`键、鼠标左键控制其显隐。

![](/html/label/html/details.gif)

&emsp;&emsp;若要其默认显示内容，可指定`open`属性。

```javascript
<details open>
  ...
</details>
```

&emsp;&emsp;借助`details`的交互特性可以实现菜单显隐，更多小功能 [参考](https://www.zhangxinxu.com/wordpress/2018/01/html5-details-summary-no-js-ux/)。

```javascript
<style>
  .bar {
    height: 30px;
    background: #888;
  }

  details {
    height: 30px;
    line-height: 30px;
    width: 100px;
    font-size: 14px;
    text-align: center;
    color: #888;
    background: #fff;
    margin-left: 40px;
    position: relative;
  }

  details summary:focus {
    outline: none;
    user-select: none;
  }

  details summary {
    list-style: none;
  }

  details summary::after {
    content: '';
    background: url(./arrow.svg) no-repeat;
    width: 12px;
    height: 12px;
    color: red;
    background-size: 100% 100%;
  }

  ul,
  li {
    list-style: none;
  }

  ul {
    margin: 0;
    padding: 5px 0;
    border: 1px solid #ddd;
    border-top: none;
    position: absolute;
    background: #fff;
    width: 100%;
  }

  ul li:hover {
    background: #f0f0f0;
  }
</style>

<div class="bar">
  <details>
    <summary>个人中心</summary>
    <ul>
      <li>写文章</li>
      <li>草稿箱</li>
      <li>我的主页</li>
    </ul>
  </details>
</div>
```

![](/html/label/html/details-menu.gif)

#### dialog

&emsp;&emsp;;[Dialog](dialog.md) 

### 内嵌元素

#### embed

&emsp;&emsp;;[embed](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/embed) 用于将外部内容嵌入文档。

&emsp;&emsp;;`object`和`embed`起初都是作为扩展浏览器能力的一种方式，用于添加插件，从而处理浏览器不支持的内容。`HTML4`中将`object`纳入规范，而`embed`则未被纳入。由于作为非正式元素的`embed`也被广泛使用，因此`HTML5`中将`embed`也纳入规范。但是有必要知晓大多数现代浏览器已经弃用或者取消了对浏览器插件（例如`Flash`）的支持。

&emsp;&emsp;;`embed`是行内单标签，浏览器支持程度严重不一致。

&emsp;&emsp;主要包括如下几种属性。

 - `src`：指定嵌入内容的`URL`
 - `width`：指定嵌入内容的宽度，可为百分比或`px`，指定数值默认为`px`。也可不设置宽度，浏览器将显示默认宽度
 - `height`：与`width`属性类似
 - `type`：指定嵌入内容的 [MIME](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/MIME_types) 类型，也可不指定，浏览器会根据嵌入内容的类型进行处理
 - `autostart`：音频或视频在加载完成后，是否自动播放，仅`IE`浏览器支持。`autostart="false"`表示自动播放，`autostart="true"`表示禁用自动播放

```javascript
<embed src="music.mp3" autostart="false">
```

 - `loop`：音频或视频是否循环播放，仅`IE`浏览器支持。`loop="true"`表示开启，`loop="false"`表示关闭

```javascript
<embed src="music.mp3" loop="true">
```

#### iframe

&emsp;&emsp;;[Iframe]()

### 已废弃

#### acronym

&emsp;&emsp;;[acronym](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/acronym) 用于表示缩写词或者缩略词，已从`HTML5`中移除，已被`attr`标签代替，不应再被使用。

&emsp;&emsp;;`acronym`在浏览器中呈现样式与`attr`一致。

```javascript
<span>hello <acronym title="Hyper Text Markup Language">HTML</acronym></span>
```

#### applet

&emsp;&emsp;;[applet](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/applet) 用于在`html`文档中嵌入`java`的`applet`程序，可在浏览器中加载并执行。

&emsp;&emsp;;`HTML5`中已不再使用`applet`，可使用`<object>`代替。

```javascript
<applet code='./Hello.class' width='200' height='200'></applet>
```

&emsp;&emsp;多数浏览器已不再支持`applet`标签，`applet`标签可用方式如下。

 - 安装`java`并配置环境变量，确保系统可运行`java --version`和`javac --version`
 - 运行`javac Hello.java`将`.java`编译为`.class`文件

```javascript
import java.applet.Applet;
import java.awt.Graphics;

public class Hello extends Applet {
  public void paint(Graphics g) {
    g.drawString("Hello World", 50, 25);
  }
}
```

 - 创建`html`文件，通过`applet`标签引入`.class`文件
 
```javascript
<!DOCTYPE html>
<html lang="en">

<body>
  <applet code='Hello.class' width=400 height=300></applet>
</body>

</html>
```

 - 运行`appletviewer index.html`开启小程序应用查看器

![](/html/label/html/app.png)

#### basefont

&emsp;&emsp;;[basefont](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/basefont) 用于定义文本中的字体、颜色和大小。

&emsp;&emsp;目前仅`IE9`及以下浏览器支持，其它浏览器已不再支持。

```javascript
<basefont color="red" size="6" />
```

#### bgsound

&emsp;&emsp;;[bgsound](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/bgsound) 用于`IE`浏览器中设置网页背景音乐。

&emsp;&emsp;非标准特性，应当使用`audio`元素代替。

&emsp;&emsp;其属性包括`src`（音频`URL`地址）、`volume`（音量大小）、`loop`（音频被播放次数，可以为数值或者`infinite`）。

```javascript
<bgsound src="music.mp3" loop="infinite" />
```

#### big

&emsp;&emsp;;[big](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/big) 使字体加大一号。

&emsp;&emsp;;`HTML4`之后不推荐标签带有样式信息，取而代之应当使用`CSS`属性。

```javascript
<big>hello world</big>
```

#### blink

&emsp;&emsp;;[blink](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/blink) 使文本闪烁。

&emsp;&emsp;此标签已废弃，可通过`CSS`动画实现。

```javascript
<blink>hello world</blink>
```

#### center

&emsp;&emsp;;[center](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/center) 元素的整个内容将在它的上级元素中水平居中。

&emsp;&emsp;;`center`是块级双标签，绝大多数浏览器都支持`center`标签，但是已经从`HTML4`中移除了，也许会在未来某个时间停止支持。

```javascript
<style>
  div {
    width: 230px;
    background: lightblue;
  }
</style>

<div>
  <center>hello</center>
  <center>center</center>
  <center>
    <p>Center is a block-level element</p>
  </center>
</div>
```

&emsp;&emsp;其效果等价于设置`div`元素样式为`text-align: center`。

![](/html/label/html/center.png)

#### content

&emsp;&emsp;;[Content]()

#### dir

&emsp;&emsp;;[dir](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/dir) 用于定义目录列表。

&emsp;&emsp;;`dir`是块级双标签，`HTML4`中废弃，`HTML5`中被`ul`取代。

```javascript
<dir>
  <li>hello</li>
  <li>world</li>
</dir>
<ul>
  <li>hello</li>
  <li>world</li>
</ul>
```

&emsp;&emsp;大部分浏览器还支持，且呈现与`ul`一致，但是不推荐使用。

![](/html/label/html/dir.png)

#### font

&emsp;&emsp;;[font](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/font) 用来指定文本的字体、颜色和尺寸。

&emsp;&emsp;;`font`为行内双标签，目前浏览器均支持，但是`font`已于`HTML4`中被废弃，`HTML5`中已不再被支持。

&emsp;&emsp;;`font`可选属性如下。
 - `color`：字体颜色，支持`rgb`、`hex`和颜色名称
 - `face`：字体，可指定一个或多个逗号分隔的字体名称
 - `size`：字体大小，值从`1`到`7`大小递增，`3`为浏览器默认大小

```javascript
<font size="3" color="lightblue">hello world</font>
<font size="5" face="fantasy">hello world</font>
```

![](/html/label/html/font.png)

#### frame frameset noframes

&emsp;&emsp;;[Frame Frameset Noframes](frame-frameset-noframes.md)

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125) / [Gitee](https://gitee.com/dongwei1125)、[GitHub Pages](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~
