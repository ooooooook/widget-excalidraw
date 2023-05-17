import React, { useState } from "react";
import "./App.css";
import {
  Excalidraw,
  exportToSvg,
  loadFromBlob,
  MainMenu,
  WelcomeScreen,
} from "@excalidraw/excalidraw";
import {
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types/types";
import {
  assetsUpload,
  getAsset,
  getBlockId,
  setAsset,
} from "./utils/siyuan";
import { serializeSVGToString } from "./utils/utils";

function App() {
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);

  const blockId: string | null = getBlockId();
  const loadDataFromSiyuan: Promise<ExcalidrawInitialDataState> = blockId
    ? getAsset(blockId).then((svgString: string | null) => {
        return svgString
          ? loadFromBlob(
              new Blob([svgString], { type: "image/svg+xml" }),
              null,
              null,
              null
            )
          : {};
      })
    : Promise.resolve({});

  const saveDataToSiyuan = () => {
    if (!excalidrawAPI) {
      return;
    }
    exportToSvg({
      elements: excalidrawAPI.getSceneElements(),
      appState: { exportEmbedScene: true, exportBackground: true },
      files: excalidrawAPI.getFiles(),
    })
      .then((svg: SVGSVGElement) => {
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        const svgString = serializeSVGToString(svg);
        return assetsUpload(false, "0", svgString);
      })
      .then((assetsPath: string) => {
        return setAsset(assetsPath);
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
          <button className="generic-btn" onClick={() => saveDataToSiyuan()}>
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
          initialData={loadDataFromSiyuan}
          langCode={"zh-CN"}
          autoFocus
          handleKeyboardGlobally
          renderTopRightUI={renderTopRightUI}
        >
          <MainMenu>
            <MainMenu.DefaultItems.LoadScene />
            <MainMenu.DefaultItems.SaveAsImage />
            <MainMenu.DefaultItems.Export />
            <MainMenu.DefaultItems.Help />
            <MainMenu.DefaultItems.ClearCanvas />
            <MainMenu.Separator />
            <MainMenu.DefaultItems.ToggleTheme />
            <MainMenu.DefaultItems.ChangeCanvasBackground />
          </MainMenu>
          <WelcomeScreen />
        </Excalidraw>
      </div>
    </>
  );
}

export default App;
