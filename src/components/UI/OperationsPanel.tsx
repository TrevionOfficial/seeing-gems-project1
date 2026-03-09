import { useState, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Crosshair, Satellite, Plane, Activity, Camera, Cable, Swords, Newspaper, TrendingUp } from "lucide-react";

export interface LayerState {
  satellites: boolean;
  flights: boolean;
  earthquakes: boolean;
  cctv: boolean;
  cables: boolean;
  conflicts: boolean;
  news: boolean;
  finance: boolean;
}

interface OperationsPanelProps {
  layers: LayerState;
  onToggleLayer: (layer: keyof LayerState) => void;
  onLocateMe: () => void;
}

const layerConfig: Record<keyof LayerState, { label: string; icon: any; color: string }> = {
  satellites: { label: "SATELLITES", icon: Satellite, color: "text-tactical-cyan" },
  flights: { label: "FLIGHTS", icon: Plane, color: "text-tactical-amber" },
  earthquakes: { label: "SEISMIC", icon: Activity, color: "text-tactical-red" },
  conflicts: { label: "CONFLICTS", icon: Swords, color: "text-tactical-red" },
  cables: { label: "CABLES", icon: Cable, color: "text-tactical-cyan" },
  news: { label: "NEWS INTEL", icon: Newspaper, color: "text-primary" },
  finance: { label: "MARKETS", icon: TrendingUp, color: "text-tactical-amber" },
  cctv: { label: "CCTV", icon: Camera, color: "text-muted-foreground" },
};

const OperationsPanel = forwardRef<HTMLDivElement, OperationsPanelProps>(({ layers, onToggleLayer, onLocateMe }, ref) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div ref={ref} className="fixed left-0 top-6 bottom-8 z-40 flex">
      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-56 bg-background/85 backdrop-blur-md border-r border-border flex flex-col"
          >
            <div className="p-3 border-b border-border">
              <h2 className="font-tactical text-xs tracking-[0.3em] text-primary text-glow-green">
                OPERATIONS
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {(Object.keys(layerConfig) as (keyof LayerState)[]).map((key) => {
                const config = layerConfig[key];
                const Icon = config.icon;
                const active = layers[key];

                return (
                  <button
                    key={key}
                    onClick={() => onToggleLayer(key)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] font-mono transition-colors ${
                      active
                        ? "bg-secondary/30 text-foreground"
                        : "text-muted-foreground/50 hover:bg-secondary/20"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? config.color : "text-muted-foreground/30"}`} />
                    <span className="flex-1 text-left tracking-wider">{config.label}</span>
                    {active ? (
                      <Eye className="w-3 h-3 text-primary" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-muted-foreground/30" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-2 border-t border-border">
              <button
                onClick={onLocateMe}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-mono tracking-wider transition-colors"
              >
                <Crosshair className="w-3.5 h-3.5" />
                LOCATE ME
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="self-center bg-background/85 backdrop-blur-md border border-border border-l-0 rounded-r px-1 py-3 hover:bg-secondary/30 transition-colors"
      >
        {collapsed ? (
          <Eye className="w-4 h-4 text-primary" />
        ) : (
          <EyeOff className="w-4 h-4 text-primary" />
        )}
      </button>
    </div>
  );
});

OperationsPanel.displayName = "OperationsPanel";

export default OperationsPanel;
