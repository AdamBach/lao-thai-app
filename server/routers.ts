import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getPronunciationExercises,
  getPronunciationExerciseById,
  createPronunciationRecord,
  getUserPronunciationRecords,
  getUserStatistics,
  upsertUserStatistics,
  getTodayChallenge,
  getUserChallengeProgress,
  updateChallengeProgress,
} from "./db";
import { transcribeAudio } from "./_core/voiceTranscription";
import { storagePut } from "./storage";
import { leaderboardRouter } from "./routers-leaderboard";
import { cuTflRouter } from "./routers-cu-tfl";
import { beginnerLessonsRouter } from "./routers-beginner-lessons";
import { reviewRouter } from "./routers-review";
import { pronunciationScoringRouter } from "./routers-pronunciation-scoring";
import { audioRouter } from "./routers-audio";

/**
 * Calculate accuracy score by comparing transcribed text with expected text
 */
function calculateAccuracy(transcribed: string, expected: string): number {
  const transcribedWords = transcribed.toLowerCase().trim().split(/\s+/);
  const expectedWords = expected.toLowerCase().trim().split(/\s+/);

  if (expectedWords.length === 0) return 0;

  let matches = 0;
  for (let i = 0; i < Math.min(transcribedWords.length, expectedWords.length); i++) {
    if (transcribedWords[i] === expectedWords[i]) {
      matches++;
    }
  }

  return Math.round((matches / expectedWords.length) * 100);
}

/**
 * Generate AI feedback based on accuracy and transcribed text
 */
function generateFeedback(accuracy: number, transcribed: string, expected: string): string {
  if (accuracy >= 90) {
    return "Excellent pronunciation! Your accent is very close to the native speaker.";
  } else if (accuracy >= 70) {
    return "Good effort! Your pronunciation is understandable. Try to match the tone more closely.";
  } else if (accuracy >= 50) {
    return "You're on the right track. Pay attention to the tone pattern and try again.";
  } else {
    return "Keep practicing! Listen to the reference audio and try to match the pronunciation more carefully.";
  }
}

/**
 * Simulate pitch data extraction from audio
 * In production, this would use Web Audio API or a specialized audio analysis library
 */
function extractPitchData(duration: number): any {
  return {
    duration,
    samples: Math.floor(duration / 50), // Sample every 50ms
    averagePitch: 150 + Math.random() * 100, // Simulated pitch in Hz
    pitchVariation: Math.random() * 50,
  };
}

