# 万字长文系统梳理 Webpack 基础（下）

![](/other/webpack/banner.jpg)

## webpack 插件

### 构建流程

&emsp;&emsp;;`webpack` `loader`是负责不同类型文件的转译，将其转换为`webpack`能够接收的模块。而`webpack`插件则与`loader`有很大的区别，`webpack`插件是贯穿整个构建流程的，构建流程中的各个阶段会触发不同的钩子函数，在不同的钩子函数中做一些处理就是`webpack`插件要做的事情。

&emsp;&emsp;;`webpack`一次完整的打包构建流程如下。

- 初始化参数：将`cli`命令行参数与`webpack`配置文件合并、解析得到参数对象
- 加载插件：参数对象传给`webpack`初始化生成`compiler`对象，执行配置文件中的插件实例化语句（例如`new HtmlWebpackPlugin()`），为`webpack`事件流挂上自定义`hooks`
- 开始编译：执行`compiler`对象的`run`方法开始编译，每次`run`编译都会生成一个`compilation`对象
- 确定入口：触发`compiler`对象的`make`方法，开始分析入口文件
- 编译模块：从入口文件出发，调用`loader`对模块进行转译，再查找模块依赖的模块并转译，递归完成所有模块的转译
- 完成编译：根据入口和模块之间的依赖关系，组装成一个个的`chunk`，执行`compilation`的`seal`方法对每个`chunk`进行整理、优化、封装
- 输出资源：执行`compiler`的`emitAssets`方法把生成的文件输出到`output`的目录中

![](/other/webpack/lower-process.png)

### 自定义插件

&emsp;&emsp;;`webpack`插件特点如下。

- 独立的`js`模块，暴露相应的函数
- 函数原型上的`apply`方法会注入`compiler`对象
- `compiler`对象上挂载了相应的`webpack`钩子
- 事件钩子的回调函数里能拿到编译后的`compilation`对象，如果是异步钩子还能拿到相应的`callback`函数

```javascript
class CustomDlugins {
  constructor() {}
  
  apply(compiler) {
    compiler.hooks.emit.tapAsync('CustomDlugins', (compilation, callback) => {})
  }
}

module.exports = CustomDlugins
```

&emsp;&emsp;大多数面向用户的插件都首先在`compiler`上注册，如下为`compiler`上暴露的一些常用的钩子。

|      钩子      |       类型        |                                  作用                                  |
| :------------: | :---------------: | :--------------------------------------------------------------------: |
|     `run`      | `AsyncSeriesHook` |                       在编译器开始读取记录前执行                       |
|   `compiler`   |    `SyncHook`     |                  在一个新的`compilation`创建之前执行                   |
| `compilation`  |    `SyncHook`     |                   在一次`compilation`创建后执行插件                    |
|     `make`     | `AsyncSeriesHook` |                          完成一次编译之前执行                          |
|     `emit`     | `AsyncSeriesHook` |          在生成到`output`目录之前执行，回调参数`compilation`           |
|  `afterEmit`   | `AsyncSeriesHook` |                    在生成文件到`output`目录之后执行                    |
| `assetEmitted` | `AsyncSeriesHook` | 生成文件的时候执行，提供访问产出文件信息的入口，回调参数`file`、`info` |
|     `done`     | `AsyncSeriesHook` |                  一次编译完成后执行，回调参数`stats`                   |

&emsp;&emsp;自定义文件清单插件，打包后自动生成文件清单，记录文件列表、文件数量。

&emsp;&emsp;根目录下包括`package.json`、`webpack.config.js`和`src`，`src`下包括`main.js`。

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
module.exports = {
  entry: './src/main.js',
  output: {
    filename: './[name].js',
  },
  plugins: [],
}

// src/main.js
console.log('hello world')
```

&emsp;&emsp;然后继续在根目录下创建`plugins`文件夹，其中新建`FileListPlugin.js`文件，`webpack.config.js`中引入插件。

&emsp;&emsp;注意此场景要在文件生成到`dist`目录之前进行，所以要注册的是`compiler`上的`emit`钩子。`emit`是一个异步串行钩子，用`tapAsync`来注册。

&emsp;&emsp;;`emit`的回调函数里可以拿到`compilation`对象，所有待生成的文件都在其`assets`属性上。通过`compilation.assets`获取文件列表，整理后将其写入新文件准备输出。

&emsp;&emsp;最后再往`compilation.assets`添加新文件。

```javascript
// plugins/FileListPlugin.js
class FileListPlugin {
  constructor(options) {
    this.filename = options && options.filename ? options.filename : 'FILELIST.md'
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('FileListPlugin', (compilation, callback) => {
      const keys = Object.keys(compilation.assets)
      const length = keys.length

      var content = `# ${length} file${length > 1 ? 's' : ''} emitted by webpack\n\n`

      keys.forEach(key => {
        content += `- ${key}\n`
      })

      compilation.assets[this.filename] = {
        source: function () {
          return content
        },
        size: function () {
          return content.length
        },
      }

      callback()
    })
  }
}

