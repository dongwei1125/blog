# 比较全面的 Git 命令手册，几乎涵盖日常所有的使用场景（下）

![](/other/git/banner.jpg)

## Git 内部原理

### Git 对象

#### Blob 对象

&emsp;&emsp;;`Blob`对象即文件快照，`Git`暂存时会保存文件快照于目录`.git/objects`下。`git init`初始化的仓库下`.git/objects`默认创建空的`pack`和`info`子目录。`Git`的核心是一个简单的键值对数据库（`key-value data store`），可理解为文件目录和文件为键`key`，目录内文件内容为对应值`value`。

&emsp;&emsp;运行如下底层命令，向`Git`数据库插入内容。其中`echo 'content'`输出`content`文本，`|`为管道符，即前一命令的输出作为后一命令的输入。`-w`表示将内容写入数据库，`--stdin`表示从管道读取内容。如下命令可大致概括为`echo 'content'`输出`content`文本传入管道中，`git hash-object --stdin`从管道读取`content`文本，再指定`-w`选项将其写入`Git`数据库，即保存于`.git/objects`目录下。

```javascript
echo 'content' | git hash-object -w --stdin
d95f3ad1...
```

&emsp;&emsp;;`d95f3ad1...`即`blob`对象的`SHA-1`校验和，在目录`.git/objects`中体现为前两位用于命名子目录，余下的`38`位则用作文件名。如下`find`用来在指定目录下查找文件，`-type`表示指定文件类型，`f`表示文件类型为一般文件。

```javascript
find .git/objects -type f
.git/objects/d9/5f3ad1...
```

&emsp;&emsp;;`d95f3ad1...`也即键`key`，运行如下命令获取`Git`数据库中键对应的值。其中`-p`表示自动判断内容的类型并显示为格式友好的内容，也可指定`-t`选项查看对象类型。

```javascript
git cat-file -p d95f3ad1
content
```

&emsp;&emsp;可能`echo`方式写入内容到`Git`数据库稍显复杂，也可取文件内容写入数据库。如下将`readme.md`文件的内容写入数据库。

```javascript
git hash-object -w readme.md
```

#### 极简版本控制

&emsp;&emsp;创建一个新文件并将其内容存入数据库。

```javascript
echo 'hello world' > readme.md
git hash-object -w readme.md
3b18e512...
```

&emsp;&emsp;再次写入新内容并存入版本库。

```javascript
echo 'hi git' > readme.md
git hash-object -w readme.md
2984e649...
```

&emsp;&emsp;暂时查看数据库写入情况。

```javascript
find .git/objects -type f
.git/objects/29/84e649...
.git/objects/3b/18e512...
```

&emsp;&emsp;控制文件内容为第一个版本。

```javascript
git cat-file -p 3b18e512 > readme.md
cat readme.md
hello world
```

&emsp;&emsp;控制文件内容为第二个版本。

```javascript
git cat-file -p 2984e649 > readme.md
cat readme.md
hi git
```

#### Tree 对象

&emsp;&emsp;上述数据库中仅保存了文件内容，文件名尚未保存，而且记住每一个版本所对应的`SHA-1`校验和也不现实。`Tree`对象即树对象，则能很好解决此问题，一个树对象包含一条或者多条树对象记录，每条记录有一个指向数据对象（`blob`对象）或子树对象的`SHA-1`指针，以及相应的模式、类型、文件名或目录名。

&emsp;&emsp;某个树对象内容可能如下。其中`master^{tree}`表示`master`分支最新的提交所指向的树对象，`readme.md`和`file.txt`都是数据对象，`dist`为子树对象。

```javascript
git cat-file -p master^{tree}
100644 blob a906cb12...      readme.md
100644 blob 8f941322...      file.txt
040000 tree 99f1a699...      dist
```

&emsp;&emsp;查看子树对象。

```javascript
git cat-file -p 99f1a699
100644 blob 47c63436...      index.html
```

&emsp;&emsp;内部数据存储大致如下。

```javascript
       readme.md --> blob
     /
tree —— file.txt --> blob
     \
       dist --> tree —— index.html --> blob
```

&emsp;&emsp;;`Git`是根据暂存区的状态来创建对应的树对象，因此需要将一些修改或文件加入暂存区。运行如下命令将修改暂存，若文件名不在暂存区中需指定`--add`选项，`--cacheinfo`表示将指定的信息加入暂存区，包括文件模式、`SHA-1`校验和与文件名，并且`SHA-1`校验和需指定完整值。如下命令可大致概括为暂存数据对象`3b18e512...`对应的修改，同时文件模式为`100644`，文件名为`readme.md`。

```javascript
git update-index --add --cacheinfo 100644 \
3b18e512... readme.md
```

&emsp;&emsp;查看暂存区详细状态。

```javascript
git ls-files -s
100644 3b18e512... 0       readme.md
```

&emsp;&emsp;运行如下命令，将暂存区内容写入一个树对象。其中`7394b8cc...`为树对象`SHA-1`校验和。

```javascript
git write-tree
7394b8cc...
```

&emsp;&emsp;查看树对象内容和数据库写入情况

```javascript
git cat-file -p 7394b8cc
100644 blob 3b18e512...    readme.md
find .git/objects -type f
.git/objects/73/94b8cc...
```

#### 子树对象

&emsp;&emsp;如上已经创建一个树对象，接下来再创建一个新树对象。

```javascript
git update-index --add --cacheinfo 100644 \
2984e649... readme.md
```

&emsp;&emsp;也可暂存新文件，`Git`会根据新文件内容创建数据对象并写入数据库，再将数据对象`SHA-1`校验和、文件模式和文件名加入到暂存区。

```javascript
echo 'file' > file.txt
git update-index --add file.txt
```

