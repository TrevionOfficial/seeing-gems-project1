import { useState, useEffect, useCallback } from "react";

export interface CCTVCamera {
  id: string;
  lat: number;
  lon: number;
  name: string;
  imageUrl: string;
}

export function useCCTV(enabled: boolean) {
  const [cameras, setCameras] = useState<CCTVCamera[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCameras = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      // TfL JamCam API - free, no auth
      const res = await fetch("https://api.tfl.gov.uk/Place/Type/JamCam");
      const data = await res.json();
      
      const cams: CCTVCamera[] = data.slice(0, 100).map((cam: any) => ({
        id: cam.id || cam.commonName,
        lat: cam.lat,
        lon: cam.lon,
        name: cam.commonName || "Unknown Camera",
        imageUrl: cam.additionalProperties?.find((p: any) => p.key === "imageUrl")?.value || "",
      })).filter((c: CCTVCamera) => c.lat && c.lon);
      
      setCameras(cams);
    } catch (e) {
      console.error("Failed to fetch CCTV:", e);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchCameras();
    if (!enabled) { setCameras([]); return; }
    const interval = setInterval(fetchCameras, 120000);
    return () => clearInterval(interval);
  }, [fetchCameras, enabled]);

  return { cameras, loading };
}
