import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Clock, AlertTriangle, Info, ExternalLink, Plane, Satellite, Activity, Cable } from "lucide-react";

export type EntityType = "earthquake" | "flight" | "satellite" | "conflict" | "cable";

export interface EntityDetails {
  type: EntityType;
  id: string;
  title: string;
  subtitle?: string;
  lat?: number;
  lon?: number;
  details: Record<string, string | number | undefined>;
  severity?: "info" | "warning" | "critical";
  link?: string;
}

interface EntityDetailPopupProps {
  entity: EntityDetails | null;
  onClose: () => void;
}

const typeIcons: Record<EntityType, any> = {
  earthquake: Activity,
  flight: Plane,
  satellite: Satellite,
  conflict: AlertTriangle,
  cable: Cable,
};

const typeColors: Record<EntityType, string> = {
  earthquake: "text-tactical-red",
  flight: "text-tactical-amber",
  satellite: "text-tactical-cyan",
  conflict: "text-tactical-red",
  cable: "text-tactical-cyan",
};

const EntityDetailPopup = ({ entity, onClose }: EntityDetailPopupProps) => {
  if (!entity) return null;

  const Icon = typeIcons[entity.type];
  const colorClass = typeColors[entity.type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 w-80 max-w-[90vw]"
      >
        <div className="bg-background/95 backdrop-blur-md border border-border rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border bg-secondary/20">
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${colorClass}`} />
              <span className="font-tactical text-xs tracking-wider text-primary uppercase">
                {entity.type}
              </span>
              {entity.severity && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  entity.severity === "critical" ? "bg-tactical-red/20 text-tactical-red" :
                  entity.severity === "warning" ? "bg-tactical-amber/20 text-tactical-amber" :
                  "bg-primary/20 text-primary"
                }`}>
                  {entity.severity.toUpperCase()}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-secondary/50 rounded transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="p-3 space-y-3">
            <div>
              <h3 className="font-mono text-sm text-foreground font-medium leading-tight">
                {entity.title}
              </h3>
              {entity.subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{entity.subtitle}</p>
              )}
            </div>

            {(entity.lat !== undefined && entity.lon !== undefined) && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{entity.lat.toFixed(4)}°, {entity.lon.toFixed(4)}°</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {Object.entries(entity.details).map(([key, value]) => {
                if (value === undefined || value === null || value === "") return null;
                return (
                  <div key={key} className="bg-secondary/30 rounded px-2 py-1.5">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {key}
                    </div>
                    <div className="text-xs text-foreground font-mono truncate">
                      {typeof value === "number" ? value.toLocaleString() : value}
                    </div>
                  </div>
                );
              })}
            </div>

            {entity.link && (
              <a
                href={entity.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                View Details
              </a>
            )}
          </div>

          {/* Timestamp */}
          <div className="px-3 py-2 border-t border-border bg-secondary/10">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{new Date().toISOString().replace("T", " ").slice(0, 19)}Z</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EntityDetailPopup;
