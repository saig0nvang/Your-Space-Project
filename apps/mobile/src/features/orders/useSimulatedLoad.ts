import { useEffect, useState } from 'react';

import { useReviewFlags } from '@/features/me/reviewFlags';

const SIMULATED_LOAD_MS = 1500;

/**
 * Bản thử đọc đơn từ máy nên không có thời gian tải. Khi bật cờ "Tải chậm" ở màn giả lập,
 * màn hiện khung xương ~1,5 giây để review trạng thái G4.
 */
export function useSimulatedLoad(): boolean {
  const [loading, setLoading] = useState(() => useReviewFlags.getState().slowLoad);
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoading(false), SIMULATED_LOAD_MS);
    return () => clearTimeout(timer);
  }, [loading]);
  return loading;
}
