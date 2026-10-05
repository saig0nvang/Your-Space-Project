/**
 * C2 — Camera (GIẢ LẬP). Không mở camera thật: khung ngắm hiển thị một ảnh phòng mẫu,
 * thước cân bằng chạy theo số giả lập. Chụp → lưu ảnh mẫu vào phiên chụp → C3.
 * Theme theo hệ thống (MASTER.md); chữ trên ảnh nằm trên nền card đặc để đạt ≥ 4.5:1.
 */
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Eye, Swap } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Checkbox, ErrorState, IconButton, ListGroup, ListRow } from '@/components/ui';
import { SAMPLE_PHOTOS, samplePhotoRef, type SamplePhoto } from '@/data/samplePhotos';
import { LevelGuide, LevelPill, LibraryTile, ShutterButton, useMockLevel } from '@/features/capture/CameraParts';
import { CaptureHeader } from '@/features/capture/CaptureHeader';
import { PhotoPill, RoomPhoto } from '@/features/capture/RoomPhoto';
import { SamplePhotoPicker } from '@/features/capture/SamplePhotoPicker';
import { MOCK_PITCH_DEG, setSessionPhoto } from '@/features/capture/session';
import { useDevFlags } from '@/store/devFlags';
import { SchemeOverride, useTheme } from '@/theme';

/** Thời gian giả lập "Đang mở camera". */
const OPENING_MS = 700;

/** Màn camera luôn tối (design-system/yourspace/pages/capture-camera.md): ép theme tối cho cả màn. */
export default function CameraScreen() {
  return (
    <SchemeOverride scheme="dark">
      <StatusBar style="light" />
      <CameraScreenContent />
    </SchemeOverride>
  );
}

