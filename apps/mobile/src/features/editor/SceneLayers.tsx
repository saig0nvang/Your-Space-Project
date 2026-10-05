/**
 * Các lớp của cảnh, theo thứ tự spec M1 §4: ảnh gốc → lớp lấp của vùng đã xóa → món đặt lên.
 * Dùng chung cho canvas E1, chế độ xem 2D và ảnh thu nhỏ ở E2.
 *
 * Bản thử: món là ảnh mẫu đã tách nền (hoặc hình minh họa SVG) kèm bóng tiếp đất; lớp lấp là ảnh làm mờ tại chỗ — không phải kết quả AI thật.
 */
import { Image } from 'expo-image';
import { ImageBroken } from 'phosphor-react-native';
import { useState, type ReactNode } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { Easing, FadeIn, FadeInDown, useReducedMotion, withTiming, type EntryAnimationsValues } from 'react-native-reanimated';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { ProductArt } from '@/components/ProductArt';
import { AppText } from '@/components/ui';
import { findProduct } from '@/data/catalog';
import { productImage } from '@/data/productImages';
import { renders3D } from '@/data/productModels';
import { findSamplePhoto, photoSource } from '@/data/samplePhotos';
import { useTheme } from '@/theme';
import { contactShadowColor } from '@/theme/tokens';
import type { Calibration, ErasedRegion, PlacedItem, Product } from '@/types';

import { displayRotation, itemLayout } from './geometry';
import { Room3D } from './Room3D';

type Size = { width: number; height: number };

/**
 * Khoảnh khắc chữ ký (impeccable animate 2026-10-03): món vừa đặt "đáp" xuống sàn — rơi 16pt rồi dừng mềm,
 * bóng tiếp đất lan ra cùng nhịp. Reduce Motion: Reanimated bỏ qua chuyển động, món hiện ngay.
 */
const LAND_MS = 320;
const landEase = Easing.bezier(0.16, 1, 0.3, 1);

function dropIn(_: EntryAnimationsValues) {
  'worklet';
  return {
    initialValues: { opacity: 0, transform: [{ translateY: -16 }] },
    animations: {
      opacity: withTiming(1, { duration: LAND_MS * 0.6 }),
      transform: [{ translateY: withTiming(0, { duration: LAND_MS, easing: landEase }) }],
    },
  };
}

function shadowIn(_: EntryAnimationsValues) {
  'worklet';
  return {
    initialValues: { opacity: 0, transform: [{ scaleX: 0.55 }] },
    animations: {
      opacity: withTiming(1, { duration: LAND_MS, easing: landEase }),
      transform: [{ scaleX: withTiming(1, { duration: LAND_MS, easing: landEase }) }],
    },
  };
}

// Web chỉ chạy hiệu ứng dựng sẵn của Reanimated (worklet tự viết bị bỏ qua kèm cảnh báo): dùng bản gần nhất để bản
// demo trên web vẫn có nhịp "đáp" xuống sàn.
const landItem = Platform.OS === 'web' ? FadeInDown.duration(LAND_MS) : dropIn;
const landShadow = Platform.OS === 'web' ? FadeIn.duration(LAND_MS) : shadowIn;

/** Bóng tiếp đất mềm dưới chân món, để món đứng trên sàn thay vì dán lên ảnh. */
function ContactShadow({ id, cx, by, width, land }: { id: string; cx: number; by: number; width: number; land: boolean }) {
  const w = width * 0.96;
  const h = Math.max(7, width * 0.15);
  const gid = `shadow-${id}`;
  return (
    <Animated.View
      entering={land ? landShadow : undefined}
      pointerEvents="none"
      style={{ position: 'absolute', left: cx - w / 2, top: by - h * 0.55, width: w, height: h }}
    >
      <Svg width={w} height={h}>
        <Defs>
          <RadialGradient id={gid} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor={contactShadowColor} stopOpacity={0.55} />
            <Stop offset="0.6" stopColor={contactShadowColor} stopOpacity={0.22} />
            <Stop offset="1" stopColor={contactShadowColor} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx={w / 2} cy={h / 2} rx={w / 2} ry={h / 2} fill={`url(#${gid})`} />
      </Svg>
    </Animated.View>
  );
}

