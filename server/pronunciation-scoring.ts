import { transcribeAudio } from "./_core/voiceTranscription.js";

/**
 * Score pronunciation by comparing transcribed text with expected text
 * Uses Whisper API to transcribe user's audio and calculates accuracy
 */
export async function scorePronunciation(
  audioUrl: string,
  expectedText: string,
  language: "thai" | "lao" = "thai"
): Promise<{
  accuracy: number;
  transcribed: string;
  feedback: string;
  isCorrect: boolean;
}> {
  try {
    // Transcribe audio using Whisper API
    const result = await transcribeAudio({
      audioUrl,
      language: language === "thai" ? "th" : "lo",
      prompt: `Transcribe this ${language} word or phrase: ${expectedText}`,
    });

    if (!result || !('text' in result)) {
      return {
        accuracy: 0,
        transcribed: "",
        feedback: "음성 인식 실패. 다시 시도해주세요.",
        isCorrect: false,
      };
    }

    const transcribed = (result as any).text.trim().toLowerCase();
    const expected = expectedText.trim().toLowerCase();

    // Calculate accuracy by comparing words
    const accuracy = calculateAccuracy(transcribed, expected);
    const isCorrect = accuracy >= 70; // 70% 이상이면 정답

    return {
      accuracy,
      transcribed,
      feedback: generateFeedback(accuracy, transcribed, expected),
      isCorrect,
    };
  } catch (error) {
    console.error("[PronunciationScoring] Error:", error);
    return {
      accuracy: 0,
      transcribed: "",
      feedback: "발음 채점 중 오류가 발생했습니다.",
      isCorrect: false,
    };
  }
}

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
 * Generate feedback based on accuracy and transcribed text
 */
function generateFeedback(accuracy: number, transcribed: string, expected: string): string {
  if (accuracy >= 90) {
    return "완벽합니다! 발음이 정확합니다.";
  } else if (accuracy >= 70) {
    return "좋습니다! 발음이 거의 맞습니다. 조금 더 정확하게 발음해보세요.";
  } else if (accuracy >= 50) {
    return "괜찮습니다. 하지만 더 정확한 발음을 시도해보세요.";
  } else if (accuracy > 0) {
    return `발음을 다시 시도해보세요. 예상: "${expected}", 인식됨: "${transcribed}"`;
  } else {
    return "음성을 인식할 수 없습니다. 다시 시도해주세요.";
  }
}

/**
 * Batch score multiple pronunciations
 */
export async function scorePronunciationBatch(
  items: Array<{ audioUrl: string; expectedText: string; language?: "thai" | "lao" }>
): Promise<
  Array<{
    accuracy: number;
    transcribed: string;
    feedback: string;
    isCorrect: boolean;
  }>
> {
  const results = await Promise.all(
    items.map((item) =>
      scorePronunciation(item.audioUrl, item.expectedText, item.language || "thai")
    )
  );

  return results;
}
