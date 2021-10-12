# vue 购物 WebApp

![](/app/web-app/banner.jpg)

## 项目概述

### 简介

&emsp;&emsp;项目名 [蘑菇购](https://github.com/dongwei1125/mogugou)，与一般购物`WebApp`类似，包括首页、分类、购物车、个人中心、详情。

&emsp;&emsp;项目基于`vue`、`vue-router`、`vue-cli3`，`api`请求相关部分采用`axios`，数据部分并非来自服务器，而是本地基于`express`启动相关数据服务。原因一是网络接口更新快、数据变化大、依赖性高，二是项目本身不大，基于项目启动本机服务灵活性较高，代码安装依赖即可运行，故最终考虑`express`爬取相关接口数据保存本地。

&emsp;&emsp;状态管理未使用`vuex`，仅仅是少部分使用`vuex`功能显得多余，项目大才完全有必要。基于`vue.observable`能实现部分`vuex`功能。图片加载部分异步更新`DOM`采用事件总线进行组件通讯。

&emsp;&emsp;项目第三方开源组件包括`better-scroll`滚动插件、`vue-awesome-swiper`和`swiper`轮播组件、`normalize.css`初始化样式、`vue-lazyload`懒加载、移动端`click300ms`延时采用`fastclick`。

&emsp;&emsp;项目难度不高，适合新手练手，此篇仅是练习组件化封装和目录配置的相关记录。

### 预览地址

&emsp;&emsp;;[蘑菇购](http://dongwei1125.github.io/mogugou)

### 示例图

![](/app/web-app/index.gif)

![](/app/web-app/detail.gif)

![](/app/web-app/menu.gif)

### 文件目录配置

```javascript
├── public
│   ├── favicon.ico
│   ├── index.html
├── server
│   ├── static
│   │   ├── image
│   ├── app.js
│   ├── db.js
│   ├── router.js
├── src
│   ├── api
│   │   ├── home.js
│   │   ├── category.js
│   ├── assets
│   │   ├── iconfont
│   │   ├── img
│   │   ├── placeholder.png
│   ├── components
│   │   ├── BetterScroll
│   │   ├── CheckButton
│   │   ├── IndexBar
│   │   ├── Message
│   │   │   ├── Message.vue
│   │   │   ├── index.js
│   │   ├── Navbar
│   │   ├── Swiper
│   │   ├── SwiperSlide
│   │   ├── Tabbar
│   │   ├── TabbarItem
│   ├── layout
│   │   ├── Tabbar
│   ├── router
│   │   ├── index.js
│   │   ├── routes.js
│   ├── store
│   │   ├── index.js
│   │   ├── vuex.js
│   ├── styles
│   │   ├── index.less
│   ├── utils
│   │   ├── index.js
│   │   ├── request.js
│   ├── views
│   │   ├── home
│   │   ├── category
│   │   ├── cart
│   │   ├── profile
│   │   ├── detail
│   ├── App.vue
│   ├── main.js
│   ├── .env.development
│   ├── package.json
│   ├── README.md
│   ├── vue.config.js
```

## 初始化

### 脚手架初始化

&emsp;&emsp;初始空脚手架`vue-cli3`仅配置`Babel`、`Router`、`CSS Pre-processors`（`less`），删除其余业务不相关部分，文件夹部分通过需求逐步新建。

### Tabbar 组件、路由

&emsp;&emsp;项目目前正常运行为空白，先搭建路由相关部分，抽离`routes`静态数据，同级目录下新增`routes.js`导出静态数据，`index.js`引入静态数据。

```javascript
// router -> index.js
import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router

// router -> routes.js
export default [{
        path: '/',
        redirect: '/home'
    },
    {
        path: '/home',
        name: 'home',
        component: () => import('views/home')
    }
    ...
]
```

&emsp;&emsp;项目启动，会发生路由路径加载错误，需要配置文件夹别名，空脚手架不含`vue.config.js`，需要手动新增。路径`src/views`修改别名`views`，其余别名后续会用到，全部配置。

```javascript
// vue.config.js
const path = require('path')

function resolve(dir) {
    return path.join(__dirname, dir)
}

module.exports = {
    chainWebpack: (config) => {
        config.resolve.alias
            .set('@', resolve('src'))
            .set('views', resolve('src/views'))
            ...
    }
}
```

&emsp;&emsp;文件夹别名配置后，懒加载路径下并没有文件。`views`新增`home`文件夹，其下新增`index.vue`，其余文件同理，重启运行。

&emsp;&emsp;此时项目依旧空白，但是`home`下`index.vue`已被重定向，接下来封装`Tabbar`，`Tabbar`较为公共，`components`下新建`Tabbar`、`TabbarItem`，文件夹下均新增`index.vue`。`Tabbar`一般高度`49px`最为舒适，同时定位屏幕底部，层级高于其他组件。`TabbarItem`内部引入`router-link`，组件接收参数参考 [vant-ui](https://vant-contrib.gitee.io/vant/#/zh-CN/tabbar) 并做了部分修改，通过当前`routes.path`参数和计算属性配置高亮。

```javascript
// Tabbar -> index.vue
<div class="tabbar">
  <slot />
</div>

// TabbarItem -> index.vue
<div class="tabbar-item">
    <router-link :to="to" tag="div">
      <div
        class="tabbar-item-icon"
        :style="{ color: to === path ? activeColor : inactiveColor }"
      >
        <slot name="icon" />
      </div>
      <div
        class="tabbar-item-text"
        :style="{ color: to === path ? activeColor : inactiveColor }"
      >
        <slot name="text" />
      </div>
    </router-link>
</div>

export default {
  props: {
    to: String,
    activeColor: String,
    inactiveColor: String
  },
  computed: {
    path() {
      return this.$route.path
    }
  }
}
```

&emsp;&emsp;公共组件`Tabbar`封装完成，项目相关`Tabbar`还未封装及引用。由于项目相关`Tabbar`有关于项目页面布局。故`src`下新增`layout`文件夹，相关布局组件不会太多，不用文件夹下再放`index.vue`形式。

```javascript
// layout -> Tabbar.vue
<m-tabbar>
      <m-tabbar-item to="/home" active-color="#ff8198" inactive-color="#555555">
        <i slot="icon" class="iconfont icon-home"></i>
        <span slot="text">首页</span>
      </m-tabbar-item>
      ...
</m-tabbar>

import Tabbar from "components/Tabbar"
import TabbarItem from "components/TabbarItem"

export default {
  components: {
    MTabbar: Tabbar,
    MTabbarItem: TabbarItem
}
```

&emsp;&emsp;图标采用 [iconfont](https://www.iconfont.cn/)，官网选择合适的`Tabbar`图标，下载压缩包解压。`assets`文件夹下新建`iconfont`文件夹，引入解压的全部文件。其中`demo_index.html`关于字体图标使用方式做了详细阐述，`iconfont.css`需要手动引入，`iconfont`也是一种字体，最终归结为`css`样式。`src`下新建`styles`文件夹，创建`index.less`，`index.less`放置公共初始化样式，`main.js`最终引入`index.less`。

```javascript
├── iconfont
│   ├── demo_index.html
│   ├── demo.css
│   ├── iconfont.css
...

// index.less
@import '~assets/iconfont/iconfont.css'

// main.js
import 'styles/index.less'
```

&emsp;&emsp;;`Tabbar`业务组件封装完成，`App.vue`引入，项目运行下`Tabbar`展示屏幕底部，点击`Tabbar`发生路由跳转和`URL`更新。

```javascript
// App.vue
<div id="app">
  <tabbar />
  <router-view />
</div>

import Tabbar from "layout/Tabbar"

export default {
  components: { Tabbar }
}
```

### 样式、页面标题、图标初始化

&emsp;&emsp;路由重定向至`home`页面，发现`body`存在`margin`，安装`normalize.css`，`mian.js`引入。

```javascript
// 安装
cnpm i normalize.css --save

// main.js
import 'normalize.css'
```

&emsp;&emsp;;`styles`文件夹下`index.less`，初始化`html`、`body`、`#app`高度，删除`App.vue`相关样式。

```javascript
html,
body,
#app {
    height: 100%;
}
```

&emsp;&emsp;路由添加导航守卫`router.beforeEach`，用于初始化页面标题，但是目标路由`to`并不含有`meta.title`，修改`routes.js`，其余同理，正确运行页面标题切换。替换`public`下`favicon.ico`，项目刷新显示图标。

```javascript
// router -> index.js
router.beforeEach((to, from, next) => {
  document.title = to.meta.title
  next()
})

// router -> routes.js
{
  path: '/home',
  name: 'home',
  meta: {
     title: '首页'
  },
  component: () => import('views/home')
},
```

### NavBar

&emsp;&emsp;;`NavBar`也是一般较通用组件，`components`新建`NavBar`，组件开放插槽，一般高度`44px`最为舒适，路由页面、详情均使用，组件传值`background-color`。`home`页引入，页面引入组件顺序遵循引入公共组件、定制组件、公共`js`、定制`js`。

## 数据服务

### Express

&emsp;&emsp;项目目前可实现路由跳转，相关`api`以及数据还未准备。网络接口常更新、数据不稳定，采用`express`、`superagent`爬取保存接口数据，爬虫`crawler`参考其他文章。大致拆分项目需要用到的后端接口，首页轮播图、特色、推荐、详情、列表、分类等，项目新建`serve`文件夹。`image`保存数据图片。

```javascript
├── serve
│   ├── static
│   │   ├── image
│   ├── app.js
│   ├── db.js
│   ├── router.js
```

&emsp;&emsp;;`app.js`启动数据服务，开放静态`static`文件夹，映射`/static`到`serve/static`。

```javascript
app.use("/static/", express.static("./serve/static/"))
```

&emsp;&emsp;;`db.js`本地数据库，`baseURL`为本机局域网`ip`，便于移动端访问本机数据，也方便调试。项目之前使用`ipconfig`手动输入的方式，这种方式不免显得繁琐，数据服务一启动便与项目没有实际关联性，没有必要再去修改一次`ip`地址。故使用`os`模块动态获取本机局域网`ip`，当然此种方式如若`PC`端访问图片失败，大概率是动态获取`ip`部分有误，注释相关代码，通过上一种方式修改`ip`即可。

```javascript
const os = require("os")

const interfaces = os.networkInterfaces()

const port = 3000

var baseURL = "http://127.0.0.1:3000"

for (const key of Object.keys(interfaces)) {
  const el = interfaces[key].find(el => el.family === "IPv4" && el.address !== "127.0.0.1")

  el && (baseURL = `http://${el.address}:${port}`)
}
```

&emsp;&emsp;;`router.js`后端路由部分，由于业务相关接口不是特别多，不用`router`再去分级，也不存在`post`相关请求，不需要额外安装`body-parser`。

```javascript
const db = require('./db')

router.get('/api/getBann', function (req, res) {
    res.send({
        message: "success",
        result: db.banner,
        status: "0",
        success: true
    })
})
...
```

&emsp;&emsp;;`package.json`配置快速启动命令。

```javascript
// 安装
cnpm i nodemon --save-dev

scripts: {
    serve: "nodemon serve/app.js"
}
```

### axios、api 封装

&emsp;&emsp;项目使用`axios`第三方插件，安装步骤参考 [axios](http://www.axios-js.com/)。

```javascript
├── src
│   ├── api
│   │   ├── home.js
│   ├── utils
│   │   ├── request.js
├── .env.development
├── vue.config.js
```

&emsp;&emsp;;`request.js`内`baseURL`独立出来，使用环境变量，放置`utils`工具类函数文件夹下。

```javascript
const server = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 5000,
})
```

&emsp;&emsp;开发与产品`URL`一般不一致，通常是配置环境变量，根目录创建`.env.development`文件，后期需要添加`.env.production`配置产品环境变量。

```javascript
VUE_APP_BASE_API = "/api"
```

&emsp;&emsp;项目下尝试访问`express`请求通常情况会发生跨域报错，服务端可设置跨域部分，或者项目设置代理。

```javascript
// vue.config.js
devServer: {
  port: 8000,
  proxy: {
     [process.env.VUE_APP_BASE_API]: {
         target: 'http://127.0.0.1:3000/',
         ws: false,
         changeOrigin: true,
         pathRewrite: {
             ['^' + process.env.VUE_APP_BASE_API]: ''
        }
     }
  },
}
```

&emsp;&emsp;引入`request.js`，设置请求`url`、请求方式，页面引用。

```javascript
// api.js => home.js
import request from 'utils/request'

export function getBann() {
    return request({
        url: '/api/getBann',
        method: 'get'
    })
}

// 引用页面
import { getBann } from "api/home"

getBann()
  .then((res) => {...})
  .catch((err) => {...})
```

## BetterScroll、vue-awesome-swiper

&emsp;&emsp;项目涉及第三方组件主要是`BetterScroll`、`vue-awesome-swiper`，`BetterScroll`也是公共组件，`components`新建`BetterScroll`文件夹，详细步骤参考 [better-scroll](https://github.com/ustbhuangyi/better-scroll/blob/master/README_zh-CN.md)。`swiper`也是较为公共的组件，`components`新建`Swiper`、`SwiperSlide`，`vue-awesome-swiper`版本造成的坑比较多，主要由于`vue-awesome-swiper`与`swiper`的版本不适应造成，建议使用`4.1.1`和`5.2.0`，详细步骤参考 [vue-awesome-swiper](https://github.com/surmon-china/vue-awesome-swiper)。

## 页面

### 首页

&emsp;&emsp;目前基础架子基本搭建完成，`vuex`状态管理部分暂不考虑，实际用到的时候自然带入。首页组件已含有`NavBar`，调整首页目录结构，组件命名尽量语义化，后期维护非常方便。

```javascript
├── home
│   ├── index.vue
│   ├── components
│   │   ├── RecommendView.vue
│   │   ├── FeatureView.vue
│   │   ├── CardList.vue
│   │   ├── CardListItem.vue
```

&emsp;&emsp;首页组件树结构，浏览器安装`devtools`工具非常直观。

```javascript
▼<Home>
    <NavBar>
    ▼<BetterScroll>
         ▼<Swiper>
             <SwiperSlide>
         <RecommendView>
         <FeatureView>
         <IndexBar>
        ▼<CardList>
            <CardListItem>
```

&emsp;&emsp;;`NavBar`默认`fiexed`定位屏幕顶部，会导致遮住`better-scroll`，`home`使用伪元素`before`规避。且`better-scroll`外层`wrapper`需要指定高度，尽量加上相对定位。

```javascript
// styles -> index.less
.m-home::before{
    content: '';
    display: block;
    height: 44px;
    width: 100%;
}

// home -> index.vue
.scroll {
  height: calc(100vh - 93px);
  overflow: hidden;
  position: relative;
}
```

&emsp;&emsp;轮播图获取等数据接口，页面调用都需要`api`文件夹文件声明接口再引入。

```javascript
// api -> home.js
export function getRecom() {
    return request(...)
}

// home -> index.vue
import { getBann } from "api/home"
```

&emsp;&emsp;;`IndexBar`也是公共组件，`components`新建`IndexBar`，组件参数传递数组，存在高亮切换和点击事件的抛出，同时含默认高亮，则将`IndexBar`封装`v-model`形式。`props`增加组件可复用性，不仅仅只依赖于`data`内数据`label-value`对形式，传递`props`可依赖多种形式。`model`、`props.data`是封装自定义组件`v-model`必备，具体步骤参考官方 [v-model](https://cn.vuejs.org/v2/guide/components-custom-events.html#%E8%87%AA%E5%AE%9A%E4%B9%89%E7%BB%84%E4%BB%B6%E7%9A%84-v-model)，`index-bar-item`点击调用`change`，实现`v-model`。

```javascript
// IndexBar -> index.vue
<div
  class="index-bar-item"
  :class="{ active: value === item[props.value] }"
  @click="itemClick(item)"
  v-for="item in data"
  :key="item[props.value]"
>...</div>

export default {
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    value: {},
    props: {
      type: Object,
      default: () => ({
        label: "label",
        value: "value",
      }),
    },
  },
  model: {
    value: "value",
    event: "change",
  },
  methods: {
    itemClick(item) {
      item[this.props.value] !== this.value &&
        this.$emit("change", item[this.props.value])
    },
  }
}

