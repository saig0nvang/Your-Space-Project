/** DH5 — Theo dõi khiếu nại đến khi xong (E8-US5). */
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ChatText, CheckCircle, Hourglass, ShieldCheck, WifiSlash } from 'phosphor-react-native';
import { useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import {
  AppText,
  Banner,
  Button,
  Card,
  ErrorState,
  OfflineBanner,
  ScreenScroll,
  showToast,
  StatusTag,
  TextField,
} from '@/components/ui';
import { confirmAction } from '@/lib/confirm';
import { formatDateTime } from '@/lib/format';
import { isOfflineForced, useIsOnline } from '@/services/network';
import { devAdvanceComplaint } from '@/services/orders';
import { useAppStore } from '@/store/appStore';
import { useTheme } from '@/theme';
import { COMPLAINT_TYPE_LABEL, type Complaint, type ComplaintStatus } from '@/types';

import { DevBlock } from './DevBlock';
import { retryConnection } from './offline';
import { COMPLAINT_STATUS_LABEL, productName, supplierName, wait } from './orderHelpers';
import { DetailSkeleton } from './OrderSkeletons';
import { PhotoAttachments, PhotoThumb } from './PhotoAttachments';
import { Timeline, type TimelineStep } from './Timeline';
import { useSimulatedLoad } from './useSimulatedLoad';

const FLOW: ComplaintStatus[] = ['submitted', 'supplier_replied', 'processing', 'closed'];

const STEP_TITLE: Record<ComplaintStatus, string> = {
  submitted: 'Đã gửi',
  supplier_replied: 'Nhà cung cấp phản hồi',
  processing: 'Đang xử lý',
  closed: 'Đã kết thúc',
};

function complaintSteps(c: Complaint): TimelineStep[] {
  const idx = FLOW.indexOf(c.status);
  return FLOW.map((status, i) => {
    const entry = [...c.timeline].reverse().find((e) => e.status === status);
    let detail = entry?.note;
    if (!detail && i === idx && status === 'submitted') detail = 'Nhà cung cấp chưa phản hồi.';
    if (!detail && i === idx && status === 'closed') detail = 'Xem kết quả bên dưới.';
    return {
      key: status,
      title: STEP_TITLE[status],
      detail,
      at: entry?.at ?? null,
      state: i < idx ? 'done' : i === idx ? 'current' : 'upcoming',
      icon: status === 'closed' ? CheckCircle : Hourglass,
    };
  });
}

export function ComplaintScreen() {
  const t = useTheme();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const order = useAppStore((s) => s.orders.find((o) => o.id === orderId));
  const updateComplaint = useAppStore((s) => s.updateComplaint);
  const updateOrder = useAppStore((s) => s.updateOrder);
  const setOrderStatus = useAppStore((s) => s.setOrderStatus);
  const online = useIsOnline();
  const loading = useSimulatedLoad();

  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [composeError, setComposeError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendFailed, setSendFailed] = useState(false);
  const [withdrawn, setWithdrawn] = useState(false);
  const inFlight = useRef(false);

  const complaint = order?.complaint;

  if (!order || !complaint) {
    if (withdrawn) return <Stack.Screen options={{ title: 'Khiếu nại' }} />;
    return (
      <>
        <Stack.Screen options={{ title: 'Khiếu nại' }} />
        <ScreenScroll>
          <ErrorState
            title={order ? 'Đơn này không có khiếu nại' : 'Không tìm thấy đơn hàng'}
            body={order ? 'Khiếu nại có thể đã được rút. Bạn xem trạng thái ở chi tiết đơn.' : 'Đơn này không còn trên máy.'}
          />
          <View style={{ alignItems: 'center' }}>
            <Button variant="secondary" label="Quay lại" onPress={() => router.back()} />
          </View>
        </ScreenScroll>
      </>
    );
  }

  const closed = complaint.status === 'closed';
  const submittedAt = complaint.timeline.find((e) => e.status === 'submitted')?.at ?? null;

  const send = async () => {
    if (inFlight.current) return;
    const body = text.trim();
    if (!body && photos.length === 0) {
      setComposeError('Nhập nội dung hoặc thêm ảnh trước khi gửi.');
      return;
    }
    inFlight.current = true;
    setComposeError(null);
    setSendFailed(false);
    setSending(true);
    await wait(700);
    if (!online || isOfflineForced()) {
      setSendFailed(true);
      setSending(false);
      inFlight.current = false;
      return;
    }
    const current = useAppStore.getState().orders.find((o) => o.id === order.id)?.complaint;
    if (current) {
      updateComplaint(order.id, { messages: [...current.messages, { at: Date.now(), text: body, photoUris: photos }] });
    }
    setText('');
    setPhotos([]);
    setSending(false);
    inFlight.current = false;
    showToast('Đã gửi thêm thông tin');
  };

  const withdraw = async () => {
    const choice = await confirmAction({
      title: 'Rút khiếu nại?',
      message:
        'Đơn quay về bước đã giao để bạn kiểm tra lại hàng và xác nhận. Khoản thanh toán vẫn được giữ tại đối tác cho tới khi bạn xác nhận đã nhận hàng.',
      options: [
        { label: 'Rút khiếu nại', style: 'destructive' },
        { label: 'Không rút', style: 'cancel' },
      ],
    });
    if (choice !== 0) return;
    setWithdrawn(true);
    updateOrder(order.id, { complaint: null });
    setOrderStatus(order.id, 'delivered');
    showToast('Đã rút khiếu nại. Bạn kiểm tra hàng rồi xác nhận nhé.');
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Khiếu nại' }} />
      <ScreenScroll automaticallyAdjustKeyboardInsets>
        <OfflineBanner body="Đang hiện trạng thái lần cập nhật gần nhất." onRetry={retryConnection} />
        {loading ? (
          <DetailSkeleton />
        ) : (
          <>
            <View style={{ gap: t.spacing.sm }}>
              <AppText variant="title2" accessibilityRole="header">
                Khiếu nại đơn {supplierName(order.supplierId)}
              </AppText>
              <StatusTag tone={closed ? 'done' : 'attention'} label={COMPLAINT_STATUS_LABEL[complaint.status]} />
            </View>

            <Card padding="md">
              <Timeline steps={complaintSteps(complaint)} accessibilityLabel="Dòng thời gian khiếu nại" />
            </Card>

            {closed ? (
              <Card padding="md" style={{ gap: t.spacing.sm }}>
                <AppText variant="headline" accessibilityRole="header">
                  Kết quả và tiền về đâu
                </AppText>
                <AppText variant="body">{complaint.outcome ?? 'Khiếu nại đã kết thúc. Chưa có ghi chú kết quả.'}</AppText>
              </Card>
            ) : (
              <View style={{ flexDirection: 'row', gap: t.spacing.sm + 2, alignItems: 'flex-start' }}>
                <ShieldCheck size={22} color={t.colors.primaryText} />
                <AppText variant="footnote" color="primaryText" style={{ flex: 1 }}>
                  Khoản thanh toán tiếp tục được giữ tại đối tác thanh toán được cấp phép. Nhà cung cấp chưa nhận tiền.
                </AppText>
              </View>
            )}

            <View style={{ gap: t.spacing.sm }}>
              <AppText variant="title3" accessibilityRole="header">
                Nội dung bạn đã gửi
              </AppText>
              <Card padding="md" style={{ gap: t.spacing.sm }}>
                <AppText variant="headline">{COMPLAINT_TYPE_LABEL[complaint.type]}</AppText>
                <AppText variant="footnote" color="mutedForeground">
                  {complaint.productIds.map(productName).join(', ')}
                  {submittedAt ? ` · ${formatDateTime(submittedAt)}` : ''}
                </AppText>
                <AppText variant="body">{complaint.description}</AppText>
                {complaint.photoUris.length > 0 ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }}>
                    {complaint.photoUris.map((ref, i) => (
                      <PhotoThumb key={ref} refId={ref} width={64} label={`Ảnh bằng chứng ${i + 1}`} />
                    ))}
                  </View>
                ) : null}
              </Card>
              {complaint.messages.map((m, i) => (
                <Card key={`${m.at}-${i}`} padding="md" style={{ gap: t.spacing.sm }}>
                  <View style={{ flexDirection: 'row', gap: t.spacing.sm, alignItems: 'center' }}>
                    <ChatText size={18} color={t.colors.primaryText} />
                    <AppText variant="footnote" color="mutedForeground" tabular>
                      Bạn gửi thêm · {formatDateTime(m.at)}
                    </AppText>
                  </View>
                  {m.text ? <AppText variant="body">{m.text}</AppText> : null}
                  {m.photoUris.length > 0 ? (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }}>
                      {m.photoUris.map((ref, j) => (
                        <PhotoThumb key={`${ref}-${j}`} refId={ref} width={64} label={`Ảnh gửi thêm ${j + 1}`} />
                      ))}
                    </View>
                  ) : null}
                </Card>
              ))}
            </View>

            {closed ? null : (
              <View style={{ gap: t.spacing.md }}>
                <AppText variant="title3" accessibilityRole="header">
                  Gửi thêm thông tin
                </AppText>
                <TextField
                  label="Nội dung"
                  helper="Ví dụ: ảnh chụp thêm chỗ hư, hoặc giờ bạn có nhà để nhận hàng thay."
                  value={text}
                  onChangeText={(v) => {
                    setText(v);
                    if (composeError) setComposeError(null);
                  }}
                  multiline
                  maxLength={500}
                  editable={!sending}
                  error={composeError}
                />
                <View style={{ gap: t.spacing.xs }}>
                  <AppText variant="footnote" color="mutedForeground">
                    Ảnh đính kèm được lưu trên máy chủ để làm bằng chứng.
                  </AppText>
                  <PhotoAttachments photos={photos} onChange={setPhotos} disabled={sending} />
                </View>
                {sendFailed ? (
                  <Animated.View entering={FadeIn.duration(t.motion.base)}>
                    <Banner
                      tone="error"
                      title="Chưa gửi được"
                      body="Chưa có kết nối mạng. Nội dung vẫn được giữ, bạn bấm gửi lại khi có mạng."
                    />
                  </Animated.View>
                ) : null}
                <Button
                  label={sendFailed ? 'Gửi lại' : 'Gửi thêm thông tin'}
                  loadingLabel="Đang gửi"
                  loading={sending}
                  fullWidth
                  onPress={send}
                />

                <View style={{ gap: t.spacing.xs, marginTop: t.spacing.lg }}>
                  <AppText variant="footnote" color="mutedForeground">
                    Hàng đã ổn? Rút khiếu nại để quay về bước kiểm tra và xác nhận đã nhận hàng.
                  </AppText>
                  {online ? null : (
                    <View style={{ flexDirection: 'row', gap: t.spacing.sm, alignItems: 'center' }}>
                      <WifiSlash size={16} color={t.colors.mutedForeground} />
                      <AppText variant="footnote" color="mutedForeground" style={{ flex: 1 }}>
                        Cần có mạng để rút khiếu nại.
                      </AppText>
                    </View>
                  )}
                  <View style={{ alignItems: 'flex-start', marginLeft: -t.spacing.sm }}>
                    <Button
                      variant="destructivePlain"
                      label="Rút khiếu nại"
                      disabled={!online || sending}
                      onPress={withdraw}
                    />
                  </View>
                </View>
              </View>
            )}

            <DevBlock>
              <Button
                variant="secondary"
                label="Giả lập: bước tiếp theo"
                disabled={closed}
                onPress={() => devAdvanceComplaint(order.id)}
              />
            </DevBlock>
          </>
        )}
      </ScreenScroll>
    </>
  );
}
