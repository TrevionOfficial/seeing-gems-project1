import { Cesium } from "@/lib/cesium-config";
import { SUBMARINE_CABLES } from "@/data/submarineCables";

let cableEntities: any[] = [];

export function renderSubmarineCables(viewer: any, visible: boolean) {
  if (!viewer || !viewer.entities) return;

  // Remove existing
  cableEntities.forEach((e) => {
    try { viewer.entities.remove(e); } catch {}
  });
  cableEntities = [];

  if (!visible) return;

  SUBMARINE_CABLES.forEach((cable) => {
    try {
      const positions: number[] = [];
      cable.waypoints.forEach(([lon, lat]) => {
        positions.push(lon, lat);
      });

      const entity = viewer.entities.add({
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
        },
      });
      cableEntities.push(entity);
    } catch {}
  });
}
