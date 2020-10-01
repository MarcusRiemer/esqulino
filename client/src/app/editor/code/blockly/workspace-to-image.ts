// Copied and adapted from kynocy on Github
// https://gist.github.com/kyoncy/b662159121ad2ee5523ed4c750193707

import * as Blockly from "blockly";

declare interface CustomNode extends Node {
  removeAttribute(arg0: string): void;
}

const DOMURL = window.URL || window.webkitURL;

const getSvgBlob = (workspace: Blockly.WorkspaceSvg) => {
  const canvas = workspace.svgBlockCanvas_.cloneNode(true) as CustomNode;
  canvas.removeAttribute("transform");

  const css = `<defs><style type="text/css" xmlns="http://www.w3.org/1999/xhtml"><![CDATA[${Blockly.Css.CONTENT.join(
    ""
  )}]]></style></defs>`;
  const bboxElement = document.getElementsByClassName(
    "blocklyBlockCanvas"
  )[0] as SVGGraphicsElement;
  const bbox = bboxElement.getBBox();
  const content = new XMLSerializer().serializeToString(canvas);

  const xml = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${bbox.width}" height="${bbox.height}" viewBox=" ${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}">${css}">${content}</svg>
  `;

  return new Blob([xml], { type: "image/svg+xml;base64" });
};

const download = (url: string, filename: string) => {
  const element = document.createElement("a");
  element.href = url;
  element.download = filename;
  element.click();

  DOMURL.revokeObjectURL(element.href);
};

const downloadBlocklySvg = (
  workspace: Blockly.WorkspaceSvg,
  filename: string
) => {
  download(DOMURL.createObjectURL(getSvgBlob(workspace)), `${filename}.svg`);
};

const downloadBlocklyPng = (
  workspace: Blockly.WorkspaceSvg,
  filename: string
) => {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    canvas.getContext("2d").drawImage(img, 0, 0);
    download(canvas.toDataURL("image/png"), `${filename}.png`);
  };
  img.src = DOMURL.createObjectURL(getSvgBlob(workspace));
};

export const downloadBlockly = (
  format: "svg" | "png",
  workspace: Blockly.WorkspaceSvg,
  filename: string
): void => {
  if (format === "svg") {
    downloadBlocklySvg(workspace, filename);
  } else {
    downloadBlocklyPng(workspace, filename);
  }
};
