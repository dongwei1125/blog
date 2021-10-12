# Col Colgroup

![](/html/label/col-colgroup/banner.jpg)

## col

&emsp;&emsp;;[col](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/col) 用于定义表格中的列。

&emsp;&emsp;;`col`为表格内单标签元素，只能在`table`元素或者`colgroup`元素中使用。

&emsp;&emsp;其属性值主要包括如下几种，均能通过`CSS`属性实现。

- `span`：指定`col`元素横跨的列数，此属性值为正整数，默认值为`1`
- `align`：指定`col`元素关联的列的内容的水平对齐方式，包括`left`（左对齐）、`center`（居中对齐）、`right`（右对齐）、`char`等，注意此属性`HTML5`已废弃，仅`IE7`及以下等浏览器可用，绝大多数浏览器已不再支持
- `bgcolor`：指定`col`元素关联的列的背景色，其属性值可指定`rgba`、`rgb`、`hex`和颜色名称，注意此属性为非标准属性，不同浏览器对此属性支持度不一致
- `valign`：指定`col`元素关联的列的内容的垂直对齐方式，包括`top`（顶端对齐）、`middle`（居中对齐）、`bottom`（底部对齐）、`baseline`（基线对齐），注意此属性`HTML5`也已废弃，不同浏览器支持程度不一致
- `width`：指定`col`元素关联的列的宽度，值为`px`宽度或者百分比，注意`HTML5`已废弃，绝大多数浏览器支持
- `char`：`align`属性设置为`char`时生效，用于指定某列以某个字符对齐，注意`HTML5`不再支持此属性，且大部分浏览器不支持
- `charoff`：`align`属性设置为`char`时生效，规定内容相对于`char`属性指定的字符的偏移量

### span

&emsp;&emsp;;`span`指定横跨的列数，不指定或指定为空默认为`1`，通过指定`col`的样式作用于列上。绝大多数浏览器都兼容`col`的`span`属性。

```javascript
<style>
    td {
        width: 240px;
        height: 30px;
    }

    .col-1 {
        background: lightblue;
    }

    .col-23 {
        background: pink;
    }
</style>

<table border="1">
    <col class="col-1">
    <col span="2" class="col-23">
    <tr>
        <th>Index</th>
        <th>Language</th>
        <th>Proportion</th>
    </tr>
    <tr>
        <td>1</td>
        <td>HTML</td>
        <td>20.36%</td>
    </tr>
    <tr>
        <td>2</td>
        <td>CSS</td>
        <td>19.64%</td>
    </tr>
    <tr>
        <td>3</td>
        <td>JavaScript</td>
        <td>160.00%</td>
    </tr>
</table>
```

&emsp;&emsp;样式呈现如下，`col-1`指定第一列，`col-23`指定第二列和第三列。

![](/html/label/col-colgroup/span.png)

&emsp;&emsp;也可通过`CSS`实现`col`的`span`属性。

```javascript
td:nth-child(1),
th:nth-child(1){
    background: lightblue;
}

td:nth-child(2),
th:nth-child(2),
td:nth-child(3),
th:nth-child(3) {
    background: pink;
}
```

&emsp;&emsp;;`IE8`及以下浏览器不支持`nth-child`，可利用相邻选择器`+`兼容。`IE5`不支持相邻选择器则可指定`class`类名实现。

```javascript
td,
th {
    background: lightblue;
}

td+td,
td+td+td,
th+th,
th+th+th {
    background: pink;
}
```

### align

&emsp;&emsp;指定`col`关联的列的对齐方式，默认为左对齐，仅`IE7`及以下等浏览器支持。

```javascript
<style>
    td {
        width: 240px;
        height: 30px;
    }
</style>

<table border="1">
    <col align="center">
    <col align="right">
    ...
</table>
```

&emsp;&emsp;;`IE7`呈现效果如下。

![](/html/label/col-colgroup/align.png)

&emsp;&emsp;也可通过`CSS`属性实现，其中兼容性方面参考`span`属性。

```javascript
td:nth-child(1),
th:nth-child(1){
    text-align: center;
}

td:nth-child(2),
th:nth-child(2) {
    text-align: right;
}

<table border="1">
    ...
</table>
```

### bgcolor

&emsp;&emsp;非标准属性，浏览器支持度不一，指定`col`关联的列的背景色。

```javascript
<table border="1">
    <col bgcolor="lightblue">
    <col bgcolor="#ccc">
    <col bgcolor="rgb(0,0,255,0.9)">
    ...
</table>
```

&emsp;&emsp;如下为`Chrome`浏览器呈现样式，也可通过`CSS`属性实现。

