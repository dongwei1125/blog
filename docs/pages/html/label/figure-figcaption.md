# Figure Figcaption

![](/html/label/figure-figcaption/banner.jpg)

## 概述

&emsp;&emsp;;[figure](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/figure) 用于定义一个可附加标题的内容元素，[figcaption](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/figcaption) 用于为`figure`元素添加标题和描述信息。

&emsp;&emsp;页面中的插图卡片比较常见，卡片中包含有图片的描述信息、标题或者按钮等。

![](/html/label/figure-figcaption/card.png)

&emsp;&emsp;一般的实现方式可能会用`div`元素设置`background: url()`的方式将图片作为背景，其余的描述信息和标题作为`div`的子元素。

&emsp;&emsp;或者是`div`元素内部添加`img`元素，其余的描述信息和标题则定位至图片上方。

&emsp;&emsp;虽然两者都能实现上面的卡片样式，但是`HTML`的结构和语义化不是非常明显。

&emsp;&emsp;以下`HTML`结构则非常清晰，`figure`表明一个插图卡片整体，`img`为插图，`figcaption`内部为图片的描述信息和标题。

```javascript
<figure>
    <img src="image.png" alt="">
    <figcaption>caption and descriptions</figcaption>
</figure>
```

&emsp;&emsp;因此`figure`元素的用处也非常明显了，但是`figure`元素的内容不仅限于图片，也可以包括表格、代码段、诗词等。

## 特性

- `figure / figcaption`为块级双标签，于`HTML5`中新增，浏览器支持程度比较高，`IE8`及以下不支持
- `figure`含有默认外边距，浏览器不同值大小不同。`figure`默认的宽度是`100%`，高度依赖于其内容高度
- `figure`可以有多个子元素，但是`figcaption`最好最多只有一个
- `figure`元素的其他内容应与主内容相关，同时其他内容的位置相对于主内容又是独立的。例如插图卡片中，描述信息和标题与图片相关，而描述信息和标题的位置和图片又是相互独立的，删除`figcaption`元素也不会影响整体

## 实例

### 图片

```javascript
<figure>
    <img src="image.png" alt="">
    <figcaption>caption and descriptions</figcaption>
</figure>
```

![](/html/label/figure-figcaption/image.png)

### 代码段

```javascript
<figure>
  <figcaption>code</figcaption>
  <pre>
    function log(val) {
        console.log(val)
    }
    
    log('hello world')
  </pre>
</figure>
```

![](/html/label/figure-figcaption/code.png)

### 引用文本

```javascript
<figure>
  <figcaption>Shakespeare: </figcaption>
  <blockquote>Nutrition books in the world. There is no book in life, there is no sunlight; wisdom without
        books, as if the birds do not have wings.</blockquote>
</figure>
```

![](/html/label/figure-figcaption/blockquote.png)

### 诗词

```javascript
<figure>
  <figcaption>滕王阁序</figcaption>
  <p>落霞与孤鹜齐飞，秋水共长天一色。</p>
</figure>
```

![](/html/label/figure-figcaption/p.png)

## 应用

