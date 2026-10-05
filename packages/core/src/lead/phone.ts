/** Số di động Việt Nam về dạng 0xxxxxxxxx; null nếu không hợp lệ. */
export function normalizeVnPhone(input: string): string | null {
  let s = input.replace(/[\s.\-()]/g, "");
  if (s.startsWith("+84")) s = "0" + s.slice(3);
  else if (s.startsWith("84") && s.length === 11) s = "0" + s.slice(2);
  return /^0(3|5|7|8|9)\d{8}$/.test(s) ? s : null;
}
