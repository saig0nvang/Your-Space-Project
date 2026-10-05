/**
 * Hình món: ảnh mẫu đã tách nền nếu món có (data/productImages), không thì hình minh họa SVG tô theo chất liệu
 * — MASTER.md · "Màu chất liệu (nội dung minh họa)". Cả hai đều là nội dung của bản thử, chưa phải ảnh hay
 * mô hình 3D của nhà cung cấp.
 */
import { Image } from 'expo-image';
import { View } from 'react-native';
import Svg, { Ellipse, Path, Rect } from 'react-native-svg';

import { AppText } from '@/components/ui/AppText';
import { findProduct } from '@/data/catalog';
import { productImage } from '@/data/productImages';
import { useTheme } from '@/theme';
import { MATERIAL_LABEL, materialColors, type MaterialKey } from '@/theme/tokens';
import type { ProductCategory } from '@/types';

type Tones = { body: MaterialKey; frame: MaterialKey };

/** Chất liệu mặc định theo loại đồ khi không biết món cụ thể. */
const CATEGORY_TONES: Record<ProductCategory, Tones> = {
  sofa: { body: 'linen', frame: 'oak' },
  table: { body: 'oak', frame: 'oak' },
  lamp: { body: 'rattan', frame: 'ash' },
  shelf: { body: 'walnut', frame: 'steelBlack' },
  chair: { body: 'woven', frame: 'walnut' },
};

