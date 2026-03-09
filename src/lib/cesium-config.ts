import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

// Use default Cesium Ion token for basic imagery
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3ZjQ0N2E0Mi0xNWZlLTQ1NTAtYjhjZS02NjVhNDZjZDRhN2UiLCJpZCI6MjU5LCJpYXQiOjE3MjUwNTIwNjF9.Qdifm3kMpiYCSCx0pV7oAgFHAFCRbOFJlPvPbAACf-I";

export function createViewer(container: HTMLElement): Cesium.Viewer {
  const viewer = new Cesium.Viewer(container, {
    animation: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    navigationHelpButton: false,
    navigationInstructionsInitiallyVisible: false,
    creditContainer: document.createElement("div"),
    scene3DOnly: true,
    skyAtmosphere: new Cesium.SkyAtmosphere(),
    requestRenderMode: false,
    maximumRenderTimeChange: Infinity,
  });

  // Dark globe styling
  viewer.scene.backgroundColor = Cesium.Color.fromCssColorString("#0a1a0f");
  viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString("#0a1a0f");
  viewer.scene.fog.enabled = true;
  viewer.scene.fog.density = 0.0002;
  viewer.scene.globe.enableLighting = true;
  viewer.scene.globe.atmosphereLightIntensity = 3.0;

  // Set initial camera position
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(0, 20, 20000000),
    orientation: {
      heading: 0,
      pitch: -Cesium.Math.PI_OVER_TWO,
      roll: 0,
    },
  });

  return viewer;
}

export { Cesium };
