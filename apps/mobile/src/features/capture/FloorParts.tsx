/**
 * Thành phần của C5 Xác nhận mặt sàn: lớp phủ vùng sàn trên ảnh và điều khiển chiều cao máy.
 * "Chiều cao máy" là khái niệm kỹ thuật nên diễn đạt bằng hình người cầm máy + mốc mét (docs/screens.md · C5).
 */
import { Minus, Plus } from 'phosphor-react-native';
import { View } from 'react-native';
import Svg, { Circle, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';

import { AppText, IconButton } from '@/components/ui';
import { useTheme } from '@/theme';

import type { FrameSize } from './RoomPhoto';
import { PhotoPill } from './RoomPhoto';
import { formatMetersFromCm } from './session';

export const CAMERA_HEIGHT_MIN_CM = 100;
export const CAMERA_HEIGHT_MAX_CM = 180;
export const CAMERA_HEIGHT_STEP_CM = 5;

/**
 * Vùng sàn: từ chân tường xuống đáy ảnh, phủ mờ, viền trên nét đứt hai lớp màu, nhãn "Sàn nhà". Có `wallBase` (AI nhận ra
 * chân tường) thì viền đi theo đúng chỗ sàn gặp từng bức tường; không có thì là đường ngang ở `floorLineY`.
 */
export function FloorOverlay({ size, floorLineY, wallBase }: { size: FrameSize; floorLineY: number; wallBase?: [number, number][] }) {
  const t = useTheme();
  const c = t.colors;
  const line: [number, number][] =
    wallBase && wallBase.length >= 2 ? wallBase.map(([x, d]) => [x, floorLineY + d]) : [[0, floorLineY], [1, floorLineY]];
  const pts = line.map(([x, y]) => `${(x * size.width).toFixed(1)},${(y * size.height).toFixed(1)}`).join(' ');
  const area = `${pts} ${size.width},${size.height} 0,${size.height}`;
  const labelTop = Math.max(...line.map(([, y]) => y)) * size.height;
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ position: 'absolute', top: 0, left: 0, width: size.width, height: size.height }}
    >
      <Svg width={size.width} height={size.height}>
        <Polygon points={area} fill={c.card} opacity={0.38} />
        <Polyline points={pts} fill="none" stroke={c.card} strokeWidth={5} strokeLinejoin="round" />
        <Polyline points={pts} fill="none" stroke={c.cardForeground} strokeWidth={2.5} strokeDasharray="10 7" strokeLinejoin="round" />
      </Svg>
      <View style={{ position: 'absolute', left: 0, right: 0, top: labelTop + (size.height - labelTop) / 2 - 16 }}>
        <PhotoPill label="Sàn nhà" />
      </View>
    </View>
  );
}

/** Hình minh họa người cầm máy; điện thoại và mốc đo dời theo chiều cao đang chọn. */
function HeightIllustration({ cm }: { cm: number }) {
  const t = useTheme();
  const c = t.colors;
  // Hệ toạ độ 0..120 × 0..140; sàn ở y = 132; 1 m ≈ 62 đơn vị (người cao ~1,7 m).
  const floor = 132;
  const unit = 62;
  const phoneY = floor - (cm / 100) * unit;
  const shoulder = { x: 42, y: floor - 1.42 * unit };
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    <Svg width={96} height={112} viewBox="0 0 120 140">
      <Line x1={4} y1={floor} x2={116} y2={floor} stroke={c.borderStrong} strokeWidth={2} />
      {/* Người */}
      <Circle cx={42} cy={floor - 1.6 * unit} r={9} fill={c.primary} />
      <Path
        d={`M42 ${floor - 1.47 * unit} L42 ${floor - 0.85 * unit} M42 ${floor - 0.85 * unit} L32 ${floor} M42 ${floor - 0.85 * unit} L52 ${floor}`}
        stroke={c.primary}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
      {/* Tay cầm máy */}
      <Line x1={shoulder.x} y1={shoulder.y} x2={66} y2={phoneY + 4} stroke={c.primary} strokeWidth={5} strokeLinecap="round" />
      <Rect x={64} y={phoneY - 7} width={9} height={15} rx={2} fill={c.foreground} />
      {/* Mốc đo từ sàn lên máy */}
      <Line x1={96} y1={floor} x2={96} y2={phoneY} stroke={c.foreground} strokeWidth={2} />
      <Line x1={90} y1={phoneY} x2={102} y2={phoneY} stroke={c.foreground} strokeWidth={2} />
      <Line x1={90} y1={floor} x2={102} y2={floor} stroke={c.foreground} strokeWidth={2} />
      <Line x1={74} y1={phoneY} x2={88} y2={phoneY} stroke={c.foreground} strokeWidth={1.5} strokeDasharray="3 3" />
    </Svg>
    </View>
  );
}

/**
 * Chiều cao máy lúc chụp: hình minh họa + giá trị + nút −/+ (bước 5 cm, 1,0–1,8 m).
 * Với trình đọc màn hình là một control "adjustable": vuốt lên/xuống để tăng/giảm.
 */
export function CameraHeightControl({ cm, onChange }: { cm: number; onChange: (cm: number) => void }) {
  const t = useTheme();
  const value = formatMetersFromCm(cm);
  const canDec = cm > CAMERA_HEIGHT_MIN_CM;
  const canInc = cm < CAMERA_HEIGHT_MAX_CM;
  const step = (dir: 1 | -1) =>
    onChange(Math.min(CAMERA_HEIGHT_MAX_CM, Math.max(CAMERA_HEIGHT_MIN_CM, cm + dir * CAMERA_HEIGHT_STEP_CM)));

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
      <HeightIllustration cm={cm} />
      <View style={{ flex: 1, gap: t.spacing.sm }}>
        <AppText variant="headline" tabular>
          Máy cầm cao khoảng {`${value}\u00A0m`}
        </AppText>
        <AppText variant="footnote" color="mutedForeground">
          App ước lượng từ ảnh. Chỉnh nếu lúc chụp bạn cầm máy cao hoặc thấp hơn.
        </AppText>
        <View
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel="Chiều cao máy lúc chụp"
          accessibilityValue={{ text: `${value} mét` }}
          accessibilityHint="Vuốt lên hoặc xuống để chỉnh, mỗi lần 5 xăng-ti-mét"
          accessibilityActions={[
            { name: 'increment', label: 'Tăng' },
            { name: 'decrement', label: 'Giảm' },
          ]}
          onAccessibilityAction={(e) => {
            if (e.nativeEvent.actionName === 'increment' && canInc) step(1);
            if (e.nativeEvent.actionName === 'decrement' && canDec) step(-1);
          }}
          style={{ flexDirection: 'row', gap: t.spacing.sm + 4 }}
        >
          <IconButton icon={Minus} variant="tinted" accessibilityLabel="Giảm chiều cao máy" disabled={!canDec} onPress={() => step(-1)} />
          <IconButton icon={Plus} variant="tinted" accessibilityLabel="Tăng chiều cao máy" disabled={!canInc} onPress={() => step(1)} />
        </View>
      </View>
    </View>
  );
}
