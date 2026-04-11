import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, TrendingUp, Target, Clock, Zap } from "lucide-react";
import { useLocation } from "wouter";
import BackButton from "@/components/BackButton";

type Category = "numbers" | "days" | "months" | "time" | "phrases";

export default function Statistics() {
  const [, navigate] = useLocation();

  // Fetch user's review statistics
  const { data: stats, isLoading } = trpc.review.getStats.useQuery({});

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    if (!stats) {
      return {
        totalReviews: 0,
        totalCorrect: 0,
        overallAccuracy: 0,
        totalTimeSpent: 0,
        streak: 0,
      };
    }

    const totalReviews = stats.totalSessions || 0;
    const totalCorrect = stats.totalCorrect || 0;
    const overallAccuracy = stats.averageAccuracy || 0;
    const totalTimeSpent = (totalReviews * 300) || 0; // Estimate 5 mins per session
    const streak = 0;

    return {
      totalReviews,
      totalCorrect,
      overallAccuracy,
      totalTimeSpent,
      streak,
    };
  }, [stats]);

  // Category data
  const categories: Array<{ value: Category; label: string }> = [
    { value: "numbers", label: "숫자" },
    { value: "days", label: "요일" },
    { value: "months", label: "월" },
    { value: "time", label: "시간" },
    { value: "phrases", label: "기본 인사말" },
  ];

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}초`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분`;
    return `${Math.floor(seconds / 3600)}시간`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
        <div className="text-slate-600">통계를 불러오는 중...</div>
      </div>
    );
  }

  const itemsPerCategory = Math.ceil((stats?.totalItems || 0) / categories.length);
  const completedPerCategory = Math.floor((stats?.totalCorrect || 0) / categories.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        <BackButton />

        <div className="mt-8 mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">학습 통계</h1>
          <p className="text-slate-600">당신의 학습 진행 상황을 확인하세요</p>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">복습 횟수</p>
                <p className="text-3xl font-bold text-slate-900">{overallStats.totalReviews}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">정답률</p>
                <p className="text-3xl font-bold text-slate-900">
                  {overallStats.overallAccuracy.toFixed(1)}%
                </p>
              </div>
              <Target className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">학습 시간</p>
                <p className="text-3xl font-bold text-slate-900">
                  {formatTime(overallStats.totalTimeSpent)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">연속 학습</p>
                <p className="text-3xl font-bold text-slate-900">{overallStats.streak}일</p>
              </div>
              <Zap className="w-8 h-8 text-orange-600 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Category Statistics */}
        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-bold text-slate-900">카테고리별 진행도</h2>

          {categories.map((cat) => {
            const progress = itemsPerCategory > 0 ? (completedPerCategory / itemsPerCategory) * 100 : 0;
            const accuracyColor =
              overallStats.overallAccuracy >= 80
                ? "text-green-600"
                : overallStats.overallAccuracy >= 60
                  ? "text-blue-600"
                  : "text-orange-600";

            return (
              <Card key={cat.value} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{cat.label}</h3>
                    <p className="text-sm text-slate-600">
                      {completedPerCategory}/{itemsPerCategory} 완료 • 정답률{" "}
                      {overallStats.overallAccuracy.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${accuracyColor}`}>
                      {overallStats.overallAccuracy.toFixed(0)}%
                    </p>
                    <p className="text-xs text-slate-600">
                      {formatTime(Math.floor(overallStats.totalTimeSpent / categories.length))}
                    </p>
                  </div>
                </div>

                <Progress value={progress} className="h-2 mb-2" />

                <p className="text-xs text-slate-500">마지막 복습: 오늘</p>
              </Card>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate("/beginner-lessons")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            초보자 학습으로
          </Button>
          <Button onClick={() => navigate("/review-mode")}>
            복습 계속하기
          </Button>
        </div>
      </div>
    </div>
  );
}
