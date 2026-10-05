/**
 * Ảnh phòng trong luồng chụp: hiển thị đúng ảnh gốc (không phủ màu theme — MASTER.md · Quy tắc dùng màu),
 * khung đo theo tỉ lệ ảnh để lớp phủ (vạch quét, vùng sàn, đường chân trời) khớp toạ độ 0..1 của ảnh.
 */
import { Image } from 'expo-image';
import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import { useState, type ReactNode } from 'react';
import { StyleSheet, View, useWindowDimensions, type ViewStyle } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { AppText } from '@/components/ui';
import { findSamplePhoto, photoSource } from '@/data/samplePhotos';
import { useTheme } from '@/theme';

export type FrameSize = { width: number; height: number };

/** Kích thước lớn nhất giữ đúng tỉ lệ ảnh và nằm gọn trong hộp (contain). */
export function fitContain(boxW: number, boxH: number, aspect: number): FrameSize {
  if (boxW <= 0 || boxH <= 0) return { width: 0, height: 0 };
  const byWidth = { width: boxW, height: boxW / aspect };
  if (byWidth.height <= boxH) return byWidth;
  return { width: boxH * aspect, height: boxH };
}

/** Tên đọc cho trình đọc màn hình. */
export function photoA11yLabel(ref: string | null): string {
  const sample = findSamplePhoto(ref);
  return sample ? `Ảnh phòng: ${sample.label}` : 'Ảnh phòng của bạn';
}

/** Ảnh phủ kín khung cha (cover). Khung cha quyết định kích thước, bo góc và overflow. */
export function RoomPhoto({ uri, accessibilityLabel }: { uri: string | null; accessibilityLabel?: string }) {
  const t = useTheme();
  const reduce = useReducedMotion();
  const source = photoSource(uri);
  return (
    <Image
      source={source}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      transition={reduce ? 0 : t.motion.fast}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? photoA11yLabel(uri)}
    />
  );
}

/**
 * Khung ảnh tự đo chỗ trống (flex: 1) rồi đặt khung đúng tỉ lệ ảnh ở giữa.
 * Dùng cho màn không cuộn (quét phòng, đường chân trời) để ảnh luôn vừa màn ở mọi cỡ máy và cỡ chữ.
 */
export function PhotoStage({
  aspect,
  children,
  style,
}: {
  aspect: number;
  children: (size: FrameSize) => ReactNode;
  style?: ViewStyle;
}) {
  const t = useTheme();
  const [box, setBox] = useState<FrameSize | null>(null);
  const size = box ? fitContain(box.width, box.height, aspect) : null;
  return (
    <View style={[{ flex: 1, minHeight: 160 }, style]}>
      {/* Đo hộp bên trong (đã trừ padding của `style`) để khung ảnh không tràn lề. */}
      <View
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setBox({ width, height });
        }}
      >
        {size && size.width > 0 ? (
          <View
            style={{
              width: size.width,
              height: size.height,
              borderRadius: t.radius.md,
              overflow: 'hidden',
              backgroundColor: t.colors.muted,
            }}
          >
            {children(size)}
          </View>
        ) : null}
      </View>
    </View>
  );
}

/**
 * Khung ảnh có kích thước tính sẵn cho màn cuộn: rộng theo màn (trừ lề 16 mỗi bên),
 * cao không quá `maxHeightRatio` chiều cao màn.
 */
export function useInlinePhotoSize(aspect: number, maxHeightRatio: number): FrameSize {
  const t = useTheme();
  const window = useWindowDimensions();
  return fitContain(window.width - t.spacing.md * 2, window.height * maxHeightRatio, aspect);
}

export function PhotoFrame({ size, children }: { size: FrameSize; children: ReactNode }) {
  const t = useTheme();
  return (
    <View
      style={{
        width: size.width,
        height: size.height,
        alignSelf: 'center',
        borderRadius: t.radius.md,
        overflow: 'hidden',
        backgroundColor: t.colors.muted,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: t.colors.border,
      }}
    >
      {children}
    </View>
  );
}

/**
 * Nhãn nổi trên ảnh: nền `card` đặc (không dùng lớp phủ trong suốt) để chữ luôn đạt ≥ 4.5:1
 * dù ảnh sáng hay tối, ở cả hai theme. Bóng shadow-xl theo MASTER.md (phần tử nổi trên ảnh).
 */
export function PhotoPill({
  icon: Icon,
  label,
  iconWeight = 'regular',
  accessibilityLiveRegion,
}: {
  icon?: PhosphorIcon;
  label: string;
  iconWeight?: 'regular' | 'fill' | 'bold';
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
}) {
  const t = useTheme();
  return (
    <View
      accessibilityLiveRegion={accessibilityLiveRegion}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'center',
          gap: t.spacing.sm,
          maxWidth: '92%',
          minHeight: 32,
          paddingHorizontal: t.spacing.sm + 4,
          paddingVertical: t.spacing.xs + 2,
          borderRadius: t.radius.pill,
          backgroundColor: t.colors.card,
        },
        t.shadow('xl'),
      ]}
    >
      {Icon ? <Icon size={18} color={t.colors.cardForeground} weight={iconWeight} /> : null}
      <AppText variant="footnote" weight="600" color="cardForeground" style={{ flexShrink: 1 }}>
        {label}
      </AppText>
    </View>
  );
}
