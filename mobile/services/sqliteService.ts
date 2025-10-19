import * as SQLite from 'expo-sqlite';

// Define the name of your local database file
const DB_NAME = 'LearningHub.db';

// Define the data structures for type safety
export interface Article {
    id: string;
    title: string;
    content: string;
    category: string; 
    level: string;     
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
            content TEXT NOT NULL,
            category TEXT,
            level TEXT
        );

        CREATE TABLE IF NOT EXISTS quizzes (
            id TEXT PRIMARY KEY NOT NULL,
            title TEXT NOT NULL,
            question TEXT NOT NULL,
            answer TEXT NOT NULL
        );
    `);

    // Migration: Add missing columns if they don't exist
    try {
        await db.execAsync(`
            ALTER TABLE articles ADD COLUMN category TEXT DEFAULT 'General';
        `);
    } catch (e) {
        console.log("Category column already exists or migration skipped");
    }

    try {
        await db.execAsync(`
            ALTER TABLE articles ADD COLUMN level TEXT DEFAULT 'Beginner';
        `);
    } catch (e) {
        console.log("Level column already exists or migration skipped");
    }

    // Update existing articles with default values
    try {
        await db.execAsync(`
            UPDATE articles SET category = COALESCE(category, 'General') WHERE category IS NULL;
            UPDATE articles SET level = COALESCE(level, 'Beginner') WHERE level IS NULL;
        `);
    } catch (e) {
        console.log("Update skipped or already completed");
    }

    await insertInitialData(db);
    return db;
}

async function insertInitialData(database: SQLite.SQLiteDatabase) {
    // Check if tables are empty
    const articleCount = (await database.getFirstAsync<{count: number}>('SELECT COUNT(id) AS count FROM articles'))?.count ?? 0;
    
    // Use an "upsert" approach to ensure initial data always has category/level
    if (articleCount <= 2) { 
        console.log("Inserting initial data...");
        // Updated inserts to include category and level
        await database.execAsync(`
            INSERT OR REPLACE INTO articles (id, title, content, category, level) VALUES ('a101', 'How Recycling Helps the Planet', 'Recycling helps conserve resources and reduces landfill waste...', 'General', 'Intermediate');
            INSERT OR REPLACE INTO articles (id, title, content, category, level) VALUES ('a102', 'Reducing Plastic Use', 'Simple steps to cut down on single-use plastics...', 'Plastic', 'Beginner');
            
            INSERT OR REPLACE INTO quizzes (id, title, question, answer) VALUES ('q201', 'Recycling Basics', 'What color bin is for paper?', 'blue');
            INSERT OR REPLACE INTO quizzes (id, title, question, answer) VALUES ('q202', 'Energy Saving', 'What type of light bulb uses the least amount of energy?', 'LED');
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
export async function createNewContent(
    collectionName: 'articles' | 'quizzes', 
    data: Omit<Article, 'id'> | Omit<Quiz, 'id'>
): Promise<string> {
    if (!db) await initializeDatabase();
    
    const newId = `id-${Date.now()}`;

    try {
        if (collectionName === 'articles') {
            const articleData = data as Omit<Article, 'id'>;
            
            await db!.runAsync(
                `INSERT INTO articles (id, title, content, category, level) VALUES (?, ?, ?, ?, ?)`,
                [newId, articleData.title, articleData.content, articleData.category || 'General', articleData.level || 'Beginner']
            );
        } else { // quizzes
            const quizData = data as Omit<Quiz, 'id'>;
            
            await db!.runAsync(
                `INSERT INTO quizzes (id, title, question, answer) VALUES (?, ?, ?, ?)`,
                [newId, quizData.title, quizData.question, quizData.answer]
            );
        }
    } catch (e) {
        console.error("SQL INSERT ERROR:", e);
        throw new Error("Failed to execute SQL INSERT query.");
    }
    
    return newId;
}

export async function updateExistingContent(collectionName: 'articles' | 'quizzes', id: string, data: Partial<Article | Quiz>): Promise<void> {
    if (!db) await initializeDatabase();
    
    try {
        if (collectionName === 'articles') {
            const articleData = data as Partial<Article>;
            const { id: _, ...updateData } = articleData;
            
            const setClauses = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
            const values = [...Object.values(updateData), id];
            
            if (setClauses.length > 0) {
                await db!.runAsync(`UPDATE articles SET ${setClauses} WHERE id = ?`, values);
            }
        } else { // quizzes
            const quizData = data as Partial<Quiz>;
            const { id: _, ...updateData } = quizData;
            
            const setClauses = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
            const values = [...Object.values(updateData), id];
            
            if (setClauses.length > 0) {
                await db!.runAsync(`UPDATE quizzes SET ${setClauses} WHERE id = ?`, values);
            }
        }
    } catch (e) {
        console.error("SQL UPDATE ERROR:", e);
        throw new Error("Failed to execute SQL UPDATE query.");
    }
}

export async function deleteContentById(collectionName: 'articles' | 'quizzes', id: string): Promise<void> {
    if (!db) await initializeDatabase();
    
    try {
        await db!.runAsync(`DELETE FROM ${collectionName} WHERE id = ?`, [id]);
    } catch (e) {
        console.error("SQL DELETE ERROR:", e);
        throw new Error("Failed to execute SQL DELETE query.");
    }
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