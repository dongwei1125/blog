# vscode 插件与 npm 包，保存时自动修复代码格式错误

![](/js/eslint-prettier/banner.gif)

## 前言

&emsp;&emsp;日常开发中的绝大多数项目，都是以团队为单位进行的。而由于每个成员的代码习惯和编码差异的不同，最终将导致整个项目的代码参差不齐，出现各式各样风格的代码。

&emsp;&emsp;而此差异性会严重导致团队协作效率低下，后期可维护性也会严重降低。例如代码缩进问题，大部分都是以`2`个或者`4`个空格为标准，倘若在没有格式化工具的前提下，迭代起来就会显得异常麻烦，只能逐行添加或者删除空格，不仅浪费时间也毫无意义。

&emsp;&emsp;因此制定统一规范的代码风格，并以此配置出格式化工具显得尤为重要，并且最好是在开发中就将此问题解决掉，于代码运行之前就检测出错误，保证推送到远端的代码是非常规范的。

&emsp;&emsp;此篇文章将以`vuecli3`脚手架为基础项目，以`vscode`为代码编辑器，从零开始逐步详细配置相关插件，最终达到保存时自动修复代码格式错误，跟随此篇文章你将了解到。

 - `vscode`编辑器中`Vetur`插件的主要功能，多种配置`vue`代码片段的方式
 - 解决`ESLint`的`autofix`与`prettier`格式化之间的冲突，了解`eslint-config-prettier`与`eslint-plugin-prettier`之间的区别差异
 - 旧脚手架项目如何接入格式化工具
 - 代码提交时自动格式化并规范提交日志
 - `git hook`工具`husky`版本由`v4`迁移至`v7`时，如何修改相关配置项
 - 常见的格式化问题以及处理方式

