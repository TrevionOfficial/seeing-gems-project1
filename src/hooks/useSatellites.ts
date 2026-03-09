import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SatelliteData {
  id: string;
  name: string;
  lat: number;
  lon: number;
  alt: number; // km
  velocity: number;
}

export function useSatellites(enabled: boolean) {
  const [satellites, setSatellites] = useState<SatelliteData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSatellites = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const satellite = await import("satellite.js");

      const { data, error } = await supabase.functions.invoke("data-proxy", {
        body: { source: "satellites" },
      });
      if (error) throw error;

      const text = typeof data === "string" ? data : JSON.stringify(data);
      const lines = text.trim().split("\n");

      const sats: SatelliteData[] = [];
      const now = new Date();
      const gmst = satellite.gstime(now);

      for (let i = 0; i < Math.min(lines.length, 450); i += 3) {
        try {
          const name = lines[i].trim();
          const tleLine1 = lines[i + 1]?.trim();
          const tleLine2 = lines[i + 2]?.trim();
          if (!tleLine1 || !tleLine2) continue;

          const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
          const positionAndVelocity = satellite.propagate(satrec, now);

          if (typeof positionAndVelocity.position === "boolean") continue;
          const posEci = positionAndVelocity.position;
          const velEci = positionAndVelocity.velocity;
          if (!posEci || typeof velEci === "boolean" || !velEci) continue;

          const posGd = satellite.eciToGeodetic(posEci, gmst);
          const lat = satellite.degreesLat(posGd.latitude);
          const lon = satellite.degreesLong(posGd.longitude);
          const alt = posGd.height;
          const velocity = Math.sqrt(velEci.x ** 2 + velEci.y ** 2 + velEci.z ** 2);

          sats.push({ id: `sat-${i / 3}`, name, lat, lon, alt, velocity });
        } catch {
          continue;
        }
      }

      setSatellites(sats);
    } catch (e) {
      console.error("Failed to fetch satellites:", e);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchSatellites();
    if (!enabled) { setSatellites([]); return; }
    const interval = setInterval(fetchSatellites, 60000);
    return () => clearInterval(interval);
  }, [fetchSatellites, enabled]);

  return { satellites, loading };
}
