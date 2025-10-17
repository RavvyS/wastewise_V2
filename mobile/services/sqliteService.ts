// services/sqliteService.ts (FIXED WITH NAMED EXPORTS)

import * as SQLite from 'expo-sqlite';

// Define the name of your local database file
const DB_NAME = 'LearningHub.db';

// Define the data structures for type safety
// FIX 1 & 2: Added 'category', 'level' to Article, and confirmed 'question', 'answer' for Quiz.
export interface Article {
    id: string;
    title: string;
    content: string;
    category: string; // <-- ADDED for type safety alignment
    level: string;   // <-- ADDED for type safety alignment
}

export interface Quiz {
    id: string;
    title: string;
    question: string; // <-- Confirmed/Added for type safety alignment
    answer: string;   // <-- Confirmed/Added for type safety alignment
}

let db: SQLite.SQLiteDatabase | null = null;

// --- 1. INITIALIZATION ---
async function initializeDatabase() {
    if (!db) {
        db = await SQLite.openDatabaseAsync(DB_NAME);
    }
    
    // Create tables if they don't exist
    // FIX 3: Added category and level to articles table.
    await db.execAsync(`
        PRAGMA journal_mode = WAL;

        CREATE TABLE IF NOT EXISTS articles (
            id TEXT PRIMARY KEY NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            category TEXT,  -- New column
            level TEXT      -- New column
        );

        CREATE TABLE IF NOT EXISTS quizzes (
            id TEXT PRIMARY KEY NOT NULL,
            title TEXT NOT NULL,
            question TEXT NOT NULL,
            answer TEXT NOT NULL
        );
    `);

    // NOTE: This is a hacky way to ensure schema update on existing apps, 
    // but the easiest way to fix it for now without proper migration.
    // Ensure new columns exist before proceeding, or the app will crash on select later.
    try {
        await db.execAsync(`ALTER TABLE articles ADD COLUMN category TEXT;`);
    } catch (e) { /* ignore if column already exists */ }
    try {
        await db.execAsync(`ALTER TABLE articles ADD COLUMN level TEXT;`);
    } catch (e) { /* ignore if column already exists */ }

    await insertInitialData(db);
    return db;
}

async function insertInitialData(database: SQLite.SQLiteDatabase) {
    // Check if tables are empty
    const articleCount = (await database.getFirstAsync<{count: number}>('SELECT COUNT(id) AS count FROM articles'))?.count ?? 0;
    
    if (articleCount === 0) {
        console.log("Inserting initial data...");
        // FIX 4: Updated initial data to include category and level
        await database.execAsync(`
            INSERT INTO articles (id, title, content, category, level) VALUES ('a101', 'How Recycling Helps the Planet', 'Recycling helps conserve resources and reduces landfill waste...', 'General', 'Beginner');
            INSERT INTO articles (id, title, content, category, level) VALUES ('a102', 'Reducing Plastic Use', 'Simple steps to cut down on single-use plastics...', 'Plastic', 'Intermediate');
            INSERT INTO quizzes (id, title, question, answer) VALUES ('q201', 'Recycling Basics', 'What color bin is for paper?', 'blue');
            INSERT INTO quizzes (id, title, question, answer) VALUES ('q202', 'Energy Saving', 'What type of light bulb uses the least amount of energy?', 'LED');
        `);
    }
}


// --- 2. READ OPERATIONS ---
export async function getArticles(): Promise<Article[]> {
    if (!db) await initializeDatabase();
    return await db!.getAllAsync<Article>('SELECT * FROM articles');
}

export async function getQuizzes(): Promise<Quiz[]> {
    if (!db) await initializeDatabase();
    return await db!.getAllAsync<Quiz>('SELECT * FROM quizzes');
}

export async function getContentById<T extends Article | Quiz>(collectionName: 'articles' | 'quizzes', id: string): Promise<T | null> {
    if (!db) await initializeDatabase();
    const row = await db!.getFirstAsync<T>(`SELECT * FROM ${collectionName} WHERE id = ?`, [id]);
    return row ?? null;
}


// --- 3. CRUD MUTATIONS ---
// FIX 5: Explicitly define the types expected in 'data' without 'id'
export async function createNewContent(collectionName: 'articles' | 'quizzes', data: Omit<Article, 'id'> | Omit<Quiz, 'id'>): Promise<string> {
    if (!db) await initializeDatabase();
    
    const newId = `id-${Date.now()}`;
    let columns: string;
    let placeholders: string;
    let values: (string | number)[];

    if (collectionName === 'articles') {
        const articleData = data as Omit<Article, 'id'>;
        // FIX 5: Added category and level columns
        columns = 'id, title, content, category, level';
        placeholders = '?, ?, ?, ?, ?';
        values = [newId, articleData.title, articleData.content, articleData.category, articleData.level];
    } else { // quizzes
        const quizData = data as Omit<Quiz, 'id'>;
        columns = 'id, title, question, answer';
        placeholders = '?, ?, ?, ?';
        values = [newId, quizData.title, quizData.question, quizData.answer];
    }
    
    try {
        await db!.runAsync(`INSERT INTO ${collectionName} (${columns}) VALUES (${placeholders})`, values);
    } catch (e) {
        console.error("SQL INSERT ERROR:", e);
        throw new Error("Failed to execute SQL INSERT query.");
    }
    
    return newId;
}

// Ensure data is Partial<T> where T has string id
export async function updateExistingContent(collectionName: 'articles' | 'quizzes', id: string, data: Partial<Article | Quiz>): Promise<void> {
    if (!db) await initializeDatabase();
    
    const setClauses = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];

    await db!.runAsync(`UPDATE ${collectionName} SET ${setClauses} WHERE id = ?`, values);
}

export async function deleteContentById(collectionName: 'articles' | 'quizzes', id: string): Promise<void> {
    if (!db) await initializeDatabase();
    
    await db!.runAsync(`DELETE FROM ${collectionName} WHERE id = ?`, [id]);
}

// Optional: Keep a default export for backward compatibility if needed
export default {
    initializeDatabase,
    getArticles,
    getQuizzes,
    getContentById,
    createNewContent,
    updateExistingContent,
    deleteContentById,
};