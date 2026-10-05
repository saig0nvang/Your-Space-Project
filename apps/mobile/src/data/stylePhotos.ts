/**
 * Ảnh minh họa PHONG CÁCH (ảnh tâm trạng, không phải món đang bán) — lấy từ Pexels và Unsplash,
 * giấy phép cho dùng tự do, đã thu nhỏ. Nguồn hiện ở tab Tôi. Thay bằng ảnh do YourSpace dựng khi có.
 */
import type { ImageSourcePropType } from 'react-native';

import type { StyleId } from '@/types';

export type StylePhoto = {
  source: ImageSourcePropType;
  /** width / height */
  aspect: number;
  /** Mô tả ảnh cho trình đọc màn hình. */
  description: string;
  credit: string;
};

export const STYLE_PHOTOS: Record<StyleId, StylePhoto> = {
  japandi: {
    source: require('../../assets/styles/japandi.jpg'),
    aspect: 1024 / 1280,
    description: 'Phòng khách sáng, kệ lưới gỗ sồi sáng làm vách ngăn, sofa màu be, nhiều ánh sáng tự nhiên',
    credit: 'Puscas Adryan, Unsplash (ảnh dựng 3D)',
  },
  'mid-century': {
    source: require('../../assets/styles/mid-century.jpg'),
    aspect: 1280 / 853,
    description: 'Phòng khách trần gỗ, ghế lounge da và gỗ óc chó, sofa cam, thảm hoạ tiết đen trắng',
    credit: 'Stephen Leonardi, Pexels',
  },
  bauhaus: {
    source: require('../../assets/styles/bauhaus.jpg'),
    aspect: 855 / 1280,
    description: 'Ghế khung thép uốn bọc da đen cạnh khung cửa sổ lớn, tường trắng, bóng nắng trên sàn',
    credit: 'Ksenia Chernaya, Pexels',
  },
};

export const STYLE_PHOTO_CREDITS_NOTE = 'Ảnh phong cách lấy từ Pexels và Unsplash để minh họa tâm trạng phong cách, không phải món đang bán.';
