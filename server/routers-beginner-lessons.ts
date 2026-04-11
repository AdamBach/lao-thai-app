import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc.js";
import {
  getBeginnerLessons,
  getLessonsByCategory,
  getLessonById,
  getUserLessonProgress,
  markLessonCompleted,
  getUserAllLessonProgress,
  subscribeToEmail,
  unsubscribeFromEmail,
} from "./db-beginner-lessons.js";

export const beginnerLessonsRouter = router({
  /**
   * Get all beginner lessons for a language
   */
  getLessons: publicProcedure
    .input(z.object({ language: z.enum(["lao", "thai"]) }))
    .query(async ({ input }) => {
      const lessons = await getBeginnerLessons(input.language);
      return lessons || [];
    }),

  /**
   * Get lessons by category
   */
  getLessonsByCategory: publicProcedure
    .input(
      z.object({
        language: z.enum(["lao", "thai"]),
        category: z.enum(["numbers", "days", "months", "time", "phrases", "hello", "family", "food", "languages", "family_counting", "age_counting"]),
      })
    )
    .query(async ({ input }) => {
      const lessons = await getLessonsByCategory(input.language, input.category);
      return lessons || [];
    }),

  /**
   * Get single lesson by ID
   */
  getLesson: publicProcedure
    .input(z.object({ lessonId: z.number() }))
    .query(async ({ input }) => {
      const lesson = await getLessonById(input.lessonId);
      return lesson || null;
    }),

  /**
   * Get user lesson progress (protected)
   */
  getUserProgress: protectedProcedure
    .input(z.object({ lessonId: z.number() }))
    .query(async ({ ctx, input }) => {
      const progress = await getUserLessonProgress(ctx.user.id, input.lessonId);
      return progress || { isCompleted: 0, completedAt: null };
    }),

  /**
   * Get all user lesson progress (protected)
   */
  getAllUserProgress: protectedProcedure.query(async ({ ctx }) => {
    const progress = await getUserAllLessonProgress(ctx.user.id);
    return progress || [];
  }),

  /**
   * Mark lesson as completed (protected)
   */
  markLessonCompleted: protectedProcedure
    .input(z.object({ lessonId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const success = await markLessonCompleted(ctx.user.id, input.lessonId);
      return { success };
    }),

  /**
   * Subscribe to email
   */
  subscribeToEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        language: z.enum(["lao", "thai"]).optional().default("thai"),
        subscriptionType: z
          .enum(["weekly_phrases", "daily_tips", "all"])
          .optional()
          .default("weekly_phrases"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user?.id;
      const success = await subscribeToEmail(
        input.email,
        input.language,
        input.subscriptionType,
        userId
      );
      return { success };
    }),

  /**
   * Unsubscribe from email
   */
  unsubscribeFromEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const success = await unsubscribeFromEmail(input.email);
      return { success };
    }),
});
