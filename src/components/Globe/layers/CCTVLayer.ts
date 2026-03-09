import { Cesium } from "@/lib/cesium-config";
import type { CCTVCamera } from "@/hooks/useCCTV";

let currentCollection: any = null;

export function renderCCTV(viewer: any, cameras: CCTVCamera[]) {
  if (!viewer || !viewer.scene) return;

  if (currentCollection) {
    try { viewer.scene.primitives.remove(currentCollection); } catch {}
    currentCollection = null;
  }

  try {
    const toRemove = viewer.entities.values.filter((e: any) => e.id?.startsWith("cctv-"));
    toRemove.forEach((e: any) => viewer.entities.remove(e));
  } catch {}

  if (cameras.length === 0) return;

  const points = new Cesium.PointPrimitiveCollection();
  const color = Cesium.Color.fromCssColorString("#888888").withAlpha(0.8);

  cameras.forEach((cam) => {
    try {
      if (!isFinite(cam.lat) || !isFinite(cam.lon)) return;
      if (cam.lat < -90 || cam.lat > 90 || cam.lon < -180 || cam.lon > 180) return;
      points.add({
        position: Cesium.Cartesian3.fromDegrees(cam.lon, cam.lat, 50),
        pixelSize: 5,
        color,
        outlineColor: Cesium.Color.WHITE.withAlpha(0.3),
        outlineWidth: 1,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 500000),
      });
    } catch {}
  });

  currentCollection = points;
  viewer.scene.primitives.add(points);
}
