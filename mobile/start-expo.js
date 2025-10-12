#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");

// Change to the correct directory
process.chdir(__dirname);

console.log("Starting Expo from:", process.cwd());
console.log("Package.json exists:", require("fs").existsSync("./package.json"));

// Start Expo with LAN mode
const expo = spawn("npx", ["expo", "start", "--lan", "--clear"], {
  stdio: "inherit",
  shell: true,
  cwd: process.cwd(),
});

expo.on("error", (error) => {
  console.error("Error starting Expo:", error);
});

expo.on("close", (code) => {
  console.log(`Expo process exited with code ${code}`);
});
