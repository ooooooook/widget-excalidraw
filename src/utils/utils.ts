export const isDarwin = /Mac|iPod|iPhone|iPad/.test(navigator.platform);

export function serializeSVGToString(svg: SVGSVGElement) {
    return new XMLSerializer().serializeToString(svg);
}