import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory cache
const cache: Record<string, { data: string; ts: number }> = {};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { source, params } = await req.json();

    let url = "";
    let cacheTTL = 30000; // 30s default

    switch (source) {
      case "satellites":
        url = "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle";
        cacheTTL = 60000; // 1 min
        break;
      case "flights":
        url = `https://opensky-network.org/api/states/all?lamin=${params?.lamin ?? 25}&lomin=${params?.lomin ?? -130}&lamax=${params?.lamax ?? 50}&lomax=${params?.lomax ?? -60}`;
        cacheTTL = 15000;
        break;
      case "news":
        // Fetch from multiple RSS sources and return combined
        const feeds = await fetchNewsFeeds();
        return new Response(JSON.stringify({ data: feeds }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      case "conflicts":
        url = "https://api.acleddata.com/acled/read?terms=accept&limit=200&event_date=" + getDateRange(7) + "&event_date_where=BETWEEN";
        cacheTTL = 300000; // 5 min
        break;
      case "finance":
        const marketData = await fetchMarketData();
        return new Response(JSON.stringify({ data: marketData }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      default:
        return new Response(JSON.stringify({ error: "Unknown source" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // Check cache
    const cached = cache[source];
    if (cached && Date.now() - cached.ts < cacheTTL) {
      return new Response(cached.data, {
        headers: { ...corsHeaders, "Content-Type": source === "satellites" ? "text/plain" : "application/json" },
      });
    }

    const response = await fetch(url);
    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Upstream ${response.status}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const text = await response.text();
    cache[source] = { data: text, ts: Date.now() };

    return new Response(text, {
      headers: { ...corsHeaders, "Content-Type": source === "satellites" ? "text/plain" : "application/json" },
    });
  } catch (e) {
    console.error("Proxy error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getDateRange(days: number): string {
  const end = new Date();
  const start = new Date(end.getTime() - days * 86400000);
  return `${start.toISOString().slice(0, 10)}|${end.toISOString().slice(0, 10)}`;
}

async function fetchNewsFeeds(): Promise<any[]> {
  const RSS_SOURCES = [
    { url: "https://feeds.bbci.co.uk/news/world/rss.xml", name: "BBC World" },
    { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", name: "NY Times" },
    { url: "https://feeds.reuters.com/reuters/topNews", name: "Reuters" },
    { url: "https://www.aljazeera.com/xml/rss/all.xml", name: "Al Jazeera" },
    { url: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.atom", name: "USGS Significant" },
  ];

  const cached = cache["news"];
  if (cached && Date.now() - cached.ts < 120000) {
    return JSON.parse(cached.data);
  }

  const results: any[] = [];

  await Promise.allSettled(
    RSS_SOURCES.map(async (source) => {
      try {
        const res = await fetch(source.url, {
          headers: { "User-Agent": "WorldMonitor/1.0" },
          signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) return;
        const xml = await res.text();
        const items = parseRSSItems(xml, source.name);
        results.push(...items);
      } catch {
        // skip failed feeds
      }
    })
  );

  // Sort by date desc, limit to 50
  results.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  const limited = results.slice(0, 50);

  cache["news"] = { data: JSON.stringify(limited), ts: Date.now() };
  return limited;
}

function parseRSSItems(xml: string, source: string): any[] {
  const items: any[] = [];
  // Simple regex RSS parser for edge function (no DOM parser)
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  const titleRegex = /<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/i;
  const descRegex = /<description><!\[CDATA\[(.*?)\]\]>|<description>(.*?)<\/description>/i;
  const linkRegex = /<link>(.*?)<\/link>/i;
  const dateRegex = /<pubDate>(.*?)<\/pubDate>/i;
  const categoryRegex = /<category[^>]*>(.*?)<\/category>/gi;

  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = (titleRegex.exec(block)?.[1] || titleRegex.exec(block)?.[2] || "").trim();
    const desc = (descRegex.exec(block)?.[1] || descRegex.exec(block)?.[2] || "").trim();
    const link = (linkRegex.exec(block)?.[1] || "").trim();
    const pubDate = (dateRegex.exec(block)?.[1] || new Date().toISOString()).trim();

    const categories: string[] = [];
    let catMatch;
    while ((catMatch = categoryRegex.exec(block)) !== null) {
      categories.push(catMatch[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim());
    }

    if (title) {
      items.push({
        title: decodeHTMLEntities(title),
        description: decodeHTMLEntities(desc).slice(0, 200),
        link,
        pubDate,
        source,
        categories,
        severity: classifySeverity(title + " " + desc),
      });
    }
  }
  return items;
}

function decodeHTMLEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]*>/g, "");
}

function classifySeverity(text: string): "critical" | "warning" | "info" {
  const lower = text.toLowerCase();
  if (/\b(killed|dead|death|massacre|bomb|attack|explosion|war|invasion|nuclear)\b/.test(lower)) return "critical";
  if (/\b(protest|warning|alert|threat|crisis|conflict|strike|sanction|missile)\b/.test(lower)) return "warning";
  return "info";
}

async function fetchMarketData(): Promise<any[]> {
  const cached = cache["finance"];
  if (cached && Date.now() - cached.ts < 60000) {
    return JSON.parse(cached.data);
  }

  // Use Yahoo Finance unofficial API for major indices
  const symbols = ["^GSPC", "^DJI", "^IXIC", "^FTSE", "^N225", "CL=F", "GC=F", "BTC-USD"];
  const results: any[] = [];

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(",")}`,
      {
        headers: { "User-Agent": "WorldMonitor/1.0" },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (res.ok) {
      const data = await res.json();
      const quotes = data?.quoteResponse?.result || [];
      for (const q of quotes) {
        results.push({
          symbol: q.symbol,
          name: q.shortName || q.longName || q.symbol,
          price: q.regularMarketPrice,
          change: q.regularMarketChange,
          changePercent: q.regularMarketChangePercent,
          currency: q.currency,
        });
      }
    }
  } catch {
    // Return empty on failure
  }

  cache["finance"] = { data: JSON.stringify(results), ts: Date.now() };
  return results;
}
