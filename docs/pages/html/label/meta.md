# Meta

![](/html/label/meta/banner.jpg)

&emsp;&emsp;;[meta](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/meta) 元素用于指定页面的信息和部分行为。通常用于指定网页的描述，关键字等元数据。

&emsp;&emsp;可以被使用浏览器、搜索引擎或其他 Web 服务调用。

```javascript
<meta name="" http-equip="" content="" charset="">
```

## charset

&emsp;&emsp;;`charset`规定`HTML`文档的字符编码。

```javascript
<meta charset="utf-8">
```

&emsp;&emsp;;`charset`是`HTML 5`的新属性，替换了`HTML 4.01`的指定字符编码的方式，可以减少部分代码量。

```javascript
<meta http-equiv="content-type" content="text/html; charset=utf-8">
```

## name

### keyewords

&emsp;&emsp;指定页面关键字。

```javascript
<meta name="keyewords" content="html,css">
```

### description

&emsp;&emsp;指定页面描述信息。

```javascript
<meta name="description" content="html description">
```

### author

&emsp;&emsp;标注页面作者。

```javascript
<meta name="author" content="DonGW">
```

### copyright

&emsp;&emsp;标注页面版权信息。

```javascript
<meta name="copyright" content="Baidu">
```

### generator

&emsp;&emsp;标注开发网页的工具或软件。

```javascript
<meta name="generator" content="VS Code">
```

### robots

&emsp;&emsp;告知搜索引擎抓取页面的方式。

&emsp;&emsp;其中`content`参数如下。

- `index`：搜索引擎可以索引此页面，默认属性，不设置`meta`标签，搜索引擎也会默认索引此页面
- `noindex`：搜索引擎不可索引此页面
- `noimageindex`：搜索引擎不可索引此页面的图片
- `follow`：爬虫可以爬取此页面的链接
- `nofollow`：爬虫不可爬取此页面的链接
- `all`：`index`和`follow`的简写，搜索引擎可以索引此页面，爬虫可以爬取此页面的链接
- `none`：`noindex`和`nofollow`的简写，搜索引擎不可索引此页面，爬虫不可爬取此页面的链接
- `noarchive`：阻止搜索引擎在搜索结果中显示此页面的缓存版本，即网页快照
- `nocache`：功能同`noarchive`一致，适用于`MSN/Live`引擎
- `nosnippet`：搜索引擎的搜索结果中将显示一部分搜索文字上下文的内容，此属性即搜索引擎不可显示该内容，另外搜索引擎也不会保存该页面的快照
- `noodp`：搜索引擎的搜索结果中将显示一部分搜索文字上下文的内容，阻止使用`DMOZ`信息做为此内容
- `noydir`：搜索引擎的搜索结果中将显示一部分搜索文字上下文的内容，阻止`Yahoo directory`信息作为此内容

```javascript
<meta name="robots" content="index, follow">
```

### renderer

&emsp;&emsp;指定浏览器以哪种浏览器内核渲染页面，其中`content`参数包括`webkit`（`webkit`内核，极速模式）、`ie-comp`（`IE`兼容模式，即`IE6`、`IE7`、`IE8`的渲染模式）、`ie-stand`（`IE`标准模式，即以`IE9`及以上版本渲染）。

```javascript
<meta name="renderer" content="">
```

### format-detection

&emsp;&emsp;移动端浏览器中，用于识别电话号码、电子邮箱和地理位置的格式。其中`content`参数为`yes`（开启，默认值）、`no`（关闭）。

```javascript
<meta name="format-detection"  content="telephone=no">
<meta name="format-detection"  content="email=no">
<meta name="format-detection"  content="address=no">
```

### revisit-after

&emsp;&emsp;告知搜索引擎每隔多少天访问一次此页面。

&emsp;&emsp;一般情况下，网站不需要此属性来限制搜索引擎的访问频率。只有网站数据量非常大时，被搜索引擎频繁抓取，会占用过多的服务器资源，影响网站的反应速度，这种情况一般设置每隔`5-7`天来访问抓取一次网页即可。

