/**
 * C4 — Quét phòng: lấy depth một lần cho ảnh (giả lập qua services/ai.scanRoom), tự chuyển bước khi xong.
 * Hủy → hủy yêu cầu (AbortController) và về C3. Lỗi AI → trình chỉnh sửa chế độ thủ công (G2);
 * mất mạng → ở lại, giữ ảnh, cho thử lại (G1); ảnh khó → C7.
 */
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { AppText, Banner, Button, Screen } from '@/components/ui';
import { CaptureHeader } from '@/features/capture/CaptureHeader';
import { PhotoStage, RoomPhoto } from '@/features/capture/RoomPhoto';
import { ScanLine } from '@/features/capture/ScanLine';
import { goToHardPhotoOrManual, useBeginEditing } from '@/features/capture/session';
import { scanRoom } from '@/services/ai';
import { useCaptureSession, wasHardPhotoShown } from '@/store/captureSession';
import { useTheme } from '@/theme';

type ScanStatus = 'scanning' | 'offline';

export default function ScanScreen() {
  const t = useTheme();
  const reduceMotion = useReducedMotion();
  const photoUri = useCaptureSession((s) => s.photoUri);
  const photoAspect = useCaptureSession((s) => s.photoAspect);
  const beginEditing = useBeginEditing();

  const [status, setStatus] = useState<ScanStatus>('scanning');
  const [attempt, setAttempt] = useState(0);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    scanRoom(controller.signal, photoUri)
      .then((result) => {
        if (controller.signal.aborted) return;
        const session = useCaptureSession.getState();
        if (result.ok) {
          session.set({ scan: result.value, cameraHeightM: result.value.cameraHeightM, manualMode: false });
          // Không có số đo cảm biến (ảnh thư viện, máy không có cảm biến) → C6 trước C5.
          router.replace(session.pitchDeg === null ? '/capture/horizon' : '/capture/floor');
          return;
        }
        switch (result.error.kind) {
          case 'Offline':
            setStatus('offline');
            return;
          case 'LowConfidence':
            goToHardPhotoOrManual(wasHardPhotoShown(), beginEditing);
            return;
          default:
            // Timeout · RateLimited · BudgetExceeded · VendorError → G2: không chặn, vào trình chỉnh sửa thủ công.
            session.set({ manualMode: true, scan: null });
            beginEditing();
        }
      })
      .catch(() => {
        // Bị hủy (Hủy / Đóng / rời màn): không làm gì.
      });
    return () => controller.abort();
  }, [attempt, beginEditing, photoUri]);

  const cancel = () => {
    controllerRef.current?.abort();
    router.dismissTo('/capture/review');
  };

  const retry = () => {
    setStatus('scanning');
    setAttempt((n) => n + 1);
  };

  const scanning = status === 'scanning';

  return (
    <Screen edges={['top', 'bottom']}>
      <CaptureHeader />
      <PhotoStage aspect={photoAspect} style={{ paddingHorizontal: t.spacing.md }}>
        {(size) => (
          <>
            <RoomPhoto uri={photoUri} />
            {scanning && !reduceMotion ? <ScanLine height={size.height} /> : null}
          </>
        )}
      </PhotoStage>

      <View style={{ paddingHorizontal: t.spacing.md, paddingTop: t.spacing.lg, paddingBottom: t.spacing.sm + 4, gap: t.spacing.md }}>
        {scanning ? (
          <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel="Đang tìm mặt sàn và đo tỷ lệ phòng. Thường mất vài giây."
            accessibilityState={{ busy: true }}
            style={{ flexDirection: 'row', alignItems: 'flex-start', gap: t.spacing.sm + 4 }}
          >
            {reduceMotion ? <ActivityIndicator color={t.colors.mutedForeground} style={{ marginTop: 1 }} /> : null}
            <View style={{ flex: 1, gap: t.spacing.xs }}>
              <AppText variant="headline">Đang tìm mặt sàn và đo tỷ lệ phòng</AppText>
              <AppText variant="subheadline" color="mutedForeground">
                Thường mất vài giây
              </AppText>
            </View>
          </View>
        ) : (
          <Banner
            tone="offline"
            title="Mất kết nối mạng"
            body="Ảnh vẫn giữ nguyên ở đây. Có mạng lại thì bấm Thử lại, không cần chụp lại."
            actionLabel="Thử lại"
            onAction={retry}
          />
        )}
        <Button label="Hủy" variant="secondary" onPress={cancel} fullWidth />
      </View>
    </Screen>
  );
}
