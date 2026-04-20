/**
 * Startup migrations — safe to run on every boot.
 * Creates its own mysql2/promise connection so it works independently
 * of drizzle's connection pool.
 */

export async function runMigrations() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("[Migrate] No DATABASE_URL — skipping migrations");
    return;
  }

  // Dynamic import keeps the module tree clean
  const mysql = await import("mysql2/promise");

  let conn: Awaited<ReturnType<typeof mysql.createConnection>> | null = null;
  try {
    console.log("[Migrate] Connecting for startup migrations…");
    conn = await mysql.createConnection(url);

    // 1. Add passwordHash column to users if missing
    const [rows] = await conn.query<mysql.RowDataPacket[]>(
      `SELECT COLUMN_NAME
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME   = 'users'
         AND COLUMN_NAME  = 'passwordHash'`
    );
    if (rows.length === 0) {
      await conn.query(`ALTER TABLE users ADD COLUMN passwordHash VARCHAR(255) NULL`);
      console.log("[Migrate] ✓ Added passwordHash column to users");
    } else {
      console.log("[Migrate] passwordHash column already present");
    }

    // 2. Ensure beginner_lessons exists
    await conn.query(`
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

    // 3. Ensure user_lesson_progress exists
    await conn.query(`
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

    console.log("[Migrate] ✓ All migrations complete");
  } catch (err: unknown) {
    // Log the full error so Railway logs show what went wrong
    console.error("[Migrate] Migration failed:", err);
  } finally {
    if (conn) {
      try { await conn.end(); } catch { /* ignore close errors */ }
    }
  }
}