module.exports = FileListPlugin

// webpack.config.js
const FileListPlugin = require('./plugins/FileListPlugin')

module.exports = {
  ...
  plugins: [
    new FileListPlugin({
      filename: 'filelist.md',
    }),
  ],
}
```

## 开发优化

### webpack 插件

#### webpack-dashboard

&emsp;&emsp;;`webpack-dashboard`是用来优化`webpack`日志的工具。

&emsp;&emsp;根目录下为`webpack.config.js`、`package.json`和`src`，`src`下包括`main.js`。

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
    "webpack-cli": "3.2.3",
    "webpack-dashboard": "^2.0.0"
  }
}

// webpack.config.js
const DashboardPlugin = require('webpack-dashboard/plugin')

module.exports = {
  entry: './src/main.js',
  output: {
    filename: './[name].js',
  },
  plugins: [new DashboardPlugin()],
  mode: 'development',
}

// src/main.js
import vue from 'vue'

console.log(vue)
```

&emsp;&emsp;若要使`webpack-dashboard`生效，还要修改原有的启动命令。

```javascript
// package.json
{
  ...
  "scripts": {
    "build": "webpack-dashboard -- webpack"
  }
}
```

&emsp;&emsp;运行`build`命令后，控制台会打印如下内容，左上角`Log`为`webpack`本身的日志，左下角`Modules`则是此次参与打包的模块，可以查看模块的占用体积和比例，右下角`Problems`可以查看构建过程的警告和错误等。

![](/other/webpack/lower-webpack-dashboard.png)

#### speed-measure-webpack-plugin

&emsp;&emsp;;`speed-measure-webpack-plugin`（`SMP`）可以分析出`webpack`整个打包过程中在各个`loader`和`plugin`上耗费的时间，根据分析结果可以找出哪些构建步骤耗时较长，以便于优化和反复测试。

&emsp;&emsp;;`SMP`使用时需要把它的`wrap`方法包裹在`webpack`的配置对象外面。

```javascript
// webpack.config.js
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
const smp = new SpeedMeasurePlugin()

module.exports = smp.wrap({
  entry: './src/main.js',
  output: {
    filename: './[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          cacheDirectory: true,
          presets: [['@babel/preset-env', { modules: false }]],
        },
      },
    ],
  },
})

// src/main.js
const fn = () => {
  console.log('hello world')
}

fn()

// package.json
{
  ...
  "scripts": {
    "build": "webpack"
  },
  "devDependencies": {
    "webpack": "4.29.4",
    "webpack-cli": "3.2.3",
    "@babel/core": "^7.2.2",
    "@babel/preset-env": "^7.3.1",
    "babel-loader": "^8.0.5",
    "speed-measure-webpack-plugin": "^1.2.2"
  }
}
```

&emsp;&emsp;运行`build`脚本打包后控制台输出如下，可以看出`babel-loader`转译时耗费了`1.16`秒。

![](/other/webpack/lower-speed-measure-webpack-plugin.png)

### webpack-merge

&emsp;&emsp;;`webpack-merge`用于需要配置多种打包环境的项目。

&emsp;&emsp;若项目包括本地环境、生产环境，每个环境对应的配置都不同，但也有一些公共的部分，则需要将公共部分提取出来。

&emsp;&emsp;根目录下为`package.json`、`src`和`build`，`src`下包括`index.html`、`main.js`，`build`下包括`webpack.base.conf.js`、`webpack.dev.conf.js`和`webpack.prod.conf.js`。

```javascript
// package.json
{
  ...
  "scripts": {
    "dev": "webpack-dev-server --config=./build/webpack.dev.conf.js",
    "build": "webpack --config=./build/webpack.prod.conf.js"
  },
  "devDependencies": {
    "webpack": "4.29.4",
    "webpack-cli": "3.2.3",
    "webpack-dev-server": "3.1.14",
    "webpack-merge": "^4.1.4",
    "file-loader": "^1.1.6",
    "css-loader": "^0.28.7",
    "style-loader": "^0.19.0",
    "html-webpack-plugin": "3.2.0"
  }
}

// src/main.js
console.log('hello world')

// src/index.html
<html lang="zh-CN">

<body>
  <p>hello world</p>
</body>

</html>
```

