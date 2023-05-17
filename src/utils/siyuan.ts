// 获取内容块ID
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

export function getAsset(blockId: string | null): Promise<string | null> {
  if (blockId) {
    return fetch("/api/attr/getBlockAttrs", {
      body: JSON.stringify({
        id: blockId,
      }),
      method: "POST",
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        return data.data["data-assets"] || data.data["custom-data-assets"];
      })
      .then((assert: string | null) => {
        return assert ? getFile(assert) : Promise.resolve(null);
      });
  } else {
    return Promise.resolve(null);
  }
}

// 设置块属性
export function setAsset(asset: any): Promise<Response> {
  return fetch("/api/attr/setBlockAttrs", {
    body: JSON.stringify({
      id: getBlockId(),
      attrs: {
        "data-assets": asset,
        "custom-data-assets": asset,
      },
    }),
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

// 上传资源文件
export function assetsUpload(
  base64Encoded: boolean,
  filename: string,
  filedata: string
): Promise<string> {
  const mime = "image/svg+xml";
  const blob = base64Encoded
    ? (() => {
        // base64 to Blob
        const bytes = atob(filedata);
        const ab = new ArrayBuffer(bytes.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < bytes.length; i++) {
          ia[i] = bytes.charCodeAt(i);
        }
        return new Blob([ab], { type: mime });
      })()
    : new Blob([filedata], { type: mime });
  const file = new File([blob], filename, { lastModified: Date.now() });

  const formdata = new FormData();
  formdata.append("assetsDirPath", "/assets/excalidraw/");
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
