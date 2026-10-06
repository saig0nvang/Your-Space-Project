import sharp from "sharp";
import { expect, test } from "vitest";
import { sharpCodec } from "./lamaLocal";

test("decodeGray: mask PNG RGBA của canvas → đúng 1 kênh, giữ nguyên vùng trắng", async () => {
  const w = 4, h = 2;
  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) rgba.set(i < 4 ? [255, 255, 255, 255] : [0, 0, 0, 255], i * 4);
  const png = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
  const g = await sharpCodec.decodeGray(new Uint8Array(png));
  expect(g.data.length).toBe(w * h);
  expect(Array.from(g.data)).toEqual([255, 255, 255, 255, 0, 0, 0, 0]);
});

test("resize: mask 1 kênh vẫn là 1 kênh sau khi co (không bị sharp đổi sang RGB)", async () => {
  const w = 8, h = 8;
  const data = new Uint8Array(w * h).map((_, i) => (i % w < 4 ? 255 : 0));
  const small = await sharpCodec.resize({ data, width: w, height: h }, 4, 4, "nearest");
  expect(small.data.length).toBe(16);
  expect(Array.from(small.data.slice(0, 4))).toEqual([255, 255, 0, 0]);
});
