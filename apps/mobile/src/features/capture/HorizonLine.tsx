/**
 * Đường chân trời kéo được (C6). Kéo ở bất kỳ đâu trên ảnh để dời đường, hoặc chạm để đặt nhanh
 * (thao tác một điểm chạm thay cho kéo — WCAG 2.2 Dragging Movements). Với trình đọc màn hình là control
 * "adjustable". Đường luôn nằm trong khung; tới gần mép thì nhắc kéo về tầm mắt.
 */
import { ArrowsVertical, WarningCircle } from 'phosphor-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { AppText } from '@/components/ui';
import { useTheme } from '@/theme';

import { PhotoPill, type FrameSize } from './RoomPhoto';

/** Giới hạn đường trong khung (0..1 theo chiều cao ảnh). */
const MIN_Y = 0.03;
const MAX_Y = 0.97;
/** Gần mép hơn ngưỡng này thì nhắc: tầm mắt lúc chụp hiếm khi nằm sát mép ảnh. */
const WARN_LOW = 0.1;
const WARN_HIGH = 0.9;
const A11Y_STEP = 0.02;
const HANDLE_H = 44;

type EdgeWarning = 'top' | 'bottom' | null;

function clampY(v: number): number {
  'worklet';
  return Math.min(MAX_Y, Math.max(MIN_Y, v));
}

function edgeOf(v: number): EdgeWarning {
  'worklet';
  if (v <= WARN_LOW) return 'top';
  if (v >= WARN_HIGH) return 'bottom';
  return null;
}

export function HorizonLine({
  size,
  initialY,
  onCommit,
}: {
  size: FrameSize;
  initialY: number;
  /** Gọi khi người dùng thả tay / chạm / chỉnh bằng trình đọc màn hình, với vị trí mới (0..1). */
  onCommit: (y: number) => void;
}) {
  const t = useTheme();
  const c = t.colors;
  const reduceMotion = useReducedMotion();
  const pos = useSharedValue(clampY(initialY));
  const start = useSharedValue(0);
  const [committed, setCommitted] = useState(clampY(initialY));
  const [edge, setEdge] = useState<EdgeWarning>(edgeOf(clampY(initialY)));
  const height = size.height;
  // Số thuần cho worklet (không bắt cả object theme vào luồng UI).
  const moveMs = reduceMotion ? 0 : t.motion.fast;

  const commit = (y: number) => {
    setCommitted(y);
    onCommit(y);
  };

  useAnimatedReaction(
    () => edgeOf(pos.get()),
    (next, prev) => {
      if (next !== prev) scheduleOnRN(setEdge, next);
    },
  );

  const pan = Gesture.Pan()
    .activeOffsetY([-6, 6])
    .failOffsetX([-24, 24])
    .onStart(() => {
      start.set(pos.get());
    })
    .onUpdate((e) => {
      pos.set(clampY(start.get() + e.translationY / height));
    })
    .onEnd(() => {
      scheduleOnRN(commit, pos.get());
    });

  const tap = Gesture.Tap().onEnd((e, success) => {
    if (!success) return;
    const next = clampY(e.y / height);
    pos.set(withTiming(next, { duration: moveMs }));
    scheduleOnRN(commit, next);
  });

  const gesture = Gesture.Exclusive(pan, tap);

  const lineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pos.get() * height - HANDLE_H / 2 }],
  }));

  const nudge = (delta: number) => {
    const next = clampY(committed + delta);
    pos.set(reduceMotion ? next : withTiming(next, { duration: moveMs }));
    commit(next);
  };

  const percentFromTop = Math.round(committed * 100);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Đường chân trời"
        accessibilityValue={{
          text: `cách mép trên ảnh ${percentFromTop} phần trăm${edge ? ', đang sát mép ảnh' : ''}`,
        }}
        accessibilityHint="Vuốt lên hoặc xuống để dời đường về ngang tầm mắt của bạn lúc chụp"
        accessibilityActions={[
          { name: 'increment', label: 'Dời lên' },
          { name: 'decrement', label: 'Dời xuống' },
        ]}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === 'increment') nudge(-A11Y_STEP);
          if (e.nativeEvent.actionName === 'decrement') nudge(A11Y_STEP);
        }}
        style={{ position: 'absolute', top: 0, left: 0, width: size.width, height }}
      >
        <Animated.View
          pointerEvents="none"
          style={[{ position: 'absolute', top: 0, left: 0, right: 0, height: HANDLE_H, justifyContent: 'center' }, lineStyle]}
        >
          {/* Đường hai lớp màu để thấy trên mọi ảnh, ở cả hai theme. */}
          <View style={{ height: 6, backgroundColor: c.foreground, justifyContent: 'center' }}>
            <View style={{ height: 2, backgroundColor: c.card }} />
          </View>
          <View style={{ position: 'absolute', alignSelf: 'center' }}>
            <View
              style={[
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: t.spacing.xs,
                  minHeight: 36,
                  paddingHorizontal: t.spacing.sm + 4,
                  borderRadius: t.radius.pill,
                  backgroundColor: c.card,
                  borderWidth: 2,
                  borderColor: c.foreground,
                },
                t.shadow('xl'),
              ]}
            >
              <ArrowsVertical size={18} color={c.cardForeground} weight="bold" />
              <AppText variant="footnote" weight="600" color="cardForeground">
                Tầm mắt
              </AppText>
            </View>
          </View>
        </Animated.View>

        {edge ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              ...(edge === 'top' ? { bottom: t.spacing.md } : { top: t.spacing.md }),
            }}
          >
            <PhotoPill
              icon={WarningCircle}
              iconWeight="fill"
              label="Đường đang sát mép ảnh. Kéo về ngang tầm mắt của bạn lúc chụp."
              accessibilityLiveRegion="polite"
            />
          </View>
        ) : null}
      </Animated.View>
    </GestureDetector>
  );
}
