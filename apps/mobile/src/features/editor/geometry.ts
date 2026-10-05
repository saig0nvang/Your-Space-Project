/**
 * Hình học GIẢ LẬP của canvas bản thử. Bản thật dựng mô hình 3D theo mặt sàn và chiều cao máy (spec M1 §4);
 * ở đây món là ảnh mẫu đã tách nền (hoặc hình minh họa SVG), cỡ suy từ kích thước thật và vị trí trên sàn (xa thì nhỏ).
 */
import { productImage } from '@/data/productImages';
import { productModel, renders3D } from '@/data/productModels';
import type { Calibration, PlacedItem, Product, ProductCategory } from '@/types';

import { clampFootprint, modelPlacement, projectedBounds, roomCamera } from './roomCamera';

/** Dải mép trái (pt) không nhận cử chỉ canvas, để vuốt mép quay lại vẫn dùng được (docs/screens.md §2). */
export const EDGE_GUARD = 20;

export type Frame = { left: number; top: number; width: number; height: number };

export function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

/**
 * Khung ảnh: mép dưới nằm sát trên khay thu gọn để vùng sàn luôn chạm được. Ảnh cao hơn chỗ trống thì phần trên
 * (thường là tường) lùi dưới thanh trên; ảnh thấp hơn thì phóng lên cho kín tới mép trên màn, cắt đều hai bên —
 * không còn dải trắng phía trên ảnh, thanh trên nổi trên ảnh (impeccable layout, 2026-10-03).
 */
export function computePhotoFrame(input: { screenW: number; screenH: number; aspect: number; bottomReserved: number }): Frame {
  const aspect = input.aspect > 0 ? input.aspect : 3 / 4;
  const bottom = input.screenH - input.bottomReserved;
  let width = input.screenW;
  let height = width / aspect;
  if (height < bottom) {
    height = bottom;
    width = height * aspect;
  }
  return { left: (input.screenW - width) / 2, top: bottom - height, width, height };
}

/** Phần khung vuông của ProductArt (viewBox 0..100) mà hình minh họa chiếm: rộng, cao, và vị trí chân món. */
const ART_BOX: Record<ProductCategory, { w: number; h: number; base: number }> = {
  sofa: { w: 0.84, h: 0.47, base: 0.81 },
  table: { w: 0.8, h: 0.34, base: 0.8 },
  lamp: { w: 0.48, h: 0.74, base: 0.88 },
  shelf: { w: 0.52, h: 0.79, base: 0.89 },
  chair: { w: 0.48, h: 0.67, base: 0.85 },
};

export type Point2 = { x: number; y: number };

/** Bề ngang sàn (cm) mà mép dưới ảnh nhìn thấy, ở chiều cao máy 1,4 m. Giả định của bản thử. */
const VIEW_WIDTH_AT_BOTTOM_CM = 300;

/** Hệ số xa–gần theo vị trí y trên sàn: sát đường sàn thì nhỏ, sát mép dưới ảnh thì lớn. */
export function depthFactor(y: number, cal: Calibration): number {
  const guess = cal.horizonY ?? cal.floorLineY - 0.22;
  const horizon = clamp(Math.min(guess, cal.floorLineY - 0.05), 0.02, 0.9);
  return clamp((y - horizon) / (1 - horizon), 0.12, 1.2);
}

export type ItemLayout = {
  /** Khung vẽ món (pt, theo khung ảnh): vuông với hình SVG, đúng tỉ lệ ảnh với ảnh mẫu. */
  width: number;
  height: number;
  left: number;
  top: number;
  /** Vùng nhìn thấy của món (pt, theo khung ảnh). */
  bounds: { x0: number; y0: number; x1: number; y1: number };
};

/**
 * Số pt trên ảnh của 1 cm thật ở độ sâu `y` (chân món). Món luôn đúng kích thước thật — không có tỷ lệ (founder
 * 2026-10-04: cho phóng to / thu nhỏ món thì người dùng dễ lầm tưởng món vừa không gian).
 */
function ptPerCm(y: number, frame: { width: number }, cal: Calibration): number {
  const camera = clamp(cal.cameraHeightM / 1.4, 0.6, 1.6);
  return (frame.width / (VIEW_WIDTH_AT_BOTTOM_CM * camera)) * depthFactor(y, cal);
}

