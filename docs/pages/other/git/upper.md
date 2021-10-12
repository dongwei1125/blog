# 比较全面的 Git 命令手册，几乎涵盖日常所有的使用场景（上）

![](/other/git/banner.jpg)

## Git 配置

### 文件类型

- 系统范围内的配置文件，包括系统上每一个用户及其仓库的通用配置，位于`Git`安装目录下`C:/Program Files/Git/etc/gitconfig`。
- 用户级的配置文件，只适用当前用户，位于用户目录下`C:/Users/{username}/.gitconfig`。
- 项目级的配置文件，只适用某个`Git`仓库，位于仓库目录下`.git/config`。

&emsp;&emsp;;`Git`读取配置文件顺序依次为系统级、用户级、项目级，以上三个级别的配置都会覆盖上一层的配置。

### 文件操作

#### 查看

&emsp;&emsp;查看仓库所有配置，其中`-l`为`--list`简写，可能有重复的变量名，`Git`会从不同的文件中读取同一个配置，此种情况下，`Git`会使用它找到的每一个变量的最后一个配置。

```javascript
git config -l
```

&emsp;&emsp;查看不同级别配置，其中`[]`内分别表示不同级别。

```javascript
git config [--system|--global|--local] -l
```

&emsp;&emsp;查看某项配置，其中`user.name`为具体某项配置信息，若无输出则表示不存在该项配置，中文可能输出乱码。也可不设置级别参数，`Git`根据执行命令路径读取相关配置文件的配置项。

```javascript
git config [--system|--global|--local] user.name
```

#### 新增

&emsp;&emsp;新增某一配置项，其中`section`是配置节点，`key`是节点下的键，`section.key`新增为`true`。

```javascript
git config [--system|--global|--local] --add section.key true
```

#### 编辑

&emsp;&emsp;编辑不同级别配置文件，其中`-e`为`--edit`简写。`Git`默认编辑器是`Vim`，进入编辑器后（默认`normal`模式）键入`i`进入`insert`模式，可编辑配置信息，键盘方向键控制光标移动，鼠标左键不生效。编辑完成键入`ESC`或`Ctrl + C`进入`normal`模式，键入`:w`（保存）、`:q`（退出）、`:q!`（强制退出）、`:wq`（保存并退出）。不设置级别参数，默认采用`--local`，编辑项目级配置文件。

```javascript
git config [--system|--global|--local] -e
```

&emsp;&emsp;编辑某一配置项的值，`section`节点`key`键被设置为`false`。

```javascript
git config [--system|--global|--local] section.key false
```

#### 删除

&emsp;&emsp;删除某一配置项，`section`节点`key`键被删除。

```javascript
git config [--system|--global|--local] --unset section.key
```

### 用户信息