// home -> index.vue
<index-bar
  :data="indexBars"
  v-model="currentBar"
  @change="onChange"
/>

data:{
    indexBars: [
        {
          label: "流行",
          value: "0"
        }
        ...
    ],
    currentBar: "0"
}
```

&emsp;&emsp;列表数据接口，传递参数包括点击`currentType`、`pageNum`、`pageSize`。图片异步加载必然导致`better-scroll`高度计算失误，每张图片加载完毕都要重新计算高度才合理，故`CardListItem`内图片`load`完毕需要抛出给首页，再调用`scroll`组件内`refresh`方法。首页与`CardListItem`组件之间的关系薄弱，或者说没有关系，组件间事件通信可采用`EventBus`事件总线的方式。

```javascript
// mian.js
Vue.prototype.$bus = new Vue()

// CardListItem 发出
onLoad(){
  this.$bus.$emit('imageLoad')
}

// home -> index.vue 监听
this.$bus.$on("imageLoad", () => {
   this.$refs.scroll.refresh()
})
```

&emsp;&emsp;但是对于图片较多的列表，会导致调用`refresh`方法频繁，需要添加防抖函数。`utils`下`index.js`，`timer`作为了闭包函数`debounce`的私有变量，首页引入函数`debounce`。

```javascript
export function debounce(func, delay = 20) {
  var timer = null
  return function(...arg) {
    if (timer) clearTimeout(timer)

    timer = setTimeout(() => {
      func.apply(this, arg)
    }, delay)
  }
}
```

&emsp;&emsp;当组件`scroll`实例完全创建完毕才有必要生成防抖函数，实例未创建完毕`$ref.scroll.refresh`不存在，生成的防抖函数实际也不生效，短路运算`&&`更加保证`refresh`非函数则不执行。如此`fresh`就是一个保存有私有变量`timer`的防抖函数，图片加载小于`20ms`只执行最后一次。

```javascript
// home -> index.vue
<scroll @load='onLoad'>