&emsp;&emsp;如果你仅关注如何使用，不关心配置流程和步骤，那么你可以跳过并浏览每个章节的小结部分，或者也可以访问 [GitHub](https://github.com/dongwei1125/eslint-prettier) 仓库。

## 准备工作

### 工具版本

&emsp;&emsp;请确保你已经安装了 [vscode](https://code.visualstudio.com/) 编辑器和 [node](https://npm.taobao.org/mirrors/node/) 环境，并且你也已经全局安装了 [vuecli](https://cli.vuejs.org/zh/guide/installation.html) 脚手架和 [git](https://npm.taobao.org/mirrors/git-for-windows/) 工具，此处贴一下相关命令与版本。

```javascript
vscode
1.61.2

node --version
v14.15.0

vue --version
@vue/cli 4.5.3

git --version
git version 2.27.0.windows.1
```

### Vuecli3 功能选择

&emsp;&emsp;选择目录或文件夹，开始创建`vuecli`脚手架，细致部分参考 [vuecli](https://cli.vuejs.org/zh/guide/creating-a-project.html#vue-create)，注意最好是启动`Powershell`来创建。

&emsp;&emsp;磁盘根目录下按住`Shift`键再鼠标右击，选择`在此处打开 Powershell 窗口`。

![](/js/eslint-prettier/ps.png)

&emsp;&emsp;运行命令`vue create app`，选择`Manually select features`来手动设置更多的选项。

> 上下键切换选项，`Enter`确认，空格键选中或取消

![](/js/eslint-prettier/pick.png)

&emsp;&emsp;项目功能只选择`Vue`版本和`Babel`转译器。

![](/js/eslint-prettier/features.png)

&emsp;&emsp;;`vue`版本选择`2.x`，且各项配置在独立文件中。

![](/js/eslint-prettier/n.png)

&emsp;&emsp;创建成功。

![](/js/eslint-prettier/success.png)

### Vscode 初始插件

&emsp;&emsp;;`vscode`插件仅安装`chinese`和`Reload`两种，其中`chinese`语言拓展插件可安装也可不安装。

> 如果你还安装有其它插件，为了保证配置不出错，可以都禁用掉，不必卸载

![](/js/eslint-prettier/plugins.png)

&emsp;&emsp;;`Reload`插件将在`vscode`编辑器的右下角状态栏中添加重载按钮，用于快速重载`vscode`窗口，方便调试。

![](/js/eslint-prettier/reload.png)

&emsp;&emsp;键入`Shift + Ctrl + P`并输入`settings.json`打开设置，为了不影响调试效果，你的个性化等其它配置最好都注释掉。

![](/js/eslint-prettier/settings.png)
## 修复流程

### Vetur 代码风格 / jsconfig.json

&emsp;&emsp;;`vscode`打开`vuecli3`脚手架后，能明显看到`App.vue`全是文本字体，没有高亮，代码行距也很紧凑，非常难看。

![](/js/eslint-prettier/text.png)

&emsp;&emsp;因此视觉上的代码高亮问题要先解决，于是在`vscode`中搜索并安装 [Vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur) 插件。

![](/js/eslint-prettier/Vetur.png)

&emsp;&emsp;一般在安装完成后`vscode`右下角会收到警告提示，如果你没有收到，那请点击状态栏`Reload`按钮，重载后几秒之内你会收到的。

&emsp;&emsp;原因在于`Vetur`会优先查找项目中的`tsconfig.json`和`jsconfig.json`文件，如果没有就会查找`vetur.config.js`文件，如果都没有，`Vetur`就会抛出此警告。

![](/js/eslint-prettier/jsconfig.png)

&emsp;&emsp;虽然说警告影响不大，但是有没有像我一样看着就来气的，真是气死强迫症。

&emsp;&emsp;没有那就创建一个`jsconfig.json`呗。

```javascript
// jsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": [
        "src/*"
      ]
    }
  },
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

&emsp;&emsp;若目录中存在`jsconfig.json`，则表示此目录是`JavaScript`项目的根目录，因此包含以下文件的目录就被认为是根目录，更多 [详细参考](https://code.visualstudio.com/docs/languages/jsconfig)。

```javascript
├── node_modules
├── ...
├── jsconfig.json
├── ...
├── package.json
├── README.md
```

&emsp;&emsp;其中`exclude`用于告知`vscode`哪些文件不属于源代码，使其`IntelliSense`（智能感知，即代码自动补全提示等）保持在高性能水平。`baseUrl`用于指定基础目录，`paths`表示相对于`baseUrl`选项计算的路径映射。

&emsp;&emsp;因此`@/*`即映射到当前目录`app`下的`src`目录下的文件或文件夹。如果还是没懂可以看如下图片，输入`@/`后随即智能提示出了`src`目录下的文件或文件夹。而此智能提示就是刚才配置`jsconfig.json`的劳动成果。

> 可以尝试注释`jsconfig.json`，`Reload`重载窗口，再次输入`@/`查看是否有无智能提示

![](/js/eslint-prettier/intellisence.png)

&emsp;&emsp;代码有高亮看着舒服多了，但是稍显紧凑，因此来修改下行距和`Tab`空格数。

&emsp;&emsp;根目录下创建`.vscode`文件夹，新增`settings.json`。`lineHeight`用于指定行高，`tabSize`用于指定一个`Tab`键表示几个空格，但是可能会被覆盖。

&emsp;&emsp;原因是因为`editor.detectIndentation`默认为开启状态，表示根据文件内容自动检测出`editor.tabSize`，若检测出`editor.tabSize`则将自动覆盖设置项。因此若要强制一个`Tab`键为几个空格，可以将`editor.detecIndentation`设置为`false`。

```javascript
// .vscode/settings.json
{
  "editor.tabSize": 2,
  "editor.lineHeight": 24
  // "editor.detectIndentation": false
}
```

&emsp;&emsp;修改后`App.vue`的风格样式。

![](/js/eslint-prettier/style.png)

### ESLint 错误检查

&emsp;&emsp;;`Vetur`对`vue`中`<template>`、`<style>`、`<script>`都进行了错误检查，内部默认捆绑了 [eslint-plugin-vue](https://eslint.vuejs.org/) 用于模板错误检查。默认情况下`Vetur`加载 [vue/essential](https://eslint.vuejs.org/rules/#priority-a-essential-error-prevention-for-vue-js-2-x) 规则集用于`vue2`项目。

![](/js/eslint-prettier/essential.png)

&emsp;&emsp;但是由于`essential`规则集有限，现在选择官方推荐的 [vue/recommended](https://eslint.vuejs.org/rules/#priority-c-recommended-minimizing-arbitrary-choices-and-cognitive-overhead-for-vue-js-2-x) 规则集来校验代码，因此将自定义`Vetur`的规则集，下面来自定义错误检查。

&emsp;&emsp;首先关闭`Vetur`的模板验证。

```javascript
// .vscode/settings.json
{
  ...
  "vetur.validation.template": false
}
```

&emsp;&emsp;模板验证已经关闭。

![](/js/eslint-prettier/close.png)

&emsp;&emsp;然后安装`vscode`的 [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) 插件，让`ESLint`插件来检查错误，而不是`Vetur`。

![](/js/eslint-prettier/ESLint.png)

&emsp;&emsp;;`ESLint`插件将使用项目中的`eslint`依赖包，若项目内未提供，则`ESLint`插件会全局查找，因此项目需安装`eslint`依赖包。而针对`vue`项目，必然要一套检查`vue`代码的规则集，而此规则集可由`eslint-plugin-vue`提供。

```javascript
npm i eslint eslint-plugin-vue -D
```

&emsp;&emsp;;`eslint-plugin-vue`有很多种规则集，而`ESLint`也不知道具体采用何种规则集，因此还要告知`ESLint`运用哪一套规则集去检查代码，所以根目录下新建`.eslintrc.js`文件。

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  extends: ['plugin:vue/recommended'],
  rules: {
    quotes: ['error', 'single'],
  },
}
```

&emsp;&emsp;;`ESLint`检测配置文件的步骤如下，更多 [详细参考](https://cn.eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy)。

 - 项目内查找`.eslintrc.*`或`package.json`文件（`package.json`内也可配置相关属性）
 - 若未找到，则在父级目录中查找，一直查找至磁盘根目录
 - 若在以上两步中发现`root: true`，则停止往父级目录中查找

&emsp;&emsp;另外`extends`表示启用 [vue/recommended](https://eslint.vuejs.org/rules/#priority-c-recommended-minimizing-arbitrary-choices-and-cognitive-overhead-for-vue-js-2-x) 规则集，`rules`中可自定义检查规则，`['error', 'single']`表示字符串仅能使用单引号，若非单引号则将以错误下划线高亮。

> `['warn', 'single']`将以警告下划线高亮

![](/js/eslint-prettier/quotes.png)

&emsp;&emsp;新增了配置点击状态栏`Reload`重载窗口，查看`App.vue`文件，自定义错误检查已生效。

![](/js/eslint-prettier/custom.png)

### Autofix

&emsp;&emsp;现在已经可以对代码进行检查了，手动尝试下修复代码。

![](/js/eslint-prettier/try-fixed.png)

&emsp;&emsp;但是你可以打开`component/HelloWorld.vue`浏览看看，通篇的警告就问你慌不慌。像`App.vue`代码较少，尚可以手动修复，但是`HelloWorld.vue`难道要一行一行修改不成。

&emsp;&emsp;有没有可能`ESLint`检测出代码，并且还能修复呢，嘿嘿，还真有，即`ESLint`的`autofix`功能。

&emsp;&emsp;将`App.vue`还是恢复为以下状态。

![](/js/eslint-prettier/restore.png)

&emsp;&emsp;;`vscode`命令行执行以下命令，即修复`App.vue`。

```javascript
npx eslint src/App.vue --fix
```

&emsp;&emsp;修复后的`App.vue`。

![](/js/eslint-prettier/fixed-after.png)

&emsp;&emsp;此时控制台输出`2`个错误，大致描述就是`v-for`的元素需指定`key`，而`item`也声明但是未被使用。你要知道的是`ESLint`仅仅能修复简单的错误，像`v-for`的`key`值问题等还是需要你手动修复的。

![](/js/eslint-prettier/errors.png)

&emsp;&emsp;可能你会问，是不是每次代码写完还要针对某个文件执行一次`npx eslint ...`，如果是那样就真的尴了个大尬。

&emsp;&emsp;在`settings.json`添加如下命令，即在每次文件被保存时，自动执行`fix`修复。

> 可能你会在其它文章中看到`source.fixAll`，两者区别在于`source.fixAll`表示针对所有插件开启自动修复，`source.fixAll.eslint`表示只在`ESLint`中开启

```javascript
// .vscode/settings.json
{
  ...
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

&emsp;&emsp;;`App.vue`保存时。

![](/js/eslint-prettier/save.gif)

### Prettier 格式化

&emsp;&emsp;于是问题都解决了吗？其实并没有哦，看看如下情况。

![](/js/eslint-prettier/question.gif)

&emsp;&emsp;由于`eslint-plugin-vue`中提供的规则集`vue/recommended`中的规则 [vue/html-indent](https://eslint.vuejs.org/rules/html-indent.html)，此规则对标签强制使用了一致的缩进，因此保存时`<template>`自动修复了缩进。

&emsp;&emsp;但是`<script>`中却没有修复，因为`vue/recommended`规则集没有提供用于`<script>`标签缩进的规则，所以修复时`<script>`内也就没效果，第一种解决方式很简单，就是添加用于`vue`文件的`<script>`缩进的规则 [vue/script-indent](https://eslint.vuejs.org/rules/script-indent.html) 即可。

```javascript
// .eslintrc.js
module.exports = {
  ...
  rules: {
    ...
    'vue/script-indent': ['error', 2, {
      'baseIndent': 0,
      'switchCase': 0,
      'ignores': []
    }]
  },
  'overrides': [
    {
      'files': ['*.vue'],
      'rules': {
        'indent': 'off'
      }
    }
  ]
}
```

&emsp;&emsp;但是此方式不推荐，因为不仅耗时、规则覆盖不全面（可能会少某几条）而且也没必要。其中配置项各参数释义不赘述，更多 [详细参考](https://eslint.vuejs.org/rules/html-indent.html)。

![](/js/eslint-prettier/add-rules.gif)

&emsp;&emsp;来看一个有趣的操作，你可以在`App.vue`右键选择格式化文档（也可键入`Shift + Alt + F`），紧接着再保存（`Ctrl + S`），你会发现`<template>`与`<script>`中的代码都被修复了。

![](/js/eslint-prettier/action.gif)

&emsp;&emsp;为什么会被修复呢？原因在于 [格式化文档](https://vuejs.github.io/vetur/guide/formatting.html) 是由`Vetur`提供的，`Vetur`默认捆绑了多个格式化程序（例如 [prettier](https://github.com/prettier/prettier) 等）用来格式化代码。

&emsp;&emsp;你应该了解的是 [代码规则](https://cn.eslint.org/docs/rules/) 分为两类，代码质量规则和代码风格规则。代码质量出现问题，意味着项目可能没法运转，也可能存在潜在的缺陷。而代码风格不一样，代码风格出现问题，仅仅是代码丑陋，你看着不爽。

&emsp;&emsp;代码质量规则。

 - [no-unused-vars](https://cn.eslint.org/docs/rules/no-unused-vars)：禁止出现未使用过的变量
 - [no-use-before-define](https://cn.eslint.org/docs/rules/no-use-before-define)：禁止在变量定义之前使用它
 - [no-v-html](https://eslint.vuejs.org/rules/no-v-html.html)：禁止使用`v-html`来防止`XSS`攻击
 - `...`

&emsp;&emsp;代码风格规则。

 - [max-len](https://cn.eslint.org/docs/rules/max-len)：单行的最大长度
 - [semi](https://cn.eslint.org/docs/rules/semi)：强制或禁止使用分号
 - [indent](https://cn.eslint.org/docs/rules/indent)：缩进问题
 - `...`

&emsp;&emsp;而刚才已经知晓了当前`eslint`使用的`vue/recommended`规则集，仅仅包括了`<template>`中的代码质量（`v-for`的`key`值问题等）和代码风格（少部分，包括缩进规则等，例如不包括单行的最大长度等）的检测，但是缺少`<script>`中的代码风格校验（缩进规则等）。

&emsp;&emsp;对于`<template>`和`<script>`两部分的代码缩进，`vue/recommend`规则集已经可以修复`<temnplate>`的缩进，而`<script>`的缩进现在让`Vetur`来做。

&emsp;&emsp;;`Vetur`是开启了`vetur.useWorkspaceDependencies`为`true`，即它可以优先使用根目录下的 [prettier](https://www.prettier.cn/) 格式化依赖包，因此来自定义`Vetur`的格式化功能。 

```javascript
npm i prettier -D
```

&emsp;&emsp;添加`.prettierrc.js`，加上几条简单的 [规则](https://www.prettier.cn/docs/options.html)，`printWidth`（每行最多多少字符换行）、`semi`（语句末尾分号）、`arrowParens`（`avoid`表示箭头函数是单个参数时，参数周围省略括号）。

```javascript
// .prettierrc.js
module.exports = {
  semi: false,
  printWidth: 110,
  arrowParens: 'avoid'
}
```

&emsp;&emsp;格式化文档后并保存，可以看到`<script>`中的缩进已经修复。

![](/js/eslint-prettier/script-fixed.gif)

### FormatOnSave

&emsp;&emsp;频繁右键格式化麻烦不，有没有可能像`ESLint`一样保存时自动修复呢，答案肯定是有的。

```javascript
// .vscode/settings.json
{
  ...
  "editor.formatOnSave": true,
}
```

&emsp;&emsp;现在代码还原尝试下保存呢（`Crtl + S`）。

&emsp;&emsp;但是意料之外的情况发生了，保存时，起初运行的是`ESLint`的`autofix`，紧接着运行了`Vetur`的格式化，即`autofix`介于`Vetur`格式化之前了。

&emsp;&emsp;最后导致风格样式按照`prettier`来了（例如字符串为双引号），显然不符合`ESLint`的规则。因此格式是修复了，但是却被`ESLint`检测出错误了。

![](/js/eslint-prettier/error.gif)

&emsp;&emsp;以至于频繁保存会频繁闪烁。

![](/js/eslint-prettier/blink.gif)

### 解决 eslint 与 prettier 冲突

#### eslint-config-prettier

&emsp;&emsp;频繁闪烁的根本原因在于`eslint`与`prettier`一起使用产生了冲突。`eslint`认为字符串应为单引号，而`prettier`默认格式化为双引号，所以先来统一单双引号问题，在`.prettierrc.js`中添加如下规则。

```javascript
// .prettierrc.js
module.exports = {
  ...
  singleQuote: true
}
```

&emsp;&emsp;现在还存在换行冲突，`prettier`认为单行最大长度达到`110`就可以换行，而`eslint`认为只要是标签属性都应另起一行。

![](/js/eslint-prettier/conflict.png)

&emsp;&emsp;注意实际代码格式问题已经解决了（例如缩进问题、单行最大长度等），你会想要是禁用掉`eslint`的 [vue/max-attributes-per-line](https://eslint.vuejs.org/rules/max-attributes-per-line.html) 规则，不要它去检查警告，是不是问题就迎刃而解了。

&emsp;&emsp;嘿嘿，没错，你猜对了，还真是这样。

&emsp;&emsp;但是不用我们去做了，[eslint-config-prettier](https://github.com/prettier/eslint-config-prettier) 已经做了，看名字大概也能猜到，`config`位于`eslint`与`prettier`中间，即用于平衡`eslint`与`prettier`之间的配置。

```javascript
npm i eslint-config-prettier -D
```

&emsp;&emsp;但是是用于平衡哪些配置呢，官方文档给出了答案，即关闭了`eslint`中所有不必要的或者可能与`prettier`冲突的那些规则，实际也就是代码风格规则。

&emsp;&emsp;;`.eslintrc.js`中添加`prettier`表示启用`eslint-config-prettier`，注意一定要在最后，确保覆盖之前的同类规则，否则可能不生效。

```javascript
// .eslintrc.js
module.exports = {
  ...
  extends: [
    'plugin:vue/recommended',
    'prettier'
  ]
}
```

&emsp;&emsp;保存时效果，也能看到`eslint`相关的代码质量规则未被禁用。

![](/js/eslint-prettier/conflict-fixed.gif)

#### eslint-plugin-prettier

&emsp;&emsp;还记得最开始时，`<template>`中标签缩进错误时，会高亮黄色警告下划波浪线吗。

![](/js/eslint-prettier/start.png)

&emsp;&emsp;如果还是想包含此功能，可以安装一个推荐的可选插件 [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier)。

&emsp;&emsp;由于插件`eslint-config-prettier`的原因，代码格式问题已经交给`prettier`负责，而`eslint`代码格式相关的检测规则也被禁用了，因此即使代码中出现了格式问题，`eslint`是不会报错的。

&emsp;&emsp;而`eslint-plugin-prettier`做了一件什么事呢？它将`prettier`格式问题的相关规则，转换成了对应的`eslint`规则，并注入到了`eslint`中，由此代码中的格式问题，`eslint`也会报错。

```javascript
npm i eslint-plugin-prettier -D
```

&emsp;&emsp;修改`.eslintrc.js`，其中`plugins`表示将`prettier`注册为插件，`prettier/pretiier`表示将`prettier`插件提供的规则注入`eslint`，并且使其在`eslint`中运行`prettier`。

```javascript
module.exports = {
  root: true,
  extends: ['plugin:vue/recommended', 'prettier'],
  plugins: ['prettier'],
  rules: {
    quotes: ['error', 'single'],
    'prettier/prettier': 'error',
  },
}
```

&emsp;&emsp;有两个不适用的规则。

 - [arrow-body-style](http://eslint.cn/docs/rules/arrow-body-style)：箭头函数体只能为大括号

```javascript
const foo = () => { return 0 }    // OK

const foo = () => 0    // ERROR
```

 - [prefer-arrow-callback](http://eslint.cn/docs/rules/prefer-arrow-callback)：使用箭头作为回调函数

```javascript
foo(arg => {})    // OK

foo(function(arg) {})    // ERROR
```

&emsp;&emsp;很明显都不是很合理，`arrow-body-style`规则代码也将不是很优雅，修改`.eslintrc.js`。

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  extends: ['plugin:vue/recommended', 'prettier'],
  plugins: ['prettier'],
  rules: {
    quotes: ['error', 'single'],
    'prettier/prettier': 'error',
    'arrow-body-style': 'off',
    'prefer-arrow-callback': 'off',
  },
}
```

&emsp;&emsp;而以上配置可以更为便捷地合并为以下，了解更多可参考 [官方文档](https://github.com/prettier/eslint-plugin-prettier#recommended-configuration)。

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  extends: ['plugin:vue/recommended', 'plugin:prettier/recommended'],
  rules: {
    quotes: ['error', 'single'],
  },
}
```

&emsp;&emsp;以上配置完成后，不出意外，你的`App.vue`或`HelloWord.vue`等都将会有很多错误提示。

![](/js/eslint-prettier/CR.png)

&emsp;&emsp;是由于行尾换行符造成的，不要紧，`.prettierrc.js`添加如下规则，更多 [详细参考](https://www.prettier.cn/docs/options.html#end-of-line)。

```javascript
// .prettierrc.js
module.exports = {
  ...
  endOfLine: 'crlf'
}
```

&emsp;&emsp;至此格式化相关的步骤就都完成了。

![](/js/eslint-prettier/finally.gif)

#### 区别差异

&emsp;&emsp;;`eslint-config-prettier`不仅提供了`prettier`的格式化规则，同时也禁用了`eslint`中所有不必要的或者可能与`prettier`冲突的那些规则。

&emsp;&emsp;代码质量检测均由`eslint`负责，没有代码格式检测。代码质量修复依赖于`eslint`的`autofix`，代码格式的修复依赖于`prettier`。

&emsp;&emsp;所以仅安装`eslint-config-prettier`时，`eslint`的`autofix`和`prettier`的保存格式化两者一定要同时开启，而且根据上文我们也知道`eslint`的`autofix`是介于`prettier`的格式化之前运行的。

```javascript
// .vscode/settings.json
{
  ...
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true,
}
```

&emsp;&emsp;仅开启`eslint`的`autofix`，能明显看到仅仅修复了代码质量，代码格式并未修复。

![](/js/eslint-prettier/config-diff-autofix.gif)

&emsp;&emsp;仅开启`prettier`的格式化，代码质量未被修复，代码格式均被修复。

![](/js/eslint-prettier/config-diff-prettier.gif)

&emsp;&emsp;;`eslint-plugin-prettier`则是将`prettier`格式问题的相关规则，转换成了对应的`eslint`规则，并注入到了`eslint`中。

&emsp;&emsp;代码质量检测均由`eslint`负责，注意代码质量的规则由`eslint`和`eslint-plugin-vue`两者提供，代码格式检测也是由`eslint`负责，代码格式的规则是由`prettier`提供，且依赖于`eslint-plugin-prettier`转换并注入到`eslint`中。

&emsp;&emsp;;`eslint-plugin-prettier`还做了另外一件事，即在`eslint`的`autofix`后，紧接着继续运行`prettier`，因此仅开启`eslint`的`autofix`就能完成质量和格式的修复。

&emsp;&emsp;但是要明确的是，代码质量修复还是依赖于`eslint`的`autofix`，代码格式的修复还是依赖于`prettier`，只是`eslint-plugin-prettier`在`autofix`后帮你自动运行了`prettier`。

&emsp;&emsp;仅开启`eslint`的`autofix`，代码质量和格式均高亮，且保存时都被修复。

![](/js/eslint-prettier/plugin-diff-autofix.gif)

&emsp;&emsp;仅开启`prettier`的格式化，代码质量和格式均高亮，但是只修复了格式问题。

![](/js/eslint-prettier/plugin-diff-prettier.gif)

### 小结

&emsp;&emsp;初始脚手架代码都是文本字体，引入`Vetur`高亮代码。

&emsp;&emsp;;`Vetur`会查找项目中`jsconfig.json`等文件并抛出警告，新建`jsconfig.json`。

```javascript
// jsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": [
        "src/*"
      ]
    }
  },
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

&emsp;&emsp;;`vscode`引入`ESLint`插件，安装`eslint`错误检查包和格式化依赖包，其中`eslint`和`eslint-plugin-vue`用于错误检查，`prettier`用于格式化代码，`eslint-config-prettier`用于解决`eslint`与`prettier`之间的冲突，可选插件`eslint-plugin-prettier`用于注入`prettier`格式化规则到`eslint`。

```javascript
npm i eslint eslint-plugin-vue prettier eslint-config-prettier eslint-plugin-prettier -D
```

&emsp;&emsp;新建`.eslintrc.js`，启用`eslint-plugin-vue`的`vue`规则集，同时启用`eslint-config-prettier`，并且启用`eslint-config-prettier`注入规则。

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  extends: ['plugin:vue/recommended', 'plugin:prettier/recommended'],
  rules: {
    quotes: ['error', 'single'],
  },
}
```

&emsp;&emsp;新建`.prettierrc.js`，统一部分格式化规则和换行符等。

```javascript
// .prettierrc.js
module.exports = {
  semi: false,
  printWidth: 110,
  arrowParens: 'avoid',
  singleQuote: true,
  endOfLine: 'crlf'
}
```

&emsp;&emsp;新建`settings.json`，保存时自动运行`eslint`的`autofix`和`prettier`格式化。

```javascript
// .vscode/settings.json
{
  "editor.tabSize": 2,
  "editor.lineHeight": 24,
  "vetur.validation.template": false,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true,
}
```

&emsp;&emsp;以上插件和依赖的作用。

 - [Vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur)：`vscode`插件，用于高亮`Vue`代码，提供了代码的错误检查和格式化、代码自动补全提示等
 - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)：`vscode`插件，依赖于本地工作区或全局下的`eslint`依赖包
 - [eslint](http://eslint.cn/)：用于检测和修复代码错误，自定义检测规则，引入`vue`代码检测的规则集
 - [eslint-plugin-vue](https://eslint.vuejs.org/)：提供用于检测`vue2`代码的规则集 [vue/recommended](https://eslint.vuejs.org/rules/#priority-c-recommended-minimizing-arbitrary-choices-and-cognitive-overhead-for-vue-js-2-x)
 - [prettier](https://www.prettier.cn/)：用于格式化代码，自定义格式规则
 - [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)：用于解决`eslint`和`prettier`在代码格式上的冲突，禁用了`eslint`中所有不必要的或者可能与`prettier`冲突的规则
 - [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier)：将`prettier`中的代码格式规则，转换为对应的`eslint`规则并注入到`eslint`中，使`eslint`能够检测代码格式问题。另外让`eslint`在执行`autofix`后再运行`prettier`

## Git hook

&emsp;&emsp;引入诸多插件都是为了在开发阶段规范或者修复代码，但是都是以`vscode`编辑器为前提的，倘若其它成员使用的是`webstorm`等其它编辑器，那么之前做的事情就都白费了。

&emsp;&emsp;还好远端是利用`git`在管理代码，大家提交代码的方式是一致的，编辑器不能做到完全规范代码，但是可以在提交时统一代码。

&emsp;&emsp;来了解一下`git hook`，`git hook`即`git`钩子，`git`在特定事件发生时会触发对应的脚本（类似于`vue`的生命周期），`git init`初始化后的仓库中，`.git/hooks`目录下默认包括很多示例脚本（都是以`.sample`结尾），删除掉`.sample`后缀可启用。

&emsp;&emsp;常用的钩子包括`pre-commit`、`commit-msg`等。

 - `pre-commit`：暂存中的文件被提交前触发，或者说在你`git commit ...`之前触发。若此钩子以非零值退出，`git`将放弃此次提交（可利用`git commit --no-verify`跳过），一般可利用此钩子来检查代码风格等
 - `commit-msg`：输入提交说明后且于`pre-commit`后触发。若此钩子以非零值退出，`git`也将放弃提交，一般用于校验提交说明是否符合规范

### Husky(v4) 与 lint-staged 规范代码

&emsp;&emsp;思路应该是很清晰了，即在代码提交时，触发对应的钩子来检测并规范代码，因此先初始化一个`git`仓库。

```javascript
git init
```

&emsp;&emsp;然后再来了解一下 [husky](https://typicode.github.io/husky/#/)，`husky`是一个为`git`客户端添加`hook`的工具，安装`v4`版本（`v4.3.8`及之前的版本）后，`husky`默认会在`.git/hooks`目录下生成所有类型的`git hook`。然后在`git`工作的每个阶段都会调用`husky`所生成的脚本，在脚本中`husky`会检查用户是否配置有此钩子，如果有就运行用户配置的命令，没有就继续往后执行。

```javascript
npm i husky@4.3.8 -D
```

&emsp;&emsp;安装完成后，目录`.git/hooks`下生成了很多的`hook`。

![](/js/eslint-prettier/dir.png)

&emsp;&emsp;来测试一下`husky`，新建`.huskyrc.json`，其中`pre-commit`钩子触发将运行`echo hello husky`。 

```javascript
// .huskyrc.json
{
  "hooks": {
    "pre-commit": "echo hello husky"
  }
}
```

&emsp;&emsp;修改代码并提交。

![](/js/eslint-prettier/hello-husky.png)

&emsp;&emsp;已经可以在提交时触发钩子了，现在来考虑一个问题，是在提交前规范目录中所有代码，还是仅仅规范暂存中的代码呢。显然只规范暂存中的代码就可以了，不仅避免检查整个项目，提高运行效率，也避免了修改到其它文件。

&emsp;&emsp;而插件 [lint-staged](https://github.com/okonet/lint-staged) 就是对暂存中的文件执行检查的。

```javascript
npm i lint-staged -D
```

&emsp;&emsp;新建`.lintstagedrc.json`，注意源码一般位于`src`目录下，因此仅对`src`目录下的`js`和`vue`文件执行`eslint --fix`即可，格式修复完成后再执行`git add`暂存。

```javascript
// .lintstagedrc.json
{
  "src/**/*.{js,vue}": [
    "eslint --fix",
    "git add"
  ]
}
```

&emsp;&emsp;修改`.huskyrc.json`，即`pre-commit`钩子触发时，将运行`.lintstagedrc.json`中的命令。

```javascript
// .huskyrc.json
{
  "hooks": {
    "pre-commit": "lint-staged"
  }
}
```

&emsp;&emsp;关闭`eslint`的`autofix`和`prettier`的格式化，打乱`App.vue`中代码样式，暂存并提交，可以看到在`pre-commit`时`lint-staged`对`App.vue`进行了检测和修复。

![](/js/eslint-prettier/pre-commit.png)

### Commitlint 规范提交说明

&emsp;&emsp;安装 [commitlint/cli](https://github.com/conventional-changelog/commitlint) 和常规配置。

```javascript
npm i @commitlint/cli @commitlint/config-conventional -D
```

&emsp;&emsp;新增`commitlint.config.js`引入提交规范集。

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional']
}
```

&emsp;&emsp;修改`.huskyrc.json`，即`commit-msg`钩子触发时，将运行对应的命令。

```javascript
// .huskyrc.json
{
  "hooks": {
    "pre-commit": "lint-staged",
    "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
  }
}
```

&emsp;&emsp;再次暂存并提交，可以看到`commit-msg`钩子触发时`commitlint`对提交说明进行了验证。

![](/js/eslint-prettier/commit-msg.png)

### Husky v4 迁移 v7

&emsp;&emsp;先来说说`husky`为什么由`v4`破坏性地更新到`v7`了，`v4`版本的`husky`会生成所有类型的`git hook`，其好处就是无论用户设置任何类型的`git hook`，`husky`都能保证其正常运行，但是坏处也很明显，即用户不设置任何`git hook`，`husky`也向`git`添加了所有类型的`git hook`。

&emsp;&emsp;;`v4`版本缺陷的根本原因在于，任何一个完整的`git hook`功能，一是要在`.git/hooks`添加相应的`hook`，二是要在根目录添加`.huskyrc.json`文件或`package.json`中配置此`hook`要执行的命令，但是作者没有很好的办法来同步它们。

&emsp;&emsp;还好`git 2.9`版本引入了`core.hooksPath`，此属性可指定`git hook`所在目录。`husky`启用`git`钩子后，将会把`git hook`的目录指定为`.husky`，此方式好处就在于，需要什么`hook`，就在`.husky`文件夹添加什么`hook`，不需要什么都不用添加，更多 [详细参考](https://blog.typicode.com/husky-git-hooks-javascript-config/)。

&emsp;&emsp;现在由`v4`版本迁移至`v7`版本，请卸载目录下`husky(v4)`。

```javascript
npm un husky
```

&emsp;&emsp;然后安装最新版本的`husky`（目前`v7.0.4`）。

```javascript
npm i husky -D
```

&emsp;&emsp;启用`git`钩子。

```javascript
npx husky install
```

&emsp;&emsp;启用后将在根目录生成`.husky`文件夹，其中默认包括`_`文件夹、`.gitignore`和`husky.sh`。

![](/js/eslint-prettier/husky.png)

&emsp;&emsp;同时`.git/config`文件中将添加如下属性。

```javascript
// .git/config
[core]
  ...
  hooksPath = .husky
```

&emsp;&emsp;;`.husky`目录下新建`pre-commit`文件，其中`--no-install`表示强制`npx`使用本地模块，不下载远程模块，但是本地模块不存在时将会报错。

```javascript
// .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo 'husky > pre-commit'
npx --no-install lint-staged
```

&emsp;&emsp;验证提交说明的迁移也是一样，在`.husky`下新建`commit-msg`钩子。

```javascript
// .husky/commit-msg
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo 'husky > commit-msg'
npx --no-install commitlint --edit $1
```

&emsp;&emsp;最后根目录下的`.huskyrc.json`也可以删除了，因为`v7`版本已经不依赖这一层映射关系了，`.husky`目录内`hook`将直接运行命令，这也就是`v7`版本更新后的优点，缺点也很明显，无端增加了用户的学习成本。

### 小结

#### Husky v4 版本

&emsp;&emsp;由于是利用`git`来管理代码，因此先要保证项目已经初始化为`git`仓库。

```javascript
git init
```

&emsp;&emsp;安装`git hook`工具和检查工具、提交说明检查工具和检查规则集，其中`husky`用于为`git`添加`hook`工具，`lint-staged`用于检查暂存中的文件，`commitlint`用于检查提交说明，`config-conventional`用于提供检查规则集。

```javascript
npm i husky@4.3.8 lint-staged @commitlint/cli @commitlint/config-conventional -D
```

&emsp;&emsp;新建`.lintstagedrc.json`，用于修复暂存中的文件。

```javascript
// .lintstagedrc.json
{
  "src/**/*.{js,vue}": [
    "eslint --fix",
    "git add"
  ]
}
```

&emsp;&emsp;新建`commitlint.config.js`，启用`config-conventional`规则集。

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional']
}
```

&emsp;&emsp;新建`.huskyrc.json`，`git`钩子触发时执行相应的命令。

```javascript
// .huskyrc.json
{
  "hooks": {
    "pre-commit": "lint-staged",
    "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
  }
}
```

#### Husky v7 版本

&emsp;&emsp;;`v4`迁移`v7`请卸载`husky(v4)`版本。

```javascript
npm un husky
```

&emsp;&emsp;安装最新版本`husky`（目前`v7.0.4`）。

```javascript
npm i husky -D
```

&emsp;&emsp;启用`git`钩子。

```javascript
npx husky intall
```

&emsp;&emsp;新建`pre-commit`、`commit-msg`钩子。

```javascript
// .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo 'husky > pre-commit'
npx --no-install lint-staged

// .husky/commit-msg
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo 'husky > commit-msg'
npx --no-install commitlint --edit $1
```

&emsp;&emsp;再删除`.huskyrc.json`文件即可。

#### 插件

&emsp;&emsp;以上插件的作用。

 - [husky](https://typicode.github.io/husky/#/)：为`git`客户端添加`hook`工具，`v4`（`v4.3.8`及之前版本）将在`.git/hooks`中注入所有类型的`hook`，而`v7`版本将指定`git hook`目录为`.husky`
 - [lint-staged](https://github.com/okonet/lint-staged)：仅对暂存中的文件执行相应的命令，提高运行效率
 - [@commitlint/cli](https://github.com/conventional-changelog/commitlint)：用于检查提交说明
 - [@commitlint/config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional)：提供检查提交说明的规则集

## 常见问题

### 如何关闭或跳过 eslint 校验规则？

&emsp;&emsp;有些项目并不能很好地适用`eslint`的规则集，例如 [vue/recommended](https://eslint.vuejs.org/rules/#priority-c-recommended-minimizing-arbitrary-choices-and-cognitive-overhead-for-vue-js-2-x) 规则集中 [vue/no-v-html](https://eslint.vuejs.org/rules/no-v-html.html) 禁用了`v-html`指令，但是有时又不得已会使用`v-html`。 

&emsp;&emsp;第一种方式可在`.eslintrc.js`中关闭此规则。

```javascript
// .eslintrc.js
module.exports = {
  ...
  rules: {
    ...
    'vue/no-v-html': 'off',
  },
}
```

> 告警级别分为三种，`0/off`表示忽略问题，`1/warn`表示警告，`2/error`表示报错

&emsp;&emsp;第二种方式是利用 [vue/comment-directive](https://eslint.vuejs.org/rules/comment-directive.html#vue-comment-directive) 规则，即通过注释来跳过某一行或多行的校验。

&emsp;&emsp;此规则支持的注释包括。

 - `eslint-disable`：关闭校验
 - `eslint-enable`：开启校验，配合`eslint-disabled`可关闭多行校验
 - `eslint-disable-line`：关闭当前行校验
 - `eslint-disable-next-line`：关闭下一行校验

&emsp;&emsp;关闭多行校验，其中`6`和`7`行的`v-html`校验已跳过。

![](/js/eslint-prettier/eslint-disable.png)

&emsp;&emsp;关闭当前行的校验，其中`32`行中的语句末尾分号校验已跳过。

![](/js/eslint-prettier/eslint-disable-line.png)

&emsp;&emsp;关闭下一行校验。

![](/js/eslint-prettier/eslint-disable-next-line.png)

&emsp;&emsp;注意以上注释会关闭掉所有`eslint`校验规则，建议在注释后添加禁用的规则名称，更多 [详细参考](https://eslint.vuejs.org/rules/comment-directive.html#vue-comment-directive)。

![](/js/eslint-prettier/eslint-disable-rules.png)

### 旧项目如何接入格式化工具？

&emsp;&emsp;旧项目通常情况下源文件格式都会存在问题，但是不可能每个文件都去`Ctrl + S`手动修复格式，可在`package.json`中添加命令来修复`src`内源文件。

&emsp;&emsp;但是强烈不推荐你这么做，因为格式化可能会造成潜在的问题。如果源文件较少，且能够保证做全量测试，那么你可以这样做。但是源文件较多，建议只格式化你修改的文件，其余不相关的文件还是不要动。

```javascript
// package.json
{
  ...
  "scripts": {
    ...
    "eslint:fix": "eslint src/**/*.js src/**/*.vue --fix"
  }
}
```

> 注意`eslint:fix`仅能修复简单的错误，其它例如组件`props`默认值的情况，还是需要你手动修复

### 无法格式化的文件如何修复？

&emsp;&emsp;部分文件保存时无法格式化，频繁闪烁。

![](/js/eslint-prettier/format-disable.gif)

&emsp;&emsp;此情况最好是对某个文件执行`eslint`的`fix`功能，如果文件较多，建议执行`npm run eslint:fix`命令。

```javascript
npx eslint src/main.js --fix
```

### 提交时如何跳过 lint 阶段？

&emsp;&emsp;如果你觉得在执行`git commit -m ...`提交时非常耗时，你可以执行以下命令来跳过`lint-staged`和`commitlint`两个阶段。

&emsp;&emsp;但是还是建议不要这样做，因为你无法保证提交到远端的代码是非常规范的。

```javascript
git commit -m 'xxx' --no-verify
```

### lint-staged 在 pre-commit 阶段报错

&emsp;&emsp;在`node`版本较低的情况下，且安装了`lint-staged`的`v12`版本（目前`v12.3.4`）。

&emsp;&emsp;;`node`版本为`v12.14.1`时，提交时抛出以下错误。

![](/js/eslint-prettier/fs.png)

&emsp;&emsp;;`node`版本为`v14.10.1`时，提交时抛出以下错误。

![](/js/eslint-prettier/esm.png)

&emsp;&emsp;;[官方](https://github.com/okonet/lint-staged#migration)明确了所支持的`node`版本。

![](/js/eslint-prettier/v12.png)

&emsp;&emsp;两种解决方式，方式一可升级`node`版本，方式二则可安装`lint-staged`的`v11.2.6`及以下版本，推荐方式二。

### 维护配置文件到 package.json

&emsp;&emsp;诸如`.eslintrc.js`和`.prettierrc.js`等配置文件，都维护在开发目录下，显得多而复杂，另外后期此类文件都是不用修改的，还有另外一种配置方式，就是维护至`package.json`下。

&emsp;&emsp;;`eslint`。

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  extends: ['plugin:vue/recommended', 'plugin:prettier/recommended'],
  rules: {
    quotes: ['error', 'single'],
  },
}

// package.json
{
  ...
  "eslintConfig": {
    "root": true,
    "extends": [
      "plugin:vue/recommended",
      "plugin:prettier/recommended"
    ],
    "rules": {
      "quotes": [
        "error",
        "single"
      ]
    }
  }
}
```

&emsp;&emsp;;`prettier`。

```javascript
// .prettierrc.js
module.exports = {
  semi: false,
  printWidth: 110,
  singleQuote: true,
  endOfLine: 'crlf',
  arrowParens: 'avoid',
}

// package.json
{
  ...
  "prettier": {
    "semi": false,
    "printWidth": 110,
    "singleQuote": true,
    "endOfLine": "crlf",
    "arrowParens": "avoid"
  }
}
```

&emsp;&emsp;;`husky`。

```javascript
// .huskyrc.json
{
  "hooks": {
    "pre-commit": "lint-staged",
    "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
  }
}

// package.json
{
  ...
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
}
```

&emsp;&emsp;;`lint-staged`。

```javascript
// .lintstagedrc.json
{
  "src/**/*.{js,vue}": [
    "eslint --fix",
    "git add"
  ]
}

// package.json
{
  ...
  "lint-staged": {
    "src/**/*.{js,vue}": [
      "eslint --fix",
      "git add"
    ]
  }
}
```

&emsp;&emsp;;`commitlint`。

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
}

