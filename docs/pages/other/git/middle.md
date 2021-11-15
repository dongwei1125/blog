# 比较全面的 Git 命令手册，几乎涵盖日常所有的使用场景（中）

![](/other/git/banner.jpg)

## 工具

### 单次提交

#### 日志引用

&emsp;&emsp;显示某次提交的具体信息，其中`show`后为某次提交的部分校验和。

```javascript
git show 9fceb0
```

&emsp;&emsp;查看某个分支的最后一次提交对象。

```javascript
git show master
```

&emsp;&emsp;查看某个分支指向的提交对象的校验和。

```javascript
git rev-parse master
```

&emsp;&emsp;可使用`@{n}`来引用`git reflog`中输出的记录，其中`HEAD@{n}`若为提交记录，则输出提交记录信息，若非提交记录，则输出所在的分支的最近一次提交记录。注意`reflog`引用日志只存在本地仓库，记录仓库内的操作信息，新克隆的仓库引用日志为空。

```javascript
git show HEAD@{2}
```

#### 祖先引用

&emsp;&emsp;查看某个提交的父提交信息。

```javascript
git show HEAD^
```

&emsp;&emsp;某次提交为合并提交，则其存在多个父提交，`^n`表示当前提交的第`n`父提交。若某合并提交有两个父提交，其中第一父提交为合并时所在分支的提交，第二父提交为所合并分支的提交。

```javascript
git show HEAD^2
```

&emsp;&emsp;根据指定的次数获取对应的第一父提交，如下为第一父提交的第一父提交，与`HEAD^^`等价。

```javascript
git show HEAD~2
```

### 提交区间

```javascript
       C —— D <-- dev
      /
A —— B —— E —— F <-- master
```

#### 双点

&emsp;&emsp;筛选出在一个分支中而不在另一个分支中的提交。如下命令选出在`dev`分支而不在`master`分支中的提交，即`C`和`D`提交。

```javascript
git log master..dev
```

&emsp;&emsp;也可查看即将推送到远端的某些提交，如下查看当前分支推送到远端`master`分支的提交有哪些。

```javascript
git log origin/master..HEAD
```

#### 排除

&emsp;&emsp;也可加上`^`字符或者`--not`来指明不希望包含某个分支的提交，如下三个命令等价。

```javascript
git log A..B
git log ^A B
git log B --not A
```

&emsp;&emsp;查看`A`或`B`包含的但是`C`不包含的提交。

```javascript
git log A B ^C
git log A B --not C
```

#### 三点

&emsp;&emsp;筛选被两个中的一个包含但又不包括两者同时包含的提交。如下查看`master`或`dev`中包含但是不包括两者共有提交，即`E`、`F`、`C`和`D`。

```javascript
git log master...dev
```

&emsp;&emsp;常用参数`--left-right`显示每个提交是处于哪一侧的分支。

```javascript
git log --left-right master...dev
< F
< E
> D
> C
```

### 交互式暂存

&emsp;&emsp;运行命令`git add -i`进入`Git`交互式终端模式，其中`-i`为`--interactive`简写。

```javascript
           staged     unstaged path
  1:    unchanged        +1/-1 TODO
  2:        +1/-1      nothing index.html
  3:    unchanged        +1/-1 readme.md

*** Commands ***
  1: status       2: update       3: revert       4: add untracked
  5: patch        6: diff         7: quit         8: help
What now>
```

&emsp;&emsp;其中`staged`为已暂存列表，`unstaged`为未暂存列表，`Commands`为操作命令，`What now`后键入数字序号或命令首字母操作。

- `status`：同`git status`一致，信息更简略
- `update`：暂存文件，键入`2`或`u`后输入文件对应的数字暂存文件（多个文件用`,`隔开），每个文件前面的`*`意味着选中的文件将会被暂存，`>>`提示符后不输入任何东西并回车表示执行此次命令
- `revert`：取消暂存
- `add untracked`：跟踪文件
- `patch`：部分暂存文件，类似`git add -p`
- `diff`：暂存区和最近一次提交的差异，类似`git diff --cached`
- `quit`：退出交互式终端
- `help`：命令帮助

### 部分暂存

&emsp;&emsp;执行如下命令，部分暂存更改，其中`-p`为`--patch`简写。

```javascript
git add -p
```

&emsp;&emsp;其中每一个修改的文件称为一个区块，也可分隔成多个较小的区块，区块命令如下。

- `y`：暂存此区块
- `n`：不暂存此区块
- `q`：退出，不暂存包括此区块在内的剩余的区块
- `a`：暂存此区块与此文件后面所有的区块
- `d`：不暂存此区块与此文件后面所有的区块
- `g`：选择并跳转至一个区块
- `/`：搜索正则表达示匹配的区块
- `j`：跳转至下一个未处理的区块
- `J`：跳转至下一个区块
- `k`：跳转至上一个未处理的区块
- `K`：跳转至上一个区块
- `s`：将当前的区块分割成多个较小的区块
- `e`：手动编辑当前的区块
- `?`：输出帮助

### 储藏

#### 概述

&emsp;&emsp;储藏即将还不想提交的但是已修改的内容保存至堆栈中，后续可在某个分支上恢复出堆栈中的内容。不仅可以恢复到原分支，也可以恢复到其他任意指定的分支上。作用范围包括工作区和暂存区中的修改，即未提交的修改都会保存至堆栈中。

#### 保存

&emsp;&emsp;将未提交（工作区和暂存区）的修改保存至堆栈中，不包括未跟踪的文件。

```javascript
git stash
```

&emsp;&emsp;将未提交的修改和未跟踪的文件都保存至堆栈中，其中`-u`为`--include-untracked`简写，也可执行`git stash --all`。

```javascript
git stash -u
```

&emsp;&emsp;将工作区的修改保存至堆栈，不包括未跟踪的文件，其中`-k`为`--keep-index`简写。

```javascript
git stash -k
```

&emsp;&emsp;保存至堆栈中并备注，其中`message`为备注信息。

```javascript
git stash save 'message'
```

&emsp;&emsp;保存部分修改至堆栈中，其中`-p`为`--patch`简写。

```javascript
git stash -p
```

#### 查看

&emsp;&emsp;查看堆栈中的内容。

```javascript
git stash list
```

&emsp;&emsp;运行如下命令，查看保存至堆栈中的某次修改的改动（每个修改的文件增改行统计和共计）。`git stash show`查看栈顶即最近一次保存至堆栈的修改的改动。

```javascript
git stash show stash@{3}
```

&emsp;&emsp;查看某次修改的改动的详细差异。

```javascript
git stash show stash@{3} -p
```

#### 应用

&emsp;&emsp;运行如下命令，应用某次改动到当前分支。`git stash apply`应用栈顶的改动。

```javascript
git stash apply stash@{3}
```

