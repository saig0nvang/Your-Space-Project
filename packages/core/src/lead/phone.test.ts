import { expect, test } from "vitest";
import { normalizeVnPhone } from "./phone";

test("chuẩn hoá số di động Việt Nam", () => {
  expect(normalizeVnPhone("0912 345 678")).toBe("0912345678");
  expect(normalizeVnPhone("+84 912.345.678")).toBe("0912345678");
  expect(normalizeVnPhone("84-912-345-678")).toBe("0912345678");
});

test("sai định dạng → null", () => {
  expect(normalizeVnPhone("012345678")).toBeNull();
  expect(normalizeVnPhone("0212345678")).toBeNull();
  expect(normalizeVnPhone("abc")).toBeNull();
});