export function itemLayout(
  item: PlacedItem,
  product: Product,
  frame: { width: number; height: number },
  cal: Calibration,
  /** true: tính như món ảnh phẳng kể cả món có mô hình 3D (ảnh thu nhỏ vẽ món bằng ảnh). */
  flat = false,
): ItemLayout {
  // Món 3D: khung trên ảnh là khối hộp của mô hình chiếu qua máy ảo khớp ảnh phòng (roomCamera).
  const model = !flat && renders3D(product.id) ? productModel(product.id) : undefined;
  if (model) {
    const cam = roomCamera(cal);
    const aspect = frame.width / frame.height;
    const placed = modelPlacement(item, model.bounds, cam, cal.cameraHeightM, aspect);
    const pb = placed ? projectedBounds(placed, model.bounds, cam, cal.cameraHeightM, aspect) : null;
    if (pb) {
      const b = { x0: pb.u0 * frame.width, x1: pb.u1 * frame.width, y0: pb.v0 * frame.height, y1: pb.v1 * frame.height };
      return { width: b.x1 - b.x0, height: b.y1 - b.y0, left: b.x0, top: b.y0, bounds: b };
    }
  }
  const k = ptPerCm(item.y, frame, cal);
  const cx = item.x * frame.width;
  const by = item.y * frame.height;

  const image = productImage(product.id);
  if (image) {
    // Ảnh cắt sát món: bề ngang ảnh = bề ngang thật của món (ảnh chụp chếch thì chiều cao ảnh gồm cả mặt trên),
    // chân món ở mép dưới ảnh.
    const width = product.dimensions.widthCm * k;
    const height = width / image.aspect;
    return {
      width,
      height,
      left: cx - width / 2,
      top: by - height,
      bounds: { x0: cx - width / 2, x1: cx + width / 2, y0: by - height, y1: by + height * 0.02 },
    };
  }

  const box = ART_BOX[product.category];
  const size = Math.max(product.dimensions.widthCm / box.w, product.dimensions.heightCm / box.h) * k;
  return {
    width: size,
    height: size,
    left: cx - size / 2,
    top: by - size * box.base,
    bounds: {
      x0: cx - (size * box.w) / 2,
      x1: cx + (size * box.w) / 2,
      y0: by - size * box.h,
      y1: by + size * 0.04,
    },
  };
}

/** Vùng chạm của món: tối thiểu 44 × 44 quanh phần nhìn thấy. */
export function hitRect(bounds: ItemLayout['bounds'], min = 44) {
  const cx = (bounds.x0 + bounds.x1) / 2;
  const cy = (bounds.y0 + bounds.y1) / 2;
  const w = Math.max(bounds.x1 - bounds.x0, min);
  const h = Math.max(bounds.y1 - bounds.y0, min);
  return { x0: cx - w / 2, x1: cx + w / 2, y0: cy - h / 2, y1: cy + h / 2 };
}

/** Giới hạn vị trí chân món: luôn trên sàn và không ra khỏi khung ảnh (E4-US4 AC2, CC2). */
export function clampToFloor(x: number, y: number, floorLineY: number): { x: number; y: number } {
  return { x: clamp(x, 0.04, 0.96), y: clamp(y, Math.min(floorLineY + 0.01, 0.97), 0.98) };
}

/** Chân tường (y 0..1) tại x: theo đường gãy khúc AI nhận ra, không có thì là đường sàn ngang. */
export function wallBaseAt(x: number, cal: Calibration): number {
  const pts = cal.wallBase;
  if (!pts || pts.length < 2) return cal.floorLineY;
  if (x <= pts[0][0]) return cal.floorLineY + pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [x1, d1] = pts[i];
    const [x0, d0] = pts[i - 1];
    if (x <= x1) return cal.floorLineY + d0 + ((x - x0) / (x1 - x0)) * (d1 - d0);
  }
  return cal.floorLineY + pts[pts.length - 1][1];
}

/** Đỉnh của chân tường trong khoảng [x0, x1] (chuẩn hoá), để vẽ: các đỉnh gãy nằm trong khoảng cùng hai đầu. */
export function wallBasePoints(x0: number, x1: number, cal: Calibration): Point2[] {
  const xs = [x0, ...(cal.wallBase ?? []).map(([x]) => x).filter((x) => x > x0 && x < x1), x1];
  return xs.map((x) => ({ x, y: wallBaseAt(x, cal) }));
}

/**
 * Phần bề sâu của món hiện ra trên ảnh: máy cầm ngang tầm ngực nhìn chếch xuống sàn, nên bề sâu thật bị nén lại
 * còn khoảng một phần ba so với bề ngang cùng độ sâu. Giả định của bản thử.
 */
