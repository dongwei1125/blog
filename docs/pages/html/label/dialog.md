# Dialog

![](/html/label/dialog/banner.jpg)

&emsp;&emsp;;[dialog](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/dialog) 是`HTML5`新增的语义化双标签，用于展示一个交互式的模态对话框。

&emsp;&emsp;绝大多数浏览器都不支持，仅有`Chrome`等浏览器支持。

## 属性

### open

&emsp;&emsp;用于控制模态框的显隐，即含有`open`属性就显示，否则隐藏。

```javascript
<dialog open>
  <p>hello world</p>
</dialog>
```

&emsp;&emsp;浏览器呈现如下，含有部分默认样式，并且仅水平方向居中。

![](/html/label/dialog/open-center.png)

&emsp;&emsp;显示时样式。

![](/html/label/dialog/open-show.png)

&emsp;&emsp;隐藏时样式。

![](/html/label/dialog/open-hidden.png)

### returnValue

&emsp;&emsp;保留`close`方法传入的参数。

## 方法

### show()

&emsp;&emsp;显示模态框，对其添加`open`属性。

```javascript
<button>show</button>
<dialog>
  <p>hello world</p>
</dialog>

<script>
  var btn = document.querySelector('button')
  var dialog = document.querySelector('dialog')

  btn.addEventListener('click', () => {
    dialog.show()
  })
</script>
```

![](/html/label/dialog/show().gif)

### showModel()

&emsp;&emsp;显示模态框，对其添加`open`属性并且显示遮罩框，同时监控按键`ESC`（按下即关闭）。

```javascript
<button>showModal</button>
<dialog>
  <p>hello world</p>
</dialog>

<script>
  var btn = document.querySelector('button')
  var dialog = document.querySelector('dialog')

  btn.addEventListener('click', () => {
    dialog.showModal()
  })
</script>
```

&emsp;&emsp;如下单击`showModal`显示，按下`ESC`关闭。

![](/html/label/dialog/showModel().gif)

&emsp;&emsp;也可以关闭`ESC`的默认行为。

```javascript
document.onkeydown = (ev) => {
  if (ev.key === "Escape") {
    ev.preventDefault()
  }
}
```

### close()

&emsp;&emsp;关闭模态框，删除其`open`属性，同时将`close`方法参数保留至`dialog.returnValue`属性上。

```javascript
<button class="show">showModal</button>
<button class="returnValue">returnValue</button>
<dialog>
  <p>hello world</p>
  <button class="close">close</button>
</dialog>

<script>
  var showBtn = document.querySelector('.show')
  var closeBtn = document.querySelector('.close')
  var returnValueBtn = document.querySelector('.returnValue')
  var dialog = document.querySelector('dialog')

  showBtn.addEventListener('click', () => {
    dialog.showModal()
  })

  closeBtn.addEventListener('click', () => {
    dialog.close('hello world')
  })

  returnValueBtn.addEventListener('click', () => {
    console.log(dialog.returnValue)
  })
</script>
```

![](/html/label/dialog/close().gif)

## 事件

### close

&emsp;&emsp;当模态框关闭时触发。

```javascript
<dialog open>
  <p>hello world</p>
  <button>close</button>
</dialog>

<script>
  var btn = document.querySelector('button')
  var dialog = document.querySelector('dialog')

  btn.addEventListener('click', () => {
    dialog.close()
  })

  dialog.addEventListener('close', (ev) => {
    console.log('close')
  })
</script>
```

![](/html/label/dialog/close.gif)

&emsp;&emsp;一种比较特殊的情况是，若`dialog`元素中包含有`form`表单，且`form`的`method`属性为`dialog`，同时`form`中含有提交按钮，按钮点击时会关闭模态框并触发`close`事件。

```javascript
<style>
    dialog::backdrop {
        background: rgba(0, 0, 0, 0.5);
    }
</style>

<body>
    <button>showModal</button>
    <dialog>
        <form method="dialog">
            <div>
                <input type="text">用户
            </div>
            <button type="submit">提交</button>
        </form>
    </dialog>

    <script>
        var btn = document.querySelector('button')
        var dialog = document.querySelector('dialog')

        btn.addEventListener('click', () => {
            dialog.showModal()
        })

        dialog.addEventListener('close', (ev) => {
            console.log('close')
        })
    </script>
</body>
```

![](/html/label/dialog/close-dialog.gif)

### cancel

&emsp;&emsp;当按下`ESC`关闭模态框时触发。

```javascript
<button>showModal</button>
<dialog>
  <p>hello world</p>
</dialog>

<script>
  var btn = document.querySelector('button')
  var dialog = document.querySelector('dialog')

  btn.addEventListener('click', () => {
    dialog.showModal()
  })

  dialog.addEventListener('cancel', (ev) => {
    console.log('cancel')
  })
</script>
```

![](/html/label/dialog/cancel.gif)

## 应用场景

### 嵌套模态框

&emsp;&emsp;模态框嵌套时，若遮罩背景色均有透明度，视觉效果上会产生叠加。

