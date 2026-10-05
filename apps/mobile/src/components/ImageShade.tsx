/**
 * Dải tối phía dưới chữ đặt trên ảnh (MASTER.md · `onImage`): đen 0 → 55% từ trên xuống, phủ phần dưới ảnh.
 * Không bắt sự kiện chạm.
 */
import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { contactShadowColor } from '@/theme/tokens';

export function ImageShade({ fraction = 0.5, maxOpacity = 0.55 }: { fraction?: number; maxOpacity?: number }) {
  const id = `shade-${useId().replace(/:/g, '')}`;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { top: `${(1 - fraction) * 100}%` }]}>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={contactShadowColor} stopOpacity={0} />
            <Stop offset="1" stopColor={contactShadowColor} stopOpacity={maxOpacity} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
