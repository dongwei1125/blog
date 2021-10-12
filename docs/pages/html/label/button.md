# Button

![](/html/label/button/banner.jpg)

&emsp;&emsp;;[button](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/button) 用于显示一个可点击的按钮，可用在表单或文档的其它地方。

&emsp;&emsp;;`button`元素是内联双标签，不同浏览器下`button`样式不同，可以通过`CSS`修改。

```javascript
<button>按钮</button>
```

## 标签属性

### autofocus

&emsp;&emsp;指定页面加载时聚焦此按钮，多个按钮指定`autofocus`，仅仅只会聚焦首个按钮。

```javascript
<button autofocus>按钮</button>
```

### disabled

&emsp;&emsp;禁用，用户不能与`button`交互。

```javascript
<button disabled>按钮</button>
```

### form

&emsp;&emsp;;`HTML5`新增属性，用于指定关联的`form`元素的`id`。一般`button`按钮需要位于`form`元素内部才能关联`form`，而指定`form`属性则可以在文档任意位置关联`form`。

```javascript
<form id="form" action="" method="post">
    <input type="text">
</form>
<button type="reset" form='form'>按钮</button>
```

### formaction

&emsp;&emsp;覆盖`button`关联的`form`表单的`action`属性。

&emsp;&emsp;如下表单的提交地址将被覆盖为`http://www.jd.com`。

```javascript
<form method="get" action="http://www.baidu.com">
    <input type="text">
    <button type="submit" formaction="http://www.jd.com">按钮</button>
</form>
```

&emsp;&emsp;不同按钮设置不同`formaction`属性，可将同一表单的数据提交到不同的`URL`地址。

```javascript
<form method="get" id="form">
    <input type="text">
</form>
<button type="submit" formaction="http://www.baidu.com" form="form">百度</button>
<button type="submit" formaction="http://www.qq.com" form="form">qq</button>
```

### formenctype

&emsp;&emsp;若表单`method`属性为`post`，且`button`是`submit`类型时，用于指定表单的数据编码方式。

&emsp;&emsp;注意`button`上的`formenctype`也会覆盖`form`表单的`enctype`属性。

```javascript
<form method="post" action="http://www.baidu.com">
    <input type="text">
    <button type="submit" formenctype="multipart/form-data">按钮</button>
</form>
```

&emsp;&emsp;实际上`enctype`影响的是请求头的`Content-Type`。

![](/html/label/button/formenctype.png)

&emsp;&emsp;enctype 属性值包括三种类型。

- `application/x-www-form-urlencoded`：默认编码方式
- `multipart/form-data`：表单含有文件上传控件需指定
- `text/plain`：用于调试

&emsp;&emsp;如下为含有两个输入框的表单，通过在`button`上设置不同`formenctype`属性值来区分差异，其中`name`控件固定输入`hello`，`desc`控件固定输入`button formenctype`。

```javascript
<form method="post" action="http://www.baidu.com">
    <input type="text" name="value">
    <input type="text" name="desc">
    <button type="submit" formenctype="">按钮</button>
</form>
```

&emsp;&emsp;;`application/x-www-form-urlencoded`是默认的编码方式，适用于各种类型的表单。其中特殊字符（空格）已经被替换为`+`，数据项的名称和值以`=`分开，数据项之间以`&`分开。

![](/html/label/button/application.png)

&emsp;&emsp;;`multipart/form-data`在表单含有`type="file"`控件时指定，此类型更加适合传输二进制数据。

![](/html/label/button/multipart.png)

&emsp;&emsp;;`text/plain`中每个数据项独占一行，不会编码特殊字符。注意各种浏览器的实现方式各不相同，一般不建议使用。

![](/html/label/button/text.png)

### formmethod

&emsp;&emsp;覆盖`button`关联的`form`表单的`method`属性，可选值包括`get`、`post`。

&emsp;&emsp;如下表单的请求方式将为`get` 。

```javascript
<form method="post" action="http://www.baidu.com">
    <input type="text">
    <button type="submit" formmethod="get">按钮</button>
</form>
```

### formnovalidate

&emsp;&emsp;指定`button`关联的`form`表单，在表单提交时不用验证数据。