onLoad() {
   this.refresh = debounce(this.$refs.scroll.refresh, 20)
}

mounted() {
    this.$bus.$on("imageLoad", () => {
      this.refresh && this.refresh()
    })
}
```

&emsp;&emsp;;`indexBar`吸顶，通过使`better-scroll`下的`InddexBar` `fixed`定位不可取，`better-scroll`使用`translate`会导致内部定位元素非理想状态，解决办法最好是`NavBar`同级再添加组件`IndexBar` `fixed`定位，`scroll`未到吸顶距离隐藏，吸顶距离则显示。`showTop`用于返回顶部，滚动距离高于一屏则显示返回顶部按钮。

```javascript
// home -> index.vue
scroll({ y }) {
  this.$nextTick(() => {
    this.showSticky =
    this.$refs.indexBar && -y > this.$refs.indexBar.$el.offsetTop
  })

  this.showTop = -y > document.body.clientHeight
}
```

&emsp;&emsp;上拉加载、下拉刷新、`IndexBar`切换，下拉重新调用接口，上拉当前`pageNum++`，再获取数据，`list`数据使用`concat`拼接，或者使用`push(...array)`方式，`indexBar`切换重新获取数据，`scroll`滚动至`IndexBar`位置。

```javascript
this.$nextTick(() => {
  this.showSticky &&
    this.$refs.scroll.scrollTo(0, -this.$refs.indexBar.$el.offsetTop, 0)
})
```

&emsp;&emsp;首页需要`keep-active`缓存，保存页面状态。

```javascript
// App.vue
<keep-alive>
  <router-view />
