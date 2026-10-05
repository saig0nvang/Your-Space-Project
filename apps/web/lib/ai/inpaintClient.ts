"use client";
import type { AIError, Result } from "@yourspace/core";

export async function inpaint(image: Blob, mask: Blob): Promise<Result<Blob, AIError>> {
  const fd = new FormData();
  fd.set("image", image, "image.jpg");
  fd.set("mask", mask, "mask.png");
  try {
    const res = await fetch("/api/ai/inpaint", { method: "POST", body: fd });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: AIError } | null;
      return { ok: false, error: body?.error ?? { kind: "VendorError", message: `HTTP ${res.status}` } };
    }
    return { ok: true, value: await res.blob() };
  } catch {
    return { ok: false, error: { kind: "VendorError", message: "Mất kết nối mạng" } };
  }
}
