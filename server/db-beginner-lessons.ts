import { eq, and } from "drizzle-orm";
import { getDb } from "./db.js";
import { beginnerLessons, userLessonProgress, emailSubscriptions } from "../drizzle/schema.js";

/**
 * Get all beginner lessons for a language
 */
export async function getBeginnerLessons(language: "lao" | "thai") {
  const db = await getDb();
  if (!db) return [];

  try {
    const lessons = await db
      .select()
      .from(beginnerLessons)
      .where(eq(beginnerLessons.language, language))
      .orderBy(beginnerLessons.order);

    return lessons;
  } catch (error) {
    console.error("[Database] Failed to get beginner lessons:", error);
    return [];
  }
}

/**
 * Get lessons by category
 */
export async function getLessonsByCategory(
  language: "lao" | "thai",
  category: "numbers" | "days" | "months" | "time" | "phrases" | "hello" | "family" | "food" | "languages" | "family_counting" | "age_counting"
) {
  const db = await getDb();
  if (!db) return [];

  try {
    const lessons = await db
      .select()
      .from(beginnerLessons)
      .where(
        and(
          eq(beginnerLessons.language, language),
          eq(beginnerLessons.category, category)
        )
      );

    return lessons;
  } catch (error) {
    console.error("[Database] Failed to get lessons by category:", error);
    return [];
  }
}

/**
 * Get single lesson by ID
 */
export async function getLessonById(lessonId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const lesson = await db
      .select()
      .from(beginnerLessons)
      .where(eq(beginnerLessons.id, lessonId))
      .limit(1);

    return lesson.length > 0 ? lesson[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get lesson:", error);
    return null;
  }
}

/**
 * Get user lesson progress
 */
export async function getUserLessonProgress(userId: number, lessonId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const progress = await db
      .select()
      .from(userLessonProgress)
      .where(
        and(
          eq(userLessonProgress.userId, userId),
          eq(userLessonProgress.lessonId, lessonId)
        )
      )
      .limit(1);

    return progress.length > 0 ? progress[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get user lesson progress:", error);
    return null;
  }
}

/**
 * Mark lesson as completed
 */
export async function markLessonCompleted(userId: number, lessonId: number) {
  const db = await getDb();
  if (!db) return false;

  try {
    const existingProgress = await getUserLessonProgress(userId, lessonId);

    if (existingProgress) {
      // Update existing progress
      await db
        .update(userLessonProgress)
        .set({
          isCompleted: 1,
          completedAt: new Date(),
        })
        .where(
          and(
            eq(userLessonProgress.userId, userId),
            eq(userLessonProgress.lessonId, lessonId)
          )
        );
    } else {
      // Create new progress record
      await db.insert(userLessonProgress).values({
        userId,
        lessonId,
        isCompleted: 1,
        completedAt: new Date(),
      });
    }

    return true;
  } catch (error) {
    console.error("[Database] Failed to mark lesson completed:", error);
    return false;
  }
}

/**
 * Get all user lesson progress
 */
export async function getUserAllLessonProgress(userId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const progress = await db
      .select()
      .from(userLessonProgress)
      .where(eq(userLessonProgress.userId, userId));

    return progress;
  } catch (error) {
    console.error("[Database] Failed to get user lesson progress:", error);
    return [];
  }
}

/**
 * Subscribe to email
 */
export async function subscribeToEmail(
  email: string,
  language: "lao" | "thai" = "thai",
  subscriptionType: "weekly_phrases" | "daily_tips" | "all" = "weekly_phrases",
  userId?: number
) {
  const db = await getDb();
  if (!db) return false;

  try {
    // Check if email already exists
    const existing = await db
      .select()
      .from(emailSubscriptions)
      .where(eq(emailSubscriptions.email, email))
      .limit(1);

    if (existing.length > 0) {
      // Update existing subscription
      await db
        .update(emailSubscriptions)
        .set({
          isActive: 1,
          unsubscribedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(emailSubscriptions.email, email));
    } else {
      // Create new subscription
      await db.insert(emailSubscriptions).values({
        email,
        userId,
        language,
        subscriptionType,
        isActive: 1,
      });
    }

    return true;
  } catch (error) {
    console.error("[Database] Failed to subscribe to email:", error);
    return false;
  }
}

/**
 * Unsubscribe from email
 */
export async function unsubscribeFromEmail(email: string) {
  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .update(emailSubscriptions)
      .set({
        isActive: 0,
        unsubscribedAt: new Date(),
      })
      .where(eq(emailSubscriptions.email, email));

    return true;
  } catch (error) {
    console.error("[Database] Failed to unsubscribe from email:", error);
    return false;
  }
}

/**
 * Get all active email subscriptions
 */
export async function getActiveEmailSubscriptions() {
  const db = await getDb();
  if (!db) return [];

  try {
    const subscriptions = await db
      .select()
      .from(emailSubscriptions)
      .where(eq(emailSubscriptions.isActive, 1));

    return subscriptions;
  } catch (error) {
    console.error("[Database] Failed to get active subscriptions:", error);
    return [];
  }
}
