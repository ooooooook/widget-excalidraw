#!/bin/bash

# 切换到main分支
git checkout main

# 拷贝build目录下的所有文件到当前目录
cp -R build/* .

# 添加所有文件到暂存区
git add .

# 提交到main分支
git commit -m "update"

git push

# 切换回dev分支
git checkout dev