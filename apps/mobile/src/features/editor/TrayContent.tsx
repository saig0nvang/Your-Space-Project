/**
 * Nội dung khay đồ (E4-US2 AC2): tab phong cách, chip loại đồ (chỉ loại có món — CC2), danh sách món ngang.
 * Dùng trong khay kéo được của canvas và trong chế độ xem 2D.
 */
import { CheckCircle, Info, SquaresFour } from 'phosphor-react-native';
import { Platform, Pressable, ScrollView, View } from 'react-native';

import { ProductThumb } from '@/components/ProductArt';
import { AppText, Chip, IconButton, Price, StatusTag } from '@/components/ui';
import { STYLES, productsByStyle } from '@/data/catalog';
import { formatVND } from '@/lib/format';
import { useTheme } from '@/theme';
import { disabledOpacity, pressedOpacity } from '@/theme/tokens';
import { CATEGORY_LABEL, type Product, type ProductCategory, type StyleId } from '@/types';
import { ALL_CATEGORIES_ICON, CATEGORY_ICON } from '@/lib/categoryIcons';

export type CategoryFilter = ProductCategory | 'all';

const CATEGORY_ORDER: ProductCategory[] = ['sofa', 'table', 'chair', 'lamp', 'shelf'];

/** Phong cách của không gian đứng đầu, rồi các phong cách khác (một phòng mix được nhiều phong cách — AC3). */
export function styleOrderFor(spaceStyle: StyleId): StyleId[] {
  return [spaceStyle, ...STYLES.map((s) => s.id).filter((id) => id !== spaceStyle)];
}

/** Loại đồ có món trong phong cách đang xem. */
export function categoriesFor(styleId: StyleId): ProductCategory[] {
  const products = productsByStyle(styleId);
  return CATEGORY_ORDER.filter((c) => products.some((p) => p.category === c));
}

function ProductCard({
  product,
  selected,
  onPick,
  onInfo,
  pickHint,
}: {
  product: Product;
  selected: boolean;
  onPick: () => void;
  onInfo: () => void;
  pickHint: string;
}) {
  const t = useTheme();
  const c = t.colors;
  const unavailable = product.status !== 'available';
  const statusLabel = product.status === 'out_of_stock' ? 'Hết hàng' : 'Ngừng bán';
  const width = 128;
  const thumb = width - t.spacing.xs * 2 - 4;
  return (
    <View style={{ width }}>
      <Pressable
        onPress={unavailable ? undefined : onPick}
        disabled={unavailable}
        accessibilityRole="button"
        accessibilityLabel={`${product.name}, ${formatVND(product.priceVND)}${selected ? ', đang chọn' : ''}${unavailable ? `, ${statusLabel}` : ''}`}
        accessibilityHint={unavailable ? undefined : pickHint}
        accessibilityState={{ selected, disabled: unavailable }}
        style={({ pressed }) => ({
          gap: t.spacing.xs,
          padding: t.spacing.xs,
          borderRadius: t.radius.md,
          borderWidth: 2,
          borderColor: selected ? c.foreground : 'transparent',
          opacity: unavailable ? disabledOpacity : pressed && Platform.OS === 'ios' ? pressedOpacity : 1,
        })}
      >
        <ProductThumb category={product.category} productId={product.id} size={thumb} />
        {selected ? (
          <View
            style={{
              position: 'absolute',
              top: t.spacing.xs + 2 + thumb - 26,
              left: t.spacing.xs + 4,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 2,
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: t.radius.sm,
              backgroundColor: c.foreground,
            }}
          >
            <CheckCircle size={14} color={c.background} weight="fill" />
            <AppText variant="caption2" weight="600" color="background">
              Đang chọn
            </AppText>
          </View>
        ) : null}
        <AppText variant="subheadline" numberOfLines={2}>
          {product.name}
        </AppText>
        <Price amount={product.priceVND} variant="subheadline" color="accentText" />
        {unavailable ? <StatusTag tone="attention" label={statusLabel} /> : null}
      </Pressable>
      <View style={{ position: 'absolute', top: 2, right: 2 }}>
        <IconButton icon={Info} variant="floating" accessibilityLabel={`Xem chi tiết ${product.name}`} onPress={onInfo} />
      </View>
    </View>
  );
}

/**
 * Hàng món thu gọn khi khay đóng: thấy trọn căn phòng mà vẫn chọn món được ngay (critique 2026-10-03:
 * khay mở sẵn che sàn). Mở khay để đổi phong cách, lọc loại đồ và xem tên, giá.
 */
