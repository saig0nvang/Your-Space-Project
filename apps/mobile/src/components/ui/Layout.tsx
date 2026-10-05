/** Khung màn, tiêu đề sheet, chỉ báo bước, danh sách nhóm kiểu iOS. */
import { CaretRight, X, type Icon as PhosphorIcon } from 'phosphor-react-native';
import type { ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View, type ScrollViewProps, type ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets, type Edge } from 'react-native-safe-area-context';

import { useTheme, type ColorTokens } from '@/theme';
import { pressedOpacity } from '@/theme/tokens';

import { AppText } from './AppText';
import { IconButton } from './IconButton';

/** Màn không cuộn, nền background, tôn trọng safe area. */
export function Screen({
  children,
  edges = ['top', 'bottom'],
  style,
}: {
  children: ReactNode;
  edges?: Edge[];
  style?: ViewStyle;
}) {
  const t = useTheme();
  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: t.colors.background }, style]}>
      {children}
    </SafeAreaView>
  );
}

/** Màn cuộn với lề màn 16 và khoảng cách nhóm. Thanh cố định ở đáy truyền qua `footer`. */
export function ScreenScroll({
  children,
  footer,
  contentStyle,
  edges = ['bottom'],
  ...rest
}: ScrollViewProps & { children: ReactNode; footer?: ReactNode; contentStyle?: ViewStyle; edges?: Edge[] }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        {...rest}
        contentContainerStyle={[
          {
            paddingHorizontal: t.spacing.md,
            paddingTop: t.spacing.md,
            paddingBottom: footer ? t.spacing.lg : insets.bottom + t.spacing.lg,
            gap: t.spacing.lg,
          },
          contentStyle,
        ]}
      >
        {children}
      </ScrollView>
      {footer ? (
        <View
          style={{
            paddingHorizontal: t.spacing.md,
            paddingTop: t.spacing.sm + 4,
            paddingBottom: (edges.includes('bottom') ? insets.bottom : 0) + t.spacing.sm + 4,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: t.colors.border,
            backgroundColor: t.colors.background,
            gap: t.spacing.sm,
          }}
        >
          {footer}
        </View>
      ) : null}
    </View>
  );
}

/** Tiêu đề trong sheet / modal: tiêu đề + nút Đóng (và tuỳ chọn nút trái). */
export function SheetHeader({
  title,
  onClose,
  closeLabel = 'Đóng',
  left,
  subtitle,
}: {
  title: string;
  onClose?: () => void;
  closeLabel?: string;
  left?: ReactNode;
  subtitle?: ReactNode;
}) {
  const t = useTheme();
  return (
    <View style={{ paddingHorizontal: t.spacing.md, paddingTop: t.spacing.sm, paddingBottom: t.spacing.sm, gap: t.spacing.xs }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: t.touchTarget }}>
        <View style={{ minWidth: t.touchTarget }}>{left}</View>
        <AppText variant="headline" align="center" style={{ flex: 1 }} accessibilityRole="header" numberOfLines={2}>
          {title}
        </AppText>
        <View style={{ minWidth: t.touchTarget, alignItems: 'flex-end' }}>
          {onClose ? <IconButton icon={X} accessibilityLabel={closeLabel} onPress={onClose} variant="tinted" /> : null}
        </View>
      </View>
      {subtitle}
    </View>
  );
}

/** Chỉ báo bước của luồng thanh toán: "Bước 2/4" + thanh đoạn. */
export function StepIndicator({ step, total }: { step: number; total: number }) {
  const t = useTheme();
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={`Bước ${step} trên ${total}`}
      accessibilityValue={{ min: 1, max: total, now: step }}
      style={{ gap: t.spacing.xs, paddingHorizontal: t.spacing.md }}
    >
      <View style={{ flexDirection: 'row', gap: t.spacing.xs }}>
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < step ? t.colors.primary : t.colors.muted }}
          />
        ))}
      </View>
      <AppText variant="caption1" color="mutedForeground">
        Bước {step}/{total}
      </AppText>
    </View>
  );
}

/** Tiêu đề nhóm nội dung. */
export function SectionHeader({
  title,
  detail,
  action,
  display = false,
}: {
  title: string;
  detail?: string;
  action?: ReactNode;
  /** Tiêu đề nhóm ở màn gốc của tab: dùng Title 1 (Bricolage Grotesque) theo MASTER.md. */
  display?: boolean;
}) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant={display ? 'title1' : 'title3'} accessibilityRole="header">
          {title}
        </AppText>
        {detail ? (
          <AppText variant="footnote" color="mutedForeground">
            {detail}
          </AppText>
        ) : null}
      </View>
      {action}
    </View>
  );
}

/** Danh sách nhóm kiểu iOS (inset grouped). */
export function ListGroup({ children, title, footer }: { children: ReactNode; title?: string; footer?: string }) {
  const t = useTheme();
  return (
    <View style={{ gap: t.spacing.sm }}>
      {title ? (
        <AppText variant="footnote" color="mutedForeground" style={{ paddingHorizontal: t.spacing.md }}>
          {title.toUpperCase()}
        </AppText>
      ) : null}
      {/* Danh sách nhóm kiểu iOS: nền muted, không viền (MASTER.md · Cards). */}
      <View style={{ backgroundColor: t.colors.muted, borderRadius: t.radius.md, overflow: 'hidden' }}>{children}</View>
      {footer ? (
        <AppText variant="footnote" color="mutedForeground" style={{ paddingHorizontal: t.spacing.md }}>
          {footer}
        </AppText>
      ) : null}
    </View>
  );
}

export function ListRow({
  title,
  subtitle,
  value,
  icon: Icon,
  onPress,
  tone = 'default',
  badge,
  last = false,
  accessory,
}: {
  title: string;
  subtitle?: string;
  value?: string;
  icon?: PhosphorIcon;
  onPress?: () => void;
  tone?: 'default' | 'destructive';
  badge?: number;
  last?: boolean;
  accessory?: ReactNode;
}) {
  const t = useTheme();
  const color: keyof ColorTokens = tone === 'destructive' ? 'destructiveText' : 'foreground';
  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.spacing.sm + 4,
        minHeight: 52,
        paddingHorizontal: t.spacing.md,
        paddingVertical: t.spacing.sm + 2,
        borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
        borderBottomColor: t.colors.border,
      }}
    >
      {Icon ? <Icon size={22} color={t.colors[tone === 'destructive' ? 'destructiveText' : 'primaryText']} /> : null}
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="body" color={color}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="footnote" color="mutedForeground">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {value ? (
        <AppText variant="body" color="mutedForeground">
          {value}
        </AppText>
      ) : null}
      {badge ? (
        <View
          style={{
            minWidth: 22,
            height: 22,
            borderRadius: 11,
            paddingHorizontal: 6,
            backgroundColor: t.colors.foreground,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityLabel={`${badge} việc cần làm`}
        >
          <AppText variant="caption1" weight="600" color="background" tabular>
            {badge}
          </AppText>
        </View>
      ) : null}
      {accessory}
      {onPress ? <CaretRight size={18} color={t.colors.mutedForeground} /> : null}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[title, subtitle, value].filter(Boolean).join(', ')}
      android_ripple={{ color: t.colors.border }}
      style={({ pressed }) => ({ opacity: pressed && Platform.OS === 'ios' ? pressedOpacity : 1 })}
    >
      {content}
    </Pressable>
  );
}

export function Divider({ style }: { style?: ViewStyle }) {
  const t = useTheme();
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: t.colors.border }, style]} />;
}
