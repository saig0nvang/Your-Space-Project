/**
 * Canvas tương tác của E1: ảnh phòng + món đã đặt + viền đồ cũ của công cụ Xóa + đường sàn khi chỉnh lại.
 * Một bộ cử chỉ duy nhất cho cả canvas (chạm, kéo, chụm hai ngón), không nhận cử chỉ bắt đầu trong dải
 * 20 pt sát mép trái để vuốt mép quay lại của hệ thống vẫn chạy (docs/screens.md §2).
 *
 * Bản thử: món là ảnh mẫu đã tách nền (hoặc hình minh họa SVG); cỡ món suy từ kích thước thật và vị trí trên sàn (geometry.ts).
 */
import { ArrowsDownUp, ArrowsOutCardinal } from 'phosphor-react-native';
import { ActivityIndicator, StyleSheet, View, type AccessibilityActionEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Image } from 'expo-image';
import Svg, { Polygon, Polyline } from 'react-native-svg';

import { AppText, StatusTag } from '@/components/ui';
import { findProduct } from '@/data/catalog';
import { formatVND } from '@/lib/format';
import { useTheme } from '@/theme';
import type { Calibration, ErasedRegion, PlacedItem, Product } from '@/types';

import { EDGE_GUARD, clamp, hitRect, itemLayout, wallBaseAt, wallBasePoints, type Frame, type ItemLayout } from './geometry';
import { DIM_CLEARANCE, DimensionMarks } from './DimensionMarks';
import { SceneLayers } from './SceneLayers';
import { productImage } from '@/data/productImages';
import { useDevFlags } from '@/store/devFlags';
import type { ImageBox, SampleObject } from '@/data/samplePhotos';
import type { PendingPoint } from './useEraseTool';

export type CanvasMode = 'add' | 'erase' | 'floor';
export type Point = { x: number; y: number };
export type ItemA11yAction = 'left' | 'right' | 'up' | 'down';

const HANDLE = 44;

type Placed = { item: PlacedItem; product: Product; layout: ItemLayout };

/**
 * Viền bám dáng một món đồ cũ AI nhận ra trong ảnh (công cụ Xóa, kiểu IKEA Kreativ): chạm là xóa.
 * MASTER.md · Viền đồ cũ. Bản thử: nét viền dựng sẵn từ mask SAM của ảnh mẫu; vùng chọn theo điểm thì viền chữ nhật.
 * Đang xóa: viền mờ đi, giữa món hiện "Đang xóa".
 */
