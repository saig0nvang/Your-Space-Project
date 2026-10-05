import { expect, test } from "vitest";
import { createRateLimiter } from "./rateLimit";

test("giới hạn theo key trong cửa sổ trượt", () => {
  let t = 0;
  const rl = createRateLimiter({ limit: 2, windowMs: 1000, now: () => t });
  expect(rl.take("a")).toBe(true);
  expect(rl.take("a")).toBe(true);
  expect(rl.take("a")).toBe(false);
  expect(rl.take("b")).toBe(true);
  t = 1001;
  expect(rl.take("a")).toBe(true);
});
