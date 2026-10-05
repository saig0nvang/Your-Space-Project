/**
 * C1 — Xin quyền camera (giả lập, không gọi hộp thoại quyền thật của hệ điều hành).
 * Không nhắc tới việc gửi ảnh ở đây: consent nằm ở C3 (docs/screens.md · C1).
 */
import { router } from 'expo-router';
import { Camera, CameraSlash } from 'phosphor-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AppText, Button, Screen, ScreenScroll, showToast } from '@/components/ui';
import type { SamplePhoto } from '@/data/samplePhotos';
import { CaptureHeader } from '@/features/capture/CaptureHeader';
import { SamplePhotoPicker } from '@/features/capture/SamplePhotoPicker';
import { setSessionPhoto } from '@/features/capture/session';
import { useAppStore } from '@/store/appStore';
import { useDevFlags } from '@/store/devFlags';
import { useTheme } from '@/theme';

export default function CameraPermissionScreen() {
  const t = useTheme();
  const introSeen = useAppStore((s) => s.user.cameraIntroSeen);
  const cameraDenied = useDevFlags((s) => s.cameraDenied);
  const [deniedNow, setDeniedNow] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Đã từng cấp rồi bị tắt trong Cài đặt → hệ điều hành không hỏi lại, hiện ngay trạng thái bị từ chối.
  const denied = deniedNow || (introSeen && cameraDenied);

  const requestCamera = () => {
    if (cameraDenied) {
      setDeniedNow(true);
      return;
    }
    useAppStore.getState().updateUser({ cameraIntroSeen: true });
    router.replace('/capture/camera');
  };

  const choosePhoto = (photo: SamplePhoto) => {
    setSessionPhoto(photo, 'library', null);
    setPickerOpen(false);
    router.push('/capture/review');
  };

  const Icon = denied ? CameraSlash : Camera;

  return (
    <Screen edges={['top']}>
      <CaptureHeader />
      <ScreenScroll
        contentStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: t.spacing.lg }}
        footer={
          <>
            {denied ? (
              <Button
                label="Mở Cài đặt"
                onPress={() => showToast('Bản thử: chưa mở được Cài đặt', 'info')}
                accessibilityHint="Mở Cài đặt của máy để bật camera cho YourSpace"
                fullWidth
              />
            ) : (
              <Button label="Cho phép dùng camera" onPress={requestCamera} fullWidth />
            )}
            <Button label="Chọn ảnh có sẵn" variant="secondary" onPress={() => setPickerOpen(true)} fullWidth />
          </>
        }
      >
        <Animated.View key={denied ? 'denied' : 'ask'} entering={FadeIn.duration(t.motion.base)} style={{ alignItems: 'center', gap: t.spacing.md }}>
          <View
            style={{
              width: 112,
              height: 112,
              borderRadius: 56,
              backgroundColor: t.colors.muted,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: t.spacing.sm,
            }}
          >
            <Icon size={52} color={t.colors.primaryText} />
          </View>
          {denied ? (
            <>
              <AppText variant="title1" align="center" accessibilityRole="header">
                Camera đang tắt cho YourSpace
              </AppText>
              <AppText variant="body" color="mutedForeground" align="center" accessibilityLiveRegion="polite">
                Bạn chưa cho phép dùng camera. Để chụp ảnh phòng, mở Cài đặt, chọn YourSpace rồi bật Camera.
              </AppText>
              <AppText variant="callout" color="mutedForeground" align="center">
                Bạn vẫn có thể chọn một ảnh phòng có sẵn.
              </AppText>
            </>
          ) : (
            <>
              <AppText variant="title1" align="center" accessibilityRole="header">
                Chụp căn phòng của bạn
              </AppText>
              <AppText variant="body" color="mutedForeground" align="center">
                YourSpace cần camera để chụp căn phòng bạn muốn bày đồ.
              </AppText>
            </>
          )}
        </Animated.View>
      </ScreenScroll>

      <SamplePhotoPicker
        visible={pickerOpen}
        title="Chọn ảnh có sẵn"
        onSelect={choosePhoto}
        onClose={() => setPickerOpen(false)}
        emptyActionLabel={denied ? undefined : 'Chụp ảnh mới'}
        onEmptyAction={() => {
          setPickerOpen(false);
          requestCamera();
        }}
      />
    </Screen>
  );
}