const DEPTH_FORESHORTEN = 0.34;
/** Khoảng hít vào tường khi kéo món (pt trên ảnh). */
const WALL_SNAP_PT = 18;

/**
 * Chân món (y) khi lưng món áp sát tường tại x: chân tường + bề sâu món chiếu lên ảnh (chân món là mép trước).
 * Bề sâu chiếu phụ thuộc chính độ sâu đó nên tính lặp hai lần.
 */
function againstWallY(x: number, product: Product, frame: { width: number; height: number }, cal: Calibration): number {
  const base = wallBaseAt(x, cal);
  let y = base;
  for (let i = 0; i < 3; i++) {
    y = base + (product.dimensions.depthCm * DEPTH_FORESHORTEN * ptPerCm(y, frame, cal)) / frame.height;
  }
  return Math.min(y, 0.97);
}

/**
 * Giữ món trên sàn và trong phòng (kiểu IKEA): món không xuyên tường, không ra khỏi khung ảnh; kéo tới gần tường thì món
 * hít vào, lưng áp sát tường (`againstWall`). Món 3D: va với tường thật (mặt phẳng dựng từ chân tường) theo đáy món đã
 * xoay — xoay sát tường thì món tự lùi ra. Món ảnh phẳng: chân món không vượt chân tường trên ảnh.
 */
export function placeOnFloor(
  p: { x: number; y: number },
  product: Product,
  rotationYDeg: number,
  frame: { width: number; height: number },
  cal: Calibration,
  /** false: không hít vào tường (dời từng nấc bằng VoiceOver phải rời tường được). */
  snap = true,
  /** Chân món thấp nhất cho phép trên ảnh (không kéo món xuống dưới khay đáy). */
  maxY = 0.98,
): { x: number; y: number; againstWall: boolean } {
  const x = clamp(p.x, 0.04, 0.96);
  const model = renders3D(product.id) ? productModel(product.id) : undefined;
  if (model) {
    const cam = roomCamera(cal);
    const aspect = frame.width / frame.height;
    const r = clampFootprint(x, Math.min(p.y, maxY), model.bounds, rotationYDeg, cal, cam, aspect, snap);
    return { x: r.x, y: Math.min(r.y, Math.max(maxY, r.y)), againstWall: r.againstWall };
  }
  const wallY = againstWallY(x, product, frame, cal);
  const y = clamp(p.y, wallY, Math.max(maxY, wallY));
  if (y - wallY <= (snap ? WALL_SNAP_PT / frame.height : 0.0005)) return { x, y: wallY, againstWall: true };
  return { x, y, againstWall: false };
}

/** Chỗ món áp sát tường ở cột x của ảnh (lưng chạm chân tường), với góc xoay đang có. */
export function againstWallAt(
  x: number,
  product: Product,
  rotationYDeg: number,
  frame: { width: number; height: number },
  cal: Calibration,
): { x: number; y: number } {
  const r = placeOnFloor({ x, y: wallBaseAt(clamp(x, 0, 1), cal) }, product, rotationYDeg, frame, cal, true);
  return { x: r.x, y: r.y };
}

/** Món đang áp sát tường (trong khoảng hít)? Dùng khi đổi món / nhân bản để món mới cũng sát tường. */
export function isAgainstWall(item: PlacedItem, product: Product, frame: { width: number; height: number }, cal: Calibration): boolean {
  return placeOnFloor(item, product, item.rotationYDeg, frame, cal, true).againstWall;
}

/** Góc về khoảng (-180, 180]. */
export function normalizeAngle(deg: number): number {
  let d = deg % 360;
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
}

/**
 * Cách vẽ góc xoay trục Y cho hình minh họa phẳng: quay quá 90° thì lật mặt (soi gương),
 * và giới hạn độ nghiêng hiển thị để món không biến thành một vạch mỏng.
 */
export function displayRotation(deg: number): { angle: number; mirror: boolean } {
  const d = normalizeAngle(deg);
  const abs = Math.abs(d);
  const mirror = abs > 90;
  const folded = mirror ? 180 - abs : abs;
  return { angle: Math.min(folded, 62) * (d < 0 ? -1 : 1), mirror };
}

/** Trong vùng chữ nhật chuẩn hoá 0..1? */
export function inRegion(p: { x: number; y: number }, r: { x: number; y: number; w: number; h: number }): boolean {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}
