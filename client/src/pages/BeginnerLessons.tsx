"use client";
import { useState, useEffect } from "react";
import { skipToken } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Lock, CheckCircle, ChevronLeft, ChevronRight, X, Volume2 } from "lucide-react";
import { useLocation } from "wouter";
import BottomNav from "@/components/BottomNav";
import VocabularyCard from "@/components/VocabularyCard";

type Language = "thai" | "lao";

interface Lesson {
  id: number;
  language: Language;
  category: string;
  title: string;
  description: string | null;
  content: string;
  difficulty: string;
  order: number;
}

interface LessonProgress {
  lessonId: number;
  completed: boolean;
}

// Category icon map
const categoryIcons: Record<string, string> = {
  hello: "👋",
  family: "👨‍👩‍👧",
  food: "🍜",
  languages: "💬",
  family_counting: "🔢",
  age_counting: "🎂",
  numbers: "🔢",
  days: "📅",
  months: "🗓️",
  time: "⏰",
  phrases: "💭",
};

// Free lesson limit
const FREE_LESSON_LIMIT = 3;

export default function BeginnerLessons() {
  const [, navigate] = useLocation();
  const [language, setLanguage] = useState<Language>("thai");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Record<number, LessonProgress>>({});
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const { data: lessonsData, isLoading } = trpc.beginnerLessons.getLessons.useQuery({ language });
  const { data: progressData } = trpc.beginnerLessons.getAllUserProgress.useQuery();
  const markCompleted = trpc.beginnerLessons.markLessonCompleted.useMutation({});

  const { data: audioData } = trpc.audio.getAudioUrl.useQuery(
    activeLesson && currentCardIndex >= 0
      ? { lessonId: activeLesson.id, itemIndex: currentCardIndex }
      : skipToken,
    { enabled: !!activeLesson }
  );

  useEffect(() => {
    if (lessonsData) {
      setLessons([...lessonsData].sort((a, b) => a.order - b.order));
    }
  }, [lessonsData]);

  useEffect(() => {
    if (progressData && Array.isArray(progressData)) {
      const map: Record<number, LessonProgress> = {};
      progressData.forEach((p: any) => {
        map[p.lessonId] = { lessonId: p.lessonId, completed: p.isCompleted === 1 };
      });
      setProgress(map);
    }
  }, [progressData]);

  const completedCount = lessons.filter(l => progress[l.id]?.completed).length;

  const vocabularyItems = activeLesson
    ? JSON.parse(activeLesson.content).map((item: any, index: number) => ({ ...item, id: index }))
    : [];

  const handleOpenLesson = (lesson: Lesson, index: number) => {
    const isLocked = index > 0 && !progress[lessons[index - 1]?.id]?.completed;
    const isPremiumLocked = index >= FREE_LESSON_LIMIT;
    if (isLocked || isPremiumLocked) return;
    setActiveLesson(lesson);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const handleCompleteLesson = async () => {
    if (!activeLesson) return;
    try {
      await markCompleted.mutateAsync({ lessonId: activeLesson.id });
      setProgress(prev => ({
        ...prev,
        [activeLesson.id]: { lessonId: activeLesson.id, completed: true },
      }));
    } catch (e) {
      console.error(e);
    }
  };

  // Winding path: alternates left/right like ChineseSkill
  const getNodeAlignment = (index: number) => {
    // Pattern: left, right, left, right...
    return index % 2 === 0 ? "items-start" : "items-end";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white/40">Loading lessons...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Lessons</h1>
          <p className="text-white/40 text-sm mt-0.5">
            {completedCount}/{lessons.length} completed
          </p>
        </div>
        {/* Language toggle */}
        <div className="flex bg-card border border-white/8 rounded-xl overflow-hidden">
          <button
            onClick={() => { setLanguage("thai"); setActiveLesson(null); }}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              language === "thai"
                ? "bg-blue-500 text-white"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            ไทย Thai
          </button>
          <button
            onClick={() => { setLanguage("lao"); setActiveLesson(null); }}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              language === "lao"
                ? "bg-blue-500 text-white"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            ລາວ Lao
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 mb-6">
        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: lessons.length > 0 ? `${(completedCount / lessons.length) * 100}%` : "0%" }}
          />
        </div>
      </div>

      {/* Winding lesson path */}
      <div className="px-8 relative">
        {/* Vertical path line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
          style={{ background: "repeating-linear-gradient(to bottom, oklch(0.6 0.22 250 / 30%) 0px, oklch(0.6 0.22 250 / 30%) 8px, transparent 8px, transparent 16px)" }}
        />

        <div className="flex flex-col gap-0">
          {lessons.map((lesson, index) => {
            const isLocked = index > 0 && !progress[lessons[index - 1]?.id]?.completed;
            const isPremiumLocked = index >= FREE_LESSON_LIMIT;
            const isCompleted = progress[lesson.id]?.completed;
            const isActive = activeLesson?.id === lesson.id;
            const icon = categoryIcons[lesson.category] || "📖";
            const alignRight = index % 2 !== 0;

            return (
              <div key={lesson.id} className="relative flex flex-col" style={{ minHeight: 100 }}>
                {/* Node + label */}
                <div className={`flex ${alignRight ? "flex-row-reverse" : "flex-row"} items-center gap-4 relative z-10 py-4`}>
                  {/* Circle node */}
                  <button
                    onClick={() => handleOpenLesson(lesson, index)}
                    disabled={isLocked || isPremiumLocked}
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl flex-shrink-0 transition-all duration-200 border-2 ${
                      isCompleted
                        ? "bg-blue-500 border-blue-400 blue-glow"
                        : isLocked || isPremiumLocked
                          ? "bg-card border-white/10 opacity-50 cursor-not-allowed"
                          : "bg-card border-blue-500/40 hover:border-blue-400 hover:blue-glow cursor-pointer active:scale-95"
                    }`}
                  >
                    {isLocked ? (
                      <Lock className="w-6 h-6 text-white/30" />
                    ) : isPremiumLocked ? (
                      <span className="text-lg">🔒</span>
                    ) : isCompleted ? (
                      <span>{icon}</span>
                    ) : (
                      <span>{icon}</span>
                    )}
                  </button>

                  {/* Label */}
                  <div className={`flex-1 ${alignRight ? "text-right" : "text-left"}`}>
                    <div className={`text-sm font-semibold ${
                      isLocked || isPremiumLocked ? "text-white/25" : "text-white"
                    }`}>
                      {lesson.title}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                      {isCompleted && (
                        <span className="text-xs text-blue-400 font-medium">✓ Done</span>
                      )}
                      {isPremiumLocked && (
                        <span className="text-xs text-yellow-400/70 font-medium">Premium</span>
                      )}
                      {!isCompleted && !isLocked && !isPremiumLocked && (
                        <span className="text-xs text-white/30">{vocabularyItems.length || "—"} words</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* TEST OUT button at bottom */}
        {lessons.length > 0 && (
          <div className="mt-6 mb-4">
            <button
              onClick={() => navigate("/test")}
              className="w-full py-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold flex items-center justify-center gap-3 hover:bg-blue-500/20 transition-all"
            >
              <span className="text-xl">🔑</span>
              TEST OUT
            </button>
          </div>
        )}
      </div>

      {/* Lesson modal / drawer */}
      {activeLesson && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setActiveLesson(null); }}>
          <div className="w-full max-w-lg bg-card rounded-t-3xl border-t border-white/10 p-6 pb-8 max-h-[85vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">{activeLesson.title}</h2>
                <p className="text-white/40 text-sm">{activeLesson.description}</p>
              </div>
              <button onClick={() => setActiveLesson(null)}
                className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center text-white/50 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Card counter */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/40 text-sm">{currentCardIndex + 1} / {vocabularyItems.length}</span>
              <div className="h-1 flex-1 mx-3 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${((currentCardIndex + 1) / vocabularyItems.length) * 100}%` }} />
              </div>
            </div>

            {/* Vocabulary card */}
            {vocabularyItems.length > 0 && (
              <VocabularyCard
                item={vocabularyItems[currentCardIndex]}
                language={language}
                audioUrl={audioData?.audioUrl || undefined}
                lessonId={activeLesson.id}
                itemIndex={currentCardIndex}
              />
            )}

            {/* Card navigation */}
            <div className="flex items-center justify-between mt-5 gap-3">
              <button
                onClick={() => { setCurrentCardIndex(i => Math.max(0, i - 1)); setIsFlipped(false); }}
                disabled={currentCardIndex === 0}
                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 disabled:opacity-30 hover:bg-white/10 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {currentCardIndex === vocabularyItems.length - 1 ? (
                progress[activeLesson.id]?.completed ? (
                  <button className="flex-1 py-3 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 font-semibold flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Completed
                  </button>
                ) : (
                  <button
                    onClick={handleCompleteLesson}
                    className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-400 transition-all blue-glow"
                  >
                    <CheckCircle className="w-4 h-4" /> Complete Lesson
                  </button>
                )
              ) : (
                <button
                  onClick={() => { setCurrentCardIndex(i => i + 1); setIsFlipped(false); }}
                  className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-400 transition-all"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => { setCurrentCardIndex(i => Math.min(vocabularyItems.length - 1, i + 1)); setIsFlipped(false); }}
                disabled={currentCardIndex === vocabularyItems.length - 1}
                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 disabled:opacity-30 hover:bg-white/10 transition-all"
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
