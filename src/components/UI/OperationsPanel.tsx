import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Satellite, Plane, Activity, Camera,
  ChevronLeft, ChevronRight, Crosshair, Eye, EyeOff,
  Locate
} from "lucide-react";

export interface LayerState {
  satellites: boolean;
  flights: boolean;
  earthquakes: boolean;
  cctv: boolean;
}

interface OperationsPanelProps {
  layers: LayerState;
  onToggleLayer: (layer: keyof LayerState) => void;
  onLocateMe: () => void;
}

const layerConfig = [
  { key: "satellites" as const, label: "SATELLITES", icon: Satellite, color: "text-tactical-cyan" },
  { key: "flights" as const, label: "FLIGHTS", icon: Plane, color: "text-tactical-amber" },
  { key: "earthquakes" as const, label: "EARTHQUAKES", icon: Activity, color: "text-tactical-red" },
  { key: "cctv" as const, label: "CCTV FEEDS", icon: Camera, color: "text-muted-foreground" },
];

const OperationsPanel = ({ layers, onToggleLayer, onLocateMe }: OperationsPanelProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="fixed left-0 top-0 bottom-8 z-40 flex">
      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-64 bg-background/85 backdrop-blur-md border-r border-border flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-border">
              <h2 className="font-tactical text-xs tracking-[0.3em] text-primary text-glow-green">
                OPERATIONS
              </h2>
              <p className="text-[10px] text-muted-foreground mt-1 tracking-wider">
                LAYER CONTROL PANEL
              </p>
            </div>

            {/* Layer toggles */}
            <div className="flex-1 p-3 space-y-1">
              <div className="text-[10px] text-muted-foreground tracking-wider mb-3 px-2">
                DATA LAYERS
              </div>
              {layerConfig.map(({ key, label, icon: Icon, color }) => (
                <button
                  key={key}
                  onClick={() => onToggleLayer(key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs transition-all ${
                    layers[key]
                      ? "bg-secondary/60 border border-border border-glow-green"
                      : "hover:bg-secondary/30 border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${layers[key] ? color : "text-muted-foreground/50"}`} />
                  <span className={`font-mono tracking-wider flex-1 text-left ${
                    layers[key] ? "text-foreground" : "text-muted-foreground/50"
                  }`}>
                    {label}
                  </span>
                  {layers[key] ? (
                    <Eye className="w-3 h-3 text-primary" />
                  ) : (
                    <EyeOff className="w-3 h-3 text-muted-foreground/30" />
                  )}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="p-3 border-t border-border space-y-1">
              <button
                onClick={onLocateMe}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs hover:bg-secondary/30 transition-all border border-transparent hover:border-border"
              >
                <Locate className="w-4 h-4 text-primary" />
                <span className="font-mono tracking-wider text-foreground">LOCATE ME</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="self-center bg-background/85 backdrop-blur-md border border-border border-l-0 rounded-r px-1 py-3 hover:bg-secondary/30 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-primary" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-primary" />
        )}
      </button>
    </div>
  );
};

export default OperationsPanel;
