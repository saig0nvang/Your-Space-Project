/**
 * Dòng thời gian dọc cho đơn hàng (DH2) và khiếu nại (DH5).
 * Mỗi bước có icon + chữ trạng thái ("Xong", "Bước hiện tại", "Chưa tới"), không dùng màu một mình.
 */
import { CheckCircle, CircleIcon, WarningCircle, type Icon as PhosphorIcon } from 'phosphor-react-native';
import { View } from 'react-native';

import { AppText } from '@/components/ui';
import { formatDateTime } from '@/lib/format';
import { useTheme, type ColorTokens } from '@/theme';

export type TimelineStep = {
  key: string;
  title: string;
  detail?: string;
  at?: number | null;
  state: 'done' | 'current' | 'upcoming';
  /** Icon riêng cho bước hiện tại (mặc định: dấu tích). */
  icon?: PhosphorIcon;
  tone?: 'default' | 'danger';
};

const STATE_LABEL: Record<TimelineStep['state'], string> = {
  done: 'Xong',
  current: 'Bước hiện tại',
  upcoming: 'Chưa tới',
};

export function Timeline({ steps, accessibilityLabel }: { steps: TimelineStep[]; accessibilityLabel: string }) {
  const t = useTheme();
  return (
    <View accessibilityLabel={accessibilityLabel} role="list">
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        const danger = step.tone === 'danger';
        let Icon: PhosphorIcon = CheckCircle;
        let iconColor: keyof ColorTokens = 'primaryText';
        let weight: 'fill' | 'regular' = 'fill';
        if (step.state === 'upcoming') {
          Icon = CircleIcon;
          iconColor = 'mutedForeground';
          weight = 'regular';
        } else if (step.state === 'current') {
          Icon = danger ? WarningCircle : (step.icon ?? CheckCircle);
          iconColor = danger ? 'destructiveText' : 'foreground';
        }
        const time = step.at ? formatDateTime(step.at) : null;
        const label = [step.title, STATE_LABEL[step.state], step.detail, time].filter(Boolean).join('. ');
        return (
          <View key={step.key} role="listitem" accessible accessibilityLabel={label} style={{ flexDirection: 'row', gap: t.spacing.sm + 4 }}>
            <View style={{ alignItems: 'center', width: 24 }}>
              <Icon size={24} color={t.colors[iconColor]} weight={weight} />
              {last ? null : (
                <View
                  style={{
                    flex: 1,
                    width: 2,
                    minHeight: t.spacing.md,
                    marginVertical: t.spacing.xs,
                    borderRadius: 1,
                    backgroundColor: step.state === 'upcoming' || steps[i + 1].state === 'upcoming' ? t.colors.border : t.colors.primary,
                  }}
                />
              )}
            </View>
            <View style={{ flex: 1, gap: 2, paddingBottom: last ? 0 : t.spacing.md }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: t.spacing.sm }}>
                <AppText
                  variant={step.state === 'current' ? 'headline' : 'body'}
                  color={step.state === 'upcoming' ? 'mutedForeground' : danger && step.state === 'current' ? 'destructiveText' : 'foreground'}
                >
                  {step.title}
                </AppText>
                {step.state === 'current' ? (
                  <AppText variant="footnote" weight="600" color="primaryText">
                    {STATE_LABEL.current}
                  </AppText>
                ) : null}
              </View>
              {step.detail ? (
                <AppText variant="footnote" color="mutedForeground">
                  {step.detail}
                </AppText>
              ) : null}
              <AppText variant="footnote" color="mutedForeground" tabular>
                {time ?? STATE_LABEL[step.state]}
              </AppText>
            </View>
          </View>
        );
      })}
    </View>
  );
}