function CameraScreenContent() {
  const t = useTheme();
  const showDevControls = useDevFlags((s) => s.showDevControls);
  const c = t.colors;
  const reduceMotion = useReducedMotion();

  const [photoId, setPhotoId] = useState<string | null>(SAMPLE_PHOTOS[0]?.id ?? null);
  const photo = SAMPLE_PHOTOS.find((p) => p.id === photoId) ?? SAMPLE_PHOTOS[0];
  const libraryThumb = SAMPLE_PHOTOS.find((p) => p.id !== photo?.id) ?? photo;

  const [opening, setOpening] = useState(true);
  const [openAttempt, setOpenAttempt] = useState(0);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [samplesOpen, setSamplesOpen] = useState(false);
  // Giả lập lỗi (chỉ bật được trong bản dev, ở sheet "Đổi ảnh mẫu").
  const [noSensor, setNoSensor] = useState(false);
  const [cameraBusy, setCameraBusy] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setOpening(false), OPENING_MS);
    return () => clearTimeout(id);
  }, [openAttempt]);

  const ready = !opening && !cameraBusy && photo !== undefined;
  const level = useMockLevel(ready && !noSensor, reduceMotion);

  const capture = () => {
    if (!photo) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    // Không có cảm biến → không có góc máy → ảnh đi qua C6 (đường chân trời).
    setSessionPhoto(photo, 'camera', noSensor ? null : MOCK_PITCH_DEG);
    router.push('/capture/review');
  };

  const chooseFromLibrary = (picked: SamplePhoto) => {
    setSessionPhoto(picked, 'library', null);
    setLibraryOpen(false);
    router.push('/capture/review');
  };

  const retryCamera = () => {
    // Bản thử: thử lại coi như camera đã được app khác nhả ra.
    setCameraBusy(false);
    setOpening(true);
    setOpenAttempt((n) => n + 1);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView edges={['top']}>
        <CaptureHeader title="Chụp ảnh phòng" />
      </SafeAreaView>

      <View style={{ flex: 1, backgroundColor: c.muted, overflow: 'hidden' }}>
        {opening ? (
          <View
            accessibilityLiveRegion="polite"
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: t.spacing.sm + 4 }}
          >
            <ActivityIndicator color={c.mutedForeground} />
            <AppText variant="callout" color="mutedForeground">
              Đang mở camera
            </AppText>
          </View>
        ) : cameraBusy ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ErrorState
              title="Không mở được camera"
              body="Camera có thể đang được app khác dùng. Bạn thử lại, hoặc chọn ảnh có sẵn ở ô Thư viện."
              onRetry={retryCamera}
            />
          </View>
        ) : photo ? (
          <>
            <RoomPhoto uri={samplePhotoRef(photo.id)} accessibilityLabel={`Khung ngắm, bản thử: ${photo.label}`} />
            {!noSensor ? (
              <View pointerEvents="none" style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
                <LevelGuide tilt={level.tilt} stable={level.stable} reduceMotion={reduceMotion} />
              </View>
            ) : null}
            <View pointerEvents="none" style={{ position: 'absolute', top: t.spacing.md, left: 0, right: 0 }}>
              {!noSensor ? <LevelPill tilt={level.tilt} stable={level.stable} /> : null}
            </View>
            <View pointerEvents="none" style={{ position: 'absolute', bottom: t.spacing.md, left: 0, right: 0 }}>
              <PhotoPill icon={Eye} label="Thấy rõ sàn nhà" />
            </View>
          </>
        ) : null}
      </View>

      <SafeAreaView edges={['bottom']}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: t.spacing.lg,
            paddingTop: t.spacing.md,
            paddingBottom: t.spacing.sm,
          }}
        >
          <View style={{ flex: 1, alignItems: 'flex-start' }}>
            <LibraryTile photo={libraryThumb} onPress={() => setLibraryOpen(true)} />
          </View>
          <ShutterButton onPress={capture} disabled={!ready} />
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <IconButton
              icon={Swap}
              variant="tinted"
              caption="Đổi ảnh mẫu"
              accessibilityLabel="Đổi ảnh mẫu trong khung ngắm, bản thử"
              onPress={() => setSamplesOpen(true)}
            />
          </View>
        </View>
        <AppText
          variant="caption1"
          color="mutedForeground"
          align="center"
          style={{ paddingHorizontal: t.spacing.md, paddingBottom: t.spacing.sm }}
        >
          Bản thử: khung ngắm dùng ảnh phòng mẫu thay cho camera.
        </AppText>
      </SafeAreaView>

      <SamplePhotoPicker
        visible={libraryOpen}
        title="Chọn ảnh có sẵn"
        onSelect={chooseFromLibrary}
        onClose={() => setLibraryOpen(false)}
        emptyActionLabel="Chụp ảnh mới"
        onEmptyAction={() => setLibraryOpen(false)}
      />

      <SamplePhotoPicker
        visible={samplesOpen}
        title="Đổi ảnh mẫu"
        note="Bản thử: chọn căn phòng mẫu hiện trong khung ngắm, rồi bấm nút chụp."
        selectedId={photo?.id ?? null}
        onSelect={(picked) => {
          setPhotoId(picked.id);
          setSamplesOpen(false);
        }}
        onClose={() => setSamplesOpen(false)}
        footer={
          __DEV__ && showDevControls ? (
            <ListGroup title="Giả lập lỗi camera (bản dev)">
              <ListRow
                title="Máy không có cảm biến nghiêng"
                subtitle="Ẩn thước cân bằng; ảnh đi qua bước kéo đường chân trời"
                accessory={
                  <Checkbox
                    checked={noSensor}
                    onChange={setNoSensor}
                    accessibilityLabel="Giả lập máy không có cảm biến nghiêng"
                  />
                }
              />
              <ListRow
                title="Camera đang bị app khác dùng"
                subtitle="Hiện lỗi không mở được camera"
                last
                accessory={
                  <Checkbox
                    checked={cameraBusy}
                    onChange={setCameraBusy}
                    accessibilityLabel="Giả lập camera đang bị app khác dùng"
                  />
                }
              />
            </ListGroup>
          ) : null
        }
      />
    </View>
  );
}
