import { useNetworkState } from 'expo-network';

import { useDevFlags } from '@/store/devFlags';

/**
 * true khi có mạng. Chưa biết trạng thái thì coi như có mạng để không chặn nhầm người dùng.
 * Cờ giả lập "forceOffline" (bản dev) ép trạng thái mất mạng để review G1.
 */
export function useIsOnline(): boolean {
  const state = useNetworkState();
  const forceOffline = useDevFlags((s) => s.forceOffline);
  if (forceOffline) return false;
  if (state.isConnected === false) return false;
  if (state.isInternetReachable === false) return false;
  return true;
}

/** Dùng trong service (ngoài React). */
export function isOfflineForced(): boolean {
  return useDevFlags.getState().forceOffline;
}
