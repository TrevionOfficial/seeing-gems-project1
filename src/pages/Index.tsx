import { useState, useCallback, useEffect, useRef } from "react";
import CesiumViewerComponent from "@/components/Globe/CesiumViewer";
import BootScreen from "@/components/UI/BootScreen";
import Crosshair from "@/components/UI/Crosshair";
import StatusBar from "@/components/UI/StatusBar";
import OperationsPanel, { type LayerState } from "@/components/UI/OperationsPanel";
import IntelFeed, { type IntelEvent } from "@/components/UI/IntelFeed";
import MarketTicker from "@/components/UI/MarketTicker";
import { useEarthquakes } from "@/hooks/useEarthquakes";
import { useSatellites } from "@/hooks/useSatellites";
import { useFlights } from "@/hooks/useFlights";
import { useCCTV } from "@/hooks/useCCTV";
import { useNews } from "@/hooks/useNews";
import { useConflicts } from "@/hooks/useConflicts";
import { useFinance } from "@/hooks/useFinance";
import { renderEarthquakes } from "@/components/Globe/layers/EarthquakeLayer";
import { renderSatellites } from "@/components/Globe/layers/SatelliteLayer";
import { renderFlights } from "@/components/Globe/layers/FlightLayer";
import { renderCCTV } from "@/components/Globe/layers/CCTVLayer";
import { renderSubmarineCables } from "@/components/Globe/layers/SubmarineCableLayer";
import { renderConflicts } from "@/components/Globe/layers/ConflictLayer";
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
    cables: true,
    conflicts: true,
    news: true,
    finance: true,
  });
  const [events, setEvents] = useState<IntelEvent[]>([]);
  const eventAddedRef = useRef<Set<string>>(new Set());

  const { earthquakes } = useEarthquakes(booted && layers.earthquakes);
  const { satellites } = useSatellites(booted && layers.satellites);
  const { flights } = useFlights(booted && layers.flights);
  const { cameras } = useCCTV(booted && layers.cctv);
  const { news } = useNews(booted && layers.news);
  const { conflicts } = useConflicts(booted && layers.conflicts);
  const { quotes } = useFinance(booted && layers.finance);

  const addEvent = useCallback((type: IntelEvent["type"], message: string, severity: IntelEvent["severity"] = "info") => {
    setEvents(prev => [{
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      type,
      message,
      severity,
    }, ...prev].slice(0, 100));
  }, []);

  const addEventOnce = useCallback((key: string, type: IntelEvent["type"], message: string, severity: IntelEvent["severity"] = "info") => {
    if (eventAddedRef.current.has(key)) return;
    eventAddedRef.current.add(key);
    addEvent(type, message, severity);
    setTimeout(() => eventAddedRef.current.delete(key), 30000);
  }, [addEvent]);

  // Render layers
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

  useEffect(() => {
    if (!viewerReady || !viewerRef.current) return;
    renderSubmarineCables(viewerRef.current, layers.cables);
    if (layers.cables) {
      addEventOnce("cables-on", "system", "Submarine cable overlay active", "info");
    }
  }, [viewerReady, layers.cables]);

  useEffect(() => {
    if (!viewerReady || !viewerRef.current) return;
    renderConflicts(viewerRef.current, layers.conflicts ? conflicts : []);
    if (conflicts.length > 0 && layers.conflicts) {
      const fatal = conflicts.filter(c => c.fatalities > 0);
      if (fatal.length > 0) {
        addEventOnce(`conflict-fatal-${fatal.length}`, "system", `${fatal.length} conflict events with casualties`, "critical");
      }
      addEventOnce(`conflict-${conflicts.length}`, "system", `${conflicts.length} conflict events tracked`, "warning");
    }
  }, [viewerReady, conflicts, layers.conflicts]);

  // News intel feed
  useEffect(() => {
    if (!layers.news || news.length === 0) return;
    const critical = news.filter(n => n.severity === "critical");
    if (critical.length > 0) {
      critical.slice(0, 3).forEach((item, i) => {
        addEventOnce(`news-crit-${i}-${item.title.slice(0, 20)}`, "system", `[${item.source}] ${item.title}`, "critical");
      });
    }
    const warnings = news.filter(n => n.severity === "warning");
    if (warnings.length > 0) {
      warnings.slice(0, 2).forEach((item, i) => {
        addEventOnce(`news-warn-${i}-${item.title.slice(0, 20)}`, "system", `[${item.source}] ${item.title}`, "warning");
      });
    }
    addEventOnce(`news-total-${news.length}`, "system", `${news.length} intel reports ingested`, "info");
  }, [news, layers.news]);

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
    addEvent("system", "WorldMonitor subsystems operational", "info");
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
          {layers.finance && <MarketTicker quotes={quotes} />}
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
              conflicts: conflicts.length,
              news: news.length,
            }}
          />
        </>
      )}
    </div>
  );
};

export default Index;
