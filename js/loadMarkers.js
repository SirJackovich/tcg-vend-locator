export function addMarkers(map, data) {
  data.forEach((loc) => {
    if (!loc.lat || !loc.lng) return;
    L.marker([loc.lat, loc.lng])
      .addTo(map)
      .bindPopup(`<b>${loc.location || loc.name}</b><br>${loc.city}`);
  });
}
