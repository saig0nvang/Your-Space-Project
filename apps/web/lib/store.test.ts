import { beforeEach, expect, test } from "vitest";
import { setItemConstraint, useEditor } from "./store";

const photo = { url: "blob:a", width: 400, height: 300, focal35: null };
const s = useEditor.getState;

beforeEach(() => {
  s().setPhoto(photo);
  s().startEditing({ horizonNdcY: 0.1, heightM: 1.5, fovYRad: 1 });
  s().placeItem("p1", 0, -2);
});

test("resumeEditing: đổi chân trời/tư thế nhưng GIỮ lịch sử và đồ đã bày", () => {
  const before = s().history;
  s().resumeEditing({ horizonNdcY: -0.2, heightM: 1.1 });
  expect(s().setup).toEqual({ horizonNdcY: -0.2, heightM: 1.1, fovYRad: 1 });
  expect(s().history).toBe(before);
  expect(s().history?.present.items).toHaveLength(1);
});

test("clearPhoto: xoá ảnh cùng setup, lịch sử, depth, lựa chọn", () => {
  s().setDepth({ status: "ready", forUrl: "blob:a", disparity: null });
  s().clearPhoto();
  expect(s()).toMatchObject({ photo: null, setup: null, history: null, selectedUid: null, armedProductId: null });
  expect(s().depth.status).toBe("idle");
});

test("placeItem: uid khác nhau mỗi lần (không cần crypto.randomUUID)", () => {
  s().placeItem("p1", 1, -2);
  const uids = s().history!.present.items.map((i) => i.uid);
  expect(new Set(uids).size).toBe(uids.length);
});

test("scaleItem: món mới cỡ 1; đổi cỡ trong một gesture = một bước hoàn tác; kẹp 0,5–1,5", () => {
  const uid = s().history!.present.items[0]!.uid;
  expect(s().history!.present.items[0]!.scale).toBe(1);
  s().beginGesture();
  s().scaleItem(uid, 1.2);
  s().scaleItem(uid, 9);
  s().endGesture();
  expect(s().history!.present.items[0]!.scale).toBe(1.5);
  s().undo();
  expect(s().history!.present.items[0]!.scale).toBe(1);
});

test("swapItem: đổi món tại chỗ (giữ vị trí, góc; cỡ về 1), một bước hoàn tác; ràng buộc vị trí áp lại", () => {
  const uid = s().history!.present.items[0]!.uid;
  s().rotateItem(uid, 0.5);
  s().scaleItem(uid, 1.3);
  setItemConstraint((i) => (i.productId === "p2" ? { x: i.x, z: -1 } : i)); // món mới to hơn → bị kéo lại
  s().swapItem(uid, "p2");
  expect(s().history!.present.items[0]).toMatchObject({ uid, productId: "p2", x: 0, z: -1, rotationYRad: 0.5, scale: 1 });
  s().undo();
  expect(s().history!.present.items[0]!.productId).toBe("p1");
  setItemConstraint((i) => i);
});
