/**
 * Đổi tên không gian. Dùng Modal của RN dạng sheet hệ thống (pageSheet trên iOS) thay cho Alert.prompt,
 * vì Android không có Alert.prompt.
 */
import { useState } from 'react';
import { Modal, Platform, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { Button, SheetHeader, showToast, TextField } from '@/components/ui';
import { useAppStore } from '@/store/appStore';
import { useTheme } from '@/theme';
import type { Space } from '@/types';

const MAX_NAME = 40;

function RenameForm({ space, onClose }: { space: Space; onClose: () => void }) {
  const t = useTheme();
  const updateSpace = useAppStore((s) => s.updateSpace);
  const [name, setName] = useState(space.name);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    const next = name.trim();
    if (!next) {
      setError('Nhập tên cho không gian, ví dụ "Phòng khách".');
      return;
    }
    if (next !== space.name) {
      updateSpace(space.id, { name: next });
      showToast('Đã đổi tên');
    }
    onClose();
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: t.colors.card }}>
      <SheetHeader title="Đổi tên không gian" onClose={onClose} closeLabel="Hủy đổi tên" />
      <View style={{ padding: t.spacing.lg, gap: t.spacing.lg }}>
        <TextField
          label="Tên không gian"
          value={name}
          onChangeText={(v) => {
            setName(v);
            if (error) setError(null);
          }}
          autoFocus
          maxLength={MAX_NAME}
          returnKeyType="done"
          onSubmitEditing={save}
          error={error}
          helper={`Tối đa ${MAX_NAME} ký tự.`}
        />
        <Button label="Lưu tên" fullWidth onPress={save} />
      </View>
    </SafeAreaView>
  );
}

/** `space` được giữ lại khi đóng để nội dung không biến mất trong lúc sheet trượt xuống. */
export function RenameSpaceSheet({ space, visible, onClose }: { space: Space | null; visible: boolean; onClose: () => void }) {
  return (
    <Modal
      visible={visible && space !== null}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      onRequestClose={onClose}
    >
      <SafeAreaProvider>{space ? <RenameForm key={space.id} space={space} onClose={onClose} /> : null}</SafeAreaProvider>
    </Modal>
  );
}
