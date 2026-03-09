import { useState, useEffect, useCallback } from "react";

export interface Earthquake {
  id: string;
  lat: number;
  lon: number;
  depth: number;
  magnitude: number;
  place: string;
  time: number;
  type: string;
}

export function useEarthquakes(enabled: boolean) {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchQuakes = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const res = await fetch(
        "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson"
      );
      const data = await res.json();
      const quakes: Earthquake[] = data.features.map((f: any) => ({
        id: f.id,
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
        depth: f.geometry.coordinates[2],
        magnitude: f.properties.mag,
        place: f.properties.place,
        time: f.properties.time,
        type: f.properties.type,
      }));
      setEarthquakes(quakes);
    } catch (e) {
      console.error("Failed to fetch earthquakes:", e);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchQuakes();
    if (!enabled) { setEarthquakes([]); return; }
    const interval = setInterval(fetchQuakes, 60000);
    return () => clearInterval(interval);
  }, [fetchQuakes, enabled]);

  return { earthquakes, loading };
}
