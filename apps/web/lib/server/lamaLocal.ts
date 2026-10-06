import { existsSync } from "node:fs";
import * as ort from "onnxruntime-node";
import type { InferenceSession } from "onnxruntime-node";
import sharp from "sharp";

/** Cạnh ô vuông mà LaMa-ONNX (Carve/LaMa-ONNX) yêu cầu. */
const LAMA_SIZE = 512;
/** Nới mask ra vài px sau khi co nhỏ (bù lệch khi resize nearest) — theo spike `lama_fill`. */
const MASK_DILATE_PX = 2;

// ── Hàm thuần: tensor ↔ pixel ───────────────────────────────────────────────

/** Ảnh RGB xen kênh (0..255), đã ở đúng kích thước đích → CHW float32 0..1. */
export function toImageTensor(rgb: Uint8Array, w: number, h: number): Float32Array {
  const plane = w * h;
  const out = new Float32Array(3 * plane);
  for (let i = 0; i < plane; i++) {
    const o = i * 3;
    out[i] = (rgb[o] ?? 0) / 255;
    out[plane + i] = (rgb[o + 1] ?? 0) / 255;
    out[2 * plane + i] = (rgb[o + 2] ?? 0) / 255;
  }
  return out;
}

/** Mask xám 1 kênh (0..255), đã ở đúng kích thước đích → ngưỡng >127, nới `dilatePx` (4 láng giềng), float32 {0,1}. */
export function toMaskTensor(gray: Uint8Array, w: number, h: number, dilatePx: number): Float32Array {
  const n = w * h;
  let mask = new Uint8Array(n);
  for (let i = 0; i < n; i++) mask[i] = (gray[i] ?? 0) > 127 ? 1 : 0;
  for (let iter = 0; iter < dilatePx; iter++) {
    const next = mask.slice();
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (mask[i]) continue;
        const left = x > 0 && mask[i - 1];
        const right = x < w - 1 && mask[i + 1];
        const up = y > 0 && mask[i - w];
        const down = y < h - 1 && mask[i + w];
        if (left || right || up || down) next[i] = 1;
      }
    }
    mask = next;
  }
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = mask[i]!;
  return out;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Tensor CHW float32 đầu ra LaMa → RGB xen kênh Uint8Array 0..255. Tự nhận thang 0..1 hay 0..255 (max > 1,5). */
export function fromOutputTensor(data: Float32Array, w: number, h: number): Uint8Array {
  const plane = w * h;
  let max = 0;
  for (let i = 0; i < data.length; i++) if (data[i]! > max) max = data[i]!;
  const scale = max > 1.5 ? 1 / 255 : 1;
  const out = new Uint8Array(plane * 3);
  for (let i = 0; i < plane; i++) {
    const r = clamp01(data[i]! * scale);
    const g = clamp01(data[plane + i]! * scale);
    const b = clamp01(data[2 * plane + i]! * scale);
    const o = i * 3;
    out[o] = Math.round(r * 255);
    out[o + 1] = Math.round(g * 255);
    out[o + 2] = Math.round(b * 255);
  }
  return out;
}

// ── Giải/mã ảnh (sharp) — tách riêng để test createLocalLama bằng fake ─────

export type RawImage = { data: Uint8Array; width: number; height: number };

export type ImageCodec = {
  /** Giải mã JPEG/PNG bất kỳ → RGB xen kênh (bỏ alpha), kích thước gốc. */
  decodeRgb(bytes: Uint8Array): Promise<RawImage>;
  /** Giải mã PNG bất kỳ → 1 kênh xám, kích thước gốc. */
  decodeGray(bytes: Uint8Array): Promise<RawImage>;
  /** Co/giãn ảnh raw (giữ số kênh) về đúng `width`×`height`. */
  resize(raw: RawImage, width: number, height: number, kernel: "cubic" | "nearest"): Promise<RawImage>;
  /** Mã PNG từ ảnh raw 3 kênh (RGB) hoặc 1 kênh (xám). */
  encodePng(raw: RawImage): Promise<Uint8Array>;
};

const channelsOf = (raw: RawImage): 1 | 3 => (raw.data.length / (raw.width * raw.height) === 1 ? 1 : 3);

