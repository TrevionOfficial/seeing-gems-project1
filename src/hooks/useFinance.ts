import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MarketQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
}

export function useFinance(enabled: boolean) {
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFinance = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("data-proxy", {
        body: { source: "finance" },
      });
      if (error) throw error;
      setQuotes(data?.data || []);
    } catch (e) {
      console.error("Failed to fetch finance:", e);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchFinance();
    if (!enabled) { setQuotes([]); return; }
    const interval = setInterval(fetchFinance, 60000); // 1 min
    return () => clearInterval(interval);
  }, [fetchFinance, enabled]);

  return { quotes, loading };
}
