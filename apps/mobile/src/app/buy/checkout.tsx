/**
 * TT3 — Thanh toán (PRD §4.2: "Thanh toán giữ tiền, tách đơn theo nhà cung cấp"). Một bước gộp: người nhận và
 * địa chỉ, lịch giao theo nhà cung cấp (khung giờ lắp khi cần), tổng tiền, rồi trả qua đối tác thanh toán.
 * Cách trả (chuyển khoản, thẻ…) do trang của đối tác xử lý; app chờ đối tác xác nhận rồi sang TT7.
 * Đối tác chưa chốt: không tên, không logo, không phí YourSpace (docs/screens.md §8.2 Q10).
 */
import { router } from 'expo-router';
import { WifiSlash } from 'phosphor-react-native';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, View, type TextInput } from 'react-native';

import { AppText, Banner, Button, OfflineBanner, TextField, TrustNote } from '@/components/ui';
import { findProduct } from '@/data/catalog';
import { Appear, BuySheet, BuyUnavailable, ReasonLine } from '@/features/buy/BuySheet';
import { describeSelection, useBuyCart } from '@/features/buy/cart';
import { TotalRow } from '@/features/buy/components';
import { patchSessionScoped, readSessionScoped } from '@/features/buy/flowStore';
import { useBuyClose, useBuyNavigation, useSubmitLock, type CloseGuard } from '@/features/buy/navigation';
import { PaymentWaiting } from '@/features/buy/PaymentWaiting';
import { cancelPayment, paymentAmount, startPayment, watchPayment } from '@/features/buy/purchase';
import { startOfToday } from '@/features/buy/schedule';
import { useBuyStep } from '@/features/buy/steps';
import { SupplierSchedule } from '@/features/buy/SupplierSchedule';
import { confirmAction } from '@/lib/confirm';
import { digitsOnly, formatPhone, formatVND, isValidVietnamesePhone } from '@/lib/format';
import { useIsOnline } from '@/services/network';
import { checkBeforePay, devConfirmPayment } from '@/services/payment';
import { useAppStore } from '@/store/appStore';
import { useDevFlags } from '@/store/devFlags';
import { useTheme } from '@/theme';
import type { DeliveryInfo } from '@/types';

/** Bản thử: giả lập tải khung giờ trống của nhà cung cấp. */
const SLOT_LOAD_MS = 1200;

type FormErrors = {
  name?: string;
  phone?: string;
  address?: string;
  slots?: Record<string, string>;
};

type Issue =
  | { kind: 'out_of_stock'; productId: string }
  | { kind: 'price_changed'; updates: { productId: string; newPriceVND: number }[] };

const STATUS_ERRORS = {
  failed: {
    title: 'Thanh toán chưa thành công',
    body: 'Đối tác chưa nhận được khoản thanh toán. Chưa có đơn nào được tạo; các món và thông tin giao hàng vẫn giữ nguyên.',
  },
  cancelled: {
    title: 'Đã hủy thanh toán',
    body: 'Chưa có đơn nào được tạo. Các món và thông tin giao hàng vẫn giữ nguyên.',
  },
} as const;

