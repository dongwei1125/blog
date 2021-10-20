![](/js/vuepress-blog/banner.jpg)

## 前言

&emsp;&emsp;最近整理博客文章时，偶然想要把本地文章推送到`GitHub`上维护，毕竟看着很多次的`Git`提交记录和历史线，时间长了总会萌生再去提交几次的想法。

&emsp;&emsp;但是推送到`GitHub`后，想要便捷跳转到某篇文章，发现没有一个导航系统可以很好地链接到每篇文章，于是动手搭建一个依赖于`Vuepress`的博客，为了便于访问，再将其部署为`GitHub`的静态页面。

&emsp;&emsp;而此篇文章仅是记录`Vuepress`搭建博客的具体步骤，且仅对内部涉及到的`api`作解释，更为详细的部分可参考 [Vuepress](https://vuepress.vuejs.org/zh/) 官方文档。

## 在线预览

&emsp;&emsp;;[Don_GW](https://dongwei1125.github.io/)

## 初始化

&emsp;&emsp;创建项目文件夹`blog`，接着在文件夹内进行`npm`初始化，后面可统一在编辑器上细致修改各个属性值。

```javascript
npm init -y
```

> `-y`为`--yes`简写，表示对执行`npm init`时的询问统一返回`yes`，全部都采用默认答案。换言之即跳过了`npm init`时繁琐的连续敲回车过程

&emsp;&emsp;局部安装`Vuepress`，全局安装一般不推荐，项目还是维护自身的`package`更好。

```javascript
npm install -D vuepress
```

&emsp;&emsp;;`package.json`中添加`scripts`命令。

```javascript
{
  ...
  "scripts": {
    "dev": "vuepress dev docs",
    "build": "vuepress build docs"
  }
}
```

&emsp;&emsp;创建`docs`文件夹，并接着创建`README.md`文档，填入部分内容。

```javascript
# Hello VuePress
```

&emsp;&emsp;此时文件夹结构如下。

```javascript
├── docs
│   ├── README.md
├── node_modules
├── package.json
```

&emsp;&emsp;运行`npm run dev`命令，浏览器访问链接可查看到`README.md`。

![](/js/vuepress-blog/setup.png)

## 页面

&emsp;&emsp;来看一个较为齐全的目录结构。

```javascript
├── docs
│   ├── .vuepress
│   │   ├── public
│   │   │   ├── hearder.png
│   │   │   ├── logo.png
│   │   │   ├── ...
│   │   ├── config.js
│   ├── pages
│   │   ├── article.md
│   │   ├── note.md
│   │   ├── about.md
│   │   ├── ...
│   ├── README.md
├── node_modules
├── package.json
├── deploy.sh
├── .gitignore
```

&emsp;&emsp;各目录或文件释义如下。

- `docs/.vuepress`：用于存放`vuepress`全局的配置、组件、静态资源等
- `docs/.vuepress/public`：静态资源目录
- `docs/.vuepress/config.js`：`vuepress`配置文件入口，可配置顶部导航栏和侧边栏等
- `docs/pages`：用于存放各个页面
- `docs/pages/README.md`：项目首页
- `node_modules`：项目依赖
- `package.json`：项目描述文件
- `deploy.sh`：静态页面发布脚本文件
- `.gitignore`：`git`忽略项配置文件

### 首页 / 热更新

&emsp;&emsp;;`README.md`粘贴如下内容。

```javascript
---
home: true
heroImage: /header.png
heroText: 标题
tagline: 副标题
features:
- title: 简洁至上
  details: 以 Markdown 为中心的项目结构，以最少的配置帮助你专注于写作。
- title: Vue驱动
  details: 享受 Vue + webpack 的开发体验，在 Markdown 中使用 Vue 组件，同时可以使用 Vue 来开发自定义主题。
- title: 高性能
  details: VuePress 为每个页面预渲染生成静态的 HTML，同时在页面被加载的时候，将作为 SPA 运行。
footer: Copyright © xxx
---
```

&emsp;&emsp;其中`home: true`表示将此`md`作为网站主页。

&emsp;&emsp;;`heroImage`为首页标题图片，位于标题`heroText`上，且水平居中并以图片原始大小显示，注意`heroImage`图片的基础路径为`docs/.vuepress/public`，因此`/header.png`将引入`public`文件夹下`header.png`图片。

&emsp;&emsp;另外`tagline`为副标题，但是一般作为博客的签名，可以是一句话、一句诗词等。

&emsp;&emsp;;`footer`为首页底部，用作博客声明。

![](/js/vuepress-blog/home.png)

&emsp;&emsp;但是`README.md`中粘贴内容后，浏览器刷新并没有任何内容，而命令行则提示重载`README.md`，即重新运行`npm run dev`。

![](/js/vuepress-blog/reload.png)

&emsp;&emsp;运行后浏览器可查看修改的结果，但是你会发现修改一下`README.md`就要重新启动一下项目，非常麻烦。

&emsp;&emsp;原因在于`md`中`---...---`块的部分是页面相关的配置，而修改配置`vuepress`是不会热更新的（类比`vuecli3`修改`vue.config.js`），仅修改页面内容才会热更新。

&emsp;&emsp;解决办法也很简单，修改`package.json`中`dev`命令。

```javascript
{
    "scripts": {
      "dev": "vuepress dev docs --temp .temp",
      ...
    }
}
```

&emsp;&emsp;运行后会在根目录下生成`.temp`临时文件。

![](/js/vuepress-blog/temp.png)

&emsp;&emsp;因此若要推送到远程仓库，`.gitignore`应当忽略掉此目录。

```javascript
node_modules
.temp
```

### 导航栏 / 侧边栏

&emsp;&emsp;;`docs/.vuepress/config.js`配置文件内粘贴如下内容。

```javascript
module.exports = {
  title: "标题",
  description: "描述",
  head: [
    [
      "link",
      {
        rel: "icon",
        href: "/logo.png"
      }
    ]
  ],
  themeConfig: {
    logo: "/logo.png",
    lastUpdated: "最后更新时间",
    sidebar: "auto",
    nav: [
      {
        text: "首页",
        link: "/"
      },
      {
        text: "分类",
        items: [
          {
            text: "文章",
            link: "/pages/article.md"
          },
          {
            text: "笔记",
            link: "/pages/note.md"
          }
        ]
      },
      {
        text: "关于",
        link: "/pages/about.md"
      },
      {
        text: "百度",
        link: "https://www.baidu.com/"
      }
    ]
  }
}
```

&emsp;&emsp;各个属性释义如下。

- `title`：网站的标题，并且将会被作为所有页面标题的后缀，默认主题下会显示在导航栏（`navbar`）上

![](/js/vuepress-blog/title.png)

- `description`：网站的描述，将会以`<meta>`标签渲染到所有页面

![](/js/vuepress-blog/description.png)

- `head`：网站的`icon`，其中`href`的基础路径也是`docs/.vuepress/public`

![](/js/vuepress-blog/icon.png)

- `themeConfig.logo`：导航栏（`navbar`）前的图标
- `themeConfig.lastUpdated`：获取每个`md`最后一次提交的时间，以合适的格式显示在每个页面的底部

![](/js/vuepress-blog/lastUpdated.png)

> 注意`lastUpdated`是依赖于`git`仓库的，因此所在的项目须初始化为`git`仓库，并且存在一次最新的提交记录

- `themeConfig.sidebar`：`auto`表示根据当前页面的标题，自动生成侧边栏。若部分页面不用显示侧边栏，可在页面`md`内单独配置

```javascript
---
sidebar: false
---
```

- `nav`：导航栏链接，大致包括下拉分组、链接当前网站页面、链接外部页面等，其中链接当前网站页面时，`link`基础路径为`docs`，更为详细说明可参考 [官方文档](https://vuepress.vuejs.org/zh/theme/default-theme-config.html#%E5%AF%BC%E8%88%AA%E6%A0%8F%E9%93%BE%E6%8E%A5)

![](/js/vuepress-blog/nav.png)

## 发布部署

&emsp;&emsp;按照上述步骤，最后剩下的仅仅是每篇文章的完善，以下开始叙述打包发布的操作流程。

### 准备工作

&emsp;&emsp;项目根目录创建`deploy.sh`脚本文件，粘贴如下内容。

```javascript
#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run build

# 进入生成的文件夹
cd docs/.vuepress/dist

git init
git add -A
git commit -m 'message'

# 如果发布到 https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

cd -
```

&emsp;&emsp;脚本文件运行的大致过程为，首先执行`npm run build`打包项目文件，打包后文件位于`docs/.vuepress/dist`目录，因此执行`cd docs/.vuepress/dist`进入到目录下。

&emsp;&emsp;然后目录下运行`git init`初始化为`git`仓库，暂存目录下所有文件，并做一次提交。其中`message`为此次提交的说明，可自主修改。

&emsp;&emsp;最后再执行`git push -f ... master`推送至远程仓库，其中`-f`表示强制推送，并且使用`SSH`传输协议，将本地`master`分支推送到远端。

### SSH 公钥

&emsp;&emsp;由于此次传输协议为`SSH`方式，势必远程仓库要绑定本地的`SSH`公钥才能推送，因此介绍下本地创建`SSH key`。

&emsp;&emsp;打开`Git Bash`命令行界面，安装了`git`的系统，直接鼠标右键选择打开即可。

![](/js/vuepress-blog/bash.png)

&emsp;&emsp;查看本地有无`.ssh`文件夹，若输出`bash: .../.ssh: No such file or directory`即表示本地未创建过`SSH key`。

```javascript
cd ~/.ssh
```

&emsp;&emsp;创建公钥，其中`username`为个人邮箱地址，一路回车使用默认值即可。

```javascript
ssh-keygen -t rsa -C "username@email.com"
```

&emsp;&emsp;查看公钥。

```javascript
cat ~/.ssh/id_rsa.pub
ssh-rsa ...
```

&emsp;&emsp;;`github`上选择`Settings`，侧边栏点击`SSH and GPG keys`，然后点击`New SSH key`新增公钥。其中`Title`为公钥标签，主要帮助你区分公钥的，可以不填。`Key`即为刚才的公钥，复制粘贴后点击`Add SSH key`新增公钥。

![](/js/vuepress-blog/add.png)

### 创建仓库 / 脚本推送

&emsp;&emsp;;`github`上选择`New respository`，输入`Repository name`仓库名，点击`Create repository`创建仓库。

![](/js/vuepress-blog/repos.png)

> 注意仓库名称必须为`username（你的用户名）+ .github.io`的方式，否则需要单独配置

&emsp;&emsp;再次修改下`deploy.sh`，`username`也是你的用户名。

```javascript
# 如果发布到 https://<USERNAME>.github.io
git push -f git@github.com:username/uaername.github.io.git master
```

&emsp;&emsp;;`Git Bash`命令行运行`npm run deploy`，注意只能在`Git Bash`运行，否则会发生错误。

![](/js/vuepress-blog/error.png)

&emsp;&emsp;若本地没有`known_hosts`文件，将会收到如下提示，输入`yes`回车即可。

![](/js/vuepress-blog/host.png)

&emsp;&emsp;最后收到如下信息即表示推送成功并部署在远端了，并且浏览器访问`https//username.github.io`将跳转到`Vuepress`创建的静态博客首页 。

![](/js/vuepress-blog/process.png)
