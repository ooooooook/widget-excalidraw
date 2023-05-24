import React, { useEffect, useState } from "react";
import "./App.css";
import {
  Excalidraw,
  exportToSvg,
  MainMenu,
  THEME,
  WelcomeScreen,
} from "@excalidraw/excalidraw";
import {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types/types";
import * as siyuan from "./utils/siyuan";
import { serializeSVGToString } from "./utils/utils";
import { backgroundIcon, gridIcon } from "./utils/icons";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

function App() {
  const blockId = siyuan.getBlockId();
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const [theme, setTheme] = useState<string>(THEME.LIGHT);
  const [gridModeEnabled, setGridModeEnabled] = useState<boolean>(true);
  const [exportBackground, setExportBackground] = useState<boolean>(true);
  const [initData, setInitData] = useState<ExcalidrawInitialDataState>();

  useEffect(() => {
    if (blockId) {
      // 初始化配置项
      siyuan.getOptions(blockId).then((options) => {
        setTheme(options.theme ?? THEME.LIGHT);
        setGridModeEnabled(options.gridModeEnabled ?? true);
        setExportBackground(options.exportBackground ?? true);
      });
      // 初始化数据
      siyuan.getRestoreDataState(blockId).then((e) => setInitData(e));
    }
  }, []);

  const saveDataToSiyuan = () => {
    if (!excalidrawAPI) {
      return;
    }
    const { viewBackgroundColor } = excalidrawAPI.getAppState();
    exportToSvg({
      elements: excalidrawAPI.getSceneElements(),
      appState: {
        exportEmbedScene: true,
        exportWithDarkMode: theme === THEME.DARK,
        exportBackground,
        viewBackgroundColor,
      },
      files: excalidrawAPI.getFiles(),
    })
      .then((svg: SVGSVGElement) => {
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        const svgString = serializeSVGToString(svg);
        return siyuan.assetsUpload(false, "0", svgString);
      })
      .then((assetsPath: string) => {
        const options: siyuan.Options = {
          gridModeEnabled,
          exportBackground,
          theme,
        };
        return siyuan.setBlockAttrs({
          "data-assets": assetsPath,
          // 图片配置项
          options: options,
        });
      })
      .then((response: Response) => {
        const message = response.ok ? "保存成功" : "保存失败";
        excalidrawAPI.setToast({ message, closable: true, duration: 1000 });
      });
  };

  const renderTopRightUI = () => {
    return (
      <>
        {blockId && (
          <button className="library-button" onClick={() => saveDataToSiyuan()}>
            保存
          </button>
        )}
      </>
    );
  };

  const handleOnChange = (
    elements: readonly ExcalidrawElement[],
    appState: AppState,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    files: BinaryFiles
  ) => {
    setTheme(appState.theme);
  };

  return (
    <>
      <div style={{ height: "100vh" }}>
        {initData && (
          <Excalidraw
            ref={(api: ExcalidrawImperativeAPI) => setExcalidrawAPI(api)}
            initialData={initData}
            langCode={"zh-CN"}
            autoFocus
            handleKeyboardGlobally
            renderTopRightUI={renderTopRightUI}
            gridModeEnabled={gridModeEnabled}
            theme={theme}
            UIOptions={{
              canvasActions: {
                toggleTheme: true,
              },
            }}
            onChange={handleOnChange}
          >
            <MainMenu>
              <MainMenu.DefaultItems.LoadScene />
              <MainMenu.DefaultItems.SaveAsImage />
              <MainMenu.DefaultItems.Export />
              <MainMenu.DefaultItems.Help />
              <MainMenu.DefaultItems.ClearCanvas />
              <MainMenu.Separator />
              <MainMenu.DefaultItems.ToggleTheme />
              <MainMenu.Item
                icon={gridIcon}
                onSelect={() => setGridModeEnabled(!gridModeEnabled)}
              >
                {gridModeEnabled ? "隐藏" : "显示"}网格
              </MainMenu.Item>
              <MainMenu.Item
                icon={backgroundIcon}
                onSelect={() => setExportBackground(!exportBackground)}
              >
                {exportBackground ? "禁用" : "使用"}背景
              </MainMenu.Item>
              <MainMenu.DefaultItems.ChangeCanvasBackground />
            </MainMenu>
            <WelcomeScreen />
          </Excalidraw>
        )}
      </div>
    </>
  );
}

export default App;
