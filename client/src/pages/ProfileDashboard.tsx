import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2, Trophy, Zap, Target, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

const LEVEL_COLORS: Record<string, string> = {
  novice: "bg-blue-100 text-blue-800",
  intermediate: "bg-green-100 text-green-800",
  advanced: "bg-purple-100 text-purple-800",
  superior: "bg-orange-100 text-orange-800",
  distinguished: "bg-red-100 text-red-800",
};

const LEVEL_NAMES: Record<string, string> = {
  novice: "Novice (초급)",
  intermediate: "Intermediate (중급)",
  advanced: "Advanced (고급)",
  superior: "Superior (상급)",
  distinguished: "Distinguished (최상급)",
};

export default function ProfileDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch user level
  const { data: userLevel, isLoading: levelLoading } = trpc.cuTfl.getUserLevel.useQuery();

  // Fetch active goals
  const { data: goals, isLoading: goalsLoading } = trpc.cuTfl.getActiveGoals.useQuery();

  // Fetch daily goal specifically
  const { data: dailyGoal } = trpc.cuTfl.getGoalByType.useQuery({
    goalType: "daily",
  });

  useEffect(() => {
    if (!levelLoading && !userLevel && user) {
      // User hasn't completed onboarding, redirect to onboarding
      navigate("/onboarding");
    } else if (userLevel) {
      setIsInitialized(true);
    }
  }, [levelLoading, userLevel, user, navigate]);

  if (levelLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isInitialized || !userLevel) {
    return null;
  }

  const getLevelColor = (levelCode: string) => {
    return LEVEL_COLORS[levelCode] || "bg-gray-100 text-gray-800";
  };

  const getLevelName = (levelCode: string) => {
    return LEVEL_NAMES[levelCode] || levelCode;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            학습 대시보드
          </h1>
          <p className="text-gray-600">
            {user?.name}님의 학습 진행 상황을 확인하세요.
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Current Level Card */}
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                현재 레벨
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-indigo-600">
                  {userLevel.progress?.currentLevel}
                </div>
                <Badge className={getLevelColor(userLevel.progress?.currentLevel?.toLowerCase() || "")}>
                  {getLevelName(userLevel.progress?.currentLevel?.toLowerCase() || "")}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* XP Card */}
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                경험치 (XP)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-amber-600">
                  {userLevel.currentXP.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500">
                  목표: {userLevel.targetXP.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Accuracy Card */}
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                정확도
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-600">
                  {userLevel.currentAccuracy.toFixed(1)}%
                </div>
                <p className="text-xs text-gray-500">
                  목표: 75%
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Streak Card */}
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                연속 일수
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-red-600">
                  {userLevel.currentConsecutiveDays}
                </div>
                <p className="text-xs text-gray-500">
                  최대: {userLevel.maxConsecutiveDays}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress to Next Level */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                다음 레벨까지의 진행률
              </span>
              <Badge variant="outline">
                {userLevel.progress?.targetLevel}
              </Badge>
            </CardTitle>
            <CardDescription>
              {userLevel.progress?.estimatedDaysToComplete}일 내에 목표 레벨에 도달할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* XP Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">경험치</span>
                <span className="text-sm text-gray-600">
                  {userLevel.currentXP.toLocaleString()} / {userLevel.targetXP.toLocaleString()}
                </span>
              </div>
              <Progress
                value={userLevel.progress?.xpProgress || 0}
                className="h-2"
              />
              <p className="text-xs text-gray-500">
                {userLevel.progress?.xpProgress || 0}% 완료
              </p>
            </div>

            {/* Accuracy Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">정확도</span>
                <span className="text-sm text-gray-600">
                  {userLevel.currentAccuracy.toFixed(1)}% / 75%
                </span>
              </div>
              <Progress
                value={userLevel.progress?.accuracyProgress || 0}
                className="h-2"
              />
              <p className="text-xs text-gray-500">
                {userLevel.progress?.accuracyProgress || 0}% 달성
              </p>
            </div>

            {/* Consecutive Days Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">연속 학습</span>
                <span className="text-sm text-gray-600">
                  {userLevel.currentConsecutiveDays} / {userLevel.progress?.targetConsecutiveDays} 일
                </span>
              </div>
              <Progress
                value={
                  ((userLevel.currentConsecutiveDays || 0) / (userLevel.progress?.targetConsecutiveDays || 1)) * 100
                }
                className="h-2"
              />
              <p className="text-xs text-gray-500">
                {Math.round(
                  ((userLevel.currentConsecutiveDays || 0) / (userLevel.progress?.targetConsecutiveDays || 1)) * 100
                )}% 달성
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Daily Goal */}
        {dailyGoal && (
          <Card className="shadow-md border-l-4 border-l-indigo-600">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  오늘의 목표
                </span>
                {dailyGoal.isCompleted && (
                  <Badge className="bg-green-100 text-green-800">완료!</Badge>
                )}
              </CardTitle>
              <CardDescription>
                {new Date(dailyGoal.endDate).toLocaleDateString("ko-KR")}까지 달성해야 합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">경험치</p>
                  <p className="text-lg font-bold text-blue-600">
                    {dailyGoal.currentXP} / {dailyGoal.targetXP}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">정확도</p>
                  <p className="text-lg font-bold text-green-600">
                    {dailyGoal.currentAccuracy.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">연습</p>
                  <p className="text-lg font-bold text-purple-600">
                    {dailyGoal.currentExercises} / {dailyGoal.targetExercises}
                  </p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">연속</p>
                  <p className="text-lg font-bold text-orange-600">
                    {dailyGoal.currentConsecutiveDays} / {dailyGoal.targetConsecutiveDays}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => navigate("/pronunciation")}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                발음 연습 시작
              </Button>
            </CardContent>
          </Card>
        )}

        {/* All Goals Summary */}
        {goals && goals.length > 0 && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>모든 학습 목표</CardTitle>
              <CardDescription>
                일일, 주간, 월간, 분기, 연간 목표 진행 상황
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {goals.map((goal) => (
                  <div key={goal.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-gray-900">
                        {goal.goalType === "daily" && "일일 목표"}
                        {goal.goalType === "weekly" && "주간 목표"}
                        {goal.goalType === "monthly" && "월간 목표"}
                        {goal.goalType === "quarterly" && "분기 목표"}
                        {goal.goalType === "annual" && "연간 목표"}
                      </h4>
                      {goal.isCompleted && (
                        <Badge className="bg-green-100 text-green-800">완료</Badge>
                      )}
                    </div>
                    <Progress value={Math.min(100, Math.max(
                      goal.progress.xpProgress,
                      goal.progress.accuracyProgress,
                      goal.progress.exercisesProgress,
                      goal.progress.daysProgress
                    ))} className="h-2" />
                    <p className="text-xs text-gray-600">
                      XP: {goal.currentXP}/{goal.targetXP} | 정확도: {goal.currentAccuracy.toFixed(1)}% | 연습: {goal.currentExercises}/{goal.targetExercises}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