&emsp;&emsp;暂存区现在包括`readme.md`新版本和一个新文件`file.txt`，将暂存区内容再次写入一个新树对象。

```javascript
git write-tree
e331c9c2...
```

&emsp;&emsp;查看暂存区域。

```javascript
git ls-files -s
100644 f73f3093... 0       file.txt
100644 2984e649... 0       readme.md
```

&emsp;&emsp;现在数据库存在两个树对象`7394b8cc...`和`e331c9c2...`，运行如下命令将第一个树对象加入到暂存区域。其中`--prefix`表示将一个已有的树对象作为子树加入暂存区，`dist`为子目录名。

```javascript
git read-tree --prefix=dist 7394b8cc
```

&emsp;&emsp;再次写入一个新树对象。

```javascript
git write-tree
ccf028c6...
```

&emsp;&emsp;查看新树对象。

```javascript
git cat-file -p ccf028c6
040000 tree 7394b8cc...    dist
100644 blob f73f3093...    file.txt
100644 blob 2984e649...    readme.md
```

#### 提交对象

&emsp;&emsp;现在已有三个树对象`7394b8cc...`、`e331c9c2...`和`ccf028c6...`，分别跟踪了不同文件快照。若想重用这些快照，需要记住如上三个`SHA-1`校验和。同时也不知道是谁保存了这些快照、在什么时刻保存的，以及为什么保存这些快照，以上则引出了提交对象。

&emsp;&emsp;运行如下命令创建一个提交对象。其中`'A'`即为提交信息，`7394b8cc`为创建后的提交对象指向的树对象。

```javascript
echo 'A' | git commit-tree 7394b8cc
f0dcf2c3...
```

&emsp;&emsp;查看提交对象`f0dcf2c3`。

```javascript
git cat-file -p f0dcf2c3
tree 7394b8cc...
author ...
committer ...

A
```

&emsp;&emsp;根据另外两个树对象创建提交对象，其中`e331c9c2`表示树对象校验和，`-p`表示指定父提交对象，`f0dcf2c3`为父提交对象校验和。

```javascript
echo 'B' | git commit-tree e331c9c2 -p f0dcf2c3
5d3d89ce...
echo 'C' | git commit-tree ccf028c6 -p 5d3d89ce
b41c0107...
```

&emsp;&emsp;查看提交对象`5d3d89ce`。

```javascript
git cat-file -p 5d3d89ce
tree e331c9c2...
parent f0dcf2c3...
author ...
committer ...

B
```

&emsp;&emsp;此时`Git`内部关系大致如下，但是暂时还不能`git log`查看提交历史，因为还不存在分支。

```javascript
                                   readme.md (2984e649) --> blob (hi git) ------------------------------------|
                                 /                                                                            |
C (b41c0107) --> tree (ccf028c6) —— dist --> tree (7394b8cc) —— readme.md (3b18e512) --> blob (hello world) --|--|
|                                \                                                                            |  |
|                                  file.txt (f73f3093) --> blob (file) ------------------------------------|  |  |
|                                                                                                          |  |  |
B (5d3d89ce) --> tree (e331c9c2) —— readme.md (2984e649) --> blob (hi git) --------------------------------|--|  |
|                                \                                                                         |     |
|                                  file.txt (f73f3093) --> blob (file) ------------------------------------|     |
|                                                                                                                |
A (f0dcf2c3) --> tree (7394b8cc) —— readme.md (3b18e512) --> blob (hello world) ---------------------------------|
```

#### 对象存储

&emsp;&emsp;;`Git`数据对象存储步骤大致如下。其实所有的`Git`对象均以此方式存储，区别仅在于类型标识，另两种对象类型的头部信息以字符串`commit`或`tree`开头，而不是`blob`。虽然数据对象的内容可以是任何东西，但提交对象和树对象的内容却有各自固定的格式。

- 读取文件内容，以对象类型`blob`作为开头来构造一个头部信息，拼接头部信息和文件原始内容，记为`content`
- 计算`content`的`SHA-1`校验和，得到长度为`40`个十六进制字符的哈希值
- 取哈希值前两位作为文件目录，剩余`38`为作为文件名
- 对`content`执行`lib`压缩，获得新的二进制内容，存入文件中

### Git 引用

&emsp;&emsp;上述提交历史可运行`git log b41c0107`查看，其中`b41c0107`为提交记录`C`的部分校验和。但是查看提交历史仍然需记住某次记录的部分校验和，倘若用某个文件保存校验和，同时起一个简单的名字，问题将会得到很好解决，而这种文件就被称为引用。引用文件均保存在`.git/refs`目录下。

#### 分支引用

&emsp;&emsp;若要创建一个分支引用，仅在`.git/refs/heads`目录下新增分支名，且内容为某次提交的校验和即可。`Git`提供了更加安全的命令`update-ref`，如下表示将部分校验和`b41c0107`对应的完整校验和写入`.git/refs/heads`目录下的`master`文件。

```javascript
git update-ref refs/heads/master b41c0107
```

&emsp;&emsp;如下查看`master`分支文件的内容。同时也印证了分支是指向提交对象的可变指针。

```javascript
cat .git/refs/heads/master
b41c0107...
```

#### HEAD 引用

&emsp;&emsp;;`HEAD`是一个符号引用，指向当前所在分支，或者说是一个指向其他引用的分支。

&emsp;&emsp;运行`git branch dev`即创建一个`dev`分支，但是查看`dev`引用文件的内容，会有完整的校验和，此校验和即是通过`HEAD`来获取的。

&emsp;&emsp;创建`dev`分支时`Git`首先会找到`HEAD`指向的分支，再获取此分支保存的完整校验和，将此校验和写入`.git/refs/heads`目录下`dev`文件中。

