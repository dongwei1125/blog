# Script

![](/html/label/script/banner.jpg)

&emsp;&emsp;;[script](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/script) 用于嵌入或者引用可执行脚本。

&emsp;&emsp;其中可选属性如下。

- `type`：用于定义脚本语言的 [MIME](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/MIME_types) 类型，包括`text/javascript`、`text/ecmascript`、`application/javascript`、`application/ecmascript`，注意`HTML5`中可以省略掉`type`，其默认值为`text/javascript`
- `src`：指定引用的外部脚本的`URL`
- `defer`：仅适用于外链，规定脚本延迟执行
- `async`：仅适用于外链，规定脚本异步执行
- `integrity`：用于验证获取的资源是否被篡改，若接收的资源的签名和`integrity`指定的签名不匹配，页面会报错，脚本也不会执行
- `crossorigin`：浏览器启用`CROS`访问检查，属性值包括`anonymous`、`use-credentials`，若未指定属性值或非法属性值，浏览器默认采用`anonymous`

## defer/async

&emsp;&emsp;一般的`script`标签都是会阻塞页面的解析，为了避免`DOM`的解析被阻塞，通常是将`script`标签放在`html`页面的底部。

&emsp;&emsp;;`defer`在页面完成解析才执行代码（即`DOM`加载完毕，图片资源等还未下载），带有`defer`属性的`script`，其下载会与后续的文档元素的解析并行加载，而脚本会延迟到`DOM`解析完成，而在`DOMContentLoaded`之前执行。

&emsp;&emsp;带有`async`属性的`script`，其下载会与后续的文档元素的解析并行加载，但是只要`script`下载完成，那么就会立即执行，若此时`DOM`未加载完毕，则会阻塞`DOM`解析。

&emsp;&emsp;两者都是后续的文档元素的解析与脚本的下载并行执行，唯一不同在于脚本执行的时机，`defer`是延迟到`DOM`解析完成且`DOMContentLoaded`之前执行，而`async`则是在下载完立即执行，若`DOM`未加载完毕，则其解析会被阻塞。

&emsp;&emsp;更多阻塞问题参考 [关于 JS 与 CSS 是否阻塞 DOM 的渲染和解析](/pages/html/perform/block-dom.md)。

## integrity

&emsp;&emsp;如下告知浏览器使用`sha256`签名算法对下载的`js`文件进行计算，并且与`integrity`提供的签名进行对比，若二者不一致，就不会执行此脚本。

&emsp;&emsp;;`integrity`一般是是对 [CDN](https://developer.mozilla.org/zh-CN/docs/Glossary/CDN) 上的静态文件使用。`CDN`虽然好用但是 `CDN`有可能被劫持，导致下载的文件是被篡改过的，有了`integrity`就可以检查文件是否是原版。而本地文件用的域名跟网页是同一个域名，不存在劫持的问题，所以本地静态文件没有必要用此属性。

```javascript
<script
  integrity="sha256-PJJrxrJLzT6CCz1jDfQXTRWOO9zmemDQbmLtSlFQluc="
  src="https://xxx.xxx.js"
></script>
```

## crossorigin

&emsp;&emsp;当网页引入跨域的脚本时，若此脚本有错误，由于浏览器的限制（根本原因是协议的规定），是获取不到错误信息的。在本地尝试`window.onerror`去捕获脚本的错误时，跨域脚本的错误只会返回`Script error`。

&emsp;&emsp;而`HTML5`规定是可以允许本地获取到跨域脚本的错误信息的，但是要满足两个条件，一是跨域脚本的服务器必须通过`Access-Control-Allow-Origin`头信息允许当前域名可以获取错误信息，二是`script`标签必须指明`src`属性指定的地址是支持跨域的地址，即`crossorigin`属性，详细参考 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Attributes/crossorigin)。