&emsp;&emsp;已重新应用了文件的改动，但是之前暂存的修改未被重新暂存。`--index`选项重新应用暂存的修改。

```javascript
git stash apply --index
```

#### 移除

&emsp;&emsp;移除堆栈上某次改动，`git stash drop`移除栈顶的改动。

```javascript
git stash drop stash@{3}
```

&emsp;&emsp;应用堆栈上某次改动并移除。`git stash drop`应用并移除栈顶的改动。注意若执行`git stash pop`出现冲突，实际已经应用了改动，但是改动依然在堆栈列表内，手动移除即可。

```javascript
git stash pop stash@{3}
```

&emsp;&emsp;清空堆栈列表。

```javascript
git stash clear
```

#### 分支

&emsp;&emsp;运行如下命令，将堆栈中某次改动生成一个新分支，检出储藏时所在的提交，然后应用改动，应用成功后移除改动。`git stash branch`将栈顶改动生成一个新分支。

```javascript
git stash branch dev stash@{3}
```

### 清理

#### 命令

&emsp;&emsp;;`git clean`用来从工作目录删除未被跟踪的文件。

&emsp;&emsp;主要选项如下，可指定多项并简写。

- `-f`： `--force`简写，删除时必须指定
- `-n`：`--dry-run`简写，用于显示将被删除的文件或文件夹
- `-d`：删除文件夹时必须指定
- `-x`：包括`.gitignore`忽略的文件或文件夹
- `-X`：仅为`.gitignore`忽略的文件或文件夹
- `-i`：交互式清理

&emsp;&emsp;查看将被删除的文件列表 。

```javascript
git clean -n
```

&emsp;&emsp;查看将被删除的文件和文件夹。

```javascript
git clean -d -n
```

&emsp;&emsp;删除未被跟踪的文件。

```javascript
git clean -f
```

&emsp;&emsp;删除未被跟踪的文件和文件夹。

```javascript
git clean -f -d
```

&emsp;&emsp;删除未被跟踪的文件和被`.gitignore`忽略的文件。

```javascript
git clean -f -x
```

&emsp;&emsp;仅删除被`.gitignore`忽略的文件。

```javascript
git clean -f -X
```

&emsp;&emsp;删除未被跟踪的文件和文件夹、`.gitignore`忽略的文件和文件夹，也可简写为`git clean -fdx`。

```javascript
git clean -f -d -x
```

#### 交互式清理

&emsp;&emsp;运行`git clean -i -d`进入交互模式。

```javascript
Would remove the following item:
  dist/ readme.md index.html
*** Commands ***
    1: clean                2: filter by pattern    3: select by numbers
    4: ask each             5: quit                 6: help
What now>
```

&emsp;&emsp;;`Would remove the following item`后为即将清理的文件和文件夹列表。

- `clean`：清理列表内文件和文件夹
- `filter by pattern`：排除清理列表部分文件或文件夹，全部排除清理列表为空自动退出交互模式
- `select by numbers`：选择清理列表部分文件或文件夹，均未选择清理列表为空自动退出交互模式
- `ask each`：询问方式删除列表文件或文件夹
- `quit`：退出交互式模式
- `help`：命令帮助

### 搜索

&emsp;&emsp;从工作目录中查找一个字符串或者正则表达式。

&emsp;&emsp;查找工作目录包含字符串`A`的行。

```javascript
git grep A
```

&emsp;&emsp;查找工作目录包含字符串`A`的行，并展示行号。

```javascript
git grep -n A
```

&emsp;&emsp;查找包含字符串`A`的文件。

```javascript
git grep --name-only A
```

&emsp;&emsp;统计文件中出现字符串`A`的行数，`-c`为`--count`简写。

```javascript
git grep -c A
```

&emsp;&emsp;某一行满足多个条件，如下命令满足某一行包括`A`或`B`，其中`--or`可省略。

```javascript
git grep -e A --or -e B
```

&emsp;&emsp;某一行包括`A`并且包括`B`。

```javascript
git grep -e A --and -e B
```

&emsp;&emsp;某一行包括`A`和`B`或者`A`和`C`。

```javascript
git grep -e A --and \( -e B -e C \)
```

### 交互式变基

&emsp;&emsp;用于变基时对提交历史记录进行复杂的修改，可用于调整提交顺序、改变提交中的提交信息或修改文件、压缩提交或拆分提交、也可用于移除提交等。

#### 提交区间

```javascript
D  d34...  <-- master HEAD
|
C  c23...
|
B  b12...
|
A  <-- HEAD~3
```

&emsp;&emsp;运行如下命令显示交互式变基界面，其中`-i`选项后为提交记录区间，`HEAD~3`到`HEAD`范围的提交记录，左开又闭，即为`B`、`C`和`D`。区间终点可省略，默认为`HEAD`指向的提交记录。注意`Git`从上到下依次应用每一个提交的修改，越早的提交在越上面。

```javascript
git rebase -i HEAD~3 HEAD

pick b12... B
pick c23... C
pick d34... D

# Rebase ... onto ... (3 commands)
```

#### 选项参数

&emsp;&emsp;部分选项参数如下，注意删除某一行提交即移除某个提交，全部删除变基将会终止。

- `pick`：保留某个提交
- `reword`：修改某个提交的提交信息
- `edit`：修改某个提交
- `squash`：将某个提交与上一个提交合并，可修改提交信息
- `fixup`：将某个提交与上一个提交合并
- `drop`：移除某个提交

#### 移除提交

&emsp;&emsp;将`pick`修改为`drop`，保存并退出。如下将移除`C`的提交信息。

```javascript
pick b12... B
drop c23... C
pick d34... D
```

#### 提交顺序

&emsp;&emsp;调整编辑器内提交记录顺序，保存并退出。如下将提交顺序由`B`、`C`、`D`调整为`D`、`B`、`C`。

```javascript
pick d34... D
pick b12... B
pick c23... C
```

#### 修改提交信息

&emsp;&emsp;将`pick`修改为`reword`，保存并退出。如下将修改`C`、`D`的提交信息。

```javascript
pick b12... B
reword c23... C
reword d34... D
```

&emsp;&emsp;保存并退出后进入`C`的提交信息编辑界面，然后再进入`D`的提交信息编辑界面。运行`git log --oneline`查看提交历史。

```javascript
d89... D'
c36... C'
b12... B
```

#### 压缩提交

&emsp;&emsp;将多个提交压缩为一个提交，如下将`C`、`D`压缩到`B`，并修改提交信息。

```javascript
pick b12... B
squash c23... C
squash d34... D
```

&emsp;&emsp;保存并退出将修改提交信息。

```javascript
# This is a combination of 3 commits.
# This is the 1st commit message:

B

# This is the commit message #2:

C

# This is the commit message #3:

D
```

&emsp;&emsp;也可执行如下命令，跳过修改提交信息。

