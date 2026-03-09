import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BOOT_LINES = [
  { text: "WORLDVIEW TACTICAL INTELLIGENCE SYSTEM v2.0", delay: 0, type: "header" },
  { text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", delay: 200, type: "divider" },
  { text: "[INIT] Loading core modules...", delay: 400, type: "info" },
  { text: "[OK]   Cesium 3D Engine initialized", delay: 800, type: "success" },
  { text: "[OK]   Satellite tracking module online", delay: 1200, type: "success" },
  { text: "[OK]   Flight radar interface ready", delay: 1600, type: "success" },
  { text: "[OK]   Seismic monitoring active", delay: 2000, type: "success" },
  { text: "[OK]   CCTV surveillance network linked", delay: 2400, type: "success" },
  { text: "[WARN] Server-side proxy unavailable — direct API mode", delay: 2800, type: "warning" },
  { text: "[OK]   All subsystems operational", delay: 3200, type: "success" },
  { text: "", delay: 3500, type: "blank" },
  { text: "SYSTEM READY — ENTERING TACTICAL VIEW", delay: 3600, type: "header" },
];

interface BootScreenProps {
  onComplete: () => void;
}

const BootScreen = ({ onComplete }: BootScreenProps) => {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    BOOT_LINES.forEach((line, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), line.delay));
    });
    timers.push(setTimeout(() => setComplete(true), 4200));
    timers.push(setTimeout(() => onComplete(), 5000));
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const getLineColor = (type: string) => {
    switch (type) {
      case "header": return "text-primary text-glow-green";
      case "success": return "text-primary";
      case "warning": return "text-accent text-glow-amber";
      case "divider": return "text-muted-foreground";
      default: return "text-foreground";
    }
  };

  return (
    <AnimatePresence>
      {!complete && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="scanline-overlay absolute inset-0 pointer-events-none" />
          <div className="max-w-2xl w-full px-8">
            <div className="space-y-1 font-mono text-sm">
              {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className={getLineColor(line.type)}
                >
                  {line.text}
                  {i === visibleLines - 1 && (
                    <span className="animate-blink-cursor ml-1">█</span>
                  )}
                </motion.div>
              ))}
            </div>
            {visibleLines >= BOOT_LINES.length && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 h-1 bg-secondary rounded overflow-hidden"
              >
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BootScreen;
