import { Cesium } from "@/lib/cesium-config";
import type { EarthquakeData, Earthquake } from "@/hooks/useEarthquakes";

export function renderEarthquakes(viewer: any, earthquakes: (EarthquakeData | Earthquake)[]) {
  if (!viewer || !viewer.entities) return;

  // Remove existing earthquake entities
  try {
    const toRemove = viewer.entities.values.filter((e: any) => e.id?.startsWith("eq-"));
    toRemove.forEach((e: any) => viewer.entities.remove(e));
  } catch {}

  if (earthquakes.length === 0) return;

  earthquakes.forEach((eq, idx) => {
    try {
      if (!isFinite(eq.lat) || !isFinite(eq.lon)) return;
      if (eq.lat < -90 || eq.lat > 90 || eq.lon < -180 || eq.lon > 180) return;

      const size = Math.max(6, eq.magnitude * 3);
      const color = eq.magnitude >= 5
        ? Cesium.Color.fromCssColorString("#ff1744").withAlpha(0.9)
        : eq.magnitude >= 4
        ? Cesium.Color.fromCssColorString("#ff9100").withAlpha(0.8)
        : Cesium.Color.fromCssColorString("#ffea00").withAlpha(0.7);

      viewer.entities.add({
        id: `eq-${idx}`,
        position: Cesium.Cartesian3.fromDegrees(eq.lon, eq.lat, 0),
        point: {
          pixelSize: size,
          color,
          outlineColor: Cesium.Color.BLACK.withAlpha(0.5),
          outlineWidth: 1,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 20000000),
        },
        properties: {
          magnitude: eq.magnitude,
          place: eq.place,
          depth: eq.depth,
          time: eq.time,
          lat: eq.lat,
          lon: eq.lon,
          url: (eq as EarthquakeData).url,
        },
      });
    } catch {}
  });
}
