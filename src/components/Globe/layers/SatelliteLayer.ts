import { Cesium } from "@/lib/cesium-config";
import type { SatelliteData } from "@/hooks/useSatellites";

export function renderSatellites(viewer: any, satellites: SatelliteData[]) {
  const toRemove = viewer.entities.values.filter((e: any) => e.id?.startsWith("sat-"));
  toRemove.forEach((e: any) => viewer.entities.remove(e));

  satellites.forEach((sat) => {
    viewer.entities.add({
      id: `sat-${sat.id}`,
      position: Cesium.Cartesian3.fromDegrees(sat.lon, sat.lat, sat.alt * 1000),
      point: {
        pixelSize: 3,
        color: Cesium.Color.fromCssColorString("#00ccff").withAlpha(0.8),
        outlineColor: Cesium.Color.fromCssColorString("#00ccff").withAlpha(0.3),
        outlineWidth: 1,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 30000000),
      },
      label: {
        text: sat.name.slice(0, 20),
        font: "9px JetBrains Mono",
        fillColor: Cesium.Color.fromCssColorString("#00ccff").withAlpha(0.7),
        style: Cesium.LabelStyle.FILL,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -6),
        scale: 0.7,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000000),
      },
    });
  });
}
