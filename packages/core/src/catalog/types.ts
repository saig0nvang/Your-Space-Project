import type { FurnitureDims } from "../types";

export type StyleId = "japandi" | "mid-century" | "bauhaus";
export type Category = "sofa" | "chair" | "table" | "shelf" | "lamp" | "plant";

export type Style = {
  id: StyleId;
  name: string;
  summary: string;
  traits: { colors: string; materials: string; mood: string };
  /** Ảnh tâm trạng phong cách (đường dẫn public). */
  photo: string;
  photoCredit: string;
};

export type Supplier = {
  id: string;
  name: string;
  deliveryMinDays: number;
  deliveryMaxDays: number;
};

/** Một món có mô hình 3D, kích thước thật (mét) đo từ chính mô hình. */
export type FurnitureModel = {
  id: string;
  name: string;
  styleId: StyleId;
  category: Category;
  supplierId: string;
  priceVND: number;
  dimsM: FurnitureDims;
  glbUrl: string;
  material: string;
  /** Xoay thêm để mặt trước món hướng về máy ảnh khi rotationY = 0. */
  baseYawRad: number;
};
