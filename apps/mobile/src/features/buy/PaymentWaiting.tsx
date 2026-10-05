/**
 * Khối "đang chờ đối tác xác nhận" ở bước Thanh toán. Nói rõ phải làm gì nếu đã trả mà chưa thấy xác nhận,
 * để người mua không trả hai lần.
 */
import { WifiSlash } from 'phosphor-react-native';
import { ActivityIndicator, View } from 'react-native';

import { AppText } from '@/components/ui';
import { formatVND } from '@/lib/format';
import { useTheme } from '@/theme';

export function PaymentWaiting({ amountVND, online }: { amountVND: number; online: boolean }) {
  const t = useTheme();
  return (
    <View
      accessibilityLiveRegion="polite"
      style={{ gap: t.spacing.sm + 4, padding: t.spacing.md, borderRadius: t.radius.md, backgroundColor: t.colors.muted }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm + 4 }}>
        {online ? (
          <ActivityIndicator size="small" color={t.colors.foreground} />
        ) : (
          <WifiSlash size={22} color={t.colors.foreground} />
        )}
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="headline">
            {online ? 'Đang chờ đối tác xác nhận thanh toán' : 'Đang chờ có mạng để kiểm tra với đối tác'}
          </AppText>
          <AppText variant="footnote" color="mutedForeground">
            {online
              ? `Hoàn tất khoản ${formatVND(amountVND)} trên trang của đối tác thanh toán. Màn này tự chuyển khi đối tác xác nhận đã nhận tiền.`
              : 'Ứng dụng kiểm tra trạng thái với đối tác khi có mạng trở lại.'}
          </AppText>
        </View>
      </View>
      <AppText variant="footnote">
        Đã trả mà chưa thấy xác nhận thì đừng trả lần nữa. Đơn sẽ hiện trong Đơn hàng khi đối tác xác nhận.
      </AppText>
      <AppText variant="caption1" color="mutedForeground">
        Bản thử: chưa có trang của đối tác, đơn tự được xác nhận sau vài giây.
      </AppText>
    </View>
  );
}
