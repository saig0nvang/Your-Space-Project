/** Kiểu dữ liệu miền của app. Thuật ngữ theo PRD Phụ lục B. */
import type { MaterialKey } from '@/theme/tokens';

export type StyleId = 'japandi' | 'mid-century' | 'bauhaus';

export type Style = {
  id: StyleId;
  name: string;
  /** Một câu mô tả cho thẻ phong cách. */
  summary: string;
  traits: { colors: string; materials: string; mood: string };
  /** Chất liệu tiêu biểu để vẽ chấm mẫu (MASTER.md · Màu chất liệu). */
  materialKeys: MaterialKey[];
};

export type ProductCategory = 'sofa' | 'table' | 'lamp' | 'shelf' | 'chair';

export const CATEGORY_LABEL: Record<ProductCategory, string> = {
  sofa: 'Sofa',
  table: 'Bàn',
  lamp: 'Đèn',
  shelf: 'Kệ',
  chair: 'Ghế',
};

export type ProductStatus = 'available' | 'out_of_stock' | 'discontinued';

export type Dimensions = { widthCm: number; depthCm: number; heightCm: number };

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  styleId: StyleId;
  supplierId: string;
  priceVND: number;
  dimensions: Dimensions;
  material: string;
  description: string;
  status: ProductStatus;
  needsInstall: boolean;
  /** Màu tô hình minh họa: phần chính (mặt, nệm, chao) và khung / chân. */
  tones: { body: MaterialKey; frame: MaterialKey };
};

export type Supplier = {
  id: string;
  name: string;
  deliveryMinDays: number;
  deliveryMaxDays: number;
  /** Cách liên hệ hiển thị ở chi tiết đơn (dữ liệu mẫu). */
  contactNote: string;
};

/** Một món đã đặt trên ảnh. Toạ độ chuẩn hoá 0..1 theo khung ảnh. */
export type PlacedItem = {
  id: string;
  productId: string;
  x: number;
  y: number;
  /** Chỉ xoay quanh trục Y (D4). */
  rotationYDeg: number;
  scale: number;
  autoAligned: boolean;
  purchased: boolean;
};

/**
 * Vùng đồ cũ đã xóa. Toạ độ chuẩn hoá 0..1. `splitY`: chỗ tường gặp sàn phía sau vật thể (bản thử, đo sẵn với
 * ảnh mẫu) để lớp lấp giả lập lấy tường ở trên, sàn ở dưới; không có thì dùng đường sàn của ảnh.
 */
export type ErasedRegion = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  splitY?: number;
  /** Tên đồ AI nhận ra ("Tủ tivi"); không có với vùng chọn theo điểm chạm. */
  label?: string;
  /** Món AI nhận ra trong ảnh mẫu (bản thử: lấy viền và mảng lấp dựng sẵn của món này). */
  objectId?: string;
};

export type AIMode = 'auto' | 'manual';

/**
 * Máy ảnh khớp ảnh phòng (xem features/editor/roomCamera.ts): tiêu cự theo chiều cao ảnh, tâm quang học (0..1),
 * góc chúc xuống và góc nghiêng (độ). `roomYawDeg`: trục của phòng (hướng các bức tường) lệch bao nhiêu độ so với hướng
 * máy — món mặc định song song với tường như IKEA (thước xoay 0°). `light`: hướng ánh sáng chính (vector tới nguồn sáng).
 */
export type RoomCamera = {
  f: number;
  cx: number;
  cy: number;
  pitchDeg: number;
  rollDeg: number;
  roomYawDeg?: number;
  light?: [number, number, number];
};

export type Calibration = {
  cameraHeightM: number;
  floorConfirmed: boolean;
  /** Vị trí đường chân trời (0..1 theo chiều cao ảnh) khi người dùng tự kéo. */
  horizonY: number | null;
  /** Đường mặt sàn (0..1) app nhận được, dùng để bám món xuống sàn. Là chân tường ở giữa ảnh khi có `wallBase`. */
  floorLineY: number;
  /**
   * Chân tường AI nhận ra, đường gãy khúc theo bề ngang ảnh: các điểm [x 0..1, độ lệch so với `floorLineY`].
   * Lưu độ lệch để "Chỉnh lại mặt sàn" dời cả đường. Không có (chế độ tự đặt, dữ liệu cũ) thì chân tường là đường ngang.
   */
  wallBase?: [number, number][];
  /** Máy ảnh AI đo được từ ảnh (bản thử: số đo sẵn của ảnh mẫu). Không có thì ước lượng từ đường chân trời. */
  camera?: RoomCamera;
};

export type Space = {
  id: string;
  name: string;
  photoUri: string | null;
  photoAspect: number;
  source: 'camera' | 'library';
  styleId: StyleId;
  items: PlacedItem[];
  erasedRegions: ErasedRegion[];
  calibration: Calibration;
  aiMode: AIMode;
  /** Ảnh có được gửi lên để xử lý không (consent ở C3). */
  photoSent: boolean;
  createdAt: number;
  updatedAt: number;
  /** Lần lưu gần nhất vào Phòng của tôi; null = chưa từng lưu. */
  savedAt: number | null;
};

export type OrderStatus = 'paid' | 'shipping' | 'delivered' | 'received' | 'disputed';

export type ComplaintType = 'missing' | 'wrong_item' | 'damaged' | 'wrong_size_material' | 'not_delivered';

export const COMPLAINT_TYPE_LABEL: Record<ComplaintType, string> = {
  missing: 'Giao thiếu',
  wrong_item: 'Sai món',
  damaged: 'Hư hỏng',
  wrong_size_material: 'Sai kích thước hoặc chất liệu',
  not_delivered: 'Không giao',
};

export type ComplaintStatus = 'submitted' | 'supplier_replied' | 'processing' | 'closed';

export type Complaint = {
  id: string;
  productIds: string[];
  type: ComplaintType;
  description: string;
  photoUris: string[];
  status: ComplaintStatus;
  timeline: { status: ComplaintStatus; at: number; note?: string }[];
  messages: { at: number; text: string; photoUris: string[] }[];
  outcome: string | null;
};

export type OrderItem = { productId: string; priceVND: number };

export type Order = {
  id: string;
  paymentId: string;
  supplierId: string;
  spaceId: string | null;
  items: OrderItem[];
  totalVND: number;
  status: OrderStatus;
  timeline: { status: OrderStatus; at: number }[];
  deliveryDate: number;
  previousDeliveryDate: number | null;
  installSlot: string | null;
  address: string;
  recipientName: string;
  phone: string;
  complaint: Complaint | null;
  createdAt: number;
};

export type DeliveryInfo = {
  recipientName: string;
  phone: string;
  address: string;
  /** Khung giờ lắp đặt đã chọn cho từng nhà cung cấp. */
  installSlots: Record<string, string | null>;
};

/**
 * Nơi mở sheet Mua — để mua xong quay về đúng chỗ. Theo PRD §4.2 chỉ mua món đã thử trong không gian
 * (Thiết kế có sẵn sẽ thêm một kiểu nguồn khi vào phạm vi).
 */
export type BuyOrigin = { kind: 'space'; spaceId: string };

