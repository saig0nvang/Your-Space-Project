/**
 * T2 — Quyền riêng tư & dữ liệu (E6-US7): nói thật dữ liệu nằm ở đâu và cho xóa.
 * Không câu nào ngụ ý ảnh phòng không rời khỏi máy (D3, PRODUCT.md · Brand Commitments).
 */
import { router, Stack } from 'expo-router';
import { CloudArrowUp, DeviceMobile, House, ImageSquare, Package, Phone } from 'phosphor-react-native';
import { useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AppText, Banner, Button, ListGroup, ListRow, ScreenScroll, showToast } from '@/components/ui';
import { wait } from '@/features/orders/orderHelpers';
import { CONSENT_TEXT } from '@/lib/copy';
import { confirmAction } from '@/lib/confirm';
import { formatPhone } from '@/lib/format';
import { useAppStore } from '@/store/appStore';
import { useTheme } from '@/theme';

import { useReviewFlags } from './reviewFlags';

export function PrivacyScreen() {
  const t = useTheme();
  const spaces = useAppStore((s) => s.spaces);
  const orders = useAppStore((s) => s.orders);
  const verifiedPhone = useAppStore((s) => s.user.verifiedPhone);
  const wipeLocalData = useAppStore((s) => s.wipeLocalData);
  const [wiping, setWiping] = useState(false);
  const [failed, setFailed] = useState(false);
  const inFlight = useRef(false);

  const savedCount = spaces.filter((s) => s.savedAt !== null).length;
  const openComplaints = orders.filter((o) => o.complaint !== null && o.complaint.status !== 'closed').length;

  const wipe = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setFailed(false);
    setWiping(true);
    await wait(800);
    if (useReviewFlags.getState().wipeFails) {
      setFailed(true);
      setWiping(false);
      inFlight.current = false;
      return;
    }
    wipeLocalData();
    setWiping(false);
    inFlight.current = false;
    showToast('Đã xóa dữ liệu trên máy');
  };

  const askWipe = async () => {
    const choice = await confirmAction({
      title: 'Xóa toàn bộ dữ liệu trên máy?',
      message:
        'Không gian và ảnh phòng bị xóa khỏi máy này và không khôi phục được.' +
        (openComplaints > 0 ? ' Đơn có khiếu nại đang mở vẫn được giữ để xử lý khiếu nại.' : ''),
      options: [
        { label: 'Xóa toàn bộ', style: 'destructive' },
        { label: 'Hủy', style: 'cancel' },
      ],
    });
    if (choice === 0) await wipe();
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Quyền riêng tư & dữ liệu' }} />
      <ScreenScroll>
        <AppText variant="callout" color="mutedForeground">
          Dữ liệu nào của bạn đang nằm ở đâu, giữ để làm gì, và cách xóa.
        </AppText>

        <ListGroup title="Trên máy này">
          <ListRow
            icon={DeviceMobile}
            title="Không gian và ảnh phòng"
            subtitle={`${savedCount} không gian đã lưu · ảnh phòng, các món đã đặt, tên và dự toán. Lưu trên máy để bạn mở lại.`}
          />
          <ListRow
            icon={House}
            title="Xóa từng không gian"
            subtitle="Trong Phòng của tôi, giữ một thẻ hoặc bấm nút ba chấm rồi chọn Xóa."
            onPress={() => router.navigate('/rooms')}
            last
          />
        </ListGroup>

        <ListGroup title="Ảnh gửi lên để xử lý">
          <ListRow
            icon={CloudArrowUp}
            title={CONSENT_TEXT}
            subtitle="Ảnh phòng được gửi khi bạn đồng ý ở bước xem lại ảnh, để tìm mặt sàn, xếp món trước sau và xóa đồ cũ."
            last
          />
        </ListGroup>

        <ListGroup title="Trên máy chủ" footer="Bản thử chưa có máy chủ: phần này đang được lưu trên máy để giả lập.">
          <ListRow
            icon={Phone}
            title="Số điện thoại đã xác minh"
            subtitle="Dùng để thanh toán và xem lại đơn hàng trên máy khác."
            value={verifiedPhone ? formatPhone(verifiedPhone) : 'Chưa có'}
          />
          <ListRow
            icon={Package}
            title="Đơn hàng và địa chỉ giao hàng"
            subtitle={`${orders.length} đơn · cần để giao hàng, xử lý thanh toán và khiếu nại.`}
          />
          <ListRow
            icon={ImageSquare}
            title="Ảnh báo sự cố"
            subtitle="Ảnh bạn đính kèm khi báo sự cố được lưu trên máy chủ làm bằng chứng cho khiếu nại."
            last
          />
        </ListGroup>

        <View style={{ gap: t.spacing.xs, paddingHorizontal: t.spacing.md }}>
          <AppText variant="headline" accessibilityRole="header">
            Yêu cầu xóa dữ liệu trên máy chủ
          </AppText>
          <AppText variant="footnote" color="mutedForeground">
            Xóa dữ liệu trên máy không xóa phần nằm trên máy chủ. Bản thử chưa có kênh gửi yêu cầu xóa phần này.
          </AppText>
        </View>

        <View
          style={{
            marginTop: t.spacing.xl,
            gap: t.spacing.sm + 4,
            padding: t.spacing.md,
            borderRadius: t.radius.md,
            borderWidth: 1,
            borderColor: t.colors.border,
          }}
        >
          <AppText variant="headline" accessibilityRole="header">
            Xóa toàn bộ dữ liệu trên máy
          </AppText>
          <AppText variant="footnote" color="mutedForeground">
            Sẽ xóa: mọi không gian và ảnh phòng trên máy, địa chỉ giao hàng đã lưu, lịch sử đơn hàng và yêu cầu tư vấn lưu
            trên máy.
          </AppText>
          <AppText variant="footnote" color="mutedForeground">
            Được giữ: đơn hàng có khiếu nại đang mở{openComplaints > 0 ? ` (${openComplaints} đơn)` : ''}, để khiếu nại được
            xử lý tới khi kết thúc. Số điện thoại đã xác minh cũng được giữ để bạn xem lại các đơn đó.
          </AppText>
          {failed ? (
            <Animated.View entering={FadeIn.duration(t.motion.base)}>
              <Banner
                tone="error"
                title="Chưa xóa được dữ liệu"
                body="Dữ liệu trên máy vẫn còn nguyên. Bạn thử lại nhé."
                actionLabel="Thử lại"
                onAction={wipe}
              />
            </Animated.View>
          ) : null}
          <Button
            variant="destructive"
            label="Xóa toàn bộ dữ liệu trên máy"
            loading={wiping}
            loadingLabel="Đang xóa dữ liệu"
            fullWidth
            onPress={askWipe}
          />
        </View>
      </ScreenScroll>
    </>
  );
}
