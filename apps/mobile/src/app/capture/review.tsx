/**
 * C3 — Xem lại & consent. Lần gửi đầu hiện đúng câu CONSENT_TEXT (PRODUCT.md · Brand Commitments).
 * Chưa bấm nút chính thì không có dữ liệu ảnh nào được gửi đi (bản thử không gửi gì thật).
 */
import { router } from 'expo-router';
import { Camera, CloudArrowUp } from 'phosphor-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText, Button, EmptyState, OfflineBanner, Screen, ScreenScroll } from '@/components/ui';
import { findSamplePhoto, type SamplePhoto } from '@/data/samplePhotos';
import { CaptureHeader } from '@/features/capture/CaptureHeader';
import { PhotoFrame, RoomPhoto, useInlinePhotoSize } from '@/features/capture/RoomPhoto';
import { SamplePhotoPicker } from '@/features/capture/SamplePhotoPicker';
import { goToCamera, setSessionPhoto, useBeginEditing } from '@/features/capture/session';
import { CONSENT_TEXT } from '@/lib/copy';
import { useIsOnline } from '@/services/network';
import { useAppStore } from '@/store/appStore';
import { useCaptureSession } from '@/store/captureSession';
import { useTheme } from '@/theme';

export default function ReviewScreen() {
  const t = useTheme();
  const online = useIsOnline();
  const photoUri = useCaptureSession((s) => s.photoUri);
  const photoAspect = useCaptureSession((s) => s.photoAspect);
  const source = useCaptureSession((s) => s.source);
  const consentAccepted = useAppStore((s) => s.user.photoConsentAccepted);
  const size = useInlinePhotoSize(photoAspect, 0.5);
  const beginEditing = useBeginEditing();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [blockedOffline, setBlockedOffline] = useState(false);

  if (!photoUri) {
    return (
      <Screen edges={['top', 'bottom']}>
        <CaptureHeader />
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState
            icon={Camera}
            title="Chưa có ảnh phòng"
            body="Bạn chụp hoặc chọn một ảnh căn phòng để bắt đầu."
            actionLabel="Chụp ảnh phòng"
            onAction={goToCamera}
          />
        </View>
      </Screen>
    );
  }

  const sample = findSamplePhoto(photoUri);

  const continueWithPhoto = () => {
    if (!online) {
      // G1: giữ ảnh, báo mất mạng, cho thử lại; không bắt chụp lại.
      setBlockedOffline(true);
      return;
    }
    setBlockedOffline(false);
    if (!consentAccepted) useAppStore.getState().updateUser({ photoConsentAccepted: true });
    useCaptureSession.getState().set({ photoSent: true, manualMode: false, scan: null });
    router.push('/capture/scan');
  };

  const placeManually = () => {
    useCaptureSession.getState().set({ photoSent: false, manualMode: true, scan: null });
    beginEditing();
  };

  const retake = () => {
    if (source === 'library') setPickerOpen(true);
    else goToCamera();
  };

  const choosePhoto = (photo: SamplePhoto) => {
    setSessionPhoto(photo, 'library', null);
    setBlockedOffline(false);
    setPickerOpen(false);
  };

  return (
    <Screen edges={['top']}>
      <CaptureHeader />
      <ScreenScroll
        footer={
          <>
            {/* Câu consent nằm ngay trên nút đồng ý để luôn thấy trước khi bấm (E3-US3 AC1), không bị cuộn khuất. */}
            {!consentAccepted ? (
              <View
                accessible
                accessibilityLabel={CONSENT_TEXT}
                style={{
                  flexDirection: 'row',
                  gap: t.spacing.sm + 4,
                  alignItems: 'flex-start',
                  paddingVertical: t.spacing.sm + 2,
                  paddingHorizontal: t.spacing.md,
                  borderRadius: t.radius.md,
                  backgroundColor: t.colors.muted,
                }}
              >
                <CloudArrowUp size={22} color={t.colors.primaryText} />
                <AppText variant="callout" style={{ flex: 1 }}>
                  {CONSENT_TEXT}
                </AppText>
              </View>
            ) : null}
            <Button label={consentAccepted ? 'Dùng ảnh này' : 'Đồng ý và tiếp tục'} onPress={continueWithPhoto} fullWidth />
            <Button
              label={source === 'library' ? 'Chọn ảnh khác' : 'Chụp lại'}
              variant="secondary"
              onPress={retake}
              fullWidth
            />
            <Button
              label="Không gửi ảnh, tự đặt đồ"
              variant="plain"
              onPress={placeManually}
              accessibilityHint="Mở trình chỉnh sửa, bạn tự đặt và chỉnh tỷ lệ đồ"
              fullWidth
            />
          </>
        }
      >
        <View style={{ gap: t.spacing.xs }}>
          <AppText variant="title2" accessibilityRole="header">
            Xem lại ảnh phòng
          </AppText>
          <AppText variant="subheadline" color="mutedForeground">
            Ảnh thấy rõ sàn nhà thì app đo tỷ lệ phòng chính xác hơn.
          </AppText>
        </View>

        <View style={{ gap: t.spacing.sm }}>
          <PhotoFrame size={size}>
            <RoomPhoto uri={photoUri} />
          </PhotoFrame>
          {sample ? (
            <AppText variant="footnote" color="mutedForeground" align="center">
              Ảnh mẫu trong bản thử · {sample.label}
            </AppText>
          ) : null}
        </View>

        {blockedOffline ? (
          <OfflineBanner
            body="Ảnh chưa được gửi và vẫn giữ ở đây. Có mạng lại thì bấm Thử lại, không cần chụp lại."
            onRetry={continueWithPhoto}
          />
        ) : null}

      </ScreenScroll>

      <SamplePhotoPicker
        visible={pickerOpen}
        title="Chọn ảnh khác"
        onSelect={choosePhoto}
        onClose={() => setPickerOpen(false)}
        emptyActionLabel="Chụp ảnh mới"
        onEmptyAction={() => {
          setPickerOpen(false);
          goToCamera();
        }}
      />
    </Screen>
  );
}
