import { getAsset, getBlockId } from "./utils/siyuan";
import { useEffect, useState } from "react";
import "./AppView.css";

function App() {
  const [svg, setSvg] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const blockId = getBlockId();
  const reloadSvg = () => {
    getAsset(blockId).then((_svg) => _svg && setSvg(_svg));
  };

  const openEditWindow = () => {
    window.open("/widgets/excalidraw/?id=" + blockId);
  };

  // 在组件挂载之前初始化变量
  useEffect(() => {
    reloadSvg();
  }, []);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ display: "flex", height: "99vh", justifyContent: "center" }}
    >
      <div
        className="toolbar"
        style={{ display: isHovered ? "block" : "none" }}
      >
        <button className="generic-btn" onClick={reloadSvg}>
          刷新
        </button>
        <button className="generic-btn" onClick={openEditWindow}>
          编辑
        </button>
      </div>
      <div dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
}

export default App;