```javascript
pick b12... B
fixup c23... C
fixup d34... D
```

#### 拆分提交

&emsp;&emsp;拆分一个提交为多个提交，如下将拆分提交`C`。

```javascript
pick b12... B
edit c23... C
pick d34... D
```

&emsp;&emsp;保存并退出后，`HEAD`指向提交`C`，运行`git reset HEAD^`实际是撤销`C`的提交但是保留了修改且均为未暂存。然后再多次提交，最后执行`git rebase --continue`继续变基。

```javascript
git reset HEAD^
git add readme.md
git commit -m 'C1'
git add index.html
git commit -m 'C2'
git rebase --continue
```

&emsp;&emsp;运行`git log --oneline`查看提交历史。

```javascript
d96... D
c35... C2
c46... C1
b12... B
```

### 擦除

&emsp;&emsp;使用脚本的方式改写大量提交，可全局修改邮箱地址或从每一个提交中移除一个文件。

&emsp;&emsp;;`filter-branch`选项参数如下。

- `--tree-filter`：在检出项目的每一个提交后运行指定的命令然后重新提交结果
- `--prune-empty`：若修改后的提交为空则扔掉不要
- `-f`：`--force`简写，即忽略备份强制覆盖。第二次进行擦除时会出错，即`Git`上次已做了备份，若再次运行的话会先处理掉上次的备份
- `--all`：擦除所有分支
- `--index-filter`：与`--tree-filter`类似，`--tree-filter`将每个提交检出到临时目录，运行`filter`命令，并根据临时目录中的内容构建新的提交。而`--index-filter`则将每个提交复制到索引中，运行`filter`命令，并根据索引中的内容构建新的提交。即从索引构建提交比从目录构建提交要快

&emsp;&emsp;擦除`dev`分支整个提交历史中的`dist/index.html`文件。误操作可运行`git reflog`查看历史提交校验和，再版本回退恢复。

```javascript
git filter-branch -f --prune-empty --index-filter 'git rm -f --cached --ignore-unmatch dist/index.html' dev
```

&emsp;&emsp;批量修改当前分支提交历史中的作者和邮箱地址，如下将提交记录中的邮箱`A@git.com`修改为`B@git.com`，作者修改为`B`。

```javascript
git filter-branch --commit-filter '
if [ "$GIT_AUTHOR_EMAIL" = "A@git.com" ];
then
    GIT_AUTHOR_NAME="B";
    GIT_AUTHOR_EMAIL="B@git.com";
    git commit-tree "$@";
else
    git commit-tree "$@";
fi'
```

## 高阶命令

### 文件集合

&emsp;&emsp;;`HEAD`是当前分支引用的指针，总是指向该分支上的最后一次提交。

&emsp;&emsp;;`Index`是预期的下一次提交，可引用为暂存区域。

&emsp;&emsp;;`Working Directory`即工作目录。

#### 提交

&emsp;&emsp;;`git init`创建一个`Git`仓库，其中的`HEAD`引用指向未创建的分支（`master`还不存在）。分支即指向提交的指针，初始化的仓库没有提交记录，默认也就不存在分支。

```javascript
? <-- master <-- HEAD
```

&emsp;&emsp;工作目录新建文件`readme.md`，暂为`v1`版本。

```javascript
———— HEAD ———————— Index ———————— Working Directory
       ?             ?            readme.md (v1)
```

&emsp;&emsp;;`git add`获取工作目录中的内容，将其复制到`Index`中。

```javascript
———— HEAD ———————— Index ———————— Working Directory
       ?         readme.md (v1)   readme.md (v1)
```

&emsp;&emsp;;`git commit`将`Index`中的内容保存为快照，然后创建指向快照的提交对象，更新`master`指向此次提交对象。

```javascript
v1 <-- master <-- HEAD
———— HEAD ———————— Index ———————— Working Directory
readme.md (v1)   readme.md (v1)   readme.md (v1)
```

&emsp;&emsp;修改工作目录中文件，定为`v2`版本，运行`git status`，将会看到`Changes not staged for commit`。

```javascript
v1 <-- master <-- HEAD
———— HEAD ———————— Index ———————— Working Directory
readme.md (v1)   readme.md (v1)   readme.md (v2)
```

&emsp;&emsp;暂存`v2`，运行`git status`，将会看到`Changes to be committed`。

```javascript
v1 <-- master <-- HEAD
———— HEAD ———————— Index ———————— Working Directory
readme.md (v1)   readme.md (v2)   readme.md (v2)
```

&emsp;&emsp;提交此次修改，`master`指向`v2`版本。

```javascript
v1 —— v2 <-- master <-- HEAD
———— HEAD ———————— Index ———————— Working Directory
readme.md (v2)   readme.md (v2)   readme.md (v2)
```

#### 重置

&emsp;&emsp;重置即`git reset`版本回退，修改`readme.md`并提交，提交历史如下。

```javascript
v1 —— v2 —— v3 <-- master <-- HEAD
———— HEAD ———————— Index ———————— Working Directory
readme.md (v3)   readme.md (v3)   readme.md (v3)
```

&emsp;&emsp;第一步移动`HEAD`，即移动`master`指向`v2`，`HEAD`再指向`master`。此过程可运行`git reset --soft HEAD^`实现，其实质是撤销了`v3`的提交，再次运行`git commit`可完成`git commit --amend`所做的事。

```javascript
        v3
       /
v1 —— v2  <-- master <-- HEAD
———— HEAD ———————— Index ———————— Working Directory
readme.md (v2)   readme.md (v3)   readme.md (v3)
```

&emsp;&emsp;第二步更新`Index`，即更新暂存区域。此过程可运行`git reset --mixed HEAD^`实现，其中`--mixed`可省略，实质是撤销`v3`的提交，同时取消暂存所有修改。

```javascript
        v3
       /
v1 —— v2  <-- master <-- HEAD
———— HEAD ———————— Index ———————— Working Directory
readme.md (v2)   readme.md (v2)   readme.md (v3)
```

&emsp;&emsp;第三步更新工作目录，即让工作目录与`Index`一致。此过程可运行`git reset --hard HEAD^`实现，强制将`Index`中的`v2`覆盖工作目录。

```javascript
        v3
       /
v1 —— v2  <-- master <-- HEAD
———— HEAD ———————— Index ———————— Working Directory
readme.md (v2)   readme.md (v2)   readme.md (v2)
```

#### 撤销暂存

&emsp;&emsp;修改`readme.md`并暂存，提交历史如下。

```javascript
v1 <-- master <-- HEAD
———— HEAD ———————— Index ———————— Working Directory
readme.md (v1)   readme.md (v2)   readme.md (v2)
```

&emsp;&emsp;运行`git reset readme.md`（为`git reset --mixed HEAD readme.md`的简写形式），实质只是将`readme.md`从`HEAD`复制到`Index`。

