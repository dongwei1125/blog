![](/other/git/mirror/banner.jpg)

## 前言

&emsp;&emsp;大多数的开发者都或多或少在`GitHub`上维护有项目，但是通常`GitHub`访问起来都很慢，或者无法响应。为了不能正常访问`GitHub`的用户，一般会将`Gitee`或其它平台托管作为镜像。

&emsp;&emsp;我们通常只考虑维护在`GitHub`上的仓库就足够了，而对于其它镜像仓库，更多的是希望在`GitHub`更新的同时，都以静默的方式自动同步。

&emsp;&emsp;因此以下将以`Gitee`作为镜像仓库，对比多种同步方式的利弊，跟随此文你将了解到。

 - 同步`GitHub`和`Gitee`代码仓库的多种方式
 - `webhooks`是什么
 - 什么是`GitHub Actions`，`GitHub Actions`可以做什么
 - `GitHub Actions`如何自动化部署`Pages`

## 同步

### 维护多个远端

&emsp;&emsp;查看当前仓库关联的远程库。

![](/other/git/mirror/current.png)

#### 推送多次

&emsp;&emsp;删除`origin`，然后依次关联远程`GitHub`和`Gitee`仓库。

&emsp;&emsp;本地关联的远程库名称大多数都是`origin`，此情况对于单个远端来说很适用。若关联有多个远端，名称最好还是要容易区分。

```javascript
git remote rm origin
git remote add github https://github.com/xxx/repo.git
git remote add gitee https://gitee.com/xxx/repo.git
```

&emsp;&emsp;查看关联的远程库。

![](/other/git/mirror/v.png)

&emsp;&emsp;本地代码提交后，分别推送至两个远端。缺点也比较明显，即推送多次显得冗余。

```javascript
git push github master
git push gitee master
```

#### 添加 package.json 脚本命令

&emsp;&emsp;可在`package.json`中合并两个命令，推送时只运行`npm run push`即可。实际看似简化了输入，却添加了与项目无关的`scripts`命令。

```javascript
// package.json
{
  ...
  "scripts": {
    "push": "git push github master && git push gitee master"
  }
}
```

#### 修改 Git 内部配置

&emsp;&emsp;当前远端还是只有`origin`。

![](/other/git/mirror/current.png)

&emsp;&emsp;添加一条`push`的远端地址。

```javascript
git remote set-url --add origin https://gitee.com/xxx/repo.git
```

&emsp;&emsp;可以看到推送`push`的`url`多了一条。

![](/other/git/mirror/add.png)

&emsp;&emsp;因此`fetch`时将从`GitHub`拉取代码，`push`时将推送到`Gitee`和`GitHub`两个远端。此方式相对可用，但是无法做到部分的自动化功能，例如测试、部署等。

![](/other/git/mirror/push.png)

### Gitee 同步按钮

&emsp;&emsp;若仓库还未创建，可在头部选择导入仓库。

![](/other/git/mirror/header.png)

&emsp;&emsp;若仓库已存在，可在仓库主页的管理菜单的功能设置下配置地址。

![](/other/git/mirror/url.png)

&emsp;&emsp;两种方式都将在仓库主页创建同步按钮。

![](/other/git/mirror/btn.png)

&emsp;&emsp;注意强制同步将覆盖当前仓库。

![](/other/git/mirror/click.png)

### webhooks

