import { eq, desc, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { users, userStatistics, friendships, weeklyLeaderboard } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Get global leaderboard - top users by total XP
 */
export async function getGlobalLeaderboard(topN: number = 50) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get global leaderboard: database not available");
    return [];
  }

  try {
    const results = await db
      .select({
        userId: users.id,
        name: users.name,
        email: users.email,
        totalXP: userStatistics.totalXP,
        level: userStatistics.level,
        streak: userStatistics.streak,
        totalPronunciationAttempts: userStatistics.totalPronunciationAttempts,
        averageAccuracy: userStatistics.averageAccuracy,
      })
      .from(users)
      .leftJoin(userStatistics, eq(users.id, userStatistics.userId))
      .orderBy(desc(userStatistics.totalXP));

    // Assign ranks and limit
    return results.slice(0, topN).map((row, index) => ({
      rank: index + 1,
      userId: row.userId,
      name: row.name,
      email: row.email,
      totalXP: row.totalXP || 0,
      level: row.level || 1,
      streak: row.streak || 0,
      totalPronunciationAttempts: row.totalPronunciationAttempts || 0,
      averageAccuracy: row.averageAccuracy || 0,
    }));
  } catch (error) {
    console.error("[Database] Failed to get global leaderboard:", error);
    throw error;
  }
}

/**
 * Get user's rank in global leaderboard
 */
export async function getUserGlobalRank(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user rank: database not available");
    return null;
  }

  try {
    const userStats = await db
      .select({ totalXP: userStatistics.totalXP })
      .from(userStatistics)
      .where(eq(userStatistics.userId, userId));

    if (!userStats || userStats.length === 0) {
      return null;
    }

    const userXP = userStats[0].totalXP;

    // Count how many users have more XP
    const higherRankedUsers = await db
      .select({ totalXP: userStatistics.totalXP })
      .from(userStatistics)
      .where(gte(userStatistics.totalXP, userXP));

    return higherRankedUsers.length;
  } catch (error) {
    console.error("[Database] Failed to get user rank:", error);
    throw error;
  }
}

/**
 * Get friend leaderboard - user's friends ranked by XP
 */
export async function getFriendLeaderboard(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get friend leaderboard: database not available");
    return [];
  }
  try {
    const results = await db
      .select({
        userId: users.id,
        name: users.name,
        email: users.email,
        totalXP: userStatistics.totalXP,
        level: userStatistics.level,
        streak: userStatistics.streak,
        totalPronunciationAttempts: userStatistics.totalPronunciationAttempts,
        averageAccuracy: userStatistics.averageAccuracy,
        friendshipStatus: friendships.status,
      })
      .from(friendships)
      .innerJoin(users, eq(friendships.friendId, users.id))
      .leftJoin(userStatistics, eq(users.id, userStatistics.userId))
      .where(
        and(
          eq(friendships.userId, userId),
          eq(friendships.status, "accepted")
        )
      )
      .orderBy(desc(userStatistics.totalXP));

    // Assign ranks
    return results.map((row, index) => ({
      rank: index + 1,
      userId: row.userId,
      name: row.name,
      email: row.email,
      totalXP: row.totalXP || 0,
      level: row.level || 1,
      streak: row.streak || 0,
      totalPronunciationAttempts: row.totalPronunciationAttempts || 0,
      averageAccuracy: row.averageAccuracy || 0,
      friendshipStatus: row.friendshipStatus || "accepted",
    }));
  } catch (error) {
    console.error("[Database] Failed to get friend leaderboard:", error);
    throw error;
  }
}

/**
 * Get weekly leaderboard - top users by XP this week
 */
