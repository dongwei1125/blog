![](/other/webpack/banner.jpg)

# 代码分片

&emsp;&emsp;代码分片（`code splitting`）是`webpack`所特有的一项技术，可以将代码按照特定的形式进行拆分，不用一次全部加载而是按需加载，能有效降低首屏加载资源的大小。

## CommonsChunkPlugin

&emsp;&emsp;;`CommonsChunkPlugin`是`webpack4-`内部自带的插件，可以将多个`chunk`中的公共部分提取出来。从而减少开发过程中模块的重复打包，提升开发速度。资源整体体积也减小了，并且可以有效的利用客户端缓存。

&emsp;&emsp;;`CommonsChunkPlugin`可配置属性如下。

- `name`：将`chunks`属性对应的`source chunk`中的公共模块提取到`name`中，若未指定`chunks`，默认将提取`entry chunks`中的公共模块
- `chunks`：指定`source chunk`，即表示从哪些`chunk`中查找公共模块，省略此选项默认为`entry chunks`
- `filename`：提取后的资源文件名，支持模板语言的形式动态生成
- `minChunks`：可以为数字、函数或者`Infinity`

### 非插件打包

&emsp;&emsp;根目录下包括`package.json`、`webpack.config.js`和`src`等，`src`目录下包括`foo.js`、`bar.js`和`utils.js`。

```javascript
// package.json
{
  ...
  "scripts": {
    "build": "webpack"
  },
  "devDependencies": {
    "webpack": "^3.10.0"
  },
  "dependencies": {
    "jquery": "^3.2.1"
  }
}

// webpack.config.js
module.exports = {
    entry: {
        foo: './src/foo.js',
        bar: './src/bar.js'
    },
    output: {
        filename: './dist/[name].js'
    }
}

// src/bar.js
import jquery from 'jquery'
import { log } from './utils.js'

console.log(jquery, log, 'bar')

// src/foo.js
import jquery from 'jquery'
import { log } from './utils.js'

console.log(jquery, log, 'foo')

// src/utils.js
export function log(){
    console.log('log')
}
```

&emsp;&emsp;运行打包后将在根目录下`dist`文件夹生成`bar.js`和`foo.js`，其中`jquery`和`utils`均被打包进了这两个文件中。

![](/other/webpack/middle-noplugin-build.png)

&emsp;&emsp;最后需要在页面添加`script`标签引入`foo.js`和`bar.js`。

```javascript
// src/index.html
<html lang="zh-CN">
  ...
  <body>
    <script src="./bar.js"></script>
    <script src="./foo.js"></script>
  </body>
</html>
```

### 提取公共代码

&emsp;&emsp;修改`webpack.config.js`，新增`CommonsChunkPlugin`插件提取公共模块。

```javascript
// webpack.config.js
const webpack = require("webpack")

module.exports = {
  entry: {
    foo: "./src/foo.js",
    bar: "./src/bar.js",
  },
  output: {
    filename: "./dist/[name].js",
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      filename: "./dist/[name].js",
    }),
  ],
}
```

&emsp;&emsp;如下`foo.js`和`bar.js`中的第三方模块`jquery`和项目内公共模块`utils`、`webpack`运行文件都被打包进了`vendor.js`，`foo.js`和`bar.js`体积明显减小。

![](/other/webpack/middle-common-code.png)

&emsp;&emsp;页面中`vendor.js`要在其他`js`之前引入。

```javascript
// dist/index.js
<html lang="zh-CN">
  ...
  <body>
    <script src="./vendor.js"></script>
    <script src="./bar.js"></script>
    <script src="./foo.js"></script>
  </body>
</html>
```

### 提取运行时

&emsp;&emsp;当使用插件提取公共模块时，提取后的资源内部不仅仅包括模块代码，还包含`webpack`运行时。`webpack`运行时指的是初始化环境的代码，如创建模块缓存对象、声明模块加载函数等。

&emsp;&emsp;如下首个`CommonsChunkPlugin`实例会提取出`foo.js`和`bar.js`中的第三方模块`jquery`、本地模块`utils`和`webpack`运行时文件到`vendor`中。

&emsp;&emsp;然后次个`CommonsChunkPlugin`实例再在`vendor`中提取出运行时文件到`runtime`中，最终`vendor`中包括第三方模块`jquery`和本地模块`utils`，`runtime`中包含`webpack`运行时文件。

&emsp;&emsp;注意`runtime`的`CommonsChunkPlugin`必须出现在`plugins`最后，否则`webpack`将无法正常提取模块。

```javascript
// webpack.config.js
const webpack = require("webpack")

module.exports = {
  entry: {
    foo: "./src/foo.js",
    bar: "./src/bar.js",
  },
  output: {
    filename: "./dist/[name].js",
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      filename: "./dist/[name].js",
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: "runtime",
      filename: "./dist/[name].js",
      chunks: ["vendor"],
    }),
  ],
}
```

&emsp;&emsp;运行打包将在`dist`目录下生成`runtime.js`和`rendor.js`等文件。

![](/other/webpack/middle-runtime.png)

&emsp;&emsp;上述`plugins`等价于如下方式。

```javascript
plugins: [
  new webpack.optimize.CommonsChunkPlugin({
    name: ["vendor", "runtime"],
    filename: "./dist/[name].js",
  }),
]
```

&emsp;&emsp;也可以通过`minChunks`来达到提取出运行时文件的目的，其中当设置`minChunks`为`n`时，表示某个模块只有被`n`个`chunks`同时引用才会进行提取，`CommonsChunkPlugin`默认是只要一个模块被两个入口`chunk`引用就会被提取出来，即`minChunk`默认值为`2`。

&emsp;&emsp;设置为`Infinity`表示提取的阈值无限高，即所有模块都不会被提取。

&emsp;&emsp;设置为`Infinity`一般有两个作用，第一个是可以让`webpack`只提取特定的模块，另一个则是为了生成一个没有任何模块而是仅仅包含`webpack`运行时的文件`runtime`。

&emsp;&emsp;如下表示从入口`chunk`中提取出运行时文件，然后再从`foo`和`bar`中提取出第三方模块和本地`utils`模块。

```javascript
plugins: [
  new webpack.optimize.CommonsChunkPlugin({
    name: "runtime",
    filename: "./dist/[name].js",
    minChunks: Infinity,
  }),
  new webpack.optimize.CommonsChunkPlugin({
    name: "vendor",
    filename: "./dist/[name].js",
    chunks: ["foo", "bar"],
  }),
]
```

### 提取第三方模块和本地模块

&emsp;&emsp;首个`CommonsChunkPlugin`实例的`minChunks`设置为`Infinity`，即表示所有模块都不会被提取，此时`name`设置为`runtime`是可以提取出`webpack`运行时文件的。但是由于`name`指定为`vendor`，且`vendor`在入口`entry`中声明了，即表示只提取出`vendor`数组对应的模块（`jquery`）和`webpack`运行时文件。

&emsp;&emsp;次个`CommonsChunkPlugin`实例即从`vendor`中提取出`webpack`运行时文件，此时`vendor`中仅仅只包含第三方模块`jquery`，`runtime`中包含运行时文件。

&emsp;&emsp;末个`CommonsChunkPlugin`实例最后从`foo`和`bar`中提取出本地模块到`utils`中。

```javascript
// webpack.config.js
const webpack = require("webpack")

module.exports = {
  entry: {
    foo: "./src/foo.js",
    bar: "./src/bar.js",
    vendor: ["jquery"],
  },
  output: {
    filename: "./dist/[name].js",
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      filename: "./dist/[name].js",
      minChunks: Infinity,
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: "runtime",
      filename: "./dist/[name].js",
      chunks: ["vendor"],
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: "utils",
      filename: "./dist/[name].js",
      chunks: ["foo", "bar"],
    }),
  ],
}
```

&emsp;&emsp;运行打包将在`dist`目录下生成`vendor.js`、`utils.js`和`runtime.js`。

![](/other/webpack/middle-thrid-local.png)

&emsp;&emsp;上述`plugins`等价于如下方式。

```javascript
plugins: [
  new webpack.optimize.CommonsChunkPlugin({
    name: ["vendor", "runtime"],
    filename: "./dist/[name].js",
    minChunks: Infinity,
  }),
  new webpack.optimize.CommonsChunkPlugin({
    name: "utils",
    filename: "./dist/[name].js",
    chunks: ["foo", "bar"],
  }),
]
```

&emsp;&emsp;另一种方式是使用`minChunks`的函数方式，其中首个`CommonsChunkPlugin`实例的`minChunks`函数中，`module.resource`为包含模块名的完整路径，`count`为模块被引用的次数，通过对入口文件及其依赖的模块进行遍历，如果模块在`node_modules`中，就会被提取到`vendor`中，实质此方式可以让`vendor`只保留第三方模块。

```javascript
// webpack.config.js
const webpack = require("webpack")

module.exports = {
  entry: {
    foo: "./src/foo.js",
    bar: "./src/bar.js",
  },
  output: {
    filename: "./dist/[name].js",
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      filename: "./dist/[name].js",
      minChunks: function(module, count) {
        return module.resource && module.resource.includes("node_modules")
      },
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: "runtime",
      filename: "./dist/[name].js",
      chunks: ["vendor"],
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: "utils",
      filename: "./dist/[name].js",
      chunks: ["foo", "bar"],
    }),
  ],
}
```

