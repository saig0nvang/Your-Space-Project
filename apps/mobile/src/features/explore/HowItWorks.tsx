/**
 * Ba bước dùng YourSpace ở màn mở đầu — để người mới hiểu app làm gì mà không cần màn giới thiệu riêng.
 * Câu về tiền theo PRODUCT.md: tiền giữ tại đối tác, không nói YourSpace giữ tiền.
 */
import { Camera, Cube, ShieldCheck, type Icon as PhosphorIcon } from 'phosphor-react-native';
import { View } from 'react-native';

import { AppText } from '@/components/ui';
import { useTheme } from '@/theme';

const STEPS: { icon: PhosphorIcon; title: string; body: string }[] = [
  { icon: Camera, title: 'Chụp phòng của bạn', body: 'Một ảnh thấy rõ sàn nhà là đủ.' },
  { icon: Cube, title: 'Đặt đồ đúng tỷ lệ', body: 'Kéo, xoay, đổi món ngay trên ảnh.' },
  { icon: ShieldCheck, title: 'Mua khi đã ưng', body: 'Tiền giữ tại đối tác thanh toán đến khi bạn nhận hàng.' },
];

export function HowItWorks() {
  const t = useTheme();
  return (
    <View accessibilityRole="list" style={{ gap: t.spacing.md }}>
      {STEPS.map((s) => (
        <View key={s.title} accessible accessibilityLabel={`${s.title}. ${s.body}`} style={{ flexDirection: 'row', gap: t.spacing.md, alignItems: 'flex-start' }}>
          <View
            style={{
              width: t.touchTarget,
              height: t.touchTarget,
              borderRadius: t.radius.md,
              backgroundColor: t.colors.muted,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <s.icon size={24} color={t.colors.primaryText} />
          </View>
          <View style={{ flex: 1, gap: 2, paddingTop: 2 }}>
            <AppText variant="headline">{s.title}</AppText>
            <AppText variant="subheadline" color="mutedForeground">
              {s.body}
            </AppText>
          </View>
        </View>
      ))}
    </View>
  );
}
