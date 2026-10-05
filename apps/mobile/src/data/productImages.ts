/**
 * Ảnh MẪU của món (ảnh thật đã tách nền, WebP có nền trong) cho bản thử — chưa phải ảnh hay mô hình 3D
 * của nhà cung cấp. Nguồn: Pexels và Unsplash, giấy phép cho dùng tự do; vẫn ghi nguồn ở tab Tôi.
 * Món chưa có ảnh thì dùng hình minh họa SVG (ProductArt).
 */
import type { ImageSourcePropType } from 'react-native';

export type ProductImage = {
  source: ImageSourcePropType;
  /** width / height của ảnh đã cắt sát món. */
  aspect: number;
  credit: string;
};

export const PRODUCT_IMAGES: Partial<Record<string, ProductImage>> = {
  // Ảnh của món 3D (bản thử đặt đồ kiểu IKEA): ảnh dựng của chính mô hình, đã tách nền.
  '3d-ban-tra-tron': {
    source: require('../../assets/products/3d-ban-tra-tron.webp'),
    aspect: 800 / 512,
    credit: 'Ulan Cabanilla, Poly Haven (ảnh dựng từ mô hình 3D, CC0)',
  },
  '3d-ghe-nhung-cam': {
    source: require('../../assets/products/3d-ghe-nhung-cam.webp'),
    aspect: 800 / 592,
    credit: 'Eric Chadwick / Wayfair, Khronos (ảnh dựng từ mô hình 3D, CC0)',
  },
  '3d-den-san-xoan': {
    source: require('../../assets/products/3d-den-san-xoan.webp'),
    aspect: 469 / 800,
    credit: 'DGG, Khronos (ảnh dựng từ mô hình 3D, CC-BY 4.0)',
  },
  'jp-sofa-lanh': {
    source: require('../../assets/products/jp-sofa-lanh.webp'),
    aspect: 800 / 262,
    credit: 'dada _design, Pexels (ảnh dựng 3D)',
  },
  'jp-ban-tra-soi': {
    source: require('../../assets/products/jp-ban-tra-soi.webp'),
    aspect: 800 / 292,
    credit: 'Engin Akyurt, Pexels',
  },
  'jp-den-may': {
    source: require('../../assets/products/jp-den-may.webp'),
    aspect: 230 / 800,
    credit: 'Mila Popova, Pexels',
  },
  'mc-ke-oc-cho': {
    source: require('../../assets/products/mc-ke-oc-cho.webp'),
    aspect: 800 / 368,
    credit: '幻影 多媒体, Pexels (ảnh dựng 3D)',
  },
  'jp-ghe-tan-bi': {
    source: require('../../assets/products/jp-ghe-tan-bi.webp'),
    aspect: 546 / 800,
    credit: 'Cup of Couple, Pexels',
  },
  'mc-sofa-nhung': {
    source: require('../../assets/products/mc-sofa-nhung.webp'),
    aspect: 800 / 307,
    credit: 'Rachel Claire, Pexels',
  },
  'mc-ghe-banh': {
    source: require('../../assets/products/mc-ghe-banh.webp'),
    aspect: 640 / 800,
    credit: 'Ksenia Chernaya, Pexels',
  },
  'mc-den-ban-dong': {
    source: require('../../assets/products/mc-den-ban-dong.webp'),
    aspect: 550 / 800,
    credit: 'Miles Chang, Unsplash',
  },
  'bh-ghe-thep': {
    source: require('../../assets/products/bh-ghe-thep.webp'),
    aspect: 582 / 800,
    credit: 'Skylar Kang, Pexels',
  },
  'bh-ban-tra-kinh': {
    source: require('../../assets/products/bh-ban-tra-kinh.webp'),
    aspect: 800 / 424,
    credit: 'Urban Vintage, Unsplash',
  },
  'bh-ke-thep': {
    source: require('../../assets/products/bh-ke-thep.webp'),
    aspect: 688 / 800,
    credit: 'John Diez, Pexels',
  },
  'bh-den-san-thep': {
    source: require('../../assets/products/bh-den-san-thep.webp'),
    aspect: 680 / 800,
    credit: 'Olena Bohovyk, Pexels',
  },
};

export const PRODUCT_IMAGE_CREDITS_NOTE =
  'Ảnh món lấy từ Pexels và Unsplash, đã tách nền, chỉ để minh họa; không phải hàng của nhà cung cấp.';

export function productImage(productId: string | undefined): ProductImage | undefined {
  return productId ? PRODUCT_IMAGES[productId] : undefined;
}
