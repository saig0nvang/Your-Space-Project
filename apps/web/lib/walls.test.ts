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

test("đặt lên mặt bàn: cây vào giữa bàn trà → lên mặt (y = cao bàn); bàn dời/xoay → cây theo; bỏ bàn → cây rơi xuống sàn", () => {
  s().placeItem("ban-tra-tron-thep", 0, -3); // bàn trà tròn 1,3 × 1,3 m, mặt cao 0,49 m
  s().placeItem("cay-xanh-chau-cao", 0.2, -3); // cây lá môn 0,70 × 0,66, cao 0,84 m
  const [table, plant] = items();
  expect(plant!.onUid).toBe(table!.uid);
  expect(plant!.y).toBeCloseTo(0.491, 2);
  expect(plant!.x).toBeCloseTo(0.2); // không bị va chạm đẩy ra khỏi chính cái bàn
  s().moveItem(table!.uid, 1, -3); // dời bàn +1 m theo x
  expect(items()[1]!.x).toBeCloseTo(1.2);
  expect(items()[1]!.onUid).toBe(table!.uid);
  s().rotateItem(table!.uid, Math.PI / 2); // xoay bàn 90°: cây (lệch +0,2 theo x) quay quanh tâm bàn
  expect(items()[1]!.x).toBeCloseTo(1);
  expect(items()[1]!.z).toBeCloseTo(-3.2);
  s().removeItem(table!.uid);
  expect(items()[0]).toMatchObject({ y: 0, onUid: undefined });
});

test("ngoài mặt bàn hoặc món không đặt-lên-được → ở sàn, không chồng", () => {
  s().placeItem("ban-tra-tron-thep", 0, -3);
  s().placeItem("cay-xanh-chau-cao", 2, -3); // xa bàn
  expect(items()[1]).toMatchObject({ y: 0, onUid: undefined });
  s().placeItem("ghe-banh-khung-thep", 0, -3); // ghế không đặt lên bàn → bị đẩy ra
  expect(items()[2]!.y ?? 0).toBe(0);
  expect(separation(fp(items()[2]!), fp(items()[0]!))).toBeNull();
});

test("đồ trang trí nhỏ lên mặt tủ thấp (mặt sâu 52 cm): bình gốm, sen đá", () => {
  s().placeItem("tu-go-thap", 0, -3); // mặt cao 0,68 m
  s().placeItem("binh-gom-men", 0.6, -3);
  s().placeItem("sen-da-chau-nho", -0.6, -3);
  const [cab, vase, succ] = items();
  expect(vase).toMatchObject({ onUid: cab!.uid });
  expect(succ).toMatchObject({ onUid: cab!.uid });
  expect(vase!.y).toBeCloseTo(0.68, 2);
});
