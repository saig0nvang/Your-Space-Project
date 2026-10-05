/**
 * Khối "xem 3D" GIẢ LẬP của K4: bản thử chưa có mô hình 3D, nên xoay hình minh họa quanh trục đứng (trục Y)
 * bằng perspective + rotateY. Chỉ xoay quanh trục Y (D4). Xoay bằng kéo ngang (E1-US7 AC1) hoặc hai nút
 * (thay thế một chạm cho thao tác kéo), hoặc vuốt lên / xuống với VoiceOver (vai trò adjustable).
 *
 * Trạng thái: đang tải → khung xương đúng kích thước khối; mất mạng (G1) → báo ở khung + "Thử lại";
 * máy yếu (G3) → ảnh 2D, ghi rõ "Đang xem ảnh 2D".
 */
import { ArrowClockwise, ArrowCounterClockwise, ImageSquare, WifiSlash } from 'phosphor-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { ProductArt } from '@/components/ProductArt';
import { productImage } from '@/data/productImages';
import { AppText, Button, IconButton, Skeleton, StatusTag } from '@/components/ui';
import { useTheme } from '@/theme';
import type { Product } from '@/types';

/** Hình minh họa phẳng: quá ±60° thì gần như thành một vạch, nên giới hạn góc. */
const MAX_DEG = 60;
const STEP_DEG = 30;
/** Độ xoay cho mỗi điểm kéo ngang. */
const DEG_PER_PT = 0.45;
const PERSPECTIVE = 700;

function clampDeg(v: number): number {
  'worklet';
  return Math.max(-MAX_DEG, Math.min(MAX_DEG, v));
}

