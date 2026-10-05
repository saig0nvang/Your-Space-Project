/**
 * E1 — Trình chỉnh sửa (docs/screens.md §5 E1; E04, E05; E3 khi rời màn).
 * Bản thử thuần giả lập: món là ảnh mẫu đã tách nền (hoặc hình minh họa SVG), AI gọi services/ai (giả lập), mọi thay đổi ghi thẳng
 * vào store để app bị đóng không mất dữ liệu (E6-US4). Lịch sử hoàn tác giữ cục bộ trong màn.
 */
import * as Haptics from 'expo-haptics';
import { router, useFocusEffect, useNavigation } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import { CaretLeft, HandTap, PuzzlePiece, Swap, WarningCircle } from 'phosphor-react-native';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Banner, Button, EmptyState, IconButton, OfflineBanner, Screen, showToast } from '@/components/ui';
import { PRODUCTS, findProduct, findStyle } from '@/data/catalog';
import { renders3D } from '@/data/productModels';
import { findSamplePhoto } from '@/data/samplePhotos';
import { openProductSheet, openSaveSheet, startBuy, startCapture } from '@/flows';
import { confirmAction } from '@/lib/confirm';
import { localId } from '@/lib/id';
import { useIsOnline } from '@/services/network';
import { useAppStore } from '@/store/appStore';
import { useDevFlags } from '@/store/devFlags';
import { useEditorBridge } from '@/store/editorBridge';
import { useTheme } from '@/theme';
import type { PlacedItem, Product, Space, StyleId } from '@/types';

import { Canvas, type ItemA11yAction, type Point } from './Canvas';
import { DIM_CLEARANCE } from './DimensionMarks';
import { Dock } from './Dock';
import { EraseHeader, FloorHeader, InspectorHeader, TrayHeader, type Tool } from './DockHeaders';
import { Editor2D } from './Editor2D';
import { EstimateBar } from './EstimateBar';
import {
  EDGE_GUARD,
  againstWallAt,
  clamp,
  clampToFloor,
  computePhotoFrame,
  isAgainstWall,
  itemLayout,
  normalizeAngle,
  placeOnFloor,
  wallBaseAt,
} from './geometry';
import { ItemActionBar } from './ItemActionBar';
import { RotationRuler } from './RotationRuler';
import { estimateOf, hasUnsavedChanges, snapshotOf } from './model';
import { FadeSlot, InfoChip, ManualModeChip, NoticeStack, TransientNotice, type Notice } from './Notices';
import { TopBar } from './TopBar';
import { PeekStrip, TrayContent, styleOrderFor, type CategoryFilter } from './TrayContent';
import { useEditorHistory } from './useEditorHistory';

import { useEraseTool, type EraseBlock } from './useEraseTool';

/** Món cùng loại để "Đổi với": cùng phong cách đứng trước, chỉ món đang bán, bỏ chính món đang chọn. */
function swapOptionsFor(product: Product): Product[] {
  return PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id && p.status === 'available').sort(
    (a, b) => Number(b.styleId === product.styleId) - Number(a.styleId === product.styleId),
  );
}

/** Chỗ chừa cho một thông báo hai dòng dưới thanh trên (InfoChip có nút "Hoàn tác"). */
const NOTICE_SLOT = 48;
/** Thước xoay cao tối đa (pt): đủ nhìn ±40° quanh góc hiện tại. */
const RULER_MAX_H = 260;
/** Chiều cao và khoảng cách tới món của thanh tác vụ (khớp ItemActionBar), để thước xoay tránh thanh. */
const ACTION_BAR_H = 60;
const ACTION_BAR_GAP = 12;

function readSpace(id: string): Space | undefined {
  return useAppStore.getState().spaces.find((s) => s.id === id);
}

/** Không gian không tồn tại (đã xóa, link cũ). */
function MissingSpace() {
  const t = useTheme();
  return (
    <Screen>
      <View style={{ paddingHorizontal: t.spacing.md, paddingTop: t.spacing.xs }}>
        <IconButton icon={CaretLeft} variant="tinted" accessibilityLabel="Quay lại" onPress={() => router.back()} />
      </View>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState
          icon={WarningCircle}
          title="Không mở được không gian này"
          body="Không gian có thể đã bị xóa khỏi máy này. Các không gian đã lưu nằm trong Phòng của tôi."
          actionLabel="Về Phòng của tôi"
          actionVariant="secondary"
          onAction={() => router.navigate('/rooms')}
        />
      </View>
    </Screen>
  );
}

export function EditorScreen({ spaceId }: { spaceId: string }) {
  const live = useAppStore((s) => s.spaces.find((sp) => sp.id === spaceId));
  // Giữ hình ảnh lúc rời màn (bỏ thay đổi / xóa bản nháp) để màn không nháy trong lúc trượt ra.
  const [frozen, setFrozen] = useState<Space | null>(null);
  const space = frozen ?? live;
  if (!space) return <MissingSpace />;
  return <Editor space={space} onFreeze={setFrozen} />;
}

/** Món đang kéo: vị trí tạm (chưa ghi lịch sử) và đã hít vào tường chưa. */
type DragState = { id: string; x: number; y: number; wall: boolean };
/** Món đang xoay (thước xoay hoặc vặn hai ngón): góc tạm, chưa ghi lịch sử. */
type RotateState = { id: string; deg: number; x: number; y: number };

