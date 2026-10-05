/**
 * Giả lập trạng thái — CHỈ để review trên máy ảo khi chưa có backend. Mỗi dòng nói nó ảnh hưởng màn nào.
 * Route vẫn tồn tại ở bản phát hành nhưng lối vào (tab Tôi) chỉ hiện khi __DEV__.
 */
import { Stack } from 'expo-router';
import { View } from 'react-native';

import { AppText, Button, ErrorState, ListGroup, ScreenScroll, SegmentedControl, showToast } from '@/components/ui';
import { useDevFlags, type AIScenario, type PaymentScenario } from '@/store/devFlags';
import { useTheme } from '@/theme';

import { addSampleOrders, addSampleSpace } from './devSamples';
import { useReviewFlags } from './reviewFlags';
import { SettingRow, SwitchRow } from './SwitchRow';

const AI_OPTIONS: { value: AIScenario; label: string }[] = [
  { value: 'normal', label: 'Bình thường' },
  { value: 'paused', label: 'AI tạm ngưng' },
  { value: 'hard_photo', label: 'Ảnh khó' },
];

const PAYMENT_OPTIONS: { value: PaymentScenario; label: string }[] = [
  { value: 'success', label: 'Thành công' },
  { value: 'fail', label: 'Thất bại' },
  { value: 'out_of_stock', label: 'Hết hàng' },
  { value: 'price_changed', label: 'Đổi giá' },
];