/**
 * Viền chọn bám đúng dáng món (MASTER.md · Thanh tác vụ của món): quầng sáng `onImage` theo kênh alpha của ảnh tách nền.
 * iOS: bóng của lớp không nền đi theo alpha; web: CSS drop-shadow; Android: các bản tô màu lệch 3pt xếp sau ảnh.
 */
function outlineStyle(color: string): ViewStyle | null {
  if (Platform.OS === 'ios') return { shadowColor: color, shadowOpacity: 1, shadowRadius: 3, shadowOffset: { width: 0, height: 0 } };
  if (Platform.OS === 'web') {
    const d = `drop-shadow(0 0 1.5px ${color})`;
    return { filter: `${d} ${d} ${d} ${d}` } as ViewStyle;
  }
  return null;
}

const ANDROID_OUTLINE_OFFSETS = [
  [-3, 0],
  [3, 0],
  [0, -3],
  [0, 3],
  [-2, -2],
  [2, -2],
  [-2, 2],
  [2, 2],
] as const;

/** Một món đã đặt; xoay quanh trục Y bằng rotateY + perspective (D4). */
export function ItemArt({
  item,
  product,
  frame,
  cal,
  land = false,
  outlined = false,
  flat = false,
}: {
  /** Vẽ món có mô hình 3D bằng ảnh (ảnh thu nhỏ). */
  flat?: boolean;
  item: PlacedItem;
  product: Product;
  frame: Size;
  cal: Calibration;
  /** Món vừa được đặt trong phiên này: chạy chuyển động đáp xuống sàn. */
  land?: boolean;
  /** Món đang chọn: viền sáng bám dáng món. */
  outlined?: boolean;
}) {
  const t = useTheme();
  const layout = itemLayout(item, product, frame, cal, flat);
  const rot = displayRotation(item.rotationYDeg);
  const image = productImage(product.id);
  return (
    <>
      <ContactShadow
        land={land}
        id={item.id}
        cx={(layout.bounds.x0 + layout.bounds.x1) / 2}
        by={item.y * frame.height}
        width={layout.bounds.x1 - layout.bounds.x0}
      />
      <Animated.View
        entering={land ? landItem : undefined}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{ position: 'absolute', left: layout.left, top: layout.top, width: layout.width, height: layout.height }}
      >
      <View
        style={[
          {
            width: layout.width,
            height: layout.height,
            transform: [{ perspective: 800 }, { rotateY: `${rot.angle}deg` }, { scaleX: rot.mirror ? -1 : 1 }],
          },
          outlined && image ? outlineStyle(t.colors.onImage) : null,
        ]}
      >
        {outlined && image && Platform.OS === 'android'
          ? ANDROID_OUTLINE_OFFSETS.map(([dx, dy]) => (
              <Image
                key={`${dx},${dy}`}
                source={image.source}
                tintColor={t.colors.onImage}
                contentFit="fill"
                accessible={false}
                style={{ position: 'absolute', left: dx, top: dy, width: layout.width, height: layout.height }}
              />
            ))
          : null}
        {image ? (
          <Image source={image.source} style={{ width: layout.width, height: layout.height }} contentFit="fill" accessible={false} />
        ) : (
          <ProductArt category={product.category} productId={product.id} size={layout.width} />
        )}
      </View>
      </Animated.View>
    </>
  );
}

/**
 * Lớp lấp giả lập của một vùng đã xóa (bản thử, chưa có inpainting thật): phần trên đường sàn lấy mảng tường ngay
 * phía trên vùng, phần dưới lấy mảng sàn ngay phía dưới, làm mềm nhẹ — giống "content-aware fill" thay cho ô xám.
 * Không gắn nhãn trên ảnh; câu "bản thử" nằm ở đầu khay của công cụ Xóa đồ cũ.
 */
