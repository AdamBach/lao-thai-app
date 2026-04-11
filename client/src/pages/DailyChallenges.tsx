import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Flame, Trophy, Zap, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useLocation } from "wouter";
import BackButton from "@/components/BackButton";

interface ChallengeWithProgress {
  id: number;
  date: string;
  title: string;
  description: string | null;
  language: "lao" | "thai";
  targetCount: number;
  xpReward: number;
  progress?: {
    completed: number;
    isCompleted: number;
    xpEarned: number;
  };
}

export default function DailyChallenges() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [challenges, setChallenges] = useState<ChallengeWithProgress[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeWithProgress | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch today's challenge
  const todaysChallengeQuery = trpc.challenges.getTodayChallenge.useQuery(undefined, {
    retry: 1,
  });

  // Fetch user stats (only if user is authenticated)
  const userStatsQuery = trpc.pronunciation.getUserStats.useQuery(undefined, {
    enabled: !!user,
    retry: 1,
  });

  // Update challenge progress mutation
  const updateProgressMutation = trpc.challenges.updateProgress.useMutation();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Load today's challenge
        if (todaysChallengeQuery.data) {
          const mockChallenges: ChallengeWithProgress[] = [
            {
              ...todaysChallengeQuery.data,
              progress: {
                completed: 0,
                isCompleted: 0,
                xpEarned: 0,
              },
            },
          ];
          setChallenges(mockChallenges);
          setSelectedChallenge(mockChallenges[0]);
        }

        // Load user stats if available
        if (user && userStatsQuery.data) {
          setUserStats(userStatsQuery.data);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error loading challenges:", err);
        setError("챌린지를 불러올 수 없습니다.");
        setIsLoading(false);
      }
    };

    // Only load if we have challenge data or if user is authenticated
    if (todaysChallengeQuery.data || (!user && todaysChallengeQuery.data)) {
      loadData();
    } else if (!todaysChallengeQuery.isLoading && !userStatsQuery.isLoading) {
      // If queries are done loading but no data, show content anyway
      setIsLoading(false);
    }
  }, [todaysChallengeQuery.data, todaysChallengeQuery.isLoading, userStatsQuery.data, userStatsQuery.isLoading, user]);

  const handleStartChallenge = async (challenge: ChallengeWithProgress) => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    try {
      navigate("/pronunciation");
      toast.success(`${challenge.title} 챌린지를 시작했습니다!`);
    } catch (error) {
      console.error("Error starting challenge:", error);
      toast.error("챌린지를 시작할 수 없습니다.");
    }
  };

  const handleCompleteChallenge = async (challenge: ChallengeWithProgress) => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    try {
      await updateProgressMutation.mutateAsync({
        challengeId: challenge.id,
        completed: challenge.targetCount,
        isCompleted: 1,
        xpEarned: challenge.xpReward,
      });

      toast.success(`축하합니다! ${challenge.xpReward} XP를 획득했습니다!`);
      userStatsQuery.refetch();
    } catch (error) {
      console.error("Error completing challenge:", error);
      toast.error("챌린지 완료 처리 중 오류가 발생했습니다.");
    }
  };

  const calculateProgressPercentage = (challenge: ChallengeWithProgress): number => {
    if (!challenge.progress) return 0;
    return Math.min(100, Math.round((challenge.progress.completed / challenge.targetCount) * 100));
  };

  const isChallengeCompleted = (challenge: ChallengeWithProgress): boolean => {
    return challenge.progress?.isCompleted === 1;
  };

  if (isLoading && todaysChallengeQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">챌린지를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <BackButton />

        {/* Header */}
        <div className="mb-8 mt-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">일일 챌린지</h1>
          <p className="text-lg text-gray-600">매일 새로운 챌린지를 완료하고 XP를 획득하세요</p>
        </div>

        {error && (
          <Card className="p-4 mb-8 bg-red-50 border border-red-200">
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        {/* User Stats Bar */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Level */}
            <Card className="p-6 bg-white shadow-lg border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">레벨</p>
                  <p className="text-3xl font-bold text-blue-600">{userStats.level || 1}</p>
                </div>
                <Trophy className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </Card>

            {/* Total XP */}
            <Card className="p-6 bg-white shadow-lg border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">총 XP</p>
                  <p className="text-3xl font-bold text-yellow-600">{userStats.totalXP || 0}</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-500 opacity-50" />
              </div>
            </Card>

            {/* Streak */}
            <Card className="p-6 bg-white shadow-lg border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">연속 일수</p>
                  <p className="text-3xl font-bold text-red-600">{userStats.streak || 0}</p>
                </div>
                <Flame className="w-8 h-8 text-red-500 opacity-50" />
              </div>
            </Card>

            {/* Average Accuracy */}
            <Card className="p-6 bg-white shadow-lg border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">평균 정확도</p>
                  <p className="text-3xl font-bold text-green-600">{Math.round(userStats.averageAccuracy || 0)}%</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </Card>
          </div>
        )}

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Challenges List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">이번 주 챌린지</h2>

            {challenges.length === 0 ? (
              <Card className="p-8 text-center bg-white shadow-lg">
                <p className="text-gray-600">로드할 챌린지가 없습니다.</p>
              </Card>
            ) : (
              challenges.map((challenge) => {
                const progressPercentage = calculateProgressPercentage(challenge);
                const isCompleted = isChallengeCompleted(challenge);

                return (
                  <Card
                    key={challenge.id}
                    className={`p-6 bg-white shadow-lg cursor-pointer transition-all ${
                      selectedChallenge?.id === challenge.id
                        ? "ring-2 ring-indigo-600 shadow-xl"
                        : "hover:shadow-xl"
                    } ${isCompleted ? "opacity-75" : ""}`}
                    onClick={() => setSelectedChallenge(challenge)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{challenge.title}</h3>
                          {isCompleted && (
                            <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{challenge.description}</p>

                        {/* Challenge Info */}
                        <div className="flex items-center gap-4 mb-3 flex-wrap">
                          <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {challenge.language === "lao" ? "라오어" : "태국어"}
                          </span>
                          <span className="text-xs font-semibold px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                            {challenge.xpReward} XP
                          </span>
                          <span className="text-xs font-semibold px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                            {challenge.targetCount}개 항목
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">진행 상황</span>
                            <span className="text-sm font-semibold text-gray-600">
                              {challenge.progress?.completed || 0} / {challenge.targetCount}
                            </span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          {/* Challenge Details */}
          <div className="lg:col-span-1">
            {selectedChallenge ? (
              <Card className="p-6 bg-white shadow-lg sticky top-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">챌린지 상세</h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">제목</p>
                    <p className="text-lg font-bold text-gray-900">{selectedChallenge.title}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 font-semibold">설명</p>
                    <p className="text-gray-700">{selectedChallenge.description}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 font-semibold">언어</p>
                    <p className="text-gray-700">
                      {selectedChallenge.language === "lao" ? "라오어" : "태국어"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 font-semibold">보상</p>
                    <p className="text-lg font-bold text-yellow-600">{selectedChallenge.xpReward} XP</p>
                  </div>

                  <div className="pt-4 space-y-2">
                    {!isChallengeCompleted(selectedChallenge) ? (
                      <>
                        <Button
                          onClick={() => handleStartChallenge(selectedChallenge)}
                          className="w-full bg-indigo-600 hover:bg-indigo-700"
                        >
                          챌린지 시작
                        </Button>
                        <Button
                          onClick={() => handleCompleteChallenge(selectedChallenge)}
                          variant="outline"
                          className="w-full"
                        >
                          완료 표시
                        </Button>
                      </>
                    ) : (
                      <Button disabled className="w-full bg-green-600">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        완료됨
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6 bg-white shadow-lg">
                <p className="text-gray-600 text-center">챌린지를 선택하세요</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