```javascript
git branch dev
cat .git/refs/heads/dev
b41c0107...
```

&emsp;&emsp;查看`HEAD`内容。

```javascript
cat .git/HEAD
ref: refs/heads/master
```

&emsp;&emsp;如下表示将当前`HEAD`指向`dev`分支。

```javascript
git symbolic-ref HEAD refs/heads/dev
```

#### 标签引用

&emsp;&emsp;标签包括轻量标签和附注标签。

&emsp;&emsp;轻量标签是一个固定的引用，指向某个提交对象。

&emsp;&emsp;附注标签会指向一个标签对象，标签对象保存一个引用来指向某个提交对象。

&emsp;&emsp;运行如下底层命令，创建一个轻量标签`v1.8.5`。

```javascript
git update-ref refs/tags/v1.8.5 HEAD
```

&emsp;&emsp;查看轻量标签`v1.8.5`，如下轻量标签`v1.8.5`指向提交`b41c0107`。

```javascript
cat .git/refs/tags/v1.8.5
b41c0107...
```

&emsp;&emsp;创建附注标签`v1.8.6`。

```javascript
git tag -a v1.8.6 HEAD -m 'message'
```

&emsp;&emsp;查看附注标签指向的标签对象的完整校验和，如下附注标签指向标签对象`4740ea0b`。

```javascript
cat .git/refs/tags/v1.8.6
4740ea0b...
```

&emsp;&emsp;查看标签对象`4740ea0b`内容，其中`object`表示指向的提交记录。

```javascript
git cat-file -p 4740ea0b
object b41c0107...
type commit
tag v1.8.6
tagger ...

message
```

#### 远程引用

&emsp;&emsp;远程引用即本地仓库中保存远程仓库中各分支的指向信息。

&emsp;&emsp;远程引用是只读的，可以`git checkout`到某个远程引用，但是`Git`并不会将`HEAD`引用指向此远程引用。

&emsp;&emsp;远程引用一般保存在`refs/remotes`目录下，当与远程仓库交互时，远程引用会被更新。

&emsp;&emsp;若远程仓库`repo`含分支`dev`、`master`，添加远程仓库`origin`并拉取。

```javascript
git remote add origin https://github.com/username/repo.git
git fetch origin
...
From https://github.com/username/repo
 * [new branch]      dev       -> origin/dev
 * [new branch]      master     -> origin/master
```

&emsp;&emsp;查看目录`.git/refs/remotes/origin`下文件。

```javascript
find .git/refs/remotes/origin -type f
.git/refs/remotes/origin/dev
.git/refs/remotes/origin/master
```

&emsp;&emsp;查看远程仓库`master`分支，其中`90edc78e`为`master`分支指向的最新提交的校验和。

```javascript
cat .git/refs/remotes/origin/master
90edc78e...
```

### 包文件

&emsp;&emsp;;`Git`跟踪了某个数千行代码的文件，若改动了此文件的某一行代码，`Git`会将整个文件保存为数据对象（`blob`）。此文件原始对象和改动后的对象被称为松散（`loose`）对象。

&emsp;&emsp;;`Git`向磁盘中存储对象时所使用的格式为松散对象格式，并时不时地将多个对象打包成一个的包文件（二进制文件），以此来节省空间和提高效率。 版本库中有太多的松散对象或者执行`git gc`，或者向远程服务器推送时，`Git`都会打包。

&emsp;&emsp;;`git gc`会将一个文件的完整内容保存为数据对象，再将与完整内容之间的差异保存为另一个数据对象。

#### 打包

&emsp;&emsp;初始化一个空仓库`repo`，新增一个`10kb`左右的`readme.md`文件，暂存后查看暂存区`readme.me`文件大小（`10311`字节），提交此次修改。

```javascript
git add readme.md
git ls-files -s
100644 767466fd... 0       readme.md
git cat-file -s 767466fd
10311
git commit -m 'A'
```

&emsp;&emsp;;`readme.md`文件尾部追加部分内容后也暂存并查看文件大小（`10319`字节）。

```javascript
echo 'message' >> readme.md
git add readme.md
git ls-files -s
100644 f08cfd3e... 0       readme.md
git cat-file -s f08cfd3e
10319
git commit -m 'B'
```

&emsp;&emsp;查看`.git/objects`下新增的对象，其中包括`6`个对象，两个树对象、两个提交对象、两个数据对象。

```javascript
find .git/objects -type f
.git/objects/76/7466fd...
.git/objects/f0/8cfd3e...
...
```

&emsp;&emsp;运行`git gc`打包松散对象，查看`.git/objects`下对象。其中包括一个`.idx`索引文件和一个`.pack`包文件，包文件包含了从`Git`数据库中移除的所有对象的内容，索引文件包含了包文件的偏移信息，通过索引文件可以快速定位任意一个指定对象。

&emsp;&emsp;注意大部分对象都会被打包到包文件中，但是`Git`会保留悬空的数据对象，即未被任何提交记录引用的数据对象。

```javascript
git gc
.git/objects/info/packs
.git/objects/pack/pack-3575...a060.idx
.git/objects/pack/pack-3575...a060.pack
```

&emsp;&emsp;运行如下底层命令查看索引文件内容。其中包括`6`个对象，每一行含对象的`SHA-1`校验和、类型、文件大小、打包文件大小、打包文件偏移，可能再包含深度、基础`SHA-1`校验和。

&emsp;&emsp;注意`readme.md`第二个版本`f08cfd3e`保存了完整内容，反而第一个版本`767466fd`保存了差异内容，因为大多数情况下`Git`需要快速访问最新版本。