function ErasedFill({ region, frame, photoUri, floorLineY }: { region: ErasedRegion; frame: Size; photoUri: string | null; floorLineY: number }) {
  const t = useTheme();
  const left = region.x * frame.width;
  const top = region.y * frame.height;
  const width = region.w * frame.width;
  const height = region.h * frame.height;
  const split = Math.min(Math.max((region.splitY ?? floorLineY) * frame.height, top), top + height);
  const wallH = split - top;
  const floorH = top + height - split;
  // Nguồn: tường ngay phía trên vùng, sàn ngay phía dưới vùng (kẹp trong khung ảnh).
  const wallSrcTop = Math.max(top - wallH, 0);
  const floorSrcTop = Math.min(top + height, frame.height - floorH);
  // Món AI nhận ra trong ảnh mẫu: dùng mảng lấp dựng sẵn (inpainting từ mask SAM), mép mờ dần hòa vào ảnh.
  const patch = region.objectId ? findSamplePhoto(photoUri)?.objects.find((o) => o.id === region.objectId)?.patch : undefined;
  if (patch) {
    return (
      <Image
        source={patch.source}
        contentFit="fill"
        accessible={false}
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: patch.x * frame.width,
          top: patch.y * frame.height,
          width: patch.w * frame.width,
          height: patch.h * frame.height,
        }}
      />
    );
  }
  const source = photoSource(photoUri);
  const band = (y: number, h: number, srcTop: number) => (
    <View style={{ position: 'absolute', left: 0, top: y - top, width, height: h, overflow: 'hidden' }}>
      <Image
        source={source}
        style={{ position: 'absolute', left: -left, top: -srcTop, width: frame.width, height: frame.height }}
        contentFit="cover"
        blurRadius={3}
        accessible={false}
      />
    </View>
  );
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left, top, width, height, overflow: 'hidden', borderRadius: t.radius.sm }}>
      {wallH > 0 ? band(top, wallH, wallSrcTop) : null}
      {floorH > 0 ? band(split, floorH, floorSrcTop) : null}
    </View>
  );
}

