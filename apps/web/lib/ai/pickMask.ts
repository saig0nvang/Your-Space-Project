/** Mask phủ quá tỷ lệ này của ảnh coi là sàn/tường/trần, không phải một món đồ. */
export const MAX_OBJECT_FRACTION = 0.35;

/**
 * Chọn 1 trong các mask SAM trả về: mask LỚN NHẤT trong số mask không quá MAX_OBJECT_FRACTION ảnh
 * (spike: ưu tiên mask lớn tránh chỉ lấy một tấm đệm); nếu mọi mask đều quá lớn thì lấy mask điểm cao nhất.
 * ponytail: ngưỡng diện tích thô — món rất to sát máy (>35% ảnh) sẽ phải chọn bằng nhiều chạm.
 */
export function pickMask(areas: readonly number[], scores: readonly number[], total: number): number {
  let best = -1;
  areas.forEach((a, i) => {
    if (a <= MAX_OBJECT_FRACTION * total && (best < 0 || a > (areas[best] ?? 0))) best = i;
  });
  if (best >= 0) return best;
  return scores.reduce((bi, s, i) => (s > (scores[bi] ?? -Infinity) ? i : bi), 0);
}