&emsp;&emsp;页面中引用各`js`方式如下。

```javascript
<html lang="zh-CN">
  ...
  <body>
    <script src="./runtime.js"></script>
    <script src="./utils.js"></script>
    <script src="./vendor.js"></script>
    <script src="./foo.js"></script>
    <script src="./bar.js"></script>
  </body>
</html>
```

### 单页应用提取第三方模块

&emsp;&emsp;单页应用单独创建一个入口即可，如下`vendor`中包含第三方模块`vue`和`webpack`运行时文件。

```javascript
// webpack.config.js
const webpack = require("webpack")

module.exports = {
  entry: {
    main: "./src/main.js",
    vendor: ["vue"],
  },
  output: {
    filename: "./dist/[name].js",
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      filename: "./dist/[name].js",
    }),
  ],
}
```

&emsp;&emsp;打包后最终`dist`目录下生成`main.js`和`vendor.js`。

![](/other/webpack/middle-spa-thrid.png)

&emsp;&emsp;页面中引用`js`方式如下。

```javascript
<html lang="zh-CN">
  ...
  <body>
    <script src="./vendor.js"></script>
    <script src="./main.js"></script>
  </body>
</html>
```

### 资源异步加载

&emsp;&emsp;当模块数量过多、资源体积过大时，一部分暂时不用的模块延迟加载。使页面初次渲染的时候下载的资源尽可能小，后续模块等到恰当的时机再去触发加载，此方式即按需加载。

&emsp;&emsp;;`webpack`官方推荐使用`import`函数来异步加载模块，并返回`Promise`对象。

&emsp;&emsp;如下根目录包括`webpack.config.js`和`src`文件夹等，其中`src`下包括`main.js`、`utils.js`，`main.js`中通过`import`异步加载`utils.js`。

```javascript
// src/main.js
setTimeout(() => {
  import(/* webpackChunkName: "utils-chunk" */ "./utils.js")
}, 2000)
console.log("main")

// src/utils.js
import jquery from "jquery"

console.log(jquery, "utils")

// webpack.config.js
module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "./dist/[name].js",
    chunkFilename: "./dist/[name].js",
    publicPath: "../",
  },
}
```

&emsp;&emsp;;`output.chunkFilename`用来指定异步`chunk`的文件名，支持模板语言的方式，异步`chunk`默认没有名称，其默认值为`[id].js`，如`0.js`、`1.js`等。

&emsp;&emsp;通过`webpack`所特有的注释可以让`webpack`获取到异步`chunk`的名字，如上述中`/* webpackChunkName: "utils-chunk" */`，打包后`chunk`名称为`utils-chunk`。

&emsp;&emsp;打包后`main.js`作为首屏加载的资源，页面中通过`script`标签来引用，而间接资源（`utils-chunk.js`）的请求路径要通过`output.publicPath`来指定。

![](/other/webpack/middle-async-chunks.png)

&emsp;&emsp;页面引用方式如下。

```javascript
<html lang="zh-CN">
  ...
  <body>
    <script src="./main.js"></script>
  </body>
</html>
```

&emsp;&emsp;;`2s`后会在页面`head`标签内部动态插入`script`标签，标签引用`utils-chunk.js`。

![](/other/webpack/middle-async-page.png)

## optimization.splitChunks

&emsp;&emsp;;`CommonsChunkPlugin`可以在很多场景下提取公共模块，但是其缺陷也非常明显。

- 单个`CommonsChunkPlugin`实例只能提取单个`vendor`，若要提取多个`vendor`需要新增多个`CommonsChunkPlugin`实例，容易造成配置代码重复
- 多个`CommonsChunkPlugin`实例之间可能存在逻辑关系，只有正确的逻辑关系才能保证提取的代码按照预期，而且部分配置不容易理解，无法做到开箱即用

&emsp;&emsp;;`webpack4`删除了`CommonsChunkPlugin`，改进了`CommonsChunkPlugin`并重新设计和实现了代码分片特性，准备通过`optimization.splitChunks`属性来简化代码分割的配置。

### 提取公共代码

&emsp;&emsp;将`webpack`版本升级，对`CommonsChunkPlugin`打包异步资源的场景换成`splitChunks`，调整`webpack.config.js`。

```javascript
// webpack.config.js
module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "[name].js",
  },
  optimization: { splitChunks: { chunks: "all" } },
  mode: "none",
}

// package.json
{
  ...
  "devDependencies": {
    "webpack": "4.29.4",
    "webpack-cli": "3.2.3"
  }
}
```

&emsp;&emsp;运行打包结果如下，其中`main.js`和`utils.js`被单独打包出来，`utils.js`中引用的第三方模块`jquery`被打包进了`vendors~utils-chunk.js`。

![](/other/webpack/middle-common-chunks.png)

&emsp;&emsp;页面引用`main.js`后，`2s`后会在页面`head`标签内部依次插入`vendors~utils-chunk.js`和`utils-chunk.js`，此时并行请求的数量为`2`。

&emsp;&emsp;;`CommonsChunkPlugin`场景未提取出`utils`中的`jquery`模块，倘若仅修改`utils`中一行代码，客户端就只有重新下载整个`utils-chunk.js`。而`splitChunks`提取出`jquery`模块，`jquery`不会经常变动，修改`utils`中一行代码，客户端只需要重新下载`utils-chunk.js`，而此文件的体积仅仅`1 KiB`不到，并且`vendor~utils-chunk.js`也能很好的利用浏览器缓存。

![](/other/webpack/middle-common-chunks-page.png)

### 提取条件

&emsp;&emsp;;`CommonsChunkPlugin`通过配置项将特定模块提取出来，其方式更贴近于命令式。而`splitChunks`的不同之处在于仅仅只设置部分提取条件，如模块体积、模块位置等，当某些模块达到这些条件就会被自动提取出来，其方式更贴近于声明式。`splitChunks`默认提取条件如下。

- 提取后的`chunk`来自`node_modules`目录，处于`node_modules`的模块一般为通用模块，比较适合被提取出来
- 提取后的`javascript chunk`体积大于`30KB`，`CSS chunk`体积大于`50KB`，一般提取后的资源体积太小，带来的优化效果也比较一般
- 按需加载过程中，并行请求的资源最大值小于等于`5`
- 首次加载时，并行请求的资源数最大值小于等于`3`

### 提取多异步资源

&emsp;&emsp;根目录下包括`webpack.config.js`和`src`文件夹，`src`下包括`main.js`和`foo.js`、`bar.js`。

```javascript
// src/main.js
setTimeout(() => {
  import(/* webpackChunkName: "bar-chunk" */ "./bar.js")
  import(/* webpackChunkName: "foo-chunk" */ "./foo.js")
}, 2000)
console.log("main")

// src/bar.js
import react from "react"

console.log(react, "bar")

// src/foo.js
import vue from "vue"
import react from "react"

console.log(vue, react, "foo")
```

&emsp;&emsp;运行打包后，`webpack`会创建包含`vue`的代码块（`vendor~foo-chunk`），`foo-chunk`依赖此代码块，同时也会创建包含`react`的代码块（`vendors~bar-chunk~foo-chunk`），`foo-chunk`和`bar-chunk`依赖此代码块。

![](/other/webpack/middle-async-chunks-multiple.png)

&emsp;&emsp;在`import('./bar.js)`调用的时候，`vendors~bar-chunk~foo-chunk.js`和`bar-chunk.js`并行加载。在`import('./foo.js)`调用的时候，`vendor~foo-chunk.js`和`foo-chunk.js`并行加载，此时不用再加载`vendors~bar-chunk~foo-chunk.js`，直接读取缓存即可。

![](/other/webpack/middle-async-chunks-multiple-req.png)

## splitChunks 配置参数

&emsp;&emsp;;`webpack`官方给出的`splitChunks`默认值如下。

```javascript
optimization: {
    splitChunks: {
      chunks: 'async',
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
}
```

### chunks

&emsp;&emsp;;`chunks`可配置`splitChunks`工作模式，包括三个可选值`async`（默认）、`initial`、`all`，其中`async`即只提取异步`chunk`，`initial`只提取入口同步`chunk`，`all`则是两种模式同时开启。

&emsp;&emsp;根目录下包括`webpack.config.js`和`src`，`src`下包括`main.js`、`bar.js`和`foo.js`。

```javascript
// src/main.js
import jquery from "jquery"

setTimeout(() => {
  import(/* webpackChunkName: "bar-chunk" */ "./bar.js")
  import(/* webpackChunkName: "foo-chunk" */ "./foo.js")
}, 2000)
console.log(jquery, "main")

// src/bar.js
import react from "react"

console.log(react, "bar")

// src/foo.js
import vue from "vue"
import react from "react"

console.log(vue, react, "foo")

// webpack.config.js
module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "[name].js",
  },
  optimization: { splitChunks: { chunks: "all" } },
  mode: "none",
}
```

