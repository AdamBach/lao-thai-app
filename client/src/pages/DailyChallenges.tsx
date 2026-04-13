"use client";
import { useState, useEffect } from "react";
import { Loader2, Flame, Trophy, Zap, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useLocation } from "wouter";
import BottomNav from "@/components/BottomNav";

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

  const todaysChallengeQuery = trpc.challenges.getTodayChallenge.useQuery(undefined, { retry: 1 });
  const userStatsQuery = trpc.pronunciation.getUserStats.useQuery(undefined, { enabled: !!user, retry: 1 });
  const updateProgressMutation = trpc.challenges.updateProgress.useMutation();

  useEffect(() => {
    if (todaysChallengeQuery.data) {
      const list: ChallengeWithProgress[] = [{
        ...todaysChallengeQuery.data,
        progress: { completed: 0, isCompleted: 0, xpEarned: 0 },
      }];
      setChallenges(list);
      setSelectedChallenge(list[0]);
    }
    if (user && userStatsQuery.data) setUserStats(userStatsQuery.data);
    if (!todaysChallengeQuery.isLoading && !userStatsQuery.isLoading) setIsLoading(false);
  }, [todaysChallengeQuery.data, todaysChallengeQuery.isLoading, userStatsQuery.data, userStatsQuery.isLoading, user]);

  const handleStartChallenge = (challenge: ChallengeWithProgress) => {
    if (!user) { toast.error("Please log in to start challenges."); return; }
    navigate("/practice");
    toast.success(`${challenge.title} started!`);
  };

  const handleCompleteChallenge = async (challenge: ChallengeWithProgress) => {
    if (!user) { toast.error("Please log in first."); return; }
    try {
      await updateProgressMutation.mutateAsync({
        challengeId: challenge.id,
        completed: challenge.targetCount,
        isCompleted: 1,
        xpEarned: challenge.xpReward,
      });
      toast.success(`🎉 +${challenge.xpReward} XP earned!`);
      userStatsQuery.refetch();
    } catch {
      toast.error("Could not complete challenge.");
    }
  };

  const getProgress = (c: ChallengeWithProgress) =>
    Math.min(100, Math.round(((c.progress?.completed || 0) / c.targetCount) * 100));
  const isCompleted = (c: ChallengeWithProgress) => c.progress?.isCompleted === 1;

  if (isLoading && todaysChallengeQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-white">Daily Challenges</h1>
        <p className="text-white/40 text-sm mt-0.5">Complete daily goals and earn XP</p>
      </div>

      {/* Stats strip */}
      {userStats && (
        <div className="px-5 mb-5">
          <div className="bg-card border border-white/8 rounded-2xl p-4 grid grid-cols-4 gap-2">
            <div className="text-center">
              <div className="text-blue-400 font-bold text-lg">{userStats.level || 1}</div>
              <div className="text-white/40 text-xs">Level</div>
            </div>
            <div className="text-center border-x border-white/8">
              <div className="text-yellow-400 font-bold text-lg">{userStats.totalXP || 0}</div>
              <div className="text-white/40 text-xs">Total XP ⚡</div>
            </div>
            <div className="text-center border-r border-white/8">
              <div className="text-orange-400 font-bold text-lg">{userStats.streak || 0}</div>
              <div className="text-white/40 text-xs">Streak 🔥</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 font-bold text-lg">{Math.round(userStats.averageAccuracy || 0)}%</div>
              <div className="text-white/40 text-xs">Accuracy</div>
            </div>
          </div>
        </div>
      )}

      {/* Today's challenge */}
      <div className="px-5 mb-4">
        <p className="text-white/40 text-xs uppercase tracking-wider mb-3 font-medium">This Week</p>
        {challenges.length === 0 ? (
          <div className="bg-card border border-white/8 rounded-2xl p-8 text-center">
            <Flame className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">No challenges available today.</p>
            <p className="text-white/25 text-sm mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {challenges.map((challenge) => {
              const prog = getProgress(challenge);
              const done = isCompleted(challenge);
              return (
                <button
                  key={challenge.id}
                  onClick={() => setSelectedChallenge(challenge)}
                  className={`w-full bg-card border rounded-2xl p-5 text-left transition-all ${
                    selectedChallenge?.id === challenge.id
                      ? "border-blue-500/40 bg-blue-500/5"
                      : "border-white/8 hover:border-white/15"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold">{challenge.title}</h3>
                        {done && <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />}
                      </div>
                      <p className="text-white/40 text-sm">{challenge.description}</p>
                    </div>
                    <div className="text-right ml-3">
                      <div className="text-yellow-400 font-bold text-sm">+{challenge.xpReward} XP</div>
                      <div className="text-white/30 text-xs mt-0.5">
                        {challenge.language === "lao" ? "ລາວ Lao" : "ไทย Thai"}
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-white/40 text-xs">Progress</span>
                      <span className="text-white/40 text-xs">
                        {challenge.progress?.completed || 0} / {challenge.targetCount}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${prog}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Challenge action panel */}
      {selectedChallenge && (
        <div className="px-5">
          <div className="bg-card border border-white/8 rounded-2xl p-5 space-y-3">
            <h3 className="text-white font-bold">{selectedChallenge.title}</h3>
            <p className="text-white/50 text-sm">{selectedChallenge.description}</p>
            <div className="flex items-center gap-3 text-sm">
              <span className="bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 rounded-lg px-3 py-1 font-semibold">
                +{selectedChallenge.xpReward} XP
              </span>
              <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg px-3 py-1 font-semibold">
                {selectedChallenge.targetCount} items
              </span>
            </div>
            {!isCompleted(selectedChallenge) ? (
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => handleStartChallenge(selectedChallenge)}
                  className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-400 transition-all blue-glow"
                >
                  <Flame className="w-4 h-4" /> Start Challenge
                </button>
                <button
                  onClick={() => handleCompleteChallenge(selectedChallenge)}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 font-medium hover:bg-white/10 transition-all"
                >
                  Mark Done
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center py-3 bg-green-400/10 border border-green-400/20 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-semibold">Completed!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="px-5 mt-5">
        <div className="bg-blue-500/5 border border-blue-500/15 rounded-2xl p-4">
          <p className="text-blue-400 font-semibold text-sm mb-1">💡 Tip</p>
          <p className="text-white/50 text-sm">Complete daily challenges to maintain your streak and climb the leaderboard!</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
