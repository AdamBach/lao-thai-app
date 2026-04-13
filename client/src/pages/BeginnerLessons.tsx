"use client";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Lock, CheckCircle } from "lucide-react";
import { useLocation, useSearch } from "wouter";
import BottomNav from "@/components/BottomNav";

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

const FREE_LESSON_LIMIT = 3;

function getWordCount(content: string): number {
  try { return JSON.parse(content).length; } catch { return 0; }
}

export default function BeginnerLessons() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const initialLang: Language = search.includes("lang=lao") ? "lao" : "thai";
  const [language, setLanguage] = useState<Language>(initialLang);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Record<number, LessonProgress>>({});

  const { data: lessonsData, isLoading } = trpc.beginnerLessons.getLessons.useQuery({ language });
  const { data: progressData } = trpc.beginnerLessons.getAllUserProgress.useQuery();

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

  const handleOpenLesson = (lesson: Lesson, index: number) => {
    const isLocked = index > 0 && !progress[lessons[index - 1]?.id]?.completed;
    const isPremiumLocked = index >= FREE_LESSON_LIMIT;
    if (isLocked || isPremiumLocked) return;
    navigate(`/lesson/${lesson.id}?lang=${language}`);
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
            onClick={() => setLanguage("thai")}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              language === "thai" ? "bg-blue-500 text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            ไทย Thai
          </button>
          <button
            onClick={() => setLanguage("lao")}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              language === "lao" ? "bg-blue-500 text-white" : "text-white/40 hover:text-white/70"
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
        <div
          className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 pointer-events-none"
          style={{
            background: "repeating-linear-gradient(to bottom, oklch(0.6 0.22 250 / 30%) 0px, oklch(0.6 0.22 250 / 30%) 8px, transparent 8px, transparent 16px)"
          }}
        />

        <div className="flex flex-col gap-0">
          {lessons.map((lesson, index) => {
            const isLocked = index > 0 && !progress[lessons[index - 1]?.id]?.completed;
            const isPremiumLocked = index >= FREE_LESSON_LIMIT;
            const isCompleted = progress[lesson.id]?.completed;
            const alignRight = index % 2 !== 0;
            const icon = categoryIcons[lesson.category] || "📖";
            const wordCount = getWordCount(lesson.content);

            return (
              <div key={lesson.id} className="relative flex flex-col" style={{ minHeight: 110 }}>
                <div className={`flex ${alignRight ? "flex-row-reverse" : "flex-row"} items-center gap-4 relative z-10 py-4`}>

                  {/* Circle node */}
                  <button
                    onClick={() => handleOpenLesson(lesson, index)}
                    disabled={isLocked || isPremiumLocked}
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl flex-shrink-0 transition-all duration-200 relative ${
                      isCompleted
                        ? "bg-blue-500 border-2 border-blue-400 blue-glow"
                        : isLocked || isPremiumLocked
                          ? "bg-card border-2 border-white/10 opacity-50 cursor-not-allowed"
                          : "bg-card border-2 border-blue-500/50 hover:border-blue-400 hover:blue-glow cursor-pointer active:scale-95"
                    }`}
                  >
                    {isLocked ? (
                      <Lock className="w-6 h-6 text-white/30" />
                    ) : isPremiumLocked ? (
                      <span className="text-lg">🔒</span>
                    ) : (
                      <span>{icon}</span>
                    )}
                    {/* Completed badge */}
                    {isCompleted && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>

                  {/* Label */}
                  <div className={`flex-1 ${alignRight ? "text-right" : "text-left"}`}>
                    <div className={`text-sm font-bold ${isLocked || isPremiumLocked ? "text-white/25" : "text-white"}`}>
                      {lesson.title}
                    </div>

                    {/* Sub-info row */}
                    <div className={`flex items-center gap-1.5 mt-1 ${alignRight ? "justify-end" : "justify-start"}`}>
                      {isCompleted ? (
                        <>
                          <span className="text-xs text-green-400 font-semibold">{wordCount}/{wordCount}</span>
                          <span className="text-xs text-green-400/60">✓ Done</span>
                        </>
                      ) : isPremiumLocked ? (
                        <span className="text-xs text-yellow-400/70 font-semibold">🔒 Premium</span>
                      ) : isLocked ? (
                        <span className="text-xs text-white/25">Locked</span>
                      ) : (
                        <>
                          <span className="text-xs text-white/40">0/{wordCount}</span>
                        </>
                      )}
                    </div>

                    {/* Description */}
                    {lesson.description && !isLocked && !isPremiumLocked && (
                      <div className="text-white/25 text-xs mt-0.5 truncate max-w-[150px]">
                        {lesson.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* TEST OUT button */}
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

      <BottomNav />
    </div>
  );
}