&emsp;&emsp;;[tympanus](https://tympanus.net/Development/HoverEffectIdeas/index2.html) 中的插图卡片有很多的`hover`特效，都是利用`figure`和`figcaption`来实现的，接下来手动实现一种简单的。

![](/html/label/figure-figcaption/apply.gif)

&emsp;&emsp;首先构造 HTML 基础结构，字体和宽度稍作限制。

```javascript
figure {
    margin: auto;
    min-width: 320px;
    max-width: 480px;
    max-height: 360px;
    font-family: 'Raleway', Arial, sans-serif;
    cursor: pointer;
}

<figure>
    <img src="iamge.png" alt="">
    <figcaption></figcaption>
</figure>
```

&emsp;&emsp;;`figcaption`内是图片的描述信息和标题，将`figcaption`定位至`figure`上。

```javascript
figure {
    ...
    position: relative;
}

figcaption {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    padding: 2em;
    box-sizing: border-box;
}
```

&emsp;&emsp;完善`figcaption`内部结构。

```javascript
<figcaption>
  <h2>Messy<span>Duke</span></h2>
  <p>Duke is very bored. When he looks at the sky, he feels to run.</p>
</figcaption>
```

&emsp;&emsp;插图卡片暂时如下。

![](/html/label/figure-figcaption/static.png)

&emsp;&emsp;文字颜色修改并居中，`h2`内字体稍作调，比例缩小`0.8`，并显示为大写。

```javascript
figcaption {
    ...
    color: #fff;
    text-align: center;
}

figure h2 {
    margin: 0;
    font-size: 30px;
    font-weight: 300;
    text-transform: uppercase;
    transform: scale(0.8);
}

figure h2 span {
    font-weight: 600;
}
```

&emsp;&emsp;调整`p`标签位置，比例缩小`0.8`。

```javascript
figure p {
    position: absolute;
    left: 0;
    bottom: 30px;
    margin: 20px;
    padding: 30px;
    border: 2px solid #fff;
    font-size: 18px;
    transform: scale(0.8);
}
```

&emsp;&emsp;插图卡片初步完成。

![](/html/label/figure-figcaption/original.png)

&emsp;&emsp;再考虑鼠标悬浮样式，鼠标悬浮后图片放大`2`倍，透明度由`0.8`到`0.1`，字体均恢复原本大小，`p`标签由透明度`0`到`1`。

```javascript
figure{
    ...
    overflow: hidden;
}

figure p {
    ...
    opacity: 0;
}

figure img {
    opacity: 0.8;
}

figure:hover img{
    opacity: 0.1,
    transform: scale(2);
}

figure:hover h2{
    transform: scale(1);
}

figure:hover p{
    transform: scale(1);
    bottom: 0;
    opacity: 1;
}
```

&emsp;&emsp;查看下悬浮效果。

![](/html/label/figure-figcaption/hover.gif)

&emsp;&emsp;看着感觉很奇怪，`figure`加上渐变背景色试试。

```javascript
figure{
    ...
    background: linear-gradient(-45deg, #34495e 0%, #cc6055 100%);
}
```

&emsp;&emsp;有那味了！

![](/html/label/figure-figcaption/active.gif)

&emsp;&emsp;每个元素再添加上过渡。

```javascript
figure h2 {
    ...
    transition: transform 0.35s;
}

figure p {
    ...
    transition: opacity 0.35s, transform 0.35s, bottom 0.35s;
}

figure img {
    ...
    transition: opacity 0.35s, transform 0.35s;
}
```

&emsp;&emsp;来看看最终效果。

![](/html/label/figure-figcaption/transform.gif)

&emsp;&emsp;可以尝试性删除`figcaption`元素来验证最后一条特性，发现对整体页面结构几乎没有影响。

&emsp;&emsp;贴一份完整代码。

```javascript
<style>
    figure {
        margin: auto;
        min-width: 320px;
        max-width: 480px;
        max-height: 360px;
        position: relative;
        font-family: 'Raleway', Arial, sans-serif;
        overflow: hidden;
        background: linear-gradient(-45deg, #34495e 0%, #cc6055 100%);
        cursor: pointer;
    }

    figcaption {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        padding: 2em;
        box-sizing: border-box;
        color: #fff;
        text-align: center;
    }

    figure h2 {
        margin: 0;
        font-size: 30px;
        font-weight: 300;
        text-transform: uppercase;
        transform: scale(0.8);
        transition: transform 0.35s;
    }

    figure h2 span {
        font-weight: 600;
    }

    figure p {
        position: absolute;
        left: 0;
        bottom: 30px;
        margin: 20px;
        padding: 30px;
        border: 2px solid #fff;
        font-size: 18px;
        transform: scale(0.8);
        opacity: 0;
        transition: opacity 0.35s, transform 0.35s, bottom 0.35s;
    }

    figure img {
        opacity: 0.8;
        transition: opacity 0.35s, transform 0.35s;
    }

    figure:hover img {
        opacity: 0.1;
        transform: scale(2);
    }

    figure:hover h2 {
        transform: scale(1);
    }

    figure:hover p {
        transform: scale(1);
        bottom: 0;
        opacity: 1;
    }
</style>

<body>
    <figure>
        <img src="image.png" alt="">
        <figcaption>
            <h2>Messy<span>Duke</span></h2>
            <p>Duke is very bored. When he looks at the sky, he feels to run.</p>
        </figcaption>
    </figure>
</body>
```

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125)、[Blog](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~