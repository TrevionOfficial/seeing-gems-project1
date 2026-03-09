import { Cesium } from "@/lib/cesium-config";
import type { ConflictEvent } from "@/hooks/useConflicts";

export function renderConflicts(viewer: any, conflicts: ConflictEvent[]) {
  if (!viewer || !viewer.entities) return;

  // Remove existing conflict entities
  try {
    const toRemove = viewer.entities.values.filter((e: any) => 
      e.id?.startsWith("conflict-") || e.id?.startsWith("gdelt-")
    );
    toRemove.forEach((e: any) => viewer.entities.remove(e));
  } catch {}

  if (conflicts.length === 0) return;

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

      viewer.entities.add({
        id: event.id,
        position: Cesium.Cartesian3.fromDegrees(event.lon, event.lat, 100),
        point: {
          pixelSize: size,
          color,
          outlineColor: Cesium.Color.BLACK.withAlpha(0.5),
          outlineWidth: 1,
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 15000000),
        },
        properties: {
          event_type: event.event_type,
          event_date: event.event_date,
          country: event.country,
          location: event.location,
          lat: event.lat,
          lon: event.lon,
          fatalities: event.fatalities,
          notes: event.notes,
          source: event.source,
        },
      });
    } catch {}
  });
}
