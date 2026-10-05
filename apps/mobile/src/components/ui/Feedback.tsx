/** Phản hồi trạng thái dùng chung (docs/screens.md §4): G1 mất mạng, trạng thái, màn trống, lỗi, khung xương. */
import {
  CheckCircle,
  Info,
  WarningCircle,
  WifiSlash,
  type Icon as PhosphorIcon,
} from 'phosphor-react-native';
import { useEffect } from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useIsOnline } from '@/services/network';
import { useTheme, type ColorTokens } from '@/theme';

import { AppText } from './AppText';
import { Button } from './Button';

type BannerTone = 'offline' | 'info' | 'error';

/** Băng thông báo có icon + chữ (+ hành động). Không dùng màu một mình. */
export function Banner({
  tone,
  title,
  body,
  actionLabel,
  onAction,
  style,
}: {
  tone: BannerTone;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}) {
  const t = useTheme();
  const Icon = tone === 'offline' ? WifiSlash : tone === 'error' ? WarningCircle : Info;
  const iconColor: keyof ColorTokens = tone === 'error' ? 'destructiveText' : 'foreground';
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        {
          flexDirection: 'row',
          gap: t.spacing.sm + 4,
          padding: t.spacing.md,
          borderRadius: t.radius.md,
          backgroundColor: t.colors.muted,
          alignItems: 'flex-start',
        },
        style,
      ]}
    >
      <Icon size={22} color={t.colors[iconColor]} weight="regular" />
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="subheadline" weight="600" color={tone === 'error' ? 'destructiveText' : 'foreground'}>
          {title}
        </AppText>
        {body ? (
          <AppText variant="footnote" color="mutedForeground">
            {body}
          </AppText>
        ) : null}
        {actionLabel && onAction ? (
          <View style={{ alignItems: 'flex-start', marginLeft: -t.spacing.sm }}>
            <Button variant="plain" label={actionLabel} onPress={onAction} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

/** G1: chỉ hiện khi mất mạng. */
export function OfflineBanner({
  body = 'Dữ liệu trên máy vẫn dùng được. Giá hiện là giá lần cập nhật gần nhất.',
  onRetry,
  style,
}: {
  body?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}) {
  const online = useIsOnline();
  if (online) return null;
  return (
    <Banner tone="offline" title="Mất kết nối mạng" body={body} actionLabel={onRetry ? 'Thử lại' : undefined} onAction={onRetry} style={style} />
  );
}

export type StatusTone = 'neutral' | 'attention' | 'danger' | 'done';

/** Nhãn trạng thái: luôn icon + chữ. */
export function StatusTag({ tone, label, icon }: { tone: StatusTone; label: string; icon?: PhosphorIcon }) {
  const t = useTheme();
  const map: Record<StatusTone, { color: keyof ColorTokens; Icon: PhosphorIcon; weight: 'regular' | 'fill' }> = {
    neutral: { color: 'mutedForeground', Icon: Info, weight: 'regular' },
    attention: { color: 'foreground', Icon: WarningCircle, weight: 'fill' },
    danger: { color: 'destructiveText', Icon: WarningCircle, weight: 'fill' },
    done: { color: 'primaryText', Icon: CheckCircle, weight: 'fill' },
  };
  const m = map[tone];
  const I = icon ?? m.Icon;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: t.spacing.xs,
        paddingHorizontal: t.spacing.sm,
        paddingVertical: 3,
        borderRadius: t.radius.sm,
        backgroundColor: t.colors.muted,
      }}
    >
      <I size={14} color={t.colors[m.color]} weight={m.weight} />
      <AppText variant="footnote" weight="600" color={m.color}>
        {label}
      </AppText>
    </View>
  );
}

/** Màn trống: nói nơi này dùng để làm gì và đưa một hành động gợi ý. */
export function EmptyState({
  icon: Icon,
  title,
  body,
  actionLabel,
  onAction,
  actionVariant = 'primary',
}: {
  icon: PhosphorIcon;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: 'primary' | 'secondary' | 'plain';
}) {
  const t = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: t.spacing.sm + 4, paddingVertical: t.spacing.xl, paddingHorizontal: t.spacing.lg }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: t.colors.muted,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={30} color={t.colors.primaryText} />
      </View>
      <AppText variant="title3" align="center">
        {title}
      </AppText>
      {body ? (
        <AppText variant="callout" color="mutedForeground" align="center">
          {body}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <View style={{ marginTop: t.spacing.sm, alignSelf: 'stretch', alignItems: 'center' }}>
          <Button label={actionLabel} onPress={onAction} variant={actionVariant} />
        </View>
      ) : null}
    </View>
  );
}

/** Lỗi tải: nói chuyện gì xảy ra và cách sửa, có "Thử lại". */
export function ErrorState({ title, body, onRetry }: { title: string; body?: string; onRetry?: () => void }) {
  return <EmptyState icon={WarningCircle} title={title} body={body} actionLabel={onRetry ? 'Thử lại' : undefined} onAction={onRetry} actionVariant="secondary" />;
}

/** G4: khung xương đúng kích thước nội dung; tắt nhấp nháy khi bật Reduce Motion. */
export function Skeleton({ width, height, radius, style }: { width: number | `${number}%`; height: number; radius?: number; style?: ViewStyle }) {
  const t = useTheme();
  const reduce = useReducedMotion();
  const o = useSharedValue(1);
  useEffect(() => {
    if (!reduce) o.value = withRepeat(withTiming(0.55, { duration: 700 }), -1, true);
  }, [reduce, o]);
  const animated = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ width, height, borderRadius: radius ?? t.radius.sm, backgroundColor: t.colors.muted }, animated, style]}
    />
  );
}
