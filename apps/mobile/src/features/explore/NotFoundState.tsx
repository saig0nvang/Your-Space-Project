/** Lỗi "không tìm thấy" (phong cách / món không tồn tại hoặc link cũ): nói chuyện gì xảy ra và đường ra. */
import { View } from 'react-native';

import { Button, ErrorState } from '@/components/ui';
import { useTheme } from '@/theme';

export function NotFoundState({
  title,
  body,
  actionLabel,
  onAction,
  surface = 'background',
}: {
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
  surface?: 'background' | 'card';
}) {
  const t = useTheme();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: t.spacing.md,
        paddingBottom: t.spacing['2xl'],
        backgroundColor: t.colors[surface],
      }}
    >
      <ErrorState title={title} body={body} />
      <View style={{ alignItems: 'center' }}>
        <Button variant="secondary" label={actionLabel} onPress={onAction} />
      </View>
    </View>
  );
}
