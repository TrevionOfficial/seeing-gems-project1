import { Cesium } from "@/lib/cesium-config";
import type { Earthquake } from "@/hooks/useEarthquakes";

export function renderEarthquakes(viewer: any, earthquakes: Earthquake[]) {
  if (!viewer || !viewer.entities) return;
  
  try {
    const toRemove = viewer.entities.values.filter((e: any) => e.id?.startsWith("eq-"));
    toRemove.forEach((e: any) => viewer.entities.remove(e));
  } catch { /* ignore cleanup errors */ }

  earthquakes.forEach((eq) => {
    try {
      const radius = Math.max(eq.magnitude * 15000, 20000);
      const color = eq.magnitude >= 5
        ? Cesium.Color.fromCssColorString("#ff3333").withAlpha(0.7)
        : eq.magnitude >= 4
          ? Cesium.Color.fromCssColorString("#ff8800").withAlpha(0.6)
          : Cesium.Color.fromCssColorString("#ffcc00").withAlpha(0.5);

      viewer.entities.add({
        id: `eq-${eq.id}`,
        position: Cesium.Cartesian3.fromDegrees(eq.lon, eq.lat),
        ellipse: {
          semiMajorAxis: radius,
          semiMinorAxis: radius,
          material: color,
          outline: true,
          outlineColor: color.withAlpha(1.0),
          outlineWidth: 1,
          height: 0,
        },
        label: {
          text: `M${eq.magnitude.toFixed(1)}`,
          font: "10px JetBrains Mono",
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -10),
          scale: 0.8,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 8000000),
        },
      });
    } catch (e) {
      console.warn("Failed to render earthquake:", eq.id, e);
    }
  });
}
