import { useEffect, useRef } from "react";
import { createViewer, Cesium } from "@/lib/cesium-config";

interface CesiumViewerProps {
  onViewerReady?: (viewer: any) => void;
  onCameraMove?: (lat: number, lon: number, alt: number) => void;
}

const CesiumViewerComponent = ({ onViewerReady, onCameraMove }: CesiumViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || initRef.current) return;
    initRef.current = true;

    const init = async () => {
      try {
        const viewer = await createViewer(containerRef.current!);
        viewerRef.current = viewer;
        onViewerReady?.(viewer);

        viewer.camera.changed.addEventListener(() => {
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
      } catch (e) {
        console.error("Failed to initialize Cesium viewer:", e);
      }
    };

    init();

    return () => {
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
