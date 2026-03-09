import { Cesium } from "@/lib/cesium-config";
import type { CCTVCamera } from "@/hooks/useCCTV";

export function renderCCTV(viewer: Cesium.Viewer, cameras: CCTVCamera[]) {
  const toRemove = viewer.entities.values.filter(e => e.id?.startsWith("cctv-"));
  toRemove.forEach(e => viewer.entities.remove(e));

  cameras.forEach((cam) => {
    viewer.entities.add({
      id: `cctv-${cam.id}`,
      position: Cesium.Cartesian3.fromDegrees(cam.lon, cam.lat, 50),
      point: {
        pixelSize: 5,
        color: Cesium.Color.fromCssColorString("#888888").withAlpha(0.8),
        outlineColor: Cesium.Color.WHITE.withAlpha(0.3),
        outlineWidth: 1,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 500000),
      },
      label: {
        text: "📹",
        font: "12px sans-serif",
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -8),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 200000),
      },
      description: `<div style="font-family: monospace; color: #33ff33; background: #0a1a0f; padding: 8px;">
        <b>${cam.name}</b><br/>
        ${cam.imageUrl ? `<img src="${cam.imageUrl}" style="max-width: 300px; margin-top: 8px;" />` : "No feed available"}
      </div>`,
    });
  });
}
