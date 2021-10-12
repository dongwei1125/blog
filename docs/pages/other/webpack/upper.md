![](/other/webpack/banner.jpg)

# Webpack 简介

## 概述

&emsp;&emsp;;`webpack`是一个开源的`JavaScript`模块打包工具，核心功能是解决模块之间的依赖，把各个模块按照特定规则和顺序组织在一起，最终合并为一个或者多个`JS`文件，整个过程被称为模块打包。

&emsp;&emsp;模块即一个日期处理的`npm`包或者一个提供工具方法的`JS`文件等。设计程序结构时，将所有代码堆砌到一起会非常糟糕，更好的方式是按照特定的功能将其拆分为多个代码段，每个代码段实现一个特定的功能，最后再通过接口将其组合。

&emsp;&emsp;;`JavaScript`设计初仅是小型的脚本语言，远没有考虑到会用其实现复杂的场景，模块化也就显得多余了。伴随技术的发展，`HTML`页面中通常会引入多个`script`文件，但是此做法有很多缺陷。

&emsp;&emsp;首先需手动维护`script`文件的加载顺序。页面的多个`script`之间通常会有依赖关系，这些依赖关系一般是隐式的，不添加注释很难清晰地指明谁依赖谁，并且加载文件过多时很容易出现问题。

&emsp;&emsp;其次是每一个`script`文件都意味着向服务器请求一次静态资源，过多的请求会拖慢网页的渲染速度。并且每个`script`标签中顶层作用域即全局作用域，直接在代码中进行变量或函数声明，会造成全局作用域的污染。

&emsp;&emsp;而模块化方式则通过导入和导出语句可以清晰地看到模块间的依赖关系。模块可以借助工具进行打包，在页面中只加载合并后的资源文件，以此减小网络开销。并且多个模块之间的作用域是隔离的，彼此不会有命名冲突。

## 安装

&emsp;&emsp;;`webpack`安装方式包括全局安装和本地安装，全局安装会绑定一个命令行环境变量，一次安装、处处运行。本地安装则会添加其成为项目的依赖，只能在项目内部使用。

&emsp;&emsp;若采用全局安装，在项目多人协作时，由于每个人系统中的`webpack`版本不同，可能导致输出结果不一致。并且部分依赖于`webpack`的插件会调用项目内部的`webpack`模块，此种情况下仍然需要本地安装`webpack`。

&emsp;&emsp;安装指定版本的`webpack`，注意`webpack4+`版本需安装`webpack-cli`命令行工具。

```javascript
npm i webpack@4.29.4 webpack-cli@3.2.3 --save-dev
```

&emsp;&emsp;安装成功后可查看`webpack`和`webpack-cli`版本号。注意`webpack`安装在本地，因此无法在命令行内使用`webpack`指令，项目内部只能使用`npx webpack`的形式。

```javascript
npx webpack -v
npx webpack-cli -v
```

## 打包

&emsp;&emsp;根目录下创建`index.html`、`index.js`、`fn.js`。

```javascript
// index.html
<!DOCTYPE html>
<html lang="zh-CN">

<head>
    <meta charset="UTF-8">
    <title>Hello World</title>
</head>

<body>
    <script src="./dist/bundle.js"></script>
</body>

</html>

// index.js
import fn from './fn.js'

fn()

// fn.js
export default function () {
    document.write('Hello World')
}
```

&emsp;&emsp;控制台运行如下打包命令，浏览器打开`index.html`显示`Hello World`。其中`entry`为资源打包的入口，`webpack`由此开始进行模块依赖的查找，获取到项目中`index.js`和`fn.js`两模块，`output-filename`为输出资源名，打包后出现`dist`目录下`bundle.js`文件，`mode`为打包模式，包括`development`、`production`、`none`三种模式，开发环境一般为`development`模式。

&emsp;&emsp;可运行`npx webpack -h`查看`webpack`配置项以及相应的命令行参数。

```javascript
npx webpack --entry=./index.js --output-filename=bundle.js --mode=development
```

&emsp;&emsp;每次打包都要输入一段冗长的命令，可编辑`package.json`文件，添加脚本命令简化输入。其中`scripts`是`npm`提供的脚本命令功能，可直接使用由模块所添加的指令（如`webpack`取代之前的`npx webpack`），运行`npm run build`然后再打开`index.html`。

```javascript
{
    ...
    "scripts": {
       "build": "webpack --entry=./index.js --output-filename=bundle.js --mode=development"
    }
    ...
}
```

&emsp;&emsp;当项目需要的配置越来越多时，命令中则要添加更多的参数，后期维护非常困难。`webpack`的默认配置文件为`webpack.config.js`，然后再去掉`package.json`中配置的打包参数。

```javascript
// webpack.config.js
module.exports = {
    entry: './index.js',
    output: {
        filename: 'bundle.js'
    },
    mode: 'development'
}

// package.json
{
    ...
    "scripts": {
       "build": "webpack"
    }
    ...
}
```

