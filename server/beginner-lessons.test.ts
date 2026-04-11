import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { db } from "./db";
import {
  getBeginnerLessons,
  getLessonsByCategory,
  getLessonById,
  getUserLessonProgress,
  markLessonCompleted,
  getUserAllLessonProgress,
  subscribeToEmail,
  unsubscribeFromEmail,
  getActiveEmailSubscriptions,
} from "./db-beginner-lessons";
import { beginnerLessons, userLessonProgress, emailSubscriptions } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

describe("Beginner Lessons Database Helpers", () => {
  const testUserId = "test-user-123";
  const testEmail = "test@example.com";

  beforeAll(async () => {
    // Clean up test data before running tests
    try {
      await db.delete(userLessonProgress).where(eq(userLessonProgress.userId, testUserId));
      await db.delete(emailSubscriptions).where(eq(emailSubscriptions.email, testEmail));
    } catch (error) {
      console.log("Cleanup error (expected on first run):", error);
    }
  });

  afterAll(async () => {
    // Clean up test data after tests
    try {
      await db.delete(userLessonProgress).where(eq(userLessonProgress.userId, testUserId));
      await db.delete(emailSubscriptions).where(eq(emailSubscriptions.email, testEmail));
    } catch (error) {
      console.log("Cleanup error:", error);
    }
  });

  describe("getBeginnerLessons", () => {
    it("should return lessons for Thai language", async () => {
      const lessons = await getBeginnerLessons("thai");
      expect(Array.isArray(lessons)).toBe(true);
      expect(lessons.length).toBeGreaterThan(0);
      expect(lessons[0]).toHaveProperty("id");
      expect(lessons[0]).toHaveProperty("title");
      expect(lessons[0]).toHaveProperty("language");
      expect(lessons[0].language).toBe("thai");
    });

    it("should return lessons for Lao language", async () => {
      const lessons = await getBeginnerLessons("lao");
      expect(Array.isArray(lessons)).toBe(true);
      expect(lessons.length).toBeGreaterThan(0);
      expect(lessons[0].language).toBe("lao");
    });

    it("should return empty array for invalid language", async () => {
      const lessons = await getBeginnerLessons("invalid" as any);
      expect(Array.isArray(lessons)).toBe(true);
      expect(lessons.length).toBe(0);
    });
  });

  describe("getLessonsByCategory", () => {
    it("should return lessons for Thai numbers category", async () => {
      const lessons = await getLessonsByCategory("thai", "numbers");
      expect(Array.isArray(lessons)).toBe(true);
      expect(lessons.length).toBeGreaterThan(0);
      expect(lessons[0].category).toBe("numbers");
    });

    it("should return lessons for Lao days category", async () => {
      const lessons = await getLessonsByCategory("lao", "days");
      expect(Array.isArray(lessons)).toBe(true);
      expect(lessons.length).toBeGreaterThan(0);
      expect(lessons[0].category).toBe("days");
    });

    it("should return empty array for non-existent category", async () => {
      const lessons = await getLessonsByCategory("thai", "invalid" as any);
      expect(Array.isArray(lessons)).toBe(true);
      expect(lessons.length).toBe(0);
    });

    it("should return lessons for all categories", async () => {
      const categories = ["numbers", "days", "months", "time", "phrases"] as const;
      for (const category of categories) {
        const lessons = await getLessonsByCategory("thai", category);
        expect(Array.isArray(lessons)).toBe(true);
        if (lessons.length > 0) {
          expect(lessons[0].category).toBe(category);
        }
      }
    });
  });

  describe("getLessonById", () => {
    it("should return a lesson by ID", async () => {
      const lessons = await getBeginnerLessons("thai");
      if (lessons.length > 0) {
        const lesson = await getLessonById(lessons[0].id);
        expect(lesson).toBeDefined();
        expect(lesson?.id).toBe(lessons[0].id);
        expect(lesson?.title).toBe(lessons[0].title);
      }
    });

    it("should return null for non-existent lesson ID", async () => {
      const lesson = await getLessonById(99999);
      expect(lesson).toBeNull();
    });

    it("should have content field as JSON string", async () => {
      const lessons = await getBeginnerLessons("thai");
      if (lessons.length > 0) {
        const lesson = await getLessonById(lessons[0].id);
        if (lesson?.content) {
          expect(typeof lesson.content).toBe("string");
          // Should be valid JSON
          expect(() => JSON.parse(lesson.content)).not.toThrow();
        }
      }
    });
  });

  describe("User Lesson Progress", () => {
    it("should get user lesson progress", async () => {
      const lessons = await getBeginnerLessons("thai");
      if (lessons.length > 0) {
        const lessonId = lessons[0].id;
        const userId = parseInt(testUserId) || 123; // Convert to number
        const progress = await getUserLessonProgress(userId, lessonId);
        // Should return null or a progress object
        expect(progress === null || typeof progress === "object").toBe(true);
      }
    });

    it("should mark lesson as completed", async () => {
      const lessons = await getBeginnerLessons("thai");
      if (lessons.length > 0) {
        const lessonId = lessons[0].id;
        const userId = parseInt(testUserId) || 123;
        const result = await markLessonCompleted(userId, lessonId);
        expect(result).toBe(true);

        // Verify it was marked completed
        const progress = await getUserLessonProgress(userId, lessonId);
        expect(progress).toBeDefined();
        expect(progress?.isCompleted).toBe(1);
        expect(progress?.completedAt).toBeDefined();
      }
    });

    it("should not duplicate lesson completion", async () => {
      const lessons = await getBeginnerLessons("thai");
      if (lessons.length > 0) {
        const lessonId = lessons[0].id;
        const userId = parseInt(testUserId) || 123;
        // First completion
        await markLessonCompleted(userId, lessonId);
        const firstProgress = await getUserLessonProgress(userId, lessonId);

        // Second completion (should update, not duplicate)
        await markLessonCompleted(userId, lessonId);
        const secondProgress = await getUserLessonProgress(userId, lessonId);

        expect(firstProgress?.id).toBe(secondProgress?.id);
        expect(secondProgress?.isCompleted).toBe(1);
      }
    });

    it("should get all user progress", async () => {
      const lessons = await getBeginnerLessons("thai");
      if (lessons.length >= 2) {
        const userId = parseInt(testUserId) || 123;
        // Mark two lessons as completed
        await markLessonCompleted(userId, lessons[0].id);
        await markLessonCompleted(userId, lessons[1].id);

        const allProgress = await getUserAllLessonProgress(userId);
        expect(Array.isArray(allProgress)).toBe(true);
        expect(allProgress.length).toBeGreaterThanOrEqual(2);

        // Check that both lessons are in the progress
        const completedIds = allProgress.map((p) => p.lessonId);
        expect(completedIds).toContain(lessons[0].id);
        expect(completedIds).toContain(lessons[1].id);
      }
    });
  });

  describe("Email Subscriptions", () => {
    it("should subscribe user to email", async () => {
      const userId = parseInt(testUserId) || 123;
      const result = await subscribeToEmail(testEmail, "thai", "weekly_phrases", userId);
      expect(result).toBe(true);

      // Verify subscription was created
      const subscriptions = await getActiveEmailSubscriptions();
      const found = subscriptions.find((s) => s.email === testEmail);
      expect(found).toBeDefined();
      expect(found?.language).toBe("thai");
      expect(found?.subscriptionType).toBe("weekly_phrases");
      expect(found?.isActive).toBe(1);
    });

    it("should handle subscription without userId", async () => {
      const testEmail2 = "test2@example.com";
      const result = await subscribeToEmail(testEmail2, "lao", "daily_tips");
      expect(result).toBe(true);

      const subscriptions = await getActiveEmailSubscriptions();
      const found = subscriptions.find((s) => s.email === testEmail2);
      expect(found).toBeDefined();
      expect(found?.language).toBe("lao");
    });

    it("should reactivate unsubscribed email", async () => {
      const testEmail3 = "test3@example.com";
      // Subscribe
      await subscribeToEmail(testEmail3, "thai", "weekly_phrases");

      // Unsubscribe
      await unsubscribeFromEmail(testEmail3);
      let subscriptions = await getActiveEmailSubscriptions();
      let found = subscriptions.find((s) => s.email === testEmail3);
      expect(found).toBeUndefined(); // Should not be in active subscriptions

      // Resubscribe
      await subscribeToEmail(testEmail3, "thai", "all");
      subscriptions = await getActiveEmailSubscriptions();
      found = subscriptions.find((s) => s.email === testEmail3);
      expect(found).toBeDefined();
      expect(found?.isActive).toBe(1);
    });

    it("should unsubscribe from email", async () => {
      const testEmail4 = "test4@example.com";
      // Subscribe
      await subscribeToEmail(testEmail4, "thai", "weekly_phrases");

      // Unsubscribe
      const result = await unsubscribeFromEmail(testEmail4);
      expect(result).toBe(true);

      // Verify unsubscription
      const subscriptions = await getActiveEmailSubscriptions();
      const found = subscriptions.find((s) => s.email === testEmail4);
      expect(found).toBeUndefined();
    });

    it("should get all active email subscriptions", async () => {
      // Subscribe multiple emails
      await subscribeToEmail("active1@example.com", "thai", "weekly_phrases");
      await subscribeToEmail("active2@example.com", "lao", "daily_tips");

      const subscriptions = await getActiveEmailSubscriptions();
      expect(Array.isArray(subscriptions)).toBe(true);
      expect(subscriptions.length).toBeGreaterThan(0);

      // All should have isActive = 1
      subscriptions.forEach((sub) => {
        expect(sub.isActive).toBe(1);
      });
    });

    it("should have correct subscription type options", async () => {
      const types = ["weekly_phrases", "daily_tips", "all"] as const;
      for (const type of types) {
        const testEmail5 = `test-${type}@example.com`;
        const result = await subscribeToEmail(testEmail5, "thai", type);
        expect(result).toBe(true);

        const subscriptions = await getActiveEmailSubscriptions();
        const found = subscriptions.find((s) => s.email === testEmail5);
        expect(found?.subscriptionType).toBe(type);
      }
    });

    it("should have correct language options", async () => {
      const languages = ["thai", "lao"] as const;
      for (const lang of languages) {
        const testEmail6 = `test-${lang}@example.com`;
        const result = await subscribeToEmail(testEmail6, lang, "weekly_phrases");
        expect(result).toBe(true);

        const subscriptions = await getActiveEmailSubscriptions();
        const found = subscriptions.find((s) => s.email === testEmail6);
        expect(found?.language).toBe(lang);
      }
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty lesson content gracefully", async () => {
      const lessons = await getBeginnerLessons("thai");
      if (lessons.length > 0) {
        const lesson = await getLessonById(lessons[0].id);
        // Should not throw even if content is empty
        if (lesson?.content) {
          expect(() => JSON.parse(lesson.content)).not.toThrow();
        }
      }
    });

    it("should handle concurrent lesson completions", async () => {
      const lessons = await getBeginnerLessons("thai");
      if (lessons.length >= 3) {
        const userId = parseInt(testUserId) || 123;
        // Mark multiple lessons concurrently
        const promises = [
          markLessonCompleted(userId, lessons[0].id),
          markLessonCompleted(userId, lessons[1].id),
          markLessonCompleted(userId, lessons[2].id),
        ];

        const results = await Promise.all(promises);
        results.forEach((result) => {
          expect(result).toBe(true);
        });

        // Verify all were marked
        const allProgress = await getUserAllLessonProgress(userId);
        expect(allProgress.length).toBeGreaterThanOrEqual(3);
      }
    });

    it("should handle invalid language gracefully", async () => {
      const lessons = await getBeginnerLessons("invalid" as any);
      expect(Array.isArray(lessons)).toBe(true);
      expect(lessons.length).toBe(0);
    });

    it("should handle null/undefined parameters gracefully", async () => {
      // These should not throw
      const progress = await getUserLessonProgress(0, 0);
      expect(progress === null || progress === undefined).toBe(true);
    });
  });
});
