"use client";
import { imageStats, lightingFromImageStats, type PhotoLighting } from "@yourspace/core";
import { useEffect, useState } from "react";
import { DEFAULT_LIGHTING } from "@/components/editor/RoomScene";
import { readPixels } from "@/lib/image";

export function usePhotoLighting(url: string | null): PhotoLighting {
  const [lighting, setLighting] = useState<PhotoLighting>(DEFAULT_LIGHTING);
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    readPixels(url, 64)
      .then(({ data, width, height }) => { if (!cancelled) setLighting(lightingFromImageStats(imageStats(data, width, height))); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [url]);
  return lighting;
}
