import { expect, test, vi } from "vitest";
import { newId } from "./id";

test("newId: không trùng kể cả khi Math.random lặp lại", () => {
  const spy = vi.spyOn(Math, "random").mockReturnValue(0.5);
  const ids = new Set(Array.from({ length: 1000 }, newId));
  expect(ids.size).toBe(1000);
  spy.mockRestore();
});
