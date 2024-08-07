#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run build

# 进入生成的文件夹
cd docs/.vuepress/dist

git init
git add -A
git commit -m 'feat: deploy pages'

# 如果发布到 https://<USERNAME>.github.io
git remote add origin https://github.com/dongwei1125/dongwei1125.github.io.git
git push origin master -f

cd -