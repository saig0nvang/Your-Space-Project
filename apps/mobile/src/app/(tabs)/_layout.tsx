/**
 * Tab bar 3 ô: Khám phá · Phòng · Tôi (docs/screens.md §2, Q2). "Thử phòng" không phải tab.
 * Ô đang chọn: icon dạng Fill + màu chữ đậm, không chỉ đổi màu.
 */
import { Tabs } from 'expo-router/js-tabs';
import { Compass, House, User } from 'phosphor-react-native';
import { Platform, StyleSheet } from 'react-native';

import { selectOrdersAwaitingConfirmation, useAppStore } from '@/store/appStore';
import { useTheme } from '@/theme';

export default function TabsLayout() {
  const t = useTheme();
  const awaiting = useAppStore(selectOrdersAwaitingConfirmation);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.colors.foreground,
        tabBarInactiveTintColor: t.colors.mutedForeground,
        // Không ép lineHeight 13 của Caption 2: hộp chữ của nhãn tab thấp hơn nên cắt chân chữ (g, p) và dấu tiếng Việt.
        tabBarLabelStyle: { fontSize: t.typography.caption2.fontSize, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: t.colors.card,
          borderTopColor: t.colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          // Bản web không có inset đáy nên thanh tab mặc định thấp, cắt chân nhãn; iOS / Android giữ chiều cao hệ thống.
          ...(Platform.OS === 'web' ? { height: 60, paddingBottom: 6 } : null),
        },
        tabBarBadgeStyle: {
          backgroundColor: t.colors.foreground,
          color: t.colors.background,
          ...t.typography.caption2,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="(explore)"
        options={{
          title: 'Khám phá',
          tabBarIcon: ({ color, focused, size }) => <Compass size={size} color={String(color)} weight={focused ? 'fill' : 'regular'} />,
        }}
      />
      <Tabs.Screen
        name="rooms"
        options={{
          title: 'Phòng',
          tabBarIcon: ({ color, focused, size }) => <House size={size} color={String(color)} weight={focused ? 'fill' : 'regular'} />,
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: 'Tôi',
          tabBarBadge: awaiting > 0 ? awaiting : undefined,
          tabBarAccessibilityLabel: awaiting > 0 ? `Tôi, ${awaiting} đơn chờ xác nhận nhận hàng` : 'Tôi',
          tabBarIcon: ({ color, focused, size }) => <User size={size} color={String(color)} weight={focused ? 'fill' : 'regular'} />,
        }}
      />
    </Tabs>
  );
}