// package.json
{
  ...
  "commitlint": {
    "extends": [
      "@commitlint/config-conventional"
    ]
  }
}
```

&emsp;&emsp;;`babel`。

```javascript
// babel.config.js
module.exports = {
  presets: ['@vue/cli-plugin-babel/preset'],
}

// package.json
{
  ...
  "babel": {
    "presets": [
      "@vue/cli-plugin-babel/preset"
    ]
  }
}
```

&emsp;&emsp;;`browserslist`。

```javascript
// .browserslistrc
> 1%
last 2 versions
not dead

// package.json
{
  ...
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead"
  ]
}
```

### 如何配置 vue 代码片段？

&emsp;&emsp;;`vetur`提供了代码片段用来提高开发效率。

![](/js/eslint-prettier/snippet.png)

#### vscode 中 vue.json 文件

&emsp;&emsp;;`vscode`中键入`Shift + Ctrl + P`，输入`snippets`，选择配置用户代码片段。

&emsp;&emsp;然后输入`vue`，选择`vue.json`。

![](/js/eslint-prettier/vue-json.png)

&emsp;&emsp;删除掉所有注释，添加以下内容。

```javascript
// vue.json
{
  "Vue Component": {
    "prefix": "cpt",
    "body": [
      "<template>",
      "  $1",
      "</template>",
      "",
      "<script>",
      "export default {",
      "",
      "}",
      "</script>",
      "",
      "<style>",
      "",
      "</style>"
    ],
    "description": "Vue 组件模板"
  }
}
```

&emsp;&emsp;;`vue`单文件内输入`cpt`，代码片段已生效。

&emsp;&emsp;此方式配置在`vscode`中，在任何项目中都能生效，但是配置起来很麻烦，`vue.json`中要一行一行添加。

![](/js/eslint-prettier/cpt.png)

#### 项目级模板

&emsp;&emsp;项目根目录下`.vscode`目录结构如下。

```javascript
├── .vscode
│   ├── settings.json
│   ├── vetur
│   │   ├── snippets
│   │   │   ├── template.vue
```

&emsp;&emsp;可在`snippets`文件夹下添加`template.vue`文件。

```javascript
// .vscode/vetur/snippets/template.vue
<template>
  <div>
    ${0}
  </div>
</template>
```

&emsp;&emsp;此方式新增`vue`文件后，`Reload`重载后可生效，此方式相对`vue.json`文件，仅设置单文件即可，不需要一行一行添加。

![](/js/eslint-prettier/template.png)

#### vscode 插件目录

&emsp;&emsp;;`vscode`键入`Shift + Ctrl + P`，输入`extensions folder`，选择打开拓展文件夹。

&emsp;&emsp;打开`octref.vetur-xx.xx.xx`目录，进入`server/dist/veturSnippets`文件夹。

![](/js/eslint-prettier/Vetur-dir.png)

&emsp;&emsp;添加自定义代码片段，也可复制`default.vue`然后修改。

```javascript
// veturSnippets/page.vue
<template>
  ${0}
</template>

<script>
export default {
  name:''
}
</script>

<style>

</style>
```

&emsp;&emsp;;`Reload`重载后生效。

![](/js/eslint-prettier/page.png)

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125) / [Gitee](https://gitee.com/dongwei1125)、[GitHub Pages](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~