import { useEffect, useRef, useCallback } from "react";
import { createViewer, Cesium } from "@/lib/cesium-config";
import type { EntityDetails, EntityType } from "@/components/UI/EntityDetailPopup";

interface CesiumViewerProps {
  onViewerReady?: (viewer: any) => void;
  onCameraMove?: (lat: number, lon: number, alt: number) => void;
  onEntityClick?: (entity: EntityDetails | null) => void;
}

const CesiumViewerComponent = ({ onViewerReady, onCameraMove, onEntityClick }: CesiumViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const initRef = useRef(false);

  const handleClick = useCallback((viewer: any, movement: any) => {
    const pickedObject = viewer.scene.pick(movement.position);
    
    if (Cesium.defined(pickedObject)) {
      const entityId = pickedObject.id?.id || pickedObject.primitive?.id || "";
      
      // Determine entity type and build details
      if (entityId.startsWith("eq-")) {
        const entity = pickedObject.id;
        if (entity?.properties) {
          const props = entity.properties;
          onEntityClick?.({
            type: "earthquake",
            id: entityId,
            title: `M${props.magnitude?.getValue()} Earthquake`,
            subtitle: props.place?.getValue() || "Unknown location",
            lat: props.lat?.getValue(),
            lon: props.lon?.getValue(),
            severity: props.magnitude?.getValue() >= 5 ? "critical" : props.magnitude?.getValue() >= 4 ? "warning" : "info",
            details: {
              Magnitude: props.magnitude?.getValue(),
              Depth: `${props.depth?.getValue()?.toFixed(1)} km`,
              Time: props.time?.getValue() ? new Date(props.time.getValue()).toISOString() : undefined,
            },
            link: props.url?.getValue(),
          });
          return;
        }
      }
      
      if (entityId.startsWith("sat-")) {
        const entity = pickedObject.id;
        if (entity?.properties) {
          const props = entity.properties;
          onEntityClick?.({
            type: "satellite",
            id: entityId,
            title: props.name?.getValue() || "Unknown Satellite",
            lat: props.lat?.getValue(),
            lon: props.lon?.getValue(),
            severity: "info",
            details: {
              Altitude: `${props.alt?.getValue()?.toFixed(0)} km`,
              Velocity: `${props.velocity?.getValue()?.toFixed(1)} km/s`,
            },
          });
          return;
        }
      }
      
      if (entityId.startsWith("flt-") || entityId.startsWith("flight-")) {
        const entity = pickedObject.id;
        if (entity?.properties) {
          const props = entity.properties;
          onEntityClick?.({
            type: "flight",
            id: entityId,
            title: props.callsign?.getValue() || "Unknown Flight",
            lat: props.lat?.getValue(),
            lon: props.lon?.getValue(),
            severity: "info",
            details: {
              Callsign: props.callsign?.getValue(),
              Altitude: `${props.altitude?.getValue()?.toFixed(0)} ft`,
              Speed: `${props.speed?.getValue()?.toFixed(0)} kts`,
              Heading: `${props.heading?.getValue()?.toFixed(0)}°`,
            },
          });
          return;
        }
      }
      
      if (entityId.startsWith("conflict-") || entityId.startsWith("gdelt-")) {
        const entity = pickedObject.id;
        if (entity?.properties) {
          const props = entity.properties;
          onEntityClick?.({
            type: "conflict",
            id: entityId,
            title: props.location?.getValue() || "Conflict Event",
            subtitle: props.event_type?.getValue(),
            lat: props.lat?.getValue(),
            lon: props.lon?.getValue(),
            severity: props.fatalities?.getValue() > 0 ? "critical" : "warning",
            details: {
              Type: props.event_type?.getValue(),
              Country: props.country?.getValue(),
              Date: props.event_date?.getValue(),
              Fatalities: props.fatalities?.getValue(),
            },
            link: props.source?.getValue(),
          });
          return;
        }
      }
      
      if (entityId.startsWith("cable-")) {
        const entity = pickedObject.id;
        if (entity?.properties) {
          const props = entity.properties;
          onEntityClick?.({
            type: "cable",
            id: entityId,
            title: props.name?.getValue() || "Submarine Cable",
            severity: "info",
            details: {
              Name: props.name?.getValue(),
              "RFS Year": props.rfsYear?.getValue(),
              Owners: props.owners?.getValue(),
            },
          });
          return;
        }
      }
    }
    
    // Clicked empty space
    onEntityClick?.(null);
  }, [onEntityClick]);

  useEffect(() => {
    if (!containerRef.current || initRef.current) return;
    initRef.current = true;

    const init = async () => {
      try {
        const viewer = await createViewer(containerRef.current!);
        viewerRef.current = viewer;
        onViewerReady?.(viewer);

        // Camera move handler
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

        // Click handler
        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction((movement: any) => {
          handleClick(viewer, movement);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

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
