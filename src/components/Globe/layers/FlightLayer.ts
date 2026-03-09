import { Cesium } from "@/lib/cesium-config";
import type { FlightData } from "@/hooks/useFlights";

function getAltitudeColor(altFeet: number) {
  if (altFeet < 10000) return Cesium.Color.fromCssColorString("#33ff33").withAlpha(0.8);
  if (altFeet < 25000) return Cesium.Color.fromCssColorString("#ffcc00").withAlpha(0.8);
  if (altFeet < 35000) return Cesium.Color.fromCssColorString("#ff8800").withAlpha(0.8);
  return Cesium.Color.fromCssColorString("#ff3333").withAlpha(0.8);
}

export function renderFlights(viewer: any, flights: FlightData[]) {
  const toRemove = viewer.entities.values.filter((e: any) => e.id?.startsWith("flt-"));
  toRemove.forEach((e: any) => viewer.entities.remove(e));

  flights.forEach((flight) => {
    const color = getAltitudeColor(flight.altitude);
    const altMeters = flight.altitude * 0.3048;

    viewer.entities.add({
      id: `flt-${flight.id}`,
      position: Cesium.Cartesian3.fromDegrees(flight.lon, flight.lat, altMeters),
      point: {
        pixelSize: 4,
        color,
        outlineColor: color.withAlpha(0.4),
        outlineWidth: 1,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 15000000),
      },
      label: {
        text: flight.callsign,
        font: "9px JetBrains Mono",
        fillColor: color,
        style: Cesium.LabelStyle.FILL,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(8, -2),
        scale: 0.7,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 3000000),
      },
    });
  });
}