</keep-alive>
```

### 详情

&emsp;&emsp;路由`routes.js`新增详情路由。

```javascript
// router -> routes.js
{
     path: '/detail/:id',
     name: 'detail',
     meta: {
         title: '详情'
     },
     component: () => import('views/detail')
}

// home -> index.vue
this.$router.push({ path: `/detail/${id}` })
```

&emsp;&emsp;目录结构。

```javascript
├── Detail
│   ├── index.vue
│   ├── components
│   │   ├── GoodsInfo.vue
│   │   ├── StoreInfo.vue
│   │   ├── ClothList.vue
│   │   ├── ParamsInfo.vue
│   │   ├── CommentList.vue
│   │   ├── RecommendList.vue
│   │   ├── NavBar.vue
│   │   ├── SubmitBar.vue
```

&emsp;&emsp;组件树结构。

```javascript
▼<Detail>
    <NavBar>
    ▼<BetterScroll>
        ▼<Swiper>
            <SwiperSlide>
        <GoodsInfo>
        <StoreInfo>
        <ClothList>
        <ParamsInfo>
       <CommentList>
       <RecommendList>
    <SubmitBar>
```

&emsp;&emsp;组件大致同首页一致，`NavBar`差别较大，`NavBar`对公共组件的`NavBar`进行封装，组件自定义`v-model`，抛出`change`事件，点击实现类似锚点的功能，同时伴随高亮。大致原理点击获取元素的`value`值，`value`值查询`navbars`对应的`refName`，获取对应组件的`offsetTop`实现锚点。

```javascript
navbars: [
  {
    label: "商品",
    value: "0",
    refName: "swiper"
  }
]

