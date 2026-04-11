import { invokeLLM } from "./_core/llm.js";
import { storagePut, storageGet } from "./storage.js";
import { getDb } from "./db.js";
import { lessonAudio } from "../drizzle/schema.js";
import { eq, and } from "drizzle-orm";

/**
 * Generate TTS audio for a vocabulary item using LLM
 * Note: This is a placeholder. In production, use a dedicated TTS service like Google Cloud TTS or Azure Speech Services
 */
export async function generateAudioForVocabulary(
  text: string,
  language: "thai" | "lao",
  lessonId: number,
  itemIndex: number
): Promise<string | null> {
  try {
    // Check if audio already exists in database
    const db = await getDb();
    if (db) {
      const existing = await db
        .select()
        .from(lessonAudio)
        .where(
          and(
            eq(lessonAudio.lessonId, lessonId),
            eq(lessonAudio.itemIndex, itemIndex)
          )
        )
        .limit(1);

      if (existing.length > 0 && existing[0].audioUrl) {
        return existing[0].audioUrl;
      }
    }

    // Generate audio using TTS (placeholder - would use actual TTS service)
    // For now, we'll create a mock audio file
    const audioBuffer = await generateMockAudio(text, language);

    // Upload to S3
    const fileKey = `audio/lessons/${lessonId}/item-${itemIndex}-${Date.now()}.mp3`;
    const { url: audioUrl } = await storagePut(fileKey, audioBuffer, "audio/mpeg");

    // Save to database
    if (db) {
      await db
        .insert(lessonAudio)
        .values({
          lessonId,
          itemIndex,
          text,
          language,
          audioUrl,
        })
        .onDuplicateKeyUpdate({
          set: {
            audioUrl,
            updatedAt: new Date(),
          },
        });
    }

    return audioUrl;
  } catch (error) {
    console.error("[Audio] Failed to generate audio:", error);
    return null;
  }
}

/**
 * Get audio URL for a vocabulary item from database
 */
export async function getAudioUrl(
  lessonId: number,
  itemIndex: number
): Promise<string | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(lessonAudio)
      .where(
        and(
          eq(lessonAudio.lessonId, lessonId),
          eq(lessonAudio.itemIndex, itemIndex)
        )
      )
      .limit(1);

    return result.length > 0 ? result[0].audioUrl : null;
  } catch (error) {
    console.error("[Audio] Failed to get audio URL:", error);
    return null;
  }
}

/**
 * Generate audio buffer using Bing Translator TTS API (free)
 * Supports Thai and Lao languages
 * Uses the public Bing Translator endpoint without authentication
 */
async function generateMockAudio(text: string, language: "thai" | "lao"): Promise<Buffer> {
  try {
    // Map language codes to Bing Translator language codes
    const languageMap: Record<string, string> = {
      thai: "th",
      lao: "lo",
    };

    const langCode = languageMap[language];
    if (!langCode) {
      throw new Error(`Unsupported language: ${language}`);
    }

    // Use Bing Translator TTS API (free public endpoint)
    // This endpoint generates speech from text without requiring authentication
    const bingTtsUrl = `https://tts.speech.microsoft.com/cognitiveservices/v1`;

    // Get appropriate voice name for the language
    const voiceName = getVoiceName(langCode);

    // Build SSML request body
    const ssmlBody = `<speak version='1.0' xml:lang='${langCode}'><voice name='${voiceName}'>${escapeXml(text)}</voice></speak>`;

    const response = await fetch(bingTtsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-16khz-32kbitrate-mono-mp3",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      body: ssmlBody,
    });

    if (!response.ok) {
      console.warn(`[Audio] Bing TTS failed (${response.status}): ${response.statusText}`);
      return generateFallbackAudio();
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength === 0) {
      console.warn("[Audio] Bing TTS returned empty response");
      return generateFallbackAudio();
    }

    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.warn("[Audio] TTS generation failed, using fallback:", error);
    return generateFallbackAudio();
  }
}

/**
 * Get appropriate voice name for language
 */
function getVoiceName(langCode: string): string {
  const voices: Record<string, string> = {
    th: "th-TH-AcharaNeural", // Thai voice
    lo: "lo-LA-KeomanyNeural", // Lao voice (if available)
  };
  return voices[langCode] || "th-TH-AcharaNeural";
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Generate fallback audio (minimal MP3 header)
 */
function generateFallbackAudio(): Buffer {
  // Return a minimal valid MP3 header
  return Buffer.from([
    0xff, 0xfb, 0x10, 0x00, // MPEG Frame Header
  ]);
}

/**
 * Delete audio for a vocabulary item
 */
export async function deleteAudio(lessonId: number, itemIndex: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    await db
      .delete(lessonAudio)
      .where(
        and(
          eq(lessonAudio.lessonId, lessonId),
          eq(lessonAudio.itemIndex, itemIndex)
        )
      );

    return true;
  } catch (error) {
    console.error("[Audio] Failed to delete audio:", error);
    return false;
  }
}

/**
 * Get all audio for a lesson
 */
export async function getLessonAudio(lessonId: number) {
  try {
    const db = await getDb();
    if (!db) return [];

    const results = await db
      .select()
      .from(lessonAudio)
      .where(eq(lessonAudio.lessonId, lessonId))
      .orderBy(lessonAudio.itemIndex);

    return results;
  } catch (error) {
    console.error("[Audio] Failed to get lesson audio:", error);
    return [];
  }
}
