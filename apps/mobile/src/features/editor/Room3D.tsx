/**
 * Lớp 3D của cảnh ở trình chỉnh sửa: chuẩn bị dữ liệu thuần (đường dẫn GLB, khung bao) rồi dựng bằng Room3DView — DOM
 * component chạy thẳng trên web, chạy trong WebView nền trong suốt trên máy (kể cả Expo Go). Không nhận chạm: cử chỉ đi
 * thẳng xuống canvas của trình chỉnh sửa bên dưới.
 */
import { Asset } from 'expo-asset';
import { View } from 'react-native';

import { productModel } from '@/data/productModels';
import type { Calibration, PlacedItem } from '@/types';

import Room3DView, { type ModelRef } from './Room3DView';

export function Room3D({
  items,
  frame,
  calibration,
  showGrid = false,
}: {
  /** Chỉ các món có mô hình 3D. */
  items: PlacedItem[];
  frame: { width: number; height: number };
  calibration: Calibration;
  showGrid?: boolean;
}) {
  if (items.length === 0 && !showGrid) return null;
  const models: Record<string, ModelRef> = {};
  for (const it of items) {
    const m = productModel(it.productId);
    if (m && !models[it.productId]) models[it.productId] = { uri: Asset.fromModule(m.source).uri, bounds: m.bounds };
  }
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, width: frame.width, height: frame.height }}>
      <Room3DView
        items={items}
        models={models}
        frame={frame}
        calibration={calibration}
        showGrid={showGrid}
        dom={{
          // react-native-webview: nền trong suốt chắc chắn trên iOS và Android (đặt style trong suốt là đủ).
          useExpoDOMWebView: false,
          style: { width: frame.width, height: frame.height, backgroundColor: 'transparent' },
          containerStyle: { backgroundColor: 'transparent' },
          scrollEnabled: false,
          bounces: false,
          overScrollMode: 'never',
          pointerEvents: 'none',
        }}
      />
    </View>
  );
}
