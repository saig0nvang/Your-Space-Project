import { TryRoom } from "@/components/try-room/TryRoom";
import { STYLES } from "@/lib/catalog";
import type { StyleId } from "@yourspace/core";

export default async function TryRoomPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { style } = await searchParams;
  const initialStyle = STYLES.find((s) => s.id === style)?.id ?? null;
  return <TryRoom initialStyle={initialStyle as StyleId | null} />;
}