&emsp;&emsp;运行打包后，`main.js`中的第三方模块`jquery`被提取到`vendor~main.js`中，剩余代码保留至`main.js`中，`foo.js`中第三方模块`vue`被提取至`vendor~foo-chunk.js`，剩余代码保留至`foo-chunk.js`中，`foo.js`和`bar.js`中第三方模块`react`被提取至`vendor~foo-chunk~bar-chunk.js`，`bar.js`剩余代码保留至`bar-chunk.js`。

![](/other/webpack/middle-chunks-list.png)

&emsp;&emsp;修改`chunks`属性为`initial`后再次打包，其中仅`main.js`中的第三方模块`jquery`被提取至`vendor~main.js`，剩余代码保留至`main.js`，`foo.js`和`bar.js`中第三方模块未被提取，只是将其保留至`foo-chunk.js`和`bar-chunk.js`。

![](/other/webpack/middle-chunks-list-nothrid.png)

&emsp;&emsp;修改`chunks`属性为`async`后再次打包，`main.js`中代码保留至`main.js`，其中的第三方模块未做提取，`foo.js`中的第三方模块`vue`被提取至`vendor~foo-chunk.js`，剩余代码保留至`foo-chunk.js`，`foo.js`和`bar.js`中第三方模块`react`被提取至`vendor~bar-chunk~foo-chunk.js`，`bar.js`中剩余代码保留至`bar-chunk.js`。

![](/other/webpack/middle-chunks-list-thrid.png)

### 匹配条件

- `minSize`：提取出来的代码块在压缩前的最小大小，默认为`30000`（`30KB`）
- `maxSize`：提取出来的代码块在压缩前的最大大小，默认为`0`，即不限制大小
- `minChunks`：模块被引用次数，默认为`1`
- `maxAsyncRequests`：最大的按需加载次数，默认为`5`
- `maxInitialRequests`：最大的首次初始化加载次数，默认为`3`
- `automaticNameDelimiter`：提取出来的代码块自动生成名字的分隔符，默认为 ~
- `name`：提取出的代码块文件的名字，默认为`true`，即自动生成文件名

### 缓存组

&emsp;&emsp;缓存组`cacheGroups`默认包括`vendors`和`default`两种规则，`vendors`用于提取`node_modules`中符合条件的模块，`default`则作用于被多次引用的模块，若要禁用某种规则，可直接将其置为`false`。

&emsp;&emsp;;`cacheGroups`中的每一项都会继承或者覆盖外层`splitChunks`中的参数值，例如`cacheGroups.vendors`项中无`minChunks`属性，则它将继承外层`splitChunks.minChunks`的属性值，即`cacheGroups.vendors.minChunks`为`1`。`cacheGroups.default`项中有`minChunks`属性，则它将覆盖外层`splitChunks.minChunks`的属性。

&emsp;&emsp;除了上述参数值外，`cacheGroups`额外提供了三个配置属性。

- `test`：可匹配模块路径或者`chunk`名称，默认为所有的模块
- `priority`：表示提取权重，数值越大优先级越高。一个模块可能满足多个`cacheGroups`，则提取到哪个就由权重最高的控制
- `reuseExistingChunk`：是否使用已有的`chunk`，`true`表示如果当前的`chunk`包含的模块已经被提取出去了，则不会再重新生成新的

&emsp;&emsp;根目录下包括`webpack.config.js`和`src`文件夹，`src`下包括`main.js`和`utils.js`。

```javascript
// src/main.js
import Vue from "vue"
import Vuex from "vuex"
import VueRouter from "vue-router"
import { log } from "./utils.js"

console.log(Vue, Vuex, VueRouter, log, "main")

// src/utils.js
export function log() {
  console.log("log")
}

// webpack.config.js
module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "[name].js",
  },
  optimization: {
    splitChunks: {
      chunks: "all",
    },
  },
  mode: "none",
}
```

&emsp;&emsp;运行打包后第三方模块`vue`、`vuex`和`vue-router`被提取至`vendors~main.js`，`main.js`剩余的代码和`utils.js`代码被保留至`main.js`中。

![](/other/webpack/middle-chunks-cache.png)

&emsp;&emsp;如果想要单独提取出`utils.js`，则可以自定义如下`cacheGroups`，其中`module.resource`为包含模块名的完整路径。

```javascript
// webpack.config.js
splitChunks: {
      chunks: "all",
      cacheGroups: {
        utils: {
          test: (module) => {
            return /src\\utils/.test(module.resource)
          },
          priority: -20,
          minSize: 0,
        },
        default: false,
      }
}
```

&emsp;&emsp;运行打包后第三方模块`vue`、`vuex`、`vue-router`被提取至`vendors~main.js`中，`utils.js`中代码被提取至`utils~main.js`中，`main.js`中剩余代码保留。

![](/other/webpack/middle-chunks-cache-utils.png)

# 生产环境

&emsp;&emsp;生产环境不同于开发环境，生产环境关注的是用户体验，如何让用户更快地加载资源，包括如何资源压缩、添加环境变量优化打包、如何最大限度利用浏览器缓存等。

## 环境配置

### 单一配置

&emsp;&emsp;单一配置即不管在什么环境均使用`webpack.config.js`，仅仅是在构建初传递环境变量参数，然后在`webpack.config.js`中通过条件来决定使用哪个配置。

&emsp;&emsp;注意`windows`不支持使用`ENV=development`的方式，命令会被阻塞导致报错，第三方插件`cross-env`可解决此问题。

```javascript
cnpm i cross-env --save-dev
```

&emsp;&emsp;根目录下包括`webpack.config.js`和`src`文件夹等，其中`src`下包括`index.html`和`main.js`。

```javascript
// package.json
{
  ...
  "scripts": {
    "dev": "cross-env ENV=development webpack-dev-server",
    "build": "cross-env ENV=production webpack"
  },
  "devDependencies": {
    "webpack": "4.29.4",
    "webpack-cli": "3.2.3",
    "webpack-dev-server": "^3.1.14",
    "html-webpack-plugin": "^3.2.0"
  }
}

// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin')

const ENV = process.env.ENV
const isProd = ENV === 'production'

module.exports = {
  entry: './src/main.js',
  output: {
    filename: isProd ? "./[name].[chunkhash:8].js" : "./[name].js",
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    })
  ]
}

// src/index.html
<html lang="zh-CN">

    <head>
        <title>hello world</title>
    </head>

    <body>
        <p>hello world</p>
    </body>
</html>

// src/main.js
console.log("hello world")
```

&emsp;&emsp;运行`dev`脚本命令，控制台可查看开发环境打包后的输出文件。

![](/other/webpack/middle-single-config-dev.png)

&emsp;&emsp;运行`build`脚本命令，查看打包后输出文件。

![](/other/webpack/middle-single-config-output.png)

### 多环境配置

&emsp;&emsp;可以为每个环境单独创建一个配置文件，例如开发环境为`webpack.dev.config.js`，生产环境为`webpack.prod.config.js`，但是两个配置文件一般会有重复的部分，一改都要改，不利于维护。

&emsp;&emsp;也可以单独创建一个`webpack.config.js`，然后另外两个`js`分别引用该文件并添加上自身环境的配置。但是一般都使用第三方插件`webpack-merge`，用来做`webpack`的配置合并，便于对不同环境的配置进行管理。

&emsp;&emsp;根目录下为`build`、`package.json`、`src`文件夹，`src`下包括`index.html`和`main.js`。

```javascript
// package.json
{
  ...
  "scripts": {
    "dev": "webpack-dev-server --config=./build/webpack.dev.config.js",
    "build": "webpack --config=./build/webpack.prod.config.js"
  }
}
```

&emsp;&emsp;;`build`中包括`webpack.config.js`、`webpack.dev.config.js`和`webpack.prod.config.js`。

```javascript
// build/webpack.config.js
const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = {
  entry: "./src/main.js",
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
  ],
}

// build/webpack.dev.config.js
const webpackConfig = require("./webpack.config.js")

module.exports = {
  ...webpackConfig,
  output: {
    filename: "./[name].js",
  },
}

// build/webpack.prod.config.js
const webpackConfig = require("./webpack.config.js")

module.exports = {
  ...webpackConfig,
  output: {
    filename: "./[name].[chunkhash:8].js",
  },
}
```

&emsp;&emsp;分别运行`dev`和`build`脚本命令，输出结果与单一配置一致。

## production 模式

&emsp;&emsp;早期的`webpack`版本中，不同的环境使用的配置项太多，无法做到开箱即用。`webpack4`中新增了`mode`配置项，可以通过它来切换打包模式。

&emsp;&emsp;如下当前处于生产环境，`webpack`会自动添加适用于生产环境的配置项。

```javascript
// webpack.config.js
module.exports = {
  ...
  mode: "production"
}
```

## 环境变量

&emsp;&emsp;在`webpack`中可以使用`DefinePlugin`为生产环境和开发环境添加不同的环境变量，即`webpack.DefinePlugin`是用来设置浏览器环境下的全局变量（不会被挂载到`window`上）。

&emsp;&emsp;;`webpack.DefinePlugin`作用于所有模块，会将模块中的环境变量完全替换为设置的值。

