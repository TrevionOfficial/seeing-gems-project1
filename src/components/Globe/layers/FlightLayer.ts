import { Cesium } from "@/lib/cesium-config";
import type { FlightData } from "@/hooks/useFlights";

function getAltitudeColor(altFeet: number) {
  const C = Cesium.Color;
  if (altFeet < 10000) return C.fromCssColorString("#33ff33").withAlpha(0.8);
  if (altFeet < 25000) return C.fromCssColorString("#ffc107").withAlpha(0.8);
  if (altFeet < 35000) return C.fromCssColorString("#ff9100").withAlpha(0.8);
  return C.fromCssColorString("#ff5722").withAlpha(0.8);
}

export function renderFlights(viewer: any, flights: FlightData[]) {
  if (!viewer || !viewer.entities) return;

  // Remove existing flight entities
  try {
    const toRemove = viewer.entities.values.filter((e: any) => 
      e.id?.startsWith("flt-") || e.id?.startsWith("flight-")
    );
    toRemove.forEach((e: any) => viewer.entities.remove(e));
  } catch {}

  if (flights.length === 0) return;

  flights.forEach((flight, idx) => {
    try {
      if (!isFinite(flight.lat) || !isFinite(flight.lon)) return;
      if (flight.lat < -90 || flight.lat > 90 || flight.lon < -180 || flight.lon > 180) return;
      if (flight.lat === 0 && flight.lon === 0) return;

      const color = getAltitudeColor(flight.altitude || 0);
      const altMeters = (flight.altitude || 0) * 0.3048;

      viewer.entities.add({
        id: `flight-${flight.id || idx}`,
        position: Cesium.Cartesian3.fromDegrees(flight.lon, flight.lat, Math.max(altMeters, 1000)),
        point: {
          pixelSize: 5,
          color,
          outlineColor: Cesium.Color.BLACK.withAlpha(0.3),
          outlineWidth: 1,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000000),
        },
        properties: {
          callsign: flight.callsign,
          lat: flight.lat,
          lon: flight.lon,
          altitude: flight.altitude,
          speed: flight.speed,
          heading: flight.heading,
        },
      });
    } catch {}
  });
}