this.$refs.scroll.scrollTo(0, -this.$refs[refName].$el.offsetTop)
```

&emsp;&emsp;;`scroll`滚动过程中高亮伴随切换，在`scroll`事件中获取滚动距离，遍历`navbars`设置`currentBar`的值，同时`v-model`双向绑定`currentBar`，从而实现滚动高亮。

```javascript
this.navbars.forEach((el) => {
  if (this.$refs[el.refName] && -y >= this.$refs[el.refName].$el.offsetTop) {
    this.currentBar = el.value
  }
})
```

&emsp;&emsp;添加购物车需要`vuex`状态管理，需要用到的部分实质只有购物车的商品列表，故使用`vuex`显得大材小用，况且不用`vuex`也能实现迷你版状态管理。为了保留与`vuex`一致性，`store`下新增`index.js`、`vuex.js`，`vuex.js`声明`Store`类，构造函数默认观察`state`数据。

```javascript
import Vue from "vue"

class Store {
  constructor({ state, mutations }) {
    Object.assign(this, {
      state: Vue.observable(state || {}),
      mutations,
    })
  }
  commit(type, arg) {
    this.mutations[type](this.state, arg)
  }
}

export default { Store }
```

&emsp;&emsp;;`index.js`与一般状态管理基本一致。

```javascript
import Vuex from './vuex'

