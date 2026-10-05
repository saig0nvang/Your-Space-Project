/** Màn giữ chỗ trong lúc dựng. Mỗi agent thay file route của mình bằng màn thật. */
import { Screen, AppText } from '@/components/ui';

export function Placeholder({ id, name }: { id: string; name: string }) {
  return (
    <Screen>
      <AppText variant="title3" align="center" style={{ marginTop: 120 }}>
        {id} · {name}
      </AppText>
    </Screen>
  );
}