```javascript
git verify-pack -v .git/objects/pack/pack-3575...a060.ind
f08cfd3e... blob   10319 2561 265
767466fd... blob   7 18 2921 1 f08cfd3e...
...
```

#### 引用

&emsp;&emsp;;`git gc`会做的另一件事是打包`.git/refs`目录下的引用到文件`.git/packed-refs`中。若当前版本库中包含如下分支和标签。

```javascript
find .git/refs -type f
.git/refs/heads/master
.git/refs/remotes/origin/master
.git/refs/tags/v1.8.5
.git/refs/tags/v1.8.6
```

&emsp;&emsp;打包后上述引用不会再出现在`.git/refs`目录下，均会被移动到`.git/packed-refs`文件中。其中`^`表示它上一行的标签是附注标签，`^`所在行是那个附注标签指向的提交记录的校验和。

&emsp;&emsp;打包后更新了引用，`Git`并不会修改`packed-refs`文件，而是在`.git/refs`目录下创建新的引用文件。若`Git`要获取引用文件的最新`SHA-1`校验和，首先会在`.git/refs`目录下查找指定的引用文件，然后再到`packed-refs`文件中查找。

```javascript
cat .git/packed-refs
ceb21368... refs/heads/master
040db796... refs/remotes/origin/master
ceb21368... refs/tags/v1.8.5
9dcb07d9... refs/tags/v1.8.6
^ceb2136...
```

### 引用规格

&emsp;&emsp;本地仓库关联远程仓库后，查看`.git/config`文件。其中指定了远程版本库的名称、`url`和用于获取的引用规格。诸如`<src>:<dst>`的格式称为引用规格，`<src>`表示远程版本库中的引用，`<dst>`表示远程引用在本地所对应的位置，`+`表示不能快进情况下强制更新引用。

```javascript
git remote add origin https://github.com/username/repo.git
cat .git/config
...
[remote "origin"]
        url = https://github.com/username/repo.git
        fetch = +refs/heads/*:refs/remotes/origin/*
```

&emsp;&emsp;默认情况下，运行`git fetch`将获取远程仓库`refs/heads`目录下所有引用，同时写入本地`refs/remotes/origin`目录下。

```javascript
git fetch origin
...
From https://github.com/username/repo
 * [new branch]      dev         -> origin/dev
 * [new branch]      master      -> origin/master
find .git/refs/remotes/origin -type f
.git/refs/remotes/origin/dev
.git/refs/remotes/origin/master
```

#### 拓展

&emsp;&emsp;本地仓库获取`fetch`远程仓库`master`分支后，查看此分支提交历史。如下三个命令等价，并最终都会被拓展为`refs/remotes/origin/master`。

```javascript
git log origin/master
git log remotes/origin/master
git log refs/remotes/origin/master
```

#### 获取

&emsp;&emsp;只获取远程仓库`repo`的`master`分支，而不是所有分支，修改为如下引用规格。

```javascript
fetch = +refs/heads/master:refs/remotes/origin/master
```

&emsp;&emsp;获取多个远程分支。如下表示仅获取远程`master`和`dev`分支。

```javascript
fetch = +refs/heads/master:refs/remotes/origin/master
fetch = +refs/heads/dev:refs/remotes/origin/dev
```

#### 命名空间

&emsp;&emsp;推送本地`master`分支到远程仓库`feat/master`分支。

```javascript
git push origin master:feat/master
```

&emsp;&emsp;仅获取远程仓库`dev`分支和命名空间`feat`下的分支，修改为如下引用规格。

```javascript
fetch = +refs/heads/master:refs/remotes/origin/master
fetch = +refs/heads/feat/*:refs/remotes/origin/feat/*
```

#### 强制更新

&emsp;&emsp;若远程仓库`repo`存在`master`分支，用户`A`、`B`和`C`均关联并获取`fetch`了最新的修改。

&emsp;&emsp;用户`A`将与原历史无关的提交历史强制推送到了`master`。

&emsp;&emsp;用户`B`仓库`.git/config`配置如下。

```javascript
fetch = +refs/heads/*:refs/remotes/origin/*
```

&emsp;&emsp;用户`C`仓库`.git/config`配置如下，即删除`+`不开启强制更新。

```javascript
fetch = refs/heads/*:refs/remotes/origin/*
```

&emsp;&emsp;用户`B`获取`fetch`远程仓库中的修改，其中`forced update`即表示强制更新了`master`提交历史。

```javascript
git fetch origin
...
 + ... master     -> origin/master  (forced update)
```

&emsp;&emsp;用户`C`获取远程仓库修改，其中`master`分支的拉取被拒绝，因为其提交历史不能快进。

```javascript
git fetch origin
...
 ! [rejected]        master     -> origin/master  (non-fast-forward)
```

### 恢复与移除

#### 数据恢复

&emsp;&emsp;若某版本库提交历史如下，当前`HEAD`指向`master`分支。

```javascript
A —— B —— C —— D —— E <-- master <-- HEAD
```

&emsp;&emsp;回退`master`分支到提交记录`C`。

```javascript
git reset --hard HEAD^^
```

&emsp;&emsp;此时若再将`master`分支提交记录切换到`E`，可运行`git reflog`查看引用日志中的提交`E`。

```javascript
git reflog
...
329e7f4 HEAD@{1}: commit: E
```

&emsp;&emsp;运行`git reset --hard HEAD@{1}`可将`master`切换到提交`E`。

&emsp;&emsp;可能因为某些原因提交`E`不在引用日志`reflog`中，同时也没有任何引用指向提交`E`。

&emsp;&emsp;要模拟此场景首先还是将`master`指向提交`C`，然后删除`.git/logs`目录中的引用日志，此时再运行`git reflog`将没有任何输出。

```javascript
rm -r .git/logs
```

