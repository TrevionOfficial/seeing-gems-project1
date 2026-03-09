// Major global submarine cable routes — simplified waypoints
// Inspired by worldmonitor's TeleGeography integration
export interface SubmarineCable {
  id: string;
  name: string;
  color: string;
  rfsYear?: number;
  owners?: string;
  waypoints: [number, number][]; // [lon, lat]
}

export const SUBMARINE_CABLES: SubmarineCable[] = [
  {
    id: "seamewe-6", name: "SEA-ME-WE 6", color: "#00bcd4", rfsYear: 2025,
    owners: "Singtel, Telekom Malaysia, Telia",
    waypoints: [[103.8, 1.3], [95.0, 5.0], [73.0, 10.0], [56.0, 15.0], [43.0, 12.5], [36.0, 31.0], [30.0, 35.0], [15.0, 37.0], [5.0, 43.0], [-5.0, 48.0], [-3.0, 51.0]],
  },
  {
    id: "ace", name: "ACE Cable", color: "#ff9800", rfsYear: 2012,
    owners: "Orange, consortium",
    waypoints: [[-6.0, 43.0], [-10.0, 37.0], [-17.0, 28.0], [-17.0, 15.0], [-15.0, 5.0], [-5.0, 6.0], [3.0, 6.0], [9.0, 4.0]],
  },
  {
    id: "aae-1", name: "AAE-1", color: "#e91e63", rfsYear: 2017,
    owners: "China Unicom, Djibouti Telecom",
    waypoints: [[103.8, 1.3], [100.5, 5.3], [80.2, 6.9], [72.8, 18.9], [56.0, 15.0], [43.0, 12.5], [36.0, 31.0], [30.0, 35.0], [15.0, 37.0], [5.0, 43.0], [-1.0, 48.0]],
  },
  {
    id: "pacific-crossing", name: "Pacific Crossing", color: "#4caf50",
    waypoints: [[-122.4, 37.8], [-155.0, 20.0], [-180.0, 25.0], [170.0, 30.0], [140.0, 35.0]],
  },
  {
    id: "atlantic-crossing", name: "Atlantic Crossing (AC-1)", color: "#2196f3",
    waypoints: [[-74.0, 40.7], [-50.0, 42.0], [-30.0, 45.0], [-10.0, 50.0], [-5.0, 52.0]],
  },
  {
    id: "marea", name: "MAREA", color: "#9c27b0", rfsYear: 2018,
    owners: "Microsoft, Meta, Telxius",
    waypoints: [[-73.9, 39.4], [-50.0, 40.0], [-30.0, 41.0], [-10.0, 42.5], [-3.0, 43.3]],
  },
  {
    id: "flag-atlantic", name: "FLAG Atlantic-1", color: "#f44336",
    waypoints: [[-74.0, 40.7], [-50.0, 38.0], [-30.0, 37.0], [-10.0, 39.0], [-6.0, 43.0]],
  },
  {
    id: "safe", name: "SAFE Cable", color: "#ffeb3b",
    waypoints: [[55.5, -20.9], [45.0, -15.0], [25.0, -34.0], [18.4, -33.9]],
  },
  {
    id: "teams", name: "TEAMS Cable", color: "#8bc34a", rfsYear: 2010,
    waypoints: [[39.7, -4.0], [45.0, 0.0], [50.0, 10.0], [56.0, 15.0], [65.0, 25.0]],
  },
  {
    id: "seamewe-3", name: "SEA-ME-WE 3", color: "#00acc1",
    waypoints: [[141.0, -2.5], [115.0, 5.0], [103.8, 1.3], [80.0, 7.0], [73.0, 18.0], [56.0, 15.0], [43.0, 12.5], [36.0, 31.0], [30.0, 35.0], [15.0, 37.0], [5.0, 43.0], [-9.0, 39.0]],
  },
  {
    id: "jupiter", name: "Jupiter Cable", color: "#7c4dff", rfsYear: 2020,
    owners: "Amazon, Meta, NTT",
    waypoints: [[-118.2, 33.7], [-150.0, 28.0], [180.0, 30.0], [140.0, 35.0]],
  },
  {
    id: "dunant", name: "Dunant", color: "#00e676", rfsYear: 2020,
    owners: "Google",
    waypoints: [[-73.9, 40.5], [-50.0, 42.0], [-30.0, 44.0], [-10.0, 46.0], [-2.0, 47.0]],
  },
  {
    id: "equiano", name: "Equiano", color: "#ff6d00", rfsYear: 2022,
    owners: "Google",
    waypoints: [[-6.0, 43.0], [-17.0, 28.0], [-17.0, 15.0], [-4.0, 5.3], [3.4, 6.5], [9.0, 4.0], [12.0, -4.5], [13.5, -8.8], [15.0, -22.5], [18.4, -33.9]],
  },
  {
    id: "2africa", name: "2Africa", color: "#d500f9", rfsYear: 2024,
    owners: "Meta, consortium",
    waypoints: [[-6.0, 43.0], [-17.0, 28.0], [-17.0, 15.0], [-4.0, 5.3], [9.0, 4.0], [12.0, -4.5], [18.4, -33.9], [32.0, -29.0], [40.0, -15.0], [44.0, -12.0], [49.0, -12.0], [56.0, -20.0], [55.0, 15.0], [43.0, 12.5], [36.0, 31.0], [30.0, 35.0]],
  },
  {
    id: "peace", name: "PEACE Cable", color: "#76ff03", rfsYear: 2022,
    owners: "Hengtong, PCCW",
    waypoints: [[121.5, 31.2], [114.0, 22.3], [103.8, 1.3], [73.0, 18.0], [60.0, 24.0], [43.0, 12.5], [36.0, 31.0], [30.0, 35.0], [15.0, 37.0], [5.0, 43.0], [-1.0, 48.0]],
  },
  {
    id: "ellalink", name: "EllaLink", color: "#18ffff", rfsYear: 2021,
    owners: "EllaLink consortium",
    waypoints: [[-6.0, 43.0], [-10.0, 39.0], [-17.0, 28.0], [-25.0, 16.0], [-35.0, -3.0], [-38.5, -12.9]],
  },
  {
    id: "apc", name: "Asia Pacific Cable (APCN-2)", color: "#ff4081",
    waypoints: [[121.5, 31.2], [121.8, 25.0], [114.0, 22.3], [103.8, 1.3], [140.0, 35.7]],
  },
  {
    id: "sac", name: "South Atlantic Cable (SACS)", color: "#ffd740", rfsYear: 2018,
    owners: "Angola Cables",
    waypoints: [[13.2, -8.8], [-5.0, -10.0], [-20.0, -15.0], [-35.0, -18.0], [-38.5, -12.9]],
  },
  {
    id: "curie", name: "Curie", color: "#64ffda", rfsYear: 2020,
    owners: "Google",
    waypoints: [[-118.2, 33.7], [-110.0, 25.0], [-90.0, 10.0], [-80.0, -5.0], [-77.0, -12.0]],
  },
  {
    id: "havanaring", name: "Havana-Ring", color: "#b388ff",
    waypoints: [[-82.4, 23.1], [-80.2, 25.8], [-79.0, 30.0], [-74.0, 40.7]],
  },
];
