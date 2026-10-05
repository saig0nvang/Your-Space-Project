/**
 * K3 — Món theo phong cách. docs/screens.md §5 K3; E1-US6.
 * Màn danh sách: không có nút nền `accent`. Chip lọc loại đồ và chất liệu (chip đang bật có dấu chọn),
 * lọc không ra món → màn trống + "Bỏ lọc". Quay lại giữ bộ lọc và vị trí cuộn.
 */
import { router, Stack } from 'expo-router';
import { FunnelSimpleX, SquaresFour, type Icon as PhosphorIcon } from 'phosphor-react-native';
import { useRef, useState } from 'react';
import { FlatList, ScrollView, View } from 'react-native';

import { AppText, Button, Chip, EmptyState, OfflineBanner } from '@/components/ui';
import { findStyle } from '@/data/catalog';
import { SAMPLE_DATA_NOTE } from '@/lib/copy';
import { useIsOnline } from '@/services/network';
import { useTheme } from '@/theme';
import { CATEGORY_LABEL, type Product, type ProductCategory, type Style } from '@/types';

import {
  CATEGORY_ORDER,
  MATERIAL_LABEL,
  MATERIAL_ORDER,
  displayableProducts,
  materialKeys,
  type MaterialKey,
} from './catalogView';
import { readProductListMemory, writeProductListMemory } from './filterMemory';
import { NotFoundState } from './NotFoundState';
import { ProductRow } from './ProductRow';
import { retryWhileOffline, useFirstLoad } from './useFirstLoad';
import { CATEGORY_ICON } from '@/lib/categoryIcons';

export function StyleProducts({ styleId }: { styleId: string | undefined }) {
  const style = findStyle(styleId);
  if (!style) {
    return (
      <>
        <Stack.Screen options={{ title: 'Món theo phong cách' }} />
        <NotFoundState
          title="Không tìm thấy phong cách này"
          body="Đường dẫn có thể đã cũ. Bạn quay lại Khám phá để chọn phong cách khác."
          actionLabel="Về Khám phá"
          onAction={() => router.dismissTo('/')}
        />
      </>
    );
  }
  return <StyleProductsContent style={style} />;
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}