&emsp;&emsp;网站抓取时间取决于此属性和搜索引擎的重访时间，假设`revisit-after`设置为`5`天，若搜索引擎每隔`10`天访问一次，`revisit-after`不会生效，而最终搜索引擎按照`10`天访问一次。搜索引擎每隔`3`天访问一次，`revisit-after`设置的`5`天则会生效，最终搜索引擎每隔`5`天访问一次页面。

```javascript
<meta name="revisit-after"  content="5 days">
```

### referrer

&emsp;&emsp;;`referrer`有来源页面的意思，即表示当前页面是由哪个页面跳转过来的，具体则是跳转至当前页面的`http`请求的请求头中的`Referer`字段包含了上一个页面的`URL`地址。

&emsp;&emsp;可能会发现拼写少了一个`r`，正确的拼写其实是`Referrer`，但是由于`http`标准发布时没有发现拼写错误，所以就一直沿用至今。

&emsp;&emsp;例如，当前页面的`URL`地址为`http://127.0.0.1:5500/`。

```javascript
<!DOCTYPE html>
<html lang="zh-CN">

<body>
    <a href="http://www.baidu.com">百度</a>
</body>

</html>
```

&emsp;&emsp;点击跳转至百度页面，查看页面请求的请求头。

![](/html/label/meta/referrer.png)

&emsp;&emsp;因此服务端可以统计用户来源，并以此进行统计分析、日志记录以及缓存优化等。

&emsp;&emsp;但是注意`Referer`可能会暴露用户的浏览历史 ，并且很多时候当前页面的`URL`是会包含用户的个人信息的（例如`token`），所以某些时候需要移除、禁用或者修改策略。

```javascript
<meta name="referrer" content="">
```

&emsp;&emsp;;`content`属性值如下。

- `no-referrer`：不发送`Referer`信息
- `no-referrer-when-downgrade`：默认值，安全级别下降时不发送`Referer`信息，目前仅一种情况安全级别下降，即`https`网页跳转至`http`网页，其它情况发送`Referer`完整信息
- `origin`：会发送`Referer`信息，但是仅发送源信息，包括协议、域名和端口号
- `same-origin`：仅同源链接发送`Referer`完整信息
- `strict-origin`：即`origin`与`no-referrer-when-downgrade`合并，安全级别下降时不发送`Referer`信息，安全级别未下降时发送 `Referer`源信息
- `origin-when-cross-origin`：跨域时发送`Referer`源信息，非跨域时即同源情况发送`Referer`完整信息
- `strict-origin-when-cross-origin`：同源链接发送`Referer`完整信息，安全级别下降时不发送`Referer`信息，其它情况发送`Referer`源信息
- `unsafe-url`：最不安全的策略，无论什么情况都发送 `Referer`完整信息

&emsp;&emsp;;`meta`标签指定`content`是修改全局策略。

&emsp;&emsp;单个`a`标签可通过`referrerpolicy`属性修改局部策略，更多 [详细参考](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Referrer-Policy)。

```javascript
<a href="http://www.baidu.com" referrerpolicy="no-referrer">百度</a>
```

![](/html/label/meta/referrerpolicy.png)

## http-equiv

### content-type

&emsp;&emsp;规定`HTML`文档的字符编码。

```javascript
<meta http-equiv="content-type" content="text/html; charset=utf-8">
```

### content-language

&emsp;&emsp;标注页面的目标受众或者标注当前页面存在的语言。

```javascript
<meta http-equiv="content-language" content="en">
```

### content-script-type

&emsp;&emsp;标注页面中脚本的类型。

```javascript
<meta http-equiv="content-script-type" content="text/javascript">
```

### refresh

&emsp;&emsp;刷新或跳转（重定向）页面，`content`表示刷新或跳转的时间与跳转的网址。

&emsp;&emsp;;`3s`后刷新页面。

```javascript
<meta http-equiv="refresh" content="3">
```

&emsp;&emsp;;`3s`后页面跳转至百度，跳转方式为当前窗口下跳转。

```javascript
<meta http-equiv="refresh" content="3; url=http://www.baidu.com">
```

### expires

&emsp;&emsp;指定网页在缓存中的过期时间，一旦网页过期，必须到服务器上重新加载到本地缓存才能访问。