```javascript
v1 <-- master <-- HEAD
———— HEAD ———————— Index ———————— Working Directory
readme.md (v1)   readme.md (v1)   readme.md (v2)
```

&emsp;&emsp;也可以不从`HEAD`复制到`Index`，而是复制具体某次提交的文件对应版本，运行`git reset 5f5292 readme.md`，其中`5f5292`为某次提交的校验和。

```javascript
v1 (5f5292) —— v2 —— v3 <-- master <-- HEAD
———— HEAD ———————— Index ———————— Working Directory
readme.md (v3)   readme.md (v1)   readme.md (v3)
```

#### 压缩

&emsp;&emsp;若一个项目最近有三次提交，第一次提交`A`新增`readme.md`，第二次提交`B`修改`readme.md`并新增`index.txt`，第三次提交`C`再次修改`readme.md`。由于`B`、`C`两次提交都是修改同一功能，因此需要压缩。

```javascript
      C readme.md (v3) index.txt (v1) <-- master <-- HEAD
    /
   B readme.md (v2) index.txt (v1)
 /
A readme.md (v1)
———— HEAD ———————— Index ———————— Working Directory
readme.md (v3)   readme.md (v3)   readme.md (v3)
index.txt (v1)   index.txt (v1)   index.txt (v1)
```

&emsp;&emsp;运行`git reset --soft HEAD^^`将`HEAD`移动到提交`A`上。

```javascript
      C readme.md (v3) index.txt (v1)
    /
   B readme.md (v2) index.txt (v1)
 /
A readme.md (v1) <-- master <-- HEAD
———— HEAD ———————— Index ———————— Working Directory
readme.md (v1)   readme.md (v3)   readme.md (v3)
                 index.txt (v1)   index.txt (v1)
```

&emsp;&emsp;运行`git commit`将`B`、`C`的修改压缩为一次新的提交`D`。

```javascript
C readme.md (v3) index.txt (v1)
|
B readme.md (v2) index.txt (v1)
|   D readme.md (v3) index.txt (v1) <-- master <-- HEAD
| /
A readme.md (v1)
———— HEAD ———————— Index ———————— Working Directory
readme.md (v3)   readme.md (v3)   readme.md (v3)
index.txt (v1)   index.txt (v1)   index.txt (v1)
```

#### 分支

&emsp;&emsp;分支的提交历史如下，当前`HEAD`指向`master`分支。

```javascript
   B readme.md (v2) <-- master <-- HEAD
 /
A readme.md (v1) <-- dev
———— HEAD ———————— Index ———————— Working Directory
readme.md (v2)   readme.md (v2)   readme.md (v2)
```

&emsp;&emsp;;`git checkout dev`移动`HEAD`指向`dev`分支，不同于`git reset --hard HEAD`，仅仅移动`HEAD`自身，且`checkout`会检查是否有未提交的修改，防止修改丢失。

```javascript
   B readme.md (v2) <-- master
 /
A readme.md (v1) <-- dev <-- HEAD
———— HEAD ———————— Index ———————— Working Directory
readme.md (v1)   readme.md (v1)   readme.md (v1)
```

### 高级合并

#### 选项参数

- `--continue`：某些情况下合并产生冲突，`Git`会暂停下来等待解决冲突。一种方式是`git add`将冲突文件标记为已解决，再次提交即可。另一种方式是标记后执行`git merge --continue`继续合并，若没有冲突产生，`Git`会自动创建一个合并提交
- `--abort`：尝试恢复到合并前的状态。当工作目录中有未提交的修改，`git merge --abort`某些情况下无法重现合并前的状态。因此建议合并前保持干净的工作目录，可将部分修改通过`git stash`储藏，解决冲突后再释放出来
- `-Xignore-all-space`：合并过来的分支和当前分支某一文件除了空格以外没有任何区别的时候，忽略合并过来的分支的那个文件。即若`A`合并`B`的修改，`A`修改为`hello wor ld`，B 修改为`hello wo rld`，两次修改等效，且忽略合并过来的修改`B`
- `-Xignore-space-change`：忽略空格量的变化。若某行在非末尾的位置有空格而另外一个没有，按照冲突处理。即若`A`合并`B`的修改，`A`修改为`hello*world`（暂用`*`代替空格），`B`修改为`hello**world`，则两次修改等效，且忽略合并过来的修改`B`。`A`修改为`helloworld`，`B`修改为`hello world`，则两次修改冲突

#### 冲突状态

&emsp;&emsp;查看未合并的文件，运行如下命令。其中包括两者共同祖先的版本`1`、当前版本`2`（`HEAD`）、合并过来的版本`3`（`MERGE_HEAD`）。

```javascript
git ls-files -u
100644 ac5336... 1	readme.md
100644 36c569... 2	readme.md
100644 e85456... 3	readme.md
```

&emsp;&emsp;查看未合并版本的具体内容，运行如下命令，其中`36c569`为当前版本`2`的部分校验和，也可运行一个特别的语法`git cat-file -p :2:readme.md`。

```javascript
git cat-file -p 36c569
```

&emsp;&emsp;冲突文件修改后（不暂存），可运行如下命令查看修改差异。其中`--base`为查看修改后的版本与两者共同祖先的版本的差异，`--theirs`为查看修改后的版本与合并过来的版本的差异，`--ours`为查看修改后的版本和当前版本的差异。

```javascript
git diff [--base|--ours|--theirs]
```

#### 检出冲突

&emsp;&emsp;;`master`分支修改了`readme.md`文件，`dev`分支也修改了`readme.md`文件，当前`HEAD`指向`master`分支，若合并`dev`分支的`readme.md`修改，将会产生大致如下的冲突。

```javascript
<<<<<<< HEAD
  puts 'hi world'
=======
  puts 'hello git'
>>>>>>> dev
```

&emsp;&emsp;此时并不知道保留哪一处修改，缺少更多的参照信息，运行如下命令可查看`ours`、`base`、`theirs`三个版本的差异。可通过配置`git config --global merge.conflictstyle diff3`来作为以后合并冲突的默认格式。

```javascript
git checkout --conflict=diff3 readme.md

cat readme.md
<<<<<<< ours
hi world
||||||| base
hello world
=======
hello git
>>>>>>> theirs
```

&emsp;&emsp;运行如下命令，快速保留某一方的修改。其中`--ours`表示保留当前的修改，丢弃掉引入的修改。`--theirs`表示保留引入的修改，丢弃掉当前的修改。

```javascript
git checkout [--ours|--theirs] readme.md
```

#### 合并日志

&emsp;&emsp;;`master`分支和`dev`分支提交历史如下，当前`HEAD`指向`master`。其中`B`、`D`提交修改了`readme.md`文件，提交`C`新增了`index.txt`，提交`E`新增了`file.txt`。

