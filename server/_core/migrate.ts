/**
 * Startup schema migration.
 * Passes the raw DATABASE_URL directly to createPool — same as drizzle does.
 */
import { createPool } from "mysql2/promise";

export async function runMigrations() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("[Migrate] No DATABASE_URL — skipping");
    return;
  }

  const pool = createPool(url);
  try {
    console.log("[Migrate] Running startup migrations…");

    const [rows] = await pool.query<any[]>(
      `SELECT 1 FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME   = 'users'
         AND COLUMN_NAME  = 'passwordHash'`
    );
    console.log("[Migrate] passwordHash check: found", rows.length, "rows");

    if (rows.length === 0) {
      await pool.query(`ALTER TABLE users ADD COLUMN passwordHash VARCHAR(255) NULL`);
      console.log("[Migrate] ✓ passwordHash column added");
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS beginner_lessons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        language ENUM('lao','thai') NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        level ENUM('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
        category VARCHAR(100) NOT NULL,
        orderIndex INT NOT NULL DEFAULT 0,
        content JSON NOT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_lesson_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        lessonId INT NOT NULL,
        completed TINYINT(1) NOT NULL DEFAULT 0,
        score INT,
        completedAt TIMESTAMP NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_lesson (userId, lessonId)
      )
    `);

    console.log("[Migrate] ✓ All migrations complete");
  } catch (err: unknown) {
    console.error("[Migrate] FAILED:", err instanceof Error ? err.message : String(err));
  } finally {
    await pool.end().catch(() => {});
  }
}
