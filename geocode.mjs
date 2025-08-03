import fs from "fs";
import path from "path";
import readline from "readline";

// 1. Prompt the user for the file name
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

// 2. Load the file dynamically
async function main() {
  const fileName = await ask("Enter the state file name (e.g., utah.js): ");
  rl.close();

  const filePath = path.resolve(`./${fileName}`);
  const moduleContent = await import(`file://${filePath}?v=${Date.now()}`);
  const arrayName = Object.keys(moduleContent)[0]; // e.g., 'utah'
  const locations = moduleContent[arrayName];

  if (!Array.isArray(locations)) {
    console.error(`❌ No array found in ${fileName}`);
    process.exit(1);
  }

  const updated = [];
  for (const entry of locations) {
    if (entry.lat && entry.lng) {
      updated.push(entry);
      continue;
    }

    const match = entry.location.match(/\((?:[^,]+, )?(.+?)\)$/);
    const address = match ? match[1] : entry.city;

    const fullAddress = `${address}, ${entry.city}, ${entry.state}`;
    console.log(`Geocoding: ${fullAddress}`);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({ q: fullAddress, format: "json", limit: 1 }),
      {
        headers: { "User-Agent": "jackovichtcg-vending-locator/1.0" },
      }
    );

    const data = await res.json();

    if (data[0]) {
      updated.push({ ...entry, lat: +data[0].lat, lng: +data[0].lon });
    } else {
      console.warn(`❌ No geocode for: ${fullAddress}`);
      updated.push(entry);
    }

    await new Promise((r) => setTimeout(r, 1100)); // throttle to 1 req/sec
  }

  const exportVar = arrayName;
  const jsContent = `export const ${exportVar} = ${JSON.stringify(
    updated,
    null,
    2
  )};\n`;
  fs.writeFileSync(filePath, jsContent);

  console.log(`✅ Done. ${fileName} updated with lat/lng.`);
}

main();
