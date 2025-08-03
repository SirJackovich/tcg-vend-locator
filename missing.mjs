import fs from "fs";
import path from "path";
import readline from "readline";

// Ask for filename from user
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

const main = async () => {
  const fileName = await ask("Enter the state file name (e.g., utah.js): ");
  rl.close();

  const filePath = path.resolve(`./${fileName}`);
  const moduleContent = await import(`file://${filePath}?v=${Date.now()}`);

  const arrayName = Object.keys(moduleContent)[0];
  const data = moduleContent[arrayName];

  if (!Array.isArray(data)) {
    console.error(`❌ No array found in ${fileName}`);
    process.exit(1);
  }

  const missing = data.filter((entry) => !entry.lat || !entry.lng);

  console.log(`❌ Missing lat/lng for ${missing.length} entries:\n`);
  missing.forEach((entry) => {
    console.log(`${entry.location}, ${entry.city}, ${entry.state}`);
  });
};

main();
