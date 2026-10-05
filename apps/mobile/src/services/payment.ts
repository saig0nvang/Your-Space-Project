/**
 * Đối tác thanh toán GIẢ LẬP. Chưa chốt đối tác (docs/screens.md §8.2 Q10): không hiện tên, không logo.
 * Bản thật: đối tác được cấp phép giữ khoản tiền đến khi người mua xác nhận đã nhận hàng (D2).
 */
import type { Result } from '@yourspace/core';

import { localId } from '@/lib/id';
import { isOfflineForced } from '@/services/network';
import { useDevFlags } from '@/store/devFlags';

type Line = { productId: string; priceVND: number };

export type PrePayIssue =
  | { kind: 'out_of_stock'; productId: string }
  | { kind: 'price_changed'; updates: { productId: string; newPriceVND: number }[] }
  | { kind: 'offline' };

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Kiểm tồn kho và giá ngay trước khi trả tiền (E7-US5 CC3, E2-US4 CC1). */
export async function checkBeforePay(lines: Line[]): Promise<Result<true, PrePayIssue>> {
  await wait(700);
  if (isOfflineForced()) return { ok: false, error: { kind: 'offline' } };
  const scenario = useDevFlags.getState().paymentScenario;
  if (scenario === 'out_of_stock' && lines[0]) {
    return { ok: false, error: { kind: 'out_of_stock', productId: lines[0].productId } };
  }
  if (scenario === 'price_changed' && lines[0]) {
    const l = lines[0];
    return {
      ok: false,
      error: { kind: 'price_changed', updates: [{ productId: l.productId, newPriceVND: Math.round((l.priceVND * 1.05) / 10_000) * 10_000 }] },
    };
  }
  return { ok: true, value: true };
}

export type PartnerPayment = { paymentId: string; amountVND: number };

/**
 * Mở một lần thanh toán tại đối tác. Bản thật: trả về đường dẫn trang thanh toán của đối tác, nơi người mua
 * chọn cách trả (chuyển khoản, thẻ…). Bản thử: không có trang đối tác, chỉ giả lập việc chờ xác nhận.
 */
export async function createPartnerPayment(amountVND: number): Promise<Result<PartnerPayment, { kind: 'offline' | 'failed' }>> {
  await wait(600);
  if (isOfflineForced()) return { ok: false, error: { kind: 'offline' } };
  return { ok: true, value: { paymentId: localId('pay'), amountVND } };
}

const devResolvers = new Map<string, (status: 'paid' | 'failed') => void>();

/**
 * Chờ đối tác xác nhận đã nhận tiền. Bản thử: tự xác nhận sau ~8 giây, hoặc ngay khi bấm
 * nút giả lập ở bước Thanh toán. Kịch bản "fail" trả thất bại sau ~5 giây.
 */
export function waitForPayment(paymentId: string): Promise<'paid' | 'failed'> {
  const scenario = useDevFlags.getState().paymentScenario;
  return new Promise((resolve) => {
    const finish = (status: 'paid' | 'failed') => {
      devResolvers.delete(paymentId);
      clearTimeout(timer);
      resolve(status);
    };
    devResolvers.set(paymentId, finish);
    const timer = setTimeout(() => finish(scenario === 'fail' ? 'failed' : 'paid'), scenario === 'fail' ? 5000 : 8000);
  });
}

/** Chỉ bản dev: giả lập đối tác báo đã nhận tiền. */
export function devConfirmPayment(paymentId: string) {
  devResolvers.get(paymentId)?.('paid');
}

