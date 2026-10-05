export type Mask = { width: number; height: number; data: Uint8Array };
export type Rect = { x: number; y: number; w: number; h: number };

export function emptyMask(width: number, height: number): Mask {
  return { width, height, data: new Uint8Array(width * height) };
}

export function unionMasks(masks: readonly Mask[]): Mask {
  const first = masks[0];
  if (!first) throw new Error("unionMasks: danh sách rỗng");
  const out = emptyMask(first.width, first.height);
  for (const m of masks) {
    if (m.width !== first.width || m.height !== first.height) throw new Error("unionMasks: khác kích thước");
    for (let k = 0; k < m.data.length; k++) if (m.data[k]) out.data[k] = 1;
  }
  return out;
}

/** Nới vuông bán kính r: tách hai lượt ngang rồi dọc (max theo cửa sổ). */
export function dilateMask(m: Mask, r: number): Mask {
  if (r <= 0) return { ...m, data: m.data.slice() };
  const { width: w, height: h } = m;
  const tmp = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!m.data[y * w + x]) continue;
      for (let dx = Math.max(0, x - r); dx <= Math.min(w - 1, x + r); dx++) tmp[y * w + dx] = 1;
    }
  }
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!tmp[y * w + x]) continue;
      for (let dy = Math.max(0, y - r); dy <= Math.min(h - 1, y + r); dy++) out[dy * w + x] = 1;
    }
  }
  return { width: w, height: h, data: out };
}

export function extendDown(m: Mask, px: number): Mask {
  const { width: w, height: h } = m;
  const out = m.data.slice();
  for (let x = 0; x < w; x++) {
    let remaining = 0;
    for (let y = 0; y < h; y++) {
      if (m.data[y * w + x]) remaining = px;
      else if (remaining > 0) { out[y * w + x] = 1; remaining--; }
    }
  }
  return { width: w, height: h, data: out };
}

export function maskArea(m: Mask): number {
  let n = 0;
  for (let k = 0; k < m.data.length; k++) if (m.data[k]) n++;
  return n;
}

export function maskBBox(m: Mask): Rect | null {
  let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
  for (let y = 0; y < m.height; y++) {
    for (let x = 0; x < m.width; x++) {
      if (!m.data[y * m.width + x]) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  return x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

/**
 * Mask gửi đi lấp (quy tắc của spike): nới 1,2% cạnh dài; món có đáy ở nửa dưới ảnh kéo thêm
 * 2,5% chiều cao xuống để ăn bóng tiếp xúc; gộp với vùng đã xóa trước (luôn lấp lại từ ảnh gốc).
 */
export function prepareEraseMask(objects: readonly Mask[], previous: Mask | null): Mask {
  const parts: Mask[] = previous ? [previous] : [];
  for (const obj of objects) {
    const box = maskBBox(obj);
    if (!box) continue;
    const r = Math.round(0.012 * Math.max(obj.width, obj.height));
    const shadow = box.y + box.h > obj.height / 2 ? Math.round(0.025 * obj.height) : 0;
    parts.push(dilateMask(shadow > 0 ? extendDown(obj, shadow) : obj, r));
  }
  const first = objects[0] ?? previous;
  if (parts.length === 0) {
    if (!first) throw new Error("prepareEraseMask: không có mask");
    return emptyMask(first.width, first.height);
  }
  return unionMasks(parts);
}

export function cropSquare(bbox: Rect, width: number, height: number): Rect {
  const side = Math.min(Math.max(2 * Math.max(bbox.w, bbox.h), 512), Math.min(width, height));
  if (bbox.w > side || bbox.h > side) return { x: 0, y: 0, w: width, h: height };
  const cx = bbox.x + bbox.w / 2;
  const cy = bbox.y + bbox.h / 2;
  const x = Math.round(Math.min(Math.max(cx - side / 2, 0), width - side));
  const y = Math.round(Math.min(Math.max(cy - side / 2, 0), height - side));
  return { x, y, w: side, h: side };
}
