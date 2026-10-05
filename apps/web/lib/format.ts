import type { FurnitureDims } from "@yourspace/core";

const vnd = new Intl.NumberFormat("vi-VN");

export const formatVND = (n: number): string => `${vnd.format(n)} ₫`;

export const formatDimsCm = (d: FurnitureDims): string =>
  `rộng ${Math.round(d.widthM * 100)} × sâu ${Math.round(d.depthM * 100)} × cao ${Math.round(d.heightM * 100)} cm`;