&emsp;&emsp;运行如下命令，`Git`会检查数据库完整性，其中`--full`选项会显示出所有没有被其他对象指向的对象，`dangling commit`后即为提交`E`的校验和。

```javascript
git fsck --full
...
dangling commit 329e7f4...
```

#### 磁盘空间

&emsp;&emsp;运行如下命令，查看`Git`数据库中对象数量及其磁盘消耗。

```javascript
git count-objects -v
count: 3
size: 4
in-pack: 6
packs: 1
size-pack: 132
prune-packable: 2
garbage: 0
size-garbage: 0
```

&emsp;&emsp;打印参数描述如下。

- `count`：松散对象的数量
- `size`：松散对象占用的磁盘空间，以`KiB`为单位
- `in-pack`：包文件中所有对象的数量，即`.git/objects/pack`目录下所有以`.idx`为后缀名文件中保存的对象的个数
- `packs`：包文件的数量，即`.git/objects/pack`目录下以`.pack`为后缀名文件的个数
- `size-pack`：包文件占用的磁盘空间，以`KiB`为单位
- `prune-packable`：包文件中存在的松散对象的数量，运行`git prune-packed`可删除，运行`git prune-packed -n`显示将要删除的对象
- `garbage`：垃圾文件的数量，既不是有效的松散对象也不是有效包的文件数
- `size-garbage`：垃圾文件占用的磁盘空间，以`KiB`为单位

#### 移除对象

&emsp;&emsp;如果某个人向`Git`版本库添加了一个特别大的文件，然后又从项目中移除了，但是由于`Git`提交历史跟踪了此文件，或者说通过提交历史可随时还原此文件，每次运行`git clone`克隆项目历史时，都会强制下载此文件，造成的情况就是每次克隆非常耗时。

&emsp;&emsp;因此必须从最早开始引用此文件的树对象开始重写每一个提交记录，此操作破坏性地修改了提交历史，其他人拉取记录时最好运行`git pull --rebase`。

&emsp;&emsp;可能由于历史线过长不知道那个特别大的文件是什么，可通过如下方式查找出那个文件。

&emsp;&emsp;首先运行`git gc`打包`Git`数据库中的对象，同时查看`.git/objects/pack`目录下文件。

```javascript
git gc
find .git/objects/pack -type f
.git/objects/pack/pack-3aa8...a09e.idx
.git/objects/pack/pack-3aa8...a09e.pack
```

&emsp;&emsp;运行如下命令，查看索引文件内容并排序。其中第一行输出索引文件内容，通过管道传递给下一行命令。`sort`排序管道输入内容，`-n`表示按照数值大小排序，`-k 3`表示根据内容的第三列进行排序。`tail -3`表示显示内容的尾部`3`行。

```javascript
git verify-pack -v .git/objects/pack/pack-3aa8...a09e.idx \
  | sort -n -k 3 \
  | tail -3
bc65c0d9... commit 206 141 437
c4a96707... commit 206 140 1145
072e320f... blob   7407405 6594320 1978
```

&emsp;&emsp;上述列表中数据对象`072e320f`占用了`7M`左右的空间，运行如下命令根据校验和查找对应文件名称。其中`git rev-list --objects --all`查看所有`Git`对象的校验和与文件名的关系，输入到管道符中，`grep`匹配校验和为`072e320f`的行，最终查找到`file.zip`即为那个`7M`的大文件。

```javascript
git rev-list --objects --all | grep 072e320f
072e320f... file.zip
```

&emsp;&emsp;运行如下命令查看哪些提交记录对此文件做了改动，其中`--branches`表示范围为当前版本库所有分支。

```javascript
git log --oneline --branches -- file.zip
9db12cc (HEAD -> master) remove file.zip
52bd5ce add file.zip
```

&emsp;&emsp;运行如下命令擦除提交历史，其中`52bd5ce^..HEAD`表示`52bd5ce`及以后的提交记录都会被擦除重写。

```javascript
git filter-branch -f --prune-empty --index-filter 'git rm -f --cached --ignore-unmatch file.zip' 52bd5ce^..HEAD
```

&emsp;&emsp;再运行如下命令，彻底清理提交历史并对仓库重新分析打包。

- 擦除命令默认会生成备份，实质是保存了一个引用，指向原提交历史中的最新提交，`rm -rf`删除`.git/refs/original`目录下引用
- 修剪当前时间点前的所有引用日志
- 打印出无法到达的对象
- 将包中的所有无法到达的对象变成松散的、未打包的对象，而不是留在旧包中。打包后若新创建的包使某些现有包变得多余，删除冗余包
- 花费更多时间更加积极地优化存储库，修剪当前时间点前的松散对象

```javascript
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git fsck --full --unreachable
git repack -A -d
git gc --aggressive --prune=now
```

## Gitk

&emsp;&emsp;;`Gitk`是`Git`内置的图形可视化工具，包括提交历史图、每个提交的相关信息以及版本树中的文件。

&emsp;&emsp;;`Git`仓库根目录下运行`gitk`打开如下可视化界面。其中主要包括菜单栏`A`、提交历史`B`、提交信息`C`、版本树文件`D`四个区域。

![](/other/git/lower-gitk.png)

### 菜单栏

#### File

![](/other/git/lower-gitk-file.png)

- `Update`：更新，命令行操作仓库后，将更改反应在`gitk`中，更新引用并显示新旧差异。一般变基后运行，可以比较前一个分支头和新的分支头
- `Reload`：重新加载
- `Reread references`：重读引用
- `List references`：引用列表，包括标签和分支。其中`Filter`内`*`表示所有引用，`*master`则筛选`master`、`remotes/origin/master`分支

![](/other/git/lower-gitk-file-reference.png)

