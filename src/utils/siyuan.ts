// 获取内容块ID
import { loadFromBlob, MIME_TYPES } from "@excalidraw/excalidraw";
import { RestoredDataState } from "@excalidraw/excalidraw/types/data/restore";

export function getBlockId(): string | null {
  return getBlockIdFromUrl() || getBlockIdFromParentDom();
}

// 从url获取块ID
export function getBlockIdFromUrl(): string | null {
  return getURLSearchParams("id");
}

export function getURLSearchParams(param: string): string | null {
  return new URLSearchParams(window.location.search).get(param);
}

// 从iframe的父Dom获取块ID
export function getBlockIdFromParentDom(): string | null {
  const parentDom = window.frameElement?.parentElement?.parentElement;
  return parentDom?.getAttribute("data-node-id") || null;
}

// 获取配置项
export function getOptions(blockId: string): Promise<Options> {
  return getBlockAttrs(blockId).then((attrs: BlockAttrs) => {
    return attrs.options;
  });
}

// 获取assets内容
export function getSvgContent(blockId: string): Promise<string> {
  return getBlockAttrs(blockId).then((value: BlockAttrs) => {
    const assert = value["data-assets"];
    return assert ? getFile(assert) : Promise.resolve("");
  });
}

export function getRestoreDataState(
  blockId: string | null
): Promise<RestoredDataState> {
  if (!blockId) {
    return Promise.resolve({} as RestoredDataState);
  }
  return getSvgContent(blockId).then((svg: string) => {
    if (!svg || svg === "") {
      return {} as RestoredDataState;
    }
    return loadFromBlob(
      new Blob([svg], { type: MIME_TYPES.svg }),
      null,
      null,
      null
    );
  });
}

// 获取块属性
export function getBlockAttrs(blockId: string): Promise<BlockAttrs> {
  return fetch("/api/attr/getBlockAttrs", {
    body: JSON.stringify({
      id: blockId,
    }),
    method: "POST",
  })
    .then((response) => {
      return response.json();
    })
    .then((e) => {
      const dataAssets = e.data["data-assets"] || e.data["custom-data-assets"];
      const optionsStr = e.data["options"] || e.data["custom-options"];
      const options: Options = optionsStr ? JSON.parse(optionsStr) : {};
      return { "data-assets": dataAssets, options };
    });
}

// 设置块属性
export function setBlockAttrs(attrs: BlockAttrs): Promise<Response> {
  const options = JSON.stringify(attrs.options);
  const dataAssets = attrs["data-assets"];
  const body = JSON.stringify({
    id: getBlockId(),
    attrs: {
      "data-assets": dataAssets,
      "custom-data-assets": dataAssets,
      options: options,
      "custom-options": options,
    },
  });
  return fetch("/api/attr/setBlockAttrs", {
    body: body,
    method: "POST",
  });
}

// 获取文件内容
export function getFile(path: string): Promise<string> {
  return fetch("/api/file/getFile", {
    method: "POST",
    body: JSON.stringify({
      path: `data/${path}`,
    }),
  }).then((response) => {
    return response.text();
  });
}

// 删除文件
export function removeFile(path: string): Promise<any> {
  return fetch("/api/file/removeFile", {
    method: "POST",
    body: JSON.stringify({
      path: `data/${path}`,
    }),
  }).then((response) => {
    return response.json();
  });
}

// 上传资源文件
export function assetsUpload(
  base64Encoded: boolean,
  filename: string,
  filedata: string
): Promise<string> {
  const blob = base64Encoded
    ? (() => {
        // base64 to Blob
        const bytes = atob(filedata);
        const ab = new ArrayBuffer(bytes.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < bytes.length; i++) {
          ia[i] = bytes.charCodeAt(i);
        }
        return new Blob([ab], { type: MIME_TYPES.svg });
      })()
    : new Blob([filedata], { type: MIME_TYPES.svg });
  const file = new File([blob], filename, { lastModified: Date.now() });

  const formdata = new FormData();
  formdata.append("assetsDirPath", "/assets/widget-excalidraw/");
  formdata.append("file[]", file);

  return fetch("/api/asset/upload", {
    method: "POST",
    body: formdata,
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      const assetsPath: string = data?.data?.succMap?.[filename];
      return assetsPath;
    });
}

// 判断是否开启授权
export async function isAuthEnable(): Promise<boolean> {
  const reponse = await fetch("/api/attr/getBlockAttrs", {
    body: JSON.stringify({
      id: getBlockId(),
    }),
    method: "POST",
  });
  return reponse.status === 401;
}

// ------

export declare type BlockAttrs = {
  "data-assets": string;
  options: Options;
};

export declare type Options = {
  gridModeEnabled: boolean;
  exportBackground: boolean;
  theme: string;
};
