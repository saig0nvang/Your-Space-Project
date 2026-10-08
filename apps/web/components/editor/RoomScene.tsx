"use client";
import { ContactShadows, Line, PerspectiveCamera, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useLoader, useStore, useThree, type ThreeEvent } from "@react-three/fiber";
import { cameraToThree, keyLightDir, type CameraModel, type FurnitureModel, type PhotoLighting } from "@yourspace/core";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { modelById } from "@/lib/catalog";
import type { PlacedItem } from "@/lib/store";

export const DEFAULT_LIGHTING: PhotoLighting = { exposure: 1, ambientIntensity: 0.8, keyIntensity: 1.6, color: { r: 1, g: 1, b: 1 } };
const NEAR = 0.05;
const FAR = 100;

type Occluder = { data: Float32Array; width: number; height: number } | null;

/**
 * apps/mobile ghim three@0.186.1 / @types/three@0.186.0; apps/web ghim three@0.185.1 / @types/three@0.185.1.
 * pnpm chỉ hoist MỘT bản @types/three vào gốc ảo (.pnpm/node_modules/@types) dùng chung cho mọi package không
 * tự mang @types/three riêng — @react-three/fiber và drei rơi vào đó và vơ luôn bản 0.186.0, dù "three" runtime
 * của chúng vẫn là 0.185.1 (đúng). Vì vậy prop JSX của r3f/drei (Object3D/Material/Color/Texture/WebGLRenderer…)
 * mang kiểu 0.186.0, còn `new THREE.X()` ở file này (import "three" trực tiếp, @types/three riêng của web) ra
 * kiểu 0.185.1 — hai kiểu giống hệt về cấu trúc nhưng khác "danh tính" nên TS coi là không tương thích.
 * `r3f()` ép kiểu tường minh ở đúng ranh giới đó; runtime không đổi (cùng một bản "three" thật).
 */
function r3f<T>(value: unknown): T {
  return value as T;
}

