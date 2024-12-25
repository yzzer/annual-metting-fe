import React from 'react';
import { Face } from '@/model/Photo';

export default function FaceDetectionImage({
  imageUrl,
  faces,
}: {
  imageUrl: string;
  faces: Array<Face>;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  // const [imageSize, setImageSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      // setImageSize({ width: img.width, height: img.height });
      drawImageAndBox(img, faces);
    };
  }, [imageUrl, faces]);

  const drawImageAndBox = (img: HTMLImageElement, faces: Array<Face>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置 canvas 的尺寸为图片的原始尺寸
    canvas.width = img.width;
    canvas.height = img.height;

    const exp_x = 10;
    const exp_y = 15;

    // 绘制图片
    ctx.drawImage(img, 0, 0, img.width, img.height);

    // 绘制方框
    ctx.strokeStyle = '#FFFF00';
    ctx.lineWidth = 8;
    faces.forEach((face) => {
      const { target_x, target_y, target_w, target_h } = face;
      const box = {
        left: target_x - exp_x,
        top: target_y - exp_y,
        width: target_w + 2 * exp_x,
        height: target_h + 2 * exp_y,
      };
      ctx.strokeRect(box.left, box.top, box.width, box.height);
    });
  };

  return (
    <canvas
      ref={canvasRef}
      className="max-h-full max-w-full rounded-xl"
    ></canvas>
  );
}