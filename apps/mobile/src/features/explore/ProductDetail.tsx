/**
 * K4 — Chi tiết món. docs/screens.md §5 K4; E1-US7. Dùng chung cho hai route:
 * - `tab`: push trong tab Khám phá (từ K2, K3). Nút duy nhất mở luồng chụp với món chờ sẵn trong khay.
 * - `sheet`: sheet trên trình chỉnh sửa (từ khay E1). Nút chính đưa món vào khay của không gian đang mở
 *   rồi đóng sheet. AI không tự đặt món lên ảnh.
 * Không mua thẳng từ trang món: theo PRD §4.2, người dùng mua món đã thử trong phòng.
 */
import { router, Stack } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, OfflineBanner, Price, ScreenScroll, SheetHeader, StatusTag } from '@/components/ui';
import { findProduct, findStyle, getSupplier } from '@/data/catalog';
import { startCapture } from '@/flows';
import { SAMPLE_DATA_NOTE } from '@/lib/copy';
import { formatDeliveryWindow, formatDimensions } from '@/lib/format';
import { useIsOnline } from '@/services/network';
import { useDevFlags } from '@/store/devFlags';
import { useEditorBridge } from '@/store/editorBridge';
import { useTheme } from '@/theme';
import { CATEGORY_LABEL, type Product } from '@/types';

import { isDisplayable } from './catalogView';
import { NotFoundState } from './NotFoundState';
import { ProductViewer } from './ProductViewer';
import { SpecList, type SpecItem } from './SpecList';
import { retryWhileOffline, useFirstLoad } from './useFirstLoad';

export type ProductDetailMode = 'tab' | 'sheet';

export function ProductDetail({ productId, mode }: { productId: string | undefined; mode: ProductDetailMode }) {
  const product = findProduct(productId);
  if (!product || !isDisplayable(product)) {
    return <ProductNotFound mode={mode} />;
  }
  return <ProductDetailContent product={product} mode={mode} />;
}

function ProductNotFound({ mode }: { mode: ProductDetailMode }) {
  const t = useTheme();
  const body = 'Món có thể đã ngừng bán hoặc đường dẫn đã cũ.';
  if (mode === 'sheet') {
    return (
      <View style={{ flex: 1, backgroundColor: t.colors.card }}>
        <SheetHeader title="Chi tiết món" onClose={() => router.back()} />
        <NotFoundState
          surface="card"
          title="Không tìm thấy món này"
          body={`${body} Bạn đóng lại để chọn món khác trong khay.`}
          actionLabel="Đóng"
          onAction={() => router.back()}
        />
      </View>
    );
  }
  return (
    <>
      <Stack.Screen options={{ title: 'Chi tiết món', headerTitle: '' }} />
      <NotFoundState
        title="Không tìm thấy món này"
        body={body}
        actionLabel="Về Khám phá"
        onAction={() => router.dismissTo('/')}
      />
    </>
  );
}

function ProductDetailContent({ product, mode }: { product: Product; mode: ProductDetailMode }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const online = useIsOnline();
  const lowEnd = useDevFlags((s) => s.lowEndDevice);
  const loading = useFirstLoad(`k4:${product.id}`);

  const supplier = getSupplier(product.supplierId);
  const style = findStyle(product.styleId);
  const outOfStock = product.status === 'out_of_stock';
  const isSheet = mode === 'sheet';

  const specs: SpecItem[] = [
    {
      label: 'Nhà cung cấp',
      value: `${supplier.name} · ${formatDeliveryWindow(supplier.deliveryMinDays, supplier.deliveryMaxDays)}`,
    },
    { label: 'Chất liệu', value: product.material },
    { label: 'Kích thước (rộng × sâu × cao)', value: formatDimensions(product.dimensions), tabular: true },
  ];
  if (product.needsInstall) {
    specs.push({ label: 'Lắp đặt', value: 'Cần lắp đặt tại nhà, bạn chọn lịch lắp khi đặt hàng' });
  }

  function tryInRoom() {
    startCapture({ styleId: product.styleId, productId: product.id });
  }

  function placeInOpenSpace() {
    useEditorBridge.getState().requestPlaceProduct(product.id);
    router.back();
  }

  const viewer = (
    <ProductViewer
      product={product}
      height={isSheet ? 200 : 300}
      loading={loading}
      offline={!online}
      lowEnd={lowEnd}
      onRetry={() => retryWhileOffline(online)}
    />
  );

  const summary = (
    <View style={{ gap: t.spacing.xs }}>
      <AppText variant="footnote" color="mutedForeground">
        {[style?.name, CATEGORY_LABEL[product.category]].filter(Boolean).join(' · ')}
      </AppText>
      <AppText variant={isSheet ? 'title2' : 'title1'} accessibilityRole="header">
        {product.name}
      </AppText>
      <Price amount={product.priceVND} variant="title3" color="accentText" />
      {outOfStock ? (
        <View style={{ marginTop: t.spacing.xs }}>
          <StatusTag tone="attention" label="Tạm hết hàng" />
        </View>
      ) : null}
    </View>
  );

  const details: ReactNode = (
    <>
      <AppText variant="body">{product.description}</AppText>
      <SpecList items={specs} />
      <AppText variant="caption1" color="mutedForeground">
        {SAMPLE_DATA_NOTE}
      </AppText>
    </>
  );

  const offlineBanner = <OfflineBanner body="Thông tin và giá vẫn xem được. Giá hiện là giá lần cập nhật gần nhất." />;

  if (isSheet) {
    return (
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: t.colors.card }}>
        <SheetHeader title="Chi tiết món" onClose={() => router.back()} />
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: t.spacing.lg,
            paddingTop: t.spacing.sm,
            paddingBottom: insets.bottom + t.spacing.lg,
            gap: t.spacing.lg,
          }}
        >
          {offlineBanner}
          {viewer}
          {summary}
          {/* Nút chính đặt trong nội dung, ngay dưới giá: sheet mở ở detent 75% nên thanh dính đáy có thể bị khuất. */}
          <Button
            label="Thử trong phòng của bạn"
            fullWidth
            accessibilityHint="Đóng chi tiết và chọn sẵn món này trong khay của không gian đang mở"
            onPress={placeInOpenSpace}
          />
          {details}
        </ScrollView>
      </GestureHandlerRootView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: product.name, headerTitle: '' }} />
      <ScreenScroll
        edges={[]}
        footer={
          <Button
            label="Thử trong phòng của bạn"
            accessibilityHint="Chụp ảnh phòng, món này chờ sẵn trong khay"
            onPress={tryInRoom}
            fullWidth
          />
        }
      >
        {offlineBanner}
        {viewer}
        {summary}
        {details}
      </ScreenScroll>
    </>
  );
}