export default new Vuex.Store({
    state: {
        goods: []
    },
    mutations: {
        ADD_GOODS(state, arg) {...},
        ALL_CHECKED(state, val) {...}
    }
})
```

&emsp;&emsp;页面实现`this.$store`方式调用还要将导出实例放置原型上，至此迷你版`vuex`调用方式与`vuex`趋于一致，`actions`、`gutters`暂时用不上。

```javascript
import store from "./store"

Vue.prototype.$store = store
```

&emsp;&emsp;添加购物车按钮点击，调用`mutations`方法。

```javascript
this.$store.commit("ADD_GOODS", {...})
```

&emsp;&emsp;详情页面点击不同首页商品，只会请求同一商品，原因`keep-active`缓存了当前详情页，不会再次触发`created`，调整`App.vue`。

```javascript
<keep-alive exclude="detail">
```

&emsp;&emsp;此时详情页`Tabbar`还存在，类比`keep-active`，组件传值`exclude`。

```javascript
// layout -> Tabbar.vue
export default {
  props: {
    exclude: String,
  },
  computed: {
    show() {
      const excludes = this.exclude.split(",")

      return !excludes.includes(this.$route.name)
    }
  }
}

// App.vue
<tabbar exclude="detail" />
```

&emsp;&emsp;;`Message`消息提示组件封装，根据开源组件库 [element-ui](https://element.eleme.cn/#/zh-CN)，封装一个简单版的`Message`，`components`下新建`Message`，新建`main.vue`、`index.js`，`main.vue`内部`mounted`之后，固定延时关闭`Message`，同时执行关闭回调。

```javascript
<transition name="fade" v-if="visible">
  <div class="message">{{ message }}</div>
</transition>

export default {
  data() {
    return {
      visible: true,
      message: "",
      duration: 2000,
      onClose: null
    }
  },
  mounted() {
    setTimeout(() => {
      this.visible = false

      this.onClose && this.onClose()
    }, this.duration)
  }
}
```

&emsp;&emsp;;`index.js`内部引入`Vue`，同时引入组件`Message`，创建组件构造器，通过`new`构造器创建组件实例，`$mount`挂载当前实例同时渲染为真实`DOM`，再追加至`body`内部，对外抛出`install`方法。

```javascript
import Vue from "vue"

import main from "./main.vue"

const MessageConstructor = Vue.extend(main)

const Message = function(options) {
  if (typeof options === "string") {
    options = {
      message: options
    }
  }

  const instance = new MessageConstructor({
    data: options
  })

  instance.$mount()

  document.body.appendChild(instance.$el)
}

