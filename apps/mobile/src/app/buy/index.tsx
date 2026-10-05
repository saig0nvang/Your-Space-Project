/**
 * M1 — Sheet mua (E7-US1). Chọn mua lẻ hoặc cả bộ, nhóm theo nhà cung cấp, thấy tổng trước khi thanh toán.
 */
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { DeviceMobile, WifiSlash } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AppText, Button, OfflineBanner, TrustNote } from '@/components/ui';
import { BuySheet, BuyUnavailable, ReasonLine } from '@/features/buy/BuySheet';
import { describeSelection, useBuyCart, type CartEntry } from '@/features/buy/cart';
import { SupplierGroup, TotalRow } from '@/features/buy/components';
import { patchSessionScoped, readSessionScoped } from '@/features/buy/flowStore';
import { useBuyClose } from '@/features/buy/navigation';
import { SAMPLE_DATA_NOTE } from '@/lib/copy';
import { formatVND } from '@/lib/format';
import { useIsOnline } from '@/services/network';
import { useAppStore } from '@/store/appStore';
import { useTheme } from '@/theme';

/** Bản thử: giả lập lấy giá hiện tại từ máy chủ mỗi lần mở sheet (docs/screens.md · M1 Loading). */
const PRICE_REFRESH_MS = 1200;

export default function BuySheetScreen() {
  const t = useTheme();
  const cart = useBuyCart();
  const verified = useAppStore((s) => s.user.verifiedPhone !== null);
  const online = useIsOnline();
  const close = useBuyClose('none');
  const [pricesFresh, setPricesFresh] = useState(false);

  useEffect(() => {
    if (!online || pricesFresh) return;
    const id = setTimeout(() => setPricesFresh(true), PRICE_REFRESH_MS);
    return () => clearTimeout(id);
  }, [online, pricesFresh]);

  if (cart.status === 'no_session') return <BuyUnavailable title="Mua" />;
  if (cart.status === 'missing_origin') {
    return (
      <BuyUnavailable
        title="Mua"
        heading="Không tìm thấy món để mua"
        body="Không gian này không còn trên máy hoặc chưa có món nào. Đóng sheet rồi mở lại từ một không gian có món."
      />
    );
  }

  const origin = cart.session.origin;
  const selectedCount = cart.selected.length;
  const orderCount = cart.selectedGroups.length;

  const toggle = (entry: CartEntry) => {
    const store = useAppStore.getState();
    const session = store.buySession;
    if (!session || entry.blocked) return;
    const next = !entry.selected;
    const keys = session.selectedKeys.filter((k) => k !== entry.key);
    store.updateBuySession({ selectedKeys: next ? [...keys, entry.key] : keys });
    if (entry.purchased) {
      const rebuy = readSessionScoped(origin).rebuyKeys.filter((k) => k !== entry.key);
      patchSessionScoped(origin, { rebuyKeys: next ? [...rebuy, entry.key] : rebuy });
    }
    void Haptics.selectionAsync();
  };

  const onContinue = () => {
    useAppStore.getState().updateBuySession({ selectedKeys: cart.selected.map((e) => e.key) });
    patchSessionScoped(origin, { includePhoneStep: !verified });
    router.push(verified ? '/buy/checkout' : '/buy/phone');
  };

  const footer = (
    <>
      {selectedCount === 0 ? <ReasonLine text="Chọn ít nhất một món" /> : null}
      {selectedCount > 0 && !online ? <ReasonLine icon={WifiSlash} text="Cần kết nối mạng để tiếp tục mua" /> : null}
      <Button
        label={`Tiếp tục · ${formatVND(cart.total)}`}
        onPress={onContinue}
        disabled={selectedCount === 0 || !online}
        loading={online && !pricesFresh && selectedCount > 0}
        loadingLabel="Đang cập nhật giá"
        fullWidth
      />
    </>
  );

  return (
    <BuySheet title="Mua" onClose={() => void close()} footer={footer}>
      <OfflineBanner />

      {cart.groups.map((g) => (
        <SupplierGroup key={g.supplier.id} group={g} onToggle={toggle} />
      ))}

      <View style={{ gap: t.spacing.sm }}>
        <TotalRow label="Tổng các món đang chọn" amount={cart.total} />
        <AppText variant="footnote" color="mutedForeground">
          {selectedCount > 0
            ? `${describeSelection(selectedCount, orderCount)}, tách thành ${orderCount} đơn sau khi thanh toán.`
            : 'Chưa chọn món nào.'}
        </AppText>
        {online && !pricesFresh ? (
          <View
            style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}
            accessibilityLiveRegion="polite"
          >
            <ActivityIndicator size="small" color={t.colors.mutedForeground} />
            <AppText variant="footnote" color="mutedForeground">
              Đang cập nhật giá hiện tại. Giá đang hiện là giá lần cập nhật trước.
            </AppText>
          </View>
        ) : null}
      </View>

      {!verified ? <ReasonLine icon={DeviceMobile} align="left" text="Lần đầu mua: xác minh SĐT bằng mã OTP" /> : null}

      <TrustNote />

      <AppText variant="caption1" color="mutedForeground">
        {SAMPLE_DATA_NOTE}
      </AppText>
    </BuySheet>
  );
}