![](/html/label/col-colgroup/bgcolor.png)

### valign

&emsp;&emsp;指定`col`关联的列的垂直对齐方式，不同浏览器支持不一。

```javascript
<style>
    td {
        width: 240px;
        height: 50px;
    }
</style>

<table border="1">
    <col valign="top">
    <col valign="bottom">
    ...
</table>
```

&emsp;&emsp;如下为`IE11`浏览器呈现样式。

![](/html/label/col-colgroup/valign.png)

&emsp;&emsp;也可通过 `CSS`属性实现。

```javascript
td:nth-child(1),
th:nth-child(1){
    vertical-align: top;
}

td:nth-child(2),
th:nth-child(2) {
    vertical-align: bottom;
}

<table border="1">
    ...
</table>
```

### width

&emsp;&emsp;指定`col`关联的列的宽度。

```javascript
<style>
    td {
        height: 30px;
    }
</style>

<table border="1">
    <col width="120px">
    <col width="360px">
    <col width="240px">
    ...
</table>
```

&emsp;&emsp;浏览器呈现效果如下。

![](/html/label/col-colgroup/width.png)

&emsp;&emsp;也可指定`col`的样式作用于列上。

```javascript
.col-1 {
    width: 120px;
}

.col-2 {
    width: 360px;
}

.col-3 {
    width: 240px;
}

 <table border="1">
    <col class="col-1">
    <col class="col-2">
    <col class="col-3">
    ...
</table>
```

&emsp;&emsp;或者也可指定`CSS`样式，其中兼容性方面也可参考`span`属性。

```javascript
td:nth-child(1),
th:nth-child(1) {
    width: 120px;
}

td:nth-child(2),
th:nth-child(2) {
    width: 360px;
}

td:nth-child(3),
th:nth-child(3) {
    width: 240px;
}
```

### char

&emsp;&emsp;指定列以某个字符对齐，需指定`align`为`char`属性值，注意大部分浏览器都不支持。

```javascript
<style>
    td {
        width: 240px;
        height: 30px;
    }
</style>

<table border="1">
    <col>
    <col>
    <col align="char" char=".">
    ...
</table>
```

&emsp;&emsp;模拟呈现效果如下。

![](/html/label/col-colgroup/char.png)

### charoff

&emsp;&emsp;规定内容相对于`char`属性指定的字符的偏移量，其中正数为右偏移，负数为左偏移。

```javascript
<style>
    td {
        width: 240px;
        height: 30px;
    }
</style>

<table border="1">
    <col>
    <col>
    <col align="char" char="." charoff="2">
    ...
</table>
```

&emsp;&emsp;如下为模拟呈现效果，即以字符`.`对齐后再往右偏移`2`个字符。

![](/html/label/col-colgroup/charoff.png)

## colgroup

&emsp;&emsp;;[colgroup](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/colgroup) 用于定义表格中的一组列。

&emsp;&emsp;;`colgroup`为单标签元素，且只能在`table`内。

&emsp;&emsp;不包含`col`子元素的`colgroup`，标签`colgroup`等价于`col`，且`colgroup`与`col`的属性的表现形式完全一致，包括`span`、`align`、`bgcolor`、`valign`、`width`、`char`、`charoff`。

&emsp;&emsp;含有`col`子元素的`colgroup`，只要`colgroup`内部包含`col`，`colgroup`的`span`属性就会被忽略。并且内部`col`的样式或属性默认继承至`colgroup`，若`col`自身指定了样式或属性，则会覆盖继承的样式或属性。

```javascript
<style>
    td {
        height: 30px;
    }

    colgroup {
        background: lightblue;
    }

    .col-2 {
        background: pink;
    }
</style>

<table border="1">
        <colgroup span="2" width="180px">
    		<col>
    		<col class="col-2" width="360px">
    		<col>
		</colgroup>
        <tr>
            <th>Index</th>
            <th>Language</th>
            <th>Proportion</th>
        </tr>
        <tr>
            <td>1</td>
            <td>HTML</td>
            <td>20.36%</td>
        </tr>
        <tr>
            <td>2</td>
            <td>CSS</td>
            <td>19.64%</td>
        </tr>
        <tr>
            <td>3</td>
            <td>JavaScript</td>
            <td>160.00%</td>
        </tr>
</table>
```

&emsp;&emsp;如下`colgroup`的`span="2"`属性被忽略，第一列和第三列的样式（`background: lightblue`）和属性（`width="120px"`）继承至`colgroup`，而第二列则覆盖了继承的样式和属性。

![](/html/label/col-colgroup/colgroup.png)
