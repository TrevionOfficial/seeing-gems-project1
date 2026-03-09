import { motion } from "framer-motion";
import { Satellite, Plane, Activity, Swords, Newspaper, Cable, TrendingUp, TrendingDown, Zap } from "lucide-react";
import type { MarketQuote } from "@/hooks/useFinance";

interface DashboardStatsProps {
  counts: {
    satellites: number;
    flights: number;
    earthquakes: number;
    conflicts: number;
    news: number;
  };
  quotes: MarketQuote[];
  visible: boolean;
}

const StatCard = ({ icon: Icon, label, value, color, subtext }: {
  icon: any;
  label: string;
  value: number | string;
  color: string;
  subtext?: string;
}) => (
  <div className="bg-background/80 backdrop-blur-sm border border-border rounded-lg p-3 hover:border-primary/30 transition-colors">
    <div className="flex items-center gap-2 mb-1">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-xl font-mono text-foreground">{value}</div>
    {subtext && <div className="text-[10px] text-muted-foreground mt-0.5">{subtext}</div>}
  </div>
);

const DashboardStats = ({ counts, quotes, visible }: DashboardStatsProps) => {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed top-10 right-4 z-30 w-64 space-y-3"
    >
      {/* Entity Stats */}
      <div className="bg-background/60 backdrop-blur-md border border-border rounded-lg p-3">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span className="font-tactical text-[10px] tracking-[0.2em] text-primary">LIVE TRACKING</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <StatCard icon={Satellite} label="Satellites" value={counts.satellites} color="text-tactical-cyan" />
          <StatCard icon={Plane} label="Aircraft" value={counts.flights} color="text-tactical-amber" />
          <StatCard icon={Activity} label="Seismic" value={counts.earthquakes} color="text-tactical-red" />
          <StatCard icon={Swords} label="Conflicts" value={counts.conflicts} color="text-tactical-red" />
        </div>
        
        <div className="mt-2 pt-2 border-t border-border">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground flex items-center gap-1">
              <Newspaper className="w-3 h-3" /> Intel Reports
            </span>
            <span className="text-foreground font-mono">{counts.news}</span>
          </div>
        </div>
      </div>

      {/* Market Summary */}
      {quotes.length > 0 && (
        <div className="bg-background/60 backdrop-blur-md border border-border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            <span className="font-tactical text-[10px] tracking-[0.2em] text-primary">MARKETS</span>
          </div>
          
          <div className="space-y-2">
            {quotes.slice(0, 4).map((q) => {
              const isUp = q.change >= 0;
              return (
                <div key={q.symbol} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{q.name || q.symbol}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-foreground">
                      {q.price?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                    <span className={`text-[10px] flex items-center ${isUp ? "text-primary" : "text-destructive"}`}>
                      {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                      {q.changePercent?.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DashboardStats;
