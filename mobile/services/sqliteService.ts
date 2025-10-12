// services/sqliteService.ts (FIXED WITH NAMED EXPORTS)

import * as SQLite from 'expo-sqlite';

// Define the name of your local database file
const DB_NAME = 'LearningHub.db';

// Define the data structures for type safety
export interface Article {
    id: string;
    title: string;
    content: string;
}

export interface Quiz {
    id: string;
    title: string;
    question: string;
    answer: string;
}

let db: SQLite.SQLiteDatabase | null = null;

// --- 1. INITIALIZATION ---
async function initializeDatabase() {
    if (!db) {
        db = await SQLite.openDatabaseAsync(DB_NAME);
    }
    
    // Create tables if they don't exist
    await db.execAsync(`
        PRAGMA journal_mode = WAL;

        CREATE TABLE IF NOT EXISTS articles (
            id TEXT PRIMARY KEY NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS quizzes (
            id TEXT PRIMARY KEY NOT NULL,
            title TEXT NOT NULL,
            question TEXT NOT NULL,
            answer TEXT NOT NULL
        );
    `);

    await insertInitialData(db);
    return db;
}

async function insertInitialData(database: SQLite.SQLiteDatabase) {
    // Check if tables are empty
    const articleCount = (await database.getFirstAsync<{count: number}>('SELECT COUNT(id) AS count FROM articles'))?.count ?? 0;
    
    if (articleCount === 0) {
        console.log("Inserting initial data...");
        await database.execAsync(`
            INSERT INTO articles (id, title, content) VALUES ('a101', 'How Recycling Helps the Planet', 'Recycling helps conserve resources and reduces landfill waste...');
            INSERT INTO articles (id, title, content) VALUES ('a102', 'Reducing Plastic Use', 'Simple steps to cut down on single-use plastics...');
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
export async function createNewContent(collectionName: 'articles' | 'quizzes', data: Omit<Article | Quiz, 'id'>): Promise<string> {
    if (!db) await initializeDatabase();
    
    const newId = `id-${Date.now()}`;
    let columns: string;
    let placeholders: string;
    let values: (string | number)[];

    if (collectionName === 'articles') {
        columns = 'id, title, content';
        placeholders = '?, ?, ?';
        values = [newId, data.title, (data as Article).content];
    } else { // quizzes
        columns = 'id, title, question, answer';
        placeholders = '?, ?, ?, ?';
        values = [newId, data.title, (data as Quiz).question, (data as Quiz).answer];
    }
    
    try {
        await db!.runAsync(`INSERT INTO ${collectionName} (${columns}) VALUES (${placeholders})`, values);
    } catch (e) {
        console.error("SQL INSERT ERROR:", e);
        throw new Error("Failed to execute SQL INSERT query.");
    }
    
    return newId;
}

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