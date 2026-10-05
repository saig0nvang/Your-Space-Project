/**
 * Thước xoay món 3D (theo IKEA Kreativ, founder yêu cầu 2026-10-04): thước độ dọc ở mép trái ảnh, vạch đứng yên ở giữa,
 * thước trượt theo ngón tay — kéo lên / xuống để xoay món quanh trục đứng. Gần 0°, ±45°, ±90°… thì hít vào kèm rung nhẹ.
 * 0° = món song song với tường (trục phòng). VoiceOver: điều chỉnh được, mỗi nấc 15°. MASTER.md · Thước xoay món.
 */
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { View, type AccessibilityActionEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { AppText } from '@/components/ui';
import { useTheme } from '@/theme';

import { normalizeAngle } from './geometry';

/** Số pt thước trượt cho mỗi độ. */
const PT_PER_DEG = 3;
/** Khoảng hít về góc chẵn 45° khi thả tay (độ). */
const SNAP_DEG = 5;
const A11Y_STEP = 15;
const WIDTH = 44;

function snapAngle(deg: number): number {
  const near = Math.round(deg / 45) * 45;
  return Math.abs(deg - near) <= SNAP_DEG ? normalizeAngle(near) : Math.round(deg);
}

export function RotationRuler({
  value,
  top,
  height,
  left,
  productName,
  onRotate,
}: {
  /** Góc hiện tại (độ, đã gồm thao tác đang diễn ra). */
  value: number;
  top: number;
  height: number;
  left: number;
  productName: string;
  /** Kéo thước: 'move' khi đang kéo (chưa ghi lịch sử), 'end' khi thả, 'cancel' khi bị huỷ. */
  onRotate: (phase: 'move' | 'end' | 'cancel', deg: number) => void;
}) {
  const t = useTheme();
  const c = t.colors;
  // Góc lúc bắt đầu kéo (giữ ở JS: thước chỉ dùng runOnJS).
  const [startDeg, setStartDeg] = useState<number | null>(null);

  const pan = Gesture.Pan()
    .runOnJS(true)
    .minDistance(2)
    .onStart(() => setStartDeg(value))
    .onUpdate((e) => {
      const base = startDeg ?? value;
      const next = normalizeAngle(base - e.translationY / PT_PER_DEG);
      // Rung nhẹ khi đi qua một góc chẵn 45° (0°, ±45°, ±90°…).
      if (Math.floor((value + 360) / 45) !== Math.floor((next + 360) / 45)) {
        void Haptics.selectionAsync().catch(() => undefined);
      }
      onRotate('move', next);
    })
    .onEnd((e) => {
      const base = startDeg ?? value;
      onRotate('end', snapAngle(normalizeAngle(base - e.translationY / PT_PER_DEG)));
      setStartDeg(null);
    })
    .onFinalize((_e, success) => {
      if (!success) {
        onRotate('cancel', value);
        setStartDeg(null);
      }
    });

  // Vạch trong khoảng nhìn thấy: mỗi 5° một vạch, mỗi 15° một vạch dài có số.
  const half = height / 2;
  const span = Math.ceil(half / PT_PER_DEG / 5) * 5 + 5;
  const ticks: { deg: number; y: number }[] = [];
  for (let d = Math.floor((value - span) / 5) * 5; d <= value + span; d += 5) {
    const y = half + (value - d) * PT_PER_DEG;
    if (y > 6 && y < height - 6) ticks.push({ deg: d, y });
  }
  const shown = Math.round(normalizeAngle(value));

  return (
    <GestureDetector gesture={pan}>
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={`Xoay ${productName}`}
        accessibilityValue={{ text: `${shown} độ` }}
        accessibilityHint="Vuốt lên hoặc xuống để xoay từng nấc 15 độ"
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e: AccessibilityActionEvent) =>
          onRotate('end', normalizeAngle(shown + (e.nativeEvent.actionName === 'increment' ? A11Y_STEP : -A11Y_STEP)))
        }
        style={[
          {
            position: 'absolute',
            left,
            top,
            width: WIDTH,
            height,
            borderRadius: t.radius.pill,
            backgroundColor: c.card,
            overflow: 'hidden',
          },
          t.shadow('md'),
        ]}
      >
        {ticks.map(({ deg, y }) => {
          const major = deg % 15 === 0;
          const label = normalizeAngle(deg);
          return (
            <View key={deg} pointerEvents="none" style={{ position: 'absolute', top: y - 0.75, left: 0, right: 0, height: 1.5 }}>
              <View
                style={{
                  position: 'absolute',
                  left: 4,
                  width: major ? 10 : 6,
                  height: 1.5,
                  backgroundColor: major ? c.foreground : c.borderStrong,
                }}
              />
              {major && deg !== Math.round(value / 15) * 15 ? (
                <AppText
                  variant="caption2"
                  tabular
                  color="mutedForeground"
                  maxFontSizeMultiplier={1}
                  style={{ position: 'absolute', left: 16, top: -7, width: WIDTH - 18, textAlign: 'left' }}
                >
                  {label}
                </AppText>
              ) : null}
            </View>
          );
        })}
        {/* Vạch giữa đứng yên + số đo góc hiện tại. */}
        <View pointerEvents="none" style={{ position: 'absolute', top: half - 1, left: 2, width: 14, height: 2, backgroundColor: c.accent }} />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: half - 10,
            left: 16,
            right: 2,
            height: 20,
            borderRadius: t.radius.pill,
            backgroundColor: c.accent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppText variant="caption2" weight="600" tabular maxFontSizeMultiplier={1} style={{ color: c.onAccent }}>
            {`${shown}°`}
          </AppText>
        </View>
      </View>
    </GestureDetector>
  );
}
