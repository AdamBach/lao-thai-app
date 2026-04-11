import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc.js";
import {
  createReviewSession,
  updateReviewSession,
  getUserReviewStats,
  getCompletedLessonsForReview,
  getReviewSession,
  getUserReviewSessions,
} from "./db-review.js";

export const reviewRouter = router({
  /**
   * Start a new review session
   */
  startSession: protectedProcedure
    .input(
      z.object({
        lessonId: z.number(),
        totalItems: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const session = await createReviewSession(ctx.user.id, input.lessonId, input.totalItems);
      return session;
    }),

  /**
   * Complete a review session with results
   */
  completeSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        correctAnswers: z.number(),
        totalItems: z.number(),
        duration: z.number(), // in seconds
      })
    )
    .mutation(async ({ ctx, input }) => {
      const session = await getReviewSession(input.sessionId);
      if (!session || session.userId !== ctx.user.id) {
        throw new Error("Session not found or unauthorized");
      }

      const updated = await updateReviewSession(
        input.sessionId,
        input.correctAnswers,
        input.totalItems,
        input.duration
      );
      return updated;
    }),

  /**
   * Get user's review statistics
   */
  getStats: protectedProcedure
    .input(
      z.object({
        lessonId: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const stats = await getUserReviewStats(ctx.user.id, input.lessonId);
      return stats;
    }),

  /**
   * Get completed lessons available for review
   */
  getCompletedLessons: protectedProcedure.query(async ({ ctx }) => {
    const lessons = await getCompletedLessonsForReview(ctx.user.id);
    return lessons;
  }),

  /**
   * Get a specific review session
   */
  getSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      const session = await getReviewSession(input.sessionId);
      if (!session || session.userId !== ctx.user.id) {
        throw new Error("Session not found or unauthorized");
      }
      return session;
    }),

  /**
   * Get user's review history
   */
  getHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const sessions = await getUserReviewSessions(ctx.user.id, input.limit);
      return sessions;
    }),
});
