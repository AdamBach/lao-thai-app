import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, RotateCcw, CheckCircle2, XCircle, Mic, Volume2, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import BackButton from "@/components/BackButton";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";

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

export default function ReviewMode() {
  const [, setLocation] = useLocation();
  const [language, setLanguage] = useState<Language>("thai");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [pronunciationScores, setPronunciationScores] = useState<PronunciationScore[]>([]);
  const [showPronunciationMode, setShowPronunciationMode] = useState(false);
  const [isScoring, setIsScoring] = useState(false);

  const { isRecording, startRecording, stopRecording, recordingTime } = useAudioRecorder();
  const scorePronunciationMutation = trpc.pronunciationScoring.scorePronunciation.useMutation();

  // Fetch lessons by category
  const { data: categoryLessons } = trpc.beginnerLessons.getLessonsByCategory.useQuery(
    {
      language,
      category: (selectedCategory as any) || "hello",
    },
    { enabled: !!selectedCategory }
  );

  const startSessionMutation = trpc.review.startSession.useMutation();
  const completeSessionMutation = trpc.review.completeSession.useMutation();

  // Load vocabulary items when category is selected
  useEffect(() => {
    if (categoryLessons && categoryLessons.length > 0) {
      const lesson = categoryLessons[0];
      const items = lesson.content ? JSON.parse(lesson.content as any) : [];
      setReviewItems(items as ReviewItem[]);
      setCurrentIndex(0);
      setCorrectAnswers(0);
      setIsAnswered(false);
      setStartTime(Date.now());
      setPronunciationScores([]);

      // Start review session
      if (lesson.id) {
        startSessionMutation.mutate(
          { lessonId: lesson.id, totalItems: items.length },
          {
            onSuccess: (session) => {
              setSessionId((session as any)?.id || null);
            },
          }
        );
      }
    }
  }, [categoryLessons, selectedCategory]);

  const handleCorrect = () => {
    setCorrectAnswers(correctAnswers + 1);
    handleNext();
  };

  const handleIncorrect = () => {
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < reviewItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsAnswered(false);
      setShowPronunciationMode(false);
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
          {
            audioUrl: URL.createObjectURL(audioBlob),
            expectedText: targetWord,
            language,
          },
          {
            onSuccess: (result) => {
              const score: PronunciationScore = {
                accuracy: result.accuracy || 0,
                feedback: result.feedback || "발음을 다시 시도해주세요.",
                isCorrect: (result.accuracy || 0) >= 70,
              };
              setPronunciationScores([...pronunciationScores, score]);
              
              if (score.isCorrect) {
                setCorrectAnswers(correctAnswers + 1);
              }
              
              setIsScoring(false);
              setTimeout(() => handleNext(), 2000);
            },
            onError: () => {
              setIsScoring(false);
              alert("발음 채점에 실패했습니다. 다시 시도해주세요.");
            },
          }
        );
      }
    } else {
      startRecording();
    }
  };

  const completeReview = async () => {
    if (!sessionId) return;

    const duration = Math.floor((Date.now() - startTime) / 1000);

    completeSessionMutation.mutate(
      {
        sessionId,
        correctAnswers,
        totalItems: reviewItems.length,
        duration,
      },
      {
        onSuccess: () => {
          setIsCompleted(true);
        },
      }
    );
  };

  const currentItem = reviewItems[currentIndex];
  const progress = reviewItems.length > 0 ? ((currentIndex + 1) / reviewItems.length) * 100 : 0;
  const accuracy = reviewItems.length > 0 ? (correctAnswers / reviewItems.length) * 100 : 0;

  const categories: { value: Category; label: string }[] = [
    { value: "hello", label: "인사말" },
    { value: "family", label: "가족" },
    { value: "food", label: "음식" },
    { value: "languages", label: "언어" },
    { value: "family_counting", label: "가족 & 수" },
    { value: "age_counting", label: "나이 & 수" },
  ];

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-2xl mx-auto">
          <BackButton />

          <div className="mt-8 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>

            <h1 className="text-4xl font-bold text-slate-900 mb-4">복습 완료!</h1>

            <Card className="p-8 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-slate-600 mb-2">정답률</p>
                  <p className="text-3xl font-bold text-slate-900">{accuracy.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-2">정답</p>
                  <p className="text-3xl font-bold text-green-600">
                    {correctAnswers}/{reviewItems.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-2">소요 시간</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {Math.floor((Date.now() - startTime) / 1000)}초
                  </p>
                </div>
              </div>
            </Card>

            <div className="flex gap-3 justify-center flex-wrap">
              <Button variant="outline" onClick={() => setLocation("/beginner-lessons")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                돌아가기
              </Button>
              <Button
                onClick={() => {
                  setCurrentIndex(0);
                  setCorrectAnswers(0);
                  setIsAnswered(false);
                  setIsCompleted(false);
                  setStartTime(Date.now());
                  setPronunciationScores([]);
                  setShowPronunciationMode(false);
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                다시 풀기
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-2xl mx-auto">
          <BackButton />

          <div className="mt-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">복습할 카테고리 선택</h1>

            <div className="space-y-4">
              {categories.map((cat) => (
                <Card
                  key={cat.value}
                  className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedCategory(cat.value)}
                >
                  <h3 className="text-lg font-semibold text-slate-900">{cat.label}</h3>
                  <p className="text-sm text-slate-600">이 카테고리의 단어를 복습하세요</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">복습할 단어가 없습니다.</p>
          <Button onClick={() => setLocation("/beginner-lessons")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const currentScore = pronunciationScores[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto">
        <BackButton />

        {/* Progress */}
        <div className="mt-8 mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-semibold text-slate-700">
              진행률: {currentIndex + 1}/{reviewItems.length}
            </h2>
            <p className="text-sm font-semibold text-slate-700">정답: {correctAnswers}</p>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="p-8 mb-6 text-center">
          <p className="text-sm text-slate-600 mb-4">이 단어를 발음해보세요</p>
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            {currentItem.thai || currentItem.lao}
          </h1>
          {(currentItem.romanization || currentItem.number) && (
            <p className="text-lg text-slate-600">
              {currentItem.romanization || `숫자: ${currentItem.number}`}
            </p>
          )}
          {currentItem.english && (
            <p className="text-lg text-blue-600 font-semibold mt-2">
              의미: {currentItem.english}
            </p>
          )}
        </Card>

        {/* Pronunciation Recording Mode */}
        {showPronunciationMode ? (
          <Card className="p-8 mb-6">
            <div className="text-center space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">발음 녹음</h3>
                <p className="text-sm text-slate-600 mb-4">
                  마이크 버튼을 눌러 발음을 녹음하세요
                </p>
              </div>

              {/* Recording Status */}
              {isRecording && (
                <div className="flex items-center justify-center gap-2 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                  <span className="text-red-700 font-semibold">
                    녹음 중... {recordingTime}초
                  </span>
                </div>
              )}

              {/* Scoring Status */}
              {isScoring && (
                <div className="flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
                  <span className="text-blue-700 font-semibold">
                    발음 채점 중...
                  </span>
                </div>
              )}

              {/* Pronunciation Score */}
              {currentScore && !isScoring && (
                <div className={`rounded-lg p-6 ${
                  currentScore.isCorrect 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-orange-50 border border-orange-200'
                }`}>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {currentScore.isCorrect ? (
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    ) : (
                      <AlertCircle className="w-8 h-8 text-orange-600" />
                    )}
                  </div>
                  <p className={`text-3xl font-bold mb-2 ${
                    currentScore.isCorrect ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {currentScore.accuracy.toFixed(0)}%
                  </p>
                  <p className={`text-sm ${
                    currentScore.isCorrect ? 'text-green-700' : 'text-orange-700'
                  }`}>
                    {currentScore.feedback}
                  </p>
                </div>
              )}

              {/* Record Button */}
              <Button
                size="lg"
                onClick={handleRecordPronunciation}
                disabled={isScoring}
                className={isRecording ? "bg-red-600 hover:bg-red-700" : ""}
              >
                <Mic className="w-5 h-5 mr-2" />
                {isRecording ? "녹음 중지" : "발음 녹음"}
              </Button>

              {/* Navigation */}
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowPronunciationMode(false)}
                >
                  돌아가기
                </Button>
                {currentScore && (
                  <Button onClick={handleNext}>
                    다음 단어
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <>
            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowPronunciationMode(true)}
              >
                <Mic className="w-5 h-5 mr-2" />
                발음 녹음하기
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleIncorrect}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  틀렸어요
                </Button>
                <Button
                  onClick={handleCorrect}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  맞았어요
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
