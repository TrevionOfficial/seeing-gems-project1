import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FlightData {
  id: string;
  callsign: string;
  lat: number;
  lon: number;
  altitude: number;
  speed: number;
  heading: number;
  type: string;
  registration: string;
}

export function useFlights(enabled: boolean) {
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFlights = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("data-proxy", {
        body: { source: "flights" },
      });
      if (error) throw error;

      const raw = typeof data === "string" ? JSON.parse(data) : data;
      if (raw?.states) {
        const flightList: FlightData[] = raw.states.slice(0, 300).map((s: any[], idx: number) => ({
          id: s[0] || `flt-${idx}`,
          callsign: (s[1] || "").trim() || "N/A",
          lat: s[6] || 0,
          lon: s[5] || 0,
          altitude: (s[7] || 0) * 3.28084,
          speed: (s[9] || 0) * 1.94384,
          heading: s[10] || 0,
          type: "",
          registration: "",
        })).filter((f: FlightData) => f.lat !== 0 && f.lon !== 0);
        setFlights(flightList);
      }
    } catch (e) {
      console.error("Failed to fetch flights:", e);
      setFlights([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchFlights();
    if (!enabled) { setFlights([]); return; }
    const interval = setInterval(fetchFlights, 30000);
    return () => clearInterval(interval);
  }, [fetchFlights, enabled]);

  return { flights, loading };
}
