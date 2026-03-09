import { useState, useEffect, useCallback } from "react";

export interface FlightData {
  id: string;
  callsign: string;
  lat: number;
  lon: number;
  altitude: number; // feet
  speed: number; // knots
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
      // adsb.fi public API - no auth needed, returns aircraft in view
      const res = await fetch("https://opensky-network.org/api/states/all?lamin=25&lomin=-130&lamax=50&lomax=-60");
      const data = await res.json();
      
      if (data.states) {
        const flightList: FlightData[] = data.states.slice(0, 300).map((s: any[], idx: number) => ({
          id: s[0] || `flt-${idx}`,
          callsign: (s[1] || "").trim() || "N/A",
          lat: s[6] || 0,
          lon: s[5] || 0,
          altitude: (s[7] || 0) * 3.28084, // m to ft
          speed: (s[9] || 0) * 1.94384, // m/s to knots
          heading: s[10] || 0,
          type: "",
          registration: "",
        })).filter((f: FlightData) => f.lat !== 0 && f.lon !== 0);
        
        setFlights(flightList);
      }
    } catch (e) {
      console.error("Failed to fetch flights:", e);
      // Fallback: generate some simulated flights
      setFlights([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchFlights();
    if (!enabled) { setFlights([]); return; }
    const interval = setInterval(fetchFlights, 15000);
    return () => clearInterval(interval);
  }, [fetchFlights, enabled]);

  return { flights, loading };
}
