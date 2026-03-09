import { Cesium } from "@/lib/cesium-config";
import { SUBMARINE_CABLES } from "@/data/submarineCables";

export function renderSubmarineCables(viewer: any, visible: boolean) {
  if (!viewer || !viewer.entities) return;

  // Remove existing cable entities
  try {
    const toRemove = viewer.entities.values.filter((e: any) => e.id?.startsWith("cable-"));
    toRemove.forEach((e: any) => viewer.entities.remove(e));
  } catch {}

  if (!visible) return;

  SUBMARINE_CABLES.forEach((cable) => {
    try {
      const positions: number[] = [];
      cable.waypoints.forEach(([lon, lat]) => {
        positions.push(lon, lat);
      });

      // Calculate midpoint for label
      const midIdx = Math.floor(cable.waypoints.length / 2);
      const midpoint = cable.waypoints[midIdx];

      viewer.entities.add({
        id: `cable-${cable.id}`,
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(positions),
          width: 2,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.3,
            color: Cesium.Color.fromCssColorString(cable.color).withAlpha(0.7),
          }),
          clampToGround: true,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 20000000),
        },
        position: Cesium.Cartesian3.fromDegrees(midpoint[0], midpoint[1], 0),
        label: {
          text: cable.name,
          font: "10px JetBrains Mono",
          fillColor: Cesium.Color.fromCssColorString(cable.color),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -10),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000000),
          scale: 0.8,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
        properties: {
          name: cable.name,
          rfsYear: cable.rfsYear,
          owners: cable.owners,
        },
      });
    } catch {}
  });
}
