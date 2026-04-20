/**
 * Startup migrations — safe to run on every boot.
 * Uses the existing drizzle connection (same SSL config as the rest of the app).
 */
import { sql } from "drizzle-orm";
import { getDb } from "../db";

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

  try {
    console.log("[Migrate] Running startup migrations…");

    // 1. Add passwordHash column to users if missing
    const [rows] = await db.execute(sql`
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME   = 'users'
        AND COLUMN_NAME  = 'passwordHash'
    `);
    const cols = rows as Array<{ COLUMN_NAME: string }>;
    if (cols.length === 0) {
      await db.execute(sql`
        ALTER TABLE users ADD COLUMN passwordHash VARCHAR(255) NULL
      `);
      console.log("[Migrate] ✓ Added passwordHash column to users");
    }

    // 2. Create beginner_lessons table if missing
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS beginner_lessons (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        language    ENUM('lao','thai') NOT NULL,
        title       VARCHAR(255)       NOT NULL,
        description TEXT,
        level       ENUM('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
        category    VARCHAR(100)       NOT NULL,
        orderIndex  INT                NOT NULL DEFAULT 0,
        content     JSON               NOT NULL,
        createdAt   TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt   TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 3. Create user_lesson_progress table if missing
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_lesson_progress (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        userId      INT                NOT NULL,
        lessonId    INT                NOT NULL,
        completed   TINYINT(1)         NOT NULL DEFAULT 0,
        score       INT,
        completedAt TIMESTAMP          NULL,
        createdAt   TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt   TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_lesson (userId, lessonId)
      )
    `);

    console.log("[Migrate] ✓ All migrations complete");
  } catch (err) {
    // Log the real error so Railway logs show what went wrong
    console.error("[Migrate] Migration error (server will still start):", err);
  }
}