&emsp;&emsp;;[webhooks](https://docs.github.com/cn/developers/webhooks-and-events/webhooks/about-webhooks) 即`web`钩子，是一个可以接收`http/s`请求（多为`post`）的`URL`。大多数情况下都是客户端调用`api`获取服务端提供的数据。而在`webhooks`中，服务端则将在特定事件时调用`webhooks`钩子。

&emsp;&emsp;;`GitHub`也提供了`webhooks`，当用户向仓库`push`推送（不单单是推送事件）代码时，`GitHub`将向配置的`URL`发送`http/s`请求，可用于发邮件、自动部署、备份镜像等等。

&emsp;&emsp;代码仓库可访问 [GitHub](https://github.com/dongwei1125/mirror-repo.git)。

#### 准备工作

&emsp;&emsp;根据以上特性，搭建一个`express`服务器，目的用于启动一个用于同步代码的服务端`post`接口。

&emsp;&emsp;目录结构如下，`app.js`为入口文件，`webhook-handler`用于提供同步代码的核心功能。

```javascript
├── webhook-handler
│   ├── index.js
│   ├── mirror.js
│   ├── shell.sh
│   ├── webhook.config.js
├── app.js
├── const.js
├── package.json
├── ...
```

&emsp;&emsp;;`app.js`中引入`webhook-handler`处理函数，注意`GitHub`触发`webhooks`传递的是`json`格式的数据，要用到`express.json()`中间件，继续往下看。

```javascript
// app.js
const handler = require('./webhook-handler')

app.use(express.json())

app.post('/mirror', (req, res, next) => {
  handler( ... )
})
```

#### 处理函数

&emsp;&emsp;当`GitHub`调用`mirror`接口时，会将用户预设的秘钥`secret`和参数体`json`进行加密，加密后的序列会携带在请求头`header`的 [x-hub-signature](https://docs.github.com/cn/developers/webhooks-and-events/webhooks/securing-your-webhooks#validating-payloads-from-github) 中。

&emsp;&emsp;工具类函数`encrypted`，主要用于进行`hmacsha1`算法加密，参数`secret`为秘钥，`sign`为被用于加密的数据。

&emsp;&emsp;函数`isEqual`，用于对比两字符串是否一致，但是注意判断相等 [不建议](https://docs.github.com/cn/developers/webhooks-and-events/webhooks/securing-your-webhooks#validating-payloads-from-github) 用`===`，而应该使用 [恒定时间](http://nodejs.cn/api/crypto.html#cryptotimingsafeequala-b) 字符串比较，有助于提高服务端的安全性。

```javascript
// webhook-handler/index.js
function handler(req, res, cb) {
  const sign = req.headers['x-hub-signature']
  const encrypted = encrypt(GITHUB_WEBHOOK_SECRET, req.body)
  ...
}

function encrypt(secret, sign) {
  return `sha1=${crypto.createHmac('sha1', secret).update(JSON.stringify(sign)).digest('hex')}`
}

function isEqual(value = '', other = '') {
  if (value.length !== other.length) return false

  return crypto.timingSafeEqual(Buffer.from(value), Buffer.from(other))
}
```

&emsp;&emsp;思考一下，为什么`GitHub`会将用户预设的秘钥和参数体加密呢？

&emsp;&emsp;秘钥加密可以理解，因为不能明文传递。

&emsp;&emsp;以上提供的`post`接口，对于`GitHub`的任意仓库都能触发，别人的仓库是不是也可以呢。那么如何区分是否是我们的仓库触发了呢，秘钥就派上用场了。当服务端保存的静态秘钥与`GitHub`仓库预设的秘钥一致时，就能确定是我们的仓库了。

#### 同步代码

&emsp;&emsp;;`mirror.js`用于启动子进程，运行`shell`脚本来同步代码。

&emsp;&emsp;要明确的是，当我们向`https://github.com/xxx/repo.git`推送代码时，是无法登录验证权限的，而应当携带上用户名密码来推送，即推送到<code>https://<strong>username:password@</strong>github.com/xxx/repo.git</code>。

```javascript
// webhook-handler/mirror.js
const fullPath = getFullPath(DIST_REPO, GITEE_USERNAME, GITEE_PASSWORD)

function getFullPath(url, username, password) {
  const index = url.indexOf('//')
  const protocol = url.slice(0, index + 2)
  const path = url.slice(index + 2)

  return `${protocol}${username}:${password}@${path}`
}
```

&emsp;&emsp;;`shell`脚本中，接收两个参数，分别为源仓库和目标仓库地址，注意`$1`和`$2`没有语义，可声明变量来保存。

```javascript
// webhook-handler/mirror.js
const shPath = path.join(__dirname, 'shell.sh')
const command = `${shPath} ${SRC_REPO} ${fullPath}`

// webhook-handler/shell.sh
SRC_REPO=$1
DIST_REPO=$2
...
```

&emsp;&emsp;有必要解释下`shell.sh`脚本的工作流程。

 - `mkdir _temp ...`：根目录下创建临时目录`_temp`，切换工作目录到`_temp`下
 - `git clone --mirror ...`：镜像克隆，完全复制源仓库（包括分支、引用等等）
 - `git remote set-url --push ...`：将当前副本仓库的推送源地址修改为目标仓库
 - `git push --mirror`：镜像推送，完全推送到目标仓库（包括分支、引用等等）
 - `cd ...`：切换到初始的目录，删除临时仓库`_temp`

```javascript
// webhook-handler/shell.sh
mkdir _temp && cd _temp

git clone --mirror "$SRC_REPO" && cd `basename "$SRC_REPO"`

git remote set-url --push origin "$DIST_REPO"

git push --mirror

cd ../../ && rm -rf _temp
```

#### GitHub 添加 webhooks

&emsp;&emsp;在`GitHub`仓库下，选中`Settings`功能的`Webhooks`菜单，单击`Add webhook`添加。

![](/other/git/mirror/webhooks.png)

&emsp;&emsp;输入你部署在服务器上的`post`接口，设置`Secret`秘钥，注意`Content type`选择为`json`，另外触发`webhook`的事件类型，默认只有推送事件，你也可以自定义选择。

![](/other/git/mirror/trigger.png)

&emsp;&emsp;当你的仓库发生以上勾选的事件时，`GitHub`就会自动帮你调用部署在服务器上的`mirror`接口，进而镜像同步你的仓库代码。

&emsp;&emsp;;`webhooks`的方式相对来说比较可行，但是缺点也很明显，一方面必须额外的服务器（有`node`环境且安装了`Git`）支持用来部署接口。另一方面，单个仓库同步还是很便捷，但是如果说多个仓库要镜像同步呢？

&emsp;&emsp;那我们的处理函数就要去判断请求接口的`GitHub`仓库来源，同时每多同步一组仓库，就要在服务端新增一组源仓库和目标仓库的地址。

> 提供一个 [Gitee](https://gitee.com/help/articles/4336#article-header0) 官方的`webhooks`，用于`Gitee`和`GitHub`双向同步的功能，但是注意目前尚处于内测期，只能 [申请](https://gitee.com/gitee-community/mirror-repository) 开通

### GitHub Actions

&emsp;&emsp;;[GitHub Actions](https://docs.github.com/cn/actions/learn-github-actions/understanding-github-actions) 即是一个免费的虚拟机，提供了三种可选的操作系统（`Ubuntu Linux`、`Microsoft Windows`和`macOS`），用以执行用户自定义的工作流程。

&emsp;&emsp;那么何为工作流程呢？就是一个以`.yml`为后缀的文件（`YAML`语法），注意此文件要放置在代码仓库中的目录`.github/workflows`下才会生效。

> 注意对于每个工作流程，`GitHub`都会在预先配置好的全新虚拟机中执行

#### Hello world

&emsp;&emsp;我们就用`GitHub Actions`打印`Hello world`试试，不用太过复杂的例子。

&emsp;&emsp;在`GitHub`仓库上选中`Actions`，单击`set up a workflow yourself`创建工作流程。

![](/other/git/mirror/setup.png)

&emsp;&emsp;然后在代码编辑器粘贴以下代码，以下为相关命令的含义，更多可 [参考](https://docs.github.com/cn/actions/using-workflows/workflow-syntax-for-github-actions)。

 - `name: ...`：工作流程的名称为`Console hello world`
 - `on: ...`：仓库发生推送`push`事件时执行
 - `jobs`：表示执行的一项或多项任务，当前仅有一个任务`console`
 - `console`：任务名为`console`
 - `runs-on ...`：任务`console`运行的虚拟机为最新的`Ubuntu Linux`环境
 - `steps`：任务`console`的运行步骤，当前仅有一个步骤
 - `- run ...`：运行命令`echo Hello world`

```yml
# .github/gitflows/main.yml
name: Console hello world

on: push

jobs:
  console:
    runs-on: ubuntu-latest
    steps:
      - run: echo Hello world
```

&emsp;&emsp;点击`Start Commit`然后`Commit new file`提交。

![](/other/git/mirror/edit.png)

&emsp;&emsp;仓库目录下将生成`main.yml`文件，另外会创建一次提交记录`Create main.yml`。

```javascript
├── .github
│   ├── workflows
│   │   ├── main.yml
├── ...
```

&emsp;&emsp;由于代码是在`GitHub`上提交的，相当于是本地代码推送`push`了一次，而脚本的执行条件就是`push`事件的发生，因此`GitHub Actions`将会触发。

![](/other/git/mirror/all.png)

&emsp;&emsp;单击`Create main.yml`查看此次推送执行的工作流程，成功在虚拟机下打印出`Hello world`。

![](/other/git/mirror/console.png)

#### 准备工作

&emsp;&emsp;先要保证本机环境有`Git`公钥和私钥。

&emsp;&emsp;然后在`Gitee`用户`SSH`公钥中，添加标题并粘贴公钥保存。
![](/other/git/mirror/ssh.png)

&emsp;&emsp;然后在`GitHub`的仓库`repo`下，`Settings`功能选择`Actions`，单击`New repository secret`添加秘钥。

![](/other/git/mirror/secrets.png)

&emsp;&emsp;呐，粘贴你的私钥，准备工作就完成了。

![](/other/git/mirror/finish.png)

#### 添加脚本

&emsp;&emsp;修改`.github/workflow/main.yml`。

&emsp;&emsp;根据刚才`Hello world`的例子，很容易知道当前工作流程的名称为`Mirror to Gitee repo`，仓库在推送`push`代码、删除`delete`分支或者创建`create`分支时，将执行此脚本。

&emsp;&emsp;脚本包含一个任务，名为`mirror`，运行的虚拟机为最新的`Ubuntu Linux`环境。而此任务下又包含两个名为`Config private key`和`Clone repo and push`的步骤。

```yml
# .github/gitflows/main.yml
name: Mirror to Gitee repo

on: [ push, delete, create ]

jobs:
  mirror:
    runs-on: ubuntu-latest
    steps:
      - name: Config private key
        env:
          SSH_PRIVATE_KEY: ${{ secrets.GITEE_PRIVATE_KEY }}
        run: |
          mkdir -p ~/.ssh
          echo "$SSH_PRIVATE_KEY" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          echo "StrictHostKeyChecking no" >> ~/.ssh/config

      - name: Clone repo and push
        env:
          SRC_REPO: "https://github.com/xxx/repo.git"
          DIST_REPO: "git@gitee.com:xxx/repo.git"
        run: |
          git clone --mirror "$SRC_REPO"
          cd `basename "$SRC_REPO"`
          git remote set-url --push origin "$DIST_REPO"
          git push --mirror
```

&emsp;&emsp;;`Config private key`用于在虚拟机的用户目录中写入私钥。`env`下有环境变量`SSH_PRIVATE_KEY`，变量值由 [secrets](https://docs.github.com/cn/actions/learn-github-actions/contexts#secrets-context) 上下文获取而来。

&emsp;&emsp;有没有觉得`GITEE_PRIVATE_KEY`很眼熟呢？没错，就是刚才保存在仓库目录下的私钥。

&emsp;&emsp;当用户向诸如``git@github.com:xxx/xx.git``的仓库推送代码时，遵循`SSH`传输协议。在推送前，`Git`将提交用户根目录下的私钥`id_rsa`到远端，远端则会将私钥和公钥（`GitHub`或者`Gitee`用户在服务端添加的公钥`id_rsa.pub`）对一起做验证，判别此私钥是否有推送权限。

&emsp;&emsp;而我们已经将公钥保存在了`Gitee`远端服务器上，私钥保存在`GitHub`仓库内的`GITEE_PRIVATE_KEY`上，`GitHub`平台会将私钥传递在`yml`脚本中的`secrets`上下文内，然后脚本获取后，将其写在了虚拟机的用户根目录下。此时虚拟机要推送的话，它当然是有权限的。

&emsp;&emsp;还是不太清楚的话，可以理解为。依托`GitHub`平台和`yml`脚本，我们本机的私钥将会被复制成为虚拟机的私钥。

&emsp;&emsp;以下为`Config private key`写入私钥的过程。

 - `mkdir -p ...`：虚拟机根目录下创建`.ssh`文件夹。`-p`表示即使上级目录不存在，也要按目录层级自动创建
 - `echo ...`：将私钥写入`.ssh`文件夹下的`id_rsa`文件中
 - `chmod ...`：修改`id_rsa`的权限为`600`（仅所有者可读写）

&emsp;&emsp;创建的`id_rsa`的访问权限`0644`过于开放，`Git`要求私钥文件不能被其他人访问。

![](/other/git/mirror/600.png)

 - `echo ...`：关闭初次连接服务器时的提示

&emsp;&emsp;当第一次连接服务器时，例如`push`提交，`Git`将弹出公钥确认的提示，将导致自动化任务中断。
 
![](/other/git/mirror/host.png)

#### 同步代码

&emsp;&emsp;当我们向`GitHub`仓库推送代码时，`GitHub Actions`将自动运行仓库下的`yml`脚本。若任务和任务下的步骤都通过，则表示执行成功。

![](/other/git/mirror/success.png)

#### actions

&emsp;&emsp;现在来思考一个问题，如果要同步另外的`GitHub`仓库到`Gitee`呢？

&emsp;&emsp;那么我们是不要复制以上代码，修改源和目的仓库地址呢？可以明确告诉你，不用。

&emsp;&emsp;;`GitHub`想到了一个很好的办法，开发者可以发布不同的工作流程到 [官方市场](https://github.com/marketplace?type=actions)，而用户可以引用别人的`actions`即可。同步`GitHub`仓库到`Gitee`的功能，很早就有团队写好发布了，缺陷相对也很少。刚才讲那么多命令，只是为了更好地帮助你理解`GitHub Actions`的工作原理。

&emsp;&emsp;以下为 [hub-mirror-action](https://github.com/marketplace/actions/hub-mirror-action) 配置参数。

 - `src`：源平台账户名
 - `dst`：目标平台账户名
 - `dst_key`：源仓库下保存的私钥
 - `static_list`：仅同步指定的仓库
 - `force_update`：强制同步

> `hub-mirror-action`远远不止同步单个仓库，它可以将两个平台下的所有仓库都同步

```yml
# .github/gitflows/main.yml
name: Mirror to Gitee repo

on: [ push, delete, create ]

jobs:
  mirror:
    runs-on: ubuntu-latest
    steps:
      - uses: Yikun/hub-mirror-action@v1.2
        with:
          src: github/username
          dst: gitee/username
          dst_key: ${{ secrets.GITEE_PRIVATE_KEY }}
          static_list: 'repo'
          force_update: true
```

## 常见问题

### GitHub Actions 如何自动化部署 Pages

&emsp;&emsp;一个很常见的场景，当我们将本地仓库代码推送至远端`GitHub`仓库时，要同步代码到`Gitee`，并且自动部署`GitHub`和`Gitee`的`Pages`。

&emsp;&emsp;此处用`vuecli3`脚手架作为示例，运行`vue create app`安装`vue`空脚手架，然后修改`vue.config.js`中的生产路径。

```javascript
// vue.config.js
module.exports = {
  publicPath: './',
}
```

&emsp;&emsp;根目录`app`下目录结构，`main.yml`用于部署`Pages`。

```javascript
├── .github
│   ├── workflows
│   │   ├── main.yml
├── node_modules
├── src
│   ├── App.vue
│   ├── main.js
│   ├── ...
├── ...
├── vue.config.js
```

&emsp;&emsp;部署`GitHub Pages`相对容易，`GitHub Pages`关联的分支有更新时将自动部署。

&emsp;&emsp;而`Gitee Pages`相对麻烦，只能手动更新部署。第三方`gitee-pages-action`内部实际是利用`Gitee`用户名和密码登录至平台，调用更新接口的方式来实现的自动部署。

&emsp;&emsp;以下为各个`actions`的功能及参数的作用。

 - [checkout](https://github.com/marketplace/actions/checkout)：检出当前仓库。你可以想象成在虚拟机内克隆了当前仓库，然后就可以运行`package.json`中的`scripts`命令，例如`npm run build`等。
 - [setup-node](https://github.com/marketplace/actions/setup-node-js-environment)：虚拟机安装`node`环境。其中`node-version`用于指定`node`版本，`cache` [缓存](https://github.com/marketplace/actions/setup-node-js-environment#caching-packages-dependencies) 依赖项用以优化工作流执行时长
 - [actions-gh-pages](https://github.com/marketplace/actions/github-pages-action)：部署`GitHub Pages`页面。将`npm run build`命令构建出的`dist`目录，创建为新分支`page`用于部署。`force_orphan`表示`page`分支只生成一次提交记录，`full_commit_message`为提交说明，`allow_empty_commit`表示即使`dist`文件没有更新，也要重新提交
 - [hub-mirror-action](https://github.com/marketplace/actions/hub-mirror-action)：镜像同步仓库
 - [gitee-pages-action](https://github.com/marketplace/actions/gitee-pages-action)：部署`Gitee Pages`页面。其中`GITEE_PASSWORD`为`GitHub`仓库下添加的`Gitee`平台密码，`gitee-repo`和`branch`表示对`Gitee`下的`repo`仓库的`page`分支进行部署

```yml
# .github/gitflows/main.yml
name: Mirror to Gitee repo and deploy pages

on:
  push:
    branches:
      - master

jobs:
  deploy-github:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup node
        uses: actions/setup-node@v2
        with:
          node-version: '16.14.0'
          cache: 'npm'

      - name: Depend install and build
        run: |
          npm install
          npm run build

      - name: Deploy GitHub pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          deploy_key: ${{ secrets.GITEE_PRIVATE_KEY }}
          publish_branch: page
          publish_dir: dist
          allow_empty_commit: true
          force_orphan: true
          full_commit_message: 'feat: deploy pages'

  deploy-gitee:
    needs: deploy-github
    runs-on: ubuntu-latest
    steps:
      - name: Mirror to Gitee repo
        uses: Yikun/hub-mirror-action@v1.2
        with:
          src: github/username
          dst: gitee/username
          dst_key: ${{ secrets.GITEE_PRIVATE_KEY }}
          static_list: 'repo'
          force_update: true

      - name: Deploy Gitee pages
        uses: yanglbme/gitee-pages-action@v1.4.0
        with:
          gitee-username: username
          gitee-password: ${{ secrets.GITEE_PASSWORD }}
          gitee-repo: repo
          branch: page
```

&emsp;&emsp;因此`main.yml`脚本的工作流程也非常清晰了，任务`deploy-github`用于检出仓库后构建代码，部署至`GitHub`对应仓库的`page`分支。任务`deploy-gitee`用于同步`GitHub`仓库至`Gitee`，然后在`Gitee`平台，对仓库的`page`分支再单独部署。

&emsp;&emsp;注意任务`deploy-gitee`一定是在`deploy-github`后运行的，否则仓库同步将无法达到预期。[needs](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idneeds) 表示当前任务要等待指定任务完成后才能执行。

### VuePress 如何多仓库同步和部署

&emsp;&emsp;;[VuePress](https://vuepress.vuejs.org/zh/) 也有仓库的同步和部署`Pages`的场景，但是相对来说有很大的差异性，主要原因在于部署`Pages`的代码位于另外的仓库下，而不是当前仓库的`page`分支。

#### 准备工作

&emsp;&emsp;你的`GitHub`应该包括两个仓库，一个用于保存`VuePress`的源码，一个用于静态博客，保存`VuePress`打包后的代码，另外`Gitee`仓库也是同理。

&emsp;&emsp;可能你会问，用一个命名分支（例如`page`）保存打包后的代码，在部署页面时选择此分支不是更好，还能节省一个仓库。

&emsp;&emsp;为什么会这样做呢？

&emsp;&emsp;在`Gitee`平台中，如果你的用户名为`username`，当你的仓库名和用户名一致时，就会触发一个 [隐藏特性](https://gitee.com/help/articles/4136#article-header0)，即访问地址`https://username.gitee.io`，就能访问你部署在`username`仓库的静态页面。

> 一般的`Gitee`仓库，部署为静态`Pages`后，访问地址都为二级目录。例如`repo`仓库，部署后的地址为`http://username.gitee.io/repo`

&emsp;&emsp;而在`GitHub`平台中，如果你的用户名为`username`，当你的仓库名为`username.github.io`时，也会触发一个隐藏特性，即访问地址`https://username.github.io`，就能访问部署在`username.github.io`仓库的静态页面，否则也会是二级目录的形式。

> `GitHub`平台，用户名和仓库名一致时，还会有另外的隐藏特性

&emsp;&emsp;为什么会创建两个仓库，而不是以分支的方式就不用我多说了吧。为了触发平台的隐藏特性，让你的个人主页地址更加简洁，容易记忆。

&emsp;&emsp;因此我们实际要有四个仓库，`Gitee`平台的`vuepress`和`username`仓库，`GitHub`的`vuepress`和`username.github.io`仓库。

#### 添加脚本

&emsp;&emsp;默认你的目录结构为以下，其中`deploy-pages.yml`用于部署`Pages`，`mirror-repo.yml`用于同步`VuePress`源码仓库。

```javascript
├── .github
│   ├── workflows
│   │   ├── deploy-pages.yml
│   │   ├── mirror-repo.yml
├── node_modules
├── docs
│   ├── .vuepress
│   │   ├── config.js
│   ├── README.md
├── package.json
├── .gitignore
```

&emsp;&emsp;;`package.json`添加`scripts`命令。

```javascript
// package.json
{
  ...
  "scripts": {
    "dev": "vuepress dev docs --temp .temp",
    "build": "vuepress build docs",
  },
}
```

&emsp;&emsp;然后新增`mirror-repo.yml`脚本，作用很简单，即将`Github`平台用户`username`的仓库`vuepress`，强制同步到`Gitee`平台用户`username`的仓库`vuepress`。

```yml
# .github/workflows/mirror-repo.yml
name: Mirror to Gitee repo

on:
  push:
    branches:
      - master

jobs:
  mirror:
    runs-on: ubuntu-latest
    steps:
      - uses: Yikun/hub-mirror-action@v1.2
        with:
          src: github/username
          dst: gitee/username
          dst_key: ${{ secrets.GITEE_PRIVATE_KEY }}
          static_list: 'vuepress'
          force_update: true
```

&emsp;&emsp;最后新增`deploy-pages.yml`脚本，以下为各步骤作用。

 - `Setup node`：签出当前仓库并安装`node`环境
 - `Depend install and build`：安装依赖并打包代码
 - `Deploy GitHub pages`：将打包后的代码（位于`docs/.vuepress/dist`目录下），推送到用户`username`的`username.github.io`仓库
 - `Mirror to Gitee repo`：同步`GitHub`平台的仓库`username.github.io`代码，至`Gitee`平台的`username`仓库。其中`mappings`参数表示仓库名不同时的映射
 - `Deploy Gitee pages`：将`Gitee`平台的用户`username`下的`username`仓库，其中的`master`分支代码部署为`Pages`

```yml
# .github/workflows/mirror-repo.yml
name: Deploy pages

on:
  push:
    branches:
      - master

jobs:
  deploy-github:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup node
        uses: actions/setup-node@v2
        with:
          node-version: '16.14.0'
          cache: 'npm'

      - name: Depend install and build
        run: |
          npm install
          npm run build
          
      - name: Deploy GitHub pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          deploy_key: ${{ secrets.GITEE_PRIVATE_KEY }}
          external_repository: username/username.github.io
          publish_branch: master
          publish_dir: docs/.vuepress/dist
          allow_empty_commit: true
          force_orphan: true
          full_commit_message: 'feat: deploy pages'

  deploy-gitee:
    needs: deploy-github
    runs-on: ubuntu-latest
    steps:
      - name: Mirror to Gitee repo
        uses: Yikun/hub-mirror-action@v1.2
        with:
          src: github/username
          dst: gitee/username
          dst_key: ${{ secrets.GITEE_PRIVATE_KEY }}
          mappings: "username.github.io=>username"
          static_list: 'username.github.io'
          force_update: true

      - name: Deploy Gitee pages
        uses: yanglbme/gitee-pages-action@v1.4.0
        with:
          gitee-username: username
          gitee-password: ${{ secrets.GITEE_PASSWORD }}
          gitee-repo: username
          branch: master
```

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125) / [Gitee](https://gitee.com/dongwei1125)、[GitHub Pages](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~