export default {
  install() {
    Vue.prototype.$message = Message
  }
}
```

&emsp;&emsp;;`main.js`引入组件，`Vue.use()`调用内部`install`方法，`Message`被置于`Vue.prototype`上。

```javascript
// mian.js
import Message from "components/Message"
Vue.use(Message)

// detail -> index.vue
this.$message("商品添加成功!")
```

### 购物车

&emsp;&emsp;购物车页面商品多，存在滚动情况，使用`better-scroll`，页面列表依赖`store`内`state`。

```javascript
computed: {
   data() {
      return this.$store.state.goods
   }
}
```

&emsp;&emsp;目录结构。

```javascript
├── cart
│   ├── index.vue
│   ├── components
│   │   ├── GoodsList.vue
│   │   ├── TotalBar.vue
```

&emsp;&emsp;组件树结构。

```javascript
▼<Cart>
    <NavBar>
    ▼<BetterScroll>
        ▼<GoodsList>
            <CheckButton>
    ▼<TotalBar>
        <CheckButton>
```

&emsp;&emsp;;`CheckButton`即公共选中按钮，`components`下新建`CheckButton`，内部实现`v-model`，内部通过切换背景色实现选中和取消，且内部点击事件阻止冒泡。可能存在当外部调用`CheckButton`时，带有`CheckButton`的整个卡片点击则`CheckButton`取消或者选中，此时修改`v-model`绑定值即可。但是当点击`CheckButton`时，由于本身`CheckButton`被点击时会切换，加上事件冒泡，外层卡片也会触发点击事件，再次修改`v-model`值，出现预期之外的结果，最好的办法就是阻止事件的冒泡。

```javascript
@click.stop="$emit('change', !value)"
```

&emsp;&emsp;;`TotalBar`内部计算属性依赖`store`内`state`，根据`state`商品数量动态计算价格、总量。全选按钮点击商品全部选中，再次点击全部取消。全选点击则调用`store`下`mutations`遍历修改商品`checked`属性。但是点击`CheckButton`，由于内部冒泡的阻止，触发不了外部点击事件。此时伪元素`after`就又能派上用场了，定位一个空盒子在全选按钮上，点击事件的触发元素一直是这个`after`伪元素。

```javascript
.check {
    position: relative;

    &::after {
      content: "";
      display: block;
      position: absolute;
      left: 0;
      right: 0;
     top: 0;
     bottom: 0;
   }
}
```

&emsp;&emsp;由于`keep-active`的缓存机制，导致列表无法下拉，主要由于初始情况`scroll`计算高度错误导致。解决办法一，添加`activated`事件，页面活动时，调用组件内部`refresh`事件更新高度。

```javascript
activated(){
    this.$nextTick(()=>{
      this.$refs.scroll.refresh()
    })
}
```

&emsp;&emsp;解决办法二，`keep-active`不缓存`cart`页面。

```javascript
<keep-alive exclude="detail,cart">
```

### 分类

&emsp;&emsp;目录结构。

```javascript
├── category
│   ├── index.vue
│   ├── components
│   │   ├── CatesList.vue
```

&emsp;&emsp;组件树结构。

```javascript
▼<Category>
    <NavBar>
    <CatesList>
```

### 个人信息

&emsp;&emsp;目录结构。

```javascript
├── profile
│   ├── index.vue
│   ├── components
│   │   ├── UserInfo.vue
│   │   ├── CountInfo.vue
│   │   ├── OptionList.vue
```

&emsp;&emsp;组件树结构。

```javascript
▼<Profile>
    <NavBar>
    <UserInfo>
    <CountInfo>
    <OptionList>
```

## 优化部分

### 图片懒加载

&emsp;&emsp;首页商品懒加载，`assets`文件夹添加懒加载填充图。

```javascript
// 安装
cnpm i vue-lazyload --save

// main.js
import VueLazyload from "vue-lazyload"
Vue.use(VueLazyload, {
  loading: require('assets/placeholder.png')
})
```

### 移动端点击

&emsp;&emsp;移动端`300ms`点击。

```javascript
// 安装
cnpm i fastclick --save

