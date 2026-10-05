/**
 * K2 — Chi tiết phong cách. docs/screens.md §5 K2; E1-US5 AC2–AC4, CC1–CC3.
 * Hướng A (MASTER.md · Ảnh dẫn dắt màn): ảnh phong cách tràn màn dưới header trong suốt, tên phong cách viết Display
 * trên ảnh, khối nội dung trồi lên đè mép dưới ảnh. Một nút chính "Thử trong phòng của bạn" ở đáy màn;
 * khay đồ trong trình chỉnh sửa mở sẵn phong cách này.
 */
import { router, Stack } from 'expo-router';
import { Camera, Palette, Smiley, SquaresFour, Tree } from 'phosphor-react-native';
import { useWindowDimensions, View } from 'react-native';

import { ImageShade } from '@/components/ImageShade';

import { AppText, Button, EmptyState, OfflineBanner, ScreenScroll, SectionHeader } from '@/components/ui';
import { findStyle } from '@/data/catalog';
import { startCapture } from '@/flows';
import { SAMPLE_DATA_NOTE } from '@/lib/copy';
import { useIsOnline } from '@/services/network';
import { useTheme } from '@/theme';
import type { Style } from '@/types';

import { StylePhotoTile } from './StylePhotoTile';
import { displayableProducts } from './catalogView';
import { NotFoundState } from './NotFoundState';
import { ProductTile } from './ProductTile';
import { SpecList } from './SpecList';
import { retryWhileOffline, useFirstLoad } from './useFirstLoad';

/** Ảnh phong cách chiếm khoảng 55% chiều cao màn. */
const HERO_FRACTION = 0.55;
/** Số món tiêu biểu hiện trong lưới; xem hết ở K3. */
const FEATURED_COUNT = 4;

export function StyleDetail({ styleId }: { styleId: string | undefined }) {
  const style = findStyle(styleId);
  if (!style) {
    return (
      <>
        <Stack.Screen options={{ title: 'Phong cách', headerTitle: '' }} />
        <NotFoundState
          title="Không tìm thấy phong cách này"
          body="Đường dẫn có thể đã cũ. Bạn quay lại Khám phá để chọn phong cách khác."
          actionLabel="Về Khám phá"
          onAction={() => router.dismissTo('/')}
        />
      </>
    );
  }
  return <StyleDetailContent style={style} />;
}

function StyleDetailContent({ style }: { style: Style }) {
  const t = useTheme();
  const online = useIsOnline();
  const loading = useFirstLoad(`k2:${style.id}`);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const heroH = Math.round(windowHeight * HERO_FRACTION);

  const products = displayableProducts(style.id);
  const featured = products.slice(0, FEATURED_COUNT);
  const gridGap = t.spacing.sm + 4;
  const tileWidth = Math.floor((windowWidth - t.spacing.md * 2 - gridGap) / 2);

  return (
    <>
      <Stack.Screen options={{
          title: style.name,
          headerTitle: '',
          headerTransparent: true,
          headerShadowVisible: false,
          // Ghi đè nền của stackScreenOptions: header trong suốt thật, ảnh phong cách tràn lên tận mép trên.
          headerStyle: { backgroundColor: 'transparent' },
        }} />
      <ScreenScroll
        edges={[]}
        contentInsetAdjustmentBehavior="never"
        contentStyle={{ paddingHorizontal: 0, paddingTop: 0, gap: 0 }}
        footer={
          <Button
            label="Thử trong phòng của bạn"
            icon={Camera}
            fullWidth
            accessibilityHint={`Chụp ảnh phòng, phong cách ${style.name} được chọn sẵn`}
            onPress={() => startCapture({ styleId: style.id })}
          />
        }
      >
        <View style={{ height: heroH }}>
          <StylePhotoTile
            styleId={style.id}
            width="100%"
            height={heroH}
            loading={loading}
            offline={!online}
            offlineText="Chưa tải được ảnh phong cách"
            style={{ borderRadius: 0 }}
          />
          {!loading && online ? <ImageShade fraction={0.5} /> : null}
          <View style={{ position: 'absolute', left: 22, right: 22, bottom: t.radius.xl + t.spacing.md }}>
            <AppText variant="display" color={!loading && online ? 'onImage' : 'foreground'} accessibilityRole="header">
              {style.name}
            </AppText>
          </View>
        </View>

        <View
          style={{
            marginTop: -t.radius.xl,
            borderTopLeftRadius: t.radius.xl,
            borderTopRightRadius: t.radius.xl,
            backgroundColor: t.colors.background,
            paddingHorizontal: t.spacing.md,
            paddingTop: t.spacing.lg,
            gap: t.spacing.lg,
          }}
        >
        <OfflineBanner
          body="Phần chữ vẫn xem được. Ảnh cần mạng để tải. Giá hiện là giá lần cập nhật gần nhất."
          onRetry={() => retryWhileOffline(online)}
        />

        <AppText variant="body" style={{ paddingHorizontal: 6 }}>
          {style.summary}
        </AppText>

        <View style={{ gap: t.spacing.sm }}>
          <SectionHeader title="Đặc trưng" />
          <SpecList
            items={[
              { label: 'Màu sắc', value: style.traits.colors, icon: Palette },
              { label: 'Chất liệu', value: style.traits.materials, icon: Tree, swatches: style.materialKeys },
              { label: 'Cảm xúc', value: style.traits.mood, icon: Smiley },
            ]}
          />
        </View>

        <View style={{ gap: t.spacing.md }}>
          <SectionHeader
            title="Món tiêu biểu"
            action={
              products.length > 0 ? (
                <Button
                  variant="link"
                  label="Xem tất cả món"
                  accessibilityHint={`Mở danh sách ${products.length} món ${style.name}, có lọc`}
                  onPress={() =>
                    router.push({ pathname: '/style/[styleId]/products', params: { styleId: style.id } })
                  }
                />
              ) : undefined
            }
          />
          {featured.length === 0 ? (
            <EmptyState
              icon={SquaresFour}
              title="Phong cách này tạm chưa có món"
              body="Món đang được cập nhật. Bạn xem phong cách khác trong lúc chờ."
              actionLabel="Xem phong cách khác"
              actionVariant="secondary"
              onAction={() => router.dismissTo('/')}
            />
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: gridGap }}>
              {featured.map((p) => (
                <ProductTile
                  key={p.id}
                  product={p}
                  width={tileWidth}
                  loading={loading}
                  offline={!online}
                  onPress={() => router.push({ pathname: '/product/[productId]', params: { productId: p.id } })}
                />
              ))}
            </View>
          )}
        </View>

        <AppText variant="caption1" color="mutedForeground">
          {SAMPLE_DATA_NOTE}
        </AppText>
        </View>
      </ScreenScroll>
    </>
  );
}
