# Fieldset

![](/html/label/fieldset/banner.jpg)

&emsp;&emsp;;[fieldset](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/fieldset) 用于对表单中的控件元素进行分组。

&emsp;&emsp;;`fieldset`是块级双标签，绝大多数浏览器都支持。

## 属性

### disabled

&emsp;&emsp;;`fieldset`的所有子代控件均会继承，即不可编辑状态。

```javascript
<form method="post" action="http://www.baidu.com">
    <div>
        <label for="username">用户名</label>
        <input type="text" name="username">
    </div>
    <fieldset disabled>
        <legend>支付信息</legend>
        <div>
            <label for="phone">手机号</label>
            <input type="text" name="phone">
        </div>
        <div>
            <label for="type">支付方式</label>
            <input type="radio" name='type' value="1" id="type-1"><label for="type-1">现金</label>
            <input type="radio" name='type' value="0" id="type-0"><label for="type-0">其他</label>
        </div>
    </fieldset>
    <button type="submit">提交</button>
</form>
```

&emsp;&emsp;;`Chrome`浏览器呈现，禁用后鼠标、键盘`Tab`均无法选中。

![](/html/label/fieldset/Chrome.png)

&emsp;&emsp;但是`IE`浏览器较为特殊，不仅可以输入，还能触发输入事件。

![](/html/label/fieldset/IE.gif)

&emsp;&emsp;更糟糕的是`fieldset`内部的按钮，点击还会触发事件。

![](/html/label/fieldset/event.gif)

&emsp;&emsp;兼容`IE11`浏览器。

```javascript
fieldset[disabled] {
    pointer-events: none;
}
```

&emsp;&emsp;兼容`IE9`、`IE10`。

```javascript
fieldset {
    position: relative;
}

fieldset[disabled]::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0);
}
```

&emsp;&emsp;;`IE8`及以下浏览器，样式处理较麻烦，可采用`js`处理。

```javascript
<body>
    ...
    <script>
        function forEach(array, callback) {
            for (var i = 0; i < array.length; i++) {
                callback(array[i], i, array)
            }
        }

        var fieldsets = document.getElementsByTagName('fieldset')
        var inputs = []
        var buttons = []

        forEach(fieldsets, function (fieldset) {
            if (fieldset.disabled) {
                buttons = fieldset.getElementsByTagName('button')
                inputs = fieldset.getElementsByTagName('input')

                forEach(buttons, function (button) {
                    button.disabled = true
                })

                forEach(inputs, function (input) {
                    input.disabled = true
                })
            }
        })
    </script>
</body>
```

&emsp;&emsp;在表单提交时，即使不可编辑状态的控件中含有默认值，也不会伴随`form`一起提交。

![](/html/label/fieldset/form.png)

&emsp;&emsp;提交时请求参数。

![](/html/label/fieldset/params.png)

### form

&emsp;&emsp;将`fieldset`关联为`form`的一部分，但是浏览器支持程度比较低。

&emsp;&emsp;如下`fieldset`绑定`form`的`id`属性，实现表单控件在`form`外部关联上了`form`。

```javascript
<form method="post" id="form" action="http://www.baidu.com">
    <div>
        <label for="username">用户名</label>
        <input type="text" name="username">
    </div>
    <button type="submit">提交</button>
</form>
<fieldset form="form">
    <legend>支付信息</legend>
    <div>
        <label for="phone">手机号</label>
        <input type="text" name="phone">
    </div>
    <div>
        <label for="type">支付方式</label>
        <input type="radio" name='type' value="1" id="type-1"><label for="type-1">现金</label>
        <input type="radio" name='type' value="0" id="type-0"><label for="type-0">其他</label>
    </div>
</fieldset>
```

## 样式

&emsp;&emsp;;`fieldset`默认包括内外边距，同时周围有一个非完全闭合的边框，可通过`border`属性修改其颜色和宽度等。

&emsp;&emsp;注意边框线没有从文字上面穿过去，而是文字垂直居中压在边框线上，文字背景色是透明而非白色。

![](/html/label/fieldset/style.png)

&emsp;&emsp;若通过`CSS`模拟，定位文本到边框上是没法实现的，文字必然要设置白色背景色才能遮住边框，但是若`fieldset`的背景色为非白色，就会出现问题。

&emsp;&emsp;另外一种可行的方式是文字和两个元素，其中两个元素需设置宽度和`1px`高度，三元素垂直方向居中对齐，但是最终实现效果也只能接近`fileldset`。

### 文本位置和样式

&emsp;&emsp;;`fieldset`开口处的文字是`legend`元素渲染的，因此可修改`legend`元素的`CSS`属性来调整文本样式。

&emsp;&emsp;可调整`legend`左右内边距来控制文字左右留白。

```javascript
legend {
    padding: 0 50px;
}
```

![](/html/label/fieldset/legend.png)

&emsp;&emsp;调整`legend`左外边距来控制文字位置，注意设置`margin: auto`可水平居中文字。

```javascript
legend {
    padding: 0;
    animation: marginLeft 2s infinite alternate;
}

@keyframes marginLeft {
    100% {
        margin-left: 160px;
    }
}
```

![](/html/label/fieldset/margin.gif)

&emsp;&emsp;也可设置`text-align`属性控制文字位置。

```javascript
legend {
    padding: 0;
    text-align: right;
}
```

![](/html/label/fieldset/text-align.png)

### 应用场景

#### 分割线

&emsp;&emsp;如下文字两侧带横线。

![](/html/label/fieldset/hr.png)

&emsp;&emsp;一般可通过伪元素实现，宽度自适应，浏览器兼容方面`IE10`及以下不兼容。

```javascript
.hr {
    display: flex;
    align-items: center;
}

.hr::after,
.hr::before{
    content: '';
    flex: 1;
    height: 1px;
    background: #000;
}

.hr::before {
    margin-right: 10px;
}

.hr::after {
    margin-left: 10px;
}

<div class="hr">分隔线</div>
```

&emsp;&emsp;以下仅`fieldset`和`legend`两元素，宽度自适应，浏览器兼容性良好，`IE7`及以下不兼容。

```javascript
fieldset {
    padding: 0;
    margin: 0;
    border: none;
    border-top: 1px solid #000;
}

legend {
    margin: auto;
    padding: 0 10px;
}

<fieldset><legend>分割线</legend></fieldset>
```

#### 文字环绕

![](/html/label/fieldset/transform.gif)

&emsp;&emsp;由四个`fieldset`定位叠加形成，貌似除了炫酷点实际没啥用处。

```javascript
.container {
    position: relative;
    width: 300px;
    height: 300px;
}

fieldset {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
    border-top: 10px solid #000;
    box-sizing: border-box;
}

legend {
    font-size: 24px;
    line-height: 10px;
    font-weight: bold;
    padding: 0 10px;
    animation: move 2s infinite linear alternate;
}

fieldset:nth-of-type(2) {
    transform: rotate(90deg);
}

fieldset:nth-of-type(3),
fieldset:nth-of-type(3) legend {
    transform: rotate(180deg);
}

fieldset:nth-of-type(4) {
    transform: rotate(-90deg);
}


@keyframes move {
    100% {
        margin-left: 70px;
    }
}

<div class="container">
    <fieldset><legend>CSS</legend></fieldset>
    <fieldset><legend>HTML</legend></fieldset>
    <fieldset><legend>JavaScript</legend></fieldset>
    <fieldset><legend>TypeScript</legend></fieldset>
</div>
```
