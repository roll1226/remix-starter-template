import { useNavigate } from "@remix-run/react";
import { MouseEvent, useRef } from "react";
import "~/styles/image.css";
import { isOpaquePixel } from "~/utils/pixelCheck";

type Props = {
  src: string;
  alt?: string;
  navigateTo: string;
};

export function ClickableImage({ src, alt = "", navigateTo }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const navigate = useNavigate();

  const handleClick = async (e: MouseEvent<HTMLImageElement>) => {
    const img = imgRef.current;
    if (!img) return;

    const rect = img.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * img.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * img.height);

    // パフォーマンス最適化:
    // 1. 小さいCanvasで1ピクセルだけ描画
    // 2. α値キャッシュを避けてリアルタイム処理（画像1枚なら十分高速）
    if (await isOpaquePixel(img, x, y)) {
      navigate(navigateTo);
    }
  };

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className="clickable-img"
      onClick={handleClick}
    />
  );
}
