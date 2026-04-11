import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, RotateCcw, Home } from "lucide-react";
import { useLocation } from "wouter";
import BackButton from "@/components/BackButton";

interface TestQuestion {
  id: number;
  lessonId: number;
  question: string;
  options: string[];
  correctAnswer: string;
  language: "thai" | "lao";
}

interface TestResult {
  questionId: number;
  selected: string;
  isCorrect: boolean;
}

export default function Test() {
  const [, navigate] = useLocation();
  const [language, setLanguage] = useState<"thai" | "lao">("thai");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [results, setResults] = useState<TestResult[]>([]);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);

  // Fetch test questions - use random vocabulary from lessons
  const { data: questionsData, isLoading } = trpc.beginnerLessons.getLessons.useQuery({
    language,
  });

  useEffect(() => {
    if (questionsData && Array.isArray(questionsData)) {
      // Convert lessons to test questions
      const testQuestions: TestQuestion[] = questionsData.slice(0, 10).map((lesson: any, idx: number) => {
        const content = JSON.parse(lesson.content || '[]');
        const correctItem = content[0] || {};
        const correctAnswer = correctItem[language] || correctItem.english || '';
        
        return {
          id: idx,
          lessonId: lesson.id,
          question: `"${correctAnswer}"은(는) 무엇을 의미합니까?`,
          options: [
            correctItem.english || '',
            content[1]?.english || 'Option 2',
            content[2]?.english || 'Option 3',
            content[3]?.english || 'Option 4',
          ].sort(() => Math.random() - 0.5),
          correctAnswer: correctItem.english || '',
          language,
        };
      });
      setQuestions(testQuestions);
      setCurrentQuestionIndex(0);
      setResults([]);
    }
  }, [questionsData, language]);

  const currentQuestion = questions[currentQuestionIndex];
  const currentResult = results[currentQuestionIndex];
  const progressPercentage = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const handleSelectAnswer = (answer: string) => {
    const isCorrect = answer === currentQuestion?.correctAnswer;
    const newResult: TestResult = {
      questionId: currentQuestion?.id || 0,
      selected: answer,
      isCorrect,
    };

    const newResults = [...results];
    newResults[currentQuestionIndex] = newResult;
    setResults(newResults);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setTestCompleted(true);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleRetakeTest = () => {
    setCurrentQuestionIndex(0);
    setResults([]);
    setTestCompleted(false);
    setTestStarted(false);
  };

  const totalCorrect = results.filter((r) => r.isCorrect).length;
  const accuracy = questions.length > 0 ? (totalCorrect / questions.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
        <div className="text-slate-600">테스트를 준비하는 중...</div>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-2xl mx-auto">
          <BackButton />

          <div className="mt-16">
            <Card className="p-12 text-center bg-white shadow-lg">
              <h1 className="text-4xl font-bold text-slate-900 mb-4">최종 평가</h1>
              <p className="text-slate-600 mb-8 text-lg">
                모든 레슨을 완료했습니다! 이제 최종 테스트를 통해 당신의 실력을 평가해보세요.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <p className="text-slate-700 mb-4">
                  <strong>테스트 정보:</strong>
                </p>
                <ul className="text-left space-y-2 text-slate-600">
                  <li>• 총 {questions.length}개의 문제</li>
                  <li>• 각 문제마다 4개의 선택지</li>
                  <li>• 제한 시간 없음</li>
                  <li>• 언제든지 이전 문제로 돌아갈 수 있음</li>
                </ul>
              </div>

              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => navigate("/beginner-lessons")}
                >
                  레슨 복습
                </Button>
                <Button
                  size="lg"
                  onClick={() => setTestStarted(true)}
                  className="px-8"
                >
                  테스트 시작
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (testCompleted) {
    const grade =
      accuracy >= 90
        ? "A+"
        : accuracy >= 80
          ? "A"
          : accuracy >= 70
            ? "B"
            : accuracy >= 60
              ? "C"
              : "F";

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-2xl mx-auto">
          <BackButton />

          <div className="mt-8">
            <Card className="p-12 text-center bg-white shadow-lg">
              <div className="mb-8">
                <div className="text-6xl font-bold text-blue-600 mb-4">{accuracy.toFixed(1)}%</div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">테스트 완료!</h1>
                <p className="text-slate-600 text-lg">
                  {totalCorrect} / {questions.length} 정답
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8 mb-8">
                <p className="text-5xl font-bold text-blue-600 mb-2">등급: {grade}</p>
                <p className="text-slate-600">
                  {accuracy >= 90
                    ? "완벽합니다! 축하합니다! 🎉"
                    : accuracy >= 80
                      ? "훌륭합니다! 계속 연습하세요."
                      : accuracy >= 70
                        ? "좋습니다! 더 연습이 필요합니다."
                        : accuracy >= 60
                          ? "기초가 있습니다. 더 많은 연습을 추천합니다."
                          : "더 많은 연습이 필요합니다. 레슨을 다시 복습해보세요."}
                </p>
              </div>

              {/* Results Summary */}
              <div className="space-y-3 mb-8 text-left">
                <h3 className="font-bold text-slate-900 text-center mb-4">상세 결과</h3>
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg flex items-center gap-3 ${
                      result.isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                    }`}
                  >
                    {result.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">문제 {index + 1}</p>
                      {!result.isCorrect && (
                        <p className="text-xs text-slate-600">
                          당신의 답: {result.selected} | 정답: {questions[index]?.correctAnswer}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 justify-center flex-wrap">
                <Button variant="outline" onClick={() => navigate("/beginner-lessons")}>
                  <Home className="w-4 h-4 mr-2" />
                  홈으로
                </Button>
                <Button variant="outline" onClick={handleRetakeTest}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  테스트 다시 풀기
                </Button>
                <Button onClick={() => navigate("/statistics")}>
                  통계 보기
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto">
        <BackButton />

        <div className="mt-8">
          {/* Progress */}
          <Card className="p-6 mb-8 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">진행도</h3>
              <span className="text-sm text-slate-600">
                {currentQuestionIndex + 1} / {questions.length}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </Card>

          {/* Question */}
          {currentQuestion && (
            <Card className="p-8 bg-white shadow-lg space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">{currentQuestion.question}</h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = currentResult?.selected === option;
                  const isCorrect = option === currentQuestion.correctAnswer;
                  const showResult = currentResult !== undefined;

                  let buttonClass =
                    "w-full p-4 rounded-lg border-2 text-left transition-all font-medium ";

                  if (!showResult) {
                    buttonClass += isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-blue-300";
                  } else {
                    if (isCorrect) {
                      buttonClass += "border-green-500 bg-green-50 text-green-900";
                    } else if (isSelected && !isCorrect) {
                      buttonClass += "border-red-500 bg-red-50 text-red-900";
                    } else {
                      buttonClass += "border-slate-200 bg-slate-50 text-slate-600";
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => !showResult && handleSelectAnswer(option)}
                      disabled={showResult}
                      className={buttonClass}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {showResult && isCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                        {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex gap-3 justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  이전
                </Button>

                <Button
                  onClick={handleNextQuestion}
                  disabled={currentResult === undefined}
                >
                  {currentQuestionIndex === questions.length - 1 ? "완료" : "다음"}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