/** Pha màu chất liệu với trắng (amount > 0) hoặc đen (amount < 0) để tạo sáng tối của chính chất liệu đó. */
function mix(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.round(amount >= 0 ? c + (255 - c) * amount : c * (1 + amount)),
  );
  return `#${ch.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

export function ProductArt({
  category,
  size = 72,
  productId,
  tones,
}: {
  category: ProductCategory;
  size?: number;
  /** Có id món thì tô đúng chất liệu của món đó. */
  productId?: string;
  tones?: Tones;
}) {
  const image = tones ? undefined : productImage(productId);
  const resolved = tones ?? findProduct(productId)?.tones ?? CATEGORY_TONES[category];
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size, height: size }}>
      {image ? (
        <Image source={image.source} style={{ width: size, height: size }} contentFit="contain" accessible={false} />
      ) : (
        <ArtSvg category={category} size={size} tones={resolved} />
      )}
    </View>
  );
}

function ArtSvg({ category, size, tones }: { category: ProductCategory; size: number; tones: Tones }) {
  const t = useTheme();
  const body = materialColors[tones.body];
  const frame = materialColors[tones.frame];
  const bodyLight = mix(body, 0.22);
  const bodyDark = mix(body, -0.18);
  const frameDark = mix(frame, -0.2);
  const floor = t.colors.border;
  const isGlass = tones.body === 'glass';

  switch (category) {
    case 'sofa':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Ellipse cx={50} cy={83} rx={44} ry={4} fill={floor} />
          <Rect x={13} y={33} width={74} height={27} rx={7} fill={bodyDark} />
          <Rect x={16} y={36} width={33} height={20} rx={5} fill={body} />
          <Rect x={51} y={36} width={33} height={20} rx={5} fill={body} />
          <Rect x={6} y={46} width={13} height={28} rx={6} fill={bodyDark} />
          <Rect x={81} y={46} width={13} height={28} rx={6} fill={bodyDark} />
          <Rect x={17} y={56} width={33} height={14} rx={4} fill={bodyLight} />
          <Rect x={50} y={56} width={33} height={14} rx={4} fill={bodyLight} />
          <Rect x={10} y={70} width={80} height={6} rx={2} fill={bodyDark} />
          <Rect x={14} y={76} width={4} height={7} rx={1} fill={frame} />
          <Rect x={82} y={76} width={4} height={7} rx={1} fill={frame} />
        </Svg>
      );
    case 'table':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Ellipse cx={50} cy={81} rx={42} ry={4} fill={floor} />
          <Rect x={16} y={60} width={4} height={20} fill={frameDark} />
          <Rect x={80} y={60} width={4} height={20} fill={frameDark} />
          <Rect x={27} y={60} width={3} height={14} fill={frame} opacity={0.8} />
          <Rect x={70} y={60} width={3} height={14} fill={frame} opacity={0.8} />
          {isGlass ? null : <Rect x={22} y={68} width={56} height={3} fill={frame} opacity={0.7} />}
          <Path d="M22 46 L78 46 L91 56 L9 56 Z" fill={isGlass ? body : bodyLight} opacity={isGlass ? 0.75 : 1} />
          <Rect x={9} y={56} width={82} height={5} fill={isGlass ? frameDark : bodyDark} />
        </Svg>
      );
    case 'lamp':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Ellipse cx={50} cy={89} rx={17} ry={3} fill={floor} />
          <Rect x={48.5} y={34} width={3} height={52} fill={frame} />
          <Rect x={39} y={85} width={22} height={4} rx={2} fill={frameDark} />
          <Path d="M33 12 L67 12 L76 36 L24 36 Z" fill={body} />
          <Path d="M33 12 L44 12 L38 36 L24 36 Z" fill={bodyLight} opacity={0.55} />
          <Rect x={24} y={35} width={52} height={2.5} fill={bodyDark} />
        </Svg>
      );
    case 'shelf':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Ellipse cx={50} cy={91} rx={32} ry={3} fill={floor} />
          <Rect x={23} y={9} width={54} height={80} rx={2} fill={frame} />
          {[13, 29, 45].map((y) => (
            <Rect key={y} x={27} y={y} width={46} height={13} fill={body} />
          ))}
          <Rect x={31} y={16} width={6} height={10} fill={bodyLight} />
          <Rect x={39} y={18} width={4} height={8} fill={bodyDark} />
          <Rect x={58} y={33} width={10} height={8} rx={2} fill={bodyLight} />
          <Rect x={27} y={61} width={22.5} height={24} fill={bodyDark} />
          <Rect x={50.5} y={61} width={22.5} height={24} fill={body} />
          <Rect x={47} y={71} width={2} height={5} fill={frameDark} />
          <Rect x={51} y={71} width={2} height={5} fill={frameDark} />
        </Svg>
      );
    case 'chair':
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Ellipse cx={50} cy={87} rx={28} ry={3} fill={floor} />
          <Rect x={29} y={58} width={4} height={28} fill={frame} />
          <Rect x={67} y={58} width={4} height={28} fill={frame} />
          <Rect x={31} y={16} width={38} height={32} rx={6} fill={bodyDark} />
          <Rect x={34} y={19} width={32} height={26} rx={4} fill={body} />
          <Rect x={25} y={47} width={50} height={12} rx={4} fill={bodyLight} />
          <Rect x={25} y={56} width={50} height={4} rx={2} fill={bodyDark} />
        </Svg>
      );
  }
}

/** Chấm mẫu chất liệu kèm tên (MASTER.md: chấm luôn đi cùng chữ). */
export function MaterialSwatch({ material, size = 12, showLabel = true }: { material: MaterialKey; size?: number; showLabel?: boolean }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.xs + 2 }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: materialColors[material],
          borderWidth: 1,
          borderColor: t.colors.border,
        }}
      />
      {showLabel ? (
        <AppText variant="footnote" color="mutedForeground">
          {MATERIAL_LABEL[material]}
        </AppText>
      ) : null}
    </View>
  );
}

/** Ô ảnh món: nền muted, bo radius-sm, hình minh họa ở giữa. */
export function ProductThumb({ category, size = 88, productId }: { category: ProductCategory; size?: number; productId?: string }) {
  const t = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: t.radius.sm,
        backgroundColor: t.colors.muted,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ProductArt category={category} productId={productId} size={size * 0.82} />
    </View>
  );
}
