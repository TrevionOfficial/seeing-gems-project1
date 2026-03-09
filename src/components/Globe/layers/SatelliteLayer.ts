import { Cesium } from "@/lib/cesium-config";
import type { SatelliteData } from "@/hooks/useSatellites";

export function renderSatellites(viewer: any, satellites: SatelliteData[]) {
  if (!viewer || !viewer.entities) return;

  // Remove existing satellite entities
  try {
    const toRemove = viewer.entities.values.filter((e: any) => e.id?.startsWith("sat-"));
    toRemove.forEach((e: any) => viewer.entities.remove(e));
  } catch {}

  if (satellites.length === 0) return;

  const color = Cesium.Color.fromCssColorString("#00e5ff").withAlpha(0.85);

  satellites.forEach((sat, idx) => {
    try {
      if (!isFinite(sat.lat) || !isFinite(sat.lon) || !isFinite(sat.alt)) return;
      if (sat.lat < -90 || sat.lat > 90 || sat.lon < -180 || sat.lon > 180) return;
      if (sat.alt < 0 || sat.alt > 100000) return;

      viewer.entities.add({
        id: `sat-${idx}`,
        position: Cesium.Cartesian3.fromDegrees(sat.lon, sat.lat, sat.alt * 1000),
        point: {
          pixelSize: 4,
          color,
          outlineColor: Cesium.Color.WHITE.withAlpha(0.3),
          outlineWidth: 1,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 50000000),
        },
        properties: {
          name: sat.name,
          lat: sat.lat,
          lon: sat.lon,
          alt: sat.alt,
          velocity: sat.velocity,
        },
      });
    } catch {}
  });
}