```javascript
C index.txt (v1) <-- master <-- HEAD
|
B readme.md (v3)
|       E file.txt (v1) <-- dev
|     /
|   D readme.md (v2)
| /
A readme.md (v1)
```

&emsp;&emsp;;`git merge dev`合并产生冲突后，可运行如下命令，查看此次合并中包含的每一个分支的所有独立提交。

```javascript
git log --oneline --left-right HEAD...MERGE_HEAD
< f127062 B
< af9d363 C
> e3eb226 D
> c3ffff1 E
```

&emsp;&emsp;添加`--merge`选项，只显示任何一边接触了合并冲突文件的提交。也可再添加`-p`选项查看所有冲突文件的区别。

```javascript
git log --oneline --left-right --merge
< f127062 B
> e3eb226 D
```

#### 策略合并

&emsp;&emsp;运行如下命令。若有某些可以合并的修改，`Git`会直接合并，某些有冲突的修改，`Git`根据选项参数选择特定的修改。`-Xours`选项即产生冲突优先使用当前`HEAD`修改，`-Xtheirs`选项即优先使用`dev`分支修改，其余可合并的修改直接合并。

```javascript
git merge [-Xours|-Xtheirs] dev
```

### 重用合并记录

&emsp;&emsp;重用合并记录（`reuse recorded resolution`）即让`Git`记住解决一个块冲突的方法，下一次看到相同的冲突时自动解决它。

&emsp;&emsp;配置如下选项启用`rerere`功能，也可不配置，在`.git`目录下新建`rr-cache`文件夹即可。

```javascript
git config --local rerere.enabled true
```

#### 记录冲突

&emsp;&emsp;各分支的`readme.md`修改内容如下。

```javascript
    C readme.md (hello git) <-- master <-- HEAD
  /
A readme.md (hello world) —— B readme.md (hi world) <-- dev
```

&emsp;&emsp;;`master`分支下合并`dev`分支`readme.md`的修改。其中`Recorded preimage`表示`Git`已经开始跟踪此次合并了。

```javascript
git merge dev
Auto-merging readme.md
CONFLICT (content): Merge conflict in readme.md
Recorded preimage for 'readme.md'
Automatic merge failed; ...
```

&emsp;&emsp;查看`readme.md`文件。

```javascript
cat readme.md
<<<<<<< HEAD
hello git
=======
hi world
>>>>>>> dev
```

&emsp;&emsp;查看`.git/rr-cache/0ff6a9/preimage`下记录的合并冲突前的版本，其中`0ff6a9`为此次冲突的校验和。

```javascript
<<<<<<<
hello git
=======
hi world
>>>>>>>
```

&emsp;&emsp;处理`readme.md`，将其标记为已解决并提交。其中`Recorded resolution`表示记录了此次冲突的解决方法。

```javascript
git add readme.md
git commit -m 'D'
Recorded resolution for 'readme.md'.
[master ...] D
```

&emsp;&emsp;冲突解决后提交历史如下。

```javascript
   B readme.md (hi world)  <-- dev
 /                        \
A readme.md (hello world)   D readme.md (hi git) <-- master <-- HEAD
 \                        /
   C readme.md (hello git)
```

&emsp;&emsp;查看`.git/rr-cache/0ff6a9/postimage`下记录的合并冲突后的版本。本质上当`Git`看到一个`readme.md`文件的一个块冲突中有`hi world`在一边、`hello git`在另一边，它会将其解决为`hi git`。

```javascript
hi git
```

&emsp;&emsp;撤销合并提交`D`，然后再次合并`dev`的修改。其中`Resolved ... using previous resolution`表示使用了之前的合并记录。

```javascript
git reset --hard HEAD^
git merge dev
Auto-merging readme.md
CONFLICT (content): Merge conflict in readme.md
Resolved 'readme.md' using previous resolution.
Automatic merge failed; ...
```

&emsp;&emsp;查看使用了合并记录后的`readme.md`。

```javascript
cat readme.md
hi git
```

&emsp;&emsp;执行`git merge --abort`撤销本次合并，回到合并前的状态。再来看看将`dev`的修改变基到`master`的情况。

```javascript
git switch dev
git rebase master
...
Resolved 'readme.md' using previous resolution.
....
```

&emsp;&emsp;执行`git add`将文件标记为已解决，执行`git rebase --continue`继续变基，此次变基记录记为`B'`，`master`成为`dev`分支的直接上游。

```javascript
B' <-- dev <-- HEAD
|
C <-- master
|  B
| /
A
```

#### 恢复冲突

&emsp;&emsp;;`Git`自动解决冲突，但是可能你已经忘记冲突时`readme.md`的状态了，运行如下命令，恢复至冲突时的`readme.me`状态。

```javascript
git checkout --conflict=merge readme.md
cat readme.md
<<<<<<< ours
hello git
=======
hi world
>>>>>>> theirs
```

#### 应用场景

&emsp;&emsp;分支提交历史如下。

```javascript
         E —— F <-- dev
       /
A —— B —— C <-- master
```

&emsp;&emsp;某种情况下要合并`master`分支的修改，来测试`dev`分支的修改是否影响了`master`分支的部分功能。

```javascript
         E —— F —— G <-- dev
       /         /
A —— B ———————— C <-- master
```

&emsp;&emsp;可能多次从`master`分支合并至`dev`分支进行测试，最终`master`分支合并了`dev`分支的修改。查看`master`分支提交历史，可能看见很多的合并记录，历史树看起来并不直观。

```javascript
         E —— F —— G —— H —— K —— L <-- dev
       /         /          /      \
A —— B ———————— C ———————— J —— M —— N <-- master
```

&emsp;&emsp;其实`dev`分支每次合并`master`分支完成测试后，可以丢弃掉那次合并记录，因为`rerere`已经记录了冲突的解决方法，不必担心以后再次合并，最终`dev`分支完成开发合并至`master`，提交历史树如下。

```javascript
         E —— F —— H —— L <-- dev
       /                 \
A —— B —— C —— J —— M —— N <-- master
```

### 还原提交

&emsp;&emsp;提交包括常规提交、合并提交，常规提交只有一个父提交对象，而合并提交有两个或者多个的父提交对象。`git reset --hard`可取消某次提交的修改，但是对于已经推送至远程仓库的提交，会造成很大的问题。另一种解决方式就是还原提交，即生成一个新的提交，此提交将会撤销指定的某次提交的修改。

#### 常规提交

&emsp;&emsp;若分支提交历史如下，其中`HEAD`指向`master`。

```javascript
A —— B (24e888) —— C <-- master <-- HEAD
```

&emsp;&emsp;执行如下命令取消`B`的修改，也可执行`git revert HEAD^`。

```javascript
git revert 24e888
```

