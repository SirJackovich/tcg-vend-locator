import { createMap } from "./mapSetup.js";
import { addMarkers } from "./loadMarkers.js";
import { showUserAndNearest } from "./userLocation.js";
import { setupDropdowns } from "./dropdownMenu.js";
import { locateMe } from "./locateMe.js";

const map = createMap();

fetch("vendingMachines.json")
  .then((res) => res.json())
  .then((data) => {
    addMarkers(map, data);
    showUserAndNearest(map, data);
    setupDropdowns(data, map);

    // ✅ Now that we have the map and data, hook up the locate button
    document
      .getElementById("locate-btn")
      .addEventListener("click", () => locateMe(map, data));
  })
  .catch((err) => {
    console.error("Error loading vending machine data:", err);
  });
