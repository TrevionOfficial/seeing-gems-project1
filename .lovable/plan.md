

## Worldview — Tactical Intelligence Platform (Lovable Rebuild)

### What the Original Project Is

The original `kevtoe/worldview` is a full-stack tactical intelligence platform built with:
- **CesiumJS 3D globe** (via Resium) with real-time data overlays
- **Express 5 backend** for API proxying, caching, and WebSocket connections
- **Data layers**: Flights (FR24/adsb.fi), Satellites (CelesTrak/SGP4), Earthquakes (USGS), Traffic (OSM), Ships (AIS), CCTV cameras
- **GLSL post-processing**: CRT scanlines, night vision, thermal imaging
- **Military-style UI**: Boot sequence, operations panel, intel feed, status bar, crosshair overlay

### Key Constraints in Lovable

1. **No backend server** — Express 5 proxy cannot run here. We must call APIs directly from the client or skip layers that require server-side proxying (flights via FR24 need a proxy due to CORS).
2. **CesiumJS is heavy** (~40MB) but can be installed as an npm package. However, Resium requires React 19 and the original uses Vite 7 — we're on React 18 and Vite 5. We'll use CesiumJS directly (imperative API) without Resium.
3. **API keys** — Most layers degrade gracefully. USGS earthquakes and CelesTrak satellites require no keys. Flights (adsb.fi) and CCTV (TfL) are free/no-auth.

### Proposed Build Plan

**Phase 1 — Core Globe + UI Shell**
- Install `cesium` package and configure Vite plugin (`vite-plugin-cesium`)
- Create dark tactical theme (CSS variables for military green/amber palette)
- Build the CesiumJS 3D globe viewer component (full-screen, dark base imagery)
- Build the UI overlay structure: crosshair, status bar (UTC clock, coordinates), operations panel (left sidebar), intel feed (right panel)
- Build a tactical boot/splash screen with typewriter animation

**Phase 2 — Data Layers (Client-Side Only)**
- **Earthquakes** — Fetch USGS GeoJSON (no auth needed), render pulsing markers scaled by magnitude
- **Satellites** — Fetch CelesTrak TLE data, use `satellite.js` for SGP4 propagation, render orbital positions and paths
- **Flights** — Fetch from adsb.fi public API (no auth, CORS-friendly), render aircraft with altitude-band coloring and dead-reckoning
- **CCTV** — TfL London cameras (free API), render camera markers with feed popups

**Phase 3 — Interactive Features**
- Layer toggle controls in operations panel
- Entity click/selection with tracked entity detail panel
- "Locate Me" geolocation button
- Intel feed showing real-time events from all active layers
- Entity count display in status bar

**Layers we'll skip** (require server-side proxy or paid keys):
- Traffic simulation (OSM Overpass has strict CORS)
- Naval/AIS (requires WebSocket proxy server)
- GLSL post-processing (CRT/NVG/FLIR) — complex shader setup, can add later

### New Dependencies
- `cesium` — 3D globe rendering
- `vite-plugin-cesium` — Vite integration for Cesium assets
- `satellite.js` — SGP4 orbit propagation for satellite tracking

### File Structure
```text
src/
  components/
    Globe/
      CesiumViewer.tsx        — Main globe component
      layers/
        EarthquakeLayer.ts    — USGS earthquake markers
        SatelliteLayer.ts     — CelesTrak satellite rendering
        FlightLayer.ts        — adsb.fi flight tracking
        CCTVLayer.ts          — TfL camera markers
    UI/
      BootScreen.tsx          — Tactical boot sequence
      OperationsPanel.tsx     — Left sidebar with layer toggles
      IntelFeed.tsx           — Right panel event stream
      StatusBar.tsx           — Bottom bar (coords, clock, counts)
      Crosshair.tsx           — Center reticle overlay
      TrackedEntity.tsx       — Entity detail panel
  hooks/
    useEarthquakes.ts
    useSatellites.ts
    useFlights.ts
    useCCTV.ts
  lib/
    cesium-config.ts          — Cesium initialization
  pages/
    Index.tsx                 — Main app entry
```

This gives you a working tactical globe with 3-4 live data layers, the military-style UI, and the boot sequence — all running client-side in Lovable.

