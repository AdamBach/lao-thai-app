"use client";
import { useState, useEffect, useRef } from "react";
import { skipToken } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Lock, CheckCircle, BookOpen } from "lucide-react";
import { useLocation } from "wouter";
import BackButton from "@/components/BackButton";
import VocabularyCard from "@/components/VocabularyCard";

type Language = "thai" | "lao";
type Category = "hello" | "family" | "food" | "languages" | "family_counting" | "age_counting" | "numbers" | "days" | "months" | "time" | "phrases";

interface Lesson {
  id: number;
  language: Language;
  category: Category;
  title: string;
  description: string | null;
  content: string;
  difficulty: string;
  order: number;
  audioUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LessonProgress {
  lessonId: number;
  completed: boolean;
  accuracy: number;
  lastReviewed: Date;
}

export default function BeginnerLessons() {
  const [, navigate] = useLocation();
  const [language, setLanguage] = useState<Language>("thai");
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Record<number, LessonProgress>>({});
  const [isFlipped, setIsFlipped] = useState(false);
  const [audioUrls, setAudioUrls] = useState<Record<string, string | null>>({});

  // Fetch lessons
  const { data: lessonsData, isLoading: lessonsLoading } = trpc.beginnerLessons.getLessons.useQuery({
    language,
  });

  // Fetch user progress
  const { data: progressData } = trpc.beginnerLessons.getAllUserProgress.useQuery();

  // Mark lesson completed mutation
  const markCompleted = trpc.beginnerLessons.markLessonCompleted.useMutation({});

  useEffect(() => {
    if (lessonsData) {
      const sorted = [...lessonsData].sort((a, b) => a.order - b.order);
      setLessons(sorted);
      setCurrentLessonIndex(0);
      setCurrentCardIndex(0);
    }
  }, [lessonsData]);

  useEffect(() => {
    if (progressData) {
      const progressMap: Record<number, LessonProgress> = {};
      if (Array.isArray(progressData)) {
        progressData.forEach((p: any) => {
          progressMap[p.lessonId] = {
            lessonId: p.lessonId,
            completed: p.isCompleted === 1,
            accuracy: 0,
            lastReviewed: p.lastAccessedAt || new Date(),
          };
        });
      }
      setProgress(progressMap);
    }
  }, [progressData]);

  const currentLesson = lessons[currentLessonIndex];
  const currentLessonProgress = currentLesson ? progress[currentLesson.id] : null;
  const isLessonCompleted = currentLessonProgress?.completed || false;
  const isCurrentLessonLocked = currentLessonIndex > 0 && !progress[lessons[currentLessonIndex - 1]?.id]?.completed;

  const vocabularyItems = currentLesson
    ? JSON.parse(currentLesson.content).map((item: any, index: number) => ({
        ...item,
        id: index,
      }))
    : [];

  // Fetch audio URL for current vocabulary item
  const { data: audioData } = trpc.audio.getAudioUrl.useQuery(
    currentLesson && currentCardIndex < vocabularyItems.length
      ? {
          lessonId: currentLesson.id,
          itemIndex: currentCardIndex,
        }
      : skipToken,
    {
      enabled: !!currentLesson && currentCardIndex < vocabularyItems.length,
    }
  );

  const handleNextCard = () => {
    if (currentCardIndex < vocabularyItems.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setCurrentLessonIndex(0);
    setCurrentCardIndex(0);
  };

  const handleCompleteLesson = async () => {
    if (currentLesson) {
      try {
        await markCompleted.mutateAsync({
          lessonId: currentLesson.id,
        });
        setProgress((prev) => ({
          ...prev,
          [currentLesson.id]: {
            lessonId: currentLesson.id,
            completed: true,
            accuracy: 100,
            lastReviewed: new Date(),
          },
        }));
      } catch (error) {
        console.error("Failed to mark lesson as completed:", error);
      }
    }
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    } else if (currentLessonIndex === lessons.length - 1) {
      navigate("/test");
    }
  };

  const handlePrevLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    }
  };

  const progressPercentage = lessons.length > 0 ? ((currentLessonIndex + 1) / lessons.length) * 100 : 0;

  if (lessonsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
        <div className="text-slate-600">레슨을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        <BackButton />

        {/* Header */}
        <div className="mt-8 mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">초보자 학습</h1>
          <p className="text-slate-600">ChineseSkill 스타일 순차적 학습</p>
        </div>

        {/* Language Selector */}
        <div className="flex gap-3 mb-8">
          <Button
            variant={language === "thai" ? "default" : "outline"}
            onClick={() => handleLanguageChange("thai")}
            className="gap-2"
          >
            ไทย Thai
          </Button>
          <Button
            variant={language === "lao" ? "default" : "outline"}
            onClick={() => handleLanguageChange("lao")}
            className="gap-2"
          >
            ລາວ Lao
          </Button>
        </div>

        {/* Progress Bar */}
        <Card className="p-6 mb-8 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">전체 진행도</h3>
            <span className="text-sm text-slate-600">
              {currentLessonIndex + 1} / {lessons.length}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Lesson List */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-4">
              <h3 className="font-bold text-slate-900 mb-4">레슨</h3>
              <div className="space-y-2">
                {lessons.map((lesson, index) => {
                  const isLocked = index > 0 && !progress[lessons[index - 1]?.id]?.completed;
                  const isCompleted = progress[lesson.id]?.completed;
                  const isCurrent = index === currentLessonIndex;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => !isLocked && setCurrentLessonIndex(index)}
                      disabled={isLocked}
                      className={`w-full p-3 rounded-lg text-left transition-all ${
                        isCurrent
                          ? "bg-blue-500 text-white shadow-lg"
                          : isLocked
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : isCompleted
                              ? "bg-green-100 text-green-900 hover:bg-green-200"
                              : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isLocked ? (
                            <Lock className="w-4 h-4" />
                          ) : isCompleted ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <BookOpen className="w-4 h-4" />
                          )}
                          <span className="text-sm font-medium">{lesson.title}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Main Content - Vocabulary Cards */}
          <div className="lg:col-span-3">
            {currentLesson && !isCurrentLessonLocked ? (
              <div className="space-y-6">
                {/* Lesson Title */}
                <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">{currentLesson.title}</h2>
                  <p className="text-slate-600">{currentLesson.description}</p>
                </Card>

                {/* Vocabulary Card */}
                {vocabularyItems.length > 0 && (
                  <VocabularyCard
                    item={vocabularyItems[currentCardIndex]}
                    language={language}
                    audioUrl={audioData?.audioUrl || undefined}
                    lessonId={currentLesson?.id}
                    itemIndex={currentCardIndex}
                  />
                )}

                {/* Card Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevCard}
                    disabled={currentCardIndex === 0}
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    이전
                  </Button>

                  <div className="text-sm text-slate-600">
                    {currentCardIndex + 1} / {vocabularyItems.length}
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleNextCard}
                    disabled={currentCardIndex === vocabularyItems.length - 1}
                    className="gap-2"
                  >
                    다음
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Lesson Completion */}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handlePrevLesson} disabled={currentLessonIndex === 0}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    이전 레슨
                  </Button>

                  {isLessonCompleted ? (
                    <Button className="flex-1 bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      완료됨
                    </Button>
                  ) : (
                      <Button
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={handleCompleteLesson}
                      >
                        레슨 완료
                      </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={handleNextLesson}
                    disabled={currentLessonIndex === lessons.length - 1}
                  >
                    다음 레슨
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            ) : isCurrentLessonLocked ? (
              <Card className="p-12 text-center bg-slate-100">
                <Lock className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">이 레슨은 잠겨있습니다</h3>
                <p className="text-slate-600">이전 레슨을 완료하면 이 레슨을 시작할 수 있습니다.</p>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
