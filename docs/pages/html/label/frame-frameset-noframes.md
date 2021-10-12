# Frame Frameset Noframes

![](/html/label/frame-frameset-noframes/banner.jpg)

&emsp;&emsp;;[frame](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/frame) 可定义特定区域，用于显示`HTML`文档。

&emsp;&emsp;;`HTML5`已废弃，不再支持`frame`，但是当前仍有一部分浏览器支持。

&emsp;&emsp;;`frame`为块级双标签，只能作为`frameset`子元素，无法单独使用。

&emsp;&emsp;常用属性如下。

- `src`：指定显示的`HTML`文档
- `name`：为`frame`添加标识，若未指定标识，所有链接将在其所在的`frame`打开
- `noresize`：禁止改变区域大小

```javascript
<!DOCTYPE html>
<html lang="en">

<frameset rows='10%, *'>
    <frame src='header.html'></frame>
    <frameset cols='30%, *'>
        <frame src='aside.html'></frame>
        <frame src='content.html'></frame>
    </frameset>
</frameset>

</html>
```

&emsp;&emsp;一般的`frame`是可拖动的，指定`noresize`将禁止拖动。

![](/html/label/frame-frameset-noframes/noresize.gif)

- `scrolling`：浏览器会根据`frame`内容决定放置滚动条，`scrolling="no"`表示强制关闭滚动条，`scrolling="yes"`表示强制开启滚动条
- `marginheight`：指定`frame`区域上下外边距

```javascript
// index.html
<frameset rows='10%, *'>
    <frame src='header.html'></frame>
    <frameset cols='30%, *'>
        <frame src='aside.html'></frame>
        <frame src='content.html' marginheight='50px'></frame>
    </frameset>
</frameset>

// content.html
<!DOCTYPE html>
<html lang="en">

<body>
    content
</body>

</html>
```

&emsp;&emsp;;`index.html`控制台可查看到`content.html`内`body`含上下外边距。

![](/html/label/frame-frameset-noframes/margin.png)

- `marginwidth`：指定`frame`区域左右外边距
- `frameborder`：是否显示`frame`周围的边框，默认显示，`frameborder="0"`表示关闭边框，`frameborder="1"`表示开启边框

## frameset

&emsp;&emsp;;[frameset](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/frameset) 用于包含`frame`元素。

&emsp;&emsp;;`frameset`为块级双标签，`HTML5`已废弃，不再支持`frameset`，当前仍有一部分浏览器支持。

&emsp;&emsp;常用属性如下。

- `cols`：指定`frame`列数和尺寸，尺寸可指定`px`、`%`和`*`，其中`*`表示页面剩余的尺寸
- `rows`：指定`frame`行数和尺寸

```javascript
<frameset rows="*, *">
  <frame src="header.html"></frame>
  <frameset cols="10%, 80%, *">
    <frame src="aside.html"></frame>
    <frame src="content.html"></frame>
    <frame src="aside.html"></frame>
  </frameset>
</frameset>
```

&emsp;&emsp;其中`frameset`是支持嵌套的。

![](/html/label/frame-frameset-noframes/nest.png)

## noframes

&emsp;&emsp;;[noframes](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/noframes) 与`noscript`元素类似，用于在不支持`frame`的浏览器显示。

&emsp;&emsp;;`HTML5`不支持，但是大部分浏览器可用。

```javascript
<frameset>
  <frame src="content.html" />
  <noframes>
    <p>It seems your browser does not support frames.</p>
  </noframes>
</frameset>
```

## 应用

&emsp;&emsp;三标签配合可以实现一个简单的后台系统。

![](/html/label/frame-frameset-noframes/system.gif)

&emsp;&emsp;页面布局如下，其中右侧部分的`frame`需指定`name="content"`标识，且默认显示`user.html`页面，`aside.html`内`a`链接的`target`则需要为`content`。

```javascript
// index.html
<!DOCTYPE html>
<html lang="en">

<frameset rows='10%, *'>
    <frame src="header.html" />
    <frameset cols='30%, *'>
        <frame src="aside.html" />
        <frame name='content' src='user.html' />
    </frameset>
    <noframes>
        <p>It seems your browser does not support frames.</p>
    </noframes>
</frameset>

</html>

// header.html
<!DOCTYPE html>
<html lang="en">

<body>
    <p>欢迎进入人员管理系统！！！</p>
</body>

</html>

// aside.html
<!DOCTYPE html>
<html lang="en">

<body>
    <ul>
        <li><a href="user.html" target="content">人员管理</a></li>
        <li><a href="leave.html" target="content">请假管理</a></li>
        <li><a href="live.html" target="content">住宿管理</a></li>
    </ul>
</body>

</html>
```

&emsp;&emsp;左侧路由页面如下。

```javascript
// user.html
<!DOCTYPE html>
<html lang="en">

<body>
    user
</body>

</html>

// leave.html
<!DOCTYPE html>
<html lang="en">

<body>
    leave
</body>

</html>

// live.html
<!DOCTYPE html>
<html lang="en">

<body>
    live
</body>

</html>
```
