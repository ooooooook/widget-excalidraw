#!/usr/bin/env bash
BIN="${BASH_SOURCE-$0}"
BIN="$(dirname "${BIN}")"
ROOT_DIR="$(cd "${BIN}/.."; pwd)"

# https://docs.excalidraw.com/docs/@excalidraw/excalidraw/installation#static-assets
# 拷贝excalidraw静态资源至本地，避免使用CDN
cp -f -r "$ROOT_DIR/node_modules/@excalidraw/excalidraw/dist" "$ROOT_DIR/public/"

# 暴力覆盖public/Virgil.woff2 文件，以支持中文手写字体。
# https://segmentfault.com/a/1190000040701795
# https://www.uncoverman.com/excalidraw-plguin-in-obsidian-support-font-custom.html
# https://wordshub.github.io/free-font/font.html?MuYaoRuanBiShouXieTi_Regular
# https://cloudconvert.com/ttf-to-woff2
cp -f "$ROOT_DIR/scripts/Chinese.woff2" "$ROOT_DIR/public/dist/excalidraw-assets/Virgil.woff2"
cp -f "$ROOT_DIR/scripts/Chinese.woff2" "$ROOT_DIR/public/dist/excalidraw-assets-dev/Virgil.woff2"