&emsp;&emsp;安装完 [Git](https://npm.taobao.org/mirrors/git-for-windows/) 初始化用户名与邮件地址，`Git`的每次提交都会使用这些信息，并且会写入到每一次提交中，不可更改。使用`--global`选项，意味着无论在系统上做任何事情（提交、推送等），`Git`都会使用这些信息。当针对特定项目使用不同的用户名称与邮件地址时，可以在那个项目目录下使用`--local`选项的命令来配置。

```javascript
git config --global user.name username
git config --global user.email username@email.com
```

### 文本编辑器

&emsp;&emsp;;`Git`使用操作系统默认的文本编辑器`Vim`，配置不同的文本编辑器，例如`VS Code`。

```javascript
git config --global core.editor code
```

## Git 命令

### 创建版本库

#### 目录初始化

&emsp;&emsp;创建空目录，使用`Windows`系统，为了避免遇到各种莫名其妙的问题，确保目录名（包括父目录）不包含中文，`pwd`命令用于显示当前目录路径。

```javascript
mkdir gitdir
cd gitdir
pwd
```

&emsp;&emsp;空目录初始化，`git init`命令将创建一个名为`.git`的子目录，是`Git`用来跟踪管理版本库的，`ls -a`列出目录下的所有文件，包括以`.`开头的隐含文件。

```javascript
git init
Initialized empty Git repository in ...

ls -a
./ ../  .git/
```

&emsp;&emsp;也可以在一个已经存在文件的文件夹（不是空文件夹）中初始化`Git`仓库并跟踪文件。通过`git add`命令跟踪指定文件，然后执行`git commit`提交。

```javascript
git add --all
git commit -m 'message'
```

#### 克隆仓库

&emsp;&emsp;克隆一份已经存在了的`Git`仓库，使用`git clone`命令，`Git`克隆的是`Git`仓库服务器上的几乎所有数据， 默认配置下远程`Git`仓库中的每一个文件的每一个版本都将被拉取下来。

```javascript
git clone https://github.com/username/repo.git
```

&emsp;&emsp;当前目录下创建了一个名为`repo`的目录，并在目录下初始化一个`.git`文件夹，从远程仓库拉取所有数据放入`.git`文件夹，然后从中读取最新版本的文件的拷贝。在克隆远程仓库的时候，自定义本地仓库的名字，可以使用如下命令。

```javascript
git clone https://github.com/username/repo.git repos
```

&emsp;&emsp;克隆远程仓库某个具体分支，其中`-b`为`--branch`简写，`dev`为远程仓库`repo`的分支。

```javascript
git clone -b dev https://github.com/username/repo.git
```

### Git 操作

#### 暂存

&emsp;&emsp;将单个文件加入到暂存区，也可将处于未合并`unmerged`状态的文件标记为冲突已解决。

```javascript
git add readme.md
```

&emsp;&emsp;将多个文件加入到暂存区。

```javascript
git add readme.md file.txt
```

&emsp;&emsp;将工作区中所有未跟踪或者修改的文件添加到暂存区。其中`git add --all`，无论在哪个目录都会暂存所有未跟踪、修改或删除的文件。`git add .`只能暂存当前目录下所有未跟踪、修改的文件，不包括删除的文件。

```javascript
git add --all
git add .
```

#### 撤销暂存

&emsp;&emsp;将单个文件移出暂存区。

```javascript
git reset HEAD readme.md
```

&emsp;&emsp;将暂存区所有文件移出。

```javascript
git reset HEAD
```

#### 撤销修改

&emsp;&emsp;撤销对单个文件的修改，包括工作区中修改或删除的文件。

```javascript
git checkout -- readme.md
```

&emsp;&emsp;撤销工作区所有文件的修改，已暂存的修改不会被撤销，即回到最近一次版本库或`git add`时的状态。

```javascript
git checkout .
```

#### 删除

&emsp;&emsp;删除某个文件并将其加入暂存区，可使用`git rm readme.md`替代如下命令。

```javascript
rm readme.md
git add readme.md
```

&emsp;&emsp;之前修改过并且已经放到暂存区的文件，运行`git rm`会报错，可使用强制删除选项`-f`或`--force`。报错用于防止误删还没有添加到版本库的数据，`Git`无法恢复。

```javascript
git rm -f readme.md
```

#### 放弃跟踪

&emsp;&emsp;把文件从`Git`版本库中删除但仍然保留在当前工作目录中。 即让文件保留在磁盘，但是并不想让`Git`继续跟踪。

```javascript
git rm --cached readme.md
git commit -m 'message'
```

#### 重命名

&emsp;&emsp;修改某个文件的文件名，可使用`git mv readme.md file.md`代替如下命令。

```javascript
mv readme.md file.md
git rm readme.md
git add file.md
```

#### 提交

&emsp;&emsp;提交即将暂存区的修改维护至`Git`版本库纳入版本管理，`-m`后输入的是本次提交的说明，不加`-m`参数会调用`Vim`编辑器提示输入提交说明。

```javascript
git commit -m 'message'
```

&emsp;&emsp;;`-a`选项会自动把所有已经跟踪过的文件（不包括新增的文件）暂存起来一并提交，从而省略`git add`步骤。

```javascript
git commit -a -m 'message'
```

#### 版本回退（可撤销提交）

&emsp;&emsp;;`Git`撤销提交可通过版本回退的方式实现，回退到当前版本库的上一个版本，执行如下命令。其中`HEAD`表示当前版本库，上上一个版本库就是`HEAD^^`，往上`100`个版本库为`HEAD~100`。

```javascript
git reset --hard HEAD^
```

&emsp;&emsp;回退具体哪个版本库，`--hard`后为校验和。校验和没必要写全，前几位就可以了。回退至过去某个版本后，`git log`只能查看之前的所有提交，若要回到未来哪个版本，用`git reflog`查看提交历史，从而获取校验和。

```javascript
git reset --hard 8b9b5aa
```

#### 追加提交（修改提交信息）

&emsp;&emsp;某次提交少提交了部分未暂存的修改，即有部分修改未暂存就提交了，不想再另外生成一条提交记录，而是追加到刚才的提交中。首先暂存那部分修改，执行如下命令，重新编辑提交信息。若仅修改提交信息也可执行如下命令。注意修正后会改变提交的校验和。

```javascript
git commit --amend
```

### Git 状态

#### 概述

- `Untracked`：未跟踪，即未被`Git`纳入版本控制的文件。在一个已经存在文件的文件夹（不是空文件夹）中初始化`Git`仓库，这个仓库下所有文件均为未跟踪。`Git`仓库内新建的文件也是未跟踪。
- `Unmodified`：未修改，已跟踪状态的一种。克隆某个仓库后，工作目录中的所有文件都处于未修改。暂存区的文件被提交也都处于未修改。
- `Modified`：已修改，已跟踪状态的一种。未修改状态文件被编辑或删除，处于已修改。
- `Staged`：已暂存，已跟踪状态的一种。已修改被暂存的文件都处于已暂存。

![](/other/git/upper-status.jpg)

#### git status

&emsp;&emsp;查看哪些文件处于什么状态，可以用`git status`命令。克隆仓库后运行如下命令，提示在`master`分支没有任何提交的文件，工作区干净，即所有已跟踪文件在上次提交后都未被更改。

```javascript
git status
On branch master
nothing to commit, working tree clean
```

&emsp;&emsp;;`git status`可打印工作区未跟踪的新文件。注意若`.gitignore`文件忽略了指定文件，执行`git status`不会打印。

```javascript
git status
On branch master
Untracked files:
  ...
     readme.md
  ...
```

&emsp;&emsp;若已跟踪文件处于未修改状态，编辑后运行`git status`，文件会被标记为红色`modified`。删除已跟踪文件，文件会被标记为红色`deleted`。重命名或移动文件，原名称或原位置文件被标记为红色`deleted`，新名称或新位置文件为未跟踪状态。不同分支对同一文件做了不同修改合并后产生冲突的文件，被标记为红色`both modified`。

```javascript
git status
On branch master
Changes not staged for commit:
  ...
         deleted:    file.txt
        modified:   index.js
Unmerged paths:
  ...
        both modified:   readme.md
```

&emsp;&emsp;运行`git add`后未跟踪文件、删除文件、修改文件或解决冲突的文件、重命名或移动文件会分别被标记为绿色`new file`、`deleted`、`modified`、`renamed`。

```javascript
On branch master
Changes to be committed:
  ...
        new file:   readme.md
        deleted:    file.txt
        modified:   readme.md
        renamed: o.txt -> n.txt
        renamed: location.txt -> file/location.txt
```

&emsp;&emsp;;`git status`命令输出十分详细，执行如下命令查看简化信息，其中`-s`为`--short`简写。新添加的未跟踪文件前面有`??`标记，新添加到暂存区中的文件前面有`A`标记，修改过的文件前面有`M`标记，删除的文件前面有`D`标记。靠右边的`M`表示该文件被修改了但是还没放入暂存区，靠左边的`M`表示该文件被修改了并放入了暂存区，`D`同理。出现`MM`表示在工作区被修改并提交到暂存区后又在工作区中被修改了，所以在暂存区和工作区都有该文件被修改了的记录。

```javascript
git status -s
?? ...
A  ...
M  ...
 M ...
MM ...
D ...
 D...
```

#### git diff

&emsp;&emsp;;`git status`命令的输出不知道具体修改了什么地方，可以用`git diff`命令。当工作区修改文件，修改未暂存，`diff`对比的是工作区和最近一次版本库的文件差异。工作区文件修改并暂存，`diff`对比的是工作区和暂存区的文件差异，即`git diff`本身只显示**尚未暂存**的改动。若工作区文件第一次修改并暂存，第二次修改后，执行`git diff`就能查看尚未暂存的改动。

```javascript
git diff
```

&emsp;&emsp;查看暂存区和最近一次版本库的文件差异，其中`--staged`和`--cached`等价。

```javascript
git diff --cached
```

&emsp;&emsp;查看工作区和最近一次版本库的差异，`HEAD`后可接某次版本库的校验和，即查看工作区和某个版本库之间的差异。

```javascript
git diff HEAD
```

&emsp;&emsp;查看不同分支最后一次提交的文件差异，`--static`查看简略差异。

```javascript
git diff master dev
```

### Git 日志

#### 常用选项

&emsp;&emsp;;[git log](https://git-scm.com/docs/git-log) 会按提交时间列出所有的更新，最近的更新排在最上面。 包括每个提交的校验和、作者的名字和电子邮箱、提交时间以及提交说明。

```javascript
git log
```

&emsp;&emsp;如果日志很多，`Git`默认会以分页方式展示，空格可以翻下一页，`Ctrl + B`翻上一页，`q`退出。若不分页，运行如下命令显示全部日志。

```javascript
git --no-pager log
```

&emsp;&emsp;;`git log`有许多选项可以帮助搜寻特定的提交。

- `-p`：按补丁格式显示每个更新之间的`diff`差异，可用于代码审查
- `--stat`：显示每个修改的文件增改行统计和此次提交的文件修改统计
- `--shortstat`：显示此次提交的文件修改统计
- `--name-only`：显示每个已修改的文件
- `--name-status`：显示每个已修改的文件并附带修改标记（`A`、`M`、`D`等）
- `--abbrev-commit`：显示部分校验和
- `--relative-date`：提交时间显示相对时间
- `--graph`：图形显示分支合并历史
- `--pretty`：格式化输出信息，包括可用选项`oneline`（校验和和提交说明）、`short`（不含提交时间）、`full`（作者和提交者的名字和电子邮箱）、`fuller`（日志追加提交者信息）、`format`（定制要显示的记录格式），其余可参考 [官方文档](https://git-scm.com/docs/pretty-formats)。

#### 自定义格式

&emsp;&emsp;若只显示提交说明，运行如下命令。

```javascript
git log --pretty=format:"%s"
```

&emsp;&emsp;以下为`git log --pretty=format`常用的格式占位符写法及其代表的含义。其中作者指的是实际作出修改的人，提交者指的是最后将此工作成果提交到仓库的人。当`A`为某个项目发布补丁，然后某个核心成员`B`将`A`的补丁并入项目时，`A`就是作者，而那个核心成员`B`就是提交者。

- `%H`：完整校验和，提交对象哈希字符串
- `%h`：部分校验和
- `%an`：作者
- `%ae`：作者的电子邮箱
- `%ad`：作者修订日期，`--date`选项定制时间格式
- `%ar`：作者修订日期（相对时间）
- `%cn`：提交者
- `%ce`：提交者的电子邮箱
- `%cd`：提交日期
- `%cr`：提交日期（相对时间）
- `%s`：提交说明

#### 时间格式

&emsp;&emsp;当前示例时间`2020/12/15 18:23:13`星期三，若只显示年份运行如下命令 。

```javascript
git log --pretty=format:"%ad" --date=format:'%Y'
```

&emsp;&emsp;以下为常用时间格式占位符。

- `%c`：格式化输出日期时间`Tue Dec 15 18:23:13 2020`
- `%x`：格式化输出短日期 `12/15/20`
- `%X`：格式化输出短时间 `18:23:13`
- `%Y`：年份 `2020`
- `%y`：年份 `20`
- `%B`：月份 `December`
- `%b`：月份 `Dec`
- `%d`：日期 `15`
- `%H`：`24`小时制 `18`
- `%I`：`12`小时制 `06`
- `%M`：分钟 `23`
- `%S`：秒 `13`
- `%A`：星期 `Tuesday`
- `%a`：星期 `Tue`
- `%w`：星期（`0~6`） `3`
- `%p`：上下午（`AM/PM`） `PM`
- `%j`：一年的第几天 `350`
- `%U`：一年的第几周（星期日作为每周的第一天） `50`
- `%W`：一年的第几周（星期一作为每周的第一天） `50`
- `%`：时区 `+0800`

#### 筛选

&emsp;&emsp;如下命令筛选作者是`DonG`，时间在`2020-12-15 22:20:20`后，提交信息包括`update`，删除或添加字符串`cname`的最近`5`条提交。

```javascript
git log --author=DonG --after="2020-12-15 22:20:20" --grep="update" -Scname -5
```

&emsp;&emsp;以下为`Git`筛选限制符。

- `-n`：最近的`n`条提交
- `--author`：指定作者的提交
- `--committer`：指定提交者相关的提交
- `--after`，`--since`：指定时间之后的提交
- `--before`，`--until`：指定时间之前的提交
- `--grep`：提交信息含指定关键字的提交
- `-S`：修改内容中删除或添加了某个关键字的提交

#### 自定义命令

&emsp;&emsp;配置自定义`git log`，运行 `git lg`即可。

```javascript
git config --global alias.lg "log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset'"
```

### .gitignore

&emsp;&emsp;工作区有些文件无需纳入`Git`的管理，也不希望它们出现在未跟踪文件列表。可以创建一个名为`.gitignore`的文件，列出要忽略的文件模式，文件`.gitignore`的格式规范如下。注意`.gitignore`只能忽略那些原来没有被跟踪的文件，如果某些文件已经被纳入了版本管理中，则修改`.gitignore`是无效的。

- 所有空行或者以`#`开头的行都会被`Git`忽略
- 可以使用标准的`glob`模式匹配
- `/`开头忽略根目录下文件
- `/`结尾忽略指定目录及目录下文件
- 要忽略指定模式以外的文件或目录，可以在模式前加上`!`取反

```javascript
# 忽略所有 .log 结尾的文件
*.log

# 仅忽略项目根目录下的 TODO 文件，不包括 dir/TODO
/TODO

# lib.c 除外
!lib.c

# 忽略 doc/c.md
doc/?.md

# 忽略 dist 及其目录下的所有文件
dist/

# 忽略/foo、a/foo、a/b/foo等
**/foo
```

&emsp;&emsp;;`glob`模式是指`shell`所使用的简化了的正则表达式。

- `*`匹配零个或多个任意字符
- `?`只匹配一个任意字符
- `[abc]`（`a`或`b`或`c`）匹配任何一个在方括号中的字符
- `[0-9]`（匹配所有`0`到`9`的数字）在方括号中使用短划线分隔两个字符，表示所有在这两个字符范围内的都可以匹配
- 使用`**`表示匹配任意中间目录，比如`a/**/z`可以匹配`a/z`、`a/b/z`或`a/b/c/z`等

### 远程仓库

#### 查看

&emsp;&emsp;查看已经配置的远程仓库，运行`git remote`打印每一个远程仓库的简写。 如果已克隆了远程仓库，至少能看到`Git`给克隆仓库的默认名字`origin`。

```javascript
git remote
origin
```

&emsp;&emsp;查看关联的远程仓库简写及其`URL`。

```javascript
git remote -v
```

&emsp;&emsp;查看某一个远程仓库的更多详细信息。

```javascript
git remote show origin
```

#### 添加

&emsp;&emsp;关联一个新的`Git`远程仓库，其中`github`为关联的远程仓库的简写。注意执行如下命令的目录必须是`Git`仓库，否则无法关联，运行`git init`初始化后再关联。

```javascript
git remote add github https://github.com/username/repo.git
```

#### 移除

&emsp;&emsp;移除一个远程仓库。

```javascript
git remote rm origin
```

#### 重命名

&emsp;&emsp;修改远程仓库的简写，运行如下命令将`origin`重命名为`github`。

```javascript
git remote rename origin github
```

### 标签

#### 查看

&emsp;&emsp;;`Git`默认以字母顺序列出标签。

```javascript
git tag
```

&emsp;&emsp;使用特定的模式查找标签。

```javascript
git tag -l 'v1.8.5*'
```

&emsp;&emsp;查看标签信息与对应的提交信息。

```javascript
git show v1.8.5
```

#### 创建

&emsp;&emsp;;`Git`主要使用两种类型的标签，轻量标签和附注标签。其中轻量标签，只是某一次提交的引用。附注标签则包括创建标签的日期时间、创建者的名字和电子邮箱和标签信息，附注标签是存储在`Git`仓库中的一个完整对象。运行如下命令创建一个轻量标签。

```javascript
git tag v1.8.5
```

&emsp;&emsp;创建附注标签时，`-m`指定存储在标签中的标签信息，若没有指定，`Git`会运行编辑器要求输入信息。

```javascript
git tag -a v1.8.5 -m 'version 1.8.5'
```

&emsp;&emsp;对历史提交记录创建标签，使用如下命令，末尾指定某次提交的校验和或部分校验和。

```javascript
git tag -a v1.8.0 9fceb02
```

#### 推送

&emsp;&emsp;;`git push`命令并不会推送标签到远程仓库，创建完标签必须显示地推送到远程仓库。

```javascript
git push origin v1.8.5
```

&emsp;&emsp;一次性推送多个标签，可使用`--tags`选项。

```javascript
git push origin --tags
```

#### 删除

&emsp;&emsp;删除本地标签。

```javascript
git tag -d v1.8.5
```

&emsp;&emsp;若标签已推送至远程仓库，删除本地标签后，再执行如下命令。其实在路径`.git/refs/tags`下就存储了所有的`tags`信息。注意`git push origin --delete v1.8.5`可以删除远程仓库的标签，当远程仓库分支和标签重名时，运行时会报错，但是输入失误可能删除远程仓库分支，不推荐使用。

```javascript
git push origin :refs/tags/v1.8.5
```

#### 创建分支

&emsp;&emsp;若想创建一个分支，分支与版本库中某个标签版本完全一样，可使用如下命令。

```javascript
git checkout -b dev1.8.5 v1.8.5
```

### Git 别名

&emsp;&emsp;若不想每次都输入完整的`Git`命令，可以通过`git config`命令为每一个命令设置一个别名。如下配置了一个`git last`，显示最后一次提交信息。

```javascript
git config --global alias.last 'log -1'
```

## Git 分支

### 概述

&emsp;&emsp;暂存时`Git`会为每一个文件计算校验和（`SHA-1`散列，`40`个十六进制字符组成的字符串，根据`Git`中文件的内容或目录结构计算出来的），然后会把当前版本的文件快照（`blob`对象）保存到`Git`仓库中，最终将校验和加入到暂存区域等待提交。

&emsp;&emsp;提交时`Git`会计算每一个子目录的校验和，然后将校验和保存为树对象。再创建一个提交对象，包含作者信息、提交信息和指向父提交对象的指针。

&emsp;&emsp;最终仓库中包括若干个`blob`对象（保存文件快照）、一个树对象（记录目录结构和`blob`对象索引）以及一个提交对象（包含树对象的指针和提交信息）。

&emsp;&emsp;每次提交产生的提交对象都包含一个指向上次提交对象（父对象）的指针。

&emsp;&emsp;分支其实本质上仅仅是指向提交对象的可变指针。`Git`默认分支名字是`master`，`git init`初始化仓库后，不存在提交对象，所以也没有分支，手动`git branch`创建分支也不会生效。首次提交后`Git`自动创建`master`分支，并且它会在每次提交操作中自动向前移动。

&emsp;&emsp;;`Git`有一个名为`HEAD`的特殊指针判断当前处于哪个分支，可以理解为`HEAD`为当前分支的别名。

### 本地分支

#### 查看

&emsp;&emsp;查看所有分支，其中`*`绿色高亮的是当前所处分支，即`HEAD`指向的分支。

```javascript
git branch
```

&emsp;&emsp;查看所有分支最近一次提交的提交信息和部分校验和，其中`-v`是`--verbose`的简写。

```javascript
git branch -v
```

&emsp;&emsp;查看列表中尚未合并到当前分支的分支运行如下命令。 查看哪些分支已经合并到当前分支，可以运行`git branch --merged`。

```javascript
git branch --no-merged
```

#### 切换

&emsp;&emsp;切换分支执行如下命令，`git switch dev`也能切换分支，并且语义上更好理解。

```javascript
git checkout dev
```

#### 创建

&emsp;&emsp;运行如下命令创建本地分支，其中`dev`为本地分支名。

```javascript
git branch dev
```

&emsp;&emsp;创建并切换分支运行如下命令，或者运行`git switch -c dev`命令。

```javascript
git checkout -b dev
```

&emsp;&emsp;提交历史中，指定某一次提交创建新分支。

```javascript
git branch dev 375ea5e
```

&emsp;&emsp;远程仓库分支创建本地分支，注意此方式创建的本地分支为跟踪分支。

```javascript
git branch dev origin/master
```

#### 合并

&emsp;&emsp;合并其他分支的修改到当前分支，其中`dev`为即将合并到当前分支的分支。若当前分支所指向的提交是`dev`的直接上游，则`Git`只是简单的将指针向前移动。当试图合并两个分支时，如果顺着一个分支走下去能够到达另一个分支，那么`Git`在合并两者的时候，只会简单的将指针向前推进（指针右移），因为此种情况下的合并操作没有需要解决的分歧，即快进`fast-forward`。

&emsp;&emsp;若当前分支的提交与`dev`分支的提交没有直接关联，即两个分支一开始有一个共同的父提交对象，但是两分支提交了很多次记录，合并时`Git`会做一个简单的三方合并，包括父提交对象、两个分支最近一次的提交对象，将此次三方合并的结果做了一个新的快照并且自动创建一个新的提交。以上称为一次合并提交，生成的提交对象有两个父对象。

```javascript
git merge dev
...
Fast-forward
...
```

&emsp;&emsp;在两个不同的分支中，对同一个文件的同一个部分进行了不同的修改，在合并的时候就会产生合并冲突。此时`Git`做了合并，但是不会自动地创建合并提交。`Git`会暂停下来，等待解决合并产生的冲突。 在产生合并冲突后可使用`git status`命令查看包含合并冲突而处于未合并`unmerged`状态的文件。

```javascript
git merge dev
...
Automatic merge failed; fix conflicts and then commit the result.

git status
...
Unmerged paths:
  ...
        both modified:   readme.md
```

&emsp;&emsp;;`Git`会在有冲突的文件中加入标准的冲突解决标记，可以打开包含冲突的文件然后手动解决。出现冲突的文件会包含一些特殊区段，`HEAD`即当前分支的修改在`=======`的上半部分，而`dev`分支所做的修改在`=======`的下半部分。为了解决冲突，必须选择使用由`=======`分割的两部分中的一个，或者也可以自行合并这些内容。

```javascript
<<<<<<< HEAD
hello world
=======
hi world
>>>>>>> dev
```

&emsp;&emsp;并且不管`<<<<<<<`、`=======`和`>>>>>>>`标记是否完全删除，只要对冲突文件执行`git add`，那么则将其标记为冲突已解决。确定之前有冲突的的文件都已经暂存了，可以输入`git commit`来完成提交。

&emsp;&emsp;禁止快进式合并且生成一个新的提交。由于快进式合并会把`dev`的零碎提交历史混入，搅乱当前分支的提交历史，若要合并过程仅生成一条合并记录，执行如下命令。

```javascript
git merge --no-ff dev
```

&emsp;&emsp;若当前分支合并某个分支`dev`，但是`dev`上存在太多琐碎的提交，其实仅仅一条提交记录就行。运行如下命令，接受`dev`分支上的所有修改，将其压缩成一次变更，然后应用到当前分支上，最后再暂存更改并提交。

```javascript
git merge --squash dev
```

#### 删除

&emsp;&emsp;删除分支运行如下命令，若某个分支包含未合并的修改，将不能删除分支，运行`git branch -D dev`强制删除。

```javascript
git branch -d dev
```

### 远程分支

#### 简述

&emsp;&emsp;远程分支（`remote branch`）即远程仓库的普通分支。

&emsp;&emsp;远程跟踪分支（`remote-tracking branch`）是从服务器上获取，以`remote/branch`形式命名，作用是告诉用户其所跟踪的远程分支的状态（即指向哪一个提交对象），因此用户只读不能移动，在与远程仓库通信（`fetch`、`push`等）时会自动移动。

&emsp;&emsp;跟踪分支（`tracking branch`）即跟踪了远程分支的本地分支。跟踪分支与远程分支有直接关系，在一个跟踪分支上输入`git pull`，`Git`能自动地识别去哪个服务器上抓取、合并到哪个分支。

&emsp;&emsp;当克隆一个仓库时，会自动创建一个远程跟踪分支`origin/master`和一个跟踪分支`master`。

&emsp;&emsp;跟踪分支`master`产生多个提交，推送到远程仓库`origin`的`master`分支时，远程跟踪分支`origin/master`自动移动指向此次提交。

&emsp;&emsp;远程分支`master`产生多个提交，运行`git fetch`获取远程分支的最新提交，远程跟踪分支自动指向获取的最新提交。再运行`git merge`将最新提交合并到跟踪分支`master`，`git pull`等同于获取`fetch`和合并`merge`。

#### 查看

&emsp;&emsp;查看远程引用列表，远程引用是对远程仓库的引用，包括分支、标签等，其中`origin`为关联的远程仓库简写。

```javascript
git ls-remote origin
```

&emsp;&emsp;查看远程仓库更多信息。

```javascript
git remote show origin
```

&emsp;&emsp;查看所有远程跟踪分支。

```javascript
git branch -r
```

&emsp;&emsp;查看所有分支，`-a`为`--all`简写。

```javascript
git branch -a
```

&emsp;&emsp;查看本地分支与远程分支关联信息，最近一次提交信息和部分校验和，同时显示每一个分支正在跟踪哪个远程分支与本地分支是否是领先、落后或是都有。

```javascript
git branch -vv
```

#### 推送

&emsp;&emsp;跟踪分支推送修改，运行如下命令，`Git`自动识别推送到哪个远程仓库的分支。

```javascript
git push
```

&emsp;&emsp;本地仓库比远程仓库的版本低，通常情况下是先拉取再推送，运行如下命令强制推送，覆盖远程仓库历史。多人协作模式切勿使用，否则可能会直接覆盖其他人的修改。其中`-f`是`--force`简写。

```javascript
git push -f
```

&emsp;&emsp;推送本地分支到远程仓库，其中`HEAD`为当前分支，`origin`为远程仓库简写，`master`为远程仓库分支，即推送当前分支到远程仓库`origin`的`master`分支。若远程没有`master`分支，会自动创建`master`分支。

```javascript
git push origin HEAD:master
```

&emsp;&emsp;若当前所在分支为`dev`，推送到远程`dev`分支，可执行如下命令。

```javascript
git push origin dev
```

&emsp;&emsp;推送本地分支到一个命名不相同的远程分支，如下将本地`dev`分支推送到远端`develop`分支。

```javascript
git push origin dev:develop
```

&emsp;&emsp;推送本地分支同时跟踪远程分支，其中`origin`为远程仓库简写，`master`为本地分支。

```javascript
git push -u origin master
```

#### 跟踪分支

&emsp;&emsp;创建跟踪分支，即创建`dev`分支跟踪远程仓库`origin`的`dev`分支。

```javascript
git checkout --track origin/dev
```

&emsp;&emsp;自定义本地分支名称，其中`dev`为本地分支名称，`origin/dev`为远端`dev`分支。

```javascript
git checkout -b dev origin/dev
```

&emsp;&emsp;已有的本地分支跟踪远程分支，或者修改跟踪的远程分支，`-u`与`--set-upstream-to`等价。

```javascript
git branch -u origin/dev
```

#### 取消跟踪

&emsp;&emsp;取消跟踪某个远程分支，运行如下命令。

```javascript
git branch --unset-upstream
```

#### 获取

&emsp;&emsp;跟踪分支执行如下命令，`Git`自动获取哪个远程仓库的分支的最新提交。

```javascript
git fetch
```

&emsp;&emsp;获取远程仓库的全部更新，并拥有那个远程仓库中所有分支的引用，可以随时合并或查看。

```javascript
git fetch origin
```

&emsp;&emsp;获取远程仓库某个分支的更新。

```javascript
git fetch origin master
```

#### 合并

&emsp;&emsp;跟踪分支执行如下命令，`Git`自动合并哪个远程跟踪分支的最新提交。

```javascript
git merge
```

&emsp;&emsp;当前分支合并远程跟踪分支，远程跟踪分支在`git fetch`拉取的最新数据。

```javascript
git merge origin/master
```

&emsp;&emsp;合并没有共同祖先的分支。

```javascript
git merge origin/master --allow-unrelated-histories
```

#### 拉取

&emsp;&emsp;跟踪分支执行如下命令，`Git`自动获取并合并最新修改。

```javascript
git pull
```

&emsp;&emsp;拉取远程仓库某个分支的更新并合并。

```javascript
git pull origin master
```

&emsp;&emsp;拉取没有共同祖先的分支，即合并两个独立分支的历史。

```javascript
git pull origin master --allow-unrelated-histories
```

#### 删除

&emsp;&emsp;删除远程分支，运行如下命令。

```javascript
git push origin --delete dev
```

### 变基

#### 概述

&emsp;&emsp;整合来自不同分支的修改的另一种办法，将提交到某一分支上的所有修改都移至另一分支上，使提交历史是一条直线没有分叉。

&emsp;&emsp;原理是首先找到两个分支（即当前分支`experiment`、目标分支`master`）的最近共同祖先`C2`，然后对比当前分支相对于祖先`C2`的历次提交，提取相应的修改并存为临时文件，最后将临时文件的修改依照顺序应用到`C3`形成`C4'`。

![](/other/git/upper-rebase.png)

#### 命令

&emsp;&emsp;将当前分支的修改变基到目标分支`master`，运行如下命令。

```javascript
git rebase master
```

&emsp;&emsp;将指定分支的修改变基到目标分支，其中`dev`为指定分支，`master`为目标分支。

```javascript
git rebase master dev
```

&emsp;&emsp;取出`dev`分支，找出处于`dev`分支和`develop`分支的共同祖先之后的修改，然后把它们在`master`分支上重放一遍。

```javascript
git rebase --onto master develop dev
```

&emsp;&emsp;变基过程也可能产生冲突，`Git`会暂停变基并告知用户哪个文件导致冲突。

&emsp;&emsp;其中`git rebase --abort`撤销变基，恢复分支状态为调用`git rebase`之前。

&emsp;&emsp;;`git rebase --skip`跳过冲突文件，即丢弃引起冲突的某次提交的全部修改，后果非常严重，不慎使用可通过`git reflog`查看部分校验和再版本回退。

&emsp;&emsp;也可手动修改冲突文件，`git add`暂存更改后运行`git rebase --continue`继续处理变基的其余部分。

#### 风险

&emsp;&emsp;若在已经被推送至公共仓库的提交上执行变基命令，可能出现较大麻烦，造成提交历史混乱，严重将丢弃掉部分修改。之前拉取了公共仓库提交的其他人可执行`git pull --rebase`命令或者执行如下分解命令。

&emsp;&emsp;一般把变基命令当作是在推送前清理提交使之整洁的工具，并且只对尚未推送的修改执行变基操作清理历史，坚决不对已推送至别处的提交执行变基操作，可避免变基造成的麻烦。

```javascript
git fetch
git rebase origin/master
```

## Git 多仓库化

### 协议

&emsp;&emsp;;`Git`支持多种传输协议，`https://`协议、`git://`协议或者`SSH`传输协议等。

&emsp;&emsp;本地协议`local protocol`中的远程版本库就是硬盘内的某一个目录。优点是使用现有的文件权限和网络访问权限，把裸版本库的副本放到其他人可访问的路径，并设置好读写权限即可。缺点是不方便从多个位置多个地点访问。

&emsp;&emsp;;`HTTP`协议为运行在标准的`HTTP/S`端口上并且可以使用各种`HTTP`验证机制，优点是不同的访问方式只需一个`URL`并且服务器只在需授权时提示输入授权信息。缺点是在一些服务器上架设`HTTP/S`协议的服务端可能比较棘手以及管理用户凭证比较麻烦一些，可借助凭证存储工具。

&emsp;&emsp;;`SSH`协议支持读写的网络协议，优点是安全性高，传输数据都要经过授权和加密。缺点是不能匿名访问，读取数据也要授权，不利于开源的项目。

&emsp;&emsp;;`Git`协议是`Git`自带的网络协议，优点是没有授权机制，省去了加密和授权的开销。缺点是授权机制不灵活，要么都能推送，要么都不能。

### 本地版本库

&emsp;&emsp;;`D`盘根目录下初始化裸仓库（`bare repository`），即一个没有工作区的仓库，故不能在此目录下执行一般`Git`命令，通常是作为远端的中心仓库而存在的。其中`repo.git`仅为文件夹名称，`.git`后缀可加可不加，但是一般`Git`版本库都添加`.git`后缀。

```javascript
git init --bare repo.git
```

&emsp;&emsp;克隆本地裸仓库，克隆后的仓库可进行推送`push`、拉取`pull`等操作。

```javascript
git clone D:/repo.git
```

&emsp;&emsp;首次克隆的仓库内`pull`会出错，推送一次提交即可，之后克隆的仓库再`pull`就不会出错。

```javascript
git pull
Your configuration specifies to merge with the ref 'refs/heads/master'
from the remote, but no such ref was fetched.
```

&emsp;&emsp;克隆某个仓库为裸仓库，其中`D:/respos`为本地仓库路径，`repos.git`为克隆后生成的裸仓库，包括历史提交记录和文件快照。

```javascript
git clone --bare D:/repos repos.git
```

### HTTP 免登录

&emsp;&emsp;运行如下命令，`Git`在验证用户名和密码时会首先向指定的凭据管理器查找凭据，若凭据不存在则提示输入用户名和密码，然后凭据管理器记录凭据，如果凭据存在，则直接使用。

```javascript
git config --global credential.helper manager
```

&emsp;&emsp;运行如下命令，则用户名和密码都明文保存在`C:/Users/{username}/.git-credentials`中，验证通过后用户名和密码会被保存。

```javascript
git config --global credential.helper store
```

### SSH 公钥

&emsp;&emsp;运行`cd ~/.ssh`命令，切换到用户主目录中`C:/Users/{username}/.ssh`文件夹，切换失败说明文件夹不存在。若切换成功，运行`ls`查看文件夹下文件，创建过`SSH Key`会打印`id_rsa`和`id_rsa.pub`两个文件，`id_rsa.pub`是公钥，`id_rsa`是私钥。

```javascript
cd ~/.ssh
ls
id_rsa  id_rsa.pub
```

&emsp;&emsp;若`.ssh`文件夹不存在或者公钥和私钥不存在，运行如下命令创建，其中`username@email.com`为个人邮箱地址，一路回车使用默认值即可。

```javascript
ssh-keygen -t rsa -C "username@email.com"
```

&emsp;&emsp;运行`cat ~/.ssh/id_rsa.pub`查看生成的公钥内容。

```javascript
cat ~/.ssh/id_rsa.pub
ssh-rsa ...
```

&emsp;&emsp;在远端粘贴公钥内容，标题用来区分`SSH`公钥。本地克隆远端仓库，若`.ssh`文件夹缺少`known_hosts`文件，`Git`提示如下信息，键入`yes`自动生成。克隆完成后仓库可进行正常的拉取、推送等。

```javascript
git clone git@github.com:username/repo.git
Cloning into 'repo'...
...
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
```

## 分布式 Git

### 工作流（workflow）

#### 集中式工作流

&emsp;&emsp;一个中心仓库，若干个开发者作为节点与之进行同步。

&emsp;&emsp;只使用`master`分支进行开发。

&emsp;&emsp;一般开发流程为开发者克隆`master`分支到本地，本地开发提交后获取远程仓库，若产生冲突本地合并后再推送至远程仓库。

&emsp;&emsp;优点是适用于小团队，工作方式简单。缺点是不同开发人员提交日志混杂，难以定位问题。

#### 功能分支工作流

&emsp;&emsp;在集中式工作流基础上，为不同功能开发分配单独的功能分支。

&emsp;&emsp;分支为`master`主分支和若干`feature`功能分支。

&emsp;&emsp;开发流程为主分支检出若干`feature`功能分支，开发者完成某个功能分支推送到中央仓库的功能分支上，然后在中央仓库功能分支上发起`full request`请求将功能分支合并到`master`分支，请求后可对代码进行评审（`code review`）和讨论。

&emsp;&emsp;优点是相较于集中式工作流功能开发更细致，更灵活，代码更加稳定。缺点是对于大型项目而言，不同的分支要分配更加具体的角色。

#### Gitflow 工作流

&emsp;&emsp;仍有一个中心仓库和若干开发者作为节点，唯一区别在于项目的分支结构，不同分支赋予不同的角色。

&emsp;&emsp;主要分支为`master`和`develop`，协助分支`feature`、`release`和`hotfix`。

- `master`为对外发布分支。只读唯一分支，只能从`release`和`hotfix`合并，不可修改。所有在`master`分支的推送应标记上版本标签
- `develop`为主开发分支。只读唯一分支，只能从其他分支合并
- `feature`为功能开发分支，可同时存在多个且多个功能并行开发，开发结束合并到`develop`分支
- `release`为预发布分支，只能从`develop`分支检出，检出分支修复`bug`后合并到`master`和`develop`
- `hotfix`为热更新分支，线上`bug`修复分支，只能从`master`检出，检出分支修复`bug`后合并到`develop`和`master`

![](/other/git/upper-gitflow.png)

&emsp;&emsp;主要工作流程如下。

- 初始化项目，默认创建`master`分支，`master`分支检出`develop`分支
- `develop`分支检出`feature`分支，多个开发者检出多个`feature`并行开发
- `feature`分支开发完成，合并至`develop`分支，可删除`feature`分支，不删除则不可再更改
- `develop`分支检出`release`分支进行提测，测试出`bug`在`release`修复，修复完成合并至`develop`分支和`master`分支，合并至`master`分支时再打上版本标签，可删除`release`分支，不删除则不可再更改
- 上线之后发现线上`bug`，`master`分支检出`hotfix`分支
- `hotfix`分支修复测试后合并至`develop`分支和`master`分支，合并至`master`分支时打上修复后标签，可删除`hotfix`分支，不删除则不可再更改

&emsp;&emsp;优点是分支角色明确，提交日志清晰，出现问题也很容易定位，项目稳定性非常高。缺点是不适用于小团队，过多的分支结构显得复杂。

#### Forking 工作流

&emsp;&emsp;分布式工作流，充分利用了`Git`在分支和克隆上的优势。安全可靠地管理大团队的开发者，能接受不信任贡献者的提交。

&emsp;&emsp;主要分支为远程仓库`master`分支、`feature`功能分支。

&emsp;&emsp;主要工作流程如下。

- 派生（`fork`）一个服务端的正式仓库`A`，派生后的仓库`B`处在远程服务端。
- 克隆派生后的远程仓库`B`为本地仓库`C`（`git clone B`）
- 为本地仓库`C`关联（`git remote add upstream A`）远程正式仓库`A`，目的及时地保持本地仓库`C`和正式仓库`A`的同步更新
- 本地仓库`C` `master`分支检出`feature`分支
- 本地仓库`feature`分支进行开发工作
- 本地仓库`feature`分支完成开发任务，获取正式仓库的更新（`git fetch upstream master`），合并更新（`git merge upstream/master`）
- 合并完成推送本地`feature`分支到远程仓库`B` `feature`分支（`git push origin feature`）
- 远程仓库`B`发起`pull request`请求将`feature`分支合并到正式仓库`A`
- 正式仓库`A`维护者决定是否合并到正式代码库，方式一为直接在`pull request`中查看代码，比较变更的差异，做评注和执行合并。若出现了合并冲突，执行如下方式二，维护者本地仓库获取派生仓库`B` `feature`分支修改并合并，再推送至正式仓库`A`

```javascript
git fetch https://github.com/username/B.git feature
git checkout master
git merge FETCH_HEAD
```

### 拣选

#### 命令

&emsp;&emsp;拣选取出某次提交，之后尝试将其重新应用到当前分支。其中`cherry-pick`后为某次提交的部分校验和。

```javascript
git cherry-pick 9fceb0
```

&emsp;&emsp;拣选多个提交。

```javascript
git cherry-pick 9fceb0 1359a9 ceb036
```

#### 冲突合并

&emsp;&emsp;若拣选提交`D`，将其应用到`F`，拣选的是`D`基于`C`的补丁。即将`D`对于`C`的变化在`F`上重放一遍。

```javascript
       C —— D <-- dev
      /
A —— B —— E —— F <-- master
```

&emsp;&emsp;由于拣选的是某次提交对于父对象的变化，因此可能产生冲突。如上若`C`新增文件`readme.md`，`D`修改`readme.md`部分信息，而`F`中根本没有`readme.md`，此次拣选就会产生冲突，因为`readme.md`的修改无法应用到`F`中的`readme.md`。此时`cherry-pick`会停下来，由用户决定如何操作。

- `--continue`：用户解决冲突后，`git add`将文件标记为已解决，运行`git cherry-pick --continue`继续执行
- `--abort`：放弃合并，恢复`cherry-pick`前的状态，即撤销`cherry-pick`
- `--quit`：中断合并，有冲突的文件需手动解决，未冲突的文件会被暂存

#### 配置项

&emsp;&emsp;;`git cherry-pick`常用配置项如下。

- `-e`：若想拣选合并后重新编辑提交信息，其中`-e`为`--edit`简写
- `-n`：若只获取拣选提交的修改并暂存，不生成提交记录，其中`-n`为`--no-commit`简写
- `-x`：在提交信息的末尾追加一行（`cherry picked from commit ...`），便于查询提交是如何产生的
- `-s`：在提交信息的末尾追加一行操作者信息（`Signed-off-by: ...`），其中`-s`为`--signoff`简写

### 提交规范

#### 书写规范

&emsp;&emsp;提交信息都包括`header`、`body`、`footer`三个部分。其中`header`是必需的，`body`、`footer`可以省略。

```javascript
<type>(<scope>): <subject>

<body>

<footer>
```

&emsp;&emsp;;`type`为提交的类型，包括如下几种。

- `feat`：新功能
- `fix`：修复`bug`
- `docs`：文档修改
- `style`：格式，修改空格缩进逗号等
- `refactor`：代码重构
- `perf`：性能提升
- `test`：添加缺失测试或更正现有测试
- `chore`：构建过程或辅助工具的变动
- `revert`：版本回退

&emsp;&emsp;;`scope`小写英文，表示修改的文件或模块范围，若涉及范围较大，可用`*`代替。

&emsp;&emsp;;`subject`提交的简短描述，不超过`50`个字符。以动词开头，使用第一人称现在时（比如`change`，而不是`changed`或`changing`），第一个字母小写，结尾不加句号（`.`）。

&emsp;&emsp;;`body`补充`object`，一般不写，修改原因、目的等相关因素。多次少量提交，而不是一次过量提交。

&emsp;&emsp;;`footer`非兼容修改（`breaking change`），以`BREAKING CHANGE`开头，后面是对变动的描述。也可以在`footer`部分关闭某些`issue`（如`Closes #123, #245`）。

```javascript
feat(doc,core): a short description of the commit

Add object, generally do not write, modify the
reason, purpose and other related factors.

Closes #123, #245

BREAKING CHANGE: description of changes.
```

#### 提交模板

&emsp;&emsp;用户目录`C:/Users/username`下新建如下`.gitmessage`模板文件。

```javascript
type(scope): subject
```

&emsp;&emsp;仓库下配置提交信息模板，当`git commit`提交时编辑器中就会显示模板中的信息占位符。

```javascript
git config --local commit.template ~/.gitmessage
```

#### 规范提交工具

&emsp;&emsp;初始化`npm`，安装 [commitizen](https://github.com/commitizen/cz-cli) 和 [cz-conventional-changelog](https://github.com/commitizen/cz-conventional-changelog)。

```javascript
cnpm install commitizen cz-conventional-changelog --save-dev
```

&emsp;&emsp;初始化配置，使其支持`angular`的提交格式，其中`--save-exact`相当于锁定版本号。

```javascript
npx commitizen init cz-conventional-changelog --save-dev --save-exact
```

&emsp;&emsp;;`package.json`添加脚本命令。

```javascript
{
    ...
    "scripts": {
        	"commit": "npx git-cz"
    }
}
```

&emsp;&emsp;运行脚本命令。

```javascript
git add --all
npm run commit
```

#### 检测提交

&emsp;&emsp;规范提交并未限制`git commit`命令提交，安装检测依赖`ghook`和`validate-commit-msg`，不满足格式的提交会被阻止。

```javascript
cnpm install ghooks  validate-commit-msg --save-dev
```

&emsp;&emsp;配置 package.json。

```javascript
{
    ...
    "config": {
        "ghooks": {
              "commit-msg": "validate-commit-msg"
        }
    }
}
```

[下一篇](middle.md)
