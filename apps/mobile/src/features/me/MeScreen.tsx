/** T1 — Tôi (E6-US7, E8-US1): đơn hàng, SĐT, dữ liệu cá nhân. Không có nút nền accent. */
import { router, Stack } from 'expo-router';
import { FileText, Flask, Info, Moon, Package, Phone, ShieldCheck } from 'phosphor-react-native';
import { View } from 'react-native';

import { AppText, ListGroup, ListRow, ScreenScroll, showToast } from '@/components/ui';
import { PRODUCT_IMAGE_CREDITS_NOTE, PRODUCT_IMAGES } from '@/data/productImages';
import { PRODUCT_MODELS } from '@/data/productModels';
import { SAMPLE_PHOTO_CREDITS_NOTE, SAMPLE_PHOTOS } from '@/data/samplePhotos';
import { STYLE_PHOTO_CREDITS_NOTE, STYLE_PHOTOS } from '@/data/stylePhotos';
import { PRODUCTS, STYLES } from '@/data/catalog';
import { SAMPLE_DATA_NOTE } from '@/lib/copy';
import { formatPhone } from '@/lib/format';
import { selectOrdersAwaitingConfirmation, useAppStore } from '@/store/appStore';
import { useTheme } from '@/theme';

const APP_VERSION = '0.1.0';

export function MeScreen() {
  const t = useTheme();
  const awaiting = useAppStore(selectOrdersAwaitingConfirmation);
  const orderCount = useAppStore((s) => s.orders.length);
  const verifiedPhone = useAppStore((s) => s.user.verifiedPhone);

  const ordersSubtitle =
    awaiting > 0
      ? `${awaiting} đơn đã giao, chờ bạn xác nhận đã nhận hàng`
      : orderCount > 0
        ? `${orderCount} đơn`
        : undefined;

  return (
    <>
      <Stack.Screen options={{ title: 'Tôi', headerLargeTitleEnabled: true }} />
      <ScreenScroll>
        <ListGroup footer={verifiedPhone ? undefined : 'Xác minh khi bạn thanh toán lần đầu.'}>
          <ListRow
            icon={Package}
            title="Đơn hàng"
            subtitle={ordersSubtitle}
            badge={awaiting > 0 ? awaiting : undefined}
            onPress={() => router.push('/me/orders')}
          />
          <ListRow
            icon={Phone}
            title="Số điện thoại"
            value={verifiedPhone ? formatPhone(verifiedPhone) : 'Chưa xác minh'}
            last
          />
        </ListGroup>

        <ListGroup title="Dữ liệu">
          <ListRow icon={ShieldCheck} title="Quyền riêng tư & dữ liệu" onPress={() => router.push('/me/privacy')} />
          <ListRow
            icon={FileText}
            title="Chính sách quyền riêng tư"
            onPress={() => showToast('Bản thử: chưa có trang chính sách', 'info')}
            last
          />
        </ListGroup>

        <View style={{ gap: t.spacing.sm }}>
          <ListGroup title="Về bản thử">
            <ListRow icon={Moon} title="Giao diện" value="Sáng / tối theo máy" />
            <ListRow icon={Info} title="Phiên bản" value={APP_VERSION} last />
          </ListGroup>
          <View style={{ paddingHorizontal: t.spacing.md, gap: t.spacing.sm }}>
            <AppText variant="footnote" color="mutedForeground">
              {SAMPLE_DATA_NOTE}.
            </AppText>
            <AppText variant="footnote" color="mutedForeground">
              {SAMPLE_PHOTO_CREDITS_NOTE}
            </AppText>
            {SAMPLE_PHOTOS.map((p) => (
              <AppText key={p.id} variant="caption1" color="mutedForeground">
                {p.label}: {p.credit}
              </AppText>
            ))}
            <AppText variant="footnote" color="mutedForeground" style={{ marginTop: t.spacing.sm }}>
              {STYLE_PHOTO_CREDITS_NOTE}
            </AppText>
            {STYLES.map((st) => (
              <AppText key={st.id} variant="caption1" color="mutedForeground">
                {st.name}: {STYLE_PHOTOS[st.id].credit}
              </AppText>
            ))}
            <AppText variant="footnote" color="mutedForeground" style={{ marginTop: t.spacing.sm }}>
              {PRODUCT_IMAGE_CREDITS_NOTE}
            </AppText>
            {PRODUCTS.filter((p) => PRODUCT_IMAGES[p.id]).map((p) => (
              <AppText key={p.id} variant="caption1" color="mutedForeground">
                {p.name}: {PRODUCT_IMAGES[p.id]?.credit}
              </AppText>
            ))}
            {PRODUCTS.filter((p) => PRODUCT_MODELS[p.id]).map((p) => (
              <AppText key={`model-${p.id}`} variant="caption1" color="mutedForeground">
                {p.name}: {PRODUCT_MODELS[p.id]?.credit}
              </AppText>
            ))}
          </View>
        </View>

        {__DEV__ ? (
          <ListGroup title="Dành cho người review">
            <ListRow
              icon={Flask}
              title="Giả lập trạng thái"
              subtitle="Mất mạng, AI tạm ngưng, thanh toán lỗi, dữ liệu mẫu"
              onPress={() => router.push('/me/dev')}
              last
            />
          </ListGroup>
        ) : null}
      </ScreenScroll>
    </>
  );
}
