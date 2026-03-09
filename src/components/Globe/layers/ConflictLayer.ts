import { Cesium } from "@/lib/cesium-config";
import type { ConflictEvent } from "@/hooks/useConflicts";

let currentCollection: any = null;

export function renderConflicts(viewer: any, conflicts: ConflictEvent[]) {
  if (!viewer || !viewer.scene) return;

  if (currentCollection) {
    try { viewer.scene.primitives.remove(currentCollection); } catch {}
    currentCollection = null;
  }

  // Remove labels
  try {
    const toRemove = viewer.entities.values.filter((e: any) => e.id?.startsWith("conflict-"));
    toRemove.forEach((e: any) => viewer.entities.remove(e));
  } catch {}

  if (conflicts.length === 0) return;

  const points = new Cesium.PointPrimitiveCollection();

  conflicts.forEach((event) => {
    try {
      if (!isFinite(event.lat) || !isFinite(event.lon)) return;
      if (event.lat < -90 || event.lat > 90 || event.lon < -180 || event.lon > 180) return;

      const color = event.severity === "critical"
        ? Cesium.Color.fromCssColorString("#ff1744").withAlpha(0.9)
        : event.severity === "warning"
        ? Cesium.Color.fromCssColorString("#ff9100").withAlpha(0.8)
        : Cesium.Color.fromCssColorString("#ffea00").withAlpha(0.7);

      const size = event.fatalities > 10 ? 10 : event.fatalities > 0 ? 7 : 5;

      points.add({
        position: Cesium.Cartesian3.fromDegrees(event.lon, event.lat, 100),
        pixelSize: size,
        color,
        outlineColor: Cesium.Color.BLACK.withAlpha(0.5),
        outlineWidth: 1,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 15000000),
      });
    } catch {}
  });

  currentCollection = points;
  viewer.scene.primitives.add(points);
}