export function DevScreen() {
  const t = useTheme();
  const flags = useDevFlags();
  const review = useReviewFlags();

  if (!__DEV__) {
    return (
      <>
        <Stack.Screen options={{ title: 'Giả lập trạng thái' }} />
        <ScreenScroll>
          <ErrorState title="Không có trong bản phát hành" body="Màn giả lập chỉ dùng khi review bản thử." />
        </ScreenScroll>
      </>
    );
  }

  const resetAll = () => {
    flags.set({
      aiScenario: 'normal',
      cameraDenied: false,
      eraseFails: false,
      forceOffline: false,
      lowEndDevice: false,
      paymentScenario: 'success',
    });
    review.set({ slowLoad: false, escrowUnknown: false, wipeFails: false });
    showToast('Đã đặt lại mọi giả lập');
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Giả lập trạng thái' }} />
      <ScreenScroll>
        <AppText variant="callout" color="mutedForeground">
          Chỉ có trong bản thử, để xem các trạng thái mà không cần backend.
        </AppText>

        <ListGroup title="Hiển thị">
          <SwitchRow
            title="Hiện nút giả lập trên màn"
            description="Nút dev ở màn mở đầu, mã OTP thử, nút giả lập đối tác xác nhận, khối giả lập ở chi tiết đơn, lỗi camera. Tắt để chụp màn hình như app thật."
            value={flags.showDevControls}
            onChange={(v) => flags.set({ showDevControls: v })}
          />
          <SwitchRow
            title="Hiện lưới sàn 3D"
            description="Phủ lưới sàn ô 1 m lên ảnh phòng ở trình chỉnh sửa (bản web), để kiểm máy ảnh ảo có khớp với sàn và tường thật không."
            value={flags.show3dGrid}
            onChange={(v) => flags.set({ show3dGrid: v })}
            last
          />
        </ListGroup>

        <ListGroup title="Chụp ảnh và AI">
          <SettingRow
            stacked
            title="Kết quả AI"
            description="Quét phòng (C4), ảnh khó phân tích (C7) và chế độ tự đặt đồ của trình chỉnh sửa."
          >
            <SegmentedControl
              accessibilityLabel="Kết quả AI"
              options={AI_OPTIONS}
              value={flags.aiScenario}
              onChange={(v) => flags.set({ aiScenario: v })}
            />
          </SettingRow>
          <SwitchRow
            title="Từ chối quyền camera"
            description="Màn xin quyền camera (C1) đi vào nhánh bị từ chối."
            value={flags.cameraDenied}
            onChange={(v) => flags.set({ cameraDenied: v })}
          />
          <SwitchRow
            title="Xóa đồ cũ thất bại"
            description="Công cụ Xóa trong trình chỉnh sửa báo lỗi và giữ nguyên ảnh."
            value={flags.eraseFails}
            onChange={(v) => flags.set({ eraseFails: v })}
          />
          <SwitchRow
            title="Máy yếu (xem 2D)"
            description="Trình chỉnh sửa mở ở chế độ xem 2D; khay, dự toán và Mua vẫn dùng được."
            value={flags.lowEndDevice}
            onChange={(v) => flags.set({ lowEndDevice: v })}
            last
          />
        </ListGroup>

        <ListGroup title="Mạng">
          <SwitchRow
            title="Ép mất mạng"
            description="Băng mất mạng ở mọi màn. Thanh toán, xác nhận nhận hàng, báo sự cố và khiếu nại không gửi được."
            value={flags.forceOffline}
            onChange={(v) => flags.set({ forceOffline: v })}
            last
          />
        </ListGroup>

        <ListGroup title="Thanh toán">
          <SettingRow
            stacked
            title="Kết quả thanh toán"
            description="Bước kiểm tra trước khi trả và kết quả thanh toán ở bước Thanh toán (TT3)."
            last
          >
            <SegmentedControl
              accessibilityLabel="Kết quả thanh toán"
              options={PAYMENT_OPTIONS}
              value={flags.paymentScenario}
              onChange={(v) => flags.set({ paymentScenario: v })}
            />
          </SettingRow>
        </ListGroup>

        <ListGroup title="Đơn hàng và dữ liệu">
          <SwitchRow
            title="Tải chậm (xem khung xương)"
            description="Đơn hàng, chi tiết đơn và khiếu nại hiện khung xương khoảng 1,5 giây khi mở."
            value={review.slowLoad}
            onChange={(v) => review.set({ slowLoad: v })}
          />
          <SwitchRow
            title="Không đọc được trạng thái giữ tiền"
            description={'Chi tiết đơn hiện "Đang kiểm tra trạng thái thanh toán" thay vì đoán.'}
            value={review.escrowUnknown}
            onChange={(v) => review.set({ escrowUnknown: v })}
          />
          <SwitchRow
            title="Xóa dữ liệu thất bại"
            description="Quyền riêng tư & dữ liệu báo lỗi khi xóa toàn bộ dữ liệu trên máy."
            value={review.wipeFails}
            onChange={(v) => review.set({ wipeFails: v })}
            last
          />
        </ListGroup>

        <View style={{ gap: t.spacing.sm }}>
          <AppText variant="footnote" color="mutedForeground" style={{ paddingHorizontal: t.spacing.md }}>
            DỮ LIỆU MẪU
          </AppText>
          <AppText variant="footnote" color="mutedForeground" style={{ paddingHorizontal: t.spacing.md }}>
            Thêm nhanh dữ liệu mẫu để xem Phòng của tôi và Đơn hàng mà không cần đi hết luồng chụp, thanh toán.
          </AppText>
          <Button
            variant="secondary"
            label="Thêm không gian mẫu"
            fullWidth
            onPress={() => {
              addSampleSpace();
              showToast('Đã thêm không gian mẫu vào Phòng của tôi');
            }}
          />
          <Button
            variant="secondary"
            label="Thêm không gian có ảnh hỏng"
            fullWidth
            onPress={() => {
              addSampleSpace({ broken: true });
              showToast('Đã thêm không gian có ảnh hỏng');
            }}
          />
          <Button
            variant="secondary"
            label="Thêm đơn hàng mẫu (2 đơn, 1 đã giao)"
            fullWidth
            onPress={() => {
              addSampleOrders();
              showToast('Đã thêm đơn hàng mẫu');
            }}
          />
        </View>

        <View style={{ alignItems: 'center' }}>
          <Button variant="plain" label="Đặt lại mọi giả lập" onPress={resetAll} />
        </View>
      </ScreenScroll>
    </>
  );
}