/** Ảnh phòng vẽ thẳng ra màn hình, giữ nguyên điểm ảnh (texture NoColorSpace, không tone map, không ghi độ sâu). */
function BackgroundQuad({ texture }: { texture: THREE.Texture }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { map: { value: texture } },
        vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
        fragmentShader: "uniform sampler2D map; varying vec2 vUv; void main(){ gl_FragColor = texture2D(map, vUv); }",
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      }),
    [texture],
  );
  useEffect(() => () => material.dispose(), [material]);
  // frameloop="demand": texture ảnh (tải xong trong Suspense) vừa có material → yêu cầu vẽ.
  const invalidate = useThree((st) => st.invalidate);
  useEffect(() => {
    invalidate();
  }, [material, invalidate]);
  return (
    <mesh frustumCulled={false} renderOrder={-2} material={r3f(material)}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

/**
 * Lượt chỉ ghi độ sâu của vật thật (z mét → depth của camera ảo); pixel 0 bị bỏ. depthTest phải bật (depthFunc
 * Always) thì GL mới ghi độ sâu.
 *
 * `occluder.data` được useSceneDepth() tính MỘT LẦN ở heightM giả định = 1 m (bất biến theo heightM thật — xem
 * comment ở lib/hooks/useSceneDepth.ts). Uniform `heightM` nhân lại hệ số đúng lúc dựng cảnh, chỉ set giá trị
 * (không dựng lại material/texture) nên kéo thanh "Chỉnh cỡ phòng" không chạy lại fit/texture mỗi tick.
 */
function OccluderQuad({ occluder, heightM }: { occluder: NonNullable<Occluder>; heightM: number }) {
  const material = useMemo(() => {
    const tex = new THREE.DataTexture(occluder.data, occluder.width, occluder.height, THREE.RedFormat, THREE.FloatType);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return new THREE.ShaderMaterial({
      // KHÔNG đặt glslVersion: THREE.GLSL3 — WebGLProgram.js (not RawShaderMaterial) luôn biên dịch ở
      // '#version 300 es' và chỉ chèn lớp tương thích (#define varying in / gl_FragColor → pc_fragColor /
      // texture2D → texture) khi glslVersion !== GLSL3; đặt GLSL3 tắt lớp đó nên gl_FragColor/varying/texture2D
      // trong shader dưới sẽ không biên dịch được. gl_FragDepth vẫn là builtin GLSL ES 3.00 nên không cần GLSL3.
      // `heightM` khởi tạo ở 1 (khớp heightM giả định lúc tính occluder.data); effect bên dưới cập nhật giá trị
      // thật mỗi khi heightM đổi, không dựng lại material/texture này.
      uniforms: { depthMap: { value: tex }, near: { value: NEAR }, far: { value: FAR }, heightM: { value: 1 } },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: `uniform sampler2D depthMap; uniform float near; uniform float far; uniform float heightM; varying vec2 vUv;
        void main(){
          float z0 = texture2D(depthMap, vec2(vUv.x, 1.0 - vUv.y)).r;
          if (z0 <= 0.0) discard;
          float z = z0 * heightM;
          float ndc = (far + near) / (far - near) - (2.0 * far * near) / ((far - near) * z);
          gl_FragDepth = clamp(ndc * 0.5 + 0.5, 0.0, 1.0);
          gl_FragColor = vec4(0.0);
        }`,
      colorWrite: false,
      depthWrite: true,
      depthTest: true,
      depthFunc: THREE.AlwaysDepth,
    });
  }, [occluder]);
  // `material` là giá trị trả về của useMemo nên eslint-plugin-react-hooks (immutability) cấm sửa trực tiếp;
  // lưu qua ref (cùng cách Lights() ở dưới dùng store.getState() thay vì destructure từ hook) rồi chỉ set
  // uniform.value qua ref đó — KHÔNG dựng lại material/texture — mỗi khi heightM đổi (kéo thanh "Chỉnh cỡ phòng").
  //
  // Canvas chạy frameloop="demand" (chỉ vẽ khi có invalidate()), nên đặt uniform rồi invalidate() NGAY trong
  // effect khi heightM/material đổi: frame được yêu cầu chắc chắn vẽ SAU khi uniform đã mang giá trị mới.
  // useFrame giữ lại làm lưới an toàn — chạy trước mỗi frame được vẽ (vì lý do khác) với closure heightM mới nhất.
  const materialRef = useRef(material);
  const invalidate = useThree((st) => st.invalidate);
  useEffect(() => {
    materialRef.current = material;
  }, [material]);
  useEffect(() => {
    materialRef.current.uniforms.heightM!.value = heightM;
    invalidate();
  }, [material, heightM, invalidate]);
  useFrame(() => {
    materialRef.current.uniforms.heightM!.value = heightM;
  });
  useEffect(() => {
    const depthTex = material.uniforms.depthMap!.value as THREE.Texture;
    return () => {
      depthTex.dispose();
      material.dispose();
    };
  }, [material]);
  return (
    <mesh frustumCulled={false} renderOrder={-1} material={r3f(material)}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

/** Đèn chính mặc định khi ảnh không có nguồn sáng rõ: từ trên, sau máy, lệch phải (nhìn từ target [0, 0, −4]). */
const DEFAULT_KEY_OFFSET: [number, number, number] = [2.5, 6, 7];

function Lights({ lighting, envTexture, camera }: { lighting: PhotoLighting; envTexture: THREE.Texture; camera: CameraModel }) {
  // Lấy gl/scene qua store imperatively (không destructure từ useThree()): gán thuộc tính renderer/scene là
  // tương tác mệnh lệnh chuẩn của three.js/r3f, nhưng eslint-plugin-react-hooks coi giá trị trả về trực tiếp
  // từ một hook là bất biến — store.getState() không bị quy tắc đó theo dõi (cùng cách lib dùng useEditor.getState()).
  const store = useStore();
  const target = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => {
    const { gl, invalidate } = store.getState();
    gl.toneMappingExposure = lighting.exposure;
    invalidate();
  }, [store, lighting.exposure]);
  useEffect(() => {
    const { gl, scene } = store.getState();
    const pmrem = new THREE.PMREMGenerator(r3f(gl));
    const rt = pmrem.fromEquirectangular(envTexture);
    scene.environment = r3f(rt.texture);
    scene.environmentIntensity = 0.5;
    store.getState().invalidate();
    return () => {
      scene.environment = null;
      rt.dispose();
      pmrem.dispose();
    };
  }, [store, envTexture]);
  const color = new THREE.Color(lighting.color.r, lighting.color.g, lighting.color.b);
  // Có vùng sáng nổi bật (cửa sổ, đèn) → đèn chính chiếu từ hướng đó để bóng đổ đúng phía (như Kreativ).
  const dir = lighting.keySpot ? keyLightDir(lighting.keySpot, camera) : null;
  const off = dir ? [dir.x * 8, dir.y * 8, dir.z * 8] : DEFAULT_KEY_OFFSET;
  return (
    <>
      <hemisphereLight args={r3f([color, "#555555", lighting.ambientIntensity])} />
      <primitive object={r3f(target)} position={[0, 0, -4]} />
      <directionalLight
        castShadow
        color={r3f(color)}
        intensity={lighting.keyIntensity}
        position={[off[0]!, off[1]!, off[2]! - 4]}
        target={r3f(target)}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-bias={-0.0005}
        shadow-radius={4}
      />
    </>
  );
}

function Furniture({
  item,
  model,
  selected,
  onPointerDown,
}: {
  item: PlacedItem;
  model: FurnitureModel;
  selected: boolean;
  onPointerDown: (uid: string, pointer: { x: number; y: number }, hitY: number) => void;
}) {
  const { scene } = useGLTF(model.glbUrl);
  const object = useMemo(() => {
    const c = scene.clone(true);
    // Object3D của cây GLTF (drei) mang kiểu @types/three 0.186.0 bị hoist nhầm (xem comment r3f() ở trên);
    // suy kiểu Node trực tiếp từ traverse() thay vì dùng THREE.Object3D (0.185.1) để khỏi lệch danh tính kiểu.
    type Node = Parameters<Parameters<typeof c.traverse>[0]>[0];
    const lights: Node[] = [];
    c.traverse((o) => {
      if ((o as unknown as { isLight?: boolean }).isLight) lights.push(o);
      if ((o as unknown as { isMesh?: boolean }).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    lights.forEach((l) => l.parent?.remove(l)); // đèn nhúng trong GLB (mô hình đèn) không được chiếu cảnh
    return c;
  }, [scene]);
  // frameloop="demand": GLB tải xong (Suspense mở) → vẽ lại một frame để món hiện ra.
  const invalidate = useThree((st) => st.invalidate);
  useEffect(() => invalidate(), [object, invalidate]);
  const { widthM: w, depthM: d } = model.dimsM;
  const outline = useMemo<[number, number, number][]>(
    () => [
      [-w / 2, 0.01, -d / 2],
      [w / 2, 0.01, -d / 2],
      [w / 2, 0.01, d / 2],
      [-w / 2, 0.01, d / 2],
      [-w / 2, 0.01, -d / 2],
    ],
    [w, d],
  );
  return (
    <group
      position={[item.x, 0, item.z]}
      rotation={[0, item.rotationYRad + model.baseYawRad, 0]}
      scale={item.scale}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        onPointerDown(item.uid, { x: e.pointer.x, y: e.pointer.y }, e.point.y);
      }}
    >
      <primitive object={object} />
      {selected && <Line points={outline} color="white" lineWidth={2} />}
    </group>
  );
}

function Scene(props: Omit<Parameters<typeof RoomScene>[0], "aspect">) {
  const loaded = useLoader(THREE.TextureLoader, props.photoUrl);
  const { background, env } = useMemo(() => {
    const background = loaded.clone();
    background.colorSpace = THREE.NoColorSpace;
    background.needsUpdate = true;
    const env = loaded.clone();
    env.colorSpace = THREE.SRGBColorSpace;
    env.mapping = THREE.EquirectangularReflectionMapping;
    env.needsUpdate = true;
    return { background, env };
  }, [loaded]);
  // background/env là bản clone() riêng (không phải texture cache của useLoader) → phải tự dispose khi đổi
  // ảnh (undo/redo/xóa sinh workingUrl mới) hoặc unmount, nếu không rò texture GPU. Không dispose `loaded`.
  useEffect(
    () => () => {
      background.dispose();
      env.dispose();
    },
    [background, env],
  );
  // frameloop="demand": mọi đầu vào của cảnh đổi (kéo món → store đổi → items mới, camera/cỡ phòng, occluder,
  // ánh sáng, ảnh/texture vừa tải xong) → yêu cầu vẽ một frame. Effect của con (Lights/OccluderQuad) chạy trước
  // effect này nên uniform/exposure đã cập nhật trước frame được yêu cầu.
  const invalidate = useThree((st) => st.invalidate);
  useEffect(() => {
    invalidate();
  }, [props.items, props.camera, props.occluder, props.lighting, props.selectedUid, props.wallGuide, background, env, invalidate]);
  // Tab ẩn thì trình duyệt dừng requestAnimationFrame: frame đã yêu cầu lúc ẩn chỉ vẽ khi tab hiện lại — vẽ lại
  // chủ động khi hiện lại cho chắc (không có vòng lặp liên tục nào khác để "tự sửa" như frameloop="always").
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") invalidate();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [invalidate]);
  const cam = cameraToThree(props.camera);
  return (
    <>
      <PerspectiveCamera makeDefault fov={cam.fovDeg} near={NEAR} far={FAR} position={cam.position} rotation={[cam.rotationXRad, 0, 0]} />
      <BackgroundQuad texture={background} />
      {props.occluder && <OccluderQuad occluder={props.occluder} heightM={props.camera.heightM} />}
      <Lights lighting={props.lighting} envTexture={env} camera={props.camera} />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.001, -5]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <shadowMaterial opacity={0.35} />
      </mesh>
      <ContactShadows position={[0, 0.005, -5]} scale={20} far={1.5} blur={2.5} opacity={0.5} resolution={512} />
      {props.wallGuide && (
        // Vạch chân tường khi món hít tường (MASTER.md): lõi onImage 3 trên viền scrim 35% 7; cảnh 3D nên món che vạch.
        <>
          <Line points={props.wallGuide.map(([x, z]) => [x, 0.003, z] as [number, number, number])} color="black" transparent opacity={0.35} lineWidth={7} />
          <Line points={props.wallGuide.map(([x, z]) => [x, 0.004, z] as [number, number, number])} color="white" lineWidth={3} />
        </>
      )}
      {props.items.map((item) => {
        const model = modelById(item.productId);
        // Suspense riêng từng món: GLB đang tải chỉ treo món đó, không ẩn cả ảnh phòng + các món khác.
        return model ? (
          <Suspense key={item.uid} fallback={null}>
            <Furniture item={item} model={model} selected={item.uid === props.selectedUid} onPointerDown={props.onItemPointerDown} />
          </Suspense>
        ) : null;
      })}
    </>
  );
}

/**
 * Canvas đúng tỷ lệ ảnh: ảnh phòng → (độ sâu vật thật) → đồ 3D + bóng, camera ảo trùng camera ảnh.
 * Cảnh tĩnh nên frameloop="demand" (chỉ vẽ khi invalidate — xem Scene) và dpr ≤ 1,5 để nhẹ cho điện thoại tầm trung.
 */
export function RoomScene(props: {
  photoUrl: string;
  aspect: number;
  camera: CameraModel;
  items: PlacedItem[];
  selectedUid: string | null;
  occluder: Occluder;
  lighting: PhotoLighting;
  /** Hai đầu (x, z) của vạch chân tường khi món đang hít tường; null = không vẽ. */
  wallGuide?: [[number, number], [number, number]] | null;
  onItemPointerDown: (uid: string, pointer: { x: number; y: number }, hitY: number) => void;
}) {
  return (
    <Canvas
      shadows
      frameloop="demand"
      dpr={[1, 1.5]}
      gl={{ antialias: true }}
      style={{ position: "absolute", inset: 0 }}
      onCreated={(st) => st.invalidate()} // frame đầu tiên ngay khi renderer sẵn sàng
    >
      <Suspense fallback={null}>
        <Scene {...props} />
      </Suspense>
    </Canvas>
  );
}
