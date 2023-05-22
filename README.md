# 思源笔记excalidraw挂件

基于 [excalidraw](https://docs.excalidraw.com/docs) 实现的思源笔记挂件。

插件效果（预览&编辑）：

![](public/preview.png)

## 功能

1. 以svg的格式保存excalidraw文件，挂件默认只渲染svg
2. 支持在独立窗口编辑

## 部署

1. 打包, 生成 build 目录

    ```bash
    yarn && yarn build
    ```

2. 将build目录部署至思源笔记, `SIYUAN_WORKSPACE` 为思源笔记的工作目录
    ```bash
    mv build ${SIYUAN_WORKSPACE}/data/widgets/excalidraw
    ```

## 开发

1. 配置思源笔记后端服务代理，默认是代理至 `http://localhost:6806/`，此地址可通过 `src/setupProxy.js` 修改
2. 启动服务命令：`yarn start`
3. 本地调试。
    - 访问 `http://localhost:3000/widgets/excalidraw/?id=${blockId}` 可调试编辑界面
    - 访问 `http://localhost:3000/widgets/excalidraw/?id=${blockId}&view=1` 可调试预览界面