- `Start git gui`：打开`git gui`可视化工具
- `Quit`：退出

#### Edit

![](/other/git/lower-gitk-edit.png)

&emsp;&emsp;首选项`Preferences`包括常用设置、颜色和字体设置。注意提交信息区`C`中可能出现部分中文乱码的情况，需要在当前仓库下`.git/config`中追加如下。

```javascript
[gui]
    encoding = utf-8
```

![](/other/git/lower-gitk-edit-preferences.png)

- `Maximum graph width (lines)`：最大图形宽度(线)
- `Maximum graph width (% of pane)`：最大图形宽度(窗格百分比)
- `Show local changes`：显示本地更改
- `Auto-select SHA1 (length)`：自动选择`SHA-1`校验和(长度)
- `Hide remote refs`：隐藏远程引用
- `Tab spacing`：标签间距
- `Display nearby tags/heads`：显示最近的标签或者引用
- `Maximum # tags/heads to show`：标签或引用最大显示数
- `Limit diffs to listed paths`：限制列出路径的差异
- `Support per-file encodings`：支持文件编码
- `External difftool`：外部`diff`工具
- `Web browser`：`Web`浏览器
- `Use themed widgets`：使用小部件主题

#### View

![](/other/git/lower-gitk-view.png)

&emsp;&emsp;设置快速查询视图，可根据查询条件筛选查询记录，进而对比两个视图之间的差异。添加后的视图可编辑或者删除。

![](/other/git/lower-gitk-view-new.png)

- `View Name`：视图名称
- `Branches & tags`：分支或标签名，多个用空格隔开，可选项包括所有引用`All refs`、所有本地分支`All (local) branches`、所有标签`All tags`、所有远程跟踪分支`All remote-tracking branches`
- `Commit Info`：提交信息，包括作者`Author`、提交者`Committer`、提交信息`Commit Message`，可选项包括匹配所有提交信息条件`Matches all Commit Info citeria`、不匹配所有提交信息条件`Matches no Commit Info crteria`
- `Changes to Files`：文件内容的更改，包括固定字符串`Fixed String`、正则表达式匹配`Regular Expression`
- `Commit Dates`：提交时间，包括开始时间`Since`和结束时间`Until`
- `Limit and/or skip a number of revision (positive integer)`：显示固定数量的提交日志，可从头跳过一定数量的日志
- `Miscellaneous options`：其他选项，包括按时间排序`Strictly sort by date`、标记分支侧`Mark branch sides`、限制第一父提交`Limit to first parent`、简要历史`Simple history`，也可自定义`git log`的参数
- `Enter files and directories to include, one per line`：包括的文件和目录，一行一个

#### Help

![](/other/git/lower-gitk-help.png)

&emsp;&emsp;;`gitk`帮助包括`gitk`简介、快捷键。

### 提交历史

![](/other/git/lower-gitk-commit-history.png)

&emsp;&emsp;提交历史包括提交信息、提交者、提交时间。

&emsp;&emsp;点击不同的提交历史会被高亮为蓝色背景，最下方显示此提交的`SHA-1`校验和，每次点击都会被`gitk`记录，左右箭头切换记录的提交，`Row`为当前点击的提交的行数和总行数。

&emsp;&emsp;提交信息会高亮本地分支、标签、远程跟踪分支，其中本地分支为绿色背景，`HEAD`指向的分支为黑色粗体，标签为黄色背景，远程跟踪分支为橙色背景。

&emsp;&emsp;;`find`上下箭头切换满足查询条件的提交记录。

#### 分支右键菜单

![](/other/git/lower-gitk-branch-right.png)

- `Check out this branch`：切换到此分支，即`HEAD`指向此分支
- `Rename this branch`：重命名此分支
- `Remove this branch`：删除此分支
- `Copy branch name`：拷贝分支名

#### 记录右键菜单

![](/other/git/lower-gitk-record-right.png)

- `Create tag`：创建标签
- `Copy commit reference`：拷贝此提交简略信息，包括`7`位`SHA-1`校验和、提交信息和提交时间（年月日）
- `Write commit to file`：导出详细提交信息为文件，包括具体修改内容
- `Create new branch`：创建新分支
- `Cherry-pick`：拣选此提交
- `Reset master branch to here`：重置`master`分支到此提交，包括`Soft`、`Mixed`和`Hard`，其中`Hard`将重置工作目录和暂存区，`Mixed`将重置暂存区域，`Soft`仅撤销此提交后的提交

![](/other/git/lower-gitk-record-reset.png)

- `Mark this commit`：标记此提交，被标记的提交含黑色边框，注意只能有一个被标记的提交
- `Revert this commit`：还原此提交，即生成新的提交来撤销此提交的修改

#### 标记后右键菜单

&emsp;&emsp;标记某个提交后，其余的提交将开启部分右键菜单。

![](/other/git/lower-gitk-tag-right.png)

- `Return to mark`：跳转到被标记的提交
- `Find descendant of this and mark`：查找当前提交和被标记的提交的最近的共同后代
- `Compare with marked commit`：比较此提交和被标记的提交，不同于`diff`
- `Diff this -> markedcommit`：`diff`此提交和被标记的提交
- `Diff marked commit -> this`：`diff`被标记的提交和此提交

#### 选中后右键菜单

&emsp;&emsp;选中某次提交后，右键其他提交将开启部分右键菜单。

![](/other/git/lower-gitk-selected-right.png)

- `Diff this-> selected`：`diff`此提交和被选中的提交
- `Diff selected -> this`：`diff`被选中的提交和此提交
- `Make patch`：将此提交和被选中的提交的`diff`生成一个`patch`文件

#### 提交历史查询

&emsp;&emsp;底部`commit`后为查询类型列表。