function StyleProductsContent({ style }: { style: Style }) {
  const t = useTheme();
  const online = useIsOnline();
  const loading = useFirstLoad(`k3:${style.id}`);

  const all = displayableProducts(style.id);
  const categoryOptions = CATEGORY_ORDER.filter((c) => all.some((p) => p.category === c));
  const materialOptions = MATERIAL_ORDER.filter((m) => all.some((p) => materialKeys(p).includes(m)));
  /** Chỉ hiện nhóm chip khi có ít nhất 2 lựa chọn; một lựa chọn thì lọc không có nghĩa. */
  const showCategoryChips = categoryOptions.length >= 2;
  const showMaterialChips = materialOptions.length >= 2;

  const [categories, setCategories] = useState<ProductCategory[]>(() =>
    readProductListMemory(style.id).categories.filter((c) => categoryOptions.includes(c)),
  );
  const [materials, setMaterials] = useState<MaterialKey[]>(() =>
    readProductListMemory(style.id).materials.filter((m) => materialOptions.includes(m)),
  );

  const listRef = useRef<FlatList<Product>>(null);
  /** Vị trí cuộn cần khôi phục khi vào lại K3 (đọc một lần lúc mount). */
  const [initialScrollY] = useState(() => readProductListMemory(style.id).scrollY);
  const scrollRestored = useRef(false);

  const filtered = all.filter(
    (p) =>
      (categories.length === 0 || categories.includes(p.category)) &&
      (materials.length === 0 || materialKeys(p).some((m) => materials.includes(m))),
  );
  const hasFilter = categories.length + materials.length > 0;

  function toggleCategory(c: ProductCategory) {
    const next = toggle(categories, c);
    setCategories(next);
    writeProductListMemory(style.id, { categories: next });
  }

  function toggleMaterial(m: MaterialKey) {
    const next = toggle(materials, m);
    setMaterials(next);
    writeProductListMemory(style.id, { materials: next });
  }

  function clearFilters() {
    setCategories([]);
    setMaterials([]);
    writeProductListMemory(style.id, { categories: [], materials: [] });
  }

  function restoreScroll() {
    if (scrollRestored.current || loading || initialScrollY <= 0) return;
    scrollRestored.current = true;
    listRef.current?.scrollToOffset({ offset: initialScrollY, animated: false });
  }

  const header = (
    <View style={{ gap: t.spacing.md, marginBottom: t.spacing.sm + 4 }}>
      <OfflineBanner
        body="Danh sách đã tải vẫn xem được. Ảnh chưa tải hiện ô trống. Giá hiện là giá lần cập nhật gần nhất."
        onRetry={() => retryWhileOffline(online)}
      />
      {showCategoryChips ? (
        <ChipRow
          label="Loại đồ"
          options={categoryOptions.map((c) => ({ value: c, label: CATEGORY_LABEL[c], icon: CATEGORY_ICON[c] }))}
          selected={categories}
          onToggle={toggleCategory}
        />
      ) : null}
      {showMaterialChips ? (
        <ChipRow
          label="Chất liệu"
          options={materialOptions.map((m) => ({ value: m, label: MATERIAL_LABEL[m] }))}
          selected={materials}
          onToggle={toggleMaterial}
        />
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: t.touchTarget }}>
        <AppText variant="footnote" color="mutedForeground" accessibilityLiveRegion="polite" style={{ flex: 1 }}>
          {hasFilter ? `${filtered.length} trên ${all.length} món` : `${all.length} món`}
        </AppText>
        {/* Lọc không ra món thì màn trống bên dưới đã có "Bỏ lọc", không lặp nút. */}
        {hasFilter && filtered.length > 0 ? <Button variant="plain" label="Bỏ lọc" onPress={clearFilters} /> : null}
      </View>
    </View>
  );

  const empty =
    all.length === 0 ? (
      <EmptyState
        icon={SquaresFour}
        title="Phong cách này tạm chưa có món"
        body="Món đang được cập nhật. Bạn xem phong cách khác trong lúc chờ."
        actionLabel="Xem phong cách khác"
        actionVariant="secondary"
        onAction={() => router.dismissTo('/')}
      />
    ) : (
      <EmptyState
        icon={FunnelSimpleX}
        title="Không có món phù hợp"
        body="Không món nào khớp cả loại đồ và chất liệu đang chọn. Bạn bỏ bớt bộ lọc để xem thêm."
        actionLabel="Bỏ lọc"
        actionVariant="secondary"
        onAction={clearFilters}
      />
    );

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      <Stack.Screen options={{ title: `Món ${style.name}` }} />
      <FlatList
        ref={listRef}
        data={filtered}
        keyExtractor={(p) => p.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: t.spacing.md, paddingBottom: t.spacing.xl }}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ListFooterComponent={
          <AppText variant="caption1" color="mutedForeground" style={{ marginTop: t.spacing.lg }}>
            {SAMPLE_DATA_NOTE}
          </AppText>
        }
        ItemSeparatorComponent={RowSeparator}
        renderItem={({ item }) => (
          <ProductRow
            product={item}
            loading={loading}
            offline={!online}
            onPress={() => router.push({ pathname: '/product/[productId]', params: { productId: item.id } })}
          />
        )}
        scrollEventThrottle={64}
        onScroll={(e) => writeProductListMemory(style.id, { scrollY: e.nativeEvent.contentOffset.y })}
        onContentSizeChange={restoreScroll}
      />
    </View>
  );
}

function RowSeparator() {
  const t = useTheme();
  return <View style={{ height: t.spacing.sm + 4 }} />;
}

function ChipRow<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { value: T; label: string; icon?: PhosphorIcon }[];
  selected: T[];
  onToggle: (value: T) => void;
}) {
  const t = useTheme();
  return (
    <View style={{ gap: t.spacing.xs }}>
      <AppText variant="footnote" color="mutedForeground">
        {label}
      </AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -t.spacing.md }}
        contentContainerStyle={{ gap: t.spacing.sm, paddingHorizontal: t.spacing.md, paddingVertical: t.spacing.xs }}
      >
        {options.map((o) => (
          <Chip key={o.value} label={o.label} icon={o.icon} selected={selected.includes(o.value)} onPress={() => onToggle(o.value)} />
        ))}
      </ScrollView>
    </View>
  );
}
