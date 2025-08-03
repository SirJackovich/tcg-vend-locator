export function createMap() {
  const map = L.map("map").setView([39.5, -98.35], 4); // Center on US
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap",
  }).addTo(map);
  return map;
}
