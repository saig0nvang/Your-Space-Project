import type { DepthMap } from "../types";

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export type AIErrorKind =
  | "Timeout"
  | "RateLimited"
  | "BudgetExceeded"
  | "VendorError"
  | "LowConfidence";

export type AIError = { kind: AIErrorKind; message: string };

export type DepthResult = { depth: DepthMap };

/** Interface đổi được adapter: browserDepth (spike/on-device) hoặc serverDepth (Replicate). */
export interface DepthService<I> {
  depth(input: I): Promise<Result<DepthResult, AIError>>;
}

export type InpaintResult = { png: Uint8Array };

/** Interface đổi được adapter xóa đồ: Replicate LaMa (M1) hoặc on-device sau này (D3). */
export interface InpaintService<I> {
  inpaint(input: I): Promise<Result<InpaintResult, AIError>>;
}
