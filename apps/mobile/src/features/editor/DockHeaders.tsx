/**
 * Phần đầu của khay đáy theo từng chế độ của E1:
 * - Thêm: công tắc Thêm · Xóa, nút mở/thu khay, hàng món thu gọn.
 * - Món đang chọn: tên, giá, kích thước thật, "Đổi với" (gọn bằng khay thu gọn). Tác vụ khác ở thanh nổi trên món, xoay
 *   ở thước xoay.
 * - Xóa: công tắc + trạng thái công cụ (lý do tắt, đang tìm đồ, đang xóa, số món AI nhận ra) + giữ để xem ảnh trước khi xóa.
 * - Chỉnh lại mặt sàn: hướng dẫn, nút dời đường sàn, Xong.
 */
import {
  ArrowCounterClockwise,
  ArrowDown,
  ArrowUp,
  CaretDown,
  CaretUp,
  CheckCircle,
  Eraser,
  Eye,
  HandTap,
  Info,
  PauseCircle,
  Prohibit,
  Selection,
  WifiSlash,
  type Icon as PhosphorIcon,
} from 'phosphor-react-native';
import type { ReactNode } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, View } from 'react-native';

import { AppText, Button, IconButton, Price, SegmentedControl, StatusTag } from '@/components/ui';
import { ProductThumb } from '@/components/ProductArt';
import { formatVND } from '@/lib/format';
import { useTheme } from '@/theme';
import { pressedOpacity } from '@/theme/tokens';
import type { PlacedItem, Product } from '@/types';

import type { EraseBlock } from './useEraseTool';

export type Tool = 'add' | 'erase';

function ToolSwitch({ tool, onChange, trailing }: { tool: Tool; onChange: (t: Tool) => void; trailing?: ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm, paddingHorizontal: t.spacing.md }}>
      <View style={{ flex: 1 }}>
        <SegmentedControl
          accessibilityLabel="Công cụ"
          value={tool}
          onChange={onChange}
          options={[
            { value: 'add', label: 'Thêm đồ' },
            { value: 'erase', label: 'Xóa đồ cũ' },
          ]}
        />
      </View>
      {trailing}
    </View>
  );
}

/** Dòng trạng thái có icon + chữ (không dùng màu một mình). */
function StatusLine({ icon: Icon, busy, text, tone = 'muted', action }: { icon?: PhosphorIcon; busy?: boolean; text: string; tone?: 'muted' | 'strong'; action?: ReactNode }) {
  const t = useTheme();
  return (
    <View
      accessibilityLiveRegion="polite"
      style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm, paddingHorizontal: t.spacing.md, minHeight: 28 }}
    >
      {busy ? (
        <ActivityIndicator size="small" color={t.colors.foreground} />
      ) : Icon ? (
        <Icon size={18} color={t.colors[tone === 'strong' ? 'foreground' : 'mutedForeground']} />
      ) : null}
      <AppText variant="footnote" color={tone === 'strong' ? 'foreground' : 'mutedForeground'} style={{ flex: 1 }}>
        {text}
      </AppText>
      {action}
    </View>
  );
}

export function TrayHeader({
  tool,
  onToolChange,
  open,
  onToggle,
  peek,
}: {
  tool: Tool;
  onToolChange: (t: Tool) => void;
  open: boolean;
  onToggle: () => void;
  /** Hàng món thu gọn, chỉ hiện khi khay đóng. */
  peek?: ReactNode;
}) {
  const t = useTheme();
  // Chiều cao khay thu gọn không đổi theo trạng thái (ảnh neo theo nó): gợi ý bước tiếp theo nằm thành chip trên ảnh.
  return (
    <View style={{ gap: t.spacing.sm }}>
      <ToolSwitch
        tool={tool}
        onChange={onToolChange}
        trailing={
          <IconButton
            icon={open ? CaretDown : CaretUp}
            variant="tinted"
            accessibilityLabel={open ? 'Thu khay đồ' : 'Mở khay đồ: đổi phong cách, lọc loại đồ'}
            onPress={onToggle}
          />
        }
      />
      {!open && peek ? peek : null}
    </View>
  );
}

/** Ô "Đổi với": ảnh vuông bằng đúng bề ngang ô để các ô cách đều; giá đầy đủ (12.400.000 ₫) vừa ô. */
const SWAP_TILE = 56;

