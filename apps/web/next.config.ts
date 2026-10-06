import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // onnxruntime-node (native addon) và sharp không bundle được qua webpack/turbopack — chạy
  // thẳng từ node_modules (D11: LaMa tự host cho /api/ai/inpaint).
  serverExternalPackages: ["onnxruntime-node", "sharp"],
};

export default nextConfig;
