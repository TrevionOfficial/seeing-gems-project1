import { useState, useCallback, useEffect } from "react";
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
  const [viewer, setViewer] = useState<any>(null);
  const [cameraPos, setCameraPos] = useState({ lat: 20, lon: 0, alt: 20000000 });
  const [layers, setLayers] = useState<LayerState>({
    satellites: true,
    flights: true,
    earthquakes: true,
    cctv: false,
  });
  const [events, setEvents] = useState<IntelEvent[]>([]);

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

  // Render layers
  useEffect(() => {
    if (!viewer) return;
    renderEarthquakes(viewer, layers.earthquakes ? earthquakes : []);
  }, [viewer, earthquakes, layers.earthquakes]);

  useEffect(() => {
    if (!viewer) return;
    renderSatellites(viewer, layers.satellites ? satellites : []);
  }, [viewer, satellites, layers.satellites]);

  useEffect(() => {
    if (!viewer) return;
    renderFlights(viewer, layers.flights ? flights : []);
  }, [viewer, flights, layers.flights]);

  useEffect(() => {
    if (!viewer) return;
    renderCCTV(viewer, layers.cctv ? cameras : []);
  }, [viewer, cameras, layers.cctv]);

  // Intel feed events
  useEffect(() => {
    if (earthquakes.length > 0 && layers.earthquakes) {
      const strong = earthquakes.filter(e => e.magnitude >= 4.5);
      if (strong.length > 0) {
        addEvent("earthquake", `${strong.length} significant quakes detected (M4.5+)`, "warning");
      }
      addEvent("earthquake", `Tracking ${earthquakes.length} seismic events`, "info");
    }
  }, [earthquakes]);

  useEffect(() => {
    if (satellites.length > 0 && layers.satellites) {
      addEvent("satellite", `Tracking ${satellites.length} satellites`, "info");
    }
  }, [satellites]);

  useEffect(() => {
    if (flights.length > 0 && layers.flights) {
      addEvent("flight", `${flights.length} aircraft in view`, "info");
    }
  }, [flights]);

  useEffect(() => {
    if (cameras.length > 0 && layers.cctv) {
      addEvent("cctv", `${cameras.length} cameras linked`, "info");
    }
  }, [cameras]);

  const handleToggleLayer = useCallback((layer: keyof LayerState) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  }, []);

  const handleLocateMe = useCallback(() => {
    if (!viewer) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        viewer.camera.flyTo({
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
  }, [viewer, addEvent]);

  const handleCameraMove = useCallback((lat: number, lon: number, alt: number) => {
    setCameraPos({ lat, lon, alt });
  }, []);

  const handleViewerReady = useCallback((v: any) => {
    setViewer(v);
    addEvent("system", "Cesium 3D Engine initialized", "info");
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
