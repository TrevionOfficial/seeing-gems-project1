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

      const raw = typeof data === "string" ? JSON.parse(data) : data;
      const events = (raw?.data || []).map((e: any) => ({
        id: e.id || `conflict-${Math.random()}`,
        event_type: e.event_type || "Conflict/Protest",
        event_date: e.event_date || new Date().toISOString(),
        country: e.country || "",
        location: e.location || "",
        lat: e.lat || 0,
        lon: e.lon || 0,
        fatalities: e.fatalities || 0,
        notes: e.notes || "",
        source: e.source || "GDELT",
        severity: e.severity || "warning",
      })).filter((e: ConflictEvent) => e.lat !== 0 && e.lon !== 0);

      setConflicts(events);
    } catch (e) {
      console.error("Failed to fetch conflicts:", e);
      setConflicts([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchConflicts();
    if (!enabled) { setConflicts([]); return; }
    const interval = setInterval(fetchConflicts, 300000);
    return () => clearInterval(interval);
  }, [fetchConflicts, enabled]);

  return { conflicts, loading };
}
