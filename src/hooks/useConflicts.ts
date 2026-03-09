import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ConflictEvent {
  id: string;
  event_type: string;
  event_date: string;
  country: string;
  location: string;
  lat: number;
  lon: number;
  fatalities: number;
  notes: string;
  source: string;
  severity: "critical" | "warning" | "info";
}

export function useConflicts(enabled: boolean) {
  const [conflicts, setConflicts] = useState<ConflictEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConflicts = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("data-proxy", {
        body: { source: "conflicts" },
      });
      if (error) throw error;

      // Parse ACLED response
      const raw = typeof data === "string" ? JSON.parse(data) : data;
      const events = (raw?.data || []).map((e: any, i: number) => ({
        id: e.data_id || `conflict-${i}`,
        event_type: e.event_type || "Unknown",
        event_date: e.event_date || "",
        country: e.country || "",
        location: e.location || "",
        lat: parseFloat(e.latitude) || 0,
        lon: parseFloat(e.longitude) || 0,
        fatalities: parseInt(e.fatalities) || 0,
        notes: (e.notes || "").slice(0, 200),
        source: e.source || "",
        severity: (parseInt(e.fatalities) || 0) > 10 ? "critical" : (parseInt(e.fatalities) || 0) > 0 ? "warning" : "info",
      })).filter((e: ConflictEvent) => e.lat !== 0 && e.lon !== 0);

      setConflicts(events);
    } catch (e) {
      console.error("Failed to fetch conflicts:", e);
      // Fallback: use GDELT-style data from a public API
      try {
        const res = await fetch("https://api.gdeltproject.org/api/v2/geo/geo?query=conflict&mode=pointdata&format=geojson&maxpoints=100&last24hrs=yes");
        if (res.ok) {
          const geojson = await res.json();
          const events = (geojson?.features || []).map((f: any, i: number) => ({
            id: `gdelt-${i}`,
            event_type: "Conflict",
            event_date: new Date().toISOString(),
            country: f.properties?.name || "",
            location: f.properties?.name || "",
            lat: f.geometry?.coordinates?.[1] || 0,
            lon: f.geometry?.coordinates?.[0] || 0,
            fatalities: 0,
            notes: f.properties?.html || "",
            source: "GDELT",
            severity: "warning" as const,
          })).filter((e: ConflictEvent) => e.lat !== 0 && e.lon !== 0);
          setConflicts(events);
        }
      } catch {
        setConflicts([]);
      }
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchConflicts();
    if (!enabled) { setConflicts([]); return; }
    const interval = setInterval(fetchConflicts, 300000); // 5 min
    return () => clearInterval(interval);
  }, [fetchConflicts, enabled]);

  return { conflicts, loading };
}