&emsp;&emsp;其中开发环境和生产环境的公共配置如下。

```javascript
// build/webpack.base.conf.js
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/main.js',
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/,
        use: 'file-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],
}
```

&emsp;&emsp;开发环境的配置如下，其中`webpack-merge`在合并`module.rules`的过程中，会以`test`属性作为标识符，当发现有相同项出现时会以后面的规则覆盖前面的规则，如此就不必添加冗余代码。

&emsp;&emsp;如下开发环境的`loader`包括`file-loader`、`css-loader`、`babel-loader`，其中`css-loader`和`babel-loader`覆盖了之前`loader`并开启了`sourceMap`。

```javascript
// build/webpack.dev.conf.js
const baseConfig = require('./webpack.base.conf.js')
const merge = require('webpack-merge')

module.exports = merge.smart(baseConfig, {
  output: {
    filename: './[name].js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
  devServer: {
    port: 3000,
  },
  mode: 'development',
})
```

&emsp;&emsp;生产环境配置如下。

```javascript
// build/webpack.prod.conf.js
const baseConfig = require('./webpack.base.conf.js')
const merge = require('webpack-merge')

module.exports = merge.smart(baseConfig, {
  output: {
    filename: './[name].[chunkhash:8].js',
  },
  mode: 'production',
})
```

### 模块热替换

&emsp;&emsp;自动刷新（`live reload`）即只要代码改动就会重新构建，再触发网页刷新。而`webpack`在此基础上又进了一步，可以在不刷新网页的前提下得到最新的代码改动，即模块热替换（`Hot Module Replacement，HMR`）。

#### 配置

&emsp;&emsp;;`HMR`需手动配置开启，如下配置会为每个模块绑定上`module.hot`对象，其中包含了`HMR`的`API`（例如可以对特定模块开启或关闭`HMR`等）。

```javascript
// webpack.config.js
const webpack = require('webpack')

module.exports = {
  ...
  plugins: [new webpack.HotModuleReplacementPlugin()],
  devServer: {
    hot: true,
  },
}
```

&emsp;&emsp;配置后还需要手动调用`module.hot`上的`API`来开启`HMR`。如下若`main.js`是应用的入口，则可以将调用`HMR API`的代码放在此入口中，那么`main.js`及其依赖的所有模块都会开启`HMR`。当发现模块有改动时，`HMR`会使应用在当前环境下重新执行`main.js`，但是页面本身不会刷新。

```javascript
// main.js
...

if (module.hot) {
  module.hot.accept()
}
```

&emsp;&emsp;若应用的逻辑比较复杂，则不推荐使用`webpack`的`HMR`，因为`HMR`触发过程中可能会有预想不到的问题，建议开发者使用第三方提供的`HMR`解决方案，例如`vue-loader`、`react-hot-loader`。

#### 开启 HMR

&emsp;&emsp;根目录下为`webpack.config.js`、`package.json`和`src`，`src`下包括`main.js`、`index.html`和`utils.js`。

```javascript
// webpack.config.js
const webpack = require('webpack')

module.exports = {
  entry: './src/main.js',
  output: {
    filename: './[name].js',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],
  devServer: {
    hot: true,
  },
}

// package.json
{
  ...
  "scripts": {
    "dev": "webpack-dev-server"
  },
  "devDependencies": {
    "webpack": "4.29.4",
    "webpack-cli": "3.2.3",
    "webpack-dev-server": "3.1.14",
    "html-webpack-plugin": "3.2.0"
  }
}

// src/main.js
import { logToHtml } from './utils.js'

var count = 0

setInterval(() => {
  count += 1
  logToHtml(count)
}, 1000)

// src/utils.js
export function logToHtml(count) {
  document.body.innerHTML = `count: ${count}`
}

// src/index.html
<html lang="zh-CN">

<body></body>

</html>
```

&emsp;&emsp;运行`dev`脚本命令后控制台输出如下，单击`http://localhost:8080/`打开`html`。

![](/other/webpack/lower-hmr.png)

&emsp;&emsp;;`html`输出整数并每秒加`1`，修改`utils.js`如下，保存后查看`html`，页面刷新，之前计数的`count`重新开始由`0`每秒加`1`（未局部刷新）。

