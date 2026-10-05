/**
 * Số đo thật của món đang chọn, vẽ ngay trên ảnh (founder duyệt 2026-10-03, theo IKEA Kreativ): đường kích thước
 * trắng có vạch hai đầu ở cạnh dưới (rộng) và cạnh bên (cao), kèm chip đen. Trả lời "có vừa không" bằng cm thật,
 * không phụ thuộc tỷ lệ đang hiển thị. Độ sâu nằm ở khay đáy. MASTER.md · Component Specs · Số đo trên món.
 * Trình đọc màn hình đọc số đo ở khay đáy nên lớp này ẩn với VoiceOver.
 */
import { View } from 'react-native';

import { AppText } from '@/components/ui';
import { useTheme } from '@/theme';
import type { Product } from '@/types';

import type { ItemLayout } from './geometry';

const LINE = 1.5;
const TICK = 9;
const GAP = 6;
const CHIP_BOX_W = 120;
/** Bề ngang dành cho chip "cao … cm" ở cạnh bên (chip ba chữ số vẫn vừa). */
const SIDE_CHIP_W = 96;
/** Khoảng tối thiểu từ mép màn tới đường / chip số đo. */
const EDGE = 4;
/** Khoảng dưới chân món mà đường và chip "rộng … cm" chiếm; tay cầm dời và thanh tác vụ tránh vùng này. */
export const DIM_CLEARANCE = 26;

function Chip({ text }: { text: string }) {
  const t = useTheme();
  return (
    <View
      style={[
        { paddingHorizontal: t.spacing.sm, paddingVertical: 3, borderRadius: t.radius.pill, backgroundColor: t.colors.accent },
        t.shadow('sm'),
      ]}
    >
      <AppText variant="caption1" weight="600" tabular maxFontSizeMultiplier={1.3} style={{ color: t.colors.onAccent }} numberOfLines={1}>
        {text}
      </AppText>
    </View>
  );
}

export function DimensionMarks({
  bounds,
  product,
  frameW,
  visMin,
}: {
  bounds: ItemLayout['bounds'];
  product: Product;
  /** Bề rộng khung ảnh (toạ độ canvas). */
  frameW: number;
  /** Mép nhìn thấy bên trái trong toạ độ canvas (ảnh có thể rộng hơn màn). */
  visMin: number;
}) {
  const t = useTheme();
  const line = t.colors.onImage;
  const { x0, x1, y0, y1 } = bounds;
  const w = x1 - x0;
  const h = y1 - y0;
  const visMax = frameW - visMin;

  // Cạnh bên: bên phải món, không đủ chỗ thì bên trái, hai bên đều chật thì bên rộng hơn. Đường và chip luôn nằm
  // trong phần ảnh nhìn thấy (món sát mép màn thì chip đè lên đường, như chip "rộng" nằm trên đường của nó).
  const need = GAP * 2 + SIDE_CHIP_W;
  const roomRight = visMax - x1;
  const roomLeft = x0 - visMin;
  const sideRight = roomRight >= need || (roomLeft < need && roomRight >= roomLeft);
  const sideX = Math.min(Math.max(sideRight ? x1 + GAP : x0 - GAP - LINE, visMin + EDGE), visMax - EDGE - LINE);
  const sideChipWant = sideRight ? sideX + GAP : sideX - GAP - SIDE_CHIP_W;
  const sideChipLeft = Math.min(Math.max(sideChipWant, visMin + EDGE), visMax - EDGE - SIDE_CHIP_W);
  // Chip sát đường khi đủ chỗ; bị kéo vào trong thì sát mép màn để đè lên món ít nhất.
  const sideChipAlign = sideRight !== (sideChipLeft !== sideChipWant) ? 'flex-start' : 'flex-end';

  const widthChipLeft = Math.min(Math.max((x0 + x1) / 2 - CHIP_BOX_W / 2, visMin), visMax - CHIP_BOX_W);

  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: 'absolute', left: 0, top: 0 }}>
      {/* Rộng: đường ngang ngay dưới chân món. */}
      <View style={[{ position: 'absolute', left: x0, top: y1 + GAP, width: w, height: LINE, backgroundColor: line }, t.shadow('sm')]} />
      <View style={{ position: 'absolute', left: x0, top: y1 + GAP - TICK / 2, width: LINE, height: TICK, backgroundColor: line }} />
      <View style={{ position: 'absolute', left: x1 - LINE, top: y1 + GAP - TICK / 2, width: LINE, height: TICK, backgroundColor: line }} />
      <View style={{ position: 'absolute', left: widthChipLeft, top: y1 + GAP - 11, width: CHIP_BOX_W, alignItems: 'center' }}>
        <Chip text={`rộng ${product.dimensions.widthCm} cm`} />
      </View>

      {/* Cao: đường dọc ở cạnh bên. */}
      <View style={[{ position: 'absolute', left: sideX, top: y0, width: LINE, height: h, backgroundColor: line }, t.shadow('sm')]} />
      <View style={{ position: 'absolute', left: sideX - TICK / 2 + LINE / 2, top: y0, width: TICK, height: LINE, backgroundColor: line }} />
      <View style={{ position: 'absolute', left: sideX - TICK / 2 + LINE / 2, top: y1 - LINE, width: TICK, height: LINE, backgroundColor: line }} />
      <View
        style={{
          position: 'absolute',
          top: y0 + h / 2 - 11,
          left: sideChipLeft,
          width: SIDE_CHIP_W,
          alignItems: sideChipAlign,
        }}
      >
        <Chip text={`cao ${product.dimensions.heightCm} cm`} />
      </View>
    </View>
  );
}
