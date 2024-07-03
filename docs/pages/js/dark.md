# Element 组件库也支持暗黑模式啦

![](/js/dark/banner.gif)

## 前言

&emsp;&emsp;最近参考了`Element Plus`风格样式，修改了`Element`内部样式源文件，并发布了自定义的暗黑主题包 [element-theme-darkplus](https://github.com/dongwei1125/theme-dark)。

&emsp;&emsp;效果预览 👉[戳这里](https://dongwei1125.github.io/theme-dark/)。

## 背景

&emsp;&emsp;;`Vue`版本经历了`2`到`3`的大迭代，与之相关的一些生态系统也发生了变化和改动。

&emsp;&emsp;例如组件库 [Element](https://element.eleme.io/#/zh-CN) 升级为了 [Element Plus](https://element-plus.org/zh-CN/)。

&emsp;&emsp;;`Element Plus`相较于`Element`。

- 组件上新增加了 [TreeSelect](https://element-plus.org/zh-CN/component/tree-select.html) 树形选择、[Text](https://element-plus.org/zh-CN/component/text.html) 文本等
- 性能上优化了用户体验，例如表格组件在大数据量的情况下渲染速度更快，输入框组件在输入响应上更加流畅等
- 开发上也支持`TypeScript`，能体验到更好的编码书写和类型检查
- 主题上特性最佳，新增了暗黑模式，可动态切换

&emsp;&emsp;那么为什么`Element`无法支持暗黑模式呢？原因包括。

 - `Element`支持自定义主题，却忽略了暗黑模式
 - `Element`创建初`CSS`样式表中 [var](https://developer.mozilla.org/zh-CN/docs/Web/CSS/var) 技术并未成为标准
 - `Element`内部样式与`scss`变量强关联，很难达到动态切换主题

&emsp;&emsp;;`GitHub`仓库 [theme-chalk](https://github.com/ElementUI/theme-chalk) 保存了`Element`样式源文件，其中`src`目录下有很多的`.scss`文件。如果想要`Element`内部支持`var`变量，几乎所有的`.scss`都将修改，并且还要进行全面测试。如此庞大的工作量，对于仅剩社区维护的`Element`来说，是根本不可能的。所以在`Element`停止维护之前，都没有支持暗黑模式。

## 思路

&emsp;&emsp;现在功能就在这里，如何实现呢？

&emsp;&emsp;暗黑模式实际上就是一套`Element`自定义主题包。而对于自定义主题，最好看看官方是否支持，而官网也确实提供了自定义主题的 [实践方案](https://element.eleme.io/#/zh-CN/component/custom-theme)。一共四种方法，可以进行不同程度的样式自定义。实际上可概括为两种方法，分别为浅层次和深层次的主题定制。

### 浅层次

&emsp;&emsp;即使用 [在线主题编辑器](https://element.eleme.io/#/zh-CN/theme/preview) 或者 [主题编辑器 Chrome 插件](https://chrome.google.com/webstore/detail/element-theme-roller/lifkjlojflekabbmlddfccdkphlelmim)。

&emsp;&emsp;原理上是浏览器修改了`scss`变量值，在线服务实时打包并返回构建好的`CSS`样式代码。

&emsp;&emsp;其优点在于。

 - 交互式修改`Element`全局`scss`样式变量
 - 快捷实时地预览修改后的视觉效果
 - 支持样式文件包上传、修改和下载

&emsp;&emsp;缺点在于。

 - 在线服务请求较慢或者根本无法访问。大概率报错`Server Error 500`，当然也能访问，注意`方式方法`哈
 - 部分文件或组件内部颜色值固定，无法修改。例如 [mixins.scss](https://github.com/ElementUI/theme-chalk/blob/master/src/mixins/mixins.scss#L29)，滚动条滑块背景色`$--scrollbar-thumb-background`变量固定为了`#b4bccc`

### 深层次

&emsp;&emsp;即使用命令行主题工具 [element-theme](https://github.com/ElementUI/element-theme) 搭配`Element`白垩主题包 [theme-chalk](https://github.com/ElementUI/theme-chalk) 工作。

&emsp;&emsp;原理上是在线主题编辑器的本地运行版，一共两个步骤，分别为创建变量文件和打包构建。

 - 命令行运行`et -i`，工具`element-theme`将抓取文件`node_modules/element-ui/packages/theme-chalk/src/common/var.scss`，`var.scss`内保存了白垩主题全局的样式变量。然后拷贝到根目录下生成`element-variables.scss`变量基础文件
 - 命令行运行`et`，工具`element-theme`利用构建工具`gulp`和相关依赖，打包`element-variables.scss`内自定义的变量值到`src`目录下诸如`index.scss`、`alert.scss`等文件中，编译生成可供使用的`index.css`、`alert.css`等等，共同构成一个主题包

&emsp;&emsp;;`element-theme`相关依赖项包括。

 - [commander](https://github.com/tj/commander.js)：可构建`node`的命令行程序，提供了命令行输入和参数解析等功能
 - [ora](https://github.com/sindresorhus/ora)：命令行`loading`加载效果插件
 - [gulp](https://github.com/gulpjs/gulp)：流的自动化代码构建系统
 - [gulp-autoprefixer](https://github.com/sindresorhus/gulp-autoprefixer)：为`CSS`文件添加浏览器前缀，以兼容不同浏览器
 - [gulp-cssmin](https://www.npmjs.com/package/gulp-cssmin)：压缩`CSS`
 - [gulp-sass](https://github.com/dlmanning/gulp-sass)：`SASS`编译
 - [run-sequence](https://github.com/teambition/gulp-sequence)：`gulp`多任务按次序执行

&emsp;&emsp;其优点在于。

 - 支持深层次的主题定制
 - 附加可选配置，修改变量更加灵活，本地构建速率快效率高

&emsp;&emsp;缺点主要包括三种。

&emsp;&emsp;第一`element-theme`强关联`node`版本，依赖关系为`element-theme` `>` [gulp-sass 3.1.0](https://github.com/ElementUI/element-theme/blob/master/package.json#L52) `>` [node-sass 4.2.0](https://github.com/dlmanning/gulp-sass/blob/v3.1.0/package.json#L26) `>` `node 12`。

> `node-sass`与`node`对应版本可参考官方 [Node version support policy](https://github.com/sass/node-sass#node-version-support-policy)

&emsp;&emsp;一种解决方式是升级`gulp-sass`版本或者降级`node`版本，另一种方式是使用`node`版本适配的第三方库。

 - `node < 12`：[element-theme](https://www.npmjs.com/package/element-theme)
 - `node = 12.x`：[element-themex](https://www.npmjs.com/package/element-themex)
 - `node >= 14`：[element-theme-replace](https://www.npmjs.com/package/element-theme-replace)

&emsp;&emsp;第二`theme-chalk`内部文件 [var.scss](https://github.com/ElementUI/theme-chalk/blob/v2.15.7/src/common/var.scss#L1019) 语法错误，导致拷贝生成的`element-variables.scss`也有此问题。

```javascript
// src/common/var.scss
...

$--breakpoints-spec: (
  'xs-only' : (max-width: $--sm - 1),
  'sm-and-up' : (min-width: $--sm),
  'sm-only': "(min-width: #{$--sm}) and (max-width: #{$--md - 1})",
  'sm-and-down': (max-width: $--md - 1),
  'md-and-up' : (min-width: $--md),
  'md-only': "(min-width: #{$--md}) and (max-width: #{$--lg - 1})",
  'md-and-down': (max-width: $--lg - 1),
  'lg-and-up' : (min-width: $--lg),
  'lg-only': "(min-width: #{$--lg}) and (max-width: #{$--xl - 1})",
  'lg-and-down': (max-width: $--xl - 1),
  'xl-only' : (min-width: $--xl),
);
```

&emsp;&emsp;手动修改为。

```javascript
// src/common/var.scss
...

$--breakpoints-spec: (
  'xs-only' : (max-width: $--sm - 1),
  'sm-and-up' : (min-width: $--sm),
  'sm-only': (min-width: #{$--sm}) and (max-width: #{$--md - 1}),
  'sm-and-down': (max-width: $--md - 1),
  'md-and-up' : (min-width: $--md),
  'md-only': (min-width: #{$--md}) and (max-width: #{$--lg - 1}),
  'md-and-down': (max-width: $--lg - 1),
  'lg-and-up' : (min-width: $--lg),
  'lg-only': (min-width: #{$--lg}) and (max-width: #{$--xl - 1}),
  'lg-and-down': (max-width: $--xl - 1),
  'xl-only' : (min-width: $--xl),
);
```

&emsp;&emsp;第三`theme-chalk`内部变量过于固定，例如 [mix](https://github.com/ElementUI/theme-chalk/blob/v2.15.7/src/common/var.scss#L25) 函数强制混合`$--color-white`变量，并不适用于暗黑主题。

```javascript
// src/common/var.scss
...

$--color-primary-light-1: mix($--color-white, $--color-primary, 10%) !default; /* 53a8ff */
```

&emsp;&emsp;另外很多文件中存在白垩主题固定的颜色值，例如 [upload.scss](https://github.com/ElementUI/theme-chalk/blob/v2.15.7/src/upload.scss#L32)。

```javascript
// src/upload.scss
...

@include b(upload) {
  ...

  @include m(picture-card) {
    background-color: #fbfdff;
    border: 1px dashed #c0ccda;
    ...
  }

  ...
}
```

### 自定义

&emsp;&emsp;两种方式都或多或少有缺点，解决起来也不是那么容易。

&emsp;&emsp;实际上深层次定制是有一些可取的部分的，解决掉附带的缺点，是不是就是可行的呢？

&emsp;&emsp;参考`element-theme`我做了如下几个修改。

#### 维护 scss 文件

&emsp;&emsp;;`theme-chalk`源文件自身存在语法错误，那根据源文件生成新文件就毫无意义了。干脆省略`element-theme`创建变量文件那一步，拷贝`theme-chalk`的最新源文件 [src](https://github.com/ElementUI/theme-chalk/tree/v2.15.7/src) 到根目录下。然后修复语法错误，自行维护`src`源文件。

#### 升级依赖项

&emsp;&emsp;升级所有依赖项，压缩插件`gulp-cssmin`替换为`gulp-clean-css`，`gulp-sass`内部依赖`node-sass`切换为 [dart-sass](https://github.com/sass/dart-sass)，新增了`CSS`命名空间插件 [gulp-css-wrap](https://github.com/atskimura/gulp-css-wrap)。

&emsp;&emsp;以下代码`compileCss`函数选中了`src`目录下所有`.scss`文件，`gulp-sass`编译构建，然后`gulp-autoprefixer`添加浏览器前缀，`gulp-css-wrap`新增类命名空间，最后`gulp-clean-css`压缩代码，输出至根目录下`lib`文件夹中。

```javascript
// gulpfile.js
...

function compileCss() {
  return src('./src/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(cssWrap({ selector: '.dark' }))
    .pipe(cleanCss())
    .pipe(dest('./lib'))
}
```

&emsp;&emsp;以`button`为例，原样式代码为。

```javascript
.el-button {
  ...
  background: #FFF;
}
```

&emsp;&emsp;新增命名空间样式代码为。

```javascript
.dark .el-button {
  ...
  background: #FFF;
}
```

#### 修改源文件

&emsp;&emsp;暗黑主题风格参照了`Elemenet Plus`，修改`src`下所有源文件颜色变量值。内部固定颜色值替换为已有变量，或者新增全局变量。

&emsp;&emsp;思路较简单，但工作量极大。

#### 编写 gulp 插件

&emsp;&emsp;若一个项目有白垩和暗黑两种主题，也能动态切换，我们先看看白垩的部分样式代码。

```javascript
.el-button {
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: #FFF;
  border: 1px solid #DCDFE6;
  color: #606266;
  ...
}
```

&emsp;&emsp;然后看看暗黑的对应样式代码。

```javascript
.dark .el-button {
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: transparent;
  border: 1px solid #4c4d4f;
  color: #cfd3dc;
  ...
}
```

&emsp;&emsp;发现问题没有，主题切换只是颜色值改变，但是却额外维护了重复的样式代码，比如`cursor: pointer`等。

&emsp;&emsp;我们完全可以将白垩主题作为基础，而暗黑部分仅仅引入颜色样式即可。可能像如下方式引入，`index.color.css`中仅仅只有颜色代码，没有其它`CSS`代码。

```javascript
import 'element-ui/lib/theme-chalk/index.css';
import 'element-theme-darkplus/lib/index.color.css';
```

&emsp;&emsp;新增插件`extract-color`用于抽取暗黑主题中所有的颜色样式代码，核心的样式提取函数`cssExtractor`引用于插件 [webpack-theme-color-replacer](https://github.com/hzsrc/webpack-theme-color-replacer/blob/master/src/CssExtractor.js)，`webpack-theme-color-replacer`可提取出`CSS`中指定关键字的代码。

&emsp;&emsp;;`gulpfile.js`新增颜色提取函数`compileColorCss`，其中`rename`为 [gulp-rename](https://github.com/hparra/gulp-rename) 插件，用于修改文件名。

```javascript
// gulpfile.js
...

function compileColorCss() {
  return src('./src/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(cssWrap({ selector: '.dark' }))
    .pipe(extractColor({ keywords: ['#', 'rgb', 'transparent'] }))
    .pipe(cleanCss())
    .pipe(rename({ suffix: '.color' }))
    .pipe(dest('./lib'))
}
```

&emsp;&emsp;以上代码大概率报错，原因是`cssWrap()`运行报错，`css-wrap`不能处理空文件。

&emsp;&emsp;本地新增插件`css-wrap`，空文件跳过`css-wrap`处理。

```javascript
// plugins/css-wrap.js
...

function cssWrap(options = {}) {
  return obj((file, _, callback) => {
    ...
    
    var contents = file.contents.toString()

    if (contents) {
      file.contents = new Buffer.from(wrap(contents, options))
    }

    callback(null, file)
  })
}
```

#### 新增主题预览

&emsp;&emsp;;`element-theme-darkplus`内很多配置文件都是用于开发阶段格式化`.vue`和`.js`的，更多 [详细参考](eslint-prettier.md)。

&emsp;&emsp;;`docs/index.html`文件中以`cdn`方式引入了 [vue2-sfc-loader](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/main/docs/examples.md#vue2-basic-example)，非脚手架页面也能解析`.vue`文件了。

&emsp;&emsp;;`cdn`引入了多个依赖包，导致首屏加载慢，长时间处于白屏状态，这里复用了 [Ant Design Pro Vue](https://github.com/vueComponent/ant-design-vue-pro/blob/master/public/index.html) 加载动画效果。

### 小结

&emsp;&emsp;;`element-theme-darkplus`参考了`element-theme`进一步优化了`gulpfile.js`逻辑部分，新增了`extract-color`颜色提取插件，可最小化实现主题切换功能。拷贝了`theme-chalk`白垩主题的源文件，修复了问题文件语法错误，自主维护全局变量。

## 优化

### 关键字

&emsp;&emsp;虽然`extract-color`插件能提取颜色类代码，但有种情况却不能合理提取出来，例如 [menu.scss](https://github.com/ElementUI/theme-chalk/blob/master/src/menu.scss#L53)。

```javascript
// src/menu.scss
...

@include b(menu) {
  ...

  @include m(horizontal) {
    border-right: none;
  }
}
```

&emsp;&emsp;代码`border-right: none`中并没有关键字`#`、`rgb`或者`transparent`，插件提取不出来也很正常，那如何优化呢？

&emsp;&emsp;拟采用关键字注释，但`extract-color`插件对注释并不敏感，这里使用`var`来折中处理。

```javascript
// src/menu.scss
...

@include b(menu) {
  ...

  @include m(horizontal) {
    --ec-ignore-br: none;

    border-right: var(--ec-ignore-br);
  }
}
```

&emsp;&emsp;关键字新增`--ec-ignore`，以上变量和`var`语句均能提取出来。

```javascript
extractColor({ keywords: ['--ec-ignore', '#', 'rgb', 'transparent'] })
```

&emsp;&emsp;你可能发现了白垩主题内部并未引入`CSS`变量，出于兼容性考虑，最新版本已弃用。在`cssExtractor`提取函数上我做了部分修改，思路效仿了 [clean-css](https://github.com/clean-css/clean-css?tab=readme-ov-file#how-to-preserve-a-comment-block) 的特殊注释。原理即在匹配到特殊注释`/* extract-color ignore */`时，`CSS`代码段仍然保留而不仅限于颜色值，衍生出了`ignoreSpecialComments`配置项（默认值`false`）。

```javascript
extractColor({ keywords: ['#', 'rgb', 'transparent'], ignoreSpecialComments: false })
```

### 级联选择器

&emsp;&emsp;;`cascader`级联选择器稳定复现图标外现的问题。

![](/js/dark/cascader.png)

&emsp;&emsp;;`checkbox`新增`overflow: hidden`可解决，但可能会产生其它的问题，暂时不解决。

```javascript
.el-checkbox__inner {
  ...
  overflow: hidden;
}
```

### 进度条/评分

&emsp;&emsp;评分组件 [Rate](https://github.com/ElemeFE/element/blob/master/packages/rate/src/main.vue) 较为特殊，`Element`内部与颜色相关`props`均定义了默认值，且`template`模板中都采用内联样式，导致外部主题样式无法覆盖。

| `Props` | `默认值` |
| --- | -- |
| `void-color` | `#c6d1de` |
| `disabled-void-color` | `#eff2f7` |
| `text-color` | `#1f2d3d` |

&emsp;&emsp;可传空值重置相应`props`值使主题生效。

```html
<el-rate :value="3" show-text void-color="" text-color="" />
```

&emsp;&emsp;进度条组件 [Progress](https://github.com/ElemeFE/element/blob/master/packages/progress/src/progress.vue) 类似，仅线形进度条支持，环形和仪表盘形不支持。

| `Props` | `默认值` |
| --- | --- |
| `define-back-color` | `#ebeef5` |
| `text-color` | `#606266` |

```html
<el-progress :percentage="20" define-back-color="" text-color="" />
```

&emsp;&emsp;虽然两组件可以传空值重置属性以支持暗黑主题，而对于不关心此功能的同学，却不清楚为什么会传入诸如`text-color=""`这样的属性，这无疑在开发层面徒增了心智负担。

&emsp;&emsp;嗯`...`样式么法解决`Rate`和`Progress`根本性问题了。

&emsp;&emsp;重新定义`Rate`和`Progress`组件可以吗？还不能破坏原组件的拓展性和唯一性，则采用继承原始组件并在`javascript`里做了一个中间层，帮助用户初始置空相关颜色`props`。

```javascript
import ElementUI from 'element-ui'
import Darken from 'element-theme-darkplus/utils/darken'

Vue.use(ElementUI)
Vue.use(Darken(ElementUI))
```

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125) / [Gitee](https://gitee.com/dongwei1125)、[GitHub Pages](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~