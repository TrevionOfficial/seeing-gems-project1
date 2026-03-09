import { Cesium } from "@/lib/cesium-config";
import type { Earthquake } from "@/hooks/useEarthquakes";

let currentCollection: any = null;

export function renderEarthquakes(viewer: any, earthquakes: Earthquake[]) {
  if (!viewer || !viewer.scene) return;

  // Remove previous collection
  if (currentCollection) {
    try { viewer.scene.primitives.remove(currentCollection); } catch {}
    currentCollection = null;
  }

  // Also clean up any old entity-based markers
  try {
    const toRemove = viewer.entities.values.filter((e: any) => e.id?.startsWith("eq-"));
    toRemove.forEach((e: any) => viewer.entities.remove(e));
  } catch {}

  if (earthquakes.length === 0) return;

  const points = new Cesium.PointPrimitiveCollection();

  earthquakes.forEach((eq) => {
    try {
      if (!isFinite(eq.lat) || !isFinite(eq.lon)) return;
      if (eq.lat < -90 || eq.lat > 90 || eq.lon < -180 || eq.lon > 180) return;
      const color = eq.magnitude >= 5
        ? Cesium.Color.fromCssColorString("#ff3333").withAlpha(0.9)
        : eq.magnitude >= 4
          ? Cesium.Color.fromCssColorString("#ff8800").withAlpha(0.8)
          : Cesium.Color.fromCssColorString("#ffcc00").withAlpha(0.7);

      const size = Math.max(eq.magnitude * 4, 6);

      points.add({
        position: Cesium.Cartesian3.fromDegrees(eq.lon, eq.lat, 0),
        pixelSize: size,
        color,
        outlineColor: color.withAlpha(1.0),
        outlineWidth: 1,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 20000000),
      });
    } catch {}
  });

  currentCollection = points;
  viewer.scene.primitives.add(points);
}
