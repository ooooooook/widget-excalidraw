import React, { useEffect, useState } from "react";
import "./App.css";
import {
  Excalidraw,
  exportToSvg,
  loadFromBlob,
  MainMenu,
  MIME_TYPES,
  THEME,
  WelcomeScreen,
} from "@excalidraw/excalidraw";
import {
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types/types";
import * as siyuan from "./utils/siyuan";
import { serializeSVGToString } from "./utils/utils";
import { getOptions } from "./utils/siyuan";

function App() {
  const blockId = siyuan.getBlockId();
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const [theme, setTheme] = useState<string>(THEME.LIGHT);
  const [gridModeEnabled, setGridModeEnabled] = useState<boolean>(true);
  const [exportBackground, setExportBackground] = useState<boolean>(true);

  useEffect(() => {
    if (blockId) {
      getOptions(blockId).then((options) => {
        setTheme(options.theme ?? THEME.LIGHT);
        setGridModeEnabled(options.gridModeEnabled ?? true);
        setExportBackground(options.exportBackground ?? true);
      });
    }
  }, [blockId]);

  const loadDataFromSiyuan: () => Promise<ExcalidrawInitialDataState> =
    async () => {
      if (!blockId) {
        return Promise.resolve({});
      } else {
        return siyuan.getSvgContent(blockId).then((svg: string) => {
          return loadFromBlob(
            new Blob([svg], { type: MIME_TYPES.svg }),
            null,
            null,
            null
          );
        });
      }
    };

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
        const message = response.ok ? "成功" : "失败";
        return window.alert(`保存${message}`);
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

  return (
    <>
      <div style={{ height: "100vh" }}>
        <Excalidraw
          ref={(api: ExcalidrawImperativeAPI) => setExcalidrawAPI(api)}
          initialData={loadDataFromSiyuan()}
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
          onChange={(elements, appState, files) => {
            setTheme(appState.theme);
          }}
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
              onSelect={() => setGridModeEnabled(!gridModeEnabled)}
            >
              {gridModeEnabled ? "隐藏" : "显示"}网格
            </MainMenu.Item>
            <MainMenu.Item
              onSelect={() => setExportBackground(!exportBackground)}
            >
              {exportBackground ? "禁用" : "使用"}背景
            </MainMenu.Item>
            <MainMenu.DefaultItems.ChangeCanvasBackground />
          </MainMenu>
          <WelcomeScreen />
        </Excalidraw>
      </div>
    </>
  );
}

export default App;