&emsp;&emsp;如下指定表单项只能输入`email`邮箱格式。

```javascript
<form method="post" action="http://www.baidu.com">
    <input type="email" name="email">
    <button type="submit">按钮</button>
</form>
```

&emsp;&emsp;点击按钮提交表单数据时，将验证数据是否为邮箱格式。

![](/html/label/button/formnovalidate.png)

&emsp;&emsp;添加`formnovalidate`属性将关闭表单的验证。

```javascript
<button type="submit" formnovalidate>按钮</button>
```

### formtarget

&emsp;&emsp;若关联`form`的`button`其`type`属性为值为`submit`，`formtarget`表示提交的表单在何处响应。

&emsp;&emsp;;`formtarget`属性值如下，其中具体差异 [参考](a.md#指定链接打开方式)。

- `_self`：在当前页面响应
- `_blank`：在新窗口响应
- `_parent`：在当前页面的父框架页面中响应
- `_top`：在当前页面的顶层框架页面中响应

```javascript
<form method="post" action="http://www.baidu.com">
    <input type="text">
    <button type="submit" formtarget="_blank">按钮</button>
</form>
```

### name

&emsp;&emsp;指定按钮的`name`属性，被单击时自身`name`与`value`属性值将被提交。

```javascript
<form method="post" action="http://www.baidu.com">
    <input type="text" name="value">
    <button type="submit" name="button" value="value">按钮</button>
</form>
```

&emsp;&emsp;输入框录入值，单击按钮。

![](/html/label/button/name.png)

&emsp;&emsp;其中`button`的`name`与`value`属性值均被提交。

![](/html/label/button/name-value.png)

### value

&emsp;&emsp;指定按钮的初始值，将作为`name`属性的键值提交。

### type

&emsp;&emsp;指定`button`的类型，其中可选值如下。

- `submit`：此按钮将表单数据提交至服务器。注意指定`type`为空或者错误值时也是`submit`类型
- `reset`：重置表单控件为初始值
- `button`：指定为普通按钮
- `menu`：打开一个由`menu`元素定义的菜单，此属性尚未在任何浏览器实现

```javascript
<button type="menu" menu="menu">Dropdown</button>
<menu id="menu">
    <menuitem>hello</menuitem>
    <menuitem>world</menuitem>
</menu>
```

## 兼容性

### button.value

&emsp;&emsp;如下获取`butoon`上的`value`属性。

```javascript
<button id="btn" value="hello button">按钮</button>
<script>
    var btn = document.getElementById('btn')
    console.log(btn.value)
</script>
```

&emsp;&emsp;;`IE8`以下浏览器，其获取的值等价于`button`的`innerText`。

![](/html/label/button/IE7.png)

&emsp;&emsp;;`IE8`及以上浏览器、`Chrome`、`Firefox`、`Opera`等，其获取的值为`button`的 `value`属性值。

![](/html/label/button/IE8.png)

&emsp;&emsp;兼容方式也很简单，即在获取 `button`元素的 `value`属性值时统一使用 `getAttribute`。

```javascript
btn.getAttribute("value")
```

### form post 请求参数

&emsp;&emsp;关联`form`表单的`type`属性值为`submit`的按钮，在点击提交表单数据时也会存在兼容性问题。

&emsp;&emsp;由于`IE`浏览器的控制台`F12`开启后，点击`button`提交表单，无论将`form`的`target`属性设置为`_self`还是`_blank`，控制台均会被关闭，因此`post`请求参数也无法查看。

&emsp;&emsp;客户端无法查看参数，换个思路从服务端中去打印请求参数。

```javascript
<form action="http://127.0.0.1:3000" method="post">
    <input type="text" name="input">
    <button name="reset" value="button">重置</button>
    <button type="submit" name="name" value="button">按钮</button>
</form>
```

&emsp;&emsp;;`IE8`及以上浏览器、`Chrome`、`FireFox`等。

![](/html/label/button/IE8-post.png)

&emsp;&emsp;;`IE8`以下浏览器，可以看出在提交表单时，会将表单内所有按钮都提交上去，并且提交的值并不是按钮的`value`值，而是等价于按钮`innerText`的值。

![](/html/label/button/IE7-post.png)
