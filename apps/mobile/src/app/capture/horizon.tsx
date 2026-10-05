/**
 * C6 — Đường chân trời: ảnh thư viện hoặc máy không có cảm biến → người dùng kéo một đường ngang về tầm mắt
 * để app suy ra độ nghiêng máy. Xong → C5.
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText, Button, Screen } from '@/components/ui';
import { CaptureHeader } from '@/features/capture/CaptureHeader';
import { HorizonLine } from '@/features/capture/HorizonLine';
import { PhotoStage, RoomPhoto } from '@/features/capture/RoomPhoto';
import { useCaptureSession } from '@/store/captureSession';
import { useTheme } from '@/theme';

/** Vị trí khởi đầu: gần giữa ảnh, hơi lệch lên (ảnh phòng thường chụp hơi chúc xuống). */
const DEFAULT_HORIZON_Y = 0.45;

export default function HorizonScreen() {
  const t = useTheme();
  const photoUri = useCaptureSession((s) => s.photoUri);
  const photoAspect = useCaptureSession((s) => s.photoAspect);
  const savedY = useCaptureSession((s) => s.horizonY);
  const [horizonY, setHorizonY] = useState(savedY ?? DEFAULT_HORIZON_Y);

  const done = () => {
    useCaptureSession.getState().set({ horizonY });
    router.push('/capture/floor');
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <CaptureHeader />
      <View style={{ paddingHorizontal: t.spacing.md, paddingBottom: t.spacing.md, gap: t.spacing.xs }}>
        <AppText variant="title2" accessibilityRole="header">
          Kéo đường này về ngang tầm mắt của bạn lúc chụp
        </AppText>
        <AppText variant="subheadline" color="mutedForeground">
          Chạm vào ảnh để đặt nhanh. App dùng đường này để tính góc máy, giúp đồ đứng đúng tỷ lệ.
        </AppText>
      </View>

      <PhotoStage aspect={photoAspect} style={{ paddingHorizontal: t.spacing.md }}>
        {(size) => (
          <>
            <RoomPhoto uri={photoUri} />
            <HorizonLine size={size} initialY={horizonY} onCommit={setHorizonY} />
          </>
        )}
      </PhotoStage>

      <View style={{ paddingHorizontal: t.spacing.md, paddingTop: t.spacing.md, paddingBottom: t.spacing.sm + 4, gap: t.spacing.sm }}>
        <Button label="Xong" onPress={done} fullWidth />
        <Button label="Quay lại" variant="secondary" onPress={() => router.back()} fullWidth />
      </View>
    </Screen>
  );
}
