'use dom';

/**
 * Lớp dựng 3D của cảnh — cách IKEA Kreativ khớp món vào ảnh 2D: món là mô hình GLB, dựng bằng máy ảo trùng máy chụp
 * ảnh phòng (roomCamera), đứng trên mặt sàn ảo y = 0. Nền trong suốt nằm ngay trên ảnh phòng; mặt sàn ảo chỉ nhận bóng
 * (không vẽ sàn) nên bóng món đổ thẳng lên sàn thật trong ảnh. Ánh sáng: môi trường dịu (RoomEnvironment) + một nguồn
 * sáng chính theo phía cửa sổ của phòng. Bật "Hiện lưới sàn 3D" (tab Tôi → Giả lập) để kiểm máy ảo khớp ảnh.
 *
 * Là DOM component của Expo ('use dom'): trên web dựng thẳng trong trang; trên máy (iOS/Android, kể cả Expo Go) chạy cùng
 * đoạn code này trong một WebView nền trong suốt (WebGL của trình duyệt), nên món trên máy giống hệt bản web đã kiểm.
 * Props phải là dữ liệu thuần (JSON): mô hình truyền vào bằng đường dẫn (uri) đã phân giải ở Room3D.tsx.
 */
/* eslint-disable react/no-unknown-property -- thuộc tính của phần tử three.js (React-Three-Fiber), không phải DOM. */
import { Canvas, useLoader } from '@react-three/fiber';
import type { DOMProps } from 'expo/dom';
import { Suspense, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import type { Calibration, PlacedItem } from '@/types';

import { modelPlacement, roomCamera, type ModelBounds } from './roomCamera';

/** Mô hình của một món, dạng truyền được qua cầu nối DOM: đường dẫn GLB và khung bao (m). */
export type ModelRef = { uri: string; bounds: ModelBounds };

type Size = { width: number; height: number };

/** Hướng ánh sáng chính khi phòng chưa có số đo (vector từ sàn tới nguồn sáng). */
const DEFAULT_LIGHT: [number, number, number] = [-3, 5, -3];
/** Tâm vùng sàn hay đặt đồ (m, trước mặt máy): nơi đặt đích của nguồn sáng và khung bóng đổ. */
const FLOOR_CENTER: [number, number, number] = [0, 0, -4];

/** Máy ảo trùng máy thật: tiêu cự, tâm quang học lệch (setViewOffset), độ cao, góc chúc / nghiêng. */
function makeCamera(cal: Calibration, frame: Size): THREE.PerspectiveCamera {
  const cam = roomCamera(cal);
  const W = frame.width;
  const H = frame.height;
  const fPx = cam.f * H;
  const cx = cam.cx * W;
  const cy = cam.cy * H;
  // Khung đầy đủ nhận tâm quang học làm tâm; ảnh phòng là một ô cắt trong khung đó.
  const fullW = 2 * Math.max(cx, W - cx);
  const fullH = 2 * Math.max(cy, H - cy);
  const camera = new THREE.PerspectiveCamera((2 * Math.atan(fullH / 2 / fPx) * 180) / Math.PI, fullW / fullH, 0.05, 80);
  camera.setViewOffset(fullW, fullH, fullW / 2 - cx, fullH / 2 - cy, W, H);
  camera.position.set(0, cal.cameraHeightM, 0);
  camera.rotation.order = 'YXZ';
  camera.rotation.set(-(cam.pitchDeg * Math.PI) / 180, 0, (cam.rollDeg * Math.PI) / 180);
  camera.updateProjectionMatrix();
  // R3F không tự đổi tỉ lệ khung của máy này khi canvas đổi cỡ (canvas luôn đúng bằng khung ảnh).
  Object.assign(camera, { manual: true });
  return camera;
}

/**
 * Ánh sáng môi trường dịu cho vật liệu PBR (vải nhung, kim loại, giấy) — dựng từ RoomEnvironment, không cần tải ảnh môi
 * trường. Gắn lúc canvas tạo xong.
 */
function addEnvironment({ gl, scene }: { gl: THREE.WebGLRenderer; scene: THREE.Scene }) {
  const pmrem = new THREE.PMREMGenerator(gl);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.85;
  pmrem.dispose();
}

function SunLight({ dir }: { dir: [number, number, number] }) {
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(...FLOOR_CENTER);
    return o;
  }, []);
  return (
    <>
      <primitive object={target} />
      <directionalLight
        target={target}
        position={[FLOOR_CENTER[0] + dir[0], FLOOR_CENTER[1] + dir[1], FLOOR_CENTER[2] + dir[2]]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-bias={-0.0005}
        shadow-radius={5}
      />
      <hemisphereLight args={['white', 'white', 0.25]} />
    </>
  );
}

