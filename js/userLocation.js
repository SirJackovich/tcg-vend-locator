import { getDistance } from "./utils.js";

export let dashedLine = null;

export function showUserAndNearest(map, data) {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition((position) => {
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;

    L.marker([userLat, userLng], {
      icon: L.icon({
        iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      }),
    })
      .addTo(map)
      .bindPopup("📍 You are here");

    // Find closest
    let closest = null;
    let minDistance = Infinity;

    data.forEach((loc) => {
      if (!loc.lat || !loc.lng) return;
      const dist = getDistance(userLat, userLng, loc.lat, loc.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closest = loc;
      }
    });

    if (closest) {
      L.circle([closest.lat, closest.lng], {
        color: "red",
        radius: 500,
      }).addTo(map);

      const machineMarker = L.marker([closest.lat, closest.lng]).addTo(map);

      machineMarker.bindPopup(
        `<b>🔥 This is the closest vending machine to you</b><br>${closest.location}<br>${closest.city}, ${closest.state}`
      );

      dashedLine = L.polyline(
        [
          [userLat, userLng],
          [closest.lat, closest.lng],
        ],
        { color: "blue", dashArray: "5, 10" }
      ).addTo(map);

      const bounds = L.latLngBounds([
        [userLat, userLng],
        [closest.lat, closest.lng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });

      // 💡 This always works regardless of map motion thresholds
      setTimeout(() => {
        machineMarker.openPopup();
      }, 500);
    }
  });
}
