import { separation } from "@yourspace/core";
import { beforeEach, expect, test } from "vitest";
import { modelById } from "./catalog";
import { useEditor, type PlacedItem } from "./store";
import "./walls"; // đăng ký ràng buộc món (va chạm + sàn thấy được)

const s = useEditor.getState;
const fp = (i: PlacedItem) => {
  const m = modelById(i.productId)!;
  return { x: i.x, z: i.z, yaw: i.rotationYRad + m.baseYawRad, w: m.dimsM.widthM * i.scale, d: m.dimsM.depthM * i.scale };
};
const items = () => s().history!.present.items;

beforeEach(() => {
  s().setPhoto({ url: "blob:a", width: 400, height: 300, focal35: null });
  s().startEditing({ horizonNdcY: 0.1, heightM: 1.5, fovYRad: 1 }); // chưa có depth → chỉ va chạm
});

test("đặt chồng lên món đã bày → bị đẩy ra, không còn chồng", () => {
  s().placeItem("ghe-banh-khung-thep", 0, -2);
  s().placeItem("ghe-banh-khung-thep", 0.1, -2);
  expect(separation(fp(items()[1]!), fp(items()[0]!))).toBeNull();
});

test("kéo, xoay, đổi cỡ, nhân bản đều không làm chồng món", () => {
  s().placeItem("tu-go-thap", 0, -3);
  s().placeItem("ban-canh-go", 2, -3);
  const [a, b] = items();
  s().moveItem(b!.uid, 0.3, -3); // kéo bàn đè lên tủ
  expect(separation(fp(items()[1]!), fp(items()[0]!))).toBeNull();
  s().rotateItem(a!.uid, Math.PI / 2); // tủ dài xoay ngang sang bàn
  expect(separation(fp(items()[0]!), fp(items()[1]!))).toBeNull();
  s().scaleItem(b!.uid, 1.5);
  expect(separation(fp(items()[1]!), fp(items()[0]!))).toBeNull();
  s().duplicateItem(b!.uid);
  const all = items();
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) expect(separation(fp(all[i]!), fp(all[j]!))).toBeNull();
});