/** Lưới sàn ô 1 m theo trục phòng, phủ quanh máy, để so với vân sàn, ron gạch và chân tường trong ảnh. */
function FloorGrid() {
  const geometry = useMemo(() => {
    const pts: number[] = [];
    for (let x = -12; x <= 12; x++) pts.push(x, 0.004, -0.5, x, 0.004, -16);
    for (let z = -1; z >= -16; z--) pts.push(-12, 0.004, z, 12, 0.004, z);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  return (
    <lineSegments geometry={geometry} renderOrder={10}>
      {/* Màu nổi của công cụ kiểm (không phải giao diện): đọc được trên cả sàn gỗ lẫn gạch sáng. */}
      <lineBasicMaterial color="deepskyblue" transparent opacity={0.9} depthTest={false} />
    </lineSegments>
  );
}

/** Một món 3D: nạp GLB, bỏ đèn kèm trong mô hình (đèn sàn có đèn riêng), bật đổ bóng. */
function Model3D({ item, model, cal, aspect }: { item: PlacedItem; model: ModelRef; cal: Calibration; aspect: number }) {
  const gltf = useLoader(GLTFLoader, model.uri);
  const object = useMemo(() => {
    const o = gltf.scene.clone(true);
    const lights: THREE.Object3D[] = [];
    o.traverse((n) => {
      if ((n as THREE.Light).isLight) lights.push(n);
      if ((n as THREE.Mesh).isMesh) {
        n.castShadow = true;
        n.receiveShadow = true;
      }
    });
    lights.forEach((l) => l.parent?.remove(l));
    return o;
  }, [gltf]);
  const placed = modelPlacement(item, model.bounds, roomCamera(cal), cal.cameraHeightM, aspect);
  if (!placed) return null;
  return (
    <primitive object={object} position={[placed.origin.x, 0, placed.origin.z]} rotation={[0, placed.yaw, 0]} />
  );
}

export default function Room3DView({
  items,
  models,
  frame,
  calibration,
  showGrid = false,
}: {
  /** Chỉ các món có mô hình 3D. */
  items: PlacedItem[];
  /** Mô hình theo mã món. */
  models: Record<string, ModelRef>;
  frame: Size;
  calibration: Calibration;
  /** Lưới sàn ô 1 m để kiểm máy ảo khớp ảnh. */
  showGrid?: boolean;
  dom?: DOMProps;
}) {
  // Trong WebView: trang trong suốt để ảnh phòng (lớp React Native bên dưới) hiện qua, không cuộn, không chọn chữ.
  useEffect(() => {
    for (const el of [document.documentElement, document.body]) {
      el.style.background = 'transparent';
      el.style.margin = '0';
      el.style.overflow = 'hidden';
    }
  }, []);
  const cam = roomCamera(calibration);
  // Dựng lại canvas khi khung ảnh hoặc máy ảnh đổi (hiếm: đổi cỡ màn, chỉnh lại độ cao máy).
  const key = [frame.width, frame.height, cam.f, cam.cx, cam.cy, cam.pitchDeg, cam.rollDeg, calibration.cameraHeightM].join(':');
  const camera = makeCamera(calibration, frame);
  const aspect = frame.width / frame.height;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: frame.width, height: frame.height, pointerEvents: 'none' }}>
      <Canvas
        key={key}
        camera={camera}
        shadows
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
        style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
        onCreated={addEnvironment}
      >
        <SunLight dir={cam.light ?? DEFAULT_LIGHT} />
        {/* Mặt sàn ảo chỉ nhận bóng: bóng món đổ lên sàn thật trong ảnh. */}
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.001, -6]} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <shadowMaterial opacity={0.3} />
        </mesh>
        {showGrid ? (
          <group rotation={[0, ((cam.roomYawDeg ?? 0) * Math.PI) / 180, 0]}>
            <FloorGrid />
          </group>
        ) : null}
        {items.map((it) => {
          const model = models[it.productId];
          return model ? (
            <Suspense key={it.id} fallback={null}>
              <Model3D item={it} model={model} cal={calibration} aspect={aspect} />
            </Suspense>
          ) : null;
        })}
      </Canvas>
    </div>
  );
}
