/**
 * Chỉ báo bước của luồng mua (docs/screens.md · Progress Indicators).
 * Chưa xác minh SĐT: Xác minh SĐT · Thanh toán (2 bước). Đã xác minh: chỉ còn Thanh toán, không hiện chỉ báo.
 * Số bước chốt lúc rời M1 để không đổi giữa chừng.
 */
import { useAppStore } from '@/store/appStore';

import { useSessionScoped } from './flowStore';

export type BuyStepKind = 'phone' | 'checkout';

const ORDER: BuyStepKind[] = ['phone', 'checkout'];

export function useBuyStep(kind: BuyStepKind): { step: number; total: number } | undefined {
  const origin = useAppStore((s) => s.buySession?.origin);
  const verified = useAppStore((s) => s.user.verifiedPhone !== null);
  const scoped = useSessionScoped(origin);
  const includePhone = kind === 'phone' ? true : (scoped.includePhoneStep ?? !verified);
  const steps = includePhone ? ORDER : ORDER.slice(1);
  if (steps.length < 2) return undefined;
  return { step: steps.indexOf(kind) + 1, total: steps.length };
}
