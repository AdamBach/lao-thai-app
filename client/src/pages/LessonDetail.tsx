"use client";
import { useState, useMemo } from "react";
import { useParams, useSearch, useLocation } from "wouter";
import { skipToken } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, ChevronRight, X, CheckCircle, Volume2, BookOpen, Zap } from "lucide-react";
import BottomNav from "@/components/BottomNav";

type Language = "thai" | "lao";

interface VocabItem {
  id: number;
  thai?: string;
  lao?: string;
  english?: string;
  romanization?: string;
  tonePattern?: string;
  number?: number;
  phrase?: string;
}

const categoryColors: Record<string, string> = {
  hello:           "bg-blue-500/20 border-blue-500/40 text-blue-400",
  family:          "bg-purple-500/20 border-purple-500/40 text-purple-400",
  food:            "bg-orange-500/20 border-orange-500/40 text-orange-400",
  languages:       "bg-green-500/20 border-green-500/40 text-green-400",
  family_counting: "bg-pink-500/20 border-pink-500/40 text-pink-400",
  age_counting:    "bg-yellow-500/20 border-yellow-500/40 text-yellow-400",
  numbers:         "bg-cyan-500/20 border-cyan-500/40 text-cyan-400",
  days:            "bg-indigo-500/20 border-indigo-500/40 text-indigo-400",
  months:          "bg-teal-500/20 border-teal-500/40 text-teal-400",
  time:            "bg-rose-500/20 border-rose-500/40 text-rose-400",
  phrases:         "bg-blue-500/20 border-blue-500/40 text-blue-400",
};

const categoryIcons: Record<string, string> = {
  hello: "👋", family: "👨‍👩‍👧", food: "🍜", languages: "💬",
  family_counting: "🔢", age_counting: "🎂", numbers: "🔢",
  days: "📅", months: "🗓️", time: "⏰", phrases: "💭",
};