```javascript
<style>
    dialog::backdrop {
        background: rgba(0, 0, 0, 0.5);
    }
</style>

<button class='outer-btn'>打开外层模态框</button>

<dialog class="outer-dig">
    <p>hello world</p>
    <button class="outer-close-btn">关闭</button>
    <button class="outer-open-btn">打开内层模态框</button>
</dialog>

<dialog class="inner-dig">
    <p>hello world</p>
    <button class="inner-close-btn">关闭</button>
</dialog>

<script>
    var outerBtn = document.querySelector('.outer-btn')
    var outerCloseBtn = document.querySelector('.outer-close-btn')
    var outerOpenBtn = document.querySelector('.outer-open-btn')
    var innerCloseBtn = document.querySelector('.inner-close-btn')
    var outerDig = document.querySelector('.outer-dig')
    var innerDig = document.querySelector('.inner-dig')

    outerBtn.addEventListener('click', () => {
        outerDig.showModal()
    })

    outerOpenBtn.addEventListener('click', () => {
        innerDig.showModal()
    })

    outerCloseBtn.addEventListener('click', () => {
        outerDig.close()
    })

    innerCloseBtn.addEventListener('click', () => {
        innerDig.close()
    })
</script>
```

![](/html/label/dialog/nest-model.gif)

### 点击 modal 关闭 Dialog

&emsp;&emsp;参考`element ui`的 [Dialog](https://element.eleme.cn/#/zh-CN/component/dialog) 组件，其添加`close-on-click-modal`属性后可以通过点击`modal`关闭`Dialog`。

&emsp;&emsp;因此首先需要实现点击`modal`关闭`Dialog`。

```javascript
<style>
    dialog::backdrop {
        background: rgba(0, 0, 0, 0.5);
    }
</style>

<button>showModal</button>
<dialog>
    <p>hello world</p>
</dialog>

<script>
    var btn = document.querySelector('button')
    var dialog = document.querySelector('dialog')

    btn.addEventListener('click', () => {
        dialog.showModal()
    })

    dialog.addEventListener('click', (ev) => {
        console.log(ev.target)
    })
</script>
```

&emsp;&emsp;;`dialog`默认含`1em`的内边距和边框，点击`p`标签周围空白区域也会打印`dialog`。

![](/html/label/dialog/model-border.gif)

&emsp;&emsp;因此将`dialog`的内边距和边框均去除，在其内部创建`div`元素。

```javascript
dialog {
    padding: 0;
    border: none;
}

dialog .content {
    padding: 1em;
}

<dialog>
    <div class="content">
        <p>hello world</p>
    </div>
</dialog>
```

![](/html/label/dialog/model-noborder.gif)

&emsp;&emsp;然后再根据节点的`nodeName`判断是否关闭`Dialog`。

```javascript
dialog.addEventListener("click", function(ev) {
  if (ev.target.nodeName === "DIALOG") this.close()
})
```

&emsp;&emsp;最后考虑添加`close-on-click-modal`属性开启此功能，同时封装`js`和样式为`Dialog`模块。

&emsp;&emsp;创建`dialog`文件夹，新增`index.css`和`index.js`，注意不要通过`window.onload = function(){}`添加事件，因为引入后外部可能会覆盖掉`window.onload`，造成功能失效。

```javascript
// dialog/index.css
dialog {
    padding: 0;
    border: none;
}

dialog .content {
    padding: 1em;
}

dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
}

// dialog/index.js
window.addEventListener('load', () => {
    document.querySelectorAll('dialog[close-on-click-modal]').forEach(dialog => {
        dialog.addEventListener('click', function (ev) {
            if (ev.target.nodeName === 'DIALOG') this.close()
        })
    })
})
```

&emsp;&emsp;;`html`引入`dialog`模块。

```javascript
<head>
    <script src="dialog/index.js"></script>
    <link rel="stylesheet" href="dialog/index.css">
</head>

<body>
    <button>showModal</button>
    <dialog close-on-click-modal>
        <div class="content">
            <p>hello world</p>
        </div>
    </dialog>

    <script>
        window.onload = () => {
            var btn = document.querySelector('button')
            var dialog = document.querySelector('dialog')

            btn.addEventListener('click', () => {
                dialog.showModal()
            })
        }
    </script>
</body>
```

![](/html/label/dialog/model-finally.gif)

### 过渡动画

&emsp;&emsp;由于模态框隐藏时`display`属性为`none`，而`transition`是无法对此实现过渡的，因此使用`visibility`替代。

```javascript
dialog:not([open]) {
    opacity: 0;
    visibility: hidden;
    display: block;
}

dialog {
    opacity: 1;
    transition: opacity 2s ease;
}
```

![](/html/label/dialog/transition.gif)

## Polyfill

&emsp;&emsp;;`dialog`浏览器支持程度较低，兼容性方面可以考虑 [dialog-polyfill](https://github.com/GoogleChrome/dialog-polyfill)。

&emsp;&emsp;注意`backdrop`的样式在`polyfill`时，要通过`dialog+.backdrop`指定样式。

```javascript
<head>
    <link rel="stylesheet" href="node_modules/dialog-polyfill/dialog-polyfill.css">
    <style>
        dialog::backdrop {
            background: rgba(0, 0, 0, 0.5);
        }

        dialog+.backdrop {
            background: rgba(0, 0, 0, 0.5);
        }

        dialog {
            padding: 0;
            border: none;
        }

        dialog .content {
            padding: 1em;
        }

        dialog:not([open]) {
            opacity: 0;
            visibility: hidden;
            display: block;
        }

        dialog {
            opacity: 1;
            transition: opacity 2s ease;
        }
    </style>
</head>

<body>
    <button>showModal</button>
    <dialog>
        <div class="content">
            <p>hello world</p>
        </div>
    </dialog>

    <script src="node_modules/dialog-polyfill/dist/dialog-polyfill.js"></script>
    <script>
        var btn = document.querySelector('button')
        var dialog = document.querySelector('dialog')

        dialogPolyfill.registerDialog(dialog)
        btn.addEventListener('click', () => {
            dialog.showModal()
        })
    </script>
</body>
```

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125)、[Blog](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~