export function SceneLayers({
  photoUri,
  items,
  erasedRegions,
  calibration,
  frame,
  hideFills = false,
  photoLabel,
  onPhotoError,
  selectedId = null,
  underlay,
  showGrid = false,
  live3D = false,
}: {
  /** Phủ lưới sàn 3D để kiểm máy ảo khớp ảnh (cờ giả lập, chỉ trình chỉnh sửa). */
  showGrid?: boolean;
  /**
   * Dựng món có mô hình 3D bằng lớp 3D (chỉ trình chỉnh sửa). Ảnh thu nhỏ để false: vẽ các món đó bằng ảnh, tránh mở nhiều
   * WebView / khung WebGL cùng lúc.
   */
  live3D?: boolean;
  /** Món đang chọn trên canvas: vẽ viền sáng bám dáng món. */
  selectedId?: string | null;
  /** Lớp vẽ giữa ảnh và món (vạch chân tường khi kéo món hít vào tường): nằm sau món như chính bức tường. */
  underlay?: ReactNode;
  photoUri: string | null;
  items: PlacedItem[];
  erasedRegions: ErasedRegion[];
  calibration: Calibration;
  frame: Size;
  /** Giữ để xem ảnh trước khi xóa (E5-US4): tạm ẩn lớp lấp, món vẫn hiện. */
  hideFills?: boolean;
  photoLabel?: string;
  /** Ảnh phòng không tải được (đã bị xóa khỏi máy). */
  onPhotoError?: () => void;
}) {
  const t = useTheme();
  const reduce = useReducedMotion();
  const source = photoSource(photoUri);
  // Món có sẵn lúc mở cảnh không chạy chuyển động đáp; chỉ món đặt thêm trong phiên này mới chạy.
  const [initialIds] = useState(() => new Set(items.map((it) => it.id)));
  // Món xa (gần đường sàn) vẽ trước, món gần vẽ sau để đè lên.
  const ordered = [...items].sort((a, b) => a.y - b.y);
  // Chỉ vẽ món và lớp lấp khi ảnh phòng đã hiện: tránh món trôi trên nền xám lúc ảnh chưa tải (critique 2026-10-03).
  const [loadedUri, setLoadedUri] = useState<string | null>(null);
  const photoReady = !source || loadedUri === photoUri;

  return (
    <View style={{ width: frame.width, height: frame.height }}>
      {source ? (
        <Image
          source={source}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={reduce ? 0 : t.motion.fast}
          onLoad={() => setLoadedUri(photoUri)}
          onError={onPhotoError}
          accessible={Boolean(photoLabel)}
          accessibilityRole="image"
          accessibilityLabel={photoLabel}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: t.colors.muted, alignItems: 'center', justifyContent: 'center', gap: t.spacing.sm },
          ]}
        >
          <ImageBroken size={24} color={t.colors.mutedForeground} />
          <AppText variant="footnote" color="mutedForeground">
            Không mở được ảnh phòng
          </AppText>
        </View>
      )}
      {hideFills || !photoReady
        ? null
        : erasedRegions.map((r) => (
            <ErasedFill key={r.id} region={r} frame={frame} photoUri={photoUri} floorLineY={calibration.floorLineY} />
          ))}
      {photoReady ? underlay : null}
      {(photoReady ? ordered : []).map((it) => {
        const product = findProduct(it.productId);
        // Món có mô hình 3D vẽ ở lớp Room3D bên dưới, bằng máy ảo khớp ảnh phòng.
        if (!product || (live3D && renders3D(product.id))) return null;
        return (
          <ItemArt
            key={it.id}
            item={it}
            product={product}
            frame={frame}
            cal={calibration}
            land={!initialIds.has(it.id)}
            outlined={it.id === selectedId}
            flat={!live3D}
          />
        );
      })}
      {photoReady && live3D ? (
        <Room3D items={ordered.filter((it) => renders3D(it.productId))} frame={frame} calibration={calibration} showGrid={showGrid} />
      ) : null}
    </View>
  );
}

/**
 * Khung ngang cắt từ cảnh của một không gian, canh vào vùng có món (ảnh thu nhỏ ở Phòng của tôi, màn Đặt hàng xong).
 * Vẽ bằng chính SceneLayers nên món đúng tỉ lệ và vùng đã xóa vẫn hiện.
 */
export function SceneWindow({
  photoUri,
  photoAspect,
  items,
  erasedRegions,
  calibration,
  width,
  height,
  focusItems,
  onPhotoError,
}: {
  photoUri: string | null;
  photoAspect: number;
  items: PlacedItem[];
  erasedRegions: ErasedRegion[];
  calibration: Calibration;
  width: number;
  height: number;
  /** Các món dùng để canh khung; mặc định là mọi món. */
  focusItems?: PlacedItem[];
  onPhotoError?: () => void;
}) {
  const t = useTheme();
  const fullH = width / (photoAspect > 0 ? photoAspect : 3 / 4);
  const winH = Math.min(height, fullH);
  const focus = focusItems ?? items;
  const focusY = focus.length > 0 ? focus.reduce((sum, it) => sum + it.y, 0) / focus.length : 0.7;
  const offset = Math.min(Math.max(focusY * fullH - winH * 0.62, 0), fullH - winH);
  return (
    <View style={{ width, height: winH, overflow: 'hidden', backgroundColor: t.colors.muted }}>
      <View style={{ transform: [{ translateY: -offset }] }}>
        <SceneLayers
          photoUri={photoUri}
          items={items}
          erasedRegions={erasedRegions}
          calibration={calibration}
          frame={{ width, height: fullH }}
          onPhotoError={onPhotoError}
        />
      </View>
    </View>
  );
}