![](/other/git/lower-gitk-commit-history-type.png)

- `containing`：包含，配合后面范围参数
- `touching paths`：文件路径
- `adding/removing string`：修改内容包括添加或删除的字符串
- `changing lines matching`：修改的行数

&emsp;&emsp;查询方式。

![](/other/git/lower-gitk-search-type.png)

- `Exact`：精确匹配
- `IgnCase`：忽略大小写
- `Regexp`：正则表达式

&emsp;&emsp;查询范围。

![](/other/git/lower-gitk-search-range.png)

- `All fileds`：所有范围
- `Headline`：提交信息的标题
- `Comments`：提交信息的内容
- `Author`：作者
- `Committer`：提交者

### 提交信息

&emsp;&emsp;显示提交的具体信息或两个提交的`diff`差异。

![](/other/git/lower-gitk-commit-msg.png)

#### 选项参数

- `Diff`：显示两个提交的`diff`差异
- `Old version`：旧版本
- `New version`：新版本
- `Lines of context`：变更区域的上下文行数
- `ignore space change`：忽略空格变化
- `diff`样式：包括`Line diff`、`Markup words`和`Color words`

![](/other/git/lower-gitk-commit-params.png)

#### 提交信息

- `Author`：作者
- `Committer`：提交者
- `Tags`：当前标签节点
- `Parent`：当前提交的父提交，合并提交存在多个父提交
- `Branches`：当前节点最近的分支
- `Follows`：当前节点最近的上一个标签
- `Precedes`：当前节点最近的下一个标签

### 版本树

![](/other/git/lower-gitk-version-tree.png)

#### 选项参数

- `Patch`：仅显示变更的文件列表
- `Tree`：显示完整文件树

#### 右键菜单

![](/other/git/lower-gitk-right-menu.png)

- `Highlight this too`：高亮修改过此文件的提交记录
- `Highlight this only`：仅高亮修改过此文件的提交记录，若当前提交历史中还高亮有其他文件，则取消其他文件的高亮
- `External diff`：使用外部`diff`工具查看
- `Blame parent commit`：查看此文件的全部内容的变更记录
- `Copy path`：拷贝文件路径

## Git Gui

&emsp;&emsp;;`Git Gui`也是`Git`内置的可视化工具，大部分操作相对于命令行显得方便很多，其中部分暂存等是命令行方式所达不到的。

&emsp;&emsp;仓库根目录下右击`Git GUI Here`或者命令行运行`git gui`打开如下可视化界面。其中主要包括菜单栏`A`、工作区变更`B`、差异对比`C`、暂存区`D`、提交信息`E`五个区域。

![](/other/git/lower-gui.png)

### 菜单栏

#### Repository

![](/other/git/lower-gui-repos.png)

- `Explore Working Copy`：浏览工作目录
- `Git Bash`：`Git`命令行
- `Browse master's Files`：浏览当前分支文件
- `Browse Branch Files`：浏览所有分支文件，其中`Revision Expression`为版本正则表达式，待选分支包括本地分支`Local Branch`、远程跟踪分支`Tracking Branch`、标签`Tag`，搜索栏关键字搜索待选分支

![](/other/git/lower-gui-repos-browse-branch.png)

- `Visualize master's History`：可视化当前分支的历史
- `Visualize All Branch History`：可视化所有分支的历史
- `Database Statistics`：数据库统计，其中包括松散对象数量`Number of loose objects`、 松散对象占用的磁盘空间`Disk space used by loose objects`、包文件中的对象数量`Number of packed objects`、包文件数量`Number of packs`、包文件中对象占用的磁盘空间`Disk space used by packed objects`、包文件中的松散对象`Packed objects waiting for pruning`、垃圾文件`Garbage files`，`Compress Database`即打包`git gc`数据库

![](/other/git/lower-gui-repos-database.png)

- `Compress Database`：打包数据库
- `Verify Database`：验证`fsck`数据库连贯性和有效性
- `Create Desktop Icon`：创建桌面图标
- `Quit`：退出

#### Edit

![](/other/git/lower-gui-edit.png)

&emsp;&emsp;;`Edit`用于操作提交信息区域，包括撤销`Undo`、重做`Redo`、剪切`Cut`、复制`Copy`、粘贴`Paste`、删除`Delete`、全选`Select All`、选项`Options`，除了`Options`外的选项一般用处不大，都能通过快捷键实现。

![](/other/git/lower-gui-edit-options.png)

&emsp;&emsp;其中`repo Repository`为当前仓库下的配置选项，`Global (All Repository)`为全局下的仓库配置选项。

- `Summarize Merge Commits`：汇总合并提交
- `Show Diffstat After Merge`：合并后显示`diff`统计
- `use Merge Tool`：使用合并工具
- `Trust File Modification Timestamps`：信任文件的改动时间
- `Prune Tracking Branches During Fetch`：获取时清除跟踪分支
- `Match Tracking Branches`：匹配跟踪分支
- `Use Textconv For Diffs and Blames`：对差异和标注使用`Textconv`
- `Blame Copy Only On Changed Files`：仅标注变动的文件
- `Maximum Length of Recent Repositories List`：当前版本库列表的最大长度
- `Minimum Letters To Blame Copy On`：标注副本的最少字母数量
- `Blame History Context Radius (days)`：标注历史上下文范围（天）
- `Number of Diff Context Line`：`diff`差异的上下文行数
- `Additional Diff Parameters`：其他`diff`参数
- `Commit Message Text Width`：提交信息文本宽度
- `Commit Message Text Width`：新分支名称模板
- `Default File Contents Encoding`：默认文件内容编码格式
- `Warn before committing to a detached head`：提交到一个游离的`HEAD`前警告
- `Staging of untracked files`：暂存未跟踪的文件，包括是`yes`、否`no`或者询问`ask`
- `Show untracked files`：显示未跟踪的文件

