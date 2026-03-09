import { Cesium } from "@/lib/cesium-config";
import type { SatelliteData } from "@/hooks/useSatellites";

let currentCollection: any = null;

export function renderSatellites(viewer: any, satellites: SatelliteData[]) {
  if (!viewer || !viewer.scene) return;

  if (currentCollection) {
    try { viewer.scene.primitives.remove(currentCollection); } catch {}
    currentCollection = null;
  }

  try {
    const toRemove = viewer.entities.values.filter((e: any) => e.id?.startsWith("sat-"));
    toRemove.forEach((e: any) => viewer.entities.remove(e));
  } catch {}

  if (satellites.length === 0) return;

  const points = new Cesium.PointPrimitiveCollection();
  const color = Cesium.Color.fromCssColorString("#00ccff").withAlpha(0.8);

  satellites.forEach((sat) => {
    try {
      if (!isFinite(sat.lat) || !isFinite(sat.lon) || !isFinite(sat.alt)) return;
      if (sat.lat < -90 || sat.lat > 90 || sat.lon < -180 || sat.lon > 180) return;
      if (sat.alt < 0 || sat.alt > 100000) return;
      points.add({
        position: Cesium.Cartesian3.fromDegrees(sat.lon, sat.lat, sat.alt * 1000),
        pixelSize: 2.5,
        color,
        outlineColor: Cesium.Color.fromCssColorString("#00ccff").withAlpha(0.3),
        outlineWidth: 1,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 30000000),
      });
    } catch {}
  });

  currentCollection = points;
  viewer.scene.primitives.add(points);
}
