/**
 * Trạng thái lưu trên máy (không cần đăng nhập — D10, E6-US2).
 * Không gian và ảnh nằm trên máy; đơn hàng và SĐT đã xác minh ở bản thật sẽ đến từ máy chủ,
 * bản thử giữ cục bộ qua services/orders.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  BuyOrigin,
  Complaint,
  DeliveryInfo,
  Order,
  OrderStatus,
  Space,
} from '@/types';

export type BuySession = {
  origin: BuyOrigin;
  /** Khóa đang chọn: id món đã đặt (khi mở từ không gian) hoặc id sản phẩm (khi mở từ K4). */
  selectedKeys: string[];
  delivery: DeliveryInfo | null;
  paymentId: string | null;
  paymentStatus: 'idle' | 'pending' | 'paid' | 'failed' | 'cancelled';
  createdOrderIds: string[];
};

type UserState = {
  verifiedPhone: string | null;
  recipientName: string;
  address: string;
  /** Đã đồng ý câu consent gửi ảnh ở lần gửi đầu (E3-US3). */
  photoConsentAccepted: boolean;
  /** Đã xem màn giải thích quyền camera (C1). */
  cameraIntroSeen: boolean;
  notificationsAsked: boolean;
};

type AppState = {
  spaces: Space[];
  orders: Order[];
  user: UserState;
  buySession: BuySession | null;

  addSpace: (space: Space) => void;
  updateSpace: (id: string, patch: Partial<Space>) => void;
  replaceSpace: (space: Space) => void;
  deleteSpace: (id: string) => void;
  markSpaceSaved: (id: string, name?: string) => void;
  markItemsPurchased: (spaceId: string, placedItemIds: string[]) => void;

  addOrders: (orders: Order[]) => void;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  setOrderStatus: (id: string, status: OrderStatus) => void;
  fileComplaint: (orderId: string, complaint: Complaint) => void;
  updateComplaint: (orderId: string, patch: Partial<Complaint>) => void;


  updateUser: (patch: Partial<UserState>) => void;

  startBuySession: (origin: BuyOrigin, selectedKeys: string[]) => void;
  updateBuySession: (patch: Partial<BuySession>) => void;
  endBuySession: () => void;

  /** Xóa toàn bộ dữ liệu trên máy (T2). Giữ đơn có khiếu nại đang mở (E6-US7 AC4). */
  wipeLocalData: () => void;
};

const initialUser: UserState = {
  verifiedPhone: null,
  recipientName: '',
  address: '',
  photoConsentAccepted: false,
  cameraIntroSeen: false,
  notificationsAsked: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      spaces: [],
      orders: [],
      user: initialUser,
      buySession: null,

      addSpace: (space) => set((s) => ({ spaces: [space, ...s.spaces] })),
      updateSpace: (id, patch) =>
        set((s) => ({
          spaces: s.spaces.map((sp) => (sp.id === id ? { ...sp, ...patch, updatedAt: Date.now() } : sp)),
        })),
      replaceSpace: (space) =>
        set((s) => ({ spaces: s.spaces.map((sp) => (sp.id === space.id ? space : sp)) })),
      deleteSpace: (id) => set((s) => ({ spaces: s.spaces.filter((sp) => sp.id !== id) })),
      markSpaceSaved: (id, name) => {
        const now = Date.now();
        set((s) => ({
          spaces: s.spaces.map((sp) => (sp.id === id ? { ...sp, name: name ?? sp.name, savedAt: now, updatedAt: now } : sp)),
        }));
      },
      markItemsPurchased: (spaceId, placedItemIds) => {
        const now = Date.now();
        set((s) => ({
          spaces: s.spaces.map((sp) =>
            sp.id === spaceId
              ? {
                  ...sp,
                  items: sp.items.map((it) => (placedItemIds.includes(it.id) ? { ...it, purchased: true } : it)),
                  savedAt: now,
                  updatedAt: now,
                }
              : sp,
          ),
        }));
      },

      addOrders: (orders) => set((s) => ({ orders: [...orders, ...s.orders] })),
      updateOrder: (id, patch) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)) })),
      setOrderStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? { ...o, status, timeline: [...o.timeline, { status, at: Date.now() }] } : o,
          ),
        })),
      fileComplaint: (orderId, complaint) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  complaint,
                  status: 'disputed',
                  timeline: [...o.timeline, { status: 'disputed', at: Date.now() }],
                }
              : o,
          ),
        })),
      updateComplaint: (orderId, patch) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId && o.complaint ? { ...o, complaint: { ...o.complaint, ...patch } } : o,
          ),
        })),

      updateUser: (patch) => set((s) => ({ user: { ...s.user, ...patch } })),

      startBuySession: (origin, selectedKeys) =>
        set({
          buySession: {
            origin,
            selectedKeys,
            delivery: null,
            paymentId: null,
            paymentStatus: 'idle',
            createdOrderIds: [],
          },
        }),
      updateBuySession: (patch) =>
        set((s) => (s.buySession ? { buySession: { ...s.buySession, ...patch } } : s)),
      endBuySession: () => set({ buySession: null }),

      wipeLocalData: () =>
        set((s) => ({
          spaces: [],
          buySession: null,
          user: { ...initialUser, verifiedPhone: s.user.verifiedPhone },
          orders: s.orders.filter((o) => o.complaint !== null && o.complaint.status !== 'closed'),
        })),
    }),
    {
      name: 'yourspace-app',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        spaces: s.spaces,
        orders: s.orders,
        user: s.user,
        buySession: s.buySession,
      }),
    },
  ),
);

/** true khi dữ liệu trên máy đã nạp xong; tránh nháy màn trống lúc mở app. */
export function useStoreHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useAppStore.persist.onFinishHydration(onChange),
    () => useAppStore.persist.hasHydrated(),
  );
}

/** Không gian lưu gần nhất (cho khối "Tiếp tục" ở K1). */
export function selectLatestSavedSpace(s: AppState): Space | undefined {
  return s.spaces
    .filter((sp) => sp.savedAt !== null)
    .sort((a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0))[0];
}

/** Số đơn đã giao chờ xác nhận (badge tab Tôi). */
export function selectOrdersAwaitingConfirmation(s: AppState): number {
  return s.orders.filter((o) => o.status === 'delivered').length;
}
