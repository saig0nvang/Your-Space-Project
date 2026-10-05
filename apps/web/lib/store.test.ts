import { beforeEach, expect, test } from "vitest";
import { useEditor } from "./store";

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
