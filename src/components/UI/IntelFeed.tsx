import { useState, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Radio } from "lucide-react";

export interface IntelEvent {
  id: string;
  timestamp: Date;
  type: "earthquake" | "satellite" | "flight" | "cctv" | "system";
  message: string;
  severity: "info" | "warning" | "critical";
}

interface IntelFeedProps {
  events: IntelEvent[];
}

const IntelFeed = forwardRef<HTMLDivElement, IntelFeedProps>(({ events }, ref) => {
  const [collapsed, setCollapsed] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-tactical-red text-glow-red";
      case "warning": return "text-tactical-amber text-glow-amber";
      default: return "text-muted-foreground";
    }
  };

  const getTypePrefix = (type: string) => {
    switch (type) {
      case "earthquake": return "[SEIS]";
      case "satellite": return "[SAT]";
      case "flight": return "[FLT]";
      case "cctv": return "[CAM]";
      default: return "[SYS]";
    }
  };

  return (
    <div ref={ref} className="fixed right-0 top-0 bottom-8 z-40 flex">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="self-center bg-background/85 backdrop-blur-md border border-border border-r-0 rounded-l px-1 py-3 hover:bg-secondary/30 transition-colors"
      >
        {collapsed ? (
          <ChevronLeft className="w-4 h-4 text-primary" />
        ) : (
          <ChevronRight className="w-4 h-4 text-primary" />
        )}
      </button>

      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-72 bg-background/85 backdrop-blur-md border-l border-border flex flex-col"
          >
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-primary animate-pulse-glow" />
              <h2 className="font-tactical text-xs tracking-[0.3em] text-primary text-glow-green">
                INTEL FEED
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {events.length === 0 ? (
                <div className="text-[10px] text-muted-foreground/50 text-center py-8 tracking-wider">
                  AWAITING INTEL...
                </div>
              ) : (
                events.slice(0, 50).map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[11px] font-mono border-l-2 border-border pl-2 py-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className={getSeverityColor(event.severity)}>
                        {getTypePrefix(event.type)}
                      </span>
                      <span className="text-muted-foreground/60">
                        {event.timestamp.toISOString().slice(11, 19)}Z
                      </span>
                    </div>
                    <div className="text-foreground/80 mt-0.5 leading-relaxed">
                      {event.message}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

IntelFeed.displayName = "IntelFeed";

export default IntelFeed;
