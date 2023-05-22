#!/usr/bin/env bash
BIN="${BASH_SOURCE-$0}"
BIN="$(dirname "${BIN}")"
ROOT_DIR="$(cd "${BIN}/.."; pwd)"

# https://docs.excalidraw.com/docs/@excalidraw/excalidraw/installation#static-assets
# 拷贝excalidraw静态资源至本地，避免使用CDN
cp -r "$ROOT_DIR/node_modules/@excalidraw/excalidraw/dist" "$ROOT_DIR/public/dist"