export default function LessonDetail() {
  const params = useParams<{ id: string }>();
  const search = useSearch();
  const [, navigate] = useLocation();

  // Parse language from query string
  const lang: Language = search.includes("lang=lao") ? "lao" : "thai";
  const lessonId = parseInt(params.id || "0");

  const [activeWord, setActiveWord] = useState<VocabItem | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [completedWords, setCompletedWords] = useState<Set<number>>(new Set());

  // Fetch lesson
  const { data: lesson, isLoading } = trpc.beginnerLessons.getLesson.useQuery(
    lessonId ? { lessonId } : skipToken,
    { enabled: !!lessonId }
  );

  // Fetch audio for active word
  const { data: audioData } = trpc.audio.getAudioUrl.useQuery(
    activeWord && lessonId
      ? { lessonId, itemIndex: activeWord.id }
      : skipToken,
    { enabled: !!activeWord }
  );

  const markCompleted = trpc.beginnerLessons.markLessonCompleted.useMutation();

  // Parse vocabulary items
  const vocabItems = useMemo<VocabItem[]>(() => {
    if (!lesson?.content) return [];
    try {
      return JSON.parse(lesson.content as string).map((item: any, i: number) => ({
        id: i, ...item,
      }));
    } catch { return []; }
  }, [lesson]);

  const displayWord = (item: VocabItem) =>
    lang === "thai" ? (item.thai || item.lao || item.phrase || `${item.number}`) :
                      (item.lao  || item.thai || item.phrase || `${item.number}`);

  const openWord = (item: VocabItem, index: number) => {
    setActiveWord(item);
    setActiveIndex(index);
  };

  const closeWord = () => setActiveWord(null);

  const goPrev = () => {
    const prev = Math.max(0, activeIndex - 1);
    setActiveIndex(prev);
    setActiveWord(vocabItems[prev]);
  };

  const goNext = () => {
    const next = Math.min(vocabItems.length - 1, activeIndex + 1);
    setActiveIndex(next);
    setActiveWord(vocabItems[next]);
  };

  const markWordDone = () => {
    setCompletedWords(prev => new Set(prev).add(activeIndex));
    if (activeIndex < vocabItems.length - 1) goNext();
    else closeWord();
  };

  const handleCompleteLesson = async () => {
    try {
      await markCompleted.mutateAsync({ lessonId });
      navigate(`/lessons?lang=${lang}`);
    } catch (e) { console.error(e); }
  };

  const colorClass = categoryColors[lesson?.category || "hello"] || categoryColors.hello;
  const icon = categoryIcons[lesson?.category || "hello"] || "📖";
  const completedCount = completedWords.size;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white/40">Loading lesson...</div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <div className="text-center">
          <p className="text-white/40 mb-4">Lesson not found.</p>
          <button onClick={() => navigate("/lessons")} className="py-3 px-6 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-400 transition-all">
            Back to Lessons
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(`/lessons?lang=${lang}`)}
          className="w-9 h-9 rounded-xl bg-white/8 border border-white/8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/12 transition-all flex-shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{lesson.title}</h1>
          <p className="text-white/40 text-xs mt-0.5">{lang === "thai" ? "ไทย Thai" : "ລາວ Lao"} · {vocabItems.length} words</p>
        </div>
        {/* Category pill */}
        <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${colorClass}`}>
          {icon} {lesson.category}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-white/30 text-xs">{completedCount} / {vocabItems.length} reviewed</span>
          <span className="text-blue-400 text-xs font-semibold">{vocabItems.length > 0 ? Math.round((completedCount / vocabItems.length) * 100) : 0}%</span>
        </div>
        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: vocabItems.length > 0 ? `${(completedCount / vocabItems.length) * 100}%` : "0%" }} />
        </div>
      </div>

      {/* Vocabulary list */}
      <div className="px-5 mb-4">
        <p className="text-white/40 text-xs uppercase tracking-wider mb-3 font-medium">Vocabulary</p>
        <div className="space-y-2">
          {vocabItems.map((item, index) => {
            const word = displayWord(item);
            const isDone = completedWords.has(index);
            return (
              <button
                key={item.id}
                onClick={() => openWord(item, index)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left active:scale-98 ${
                  isDone
                    ? "bg-blue-500/8 border-blue-500/25"
                    : "bg-card border-white/8 hover:border-white/20 hover:bg-white/3"
                }`}
              >
                {/* Icon square */}
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 text-lg ${colorClass}`}>
                  {icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-white/40 text-xs font-medium">Word {index + 1}</span>
                    {isDone && <CheckCircle className="w-3 h-3 text-blue-400" />}
                  </div>
                  <div className="text-white font-bold text-base truncate">{word}</div>
                  <div className="text-white/40 text-xs truncate">
                    {item.romanization && <span>{item.romanization}</span>}
                    {item.romanization && item.english && <span> · </span>}
                    {item.english && <span>{item.english}</span>}
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-white/25 flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="px-5 mb-4">
        <div className="bg-blue-500/8 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-xl flex-shrink-0">💡</span>
          <div>
            <p className="text-blue-400 font-semibold text-sm mb-0.5">Pronunciation tip</p>
            <p className="text-white/50 text-sm">
              {lang === "thai"
                ? "Thai has 5 tones: mid, low, falling, high, rising. Listen carefully to each word's tone pattern!"
                : "Lao has 6 tones. Practice each word slowly before speeding up. Romanization shows approximate pronunciation."}
            </p>
          </div>
        </div>
      </div>

      {/* Practice section */}
      <div className="px-5 mb-4">
        <p className="text-white/40 text-xs uppercase tracking-wider mb-3 font-medium">Practice Mode</p>
        <div className="space-y-2">
          <button
            onClick={() => navigate(`/practice`)}
            className="w-full flex items-center gap-4 p-4 bg-card border border-white/8 rounded-2xl hover:border-blue-500/30 hover:bg-blue-500/5 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-white font-semibold text-sm">Flashcards</div>
              <div className="text-white/40 text-xs">Flip cards — test your memory</div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/25" />
          </button>

          <button
            onClick={() => navigate(`/challenges`)}
            className="w-full flex items-center gap-4 p-4 bg-card border border-white/8 rounded-2xl hover:border-yellow-400/30 hover:bg-yellow-400/5 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-white font-semibold text-sm">Quiz Challenge</div>
              <div className="text-white/40 text-xs">Multiple choice — earn XP</div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/25" />
          </button>
        </div>
      </div>

      {/* Complete lesson button */}
      <div className="px-5">
        <button
          onClick={handleCompleteLesson}
          className="w-full py-4 rounded-2xl bg-blue-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-400 transition-all blue-glow"
        >
          <CheckCircle className="w-5 h-5" /> Mark Lesson Complete
        </button>
      </div>

      {/* Word detail bottom sheet */}
      {activeWord && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeWord(); }}
        >
          <div className="w-full max-w-lg bg-card rounded-t-3xl border-t border-white/10 pb-10">
            {/* Sheet header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4">
              <span className="text-white/40 text-sm">Word {activeIndex + 1} / {vocabItems.length}</span>
              <button onClick={closeWord} className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="px-6 mb-6">
              <div className="h-1 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${((activeIndex + 1) / vocabItems.length) * 100}%` }} />
              </div>
            </div>

            {/* Word content */}
            <div className="px-6 text-center mb-6">
              <p className="text-white/25 text-xs uppercase tracking-widest mb-4">
                {lang === "thai" ? "Thai" : "Lao"}
              </p>
              <div className="text-6xl font-bold text-white mb-3 leading-tight">
                {displayWord(activeWord)}
              </div>
              {activeWord.romanization && (
                <div className="text-blue-400 text-xl mb-2">{activeWord.romanization}</div>
              )}
              {activeWord.english && (
                <div className="text-white/60 text-lg font-medium">{activeWord.english}</div>
              )}
              {activeWord.tonePattern && (
                <div className="mt-3 inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
                  <span className="text-white/30 text-xs">Tone:</span>
                  <span className="text-blue-400 text-sm font-semibold">{activeWord.tonePattern}</span>
                </div>
              )}
              <button
                onClick={() => {
                  if (audioData?.audioUrl) {
                    new Audio(audioData.audioUrl).play().catch(() => {});
                  } else {
                    // Web Speech API fallback — works well for Thai, adequate for Lao
                    const text = displayWord(activeWord);
                    if (!text || !window.speechSynthesis) return;
                    window.speechSynthesis.cancel();
                    const utt = new SpeechSynthesisUtterance(text);
                    utt.lang = lang === "thai" ? "th-TH" : "lo-LA";
                    utt.rate = 0.8;
                    window.speechSynthesis.speak(utt);
                  }
                }}
                className="mt-4 flex items-center gap-2 mx-auto bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white/50 hover:text-white hover:bg-white/10 transition-all text-sm"
              >
                <Volume2 className="w-4 h-4" /> Listen
              </button>
            </div>

            {/* Navigation */}
            <div className="px-6 flex items-center gap-3">
              <button
                onClick={goPrev}
                disabled={activeIndex === 0}
                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 disabled:opacity-25 hover:bg-white/10 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={markWordDone}
                className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-400 transition-all blue-glow"
              >
                <CheckCircle className="w-4 h-4" />
                {activeIndex === vocabItems.length - 1 ? "Finish" : "Got it →"}
              </button>
              <button
                onClick={goNext}
                disabled={activeIndex === vocabItems.length - 1}
                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 disabled:opacity-25 hover:bg-white/10 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
