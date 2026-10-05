/**
 * Thành phần của C2 Camera (giả lập): thước cân bằng, nút chụp, ô thư viện.
 * Bản thử không đọc cảm biến thật: độ nghiêng dao động nhẹ rồi ổn định ở 0,8°.
 */
import { CheckCircle } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { AppText } from '@/components/ui';
import { samplePhotoRef, type SamplePhoto } from '@/data/samplePhotos';
import { useTheme } from '@/theme';
import { disabledOpacity, pressedOpacity } from '@/theme/tokens';

import { PhotoPill, RoomPhoto } from './RoomPhoto';
import { formatDecimal } from './session';

/** Chuỗi độ nghiêng giả lập (độ); phần tử cuối là giá trị ổn định. */
const TILT_SEQUENCE = [4.6, -3.2, 2.3, -1.5, 1.2, 0.8];
const TILT_STEP_MS = 380;

/**
 * Độ nghiêng giả lập: đi qua TILT_SEQUENCE rồi dừng ở giá trị ổn định.
 * Bật Reduce Motion → trả ngay giá trị ổn định.
 */
export function useMockLevel(active: boolean, reduceMotion: boolean): { tilt: number; stable: boolean } {
  const last = TILT_SEQUENCE.length - 1;
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!active || reduceMotion || step >= last) return;
    const id = setTimeout(() => setStep(step + 1), TILT_STEP_MS);
    return () => clearTimeout(id);
  }, [active, reduceMotion, step, last]);
  const index = reduceMotion ? last : step;
  return { tilt: TILT_SEQUENCE[index], stable: index === last };
}

/** Vạch cân bằng ở giữa khung ngắm, xoay theo độ nghiêng. Hai lớp màu để thấy được trên mọi ảnh. */
export function LevelGuide({ tilt, stable, reduceMotion }: { tilt: number; stable: boolean; reduceMotion: boolean }) {
  const t = useTheme();
  const c = t.colors;
  const turnMs = t.motion.slow;
  const rotation = useAnimatedStyle(() => ({
    transform: [{ rotate: reduceMotion ? `${tilt}deg` : withTiming(`${tilt}deg`, { duration: turnMs }) }],
  }));
  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          {
            width: 176,
            height: 6,
            borderRadius: 3,
            backgroundColor: c.foreground,
            justifyContent: 'center',
            paddingHorizontal: 1,
          },
          rotation,
        ]}
      >
        <View style={{ height: 2, borderRadius: 1, backgroundColor: c.card }} />
      </Animated.View>
      {/* Mốc ngang cố định: khi máy cân bằng, vạch xoay trùng với hai mốc này. */}
      <View style={{ position: 'absolute', flexDirection: 'row', width: 240, justifyContent: 'space-between' }}>
        {[0, 1].map((i) => (
          <View
            key={i}
            style={{
              width: 24,
              height: 6,
              borderRadius: 3,
              backgroundColor: stable ? c.card : c.foreground,
              borderWidth: 2,
              borderColor: stable ? c.foreground : c.card,
            }}
          />
        ))}
      </View>
    </View>
  );
}

/** Nhãn trạng thái cân bằng: luôn icon + chữ. */
export function LevelPill({ tilt, stable }: { tilt: number; stable: boolean }) {
  const value = `${formatDecimal(Math.abs(tilt), 1)}°`;
  return stable ? (
    <PhotoPill icon={CheckCircle} iconWeight="fill" label={`Máy đã cân bằng · ${value}`} accessibilityLiveRegion="polite" />
  ) : (
    <PhotoPill label={`Giữ máy thẳng · lệch ${value}`} />
  );
}

/** Nút chụp tròn lớn, vùng chạm 80 (≥ 72). Hành động chính của C2. */
export function ShutterButton({ onPress, disabled }: { onPress: () => void; disabled: boolean }) {
  const t = useTheme();
  const c = t.colors;
  const size = 80;
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Chụp ảnh"
      accessibilityState={{ disabled }}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 4,
        borderColor: c.foreground,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? disabledOpacity : pressed && Platform.OS === 'ios' ? pressedOpacity : 1,
      })}
    >
      {({ pressed }) => (
        <View
          style={{
            width: size - 16,
            height: size - 16,
            borderRadius: (size - 16) / 2,
            backgroundColor: c.accent,
            opacity: pressed && Platform.OS === 'android' ? pressedOpacity : 1,
          }}
        />
      )}
    </Pressable>
  );
}

/** Ô thư viện: ảnh thu nhỏ + nhãn, mở bộ chọn ảnh giả lập. */
export function LibraryTile({ photo, onPress }: { photo: SamplePhoto | undefined; onPress: () => void }) {
  const t = useTheme();
  const c = t.colors;
  const size = 52;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Chọn ảnh có sẵn"
      hitSlop={8}
      style={({ pressed }) => ({ alignItems: 'center', gap: t.spacing.xs, opacity: pressed && Platform.OS === 'ios' ? pressedOpacity : 1 })}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: t.radius.sm,
          overflow: 'hidden',
          borderWidth: 2,
          borderColor: c.borderStrong,
          backgroundColor: c.muted,
        }}
      >
        {photo ? <RoomPhoto uri={samplePhotoRef(photo.id)} accessibilityLabel="" /> : null}
      </View>
      <AppText variant="caption1" color="foreground">
        Thư viện
      </AppText>
    </Pressable>
  );
}