#### Branch

![](/other/git/lower-gui-branch.png)

- `Create`：创建分支，可输入分支名称`Name`创建，也可匹配远程跟踪分支`Match Tracking Branch Name`检出跟踪分支。或者从本地分支`Local Branch`、远程跟踪分支`Tracking Branch`、标签`Tag`检出分支，相关分支选项`Options`为更新存在的分支`Update Existing Branch`，包括无操作`No`、仅快进`Fast Forward Only`、重置`Reset`，拉取跟踪分支`Fetch Tracking Branch`，创建分支后并检出`Checkout After Creation`

![](/other/git/lower-gui-branch-create.png)

- `Checkout`：检出分支
- `Rename`：分支重命名
- `Delete`：删除分支
- `Reset`：重置当前分支，若包括有未提交的修改，重置时将丢失

#### Commit

![](/other/git/lower-gui-commit.png)

- `Amend Last Commit`：修改最后一次提交
- `Rescan`：刷新，外部命令行操作了版本库，刷新同步
- `Statge To Commit`：暂存选中的文件
- `Stage Changed Files To Commit`：暂存工作区文件
- `Unstage Form Commit`：撤销暂存选中的文件
- `Show Less Context`：`diff`显示更少的上下文
- `Show More Context`：`diff`显示更多的上下文
- `Sign Off`：提交信息末尾追加操作者信息，一般拣选时不清楚提交记录的来源，可追加操作者信息便于追溯
- `Commit`：提交

#### Merge

![](/other/git/lower-gui-merge.png)

- `Local Merge`：选择本地分支合并
- `Abort Merge`：撤销合并，某些情况下合并造成冲突，退回合并前的状态

#### Remote

![](/other/git/lower-gui-remote.png)

- `Fetch from`：获取某个远程库更新
- `Prune from`：裁剪从某个远程库删除的跟踪分支
- `Remove Remote`：删除某个远程库
- `Add`：添加某个远程库，包括立即拉取`Fetch Immediately`、初始化远程仓库并推送`Initialize Remote Repository and Push`、无操作`Do Nothing EIse Now`

![](/other/git/lower-gui-remote-add.png)

- `Push`：推送，可推送至指定远程仓库，也可强制覆盖已存在的分支`Force overwrite existing branch (may discard changes)`、使用简包`Use thin pack (for slow network connections)`、包括本地标签`Include tags`

![](/other/git/lower-gui-remote-push.png)

- `Delete Branch`：删除某个远程库的分支

#### Tools

![](/other/git/lower-gui-tools.png)

- `Add`：添加新的命令，包括命令名称`Name`、命令指令`Command`，运行前可显示对话框`Show a dialog before running`，用户选中一个版本`Ask the user to select a revision`或者询问用户附加参数`Ask the user for additional arguments`，不显示命令输出窗口`Don't show the command output window`，仅选择了`diff`才运行`Run only if a diff is selected`

![](/other/git/lower-gui-tools-add.png)

- `Remove`：删除某个添加的命令

#### Help

![](/other/git/lower-gui-help.png)

- `About Git Gui`：关于`Git Gui`
- `Online Documentation`：在线文档
- `Show SSH Key`：显示`SSH`公匙，当前不存在可点击`Generate Key`生成`Key`

![](/other/git/lower-gui-help-key.png)

### 差异对比

![](/other/git/lower-gui-diff.png)

&emsp;&emsp;差异对比区域无任何文件时右键菜单。

- `Undo Last Revert`：撤销最后一次丢弃`Revert`，丢弃文件`Revert Hunk`或丢弃行`Revert Line`均会丢弃掉修改，`Git Bash`命令行`git checkout`丢弃掉修改则无法再恢复，但是`Git Gui`缓存了最后一次丢弃前的那个文件的版本
- `Refresh`：刷新
- `Copy`：复制
- `Select All`：全选
- `Copy All`：复制全部
- `Decrease Font Size`：缩小字体
- `Increase Font Size`：放大字体
- `Encoding`：文件内容编码
- `Options`：选项

### 工作区变更

![](/other/git/lower-gui-working.png)

&emsp;&emsp;点击文件前蓝色图标可快捷暂存文件，差异对比开启部分右键菜单。

![](/other/git/lower-gui-working-right.png)

- `Stage Hunk For Commit`：暂存文件
- `Stage Line For Commit`：暂存某一行或者多行，可通过点击某一行或者托选多行实现选中
- `Rever Hunk`：撤销或丢弃文件的修改
- `Rever Line`：撤销或丢弃某一行或者多行的修改
- `Show Less Context`：显示更少的上下文
- `Show More Context`：显示更多的上下文

### 暂存区

![](/other/git/lower-gui-index.png)

&emsp;&emsp;点击文件前绿色图标可快捷取消暂存文件，差异对比开启部分右键菜单。

![](/other/git/lower-gui-index-right.png)

- `Unstaged Hunk From Commit`：取消暂存文件
- `Unstaged Line From Commit`：取消暂存文件的某一行或者多行

### 提交信息

![](/other/git/lower-gui-commit-msg.png)

- `Rescan`：刷新
- `Staged Changed`：暂存文件
- `Sign Off`：签署，提交信息的末尾追加一行操作者信息
- `Push`：推送
- `Amend Last Commit`：修改最后一次提交
- `Commit Message`：提交信息

&emsp;&emsp;提交信息右键菜单与菜单栏基本一致。

![](/other/git/lower-gui-commit-msg-right.png)

[上一篇](middle.md)

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125) / [Gitee](https://gitee.com/dongwei1125)、[GitHub Pages](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~