/**
 * Ảnh mở đầu của K1 (MASTER.md · Ảnh dẫn dắt màn): một căn phòng mẫu đã đặt sẵn ba món thật, để người mới
 * thấy ngay app làm gì. Ghi rõ là ví dụ — không phải phòng hay đơn của ai.
 */
import { View, useWindowDimensions } from 'react-native';

import { AppText } from '@/components/ui';
import { samplePhotoRef } from '@/data/samplePhotos';
import { SceneLayers } from '@/features/editor/SceneLayers';
import { useTheme } from '@/theme';
import type { Calibration, PlacedItem } from '@/types';

const PHOTO_ASPECT = 960 / 1280;

const CALIBRATION: Calibration = { cameraHeightM: 1.4, floorConfirmed: true, horizonY: null, floorLineY: 0.62 };

const DEMO_ITEMS: PlacedItem[] = [
  { id: 'demo-lamp', productId: 'jp-den-may', x: 0.14, y: 0.76, rotationYDeg: 0, scale: 1, autoAligned: true, purchased: false },
  { id: 'demo-sofa', productId: 'jp-sofa-lanh', x: 0.46, y: 0.78, rotationYDeg: 0, scale: 1, autoAligned: true, purchased: false },
  { id: 'demo-table', productId: 'jp-ban-tra-soi', x: 0.5, y: 0.88, rotationYDeg: 0, scale: 1, autoAligned: true, purchased: false },
];

export function HeroRoom({ height, topInset = 0 }: { height: number; topInset?: number }) {
  const t = useTheme();
  const window = useWindowDimensions();
  const width = window.width;
  const fullH = width / PHOTO_ASPECT;
  const winH = Math.min(height, fullH);
  // Chân món gần nhất (bàn trà, y 0.88) phải nằm trên mép khối nội dung trồi lên (radius-xl) với khoảng thở.
  const lowestBase = 0.88 * fullH;
  const offset = Math.min(Math.max(lowestBase - (winH - t.radius.xl - t.spacing.lg), 0), fullH - winH);

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Ví dụ: phòng khách sau khi đặt sofa, bàn trà và đèn sàn bằng YourSpace"
      style={{ height: winH, overflow: 'hidden', backgroundColor: t.colors.muted }}
    >
      <View style={{ transform: [{ translateY: -offset }] }}>
        <SceneLayers
          photoUri={samplePhotoRef('phong-khach-sang')}
          items={DEMO_ITEMS}
          erasedRegions={[]}
          calibration={CALIBRATION}
          frame={{ width, height: fullH }}
        />
      </View>
      <View
        style={{
          position: 'absolute',
          left: t.spacing.md,
          top: topInset + t.spacing.sm,
          paddingHorizontal: t.spacing.sm + 2,
          paddingVertical: t.spacing.xs,
          borderRadius: t.radius.pill,
          backgroundColor: t.colors.card,
        }}
      >
        <AppText variant="caption1" weight="600">
          Ví dụ · 3 món đặt vào ảnh phòng
        </AppText>
      </View>
    </View>
  );
}
