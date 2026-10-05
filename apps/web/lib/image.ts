"use client";
import exifr from "exifr";

export type PreparedPhoto = { url: string; width: number; height: number; focal35: number | null };

const MAX_SIDE = 1600;

export function canvasToBlob(c: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob thất bại"))), type, quality));
}

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Không mở được ảnh ${url}`));
    img.src = url;
  });
}

/** Xoay đúng chiều theo EXIF, thu về cạnh dài ≤ 1600 px, JPEG; giữ tiêu cự tương đương 35 mm nếu có. */
export async function preparePhoto(src: Blob): Promise<PreparedPhoto> {
  const exif = (await exifr.parse(src, ["FocalLengthIn35mmFormat"]).catch(() => null)) as { FocalLengthIn35mmFormat?: number } | null;
  const bitmap = await createImageBitmap(src, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await canvasToBlob(canvas, "image/jpeg", 0.9);
  return { url: URL.createObjectURL(blob), width, height, focal35: exif?.FocalLengthIn35mmFormat ?? null };
}

/** Điểm ảnh RGBA của ảnh thu nhỏ (cạnh dài ≤ maxSide) — để đo sáng. */
export async function readPixels(url: string, maxSide: number): Promise<{ data: Uint8ClampedArray; width: number; height: number }> {
  const img = await loadImage(url);
  const s = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * s));
  const height = Math.max(1, Math.round(img.naturalHeight * s));
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);
  return { data: ctx.getImageData(0, 0, width, height).data, width, height };
}
