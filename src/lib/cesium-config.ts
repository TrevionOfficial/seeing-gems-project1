// Cesium is loaded globally via CDN in index.html
declare global {
  interface Window {
    Cesium: any;
  }
}

const Cesium = window.Cesium;

// Use default Cesium Ion token
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkMGZkNmZhYS1hZTU1LTRkMjQtOTAwOS1lZjE5Yjc3OWQ4ODkiLCJpZCI6NDAwNTU0LCJpYXQiOjE3NzMwMjc0NDh9.M5fp9dvz-76jVFVd1UuNanTHrXKgvK5QAVcv8ob_t6c";

export async function createViewer(container: HTMLElement) {
  // Set up Cesium World Terrain for elevation
  const terrainProvider = await Cesium.CesiumTerrainProvider.fromIonAssetId(1);

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
    requestRenderMode: false,
    maximumRenderTimeChange: Infinity,
    terrainProvider,
  });

  // Dark globe styling
  viewer.scene.backgroundColor = Cesium.Color.fromCssColorString("#0a1a0f");
  viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString("#0a1a0f");
  viewer.scene.fog.enabled = true;
  viewer.scene.fog.density = 0.0002;
  viewer.scene.globe.enableLighting = true;
  viewer.scene.globe.depthTestAgainstTerrain = true;

  // Add Cesium OSM Buildings (3D building tiles - free with Cesium Ion)
  try {
    const buildingTileset = await Cesium.createOsmBuildingsAsync();
    viewer.scene.primitives.add(buildingTileset);
  } catch (e) {
    console.warn("Could not load OSM Buildings:", e);
  }

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
