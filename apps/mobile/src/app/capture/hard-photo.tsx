/**
 * C7 — Ảnh khó phân tích: không chặn người dùng; cho đi tiếp ở chế độ tự đặt đồ hoặc chụp lại.
 * Chỉ hiện một lần mỗi phiên app (E3-US6 CC1): đánh dấu ngay khi vào màn.
 */
import { DeviceMobile, Footprints, Lightbulb, Sun, type Icon as PhosphorIcon } from 'phosphor-react-native';
import { useEffect } from 'react';
import { View } from 'react-native';

import { AppText, Button, Card, Screen, ScreenScroll } from '@/components/ui';
import { CaptureHeader } from '@/features/capture/CaptureHeader';
import { PhotoFrame, RoomPhoto, useInlinePhotoSize } from '@/features/capture/RoomPhoto';
import { goToCamera, useBeginEditing } from '@/features/capture/session';
import { markHardPhotoShown, useCaptureSession } from '@/store/captureSession';
import { useTheme } from '@/theme';

const TIPS: { icon: PhosphorIcon; text: string }[] = [
  { icon: DeviceMobile, text: 'Cầm máy thẳng, ngang tầm ngực' },
  { icon: Sun, text: 'Chụp nơi đủ sáng, bật thêm đèn nếu cần' },
  { icon: Footprints, text: 'Lùi lại một chút để thấy rõ sàn nhà' },
];

export default function HardPhotoScreen() {
  const t = useTheme();
  const photoUri = useCaptureSession((s) => s.photoUri);
  const photoAspect = useCaptureSession((s) => s.photoAspect);
  const size = useInlinePhotoSize(photoAspect, 0.3);
  const beginEditing = useBeginEditing();

  useEffect(() => {
    markHardPhotoShown();
  }, []);

  const continueManual = () => {
    useCaptureSession.getState().set({ manualMode: true });
    beginEditing();
  };

  return (
    <Screen edges={['top']}>
      <CaptureHeader />
      <ScreenScroll
        footer={
          <>
            <Button label="Tiếp tục với ảnh này" onPress={continueManual} fullWidth />
            <Button label="Chụp lại" variant="secondary" onPress={goToCamera} fullWidth />
          </>
        }
      >
        <PhotoFrame size={size}>
          <RoomPhoto uri={photoUri} />
        </PhotoFrame>

        <View style={{ gap: t.spacing.sm }}>
          <AppText variant="title2" accessibilityRole="header">
            Ảnh này hơi khó phân tích
          </AppText>
          <AppText variant="body">App chưa nhận ra rõ mặt sàn trong ảnh này.</AppText>
          <AppText variant="subheadline" color="mutedForeground">
            Bạn vẫn tự đặt đồ được với ảnh này, chỉ là app không tự căn tỷ lệ. Hoặc chụp lại theo mẹo bên dưới.
          </AppText>
        </View>

        <Card padding="md" style={{ gap: t.spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
            <Lightbulb size={20} color={t.colors.primaryText} />
            <AppText variant="headline" accessibilityRole="header">
              Mẹo chụp lại
            </AppText>
          </View>
          {TIPS.map(({ icon: Icon, text }) => (
            <View key={text} style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm + 4 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: t.colors.muted,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={20} color={t.colors.primaryText} />
              </View>
              <AppText variant="callout" style={{ flex: 1 }}>
                {text}
              </AppText>
            </View>
          ))}
        </Card>
      </ScreenScroll>
    </Screen>
  );
}