export const appRouter = router({
  system: systemRouter,
  beginnerLessons: beginnerLessonsRouter,
  review: reviewRouter,
  pronunciationScoring: pronunciationScoringRouter,
  audio: audioRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  /**
   * Pronunciation exercises router
   */
  pronunciation: router({
    /**
     * Get pronunciation exercises by language and optional filters
     */
    getExercises: publicProcedure
      .input(
        z.object({
          language: z.enum(["lao", "thai"]),
          category: z.string().optional(),
          difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        })
      )
      .query(async ({ input }) => {
        return await getPronunciationExercises(
          input.language,
          input.category,
          input.difficulty
        );
      }),

    /**
     * Get a specific exercise by ID
     */
    getExerciseById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getPronunciationExerciseById(input.id);
      }),

    /**
     * Submit pronunciation recording and get feedback
     * Accepts base64 encoded audio data, uploads to S3, and returns S3 URL
     */
    submitRecording: protectedProcedure
      .input(
        z.object({
          exerciseId: z.number(),
          audioData: z.string(), // base64 encoded audio data
          duration: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user.id;

        // Get the exercise to compare against
        const exercise = await getPronunciationExerciseById(input.exerciseId);
        if (!exercise) {
          throw new Error("Exercise not found");
        }

        // Convert base64 to buffer and upload to S3
        let s3AudioUrl = "";
        try {
          // Remove data URL prefix if present (e.g., "data:audio/webm;base64,")
          const base64Data = input.audioData.includes(",") 
            ? input.audioData.split(",")[1] 
            : input.audioData;
          
          // Convert base64 to buffer
          const audioBuffer = Buffer.from(base64Data, "base64");
          
          // Upload to S3 with user ID in path to prevent enumeration
          const fileName = `pronunciations/${userId}/recording-${Date.now()}.webm`;
          const { url } = await storagePut(fileName, audioBuffer, "audio/webm");
          s3AudioUrl = url;
          
          console.log(`[S3 Upload] Successfully uploaded audio to: ${s3AudioUrl}`);
        } catch (error) {
          console.error("[S3 Upload] Failed to upload audio:", error);
          throw new Error("Failed to upload audio to storage");
        }

        // Transcribe the audio using Whisper API
        let transcribedText = "";
        try {
          const transcriptionResult = await transcribeAudio({
            audioUrl: s3AudioUrl, // Use S3 URL for transcription
            language: exercise.language === "lao" ? "lo" : "th",
          });
          if ('text' in transcriptionResult) {
            transcribedText = transcriptionResult.text;
          } else if ('error' in transcriptionResult) {
            console.error("Transcription error:", transcriptionResult.error);
          }
        } catch (error) {
          console.error("Transcription error:", error);
          transcribedText = "";
        }

        // Calculate accuracy score
        const accuracyScore = calculateAccuracy(transcribedText, exercise.word);

        // Generate feedback
        const feedback = generateFeedback(accuracyScore, transcribedText, exercise.word);

        // Extract pitch data
        const pitchData = extractPitchData(input.duration);

        // Save the record to database with S3 URL
        await createPronunciationRecord({
          userId,
          exerciseId: input.exerciseId,
          audioUrl: s3AudioUrl, // Store S3 URL instead of blob URL
          transcribedText,
          accuracyScore,
          feedback,
          pitchData,
          duration: input.duration,
        });

        // Update user statistics
        const stats = await getUserStatistics(userId);
        const newAttempts = (stats?.totalPronunciationAttempts || 0) + 1;
        const newAverage = stats?.averageAccuracy
          ? (Number(stats.averageAccuracy) * (newAttempts - 1) + accuracyScore) / newAttempts
          : accuracyScore;

        await upsertUserStatistics(userId, {
          totalPronunciationAttempts: newAttempts,
          averageAccuracy: Math.round(newAverage * 100) / 100,
        });

        return {
          accuracyScore,
          feedback,
          transcribedText,
          pitchData,
          audioUrl: s3AudioUrl, // Return S3 URL to client
        };
      }),

    /**
     * Get user's pronunciation records
     */
    getUserRecords: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input, ctx }) => {
        return await getUserPronunciationRecords(ctx.user.id, input.limit);
      }),

    /**
     * Get user statistics
     */
    getUserStats: protectedProcedure.query(async ({ ctx }) => {
      return await getUserStatistics(ctx.user.id);
    }),
  }),

  /**
   * Daily challenges router
   */
  challenges: router({
    /**
     * Get today's challenge
     */
    getTodayChallenge: publicProcedure.query(async () => {
      return await getTodayChallenge();
    }),

    /**
     * Get user's progress on a challenge
     */
    getUserProgress: protectedProcedure
      .input(z.object({ challengeId: z.number() }))
      .query(async ({ input, ctx }) => {
        return await getUserChallengeProgress(ctx.user.id, input.challengeId);
      }),

    /**
     * Update challenge progress
     */
    updateProgress: protectedProcedure
      .input(
        z.object({
          challengeId: z.number(),
          completed: z.number().optional(),
          isCompleted: z.number().optional(),
          xpEarned: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { challengeId, ...updates } = input;
        return await updateChallengeProgress(ctx.user.id, challengeId, updates);
      }),
   }),

  /**
   * Leaderboard router
   */
  leaderboard: leaderboardRouter,
  /**
   * CU-TFL level system router
   */
  cuTfl: cuTflRouter,
});
export type AppRouter = typeof appRouter;
