import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { createLocalLama, fromOutputTensor, toImageTensor, toMaskTensor, type ImageCodec, type RawImage } from "./lamaLocal";

// ── Hàm thuần ────────────────────────────────────────────────────────────

test("toImageTensor: RGB xen kênh 0..255 → CHW float32 0..1", () => {
  // 2x1: điểm 0 đỏ thuần, điểm 1 xanh lá thuần.
  const rgb = new Uint8Array([255, 0, 0, 0, 255, 0]);
  const chw = toImageTensor(rgb, 2, 1);
  expect(Array.from(chw)).toEqual([1, 0, 0, 1, 0, 0]); // R:[1,0] G:[0,1] B:[0,0]
});

test("toMaskTensor: ngưỡng >127, dilatePx=0 không nới", () => {
  const gray = new Uint8Array([0, 200, 100, 255]);
  const out = toMaskTensor(gray, 2, 2, 0);
  expect(Array.from(out)).toEqual([0, 1, 0, 1]);
});

test("toMaskTensor: dilatePx nới mask ra 4 láng giềng mỗi lượt", () => {
  // 3x3, chỉ tâm (1,1) = trắng. Nới 1 px → thêm 4 ô liền kề (không nới chéo).
  // prettier-ignore
  const gray = new Uint8Array([
    0, 0, 0,
    0, 255, 0,
    0, 0, 0,
  ]);
  const out = toMaskTensor(gray, 3, 3, 1);
  // prettier-ignore
  expect(Array.from(out)).toEqual([
    0, 1, 0,
    1, 1, 1,
    0, 1, 0,
  ]);
});

test("fromOutputTensor: thang 0..1 giữ nguyên, clamp âm/vượt", () => {
  const plane = 2; // 2x1
  const data = new Float32Array([1.4, -0.2, 0.5, 0.5, 0, 1]);
  const rgb = fromOutputTensor(data, 2, 1);
  // R:[1,0] G:[0.5,0.5]→[128,128] B:[0,255]
  expect(Array.from(rgb)).toEqual([255, 128, 0, 0, 128, 255]);
  void plane;
});

test("fromOutputTensor: max > 1.5 → hiểu là thang 0..255", () => {
  // CHW: R:[255,0] G:[128,128] B:[0,255] → điểm 0 (255,128,0), điểm 1 (0,128,255).
  const data = new Float32Array([255, 0, 128, 128, 0, 255]);
  const rgb = fromOutputTensor(data, 2, 1);
  expect(Array.from(rgb)).toEqual([255, 128, 0, 0, 128, 255]);
});

// ── createLocalLama (session/queue, qua fake) ──────────────────────────────

function fakeRaw(n: number, w: number, h: number): RawImage {
  return { data: new Uint8Array(n).fill(7), width: w, height: h };
}

function fakeCodec(): ImageCodec {
  return {
    decodeRgb: vi.fn(async (bytes: Uint8Array) => fakeRaw(bytes.length, 4, 4)),
    decodeGray: vi.fn(async (bytes: Uint8Array) => fakeRaw(bytes.length, 4, 4)),
    resize: vi.fn(async (_raw: RawImage, w: number, h: number) => fakeRaw(w * h, w, h)),
    encodePng: vi.fn(async () => new Uint8Array([80, 78, 71])), // "PNG" giả
  };
}

function fakeSession(order: string[], names: { in: string[]; out: string[] } = { in: ["image", "mask"], out: ["output"] }) {
  return {
    inputNames: names.in,
    outputNames: names.out,
    run: vi.fn(async () => {
      order.push("run");
      return { [names.out[0]!]: { data: new Float32Array(512 * 512 * 3), dims: [1, 3, 512, 512] } };
    }),
  };
}

let modelDir: string;
beforeEach(() => {
  modelDir = mkdtempSync(join(tmpdir(), "lama-test-"));
});
afterEach(() => {
  rmSync(modelDir, { recursive: true, force: true });
});

