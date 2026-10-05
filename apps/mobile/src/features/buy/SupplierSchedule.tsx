/**
 * Lịch giao của một nhà cung cấp trong bước Thanh toán: ngày giao dự kiến, và khung giờ lắp khi có món cần lắp.
 * Ngày giao và khung giờ là dữ liệu mẫu.
 */
import { Truck, WarningCircle, Wrench } from 'phosphor-react-native';
import { View } from 'react-native';

import { AppText, Chip, Price, Skeleton } from '@/components/ui';
import { formatDeliveryWindow } from '@/lib/format';
import { useTheme } from '@/theme';

import { ReasonLine } from './BuySheet';
import type { CartGroup } from './cart';
import { Group } from './components';
import { estimatedDeliveryDate, formatDayLabel, installSlotOptions } from './schedule';

export function SupplierSchedule({
  group,
  today,
  slotsLoaded,
  selectedSlot,
  onSelectSlot,
  disabled = false,
  error,
}: {
  group: CartGroup;
  today: number;
  slotsLoaded: boolean;
  selectedSlot: string | null;
  onSelectSlot: (slot: string) => void;
  disabled?: boolean;
  error?: string;
}) {
  const t = useTheme();
  const { supplier } = group;
  const deliveryDay = formatDayLabel(estimatedDeliveryDate(supplier, today));
  const installItems = group.selected.filter((e) => e.product.needsInstall);
  const options = installSlotOptions(supplier, today);

  return (
    <Group>
      <View style={{ padding: t.spacing.md, gap: t.spacing.sm + 4 }}>
        <View style={{ flexDirection: 'row', gap: t.spacing.sm + 4, alignItems: 'flex-start' }}>
          <Truck size={22} color={t.colors.primaryText} />
          <View style={{ flex: 1, gap: 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: t.spacing.sm }}>
              <AppText variant="headline" style={{ flex: 1 }}>
                {supplier.name}
              </AppText>
              <Price amount={group.subtotal} variant="subheadline" />
            </View>
            <AppText variant="footnote" color="mutedForeground">
              {group.selected.map((e) => e.product.name).join(', ')}
            </AppText>
            <AppText variant="subheadline">
              Giao dự kiến {deliveryDay} ({formatDeliveryWindow(supplier.deliveryMinDays, supplier.deliveryMaxDays)})
            </AppText>
          </View>
        </View>

        {installItems.length > 0 ? (
          <View style={{ gap: t.spacing.sm }}>
            <View style={{ flexDirection: 'row', gap: t.spacing.sm + 4, alignItems: 'flex-start' }}>
              <Wrench size={22} color={t.colors.primaryText} />
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="subheadline" weight="600">
                  Khung giờ lắp đặt
                </AppText>
                <AppText variant="footnote" color="mutedForeground">
                  {installItems.map((e) => e.product.name).join(', ')} cần lắp đặt. Chọn khung giờ thợ đến.
                </AppText>
              </View>
            </View>
            {!slotsLoaded ? (
              <View
                style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }}
                accessible
                accessibilityLabel="Đang tải khung giờ trống của nhà cung cấp"
              >
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} width={180} height={36} />
                ))}
              </View>
            ) : options.length === 0 ? (
              <AppText variant="footnote" color="mutedForeground">
                Nhà cung cấp này chưa có khung giờ lắp trống.
              </AppText>
            ) : (
              <View
                style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }}
                accessibilityRole="radiogroup"
                accessibilityLabel={`Khung giờ lắp đặt của ${supplier.name}`}
              >
                {options.map((slot) => (
                  <Chip
                    key={slot}
                    label={slot}
                    selected={selectedSlot === slot}
                    disabled={disabled}
                    onPress={() => onSelectSlot(slot)}
                  />
                ))}
              </View>
            )}
            {error ? <ReasonLine icon={WarningCircle} color="destructiveText" align="left" text={error} /> : null}
          </View>
        ) : (
          <AppText variant="footnote" color="mutedForeground">
            Không có món cần lắp đặt.
          </AppText>
        )}
      </View>
    </Group>
  );
}
