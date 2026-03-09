import { useEffect, useRef, useCallback, useState } from "react";
import { createViewer, Cesium } from "@/lib/cesium-config";

interface CesiumViewerProps {
  onViewerReady?: (viewer: Cesium.Viewer) => void;
  onCameraMove?: (lat: number, lon: number, alt: number) => void;
}

const CesiumViewerComponent = ({ onViewerReady, onCameraMove }: CesiumViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    const viewer = createViewer(containerRef.current);
    viewerRef.current = viewer;
    onViewerReady?.(viewer);

    // Camera move handler
    const removeListener = viewer.camera.changed.addEventListener(() => {
      const cartographic = viewer.camera.positionCartographic;
      if (cartographic) {
        onCameraMove?.(
          Cesium.Math.toDegrees(cartographic.latitude),
          Cesium.Math.toDegrees(cartographic.longitude),
          cartographic.height
        );
      }
    });
    viewer.camera.percentageChanged = 0.01;

    return () => {
      removeListener();
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: "#0a1a0f" }}
    />
  );
};

export default CesiumViewerComponent;
