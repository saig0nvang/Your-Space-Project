import { expect, test } from "vitest";
import { begin, canRedo, canUndo, commit, createHistory, end, redo, replace, undo } from "./history";

test("commit / undo / redo", () => {
  let h = createHistory(0);
  h = commit(h, 1);
  h = commit(h, 2);
  expect(h.present).toBe(2);
  h = undo(h);
  expect(h.present).toBe(1);
  expect(canRedo(h)).toBe(true);
  h = redo(h);
  expect(h.present).toBe(2);
  h = commit(undo(h), 9);
  expect(canRedo(h)).toBe(false);
});

test("undo khi rỗng không đổi gì", () => {
  const h = createHistory("a");
  expect(undo(h)).toBe(h);
  expect(canUndo(h)).toBe(false);
});

test("begin / replace nhiều lần / end = một bước", () => {
  let h = createHistory(0);
  h = begin(h);
  h = replace(h, 1);
  h = replace(h, 2);
  h = end(h);
  expect(h.past).toEqual([0]);
  expect(undo(h).present).toBe(0);
});

test("end khi không đổi gì thì không tạo bước", () => {
  const h = end(begin(createHistory(5)));
  expect(h.past).toEqual([]);
  expect(h.checkpoint).toBeNull();
});

test("giữ tối đa 50 bước", () => {
  let h = createHistory(0);
  for (let i = 1; i <= 60; i++) h = commit(h, i);
  expect(h.past).toHaveLength(50);
  expect(h.past[0]).toBe(10);
});
