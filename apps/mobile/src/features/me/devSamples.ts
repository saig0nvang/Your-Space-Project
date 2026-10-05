/**
 * Dữ liệu mẫu CHỈ cho bản dev: thêm không gian và đơn hàng để review Phòng của tôi và Đơn hàng
 * mà không phải đi hết luồng chụp và thanh toán. Mọi thứ ở đây là dữ liệu mẫu.
 */
import { findProduct } from '@/data/catalog';
import { SAMPLE_PHOTOS, samplePhotoRef } from '@/data/samplePhotos';
import { localId } from '@/lib/id';
import { createOrdersForPayment } from '@/services/orders';
import { useAppStore } from '@/store/appStore';
import type { PlacedItem, Space } from '@/types';

function placed(productId: string, x: number, y: number, purchased = false): PlacedItem {
  return { id: localId('item'), productId, x, y, rotationYDeg: 0, scale: 1, autoAligned: true, purchased };
}

/** Thêm một không gian đã lưu dùng ảnh phòng mẫu. `broken`: tham chiếu ảnh hỏng để xem thẻ lỗi. */
export function addSampleSpace({ broken = false }: { broken?: boolean } = {}): void {
  const store = useAppStore.getState();
  const n = store.spaces.length;
  const photo = SAMPLE_PHOTOS[n % SAMPLE_PHOTOS.length];
  const now = Date.now();
  const withPurchase = n % 2 === 1;
  const space: Space = {
    id: localId('space'),
    name: broken ? 'Phòng ngủ (ảnh đã mất)' : photo.label,
    photoUri: broken ? samplePhotoRef('anh-da-xoa') : samplePhotoRef(photo.id),
    photoAspect: photo.aspect,
    source: 'library',
    styleId: 'japandi',
    items: [
      placed('jp-sofa-lanh', 0.5, 0.8, withPurchase),
      placed('jp-ban-tra-soi', 0.42, 0.92),
      placed('jp-den-may', 0.16, 0.74),
    ],
    erasedRegions: [],
    calibration: { cameraHeightM: 1.4, floorConfirmed: true, horizonY: null, floorLineY: 0.6 },
    aiMode: 'auto',
    photoSent: true,
    createdAt: now,
    updatedAt: now,
    savedAt: now - n * 26 * 60 * 60 * 1000,
  };
  store.addSpace(space);
}

/** Thêm một lần thanh toán mẫu tách thành 2 đơn (2 nhà cung cấp); một đơn ở bước "đã giao". */
export function addSampleOrders(): void {
  const store = useAppStore.getState();
  const lines = ['jp-sofa-lanh', 'mc-ke-oc-cho', 'jp-den-may'].map((productId) => ({
    productId,
    priceVND: findProduct(productId)?.priceVND ?? 0,
  }));
  const orders = createOrdersForPayment({
    paymentId: localId('pay'),
    spaceId: null,
    lines,
    delivery: {
      recipientName: store.user.recipientName || 'Người nhận mẫu',
      phone: store.user.verifiedPhone ?? '0912345678',
      address: store.user.address || '12 Đường Mẫu, Phường Mẫu, TP. Hồ Chí Minh (địa chỉ mẫu)',
      installSlots: { 'sup-a': 'Buổi sáng 8:00–12:00, ngày giao (lịch mẫu)' },
    },
    productSupplier: (id) => findProduct(id)?.supplierId ?? 'sup-a',
  });
  store.addOrders(orders);
  const first = orders[0];
  if (first) {
    store.setOrderStatus(first.id, 'shipping');
    store.setOrderStatus(first.id, 'delivered');
  }
}
