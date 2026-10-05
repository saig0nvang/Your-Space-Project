/**
 * Chế độ xem 2D (G3, E4-US6 AC3): máy chưa đáp ứng xem 3D thì hiện ảnh tĩnh + danh sách món.
 * Khay đồ, dự toán và nút Mua vẫn dùng được. Cách hiển thị 2D cụ thể chưa chốt (E4-US6 CC3) — đây là bản thử.
 */
import { Cube } from 'phosphor-react-native';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProductThumb } from '@/components/ProductArt';
import { AppText, Banner, Button, OfflineBanner, Price, SectionHeader, StatusTag } from '@/components/ui';
import { findProduct } from '@/data/catalog';
import { useTheme } from '@/theme';
import type { Space } from '@/types';

import { SceneLayers } from './SceneLayers';

export function Editor2D({
  space,
  topBar,
  tray,
  estimateBar,
  onRemoveItem,
}: {
  space: Space;
  topBar: ReactNode;
  tray: ReactNode;
  estimateBar: ReactNode;
  onRemoveItem: (id: string) => void;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const photoW = width - t.spacing.md * 2;
  const frame = { width: photoW, height: photoW / (space.photoAspect || 3 / 4) };

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + t.spacing.xs, paddingBottom: t.spacing.lg, gap: t.spacing.lg }}
      >
        <View style={{ paddingHorizontal: t.spacing.md, gap: t.spacing.md }}>
          {topBar}
          <Banner
            tone="info"
            title="Đang xem 2D vì máy chưa đáp ứng xem 3D"
            body="Món hiện trên ảnh tĩnh. Khay đồ, dự toán và nút Mua vẫn dùng như thường."
          />
          <OfflineBanner body="Dữ liệu trên máy vẫn dùng được. Giá hiện là giá lần cập nhật gần nhất." />
          <View style={{ borderRadius: t.radius.md, overflow: 'hidden', alignSelf: 'center' }}>
            <SceneLayers
              photoUri={space.photoUri}
              items={space.items}
              erasedRegions={space.erasedRegions}
              calibration={space.calibration}
              frame={frame}
              photoLabel={`Ảnh phòng ${space.name}, xem 2D`}
            />
          </View>
        </View>

        <View style={{ paddingHorizontal: t.spacing.md, gap: t.spacing.sm + 4 }}>
          <SectionHeader title="Món trong không gian" detail={`${space.items.length} món`} />
          {space.items.length === 0 ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
              <Cube size={20} color={t.colors.mutedForeground} />
              <AppText variant="callout" color="mutedForeground" style={{ flex: 1 }}>
                Chưa có món nào. Chọn một món ở khay bên dưới để thêm vào không gian.
              </AppText>
            </View>
          ) : (
            <View
              style={{
                backgroundColor: t.colors.card,
                borderRadius: t.radius.md,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: t.colors.border,
              }}
            >
              {space.items.map((it, i) => {
                const p = findProduct(it.productId);
                if (!p) return null;
                return (
                  <View
                    key={it.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: t.spacing.sm + 4,
                      padding: t.spacing.sm + 4,
                      borderBottomWidth: i === space.items.length - 1 ? 0 : StyleSheet.hairlineWidth,
                      borderBottomColor: t.colors.border,
                    }}
                  >
                    <ProductThumb category={p.category} productId={p.id} size={56} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <AppText variant="body" numberOfLines={2}>
                        {p.name}
                      </AppText>
                      <Price amount={p.priceVND} variant="subheadline" color="mutedForeground" />
                      {it.purchased ? <StatusTag tone="done" label="Đã mua" /> : null}
                    </View>
                    <Button variant="destructivePlain" label="Bỏ" onPress={() => onRemoveItem(it.id)} accessibilityHint={`Bỏ ${p.name} khỏi phòng`} />
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={{ gap: t.spacing.sm + 4 }}>
          <View style={{ paddingHorizontal: t.spacing.md }}>
            <SectionHeader title="Thêm món" detail="Chạm một món để thêm vào không gian" />
          </View>
          {tray}
        </View>
      </ScrollView>
      {estimateBar}
    </View>
  );
}
