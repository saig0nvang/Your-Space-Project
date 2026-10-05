/**
 * C5 — Xác nhận mặt sàn: người dùng xác nhận vùng sàn app nhận ra và chiều cao máy app đang giả định,
 * để tỷ lệ đồ đặt vào đúng (tỷ lệ lấy từ mặt sàn + chiều cao máy, không lấy từ depth).
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText, Button, Card, Screen, ScreenScroll } from '@/components/ui';
import { CaptureHeader } from '@/features/capture/CaptureHeader';
import { CameraHeightControl, FloorOverlay } from '@/features/capture/FloorParts';
import { PhotoFrame, RoomPhoto, useInlinePhotoSize } from '@/features/capture/RoomPhoto';
import {
  DEFAULT_FLOOR_LINE_Y,
  goToHardPhotoOrManual,
  useBeginEditing,
} from '@/features/capture/session';
import { useCaptureSession, wasHardPhotoShown } from '@/store/captureSession';
import { useTheme } from '@/theme';

export default function FloorScreen() {
  const t = useTheme();
  const photoUri = useCaptureSession((s) => s.photoUri);
  const photoAspect = useCaptureSession((s) => s.photoAspect);
  const scan = useCaptureSession((s) => s.scan);
  const sessionHeightM = useCaptureSession((s) => s.cameraHeightM);
  const size = useInlinePhotoSize(photoAspect, 0.42);
  const beginEditing = useBeginEditing();

  const [cm, setCm] = useState(() => Math.round(sessionHeightM * 100));

  const confirm = () => {
    useCaptureSession.getState().set({ floorConfirmed: true, cameraHeightM: cm / 100 });
    beginEditing();
  };

  const notFloor = () => {
    // Không có sàn → như ảnh khó phân tích (docs/screens.md · C5 Error).
    goToHardPhotoOrManual(wasHardPhotoShown(), beginEditing, 'push');
  };

  return (
    <Screen edges={['top']}>
      <CaptureHeader onBack={() => router.back()} />
      <ScreenScroll
        footer={
          <>
            {/* Một nút chính; "Bỏ qua" đã bỏ vì cho cùng kết quả với "Đúng rồi" (critique 2026-10-03). */}
            <Button label="Đúng rồi" onPress={confirm} fullWidth />
            <Button
              label="Không phải sàn nhà"
              variant="plain"
              onPress={notFloor}
              accessibilityHint="App chuyển sang để bạn tự đặt đồ"
              fullWidth
            />
          </>
        }
      >
        <View style={{ gap: t.spacing.xs }}>
          <AppText variant="title2" accessibilityRole="header">
            Đây có đúng là sàn nhà không?
          </AppText>
          <AppText variant="subheadline" color="mutedForeground">
            Phần có viền nét đứt là vùng app nhận ra là sàn, viền chạy theo chân tường. Đồ sẽ đứng trên vùng này và áp sát tường được.
          </AppText>
        </View>

        <PhotoFrame size={size}>
          <RoomPhoto uri={photoUri} />
          <FloorOverlay size={size} floorLineY={scan?.floorLineY ?? DEFAULT_FLOOR_LINE_Y} wallBase={scan?.wallBase} />
        </PhotoFrame>

        <Card padding="md">
          <CameraHeightControl cm={cm} onChange={setCm} />
        </Card>
      </ScreenScroll>
    </Screen>
  );
}
