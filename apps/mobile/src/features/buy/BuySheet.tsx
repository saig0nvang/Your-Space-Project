/**
 * Khung chung của mọi màn trong sheet Mua: tiêu đề + Đóng (SheetHeader), nút quay lại, chỉ báo bước,
 * nội dung cuộn và thanh nút cố định ở đáy. Nền `card` theo MASTER.md · Sheets.
 * Bàn phím: KeyboardAvoidingView bù đúng phần sheet lệch khỏi đỉnh màn (sheet iOS không bắt đầu từ y = 0).
 */
import { CaretLeft, WarningCircle, type Icon as PhosphorIcon } from 'phosphor-react-native';
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, { FadeIn, FadeOut, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, ErrorState, IconButton, SheetHeader, StepIndicator } from '@/components/ui';
import { useTheme, type ColorTokens } from '@/theme';

import { useBuyClose } from './navigation';

let keyboardShown = Keyboard.isVisible();

function subscribeKeyboard(onChange: () => void) {
  const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
  const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
  const show = Keyboard.addListener(showEvent, () => {
    keyboardShown = true;
    onChange();
  });
  const hide = Keyboard.addListener(hideEvent, () => {
    keyboardShown = false;
    onChange();
  });
  return () => {
    show.remove();
    hide.remove();
  };
}

function useKeyboardShown(): boolean {
  return useSyncExternalStore(subscribeKeyboard, () => keyboardShown);
}

export function BuySheet({
  title,
  onClose,
  onBack,
  backDisabled = false,
  step,
  footer,
  scrollTopSignal,
  children,
}: {
  title: string;
  onClose: () => void;
  /** Có thì hiện nút quay lại bên trái tiêu đề. */
  onBack?: () => void;
  backDisabled?: boolean;
  step?: { step: number; total: number };
  footer?: ReactNode;
  /** Đổi giá trị (khác null) để cuộn về đầu, ví dụ khi một Banner lỗi vừa hiện ở đầu màn. */
  scrollTopSignal?: unknown;
  children: ReactNode;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const scrollRef = useRef<ScrollView>(null);
  const { height: windowHeight } = useWindowDimensions();
  const [sheetHeight, setSheetHeight] = useState(0);
  const keyboardUp = useKeyboardShown();
  const topOffset = sheetHeight > 0 ? Math.max(windowHeight - sheetHeight, 0) : 0;

  useEffect(() => {
    if (scrollTopSignal == null) return;
    scrollRef.current?.scrollTo({ y: 0, animated: !reduceMotion });
  }, [scrollTopSignal, reduceMotion]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={topOffset}
      onLayout={(e) => setSheetHeight(e.nativeEvent.layout.height)}
      style={{ flex: 1, backgroundColor: t.colors.card }}
    >
      <SheetHeader
        title={title}
        onClose={onClose}
        left={
          onBack ? (
            <IconButton icon={CaretLeft} accessibilityLabel="Quay lại" onPress={onBack} disabled={backDisabled} />
          ) : undefined
        }
      />
      {step ? (
        <View style={{ paddingBottom: t.spacing.sm }}>
          <StepIndicator step={step.step} total={step.total} />
        </View>
      ) : null}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={{
          paddingHorizontal: t.spacing.md,
          paddingTop: t.spacing.sm,
          paddingBottom: footer ? t.spacing.lg : insets.bottom + t.spacing.lg,
          gap: t.spacing.lg,
        }}
      >
        {children}
      </ScrollView>
      {footer ? (
        <View
          style={{
            paddingHorizontal: t.spacing.md,
            paddingTop: t.spacing.sm + 4,
            paddingBottom: (keyboardUp ? 0 : insets.bottom) + t.spacing.sm + 4,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: t.colors.border,
            backgroundColor: t.colors.card,
            gap: t.spacing.sm,
          }}
        >
          {footer}
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

/** Một dòng lý do có icon (ví dụ vì sao nút chính đang tắt). */
export function ReasonLine({
  text,
  icon: Icon = WarningCircle,
  color = 'mutedForeground',
  align = 'center',
}: {
  text: string;
  icon?: PhosphorIcon;
  color?: keyof ColorTokens;
  align?: 'center' | 'left';
}) {
  const t = useTheme();
  return (
    <View
      accessibilityLiveRegion="polite"
      style={{
        flexDirection: 'row',
        gap: t.spacing.xs + 2,
        alignItems: 'center',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
      }}
    >
      <Icon size={16} color={t.colors[color]} weight="bold" />
      <AppText variant="footnote" color={color} style={{ flexShrink: 1 }}>
        {text}
      </AppText>
    </View>
  );
}

/** Hiện dần khi xuất hiện (150–300 ms) để trạng thái không đổi đột ngột. */
export function Appear({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <Animated.View entering={FadeIn.duration(t.motion.base)} exiting={FadeOut.duration(t.motion.fast)}>
      {children}
    </Animated.View>
  );
}

/** Mở thẳng route mà không có phiên mua, hoặc nơi mở sheet không còn. */
export function BuyUnavailable({
  title,
  heading = 'Không có phiên mua nào đang mở',
  body = 'Mở sheet Mua từ một không gian hoặc trang món để chọn món cần mua.',
}: {
  title: string;
  heading?: string;
  body?: string;
}) {
  const close = useBuyClose('none');
  const onClose = () => {
    void close();
  };
  return (
    <BuySheet title={title} onClose={onClose} footer={<Button variant="secondary" label="Đóng" onPress={onClose} />}>
      <ErrorState title={heading} body={body} />
    </BuySheet>
  );
}
