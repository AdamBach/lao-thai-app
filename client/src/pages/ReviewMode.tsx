"use client";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { RotateCcw, CheckCircle2, XCircle, Mic, AlertCircle, ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import BottomNav from "@/components/BottomNav";

interface ReviewItem {
  thai?: string;
  lao?: string;
  english?: string;
  romanization?: string;
  number?: number;
  day?: string;
  month?: string;
  time?: string;
  phrase?: string;
}

type Language = "lao" | "thai";
type Category = "hello" | "family" | "food" | "languages" | "family_counting" | "age_counting";

interface PronunciationScore {
  accuracy: number;
  feedback: string;
  isCorrect: boolean;
}

const categoryList: { value: Category; label: string; icon: string }[] = [
  { value: "hello", label: "Greetings", icon: "👋" },
  { value: "family", label: "Family", icon: "👨‍👩‍👧" },
  { value: "food", label: "Food", icon: "🍜" },
  { value: "languages", label: "Languages", icon: "💬" },
  { value: "family_counting", label: "Family & Numbers", icon: "🔢" },
  { value: "age_counting", label: "Age & Numbers", icon: "🎂" },
];

export default function ReviewMode() {
  const [, navigate] = useLocation();
  const [language, setLanguage] = useState<Language>("thai");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [pronunciationScores, setPronunciationScores] = useState<PronunciationScore[]>([]);
  const [showMicMode, setShowMicMode] = useState(false);
  const [isScoring, setIsScoring] = useState(false);

  const { isRecording, startRecording, stopRecording, recordingTime } = useAudioRecorder();
  const scorePronunciationMutation = trpc.pronunciationScoring.scorePronunciation.useMutation();

  const { data: categoryLessons } = trpc.beginnerLessons.getLessonsByCategory.useQuery(
    { language, category: (selectedCategory as any) || "hello" },
    { enabled: !!selectedCategory }
  );

  const startSessionMutation = trpc.review.startSession.useMutation();
  const completeSessionMutation = trpc.review.completeSession.useMutation();

  useEffect(() => {
    if (categoryLessons && categoryLessons.length > 0) {
      const lesson = categoryLessons[0];
      const items = lesson.content ? JSON.parse(lesson.content as any) : [];
      setReviewItems(items);
      setCurrentIndex(0);
      setCorrectAnswers(0);
      setPronunciationScores([]);
      if (lesson.id) {
        startSessionMutation.mutate(
          { lessonId: lesson.id, totalItems: items.length },
          { onSuccess: (session) => setSessionId((session as any)?.id || null) }
        );
      }
    }
  }, [categoryLessons, selectedCategory]);

  const handleNext = () => {
    if (currentIndex < reviewItems.length - 1) {
      setCurrentIndex(i => i + 1);
      setShowMicMode(false);
    } else {
      completeReview();
    }
  };

  const handleRecordPronunciation = async () => {
    if (isRecording) {
      const audioBlob = await stopRecording();
      if (audioBlob) {
        setIsScoring(true);
        const targetWord = currentItem?.thai || currentItem?.lao || currentItem?.english || "";
        scorePronunciationMutation.mutate(
          { audioUrl: URL.createObjectURL(audioBlob), expectedText: targetWord, language },
          {
            onSuccess: (result) => {
              const score: PronunciationScore = {
                accuracy: result.accuracy || 0,
                feedback: result.feedback || "Try again.",
                isCorrect: (result.accuracy || 0) >= 70,
              };
              setPronunciationScores(prev => [...prev, score]);
              if (score.isCorrect) setCorrectAnswers(c => c + 1);
              setIsScoring(false);
              setTimeout(handleNext, 2000);
            },
            onError: () => { setIsScoring(false); alert("Scoring failed. Please try again."); },
          }
        );
      }
    } else {
      startRecording();
    }
  };

  const completeReview = async () => {
    if (!sessionId) { setIsCompleted(true); return; }
    completeSessionMutation.mutate(
      { sessionId, correctAnswers, totalItems: reviewItems.length, duration: Math.floor((Date.now() - startTime) / 1000) },
      { onSuccess: () => setIsCompleted(true) }
    );
  };

  const currentItem = reviewItems[currentIndex];
  const progress = reviewItems.length > 0 ? ((currentIndex + 1) / reviewItems.length) * 100 : 0;
  const accuracy = reviewItems.length > 0 ? (correctAnswers / reviewItems.length) * 100 : 0;
  const currentScore = pronunciationScores[currentIndex];

  // Completed screen
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-5 pt-12 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center mb-5 blue-glow">
            <CheckCircle2 className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Review Complete!</h1>
          <p className="text-white/40 mb-8">Great work on your practice session.</p>

          <div className="w-full max-w-sm bg-card border border-white/8 rounded-2xl p-5 grid grid-cols-3 gap-4 text-center mb-6">
            <div>
              <div className="text-2xl font-bold text-white">{accuracy.toFixed(0)}%</div>
              <div className="text-white/40 text-xs mt-0.5">Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{correctAnswers}/{reviewItems.length}</div>
              <div className="text-white/40 text-xs mt-0.5">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{Math.floor((Date.now() - startTime) / 1000)}s</div>
              <div className="text-white/40 text-xs mt-0.5">Time</div>
            </div>
          </div>

          <div className="flex gap-3 w-full max-w-sm">
            <button
              onClick={() => navigate("/lessons")}
              className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 font-medium hover:bg-white/10 transition-all"
            >
              <ChevronLeft className="w-4 h-4 inline mr-1" /> Lessons
            </button>
            <button
              onClick={() => { setCurrentIndex(0); setCorrectAnswers(0); setIsCompleted(false); setPronunciationScores([]); setShowMicMode(false); }}
              className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-400 transition-all blue-glow"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Category selection
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-5 pt-12 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Review</h1>
            <p className="text-white/40 text-sm mt-0.5">Pick a category to review</p>
          </div>
          {/* Language toggle */}
          <div className="flex bg-card border border-white/8 rounded-xl overflow-hidden">
            <button
              onClick={() => setLanguage("thai")}
              className={`px-3 py-2 text-xs font-semibold transition-colors ${language === "thai" ? "bg-blue-500 text-white" : "text-white/40 hover:text-white/70"}`}
            >
              ไทย
            </button>
            <button
              onClick={() => setLanguage("lao")}
              className={`px-3 py-2 text-xs font-semibold transition-colors ${language === "lao" ? "bg-blue-500 text-white" : "text-white/40 hover:text-white/70"}`}
            >
              ລາວ
            </button>
          </div>
        </div>
        <div className="px-5 grid grid-cols-2 gap-3">
          {categoryList.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className="bg-card border border-white/8 rounded-2xl p-5 text-left hover:border-blue-500/40 hover:bg-blue-500/5 transition-all"
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="text-white font-semibold text-sm">{cat.label}</div>
              <div className="text-white/30 text-xs mt-0.5">Tap to review</div>
            </button>
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  // No items fallback
  if (!currentItem) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5 pb-24">
        <div className="text-center">
          <p className="text-white/40 mb-4">No items to review in this category.</p>
          <button onClick={() => setSelectedCategory(null)} className="py-3 px-6 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-400 transition-all">
            Choose Another
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Review card
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={() => setSelectedCategory(null)}
          className="flex items-center gap-1 text-white/40 hover:text-white/70 text-sm transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Categories
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/40 text-sm">{currentIndex + 1} / {reviewItems.length}</span>
          <span className="text-green-400 text-sm font-semibold">{correctAnswers} correct</span>
        </div>
        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Word card */}
      <div className="px-5 mb-4">
        <div className="bg-card border border-white/8 rounded-2xl p-8 text-center">
          <p className="text-white/30 text-sm mb-3">Pronounce this word</p>
          <div className="text-5xl font-bold text-white mb-3">
            {language === "thai" ? (currentItem.thai || currentItem.lao) : (currentItem.lao || currentItem.thai)}
          </div>
          {currentItem.romanization && (
            <div className="text-white/50 text-lg mb-1">{currentItem.romanization}</div>
          )}
          {currentItem.english && (
            <div className="text-blue-400 font-semibold mt-2">{currentItem.english}</div>
          )}
        </div>
      </div>

      {/* Mic mode */}
      {showMicMode ? (
        <div className="px-5 space-y-3">
          <div className="bg-card border border-white/8 rounded-2xl p-5 text-center space-y-4">
            <p className="text-white/60 text-sm">Tap the mic to record your pronunciation</p>

            {isRecording && (
              <div className="flex items-center justify-center gap-2 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                <div className="w-2.5 h-2.5 bg-red-400 rounded-full animate-pulse" />
                <span className="text-red-400 font-semibold text-sm">Recording... {recordingTime}s</span>
              </div>
            )}

            {isScoring && (
              <div className="flex items-center justify-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3">
                <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-blue-400 font-semibold text-sm">Analyzing pronunciation...</span>
              </div>
            )}

            {currentScore && !isScoring && (
              <div className={`rounded-xl p-4 ${currentScore.isCorrect ? "bg-green-400/10 border border-green-400/20" : "bg-orange-400/10 border border-orange-400/20"}`}>
                <div className={`text-3xl font-bold mb-1 ${currentScore.isCorrect ? "text-green-400" : "text-orange-400"}`}>
                  {currentScore.accuracy.toFixed(0)}%
                </div>
                <p className={`text-sm ${currentScore.isCorrect ? "text-green-400/80" : "text-orange-400/80"}`}>
                  {currentScore.feedback}
                </p>
              </div>
            )}

            <button
              onClick={handleRecordPronunciation}
              disabled={isScoring}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
                isRecording
                  ? "bg-red-500 text-white hover:bg-red-400"
                  : "bg-blue-500 text-white hover:bg-blue-400 blue-glow"
              }`}
            >
              <Mic className="w-5 h-5" />
              {isRecording ? "Stop Recording" : "Record"}
            </button>

            <div className="flex gap-3">
              <button onClick={() => setShowMicMode(false)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 transition-all text-sm">
                Back
              </button>
              {currentScore && (
                <button onClick={handleNext} className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-400 transition-all text-sm">
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="px-5 space-y-3">
          <button
            onClick={() => setShowMicMode(true)}
            className="w-full py-4 rounded-2xl bg-blue-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-400 transition-all blue-glow"
          >
            <Mic className="w-5 h-5" /> Record Pronunciation
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleNext()}
              className="py-3 rounded-xl bg-white/5 border border-white/10 text-white/50 font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
            >
              <XCircle className="w-4 h-4 text-red-400/60" /> Incorrect
            </button>
            <button
              onClick={() => { setCorrectAnswers(c => c + 1); handleNext(); }}
              className="py-3 rounded-xl bg-green-400/10 border border-green-400/20 text-green-400 font-medium flex items-center justify-center gap-2 hover:bg-green-400/15 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" /> Correct
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
