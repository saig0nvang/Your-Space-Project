"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, PerspectiveCamera, useGLTF } from "@react-three/drei";
import { cameraToThree, type Calibration, type Transform } from "@yourspace/core";

function Model({ url, t }: { url: string; t: Transform }) {
  const { scene } = useGLTF(url);
  return (
    <primitive
      object={scene}
      position={[t.position.x, t.position.y, t.position.z]}
      rotation={[0, t.rotationYRad, 0]}
      scale={t.scale}
    />
  );
}

/**
 * Composite: ảnh phòng làm nền (CSS) + đồ 3D render qua camera hiệu chỉnh + contact shadow.
 * Occlusion (che khuất bằng depth) = bước sau (vòng chạy-sửa). Bản này ưu tiên
 * kiểm tra scale + chạm sàn + phối cảnh trước.
 */
export function RoomCanvas({
  photoUrl,
  glbUrl,
  calibration,
  transform,
}: {
  photoUrl: string;
  glbUrl: string;
  calibration: Calibration;
  transform: Transform;
}) {
  const cam = cameraToThree(calibration.camera);
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 3", background: "#111" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photoUrl}
        alt="room"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <Canvas style={{ position: "absolute", inset: 0 }} gl={{ alpha: true }} shadows>
        <PerspectiveCamera
          makeDefault
          fov={cam.fovDeg}
          position={cam.position}
          rotation={[cam.rotationXRad, 0, 0]}
        />
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 5, 2]} intensity={1.2} castShadow />
        <ContactShadows position={[0, 0.01, 0]} opacity={0.45} scale={12} blur={2.4} far={6} />
        <Suspense fallback={null}>
          <Model url={glbUrl} t={transform} />
        </Suspense>
      </Canvas>
    </div>
  );
}