test("isAvailable: phản ánh đúng việc file model có tồn tại", () => {
  const modelPath = join(modelDir, "lama.onnx");
  const lama = createLocalLama({ modelPath });
  expect(lama.isAvailable()).toBe(false);
  writeFileSync(modelPath, "x");
  expect(lama.isAvailable()).toBe(true);
});

test("nạp session một lần, dùng lại cho các lượt sau", async () => {
  const order: string[] = [];
  const session = fakeSession(order);
  const loadSession = vi.fn(async () => session as never);
  const lama = createLocalLama({ modelPath: join(modelDir, "lama.onnx"), loadSession, imageCodec: fakeCodec() });
  await lama.inpaint(new Uint8Array([1]), new Uint8Array([2]));
  await lama.inpaint(new Uint8Array([3]), new Uint8Array([4]));
  expect(loadSession).toHaveBeenCalledTimes(1);
  expect(session.run).toHaveBeenCalledTimes(2);
});

test("chạy tuần tự: lượt thứ hai chỉ bắt đầu sau khi lượt đầu xong", async () => {
  const order: string[] = [];
  let resolveFirst!: () => void;
  const firstGate = new Promise<void>((r) => (resolveFirst = r));
  let firstStarted!: () => void;
  // Đợi đúng lúc lượt 1 vào session.run (không đoán thời gian bằng setTimeout — tránh phụ thuộc máy chạy nhanh/chậm,
  // kể cả lúc nạp lần đầu module `onnxruntime-node` thật bên trong runInpaint).
  const firstStartedGate = new Promise<void>((r) => (firstStarted = r));
  let call = 0;
  const session = {
    inputNames: ["image", "mask"],
    outputNames: ["output"],
    run: vi.fn(async () => {
      call += 1;
      const mine = call;
      order.push(`start${mine}`);
      if (mine === 1) {
        firstStarted();
        await firstGate;
      }
      order.push(`end${mine}`);
      return { output: { data: new Float32Array(512 * 512 * 3), dims: [1, 3, 512, 512] } };
    }),
  };
  const lama = createLocalLama({
    modelPath: join(modelDir, "lama.onnx"),
    loadSession: async () => session as never,
    imageCodec: fakeCodec(),
  });
  const p1 = lama.inpaint(new Uint8Array([1]), new Uint8Array([2]));
  const p2 = lama.inpaint(new Uint8Array([3]), new Uint8Array([4]));
  await firstStartedGate;
  expect(order).toEqual(["start1"]); // lượt 2 chưa chạy vì lượt 1 còn treo
  resolveFirst();
  await Promise.all([p1, p2]);
  expect(order).toEqual(["start1", "end1", "start2", "end2"]);
});

test("model thiếu input image/mask → báo lỗi rõ, không gọi run", async () => {
  const order: string[] = [];
  const session = fakeSession(order, { in: ["img", "msk"], out: ["output"] });
  const lama = createLocalLama({
    modelPath: join(modelDir, "lama.onnx"),
    loadSession: async () => session as never,
    imageCodec: fakeCodec(),
  });
  await expect(lama.inpaint(new Uint8Array([1]), new Uint8Array([2]))).rejects.toThrow(/image|mask/);
  expect(session.run).not.toHaveBeenCalled();
});

test("inpaint: gọi codec đúng thứ tự giải mã → co 512×512 → mã PNG, trả byte từ encodePng", async () => {
  const order: string[] = [];
  const session = fakeSession(order);
  const codec = fakeCodec();
  const lama = createLocalLama({ modelPath: join(modelDir, "lama.onnx"), loadSession: async () => session as never, imageCodec: codec });
  const out = await lama.inpaint(new Uint8Array([1, 2, 3]), new Uint8Array([4, 5]));
  expect(Array.from(out)).toEqual([80, 78, 71]);
  expect(codec.decodeRgb).toHaveBeenCalledTimes(1);
  expect(codec.decodeGray).toHaveBeenCalledTimes(1);
  expect(codec.resize).toHaveBeenCalledTimes(3); // ảnh→512, mask→512, kết quả→kích thước gốc
  expect(codec.encodePng).toHaveBeenCalledTimes(1);
});
