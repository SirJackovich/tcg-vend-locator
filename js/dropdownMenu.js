import { dashedLine } from "./userLocation.js";

export function setupDropdowns(data, map) {
  const stateSelect = document.getElementById("state-select");
  const citySelect = document.getElementById("city-select");

  // Populate state dropdown
  const states = [...new Set(data.map((loc) => loc.state))].sort();
  states.forEach((state) => {
    const option = document.createElement("option");
    option.value = state;
    option.textContent = state;
    stateSelect.appendChild(option);
  });

  stateSelect.addEventListener("change", () => {
    const selectedState = stateSelect.value;
    console.log("Selected state:", selectedState);

    citySelect.innerHTML = '<option value="">-- Select a city --</option>';
    citySelect.disabled = !selectedState;

    if (!selectedState) return;

    map.closePopup();
    if (dashedLine) {
      map.removeLayer(dashedLine);
    }

    // Zoom to state
    const stateLocations = data.filter(
      (loc) => loc.state === selectedState && loc.lat && loc.lng
    );
    console.log("Matching locations for state:", stateLocations.length);
    console.log(
      "Locations:",
      stateLocations.map((l) => `${l.city}: ${l.lat}, ${l.lng}`)
    );

    stateLocations.forEach((loc) => {
      if (loc.lng > -114.05) {
        console.warn("⚠️ Possibly not California:", loc);
      }
    });

    const bounds = L.latLngBounds(
      stateLocations.map((loc) => [loc.lat, loc.lng])
    );
    console.log("Bounds:", bounds);

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    // Populate city dropdown
    const cities = [...new Set(stateLocations.map((loc) => loc.city))].sort();
    cities.forEach((city) => {
      const opt = document.createElement("option");
      opt.value = city;
      opt.textContent = city;
      citySelect.appendChild(opt);
    });
  });

  citySelect.addEventListener("change", () => {
    const selectedCity = citySelect.value;
    const selectedState = stateSelect.value;

    const loc = data.find(
      (item) =>
        item.state === selectedState &&
        item.city === selectedCity &&
        item.lng &&
        item.lat
    );

    if (loc) {
      // Close any previously open popup
      map.closePopup();
      if (dashedLine) {
        map.removeLayer(dashedLine);
      }

      map.flyTo([loc.lat, loc.lng], 14);

      // Optionally open its popup immediately
      L.popup()
        .setLatLng([loc.lat, loc.lng])
        .setContent(`<b>${loc.location}</b><br>${loc.city}, ${loc.state}`)
        .openOn(map);
    }
  });
}
