/**
 * Xác nhận bằng điều khiển gốc: action sheet trên iOS, hộp thoại trên Android.
 * Dùng cho E3 (rời trình chỉnh sửa), xóa không gian, đóng sheet Mua giữa chừng.
 */
import { ActionSheetIOS, Alert, Platform } from 'react-native';

export type ConfirmOption = { label: string; style?: 'default' | 'destructive' | 'cancel' };

export function confirmAction(input: { title: string; message?: string; options: ConfirmOption[] }): Promise<number> {
  return new Promise((resolve) => {
    const cancelIndex = input.options.findIndex((o) => o.style === 'cancel');
    if (Platform.OS === 'web') {
      // Bản xem trên web (chỉ để review): Alert của react-native-web không hiện gì, nên hỏi lần lượt bằng window.confirm.
      const text = [input.title, input.message].filter(Boolean).join('\n\n');
      const choices = input.options.map((o, i) => ({ o, i })).filter(({ o }) => o.style !== 'cancel');
      for (const { o, i } of choices) {
        const ask = choices.length === 1 ? `${text}\n\n${o.label}?` : `${text}\n\nChọn "${o.label}"?`;
        if (globalThis.confirm?.(ask)) {
          resolve(i);
          return;
        }
      }
      resolve(cancelIndex);
      return;
    }
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: input.title,
          message: input.message,
          options: input.options.map((o) => o.label),
          destructiveButtonIndex: input.options
            .map((o, i) => (o.style === 'destructive' ? i : -1))
            .filter((i) => i >= 0),
          cancelButtonIndex: cancelIndex >= 0 ? cancelIndex : undefined,
        },
        (index) => resolve(index),
      );
      return;
    }
    Alert.alert(
      input.title,
      input.message,
      input.options.map((o, i) => ({ text: o.label, style: o.style, onPress: () => resolve(i) })),
      { cancelable: true, onDismiss: () => resolve(cancelIndex) },
    );
  });
}