&emsp;&emsp;运行后`Git`会打开`Vim`编辑器，可修改此次新提交的提交信息。

```javascript
Revert "B"

This reverts commit 24e888....

# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
#
# On branch master
...
```

&emsp;&emsp;最终提交历史如下。

```javascript
A —— B —— C —— ^B <-- master <-- HEAD
```

#### 合并提交

&emsp;&emsp;各分支的提交历史大致如下，`HEAD`指向`master`分支，其中`D`为合并提交，其余均为常规提交。

```javascript
A —— B —— C —— D (110c0d6) —— G <-- master <-- HEAD
      \       /
       E —— F <-- dev
```

&emsp;&emsp;某些情况下发现`dev`分支合并进来的修改存在重大缺陷，需要丢弃掉`dev`分支的修改，即`E`、`F`两次提交的修改。若运行`git resert 110c0d6`撤销提交`D`，但是`Git`不知道撤销哪一个分支的修改，此时需告诉`Git`保留哪一个分支的修改，而另一个分支的修改将被撤销。运行如下命令创建还原提交`^D`，其中`-m`表示此次取消的是一次合并提交，`1`表示保留提交`D`的第一父提交`C`的修改并撤销`E`、`F`的修改。

```javascript
git revert -m 1 110c0d6

A —— B —— C —— D (110c0d6) —— G —— ^D <-- master <-- HEAD
      \       /
       E —— F <-- dev
```

&emsp;&emsp;当`dev`分支的重大缺陷修复后，可再次合并进`master`。可能直觉上觉得`E`、`F`、`H`的修改均合并进了`master`分支，但是注意由于提交`^D`撤销了`E`、`F`的修改，所以`master`并不包含`E`、`F`的修改，即只有`H`的修改合并进了`master`。

```javascript
A —— B —— C —— D —— G —— ^D —— I <-- master <-- HEAD
      \       /               /
       E —— F —————————————— H <-- dev
```

&emsp;&emsp;解决上述情况的办法也很容易，用撤销解决撤销，即先撤销`^D`的修改。其中`d6d7365`为提交`^D`的部分校验和，也可执行`git revert HEAD`。

```javascript
git revert d6d7365

A —— B —— C —— D —— G —— ^D (d6d7365) <-- master <-- HEAD
      \       /
       E —— F ——— H <-- dev
```

&emsp;&emsp;再执行`git merge`合并`dev`的修改。

```javascript
A —— B —— C —— D —— G —— ^D —— ^^D —— I <-- master <-- HEAD
      \       /                      /
       E —— F ————————————————————— H <-- dev
```

### 调试工具

#### 文件标注

&emsp;&emsp;查看某一文件每一行的最后一次修改的提交。输出的每一行中第一个字段是最后一次修改此行的提交的部分校验和，`^`开头表示的是此文件第一次加入项目时的提交。括号中的字段分别为作者、提交时间（含时区）、行号。最后为某一行的内容。

&emsp;&emsp;查看文件第二行到第五行。其中`-L`表示范围，`2,5`表示第二行到第五行，都是闭区间，不指定`-L`参数和范围则查看文件所有行。

```javascript
git blame -L 2,5 readme.md
^4832fe2 (DonG 2021-01-12 10:31:28 +0800 2)   hello
9f6560e4 (DonG 2021-01-13 10:32:29 +0800 3)   world
cd564aa5 (DonG 2021-01-14 10:33:30 +0800 4)   and
7f3a6645 (DonG 2021-01-15 10:34:31 +0800 5)   git
```

&emsp;&emsp;范围也可指定行的个数，`+`表示往下，`-`表示往上。如下表示从第二行往下三行，则输出行号为`2`、`3`、`4`的行的提交信息。

```javascript
git blame -L 2,+3 readme.md
```

#### 二分查找

&emsp;&emsp;;`bisect`命令会对提交历史进行二分查找来帮助尽快找到是哪一个提交引入了问题。

&emsp;&emsp;提交历史如下，提交`C101`收到了`bug`反馈，但是在提交`C1`并未存在此`bug`，可以确定的是在提交`C1`与`C101`之间的提交引入了`bug`。

```javascript
C1 (d564aa) —— C2 ··· C50 ··· C100 —— C101 <-- master <-- HEAD
```

&emsp;&emsp;运行如下命令，选择`C1`到`C101`的提交历史进行二分查找排查，代码库会切换到范围正当中的那一次提交`C51`，其中`d564aa`为提交`C1`的部分校验和。

```javascript
git bisect start HEAD d564aa
```

&emsp;&emsp;提交`C51`下复现`bug`，并不存在，说明在`C52`到`C101`之间，`good`表示本次提交`C51`没有问题。

```javascript
git bisect good
```

&emsp;&emsp;;`Git`自动切换到`C52`与`C101`的中点提交`C76`，`bad`表示本次提交`C76`有问题。

```javascript
git bisect bad
```

&emsp;&emsp;不断重复此过程，最终查找到出问题的那次提交，并打印出那次提交的详细信息。

```javascript
857293... is the first bad commit
commit 857293...
Author: ...
Date:   ...
```

&emsp;&emsp;执行如下命令，退出查错，回到最近一次的代码提交。

```javascript
git bisect reset
```

### 打包

&emsp;&emsp;;`Git`可将分支内容打包成一个二进制文件，用于邮件或其他方式传输。

&emsp;&emsp;打包`master`分支所有提交历史，其中`repo.bundle`为打包生成的二进制文件名。

```javascript
git bundle create repo.bundle HEAD master
```

&emsp;&emsp;克隆打包生成的二进制文件，其中`repos`为自定义的仓库名，也可不指定，如下则默认为`repo`。

```javascript
git clone repo.bundle repos
```

&emsp;&emsp;打包区间范围的提交记录，其中`HEAD^^..HEAD`左开右闭区间，即`D`、`E`两次提交记录。

```javascript
git bundle create repo.bundle HEAD^^..HEAD master

A —— B —— C —— D —— E <--master <-- HEAD
```

&emsp;&emsp;检查文件是否是合法的`Git`包，是否拥有共同的祖先从而导入。其中`The bundle requires this ref`表示此包父提交对象校验和为`99884a`。

```javascript
git bundle verify repo.bundle
...
The bundle requires this ref:
99884a...
```

&emsp;&emsp;查看包可导入的分支。

```javascript
git bundle list-heads repo.bundle
```

&emsp;&emsp;导入包中`master`分支的提交到本地`dev`分支。

```javascript
git fetch repo.bundle master:dev
```

### 凭据存储

&emsp;&emsp;;`Git`使用`HTTP`协议访问远程仓库进行操作时，每一个连接都是需要用户名和密码的。

&emsp;&emsp;倘若每次推送或者拉取都输入用户名和密码，显得非常繁琐，`Git`提供了一个凭据系统来解决此种问题，部分选项如下。

