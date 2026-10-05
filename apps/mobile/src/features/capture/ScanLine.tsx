/**
 * Vạch quét chạy từ trên xuống một lượt (~1,4 s), lặp lại nếu vẫn đang chờ kết quả.
 * Không render khi bật Reduce Motion (màn C4 khi đó chỉ hiện chữ + ActivityIndicator).
 */
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/theme';

export const SCAN_PASS_MS = 1400;
const BAND = 56;

export function ScanLine({ height }: { height: number }) {
  const t = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(withRepeat(withTiming(1, { duration: SCAN_PASS_MS, easing: Easing.inOut(Easing.quad) }), -1, false));
    return () => cancelAnimation(progress);
  }, [progress]);

  const moving = useAnimatedStyle(() => ({
    transform: [{ translateY: progress.get() * (height + BAND) - BAND }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ position: 'absolute', top: 0, left: 0, right: 0, height: BAND, justifyContent: 'flex-end' }, moving]}
    >
      {/* Dải sáng mờ phía sau vạch, rồi vạch hai lớp màu để thấy trên mọi ảnh. */}
      <View style={{ flex: 1, backgroundColor: t.colors.card, opacity: 0.22 }} />
      <View style={{ height: 5, backgroundColor: t.colors.foreground, justifyContent: 'center' }}>
        <View style={{ height: 3, backgroundColor: t.colors.card }} />
      </View>
    </Animated.View>
  );
}
