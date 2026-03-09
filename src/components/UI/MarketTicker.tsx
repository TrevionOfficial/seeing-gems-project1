import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { MarketQuote } from "@/hooks/useFinance";

interface MarketTickerProps {
  quotes: MarketQuote[];
}

const SYMBOL_LABELS: Record<string, string> = {
  "^GSPC": "S&P 500",
  "^DJI": "DOW",
  "^IXIC": "NASDAQ",
  "^FTSE": "FTSE",
  "^N225": "NIKKEI",
  "CL=F": "OIL",
  "GC=F": "GOLD",
  "BTC-USD": "BTC",
};

const MarketTicker = ({ quotes }: MarketTickerProps) => {
  if (quotes.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 h-6 bg-background/90 backdrop-blur-sm border-b border-border flex items-center overflow-hidden"
    >
      <div className="flex items-center gap-6 animate-scroll px-4 text-[10px] font-mono whitespace-nowrap">
        {quotes.map((q) => {
          const isUp = q.change >= 0;
          return (
            <div key={q.symbol} className="flex items-center gap-1.5">
              <span className="text-muted-foreground">
                {SYMBOL_LABELS[q.symbol] || q.symbol}
              </span>
              <span className="text-foreground/90">
                {q.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={isUp ? "text-primary" : "text-destructive"}>
                {isUp ? <TrendingUp className="w-2.5 h-2.5 inline" /> : <TrendingDown className="w-2.5 h-2.5 inline" />}
                {isUp ? "+" : ""}{q.changePercent?.toFixed(2)}%
              </span>
            </div>
          );
        })}
        {/* Duplicate for seamless scroll */}
        {quotes.map((q) => {
          const isUp = q.change >= 0;
          return (
            <div key={`dup-${q.symbol}`} className="flex items-center gap-1.5">
              <span className="text-muted-foreground">
                {SYMBOL_LABELS[q.symbol] || q.symbol}
              </span>
              <span className="text-foreground/90">
                {q.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={isUp ? "text-primary" : "text-destructive"}>
                {isUp ? <TrendingUp className="w-2.5 h-2.5 inline" /> : <TrendingDown className="w-2.5 h-2.5 inline" />}
                {isUp ? "+" : ""}{q.changePercent?.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default MarketTicker;
