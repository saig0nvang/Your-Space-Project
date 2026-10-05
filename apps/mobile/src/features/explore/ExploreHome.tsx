/**
 * K1 — Khám phá (màn mở đầu, gốc tab Khám phá). docs/screens.md §5 K1; E1-US1, E1-US2, E1-US5.
 *
 * Hướng A (MASTER.md · Ảnh dẫn dắt màn): mở bằng ảnh một căn phòng mẫu đã đặt đồ, khối nội dung trắng trồi lên
 * đè mép dưới ảnh, câu mở dùng Display (Bricolage Grotesque). Header native ẩn vì câu hỏi dài xuống hai dòng.
 */
import { router, Stack } from 'expo-router';
import { Camera } from 'phosphor-react-native';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, OfflineBanner, SectionHeader, showToast } from '@/components/ui';
import { STYLES } from '@/data/catalog';
import { samplePhotoRef } from '@/data/samplePhotos';
import { startCapture } from '@/flows';
import { localId } from '@/lib/id';
import { useIsOnline } from '@/services/network';
import { selectLatestSavedSpace, useAppStore } from '@/store/appStore';
import { useDevFlags } from '@/store/devFlags';
import { useTheme } from '@/theme';
import type { Space } from '@/types';

import { ContinueSection } from './ContinueCard';
import { HeroRoom } from './HeroRoom';
import { StyleCard } from './StyleCard';
import { retryWhileOffline, useFirstLoad } from './useFirstLoad';
import { HowItWorks } from './HowItWorks';

export function ExploreHome() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const online = useIsOnline();
  const latest = useAppStore(selectLatestSavedSpace);
  const stylesLoading = useFirstLoad('k1:styles');
  const showDevControls = useDevFlags((s) => s.showDevControls);
  const window = useWindowDimensions();
  const heroH = Math.round(window.height * 0.46);

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      <Stack.Screen options={{ headerShown: false, title: 'Khám phá' }} />
      <ScrollView contentInsetAdjustmentBehavior="never" contentContainerStyle={{ paddingBottom: t.spacing['2xl'] }}>
        <HeroRoom height={heroH + insets.top} topInset={insets.top} />
        <View
          style={{
            marginTop: -t.radius.xl,
            borderTopLeftRadius: t.radius.xl,
            borderTopRightRadius: t.radius.xl,
            backgroundColor: t.colors.background,
            paddingHorizontal: 22,
            paddingTop: t.spacing.xl - 4,
            gap: t.spacing.xl,
          }}
        >
        <View style={{ gap: t.spacing.md - 4 }}>
          <AppText variant="display" accessibilityRole="header">
            Phòng bạn hợp với gì?
          </AppText>
          <AppText variant="body" color="mutedForeground">
            Thử đồ thật ngay trong ảnh phòng của bạn, rồi mới mua.
          </AppText>
          <Button
            label="Chụp ảnh phòng"
            icon={Camera}
            fullWidth
            accessibilityHint="Mở camera để chụp căn phòng bạn muốn bày"
            onPress={() => startCapture()}
            style={{ marginTop: t.spacing.sm }}
          />
        </View>

        <OfflineBanner
          body="Bạn vẫn chụp ảnh phòng và xem phong cách được. Ảnh phong cách cần mạng để tải."
          onRetry={() => retryWhileOffline(online)}
        />

        {latest ? <ContinueSection space={latest} /> : <HowItWorks />}

        <View style={{ gap: t.spacing.md }}>
          <SectionHeader display title="Phong cách" detail="Chọn một phong cách để xem đặc trưng và món tiêu biểu." />
          {STYLES.map((s) => (
            <StyleCard
              key={s.id}
              style={s}
              loading={stylesLoading}
              offline={!online}
              onPress={() => router.push({ pathname: '/style/[styleId]', params: { styleId: s.id } })}
            />
          ))}
        </View>

        {__DEV__ && showDevControls ? <DevBrokenSpaceButton /> : null}
        </View>
      </ScrollView>
    </View>
  );
}

/**
 * Chỉ có ở bản dev: tạo một không gian đã lưu có ảnh không còn trên máy,
 * để review trạng thái "Không mở được không gian này" của khối Tiếp tục.
 */
function DevBrokenSpaceButton() {
  const t = useTheme();
  const addSpace = useAppStore((s) => s.addSpace);

  function addBrokenSpace() {
    const now = Date.now();
    const space: Space = {
      id: localId('space'),
      name: 'Phòng ngủ (giả lập ảnh đã xóa)',
      photoUri: samplePhotoRef('anh-da-bi-xoa'),
      photoAspect: 3 / 4,
      source: 'library',
      styleId: 'japandi',
      items: [],
      erasedRegions: [],
      calibration: { cameraHeightM: 1.4, floorConfirmed: true, horizonY: null, floorLineY: 0.58 },
      aiMode: 'manual',
      photoSent: false,
      createdAt: now,
      updatedAt: now,
      savedAt: now,
    };
    addSpace(space);
    showToast('Đã thêm không gian hỏng (giả lập)');
  }

  return (
    <View style={{ alignItems: 'flex-start', gap: t.spacing.xs }}>
      <AppText variant="caption1" color="mutedForeground">
        Bản dev · giả lập trạng thái
      </AppText>
      <View style={{ marginLeft: -t.spacing.sm }}>
        <Button variant="plain" label="Thêm không gian lưu bị hỏng" onPress={addBrokenSpace} />
      </View>
    </View>
  );
}