export async function getWeeklyLeaderboard(topN: number = 50) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get weekly leaderboard: database not available");
    return [];
  }

  try {
    // Get current week's leaderboard
    const today = new Date().toISOString().split("T")[0];

    const results = await db
      .select({
        rank: weeklyLeaderboard.rank,
        userId: weeklyLeaderboard.userId,
        name: users.name,
        email: users.email,
        totalXP: weeklyLeaderboard.totalXP,
        totalAttempts: weeklyLeaderboard.totalAttempts,
        averageAccuracy: weeklyLeaderboard.averageAccuracy,
      })
      .from(weeklyLeaderboard)
      .innerJoin(users, eq(weeklyLeaderboard.userId, users.id))
      .where(lte(weeklyLeaderboard.weekStart, today))
      .orderBy(weeklyLeaderboard.rank)
      .limit(topN);

    return results;
  } catch (error) {
    console.error("[Database] Failed to get weekly leaderboard:", error);
    throw error;
  }
}

/**
 * Get user's weekly rank
 */
export async function getUserWeeklyRank(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user weekly rank: database not available");
    return null;
  }

  try {
    const today = new Date().toISOString().split("T")[0];

    const result = await db
      .select({ rank: weeklyLeaderboard.rank })
      .from(weeklyLeaderboard)
      .where(
        and(
          eq(weeklyLeaderboard.userId, userId),
          lte(weeklyLeaderboard.weekStart, today)
        )
      )
      .orderBy(desc(weeklyLeaderboard.weekStart))
      .limit(1);

    return result.length > 0 ? result[0].rank : null;
  } catch (error) {
    console.error("[Database] Failed to get user weekly rank:", error);
    throw error;
  }
}

/**
 * Add friendship
 */
export async function addFriendship(userId: number, friendId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add friendship: database not available");
    return null;
  }

  try {
    const result = await db.insert(friendships).values({
      userId,
      friendId,
      status: "pending",
    });

    return result;
  } catch (error) {
    console.error("[Database] Failed to add friendship:", error);
    throw error;
  }
}

/**
 * Accept friendship
 */
export async function acceptFriendship(userId: number, friendId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot accept friendship: database not available");
    return null;
  }

  try {
    const result = await db
      .update(friendships)
      .set({ status: "accepted" })
      .where(
        and(
          eq(friendships.userId, userId),
          eq(friendships.friendId, friendId)
        )
      );

    return result;
  } catch (error) {
    console.error("[Database] Failed to accept friendship:", error);
    throw error;
  }
}

/**
 * Get friend requests
 */
export async function getFriendRequests(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get friend requests: database not available");
    return [];
  }

  try {
    const results = await db
      .select({
        friendshipId: friendships.id,
        userId: users.id,
        name: users.name,
        email: users.email,
      })
      .from(friendships)
      .innerJoin(users, eq(friendships.userId, users.id))
      .where(
        and(
          eq(friendships.friendId, userId),
          eq(friendships.status, "pending")
        )
      );

    return results;
  } catch (error) {
    console.error("[Database] Failed to get friend requests:", error);
    throw error;
  }
}

/**
 * Record weekly leaderboard snapshot
 */
export async function recordWeeklyLeaderboardSnapshot(
  weekStart: string,
  weekEnd: string
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot record weekly leaderboard: database not available");
    return null;
  }

  try {
    // Get current global leaderboard
    const leaderboard = await getGlobalLeaderboard(1000);

    // Insert snapshots
    const snapshots = leaderboard.map((entry) => ({
      userId: entry.userId as number,
      weekStart,
      weekEnd,
      rank: entry.rank as number,
      totalXP: (entry.totalXP || 0) as number,
      totalAttempts: (entry.totalPronunciationAttempts || 0) as number,
      averageAccuracy: (Number(entry.averageAccuracy || 0)).toString(),
    }));

    const result = await db.insert(weeklyLeaderboard).values(snapshots);
    return result;
  } catch (error) {
    console.error("[Database] Failed to record weekly leaderboard:", error);
    throw error;
  }
}

/**
 * Get leaderboard statistics
 */
export async function getLeaderboardStats() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get leaderboard stats: database not available");
    return null;
  }

  try {
    const totalUsers = await db.select({ id: users.id }).from(users);
    const totalFriendships = await db.select({ id: friendships.id }).from(friendships);

    return {
      totalUsers: totalUsers.length,
      totalFriendships: totalFriendships.length,
    };
  } catch (error) {
    console.error("[Database] Failed to get leaderboard stats:", error);
    throw error;
  }
}