export default function CheckoutScreen() {
  const t = useTheme();
  const cart = useBuyCart();
  const user = useAppStore((s) => s.user);
  const paymentStatus = useAppStore((s) => s.buySession?.paymentStatus ?? 'idle');
  const paymentId = useAppStore((s) => s.buySession?.paymentId ?? null);
  const step = useBuyStep('checkout');
  const showDevControls = useDevFlags((s) => s.showDevControls);
  const online = useIsOnline();
  const navigation = useBuyNavigation();
  const lock = useSubmitLock();
  const [today] = useState(startOfToday);
  const saved = cart.status === 'ok' ? cart.session.delivery : null;
  const [initial] = useState(() => ({
    name: saved?.recipientName ?? user.recipientName,
    phone: digitsOnly(saved?.phone ?? user.verifiedPhone ?? ''),
    address: saved?.address ?? user.address,
  }));
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [address, setAddress] = useState(initial.address);
  const [slots, setSlots] = useState<Record<string, string | null>>(() => saved?.installSlots ?? {});
  const [errors, setErrors] = useState<FormErrors>({});
  const [slotsLoaded, setSlotsLoaded] = useState(false);
  const [busy, setBusy] = useState<null | 'checking' | 'creating'>(null);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [networkFailed, setNetworkFailed] = useState(false);
  const phoneRef = useRef<TextInput>(null);

  const waiting = paymentStatus === 'pending' && paymentId !== null;
  // Đã xác nhận nhưng đang mất mạng: giữ khối chờ, không báo thành công khi chưa kiểm tra lại (G1).
  const showWaiting = waiting || paymentStatus === 'paid';

  useEffect(() => {
    const id = setTimeout(() => setSlotsLoaded(true), SLOT_LOAD_MS);
    return () => clearTimeout(id);
  }, []);

  // Chờ đối tác xác nhận. Việc chờ sống ở cấp module: đóng sheet thì đơn vẫn được tạo khi có xác nhận.
  useEffect(() => {
    if (waiting && paymentId) void watchPayment(paymentId);
  }, [waiting, paymentId]);

  useEffect(() => {
    if (paymentStatus === 'paid' && online) navigation.reset({ index: 0, routes: [{ name: 'done' }] });
  }, [paymentStatus, online, navigation]);

  const dirty =
    saved !== null ||
    name !== initial.name ||
    phone !== initial.phone ||
    address !== initial.address ||
    Object.values(slots).some(Boolean);
  const guard: CloseGuard = waiting ? 'waiting' : cart.status === 'ok' && dirty ? 'entered' : 'none';
  const close = useBuyClose(guard);

  if (cart.status !== 'ok') return <BuyUnavailable title="Thanh toán" />;
  if (cart.selected.length === 0 && !showWaiting) {
    return (
      <BuyUnavailable title="Thanh toán" heading="Chưa chọn món nào" body="Quay lại sheet mua để chọn món cần mua." />
    );
  }

  const origin = cart.session.origin;
  const orderCount = cart.selectedGroups.length;
  const installGroups = cart.selectedGroups.filter((g) => g.needsInstall);
  const locked = showWaiting || busy !== null;
  const statusError = paymentStatus === 'failed' || paymentStatus === 'cancelled' ? STATUS_ERRORS[paymentStatus] : null;

  const selectSlot = (supplierId: string, slot: string) => {
    setSlots((prev) => ({ ...prev, [supplierId]: prev[supplierId] === slot ? null : slot }));
    setErrors((prev) => {
      if (!prev.slots?.[supplierId]) return prev;
      const rest = { ...prev.slots };
      delete rest[supplierId];
      return { ...prev, slots: rest };
    });
  };

  /** Kiểm tra form; hợp lệ thì lưu vào phiên mua và trả về thông tin giao hàng. */
  const validateDelivery = (): DeliveryInfo | null => {
    const next: FormErrors = {};
    if (name.trim().length < 2) next.name = 'Nhập tên người nhận hàng.';
    if (!isValidVietnamesePhone(phone)) next.phone = 'Số điện thoại chưa đúng. Nhập 10 số, bắt đầu bằng 0.';
    if (address.trim().length < 10) {
      next.address = 'Địa chỉ còn thiếu. Ghi số nhà, đường, phường/xã và tỉnh/thành phố.';
    }
    const slotErrors: Record<string, string> = {};
    for (const g of installGroups) {
      if (!slots[g.supplier.id]) slotErrors[g.supplier.id] = 'Chọn một khung giờ lắp đặt.';
    }
    if (Object.keys(slotErrors).length > 0) next.slots = slotErrors;
    if (next.name || next.phone || next.address || next.slots) {
      setErrors(next);
      AccessibilityInfo.announceForAccessibility('Kiểm tra lại các mục được đánh dấu.');
      return null;
    }
    const delivery: DeliveryInfo = {
      recipientName: name.trim(),
      phone,
      address: address.trim(),
      installSlots: Object.fromEntries(installGroups.map((g) => [g.supplier.id, slots[g.supplier.id] ?? null])),
    };
    const store = useAppStore.getState();
    store.updateBuySession({ delivery });
    store.updateUser({ recipientName: delivery.recipientName, address: delivery.address });
    return delivery;
  };

  /** Giỏ đã sạch vấn đề: mở thanh toán tại đối tác và chờ xác nhận ngay trên màn này. */
  const proceed = async () => {
    setBusy('creating');
    const res = await startPayment();
    if (res === 'offline') setNetworkFailed(true);
    else if (res === 'empty') router.dismissTo('/buy');
  };

  /** Chạy một bước có trạng thái đang xử lý; luôn trả nút về bình thường khi xong (G5). */
  const runBusy = (task: () => Promise<void>) =>
    lock(async () => {
      try {
        await task();
      } finally {
        setBusy(null);
      }
    });

  const onPay = () =>
    runBusy(async () => {
      setIssue(null);
      setNetworkFailed(false);
      if (!validateDelivery()) return;
      setBusy('checking');
      const res = await checkBeforePay(cart.lines);
      if (!res.ok) {
        if (res.error.kind === 'offline') {
          setNetworkFailed(true);
          return;
        }
        if (res.error.kind === 'price_changed') {
          // Bản thử: dịch vụ giả lập luôn báo đổi giá ở món đầu; giá người dùng đã đồng ý trong phiên này thì không hỏi lại.
          const accepted = readSessionScoped(origin).priceOverrides;
          const fresh = res.error.updates.filter((u) => accepted[u.productId] === undefined);
          if (fresh.length > 0) {
            setIssue({ kind: 'price_changed', updates: fresh });
            return;
          }
        } else {
          setIssue(res.error);
          return;
        }
      }
      await proceed();
    });

  const removeOutOfStock = (productId: string) =>
    runBusy(async () => {
      const store = useAppStore.getState();
      const s = store.buySession;
      if (!s) return;
      const removeKeys = cart.selected.filter((e) => e.product.id === productId).map((e) => e.key);
      store.updateBuySession({ selectedKeys: s.selectedKeys.filter((k) => !removeKeys.includes(k)) });
      const scoped = readSessionScoped(origin);
      patchSessionScoped(origin, { unavailable: [...scoped.unavailable.filter((id) => id !== productId), productId] });
      setIssue(null);
      await proceed();
    });

  const acceptPrices = (updates: { productId: string; newPriceVND: number }[]) =>
    runBusy(async () => {
      const overrides = { ...readSessionScoped(origin).priceOverrides };
      for (const u of updates) overrides[u.productId] = u.newPriceVND;
      patchSessionScoped(origin, { priceOverrides: overrides });
      setIssue(null);
      await proceed();
    });

  const onCancel = async () => {
    if (!paymentId) return;
    const choice = await confirmAction({
      title: 'Hủy thanh toán?',
      message: 'Chỉ hủy khi bạn chưa trả tiền trên trang của đối tác. Chưa có đơn nào được tạo.',
      options: [
        { label: 'Hủy thanh toán', style: 'destructive' },
        { label: 'Tiếp tục chờ', style: 'cancel' },
      ],
    });
    if (choice === 0) cancelPayment(paymentId);
  };

  const issueBanner = (() => {
    if (!issue) return null;
    if (issue.kind === 'out_of_stock') {
      const productName = findProduct(issue.productId)?.name ?? 'Một món';
      const remaining = cart.selected.filter((e) => e.product.id !== issue.productId).length;
      return (
        <Banner
          tone="error"
          title={`${productName} vừa hết hàng`}
          body={
            remaining > 0
              ? 'Bạn chưa bị trừ tiền. Bỏ món này để thanh toán các món còn lại.'
              : 'Bạn chưa bị trừ tiền. Đây là món duy nhất bạn chọn; quay lại sheet mua để chọn món khác.'
          }
          actionLabel={remaining > 0 ? 'Bỏ món này và tiếp tục' : 'Quay lại chọn món'}
          onAction={() => (remaining > 0 ? void removeOutOfStock(issue.productId) : router.dismissTo('/buy'))}
        />
      );
    }
    const lines = issue.updates.map((u) => {
      const entry = cart.selected.find((e) => e.product.id === u.productId);
      const productName = entry?.product.name ?? findProduct(u.productId)?.name ?? 'Một món';
      return `${productName}: ${formatVND(entry?.priceVND ?? 0)} → ${formatVND(u.newPriceVND)}`;
    });
    const newTotal = cart.selected.reduce((sum, e) => {
      const u = issue.updates.find((x) => x.productId === e.product.id);
      return sum + (u ? u.newPriceVND : e.priceVND);
    }, 0);
    return (
      <Banner
        tone="info"
        title="Giá vừa thay đổi"
        body={`${lines.join('\n')}\nTổng mới: ${formatVND(newTotal)}. Bạn chưa bị trừ tiền.`}
        actionLabel={`Đồng ý giá mới và thanh toán ${formatVND(newTotal)}`}
        onAction={() => void acceptPrices(issue.updates)}
      />
    );
  })();

  const hasErrors = Boolean(errors.name || errors.phone || errors.address || errors.slots);

  const footer = showWaiting ? (
    <>
      <Button label="Đang chờ đối tác xác nhận" onPress={() => undefined} loading loadingLabel="Đang chờ đối tác xác nhận" fullWidth />
      <Button
        variant="destructivePlain"
        label="Hủy thanh toán"
        onPress={onCancel}
        disabled={!online || paymentStatus === 'paid'}
        accessibilityHint={!online ? 'Cần mạng để kiểm tra trạng thái trước khi hủy' : undefined}
        fullWidth
      />
      {__DEV__ && showDevControls && paymentId ? (
        <Button
          variant="plain"
          label="Giả lập: đối tác xác nhận"
          onPress={() => devConfirmPayment(paymentId)}
          disabled={paymentStatus === 'paid'}
          fullWidth
        />
      ) : null}
    </>
  ) : (
    <>
      {hasErrors ? <ReasonLine color="destructiveText" text="Kiểm tra lại các mục được đánh dấu" /> : null}
      {!online ? <ReasonLine icon={WifiSlash} text="Cần kết nối mạng để thanh toán" /> : null}
      {online && !hasErrors ? <ReasonLine text="Bạn chọn cách trả trên trang của đối tác thanh toán ở bước sau" /> : null}
      <Button
        label={`Thanh toán ${formatVND(cart.total)}`}
        onPress={onPay}
        disabled={!online}
        loading={busy !== null}
        loadingLabel={busy === 'creating' ? 'Đang mở thanh toán với đối tác' : 'Đang kiểm tra giá và tồn kho'}
        fullWidth
      />
    </>
  );

  return (
    <BuySheet
      title="Thanh toán"
      step={step}
      onBack={() => router.back()}
      backDisabled={locked}
      onClose={() => void close()}
      footer={footer}
      scrollTopSignal={showWaiting ? 'waiting' : (issue ?? (networkFailed ? 'network' : statusError))}
    >
      <OfflineBanner body="Bạn vẫn nhập được thông tin giao hàng. Thanh toán cần mạng." />

      {showWaiting ? (
        <Appear>
          <PaymentWaiting amountVND={(paymentId ? paymentAmount(paymentId) : null) ?? cart.total} online={online} />
        </Appear>
      ) : null}

      {statusError && !showWaiting ? (
        <Appear>
          <Banner tone="error" title={statusError.title} body={statusError.body} />
        </Appear>
      ) : null}

      {issueBanner ? <Appear>{issueBanner}</Appear> : null}

      {networkFailed ? (
        <Appear>
          <Banner
            tone="error"
            title="Chưa kết nối được với đối tác thanh toán"
            body="Bạn chưa bị trừ tiền. Kiểm tra mạng rồi bấm Thanh toán lần nữa."
          />
        </Appear>
      ) : null}

      <View style={{ gap: t.spacing.md }}>
        <AppText variant="headline" accessibilityRole="header">
          Người nhận
        </AppText>
        <TextField
          label="Tên người nhận"
          value={name}
          editable={!locked}
          onChangeText={(v) => {
            setName(v);
            if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
          }}
          textContentType="name"
          autoComplete="name"
          autoCapitalize="words"
          returnKeyType="next"
          onSubmitEditing={() => phoneRef.current?.focus()}
          submitBehavior="submit"
          error={errors.name}
        />
        <TextField
          ref={phoneRef}
          label="Số điện thoại nhận hàng"
          value={formatPhone(phone)}
          editable={!locked}
          onChangeText={(v) => {
            setPhone(digitsOnly(v).slice(0, 10));
            if (errors.phone) setErrors((p) => ({ ...p, phone: undefined }));
          }}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          maxLength={12}
          error={errors.phone}
          helper={user.verifiedPhone === phone ? 'Số đã xác minh. Đổi số khác nếu người khác nhận hàng.' : undefined}
        />
        <TextField
          label="Địa chỉ giao hàng"
          value={address}
          editable={!locked}
          onChangeText={(v) => {
            setAddress(v);
            if (errors.address) setErrors((p) => ({ ...p, address: undefined }));
          }}
          multiline
          textContentType="fullStreetAddress"
          autoComplete="street-address"
          error={errors.address}
          helper="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố. Một địa chỉ chung cho mọi nhà cung cấp."
        />
      </View>

      <View style={{ gap: t.spacing.md }}>
        <View style={{ gap: 2 }}>
          <AppText variant="headline" accessibilityRole="header">
            Giao theo nhà cung cấp
          </AppText>
          <AppText variant="footnote" color="mutedForeground">
            Mỗi nhà cung cấp giao một ngày riêng. Ngày giao và khung giờ là dữ liệu mẫu của bản thử.
          </AppText>
        </View>
        {cart.selectedGroups.map((g) => (
          <SupplierSchedule
            key={g.supplier.id}
            group={g}
            today={today}
            slotsLoaded={slotsLoaded}
            selectedSlot={slots[g.supplier.id] ?? null}
            onSelectSlot={(slot) => selectSlot(g.supplier.id, slot)}
            disabled={locked}
            error={errors.slots?.[g.supplier.id]}
          />
        ))}
      </View>

      <View style={{ gap: t.spacing.sm }}>
        <TotalRow amount={cart.total} />
        <AppText variant="footnote" color="mutedForeground">
          {describeSelection(cart.selected.length, orderCount)}. Thanh toán một lần, hệ thống tách thành {orderCount}{' '}
          đơn.
        </AppText>
      </View>

      <TrustNote />
    </BuySheet>
  );
}
