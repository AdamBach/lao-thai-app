import { getDb } from "./db.js";
import { reviewSessions, userLessonProgress } from "../drizzle/schema.js";
import { eq, and } from "drizzle-orm";

/**
 * Create a new review session for a user
 */
export async function createReviewSession(
  userId: number,
  lessonId: number,
  totalItems: number
) {
  try {
    const db = await getDb();
    if (!db) return null;

    const result = await db.insert(reviewSessions).values({
      userId,
      lessonId,
      totalItems,
      correctAnswers: 0,
      accuracy: "0.00",
      duration: 0,
      isCompleted: 0,
    });

    return result;
  } catch (error) {
    console.error("[Review] Failed to create review session:", error);
    return null;
  }
}

/**
 * Update review session with results
 */
export async function updateReviewSession(
  sessionId: number,
  correctAnswers: number,
  totalItems: number,
  duration: number
) {
  try {
    const db = await getDb();
    if (!db) return null;

    const accuracy = ((correctAnswers / totalItems) * 100).toFixed(2);

    const result = await db
      .update(reviewSessions)
      .set({
        correctAnswers,
        accuracy: accuracy as any,
        duration,
        isCompleted: 1,
        completedAt: new Date(),
      })
      .where(eq(reviewSessions.id, sessionId));

    return result;
  } catch (error) {
    console.error("[Review] Failed to update review session:", error);
    return null;
  }
}

/**
 * Get review session statistics for a user
 */
export async function getUserReviewStats(userId: number, lessonId?: number) {
  try {
    const db = await getDb();
    if (!db) return null;

    let sessions;
    if (lessonId) {
      sessions = await db
        .select()
        .from(reviewSessions)
        .where(
          and(eq(reviewSessions.userId, userId), eq(reviewSessions.lessonId, lessonId))
        );
    } else {
      sessions = await db
        .select()
        .from(reviewSessions)
        .where(eq(reviewSessions.userId, userId));
    }

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        averageAccuracy: 0,
        totalCorrect: 0,
        totalItems: 0,
        bestAccuracy: 0,
      };
    }

    const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const totalItems = sessions.reduce((sum, s) => sum + s.totalItems, 0);
    const averageAccuracy =
      sessions.reduce((sum, s) => sum + parseFloat(s.accuracy.toString()), 0) / sessions.length;
    const bestAccuracy = Math.max(...sessions.map((s) => parseFloat(s.accuracy.toString())));

    return {
      totalSessions: sessions.length,
      averageAccuracy: Math.round(averageAccuracy * 100) / 100,
      totalCorrect,
      totalItems,
      bestAccuracy,
    };
  } catch (error) {
    console.error("[Review] Failed to get review stats:", error);
    return null;
  }
}

/**
 * Get completed lessons for a user (for review mode)
 */
export async function getCompletedLessonsForReview(userId: number) {
  try {
    const db = await getDb();
    if (!db) return [];

    const results = await db
      .select()
      .from(userLessonProgress)
      .where(and(eq(userLessonProgress.userId, userId), eq(userLessonProgress.isCompleted, 1)));

    return results;
  } catch (error) {
    console.error("[Review] Failed to get completed lessons:", error);
    return [];
  }
}

/**
 * Get review session by ID
 */
export async function getReviewSession(sessionId: number) {
  try {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(reviewSessions)
      .where(eq(reviewSessions.id, sessionId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Review] Failed to get review session:", error);
    return null;
  }
}

/**
 * Get all review sessions for a user
 */
export async function getUserReviewSessions(userId: number, limit: number = 10) {
  try {
    const db = await getDb();
    if (!db) return [];

    const results = await db
      .select()
      .from(reviewSessions)
      .where(eq(reviewSessions.userId, userId))
      .orderBy(reviewSessions.createdAt)
      .limit(limit);

    return results;
  } catch (error) {
    console.error("[Review] Failed to get user review sessions:", error);
    return [];
  }
}
