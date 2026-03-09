import { useState, useEffect, forwardRef } from "react";
import { Satellite, Plane, Activity, Camera, Swords, Newspaper } from "lucide-react";

interface StatusBarProps {
  lat: number;
  lon: number;
  alt: number;
  entityCounts: {
    satellites: number;
    flights: number;
    earthquakes: number;
    cctv: number;
    conflicts: number;
    news: number;
  };
}

const StatusBar = forwardRef<HTMLDivElement, StatusBarProps>(({ lat, lon, alt, entityCounts }, ref) => {
  const [utcTime, setUtcTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setUtcTime(now.toISOString().replace("T", " ").slice(0, 19) + "Z");
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCoord = (val: number, pos: string, neg: string) => {
    const dir = val >= 0 ? pos : neg;
    return `${Math.abs(val).toFixed(4)}°${dir}`;
  };

  const formatAlt = (meters: number) => {
    if (meters > 1000000) return `${(meters / 1000000).toFixed(1)}M km`;
    if (meters > 1000) return `${(meters / 1000).toFixed(0)} km`;
    return `${meters.toFixed(0)} m`;
  };

  return (
    <div ref={ref} className="fixed bottom-0 left-0 right-0 z-40 h-8 bg-background/90 backdrop-blur-sm border-t border-border flex items-center px-4 text-xs font-mono">
      <div className="text-primary text-glow-green mr-6">
        {utcTime}
      </div>

      <div className="text-muted-foreground mr-6">
        LAT {formatCoord(lat, "N", "S")} | LON {formatCoord(lon, "E", "W")} | ALT {formatAlt(alt)}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 text-tactical-cyan">
          <Satellite className="w-3 h-3" />
          <span>{entityCounts.satellites}</span>
        </div>
        <div className="flex items-center gap-1 text-tactical-amber">
          <Plane className="w-3 h-3" />
          <span>{entityCounts.flights}</span>
        </div>
        <div className="flex items-center gap-1 text-tactical-red">
          <Activity className="w-3 h-3" />
          <span>{entityCounts.earthquakes}</span>
        </div>
        <div className="flex items-center gap-1 text-tactical-red">
          <Swords className="w-3 h-3" />
          <span>{entityCounts.conflicts}</span>
        </div>
        <div className="flex items-center gap-1 text-primary">
          <Newspaper className="w-3 h-3" />
          <span>{entityCounts.news}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Camera className="w-3 h-3" />
          <span>{entityCounts.cctv}</span>
        </div>
      </div>

      <div className="ml-6 flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
        <span className="text-primary text-glow-green">ONLINE</span>
      </div>
    </div>
  );
});

StatusBar.displayName = "StatusBar";

export default StatusBar;
