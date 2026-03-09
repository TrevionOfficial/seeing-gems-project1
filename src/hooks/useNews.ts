import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  categories: string[];
  severity: "critical" | "warning" | "info";
}

export function useNews(enabled: boolean) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNews = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("data-proxy", {
        body: { source: "news" },
      });
      if (error) throw error;
      setNews(data?.data || []);
    } catch (e) {
      console.error("Failed to fetch news:", e);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchNews();
    if (!enabled) { setNews([]); return; }
    const interval = setInterval(fetchNews, 120000); // 2 min
    return () => clearInterval(interval);
  }, [fetchNews, enabled]);

  return { news, loading };
}