export function ProductViewer({
  product,
  height,
  loading,
  offline,
  lowEnd,
  onRetry,
}: {
  product: Product;
  height: number;
  loading: boolean;
  offline: boolean;
  lowEnd: boolean;
  onRetry: () => void;
}) {
  const t = useTheme();

  if (loading) {
    return (
      <View style={{ gap: t.spacing.sm }} accessible accessibilityLabel="Đang tải hình xem món" accessibilityState={{ busy: true }}>
        <Skeleton width="100%" height={height} radius={t.radius.md} />
        <Skeleton width="60%" height={16} />
      </View>
    );
  }

  if (offline) {
    return (
      <View
        style={{
          height,
          borderRadius: t.radius.md,
          backgroundColor: t.colors.muted,
          alignItems: 'center',
          justifyContent: 'center',
          gap: t.spacing.sm,
          paddingHorizontal: t.spacing.lg,
        }}
      >
        <WifiSlash size={28} color={t.colors.foreground} />
        <AppText variant="subheadline" weight="600" align="center">
          Chưa tải được hình xem 3D
        </AppText>
        <AppText variant="footnote" color="mutedForeground" align="center">
          Cần kết nối mạng để tải. Thông tin và giá bên dưới vẫn xem được.
        </AppText>
        <Button variant="secondary" label="Thử lại" onPress={onRetry} />
      </View>
    );
  }

  if (lowEnd) {
    return (
      <View style={{ gap: t.spacing.sm }}>
        <View
          accessible
          accessibilityRole="image"
          accessibilityLabel={`Ảnh 2D của ${product.name}`}
          style={{
            height,
            borderRadius: t.radius.md,
            backgroundColor: t.colors.muted,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ProductArt category={product.category} productId={product.id} size={Math.min(height - t.spacing.xl, 220)} />
        </View>
        <StatusTag tone="neutral" icon={ImageSquare} label="Đang xem ảnh 2D" />
        <AppText variant="footnote" color="mutedForeground">
          Máy đang ở chế độ nhẹ nên chưa xoay được mô hình. Bạn vẫn thử món này trong phòng được.
        </AppText>
      </View>
    );
  }

  // Món có ảnh mẫu: ảnh phẳng không xoay được như mô hình 3D, nên hiện ảnh đứng yên và nói rõ.
  if (productImage(product.id)) return <ProductPhoto product={product} height={height} />;

  return <RotatableArt product={product} height={height} />;
}

function ProductPhoto({ product, height }: { product: Product; height: number }) {
  const t = useTheme();
  return (
    <View style={{ gap: t.spacing.sm }}>
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Ảnh ${product.name}`}
        style={{
          height,
          borderRadius: t.radius.md,
          backgroundColor: t.colors.muted,
          alignItems: 'center',
          justifyContent: 'center',
          padding: t.spacing.lg,
        }}
      >
        <ProductArt category={product.category} productId={product.id} size={Math.min(height - t.spacing.lg * 2, 320)} />
      </View>
      <AppText variant="footnote" color="mutedForeground">
        Ảnh mẫu của bản thử. Khi có mô hình 3D của nhà cung cấp, bạn xoay được món ở đây.
      </AppText>
    </View>
  );
}

function RotatableArt({ product, height }: { product: Product; height: number }) {
  const t = useTheme();
  const reduceMotion = useReducedMotion();
  const [angle, setAngle] = useState(0);
  const rotation = useSharedValue(0);
  const dragStart = useSharedValue(0);

  function rotateTo(next: number) {
    const clamped = clampDeg(next);
    setAngle(clamped);
    rotation.set(reduceMotion ? clamped : withTiming(clamped, { duration: t.motion.base }));
  }

  const pan = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .failOffsetY([-12, 12])
    .onBegin(() => {
      'worklet';
      dragStart.set(rotation.get());
    })
    .onUpdate((e) => {
      'worklet';
      rotation.set(clampDeg(dragStart.get() + e.translationX * DEG_PER_PT));
    })
    .onEnd(() => {
      'worklet';
      scheduleOnRN(setAngle, Math.round(rotation.get()));
    });

  const artStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: PERSPECTIVE }, { rotateY: `${rotation.get()}deg` }],
  }));

  const artSize = Math.min(height - t.touchTarget - t.spacing.xl, 220);

  return (
    <View style={{ gap: t.spacing.sm }}>
      <View style={{ height, borderRadius: t.radius.md, backgroundColor: t.colors.muted, overflow: 'hidden' }}>
        <GestureDetector gesture={pan}>
          <View
            accessible
            accessibilityRole="adjustable"
            accessibilityLabel={`Hình minh họa ${product.name}`}
            accessibilityValue={{ text: `xoay ${angle} độ` }}
            accessibilityHint="Vuốt lên hoặc xuống để xoay quanh trục đứng"
            accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
            onAccessibilityAction={(e) => rotateTo(angle + (e.nativeEvent.actionName === 'increment' ? STEP_DEG : -STEP_DEG))}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <Animated.View style={artStyle}>
              <ProductArt category={product.category} productId={product.id} size={artSize} />
            </Animated.View>
          </View>
        </GestureDetector>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: t.spacing.sm,
            paddingHorizontal: t.spacing.sm,
            paddingBottom: t.spacing.sm,
          }}
        >
          <IconButton
            icon={ArrowCounterClockwise}
            variant="floating"
            accessibilityLabel="Xoay sang trái"
            disabled={angle <= -MAX_DEG}
            onPress={() => rotateTo(angle - STEP_DEG)}
          />
          <View style={{ flex: 1, alignItems: 'center' }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <AppText variant="footnote" weight="600" align="center">
              Xoay quanh trục đứng
            </AppText>
            <AppText variant="caption1" color="mutedForeground" tabular>
              {angle}°
            </AppText>
          </View>
          <IconButton
            icon={ArrowClockwise}
            variant="floating"
            accessibilityLabel="Xoay sang phải"
            disabled={angle >= MAX_DEG}
            onPress={() => rotateTo(angle + STEP_DEG)}
          />
        </View>
      </View>
      <AppText variant="caption1" color="mutedForeground">
        Hình minh họa, bản thử chưa có mô hình 3D. Kéo ngang trên hình để xoay.
      </AppText>
    </View>
  );
}
