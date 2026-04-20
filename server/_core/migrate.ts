/**
 * Startup migrations — safe to run on every boot.
 * Uses IF NOT EXISTS / information_schema checks so re-runs are no-ops.
 */
import { getDb } from "../db";
import mysql from "mysql2/promise";

export async function runMigrations() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("[Migrate] No DATABASE_URL — skipping migrations");
    return;
  }

  let conn: mysql.Connection | null = null;
  try {
    conn = await mysql.createConnection(url);
    console.log("[Migrate] Running startup migrations…");

    // 1. Add passwordHash column to users if missing
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME   = 'users'
         AND COLUMN_NAME  = 'passwordHash'`
    );
    if (rows.length === 0) {
      await conn.execute(
        `ALTER TABLE users ADD COLUMN passwordHash VARCHAR(255) NULL`
      );
      console.log("[Migrate] ✓ Added passwordHash column to users");
    }

    // 2. Create beginner_lessons table if missing
    await conn.execute(`
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
    await conn.execute(`
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

    console.log("[Migrate] ✓ All migrations applied");
  } catch (err) {
    console.error("[Migrate] Migration error:", err);
    // Don't crash the server — just log and continue
  } finally {
    if (conn) await conn.end();
  }
}
