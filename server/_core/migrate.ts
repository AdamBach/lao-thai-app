/**
 * Startup schema migration.
 * Uses a fresh mysql2/promise connection built from DATABASE_URL parts
 * so SSL handling is explicit and predictable.
 */
import { createPool } from "mysql2/promise";

function parseDbUrl(url: string) {
  // mysql://user:pass@host:port/db?ssl-mode=REQUIRED
  const u = new URL(url);
  return {
    host: u.hostname,
    port: parseInt(u.port || "3306"),
    user: u.username,
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),
    ssl: { rejectUnauthorized: false }, // Aiven requires SSL; don't reject self-signed
  };
}

export async function runMigrations() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("[Migrate] No DATABASE_URL — skipping");
    return;
  }

  let pool: Awaited<ReturnType<typeof createPool>> | null = null;
  try {
    console.log("[Migrate] Connecting…");
    const config = parseDbUrl(url);
    pool = createPool({ ...config, waitForConnections: true, connectionLimit: 1 });

    // 1. Check + add passwordHash column
    const [rows] = await pool.query<any[]>(
      `SELECT 1 FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME   = 'users'
         AND COLUMN_NAME  = 'passwordHash'`
    );
    console.log("[Migrate] passwordHash check returned", rows.length, "rows");
    if (rows.length === 0) {
      console.log("[Migrate] Adding passwordHash column…");
      await pool.query(`ALTER TABLE users ADD COLUMN passwordHash VARCHAR(255) NULL`);
      console.log("[Migrate] ✓ passwordHash added");
    }

    // 2. beginner_lessons
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

    // 3. user_lesson_progress
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
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Migrate] FAILED:", msg);
    // Don't crash the server — it will just fail on first auth attempt
  } finally {
    if (pool) {
      try { await pool.end(); } catch { /* ignore */ }
    }
  }
}