const sharpCodec: ImageCodec = {
  async decodeRgb(bytes) {
    const { data, info } = await sharp(bytes).removeAlpha().toColourspace("srgb").raw().toBuffer({ resolveWithObject: true });
    return { data: new Uint8Array(data), width: info.width, height: info.height };
  },
  async decodeGray(bytes) {
    const { data, info } = await sharp(bytes).grayscale().raw().toBuffer({ resolveWithObject: true });
    return { data: new Uint8Array(data), width: info.width, height: info.height };
  },
  async resize(raw, width, height, kernel) {
    const { data, info } = await sharp(raw.data, { raw: { width: raw.width, height: raw.height, channels: channelsOf(raw) } })
      .resize(width, height, { kernel, fit: "fill" })
      .raw()
      .toBuffer({ resolveWithObject: true });
    return { data: new Uint8Array(data), width: info.width, height: info.height };
  },
  async encodePng(raw) {
    return sharp(raw.data, { raw: { width: raw.width, height: raw.height, channels: channelsOf(raw) } }).png().toBuffer();
  },
};

// ── createLocalLama ──────────────────────────────────────────────────────────

export type CreateLocalLamaOpts = {
  modelPath: string;
  /** Mặc định: `onnxruntime-node` InferenceSession.create(modelPath, { executionProviders: ["cpu"] }). */
  loadSession?: (modelPath: string) => Promise<InferenceSession>;
  imageCodec?: ImageCodec;
};

export type LocalLama = {
  inpaint(image: Uint8Array, mask: Uint8Array): Promise<Uint8Array>;
  isAvailable(): boolean;
};

function defaultLoadSession(modelPath: string): Promise<InferenceSession> {
  return ort.InferenceSession.create(modelPath, { executionProviders: ["cpu"] });
}

/**
 * LaMa ONNX tự host (D11): nạp session lười (lần gọi đầu), giữ lại, chạy tuần tự (hàng đợi promise —
 * một lượt suy luận tại một thời điểm, vì một `InferenceSession` CPU dùng chung không an toàn chạy song song).
 */
export function createLocalLama(opts: CreateLocalLamaOpts): LocalLama {
  const loadSession = opts.loadSession ?? defaultLoadSession;
  const codec = opts.imageCodec ?? sharpCodec;

  let sessionPromise: Promise<InferenceSession> | null = null;
  function getSession(): Promise<InferenceSession> {
    sessionPromise ??= loadSession(opts.modelPath).then((session) => {
      const inputs = new Set(session.inputNames);
      if (!inputs.has("image") || !inputs.has("mask")) {
        throw new Error(`Model LaMa thiếu input "image"/"mask" (có: ${session.inputNames.join(", ")})`);
      }
      return session;
    });
    // Nạp lỗi thì cho thử lại lượt sau, không kẹt mãi ở lỗi của lượt đầu.
    sessionPromise.catch(() => { sessionPromise = null; });
    return sessionPromise;
  }

  let queue: Promise<unknown> = Promise.resolve();
  function enqueue<T>(run: () => Promise<T>): Promise<T> {
    const result = queue.then(run, run);
    queue = result.then(() => undefined, () => undefined);
    return result;
  }

  async function runInpaint(image: Uint8Array, mask: Uint8Array): Promise<Uint8Array> {
    const session = await getSession();
    const original = await codec.decodeRgb(image);
    const maskOriginal = await codec.decodeGray(mask);
    const imageSmall = await codec.resize(original, LAMA_SIZE, LAMA_SIZE, "cubic");
    const maskSmall = await codec.resize(maskOriginal, LAMA_SIZE, LAMA_SIZE, "nearest");

    const imageTensorData = toImageTensor(imageSmall.data, LAMA_SIZE, LAMA_SIZE);
    const maskTensorData = toMaskTensor(maskSmall.data, LAMA_SIZE, LAMA_SIZE, MASK_DILATE_PX);

    const feeds: Record<string, ort.Tensor> = {
      image: new ort.Tensor("float32", imageTensorData, [1, 3, LAMA_SIZE, LAMA_SIZE]),
      mask: new ort.Tensor("float32", maskTensorData, [1, 1, LAMA_SIZE, LAMA_SIZE]),
    };
    const result = await session.run(feeds);
    const outputName = session.outputNames[0]!;
    const outTensor = result[outputName]!;
    const rgbSmall = fromOutputTensor(outTensor.data as Float32Array, LAMA_SIZE, LAMA_SIZE);

    const rgbFull = await codec.resize(
      { data: rgbSmall, width: LAMA_SIZE, height: LAMA_SIZE },
      original.width,
      original.height,
      "cubic",
    );
    return codec.encodePng(rgbFull);
  }

  return {
    isAvailable(): boolean {
      return existsSync(opts.modelPath);
    },
    inpaint(image: Uint8Array, mask: Uint8Array): Promise<Uint8Array> {
      return enqueue(() => runInpaint(image, mask));
    },
  };
}
