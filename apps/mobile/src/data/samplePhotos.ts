/**
 * Ảnh phòng MẪU cho prototype: camera và thư viện ảnh đều giả lập bằng các ảnh này
 * (iOS Simulator không có camera). Ảnh từ Pexels, đã cắt khổ dọc 3:4; nguồn bên dưới.
 */
import type { ImageSourcePropType } from 'react-native';

import type { RoomCamera } from '@/types';

import { ROOM_OBJECTS } from './roomObjects';

/** Khung trên ảnh, toạ độ chuẩn hoá 0..1. */
export type ImageBox = { x: number; y: number; w: number; h: number };

/**
 * Đồ có sẵn trong ảnh mẫu, giả lập kết quả nhận diện của công cụ Xóa đồ cũ. Tách bằng SAM (mask theo khung), từ mask
 * dựng sẵn nét viền bám dáng và mảng lấp (inpainting) — xem data/roomObjects.ts. Khung x/y/w/h là khung bao của mask.
 */
export type SampleObject = ImageBox & {
  id: string;
  label: string;
  /** Nét viền bám dáng: lõi trắng `onImage`, mép tối mảnh; nền trong. */
  outline: ImageBox & { source: ImageSourcePropType };
  /** Mảng ảnh đã lấp chỗ món, mép mờ dần để hòa vào ảnh. */
  patch: ImageBox & { source: ImageSourcePropType };
};

export type SamplePhoto = {
  id: string;
  label: string;
  source: ImageSourcePropType;
  /** width / height */
  aspect: number;
  credit: string;
  objects: SampleObject[];
  /**
   * Chân tường (chỗ sàn gặp tường) theo bề ngang ảnh, các điểm [x, y] 0..1 — giả lập kết quả hiểu phòng của AI.
   * Lần theo mask sàn tách bằng SAM; đoạn bị đồ che thì nối thẳng theo phần nhìn thấy (scripts/sample-objects).
   */
  wallBase: [number, number][];
  /**
   * Máy ảnh đo từ điểm tụ của các đường thẳng trong ảnh (giả lập kết quả hiểu phòng của AI) và độ cao máy (m), suy từ
   * kích thước đồ quen thuộc trong ảnh (cửa đi ~2,1 m). Ảnh có kệ tivi được cắt lệch tâm nên tâm quang học lệch trái.
   */
  camera: RoomCamera & { heightM: number };
};

export const SAMPLE_PHOTOS: SamplePhoto[] = [
  {
    id: 'phong-khach-sang',
    label: 'Phòng khách sáng',
    source: require('../../assets/rooms/phong-khach-sang.jpg'),
    aspect: 960 / 1280,
    credit: 'Max Vakhtbovych, Pexels',
    objects: ROOM_OBJECTS['phong-khach-sang'],
    wallBase: [
      [0, 0.688],
      [0.545, 0.628],
      [1, 0.724],
    ],
    // Hai điểm tụ ngang (1580, 634) và (−75, 638) trên ảnh 960 × 1280, cạnh đứng song song: máy để ngang, f ≈ 781 px.
    // Hai tường lệch 54,6° và −35,4° so với hướng máy (máy nhìn chéo vào góc tường): trục phòng xoay 35,4°.
    camera: { f: 0.61, cx: 0.5, cy: 0.497, pitchDeg: 0, rollDeg: 0, roomYawDeg: 35.4, heightM: 1.15, light: [-4, 5, -3] },
  },
  {
    id: 'phong-khach-ke-tivi',
    label: 'Phòng khách có kệ tivi',
    source: require('../../assets/rooms/phong-khach-ke-tivi.jpg'),
    aspect: 960 / 1280,
    credit: 'Nguyễn Thị Minh Nghi, Pexels',
    objects: ROOM_OBJECTS['phong-khach-ke-tivi'],
    wallBase: [
      [0, 0.69],
      [0.06, 0.675],
      [0.635, 0.673],
      [1, 0.765],
    ],
    // Phối cảnh một điểm tụ (261, 640): tâm quang học lệch trái do cắt khổ dọc; tiêu cự ước lượng (chưa đo được).
    camera: { f: 0.66, cx: 0.272, cy: 0.5, pitchDeg: 0, rollDeg: 0, roomYawDeg: 0, heightM: 1.2, light: [-1, 5, -5] },
  },
  {
    id: 'phong-khach-san-gach',
    label: 'Phòng khách sàn gạch',
    source: require('../../assets/rooms/phong-khach-san-gach.jpg'),
    aspect: 960 / 1280,
    credit: 'Thới Nam Cao, Pexels',
    objects: ROOM_OBJECTS['phong-khach-san-gach'],
    wallBase: [
      [0, 0.79],
      [0.32, 0.718],
      [0.6, 0.708],
      [1, 0.695],
    ],
    // Hai điểm tụ ngang (−816, 660) và (1073, 661), cạnh đứng song song: máy để ngang, f ≈ 876 px; độ cao ước lượng.
    // Hai tường lệch −55,9° và 34,1° so với hướng máy: trục phòng xoay −34,1°.
    camera: { f: 0.684, cx: 0.5, cy: 0.516, pitchDeg: 0, rollDeg: 0, roomYawDeg: -34.1, heightM: 1.2, light: [4, 5, -2] },
  },
];

const SAMPLE_PREFIX = 'sample:';

/** Tham chiếu ảnh lưu trong Space.photoUri cho ảnh mẫu. */
export function samplePhotoRef(id: string): string {
  return `${SAMPLE_PREFIX}${id}`;
}

export function findSamplePhoto(ref: string | null | undefined): SamplePhoto | undefined {
  if (!ref?.startsWith(SAMPLE_PREFIX)) return undefined;
  return SAMPLE_PHOTOS.find((p) => p.id === ref.slice(SAMPLE_PREFIX.length));
}

/** Nguồn ảnh để hiển thị cho một Space.photoUri (ảnh mẫu hoặc uri thật). */
export function photoSource(ref: string | null | undefined): ImageSourcePropType | undefined {
  if (!ref) return undefined;
  if (ref.startsWith(SAMPLE_PREFIX)) return findSamplePhoto(ref)?.source;
  return { uri: ref };
}

export const SAMPLE_PHOTO_CREDITS_NOTE = 'Ảnh phòng mẫu lấy từ Pexels, đã cắt lại khổ dọc.';
