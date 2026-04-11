import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc.js";
import { scorePronunciation, scorePronunciationBatch } from "./pronunciation-scoring.js";

export const pronunciationScoringRouter = router({
  /**
   * Score a single pronunciation
   */
  scorePronunciation: protectedProcedure
    .input(
      z.object({
        audioUrl: z.string().url(),
        expectedText: z.string(),
        language: z.enum(["thai", "lao"]).default("thai"),
      })
    )
    .mutation(async ({ input }) => {
      const result = await scorePronunciation(
        input.audioUrl,
        input.expectedText,
        input.language
      );
      return result;
    }),

  /**
   * Score multiple pronunciations in batch
   */
  scoreBatch: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            audioUrl: z.string().url(),
            expectedText: z.string(),
            language: z.enum(["thai", "lao"]).optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const results = await scorePronunciationBatch(input.items);
      return results;
    }),
});
