# Form

![](/html/label/form/banner.jpg)

&emsp;&emsp;;[form](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/form) 是块级双标签，用于指定一个表单区域，并向服务器提交信息。

## 属性

### 常用属性

- `action`：指定表单提交的`URL`，表单内提交按钮的`formaction`属性会覆盖此属性
- `enctype`：指定表单的数据编码方式，表单内提交按钮的`formenctype`属性会覆盖此属性
- `method`：指定表单的请求方式，表单内提交按钮的`formmethod`属性会覆盖此属性。另外若表单在`dialog`元素中，指定`method`为`dialog`将在提交时关闭模态框，[详细参考](dialog.md#close-2)
- `target`：表示表单提交时于何处响应，表单内提交按钮的`formtarget`属性会覆盖此属性
- `novalidate`：指定后表单提交时不用验证数据，表单内提交按钮的`formnovalidate`属性会覆盖此属性，关于表单内提交按钮覆盖情况，[详细参考](button.md#formnovalidate)

### accept

&emsp;&emsp;指定表单内的上传控件可接受的文件类型（[MIME](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/MIME_types) 类型），可指定多个。注意几乎所有的浏览器都不支持，此属性已在`HTML5`中被移除不再使用，替代方式则是上传控件单独指定`accept`属性。

```javascript
<form action="" method="post" accept="image/png, image/gif">
    <input type="file">
    <button type="submit">提交</button>
</form>
```

&emsp;&emsp;如下为模拟呈现。

![](/html/label/form/accept.png)

### accept-charset

&emsp;&emsp;规定服务器以何种字符集处理表单数据，浏览器中每种内容类型的默认值通常是正确的，所以一般不用设置。

&emsp;&emsp;常用值包括如下。

- `UTF-8`：`unicode`字符编码
- `ISO-8859-1` ：拉丁字母表的字符编码
- `gb2312`：简体中文字符集

```javascript
<form action="" method="post" accept-charset="UTF-8, ISO-8859-1">
  ...
</form>
```

### autocapitalize

&emsp;&emsp;;`Safari`浏览器独有的非标准属性，在表单的后代控件中，输入文本时，此属性可控制文本值的首字母是否大写等其它样式。

&emsp;&emsp;可选值包括如下。

- `none`：禁用首字母大写
- `sentences`：对每句文本首字母大写
- `words`：每个单词首字母大写
- `characters`：大写所有字母

```javascript
<form action="" method="post" autocapitalize="words">
  ...
</form>
```

### autocomplete

&emsp;&emsp;输入框是否自动补全，默认值为`on`（启用自动补全），`off`（禁用）。

```javascript
<form action="" method="post" autocomplete="on">
    <input type="text" name="username"><br>
    <button type="submit">提交</button>
</form>
```

&emsp;&emsp;注意输入控件需指定`name`属性，浏览器会根据此属性，查找出此属性之前**输入并提交**过的值。若不指定`name`属性，此属性将不生效。

![](/html/label/form/autocomplete.gif)

## 方法

### checkValidity

&emsp;&emsp;用于返回表单或者表单元素是否验证通过，返回值为布尔值。

&emsp;&emsp;绝大多数浏览器支持，`IE9`及以下浏览器不支持。

```javascript
<form action="">
    <input type="input" required>
    <button type="button">提交</button>
</form>
<script>
    const form = document.querySelector('form')
    const input = document.querySelector('input')
    const btn = document.querySelector('button')

    btn.addEventListener('click', () => {
        console.log('input:', form.checkValidity())
        console.log('form:', form.checkValidity())
    })
</script>
```

![](/html/label/form/checkValidity.gif)

### reportValidity

&emsp;&emsp;验证表单或者表单元素并且触发浏览器的内置验证提示交互，返回值为布尔值，`IE11`及以下浏览器不支持。

```javascript
<form action="">
    <input type="input" required>
    <button type="button">提交</button>
</form>
<script>
    const form = document.querySelector('form')
    const btn = document.querySelector('button')

    btn.addEventListener('click', function(){
        console.log('form:', form.reportValidity())
    })
</script>
```

![](/html/label/form/reportValidity.gif)

### setCustomValidity

&emsp;&emsp;自定义表单元素的提示文字，`IE9`及以下浏览器不支持。

```javascript
const input = document.querySelector("input")

input.setCustomValidity("请输入文字")
```

![](/html/label/form/setCustomValidity.png)

## 属性

### validity

&emsp;&emsp;返回表单元素的各种验证状态，返回结果为 [ValidityState](https://developer.mozilla.org/zh-CN/docs/Web/API/ValidityState) 对象。

&emsp;&emsp;;`IE9`及以下浏览器不支持。

&emsp;&emsp;如下为`Chrome`浏览器包含的只读属性和属性值。

```javascript
const input = document.querySelector("input")

console.log(input.validity)
```

![](/html/label/form/validity.png)

- `badInput`：输入框的值浏览器无法转换。例如`number`类型输入框输入`3.14-2`，此时返回`true`，注意`IE`浏览器不支持此属性
- `customError`：元素是否调用`setCustomValidity`方法自定义验证规则
- `patternMismatch`：输入框的值与指定的`pattern`正则不匹配返回`true`（可用`:invalid`伪类修改样式），否则为`false`

```javascript
input {
    outline: none;
}

input:valid {
    border: 1px solid #409eff;
}

input:invalid {
    border: 1px solid #f56c6c;
}

<form>
    <input type="text" pattern="[a-z]{5}" /><br>
    <button type="button">提交</button>
</form>
<script>
    const input = document.querySelector('input')
    const btn = document.querySelector('button')

    btn.addEventListener('click', () => {
        console.log('patternMismatch:', input.validity.patternMismatch)
    })
</script>
```

&emsp;&emsp;如下为配合`:invalid`伪类实现的输入验证。

![](/html/label/form/validity-invalid.gif)

- `rangeOverflow`：与元素`max`属性规定的最大值比较，超过返回`true`，否则为`false`。例如`number`类型输入框的属性`max="5"`，输入值为`8`则返回`true`（可用`:out-of-range`或`:invalid`伪类修改样式）
- `rangeUnderflow`：与元素`min`属性规定的最小值比较，小于返回`true`，否则为`false`，为`true`时也可用`:out-of-range`或`:invalid`伪类修改样式
- `stepMismatch`：输入框的值与`step`属性值不匹配时返回`true`，或者说输入框的值无法整除`step`。例如`number`类型输入框的属性`step="30"`，输入值为`-60`、`-30`、`0`、`30`、`60`等均返回`false`，而非`30`倍数均返回`true`（也可用`:invalid`伪类修改样式 ）
- `tooLong`：输入内容长度大于元素`maxlength`时返回`true`，否则为`false`，为`true`时也可用`:invalid`伪类修改样式

```javascript
input:invalid {
    outline: none;
    border: 1px solid #f56c6c;
}

<input type="text" maxlength="5" />
```

![](/html/label/form/validity-maxlength.gif)

- `tooShort`：输入内容长度小于元素`minlength`时返回`true`，否则为`false`，为`true`时也可用`:invalid`伪类修改样式，注意`IE`浏览器不支持此属性
- `typeMismatch`：输入框的值与元素`type`要求的值不匹配时返回`true`，否则为`false`。例如`email`类型输入框输入非`email`格式，此时返回`true`（也可用`:invalid`伪类修改样式）
- `valid`：当前元素是否完全验证通过，通过返回`true`，否则为`false`。例如`email`类型输入框的属性`minlength="20"`，输入值为`email@email.com`时返回`false`（可用`:invalid`伪类修改样式）
- `valueMissing`：若元素含`required`属性且输入框值为空，则返回`true`，否则为`false`（可用`:invalid`伪类修改样式）

### validationMessage

&emsp;&emsp;表示当前输入框将要显示的出错提示，只读属性。

```javascript
<form>
    <input type="email" required minlength="10" />
    <button type="button">提交</button>
</form>
<script>
    const input = document.querySelector('input')
    const btn = document.querySelector('button')

    btn.addEventListener('click', () => {
        console.log('input:', input.value, ', validationMessage:', input.validationMessage)
    })
</script>
```

![](/html/label/form/validationMessage.png)

### willValidate

&emsp;&emsp;当前元素是否在提交前进行验证，只读属性，需要验证返回`true`，否则为`false`。

&emsp;&emsp;若元素含`disabled`属性，则此属性返回`false`，即提交前无需验证此元素。

## 其它

### 阻止 form 默认提交行为

&emsp;&emsp;表单内`submit`按钮单击时会触发表单默认行为，若`form`指定了`action`属性，将提交表单数据（[FormData](https://developer.mozilla.org/zh-CN/docs/Web/API/FormData) 格式）并跳转至`action`页面，未指定将跳转至当前页面，造成页面刷新。

```javascript
<form action="" method="POST">
    <input type="text" name="username">
    <input type="text" name="password">
    <button type="submit">提交</button>
</form>
```

#### 修改按钮类型

&emsp;&emsp;可修改按钮类型为`button`。

```javascript
<button type="button">提交</button>
```

&emsp;&emsp;或者使用`input`标签的按钮。

```javascript
<input type="button" value="提交">
```

#### 阻止按钮点击事件

&emsp;&emsp;;`addEventListener`绑定的事件，阻止默认行为。

```javascript
<button type="submit">提交</button>

const btn = document.querySelector("button")

btn.addEventListener("click", (event) => {
  event.preventDefault()
})
```

&emsp;&emsp;;`onclick`绑定的事件，阻止默认行为。

```javascript
<button type="submit" onclick="handler(event)">提交</button>

function handler(event) {
  event.preventDefault()
}
```

#### onclick 返回值方式

&emsp;&emsp;其中`onclick="return true"`为默认的表单提交事件，`onclick="return false"`为阻止表单提交事件。

```javascript
<button type="submit" onclick="return false">提交</button>
```

&emsp;&emsp;若阻止表单默认提交行为同时，又要保留点击事件，可用`return function()`返回函数的方式，注意函数末尾一定要返回`false`。

```javascript
<button type="submit" onclick="return handler(event)">提交</button>

function handler(event){
	...
    return false
}
```

&emsp;&emsp;更进一步的，可在表单提交之前做一些数据处理，最后再`return true`触发表单提交。

```javascript
<button type="submit" onclick="return handler(event)">提交</button>

function handler(event){
	...
    return true
}
```

#### 阻止表单 submit 事件

&emsp;&emsp;;`addEventListener`绑定的事件，阻止`submit`事件。

```javascript
<form action="" method="POST">
  ...
</form>

const form = document.querySelector("form")

form.addEventListener("submit", (event) => {
  event.preventDefault()
})
```

&emsp;&emsp;;`onclick`绑定的事件，阻止`submit`事件。

```javascript
<form action="" method="POST" onsubmit="handler(event)">
  ...
</form>

function handler(event) {
  event.preventDefault()
}
```

#### onsubmit 返回值方式

&emsp;&emsp;此方式同上述`onclick`返回值方式基本一致，不再详细描述。

```javascript
<form action="" method="POST" onsubmit="return handler(event)">
    ...
</form>

function handler(event){
	...
    return true | false
}
```

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125)、[Blog](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~