function ObjectOutline({
  region,
  object,
  frame,
  index,
  busy,
  onA11yTap,
}: {
  region: ErasedRegion;
  /** Món trong ảnh mẫu (có nét viền dựng sẵn). */
  object: SampleObject | undefined;
  frame: Frame;
  index: number;
  busy: boolean;
  onA11yTap?: () => void;
}) {
  const t = useTheme();
  const c = t.colors;
  const name = region.label ?? 'Vật thể';
  const box = (b: ImageBox) => ({ left: b.x * frame.width, top: b.y * frame.height, width: b.w * frame.width, height: b.h * frame.height });
  return (
    <Animated.View
      entering={FadeIn.duration(t.motion.base).delay(index * 40)}
      exiting={FadeOut.duration(t.motion.fast)}
      pointerEvents="box-none"
      style={StyleSheet.absoluteFill}
    >
      {object ? (
        <Image
          source={object.outline.source}
          contentFit="fill"
          accessible={false}
          style={{ position: 'absolute', ...box(object.outline), opacity: busy ? 0.5 : 1 }}
        />
      ) : (
        <View
          style={{ position: 'absolute', ...box(region), borderRadius: t.radius.sm, borderWidth: 2.5, borderColor: c.onImage, opacity: busy ? 0.5 : 1 }}
        />
      )}
      {/* Vùng nhận VoiceOver theo khung bao của món; chạm bằng ngón tay đi qua cử chỉ của canvas. */}
      <View
        accessible
        accessibilityRole={busy ? 'text' : 'button'}
        accessibilityLabel={busy ? `Đang xóa ${name}` : `Xóa ${name}`}
        accessibilityHint={busy ? undefined : 'Chạm hai lần để xóa khỏi ảnh. Hoàn tác được.'}
        onAccessibilityTap={busy ? undefined : onA11yTap}
        style={{ position: 'absolute', ...box(region), alignItems: 'center', justifyContent: 'center' }}
      >
        {busy ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: t.spacing.xs,
              paddingHorizontal: t.spacing.sm,
              paddingVertical: 3,
              borderRadius: t.radius.pill,
              backgroundColor: c.accent,
            }}
          >
            <ActivityIndicator size="small" color={c.onAccent} />
            <AppText variant="caption1" weight="600" maxFontSizeMultiplier={1.3} style={{ color: c.onAccent }}>
              Đang xóa
            </AppText>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

/**
 * Món đang kéo hít vào tường: vạch sáng chạy theo chân tường sau lưng món, dài hơn món hai bên, vẽ dưới lớp món như
 * chính đường chân tường (MASTER.md · Đặt đồ sát tường).
 */
function WallGuide({ points, width, height }: { points: string; width: number; height: number }) {
  const t = useTheme();
  return (
    <Animated.View entering={FadeIn.duration(t.motion.fast)} exiting={FadeOut.duration(t.motion.fast)} pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={width} height={height}>
        <Polyline points={points} fill="none" stroke={t.colors.scrim} strokeOpacity={0.35} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
        <Polyline points={points} fill="none" stroke={t.colors.onImage} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </Animated.View>
  );
}

export function Canvas({
  frame,
  photoUri,
  items,
  baseItems,
  erasedRegions,
  calibration,
  mode,
  selectedId,
  hideFills,
  eraseTargets,
  erasing,
  pending,
  photoLabel,
  coveredBottom = 0,
  canRotate,
  onTap,
  onDrag,
  onRotate,
  onFloorDrag,
  onSelectItem,
  onItemA11yAction,
  onFloorA11yStep,
  onEraseTarget,
  sampleObjects,
  wallGuide,
}: {
  frame: Frame;
  photoUri: string | null;
  /** Món đang hiển thị (đã áp dụng kéo / chụm đang diễn ra). */
  items: PlacedItem[];
  /** Món theo vị trí đã ghi trong store. */
  baseItems: PlacedItem[];
  erasedRegions: ErasedRegion[];
  /** Đã áp dụng đường sàn đang chỉnh (nếu có). */
  calibration: Calibration;
  mode: CanvasMode;
  selectedId: string | null;
  hideFills: boolean;
  /** Món đồ cũ AI nhận ra còn trong ảnh (công cụ Xóa): vẽ viền, chạm là xóa. */
  eraseTargets: ErasedRegion[];
  erasing: ErasedRegion[];
  pending: PendingPoint[];
  /** VoiceOver: chạm hai lần vào viền một món để xóa món đó. */
  onEraseTarget: (region: ErasedRegion) => void;
  /** Đồ có sẵn của ảnh mẫu (nét viền dựng sẵn). */
  sampleObjects?: SampleObject[];
  /** Món đang kéo đã hít vào tường: vạch sáng ở chân tường phía sau món, trong khoảng x (chuẩn hoá). */
  wallGuide?: { x0: number; x1: number } | null;
  photoLabel: string;
  /** Phần đáy ảnh đang bị panel món phủ lên (pt): tay cầm không đặt vào đó. */
  coveredBottom?: number;
  /** Chạm lên ảnh (toạ độ chuẩn hoá); `itemId` khi chạm trúng một món đã đặt. */
  onTap: (p: Point, itemId: string | null) => void;
  onDrag: (phase: 'start' | 'move' | 'end' | 'cancel', id: string, p: Point) => void;
  /**
   * Xoay hai ngón món đang chọn (chỉ món 3D, theo IKEA): góc xoay thêm so với lúc bắt đầu (độ, dương = ngược chiều kim
   * đồng hồ nhìn từ trên xuống). Không có chụm để phóng to / thu nhỏ: món luôn đúng kích thước thật.
   */
  onRotate: (phase: 'move' | 'end' | 'cancel', id: string, deltaDeg: number) => void;
  /** Món đang chọn xoay được (món 3D). */
  canRotate: boolean;
  onFloorDrag: (y: number) => void;
  onSelectItem: (id: string) => void;
  onItemA11yAction: (id: string, action: ItemA11yAction) => void;
  onFloorA11yStep: (delta: number) => void;
}) {
  const t = useTheme();
  const c = t.colors;
  const showGrid = useDevFlags((s) => s.show3dGrid);
  const W = frame.width;
  const H = frame.height;
  const objectFor = (r: ErasedRegion) => (r.objectId ? sampleObjects?.find((o) => o.id === r.objectId) : undefined);
  // Ảnh có thể rộng hơn màn (cắt hai bên): vùng nhìn thấy trong toạ độ canvas là [visMin, W - visMin].
  const visMin = Math.max(0, -frame.left);
  // Dải mép trái tính theo mép màn, không theo mép ảnh.
  const edgeGuard = EDGE_GUARD + visMin;

  const layoutAll = (list: PlacedItem[]): Placed[] => {
    const out: Placed[] = [];
    for (const item of [...list].sort((a, b) => a.y - b.y)) {
      const product = findProduct(item.productId);
      if (product) out.push({ item, product, layout: itemLayout(item, product, frame, calibration) });
    }
    return out;
  };
  // Vẽ theo vị trí đang hiển thị (kể cả lúc đang kéo); dò chạm theo vị trí đã ghi để cử chỉ kéo ổn định.
  const placed = layoutAll(items);
  const placedBase = layoutAll(baseItems);
  const selected = placed.find((p) => p.item.id === selectedId) ?? null;
  const selectedBase = placedBase.find((p) => p.item.id === selectedId) ?? null;

  /** Tay cầm dời: dưới chân món; sát mép dưới ảnh thì đưa lên trên đầu món. */
  const handleFor = (p: Placed | null) => {
    if (!p || mode !== 'add') return null;
    const b = p.layout.bounds;
    const cx = clamp((b.x0 + b.x1) / 2, HANDLE / 2, W - HANDLE / 2);
    // Chừa chỗ cho chip số đo "rộng … cm" ngay dưới chân món (DimensionMarks).
    const below = b.y1 + DIM_CLEARANCE + HANDLE / 2;
    // Không đủ chỗ dưới chân món thì bỏ tay cầm (vẫn kéo thẳng vào món được); phía trên là chỗ của thanh tác vụ.
    return below + HANDLE / 2 <= H - coveredBottom ? { cx, cy: below } : null;
  };
  const handle = handleFor(selected);
  const handleBase = handleFor(selectedBase);

  /** Món (theo vị trí đã ghi) tại điểm chạm, ưu tiên tay cầm của món đang chọn rồi món ở gần. */
  const itemAt = (px: number, py: number): PlacedItem | null => {
    if (handleBase && selectedBase && Math.abs(px - handleBase.cx) <= HANDLE / 2 && Math.abs(py - handleBase.cy) <= HANDLE / 2) {
      return selectedBase.item;
    }
    for (let i = placedBase.length - 1; i >= 0; i--) {
      const r = hitRect(placedBase[i].layout.bounds);
      if (px >= r.x0 && px <= r.x1 && py >= r.y0 && py <= r.y1) return placedBase[i].item;
    }
    return null;
  };

  const tap = Gesture.Tap()
    .runOnJS(true)
    .maxDistance(10)
    .hitSlop({ left: -edgeGuard })
    .onEnd((e, success) => {
      if (!success || mode === 'floor') return;
      onTap({ x: clamp(e.x / W, 0, 1), y: clamp(e.y / H, 0, 1) }, itemAt(e.x, e.y)?.id ?? null);
    });

  // Kéo: điểm bắt đầu = vị trí hiện tại trừ quãng đã kéo, nên không cần giữ trạng thái tạm giữa các sự kiện.
  const dragTarget = (e: { x: number; y: number; translationX: number; translationY: number }) => {
    const it = itemAt(e.x - e.translationX, e.y - e.translationY);
    return it ? { id: it.id, p: { x: it.x + e.translationX / W, y: it.y + e.translationY / H } } : null;
  };

  const pan = Gesture.Pan()
    .runOnJS(true)
    .minDistance(10)
    .hitSlop({ left: -edgeGuard })
    .onStart((e) => {
      if (mode === 'floor') return onFloorDrag(e.y / H);
      const d = mode === 'add' ? dragTarget(e) : null;
      if (d) onDrag('start', d.id, d.p);
    })
    .onUpdate((e) => {
      if (mode === 'floor') return onFloorDrag(e.y / H);
      const d = mode === 'add' ? dragTarget(e) : null;
      if (d) onDrag('move', d.id, d.p);
    })
    .onEnd((e) => {
      if (mode === 'floor') return onFloorDrag(e.y / H);
      const d = mode === 'add' ? dragTarget(e) : null;
      if (d) onDrag('end', d.id, d.p);
    })
    .onFinalize((_e, success) => {
      if (!success) onDrag('cancel', '', { x: 0, y: 0 });
    });

  // Vặn hai ngón trên màn theo chiều kim đồng hồ = món quay theo chiều kim đồng hồ nhìn từ trên xuống (góc âm).
  const toDeg = (rad: number) => -(rad * 180) / Math.PI;
  const rotate = Gesture.Rotation()
    .runOnJS(true)
    .enabled(canRotate)
    .hitSlop({ left: -edgeGuard })
    .onUpdate((e) => {
      if (mode === 'add' && selectedId) onRotate('move', selectedId, toDeg(e.rotation));
    })
    .onEnd((e) => {
      if (mode === 'add' && selectedId) onRotate('end', selectedId, toDeg(e.rotation));
    })
    .onFinalize((_e, success) => {
      if (!success) onRotate('cancel', '', 0);
    });

  const gesture = Gesture.Race(Gesture.Simultaneous(pan, rotate), tap);
  // Đường chân tường (theo bức tường thật khi AI nhận ra), toạ độ pt trên khung ảnh.
  const svgPoints = (x0: number, x1: number) =>
    wallBasePoints(x0, x1, calibration)
      .map((p) => `${(p.x * W).toFixed(1)},${(p.y * H).toFixed(1)}`)
      .join(' ');
  const floorY = wallBaseAt(0.5, calibration) * H;

  return (
    <GestureDetector gesture={gesture}>
      <View style={{ position: 'absolute', left: frame.left, top: frame.top, width: W, height: H }}>
        <SceneLayers
          photoUri={photoUri}
          items={items}
          erasedRegions={erasedRegions}
          calibration={calibration}
          frame={frame}
          hideFills={hideFills}
          photoLabel={photoLabel}
          selectedId={mode === 'add' ? selectedId : null}
          showGrid={showGrid}
          live3D
          underlay={wallGuide && mode === 'add' ? <WallGuide points={svgPoints(wallGuide.x0, wallGuide.x1)} width={W} height={H} /> : null}
        />



        {/* Nhãn "Đã mua" trên ảnh (E4 · Đã mua một phần). */}
        {placed
          .filter((p) => p.item.purchased && !(mode === 'add' && p.item.id === selectedId))
          .map((p) => (
            <View
              key={`bought-${p.item.id}`}
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: clamp((p.layout.bounds.x0 + p.layout.bounds.x1) / 2 - 44, visMin, W - visMin - 88),
                top: Math.max(p.layout.bounds.y0 - 30, 0),
                width: 88,
                alignItems: 'center',
              }}
            >
              <StatusTag tone="done" label="Đã mua" />
            </View>
          ))}

        {/* Viền chọn chữ nhật chỉ cho món chưa có ảnh (hình SVG); món có ảnh dùng viền bám dáng trong SceneLayers. */}
        {selected && mode === 'add' && !productImage(selected.product.id) ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: selected.layout.bounds.x0 - 6,
              top: selected.layout.bounds.y0 - 6,
              width: selected.layout.bounds.x1 - selected.layout.bounds.x0 + 12,
              height: selected.layout.bounds.y1 - selected.layout.bounds.y0 + 12,
              borderRadius: t.radius.sm,
              borderWidth: 2,
              borderColor: c.card,
            }}
          >
            <View
              style={[StyleSheet.absoluteFill, { borderRadius: t.radius.sm - 2, borderWidth: 2, borderColor: c.foreground }]}
            />
          </View>
        ) : null}
        {/* Số đo thật của món đang chọn (founder duyệt 2026-10-03). */}
        {selected && mode === 'add' ? (
          <DimensionMarks bounds={selected.layout.bounds} product={selected.product} frameW={W} visMin={visMin} />
        ) : null}
        {handle ? (
          <View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                left: handle.cx - HANDLE / 2,
                top: handle.cy - HANDLE / 2,
                width: HANDLE,
                height: HANDLE,
                borderRadius: HANDLE / 2,
                backgroundColor: c.card,
                alignItems: 'center',
                justifyContent: 'center',
              },
              t.shadow('md'),
            ]}
          >
            <ArrowsOutCardinal size={22} color={c.foreground} weight="bold" />
          </View>
        ) : null}

        {/* Lớp trợ năng: mỗi món là một phần tử VoiceOver đọc được, có thao tác dời thay cho kéo. */}
        {placed.map((p) => {
          const r = hitRect(p.layout.bounds);
          const isSelected = p.item.id === selectedId;
          return (
            <View
              key={`a11y-${p.item.id}`}
              pointerEvents="none"
              accessible
              accessibilityRole="button"
              accessibilityLabel={`${p.product.name}, ${formatVND(p.product.priceVND)}${p.item.purchased ? ', đã mua' : ''}`}
              accessibilityHint={isSelected ? 'Dùng thao tác tùy chỉnh để dời món' : 'Chạm hai lần để chọn món'}
              accessibilityState={{ selected: isSelected }}
              accessibilityActions={
                isSelected && mode === 'add'
                  ? [
                      { name: 'left', label: 'Dời sang trái' },
                      { name: 'right', label: 'Dời sang phải' },
                      { name: 'up', label: 'Dời ra xa' },
                      { name: 'down', label: 'Dời lại gần' },
                    ]
                  : undefined
              }
              onAccessibilityAction={(e: AccessibilityActionEvent) =>
                onItemA11yAction(p.item.id, e.nativeEvent.actionName as ItemA11yAction)
              }
              onAccessibilityTap={() => onSelectItem(p.item.id)}
              style={{ position: 'absolute', left: r.x0, top: r.y0, width: r.x1 - r.x0, height: r.y1 - r.y0 }}
            />
          );
        })}

        {/* Công cụ Xóa: viền món đồ cũ (chạm là xóa), món đang xóa, điểm đang chờ nhận vật thể. */}
        {mode === 'erase'
          ? eraseTargets.map((r, i) => (
              <ObjectOutline
                key={r.id}
                region={r}
                object={objectFor(r)}
                frame={frame}
                index={i}
                busy={false}
                onA11yTap={() => onEraseTarget(r)}
              />
            ))
          : null}
        {erasing.map((r, i) => (
          <ObjectOutline key={`erasing-${r.id}`} region={r} object={objectFor(r)} frame={frame} index={i} busy />
        ))}
        {pending.map((p) => (
          <View
            key={p.id}
            pointerEvents="none"
            accessibilityLabel="Đang chọn vật thể"
            style={[
              {
                position: 'absolute',
                left: p.x * W - 20,
                top: p.y * H - 20,
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: c.card,
                alignItems: 'center',
                justifyContent: 'center',
              },
              t.shadow('md'),
            ]}
          >
            <ActivityIndicator size="small" color={c.foreground} />
          </View>
        ))}

        {/* Chỉnh lại mặt sàn: đường sàn + tay cầm kéo lên/xuống. */}
        {mode === 'floor' ? (
          <>
            {/* Vùng sàn và chân tường, đi theo bức tường thật khi AI nhận ra; kéo là dời cả đường. */}
            <Svg pointerEvents="none" width={W} height={H} style={StyleSheet.absoluteFill}>
              <Polygon points={`${svgPoints(0, 1)} ${W},${H} 0,${H}`} fill={c.card} opacity={0.18} />
              <Polyline points={svgPoints(0, 1)} fill="none" stroke={c.card} strokeWidth={4} strokeLinejoin="round" />
              <Polyline points={svgPoints(0, 1)} fill="none" stroke={c.foreground} strokeWidth={2} strokeLinejoin="round" />
            </Svg>
            <View
              accessible
              accessibilityRole="adjustable"
              accessibilityLabel="Đường sàn"
              accessibilityValue={{ text: `${Math.round(calibration.floorLineY * 100)}% chiều cao ảnh` }}
              accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
              onAccessibilityAction={(e: AccessibilityActionEvent) =>
                onFloorA11yStep(e.nativeEvent.actionName === 'increment' ? -0.02 : 0.02)
              }
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: W / 2 - HANDLE / 2,
                top: floorY - HANDLE / 2,
                flexDirection: 'row',
                alignItems: 'center',
                gap: t.spacing.sm,
              }}
            >
              <View
                style={[
                  {
                    width: HANDLE,
                    height: HANDLE,
                    borderRadius: HANDLE / 2,
                    backgroundColor: c.card,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  t.shadow('md'),
                ]}
              >
                <ArrowsDownUp size={22} color={c.foreground} weight="bold" />
              </View>
              <View style={{ paddingHorizontal: t.spacing.sm, paddingVertical: 2, borderRadius: t.radius.sm, backgroundColor: c.card }}>
                <AppText variant="caption1" weight="600">
                  Đường sàn
                </AppText>
              </View>
            </View>
          </>
        ) : null}
      </View>
    </GestureDetector>
  );
}
