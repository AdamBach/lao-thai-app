/**
 * Startup migrations — uses the same underlying mysql2 pool that drizzle
 * already has open, so SSL and connection config are identical.
 */
import { getDb } from "../db";
import type { RowDataPacket } from "mysql2";

export async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    console.warn("[Migrate] No DATABASE_URL — skipping migrations");
    return;
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Migrate] DB not available — skipping migrations");
    return;
  }

  // drizzle(connectionString) wraps a mysql2 callback-pool in db.$client
  // .promise() upgrades it to the promise API without opening a new connection
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pool = (db as any).$client.promise() as {
    query: (sql: string, params?: unknown[]) => Promise<[RowDataPacket[], unknown]>;
  };

  try {
    console.log("[Migrate] Running startup migrations…");

    // 1. Add passwordHash column if missing
    const [cols] = await pool.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME   = 'users'
         AND COLUMN_NAME  = 'passwordHash'`
    );
    if (!Array.isArray(cols) || cols.length === 0) {
      await pool.query(`ALTER TABLE users ADD COLUMN passwordHash VARCHAR(255) NULL`);
      console.log("[Migrate] ✓ Added passwordHash to users");
    } else {
      console.log("[Migrate] passwordHash already exists");
    }

    // 2. beginner_lessons
    await pool.query(`
      CREATE TABLE IF NOT EXISTS beginner_lessons (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        language    ENUM('lao','thai') NOT NULL,
        title       VARCHAR(255) NOT NULL,
        description TEXT,
        level       ENUM('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
        category    VARCHAR(100) NOT NULL,
        orderIndex  INT NOT NULL DEFAULT 0,
        content     JSON NOT NULL,
        createdAt   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 3. user_lesson_progress
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_lesson_progress (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        userId      INT NOT NULL,
        lessonId    INT NOT NULL,
        completed   TINYINT(1) NOT NULL DEFAULT 0,
        score       INT,
        completedAt TIMESTAMP NULL,
        createdAt   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_lesson (userId, lessonId)
      )
    `);

    console.log("[Migrate] ✓ All done");
  } catch (err) {
    console.error("[Migrate] Error:", err);
  }
}
