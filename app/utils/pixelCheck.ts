/**
 * 不透明ピクセルをクリックしたかを判定する関数
 * @param img HTMLImageElement
 * @param x クリック位置（画像内の相対座標X）
 * @param y クリック位置（画像内の相対座標Y）
 */
export async function isOpaquePixel(
  img: HTMLImageElement,
  x: number,
  y: number
): Promise<boolean> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  // 画像サイズに合わせて描画
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const pixel = ctx.getImageData(x, y, 1, 1).data;
  const alpha = pixel[3]; // 0〜255
  return alpha > 10; // αが低すぎる(≒透過)ならクリック無効
}