export function PeekStrip({
  styleId,
  armedProductId,
  onPickProduct,
  onOpenTray,
  pickHint,
}: {
  styleId: StyleId;
  armedProductId: string | null;
  onPickProduct: (p: Product) => void;
  /** Ô cuối "Tất cả": mở khay đầy đủ (đổi phong cách, lọc loại đồ). */
  onOpenTray: () => void;
  pickHint: string;
}) {
  const t = useTheme();
  const c = t.colors;
  const size = 60;
  const products = productsByStyle(styleId).filter((p) => p.status === 'available');
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel={`Món ${STYLES.find((s) => s.id === styleId)?.name ?? ''}`}
      contentContainerStyle={{ paddingHorizontal: t.spacing.md, gap: t.spacing.sm }}
    >
      {products.map((p) => {
        const selected = armedProductId === p.id;
        return (
          <Pressable
            key={p.id}
            onPress={() => onPickProduct(p)}
            accessibilityRole="button"
            accessibilityLabel={`${p.name}, ${formatVND(p.priceVND)}${selected ? ', đang chọn' : ''}`}
            accessibilityHint={pickHint}
            accessibilityState={{ selected }}
            style={({ pressed }) => ({
              padding: 2,
              borderRadius: t.radius.sm + 2,
              borderWidth: 2,
              borderColor: selected ? c.foreground : 'transparent',
              opacity: pressed && Platform.OS === 'ios' ? pressedOpacity : 1,
            })}
          >
            <ProductThumb category={p.category} productId={p.id} size={size} />
          </Pressable>
        );
      })}
      <Pressable
        onPress={onOpenTray}
        accessibilityRole="button"
        accessibilityLabel="Tất cả món: đổi phong cách, lọc loại đồ"
        style={({ pressed }) => ({
          width: size + 8,
          height: size + 8,
          borderRadius: t.radius.sm + 2,
          backgroundColor: c.muted,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          opacity: pressed && Platform.OS === 'ios' ? pressedOpacity : 1,
        })}
      >
        <SquaresFour size={20} color={c.foreground} />
        <AppText variant="caption2" weight="600">
          Tất cả
        </AppText>
      </Pressable>
    </ScrollView>
  );
}

/**
 * Tab phong cách dạng chữ (distill 2026-10-03): khác hẳn segmented Thêm đồ / Xóa đồ cũ, vì đây là bộ lọc,
 * không phải công cụ. Tab đang chọn: chữ đậm màu chính + gạch chân 2.
 */
function StyleTabs({ order, value, onChange }: { order: StyleId[]; value: StyleId; onChange: (s: StyleId) => void }) {
  const t = useTheme();
  const c = t.colors;
  return (
    <View accessibilityRole="tablist" accessibilityLabel="Phong cách trong khay" style={{ flexDirection: 'row', gap: t.spacing.lg, paddingHorizontal: t.spacing.md }}>
      {order.map((id) => {
        const selected = id === value;
        return (
          <Pressable
            key={id}
            onPress={() => onChange(id)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            aria-selected={selected}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ minHeight: t.touchTarget, justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: selected ? c.foreground : 'transparent' }}
          >
            <AppText variant="headline" color={selected ? 'foreground' : 'mutedForeground'}>
              {STYLES.find((s) => s.id === id)?.name ?? id}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function TrayContent({
  styleOrder,
  styleId,
  onStyleChange,
  category,
  onCategoryChange,
  armedProductId,
  onPickProduct,
  onInfo,
  pickHint,
}: {
  styleOrder: StyleId[];
  styleId: StyleId;
  onStyleChange: (s: StyleId) => void;
  category: CategoryFilter;
  onCategoryChange: (c: CategoryFilter) => void;
  armedProductId: string | null;
  onPickProduct: (p: Product) => void;
  onInfo: (p: Product) => void;
  pickHint: string;
}) {
  const t = useTheme();
  const cats = categoriesFor(styleId);
  // Loại đang chọn không có trong phong cách mới thì về "Tất cả" (suy ra, không cần effect).
  const activeCategory: CategoryFilter = category !== 'all' && !cats.includes(category) ? 'all' : category;
  const products = productsByStyle(styleId).filter((p) => activeCategory === 'all' || p.category === activeCategory);

  return (
    <View style={{ gap: t.spacing.sm + 4 }}>
      <StyleTabs order={styleOrder} value={styleId} onChange={onStyleChange} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: t.spacing.md, gap: t.spacing.sm, paddingVertical: 4 }}
        accessibilityLabel="Loại đồ"
      >
        <Chip label="Tất cả" icon={ALL_CATEGORIES_ICON} selected={activeCategory === 'all'} onPress={() => onCategoryChange('all')} />
        {cats.map((cat) => (
          <Chip key={cat} label={CATEGORY_LABEL[cat]} icon={CATEGORY_ICON[cat]} selected={activeCategory === cat} onPress={() => onCategoryChange(cat)} />
        ))}
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: t.spacing.md - t.spacing.xs, gap: t.spacing.xs }}
      >
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            selected={armedProductId === p.id}
            onPick={() => onPickProduct(p)}
            onInfo={() => onInfo(p)}
            pickHint={pickHint}
          />
        ))}
      </ScrollView>
      <AppText variant="caption1" color="mutedForeground" style={{ paddingHorizontal: t.spacing.md }}>
        Ảnh, tên và giá là dữ liệu mẫu của bản thử.
      </AppText>
    </View>
  );
}
