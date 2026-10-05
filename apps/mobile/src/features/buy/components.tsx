/** Thành phần riêng của sheet Mua: nhóm nhà cung cấp, dòng món, dòng thông tin. */
import type { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ProductThumb } from '@/components/ProductArt';
import { AppText, Checkbox, Price, StatusTag } from '@/components/ui';
import { formatDeliveryWindow, formatVND } from '@/lib/format';
import { useTheme } from '@/theme';
import { pressedOpacity } from '@/theme/tokens';

import type { CartEntry, CartGroup } from './cart';

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function entryStatus(entry: CartEntry): { label: string; tone: 'done' | 'attention' } | null {
  if (entry.blocked === 'discontinued') return { label: 'Ngừng bán', tone: 'attention' };
  if (entry.blocked === 'out_of_stock') return { label: 'Hết hàng', tone: 'attention' };
  if (entry.purchased) return { label: 'Đã mua', tone: 'done' };
  return null;
}

/** Khung viền mảnh bo radius-md, dùng để gom các dòng trong sheet nền card. */
export function Group({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <View
      style={{
        borderRadius: t.radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: t.colors.border,
        backgroundColor: t.colors.card,
        overflow: 'hidden',
      }}
    >
      {children}
    </View>
  );
}

/**
 * Dòng món trong M1: Checkbox (đọc bởi VoiceOver, nhãn gồm tên, giá, trạng thái) + vùng chữ bấm được để
 * chọn nhanh (ẩn với VoiceOver để không đọc hai lần).
 */
export function CartItemRow({
  entry,
  onToggle,
  last,
}: {
  entry: CartEntry;
  onToggle: (entry: CartEntry) => void;
  last: boolean;
}) {
  const t = useTheme();
  const status = entryStatus(entry);
  const disabled = entry.blocked !== null;
  const label = [entry.product.name, formatVND(entry.priceVND), status?.label.toLowerCase()].filter(Boolean).join(', ');
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: t.spacing.xs,
        paddingRight: t.spacing.md,
        paddingVertical: t.spacing.sm,
        borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
        borderBottomColor: t.colors.border,
      }}
    >
      <Checkbox
        checked={entry.selected}
        onChange={() => onToggle(entry)}
        accessibilityLabel={label}
        disabled={disabled}
      />
      <Pressable
        onPress={disabled ? undefined : () => onToggle(entry)}
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={({ pressed }) => ({
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: t.spacing.sm + 4,
          opacity: pressed && !disabled && Platform.OS === 'ios' ? pressedOpacity : 1,
        })}
      >
        <ProductThumb category={entry.product.category} productId={entry.product.id} size={56} />
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="body" numberOfLines={2}>
            {entry.product.name}
          </AppText>
          <Price amount={entry.priceVND} variant="subheadline" color="mutedForeground" />
          {status ? (
            <View style={{ marginTop: 2 }}>
              <StatusTag tone={status.tone} label={status.label} />
            </View>
          ) : null}
        </View>
      </Pressable>
    </View>
  );
}

/** Nhóm theo nhà cung cấp: tên, khoảng ngày giao, tạm tính của món đang chọn. */
export function SupplierGroup({ group, onToggle }: { group: CartGroup; onToggle: (entry: CartEntry) => void }) {
  const t = useTheme();
  const { supplier } = group;
  return (
    <View style={{ gap: t.spacing.sm }}>
      <View
        style={{ flexDirection: 'row', alignItems: 'flex-end', gap: t.spacing.sm, paddingHorizontal: t.spacing.xs }}
      >
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="headline" accessibilityRole="header">
            {supplier.name}
          </AppText>
          <AppText variant="footnote" color="mutedForeground">
            {capitalize(formatDeliveryWindow(supplier.deliveryMinDays, supplier.deliveryMaxDays))}
          </AppText>
        </View>
        <View
          style={{ alignItems: 'flex-end', gap: 2 }}
          accessible
          accessibilityLabel={`Tạm tính ${supplier.name}: ${formatVND(group.subtotal)}`}
        >
          <AppText variant="caption1" color="mutedForeground">
            Tạm tính
          </AppText>
          <AppText variant="subheadline" weight="600" tabular>
            {formatVND(group.subtotal)}
          </AppText>
        </View>
      </View>
      <Group>
        {group.entries.map((e, i) => (
          <CartItemRow key={e.key} entry={e} onToggle={onToggle} last={i === group.entries.length - 1} />
        ))}
      </Group>
    </View>
  );
}

/** Dòng nhãn – giá trị trong một Group (TT7). */
export function DetailRow({
  label,
  value,
  valueTabular = false,
  action,
  last = false,
}: {
  label: string;
  value: string;
  valueTabular?: boolean;
  action?: ReactNode;
  last?: boolean;
}) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.spacing.sm,
        minHeight: 52,
        paddingHorizontal: t.spacing.md,
        paddingVertical: t.spacing.sm + 2,
        borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
        borderBottomColor: t.colors.border,
      }}
    >
      <View style={{ flex: 1, gap: 2 }} accessible accessibilityLabel={`${label}: ${value}`}>
        <AppText variant="footnote" color="mutedForeground">
          {label}
        </AppText>
        <AppText variant="body" tabular={valueTabular}>
          {value}
        </AppText>
      </View>
      {action}
    </View>
  );
}

/** Dòng tổng tiền nổi bật. */
export function TotalRow({ label = 'Tổng thanh toán', amount }: { label?: string; amount: number }) {
  const t = useTheme();
  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'baseline', gap: t.spacing.sm }}
      accessible
      accessibilityLabel={`${label}: ${formatVND(amount)}`}
    >
      <AppText variant="headline" style={{ flex: 1 }}>
        {label}
      </AppText>
      <AppText variant="title2" tabular>
        {formatVND(amount)}
      </AppText>
    </View>
  );
}
