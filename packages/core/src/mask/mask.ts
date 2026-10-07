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

/** Gán nhãn vùng 4-liên thông của các pixel có `data[k] === value`; trả nhãn (0 = không thuộc) và số pixel mỗi nhãn. */
function labelRegions(data: Uint8Array, w: number, h: number, value: 0 | 1): { labels: Int32Array; sizes: number[] } {
  const labels = new Int32Array(w * h);
  const sizes = [0];
  const stack: number[] = [];
  for (let start = 0; start < w * h; start++) {
    if (data[start] !== value || labels[start]) continue;
    const id = sizes.length;
    sizes.push(0);
    labels[start] = id;
    stack.push(start);
    while (stack.length) {
      const k = stack.pop()!;
      sizes[id]!++;
      const x = k % w;
      for (const n of [x > 0 ? k - 1 : -1, x < w - 1 ? k + 1 : -1, k - w, k + w]) {
        if (n < 0 || n >= w * h || data[n] !== value || labels[n]) continue;
        labels[n] = id;
        stack.push(n);
      }
    }
  }
  return { labels, sizes };
}

/**
 * Làm sạch mask một món (như build.py của bản mock): giữ các mảng chứa điểm chạm (không điểm nào trúng thì giữ
 * mảng lớn nhất), rồi lấp lỗ — vùng nền không thông ra mép ảnh, ví dụ khe giữa các nan sofa/ghế — để LaMa không
 * lấy lại pixel của chính món đó qua khe.
 */
export function cleanObjectMask(m: Mask, seeds: readonly { x: number; y: number }[]): Mask {
  const { width: w, height: h } = m;
  const fg = labelRegions(m.data, w, h, 1);
  const keep = new Set<number>();
  for (const s of seeds) {
    const id = fg.labels[Math.round(s.y) * w + Math.round(s.x)] ?? 0;
    if (id) keep.add(id);
  }
  if (keep.size === 0 && fg.sizes.length > 1) keep.add(fg.sizes.indexOf(Math.max(...fg.sizes.slice(1))));
  const out = new Uint8Array(w * h);
  for (let k = 0; k < w * h; k++) if (keep.has(fg.labels[k] ?? 0)) out[k] = 1;

  const bg = labelRegions(out, w, h, 0);
  const touchesEdge = new Set<number>();
  for (let x = 0; x < w; x++) { touchesEdge.add(bg.labels[x] ?? 0); touchesEdge.add(bg.labels[(h - 1) * w + x] ?? 0); }
  for (let y = 0; y < h; y++) { touchesEdge.add(bg.labels[y * w] ?? 0); touchesEdge.add(bg.labels[y * w + w - 1] ?? 0); }
  for (let k = 0; k < w * h; k++) if (!out[k] && !touchesEdge.has(bg.labels[k] ?? 0)) out[k] = 1;
  return { width: w, height: h, data: out };
}
