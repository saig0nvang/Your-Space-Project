import type { FurnitureModel, Supplier } from "../catalog/types";

export type EstimateLine = { model: FurnitureModel; qty: number; lineVND: number };
export type EstimateGroup = { supplier: Supplier; lines: EstimateLine[]; subtotalVND: number };
export type Estimate = { groups: EstimateGroup[]; totalVND: number; itemCount: number };

/**
 * Dự toán: gộp số lượng theo món, nhóm theo nhà cung cấp (giữ thứ tự xuất hiện đầu tiên).
 * Món không có trong catalog hoặc nhà cung cấp không tồn tại bị bỏ qua.
 */
export function estimate(
  productIds: readonly string[],
  models: readonly FurnitureModel[],
  suppliers: readonly Supplier[],
): Estimate {
  const byId = new Map(models.map((m) => [m.id, m]));
  const supplierById = new Map(suppliers.map((s) => [s.id, s]));
  const groups = new Map<string, EstimateGroup>();

  for (const id of productIds) {
    const model = byId.get(id);
    const supplier = model ? supplierById.get(model.supplierId) : undefined;
    if (!model || !supplier) continue;
    let group = groups.get(supplier.id);
    if (!group) {
      group = { supplier, lines: [], subtotalVND: 0 };
      groups.set(supplier.id, group);
    }
    let line = group.lines.find((l) => l.model.id === id);
    if (!line) {
      line = { model, qty: 0, lineVND: 0 };
      group.lines.push(line);
    }
    line.qty += 1;
    line.lineVND += model.priceVND;
    group.subtotalVND += model.priceVND;
  }

  const list = [...groups.values()];
  return {
    groups: list,
    totalVND: list.reduce((s, g) => s + g.subtotalVND, 0),
    itemCount: list.reduce((s, g) => s + g.lines.reduce((n, l) => n + l.qty, 0), 0),
  };
}