- 默认：凭据都不缓存，每一次连接都会询问用户名和密码
- `cache`：将凭据存放在内存中一段时间，密码不会被存储在磁盘中，并且`15`分钟后从内存中清除。注意此选项不适用于`windows`系统，因为此选项是通过`unix`套接字进行通信
- `store`：凭据明文存放在磁盘中永不过期。默认路径为`C:/Users/{username}/.git-credentials`
- `manager`：凭据管理至`windows`系统中的凭据管理器，可在控制面板中的用户账户的凭据管理器中查看

&emsp;&emsp;运行如下命令配置上述选项。

```javascript
git config --global credential.helper [cache|store|manager]
```

&emsp;&emsp;一般安装`Git`会默认使用`manager`方式，其中`Enable Git Credential Manager`即开启`manager`方式

![](/other/git/middle-setup.png)

&emsp;&emsp;如下窗口输入用户名和密码会被凭据管理器记录。

![](/other/git/middle-window.png)

## 子模块

&emsp;&emsp;子模块即一个`Git`仓库作为另一个`Git`仓库的子目录，两个仓库相互独立，同时一个仓库又依赖另一个仓库。

### 添加

&emsp;&emsp;仓库添加子模块，默认子模块会放到与仓库同名的目录中，即主项目中会生成子目录`subrepo`。

```javascript
git submodule add https://github.com/username/subrepo.git
```

&emsp;&emsp;也可在命令结尾指定子目录名称或路径，如下主项目中会生成子目录`subrepos`。

```javascript
git submodule add https://github.com/username/subrepo.git subrepos
```

&emsp;&emsp;注意子模块默认克隆仓库的`master`分支，运行如下命令克隆具体分支，其中`-b`为`--branch`简写，`dev`为远程仓库`subrepo`的分支。

```javascript
git submodule add -b dev https://github.com/username/subrepo.git
```

### 查看

&emsp;&emsp;主项目下运行`git status`查看状态，注意首次添加子模块，会生成`.gitmodules`文件且均为暂存状态，同时`.gitmodules`也会被`Git`跟踪并管理。

```javascript
git status
...
Changes to be committed:
  ...
        new file:   .gitmodules
        new file:   subrepo
```

&emsp;&emsp;其中`.gitmodules`文件保存了子模块项目`URL`和本地目录之间的映射关系。注意主项目中有多个子模块，`.gitmodules`就会存在多条记录。

```javascript
cat .gitmodules
[submodule "subrepo"]
        path = subrepo
        url = https://github.com/username/subrepo.git
```

&emsp;&emsp;查看暂存区与最近版本库之间的差异，虽然`subrepo`是主项目目录的子目录，但是`Git`并不会跟踪它的内容，而是将其看做仓库中的一个特殊提交。

```javascript
git diff --cached
...
+[submodule "subrepo"]
+       path = subrepo
+       url = https://github.com/username/subrepo.git
...
+Subproject commit 3b8ad09...
```

&emsp;&emsp;也可指定`--submodule`选项查看差异。

```javascript
git diff --cached --submodule
...
+[submodule "subrepo"]
+       path = subrepo
+       url = https://github.com/username/subrepo.git
Submodule subrepo 0000000...3b8ad09 (new submodule)
```

### 提交

&emsp;&emsp;主项目下运行`git commit`提交，其中`160000`是`Git`中一种特殊模式，本质上是子模块目录指向某次提交。

```javascript
git commit -am 'message'
...
 create mode 100644 .gitmodules
 create mode 160000 subrepo
```

&emsp;&emsp;运行如下命令，查看当前提交树对象，其中子目录`subrepo`中的当前版本指向提交记录`3b8ad09`。

```javascript
git ls-tree -r HEAD
100644 blob 9a5259...    .gitmodules
160000 commit 3b8ad09...  subrepo
```

### 克隆

&emsp;&emsp;克隆仓库`repo`，其中仓库`repo`含有子模块`subrepo`，克隆后默认会包含子模块目录`subrepo`，但是其中都没有文件。

```javascript
git clone https://github.com/username/repo.git
```

&emsp;&emsp;运行如下命令，初始化本地配置。若想验证此方式的执行情况，提供一种思路，首先克隆仓库`repo`，然后进入仓库内`.git`文件夹，运行`git init`，暂存所有文件并提交，即用`Git`跟踪`Git`的改动，然后返回上级，执行如下命令，最后进入`.git`并执行`git diff`，则能看到此命令执行后相关文件改动，此种方式也可验证`Git`其他命令的执行情况。

```javascript
git submodule init
Submodule 'subrepo' (...) registered for path 'subrepo'
```

&emsp;&emsp;初始化本地配置后，运行如下命令，抓取子模块内对应版本的文件。注意`Git`将会获得这些改动并更新子目录中的文件，但是会将子仓库留在一个游离的`HEAD`的状态，即子仓库不存在分支，没有本地分支来跟踪改动，执行`git checkout`检出其相应的工作分支即可。

```javascript
git submodule update
```

&emsp;&emsp;也可运行如下命令，自动初始化并更新仓库中每一个子模块。

```javascript
git clone --recursive https://github.com/username/repo.git
```

### 更新

&emsp;&emsp;可能仅使用子模块项目并不时地获取更新，但是并不在子模块进行修改。

&emsp;&emsp;如下分别在子模块内部和外部更新，其中主项目`repo`下包括子模块目录`subrepo`。

#### 内部

&emsp;&emsp;子模块`subrepo`运行`git fetch`和`git merge`合并最新代码，也可查看子模块`subrepo`的代码提交历史和差异。注意若此时无法`fetch`最新代码，可能由于子模块`subrepo`处于游离的`HEAD`状态，需运行`git checkout`检出工作分支。

&emsp;&emsp;合并更新后返回主项目`repo`，子模块`subrepo`的更新会被仓库`repo`记录为一次新的特殊修改，可运行`git status`查看工作目录状态，或者运行如下命令，查看目录`subrepo`指向的提交记录的改变以及当前指向的提交的提交信息。其中`6cc07e3..81afae7`表示子模块`subrepo`指向的提交记录由`6cc07e3`更新为`81afae7`，当前提交记录`81afae7`的提交信息为`update subrepo readme.md`。

```javascript
git diff --submodule
Submodule subrepo 6cc07e3..81afae7:
  > update subrepo readme.md
```

#### 外部

&emsp;&emsp;主项目`repo`中再进入目录`subrepo`更新代码，稍微显得麻烦，运行如下命令，在仓库`repo`下更新所有子模块的代码。

```javascript
git submodule update --remote
```

&emsp;&emsp;可能子模块较多，仅仅只需要更新某一个子模块，如下仅更新子模块`subrepo`。

```javascript
git submodule update --remote subrepo
```

