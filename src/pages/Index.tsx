import { useState, useCallback, useEffect, useRef } from "react";
import CesiumViewerComponent from "@/components/Globe/CesiumViewer";
import BootScreen from "@/components/UI/BootScreen";
import Crosshair from "@/components/UI/Crosshair";
import StatusBar from "@/components/UI/StatusBar";
import OperationsPanel, { type LayerState } from "@/components/UI/OperationsPanel";
import IntelFeed, { type IntelEvent } from "@/components/UI/IntelFeed";
import { useEarthquakes } from "@/hooks/useEarthquakes";
import { useSatellites } from "@/hooks/useSatellites";
import { useFlights } from "@/hooks/useFlights";
import { useCCTV } from "@/hooks/useCCTV";
import { renderEarthquakes } from "@/components/Globe/layers/EarthquakeLayer";
import { renderSatellites } from "@/components/Globe/layers/SatelliteLayer";
import { renderFlights } from "@/components/Globe/layers/FlightLayer";
import { renderCCTV } from "@/components/Globe/layers/CCTVLayer";
import { Cesium } from "@/lib/cesium-config";

const Index = () => {
  const [booted, setBooted] = useState(false);
  const [viewerReady, setViewerReady] = useState(false);
  const viewerRef = useRef<any>(null);
  const [cameraPos, setCameraPos] = useState({ lat: 20, lon: 0, alt: 20000000 });
  const [layers, setLayers] = useState<LayerState>({
    satellites: true,
    flights: true,
    earthquakes: true,
    cctv: false,
  });
  const [events, setEvents] = useState<IntelEvent[]>([]);
  const eventAddedRef = useRef<Set<string>>(new Set());

  const { earthquakes } = useEarthquakes(booted && layers.earthquakes);
  const { satellites } = useSatellites(booted && layers.satellites);
  const { flights } = useFlights(booted && layers.flights);
  const { cameras } = useCCTV(booted && layers.cctv);

  const addEvent = useCallback((type: IntelEvent["type"], message: string, severity: IntelEvent["severity"] = "info") => {
    setEvents(prev => [{
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      type,
      message,
      severity,
    }, ...prev].slice(0, 100));
  }, []);

  // Only add intel events once per data update (deduplicate)
  const addEventOnce = useCallback((key: string, type: IntelEvent["type"], message: string, severity: IntelEvent["severity"] = "info") => {
    if (eventAddedRef.current.has(key)) return;
    eventAddedRef.current.add(key);
    addEvent(type, message, severity);
    // Allow re-adding after 30s
    setTimeout(() => eventAddedRef.current.delete(key), 30000);
  }, [addEvent]);

  // Render layers — only when viewer is actually ready
  useEffect(() => {
    if (!viewerReady || !viewerRef.current) return;
    renderEarthquakes(viewerRef.current, layers.earthquakes ? earthquakes : []);
    if (earthquakes.length > 0 && layers.earthquakes) {
      const strong = earthquakes.filter(e => e.magnitude >= 4.5);
      if (strong.length > 0) {
        addEventOnce(`eq-strong-${strong.length}`, "earthquake", `${strong.length} significant quakes detected (M4.5+)`, "warning");
      }
      addEventOnce(`eq-total-${earthquakes.length}`, "earthquake", `Tracking ${earthquakes.length} seismic events`, "info");
    }
  }, [viewerReady, earthquakes, layers.earthquakes]);

  useEffect(() => {
    if (!viewerReady || !viewerRef.current) return;
    renderSatellites(viewerRef.current, layers.satellites ? satellites : []);
    if (satellites.length > 0 && layers.satellites) {
      addEventOnce(`sat-${satellites.length}`, "satellite", `Tracking ${satellites.length} satellites`, "info");
    }
  }, [viewerReady, satellites, layers.satellites]);

  useEffect(() => {
    if (!viewerReady || !viewerRef.current) return;
    renderFlights(viewerRef.current, layers.flights ? flights : []);
    if (flights.length > 0 && layers.flights) {
      addEventOnce(`flt-${flights.length}`, "flight", `${flights.length} aircraft in view`, "info");
    }
  }, [viewerReady, flights, layers.flights]);

  useEffect(() => {
    if (!viewerReady || !viewerRef.current) return;
    renderCCTV(viewerRef.current, layers.cctv ? cameras : []);
    if (cameras.length > 0 && layers.cctv) {
      addEventOnce(`cctv-${cameras.length}`, "cctv", `${cameras.length} cameras linked`, "info");
    }
  }, [viewerReady, cameras, layers.cctv]);

  const handleToggleLayer = useCallback((layer: keyof LayerState) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  }, []);

  const handleLocateMe = useCallback(() => {
    if (!viewerRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        viewerRef.current.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            pos.coords.longitude,
            pos.coords.latitude,
            500000
          ),
          duration: 2,
        });
        addEvent("system", `Located: ${pos.coords.latitude.toFixed(4)}°, ${pos.coords.longitude.toFixed(4)}°`, "info");
      },
      () => addEvent("system", "Geolocation unavailable", "warning")
    );
  }, [addEvent]);

  const handleCameraMove = useCallback((lat: number, lon: number, alt: number) => {
    setCameraPos({ lat, lon, alt });
  }, []);

  const handleViewerReady = useCallback((v: any) => {
    viewerRef.current = v;
    setViewerReady(true);
    addEvent("system", "Cesium 3D Engine initialized", "info");
    addEvent("system", "3D Buildings & Terrain loaded", "info");
    addEvent("system", "All subsystems operational", "info");
  }, [addEvent]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      {!booted && <BootScreen onComplete={() => setBooted(true)} />}
      
      {booted && (
        <>
          <CesiumViewerComponent
            onViewerReady={handleViewerReady}
            onCameraMove={handleCameraMove}
          />
          <Crosshair />
          <OperationsPanel
            layers={layers}
            onToggleLayer={handleToggleLayer}
            onLocateMe={handleLocateMe}
          />
          <IntelFeed events={events} />
          <StatusBar
            lat={cameraPos.lat}
            lon={cameraPos.lon}
            alt={cameraPos.alt}
            entityCounts={{
              satellites: satellites.length,
              flights: flights.length,
              earthquakes: earthquakes.length,
              cctv: cameras.length,
            }}
          />
        </>
      )}
    </div>
  );
};

export default Index;
