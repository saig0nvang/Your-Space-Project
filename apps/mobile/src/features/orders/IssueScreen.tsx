/** DH4 — Báo sự cố, khoản thanh toán tiếp tục được giữ (E8-US4). */
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ShieldCheck, WarningCircle } from 'phosphor-react-native';
import { useRef, useState } from 'react';
import { AccessibilityInfo, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ProductThumb } from '@/components/ProductArt';
import {
  AppText,
  Banner,
  Button,
  Card,
  Chip,
  ErrorState,
  OfflineBanner,
  ScreenScroll,
  TextField,
} from '@/components/ui';
import { findProduct } from '@/data/catalog';
import { localId } from '@/lib/id';
import { isOfflineForced, useIsOnline } from '@/services/network';
import { useAppStore } from '@/store/appStore';
import { useTheme } from '@/theme';
import { COMPLAINT_TYPE_LABEL, type ComplaintType } from '@/types';

import { CheckRow } from './CheckRow';
import { retryConnection } from './offline';
import { canConfirmOrReport, productName, supplierName, wait } from './orderHelpers';
import { PhotoAttachments } from './PhotoAttachments';

const TYPES = Object.keys(COMPLAINT_TYPE_LABEL) as ComplaintType[];

function FieldError({ message }: { message: string | null }) {
  const t = useTheme();
  if (!message) return null;
  return (
    <View style={{ flexDirection: 'row', gap: t.spacing.xs + 2, alignItems: 'flex-start' }} accessibilityLiveRegion="polite">
      <WarningCircle size={16} color={t.colors.destructiveText} weight="bold" style={{ marginTop: 1 }} />
      <AppText variant="footnote" color="destructiveText" style={{ flex: 1 }}>
        {message}
      </AppText>
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <AppText variant="headline" accessibilityRole="header">
      {children}
    </AppText>
  );
}