function Editor({ space, onFreeze }: { space: Space; onFreeze: (s: Space) => void }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const navigation = useNavigation();
  const online = useIsOnline();
  const aiScenario = useDevFlags((s) => s.aiScenario);
  const lowEnd = useDevFlags((s) => s.lowEndDevice);
  const spaceId = space.id;

  const [tool, setTool] = useState<Tool>('add');
  const [floorDraft, setFloorDraft] = useState<number | null>(null);
  // Mở vào là thấy trọn căn phòng: khay thu gọn còn một hàng món (critique 2026-10-03).
  const [trayOpen, setTrayOpen] = useState(false);
  const [trayStyle, setTrayStyle] = useState<StyleId>(space.styleId);
  const [trayCategory, setTrayCategory] = useState<CategoryFilter>('all');
  /** Món gợi ý đặt (từ "Thử trong phòng của bạn" ở trang món): sáng lên ở hàng món, chip trên ảnh có nút "Đặt". */
  const [suggestedId, setSuggestedId] = useState<string | null>(null);
  /** Đang "Đổi món" cho món này: chọn món trong khay sẽ thay vào đúng chỗ. */
  const [replaceId, setReplaceId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [rotating, setRotating] = useState<RotateState | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [barH, setBarH] = useState(insets.bottom + 72);
  /** Chiều cao khay thu gọn (0 = chưa đo). Ảnh neo theo nó: đo lần đầu, sau đó chỉ cho tăng. */
  const [trayHeaderH, setTrayHeaderH] = useState(0);
  /** Chiều cao đầu khay đang hiện; panel món có thể cao hơn khay thu gọn. */
  const [headerH, setHeaderH] = useState(0);
  /** Chiều cao thanh trên, để thanh tác vụ của món không đè lên. */
  const [topBarH, setTopBarH] = useState(0);
  /** "Hợp với": khay đang mở theo phong cách của món này. */
  const [goesWithId, setGoesWithId] = useState<string | null>(null);
  /** Độ nâng cảnh khi panel món phủ chân món đang chọn (xem phần tính bên dưới). */
  const [lift, setLift] = useState<{ key: string | null; value: number }>({ key: null, value: 0 });
  const liftY = useSharedValue(0);
  const noticeSeq = useRef(0);

  const history = useEditorHistory(spaceId);

  useEffect(() => {
    liftY.set(withTiming(-lift.value, { duration: t.motion.base, easing: Easing.out(Easing.cubic) }));
  }, [lift.value, liftY, t.motion.base]);
  const liftStyle = useAnimatedStyle(() => ({ transform: [{ translateY: liftY.value }] }));
  const floorEditing = floorDraft !== null;
  const floorLineY = floorDraft ?? space.calibration.floorLineY;

  const showNotice = (n: Omit<Notice, 'id'>, ms = 4500) => {
    noticeSeq.current += 1;
    const id = noticeSeq.current;
    setNotice({ ...n, id });
    setTimeout(() => setNotice((cur) => (cur?.id === id ? null : cur)), ms);
  };

  const eraseBlock: EraseBlock | null = !space.photoSent
    ? { kind: 'consent', text: 'Cần gửi ảnh lên hệ thống để xóa đồ cũ' }
    : !online
      ? { kind: 'offline', text: 'Xóa đồ cũ cần mạng. Đặt, kéo, xoay món vẫn dùng được.' }
      : aiScenario === 'paused'
        ? { kind: 'paused', text: 'AI đang tạm ngưng nên chưa xóa được đồ cũ. Thêm đồ vẫn dùng bình thường.' }
        : null;

  // Mỗi thao tác mới làm chip cũ hết hiệu lực (chip có nút "Hoàn tác" chỉ đúng với thao tác vừa xong).
  const commit: typeof history.commit = (recipe) => {
    const changed = history.commit(recipe);
    if (changed) setNotice(null);
    return changed;
  };

  const samplePhoto = findSamplePhoto(space.photoUri);
  const erase = useEraseTool({
    active: tool === 'erase' && !lowEnd && floorDraft === null,
    photoKey: space.photoUri ?? space.id,
    objects: samplePhoto?.objects,
    erasedRegions: space.erasedRegions,
    block: eraseBlock,
    commit,
    onErased: (rs) =>
      showNotice(
        {
          kind: 'ai',
          text: `Đã xóa ${rs.length === 1 ? (rs[0].label ?? 'món đồ cũ') : `${rs.length} món`} · hoàn tác nếu chưa ưng`,
          undoable: true,
        },
        7000,
      ),
  });
  const leaveErase = erase.leave;

  // E3 → "Lưu không gian": lưu xong ở E2 thì tiếp tục rời màn như người dùng định làm.
  const leaveAfterSave = useRef<Parameters<typeof navigation.dispatch>[0] | null>(null);

  // ── Cầu nối với màn khác: đánh dấu không gian đang mở; nhận món "Thử trong phòng của bạn" từ sheet chi tiết.
  // Sheet mở đè lên E1 (chi tiết món, Lưu, Mua) không tính là rời màn: chỉ xóa đánh dấu khi E1 bị gỡ.
  useEffect(
    () => () => {
      const bridge = useEditorBridge.getState();
      if (bridge.openSpaceId === spaceId) bridge.setOpenSpace(null);
    },
    [spaceId],
  );
  useFocusEffect(
    useCallback(() => {
      const leaving = leaveAfterSave.current;
      leaveAfterSave.current = null;
      const now = readSpace(spaceId);
      if (leaving && now && !hasUnsavedChanges(now)) {
        navigation.dispatch(leaving);
        return undefined;
      }
      const bridge = useEditorBridge.getState();
      bridge.setOpenSpace(spaceId);
      const pending = findProduct(bridge.consumePendingProduct() ?? undefined);
      if (pending) {
        leaveErase();
        setTool('add');
        setSelectedId(null);
        setSuggestedId(pending.id);
        setTrayStyle(pending.styleId);
        setTrayOpen(false);
      }
      return undefined;
    }, [spaceId, leaveErase, navigation]),
  );

  // ── E3: rời màn khi có thay đổi chưa lưu. Mốc khôi phục = trạng thái lúc mở, cập nhật mỗi lần lưu.
  const baseline = useRef<Space | null>(null);
  useEffect(() => {
    baseline.current = readSpace(spaceId) ?? null;
    return useAppStore.subscribe((state) => {
      const sp = state.spaces.find((s) => s.id === spaceId);
      if (sp && sp.savedAt !== null && sp.savedAt !== baseline.current?.savedAt) baseline.current = sp;
    });
  }, [spaceId]);

  const unsaved = hasUnsavedChanges(space);
  usePreventRemove(unsaved, ({ data }) => {
    confirmAction({
      title: 'Không gian có thay đổi chưa lưu',
      message:
        space.savedAt === null
          ? 'Lưu để mở lại trong Phòng của tôi. Bỏ thay đổi thì không gian này bị xóa.'
          : 'Lưu để giữ thay đổi. Bỏ thay đổi thì không gian về như lần lưu trước.',
      options: [{ label: 'Lưu không gian' }, { label: 'Bỏ thay đổi', style: 'destructive' }, { label: 'Ở lại', style: 'cancel' }],
    }).then((i) => {
      if (i === 0) {
        leaveAfterSave.current = data.action;
        openSaveSheet(spaceId);
        return;
      }
      if (i !== 1) return;
      const current = readSpace(spaceId);
      if (current) {
        onFreeze(current);
        const store = useAppStore.getState();
        if (current.savedAt === null) store.deleteSpace(spaceId);
        else store.replaceSpace(baseline.current ?? current);
      }
      navigation.dispatch(data.action);
    });
  });

  // Bản nháp chưa từng lưu và chưa có gì: rời màn thì dọn luôn, không để lại dữ liệu thừa trên máy.
  useEffect(
    () =>
      navigation.addListener('beforeRemove', () => {
        const sp = readSpace(spaceId);
        if (sp && sp.savedAt === null && !hasUnsavedChanges(sp)) {
          onFreeze(sp);
          useAppStore.getState().deleteSpace(spaceId);
        }
      }),
    [navigation, spaceId, onFreeze],
  );

  // ── Món hiển thị: áp dụng kéo / xoay đang diễn ra (chưa ghi vào lịch sử). Xoay sát tường: món tạm lùi ra (rotatedPos).
  const items: PlacedItem[] = space.items.map((it) => {
    let next = it;
    if (drag?.id === it.id) next = { ...next, x: drag.x, y: drag.y };
    if (rotating?.id === it.id) next = { ...next, rotationYDeg: rotating.deg, x: rotating.x, y: rotating.y };
    return next;
  });
  const selectedItem = tool === 'add' && !floorEditing ? (items.find((i) => i.id === selectedId) ?? null) : null;
  const selectedProduct = selectedItem ? findProduct(selectedItem.productId) : undefined;
  const replaceTarget = replaceId ? space.items.find((it) => it.id === replaceId) : undefined;
  const replaceProduct = replaceTarget ? findProduct(replaceTarget.productId) : undefined;
  const suggestedProduct = findProduct(suggestedId ?? undefined);
  const estimate = estimateOf(space.items);
  const goesWithProduct = goesWithId && trayOpen ? findProduct(goesWithId) : undefined;

  // ── Khung ảnh: phủ từ đỉnh màn tới mép khay thu gọn.
  const reservedTrayH = trayHeaderH || 176;
  const frame = computePhotoFrame({ screenW, screenH, aspect: space.photoAspect, bottomReserved: barH + reservedTrayH });
  const calibration = { ...space.calibration, floorLineY };

  // Panel món cao hơn khay thu gọn nên phủ lên đáy ảnh. Chân món đang chọn (kèm số đo) mà bị phủ thì nâng cả cảnh lên
  // vừa đủ, tối đa bằng phần panel cao hơn, nên đáy ảnh không bao giờ hở. Tính theo vị trí đã ghi, một lần cho mỗi lần
  // chọn món / đổi món / panel đổi cao: lúc kéo món, cảnh đứng yên dưới ngón tay.
  const selectedSaved = selectedItem ? space.items.find((it) => it.id === selectedItem.id) : undefined;
  const panelH = selectedItem ? Math.max(headerH, reservedTrayH) : reservedTrayH;
  const liftKey = selectedSaved && selectedProduct ? `${selectedSaved.id}:${selectedProduct.id}:${panelH}:${reservedTrayH}:${barH}` : null;
  if (lift.key !== liftKey) {
    let value = 0;
    if (selectedSaved && selectedProduct && panelH > reservedTrayH) {
      const b = itemLayout(selectedSaved, selectedProduct, frame, calibration).bounds;
      const panelTop = screenH - barH - panelH;
      value = clamp(frame.top + b.y1 + DIM_CLEARANCE + t.spacing.sm - panelTop, 0, panelH - reservedTrayH);
    }
    setLift({ key: liftKey, value });
  }

  // ── Thao tác (mỗi thao tác hoàn chỉnh = một bước hoàn tác).
  const updateItem = (id: string, fn: (it: PlacedItem) => PlacedItem) =>
    commit((sp) => {
      const target = sp.items.find((it) => it.id === id);
      if (!target) return null;
      const next = fn(target);
      const same =
        next.x === target.x && next.y === target.y && next.rotationYDeg === target.rotationYDeg && next.scale === target.scale;
      if (same) return null;
      return { ...snapshotOf(sp), items: sp.items.map((it) => (it.id === id ? next : it)) };
    });

  /** Chế độ xem 2D (máy yếu): thêm món vào vị trí mặc định trên sàn, không có hiệu ứng hay gợi ý. */
  const placeAt = (p: Point, product: Product) => {
    const pos = clampToFloor(p.x, p.y, space.calibration.floorLineY);
    const item: PlacedItem = {
      id: localId('item'),
      productId: product.id,
      x: pos.x,
      y: pos.y,
      rotationYDeg: 0,
      scale: 1,
      autoAligned: false,
      purchased: false,
    };
    commit((sp) => ({ ...snapshotOf(sp), items: [...sp.items, item] }));
  };

  /**
   * Chỗ đặt món mới (kiểu IKEA): lưng áp sát chân tường, ở chỗ trống trong phần ảnh nhìn thấy — thử giữa ảnh trước rồi
   * dạt dần ra hai bên; dọc tường hết chỗ thì lùi dần ra phía trước. Tránh món đã đặt và đồ thật đang đứng trên sàn
   * trong ảnh (đồ AI nhận ra, chưa xóa); không chỗ nào trống hẳn thì lấy chỗ ít đè và ít tràn khỏi màn nhất.
   */
  const findSpot = (product: Product): Point & { againstWall: boolean } => {
    const W = frame.width;
    const H = frame.height;
    const edge = Math.max(0, -frame.left) / W;
    const visL = edge * W;
    const visR = (1 - edge) * W;
    const obstacles = [
      ...space.items.flatMap((it) => {
        const pr = findProduct(it.productId);
        return pr ? [itemLayout(it, pr, frame, calibration).bounds] : [];
      }),
      ...(samplePhoto?.objects ?? [])
        .filter((o) => !space.erasedRegions.some((r) => r.objectId === o.id))
        .filter((o) => o.y + o.h >= wallBaseAt(o.x + o.w / 2, calibration) - 0.01)
        .map((o) => ({ x0: o.x * W, x1: (o.x + o.w) * W, y0: o.y * H, y1: (o.y + o.h) * H })),
    ];
    let best = { ...againstWallAt(0.5, product, 0, frame, calibration), againstWall: true };
    let bestCost = Infinity;
    for (const forward of [0, 0.07, 0.14, 0.21]) {
      for (const cx of [0.5, 0.36, 0.64, 0.24, 0.76, 0.43, 0.57, 0.14, 0.86]) {
        // Tâm món cách mép màn ≥ EDGE_GUARD + nửa vùng chạm: dải sát mép trái dành cho vuốt quay lại, món ở đó không kéo được.
        const wallPos = againstWallAt(clamp(cx, edge + (EDGE_GUARD + 24) / W, 1 - edge - (EDGE_GUARD + 24) / W), product, 0, frame, calibration);
        const { x, y } = forward === 0 ? wallPos : placeOnFloor({ x: wallPos.x, y: Math.min(wallPos.y + forward, 0.92) }, product, 0, frame, calibration, false);
        const probe: PlacedItem = { id: 'probe', productId: product.id, x, y, rotationYDeg: 0, scale: 1, autoAligned: true, purchased: false };
        const b = itemLayout(probe, product, frame, calibration).bounds;
        let cost = (Math.max(0, visL - b.x0) + Math.max(0, b.x1 - visR)) * (b.y1 - b.y0);
        for (const o of obstacles) {
          cost += Math.max(0, Math.min(b.x1, o.x1) - Math.max(b.x0, o.x0)) * Math.max(0, Math.min(b.y1, o.y1) - Math.max(b.y0, o.y0));
        }
        if (cost === 0) return { x, y, againstWall: forward === 0 };
        if (cost < bestCost) {
          best = { x, y, againstWall: forward === 0 };
          bestCost = cost;
        }
      }
    }
    return best;
  };

  /**
   * Chạm một món trong khay là món vào phòng (kiểu IKEA): AI chọn chỗ sát tường, món đáp xuống sàn rồi được chọn sẵn
   * (thanh tác vụ + số đo) để kéo, đổi, lật ngay. Người dùng chủ động chạm món nên AI chỉ chọn chỗ, không tự thêm gì.
   */
  const placeProduct = (product: Product) => {
    const pos = findSpot(product);
    const id = localId('item');
    const auto = space.aiMode === 'auto';
    const item: PlacedItem = { id, productId: product.id, x: pos.x, y: pos.y, rotationYDeg: 0, scale: 1, autoAligned: auto, purchased: false };
    commit((sp) => ({ ...snapshotOf(sp), items: [...sp.items, item] }));
    setSuggestedId(null);
    setTrayOpen(false);
    setSelectedId(null);
    // Rung nhẹ đúng lúc món chạm sàn (khớp chuyển động đáp trong SceneLayers); chọn món sau khi đáp để khoảnh khắc
    // đặt đồ được thấy trọn rồi mới hiện thanh tác vụ.
    setTimeout(() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined), 260);
    setTimeout(() => setSelectedId((cur) => cur ?? id), 360);
    const text =
      pos.againstWall && space.calibration.wallBase ? `Đã đặt ${product.name} sát tường · kéo để dời` : `Đã đặt ${product.name} · kéo để dời`;
    showNotice({ kind: auto ? 'ai' : 'info', text, undoable: true }, 5000);
  };

  const floorCenter = (): Point => ({ x: 0.5, y: space.calibration.floorLineY + (1 - space.calibration.floorLineY) * 0.55 });

  const onTap = (p: Point, itemId: string | null) => {
    if (tool === 'erase') {
      if (eraseBlock) {
        showNotice({ kind: 'info', text: eraseBlock.text });
        return;
      }
      // Chạm trúng viền đồ cũ thì xóa luôn (kể cả khi món mới đặt nằm đè lên); món mới đặt không bị xóa ở đây.
      const res = erase.tapAt(p, { minSize: { w: 44 / frame.width, h: 44 / frame.height }, pointSelect: !itemId });
      if (res === 'missed') {
        showNotice({
          kind: 'info',
          text: itemId ? 'Món bạn đặt không bị xóa ở đây · bỏ món ở chế độ Thêm' : 'Chạm vào món có viền để xóa',
        });
      }
      return;
    }
    if (itemId) {
      setSelectedId(itemId);
      return;
    }
    if (selectedId) {
      setSelectedId(null);
      return;
    }
    showNotice({ kind: 'info', text: 'Chạm một món ở khay bên dưới để đặt vào phòng' });
  };

  const onDrag = (phase: 'start' | 'move' | 'end' | 'cancel', id: string, p: Point) => {
    if (phase === 'cancel') {
      setDrag(null);
      return;
    }
    const it = space.items.find((x) => x.id === id);
    const product = it ? findProduct(it.productId) : undefined;
    if (!it || !product) return;
    // Món bám sàn, không xuyên tường; tới gần tường thì hít vào, rung nhẹ một lần lúc hít (MASTER.md · Đặt đồ sát tường).
    // Chân món (kèm số đo) không xuống dưới mép trên của panel món: kéo xuống quá là món chui mất dưới panel.
    const maxY = (screenH - barH - panelH + lift.value - frame.top - DIM_CLEARANCE) / frame.height;
    const pos = placeOnFloor(p, product, it.rotationYDeg, frame, calibration, true, Math.min(maxY, 0.98));
    if (phase === 'start') {
      setSelectedId(id);
      setSuggestedId(null);
      void Haptics.selectionAsync();
    } else if (pos.againstWall && drag?.id === id && !drag.wall) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }
    if (phase === 'end') {
      updateItem(id, (x) => ({ ...x, x: pos.x, y: pos.y }));
      setDrag(null);
      return;
    }
    setDrag({ id, x: pos.x, y: pos.y, wall: pos.againstWall });
  };

  /**
   * Xoay món 3D tới góc `deg` (thước xoay, vặn hai ngón): món xoay tại chỗ; xoay sát tường thì tự lùi ra để không xuyên
   * tường (MASTER.md · Thước xoay món). 'move' chỉ xem trước, 'end' ghi một bước hoàn tác.
   */
  const rotateItem = (phase: 'move' | 'end' | 'cancel', id: string, deg: number) => {
    if (phase === 'cancel') {
      setRotating(null);
      return;
    }
    const it = space.items.find((x) => x.id === id);
    const product = it ? findProduct(it.productId) : undefined;
    if (!it || !product) return;
    const d = normalizeAngle(deg);
    const pos = placeOnFloor(it, product, d, frame, calibration, false);
    if (phase === 'end') {
      updateItem(id, (x) => ({ ...x, rotationYDeg: d, x: pos.x, y: pos.y }));
      setRotating(null);
      return;
    }
    setRotating({ id, deg: d, x: pos.x, y: pos.y });
  };

  const onItemA11yAction = (id: string, action: ItemA11yAction) => {
    const step = 0.03;
    const dx = action === 'left' ? -step : action === 'right' ? step : 0;
    const dy = action === 'up' ? -step : action === 'down' ? step : 0;
    updateItem(id, (it) => {
      const product = findProduct(it.productId);
      if (!product) return it;
      const pos = placeOnFloor({ x: it.x + dx, y: it.y + dy }, product, it.rotationYDeg, frame, calibration, false);
      return { ...it, x: pos.x, y: pos.y };
    });
  };

  // ── Tác vụ của thanh nổi trên món đang chọn (ItemActionBar).
  // Mua lẻ: mở sheet Mua với riêng món này được chọn (vẫn bỏ / thêm món khác được trong sheet).
  const onItemBuy = () => {
    if (selectedItem) startBuy({ kind: 'space', spaceId }, [selectedItem.id]);
  };
  const onItemFlip = () => {
    if (selectedItem) rotateItem('end', selectedItem.id, selectedItem.rotationYDeg + 180);
  };
  const onItemReplace = () => {
    if (!selectedItem || !selectedProduct) return;
    setReplaceId(selectedItem.id);
    setGoesWithId(null);
    // Mở khay ở phong cách còn món khác cùng loại: ưu tiên phong cách của món (swapOptionsFor xếp nó trước).
    setTrayStyle(swapOptionsFor(selectedProduct)[0]?.styleId ?? selectedProduct.styleId);
    setTrayCategory(selectedProduct.category);
    setSuggestedId(null);
    setSelectedId(null);
    setTrayOpen(true);
  };
  const onItemGoesWith = () => {
    if (!selectedProduct) return;
    setGoesWithId(selectedProduct.id);
    setReplaceId(null);
    setTrayStyle(selectedProduct.styleId);
    setTrayCategory('all');
    setSuggestedId(null);
    setSelectedId(null);
    setTrayOpen(true);
  };
  const onItemCopy = () => {
    if (!selectedItem || !selectedProduct) return;
    const src = selectedItem;
    const id = localId('item');
    // Bản sao đặt ngay cạnh, cách một bề ngang món, về phía còn chỗ trong phần ảnh nhìn thấy; hẹp quá thì đè một phần.
    const b = itemLayout(src, selectedProduct, frame, calibration).bounds;
    const w = (b.x1 - b.x0) / frame.width;
    const step = w + 0.02;
    const edge = Math.max(0, -frame.left) / frame.width;
    const roomRight = 1 - edge - w / 2 - src.x;
    const roomLeft = src.x - edge - w / 2;
    const dx =
      roomRight >= step || roomRight >= roomLeft ? Math.min(step, Math.max(roomRight, 0.08)) : -Math.min(step, Math.max(roomLeft, 0.08));
    // Món gốc đang áp tường thì bản sao cũng áp tường ở chỗ mới (tường có thể xiên).
    const pos = isAgainstWall(src, selectedProduct, frame, calibration)
      ? againstWallAt(src.x + dx, selectedProduct, src.rotationYDeg, frame, calibration)
      : placeOnFloor({ x: src.x + dx, y: src.y }, selectedProduct, src.rotationYDeg, frame, calibration, false);
    commit((sp) => ({ ...snapshotOf(sp), items: [...sp.items, { ...src, id, x: pos.x, y: pos.y, scale: 1, purchased: false }] }));
    setSelectedId(id);
    showNotice({ kind: 'info', text: `Đã nhân bản ${selectedProduct.name} · kéo để dời`, undoable: true }, 5000);
  };

  const removeSelected = () => {
    if (!selectedItem) return;
    const name = selectedProduct?.name ?? 'món';
    const id = selectedItem.id;
    commit((sp) => ({ ...snapshotOf(sp), items: sp.items.filter((it) => it.id !== id) }));
    setSelectedId(null);
    showNotice({ kind: 'info', text: `Đã bỏ ${name} khỏi phòng`, undoable: true }, 6000);
  };

  const onToolChange = (next: Tool) => {
    if (next === tool) return;
    if (next === 'add') {
      leaveErase();
    } else {
      setSelectedId(null);
      setSuggestedId(null);
    }
    setTool(next);
  };

  /** Đổi món đã đặt sang món khác, giữ nguyên chỗ đặt; món vẫn được chọn để đổi tiếp hoặc chỉnh. */
  const swapItemProduct = (id: string, p: Product) => {
    commit((sp) => ({
      ...snapshotOf(sp),
      items: sp.items.map((it) => {
        if (it.id !== id) return it;
        // Món cũ đang áp tường thì món mới cũng áp tường (bề sâu khác nhau nên chân món dời theo).
        const old = findProduct(it.productId);
        // Món 3D giữ hướng đang xoay; món ảnh phẳng về mặt trước (ảnh chỉ có một mặt).
        const rot = renders3D(p.id) && old && renders3D(old.id) ? it.rotationYDeg : 0;
        const pos =
          old && isAgainstWall(it, old, frame, calibration)
            ? againstWallAt(it.x, p, rot, frame, calibration)
            : placeOnFloor(it, p, rot, frame, calibration, false);
        return { ...it, productId: p.id, x: pos.x, y: pos.y, scale: 1, rotationYDeg: rot };
      }),
    }));
    setSelectedId(id);
    showNotice({ kind: 'info', text: `Đã đổi sang ${p.name} · hoàn tác nếu chưa ưng`, undoable: true }, 6000);
  };

  /** Người dùng mở / thu khay: thu lại thì bỏ ngữ cảnh "Hợp với". */
  const setTrayOpenByUser = (open: boolean) => {
    setTrayOpen(open);
    if (!open) setGoesWithId(null);
  };

  const onPickProduct = (p: Product) => {
    setGoesWithId(null);
    const target = replaceId ? space.items.find((it) => it.id === replaceId) : undefined;
    if (target) {
      setReplaceId(null);
      setTrayOpen(false);
      swapItemProduct(target.id, p);
      return;
    }
    placeProduct(p);
  };

  const openFloorEditor = () => {
    leaveErase();
    setTool('add');
    setSelectedId(null);
    setSuggestedId(null);
    setFloorDraft(space.calibration.floorLineY);
  };

  const finishFloor = () => {
    if (floorDraft === null) return;
    const y = floorDraft;
    setFloorDraft(null);
    if (Math.abs(y - space.calibration.floorLineY) < 0.001) return;
    commit((sp) => ({ ...snapshotOf(sp), floorLineY: y }));
    showNotice({ kind: 'info', text: 'Đã cập nhật mặt sàn · hoàn tác nếu chưa ưng', undoable: true });
  };

  const onMore = () => {
    const options = lowEnd
      ? [{ label: 'Chụp ảnh khác' }, { label: 'Hủy', style: 'cancel' as const }]
      : [{ label: 'Chỉnh lại mặt sàn' }, { label: 'Chụp ảnh khác' }, { label: 'Hủy', style: 'cancel' as const }];
    confirmAction({ title: space.name, options }).then((i) => {
      const label = options[i]?.label;
      if (label === 'Chỉnh lại mặt sàn') openFloorEditor();
      else if (label === 'Chụp ảnh khác') startCapture({ styleId: space.styleId });
    });
  };

  const onUndo = () => {
    setSelectedId(null);
    setNotice(null);
    history.undo();
  };
  const onRedo = () => {
    setSelectedId(null);
    history.redo();
  };
  const onBuy = () => startBuy({ kind: 'space', spaceId }, estimate.unpurchasedIds);

  // ── Phần dùng chung giữa 3D và 2D.
  const topBar = (
    <TopBar
      floating={!lowEnd}
      onBack={() => navigation.goBack()}
      onUndo={onUndo}
      onRedo={onRedo}
      canUndo={history.canUndo}
      canRedo={history.canRedo}
      onSave={() => openSaveSheet(spaceId)}
      onMore={onMore}
    />
  );

  const action = (
    <Button
      variant="primary"
      label="Mua"
      disabled={estimate.count === 0}
      onPress={onBuy}
      accessibilityHint={estimate.count === 0 ? 'Đặt ít nhất một món để mua' : 'Mở sheet mua các món chưa mua'}
    />
  );

  const trayContent = (
    <TrayContent
      styleOrder={styleOrderFor(space.styleId)}
      styleId={trayStyle}
      onStyleChange={setTrayStyle}
      category={trayCategory}
      onCategoryChange={setTrayCategory}
      armedProductId={lowEnd ? null : suggestedId}
      onPickProduct={
        lowEnd
          ? (p) => {
              const c = floorCenter();
              const n = space.items.length;
              placeAt({ x: 0.3 + (n % 3) * 0.2, y: c.y }, p);
              showToast(`Đã thêm ${p.name}`);
            }
          : onPickProduct
      }
      onInfo={(p) => openProductSheet(p.id)}
      pickHint={lowEnd ? 'Thêm món này vào không gian' : 'Đặt món này vào phòng, sát tường'}
    />
  );

  if (lowEnd) {
    return (
      <Editor2D
        space={space}
        topBar={topBar}
        tray={trayContent}
        estimateBar={<EstimateBar floating={false} estimate={estimate} action={action} />}
        onRemoveItem={(id) => commit((sp) => ({ ...snapshotOf(sp), items: sp.items.filter((it) => it.id !== id) }))}
      />
    );
  }

  // Khung món đang chọn trên màn, để đặt thanh tác vụ; không có khi đang kéo / chụm.
  const selectedBounds =
    selectedItem && selectedProduct && !drag && !rotating ? itemLayout(selectedItem, selectedProduct, frame, calibration).bounds : null;
  const actionAnchor = selectedBounds
    ? {
        x0: frame.left + selectedBounds.x0,
        y0: frame.top + selectedBounds.y0 - lift.value,
        x1: frame.left + selectedBounds.x1,
        y1: frame.top + selectedBounds.y1 - lift.value,
      }
    : null;
  const canvasMode = floorEditing ? 'floor' : tool;
  // Thước xoay nằm ở khoảng trống lớn hơn, phía trên hoặc phía dưới thanh tác vụ (vị trí thanh tính như ItemActionBar),
  // để thanh không che thước.
  // Mép trên dùng chung cho thanh tác vụ và thước xoay: dưới thanh trên + một hàng thông báo chừa sẵn.
  const rulerTopBase = insets.top + t.spacing.xs + (topBarH || 48) + t.spacing.sm + NOTICE_SLOT + t.spacing.sm;
  const rulerBox = (() => {
    const panelTop = screenH - barH - panelH - t.spacing.md;
    const actionTop = actionAnchor
      ? Math.min(Math.max(actionAnchor.y0 - ACTION_BAR_GAP - ACTION_BAR_H, rulerTopBase), panelTop - ACTION_BAR_H)
      : null;
    const segs: [number, number][] =
      actionTop === null
        ? [[rulerTopBase, panelTop]]
        : [
            [rulerTopBase, actionTop - t.spacing.sm],
            [actionTop + ACTION_BAR_H + t.spacing.sm, panelTop],
          ];
    const [a, b] = segs.reduce((best, s) => (s[1] - s[0] > best[1] - best[0] ? s : best));
    const height = Math.max(Math.min(RULER_MAX_H, b - a), 120);
    return { top: a, height };
  })();
  // Món đang kéo đã hít vào tường: vạch sáng ở chân tường sau lưng món, dài hơn món mỗi bên 35%.
  const dragged = drag?.wall ? items.find((it) => it.id === drag.id) : undefined;
  const draggedProduct = dragged ? findProduct(dragged.productId) : undefined;
  const wallGuide =
    dragged && draggedProduct
      ? (() => {
          const b = itemLayout(dragged, draggedProduct, frame, calibration).bounds;
          const pad = (b.x1 - b.x0) * 0.35;
          return { x0: Math.max((b.x0 - pad) / frame.width, 0), x1: Math.min((b.x1 + pad) / frame.width, 1) };
        })()
      : null;

  // Gợi ý bước tiếp theo của công cụ Thêm: chip trên ảnh như gợi ý của Xóa đồ cũ, để khay thu gọn giữ một chiều cao.
  // Distill: chỉ hiện khi nó đổi được hành động tiếp theo (phòng trống, món gợi ý từ trang món, đang đổi món, "Hợp với").
  let addHint: { key: string; node: ReactNode } | null = null;
  if (tool === 'add' && !floorEditing && !(selectedItem && selectedProduct)) {
    if (replaceProduct) {
      addHint = {
        key: 'replace',
        node: <InfoChip icon={Swap} text={`Chọn món thay cho ${replaceProduct.name}`} actionLabel="Hủy" onAction={() => setReplaceId(null)} />,
      };
    } else if (suggestedProduct) {
      addHint = {
        key: `suggested-${suggestedProduct.id}`,
        node: (
          <InfoChip
            icon={HandTap}
            text={`${suggestedProduct.name} · đặt sát tường, kéo để dời`}
            actionLabel="Đặt vào phòng"
            onAction={() => placeProduct(suggestedProduct)}
          />
        ),
      };
    } else if (goesWithProduct && trayStyle === goesWithProduct.styleId) {
      addHint = {
        key: 'goes-with',
        node: <InfoChip icon={PuzzlePiece} text={`Món ${findStyle(goesWithProduct.styleId)?.name ?? ''} hợp với ${goesWithProduct.name}`} />,
      };
    } else if (space.items.length === 0) {
      addHint = { key: 'empty', node: <InfoChip icon={HandTap} text="Chạm một món ở khay bên dưới để đặt vào phòng" /> };
    }
  }

  let header: ReactNode;
  const showingTrayHeader = !floorEditing && tool === 'add' && !(selectedItem && selectedProduct);

  if (floorEditing) {
    header = (
      <FloorHeader
        onNudge={(d) => setFloorDraft((v) => clamp((v ?? floorLineY) + d, 0.2, 0.9))}
        onCancel={() => setFloorDraft(null)}
        onDone={finishFloor}
      />
    );
  } else if (tool === 'erase') {
    header = (
      <EraseHeader
        onToolChange={onToolChange}
        block={eraseBlock}
        detecting={erase.detecting}
        detectedCount={erase.detectedCount}
        objectsLeft={erase.objectsLeft.length}
        pendingCount={erase.pending.length}
        erasingCount={erase.erasing.length}
        hasErased={space.erasedRegions.length > 0}
        comparing={erase.comparing}
        onCompare={erase.setComparing}
        onEraseAll={erase.eraseAll}
        onShowAll={() => {
          const n = space.erasedRegions.length;
          commit((sp) => ({ ...snapshotOf(sp), erasedRegions: [] }));
          showNotice({ kind: 'info', text: `Đã hiện lại ${n} món · hoàn tác nếu chưa ưng`, undoable: true }, 6000);
        }}
      />
    );
  } else if (selectedItem && selectedProduct) {
    header = (
      <InspectorHeader
        item={selectedItem}
        product={selectedProduct}
        swapOptions={swapOptionsFor(selectedProduct)}
        onSwap={(p) => swapItemProduct(selectedItem.id, p)}
        onInfo={() => openProductSheet(selectedProduct.id)}
        onDone={() => setSelectedId(null)}
      />
    );
  } else {
    header = (
      <TrayHeader
        tool={tool}
        onToolChange={onToolChange}
        open={trayOpen}
        onToggle={() => setTrayOpenByUser(!trayOpen)}
        peek={
          lowEnd ? undefined : (
            <PeekStrip
              styleId={trayStyle}
              armedProductId={suggestedId}
              onPickProduct={onPickProduct}
              onOpenTray={() => setTrayOpen(true)}
              pickHint="Đặt món này vào phòng, sát tường"
            />
          )
        }
      />
    );
  }

  const manualText =
    space.aiMode === 'manual'
      ? space.photoSent
        ? 'AI đang tạm ngưng · bạn tự đặt đồ'
        : 'Bạn đang tự đặt đồ · kéo, xoay, chỉnh kích thước bằng tay'
      : null;

  return (
    <View style={{ flex: 1, overflow: 'hidden', backgroundColor: t.colors.background }}>
      <Animated.View pointerEvents="box-none" style={[StyleSheet.absoluteFill, liftStyle]}>
        <Canvas
          frame={frame}
          photoUri={space.photoUri}
          items={items}
          baseItems={space.items}
          erasedRegions={space.erasedRegions}
          calibration={calibration}
          mode={canvasMode}
          selectedId={selectedItem?.id ?? null}
          hideFills={erase.comparing}
          eraseTargets={tool === 'erase' && !eraseBlock && !floorEditing ? erase.objectsLeft : []}
          erasing={erase.erasing}
          pending={erase.pending}
          onEraseTarget={erase.eraseRegion}
          sampleObjects={samplePhoto?.objects}
          wallGuide={wallGuide}
          photoLabel={`Ảnh phòng ${space.name}`}
          coveredBottom={selectedItem ? Math.max(0, panelH - reservedTrayH - lift.value) : 0}
          onTap={onTap}
          onDrag={onDrag}
          canRotate={Boolean(selectedProduct && renders3D(selectedProduct.id))}
          onRotate={(phase, id, delta) => {
            const base = space.items.find((x) => x.id === id)?.rotationYDeg ?? 0;
            rotateItem(phase, id, base + delta);
          }}
          onFloorDrag={(y) => setFloorDraft(clamp(y, 0.2, 0.9))}
          onSelectItem={(id) => {
            if (tool === 'add' && !floorEditing) setSelectedId(id);
          }}
          onItemA11yAction={onItemA11yAction}
          onFloorA11yStep={(d) => setFloorDraft((v) => clamp((v ?? floorLineY) + d, 0.2, 0.9))}
        />
      </Animated.View>

      {/* Thanh trên + thông báo nổi trên ảnh. box-none: chỗ trống vẫn để chạm xuống canvas. */}
      <View pointerEvents="box-none" style={{ position: 'absolute', top: insets.top + t.spacing.xs, left: 0, right: 0, gap: t.spacing.sm }}>
        <View
          pointerEvents="box-none"
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            if (Math.abs(h - topBarH) > 1) setTopBarH(h);
          }}
          style={{ paddingHorizontal: t.spacing.md }}
        >
          {topBar}
        </View>
        <NoticeStack>
          <OfflineBanner body="Đặt, kéo, xoay vẫn dùng được. Xóa đồ cũ cần mạng." />
          {manualText ? <ManualModeChip text={manualText} /> : null}
          {addHint ? <FadeSlot key={addHint.key}>{addHint.node}</FadeSlot> : null}
          {/* Công cụ Xóa: lúc AI đang tìm đồ, rồi gợi ý chỗ chạm ngay trên ảnh (critique 2026-10-03). */}
          {tool === 'erase' && !eraseBlock && erase.detecting ? (
            <FadeSlot key="erase-detecting">
              <InfoChip busy text="AI đang tìm đồ cũ trong ảnh" />
            </FadeSlot>
          ) : tool === 'erase' && !eraseBlock && !notice && erase.erasing.length === 0 && erase.pending.length === 0 ? (
            <FadeSlot key="erase-hint">
              <InfoChip
                icon={HandTap}
                text={erase.objectsLeft.length > 0 ? 'Chạm vào món có viền để xóa' : 'Chạm vào món đồ cũ để xóa'}
              />
            </FadeSlot>
          ) : null}
          {erase.erasing.length > 0 && tool !== 'erase' ? (
            <FadeSlot>
              <InfoChip busy text={`Đang xóa ${erase.erasing.length} món đồ cũ · bạn vẫn đặt đồ được`} />
            </FadeSlot>
          ) : null}
          {erase.error ? (
            <FadeSlot>
              <Banner
                tone="error"
                title={erase.error.title}
                body={erase.error.body}
                actionLabel={erase.error.retry ? 'Thử lại' : undefined}
                onAction={erase.error.retry ? erase.retry : undefined}
              />
            </FadeSlot>
          ) : null}
          {notice ? (
            <FadeSlot key={notice.id}>
              <View pointerEvents="box-none" style={{ gap: t.spacing.sm }}>
                <TransientNotice
                  notice={notice}
                  onUndo={
                    notice.undoable && history.canUndo
                      ? () => {
                          setNotice(null);
                          onUndo();
                        }
                      : undefined
                  }
                />
                {notice.note ? <InfoChip text={notice.note} /> : null}
              </View>
            </FadeSlot>
          ) : null}
        </NoticeStack>
      </View>

      {/* Thước xoay món 3D (kiểu IKEA) ở mép trái ảnh, trong khoảng trống trên / dưới thanh tác vụ; ẩn khi đang kéo món. */}
      {selectedItem && selectedProduct && renders3D(selectedProduct.id) && !drag ? (
        <RotationRuler
          key={`ruler-${selectedItem.id}`}
          value={selectedItem.rotationYDeg}
          productName={selectedProduct.name}
          left={EDGE_GUARD + t.spacing.xs}
          top={rulerBox.top}
          height={rulerBox.height}
          onRotate={(phase, deg) => rotateItem(phase, selectedItem.id, deg)}
        />
      ) : null}

      {/* Thanh tác vụ nổi trên món đang chọn; ẩn khi đang kéo / xoay để không che món đang di chuyển. */}
      {selectedItem && selectedProduct && actionAnchor ? (
        <ItemActionBar
          key={selectedItem.id}
          productName={selectedProduct.name}
          purchased={selectedItem.purchased}
          anchor={actionAnchor}
          // Chừa sẵn một hàng thông báo dưới thanh trên: thông báo hiện / tắt không làm thanh nhảy chỗ dưới ngón tay.
          avoidTop={rulerTopBase}
          avoidBottom={screenH - barH - panelH}
          screenW={screenW}
          onBuy={onItemBuy}
          onFlip={onItemFlip}
          onReplace={onItemReplace}
          onGoesWith={onItemGoesWith}
          onCopy={onItemCopy}
          onRemove={removeSelected}
        />
      ) : null}

      <Dock
        open={trayOpen}
        expandable={showingTrayHeader}
        onOpenChange={setTrayOpenByUser}
        bottom={barH}
        header={header}
        // Khay thu gọn luôn cao ít nhất bằng chỗ ảnh chừa cho nó: đầu khay ngắn hơn (công cụ xóa, chỉnh sàn, panel món) không
        // lộ dải trống giữa ảnh và khay (critique 2026-10-03, P1). Panel món vừa đúng chiều cao này nên chạm món không che
        // thêm sàn (founder 2026-10-04).
        minHeaderHeight={trayOpen || !trayHeaderH ? undefined : trayHeaderH}
        onHeaderHeight={(h) => {
          if (Math.abs(h - headerH) > 1) setHeaderH(h);
          if (showingTrayHeader && !trayOpen && h > trayHeaderH + 1) setTrayHeaderH(h);
        }}
      >
        {trayContent}
      </Dock>

      <EstimateBar
        estimate={estimate}
        action={action}
        onLayoutHeight={(h) => {
          if (Math.abs(h - barH) > 1) setBarH(h);
        }}
      />
    </View>
  );
}
