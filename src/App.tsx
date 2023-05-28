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
import {
  backgroundIcon,
  gridIcon,
  unsyncOffIcon,
  syncIcon,
} from "./utils/icons";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { debounce } from "lodash";

function App() {
  const blockId = siyuan.getBlockId();
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const [theme, setTheme] = useState<string>(THEME.LIGHT);
  const [gridModeEnabled, setGridModeEnabled] = useState<boolean>(true);
  const [exportBackground, setExportBackground] = useState<boolean>(true);
  const [initData, setInitData] = useState<ExcalidrawInitialDataState>();
  const [autoSave, setAutoSave] = useState<boolean>(true);

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

  const saveDataToSiyuan = (hints: boolean) => {
    if (!blockId || !excalidrawAPI) {
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
        // 缓存旧路径
        return siyuan.getBlockAttrs(blockId).then((e) => {
          return {
            oldAssetsPath: e["data-assets"],
            assetsPath,
          };
        });
      })
      .then(({ oldAssetsPath, assetsPath }) => {
        return siyuan
          .setBlockAttrs({
            "data-assets": assetsPath,
            // 图片配置项
            options: {
              gridModeEnabled,
              exportBackground,
              theme,
            },
          })
          .then((e) => {
            return {
              oldAssetsPath,
              response: e,
            };
          });
      })
      .then(({ oldAssetsPath, response }) => {
        response.json().then((e) => {
          let message;
          if (response.ok && e?.code === 0) {
            message = "保存成功";
            // 确保在保存成功之后再删除旧文件(尽力而为地删除，删除失败也没关系)
            siyuan.removeFile(oldAssetsPath).then((r) => r);
          } else {
            message = "保存失败";
          }
          if (hints) {
            excalidrawAPI.setToast({ message, closable: true, duration: 1000 });
          }
        });
      });
  };

  const renderTopRightUI = () => {
    return (
      <>
        {blockId && (
          <button
            className="library-button"
            onClick={() => saveDataToSiyuan(true)}
          >
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

  const debounceFun: EventListener = debounce(
    () => saveDataToSiyuan(false),
    2000
  );

  useEffect(() => {
    if (autoSave) {
      window.addEventListener("pointerup", debounceFun);
    } else {
      window.removeEventListener("pointerup", debounceFun);
    }
    return () => {
      window.removeEventListener("pointerup", debounceFun);
    };
  }, [autoSave, excalidrawAPI, theme, exportBackground, gridModeEnabled]);

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
              <MainMenu.DefaultItems.ClearCanvas />
              <MainMenu.DefaultItems.Help />
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
              <MainMenu.Separator />
              <MainMenu.Item
                onSelect={() => setAutoSave(!autoSave)}
                icon={autoSave ? syncIcon : unsyncOffIcon}
              >
                自动保存（{autoSave ? "已开启" : "已关闭"}）
              </MainMenu.Item>
            </MainMenu>
            <WelcomeScreen />
          </Excalidraw>
        )}
      </div>
    </>
  );
}

export default App;
