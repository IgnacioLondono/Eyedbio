import { getCropAreaFromFocus, type MediaFocus } from "@/lib/media-focus";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    img.src = src;
  });
}

export interface CropImageOptions {
  aspect: number;
  outputWidth: number;
  outputHeight: number;
  focus?: MediaFocus;
  circular?: boolean;
  mime?: "image/jpeg" | "image/png" | "image/webp";
  quality?: number;
}

export async function cropImageToBlob(
  imageSrc: string,
  options: CropImageOptions
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const focus = options.focus ?? { x: 50, y: 50, zoom: 1 };
  const crop = getCropAreaFromFocus(
    image.naturalWidth,
    image.naturalHeight,
    options.aspect,
    focus
  );

  const canvas = document.createElement("canvas");
  canvas.width = options.outputWidth;
  canvas.height = options.outputHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no disponible");

  if (options.circular) {
    ctx.beginPath();
    ctx.arc(
      options.outputWidth / 2,
      options.outputHeight / 2,
      options.outputWidth / 2,
      0,
      Math.PI * 2
    );
    ctx.closePath();
    ctx.clip();
  }

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    options.outputWidth,
    options.outputHeight
  );

  const mime = options.mime ?? "image/jpeg";
  const quality = options.quality ?? 0.9;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("No se pudo exportar la imagen"));
      },
      mime,
      quality
    );
  });
}