&emsp;&emsp;当修改代码时需要重新执行`npm run build`打包再打开`index.html`，`webpack`提供了更加便捷的开发工具 [webpack-dev-server](https://github.com/webpack/webpack-dev-server) 提高开发效率，当其发现项目源文件进行了更新操作就会自动刷新`live-reloading`浏览器，显示更新后的内容。

```javascript
npm i webpack-dev-server@3.1.14 --save-dev
```

&emsp;&emsp;添加`dev`脚本并配置`webpack.config.js`。`webpack-dev-server`主要工作是将打包结果放在内存中，并不会实际写入文件，每次`webpack-dev-server`接收到请求时都只是将内存中的打包结果返回给浏览器。可通过删除`dist`目录来验证，即便`dist`目录不存在，刷新页面功能仍然是正常的。

```javascript
// package.json
{
    ...
    "scripts": {
       "dev": "webpack-dev-server",
       "build": "webpack"
    }
    ...
}

// webpack.config.js
module.exports = {
    ...,
    devServer: {
        publicPath: '/dist'
    }
}
```

# 模块

## CommonJs

&emsp;&emsp;;`node.js`将`javascript`语言用于服务端编程，由于在服务器端要与操作系统和其他应用程序互动，模块化是必需的，同时`node.js`采用了部分`commonjs`的规范并在其基础上进行了一些调整。

&emsp;&emsp;有了服务端模块以后，客户端模块也由此开始发展。但是服务端与客户端的模块存在较大差异，服务端所有的模块都存放在本地硬盘，可以同步加载完成，等待时间就是硬盘的读取时间，但是对于浏览器，会存在一个非常严重的问题，由于模块都在服务端，等待时间就取决于网速的快慢，若等待时间较长，浏览器就会处于假死状态。因此，浏览器端的模块，不能采用同步加载，只能采用异步加载。

&emsp;&emsp;导出是一个模块向外暴露自身的唯一方式，`commonjs`中通过`exports`或者`module.exports`导出模块中的内容。其内部机制将`exports`指向了`module.exports`，而`module.exports`在初始化时为空对象。可以理解为`commonjs`在每个模块的首部默认添加了如下代码。注意不要直接给`exports`赋值，会导致其指向断裂，也不要两者混合运用。另外导出语句不代表模块的末尾，在`exports`或者`module.exports`后面的代码会照常执行，但是通常将其放在模块的末尾。

```javascript
var module = {
  exports: {}
}
var exports = module.exports
```

&emsp;&emsp;;`commonjs`中使用`require`导入模块，`require`导入分为两种情况，若模块是第一次被导入，会执行其内部代码，同时导出指定的内容，若模块已被导入过，模块内部代码不会再执行，而是直接导出上次执行后得到的结果。

&emsp;&emsp;模块内部`module`对象有一个属性`loaded`用于记录此模块是否被加载过，默认值为`false`，当模块第一次被加载或执行后会置为`true`，再次加载检查到`module.loaded`为`true`时将不会再执行。如下执行`node index.js`将输出`false` `true`。

```javascript
// func.js
console.log(module.loaded)
module.exports = function() {
  return module.loaded
}

// index.js
const func = require("./func.js")

console.log(func())
```

## ES6 Module

&emsp;&emsp;;`ES6 Module`也是将每个文件作为一个模块，每个模块拥有自身的作用域，不同的是导入、导出语句。`ES6 Module`会自动采用严格模式，不管模块开头是否有`'use strict'`，都会采用严格模式。

&emsp;&emsp;导出模块包括默认导出和命名导出，导入命名导出的模块需要解构出变量，导入默认导出的模块任意变量名均可接收。注意导入变量的效果相当于在当前作用域下声明了此变量，并且不可对其修改，也就是所有导入的变量都是只读的。

## CommonJS 与 ES6 Module 区别

&emsp;&emsp;两者最本质的区别在于`CommonJs`对模块的依赖是动态的，即模块依赖关系的建立发生在代码运行阶段，而`ES6 Module`对模块的依赖则是静态的，即模块依赖关系的建立发生在代码编译阶段。

&emsp;&emsp;;`CommonJs`的模块路径可以动态指定，支持传入表达式，也可以通过`if`语句判断是否加载某个模块。因此，在`CommonJs`模块被执行前，并没有办法确定明确的依赖关系，故模块导入、导出发生在代码的运行阶段。

&emsp;&emsp;;`ES6 Module`导入、导出语句均为声明式，不支持导入路径为表达式，且导入、导出语句必须位于模块的顶层作用域。即`ES6 Module`是一种静态的模块结构，在`ES6`代码编译阶段就能分析出模块的依赖关系。

&emsp;&emsp;;`ES6 Module`相对于`CommonJS`具备如下优势。

- 死代码检测和排除，可以用静态分析工具检测出哪些模块没有被调用过。引用工具类库时，工程中一般只用到一部分组件或接口，可能会将其完全加载进来，而未被调用的模块代码永远不会执行，成为死代码。静态分析工具可以在打包时去掉未曾使用过的模块，以减小打包资源体积
- 模块变量类型检查，`ES6 Module`的静态模块结构有助于确保模块之间传递的值或接口类型是正确的
- 编译器优化，`ES6 Module`支持直接导入变量，减少引用层级，程序效率更高

### 拷贝与绑定

&emsp;&emsp;若`CommonJs`的`module.exports`导出的是基本数据类型，则导入时只是值的拷贝。如下运行后输出结果为`1` `1` `2`，由于`index.js`中的`count`是对`add.js`中的`count`的值的拷贝，调用`add`函数时，虽然改变了`add.js`中`count`的值，但是并不会对导入时创建的`count`拷贝造成影响。

```javascript
// add.js
var count = 1

module.exports = {
  count,
  add() {
    count++
  },
  get() {
    return count
  }
}

// index.js
const { count, add, get } = require("./add.js")

console.log(count)
add()
console.log(count)
console.log(get())
```

&emsp;&emsp;若`module.exports`导出的是引用数据类型，则导入时是引用的拷贝。如下运行后输出结果为`{count: 1}` `{count: 2}` `true`，由于`index.js`中的`object`是对`add.js`中的`object`的引用的拷贝，调用`updateObject`改变了`add.js`中`object.count`的值，则`index.js`中`object.count`也会随之改变。

```javascript
// add.js
const object = {
  count: 1
}

module.exports = {
  object,
  updateObject() {
    object.count++
  },
  getObject() {
    return object
  }
}

// index.js
const { object, updateObject, getObject } = require("./add.js")

console.log(object)
updateObject()
console.log(object)
console.log(getObject() === object)
```

&emsp;&emsp;;`ES6 Module`导入的变量始终指向的是模块内部的变量，使用时可以获得变量的最新值。如下运行后输出结果为`1` `2` `2`，`index.js`中的`count`与`add.js`中的`count`之间建立了一种绑定关系（`binding`），可实时获取到绑定的最新值。

```javascript
// add.js
export var count = 1
export function add() {
  count++
}
export function get() {
  return count
}

// index.js
import { count, add, get } from "./add.js"

console.log(count)
add()
console.log(count)
console.log(get())
```

&emsp;&emsp;注意`export default`是不会产生绑定关系的，如下运行后输出结果为`1` `1` `2`。

```javascript
// add.js
var count = 1

export default count
export function add() {
  count++
}
export function get() {
  return count
}

// index.js
import count, { add, get } from "./add.js"

console.log(count)
add()
console.log(count)
console.log(get())
```

&emsp;&emsp;首先`export default`是一种语法糖，当模块只有一个导出的时候简化代码量。如下为`export default`导出原始类型变量`count`。

```javascript
var count = 1

export default count
```

&emsp;&emsp;然后`JavaScript`会将变量`count`交给内部变量`*default*`，然后再重命名为`default`导出。

```javascript
var count = 1
var *default* = count

export { *default* as default }
```

&emsp;&emsp;之前`export default`不会产生绑定关系的原因也即是由于语法糖的转换造成的，`index.js`中的`count`实际上绑定的是`add.js`中的内部变量`*default*`，而并不是`count`。

```javascript
// add.js
var count = 1
var *default* = count

export { *default* as default }
...

// index.js
import { default as count } from './add.js'
...
```

&emsp;&emsp;故`CommonJs`导入模块变量时，仅仅是值或者引用的拷贝。而`ES6 Module`导入的变量将始终绑定模块内部的变量，形成一种绑定关系（`binding`），注意`export default`导出的变量不会产生绑定关系，其原因是由于`JavaScript`语法糖的转换造成的。

### 循环依赖

&emsp;&emsp;循环依赖是指模块`A`依赖于模块`B`，同时模块`B`又依赖于模块`A`。日常开发中工程的复杂度上升到足够规模时，容易出现隐藏的循环依赖。

&emsp;&emsp;如下为`CommonJs`中的循环依赖，输出结果为`module foo exports {}` `module bar exports bar.js`。首先`index.js`导入并执行`foo.js`，`foo.js`导入并执行`bar.js`，然后`bar.js`中导入`foo.js`，由于已经导入过`foo.js`但是并未执行完毕，导出值此时为默认的空对象，打印结果`bar.js`执行完毕。最后执行权交回`foo.js`，打印结果流程结束。

```javascript
// index.js
require("./foo.js")

// foo.js
const bar = require("./bar.js")

console.log("module bar exports ", bar)
module.exports = "foo.js"

// bar.js
const foo = require("./foo.js")

console.log("module foo exports ", foo)
module.exports = "bar.js"
```

&emsp;&emsp;;`webpack`打包上述代码，可简化为如下。当`bar.js`再次导入`foo.js`时，直接返回的是`installedModules`中的值，此时为空对象。

```javascript
(function(modules) {
  var installedModules = {}

  function require(moduleId) {
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports
    }

    var module = (installedModules[moduleId] = {
      i: moduleId,
      exports: {}
    })

    modules[moduleId].call(module.exports, module, module.exports, require)

    return module.exports
  }

  return require("./index.js")
})({
  "./bar.js": function(module, exports, require) {
    const foo = require("./foo.js")

    console.log("module foo exports ", foo)
    module.exports = "bar.js"
  },

  "./foo.js": function(module, exports, require) {
    const bar = require("./bar.js")

    console.log("module bar exports ", bar)
    module.exports = "foo.js"
  },

  "./index.js": function(module, exports, require) {
    require("./foo.js")
  }
})
```

&emsp;&emsp;如下为`ES6 Module`的循环依赖，输出结果为`module foo exports undefined` `module bar exports bar.js`。`bar.js`也无法获取到`foo.js`的导出值，与`CommonJS`默认导出空对象不同，此时为`undefined`。

```javascript
// index.js
import foo from "./foo.js"

// foo.js
import bar from "./bar.js"

console.log("module bar exports ", bar)
export default "foo.js"

// bar.js
import foo from "./foo.js"

console.log("module foo exports ", foo)
export default "bar.js"
```

&emsp;&emsp;利用`ES6 Module`的绑定特性，改造循环绑定。首先`index.js`导入并执行`foo.js`，`foo.js`导入并执行`bar.js`，`bar.js`导入`foo.js`，由于此时`foo.js`未执行完，`foo`仍然为`undefined`，然后`bar.js`导出函数，执行权交回`foo.js`，`foo.js`再导出函数，执行权交回`index.js`，最后执行`foo`函数，由于绑定关系会执行`foo.js`内函数，将`invoked`置为`true`，再执行`bar.js`函数，`bar`函数内部又再执行`foo`函数，但是由于`foo.js`内`invoked`为`true`，`foo`函数不在执行，故执行顺序为`foo` `bar` `foo`。

```javascript
// index.js
import foo from "./foo.js"

foo()

// foo.js
import bar from "./bar.js"
var invoked = false

export default function() {
  if (!invoked) {
    invoked = true
    bar()
    console.log("module bar exports ", bar)
  }
}

// bar.js
import foo from "./foo.js"

export default function() {
  console.log("module foo exports ", foo)
  foo()
}
```

## AMD

&emsp;&emsp;;`AMD`即支持浏览器端模块化的规范，其加载模块的方式是异步的，加载模块时不会影响后面的语句执行。`RequireJS`实现了`AMD`的规范。

&emsp;&emsp;如下定义了一个`AMD`模块，其中目录下包括`index.html`和`index.js`、`foo.js`、`bar.js`模块。`require.js`模块可为`cdn`方式引入，`data-main`指定主模块文件。

&emsp;&emsp;;`require`引入模块，参数分别为加载的模块数组、模块加载完成后执行的回调函数。

&emsp;&emsp;;`define`定义模块，参数分别为当前模块名、当前模块的依赖、模块的导出值（函数或者对象，若为函数则导出函数的返回值，若为对象则直接导出）。

&emsp;&emsp;;`AMD`与同步加载的模块标准相比语法显得冗长，其加载方式也不如同步清晰。

```javascript
// index.html
...
<body>
    <p>hello world</p>
    <script src="./require.js" data-main="./index.js"></script>
</body>

// index.js
require.config({
    paths: {
        "foo": "./foo",
        "bar": "./bar"
    }
})
require(["foo"], function (foo) {
    console.log('module foo exports ', foo)
}, function (err) {
    console.log(err)
})

// foo.js
define('foo', ['bar'], function (bar) {
    console.log('module bar exports ', bar)
    return 'foo.js'
})

// bar.js
define('bar', function () {
    return 'bar.js'
})
```

## CMD

&emsp;&emsp;;`CMD`是另一种浏览器端模块化的规范，也是异步加载模块，`SeaJs`实现了`CMD`的规范。

&emsp;&emsp;;`AMD`的多个依赖模块的执行顺序和书写顺序并非一致，取决于网路速度，哪个先下载下来，哪个先执行，而主逻辑在所有依赖加载完成后才执行。

&emsp;&emsp;;`CMD`在遇到`require`语句时才执行对应的模块，其执行顺序和书写顺序是完全一致的。

&emsp;&emsp;;`AMD`是依赖前置，`CMD`则是就近依赖。`RequireJS`和`SeaJs`都是在执行模块前预加载了依赖的模块，只是所依赖模块的执行时机不同，`RequireJs`加载时执行，而`Seajs`是使用时执行。

&emsp;&emsp;;`RequireJs`使用依赖数组，根据配置信息查找每项对应的实际路径来预加载。而`Seajs`使用正则表达式捕捉内部的`require`字段，也根据配置信息查找文件的实际路径来预加载。

```javascript
// index.html
...
<body>
    <p>hello world</p>
    <script src="./sea.js"></script>
    <script src="./index.js"></script>
</body>

// index.js
seajs.config({
    paths: {
        foo: "./foo",
        bar: "./bar"
    }
})
seajs.use(['foo'], function (foo) {
    console.log('module foo exports ', foo)
})

// foo.js
define(function (require, exports, module) {
    var bar = require('bar')

    console.log('module bar exports ', bar)
    module.exports = 'foo.js'
})

// bar.js
define(function (require, exports, module) {
    module.exports = 'bar.js'
})
```

## UMD

&emsp;&emsp;;`UMD`是一种`JavaScript`通用模块定义规范，其能够在`JavaScript`所有运行环境中运行。

### 单模块

#### 非模块环境

&emsp;&emsp;非模块化环境一般通过全局对象挂载属性。其中`foo.js`为立即执行函数，`factory`工厂函数返回值挂载到全局对象上，`root`为全局对象，其值为`window`或者`global`，由运行环境决定。

```javascript
// index.html
...
<body>
    <p>hello world</p>
    <script src="./foo.js"></script>
    <script src="./index.js"></script>
</body>

// foo.js
(function (root, factory) {
    root.foo = factory()
})(this, function () {
    return 'foo.js'
})

// index.js
console.log(foo)
```

#### AMD

&emsp;&emsp;;`AMD`方式则要满足`AMD`规范。

```javascript

// index.html
...
<body>
    <p>hello world</p>
    <script src="./require.js" data-main='./index.js'></script>
</body>

// index.js
require.config({
    paths: {
        "foo": "./foo"
    }
})
require(["foo"], function (foo) {
    console.log(foo)
}, function (err) {
    console.log(err)
})

// foo.js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('foo', factory)
    } else {
        root.foo = factory()
    }
})(this, function () {
    return 'foo.js'
})
```

#### UMD

&emsp;&emsp;;`UMD`即支持非模块环境、`CommonJS`、`AMD`、`CMD`规范的模块。

```javascript
// foo.js
(function(root, factory) {
  if (typeof module === "object") {
    module.exports = factory()
  } else if (typeof define === "function" && define.amd) {
    define("foo", factory)
  } else if (typeof define === "function" && define.cmd) {
    define(function(require, exports, module) {
      module.exports = factory()
    })
  } else {
    root.foo = factory()
  }
})(this, function() {
  return "foo.js"
})
```

### 多模块

&emsp;&emsp;;`UMD`模块依赖其他`UMD`模块时。

#### AMD

```javascript
// index.html
...
<body>
    <p>hello world</p>
    <script src="./require.js" data-main='./index.js'></script>
</body>

// index.js
require.config({
    paths: {
        foo: "./foo",
        bar: "./bar"
    }
})
require(["foo"], function (foo) {
    console.log('module foo exports ', foo)
})

// foo.js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('foo', ['bar'], factory)
    } else {
        root.foo = factory(root.bar)
    }
}(this, function (bar) {
    console.log('module bar exports ', bar)
    return 'foo.js'
}))

// bar.js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('bar', factory)
    } else {
        root.bar = factory()
    }
}(this, function () {
    return 'bar.js'
}))
```

#### UMD

```javascript
// foo.js
(function(root, factory) {
  if (typeof module === "object") {
    var bar = require("./bar")

    module.exports = factory(bar)
  } else if (typeof define === "function" && define.amd) {
    define("foo", ["bar"], factory)
  } else if (typeof define === "function" && define.cmd) {
    define(function(require, exports, module) {
      var bar = require("bar")

      module.exports = factory(bar)
    })
  } else {
    root.foo = factory(root.bar)
  }
})(this, function(bar) {
  console.log("module bar exports ", bar)
  return "foo.js"
})(
  // bar.js
  (function(root, factory) {
    if (typeof module === "object") {
      module.exports = factory()
    } else if (typeof define === "function" && define.amd) {
      define("bar", factory)
    } else if (typeof define === "function" && define.cmd) {
      define(function(require, exports, module) {
        module.exports = factory()
      })
    } else {
      root.bar = factory()
    }
  })(this, function() {
    return "bar.js"
  })
)
```

# 资源输入输出

## 概念

- `module`：所有的`js`、`css`、`png`等文件都是`module`模块
- `chunk`：代码块，`webpack`打包过程中入口文件依赖的模块，模块再依赖其他模块，以上模块组成的集合被称为`chunk`
- `bundle`：包文件，`webpack`打包生成的源文件

&emsp;&emsp;;`module`、`chunk`、`bundle`实质就是同一套代码逻辑在不同转换场景下的不同名字。编写阶段，每一个单文件都是一个`module`模块。打包阶段，根据入口文件所依赖的所有模块组成的集合为`chunk`代码块。打包输出后每一个源文件都是`bundle`包文件。

&emsp;&emsp;形象化一个打包场景来描述上述概念，其中`webpack.config.js`配置文件如下，插件的作用仅是单独抽离出`css`文件。

```javascript
// webpack.config.js
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

module.exports = {
  entry: {
    index: "./index.js",
    main: "./main.js",
  },
  output: {
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
            MiniCssExtractPlugin.loader,
            "css-loader"
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
  ],
}
```

&emsp;&emsp;入口文件分别为`index.js`和`main.js`，其中`index.js`引入了`index.css`的样式和`utils`工具类的一个函数，`mian.js`是一个单独的模块。

```javascript
// index.js
import './index.css'
import { log } from './utils.js'

log('index.js')

// index.css
p { 
  background: blue; 
}

// utils.js
export function log(val) {
  console.log(val)
}

// main.js
console.log('main.js')
```

&emsp;&emsp;注意可能由于部分插件和`loader`版本与`webpack`版本的依赖差异，导致打包出错，如下为可行的`package.json`文件。

```javascript
// package.json
{
    ...
    "devDependencies": {
        "webpack": "4.29.4",
        "webpack-cli": "3.2.3",
        "css-loader": "^0.28.9",
        "mini-css-extract-plugin": "^0.5.0"
    }
}
```

&emsp;&emsp;执行打包命令完成，结果如下。

![](/other/webpack/upper-chunks.png)

&emsp;&emsp;初始模块为`index.css`、`utils.js`、`index.js`和`main.js`，打包阶段`index.js`、`index.css`和`utils.js`均构成代码块`chunk 0`，`main.js`构成代码块`chunk 1`，打包输出后的`index.css`、`index.js`和`main.js`均为包文件。

```javascript
—— module ———— chunk ———— bundle
 index.css                index.css
           \           /
 utils.js ——  chunk 0  —— index.js
           /
 index.js
 main.js  ——  chunk 1  —— main.js
```

## 入口 (entry)

&emsp;&emsp;;`entry`即入口文件路径，`webpack`基于此开始进行打包。

&emsp;&emsp;若传入一个字符串或字符串数组，`chunk`会被命名为`main`。

&emsp;&emsp;若传入一个对象，则每个属性的键会是`chunk`的名称。

### 字符串类型

```javascript
module.exports = {
    entry: './index.js',
    ...
}
```

### 数组类型

```javascript
module.exports = {
    entry: ['./main.js', './index.js'],
    ...
}
```

### 对象类型

```javascript
module.exports = {
    entry: {
        index: './index.js',
        main: './main.js'
    },
    ...
}
```

### 函数类型

&emsp;&emsp;函数类型返回以上任意类型均可，其优点在于可在函数体内部添加部分动态逻辑来获取工程入口，函数也支持返回`Promise`对象来进行异步操作。

```javascript
module.exports = {
  entry: () => "./index.js",
}

module.exports = {
  entry: () =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve("./index.js")
      }, 5000)
    })
}
```

## 出口 (output)

### filename

&emsp;&emsp;即输出资源的文件名，其形式为字符串，可以为相对路径，若路径中的目录不存在则`webpack`在输出资源时会创建此目录。如下打包完成后会在根目录创建`build`文件夹。

```javascript
module.exports = {
    ...
    output: {
        filename: '../build/index.js',
    }
}
```

&emsp;&emsp;;`webpack`也支持类似模板语言的形式动态地生成文件名。如下`filename`中的`name`会被替换为`chunk name`，即最终项目生成的资源是`index.js`和`main.js`。

```javascript
module.exports = {
    entry: {
        index: './index.js',
        main: './main.js'
    },
    output: {
        filename: '[name].js',
    }
    ...
}
```

&emsp;&emsp;;`filename`部分常用配置项模板变量如下。其作用是当有多个`chunk`存在时对不同的`chunk`进行区分。另一个作用是控制客户端缓存，`chunkhash`与`chunk`内容直接相关，当`chunk`内容改变时同时会引起资源文件名的更改，用户在下一次请求资源文件时便会立即下载新的版本而不会使用本地缓存。

- `hash`：`webpack`打包所有资源生成的`hash`
- `id`：当前`chunk`的`id`
- `chunkhash`：当前`chunk`内容的`hash`

### path

&emsp;&emsp;;`path`用于指定资源的输出路径，且值必须为绝对路径，如下将资源输出位置设置为工程的`lib`目录。`webpack4+`版本默认为`dist`目录，若非修改输出路径，否则不用单独配置。

```javascript
const path = require('path')

module.exports = {
    ...
    output: {
        ...
        path: path.join(__dirname, 'lib'),
    }
}
```

### publicPath

&emsp;&emsp;;`path`用来指定资源的输出位置，`publicPath`用来指定资源的请求位置。

&emsp;&emsp;请求位置即由`js`或者`css`所请求的间接资源路径，诸如`html`加载的`script`，或者异步加载的`js`、`css`请求的图片等，`publicPath`即指定上述资源的请求位置。

&emsp;&emsp;形象化一个打包场景来描述上述情况，其中根目录下包括`index.html`、`index.js`等文件。`index.html`为模板文件，插件的作用是将打包后的`js`文件插入到模板中。

```javascript
// index.html
<html lang="zh-CN">
    ...
<body>
    <div id="app">hello world</div>
</body>

</html>

// index.js
console.log('index.js')

// package.json
{
  ...
  "scripts": {
    "build": "webpack"
  },
  "devDependencies": {
    "webpack": "^4.29.4",
    "webpack-cli": "^3.2.3",
    "html-webpack-plugin": "^3.2.0"
  }
}

// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: './index.js',
    output: {
        filename: 'index.js',
        publicPath: '/lib/',
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
        })
    ]
}
```

&emsp;&emsp;运行`npm run build`打包后，当前根目录下生成`dist`文件夹，其中包括`index.html`和`index.js`。

```javascript
// index.html
<html lang="zh-CN">
  ...
  <body>
    <div id="app">hello world</div>
    <script type="text/javascript" src="/lib/index.js"></script>
  </body>
</html>
```

&emsp;&emsp;;`VS Code`编辑器安装`Live Sever`插件，用来在本机上模拟`index.html`部署到服务器上的真实场景，`index.html`内部右击`Open with Live Server`开启本地服务，打开浏览器调试界面`Network`项，可查看如下`js`请求，其中`Request URL`即为资源的请求位置。

![](/other/webpack/upper-req-url.png)

&emsp;&emsp;;`publicPath`的不同将最终导致资源的请求地址也不同，其中`publicPath`分为如下三种形式，当前`index.html`文件地址为`http://127.0.0.1:5500/dist/index.html`，资源名称为`index.js`。

- `html`相关：资源路径与`html`文件目录关联，即资源路径为`html`目录路径加上`publicPath`和文件名

```javascript
———— publicPath ———————— Request URL
     ''                  http://127.0.0.1:5500/dist/index.js
     './js'              http://127.0.0.1:5500/dist/js/index.js
     '../assets/'        http://127.0.0.1:5500/assets/index.js
```

- 根目录相关：若`publicPath`以`'/'`开始，则资源路径以页面根目录路径为基础

```javascript
———— publicPath ———————— Request URL
     '/'                 http://127.0.0.1:5500/index.js
     '/js'               http://127.0.0.1:5500/js/index.js
     '/dist/'            http://127.0.0.1:5500/dist/index.js
```

- 绝对路径：绝对路径的情况一般是将静态资源放在`CDN`上面

```javascript
———— publicPath ———————— Request URL
     'https://cdn.com/'  https://cdn.com/index.js
     '//cdn.com/'        http://cdn.com/index.js
```

### devServer.publicPath

&emsp;&emsp;;`devServer`的配置中也有`publicPath`，其作用是指定`devServer`的静态资源服务路径，或者说指定资源打包到内存中的位置。

&emsp;&emsp;当启动`devServer`资源会被打包到内存中，`devServer`会到内存中查找打包好的资源文件，然后再去本地目录中查找内容，`devServer.contentBase`可控制它去哪访问本地目录的资源。

&emsp;&emsp;;`contentBase`默认为当前的工作目录，若查找不到内存中的资源，则会到`contentBase`中查找。

&emsp;&emsp;若不指定`devServer.publicPath`，`devServer`会获取`output.publicPath`的值，为了避免开发环境和生产环境产生不一致，一般保持`devServer.publicPath`与`output.publicPath`相同，或者不指定`devServer.publicPath`。

# 预处理器

&emsp;&emsp;;`webpack`只能处理`JavaScript`和`JSON`文件，对于其他资源例如`css`、图片，或者其他的语法集`ts`等是没有办法加载的。`loader`让`webpack`能够去处理其他类型的文件，并将它们转换为`webpack`能够接收的模块加载进来，`loader`实质上是做一个预处理的工作。

&emsp;&emsp;每个`loader`本质上都是一个函数，大致形式为`output = loader(input)`，`input`为即将被转换的模块，`output`为转换后的模块，使用`babel-loader`将`ES6+`代码转换为`ES5`时，上述形式为`ES5 = babel-loader(ES6+)`。`loader`可以是链式的，即某一个`loader`的输出可以作为其他`loader`的输入，其形式为`output = loaderA(loaderB(input)))`。

&emsp;&emsp;;`loader`包括`test`和`use`两个属性，`test`用于识别哪些文件会被转换，`use`定义在进行转换时应该使用哪一个`loader`。

## 配置项

### options

&emsp;&emsp;;`loader`通常会提供一些配置项，一般通过`options`来将其传入，具体的`loader`不同其提供的`options`也不同。

```javascript
module.exports = {
    ...
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        ...
                    }
                }
            }
        ]
    }
}
```

### exclude/include

&emsp;&emsp;排除或包含指定目录下的模块，可接受正则表达式或文件绝对路径字符串。如下为排除`node_modules`下的模块。

```javascript
{
    test: /\.js$/,
    exclude: /node_modules/
    ...
}
```

&emsp;&emsp;;`include`表示只包含匹配到的模块，如下为只包含`src`目录。

```javascript
{
    test: /\.js$/,
    include: /src/
    ...
}
```

&emsp;&emsp;若`include`和`exclude`同时存在，`exclude`的优先级更高。如下表示排除`node_modules`下所有模块。

```javascript
{
    test: /\.js$/,
    exclude: /node_modules/,
    include: /node_modules\/lodash/
    ...
}
```

### resource/issuer

&emsp;&emsp;;`resource`是被加载者，而`issuer`是加载者，两者可用于更加精确地确定模块规则的作用范围。

&emsp;&emsp;如下为仅`src`目录下的`js`文件可以引用`css`。

```javascript
{
    test: /\.css$/,
    use: ['style-loader', 'css-loader'],
    issuer: {
        test: /\.js$/,
        include: /src/
    }
}
```

&emsp;&emsp;上述`test`、`include`、`exclude`配置项分布于不同层级上，可读性较差，更好的方式是添加`resource`对象将外层的配置包裹起来。

&emsp;&emsp;如下为除了`node_modules`下的`js`，其余`js`都能引用`css`文件。仅`src`目录下的`css`文件可以被引用。

```javascript
{
    use: ['style-loader', 'css-loader'],
    issuer: {
        test: /\.js$/,
        exclude: /node_modules/
    },
    resource: {
        test: /\.css$/,
        include: /src/
    }
}
```

### enforce

&emsp;&emsp;用来指定`loader`的种类，只接收`pre`或`post`两种类型。`webpack`中`loader`执行顺序可分为`pre`（优先处理）、`inline`（其次处理）、`normal`（正常处理）、`post`（最后处理），上述直接定义的`loader`都属于默认`normal`类型，`post`和`pre`需使用`enfore`来指定。

&emsp;&emsp;如下表示`eslint-loader`将在所有正常的`loader`之前执行。实际不用指定`enforce`只要保证`loader`的执行顺序是正确的即可，配置`enforce`主要目的是使模块规则更加清晰可读。

```javascript
rules: [
  {
    test: /\.js$/,
    enforce: "pre",
    use: "eslint-loader",
  },
]
```

## 常用 loader

### sass-loader

&emsp;&emsp;;`sass-loader`是`scss`类型文件的预处理器，处理其语法并编译为`css`。`sass-loader`核心依赖于`node-sass`，而`node-sass`又依赖于`node`，安装时注意`node-sass`与`node`之间的版本支持。

&emsp;&emsp;之后`css-loader`处理`css`的各种加载语法，将`@imoprt`或者`url()`函数转换为`require`。仅仅是把`css`模块加载到`js`代码中，并未实际使用。

&emsp;&emsp;最后由`style-loader`将`js`中的样式字符串包装成`style`标签插入页面。

&emsp;&emsp;上述处理场景如下，根目录包括`index.js`、`index.scss`、`index.html`、`package.json`等。

```javascript
// package.json
{
  ...
  "scripts": {
    "dev": "webpack-dev-server",
    "build": "webpack"
  },
  "devDependencies": {
    "webpack": "4.29.4",
    "webpack-cli": "3.2.3",
    "webpack-dev-server": "3.1.14",
    "html-webpack-plugin": "3.2.0",
    "css-loader": "^0.28.9",
    "style-loader": "^0.19.0",
    "node-sass": "^4.7.2",
    "sass-loader": "^6.0.7"
  }
}

// index.scss
$color: red;

p {
    color: $color;
}

// index.js
import './index.scss'

// index.html
<html lang="zh-CN">
    ...
<body>
    <p>hello world</p>
</body>

</html>

// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: './index.js',
    output: {
        filename: 'index.js'
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            }
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
        })
    ],
    mode: 'development',
}
```

&emsp;&emsp;运行`npm run dev`，打开页面可查看`css`样式已经注入到`html`中了。

![](/other/webpack/upper-sass.png)

### babel-loader

&emsp;&emsp;;`babel-loader`用来处理`ES6+`并将其编译为`ES5`，使其能够在项目中使用最新的语言特性，也不用关注这些特性在不同平台的兼容性。

&emsp;&emsp;安装`babel`需同时安装`babel-loader`、`@babel/core`和`@babel/preset-env`。其中`@babel/core`是`babel-loader`依赖的核心模块，`@babel/preset-env`是官方推荐的预制器，可根据用户配置的目标浏览器或者运行环境自动添加所需的插件和补丁来编译`ES6+`代码，`babel-loader`作为中间桥梁调用`@babel/core`的`api`来告诉`webpack`要如何处理`js`。

```javascript
{
    test: /\.js$/,
    loader: 'babel-loader',
    exclude: /node_modules/,
    options: {
        cacheDirectory: true,
        presets: [
            ['@babel/preset-env', { modules: false }]
        ]
    },
}
```

&emsp;&emsp;;`babel-loader`通常会编译所有的`js`模块，会严重拖慢打包速度，并且有可能改变第三方模块的原有行为，所以需要`exclude`排除`node_modules`。

&emsp;&emsp;;`cacheDirectory`启用缓存机制，当重复打包未改变过的模块时，将会尝试读取缓存，避免产生高性能的重新编译过程。`cacheDirectory`接收字符串类型的路径或者`true`，为`true`时将使用默认的缓存目录`node_modules/.cache/babel-loader`。

&emsp;&emsp;;`@babel/preset-env`会将`ES6 Mudule`转化为`CommonJs`，将导致`webpack`的`tree-shaking`失效，可设置`modules`为`false`关闭此行为，而将`ES6 Module`的转化交给`webpack`处理。

&emsp;&emsp;;`babel-loader`也支持外置`.babelrc`配置文件，将`presets`和`plugins`提取出来。

```javascript
// .babelrc
{
    "presets": [
        ["@babel/preset-env", { "modules": false }]
    ]
}
```

### url-loader

&emsp;&emsp;;`url-loader`用于打包文件类型的模块，对小于`limit`阈值的图片进行处理，并将其转换为`base64`编码。

&emsp;&emsp;将图片转换的`base64`编码引入代码中，可以减小请求次数提高页面性能。但是也会增加`js`或者`html`的文件体积，图片在项目中使用次数较多，每一个引用的地方都会生成`base64`编码，从而造成代码的冗余。另一方面浏览器可以缓存`http`请求的图片。因此需要平衡考虑，合理设置`limit`阈值。

```javascript
{
  test: /\.(png|jpg|gif)$/,
  use: {
    loader: 'url-loader',
    options: {
      limit: 10240
    }
  }
}
```

### file-loader

&emsp;&emsp;;`file-loader`也用于打包文件类型的模块，`url-loader`不能处理的大于阈值的图片交给`file-loader`处理，根据配置将资源输出到打包目录。

```javascript
{
    test: /\.(png|jpg|gif)$/,
    use: [
        {
            loader: 'file-loader',
            options: {
                name: 'img/[name].[hash:8].[ext]'
            }
        },
    ],
}
```

### vue-loader

&emsp;&emsp;;`vue-loader`用来处理`vue`文件，提取出其中的`template/script/style`代码，再分别交给对应的`loader`处理。其中`css-loader`处理`style`样式代码，`vue-template-compiler`负责将`template`模板编译为`render`渲染函数，`vue-loader`默认支持`ES6`，每个`vue`组件可生成`css`作用域等。

&emsp;&emsp;使用`vue-loader`场景如下，根目录下包括`index.html`、`index.js`、`App.vue`等文件。

```javascript
// package.json
{
  ...
  "scripts": {
    "dev": "webpack-dev-server",
    "build": "webpack"
  },
  "devDependencies": {
    "webpack": "4.29.4",
    "webpack-cli": "3.2.3",
    "webpack-dev-server": "3.1.14",
    "html-webpack-plugin": "3.2.0",
    "css-loader": "^0.28.9",
    "vue": "^2.5.13",
    "vue-loader": "^14.1.1",
    "vue-template-compiler": "^2.5.13"
  }
}

// index.js
import Vue from "vue"
import App from "./App.vue"

new Vue({
  el: "#app",
  render: (h) => h(App),
})

// index.html
<html lang="zh-CN">
    ...
<body>
    <div id="app"></div>
</body>

</html>

// App.vue
<template>
  <h1>{{ title }}</h1>
</template>

<script>
export default {
  name: "app",
  data() {
    return {
      title: "hello world",
    }
  }
}
</script>

<style lang="css">
h1 {
  color: blue;
}
</style>

// webpack.config.js
const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = {
  entry: "./index.js",
  output: {
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: "vue-loader",
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",
    }),
  ],
  mode: "development",
}
```

&emsp;&emsp;运行`npm run dev`，`App.vue`被挂载到了`div#app`元素上，`h1`中的模板也被渲染为`hello world`。

### 自定义 loader

#### 初始化

&emsp;&emsp;自定义实现一个`loader`，为所有`js`文件启用严格模式，即在其头部添加`'use strict'`。

&emsp;&emsp;创建`strict-loader`目录，执行`npm init`初始化目录，创建`loader`主体文件`index.js`。

```javascript
// index.js
module.exports = function(content) {
  var useStrictPrefix = "'use strict'\n\n"

  return useStrictPrefix + content
}
```

&emsp;&emsp;;`webpack`工程引用`strict-loader`，其中`use.loader`通过绝对路径引用`strict-loader`，可以随时修改`loader`中的源码调试。

```javascript
// webpack.config.js
module.exports = {
  entry: "./index.js",
  output: {
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "F:/strict-loader",
        },
      },
    ],
  },
  devtool: "none",
  mode: "development"
}

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

// index.js
console.log("hello world")
```

&emsp;&emsp;工程执行`npm run build`，打包输出后的部分源码如下。

![](/other/webpack/upper-strict-loader.png)

#### 启用缓存

&emsp;&emsp;当输入的文件和其他依赖没有变化时，应该直接使用缓存，而不是重复进行转换的工作。

```javascript
// strict-loader/index.js
module.exports = function(content) {
  if (this.cacheable) {
    this.cacheable()
  }

  var useStrictPrefix = "'use strict'\n\n"

  return useStrictPrefix + content
}
```

#### options 参数

&emsp;&emsp;;`loader`配置项可通过`use.options`传递进来。需要安装`loader-utils`依赖库，用其提供的一些帮助函数。

```javascript
npm i loader-utils@1.1.0 --save
```

&emsp;&emsp;;`loader`获取`options`方式如下。

```javascript
// strict-loader/index.js
var loaderUtils = require("loader-utils")

module.exports = function (content) {
    ...
    var options = loaderUtils.getOptions(this) || {}

    console.log("options", options)
    ...
}
```

# 样式处理

## 分离样式文件

&emsp;&emsp;;`style-loader`将样式字符串包装为`style`标签插入页面，但是在生产环境则希望样式存在于`css`文件中而不是`style`标签中，因为文件更有利于客户端进行缓存。

&emsp;&emsp;;`webpack4-`主要采用`extract-text-webpack-plugin`插件用于提取样式到`css`文件。

### 单样式

&emsp;&emsp;根目录下包括`index.html`、`index.js`、`index.css`等文件。如下将`index.js`打包到`index.html`中，其中`webpack.config.js`中`ExtractTextPlugin.extract`中`use`用于指定在提取样式之前采用哪些`loader`来进行预处理，`fallback`用于指定当插件无法提取样式时所采用的`loader`，`new ExtractTextPlugin`参数定义输出文件的名称。

```javascript
// webpack.config.js
const HtmlWebpackPlugin = require("html-webpack-plugin")
const ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  entry: './index.js',
  output: {
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader",
        }),
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin("index.css"),
    new HtmlWebpackPlugin({
      template: "./index.html",
    }),
  ],
  mode: "development"
}

// package.json
{
  ...
  "scripts": {
    "dev": "webpack-dev-server",
    "build": "webpack"
  },
  "devDependencies": {
    "webpack": "4.29.4",
    "webpack-cli": "3.2.3",
    "webpack-dev-server": "3.1.14",
    "html-webpack-plugin": "3.2.0",
    "css-loader": "^0.28.7",
    "style-loader": "^0.19.0",
    "extract-text-webpack-plugin": "^4.0.0-beta.0"
  }
}

// index.html
<html lang="zh-CN">
  ...
  <body>
    <p>hello world</p>
  </body>
</html>

// index.js
import "./index.css"

// index.css
p { 
  color: blue; 
}
```

&emsp;&emsp;运行`npm run dev`，可查看提取的文件被引用至`index.html`中。

![](/other/webpack/upper-extract-text-webpack-plugin-single.png)

### 多文件

&emsp;&emsp;当存在多个入口文件，且不同入口文件引入了不同的`css`样式，提取多个`css`样式如下。其中根目录下包括`foo.js`、`foo.css`、`bar.js`和`bar.css`。

```javascript
// foo.js
import "./foo.css"

// foo.css
p { 
  color: blue;
}

// bar.js
import "./bar.css"

// bar.css
h5 { 
  color: red; 
}

// index.html
<html lang="zh-CN">
  ...
  <body>
    <p>hello</p>
    <h5>world</h5>
  </body>
</html>
```

&emsp;&emsp;;`package.json`依赖与单文件一致，`webpack.config.js`稍做调整。如下`[name].css`中的`name`指代的是`chunk name`，即`entry`为入口分配的名字（`foo`、`bar`）。

```javascript
// webpack.config.js
module.exports = {
  entry: {
    foo: "./foo.js",
    bar: "./bar.js",
  },
  ...
  plugins: [
    new ExtractTextPlugin("[name].css"),
    ...
  ],
}
```

&emsp;&emsp;运行`npm run dev`，可查看提取的多文件被引用至`index.html`中。

![](/other/webpack/upper-extract-text-webpack-plugin-multiple.png)

&emsp;&emsp;若`index.js`中通过`import()`异步加载了`foo.js`，`foo.js`中加载了`foo.css`，那么最终`foo.css`只能被同步加载，或者说只能被以`style`标签的方式插入到`html`中，无法做到按需加载。

### 按需加载

&emsp;&emsp;;`Webpack4+`则主要采用`mini-css-extract-plugin`提取`css`样式，可动态插入`link`标签的方式按需加载。

&emsp;&emsp;根目录下包括`index.js`、`index.css`、`foo.js`和`foo.css`等文件。

```javascript
// webpack.config.js
const HtmlWebpackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

module.exports = {
  entry: "./index.js",
  output: {
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          "css-loader",
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
  ],
  mode: "development",
}

// package.json
{
  ...
  "scripts": {
    "dev": "webpack-dev-server",
    "build": "webpack"
  },
  "devDependencies": {
    "webpack": "4.29.4",
    "webpack-cli": "3.2.3",
    "webpack-dev-server": "3.1.14",
    "html-webpack-plugin": "3.2.0",
    "css-loader": "^0.28.7",
    "mini-css-extract-plugin": "^0.5.0"
  }
}

// index.js
import "./index.css"

setTimeout(() => {
  import("./foo.js")
}, 2000)

// index.css
p { 
  color: blue; 
}

// foo.js
import "./foo.css"

// foo.css
h5 { 
  color: red; 
}

// index.html
<html lang="zh-CN">
  ...
  <body>
    <p>hello</p>
    <h5>world</h5>
  </body>
</html>
```

&emsp;&emsp;运行`npm run dev`，`2s`后`head`中将会动态插入`link`标签和`script`标签。

![](/other/webpack/upper-mini-css-extract-plugin.png)

## postcss

&emsp;&emsp;;`postcss-loader`不算是`css`的预处理器，仅仅是一个运行插件的平台，其工作模式是接收样式源代码交由编译插件处理并输出`css`，其中编译插件可以通过配置来指定。

### postcss-loader

&emsp;&emsp;;`postcss-loader`可以单独使用或者与`css-loader`结合使用，当单独使用`postcss-loader`时，不建议在`css`中使用`@import`，否则会产生冗余代码。

&emsp;&emsp;;`postcss-loader`需要在`css-loader`和`style-loader`后使用，但是要在其他预处理程序（如`sass-loader`）之前使用它。

&emsp;&emsp;;`postcss`要求有一个单独的配置文件，需要在根目录下创建`postcss.config.js`，未添加任何特性暂时返回一个空对象即可。

```javascript
// webpack.config.js
{
   test: /\.css/,
   use: ['style-loader', 'css-loader', 'postcss-loader'],
}

// package.json
"devDependencies": {
    ...
    "css-loader": "^0.28.7",
    "postcss-loader": "^2.1.2",
    "style-loader": "^0.19.0"
}

// postcss.config.js
module.exports = {}
```

### autoprefixer

&emsp;&emsp;;`autoprefixer`为`css`自动添加浏览器厂商前缀，根据 [Can I Use](http://www.caniuse.com/) 的数据决定是否为某一特性添加前缀。

&emsp;&emsp;根目录下包括`index.css`、`index.html`、`index.js`和`postcss.config.js`等。

```javascript
// package.json
"devDependencies": {
    ...
    "autoprefixer": "^8.1.0"
}

// postcss.config.js
const autoprefixer = require('autoprefixer')

module.exports = {
  plugins: [
    autoprefixer({
      grid: true,
      browsers: ['> 1%', 'last 3 versions', 'ie 8'],
    })
  ]
}

// index.css
div { 
  display: grid; 
}

// index.js
import './index.css'
```

&emsp;&emsp;打包后为`grid`特性添加了`ie`前缀。

![](/other/webpack/upper-autoprefixer.png)

### stylelint

&emsp;&emsp;;`stylelint`是一个`css`的代码检测工具，类似`eslint`，可以为其添加各种规则来统一项目的代码风格质量。

&emsp;&emsp;;`postcss.config.js`和`package.json`、`index.css`部分如下，其中`declaration-no-important`用于对代码中`!important`样式给出警告。

```javascript
// package.json
"devDependencies": {
    ...
    "postcss-loader": "^2.1.2"
}

// postcss.config.js
const stylelint = require('stylelint')

module.exports = {
  plugins: [
    stylelint({
      config: {
        rules: {
          'declaration-no-important': true,
        },
      },
    })
  ],
}

// index.css
div {
  color: red !important;
}
```

&emsp;&emsp;执行打包时会在控制台输出如下警告信息。

![](/other/webpack/upper-stylelint.png)

### cssnext

&emsp;&emsp;;`cssnext`可以在项目中使用最新的`css`语法特性。

```javascript
// package.json
"devDependencies": {
    ...
    "postcss-cssnext": "^3.1.0"
}

// postcss.config.js
const postcssCssnext = require('postcss-cssnext')

module.exports = {
  plugins: [
    postcssCssnext({
      browsers: ['> 1%', 'last 2 versions'],
    })
  ]
}

// index.css
:root {
  --highlightColor: #666;
}

p {
  color: var(--highlightColor);
}
```

&emsp;&emsp;打包后的结果如下。

![](/other/webpack/upper-cssnext.png)

## CSS Modules

&emsp;&emsp;;`CSS Modules`是样式模块化解决方案，其中每个`css`拥有单独的作用域，不会和外界发生命名冲突，可以通过相对路径引入`css`模块，可以通过`composes`复用其他`css`模块。

&emsp;&emsp;;`CSS Modules`不用额外安装模块，开启`css-loader`的`modules`配置项即可。

&emsp;&emsp;其中`localIndentName`指明编译出的`css`类名风格，`name`代指模块名，`local`代指原本选择器标识符，`hash:base64:5`为`5`位`hash`值，此`hash`值根据模块名和标识符计算而来。

```javascript
// webpack.config.js
{
   test: /\.css/,
   use: [
      "style-loader",
      {
         loader: "css-loader",
         options: {
          modules: true,
          localIdentName: "[name]__[local]__[hash:base64:5]"
         }
      }
  ]
}

// index.css
.title { 
  color: red; 
}

// index.js
import style from './index.css'

document.write(`<div class='${style.title}'>hello wolrld</div>`)
```

&emsp;&emsp;打包后查看编译出的类名。

![](/other/webpack/upper-css-module.png)

[下一篇](middle.md)
