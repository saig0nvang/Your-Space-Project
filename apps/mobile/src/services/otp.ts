/**
 * Xác minh SĐT GIẢ LẬP. Số lần thử và thời hạn mã chưa chốt (docs/screens.md §8.2 Q13).
 * Bản dev: mã đúng luôn là DEV_OTP_CODE.
 */
import type { Result } from '@yourspace/core';

import { isOfflineForced } from '@/services/network';

export const DEV_OTP_CODE = '123456';
export const OTP_LENGTH = 6;
/** Thời gian chờ trước khi được gửi lại mã (giá trị tạm cho bản thử). */
export const OTP_RESEND_SECONDS = 30;

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function sendOtp(phone: string): Promise<Result<true, { kind: 'offline' }>> {
  await wait(800);
  void phone;
  if (isOfflineForced()) return { ok: false, error: { kind: 'offline' } };
  return { ok: true, value: true };
}

export async function verifyOtp(
  phone: string,
  code: string,
): Promise<Result<true, { kind: 'invalid' | 'expired' | 'offline' }>> {
  await wait(700);
  void phone;
  if (isOfflineForced()) return { ok: false, error: { kind: 'offline' } };
  if (code !== DEV_OTP_CODE) return { ok: false, error: { kind: 'invalid' } };
  return { ok: true, value: true };
}
