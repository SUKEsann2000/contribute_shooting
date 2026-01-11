export type Grid = number & { readonly __unit: "grid" };   // ブロック座標
export const grid = (n: number) => n as Grid;

export type Pixel = number & { readonly __unit: "pixel" }; // 描画用
export const pixel = (n: number) => n as Pixel;