&emsp;&emsp;根目录下为`webpack.config.js`、`package.json`和`src`，`src`下包括`main.js`。

```javascript
// package.json
{
  ...
  "scripts": {
    "build": "webpack"
  },
  "devDependencies": {
    "webpack": "4.29.4",
    "webpack-cli": "3.2.3"
  }
}

// webpack.config.js
const webpack = require('webpack')

module.exports = {
  entry: './src/main.js',
  output: {
    filename: "./[name].js",
  },
  plugins: [
    new webpack.DefinePlugin({
      ENV: JSON.stringify('production'),
    })
  ],
  mode: 'development',
  devtool: 'none',
}

// src/main.js
console.log(ENV)
```

&emsp;&emsp;打包后查看输出目录`dist`中的`main.js`文件，其中`ENV`被完全替换为`"production"`。

```javascript
// dist/main.js
 "./src/main.js":(function(module, exports) {
    console.log("production")
})
```

&emsp;&emsp;注意对于字符串或者包含字符串的对象都要加上`JSON.stringify`，若不添加`JSON.stringify`，在替换之后就会成为变量名，而非字符串值，即上述`ENV`会被替换为`production`（无字符串引号）。

&emsp;&emsp;除了字符串类型的值外，也可以设置其他类型的环境变量。

```javascript
new webpack.DefinePlugin({
  ENV: JSON.stringify("production"),
  ENVIR: '"development"',
  IS_PRODUCTION: true,
  ENV_ID: 1038,
  CONSTANTS: JSON.stringify({
    TYPES: ["foo", "bar"],
  }),
})
```

&emsp;&emsp;很多框架和库都使用`process.env.NODE_ENV`作为区别开发环境和生产环境的变量，其值为`production`即表示当前环境为生产环境，库和框架在打包时会去掉诸如警告信息和日志等的开发环境的代码，将有助于减小代码体积提升运行速度。

&emsp;&emsp;如下可配置`process.env.NODE_ENV`变量，注意若启用了`mode: 'production'`，则`webapck`会自动设置`process.env.NODE_ENV`的值，不用再重复设置。

```javascript
new webpack.DefinePlugin({
  "process.env.NODE_ENV": JSON.stringify("development"),
})
```

## 区分环境方式

### scripts

&emsp;&emsp;;`webpack4`版本引入`mode`属性，包括`development`、`production`、`none`三种模式。

&emsp;&emsp;;`development`模式会将模块内`process.env.NODE_ENV`的值设为`development`，同时启用开发环境的`webpack`插件。`production`模式会将模块内`process.env.NODE_ENV`的值设为`production`，同时启用生产环境的`webpack`插件。

&emsp;&emsp;可在`webpack.config.js`中设置`mode`，也可在`package.json`中`scripts`脚本命令中设置`--mode`。

```javascript
// package.json
"scripts": {
    "build-dev": "webpack --mode=development",
    "build-prod": "webpack --mode=production"
}
```

&emsp;&emsp;特殊脚本也会默认设置`mode`，如下`"dev": "webpack-dev-server"`的`mode`为`development`，`"build": "webpack"`的`mode`为`production`。

```javascript
// package.json
"scripts": {
    "dev": "webpack-dev-server",
    "build": "webpack"
}
```

&emsp;&emsp;而在模块内部就可根据`process.env.NODE_ENV`的值判断当前的环境，注意`mode`的方式是可以在任意模块内通过`process.env.NODE_ENV`获取当前的环境变量，但是无法在`node`环境（`webpack`配置文件）中获取当前的环境变量。

```javascript
// package.json
"scripts": {
    "build": "webpack"
}

// src/mian.js
console.log(process.env.NODE_ENV) // production

// webpack.config.js
console.log(process.env.NODE_ENV) // undefined

module.exports = {
  entry: "./src/main.js",
  ...
}
```

&emsp;&emsp;如下`webpack.config.js`中可以通过函数的方式获取环境变量，但是也无法在函数外获取环境变量，`main.js`中能输出`production`是因为特殊脚本`"build": "webpack"`会默认设置`mode`为`production`模式。

```javascript
// package.json
"scripts": {
    "build-dev": "webpack --env=development",
    "build-prod": "webpack --env=production"
}

// webpack.config.js
console.log(process.env.NODE_ENV) // undefined

module.exports = (env) => {
  console.log(env) // development | production

  return {
    entry: "./src/main.js",
    ...
  }
}

// src/main.js
console.log(process.env.NODE_ENV) // production
```

### webpack.DefinePlugin

&emsp;&emsp;;`scripts`的方式模块内的`process.env.NODE_ENV`只能为固定的几个值。

&emsp;&emsp;;`webpack.DefinePlugin`则可以设置模块内`process.env.NODE_ENV`为任意值，但是也无法在`node`环境中获取当前的环境变量。

```javascript
// package.json
"scripts": {
  "build": "webpack"
}

// webpack.config.js
const webpack = require("webpack")

console.log(process.env.NODE_ENV) // undefined

module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "./[name].js",
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('dev'),
    })
  ]
}

// src/main.js
console.log(process.env.NODE_ENV) // dev
```

### cross-env

&emsp;&emsp;上述两种方式均无法在`node`环境（`webpak`配置文件）中获取环境变量，`scripts`方式也只能通过函数的方式在函数内部获取，无法在`webpack.config.js`中获取到当前的环境变量。

&emsp;&emsp;借助第三方插件`cross-env`可以在`node`环境获取当前的环境变量，并且可以任意设置环境变量的值。

```javascript
// package.json
"scripts": {
    "build": "cross-env ENVIR=prod webpack"
},
"devDependencies": {
    "cross-env": "^7.0.3",
    ...
}

// webpack.config.js
console.log(process.env.ENVIR) // prod

module.exports = {
  entry: "./src/main.js",
  ...
}

// src/main.js
console.log(process.env.ENVIR) // undefined
```

## source map

&emsp;&emsp;;`source map`指的是将编译、压缩、打包后的代码映射回源代码的过程，`webpack`打包压缩后的代码基本不具备可读性，此时代码抛出错误，想要回溯其调用栈非常困难。

### 未启用配置

&emsp;&emsp;根目录下包括`package.json`、`webpack.config.js`和`src`文件夹，`src`下包括`index.html`、`main.js`和`style.scss`，其中`MiniCssExtractPlugin`插件主要作用是提取出`css`样式文件。

```javascript
// package.json
{
  ...
  "scripts": {
    "build": "webpack"
  },
  "devDependencies": {
    "css-loader": "^0.28.9",
    "html-webpack-plugin": "^3.2.0",
    "node-sass": "^4.7.2",
    "sass-loader": "^6.0.7",
    "mini-css-extract-plugin": "^0.5.0",
    "style-loader": "^0.19.0",
    "webpack": "4.29.4",
    "webpack-cli": "^3.2.3"
  }
}

// webpack.config.js
const HtmlWebpackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

module.exports = {
  entry: "./src/main.js",
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          'css-loader',
          'sass-loader'
        ],
      }
    ]
  }
}

// src/index.html
<html lang="zh-CN">
  <body>
    <p>hello world</p>
  </body>
</html>

// src/main.js
import './index.scss'

console.log('source-map')

// src/index.scss
$color: red;

p {
  color: $color;
}
```

&emsp;&emsp;执行`build`脚本打包后，根目录下输出`index.html`、`main.css`、`main.js`，利用`VS Code`编辑器插件`Live Server`，`index.html`内部右击`Open with Live Server`，查看`index.html`部署到服务器上的情况。

&emsp;&emsp;如下控制台查看输出结果。

![](/other/webpack/middle-close-console.png)

&emsp;&emsp;单击`mian.js:formatted:76`跳转至如下位置，但是仅能查看此输出语句在打包后的代码中的位置，无法回溯到源代码。

![](/other/webpack/middle-close-source.png)

&emsp;&emsp;然后在控制台查看样式。

![](/other/webpack/middle-close-page.png)

&emsp;&emsp;单击`mian.css:1`跳转至如下位置，也仅能查看打包后的样式代码，无法回溯。

![](/other/webpack/middle-close-style.png)

### 启用配置

&emsp;&emsp;在`webpack.config.js`中添加`devtool`开启`js`文件的`source map`，而对于`scss`、`css`则需要添加额外的`source map`配置项。

```javascript
// webpack.config.js
module.exports = {
  ...
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      }
    ]
  },
  devtool: 'source-map'
}
```

&emsp;&emsp;再次执行`build`脚本打包，`dist`目录下会多出几个`map`文件，由于启用了`devtool`配置项，`source map`就会跟随源代码一步步被传递，直到生成最后的`map`文件，其文件名默认为输出文件加上`.map`后缀，如`main.js.map`，`main.js`尾部还会默认追加一句注释来标识`map`文件的位置。

```javascript
// main.js
...
//# sourceMappingURL=main.js.map
```

&emsp;&emsp;控制台再次查看输出结果，已经可以看到此语句在源代码中的具体行数。

![](/other/webpack/middle-open-console.png)

&emsp;&emsp;单击`main.js:2`跳转至如下，可看见此语句的具体情况。

