import { useState, useCallback, useEffect, useRef } from "react";
import CesiumViewerComponent from "@/components/Globe/CesiumViewer";
import BootScreen from "@/components/UI/BootScreen";
import Crosshair from "@/components/UI/Crosshair";
import StatusBar from "@/components/UI/StatusBar";
import OperationsPanel, { type LayerState } from "@/components/UI/OperationsPanel";
import IntelFeed, { type IntelEvent } from "@/components/UI/IntelFeed";
import MarketTicker from "@/components/UI/MarketTicker";
import DashboardStats from "@/components/UI/DashboardStats";
import EntityDetailPopup, { type EntityDetails } from "@/components/UI/EntityDetailPopup";
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
  const [selectedEntity, setSelectedEntity] = useState<EntityDetails | null>(null);
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
        addEventOnce(`eq-strong-${strong.length}`, "earthquake", `${strong.length} significant quakes (M4.5+)`, "warning");
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
      addEventOnce(`flt-${flights.length}`, "flight", `${flights.length} aircraft tracked`, "info");
    }
  }, [viewerReady, flights, layers.flights]);

  useEffect(() => {
    if (!viewerReady || !viewerRef.current) return;
    renderCCTV(viewerRef.current, layers.cctv ? cameras : []);
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
      addEventOnce(`conflict-${conflicts.length}`, "system", `${conflicts.length} conflict events tracked`, "warning");
    }
  }, [viewerReady, conflicts, layers.conflicts]);

  // News intel feed
  useEffect(() => {
    if (!layers.news || news.length === 0) return;
    const critical = news.filter(n => n.severity === "critical");
    if (critical.length > 0) {
      critical.slice(0, 2).forEach((item, i) => {
        addEventOnce(`news-crit-${i}-${item.title.slice(0, 15)}`, "system", `[${item.source}] ${item.title}`, "critical");
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
    addEvent("system", "WorldMonitor subsystems online", "info");
  }, [addEvent]);

  const handleEntityClick = useCallback((entity: EntityDetails | null) => {
    setSelectedEntity(entity);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      {!booted && <BootScreen onComplete={() => setBooted(true)} />}

      {booted && (
        <>
          <CesiumViewerComponent
            onViewerReady={handleViewerReady}
            onCameraMove={handleCameraMove}
            onEntityClick={handleEntityClick}
          />
          
          {layers.finance && <MarketTicker quotes={quotes} />}
          
          <Crosshair />
          
          <OperationsPanel
            layers={layers}
            onToggleLayer={handleToggleLayer}
            onLocateMe={handleLocateMe}
          />
          
          <DashboardStats
            counts={{
              satellites: satellites.length,
              flights: flights.length,
              earthquakes: earthquakes.length,
              conflicts: conflicts.length,
              news: news.length,
            }}
            quotes={quotes}
            visible={true}
          />
          
          <IntelFeed events={events} />
          
          <EntityDetailPopup
            entity={selectedEntity}
            onClose={() => setSelectedEntity(null)}
          />
          
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