&emsp;&emsp;运行如下命令，将子模块`subrepo`的版本映射修改为另一个分支，其中`dev`为分支名，修改后再运行`git submodule update --remote subrepo`更新即可。

```javascript
git config -f .gitmodules submodule.subrepo.branch dev
```

### 推送

&emsp;&emsp;子模块`subrepo`修改部分文件，若仓库`subrepo`处于游离的`HEAD`状态，也需检出相应的工作分支，提交后不推送改动。在主项目`repo`中提交并推送，其他人更新子模块`subrepo`时，无法获取到子模块所依赖的改动，那些改动只存在本地拷贝中。

&emsp;&emsp;运行如下命令，`Git`在推送主项目前会检查子模块是否已经推送，若任何子模块的改动没有推送则`push`会失败。

```javascript
git push --recurse-submodules=check
The following submodule paths contain changes that can
not be found on any remote:
  subrepo
...
```

&emsp;&emsp;运行如下命令，在推送主项目前推送子模块的改动。注意若子模块因为某些原因推送失败，主项目也会推送失败。

```javascript
git push --recurse-submodules=on-demand
```

### 合并

&emsp;&emsp;其他人同时改动了子模块的引用，可能会遇到部分问题，需要做一些工作来修复。

#### 快进式

&emsp;&emsp;若主项目`repo`下包括子项目`subrepo`，用户`A`和用户`B`均克隆了远程仓库`repo`。用户`A`修改子项目下文件，提交并推送了`subrepo`和`repo`。用户`B`不做任何修改，执行`git pull`，子项目`subrepo`将做一个快进式合并，`Git`会选择之后的提交来合并。

```javascript
git pull
...
Fetching submodule subrepo
...
Fast-forward
 subrepo
```

#### 子模块冲突

&emsp;&emsp;若主项目`repo`下包括子项目`subrepo`，用户`A`和用户`B`均克隆了远程仓库`repo`。其中子项目`subrepo`含文件`readme.md (v1)`。

&emsp;&emsp;用户`A`修改`readme.md (v2)`，同时在`repo`和`subrepo`均提交和推送了修改。

&emsp;&emsp;用户`B`修改`readme.md (v3)`，同时在`repo`和`subrepo`均提交了修改，然后再拉取用户`A`推送的修改。

```javascript
git pull
...
Failed to merge submodule subrepo (merge following commits not found)
Auto-merging subrepo
CONFLICT (submodule): Merge conflict in subrepo
...
```

&emsp;&emsp;可查看`subrepo`子模块产生了冲突，其中`merge following commits not found`表示未找到合并提交记录，即`Git`未找到子模块内`readme.md`文件`v2`和`v3`的合并提交版本。

&emsp;&emsp; 运行`git diff`，查看产生冲突的两个提交记录的校验和，其中`2ceb726`为用户`B`的提交校验和，`29b9770`为用户`A`的提交校验和。

```javascript
git diff
index 2ceb726,29b9770..0000000
```

&emsp;&emsp;进入子模块目录`subrepo`，当前应该指向提交`2ceb726`，运行如下命令创建用户`A`的修改的一个临时分支。

```javascript
git branch theirs 29b9770
```

&emsp;&emsp;合并`theirs`分支，在此得到了一个真正的合并冲突。修改后将文件`readme.md (v4)`标记为已解决，然后提交并推送子项目`subrepo`的修改，最后返回至主项目`repo`提交并推送修改。

```javascript
git merge theirs
...
CONFLICT (content): Merge conflict in readme.md
...
```

&emsp;&emsp;另一种合并方式即在用户`A`提交和推送后，用户`B`的`readme.md (v3)`修改提交后，执行`git pull`合并`v2`和`v3`为`v4`，再推送合并版本，然后返回主项目`repo`提交。

&emsp;&emsp;最后执行`git pull`，此时引入用户`A`的`readme.md (v2)`修改，由于`Git`找到了`v2`和`v3`的合并提交版本`v4`，故此合并仅是一次简单的快进式合并。

```javascript
git pull
...
Fast-forwarding submodule subrepo
Auto-merging subrepo
Merge made by the 'recursive' strategy.
```

### 删除

&emsp;&emsp;若主项目`repo`删除子模块`subrepo`，首先运行如下命令，`Git`会删除子模块目录`subrepo`，并且再更新`.gitmodules`文件，同时暂存以上修改。

```javascript
git rm -f subrepo
```

&emsp;&emsp;然后在`.git/config`中删减子模块`subrepo`相关内容。

```javascript
[submodule "subrepo"]
        url = https://github.com/username/subrepo.git
```

&emsp;&emsp;最后在主项目`repo`下提交并推送修改。

### 其他

#### 子模块遍历

&emsp;&emsp;在主项目中运行如下命令，`Git`会在每一个子模块中运行`git checkout master`。

```javascript
git submodule foreach git checkout master
```

#### 切换分支

&emsp;&emsp;主项目`repo`暂不添加子模块，检出一个新分支`dev`后再添加子模块`subrepo`并提交。

```javascript
git checkout -b dev
git submodule add https://github.com/username/subrepo.git
git commit -am 'message'
```

&emsp;&emsp;此时切换到`master`分支，警告不能删除非空目录`subrepo`。

```javascript
git checkout master
warning: unable to rmdir 'subrepo': Directory not empty
Switched to branch 'master'
...
```

&emsp;&emsp;;`master`分支应该没有子模块，但是却仍然有一个未跟踪的子模块目录`subrepo`。

```javascript
git status
...
Untracked files:
  ...
        subrepo/
```

&emsp;&emsp;运行`rm -r subrepo`删除此子模块目录即可，再`git switch`切换回`dev`分支。但是进入 `subrepo`目录并没有任何文件，运行如下命令来重新建立和填充子模块`subrepo`。

```javascript
git submodule update --init
Submodule path 'subrepo': checked out ...
```

#### 子目录

&emsp;&emsp;若仓库`repo`含子目录`subrepo`，`subrepo`中含部分文件，仓库`repo`此时含`master`和`dev`分支，当前`HEAD`指向`dev`分支。

&emsp;&emsp;此时添加子模块`subrepo`，但是由于`subrepo`目录存在，添加失败。

```javascript
git submodule add https://github.com/username/subrepo.git
'subrepo' already exists in the index
```

&emsp;&emsp;运行如下命令，删除`subrepo`目录后再添加子模块，然后提交修改。

```javascript
git rm -r subrepo
```

&emsp;&emsp;切换分支到`master`，注意子目录`subrepo`中的文件与`dev`分支的子模块中的文件合并了。

&emsp;&emsp;解决方式如下，首先删除`subrepo`目录，然后撤销修改，最终`master`分支的`subrepo`目录恢复。

```javascript
rm -r subrepo
git checkout .
```

[上一篇](upper.md)

[下一篇](lower.md)

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125)、[Blog](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~