![](/other/webpack/middle-open-source.png)

&emsp;&emsp;样式则完全可以回溯到`scss`文件中。

![](/other/webpack/middle-open-page.png)

&emsp;&emsp;单击`index.scss:3`跳转至如下。

![](/other/webpack/middle-open-style.png)

### 安全性能

&emsp;&emsp;开启`source map`之后，开发者工具中的`webpack://`目录中可以找到解析后的工程源码。

&emsp;&emsp;注意当打开浏览器的开发者工具时，`map`文件会被同时加载，然后浏览器使用它来解析对应的输出文件，分析出源代码的目录结构和内容。

&emsp;&emsp;;`map`文件一般比较大，不打开开发者工具是不会加载的，但是使用`source map`会有一定的安全隐患。

&emsp;&emsp;;`webpack`提供了`hidden-source-map`和`nosources-source-map`两种策略来提升`source map`的安全性。

&emsp;&emsp;;`hidden-source-map`仍然会生成完整的`map`文件，但是输出文件中不会添加对`map`文件的引用。若要回溯源码，可借助第三方服务（例如 [Sentry](https://sentry.io/welcome/)），将`map`文件上传上去。

&emsp;&emsp;;`nosources-source-map`可以在开发者工具中查看源码的目录结构，但是文件具体内容会被隐藏。可以在控制台查看`console`日志的准确行数，对于回溯错误基本足够。

![](/other/webpack/middle-safe.png)

## devtool 配置项

&emsp;&emsp;;`devtool`用作调试，包括如下十几种等配置。

- `none`
- `eval`
- `eval-source-map`
- `cheap-eval-source-map`
- `cheap-module-eval-source-map`
- `source-map`
- `cheap-source-map`
- `cheap-module-source-map`
- `inline-source-map`
- `inline-cheap-source-map`
- `inline-cheap-module-source-map`
- `hidden-source-map`
- `nosources-source-map`

&emsp;&emsp;其中包括`eval`、`cheap`、`module`、`source-map`等关键字，大部分都是组合而成，具体特性如下。

- `eval`：使用`eval`包裹模块代码，并且存在`sourceURL`，`sourceURL`指向原文件
- `cheap`：打包`map`文件时，不保存原始代码的列位置信息，只包含行位置信息。忽略`loader`的`source map`，并且仅显示转译后的代码
- `module`：包括`loader`的`sourcemap`
- `source-map`：生成`.map`文件

### none

&emsp;&emsp;根目录下包括`package.json`、`webpack.config.js`和`src`文件夹，`src`下包括`index.html`和`main.js`。

```javascript
// package.json
{
  ...
  "scripts": {
    "build": "webpack"
  },
  "devDependencies": {
    "@babel/core": "^7.2.2",
    "@babel/preset-env": "^7.3.1",
    "babel-loader": "^8.0.5",
    "html-webpack-plugin": "^3.2.0",
    "webpack": "4.29.4",
    "webpack-cli": "^3.2.3"
  }
}

// webpack.config.js
const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = {
  entry: "./src/main.js",
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          cacheDirectory: true,
          presets: [["@babel/preset-env", { modules: false }]],
        },
      },
    ],
  },
  devtool: "none",
  mode: "development"
}

// src/index.html
<html lang="zh-CN">
  <body>
    <p>hello world</p>
  </body>
</html>

// src/main.js
const fn = ()=>{
    console.log('source map')
}

fn()
```

&emsp;&emsp;运行`build`脚本命令后，控制台查看输出结果。

![](/other/webpack/middle-config-none-console.png)

&emsp;&emsp;单击`mian.js:97`跳转如下。

![](/other/webpack/middle-config-none-source.png)

&emsp;&emsp;;`none`配置项即无法回溯到源代码，仅仅是根据配置的`loader`转译了模块的代码。

### eval

&emsp;&emsp;修改`webpack.config.js`中的`devtool`属性为`eval`，再运行`build`脚本命令，查看打包输出的代码。

![](/other/webpack/middle-config-eval-package.png)

&emsp;&emsp;控制台查看输出结果后单击并跳转。

![](/other/webpack/middle-config-eval-source.png)

&emsp;&emsp;;`eval`配置项中，打包后模块代码被`eval`包裹，同时包括`sourceURL`，回溯的源代码被`loader`转换过（箭头函数转换为普通函数），并带有光标列信息。

### source-map

&emsp;&emsp;修改`webpack.config.js`中的`devtool`属性为`source-map`，再次运行`build`脚本命令，`dist`目录下多生成了`.map`文件。

![](/other/webpack/middle-config-source-map-map.png)

&emsp;&emsp;查看打包输出的代码。

![](/other/webpack/middle-config-source-map-package.png)

&emsp;&emsp;控制台查看输出结果后单击并跳转。

![](/other/webpack/middle-config-source-map-source.png)

&emsp;&emsp;;`source-map`配置项中，生成了`.map`文件，打包输出的代码尾部追加了`sourceMappingURL`，回溯的源代码为原始代码，并带有光标列信息。

### cheap-source-map

&emsp;&emsp;修改`webpack.config.js`中的`devtool`属性为`cheap-source-map`，运行`build`脚本命令，也会在`dist`目录下生成`.map`文件，打包输出的代码和`source-map`一致。

&emsp;&emsp;控制台查看输出结果后单击并跳转。

![](/other/webpack/middle-config-cheap-source-map.png)

&emsp;&emsp;;`cheap-source-map`配置项中，也会生成`.map`文件，打包输出的代码尾部也会追加`sourceMappingURL`，回溯的源代码被`loader`转换过（箭头函数转换为普通函数），不带有光标列信息（光标位于行首）。

### eval-source-map

&emsp;&emsp;修改`webpack.config.js`中的`devtool`属性为`eval-source-map`，运行`build`脚本命令，查看打包输出的代码。

![](/other/webpack/middle-config-eval-source-map-package.png)

&emsp;&emsp;控制台查看输出结果后单击并跳转。

![](/other/webpack/middle-config-eval-source-map-source.png)

&emsp;&emsp;;`eval-source-map`配置项中，打包后模块代码被`eval`包裹，同时包括`sourceURL`和`sourceMappingURL`，不会生成`.map`文件，而是将`map`文件内容转换为`base64`编码插入到`sourceMappingURL`后面，回溯的源代码为原始代码，并带有光标列信息。

### cheap-eval-source-map

&emsp;&emsp;修改`webpack.config.js`中的`devtool`属性为`cheap-eval-source-map`，运行`build`脚本命令，查看打包输出的代码。

![](/other/webpack/middle-config-cheap-eval-source-map-package.png)

&emsp;&emsp;控制台查看输出结果后单击并跳转。

![](/other/webpack/middle-config-cheap-eval-source-map-source.png)

&emsp;&emsp;;`cheap-eval-source-map`配置项中，打包后模块代码被`eval`包裹，同时包括`sourceURL`和`sourceMappingURL`，不会生成`.map`文件，而是将`map`文件内容转换为`base64`编码插入到`sourceMappingURL`后面，回溯的源代码被`loader`转换过（箭头函数转换为普通函数），不带有光标列信息（光标位于行首）。

### cheap-module-eval-source-map

&emsp;&emsp;修改`webpack.config.js`中的`devtool`属性为`cheap-module-eval-source-map`，运行`build`脚本命令，查看打包输出的代码。

![](/other/webpack/middle-config-cheap-module-eval-source-map-package.png)

&emsp;&emsp;控制台查看输出结果后单击并跳转。

![](/other/webpack/middle-config-cheap-module-eval-source-map-source.png)

&emsp;&emsp;;`cheap-module-eval-source-map`配置项中，打包后模块代码被`eval`包裹，同时包括`sourceURL`和`sourceMappingURL`，不会生成`.map`文件，而是将`map`文件内容转换为`base64`编码插入到`sourceMappingURL`后面，回溯的源代码为原始代码，不带有光标列信息（光标位于行首）。

### cheap-module-source-map

&emsp;&emsp;修改`webpack.config.js`中的`devtool`属性为`cheap-module-source-map`，运行`build`脚本命令，查看打包输出的代码。

![](/other/webpack/middle-config-cheap-module-source-map-package.png)

&emsp;&emsp;控制台查看输出结果后单击并跳转。

![](/other/webpack/middle-config-cheap-module-source-map-source.png)

&emsp;&emsp;;`cheap-module-source-map`配置项中，也会生成`.map`文件，打包输出的代码尾部也会追加`sourceMappingURL`，回溯的源代码为原始代码，不带有光标列信息（光标位于行首）。

### inline-source-map

&emsp;&emsp;修改`webpack.config.js`中的`devtool`属性为`inline-source-map`，运行`build`脚本命令，查看打包输出的代码。

![](/other/webpack/middle-config-inline-source-map-package.png)

&emsp;&emsp;控制台查看输出结果后单击并跳转。

![](/other/webpack/middle-config-inline-source-map-source.png)

&emsp;&emsp;;`inline-source-map`配置项中，不会生成`.map`文件，而是将`map`文件内容转换为`base64`编码插入到`sourceMappingURL`后面，回溯的源代码为原始代码，并带有光标列信息。

### hidden-source-map

&emsp;&emsp;修改`webpack.config.js`中的`devtool`属性为`hidden-source-map`，运行`build`脚本命令，也会在`dist`目录下生成`.map`文件，查看打包输出的代码。

![](/other/webpack/middle-config-hidden-source-map-package.png)

&emsp;&emsp;控制台查看输出结果后单击并跳转。

![](/other/webpack/middle-config-hidden-source-map-source.png)

&emsp;&emsp;;`inline-source-map`配置项中，会生成`.map`文件，但是不会保留对`map`文件的引用（无`sourceMappingURL`），无法回溯到源代码。

### nosources-source-map

&emsp;&emsp;修改`webpack.config.js`中的`devtool`属性为`nosources-source-map`，运行`build`脚本命令后，控制台查看输出结果。

![](/other/webpack/middle-config-nosources-source-map-console.png)

&emsp;&emsp;单击`main.js:2`跳转如下。

![](/other/webpack/middle-config-nosources-source-map-main.png)

&emsp;&emsp;查看打包输出的代码。

![](/other/webpack/middle-config-nosources-source-map-package.png)

&emsp;&emsp;;`nosources-source-map`配置项中，生成了`.map`文件，打包输出的代码尾部追加了`sourceMappingURL`，无法回溯到源代码（源代码的目录结构可查看，具体内容被隐藏），但是可以在控制台查看`console`日志的准确行数。

### 差异对比

&emsp;&emsp;如下为各个配置项的差异，其中构建速度`fastest > fast > ok > slow > slowest`。

|            devtool             | 构建速度  |                                map 方式                                 | eval 包裹 |   sourceMappingURL    | 是否有光标列信息 | 是否可回溯 |      回溯代码      |
| :----------------------------: | :-------: | :---------------------------------------------------------------------: | :-------: | :-------------------: | :--------------: | :--------: | :----------------: |
|             `none`             | `fastest` |                                    -                                    |     -     |           -           |        -         |     否     |         -          |
|             `eval`             |  `fast`   |                  `eval`函数内`sourceURL`引用源文件路径                  |    是     |           -           |        有        |     是     | `loader`转译后代码 |
|          `source-map`          | `slowest` |                 模块尾部追加`sourceMappingURL`引用`map`                 |    否     |    链接`map`文件名    |        有        |     是     |      原始代码      |
|       `cheap-source-map`       |   `ok`    |                 模块尾部追加`sourceMappingURL`引用`map`                 |    否     |    链接`map`文件名    |        否        |     是     | `loader`转译后代码 |
|       `eval-source-map`        | `slowest` | `eval`函数内`sourceURL`引用源文件路径，函数尾部再插入`sourceMappingURL` |    是     | `map`内容`base64`编码 |        是        |     是     |      原始代码      |
|    `cheap-eval-source-map`     |   `ok`    | `eval`函数内`sourceURL`引用源文件路径，函数尾部再插入`sourceMappingURL` |    是     | `map`内容`base64`编码 |        否        |     是     | `loader`转译后代码 |
| `cheap-module-eval-source-map` |  `slow`   | `eval`函数内 sourceURL 引用源文件路径，函数尾部再插入`sourceMappingURL` |    是     | `map`内容`base64`编码 |        否        |     是     |      原始代码      |
|   `cheap-module-source-map`    |  `slow`   |                 模块尾部追加`sourceMappingURL`引用`map`                 |    否     |    链接`map`文件名    |        否        |     是     |      原始代码      |
|      `inline-source-map`       | `slowest` |                     模块尾部追加`sourceMappingURL`                      |    否     | `map`内容`base64`编码 |        是        |     是     |      原始代码      |
|      `hidden-source-map`       | `slowest` |                                    -                                    |    否     |           -           |        -         |     -      |         -          |
|     `nosources-source-map`     | `slowest` |                 模块尾部追加`sourceMappingURL`引用`map`                 |    否     |    链接`map`文件名    |        -         |     -      |         -          |

## 资源压缩

&emsp;&emsp;一般发布到线上环境的资源，都会进行代码压缩（丑化），即移出多余的空格、换行和执行不到的代码、缩短变量名、移出注释等，在保证执行结果不变的前提下将代码替换为更短的形式。

&emsp;&emsp;代码在压缩后整体体积都会显著减小，同时将基本不可读，一定程度上提升了代码的安全性。

### 压缩 JavaScript

&emsp;&emsp;;`webpack3`及以下可通过`webpack.optimize.UglifyJsPlugin`实现代码压缩。

```javascript
// package.json
{
  ...
  "scripts": {
    "build": "webpack"
  },
  "devDependencies": {
    "webpack": "^3.10.0"
  }
}

// webpack.config.js
const webpack = require("webpack")

module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "./dist/[name].js"
  },
  plugins: [new webpack.optimize.UglifyJsPlugin()]
}

// src/main.js
const fn = function () {
  console.log("hello world")
}

fn()
```

&emsp;&emsp;;`webpack4`之后默认使用`terser-webpack-plugin`作为内置压缩插件，其支持`ES6+`代码的压缩。在`webpack4`中可通过`optimization.minimize`控制是否开启压缩，开发环境下默认关闭，生产环境下默认开启。

```javascript
// webpack.config.js
module.exports = {
    ...
    optimization: {
        minimize: true
    }
}
```

&emsp;&emsp;也可以通过`optimization.minimizer`自定义压缩插件及其配置项，如下打包时可自动去除`console.log`。

```javascript
// webpack.config.js
const TerserPlugin = require("terser-webpack-plugin")

module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "./[name].js",
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            pure_funcs: ["console.log"],
          },
        },
      }),
    ],
  },
}
```

### 压缩 CSS

&emsp;&emsp;压缩`css`首先是使用`extract-text-webpack-plugin`或者`mini-css-extract-plugin`将样式提取出来，然后使用`optimize-css-assets-webpack-plugin`来进行压缩。

&emsp;&emsp;根目录下为`package.json`、`webpack.config.js`和`src`文件夹，`src`下包括`main.js`和`index.css`。

```javascript
// package.json
{
  ...
  "scripts": {
    "build": "webpack"
  },
  "devDependencies": {
    "css-loader": "^0.28.7",
    "mini-css-extract-plugin": "^0.5.0",
    "optimize-css-assets-webpack-plugin": "^4.0.1",
    "webpack": "4.29.4",
    "webpack-cli": "^3.2.3"
  }
}

// webpack.config.js
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")

module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "./[name].js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          "css-loader"
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [new OptimizeCSSAssetsPlugin()]
  },
}

// src/main.js
import "./index.css"

console.log("hello world")

// src/index.css
p {
  color: red;
}
```

&emsp;&emsp;执行`build`脚本打包后，查看输出的`css`文件。

```javascript
// dist/main.css
p {
  color: red;
}
```

## 缓存

&emsp;&emsp;缓存是指重复利用浏览器已经获取过的资源，详细的缓存策略（如缓存时间）由服务器来决定，浏览器则会在资源过期前一直使用本地缓存进行响应。

&emsp;&emsp;但是此方式也会带来一个问题，若代码进行了`bug fix`，并希望立即更新到所有用户的浏览器上，最好的办法就是更改资源`URL`，迫使客户端重新下载资源。

&emsp;&emsp;常用方法是每次打包对资源内容计算一次`hash`，并作为版本号存放在文件名中。

### 版本号

&emsp;&emsp;如下通常使用`chunkhash`来作为文件版本号，会单独为每一个`chunk`计算一个`hash`值。

```javascript
// package.json
{
  ...
  "scripts": {
    "build": "webpack"
  },
  "devDependencies": {
    "webpack": "4.29.4",
    "webpack-cli": "^3.2.3"
  }
}

// webpack.config.js
module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "./[name]@[chunkhash:8].js"
  }
}

// src/main.js
console.log("hello world")
```

&emsp;&emsp;运行`build`脚本打包后如下。

![](/other/webpack/middle-version-chunk.png)

&emsp;&emsp;资源文件名的改变也就意味着`HTML`中引用路径的改变，可使用`html-webpack-plugin`插件，在打包结束后自动同步引用的资源名。

```javascript
// package.json
"devDependencies": {
    ...
    "html-webpack-plugin": "3.2.0"
}

// webpack.config.js
const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = {
  ...
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html"
    })
  ]
}


// src/html
<html lang="zh-CN">
  <body>
    <p>hello world</p>
  </body>
</html>
```

&emsp;&emsp;再次运行`build`脚本打包，打开`dist`下`index.html`，其中引用的资源路径已同步。

![](/other/webpack/middle-version-page.png)

### CommonsChunkPlugin

&emsp;&emsp;通过`CommonsChunkPlugin`可以将一些不常变动的代码单独提取出来，与经常迭代的业务代码区别开来，这部分资源可以在客户端一直缓存。

&emsp;&emsp;但是`webpack3`及以下为每个模块指定的`id`是按数字递增的，当有新的模块插入进来就会导致其他模块的`id`发生变化，进而影响`chunk`中的内容，即最终影响`chunkhash`值，造成本不用下载的资源重新下载。

&emsp;&emsp;根目录下为`package.json`、`webpack.config.js`和`src`文件夹，`src`下包括`main.js`。

```javascript
// package.json
{
  ...
  "scripts": {
    "build": "webpack"
  },
  "devDependencies": {
    "webpack": "^3.10.0"
  },
  "dependencies": {
    "jquery": "^3.2.1"
  }
}

// webpack.config.js
const webpack = require("webpack")

module.exports = {
  entry: {
    main: "./src/main.js",
    vendor: ["jquery"]
  },
  output: {
    filename: "./dist/[name]@[chunkhash:8].js"
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      filename: "./dist/[name]@[chunkhash:8].js"
    })
  ]
}

// src/main.js
import "jquery"

console.log("main.js")
```

&emsp;&emsp;运行`build`脚本打包，查看输出的资源，其中`vendor`中仅包含第三方模块`jquery`和`webpack`运行时文件。

![](/other/webpack/middle-common-chunk-plugin-vendor.png)

&emsp;&emsp;然后在`src`下新建`utils.js`，`main.js`中引入。

```javascript
// src/main.js
import "jquery"
import "./utils"

console.log("main.js")

// src/utils.js
console.log("utils.js")
```

&emsp;&emsp;再次执行`build`脚本打包，查看输出的资源。

![](/other/webpack/middle-common-chunk-plugin-chunks.png)

&emsp;&emsp;如此就造成了一个问题，`vendor`中的模块并未变化，其路径名称却发生了改变。

&emsp;&emsp;对比`dist`目录下`vendor@5eb95a94.js`和`vendor@fe14193b.js`，仅如下两处发生了变化。

![](/other/webpack/middle-common-chunk-plugin-pre.png)

![](/other/webpack/middle-common-chunk-plugin-cur.png)

### HashedModuleIdsPlugin

&emsp;&emsp;解决的方法在于更改模块`id`的生成方式，`webpack3`内部自带了`HashedModuleIdsPlugin`插件，它可以为每个模块按照其所在路径生成一个字符串类型的`hash id`。

```javascript
// src/main.js
import "jquery"

console.log("main.js")

// webpack.config.js
const webpack = require("webpack")

module.exports = {
  entry: {
    main: "./src/main.js",
    vendor: ["jquery"],
  },
  output: {
    filename: "./dist/[name]@[chunkhash:8].js",
  },
  plugins: [
    new webpack.HashedModuleIdsPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      filename: "./dist/[name]@[chunkhash:8].js",
    }),
  ],
}
```

&emsp;&emsp;运行`build`脚本打包，查看输出的资源。

![](/other/webpack/middle-hash-module-plugin-chunks.png)

&emsp;&emsp;;`main.js`引入`utils.js`。

```javascript
import "jquery"
import "./utils"

console.log("main.js")
```

&emsp;&emsp;再次运行`build`打包。

![](/other/webpack/middle-hash-module-plugin-utils.png)

&emsp;&emsp;由于`vendor`仅仅包括第三方模块`jquery`和`webpack`运行时，同时`jquery`的路径始终是固定的，所以其`hash id`始终是固定的。

&emsp;&emsp;;`webpack3`以下的版本，由于其不支持字符串类型的`id`，可以使用`webpack-hashed-module-id-plugin`插件。而`webpack4+`修改了模块`id`的生成方式，也就不再有此问题。

## 监控分析

&emsp;&emsp;可以使用第三方插件对打包输出的`bundle`体积进行监控和分析，以防止不必要的冗余模块被添加进来。

### Import Cost

&emsp;&emsp;;`Vs Code`中的`Import Cost`可以对引入模块的大小进行实时检测，当代码中引用一个新的模块（主要是`node_modules`中的模块），就会计算此模块压缩后以及`gzip`后所占的体积。

![](/other/webpack/middle-import-cost.png)

### webpack-bundle-analyzer

&emsp;&emsp;另外一个可视化分析工具为`webpack-bundle-analyzer`，可以分析一个`bundle`的构成。

```javascript
// package.json
{
  ...
  "scripts": {
    "build": "webpack"
  },
  "devDependencies": {
    "vue": "^2.6.12",
    "vue-router": "^3.5.1",
    "vuex": "^3.6.2",
    "webpack": "^3.10.0",
    "webpack-bundle-analyzer": "^4.4.1"
  }
}

// webpack.config.js
const webpack = require("webpack")
const Analyzer = require("webpack-bundle-analyzer").BundleAnalyzerPlugin

module.exports = {
  entry: {
    main: "./src/main.js",
    vendor: ["vue", "vuex", "vue-router"]
  },
  output: {
    filename: "./dist/[name].js"
  },
  plugins: [
    new Analyzer(),
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      filename: "./dist/[name].js"
    })
  ]
}

// src/main.js
import Vue from "vue"
import Vuex from "vuex"
import VueRouter from "vue-router"
import { log } from "./utils.js"

console.log(Vue, Vuex, VueRouter, log, "main.js")

// src/utils.js
export function log() {
  console.log("utils.js")
}
```

&emsp;&emsp;运行`build`脚本分析结果如下。

![](/other/webpack/middle-webpack-bundle-analyzer.png)

# 打包优化

&emsp;&emsp;项目初期不要看到任何优化点就拿到项目中，会增加复杂度优化效果也不理想。一般是项目发展到一定规模，出现性能问题再去具体优化。

## HappyPack

&emsp;&emsp;;`HappyPack`是一个通过多线程来提升`webpack`打包速度的插件。

&emsp;&emsp;打包过程非常耗时的部分就是通过`loader`转译各种资源，例如`babel`转译`ES6+`等，其具体工作流程如下。

1.  从配置中获取打包入口
2.  匹配`loader`规则，并对入口模块进行转译
3.  对转译后的模块进行依赖查找
4.  对新找到的模块重复进行步骤`2`和步骤`3`，直到没有新的依赖模块

&emsp;&emsp;步骤`2`到步骤`4`是一个递归的过程，`webpack`需要一步步地获取更深层级的资源，然后逐个进行转译。根本问题在于`webpack`是单线程的，若一个模块依赖于其他几个模块，`webpack`必须对这些模块逐个进行转译。虽然这些转译任务彼此之间没有任务依赖关系，却必须串行地执行。而`HappyPack`的核心特性是可以开启多个线程，并行地对不同模块进行转译，充分利用本地资源来提升打包速度。

### 单个 loader

&emsp;&emsp;使用时要用`HappyPack`提供的`loader`替换原有的`loader`，并将原有的`loader`传给`HappyPack`插件。

&emsp;&emsp;根目录下为`package.json`、`webpack.config.js`和`src`，其中`src`下包括`main.js`、`bar.js`、`foo.js`。

```javascript
// package.json
{
  ...
  "scripts": {
    "build": "webpack"
  },
  "devDependencies": {
    "@babel/core": "^7.2.2",
    "@babel/preset-env": "^7.3.1",
    "babel-loader": "^8.0.5",
    "vue": "^2.6.12",
    "vuex": "^3.6.2",
    "webpack": "4.29.4",
    "webpack-cli": "3.2.3",
    "happypack": "^5.0.0"
  }
}

// src/main.js
import "./foo.js"
import "./bar.js"

console.log("main.js")

// src/foo.js
import vue from "vue"

console.log(vue, "foo.js")

// src/bar.js
import Vuex from "vuex"

console.log(Vuex, "bar.js")
```

&emsp;&emsp;初始`webpack`配置如下。

```javascript
// webpack.config.js
module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "./[name].js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          cacheDirectory: true,
          presets: [["@babel/preset-env", { modules: false }]],
        },
      },
    ],
  },
}
```

&emsp;&emsp;引入`HappyPack`插件后修改`webpack`配置。

```javascript
// webpack.config.js
const HappyPack = require("happypack")

module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "./[name].js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "happypack/loader",
      },
    ],
  },
  plugins: [
    new HappyPack({
      loaders: [
        {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
            presets: [["@babel/preset-env", { modules: false }]],
          },
        },
      ],
    }),
  ],
}
```

### 多个 loader

&emsp;&emsp;;`HappyPack`优化多个`loader`时，需要为每一个`loader`配置一个`id`，否则`HappyPack`无法知晓`rules`与`plugins`如何一一对应。

&emsp;&emsp;根目录下为`package.json`、`webpack.config.js`和`src`，`src`下包括`main.js`和`index.css`。

```javascript
// package.json
{
  ...
  "scripts": {
    "build": "webpack"
  },
  "devDependencies": {
    "@babel/core": "^7.2.2",
    "@babel/preset-env": "^7.3.1",
    "babel-loader": "^8.0.5",
    "webpack": "4.29.4",
    "webpack-cli": "3.2.3",
    "happypack": "^5.0.0",
    "css-loader": "^0.28.9",
    "style-loader": "^0.19.0"
  }
}

// src/main.js
import "./index.css"

console.log("main.js")

// src/index.css
p {
  color: red;
}
```

&emsp;&emsp;初始`webpack`配置如下。

```javascript
// webpack.config.js
module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "./[name].js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          cacheDirectory: true,
          presets: [["@babel/preset-env", { modules: false }]],
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
}
```

&emsp;&emsp;引入`HappyPack`插件后修改`webpack`配置。

```javascript
// webpack.config.js
const HappyPack = require("happypack")

module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "./[name].js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "happypack/loader?id=js",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        loader: "happypack/loader?id=css",
      },
    ],
  },
  plugins: [
    new HappyPack({
      id: "js",
      loaders: [
        {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
            presets: [["@babel/preset-env", { modules: false }]],
          },
        },
      ],
    }),
    new HappyPack({
      id: "css",
      loaders: ["style-loader", "css-loader"],
    }),
  ],
}
```

## 缩小打包范围

&emsp;&emsp;提升性能一般都是两种方式，增加资源或者缩小范围。增加资源即使用更多的`CPU`和内存，用更多的计算能力来缩短执行任务的时间。缩小范围则是针对任务本身，例如去掉冗余流程，或者不做重复性的工作等。

### exclude/include

&emsp;&emsp;对于`js`模块，一般要把`node_modules`目录排除掉。

### noParse

&emsp;&emsp;部分第三方库是完全不希望`webpack`去进行解析的，即不希望应用任何`loader`规则，库的内部也不会有对其他模块的依赖，此时就可以使用`noParse`对其进行忽略。

&emsp;&emsp;如下表示忽略所有文件名包括`lodash`的模块，这些模块仍然会被打包进资源，只不过`webpack`不会对其进行任何解析。

```javascript
// webpack.config.js
module.exports = {
  ...
  module: {
    noParse: /lodash/
}
```

### IgnorePlugin

&emsp;&emsp;;`IgnorePlugin`插件则是可以完全排除一些模块，被排除的模块即便被引用了也不会被打包进资源文件中。

&emsp;&emsp;如下`moment.js`是一个时间处理的库，为了做本地化其加载了很多语言包，一般来说用不上，而且会占用很多体积，可以用`IgnorePlugin`将其忽略掉。

&emsp;&emsp;根目录下包括`package.json`、`webpack.config.js`、`src`，`src`下包括`main.js`。

```javascript
// package.json
{
  ...
  "scripts": {
    "build": "webpack"
  },
  "devDependencies": {
    "moment": "^2.29.1",
    "webpack": "4.29.4",
    "webpack-cli": "3.2.3"
  }
}

// webpack.config.js
module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "./[name].js",
  }
}

// src/main.js
import "moment"

console.log("main.js")
```

&emsp;&emsp;运行`build`脚本打包，查看输出的资源。

![](/other/webpack/middle-ignore-plugin.png)

&emsp;&emsp;修改`webpack.config.js`，其中`resourceRegExp`匹配资源文件，`contextRegExp`匹配检索目录。

```javascript
// webpack.config.js
const webpack = require("webpack")

module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "./[name].js",
  },
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
  ],
}
```

&emsp;&emsp;再次运行`build`脚本打包，查看输出的资源。

![](/other/webpack/middle-ignore-plugin-chunks.png)

## DllPlugin

&emsp;&emsp;早期`windows`系统由于受限于计算机内存空间较小的问题而出现的一种内存优化方法叫动态链接库，当一段相同的子程序被多个程序调用时，为了减少内存消耗，可以将这段子程序存储为一个可执行文件，当被多个程序调用时只在内存中生成和使用同一个实例。

&emsp;&emsp;;`DllPlugin`借鉴了此思路，对于第三方模块或者一些不常变化的模块，可以将他们预先编译和打包，然后在项目中实际构建过程中直接取用即可。预先打包的时候还会附加生成一份模块清单，此清单将会在工程业务模块打包时起到链接和索引的作用。

&emsp;&emsp;;`DllPlugin`和`Code Splitting`类似，都可以用来提取公共模块，但是也有本质区别。`Code Splitting`是设置一些特定的规则并在打包过程中根据规则提取模块。`DllPlugin`则是将`vendor`完全拆分出来，有自己的一整套`webpack`配置并独立打包，在实际工程构建时就不再对它进行任何处理，直接取用即可。理论上`DllPlugin`会比`Code Splitting`在打包速度上更快，但是也相应的增加了配置以及资源管理的复杂度。可以理解为`DllPlugin`通过两次打包来取代一次打包，理论上速度更快，第一次打包是针对不常变化的模块，第二次打包则是针对业务模块。

### dll 打包

&emsp;&emsp;根目录下包括`webpack.config.js`、`package.json`和`src`，`src`下包括`main.js`、`index.html`。

```javascript
// package.json
{
  ...
  "scripts": {
    "build": "webpack"
  },
  "devDependencies": {
    "vue": "^2.6.12",
    "webpack": "4.29.4",
    "webpack-cli": "3.2.3"
  }
}

// src/main.js
import "vue"

console.log("main.js")
```

&emsp;&emsp;首先为动态链接库单独创建一个`webpack`配置文件，将其命名为`webpack.dll.config.js`。其中`output.filename`为动态链接库的名称，`output.path`为动态链接库的输出路径，`output.library`必须和`DllPlugin`中的`name`一致。`DllPlugin`中的`path`为动态链接库的模块清单的输出路径，`path`为`manifest.json`文件中`name`字段的值。

```javascript
// webpack.dll.config.js
const path = require("path")
const webpack = require("webpack")

const dllAssetPath = path.join(__dirname, "dist", "dll")
const dllLibraryName = "dll"

module.exports = {
  entry: ["vue"],
  output: {
    path: dllAssetPath,
    filename: "dll.js",
    library: dllLibraryName,
  },
  plugins: [
    new webpack.DllPlugin({
      name: dllLibraryName,
      path: path.join(dllAssetPath, "manifest.json"),
    }),
  ],
}
```

&emsp;&emsp;然后配置`package.json`，新增一条脚本命令。

```javascript
// package.json
{
    ...
    "scripts": {
        "dll": "webpack --config webpack.dll.config.js"
    }
}
```

&emsp;&emsp;运行`dll`脚本命令，将在`dist`目录下`dll`文件夹中生成`dll.js`和`manifest.json`。其中`dll.js`中的变量名就是上述配置中`output.library`，`manifest.json`中的`name`就是上述`DllPlugin`中的`name`。

```javascript
// dist/dll/dll.js
var dll = (function (params) {
    ...
})(...)

// dist/dll/manifest.json
{
  "name": "dll",
  "content": {
      ...
  }
}
```

&emsp;&emsp;最后需要在业务代码中链接`dll.js`。

```javascript
// webpack.config.js
const path = require("path")
const webpack = require("webpack")

module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "./[name].js",
  },
  plugins: [
    new webpack.DllReferencePlugin({
      manifest: require(path.join(__dirname, "dist/dll/manifest.json")),
    }),
  ],
}
```

&emsp;&emsp;页面引入`script`如下，页面执行到`dll.js`时会声明全局变量`dll`，而`manifest`相当于注入`main.js`的资源地图，`main.js`会先通过`name`字段找到名为`dll`的`library`，故在`webpack.dll.config.js`中`output.library`必须和`DllPlugin`中的`name`一致。

```javascript
// src/index.html
<html lang="zh-CN">
  <body>
    <p>hello world</p>
    <script src="./dll/dll.js"></script>
    <script src="./main.js"></script>
  </body>
</html>
```

### id 问题

&emsp;&emsp;查看`manifest.json`，其中每个模块都有一个`id`，其值是按照数字顺序递增的，`main.js`代码在引用`dll.js`中的模块的时候也是引用数字`id`。

&emsp;&emsp;工程打包后可能存在`dll.js`（通过`DllPlugin`构建）、`utils.js@[chunkhash].js`、`main.js`。其中`dll.js`中包含`vue`，其`id`为`5`。当尝试添加更多的模块到`dll.js`中时，重新构建后`vue`的`id`变为`6`。

&emsp;&emsp;由于`utils`也引用了`vue`模块，重新构建后其`chunkhash`则会发生改变，但是其本身内容并未改变，而在客户端用户只有重新下载资源。

&emsp;&emsp;解决此问题的方式则使用`HashedModuleIdsPlugin`插件。

```javascript
// webpack.dll.config.js
module.exports = {
  plugins: [
    new webpack.DllPlugin({
      ...
    }),
    new webpack.HashedModuleIdsPlugin()
  ]
}
```

## tree shaking

&emsp;&emsp;;`ES6 Module`的依赖关系的构建是在代码编译时而非运行时，基于此特性，`webpack`提供了`tree shaking`功能，它可以在打包过程中检测工程中没有被引用的模块，此部分代码将永远无法被执行到，因此也被称为“死代码”。

&emsp;&emsp;;`webpack`会对这部分代码进行标记，并在资源压缩时将它们从最终的`bundle`中去掉。

&emsp;&emsp;如下`webpack`打包时会对`bar`函数添加一个标记，然后通过压缩工具来去除死代码。

```javascript
// src/main.js
import { foo } from "./utils.js"

foo()

// src/utils.js
export function foo() {
  console.log("foo")
}

export function bar() {
  console.log("bar")
}
```

[上一篇](upper.md)

[下一篇](lower.md)
