# vue element web 表单设计工具

![](/app/form-making/banner.jpg)

## 工具概述

### 简介

&emsp;&emsp;项目名 [dw-form-making](https://github.com/dongwei1125/dw-form-making)，基于 [element-ui](https://element.eleme.cn/#/zh-CN) 组件库的`Web`端表单设计工具。

&emsp;&emsp;项目技术栈`vue`、`vue-cli3`，可视化设计`element-ui`输入框、选择器、单选框等控件组成的`Form`表单，配置表单字段、标签、校验规则等。

&emsp;&emsp;较早版本采用`vuex`，由于发布`npm`包以及项目对`vuex`依赖性较高（即`npm`安装后还需配置`vuex`）等原因，故此种方案抛弃。使用`vue.observable`实现`vuex`的`state`、`mutations`部分。

&emsp;&emsp;项目第三方组件包括`vuedraggable`拖拽组件、`tinymce`富文本编辑器、`clipboard`复制插件、`lodash`函数库、`ace`代码编辑器等，其中`element-ui`未包含在`npm`发布包内，最大程度减小项目体积，避免二次引入。

&emsp;&emsp;项目样式参考 [vue-form-making](http://docs.form.making.link/) 基础版本，表单组件未采用`v-if`判断方式渲染，原因一是表单组件较多，几乎全是`v-if`，容易造成代码冗余阅读性差，二是栅格布局采用组件递归，此种方式页面渲染性能差，每次递归页面`v-if`重复数次，故抛弃此种方式，采用动态组件方式渲染表单，不仅可读性高性能也好。

&emsp;&emsp;由于经常使用`vue-form-making`，而后对其实现方式较为感兴趣，故在参考原样式基础上，项目`js`部分完全脱离`vue-form-making`方式，从零开始重构`vue-form-making`基础版本代码。

&emsp;&emsp;项目可熟练巩固使用`element-ui`表单组件和部分`Dialog`对话框、`Message`消息提示、`Container`布局容器等。涉及递归组件内作用域插槽、组件循环引用处理、`Git`多远程库维护、`npm`包发布。

### 项目预览

&emsp;&emsp;;[GitHub](http://dongwei1125.github.io/dw-form-making/) / [Gitee](http://dongwei1125.gitee.io/dw-form-making/)

### 示意图

![](/app/form-making/example.gif)

### 文件目录配置

```javascript
├── dist
├── docs
├── lib
├── public
├── src
│   ├── assets
│   │   ├── fonts
│   │   ├── images
│   │   ├── js
│   ├── components
│   │   ├── ButtonView
│   │   │   ├── GenerateForm.vue
│   │   │   ├── ViewForm.vue
│   │   │   ├── Widget.vue
│   │   ├── ConfigOption
│   │   │   ├── FieldProperty.vue
│   │   │   ├── FormProperty.vue
│   │   ├── AceEditor.vue
│   │   ├── PublicDialog.vue
│   ├── elements
│   │   ├── input
│   │   │   ├── config.vue
│   │   │   ├── view.vue
│   │   ├── radio
│   │   │   ├── config.vue
│   │   │   ├── view.vue
│   │   ├── ...
│   │   ├── CommonField.vue
│   │   ├── CommonView.vue
│   │   ├── config.js
│   │   ├── index.js
│   │   ├── view.js
│   ├── layout
│   │   ├── index.vue
│   │   ├── components
│   │   │   ├── ButtonView.vue
│   │   │   ├── ConfigOption.vue
│   │   │   ├── ElementCate.vue
│   │   │   ├── LinkHeader.vue
│   ├── store
│   │   ├── index.js
│   │   ├── vuex.js
│   ├── styles
│   │   ├── index.scss
│   │   ├── layout.scss
│   ├── utils
│   │   ├── index.js
│   │   ├── format.js
│   │   ├── vue-component.js
│   ├── App.vue
│   ├── main.js
│   ├── index.js
│   ├── package.json
│   ├── README.md
│   ├── vue.config.js
```

## 初始化

### 脚手架初始化

&emsp;&emsp;初始空脚手架`vue-cli3`仅配置`Babel`、`CSS Pre-processors`（`scss`），删除其余业务不相关部分，文件夹部分根据需求逐步创建。

&emsp;&emsp;项目核心组件库`element-ui`，由于整个项目完全依赖`element-ui`，所以可以直接全局引入。但是`npm`包发布不引入，最大程度减小项目体积，具体后续还会提到。

```javascript
npm i element-ui -S

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)
```

&emsp;&emsp;其次项目核心拖拽业务组件 [vuedraggable](https://github.com/SortableJS/Vue.Draggable)，拖拽页面部分引入即可，不用全局引入。

```javascript
npm i -S vuedraggable

import draggable from 'vuedraggable'
...
export default {
  components: {
    draggable,
  },
}
...
```

&emsp;&emsp;初始化样式使用 [normalize.css](https://github.com/necolas/normalize.css)，项目定制样式初始化`styles`下`index.scss`，其余布局相关、组件相关样式统一放在`layout.scss`。

### 页面布局

&emsp;&emsp;其中`ButtonView`视图区域`components`维护组件`GenerateForm.vue`、`ViewForm.vue`、`Widget.vue`，`ConfigOption`配置参数维护组件`FieldProperty.vue`字段属性、`FormProperty.vue`表单属性。

![](/app/form-making/layout.png)

&emsp;&emsp;项目基本布局确定完毕，开始实现具体结构。创建`layout`文件夹，维护整个页面布局相关部分，`App.vue`中只做`layout`的引入，这样后期`App.vue`基本不作改动，同时最为关键的是，最终发布为`npm`包时，整个`layout`注册为组件，方便引入。

```javascript
// App.vue
<div id="app">
  <Layout />
</div>

import Layout from './layout/index'
...
export default {
  name: 'App',
  components: {
    Layout,
  },
}
...

// index.js
import MakingForm from './layout/index'
...
export {
  ...
  MakingForm
}
```

&emsp;&emsp;;`layout` `index.vue`作为组件导出，其中`layout`内部使用`element-ui` `container`布局容器，四个页面主要区域放在同级`components`文件夹下，底部`Powered by`代码较少，不用再作抽离。四个主要区域设置类名，`ElementCate`固定宽度`250px`，`ConfigOption`固定宽度`300px`，`ButtonView`最小宽度`440px`，防止屏幕宽度较小样式错乱。

```javascript
<el-container class="dw-form-making-container">
  <el-header class="dw-form-making-header">
    <link-header />
  </el-header>

  <el-container class="dw-form-making-body">
    <el-aside class="dw-form-making-elementcate" width="250px">
      <element-cate />
    </el-aside>

    <el-main class="dw-form-making-buttonview">
      <button-view />
    </el-main>

    <el-aside class="dw-form-making-configoption" width="300px">
      <config-option />
    </el-aside>
  </el-container>

  <el-footer class="dw-form-making-footer">...</el-footer>
</el-container>
```

&emsp;&emsp;;`ElementCate`部分首先考虑各个元素数据和图标，暂不考虑元素的其他情况（配置信息等），[iconfont](https://www.iconfont.cn/) 创建个人项目，选择合适的图标，下载本地压缩包解压导入，注意`iconfont.css`导入路径前加上`~`符号，从`vue.config.js`中`alias`查询相关路径加载模块，不添加`~`默认为当前目录下路径。

```javascript
@import '~assets/fonts/iconfont.css';
```

&emsp;&emsp;;`ElementCate.vue`中引入三个不同类别的表单组件，假设某个`js`文件（`elements`文件夹内`index.js`）对外导出三个数组，分别为`basic`、`advance`、`layout`，且每个数组对象暂时包含`name`标签、`icon`图标。

```javascript
// element -> index.js
const basic = [
  ...
  {
    name: '单行文本',
    icon: 'icon-input'
  }
  ...
]

const advance = []

const layout = []

export {
  basic,
  advance,
  layout,
}
```

&emsp;&emsp;;`ElementCate.vue`引入三个数组，暂时使用`ul` `li`渲染出来，`li`设置为块级再指定宽度`48%`，其中图标和组件名均对齐中线，同时设置表单组件悬浮的样式。

&emsp;&emsp;;`ButtonView`按钮视图区域分为上下两部分，按钮区域和视图区域，按钮区域暂时放置对应按钮，事件后续接入逻辑详细处理，视图区域抽离为组件`ViewForm.vue`，现在暂时放置一个`div`盒子。

&emsp;&emsp;;`ConfigOption`配置参数区域分为字段属性、表单属性，实现最基本的`Tabs`切换即可。

### vuedraggable 拖动与 transition-group

&emsp;&emsp;;[vuedraggable](https://github.com/SortableJS/Vue.Draggable) 官方文档提供了`vuedraggable`与`transition-group`配合使用的示例方法，这里详细说明项目元素分类和视图表单区域的配置参数。

- `tag`: `draggable`渲染后的标签名
- `value`: 和内部元素`v-for`指令引用相同的数组，不应该直接使用，可通过`v-model`
- `group.name`: 同分组名可相互拖动，不同`draggable`列表也可以
- `group.pull`: 拖动至其他分组克隆或复制，而非直接取出再移动
- `group.put`: 其他组别拖动至当前分组是否放入
- `sort`: 同分组拖动后不排序
- `animation`: 单位`ms`，与`transition-group`产生过渡效果
- `ghostClass`: 被拖动元素`class`类名
- `handle`: 拖动列表元素上指定类名部分（拖动小图标）才能进行拖动
- `clone`: 克隆事件，声明使用`:`，处理克隆后的元素
- `add`: 添加事件，其他分组拖动至当前分组，处理添加前的元素

```javascript
// ElementCate.vue
<draggable
  v-model="list"
  tag="ul"
  v-bind="{
    group: {
      name: 'view',
      pull: 'clone',
      put: false,
    },
    sort: false,
  }"
  :clone="handleClone"
>
  <li>...</li>
  ...
</draggable>

// ViewForm.vue
<draggable
  v-model="list"
  v-bind="{
    group: 'view',
    animation: 200,
    ghostClass: 'move',
    handle: '.drag-icon',
  }"
  @add="handleAdd"
>
  <transition-group>...</transition-group>
</draggable>
```

&emsp;&emsp;;`ElementCate`部分根据上述配置，引入分类列表`basic`、`advance`、`layout`，注册`Draggable`组件，其中分类列表长度若为`0`，对应列表标题也不显示，不用外层添加`DOM`元素，使用`template`配合`v-if`使用。`clone`函数拖动时触发，参数为拷贝的元素对象，暂时打印，返回拷贝的对象。

&emsp;&emsp;视图表单部分使用`absolute`绝对定位使高度为整个下半部分区域，`draggable`覆盖区域高度不够不会产生拖动且内部绑定的`list`暂时为`data`内变量。`add`函数参数解构`newIndex`（列表内索引），通过索引可获取拖入后的元素。控制台查看视图表单内列表，当元素拖入（鼠标不松开），元素类名为`element-cate-item` `move`，鼠标松开渲染为视图表单列表元素，`layout.scss`设置拖入样式。由于视图表单也存在元素的拖动情况，故样式声明为变量，使用时引入。

```javascript
@mixin form-item-move {
  outline-width: 0;
  height: 3px;
  overflow: hidden;
  border: 2px solid #409eff;
  ...
}

.element-cate-item {
  &.move {
    @include form-item-move;
  }
  ...
}
```

&emsp;&emsp;;`FormProperty`可配置按钮视图中对齐方式、宽度、组件尺寸等，故将按钮视图中`draggable`放入`el-form`组件内，每一个列表元素渲染为`el-form-item`，`el-form`配置固定，`el-form-item`暂时渲染`label`和输入框。注意`transition-group`内部元素必须设置`key`值，否则元素无法渲染并且控制台会打印警告。

```javascript
<el-form size="small" label-width="100px" label-position="right">
  <draggable ... @add="handleAdd">
    <transition-group>
      <div v-for="(element, index) in data" :key="index" class="view-form-item">
        <el-form-item :label="element.name">
          <el-input />
        </el-form-item>
      </div>
    </transition-group>
  </draggable>
</el-form>

handleAdd({ newIndex }) {
  this.select = this.data[newIndex]
}
```

&emsp;&emsp;;`ElementCate`元素拖入`ViewForm`可以看见蓝色长条，鼠标松开渲染为输入框和标签，设置`view-form-item`样式和`hover`样式，边框色同`ElementCate`元素一致。当点击`view-form-item`时，`data`中变量`select`保存点击的`view-form-item`，判断显示出蓝色边框和拖动图标。

```javascript
<div :class="['view-form-item', { active: select.key === element.key }]" @click="handleSelect(element)">
  <el-form-item ...>...</el-form-item>
  ...
  <div v-if="select.key === element.key" class="item-drag">
    <i class="iconfont icon-drag drag-icon"></i>
  </div>
  ...
</div>

handleSelect(element) {
  this.select = element
}
```

&emsp;&emsp;首先要明确的是，分类元素中`clone`事件返回的对象就是视图表单放入的对象，故可以在`clone`回调时添加`key`属性或者表单视图`add`事件内`newIndex`获取元素添加`key`属性。但是两种方式有明显差异，前者鼠标拖动`clone`返回对象并添加`key`值，鼠标松开`add`活动元素`select`设为当前元素（拖入的元素高亮），后者鼠标拖动`clone`返回对象，鼠标松开`add`添加`key`后再设置活动元素。虽然实现效果并无差异，但是后者一个函数做了两件事（添加`key`、高亮），不符合单一职责原则`SRP`。

&emsp;&emsp;;`key`值使用`4`位随机字符串和时间戳方式。`clone`函数参数为拖动元素引用，故返回对象时要另拷贝，对象拷贝使用 [lodash](https://www.lodashjs.com/).deepClone，也可以使用`JSON`深拷贝，但是`JSON.stringify`序列化时会丢失掉函数等类型，不推荐使用。`utils`工具类下暴露出`uuid`、`deepClone`。

```javascript
// ElementCate.vue
handleClone(element) {
  return Object.assign(deepClone(element), { key: uuid() })
}

// utils -> index.js
import lodash from 'lodash'

function deepClone(object) {
  return lodash.cloneDeep(object)
}

function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
}

function uuid() {
  return Date.now() + '_' + S4()
}

export {
  uuid,
  deepClone
  ...
}
```

### Elements 元素参数和 vuex

&emsp;&emsp;上述部分已基本实现元素拖动和单击高亮，但是`view-form-item`还渲染为输入框，若`ElementCate`元素有配置参数，可根据不同配置渲染不同表单元素，暂时采用`v-if`方式。

```javascript
// elements -> index.js
const basic = [
  {
    name: '单行文本',
    icon: 'icon-input',
    type: 'input'
  },
  {
    name: '多行文本',
    icon: 'icon-textarea',
    type: 'textarea'
  }
  ...
]

// ViewForm.vue
<el-form-item :label='element.name'>
  <el-input v-if='element.type === "input"' />

  <el-input type='textarea' v-if='element.type === "textarea"' />
  ...
</el-form-item>
```

&emsp;&emsp;;`ElementCate`元素拖入，高亮同时字段属性能配置不同参数，但是字段属性与视图表单没有关联，`vue-form-making`基础版本内部采用组件传值，活动元素`select`传递到顶层`layout`再发送至`FieldProperty.vue`，首先组件层级较深且代码可读性差，优化组件层级，组件树结构又不合理，很难兼备。若存在全局状态管理，解决方式就很灵活，同时也不影响组件层级和结构。

&emsp;&emsp;;`vuex`的确能很好地解决上述问题，但是项目对`vuex`依赖性不高并且项目不大，仅仅使用`state`状态管理显得多余。而`vue.observable`方式不仅可以实现部分`vuex`功能，项目也会显得轻量。视图表单内`select`活动元素`state`下维护，视图表单内`computed`引入，元素拖入和单击时调用`mutations`设置活动元素。`FieldProperty.vue`同理引入`select`，暂时可配置元素标签名。

```javascript
// store -> index.js
export default new Vuex.Store({
  state: {
    select: {}
  },
  mutations: {
    SET_SELECT(state, select) {
      if (state.select === select) return
      state.select = select
    }
  }
}

// ViewForm.vue
import store from 'store/index.js'

export default {
  ...
  computed: {
    select() {
      return store.state.select
    },
  },
  methods: {
    handleSelect(element) {
      store.commit('SET_SELECT', element)
    },

    handleAdd({ newIndex }) {
      store.commit('SET_SELECT', this.data.list[newIndex])
    },
  },
}

// FieldProperty.vue
<el-form size="small" label-position="top">
  <el-form-item label="标签">
    <el-input v-model="data.name"></el-input>
  </el-form-item>
</el-form>

export default {
  ...
  computed: {
    data() {
      return store.state.select
    }
  }
}
```

&emsp;&emsp;若单行文本含`placeholder`，多行文本不含`placeholder`，`FieldProperty.vue`内渲染配置项就会不一样，也采用`v-if`方式。`placeholder`与`name`标签不同，属于元素具体配置，放在`options`下。

```javascript
// elements -> index.js
const basic = [
  {
    name: '单行文本',
    icon: 'icon-input',
    type: 'input',
    options:{
      placeholder:''
    }
  },
  {
    name: '多行文本',
    icon: 'icon-textarea',
    type: 'textarea'
  }
  ...
]

// ViewForm.vue
<el-form-item :label="element.name">
  <el-input v-if="element.type === 'input'" :placeholder="element.options.placeholder" />

  <el-input v-if="element.type === 'textarea'" type="textarea" />
  ...
</el-form-item>

// FieldProperty.vue
<el-form size="small" label-position="top">
  <el-form-item label="标签">
    <el-input v-model="data.name"></el-input>
  </el-form-item>

  <el-form-item v-if="data.type === 'input'" label="占位内容">
    <el-input v-model="data.options.placeholder"></el-input>
  </el-form-item>
</el-form>
```

## 表单元素操作

### 全局表单配置

&emsp;&emsp;其实表单也是一个全局变量，包含表单配置（对齐方式、宽度、组件尺寸等）和内部元素。`ViewForm.vue`内部`data`维护至`store`，对表单和活动元素的操作，基本都在`mutations`内部。

```javascript
// store -> index.js
export default new Vuex.Store({
  state: {
    select: {},
    data: {
      list: [],
      config: {
        labelWidth: 100,
        labelPosition: 'right',
        size: 'small',
        customClass: '',
      },
    },
  },
})

// ViewForm.vue
<el-form
  :size="data.config.size"
  :label-width="data.config.labelWidth + 'px'"
  :label-position="data.config.labelPosition"
>
  ...
</el-form>

export default {
  computed: {
    data() {
      return store.state.data
    },
  },
}

// FormProperty.vue
<el-form label-position="top" size="small">
  <el-form-item label="标签对齐方式">
    <el-radio-group v-model="data.labelPosition"> ... </el-radio-group>
  </el-form-item>
</el-form>

export default {
  ...
  computed: {
    data() {
      return store.state.data.config
    },
  },
}
```

### 动态组件

&emsp;&emsp;目前元素可拖动至视图表单，同时配置标签等，表单也可全局配置。但是按钮视图的元素还很单一，逐渐完善后数量多达`20`个左右，若输入框等组件仅仅通过`v-if`判断渲染，首先全篇几乎是`v-if`全等判断，阅读性非常差，其次每渲染一个组件就会经过`20`次的`v-if`，视图表单引入栅格后，栅格每嵌套一级，`v-if`重复`20`次，表单一旦栅格层级较深、元素较多，渲染性能会非常差，再者后期自定义添加表单组件，每添加一个组件，调整代码的地方会非常多，维护非常困难。参考 [vue-form-making](https://github.com/GavinZhuLei/vue-form-making/blob/master/src/components/WidgetConfig.vue) 基础版本，高级版可能已重构，而且性能很好。表单配置也同理，全篇`v-if`不是最终解决办法，动态组件将会很好解决这个问题。

&emsp;&emsp;;`ElementCate`每一个元素都对应一个表单组件、表单配置组件，根据`ElementCate`的组件名动态渲染，代码量会大大精简，只是视图表单初始化、字段属性初始化需要引入多个组件，需要用到`require.context`自动化导入模块，避免重复代码和手动导入。

&emsp;&emsp;;`elements`放置表单组件，`ElementCate`若添加组件，`element`下新增组件即可，不用去考虑视图表单内部的渲染。`index.js`配置`ElementCate`元素，`view.js`和`config.js`自动化导入`config.vue`并注册组件。

&emsp;&emsp;添加单行文本组件，`elements`下新建`input`，创建`config.vue`和`view.vue`，必须配置组件名。

```javascript
// elements 组件目录
│   ├── elements
│   │   ├── input
│   │   │   ├── config.vue
│   │   │   ├── view.vue
│   │   ├── ...
│   │   ├── config.js
│   │   ├── index.js
│   │   ├── view.js

// index.js
const basic = [
  {
    name: '单行文本',
    icon: 'icon-input',
    type: 'input',
    component: 'DwInput',
    options: {
      placeholder: '',
    },
  },
]

// view.vue
<el-form-item ...>
  <el-input :placeholder="element.options.placeholder" ...></el-input>
</el-form-item>

export default {
  name: 'DwInput',
  props: {
    element: {
      type: Object,
    },
  },
  ...
}

// config.vue
<el-form size="small" label-position="top">
  <el-form-item label="标签">
    <el-input v-model="data.name"></el-input>
  </el-form-item>
</el-form>

export default {
  name: 'DwInputConfig',
  ...
}
```

&emsp;&emsp;;`view.js`动态导入`elements`下所有`view.vue`文件，对外导出为组件列表，`config.js`同理。

```javascript
// view.js
const components = {}
const requireComponent = require.context('elements/', true, /(view.vue)$/)

requireComponent.keys().forEach(fileName => {
  const componentOptions = requireComponent(fileName)
  const component = componentOptions.default || componentOptions

  components[component.name] = component
})

export default components

// ViewForm.vue
<div v-for="element in data.list" class="view-form-item">
  <component :is='item.component' :element='element'>

  <div v-if="select.key === element.key" class="item-drag">
    <i class="iconfont icon-drag drag-icon"></i>
  </div>
</div>

import Draggable from 'vuedraggable'
import components from 'elements/view'

export default {
  ...
  components: {
    Draggable,
    ...components,
  },
}

// FormProperty.vue
<component :is="component.component && `${component.component}Config`" :data="component" />

import components from 'elements/config'

export default {
  components,
  computed: {
    component() {
      return store.state.select
    },
  },
}
```

### 公共字段属性和公共视图

&emsp;&emsp;通用字段属性包括字段标识`model`、标签`name`、标签宽度（`isLabelWidth`、`labelWidth`）、隐藏标签`hideLabel`、自定义`Class` `customClass`五个属性，字段标识即字段名，默认生成的字段标识为元素`type`加`key`值，字段标识`model`随`key`值一起生成。

```javascript
// ElementCate
handleClone(element) {
  const key = uuid()

  return Object.assign(deepClone(element), {
    key,
    model: element.type + '_' + key,
  })
},
```

&emsp;&emsp;五个属性封装为公共组件`CommonField.vue`，放置插槽，组件`config.vue`引用，组件独有配置插入插槽即可。要注意的是，组件传值是单向的，但是`CommonField.vue`内部却能修改传入的值，原因是组件传引用类型的值实际传递的是引用地址，所以组件内部修改外部依然同步。组件传值不仅可以使用`sync`实现双向传值，也可传递引用类型实现组件双向传值。

```javascript
<common-field :data="data">
  <template slot="custom"> ... </template>
</common-field>

import CommonField from '../CommonField'

export default {
  components: {
    CommonField,
  },
}
```

&emsp;&emsp;公共组件`CommonField.vue`与`CommonField.vue`同步，`el-form-item`插槽`label`和`label-width`显隐标签，`el-form-item`添加`class`自定义`customClass`，`isLabelWidth`控制标签宽度，标签不显示，宽度为`0`，标签显示且自定义宽度，宽度为自定义值，标签显示但不自定义宽度，宽度为表单标签宽度。

```javascript
<el-form-item
  :label-width="
    element.options.hideLabel
      ? '0px'
      : (element.options.isLabelWidth ? element.options.labelWidth : config.labelWidth) + 'px'
  "
  :class="element.options.customClass"
>
  <template v-if="!element.options.hideLabel" slot="label">
    {{ element.name }}
  </template>

  <slot></slot>
</el-form-item>
```

### 元素拷贝、删除和伪元素

&emsp;&emsp;;`ViewForm`内元素的字段标识`model`可创建`div`盒子定位或者运用`css`伪元素实现。

&emsp;&emsp;;`view-form-item`自定义属性`data-model`，`css`伪元素`content`内部`attr`函数获取。`ViewForm`表单元素禁止输入，同理可定位`div`盒子或者`css`伪元素，伪元素绝对定位四个参数都设为`0`且父元素相对定位，可实现宽高等于父元素。

```javascript
// ViewForm.vue
<div v-for="element in data.list" class="view-form-item" :data-model="element.model">...</div>

// layout.scss
.view-form-item {
  position: relative;
  ...
  &::before {
    content: attr(data-model);
    position: absolute;
    top: 3px;
    right: 3px;
    font-size: 12px;
    color: rgb(2, 171, 181);
    z-index: 5;
    font-weight: 500;
  }

  &::after {
    position: absolute;
    content: '';
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 5;
  }
}
```

&emsp;&emsp;;`view-form-item`内部添加克隆图标，传递参数包括克隆元素、索引值、列表元素，处理函数在`store`中维护，拷贝元素`key`值和`model`重新生成，克隆后活动元素`select`重置。

```javascript
// ViewForm.vue
<div v-for="(element, index) in data.list" class="view-form-item">
  ...
  <i class="iconfont icon-clone" @click="handleClone(element, index, data.list)" />
</div>

handleClone(element, index, list) {
  store.commit('CLONE_ELEMENT', { index, element, list })
},

// store -> index.js
CLONE_ELEMENT(state, { index, element, list }) {
  const key = uuid()
  const el = deepClone(element)

  list.splice(
    index + 1,
    0,
    Object.assign(el, {
      key,
      model: element.type + '_' + key,
    })
  )

  state.select = list[index + 1]
},
```

&emsp;&emsp;删除按钮为避免重复点击，只在第一次点击时触发，元素删除动画触发过程中不可再点击。元素删除前更新活动元素`select`，被删除元素处在列表末尾且长度大于`1`，活动元素为上一个元素。若处在列表末尾且长度等于`1`，即列表只有一个元素，活动元素为空。不满足上述则元素处在中部，删除后活动元素为下一个元素。

```javascript
// ViewForm.vue
<div class="view-form-item">
  ...
  <i class="iconfont icon-trash" @click.once="handleDelete(data.list, index)" />
</div>

handleDelete(list, index) {
  store.commit('DELETE_ELEMENT', { list, index })
},

// store -> index.js
DELETE_ELEMENT(state, { list, index }) {
  if (list.length - 1 === index) {
    state.select = index ? list[index - 1] : {}
  } else {
    state.select = list[index + 1]
  }

  list.splice(index, 1)
},
```

## ElementCate 组件

&emsp;&emsp;组件参数引用`CommonFild.vue`公共字段属性，默认含有`5`个公共属性，宽度、操作属性、校验规则等根据实际情况加入，定制化属性添加至组件，再由插槽插入内部。组件视图引用`CommonView.vue`公共视图，负责表单活动样式、标签、字段属性等，组件引用后不考虑表单呈现，仅专注同步组件参数部分。

&emsp;&emsp;组件视图部分`view.vue`，由于表单预览可获取表单内部值，显然组件实现`v-model`双向绑定，组件内部暂时接收传值`value`，预览部分再自定义组件`v-model`。

&emsp;&emsp;下面简述组件定制化部分，诸如`placeholer`占位内容、`style`宽度等参考源代码。

### 单行文本

&emsp;&emsp;单行文本参数包括宽度、默认值、占位内容、操作属性等，校验规则较为复杂，暂不考虑。新增组件参数和视图部分均可参考单行文本源码，单行文本禁用和只读属性二者择其一，不能同时作用于同一表单元素。

```javascript
// elements -> input -> config.vue
<template slot="option">
  <el-checkbox v-model="data.options.disabled" :disabled="data.options.readonly">禁用</el-checkbox>
  <el-checkbox v-model="data.options.readonly" :disabled="data.options.disabled">只读</el-checkbox>
  ...
</template>
```

### 多行文本

&emsp;&emsp;多行文本参数部分，默认值使用文本域。

```javascript
// elements -> textarea -> config.vue
<el-form-item label="默认值">
  <el-input type="textarea" ... />
</el-form-item>
```

### 计数器

&emsp;&emsp;计数器操作按钮位置传递参数`controls-position`，默认为`default`，默认值受最大值、最小值、步数限制。

```javascript
// elements -> number -> view.vue
<common-view>
  <el-input-number
    :value="element.options.defaultValue"
    :controls-position="element.options.controlsPosition"
  />
</common-view>

// elements -> number -> config.vue
<el-form-item label="默认值">
  <el-input-number
    v-model="data.options.defaultValue"
    :max="data.options.max"
    :min="data.options.min"
    :step="data.options.step"
  />
</el-form-item>
```

### 单选框组

&emsp;&emsp;单选框组布局方式分为块级和行内，选项包括静态数据和动态数据，暂不考虑动态数据，选项为`label-value`对形式，内部引用`draggable`拖动列表，选项可删除和新增，添加选项生成随机`label-value`对，选中选项设置默认值，清空列表时默认值清空，选中项删除，清空默认值。注意`el-radio`组件，若不显示`label`，可传入`nbsp`空位符。

```javascript
// elements -> radio -> view.vue
<el-radio
  v-for="(item, index) in element.options.options"
  style="{
    display: element.options.inline
    ? 'inline-block' : 'block'
  }"
  >{{ item.label }}</el-radio>

// elements -> radio -> config.vue
<li ...>
  <el-radio :label="item.value" class="hidden-label">&nbsp;</el-radio>
  ...
</li>
```

### 多选框组

&emsp;&emsp;多选框组与单选框组大同小异，多选框组默认值为数组，多选框组默认值可选择多个，删除选中项时，首先获取选中项`value`值在默认值中的索引，满足则删除默认值对应项，不满足只删除选中项。

```javascript
// elements -> checkbox -> config.vue
handleDeleteOptions(element, index) {
  const i = this.data.options.defaultValue.indexOf(element.value)

  if (i > -1) {
    this.data.options.defaultValue.splice(i, 1)
  }

  this.data.options.options.splice(index, 1)
},
```

### 时间选择器

&emsp;&emsp;时间选择器默认值受格式控制，也包括禁用和只读，同单行文本一致，只能二者选其一。时间选择为占位内容，范围选择包括开始占位内容、范围分隔符、结束占位内容。开启范围选择时默认值只能为`null`，关闭时设为空字符。`el-time-picker`组件`v-bind`绑定`is-range`，范围选择切换导致选择器定位错乱，是`element`组件自身的`bug`，`v-if`与范围选择参数一致并且指定`key`值可解决，两者缺一不可。

```javascript
// elements -> time -> config.vue
<el-form-item label="默认值">
  <el-time-picker v-if="data.options.isRange" key="range" is-range ... />
  <el-time-picker v-else key="default" ... />
</el-form-item>

handleRangeChange() {
  this.data.options.defaultValue = this.data.options.isRange ? null : ''
},
```

### 日期选择器

&emsp;&emsp;日期选择器显示类型包括月份、年份、日期、多日期、日期范围等，范围类型默认值为`null`，其余为空字符，格式对应，切换类型选择器错乱处理方式与时间选择器一致。

```javascript
// elements -> date -> config.vue
export default {
  data() {
    return {
      type: [
        {
          label: '日期时间范围',
          value: 'datetimerange',
          format: 'yyyy-MM-dd HH:mm:ss',
          type: null,
          isRange: true,
        },
      ],
    }
  },
  methods: {
    handleTypeChange(value) {
      const showType = this.type.find(e => e.value === value)

      this.data.options.format = showType.format
      this.data.options.defaultValue = showType.type
      ...
    },
  },
}
```

### 评分

&emsp;&emsp;评分默认值受半选、最大值控制，最大值最小为`1`，默认值清空为`0`。

```javascript
// elements -> rate -> config.vue
<el-rate ... :allow-half="data.options.isAllowhalf" :max="data.options.max" />
```

### 颜色选择器

&emsp;&emsp;颜色选择器选择颜色后，元素默认值为`hex`十六进制，勾选透明度，点击颜色选择器，默认值颜色并未改变，是`el-color-picker`组件自身的`bug`，解决方式类似时间选择器，`v-if`和`key`值两者共同作用。

```javascript
// elements -> color -> config.vue
<el-form-item label="默认值">
  <el-color-picker v-if="data.options.showAlpha" key="alpha" ... show-alpha />
  <el-color-picker v-else key="default" ... />
</el-form-item>
```

### 下拉选择器

&emsp;&emsp;下拉选择器添加选项与单选框组一致，删除元素即单选框组和多选框组的合并，单选多选切换保留默认值方式有差异。单选过渡多选，单选未选择默认值，值为空数组，单选选择默认值，值为包含默认值的数组。多选过渡单选，多选未选择默认值，值为`null`，多选选择默认值，值为数组首个元素值。

```javascript
// elements -> select -> config.vue
handleMultipleChange(multiple) {
  var value = this.data.options.defaultValue

  this.data.options.defaultValue = multiple
    ? value === null
      ? []
      : [value]
    : value.length
    ? value[0]
    : null
},
```

### 开关

&emsp;&emsp;开关参考`el-switch`参数，可自定义开启和关闭的文字颜色、文字描述。

```javascript
// elements -> switch -> view.vue
<el-switch
  :active-color="element.options.isColor ? element.options.activeColor : '#409EFF'"
  :inactive-color="element.options.isColor ? element.options.inactiveColor : '#C0CCDA'"
  :active-text="element.options.isText ? element.options.activeText : ''"
  :inactive-text="element.options.isText ? element.options.inactiveText : ''"
/>
```

### 滑块

&emsp;&emsp;滑块默认值受最大值、最小值、步长限制。

```javascript
// elements -> slider -> config.vue
<el-slider
  v-model="data.options.defaultValue"
  :max="data.options.max"
  :min="data.options.min"
  :step="data.options.step"
/>
```

### 文字

&emsp;&emsp;文字仅是一小段段落，丰富组件列表和部分表单的描述信息，由于可指定宽度，则元素为块级元素。

```javascript
// elements -> text -> view.vue
<div :style="{ width: element.options.width }">
  <span style="word-break: break-all">{{ value }}</span>
</div>
```

### html

&emsp;&emsp;;`html`组件默认值暂时为文本域，可填写`html`代码即可，视图部分利用`v-html`指令。

```javascript
// elements -> html -> view.vue
<div :style="{ width: element.options.width }">
  <div v-html="value" />
</div>
```

### 级联选择器

&emsp;&emsp;级联选择器一般异步获取数据源，默认含`label`、`value`和`children`字段，也可指定属性配置，可选项数据源`options`暂时为空数组。

```javascript
// elements -> cascader -> view.vue
<el-cascader
  :props="{
    value: element.options.props.value,
    label: element.options.props.label,
    children: element.options.props.children,
  }"
  :options="[]"
  ...
/>
```

### 分割线

&emsp;&emsp;分割线`content-position`控制文本位置。

```javascript
// elements -> divider -> view.vue
<el-divider :content-position="element.options.textPosition">
  {{ element.name }}
</el-divider>
```

## 栅格布局

&emsp;&emsp;上述部分仅仅支持单行单表单组件，尚无法满足简单的栅格布局，即一行无法显示多个表单组件，`vue-form-making`基础版本不支持栅格布局，但是其样式和参数可作为参考。

&emsp;&emsp;栅格样式不同于其他组件，`view-form-item`判断是否为栅格元素，动态生成类名。栅格样式权重应高于普通样式，栅格样式代码顺序在普通样式后层叠。

```javascript
// ViewForm.vue
<div
  :class="[
    'view-form-item',
    {
      active: select.key === element.key,
      grid: element.type === 'grid',
    },
  ]"
  ...
>
  ...
</div>

// layout.scss
.view-form-item {
  ...
}

.view-form-item.grid {
  ...
}
```

&emsp;&emsp;栅格参数暂不考虑，一行显示两列。对比`ViewForm.vue`，`ElementCate`内元素若能拖入栅格内，首先栅格内渲染的列表要绑定`draggable`，即`draggleble`包含栅格列表，其次`draggable`覆盖区域必须足够高，否则元素拖不进来。栅格内暂时渲染元素对象，`v-model`绑定`data`内变量，元素拖入后可以观察到数据已拖入并渲染。

```javascript
// elements -> grid -> view.vue
<el-row type="flex">
  <el-col :span="12">
    <draggable
      v-model="list"
      v-bind="{
        group: 'view',
      }"
    >
      <transition-group tag="div" class="el-col-list">
        <div v-for="(element, index) in list" :key="index">
          <span>{{ element }}</span>
        </div>
      </transition-group>
    </draggable>
  </el-col>
  <el-col :span="12">
    <div class="el-col-list"></div>
  </el-col>
</el-row>

...
export default {
  data() {
    ...
    return {
      list: [],
    }
  },
}

```

&emsp;&emsp;;`el-col-list`内元素渲染为表单组件，局部批量注册组件。

```javascript
// elements -> grid -> view.vue
<transition-group tag="div" class="el-col-list">
  <component :is="element.component" v-for="(element, index) in list" :key="index" :element="element" />
</transition-group>

import Draggable from 'vuedraggable'
import components from 'elements/view'

export default {
  ...
  name: 'DwGrid',
  components: {
    Draggable,
    ...components,
  },
  data() {
    return {
      list: [],
    }
  },
}
```

&emsp;&emsp;;`ElementCate`元素拖入，控制台会报错组件未注册，但是代码内明确注册了组件。在生命周期`beforeCreate`内打印`this.$options.components`，页面注册的组件只有`Draggable`和栅格`DwGrid`。其余批量注册的组件均不存在，即组件并未注册。造成错误的原因是组件之间的循环引用，若表单元素全局注册，这种错误不会存在。但是组件局部注册，`DwGrid`内部引用`DwGrid`，就变成了一个循环，组件不知道如何完全解析出自身。解决方式有两种，[vue](https://cn.vuejs.org/v2/guide/components-edge-cases.html#%E7%BB%84%E4%BB%B6%E4%B9%8B%E9%97%B4%E7%9A%84%E5%BE%AA%E7%8E%AF%E5%BC%95%E7%94%A8) 官方给出了示例，由于是批量注册，`webpack`的异步`import`不适用，在生命周期`beforeCreate`时去注册它。

```javascript
import components from 'elements/view'

export default {
  ...
  beforeCreate() {
    Object.assign(this.$options.components, components)
  },
}
```

&emsp;&emsp;此时`ElementCate`元素拖入，对应表单可渲染，参考`ViewForm.vue`内部`view-form-list`，配置`draggable`参数，部分克隆、删除事件暂不考虑，函数设为空函数。

```javascript
// elements -> grid -> view.vue
<transition-group class="el-col-list" ...>
  <div
    v-for="element in list"
    :key="element.key"
    :class="[
      'view-form-item',
      {
        active: select.key === element.key,
        grid: element.type === 'grid',
      },
    ]"
    :data-model="element.model"
    @click.stop="handleSelect(element)"
  >
    <component :is="element.component" :element="element" />

    <div v-if="select.key === element.key" class="item-drag">
      <i class="iconfont icon-drag drag-icon"></i>
    </div>

    <div v-if="select.key === element.key" class="item-action">
      <i class="iconfont icon-clone" @click.stop="handleClone"></i>
      <i class="iconfont icon-trash" @click.stop.once="handleDelete"></i>
    </div>
  </div>
</transition-group>

export default {
  methods: {
    handleSelect(element) {
      store.commit('SET_SELECT', element)
    },

    handleClone() { },

    handleDelete() { },
  },
}
```

&emsp;&emsp;细致发现，`ViewForm.vue`和栅格内部`view-form-item`代码完全一致（逻辑部分暂不考虑），一般抽离公共代码，封装成一个组件，但是可以梳理页面结构并最终发现，代码一致是必然的。首先`ViewForm.vue`是一个单一的列表，组件拖入并渲染单个元素，引入栅格后，每个栅格代表一个列表，栅格列表与`ViewForm.vue`的列表实质是同一种列表，拖入的组件也是同一类组件，所以最终列表（`view-form`、`el-col-list`）内代码是一致的。

&emsp;&emsp;公共部分代码为`Widget.vue`小部件，即对每个组件的一层包装，包括点击高亮、拖动、克隆、删除事件，组件传值暂时为`element`、`index`（元素索引）。

```javascript
// ViewFrom.vue
<transition-group class="view-form">
  <widget v-for="(element, index) in data.list" :key="element.key" :index="index" :element="element" />
</transition-group>

import Widget from './Widget'

export default {
  components: {
    Widget,
  },
}
```

&emsp;&emsp;栅格组件内部引入小部件，拖入`ElementCate`元素，页面报错组件渲染失败。根据报错信息很难排查问题原因，细致梳理页面结构，小部件批量引入表单组件，其中包含输入框、栅格等，栅格内部引入小部件，又是组件的循环引用，由于是单个组件，采用`webpack`的异步`import`。

```javascript
// elements -> grid -> view.vue
<transition-group class="el-col-list">
  <widget v-for="(element, index) in list" :key="element.key" :index="index" :element="element" />
</transition-group>

// import Widget from 'components/ButtonView/Widget.vue'

export default {
  components: {
    Widget: () => import('components/ButtonView/Widget.vue'),
  },
}
```

&emsp;&emsp;栅格列数未与栅格`json`数据绑定，栅格列表内表单元素是栅格`json`的一部分，`columns`数组保存栅格对象，栅格对象参数暂不考虑，只包括`list`列表字段，`draggable`双向绑定`column.list`，未绑定或绑定错误都不能显示。

```javascript
// elements -> index.js
const layout = [
  {
    ...
    type: 'grid',
    name: '栅格布局',
    columns: [
      {
        list: [],
      },
      ...
    ],
  },
]

// elements -> grid -> view.vue
<el-row>
  <el-col v-for="(column, index) in element.columns" :key="index" :span="12">
    <draggable v-model="column.list" ...>
      ...
      <widget
        v-for="(element, index) in column.list"
        :key="element.key"
        :index="index"
        :element="element"
      />
    </draggable>
  </el-col>
</el-row>
```

&emsp;&emsp;栅格参数可配置水平、垂直排列方式，栅格方式分为`flex`和响应式，默认为`flex`，参数具体描述参考 [Layout](https://element.eleme.cn/#/zh-CN/component/layout) 布局。

```javascript
// elements -> index.js
const layout = [
  {
    ...
    type: 'grid',
    name: '栅格布局',
    options: {
      gutter: 0,
      isFlex: true,
      justify: 'start',
      align: 'top',
    },
    columns: [
      {
        span: 12,
        xs: 12,
        sm: 12,
        md: 12,
        lg: 12,
        xl: 12,
        list: [],
      },
      ...
    ],
  },
]

// elements -> grid -> view.vue
<el-row
  type="flex"
  :gutter="element.options.gutter"
  :justify="element.options.justify"
  :align="element.options.align"
>
  <el-col
    :xs="element.options.isFlex ? undefined : column.xs"
    :sm="element.options.isFlex ? undefined : column.sm"
    :md="element.options.isFlex ? undefined : column.md"
    :lg="element.options.isFlex ? undefined : column.lg"
    :xl="element.options.isFlex ? undefined : column.xl"
    :span="column.span"
    ...
  >
    ...
  </el-col>
</el-row>
```

&emsp;&emsp;栅格内元素拖入高亮，类比`ViewForm.vue`，根据索引找出元素即可。

```javascript
// elements -> grid -> view.vue
<el-row ...>
  <el-col ...>
    <draggable ... @add="handleAdd($event, column)"> ... </draggable>
  </el-col>
</el-row>

handleAdd({ newIndex }, column) {
  store.commit('SET_SELECT', column.list[newIndex])
},
```

&emsp;&emsp;类比原始`ViewForm.vue`，删除元素传参包括索引值、元素列表，`Widget.vue`声明组件传值`data`，栅格内也是如此。

```javascript
// ViewForm.vue
<widget
  v-for="(element, index) in data.list"
  :key="element.key"
  :index="index"
  :data="data"
  :element="element"
/>

// elements -> grid -> view.vue
<widget
  v-for="(element, index) in column.list"
  :key="element.key"
  :index="index"
  :data="column"
  :element="element"
/>
```

&emsp;&emsp;小部件内克隆与`ViewForm.vue`大同小异，若栅格内部多层嵌套或包含其他表单组件，克隆后不仅要生成副本，而且副本下所有元素的`key`值不能和之前相同，需递归更新元素的`key`值。

```javascript
// store -> index.js
CLONE_ELEMENT(state, { index, element, list }) {
  if (el.type === 'grid') {
    resetGridKey(el)
  }

  function resetGridKey(element) {
    element.columns.forEach(column => {
      column.list.forEach(el => {
        const key = uuid()

        el.key = key
        el.model = el.type + '_' + key

        if (el.type === 'grid') {
          resetGridKey(el)
        }
      })
    })
  }
},
```

## Dialog 公共对话框和 AceEditor

&emsp;&emsp;导入`json`，可粘贴`json`数据快速配置表单，点击确定，根据配置的`json`数据渲染表单，但是数据不限制会发生很多错误，`utils`下`format.js`验证传入的`json`数据格式是否正确，格式不正确`reject`并返回错误原因，格式正确更新`state`内表单数据`data`。

```javascript
// layout -> components -> ButtonView.vue
handleUploadJson() {
  formatJson(this.$refs.uploadAceEditor.getValue())
    .then(json => {
      store.commit('SET_DATA', json)
      this.showUpload = false
    })
    .catch(err => {
      this.$message({
        message: '数据格式有误',
        type: 'error',
        center: true,
      })
      console.error(err)
    })
},
```

&emsp;&emsp;粘贴`json`数据，只有用户事先授予网站或应用对剪切板的访问许可后，才能使用异步剪切板读取方法 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Navigator/clipboard)。使用`navigator.clipboard`来访问剪切板，`readText()`异步读取剪切板内容，由于浏览器出于安全考虑，非本地或者网站是`http`协议，都不能读取剪切板内容。可在`http`或`https`网站控制台打印`navigator.clipboard`，`http`协议网站为`undefined`。故只有当`https`网站或者用户授予才可粘贴，否则显示取消按钮，由用户手动粘贴。

```javascript
// layout -> components -> ButtonView.vue
...
<template slot="action">
  <el-button v-if="showPasteBtn" size="small" @click="handlePaste">粘贴</el-button>

  <el-button v-else size="small" @click="showUpload = false">取消</el-button>
</template>

...
export default {
  data() {
    return {
      showPasteBtn: !!navigator.clipboard,
    }
  },
  methods: {
    ...
    handlePaste() {
      navigator.clipboard.readText().then(res => {
        this.$refs.uploadAceEditor.setValue(res)
      })
    },
  },
}
```

&emsp;&emsp;清空时清除活动元素`select`，视图内列表清空。生成`json`，即显示表单`json`信息。复制功能引入第三方复制插件`clipboard`，剪切板实例参数为按钮类名、复制内容，二次封装提示信息，复制完成销毁剪切板实例。

```javascript
// layout -> components -> ButtonView.vue
<el-button ... class="copyJson" @click="handleCopyJson"> 复制</el-button>

handleCopyJson() {
  this.handleCopyText('jsonAceEditor', '.copyJson')
},

handleCopyText(ref, className) {
  copyText(this.$refs[ref].getValue(), className)
    .then(res => {
      this.$message({
        message: '复制成功',
        type: 'success',
        center: true,
      })
    })
    .catch(err => {
      this.$message({
        message: '复制失败',
        type: 'error',
        center: true,
      })
    })
},

// utils -> index.js
function copyText(text, className) {
  const clipboard = new Clipboard(className, {
    text: () => text,
    ...
  })

  return new Promise((resolve, reject) => {
    clipboard.on('success', () => {
      resolve()
      clipboard.destroy()
    })

    clipboard.on('error', () => {
      reject()
      clipboard.destroy()
    })
  })
}
```

&emsp;&emsp;设计工具目的是设计`json`表单数据，某个独立组件传参表单数据渲染为表单。封装独立组件`GenerateForm.vue`，`ButtonView.vue`引入并插入预览弹框插槽，传入全局`state`内`data`。

```javascript
// layout -> components -> ButtonView.vue
<public-dialog>
  ...
  <generate-form :data="data" />
</public-dialog>

...
export default {
  computed: {
    data() {
      return store.state.data
    },
  },
}

// components -> ButtonView -> GenerateForm.vue
<div class="generate-form">
  <el-form ...>
    <component ... />
  </el-form>
</div>

export default {
  props: {
    data: { ... },
  },
}
```

&emsp;&emsp;点击预览，单个组件正常渲染（文字、`html`未显示），栅格内单个组件渲染后残留部分图标。原因是因为栅格组件内部引入的小部件，小部件内部含图标，即预览时栅格内部不应渲染小部件，而应渲染表单元素。`GenerateForm.vue`批量引入组件，组件传值不可拖动，栅格接收参数，仅渲染为表单元素。栅格内批量引入组件，组件内又包括栅格，即组件循环引用，在`beforeCreate`再次注册。

```javascript
// components -> ButtonView -> GenerateForm.vue
<component ... :draggable="false" />

// elements -> grid -> view.vue
<el-col>
  <draggable v-if="draggable"> ... </draggable>
  
  <template v-else>
    <component ...>
  </template>
</el-col>

import components from 'elements/view'

export default {
  beforeCreate() {
    Object.assign(this.$options.components, components)
  },
  ...
}
```

&emsp;&emsp;除文字、`html`外基本可实现预览，获取数据还不可用，表单元素字段属性配置默认值后，`ViewForm.vue`视图还未显示，但是几乎全部表单元素都将`value`作为组件传值，小部件传递组件默认值即可显示，栅格内列表也引入的小部件，故栅格内表单元素也会显示默认值。

```javascript
// elements -> input -> view.vue
<input :value="value" />

...
export default {
  ...
  props: {
    value: {},
  },
}

// components -> ButtonView -> Widget.vue
<component ... :value="element.options.defaultValue" draggable />
```

&emsp;&emsp;点击预览尚不可显示默认值，而且默认值必然与表单组件双向绑定。故需自定义表单组件元素的 [v-model](https://cn.vuejs.org/v2/guide/components-custom-events.html#%E8%87%AA%E5%AE%9A%E4%B9%89%E7%BB%84%E4%BB%B6%E7%9A%84-v-model)，声明传入组件的`prop`，同时表单值变化触发某个事件的时候，更新`prop`。文字和`html`不做双向绑定，但是内部依然可以组件传值`value`，另外分割线无需组件传值。

```javascript
// elements -> input -> view.vue
<el-input ... :value="value" @input="value => $emit('change', value)" />

export default {
  ...
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    ...
    value: {},
  },
}
```

&emsp;&emsp;;`GenerateForm.vue`内部是`el-form`，内部引入不同表单元素，表单元素已实现双向绑定，接下来需要与数据绑定，栅格和分割线不用绑定变量，但是栅格内部元素和外部其他元素均绑定`model`。`GenerateForm.vue`初始化的`models`传入栅格，由于对象传值引用，故栅格内部元素也能绑定，栅格内部可能嵌套栅格，`models`需传递下去。

```javascript
// components -> ButtonView -> GenerateForm.vue
<el-form :model="models" ...>
  <components v-model="models[element.model]" :models="models" ... />
</el-form>

export default {
  data() {
    return {
      models: {},
    }
  },
  created() {
    this.handleSetModels()
  },
  methods: {
    handleSetModels() {
      const models = {}

      getGridModel(this.data.list)

      this.models = models

      function getGridModel(list) {
        list.forEach(element => {
          if (element.type === 'grid') {
            element.columns.forEach(column => {
              if (column.list.length) {
                getGridModel(column.list)
              }
            })
          } else {
            if (element.type !== 'divider') {
              models[element.model] = element.options.defaultValue
            }
          }
        })
      }
    },
  },
}

// elements -> grid -> view.vue
<components v-model="models[element.model]" :models="models" ... />

export default {
  props: {
    models: { ... },
  },
}
```

&emsp;&emsp;点击获取数据后，将`models`数据放入编辑器，`GenerateForm.vue`内部加入`getData`方法返回`models`，`models`需拷贝副本返回，保证组件内`models`不被污染。

```javascript
// components -> ButtonView -> GenerateForm.vue
getData() {
  return deepClone(this.models)
},

// layout -> components -> ButtonView.vue
<generate-form ref="generateForm" :data="data" ... />

handleGetData() {
  this.models = this.$refs.generateForm.getData()
  this.showPreviewData = true
},
```

## Tinymce 富文本编辑器

&emsp;&emsp;最初决定使用`tinymce`作为富文本编辑器主要是由于`tinymce`操作按钮很容易控制，图片上传很方便，[中文文档](http://tinymce.ax-z.cn/) 也容易上手，不足部分就是依赖`tinymce-vue`且很多功能声明后还需单独引入才能使用，组件语言部分要单独引入`js`。其他编辑器图片上传很复杂，并且最主要的是上传的图片大小不可控制，有的文档也不完善，后续可能会替换其他编辑器，`wangEditor`可作为尝试。

&emsp;&emsp;组件内配置详细可参考源代码，其中图片上传部分详细描述。使用`images_upload_handler`自定义图片上传，参数分别为`blobInfo`、`success`、`failure`，`blobInfo`为图片文件详细信息（文件名、`base64`等），`success`为图片上传成功回调，传参图片`url`地址，`failure`为图片上传失败回调，传参错误描述信息。用户引入`GenerateForm.vue`不可见自定义图片上传函数体，若要获取文件信息、回调函数只能通过子组件传值父组件，且栅格引入后需逐层向上传递。`editorUploadImage`函数内可获取文件信息，也可异步调用失败和成功回调函数。

```javascript
// elements -> editor -> view.vue
images_upload_handler: (blobInfo, success, failure) => {
  this.$emit('editor-upload-image', {
    blobInfo,
    success,
    failure,
    model: this.element.model,
  })
},

// elements -> grid -> view.vue
<component @editor-upload-image="data => $emit('editor-upload-image', data)" />

// components -> ButtonView -> GenerateForm.vue
<component @editor-upload-image="data => $emit('editor-upload-image', data)" />

// layout -> components -> ButtonView.vue
<generate-form ... @editor-upload-image="editorUploadImage" />

editorUploadImage({ blobInfo, success }) {
  success('data:image/jpeg;base64,' + blobInfo.base64())
},
```

## blank 自定义区域

&emsp;&emsp;若设计工具仅仅支持上述表单组件，设计工具的局限性会非常大，尚不支持`Tabs`标签页、表格，也不支持引入第三方的表单组件，所以需提供自定义区域插槽，用户再根据实际情况插入不同的表单组件，以此增加表单延展性。

&emsp;&emsp;首先要明确的是，组件内部若有多个同名具名插槽，外部插入元素时，均会插入到同名具名插槽内部。组件外部插入多个不同插槽名元素时，只有和组件内插槽名相同的元素才能插入。`GenerateForm.vue`初始化时不仅需要创建绑定表单`models`，还要获取表单内所有自定义区域的`model`，即是自定义区域内插槽的名称。

&emsp;&emsp;若`GenerateForm.vue`外部插入`A`、`B`、`C`等若干个不同插槽名的元素，表单内含自定义区域`A`、栅格嵌套多层的`B`。`GenerateForm.vue`根据表单内自定义区域个数创建`slots`数组（`A`、`B`），创建`A`、`B`对应具名插槽，自定义区域`A`外部`A`、`B`两个元素待插入，但是由于自定义区域`A`内部只有插槽`A`，则`A`元素插入自定义区域`A`内部。

```javascript
<generate-form>
  <div slot="A">A</div>
  <div slot="B">B</div>
  <div slot="C">C</div>
  ...
</generate-form>

// generate-form
<div>
  <blank-A>
    <template slot="A">
      <slot name="A" />
    </template>
    <template slot="B">
      <slot name="B" />
    </template>
  </blank-A>
</div>

// black-A
<div>
  <slot name="A" />
</div>
```

&emsp;&emsp;自定义区域假设嵌套两层栅格，传入`slots`数组（`A`、`B`），第一层栅格外部插入`A`、`B`元素，第一层栅格内部解析为第二层栅格并创建`A`、`B`插槽，第二层栅格外部插入`A`、`B`元素，内部解析为自定义区域`B`并创建`A`、`B`插槽，由于自定义区域`B`内部只有插槽`B`，则`B`元素插入自定义区域`B`内部。

```javascript
<generate-form>
  <div slot="A">A</div>
  <div slot="B">B</div>
  <div slot="C">C</div>
  ...
</generate-form>

// generate-form
<div>
  <grid-1>
    <template slot="A">
      <slot name="A" />
    </template>
    <template slot="B">
      <slot name="B" />
    </template>
  </grid-1>
</div>

// grid1
<div>
  <grid-2>
    <template slot="A">
      <slot name="A" />
    </template>
    <template slot="B">
      <slot name="B" />
    </template>
  </grid-2>
</div>

// grid-2
<div>
  <black-B>
    <template slot="A">
      <slot name="A" />
    </template>
    <template slot="B">
      <slot name="B" />
    </template>
  </black-B>
</div>

// black-B
<div>
  <slot name="B" />
</div>
```

&emsp;&emsp;上述原理基本接近源代码，页面创建初始化`models`和`slots`。自定义区域将`models`放在`model`字段上，无论栅格嵌套多少层，`scope.model`始终为`models`，并且`models`与表单内部`models`是同一个`models`，自定义组件双向绑定`models`变量，预览获取数据始终为表单值`models`（包括自定义组件）。

```javascript
// components -> ButtonView -> GenerateForm.vue
<component :slots="slots">
  <template v-for="slot in slots" :slot="slot" slot-scope="scope">
    <slot :name="slot" :model="scope.model" />
  </template>
</component>

handleSetModels() {
  const models = {}
  const slots = []

  getGridModel(this.data.list)

  this.models = models
  this.slots = slots

  function getGridModel(list) {
    list.forEach(element => {
      if (element.type === 'grid') {
        ...
      } else {
        if (element.type === 'blank') {
          slots.push(element.model)
        }
        ...
      }
    })
  }
},

// elements -> grid -> view.vue
<component :slots="slots">
  <template v-for="slot in slots" :slot="slot" slot-scope="scope">
    <slot :name="slot" :model="scope.model" />
  </template>
</component>

// elements -> blank -> view.vue
<div>
  <slot :name="element.model" :model="models">
    <div class="custom-area">{{ element.model }}</div>
  </slot>
</div>
```

## 表单功能

### 重置

&emsp;&emsp;表单重置其实调用`el-form` `resetFields`方法基本就能完成重置，但是时间和日期选择器重置存在`bug`。时间范围下绑定值`times`，初始值`null`，选择时间后重置，`times`值为`[ null ]`，绑定值空数组`[]`，打开时间选择器无法选择时间。日期范围下均存在这种`bug`，故范围选择方式统一默认值`null`，表单内部重置重写一次。

```javascript
<el-form ref="form" :model="form">
  <el-form-item prop="times" label="时间范围">
    <el-time-picker v-model="form.times" value-format="HH-mm-ss" is-range></el-time-picker>
  </el-form-item>
</el-form>

<el-button @click="$refs.form.resetFields()">重置</el-button>

export default {
  data() {
    return {
      form: {
        times: null,
      },
    }
  },
}

// components -> ButtonView -> GenerateForm.vue
reset() {
  this.$refs.modelsForm.resetFields()
  this.resetTimePicker()
},

resetTimePicker() {
  for (const key of Object.keys(this.models)) {
    if (
      Array.isArray(this.models[key]) &&
      this.models[key].length === 1 &&
      this.models[key][0] === null
    ) {
      this.models[key] = null
    }
  }
},
```

### 校验规则

&emsp;&emsp;校验规则大多数涉及必填，只有单行文本和多行文本较为特殊。单行文本支持验证器验证和正则表达式验证，多行文本支持正则表达式验证。必填字段星号可由组件传值`el-fom-item` `required`属性控制。

```javascript
<el-form-item :required="element.options.required">...</el-form-item>
```

&emsp;&emsp;;`element-ui` `el-form`表单验证方式包括四种，必填方式最为常用，指定`required` `true`开启必填，正则表达式方式`pattern`可直接指定正则表达式，验证器方式包括字符串`string`、数字`number`、整数`interger`、浮点数`float`、`URL`类型、`16`进制`hex`、电子邮箱`email`等，自定义验证方式最灵活，可定制化设置验证规则，详细参考 [element-ui](https://element.eleme.cn/2.14/#/zh-CN/component/form)。

```javascript
rules: {
  name: [{ required: true, message: '请输入姓名' }],
  phone: [{ pattern: /^1[3456789]d{9}$/, message: '格式有误' }],
  email: [{ type: 'email', message: '格式有误' }],
  psw: [{ validator: validatePsw }],
},
```

&emsp;&emsp;表单初始化时不仅创建`models`、`slots`，验证规则`rules`也要创建。所有属性均会添加必填方式，但是`required`为`false`不会开启必填。`isPattern`为正则验证方式，其中单行文本和多行文本独有，`new RegExp`实例化正则。

```javascript
// components -> ButtonView -> GenerateForm.vue
<el-form />

function handleSetModels() {
  const rules = {}
  ...
  getGridModel(this.data.list)

  this.rules = rules

  function getGridModel(list) {
    list.forEach(element => {
      if (element.type === 'grid') {
        ...
      } else {
        rules[element.model] = [
          {
            required: !!element.options.required,
            message: element.options.requiredMessage || `请输入${element.name}`,
          },
        ]

        if (element.options.isType) {
          rules[element.model].push({
            type: element.options.type,
            message: element.options.typeMessage || `${element.name}验证不匹配`,
          })
        }

        if (element.options.isPattern) {
          rules[element.model].push({
            pattern: new RegExp(element.options.pattern),
            message: element.options.patternMessage || `${element.name}格式不匹配`,
          })
        }
      }
    })
  }
}
```

&emsp;&emsp;验证器方式中数字、整数、浮点数较为特殊，若指定其中一种，表单验证是不会通过的，因为单行文本双向绑定值始终为字符串，不会为数字类型。解决方式指定需指定`el-input`为数字类型，且触发`change`事件需转换为数值。

```javascript
<common-view ...>
  <el-input
    v-if="element.options.isType && ['number', 'integer', 'float'].includes(element.options.type)"
    type="number"
    @input="input"
  />

  <el-input v-else @input="input" />
</common-view>

input(value) {
  const { type, isType } = this.element.options

  if (isType && ['number', 'integer', 'float'].includes(type) && value !== '') {
    value = Number(value)
  }

  this.$emit('change', value)
},
```

### 生成代码

&emsp;&emsp;生成代码部分需要根据表单`json`往固定模板填充数据，默认包括提交、重置按钮，组件传参`jsonData`为表单`json`数据，`editData`为表单初始值，`remoteOption`是级联选择器列表数据。

```javascript
// elements -> cascader -> view.vue
<el-cascader ... :options="remoteOption && remoteOption[element.options.remoteOption]" />
```

&emsp;&emsp;若组件使用了富文本编辑器，默认包含事件`editor-upload-image`及其对应处理函数。

```javascript
editorUploadImage({ model, blobInfo, success, failure }) {
  // success(图片地址) / failure(失败说明) 可异步调用
  // success('http://xxx.xxx.xxx/xxx/image-url.png')
  // failure('上传失败')
  success('data:image/jpeg;base64,' + blobInfo.base64())
}, 
```

&emsp;&emsp;插槽部分根据`slots`列表插入组件内部，默认包含插槽名和变量绑定方式。`editData`传入组件内部，`GenerateForm.vue`内部需要合并默认值和`editData`。

```javascript
this.models = Object.assign(models, deepClone(this.value))
```

### HTML 默认值

&emsp;&emsp;;`html`默认值最初放置的是多行文本框，现在引入`AceEditor`后需要调整。`AceEditor`内部修改值后需更新`html`默认值，通过`change`事件触发。

```javascript
// compoents -> AceEditor.vue
this.editor.session.on('change', delta => {
  this.$emit('change', this.getValue())
})

// elements -> html -> config.vue
<ace-editor ... @change="handelChange" />

handelChange(text) {
  this.data.options.defaultValue = text
},
```

&emsp;&emsp;若表单内包括多个`html`组件，切换组件发现`AceEditor`内部值并未发生改变。`html`字段属性始终是同一个`AceEditor`，所以值不会发生改变。内部需要监听`html`对象的改变，调用组件内部`setValue`方法赋值。元素拖入立即执行监听`hander`，默认对象非深度监听，但是不能开启深度监听，原因是因为组件内部`change`事件触发更新默认值时，开启深度监听后，`hander`会触发再次调用组件内`setValue`，`setValue`再次触发`change`，会造成循环调用页面卡死。即监听对象引用改变，不监听对象内容改变即可。

```javascript
data: {
  handler() {
    this.$nextTick(() => {
      this.$refs.htmlAceEditor.setValue(this.data.options.defaultValue)
    })
  },
  deep: false,
  immediate: true,
},
```

## 发布维护

### NPM 组件

&emsp;&emsp;为方便后期使用，可将项目发布为`npm`包。与`main.js`同级目录创建`index.js`，引入需导出的组件和样式。`Vue.use(cpn)`默认调用`cpn`上`install`方法注册组件，参数默认为`Vue`。

```javascript
// index.js
const components = [GenerateForm, MakingForm]

const install = Vue => {
  components.forEach(component => {
    Vue.component(component.name, component)
  })
}

export default {
  install,
}

// 引用方式
import DwFormMaking from 'dw-form-making'
Vue.use(DwFormMaking)
```

&emsp;&emsp;组件部分引入方式。

```javascript
// index.js
import GenerateForm from 'components/ButtonView/GenerateForm'
import MakingForm from './layout/index'

export { GenerateForm, MakingForm }

// 调用方式
import { GenerateForm, MakingForm } from 'dw-form-making'

Vue.component(GenerateForm.name, GenerateForm)
Vue.component(MakingForm.name, MakingForm)
```

&emsp;&emsp;新增`script`命令，`name`为构建名称，最后一个参数为入口文件。参数以及构建库输出文件详细参考 [vue-cli](https://cli.vuejs.org/zh/guide/build-targets.html#%E5%BA%93) 库。

```javascript
// package.json
"scripts": {
  ...
  "publish": "vue-cli-service build --target lib --name DwFormMaking ./src/index.js",
},
```

&emsp;&emsp;配置`package.json`，详细描述发布包所需字段。

- `name`：包名，名字是唯一的，可在`npm`官网查询是否重复
- `description`：描述，`npm`官网查询出包后的描述信息
- `version`：版本号，每次发布版本号不能和历史版本号相同
- `author`：作者
- `private`：是否私有，`false`公开才能发布到`npm`
- `keywords`：关键字，通常用于`npm`关键字搜索
- `main`：入口文件，指向编译后的包文件
- `files`：`npm`白名单，只有`files`中指定的文件或文件夹会被打包到项目中

&emsp;&emsp;配置完成后，运行`npm run publish`会生成相关的包文件，且默认位于`dist`目录下。

![](/app/form-making/dist.png)

&emsp;&emsp;申请`npm`官方账号后，运行`npm login`，输入用户名、密码和邮箱，注意密码输入后是不可见的，输入后回车请求登录到`npm`。

![](/app/form-making/email.png)

&emsp;&emsp;登录成功后控制台输出如下。

![](/app/form-making/logined.png)

&emsp;&emsp;紧接着再运行`npm publish`命令，将`package.json`中`files`属性指定的文件发布到`npm`。

![](/app/form-making/files.png)

&emsp;&emsp;控制台输出如下命令，即表示发布成功，后续邮箱中也会收到发布成功的邮件。

![](/app/form-making/publish.png)

&emsp;&emsp;现在就可以运行`npm i dw-form-making`下载刚才发布的包了，展开`node_modules`下`dw-form-making`文件夹，果然是将`files`指定的文件发布了。

![](/app/form-making/modules.png)

### Git 远程库维护

&emsp;&emsp;;`GitHub`新建仓库后，本地再关联远程仓库。

```javascript
git remote add origin https://github.com/username/repository.git
```

&emsp;&emsp;将本地`master`分支推送至远程仓库。

```javascript
git push origin master
```

### 在线预览

&emsp;&emsp;;`GitHub`提供了静态页面的预览功能，并默认展示分支下的`index.html`文件。

&emsp;&emsp;因此可以单独创建一个`page`分支。

```javascript
git branch page
```

&emsp;&emsp;然后运行`npm run build`，删除目录内除`lib`、`node_modules`、`.gitignore`外的所有文件，移动`lib`内文件到外层，最终根目录结构大致如下。

![](/app/form-making/dir.png)

&emsp;&emsp;暂存并提交`page`分支的修改，推送至远程仓库。

```javascript
git push origin page
```

&emsp;&emsp;假设上述都没有问题，那么将会在`GitHub`查看到如下分支结构。

![](/app/form-making/branch.png)

&emsp;&emsp;点击仓库内`Settings`按钮，找到侧边`Pages`项。

![](/app/form-making/pages.png)

&emsp;&emsp;选择`page`分支，`root`根目录，点击`Save`。

![](/app/form-making/save.png)

&emsp;&emsp;呐，你的预览页就已经发布到`https://xxx.github.io/dw-form-making/`了，点击试试吧。

![](/app/form-making/success.png)

## 后记

&emsp;&emsp;开源的表单设计器基础版本使用范围很小，设计器内部非常多的`bug`，最为基本的栅格也不支持。某天空闲突然对其源码感兴趣，大致梳理发现其业务逻辑繁杂，组件层级非常深，部分组件代码冗余，甚至单个组件内部代码接近`500`行，可读性和拓展性很差。于是参考其样式，直接重构了`js`部分。

&emsp;&emsp;最为基础的表单组件基本实现并可预览，较为复杂的栅格布局需要仔细梳理，理解了其中栅格的递归嵌套逻辑，很快就能实现。基于此为基础的自定义区域，也就是递归组件内的作用域插槽，最为耗时，由于是空闲时间做的工具，工作时间稍微有点想法会实现一个`demo`，考虑过`render`函数，也考虑过缩小组件层级，最终的插槽`v-for`也是某个时刻偶然想到的。项目之前包括选择树、代码编辑器，仔细考虑后决定删除。最大原因还是为了缩小项目体积，其中组件更多不过是完善，差异也只是大同小异，不同基本组件都涉及，定制组件自定义引入，简单而不简单。

&emsp;&emsp;项目整体难度也不高，此笔记仅是记录重构过程的部分思路。重构初一方面由于兴趣使然，另一方面对其内部逻辑和`npm`包的发布新奇。整体下来可以巩固`element-ui`表单组件的使用，部分其它组件也有涉及，对于页面布局、类名的设定、代码规范都是一次练习。其中递归组件、作用域插槽、组件循环引用较复杂，仔细梳理也能明白其中原理。代码管理方面也可巩固`Git`基本命令的使用、多远程库的管理。

&emsp;&emsp;工具可在线预览或克隆，之前`Git`提交次数过多导致版本库较大，已重新创建了仓库。源代码在`GitHub`开源，工具名 [dw-form-making](https://dongwei1125.github.io/dw-form-making/)。

## 更新日志

### 2020/12/11 17:18

&emsp;&emsp;可能你也注意到了，代码中用到`store`的地方都是引入再使用，为什么不放在`vue`原型对象`prototype`上，代码中将最大程度还原`vuex`的调用方式。

```javascript
import store from './store'
Vue.prototype.$store = store
```

&emsp;&emsp;但是发布为 [vue](https://cn.vuejs.org/v2/guide/plugins.html) 插件，`store`放在`vue`的原型上不是那么理想，首先来看看组件`install`方法，第一个参数是`Vue`构造器，也就是执行`Vue.use()`时的`Vue`，倘若像上述给予`Vue`原型上添加`$store`，有一个很糟糕的情况，则是`$store`关键字被占用了，页面只有单独定义其他关键字，否则`$store`直接被覆盖掉。更糟糕的情况则是引用`vuex`状态管理的项目，由于`vuex`在`beforeCreate`首行注入`$store`，若同时集成表单工具，可能会导致工具崩溃，出现意料之外的`bug`。

&emsp;&emsp;此次更新修复了栅格复制`key`值的`bug`，删除掉组件内部分未引用的变量。并且在工具内控制台输出了彩蛋（[试一试](https://dongwei1125.github.io/dw-form-making/)），不包括`npm`组件。

### 2022/03/05 17:35

&emsp;&emsp;虽然是个人维护的小项目，代码风格大多数都是统一的，但是也会存在很多不合理的风格。因此根据 [vscode 插件与 npm 包，保存时自动修复代码格式错误](../js/eslint-prettier.md) 一文，引入了`eslint`和`prettier`来规范和格式化项目的代码。组件内`props`传值类型和默认值也极为不合理，通过`eslint`检测已经全部修复。

&emsp;&emsp;另外在仓库下新增了`deploy.sh`脚本，主要用来快捷部署`Pages`静态页面。

&emsp;&emsp;由于`GitHub`的仓库经常访问缓慢或者无响应，因此利用`Gitee`镜像了此仓库（[看一看](https://gitee.com/dongwei1125/dw-form-making)）。

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125) / [Gitee](https://gitee.com/dongwei1125)、[GitHub Pages](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~
