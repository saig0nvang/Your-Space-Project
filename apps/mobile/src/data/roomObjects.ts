/**
 * Đồ có sẵn trong ba ảnh phòng mẫu, giả lập kết quả nhận diện của công cụ Xóa đồ cũ (bản thử).
 * Tách bằng SAM (Segment Anything) rồi dựng sẵn nét viền bám dáng (`outline`) và mảng lấp inpainting LaMa (`patch`).
 * Toạ độ chuẩn hoá theo ảnh phòng. FILE SINH TỰ ĐỘNG bởi scripts/sample-objects/build.py — không sửa tay.
 */
import type { SampleObject } from './samplePhotos';

export const ROOM_OBJECTS: Record<string, SampleObject[]> = {
  'phong-khach-sang': [
    {
      id: 'tu-tivi',
      label: 'Tủ tivi',
      x: 0.5719, y: 0.5711, w: 0.2687, h: 0.1359,
      outline: { source: require('../../assets/rooms/objects/phong-khach-sang__tu-tivi__outline.png'), x: 0.5667, y: 0.5672, w: 0.2792, h: 0.1437 },
      patch: { source: require('../../assets/rooms/objects/phong-khach-sang__tu-tivi__patch.webp'), x: 0.5385, y: 0.5461, w: 0.3354, h: 0.2156 },
    },
    {
      id: 'may-suoi',
      label: 'Máy sưởi',
      x: 0.399, y: 0.557, w: 0.1375, h: 0.0703,
      outline: { source: require('../../assets/rooms/objects/phong-khach-sang__may-suoi__outline.png'), x: 0.3937, y: 0.5531, w: 0.1479, h: 0.0781 },
      patch: { source: require('../../assets/rooms/objects/phong-khach-sang__may-suoi__patch.webp'), x: 0.3656, y: 0.532, w: 0.2042, h: 0.1203 },
    },
    {
      id: 'den-tha',
      label: 'Đèn thả',
      x: 0.1208, y: 0.1211, w: 0.049, h: 0.2609,
      outline: { source: require('../../assets/rooms/objects/phong-khach-sang__den-tha__outline.png'), x: 0.1156, y: 0.1172, w: 0.0594, h: 0.2687 },
      patch: { source: require('../../assets/rooms/objects/phong-khach-sang__den-tha__patch.webp'), x: 0.0875, y: 0.0961, w: 0.1156, h: 0.3109 },
    },
    {
      id: 'den-roi-1',
      label: 'Đèn rọi',
      x: 0.7479, y: 0.1125, w: 0.0344, h: 0.043,
      outline: { source: require('../../assets/rooms/objects/phong-khach-sang__den-roi-1__outline.png'), x: 0.7427, y: 0.1086, w: 0.0448, h: 0.0508 },
      patch: { source: require('../../assets/rooms/objects/phong-khach-sang__den-roi-1__patch.webp'), x: 0.7146, y: 0.0875, w: 0.101, h: 0.093 },
    },
    {
      id: 'den-roi-2',
      label: 'Đèn rọi',
      x: 0.6083, y: 0.2133, w: 0.0365, h: 0.0414,
      outline: { source: require('../../assets/rooms/objects/phong-khach-sang__den-roi-2__outline.png'), x: 0.6031, y: 0.2094, w: 0.0469, h: 0.0492 },
      patch: { source: require('../../assets/rooms/objects/phong-khach-sang__den-roi-2__patch.webp'), x: 0.575, y: 0.1883, w: 0.1031, h: 0.0914 },
    },
    {
      id: 'den-roi-3',
      label: 'Đèn rọi',
      x: 0.5115, y: 0.2836, w: 0.024, h: 0.0266,
      outline: { source: require('../../assets/rooms/objects/phong-khach-sang__den-roi-3__outline.png'), x: 0.5062, y: 0.2797, w: 0.0344, h: 0.0344 },
      patch: { source: require('../../assets/rooms/objects/phong-khach-sang__den-roi-3__patch.webp'), x: 0.4781, y: 0.2586, w: 0.0906, h: 0.0766 },
    },
    {
      id: 'o-dien-1',
      label: 'Ổ điện',
      x: 0.0542, y: 0.5422, w: 0.0469, h: 0.0164,
      outline: { source: require('../../assets/rooms/objects/phong-khach-sang__o-dien-1__outline.png'), x: 0.049, y: 0.5383, w: 0.0573, h: 0.0242 },
      patch: { source: require('../../assets/rooms/objects/phong-khach-sang__o-dien-1__patch.webp'), x: 0.0208, y: 0.5172, w: 0.1135, h: 0.0664 },
    },
    {
      id: 'o-dien-2',
      label: 'Ổ điện',
      x: 0.7042, y: 0.5367, w: 0.0479, h: 0.0164,
      outline: { source: require('../../assets/rooms/objects/phong-khach-sang__o-dien-2__outline.png'), x: 0.699, y: 0.5328, w: 0.0583, h: 0.0242 },
      patch: { source: require('../../assets/rooms/objects/phong-khach-sang__o-dien-2__patch.webp'), x: 0.6708, y: 0.5117, w: 0.1146, h: 0.0664 },
    },
    {
      id: 'o-dien-3',
      label: 'Ổ điện',
      x: 0.0, y: 0.6336, w: 0.024, h: 0.0164,
      outline: { source: require('../../assets/rooms/objects/phong-khach-sang__o-dien-3__outline.png'), x: 0.0, y: 0.6297, w: 0.0292, h: 0.0242 },
      patch: { source: require('../../assets/rooms/objects/phong-khach-sang__o-dien-3__patch.webp'), x: 0.0, y: 0.6086, w: 0.0573, h: 0.0664 },
    },
  ],
  'phong-khach-ke-tivi': [
    {
      id: 'ban-tron',
      label: 'Bàn tròn',
      x: 0.0177, y: 0.6008, w: 0.3354, h: 0.1922,
      outline: { source: require('../../assets/rooms/objects/phong-khach-ke-tivi__ban-tron__outline.png'), x: 0.0125, y: 0.5969, w: 0.3458, h: 0.2 },
      patch: { source: require('../../assets/rooms/objects/phong-khach-ke-tivi__ban-tron__patch.webp'), x: 0.0, y: 0.5758, w: 0.3865, h: 0.2719 },
    },
    {
      id: 'tivi',
      label: 'Tivi',
      x: 0.7312, y: 0.3344, w: 0.2562, h: 0.2422,
      outline: { source: require('../../assets/rooms/objects/phong-khach-ke-tivi__tivi__outline.png'), x: 0.726, y: 0.3305, w: 0.2667, h: 0.25 },
      patch: { source: require('../../assets/rooms/objects/phong-khach-ke-tivi__tivi__patch.webp'), x: 0.6979, y: 0.3094, w: 0.3021, h: 0.2922 },
    },
    {
      id: 'ke-tivi',
      label: 'Kệ tivi',
      x: 0.6396, y: 0.5602, w: 0.3604, h: 0.2492,
      outline: { source: require('../../assets/rooms/objects/phong-khach-ke-tivi__ke-tivi__outline.png'), x: 0.6344, y: 0.5563, w: 0.3656, h: 0.257 },
      patch: { source: require('../../assets/rooms/objects/phong-khach-ke-tivi__ke-tivi__patch.webp'), x: 0.6062, y: 0.5352, w: 0.3937, h: 0.3187 },
    },
    {
      id: 'den-tran',
      label: 'Đèn trần',
      x: 0.2812, y: 0.0219, w: 0.0552, h: 0.025,
      outline: { source: require('../../assets/rooms/objects/phong-khach-ke-tivi__den-tran__outline.png'), x: 0.276, y: 0.018, w: 0.0656, h: 0.0328 },
      patch: { source: require('../../assets/rooms/objects/phong-khach-ke-tivi__den-tran__patch.webp'), x: 0.2479, y: 0.0, w: 0.1219, h: 0.0719 },
    },
  ],
  'phong-khach-san-gach': [
    {
      id: 'sofa',
      label: 'Sofa',
      x: 0.2458, y: 0.5547, w: 0.4135, h: 0.207,
      outline: { source: require('../../assets/rooms/objects/phong-khach-san-gach__sofa__outline.png'), x: 0.2406, y: 0.5508, w: 0.424, h: 0.2148 },
      patch: { source: require('../../assets/rooms/objects/phong-khach-san-gach__sofa__patch.webp'), x: 0.2125, y: 0.5297, w: 0.4802, h: 0.2969 },
    },
    {
      id: 'ban-tra',
      label: 'Bàn trà',
      x: 0.574, y: 0.657, w: 0.2313, h: 0.1023,
      outline: { source: require('../../assets/rooms/objects/phong-khach-san-gach__ban-tra__outline.png'), x: 0.5687, y: 0.6531, w: 0.2417, h: 0.1102 },
      patch: { source: require('../../assets/rooms/objects/phong-khach-san-gach__ban-tra__patch.webp'), x: 0.5406, y: 0.632, w: 0.2979, h: 0.182 },
    },
    {
      id: 'ke-go',
      label: 'Kệ gỗ',
      x: 0.9469, y: 0.6086, w: 0.0531, h: 0.157,
      outline: { source: require('../../assets/rooms/objects/phong-khach-san-gach__ke-go__outline.png'), x: 0.9417, y: 0.6047, w: 0.0583, h: 0.1648 },
      patch: { source: require('../../assets/rooms/objects/phong-khach-san-gach__ke-go__patch.webp'), x: 0.9135, y: 0.5836, w: 0.0865, h: 0.2266 },
    },
    {
      id: 'den-tran-1',
      label: 'Đèn trần',
      x: 0.9323, y: 0.0406, w: 0.049, h: 0.0234,
      outline: { source: require('../../assets/rooms/objects/phong-khach-san-gach__den-tran-1__outline.png'), x: 0.9271, y: 0.0367, w: 0.0594, h: 0.0312 },
      patch: { source: require('../../assets/rooms/objects/phong-khach-san-gach__den-tran-1__patch.webp'), x: 0.899, y: 0.0156, w: 0.101, h: 0.0734 },
    },
    {
      id: 'den-tran-2',
      label: 'Đèn trần',
      x: 0.35, y: 0.1984, w: 0.0292, h: 0.0141,
      outline: { source: require('../../assets/rooms/objects/phong-khach-san-gach__den-tran-2__outline.png'), x: 0.3448, y: 0.1945, w: 0.0396, h: 0.0219 },
      patch: { source: require('../../assets/rooms/objects/phong-khach-san-gach__den-tran-2__patch.webp'), x: 0.3167, y: 0.1734, w: 0.0958, h: 0.0641 },
    },
    {
      id: 'den-tran-3',
      label: 'Đèn trần',
      x: 0.5385, y: 0.2781, w: 0.024, h: 0.0102,
      outline: { source: require('../../assets/rooms/objects/phong-khach-san-gach__den-tran-3__outline.png'), x: 0.5333, y: 0.2742, w: 0.0344, h: 0.018 },
      patch: { source: require('../../assets/rooms/objects/phong-khach-san-gach__den-tran-3__patch.webp'), x: 0.5052, y: 0.2531, w: 0.0906, h: 0.0602 },
    },
    {
      id: 'bao-khoi',
      label: 'Đầu báo khói',
      x: 0.575, y: 0.057, w: 0.0354, h: 0.0242,
      outline: { source: require('../../assets/rooms/objects/phong-khach-san-gach__bao-khoi__outline.png'), x: 0.5698, y: 0.0531, w: 0.0458, h: 0.032 },
      patch: { source: require('../../assets/rooms/objects/phong-khach-san-gach__bao-khoi__patch.webp'), x: 0.5417, y: 0.032, w: 0.1021, h: 0.0742 },
    },
    {
      id: 'o-dien',
      label: 'Ổ điện',
      x: 0.1479, y: 0.6641, w: 0.0208, h: 0.0297,
      outline: { source: require('../../assets/rooms/objects/phong-khach-san-gach__o-dien__outline.png'), x: 0.1427, y: 0.6602, w: 0.0312, h: 0.0375 },
      patch: { source: require('../../assets/rooms/objects/phong-khach-san-gach__o-dien__patch.webp'), x: 0.1146, y: 0.6391, w: 0.0875, h: 0.0797 },
    },
  ],
};
