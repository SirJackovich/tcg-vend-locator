fetch("vendingMachines.json")
  .then((res) => res.json())
  .then((vendingMachines) => {
    const map = L.map("map");

    const bounds = L.latLngBounds();

    // Add all markers and track bounds
    vendingMachines.forEach((loc) => {
      if (!loc.lat || !loc.lng) return;
      bounds.extend([loc.lat, loc.lng]);

      L.marker([loc.lat, loc.lng])
        .addTo(map)
        .bindPopup(`<b>${loc.location || loc.name}</b><br>${loc.city}`);
    });

    map.fitBounds(bounds); // ⬅️ Auto-center and zoom to all markers

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);

    // Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          const userMarker = L.marker([userLat, userLng], {
            icon: L.icon({
              iconUrl:
                "https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png",
              iconSize: [32, 32],
              iconAnchor: [16, 32],
            }),
          }).addTo(map);

          // Find closest machine
          let closest = null;
          let minDistance = Infinity;

          vendingMachines.forEach((loc) => {
            if (!loc.lat || !loc.lng) return;
            const dist = getDistance(userLat, userLng, loc.lat, loc.lng);
            if (dist < minDistance) {
              minDistance = dist;
              closest = loc;
            }
          });

          if (closest) {
            const marker = L.circle([closest.lat, closest.lng], {
              color: "red",
              radius: 500,
            })
              .addTo(map)
              .bindPopup(
                `<b>🔥 This is the closest vending machine to you</b><br>${closest.location}<br>${closest.city}, ${closest.state}`
              );

            // Draw dashed line
            L.polyline(
              [
                [userLat, userLng],
                [closest.lat, closest.lng],
              ],
              { color: "blue", dashArray: "5, 10" }
            ).addTo(map);

            // Fit bounds
            const bounds = L.latLngBounds([
              [userLat, userLng],
              [closest.lat, closest.lng],
            ]);
            map.fitBounds(bounds, { padding: [50, 50] });

            // Open popup after bounds update — fallback guaranteed
            let opened = false;
            map.once("moveend", () => {
              marker.openPopup();
              opened = true;
            });
            setTimeout(() => {
              if (!opened) marker.openPopup();
            }, 300);
          }
        },
        () => {
          alert("Location access denied. Cannot find closest machine.");
        }
      );
    } else {
      alert("Geolocation not supported by this browser.");
    }

    // Utility functions
    function getDistance(lat1, lon1, lat2, lon2) {
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function toRad(deg) {
      return (deg * Math.PI) / 180;
    }

    window.locateMe = function () {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          map.setView(
            [position.coords.latitude, position.coords.longitude],
            12
          );
        });
      } else {
        alert("Geolocation not supported.");
      }
    };
  });