/**
 * Panel món đang chọn, gọn bằng khay thu gọn (founder 2026-10-04: panel cao lên che sàn, giới hạn thao tác): dòng tên ·
 * giá · kích thước thật + Chi tiết + Xong, rồi hàng "Đổi với". Không có Tỷ lệ: món luôn đúng kích thước thật (founder
 * 2026-10-04 — phóng to / thu nhỏ dễ khiến người dùng lầm tưởng món vừa không gian). Xoay món 3D ở thước xoay trên ảnh.
 */
export function InspectorHeader({
  item,
  product,
  swapOptions,
  onSwap,
  onInfo,
  onDone,
}: {
  item: PlacedItem;
  product: Product;
  /** Món cùng loại để đổi tại chỗ ("Đổi với", theo IKEA Kreativ). Rỗng / món đã mua thì không hiện hàng. */
  swapOptions: Product[];
  onSwap: (p: Product) => void;
  onInfo: () => void;
  onDone: () => void;
}) {
  const t = useTheme();
  const c = t.colors;
  const { widthCm, depthCm, heightCm } = product.dimensions;
  // Lật, Đổi món, Nhân bản, Bỏ… nằm ở thanh tác vụ nổi trên món (ItemActionBar); khay giữ thông tin và "Đổi với".
  return (
    <View style={{ gap: t.spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm, paddingHorizontal: t.spacing.md }}>
        <View style={{ flex: 1, gap: 1 }}>
          <AppText variant="headline" numberOfLines={1}>
            {product.name}
          </AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: t.spacing.sm, flexWrap: 'wrap' }}>
            <Price amount={product.priceVND} variant="footnote" color="accentText" />
            <AppText variant="footnote" color="mutedForeground" tabular>
              {`${widthCm} × ${depthCm} × ${heightCm} cm`}
            </AppText>
            {item.purchased ? <StatusTag tone="done" label="Đã mua" /> : null}
          </View>
        </View>
        <IconButton icon={Info} variant="tinted" accessibilityLabel={`Xem chi tiết ${product.name}`} onPress={onInfo} />
        <Button variant="plain" label="Xong" onPress={onDone} accessibilityHint="Bỏ chọn món, quay lại khay đồ" />
      </View>

      {!item.purchased && swapOptions.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          accessibilityLabel={`Đổi ${product.name} với món cùng loại`}
          contentContainerStyle={{ paddingHorizontal: t.spacing.md, gap: t.spacing.sm, alignItems: 'flex-start' }}
        >
          {/* Nhãn nằm đầu hàng (không thành dòng riêng) để panel giữ đúng chiều cao khay thu gọn. */}
          <View style={{ height: SWAP_TILE, justifyContent: 'center', paddingRight: t.spacing.xs }} accessibilityRole="header">
            <AppText variant="footnote" weight="600">
              Đổi với
            </AppText>
          </View>
          {swapOptions.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => onSwap(p)}
              accessibilityRole="button"
              accessibilityLabel={`Đổi sang ${p.name}, ${formatVND(p.priceVND)}`}
              accessibilityHint="Thay món đang chọn, giữ nguyên chỗ đặt"
              // Ô rộng hơn ảnh để giá đầy đủ vừa một dòng; ảnh và giá canh giữa ô nên các ô vẫn cách đều.
              style={({ pressed }) => ({
                width: SWAP_TILE + 16,
                alignItems: 'center',
                gap: 2,
                opacity: pressed && Platform.OS === 'ios' ? pressedOpacity : 1,
              })}
            >
              <ProductThumb category={p.category} productId={p.id} size={SWAP_TILE} />
              <AppText variant="caption2" weight="600" tabular numberOfLines={1} maxFontSizeMultiplier={1.2} style={{ color: c.accentText }}>
                {formatVND(p.priceVND)}
              </AppText>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

export function EraseHeader({
  onToolChange,
  block,
  detecting,
  detectedCount,
  objectsLeft,
  pendingCount,
  erasingCount,
  hasErased,
  comparing,
  onCompare,
  onEraseAll,
  onShowAll,
}: {
  onToolChange: (t: Tool) => void;
  block: EraseBlock | null;
  /** AI đang nhận diện đồ trong ảnh (lần đầu vào công cụ). */
  detecting: boolean;
  /** Số món AI nhận ra (kể cả món đã xóa). */
  detectedCount: number;
  /** Số món có viền còn trong ảnh. */
  objectsLeft: number;
  pendingCount: number;
  erasingCount: number;
  hasErased: boolean;
  comparing: boolean;
  onCompare: (on: boolean) => void;
  /** "Xóa hết" (Hide All của IKEA): xóa mọi món còn viền trong một lượt. */
  onEraseAll: () => void;
  /** "Hiện lại hết" (Show All): trả lại mọi món đã xóa, một bước hoàn tác. */
  onShowAll: () => void;
}) {
  const t = useTheme();
  const c = t.colors;
  let status: ReactNode;
  if (block) {
    const icon = block.kind === 'offline' ? WifiSlash : block.kind === 'paused' ? PauseCircle : Prohibit;
    status = <StatusLine icon={icon} text={block.text} tone="strong" />;
  } else if (detecting) {
    status = <StatusLine busy text="AI đang tìm đồ cũ trong ảnh" tone="strong" />;
  } else if (erasingCount > 0) {
    status = <StatusLine busy text={`Đang xóa ${erasingCount} món · chạm món khác để xóa tiếp`} tone="strong" />;
  } else if (pendingCount > 0) {
    status = <StatusLine busy text="Đang nhận ra món bạn chạm" tone="strong" />;
  } else if (objectsLeft > 0) {
    status = <StatusLine icon={Selection} text={`AI nhận ra ${objectsLeft} món đồ cũ trong ảnh`} />;
  } else if (detectedCount > 0) {
    status = <StatusLine icon={CheckCircle} text="Đã xóa hết đồ AI nhận ra · chạm vào món khác để xóa thêm" />;
  } else {
    status = <StatusLine icon={HandTap} text="AI chưa nhận ra món nào · chạm vào món đồ cũ để xóa" />;
  }

  return (
    <View style={{ gap: t.spacing.sm }}>
      <ToolSwitch tool="erase" onChange={onToolChange} />
      {status}
      {!block ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm, paddingHorizontal: t.spacing.md }}>
          <Button
            variant="secondary"
            icon={Eraser}
            label="Xóa hết"
            onPress={onEraseAll}
            disabled={detecting || objectsLeft === 0}
            accessibilityHint="Xóa mọi món có viền trong ảnh. Hoàn tác được."
            style={{ flex: 1, paddingHorizontal: t.spacing.sm }}
          />
          <Button
            variant="secondary"
            icon={ArrowCounterClockwise}
            label="Hiện lại hết"
            onPress={onShowAll}
            disabled={!hasErased}
            accessibilityHint="Trả lại mọi món đã xóa. Hoàn tác được."
            style={{ flex: 1, paddingHorizontal: t.spacing.sm }}
          />
          {hasErased ? (
            <Pressable
              onPressIn={() => onCompare(true)}
              onPressOut={() => onCompare(false)}
              onAccessibilityTap={() => onCompare(!comparing)}
              accessibilityRole="button"
              accessibilityLabel={comparing ? 'Đang xem ảnh gốc' : 'Giữ để xem ảnh gốc'}
              accessibilityHint="Thả tay để về ảnh sau khi xóa. Với VoiceOver, chạm hai lần để bật hoặc tắt."
              accessibilityState={{ selected: comparing }}
              style={{
                width: t.touchTarget,
                height: t.touchTarget,
                borderRadius: t.touchTarget / 2,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: comparing ? c.accent : c.muted,
              }}
            >
              <Eye size={22} color={comparing ? c.onAccent : c.foreground} weight={comparing ? 'fill' : 'regular'} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {hasErased && !block ? (
        <AppText variant="caption1" color="mutedForeground" style={{ paddingHorizontal: t.spacing.md }}>
          Giữ nút mắt để so với ảnh gốc. Bản thử: phần lấp dựng sẵn, chưa phải kết quả AI thật.
        </AppText>
      ) : null}
    </View>
  );
}

export function FloorHeader({ onNudge, onCancel, onDone }: { onNudge: (delta: number) => void; onCancel: () => void; onDone: () => void }) {
  const t = useTheme();
  return (
    <View style={{ gap: t.spacing.sm, paddingHorizontal: t.spacing.md }}>
      <View style={{ gap: 2 }}>
        <AppText variant="headline" accessibilityRole="header">
          Chỉnh lại mặt sàn
        </AppText>
        <AppText variant="footnote" color="mutedForeground">
          Kéo đường sàn tới chỗ sàn gặp chân tường. Món đã đặt giữ nguyên chỗ.
        </AppText>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
        <IconButton icon={ArrowUp} variant="tinted" accessibilityLabel="Dời đường sàn lên" onPress={() => onNudge(-0.02)} />
        <IconButton icon={ArrowDown} variant="tinted" accessibilityLabel="Dời đường sàn xuống" onPress={() => onNudge(0.02)} />
        <View style={{ flex: 1 }} />
        <Button variant="plain" label="Hủy" onPress={onCancel} />
        <Button variant="secondary" label="Xong" onPress={onDone} />
      </View>
    </View>
  );
}
