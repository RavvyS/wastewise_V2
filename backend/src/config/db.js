import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../db/schema.js';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Setup paths to ensure the database file is found correctly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'sqlite.db');

// Declare db variable outside of the try/catch block
let db;

try {
    console.log(`Attempting to connect to SQLite DB at: ${dbPath}`);
    
    // 2. Initialize the SQLite client pointing to the file
    const sqlite = new Database(dbPath);
    
    // 3. Create the Drizzle client and ASSIGN it to the external variable
    db = drizzle(sqlite, { schema });

    console.log(`✅ SQLite DB connected successfully.`);

    // Optional: Add some initial data if the tables are empty
    // await runMigrations(db); 
    // await seedDatabase(db); 

} catch (e) {
    console.error("❌ FATAL: SQLite DATABASE CONNECTION FAILED!");
    console.error(e);
    
    // Use process.exit(1) to terminate the process and force nodemon to show the error
    process.exit(1); 
}

// Export the variable at the top level (outside of the block)
export { db };