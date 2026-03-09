const Crosshair = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-30 flex items-center justify-center">
      {/* Center crosshair */}
      <div className="relative w-16 h-16">
        {/* Horizontal line */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-primary/40 -translate-y-px" />
        {/* Vertical line */}
        <div className="absolute left-1/2 top-0 h-full w-px bg-primary/40 -translate-x-px" />
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse-glow" />
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/60" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary/60" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary/60" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/60" />
      </div>
    </div>
  );
};

export default Crosshair;
