const path = require("path");
const fs = require("fs");

// Since we're using ES modules in the source code, we need a workaround
const apiFilePath = path.join(__dirname, "mobile", "utils", "api.ts");
console.log("API file path:", apiFilePath);

console.log("File exists:", fs.existsSync(apiFilePath));

// For testing purposes, let's hardcode the API base URL and endpoint
const API_BASE_URL = "https://backend-two-zeta-41.vercel.app";
const API_ENDPOINTS = {
  CATEGORIES: "/api/categories",
};

console.log("Testing API connection to:", API_BASE_URL);

async function testConnection() {
  try {
    const fullUrl = `${API_BASE_URL}${API_ENDPOINTS.CATEGORIES}`;
    console.log("Trying to fetch categories from:", fullUrl);

    const response = await fetch(fullUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    console.log("✅ Connection successful!");
    console.log(`Found ${data.length} categories:`, data);
    return true;
  } catch (error) {
    console.error("❌ Connection failed:", error);
    return false;
  }
}

testConnection();
