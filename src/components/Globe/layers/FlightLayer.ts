import { Cesium } from "@/lib/cesium-config";
import type { FlightData } from "@/hooks/useFlights";

let currentCollection: any = null;

function getAltitudeColor(altFeet: number) {
  const C = Cesium.Color;
  if (altFeet < 10000) return C.fromCssColorString("#33ff33").withAlpha(0.8);
  if (altFeet < 25000) return C.fromCssColorString("#ffcc00").withAlpha(0.8);
  if (altFeet < 35000) return C.fromCssColorString("#ff8800").withAlpha(0.8);
  return C.fromCssColorString("#ff3333").withAlpha(0.8);
}

export function renderFlights(viewer: any, flights: FlightData[]) {
  if (!viewer || !viewer.scene) return;

  if (currentCollection) {
    try { viewer.scene.primitives.remove(currentCollection); } catch {}
    currentCollection = null;
  }

  try {
    const toRemove = viewer.entities.values.filter((e: any) => e.id?.startsWith("flt-"));
    toRemove.forEach((e: any) => viewer.entities.remove(e));
  } catch {}

  if (flights.length === 0) return;

  const points = new Cesium.PointPrimitiveCollection();

  flights.forEach((flight) => {
    try {
      if (!isFinite(flight.lat) || !isFinite(flight.lon) || !isFinite(flight.altitude)) return;
      if (flight.lat < -90 || flight.lat > 90 || flight.lon < -180 || flight.lon > 180) return;
      const color = getAltitudeColor(flight.altitude);
      const altMeters = flight.altitude * 0.3048;

      points.add({
        position: Cesium.Cartesian3.fromDegrees(flight.lon, flight.lat, altMeters),
        pixelSize: 4,
        color,
        outlineColor: color.withAlpha(0.4),
        outlineWidth: 1,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 15000000),
      });
    } catch {}
  });

  currentCollection = points;
  viewer.scene.primitives.add(points);
}
