import { expect, test } from "vitest";
import type { FurnitureModel, Supplier } from "../catalog/types";
import { estimate } from "./estimate";

const dims = { widthM: 1, heightM: 1, depthM: 1 };
const model = (id: string, supplierId: string, priceVND: number): FurnitureModel => ({
  id, name: id, styleId: "japandi", category: "sofa", supplierId, priceVND, dimsM: dims,
  glbUrl: `/models/${id}.glb`, material: "", baseYawRad: 0,
});
const suppliers: Supplier[] = [
  { id: "a", name: "Xưởng A", deliveryMinDays: 1, deliveryMaxDays: 2 },
  { id: "b", name: "Xưởng B", deliveryMinDays: 3, deliveryMaxDays: 4 },
];
const models = [model("sofa", "a", 10_000_000), model("ban", "b", 2_000_000), model("ke", "a", 3_000_000)];

test("không có món → tổng 0, không nhóm", () => {
  expect(estimate([], models, suppliers)).toEqual({ groups: [], totalVND: 0, itemCount: 0 });
});

test("cùng món đặt 2 lần → qty 2, cộng tiền", () => {
  const e = estimate(["sofa", "sofa"], models, suppliers);
  expect(e.groups).toHaveLength(1);
  expect(e.groups[0]?.lines[0]?.qty).toBe(2);
  expect(e.groups[0]?.lines[0]?.lineVND).toBe(20_000_000);
  expect(e.totalVND).toBe(20_000_000);
  expect(e.itemCount).toBe(2);
});

test("nhóm theo nhà cung cấp, theo thứ tự xuất hiện đầu tiên", () => {
  const e = estimate(["ban", "sofa", "ke"], models, suppliers);
  expect(e.groups.map((g) => g.supplier.id)).toEqual(["b", "a"]);
  expect(e.groups[1]?.lines.map((l) => l.model.id)).toEqual(["sofa", "ke"]);
  expect(e.groups[1]?.subtotalVND).toBe(13_000_000);
  expect(e.totalVND).toBe(15_000_000);
});

test("id không có trong catalog bị bỏ qua", () => {
  const e = estimate(["khong-co", "ban"], models, suppliers);
  expect(e.itemCount).toBe(1);
  expect(e.totalVND).toBe(2_000_000);
});
