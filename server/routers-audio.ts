import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc.js";
import { generateAudioForVocabulary, getAudioUrl } from "./db-audio.js"; // eslint-disable-line @typescript-eslint/no-unused-vars

export const audioRouter = router({
  /**
   * Generate TTS audio for a vocabulary item
   */
  generateAudio: publicProcedure
    .input(
      z.object({
        text: z.string(),
        language: z.enum(["thai", "lao"]),
        lessonId: z.number(),
        itemIndex: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const audioUrl = await generateAudioForVocabulary(
          input.text,
          input.language,
          input.lessonId,
          input.itemIndex
        );
        return { success: true, audioUrl };
      } catch (error) {
        console.error("[Audio] Failed to generate audio:", error);
        return { success: false, audioUrl: null, error: String(error) };
      }
    }),

  /**
   * Get audio URL for a vocabulary item
   */
  getAudioUrl: publicProcedure
    .input(
      z.object({
        lessonId: z.number(),
        itemIndex: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const audioUrl = await getAudioUrl(input.lessonId, input.itemIndex);
        return { audioUrl };
      } catch (error) {
        console.error("[Audio] Failed to get audio URL:", error);
        return { audioUrl: null };
      }
    }),

  /**
   * Batch generate audio for all vocabulary items in a lesson
   */
  generateLessonAudio: publicProcedure
    .input(
      z.object({
        lessonId: z.number(),
        language: z.enum(["thai", "lao"]),
        items: z.array(
          z.object({
            text: z.string(),
            index: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const results = await Promise.all(
          input.items.map((item) =>
            generateAudioForVocabulary(
              item.text,
              input.language,
              input.lessonId,
              item.index
            ).catch((error) => {
              console.error(`[Audio] Failed to generate audio for item ${item.index}:`, error);
              return null;
            })
          )
        );

        const successCount = results.filter((url) => url !== null).length;
        return {
          success: true,
          successCount,
          totalCount: input.items.length,
          audioUrls: results,
        };
      } catch (error) {
        console.error("[Audio] Failed to generate lesson audio:", error);
        return {
          success: false,
          successCount: 0,
          totalCount: input.items.length,
          audioUrls: [],
          error: String(error),
        };
      }
    }),
});