```javascript
// src/utils.js
export function logToHtml(count) {
  document.body.innerHTML = `count update: ${count}`
}
```

&emsp;&emsp;;`utils.js`还原，`main.js`添加如下代码，开启`HMR`。

```javascript
// src/main.js
...

if (module.hot) {
  module.hot.accept()
}
```

&emsp;&emsp;然后再次修改`utils.js`，查看`html`未刷新，而是局部更新了，`count`数值也是在之前基础上加`1`。

&emsp;&emsp;但是又会带来另一个问题，当前的`html`已经有了一个`setInterval`，而`HMR`后又会添加新的`setInterval`，并未对之前的进行清除，导致最后`html`上有不同的数字闪来闪去。

&emsp;&emsp;为了避免此问题，当`main.js`发生改变则刷新整个页面，防止有多个定时器，但是对于其他模块则继续开启`HMR`。

```javascript
// src/main.js
...

if (module.hot) {
  module.hot.decline()
  module.hot.accept(['./utils.js'])
}
```

#### HMR 流程

&emsp;&emsp;项目初次运行`dev`脚本，首先会进行构建打包，同时将如何更新模块和接收后是否更新模块的代码注入到`bundle`中。

&emsp;&emsp;而`bundle`会被写入到内存中，不写入磁盘的原因是因为访问内存中的代码比访问磁盘中的文件快，并且也减少了代码写入文件的性能开销。

![](/other/webpack/lower-hmr-process.png)

&emsp;&emsp;紧接着`webpack-dev-server`使用`express`启动本地服务，让浏览器可以请求到本地资源。然后再启动`websocket`服务，用于建立浏览器和本地服务之间的双向通信。

&emsp;&emsp;单击`http://localhost:8081/`在浏览器打开页面，此时页面建立与本地服务的`websocket`连接，同时本地服务会将刚才首次打包的`hash`值返回。

![](/other/webpack/lower-hmr-process-first.png)

&emsp;&emsp;页面获取到`hash`后，将此`hash`作为下一次请求服务端`js`和`json`的`hash`。

&emsp;&emsp;修改页面代码，`webpack`监听到文件修改，重新开始打包编译。

&emsp;&emsp;根据新生成文件名可以发现，上次输出的`hash`值会作为本次编译新生成的文件标识。依次类推，本次输出的`hash`值会被作为下次热替换的标识。

![](/other/webpack/lower-hmr-process-chunks.png)

&emsp;&emsp;编译完成后，本地服务通过`websocket`发送本次打包的`hash`给页面。

![](/other/webpack/lower-hmr-process-websocket.png)

&emsp;&emsp;页面获取到`hash`后，构造`[hash].hot-update.json`和`[hash].hot-update.js`，紧接着发出一次`ajax`请求，获取`json`文件，此`json`文件包括所有要更新的模块。然后再次通过`jsonp`请求，获取到最新的模块代码。

&emsp;&emsp;其中`json`文件返回内容中，`h`表示本次新生成的`hash`值，用于下次文件热替换请求资源的前缀，`c`表示当前要热替换的文件对应的是`main`模块。

![](/other/webpack/lower-hmr-process-main.png)

&emsp;&emsp;;`js`文件返回内容中则是本次修改的代码。

![](/other/webpack/lower-hmr-process-js.png)

&emsp;&emsp;页面接收到请求数据后，将会对新旧模块进行对比，决定是否更新模块。注意如果在热更新过程中出现错误，热更新将回退到`live reload`，即进行浏览器刷新来获取最新的打包代码。

## 打包工具

### RollUp

