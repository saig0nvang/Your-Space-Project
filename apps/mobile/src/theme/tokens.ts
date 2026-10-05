/**
 * Token của hệ thiết kế — chép đúng từ design-system/yourspace/MASTER.md.
 * Component chỉ dùng token qua useTheme(), không ghi mã màu hay cỡ chữ trực tiếp.
 * Đổi giá trị ở đây chỉ khi MASTER.md đổi.
 */
import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const lightColors = {
  background: '#FFFFFF',
  foreground: '#171717',
  card: '#FFFFFF',
  cardForeground: '#171717',
  muted: '#F4F4F5',
  mutedForeground: '#52525B',
  primary: '#171717',
  onPrimary: '#FFFFFF',
  primaryText: '#171717',
  secondary: '#404040',
  onSecondary: '#FFFFFF',
  /** Hành động chính: nút viên thuốc màu đen (MASTER.md · hướng A). */
  accent: '#171717',
  onAccent: '#FFFFFF',
  /** Vàng đồng: giá, link, một điểm nhấn mỗi màn. Không đặt trên `muted`. */
  accentText: '#A16207',
  destructive: '#DC2626',
  onDestructive: '#FFFFFF',
  destructiveText: '#B91C1C',
  border: '#E5E5E5',
  borderStrong: '#8A8A8A',
  ring: '#171717',
  /** Lớp phủ sau sheet: đen 50% (MASTER.md · Sheets). */
  scrim: 'rgba(0,0,0,0.5)',
  /** Chữ đặt trên ảnh (luôn có dải tối phía dưới chữ): trắng ở cả hai theme. */
  onImage: '#FFFFFF',
} as const;

export type ColorTokens = { [K in keyof typeof lightColors]: string };

export const darkColors: ColorTokens = {
  background: '#0F0F0F',
  foreground: '#FAFAFA',
  card: '#1C1C1C',
  cardForeground: '#FAFAFA',
  muted: '#27272A',
  mutedForeground: '#A1A1AA',
  primary: '#FAFAFA',
  onPrimary: '#0F0F0F',
  primaryText: '#FAFAFA',
  secondary: '#D4D4D8',
  onSecondary: '#0F0F0F',
  accent: '#FAFAFA',
  onAccent: '#0F0F0F',
  accentText: '#D9A441',
  destructive: '#F87171',
  onDestructive: '#000000',
  destructiveText: '#FCA5A5',
  border: '#2A2A2A',
  borderStrong: '#71717A',
  ring: '#FAFAFA',
  scrim: 'rgba(0,0,0,0.5)',
  onImage: '#FFFFFF',
};

/** Bricolage Grotesque cho Display, Large Title, Title 1 và tổng tiền; còn lại dùng font hệ thống (SF Pro / Roboto). */
export const fontFamilies = {
  display: 'BricolageGrotesque_800ExtraBold',
  displayBold: 'BricolageGrotesque_700Bold',
} as const;

export type TypographyVariant =
  | 'display'
  | 'largeTitle'
  | 'title1'
  | 'title2'
  | 'title3'
  | 'headline'
  | 'body'
  | 'callout'
  | 'subheadline'
  | 'footnote'
  | 'caption1'
  | 'caption2';

/** Thang chữ theo text style iOS (MASTER.md · Typography). */
export const typography: Record<TypographyVariant, TextStyle> = {
  display: { fontFamily: fontFamilies.display, fontSize: 44, lineHeight: 48, letterSpacing: -1.5 },
  largeTitle: { fontFamily: fontFamilies.display, fontSize: 34, lineHeight: 40, letterSpacing: -1 },
  title1: { fontFamily: fontFamilies.displayBold, fontSize: 28, lineHeight: 34, letterSpacing: -0.6 },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '600' },
  title3: { fontSize: 20, lineHeight: 25, fontWeight: '600' },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 22, fontWeight: '400' },
  callout: { fontSize: 16, lineHeight: 21, fontWeight: '400' },
  subheadline: { fontSize: 15, lineHeight: 20, fontWeight: '400' },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  caption1: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  caption2: { fontSize: 11, lineHeight: 13, fontWeight: '400' },
};

/** Nhịp 4/8, đơn vị pt/dp. Lề màn mặc định = md. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

/** Vùng chạm tối thiểu: 44 pt (iOS) / 48 dp (Android). */
export const touchTarget = Platform.select({ ios: 44, default: 48 }) as number;

type ShadowLevel = 'sm' | 'md' | 'lg' | 'xl';

const shadowSpec: Record<ShadowLevel, { offsetY: number; opacity: number; radius: number; elevation: number }> = {
  sm: { offsetY: 1, opacity: 0.05, radius: 1, elevation: 1 },
  md: { offsetY: 4, opacity: 0.1, radius: 3, elevation: 3 },
  lg: { offsetY: 10, opacity: 0.1, radius: 8, elevation: 6 },
  xl: { offsetY: 20, opacity: 0.15, radius: 12, elevation: 10 },
};

/** Bóng theo MASTER.md. Theme tối không dùng bóng. */
export function shadow(level: ShadowLevel, scheme: 'light' | 'dark'): ViewStyle {
  if (scheme === 'dark') return {};
  const s = shadowSpec[level];
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: s.offsetY },
      shadowOpacity: s.opacity,
      shadowRadius: s.radius,
    },
    default: { elevation: s.elevation },
  });
}

/** Thời lượng chuyển động: phản hồi nhấn ≤ 100 ms, chuyển trạng thái 150–300 ms. */
export const motion = {
  press: 100,
  fast: 150,
  base: 220,
  slow: 300,
} as const;

export const pressedOpacity = 0.85;
export const disabledOpacity = 0.4;

/**
 * Màu chất liệu — MASTER.md · "Màu chất liệu (nội dung minh họa)". Là màu của NỘI DUNG (hình minh họa món,
 * chấm mẫu chất liệu), giống điểm ảnh của ảnh; không dùng cho chữ, nền, viền hay trạng thái giao diện.
 */
export const materialColors = {
  oak: '#C8A47E',
  ash: '#D9C4A2',
  walnut: '#6E4B34',
  rattan: '#C39B5F',
  paperCord: '#CDB48B',
  linen: '#D8CDBE',
  woven: '#B7A48C',
  velvetMoss: '#5F6B4A',
  leather: '#33302D',
  brass: '#B48A4C',
  steelBlack: '#2E2D2B',
  chrome: '#B9BEC4',
  glass: '#CFDDDF',
  frostedGlass: '#E8E6E1',
} as const;

export type MaterialKey = keyof typeof materialColors;

/**
 * Màu đen của nội dung ảnh: bóng tiếp đất dưới món đặt trên ảnh phòng và dải tối phía dưới chữ đặt trên ảnh.
 * Là điểm ảnh của nội dung như materialColors, cùng màu bóng của MASTER (đen).
 */
export const contactShadowColor = '#000000';

export const MATERIAL_LABEL: Record<MaterialKey, string> = {
  oak: 'Gỗ sồi',
  ash: 'Gỗ tần bì',
  walnut: 'Gỗ óc chó',
  rattan: 'Mây',
  paperCord: 'Dây giấy',
  linen: 'Vải lanh',
  woven: 'Vải dệt',
  velvetMoss: 'Nhung xanh rêu',
  leather: 'Da',
  brass: 'Đồng',
  steelBlack: 'Thép sơn đen',
  chrome: 'Thép mạ crôm',
  glass: 'Kính',
  frostedGlass: 'Kính mờ',
};