export function IssueScreen() {
  const t = useTheme();
  // Từ checklist nhận hàng (DH3) có thể mang sẵn món, loại sự cố và các mục chưa đạt.
  const { orderId, productId: presetProduct, type: presetType, note: presetNote } = useLocalSearchParams<{
    orderId: string;
    productId?: string;
    type?: string;
    note?: string;
  }>();
  const order = useAppStore((s) => s.orders.find((o) => o.id === orderId));
  const fileComplaint = useAppStore((s) => s.fileComplaint);
  const online = useIsOnline();

  const productIds = order ? [...new Set(order.items.map((i) => i.productId))] : [];
  const [selected, setSelected] = useState<string[]>(() =>
    presetProduct && productIds.includes(presetProduct) ? [presetProduct] : productIds.length === 1 ? [productIds[0]] : [],
  );
  const [type, setType] = useState<ComplaintType | null>(() =>
    presetType && (TYPES as string[]).includes(presetType) ? (presetType as ComplaintType) : null,
  );
  const [description, setDescription] = useState(presetNote ?? '');
  const [photos, setPhotos] = useState<string[]>([]);
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const inFlight = useRef(false);

  if (!order || (!canConfirmOrReport(order.status) && !submitted)) {
    return (
      <>
        <Stack.Screen options={{ title: 'Báo sự cố' }} />
        <ScreenScroll>
          <ErrorState
            title={order ? 'Đơn này chưa báo sự cố được' : 'Không tìm thấy đơn hàng'}
            body={
              order
                ? order.status === 'disputed'
                  ? 'Đơn đang có khiếu nại. Bạn gửi thêm thông tin trong khiếu nại.'
                  : 'Bạn báo sự cố được khi đơn đang giao hoặc đã giao và chưa xác nhận nhận hàng.'
                : 'Đơn này không còn trên máy.'
            }
          />
          <View style={{ alignItems: 'center' }}>
            <Button variant="secondary" label="Quay lại" onPress={() => router.back()} />
          </View>
        </ScreenScroll>
      </>
    );
  }

  if (submitted) {
    return (
      <>
        <Stack.Screen options={{ title: 'Báo sự cố' }} />
        <ScreenScroll
          footer={
            <Button
              label="Xem khiếu nại"
              fullWidth
              onPress={() => router.replace({ pathname: '/me/orders/[orderId]/complaint', params: { orderId: order.id } })}
            />
          }
        >
          <Animated.View entering={FadeIn.duration(t.motion.base)} style={{ gap: t.spacing.md, paddingTop: t.spacing.lg }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: t.colors.muted,
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
              }}
            >
              <ShieldCheck size={30} color={t.colors.primaryText} />
            </View>
            <AppText variant="title2" align="center" accessibilityRole="header">
              Đã gửi báo sự cố
            </AppText>
            <Card padding="md" style={{ gap: t.spacing.sm + 4 }}>
              <AppText variant="body">
                Khoản thanh toán tiếp tục được giữ tại đối tác thanh toán được cấp phép. Nhà cung cấp chưa nhận tiền.
              </AppText>
              <AppText variant="body">Trách nhiệm bồi hoàn thuộc nhà cung cấp theo thỏa thuận với YourSpace.</AppText>
            </Card>
            <AppText variant="callout" color="mutedForeground" align="center">
              {'Đơn chuyển sang “Đang khiếu nại”. Bạn theo dõi và gửi thêm thông tin trong khiếu nại.'}
            </AppText>
          </Animated.View>
        </ScreenScroll>
      </>
    );
  }

  const itemsError = selected.length === 0 ? 'Chọn ít nhất một món gặp sự cố.' : null;
  const typeError = type === null ? 'Chọn loại sự cố.' : null;
  const descriptionError = description.trim() === '' ? 'Mô tả ngắn điều bạn gặp, ví dụ món nào hư ở đâu.' : null;
  const invalid = Boolean(itemsError || typeError || descriptionError);

  const toggle = (productId: string, next: boolean) =>
    setSelected((prev) => (next ? [...prev, productId] : prev.filter((id) => id !== productId)));

  const submit = async () => {
    if (inFlight.current) return;
    setAttempted(true);
    if (invalid || type === null) {
      AccessibilityInfo.announceForAccessibility('Còn thiếu thông tin. Xem các dòng báo lỗi.');
      return;
    }
    inFlight.current = true;
    setSubmitting(true);
    setFailed(false);
    await wait(900);
    if (!online || isOfflineForced()) {
      // Giữ nguyên nội dung và ảnh để gửi lại; chưa tạo khiếu nại nên không bị trùng.
      setFailed(true);
      setSubmitting(false);
      inFlight.current = false;
      return;
    }
    const now = Date.now();
    fileComplaint(order.id, {
      id: localId('complaint'),
      productIds: selected,
      type,
      description: description.trim(),
      photoUris: photos,
      status: 'submitted',
      timeline: [{ status: 'submitted', at: now }],
      messages: [],
      outcome: null,
    });
    setSubmitted(true);
    setSubmitting(false);
  };

  const footer = (
    <>
      {failed ? (
        <Animated.View entering={FadeIn.duration(t.motion.base)}>
          <Banner
            tone="error"
            title="Chưa gửi được báo sự cố"
            body="Chưa có kết nối mạng. Nội dung và ảnh vẫn được giữ, bạn bấm gửi lại khi có mạng."
          />
        </Animated.View>
      ) : null}
      <Button
        label={failed ? 'Gửi lại báo sự cố' : 'Gửi báo sự cố'}
        loadingLabel="Đang gửi"
        loading={submitting}
        fullWidth
        onPress={submit}
      />
    </>
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Báo sự cố' }} />
      <ScreenScroll footer={footer} automaticallyAdjustKeyboardInsets>
        <OfflineBanner body="Bạn vẫn soạn được. Báo sự cố được gửi khi có mạng." onRetry={retryConnection} />
        <View style={{ gap: t.spacing.xs }}>
          <AppText variant="title2" accessibilityRole="header">
            Đơn của {supplierName(order.supplierId)}
          </AppText>
          <AppText variant="callout" color="mutedForeground">
            Khi bạn báo sự cố, khoản thanh toán tiếp tục được giữ và nhà cung cấp chưa nhận tiền.
          </AppText>
        </View>

        <View style={{ gap: t.spacing.sm }}>
          <SectionTitle>Món gặp sự cố</SectionTitle>
          <Card padding="md" style={{ paddingVertical: t.spacing.xs }}>
            {productIds.map((pid) => {
              const product = findProduct(pid);
              return (
                <CheckRow
                  key={pid}
                  label={productName(pid)}
                  checked={selected.includes(pid)}
                  disabled={submitting}
                  onChange={(next) => toggle(pid, next)}
                >
                  <ProductThumb category={product?.category ?? 'chair'} productId={product?.id} size={40} />
                </CheckRow>
              );
            })}
          </Card>
          <FieldError message={attempted ? itemsError : null} />
        </View>

        <View style={{ gap: t.spacing.sm }}>
          <SectionTitle>Loại sự cố</SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }} accessibilityRole="radiogroup">
            {TYPES.map((k) => (
              <Chip key={k} label={COMPLAINT_TYPE_LABEL[k]} selected={type === k} disabled={submitting} onPress={() => setType(k)} />
            ))}
          </View>
          <FieldError message={attempted ? typeError : null} />
        </View>

        <TextField
          label="Mô tả ngắn"
          helper="Ví dụ: chân bàn bị nứt khi mở thùng."
          value={description}
          onChangeText={setDescription}
          multiline
          maxLength={500}
          editable={!submitting}
          error={attempted ? descriptionError : null}
        />

        <View style={{ gap: t.spacing.sm }}>
          <SectionTitle>Ảnh đính kèm</SectionTitle>
          <AppText variant="footnote" color="mutedForeground">
            Ảnh đính kèm được lưu trên máy chủ để làm bằng chứng. Ảnh được thu nhỏ trên máy trước khi gửi.
          </AppText>
          <PhotoAttachments photos={photos} onChange={setPhotos} disabled={submitting} />
        </View>
      </ScreenScroll>
    </>
  );
}