&emsp;&emsp;;[RollUp](https://www.rollupjs.com/) 也是`JavaScript`模块打包器，其更专注于`JavaScript`的打包，在通用性上不及`webpack`。但是相较于其他打包工具，`RollUp`总能打包出更小更快的包。`RollUp`对于代码的`tree shaking`和`es6`模块有算法优势的支持。所以一般开发应用用`webpack`，开发库的时候用`RollUp`。

&emsp;&emsp;与`webpack`一般项目内部安装不同，`RollUp`可以直接全局安装。

```javascript
npm i rollup -g
```

&emsp;&emsp;根目录下包括`package.json`、`rollup.config.js`和`src`，`src`下为`main.js`。其中`rollup.config.js`中`output.format`为输出资源的模块形式，此特性是`webpack`不具备的。如下使用的是`cjs`（`CommonJs`），除此之外还有`amd`、`es`（`ES Module`）、`umd`、`iife`（自执行函数）、`system`（`SystemJs`加载器格式）。

```javascript
// package.json
{
  ...
  "scripts": {
    "build": "rollup -c rollup.config.js"
  }
}

// rollup.config.js
module.exports = {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs',
  },
}

// src/main.js
console.log('hello world')
```

&emsp;&emsp;运行`build`脚本，根目录`dist`下输出`bundle.js`。可以明显看到打包出来的`bundle`非常干净，`RollUp`并未添加额外的代码，而同样的源代码，`webpack`打包会额外添加很多代码。

```javascript
// dist/bundle.js
'use strict'

console.log('hello world')
```

&emsp;&emsp;此外`tree shaking`特性最开始是由`RollUp`实现的，基于对`ES6 Module`的静态分析，找出没有被引用的模块，最后将其从生成的`bundle`中排除。

### Parcel

&emsp;&emsp;;[Parcel](https://zh.parceljs.org/) 在`JavaScript`打包工具中属于相对后来者，在其官网的测试中，其构建速度相较于`webpack`快了好几倍，并且是零配置开箱即用的。

&emsp;&emsp;;`Parcel`在打包速度的优化上主要做了三件事，包括利用`worker`来并行执行任务、文件系统缓存、资源编译处理流程优化。

&emsp;&emsp;其中前两件`webpack`也有，比如`webpack`在资源压缩时可以利用多核同时压缩多个资源，`babel-loader`会将编译结果缓存到项目隐藏目录下，通过文件的修改时间和状态来判断是否使用上次编译的缓存。

&emsp;&emsp;;`webpack`通过`loader`来处理不同类型的资源，`loader`本质是一个函数，其输入输出都是字符串。例如`babel-loader`，输入`ES6+`的内容，语法转换后输出为`ES5`。其大致过程为将`ES6`字符串内容解析为`AST`（抽象语法树）、对`AST`进行语法转换、生成`ES5`代码并返回字符串。

&emsp;&emsp;若是在`babel-loader`后再添加多个`loader`，其处理大致流程如下。其中涉及大量的`String`与`AST`的转换，`loader`之间互不影响，各司其职，虽然可能会有部分冗余，但是有利于保持`loader`的独立性和可维护性。

```javascript
          资源输入
             ↓
loader1   (String -> AST) --> 语法转换 --> (AST -> String)
                                                 ↓
loader2   (AST -> String) <-- 语法转换 <-- (String -> AST)
                 ↓
loader3   (String -> AST) --> 语法转换 --> (AST -> String)
                                                 ↓
                                              资源输出
```

&emsp;&emsp;而`Parcel`未明确暴露`loader`的概念，其资源处理流程不像`webpack`可以对`loader`随意组合，也正是由此它不需要太多`AST`与`String`之间的转换。

&emsp;&emsp;如下对于每一步来说，前面已解析过的`AST`，那么下一步直接使用上一步解析和转换好的`AST`即可，只用在最后一步再将`AST`转回`String`。对于一个庞大工程，解析`AST`非常耗时，优化此处将会节省很多时间。

```javascript
           资源输入
              ↓
process1   (String -> AST) --> 语法转换
                                  ↓ (process1 返回的 AST)
process2                       语法转换
                                  ↓ (process2 返回的 AST)
process3                       语法转换 --> (AST -> String)
                                                  ↓
                                               资源输出
```

&emsp;&emsp;;`Parcel`也能直接全局安装。

```javascript
npm i -g parcel-bundler
```

&emsp;&emsp;根目录下包括`package.json`和`src`，`src`下为`index.js`和`index.html`。其中`Parcel`是可以用`html`文件作为项目入口的，从`html`开始再进一步寻找依赖的资源。

&emsp;&emsp;;`Parcel`并没有属于自己的配置文件，而本质上是将配置进行了拆分，交给`babel`、`PostCss`等特定的工具分别进行管理。比如`.babelrc`，`Parcel`在打包时就会采用它作为`ES6`代码解析的配置。

```javascript
// package.json
{
  ...
  "scripts": {
    "dev": "parcel ./src/index.html",
    "build": "parcel build ./src/index.html"
  }
}

// src/index.html
<html lang="zh-CN">

<body>
  <p>hello world</p>
  <script src="./index.js"></script>
</body>

</html>

// src/index.js
console.log('hello world')
```

[上一篇](middle.md)

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125) / [Gitee](https://gitee.com/dongwei1125)、[GitHub Pages](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~