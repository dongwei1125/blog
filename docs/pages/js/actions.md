# 自动化签到稀土掘金，拥抱 GitHub Actions 吧

![](/js/actions/banner.jpg)

## 前言

&emsp;&emsp;最近儿童节刚过不久，就收到了腾讯云的扣费短信，原来是之前部署在腾讯云的`SCF`没有免费额度，开始付费了。根据短信提示呢，结掉了长达一天的逾期费用。比较纳闷的是，快到期了不提前通知吗，或者说临时暂停云函数都可。但是呢，不，就不，一定要先强制扣费，然后才发通知。

&emsp;&emsp;之前部署的腾讯云，仅仅用在简单且普遍的功能上，例如自动化脚本，或者提供功能函数等。实际上，腾讯云函数的功能还有些问题，部分配置参数没有文档，只能与在线客服沟通解决，过程中也提交了很多的改进建议。总体来说，非常繁琐，也浪费了时间，于是干脆注销了腾讯云，拥抱更加强大的 [GitHub Actions](https://docs.github.com/cn/actions/learn-github-actions/understanding-github-actions)。

&emsp;&emsp;以下将依赖`GitHub Actions`，简介自动化签到工具 [稀土掘金助手](https://github.com/dongwei1125/juejin-helper)。

## 正文

### 目录结构

&emsp;&emsp;以下为各目录和文件。

```javascript
├── .github
│   ├── workflows
│   │   ├── action.yml
├── .vscode
│   ├── settings.json
├── docs
├── node_modules
├── src
│   ├── juejin
│   │   ├── api.js
│   │   ├── httpInstance.js
│   │   ├── index.js
│   ├── utils
│   │   ├── dingding.js
│   │   ├── email.js
│   │   ├── pushMessage.js
│   │   ├── pushplus.js
│   │   ├── utils.js
│   ├── ENV.js
│   ├── main.js
├── .gitignore
├── package.json
├── README.md
```

&emsp;&emsp;其中`src`为源码部分。

 - `.github/workflow/action.yml`：自动化定时执行代码
 - `.vscode/settings.json`：`vscode`代码格式
 - `docs`：文档
 - `node_modules`：依赖包
 - `src/juejin/api.js`：稀土掘金功能接口类
 - `src/juejin/httpInstance.js`：`axios`实例，包括请求头和拦截器等
 - `src/juejin/index.js`：稀土掘金类
 - `src/utils/dingding.js`：钉钉机器人
 - `src/utils/email.js`：邮件
 - `src/utils/pushMessage.js`：消息通知函数
 - `src/utils/pushplus.js`：微信公众号`pushplus`推送
 - `src/utils/utils.js`：工具函数，如延时函数和随机数
 - `src/ENV.js`：环境变量，如`COOKIE`等
 - `src/main.js`：主函数，入口函数
 - `.gitignore`：`git`忽略文件
 - `package.json`：包文件
 - `README.md`：简介

### 接口

&emsp;&emsp;;`juejin`目录主要包括`axios`实例、接口类和掘金类。

&emsp;&emsp;;`httpInstance.js`内部在`axios`实例的基础上封装了请求头和响应拦截器。另外请求头中添加了部分浏览器标识字段，简单避免服务器确认为机器人脚本。

&emsp;&emsp;;`api.js`内部接口类`Api`，内部封装了稀土掘金所有的接口，包括用户信息、签到、抽奖等。

&emsp;&emsp;;`index.js`内部掘金类`Juejin`，继承至接口类，并封装了登录方法。确认用户是否登录方式非常简单，携带上`cookie`去获取用户信息，若成功获取，则表示处在登录状态下，否则表示`cookie`过期。

### 工具函数

&emsp;&emsp;目录`utils`内部多为消息通知的相关函数。

&emsp;&emsp;;`pushMessage.js`中用于接收消息类型和内容，消息类型`type`包括`info`和`error`两类，由于各消息平台的内容格式要求不一致，内容`message`将会被处理为`markdown`或者`HTML`格式。

&emsp;&emsp;;`dingding.js`为钉钉机器人通知，注意生成的钉钉`webhook`地址一定要包含关键字`签到`。

&emsp;&emsp;;`pushplus`为微信公众号推送函数。

&emsp;&emsp;;`email.js`为邮箱通知，`suffix`为邮箱服务后缀名，`user`为邮箱号，`pass`为`POP3/SMTP`服务的授权码。另外`verify`方法用于验证邮箱是否可用。

```javascript
// src/utils/email.js
...
const suffix = /@(?<suffix>.*)/.exec(EMAIL).groups.suffix
const options = {
  host: `smtp.${suffix}`,
  auth: {
    user: EMAIL,
    pass: AUTHORIZATION_CODE,
  },
}
const transporter = nodemailer.createTransport(options)

await transporter.verify()
```

&emsp;&emsp;;`utils.js`工具函数提供了延时函数`wait`和随机数函数`getRandomArbitrary`。

### 主函数

&emsp;&emsp;主函数`main.js`中执行`main`函数将依次完成签到、沾喜气、抽奖、`BugFix`。若运行出现错误，都会被`catch`捕获到，发送消息到各个平台。

&emsp;&emsp;;`BugFix`部分是模拟用户收集`Bug`，间隔一秒左右持续收集。

```javascript
// src/main.js
const notCollectBug = await juejin.getNotCollectBug()

if (notCollectBug.length > 0) {
  const requests = notCollectBug.map(bug => {
    return async () => {
      await juejin.collectBug(bug)
      await wait(getRandomArbitrary(1000, 1500))
    }
  })

  for (const request of requests) {
    await request()
    ...
  }
  ...
}
```

&emsp;&emsp;注意`map`内的回调函数切不可用为`async`的方式，此方式将立即并行所有的`async`函数，由于都运行了，将无法达到间隔请求的目的。

```javascript
const requests = notCollectBug.map(async bug => {
  await juejin.collectBug(bug)
  await wait(getRandomArbitrary(1000, 1500))
})
```

### GitHub Actions

&emsp;&emsp;;[GitHub Actions](https://docs.github.com/cn/actions/learn-github-actions/understanding-github-actions) 即是一个免费的虚拟机，提供了三种可选的操作系统（`Ubuntu Linux`、`Microsoft Windows`和`macOS`），用以执行用户自定义的工作流程。

&emsp;&emsp;那么何为工作流程呢？就是一个以`.yml`为后缀的文件（`YAML`语法），注意此文件要放置在代码仓库中的目录`.github/workflows`下才会生效。

> 注意对于每个工作流程，`GitHub`都会在预先配置好的全新虚拟机中执行

&emsp;&emsp;以下为对应的工作流。

```yml
name: Growth

on:
  schedule:
    # UTC 时间 0 点运行一次
    - cron: '0 0 * * *'
  workflow_dispatch:

jobs:
  growth:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup node
        uses: actions/setup-node@v3
        with:
          node-version: '16.14.2'

      - name: Depend install and serve
        env:
          COOKIE: ${{ secrets.COOKIE }}
          DINGDING_WEBHOOK: ${{ secrets.DINGDING_WEBHOOK }}
          EMAIL: ${{ secrets.EMAIL }}
          AUTHORIZATION_CODE: ${{ secrets.AUTHORIZATION_CODE }}
          PUSHPLUS_TOKEN: ${{ secrets.PUSHPLUS_TOKEN }}
        run: |
          npm install
          npm run serve

```

&emsp;&emsp;相关含义为。

 - `name: ...`：工作流程的名称
 - `on: ...`：流程执行条件，`schedule`指定条件为时间，`0 0 * * *`即每天的`UTC`时间`0`点运行一次。`workflow_dispatch`可在`GitHub`仓库手动运行用于测试
 - `jobs`：表示执行的一项或多项任务，当前仅有一个任务`growth`
 - `runs-on ...`：任务`growth`运行的虚拟机为最新的`Ubuntu Linux`环境
 - `steps`：任务`growth`的运行步骤，当前有两个步骤，包括`Setup node`和`Depend install and serve`。`Setup node`用于 [检出](https://github.com/marketplace/actions/checkout) 仓库代码，[安装](https://github.com/marketplace/actions/setup-node-js-environment) `node`环境。`Depend install and serve`用于安装依赖并执行脚本，其中`env`下为环境变量，可在`GitHub`仓库设置中指定，用于传入到`node`脚本中的`process.env`上

## 指南

### 派生仓库

&emsp;&emsp;派生（`fork`）[仓库](https://github.com/dongwei1125/juejin-helper)。

![](/js/actions/fork.png)

&emsp;&emsp;创建一个同名的派生仓库，派生后仓库可自由修改。

![](/js/actions/create.png)

&emsp;&emsp;派生成功。

![](/js/actions/success.png)

### 环境机密

&emsp;&emsp;点击仓库的`Settings`菜单项，选择侧边`Secrets/Actions`菜单，点击`New respository secret`新增机密。

![](/js/actions/new.png)

&emsp;&emsp;注意不用担心机密泄露，因为初始派生的仓库仅你自己可以操作访问，另外`GitHub`对`Actions secrets`描述也非常清晰。

> `Secrets are environment variables that are encrypted. Anyone with collaborator access to this repository can use these secrets for Actions.`<br/>
> 机密是加密的环境变量，任何对存储库有协作者访问权限的人都可以使用机密。

&emsp;&emsp;添加环境机密名称`COOKIE`，`Value`即稀土掘金的用户`cookie`。

![](/js/actions/secret.png)

&emsp;&emsp;如何获取呢？

&emsp;&emsp;浏览器进入稀土掘金首页，键入`F12`开启控制台。清空`Network`控制信息，点击用户头像下菜单中的成长福利。

![](/js/actions/network.png)

&emsp;&emsp;找到`get_counts`接口，复制全部`cookie`，粘贴到刚才的`Value`中。

![](/js/actions/get.png)

### 邮箱

&emsp;&emsp;以常用的`QQ`邮箱为例，添加环境机密`EMAIL`，`Value`为邮箱地址，例如`xxx@qq.com`。

&emsp;&emsp;登录邮箱，进入邮箱首页，点击设置。

![](/js/actions/qq.png)

&emsp;&emsp;点击账户菜单。

![](/js/actions/count.png)

&emsp;&emsp;点击开启`POP3/SMTP`服务，根据提示发送短信验证。

![](/js/actions/pop3.png)

&emsp;&emsp;验证成功，复制授权码。

![](/js/actions/code.png)

&emsp;&emsp;在`GitHub`中添加环境机密`AUTHORIZATION_CODE`，`Value`值即为授权码。

### 钉钉

&emsp;&emsp;移动端发起群聊，点击面对面建群，输入较复杂的数字进入群聊。

![](/js/actions/group.png)

&emsp;&emsp;;`PC`端找到群设置，点击智能群助手。

![](/js/actions/helper.png)

&emsp;&emsp;添加机器人后，点击配置按钮。

![](/js/actions/add.png)

&emsp;&emsp;选择自定义机器人并添加。

![](/js/actions/custom.png)

&emsp;&emsp;输入机器人名字，安全设置选择自定义关键词，注意关键词一定要为`签到`，否则将无法收到通知。

![](/js/actions/key.png)

&emsp;&emsp;添加成功，复制生成的`Webhook`地址。

![](/js/actions/link.png)

&emsp;&emsp;然后在`GitHub`中添加环境机密名称`DINGDING_WEBHOOK`，`Value`为复制的`Webhook`地址。

### pushplus

&emsp;&emsp;;[pushplus](https://www.pushplus.plus/push1.html) 官网点击登录查看`token`。

![](/js/actions/login.png)

&emsp;&emsp;微信扫码关注`pushplus`推送加公众号，关注成功后一键复制`token`。

![](/js/actions/token.png)

&emsp;&emsp;;`GitHub`创建环境机密`PUSHPLUS_TOKEN`，`Value`值即为`token`。

### 启用

&emsp;&emsp;初始派生的仓库，点击`Actions`菜单的`I understand my workflows, go ahead and enable them`开启。

![](/js/actions/i.png)

&emsp;&emsp;选择`Growth`工作流，提示中`GitHub`默认禁用了工作流，点击`Enable workflow`启用工作流。

![](/js/actions/enable.png)

&emsp;&emsp;启用成功，点击`Run workflow`手动运行一次工作流。

![](/js/actions/run.png)

&emsp;&emsp;刷新页面，`Growth`工作流正在运行，点击查看。

![](/js/actions/flow.png)

&emsp;&emsp;点击查看`growth`任务。

![](/js/actions/job.png)

&emsp;&emsp;点击`Depend install and serve`。

![](/js/actions/serve.png)

&emsp;&emsp;启用成功，以后`GitHub`将每天定时运行脚本，北京时间`9`点左右，时间上不是很准时，存在一定的延迟。

![](/js/actions/log.png)

### 效果预览

&emsp;&emsp;;`QQ`邮箱邮件。

![](/js/actions/email.png)

&emsp;&emsp;钉钉。

![](/js/actions/dingding.png)

&emsp;&emsp;微信公众号`pushplus`。

![](/js/actions/pushplus.png)

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125) / [Gitee](https://gitee.com/dongwei1125)、[GitHub Pages](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~