// main.js
import FastClick from 'fastclick'
FastClick.attach(document.body)
```

### px 转换 vw

&emsp;&emsp;;`px`转`vw`视口单位，相关插件 [postcss-px-to-viewport](https://github.com/evrone/postcss-px-to-viewport/blob/master/README_CN.md)，根目录需要新建`postcss.config.js`配置文件，相关配置参数官方文档很详尽了，唯一需要注意的就是`px`单位避免存在于行内/内联样式，`minPixelValue`最小转换数值一般为`1`，可能有部分边框需要`1px`显示。

```javascript
// 安装
cnpm install postcss-px-to-viewport --save-dev

// postcss.config.js
module.exports = {
    plugins: {
        'postcss-px-to-viewport': {
            unitToConvert: 'px',
            viewportWidth: 375,
            unitPrecision: 6,
            propList: ['*'],
            viewportUnit: 'vw',
            fontViewportUnit: 'vw',
            selectorBlackList: [],
            minPixelValue: 1,
            replace: true,
            exclude: undefined,
            include: undefined,
            landscapeUnit: 'vw'
        }
    }
}
```

## windows nginx 部署

&emsp;&emsp;;[nginx](http://nginx.org/en/download.html) 选择`Stable version`稳定版`nginx/Windows-x.xx.x`，下载压缩包解压，根目录执行命令启动`nginx`。

```javascript
// 查看 nginx 版本号
nginx -v

// 启动
start nginx

// 强制停止或关闭 nginx
nginx -s stop

// 正常停止或关闭 nginx （处理完所有请求后再停止服务）
nginx -s quit

// 修改配置后重新加载
nginx -s reload

// 测试配置文件是否正确
nginx -t
```

&emsp;&emsp;浏览器输入`http://localhost/`，正常访问为`Welcome to nginx!`，`nginx`默认访问`html/index.html`，可修改配置文件`conf/nginx.conf`更改默认路径，运行重新加载命令。

```javascript
├── dist
│   ├── index.html
│   ├── ...
├── html
│   ├── index.html
│   ├── 50x.html
...

location / {
   root   dist;
   index  index.html index.htm;
}
```

## 后记

&emsp;&emsp;项目基本思路均梳理大半，部分思路可能未提及，项目 [Github](https://github.com/dongwei1125/mogugou) 开放，可以克隆或者下载压缩包，仓库内存稍大，大约`464M`，压缩包下载`1`分钟左右，原因主要由于脱离网络接口，数据保存本地导致，详细情况开头已细致说明。整个项目非常适用新手练手，服务端数据服务只需要`npm run serve`即可开启。

&emsp;&emsp;由于`express`动态获取本机内网`ip`，所以完全可以手机访问`cli-service`启动的`Network`地址，实现手机浏览器也可预览的效果。

## 更新日志

### 20-11-13 10:31

&emsp;&emsp;图片存放项目中首次下载或克隆耗时太长，`express`也是获取本机局域网`ip`实现移动访问，项目显得比较冗余。倘若有一个图床，`express`负责返回不同图片地址，问题会得到根本程度的解决。于是利用`Github`，手动造一个图床，了解原理不用网上的`PicGo`也能实现。

&emsp;&emsp;实质就是开辟一个`Github`公开仓库，提交图片文件即可。仓库内部预览图片，点击原始数据获取图片原始`URL`，图片根目录一般是`https://github.com/用户名/仓库名/raw/master`，剩余部分则是图片在项目中的路径。

> 注意`Github`图床不太稳定，图片经常会挂掉，加速地址访问也会挂掉。项目内目前使用的是`Gitee`图床，相对会稳定很多。

&emsp;&emsp;删除掉原项目动态获取局域网`ip`，调整`baseURL`，`app.js`内静态文件关闭，删除`static`文件夹。图片详情推荐随机数生成可能存在相同情况优化。

### 20-11-30 22:00

&emsp;&emsp;项目有云服务器是可以实现访问并预览的，但是小项目练手没有必要，`github`开放了静态网页预览功能，可以调整部分代码实现。`ajax`部分去掉，`api`内不引入`request`工具函数，直接引入`serve`下`db.js`，合并`router.js`和`api`下函数。

&emsp;&emsp;;`vue.config.js`新增`publicPath`，由于静态网页预览`history`模式刷新报错`404`，`router` `model`删除`history`模式，使用默认`hash`模式，并提交在`noajax`分支。