&emsp;&emsp;指定网页在未来的某个时间过期，注意时间格式为`GMT`（格林尼治标准时间）。

```javascript
<meta http-equiv="expires" content="Mon, 31 May 3021 06:00:00 GMT">
```

&emsp;&emsp;指定网页可在本地缓存的时间（秒），指定`0`或负数，则每次访问网页都需要从服务器重新加载内容。

```javascript
<meta http-equiv="expires" content="2000">
```

### pragma

&emsp;&emsp;禁止浏览器从本地缓存中访问页面的内容，即用户无法脱机浏览。

&emsp;&emsp;注意仅`IE`浏览器能识别此段`meta`标签含义，其它主流浏览器仅能识别`cache-control`属性的`meta`标签。为了网页兼容性，最好`pragma`和`cache-control`两者一起使用。

```javascript
<meta http-equiv="pragma" content="no-cache">
<meta http-equiv="cache-control" content="no-cache">
```

### window-target

&emsp;&emsp;设置页面显示的窗口方式，`content`参数如下，[详细参考](a.md#指定链接打开方式)。

- `_top`：页面以当前整个窗口的方式显示，可用于防止页面被其他网页嵌套
- `_black`：页面以新打开的方式显示
- `_self`：页面以当前容器或窗口显示
- `_parent`：页面以父容器或窗口显示

```javascript
<meta http-equiv="window-target" content="_top">
```

### set-cookie

&emsp;&emsp;设置`cookie`值及其有效时间。

&emsp;&emsp;注意浏览器正在远离此方式，可能由于浏览器版本原因，会产生警告或错误。此功能已在`M63`中废弃，并且在`M65`中完全删除。

```javascript
<meta http-equiv="set-cookie" content="cookievalue=xxx; expires=Mon, 31 May 3021 06:00:00 GMT; path=/">
```

### pics-label

&emsp;&emsp;网页等级评定，`IE`浏览器可以根据网页的限制等级来过滤网页。

```javascript
<meta http-equiv="pics-label" content="">
```

### page-enter / page-exit

&emsp;&emsp;设置网页退出和进入的过渡效果。

&emsp;&emsp;其中包括`blendTrans`淡入淡出过渡效果，此效果只能设置过渡持续时间（秒）。

&emsp;&emsp;另一种`revealTrans`，可以设置过渡效果类型和过渡持续时间（秒）。

&emsp;&emsp;淡入持续`5`秒。

```javascript
<meta http-equiv="page-enter" content="blendTrans(duration=5)">
```

&emsp;&emsp;矩形扩大持续`2`秒。

```javascript
<meta http-equiv="page-enter" content="revealTrans(duration=2, transition=1)">
```

&emsp;&emsp;其中`transition`过渡效果有`24`种，包括`0`（矩形缩小）、`1`（矩形扩大）、`2`（圆形缩小）、`3`（圆形扩大）、`4`（下到上刷新）、`5`（上到下刷新）、`6`（左到右刷新）、`7`（右到左刷新）、`8`（竖百叶窗）、`9`（横百叶窗）、`10`（错位横百叶窗）、`11`（错位竖百叶窗）、`12`（点扩散）、`13`（左右到中间刷新）、`14`（中间到左右刷新）、`15`（中间到上下）、`16`（上下到中间）、`17`（右下到左上）、`18`（右上到左下）、`19`（左上到右下）、`20`（左下到右上）、`21`（横条）、`22`（竖条）、`23`（以上`22`种随机选择一种）。

&emsp;&emsp;注意由于浏览器的版本原因，多数都不再支持`page-enter/page-exit`属性。

### X-UA-compatible

&emsp;&emsp;针对`IE8`的特殊属性，指定在`IE8`浏览器内以哪种`IE`版本的模式来渲染页面内容，以此来解决`IE`浏览器的兼容问题。

&emsp;&emsp;指定多个模式，如下在`IE8`中浏览页面时，将会使用`IE7`的标准模式渲染页面。由于`IE8`自身不支持`IE9`和`IE10`，而`IE7`是相对`IE5`和`IE6`的最高版本的渲染模式，故最终会以`IE7`渲染页面。

```javascript
<meta http-equiv="X-UA-compatible" content="IE=5,6,7,9,10">
```

&emsp;&emsp;使用最新版本的`IE`浏览器渲染页面，即使用的是什么版本的`IE`浏览器，就用什么版本的标准渲染模式。

```javascript
<meta http-equiv="X-UA-compatible" content="IE=edge">
```

&emsp;&emsp;指定`IE`浏览器使用`Google Chrome Frame`（`GCF`）模式渲染页面，`GCF`是谷歌内嵌浏览器框架，专门为`IE`浏览器开发的浏览器内核插件，支持`IE6`、`IE7`、`IE8`等多个版本的`IE`浏览器。

```javascript
<meta http-equiv="X-UA-Compatible" content="chrome=1">
```

&emsp;&emsp; 绝大多数网站均使用如下方式，即`IE`浏览器安装了`GCF`插件，则使用`GCF`浏览器内核渲染页面，若未安装`GCF`插件，则使用最高版本的`IE`内核渲染页面。

```javascript
<meta http-equiv="X-UA-Compatible" content="IE=Edge, chrome=1">
```

### cache-control

&emsp;&emsp; 用于控制浏览器和服务器之间的缓存请求和响应。

```javascript
<meta http-equiv="cache-control" content="">
```

&emsp;&emsp; 其中`content`参数如下。

- `public`：可以在任何客户端（浏览器、本地缓存、各种代理服务器等）中缓存，但是不能设置缓存期限
- `max-age`：不仅可以被任何客户端缓存，而且还可以设置缓存期限。缓存期限是相对服务器时间而言的，超过设置时间，缓存则被认为过期，再次访问需要重新请求服务器加载缓存。如下最大缓存时间为`60`秒，超过`60`秒，缓存则被认为过期

```javascript
<meta http-equiv="cache-control" content="max-age=60">
```

- `private`：只能被单个用户缓存，不允许中间代理缓存。例如`CDN`不能缓存`private`的响应
- `only-if-cached`：若缓存存在，只使用缓存，不需要请求服务器加载更新内容
- `no-cache`：先发送请求，与服务器确认资源是否被修改，若未被修改，则使用缓存
- `no-store`：不允许缓存，再次访问需重新从服务器上加载缓存
- `no-transform`：不可对网页内容或网页中的资源进行转换，以便节省缓存空间
- `no-siteapp`：禁止百度、搜狗等搜索引擎对网页进行转码

&emsp;&emsp;禁止百度、搜狗等网页进行转码处理。

```javascript
<meta http-equiv="cache-control"  content="no-transform">
<meta http-equiv="cache-control"  content="no-siteapp">
```

&emsp;&emsp;每次打开网页，清除网页缓存。`http 1.1`协议需要用到`cache-control`来规范，而`http 1.0`适用`pragma`和`expires`来规范，为了网页兼容性，最好三个一起使用。

```javascript
<meta http-equiv="cache-control"  content="no-cache">
<meta http-equiv="pragma"  content="no-cache">
<meta http-equiv="expires"  content="0">
```

### x-dns-prefetch-control

&emsp;&emsp;禁用隐式的 DNS 预解析。

```javascript
<meta http-equiv="x-dns-prefetch-control" content="off">
```

## 移动端

### viewport

&emsp;&emsp;用于优化移动端的网页，使得`web`端的网页在手机端正常显示，页面布局不会错位。注意`meta`的`viewpoint`属性只对移动端浏览器有效，对`pc`端浏览器是无效的。

&emsp;&emsp;;`viewport`主要包括如下三种类型。

- 布局视区：是指整个网页在移动端浏览器中显示的区域，此布局在大多数移动端浏览器中默认显示的宽度为`980px`（也有少部分`1024px`或者其他宽度的），故只要整个网页宽度不超过此默认值，页面就可以正常显示
- 可见视区：指的是移动端设备本身的屏幕显示区域，不同的移动设备，可见视区的尺寸也不同
- 理想视区：指的是布局视区能完美适配移动设备的可见视区，即布局视区的宽度等于可见视区的宽度，因此不需要缩放和横向滚动条就能正常查看整个网页

```javascript
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
```

&emsp;&emsp;;`viewport`属性及其用法如下。

- `width`：控制布局视区的宽度，也可指定为固定宽度值，或者设置为`device-width`。如果`width`不设置或者为空，则使用默认宽度，即上述的`980px`或`1024px`。如果设置为`device-width`，则表示设置为理想视区，即布局视区宽度等于可见视区宽度。如果`width`设置为固定宽度，单位为`px`，也可以不带单位，默认单位为`px`
- `height`：控制布局视区的高度，一般不设置，极少使用
- `initial-scale`：设置布局视区初始化缩放比例（即每一次加载页面时的缩放比例），为一个数字，可以是小数。如果设置`initial-scale`为`1`，则和`width=device-width`一致，表示设置为理想视区。但是两者均有一个小缺陷，即`width=device-width`会导致`iPhone`和`iPad`横竖屏不分，`initial=1.0`会导致`IE`横竖屏不分，故两者都使用，可互相弥补缺陷
- `maximum-scale`：允许用户缩放的最大比例值，为一个数字，可以带小数。需要大于`minimum-scale`
- `minimum-scale`：允许用户缩放的最小比例值，为一个数字，可以带小数
- `user-scalable`：是否允许用户手动缩放布局视区，非必须参数，其中参数为`no`（不允许）、`yes`（允许）

## 浏览器

### QQ 浏览器

#### x5-orientation

&emsp;&emsp;指定屏幕方向，其中`content`参数为`landscape`（横屏）、`portrait`（竖屏）。

```javascript
<meta name="x5-orientation" content="landscape">
```

#### x5-fullscreen

&emsp;&emsp;全屏显示。

```javascript
<meta name="x5-fullscreen" content="true">
```

#### x5-page-mode

&emsp;&emsp;指定页面以应用模式显示。

```javascript
<meta name="x5-page-mode" content="app">
```

### UC 浏览器

#### screen-orientation

&emsp;&emsp;指定屏幕方向，其中`content`参数为`landscape`（横屏）、`portrait`（竖屏）。

```javascript
<meta name="screen-orientation" content="portrait">
```

#### full-screen

&emsp;&emsp;全屏显示。

```javascript
<meta name="full-screen" content="yes">
```

#### browsermode

&emsp;&emsp;指定页面以应用模式显示。

```javascript
<meta name="browsermode" content="application">
```

#### nightmode

&emsp;&emsp;夜间模式，其中`content`参数为`enable`（开启）、`disable`（关闭），注意若用户开启浏览器的夜间模式，而`nightmode`设置为`disable`，页面也是以非夜间模式显示。

```javascript
<meta name="nightmode" content="disable">
```

#### imagemode

&emsp;&emsp;强制图片显示，浏览器为用户提供了无图模式，但是某些页面图片是必须的（如验证码等），如下可强制页面显示图片。

```javascript
<meta name="imagemode" content="force">
```

&emsp;&emsp;;`imagemode`设置为`force`会作用于整个页面，单张可设置如下。

```javascript
<img src="" show="force">
```

#### layoutmode

&emsp;&emsp;指定页面排版模式，其中`content`参数为`fitscreen`（简化页面处理，适用页面阅读省流）、`standard`（同标准浏览器一致），注意`layoutmode`指定后，浏览器提供的页面排版模式将会失效。

```javascript
<meta name="layoutmode" content="fitscreen">
```

#### viewport

&emsp;&emsp;缩放不显示滚动条，其中`content`参数为`yes`（用户缩放不会出现滚动条）、`no`（同标准浏览器一致）。

```javascript
<meta name="viewport" content="uc-fitscreen=yes">
```

### IOS

#### apple-mobile-web-app-capable

&emsp;&emsp;隐藏苹果默认的工具栏和菜单栏，其中`content`参数包括`yes`（页面以全屏运行）、`no`（正常显示）。

```javascript
<meta name="apple-mobile-web-app-capable" content="no">
```

#### apple-mobile-web-app-status-bar-style

&emsp;&emsp;设备顶部状态栏背景色，其中`content`参数包括`default`（白色，默认值）、`black`（黑色）、`black-translucent`（灰色半透明）。

```javascript
<meta name="apple-mobile-web-app-status-bar-style" content="">
```

#### apple-mobile-web-app-title

&emsp;&emsp;网页添加到主屏幕后的标题（类似`App`的名称）。

```javascript
<meta name="apple-mobile-web-app-title" content="">
```

#### apple-touch-icon

&emsp;&emsp;网页添加到主屏幕后的图标如下，其中`apple-touch-icon`支持`sizes`属性，用来对应不同设备。

&emsp;&emsp;;`57 * 57`（默认值）对应`320 * 640`的`iPhone`老设备，`72 * 72`对应`iPad`，`114 * 114`对应`retina`屏幕的`iPhone`和`iTouch`，`144 * 144`对应`iPad`的高分辨率。

&emsp;&emsp;其中图标匹配方式如下。

- 若没有与当前设备推荐尺寸一致的图标，则优先使用比推荐尺寸大，最接近推荐尺寸的图标
- 若没有比推荐尺寸大的图标，则优先使用最接近推荐尺寸的图标
- 若多个图标符合推荐尺寸，优先使用含`precomposed`关键字的图标
- 若未用`link`指定图标，自动搜索网站根目录下带有`app-touch-icon`或者`app-touch-icon-precomposed`前缀的图标

&emsp;&emsp;;`retina`图标是标准图标大小的两倍，实际仅仅需要`114 * 114`和`144 * 144`两款图标即可。将`retina`图标的大小设置成标准图标的尺寸，`IOS`会根据情况自动进行缩放。

```javascript
<link rel="apple-touch-icon" sizes="57x57" href="assets/imgs/logo.png">
<link rel="apple-touch-icon" sizes="114x114" href="assets/imgs/logo.png">
<link rel="apple-touch-icon" sizes="72x72" href="assets/imgs/logo@2x.png">
<link rel="apple-touch-icon" sizes="144x144" href="assets/imgs/logo@2x.png">
```

#### apple-touch-startup-image

&emsp;&emsp;网页添加到主屏幕后，设置打开后的启动画面。

&emsp;&emsp;其中在`iPhone`和`iTouch`设备上只支持竖屏模式，图片分辨率为`320 * 640`，在`iPad`上支持竖屏和横屏两种模式，分辨率为`768 * 1004`和`748 * 1024`。

&emsp;&emsp;;`apple-touch-startup-image`不支持`sizes`属性，可以使用`media`来支持多种屏幕。

```javascript
<link rel="apple-touch-startup-image" href="assets/imgs/startup-l.png"  media="screen and (min-device-width: 481px) and (max-device-width: 1024px) and (orientation:landscape)">
<link rel="apple-touch-startup-image" href="assets/imgs/startup-l.png" media="screen and (min-device-width: 481px) and (max-device-width: 1024px) and (orientation:portrait)">
<link rel="apple-touch-startup-image" href="assets/imgs/startup.png">
```

#### apple-touch-icon-precomposed

&emsp;&emsp;区别于`apple-touch-icon`，若属性值为`apple-touch-icon-precomposed`时，系统不会对图标添加类似于圆角和高光的效果，若属性值为`apple-touch-icon`时系统会自动为图标添加圆角和高光。

```javascript
<link rel="apple-touch-icon-precomposed" href="assets/imgs/logo.png">
```

#### apple-itunes-app

&emsp;&emsp;告知`iPhone`的`safari`浏览器，网页对应的`appid`，便于在页面显示`app`的下载广告条。

```javascript
<meta name="apple-itunes-app" content="app-id=123456789">
```

### Google 浏览器

#### google

&emsp;&emsp;禁止自动翻译。

```javascript
<meta name="google" value="notranslate">
```

#### mobile-web-app-capable

&emsp;&emsp;使用`Chrome for Android`版本的浏览器添加到主屏幕后，页面以全屏显示，即隐藏工具栏和菜单栏。

```javascript
<meta name="mobile-web-app-capable" content="yes">
```

#### theme-color

&emsp;&emsp;指定`Chrome for Android`版的浏览器的设备顶部状态栏主题色。

```javascript
<meta name="theme-color" content="#000000">
```

### Web

#### application-name

&emsp;&emsp;指定页面代表的`web`应用程序的名称，光标悬停在`Win7`任务栏的固定网站按钮上时，此名称将出现在工具提示中，详细参考 [application-name](https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/samples/gg491732%28v=vs.85%29?redirectedfrom=MSDN#application-name)。

```javascript
<meta name="application-name" content="">
```

#### msapplication-tap-highlight

&emsp;&emsp;禁止页面链接高亮。

```javascript
<meta name="msapplication-tap-highlight" content="no">
```

#### msapplication-tooltip

&emsp;&emsp;光标悬停在网页快捷方式上，将会显示此提示文本，详细参考 [msapplication-tooltip](https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/samples/gg491732%28v=vs.85%29?redirectedfrom=MSDN#msapplication-tooltip)。

```javascript
<meta name="msapplication-tooltip" content="">
```

#### msapplication-starturl

&emsp;&emsp;指定网页快捷方式的根`URL`，不指定则默认使用当前页的地址，详细参考 [msapplication-starturl](https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/samples/gg491732%28v=vs.85%29?redirectedfrom=MSDN#msapplication-starturl)。

```javascript
<meta name="msapplication-starturl" content="">
```

#### msapplication-window

&emsp;&emsp;指定网页快捷方式的首次启动的初始窗口大小，若用户调整了窗口大小，网页将保留新的尺寸值，详细参考 [msapplication-window](https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/samples/gg491732%28v=vs.85%29?redirectedfrom=MSDN#msapplication-window)。

```javascript
<meta name="msapplication-window" content="width=1024;height=768">
```

#### msapplication-navbutton-color

&emsp;&emsp;自定义网页快捷方式的浏览器窗口中前进和后退按钮的颜色，详细参考 [msapplication-navbutton-color](https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/samples/gg491732%28v=vs.85%29?redirectedfrom=MSDN#msapplication-navbutton-color)。

```javascript
<meta name="msapplication-navbutton-color" content="#FF3300">
```

#### msapplication-task

&emsp;&emsp;将某个网页同引用程序一般固定在`Win7`任务栏，在点击后显示一个相关站点的列表，详细参考 [msapplication-task](https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/samples/gg491732%28v=vs.85%29?redirectedfrom=MSDN#msapplication-task)。

```javascript
<meta name="msapplication-task" content="name=xxx; action-uri=http://www.xxx.com; icon-uri=/imgs/logo.ico">
```

#### msapplication-task-separator

&emsp;&emsp;在`msapplication-task`中呈现的站点列表中，在各个任务之间放置一条分割线。若指定多条分割线，则通过声明不同`content`来使每条分割线都具有唯一性。

```javascript
<meta name="msapplication-task-separator" content="id">
```

#### msapplication-TileImage

&emsp;&emsp;;`Win8`版本后，支持将网页固定在开始屏幕中，且可以自定义图标和背景图，此属性用来指定图标，详细参考 [msapplication-TileImage](https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/dn255024%28v=vs.85%29#msapplication-tileimage)。

```javascript
<meta name="msapplication-TileImage" content="/imgs/logo.png">
```

#### msapplication-TileColor

&emsp;&emsp;同 `msapplication-TileImage`类似，指定背景色，详细参考 [msapplication-TileColor](https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/dn255024%28v=vs.85%29#msapplication-tilecolor)。

```javascript
<meta name="msapplication-TileColor" content="#FF3300">
```

#### msApplication-ID

&emsp;&emsp;用于网页关联`Win8`应用程序，`IE`识别用户计算机是否安装了关联应用，若未安装，则提供指向安装此应用程序的直接链接，若安装了则显示切换到`xxx`应用，详细参考 [msApplication-ID](https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/dev-guides/hh781489%28v=vs.85%29#essential-markup)。

```javascript
<meta name="msApplication-ID" content="App">
```

#### msApplication-PackageFamilyName

&emsp;&emsp;用于将网页连接到商店，详细参考 [msApplication-PackageFamilyName](https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/dev-guides/hh781489%28v=vs.85%29#essential-markup)。

```javascript
<meta name="msApplication-PackageFamilyName"content="">
```

#### msApplication-Arguments

&emsp;&emsp;传递给应用程序的参数字符串，详细参考 [msApplication-Arguments](https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/dev-guides/hh781489%28v=vs.85%29#essential-markup)。

```javascript
<meta name="msApplication-Arguments" content="">
```

#### msApplication-MinVersion

&emsp;&emsp;强制要求应用程序的最低版本，若用户尝试切换到过低版本的应用程序，会被链接到应用商店更新应用程序，详细参考 [msApplication-Arguments](https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/dev-guides/hh781489%28v=vs.85%29#essential-markup)。

```javascript
<meta name="msApplication-MinVersion" content="">
```

#### msApplication-OptOut

&emsp;&emsp;是否阻止用户安装或者切换应用程序，详细参考 [msApplication-Arguments](https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/dev-guides/hh781489%28v=vs.85%29#essential-markup)。

```javascript
<meta name="msApplication-OptOut" content="install">
```

#### msapplication-badge

&emsp;&emsp;将网页固定到开始屏幕后，`Win8`可以轮询更新更新其中的应用程序，如下指定应用程序的更新方式，详细参考 [msapplication-badge](https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/samples/jj152137%28v=vs.85%29#msapplication-badge)。

```javascript
<meta name="msapplication-badge" content="">
```

#### msapplication-config

&emsp;&emsp;自定义网页快捷方式的更新方式、开始屏幕中图标等，注意需使用`XML`文件设置，详细参考 [msapplication-config](https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/dn255024%28v=vs.85%29#msapplication-config)。

```javascript
<meta name="msapplication-config" content="http://www.xxx.com/config.xml">
```

#### MSThemeCompatible

&emsp;&emsp;是否在`IE`中开启`xp`的主题，其中`yes`表示打开`xp`的蓝色立体按钮系统显示样式。

```javascript
<meta http-equiv="MSThemeCompatible" content="yes">
```

#### MSSmartTagsPreventParsing

&emsp;&emsp;;`IE 6`中包含有`Smart tag`开关，如下用户将看不到某些链接。

```javascript
<meta name="MSSmartTagsPreventParsing" content="true">
```

#### HandheldFriendly

&emsp;&emsp;针对手持设备优化，主要是部分不识别`viewport`的浏览器，例如黑莓。

```javascript
<meta name="HandheldFriendly" content="true">
```

#### MobileOptimized

&emsp;&emsp;布局菜单桌面选择，浏览器根据此属性的`content`值与屏幕宽度对比，决定使用何种布局方式，详细参考 [MobileOptimized](https://docs.microsoft.com/en-us/previous-versions/ms890014%28v=msdn.10%29)。

```javascript
<meta name="MobileOptimized" content="240">
```

### 其他

#### Open Graph Protocol

&emsp;&emsp;;`og`是一种新的`http`头部标记，此协议可以让网页成为富媒体对象，即网页内容可以被其它社会化网站引用，目前此协议被`SNS`网站（`Facebook`等）采用。

&emsp;&emsp;网页遵守此协议，`SNS`可以有效从页面提取信息并呈现给用户，从而提高网站的传播效率。

&emsp;&emsp;;`og`主要标签属性包括`title`（标题）、`type`（类型，常用值包括`article`、`book`、`movie`）、`image`（缩略图地址）、`url`（页面地址）、`description`（页面描述）、`site_name`（页面所在网站名）、`videosrc`（视频或`flash`地址）、`audiosrc`（音频地址）。

```javascript
<meta property="og:title" content="">
<meta property="og:description" content="">
```

#### App Links

&emsp;&emsp;移动端点击一个链接会产生一个弹出框，询问用户打开哪种应用。而`App Links`让用户在点击一个普通链接时候可以打开指定`app`的指定页面，若用户未安装则跳转到`web`页面，或者直接跳转到`app`的下载页面。

```javascript
<meta property="al:ios:url" content="">
<meta property="al:ios:app_store_id" content="">
<meta property="al:ios:app_name" content="">
<meta property="al:android:url" content="">
<meta property="al:android:app_name" content="">
<meta property="al:android:package" content="">
<meta property="al:web:url" content="">
```
