// D:\wastewise_V2\backend\drizzle.config.js
// Ensure this is saved exactly as provided in the last fix.
export default {
    schema: "./src/db/schema.js",
    out: "./src/db/migrations",
    dialect: "sqlite", // MUST be 'sqlite'
    dbCredentials: {
        url: './src/sqlite.db', // MUST point to the local file
    }
};