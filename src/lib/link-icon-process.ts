import sharp from "sharp";

const LINK_ICON_SIZE = 128;

/**
 * Convierte un icono subido en plantilla blanca sobre transparente (128×128)
 * para teñirlo con el color de acento / modo monocromo del perfil.
 */
export async function processLinkIconBuffer(input: Buffer): Promise<Buffer> {
  const resized = await sharp(input)
    .rotate()
    .resize(LINK_ICON_SIZE, LINK_ICON_SIZE, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .greyscale()
    .normalise()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = resized;
  const pixels = new Uint8Array(data);
  const out = new Uint8Array(info.width * info.height * 4);

  for (let i = 0; i < info.width * info.height; i++) {
    const o = i * 4;
    const lum = pixels[o];
    const alpha = pixels[o + 3];
    const strength = Math.round((lum / 255) * (alpha / 255) * 255);
    const a = strength > 40 ? strength : 0;
    out[o] = 255;
    out[o + 1] = 255;
    out[o + 2] = 255;
    out[o + 3] = a;
  }

  return sharp(out, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toBuffer();
}
