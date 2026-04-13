"use client";
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { TrendingUp, Target, Clock, Zap, BookOpen } from "lucide-react";
import { useLocation } from "wouter";
import BottomNav from "@/components/BottomNav";

type Category = "numbers" | "days" | "months" | "time" | "phrases";

const categories: Array<{ value: Category; label: string; icon: string }> = [
  { value: "numbers", label: "Numbers", icon: "🔢" },
  { value: "days", label: "Days of the week", icon: "📅" },
  { value: "months", label: "Months", icon: "🗓️" },
  { value: "time", label: "Time", icon: "⏰" },
  { value: "phrases", label: "Basic phrases", icon: "💬" },
];

export default function Statistics() {
  const [, navigate] = useLocation();
  const { data: stats, isLoading } = trpc.review.getStats.useQuery({});

  const overall = useMemo(() => {
    if (!stats) return { totalReviews: 0, totalCorrect: 0, overallAccuracy: 0, totalTimeSpent: 0, streak: 0 };
    return {
      totalReviews: stats.totalSessions || 0,
      totalCorrect: stats.totalCorrect || 0,
      overallAccuracy: stats.averageAccuracy || 0,
      totalTimeSpent: (stats.totalSessions || 0) * 300,
      streak: 0,
    };
  }, [stats]);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white/40">Loading statistics...</div>
      </div>
    );
  }

  const itemsPerCat = Math.ceil((stats?.totalItems || 0) / categories.length);
  const donePerCat = Math.floor((stats?.totalCorrect || 0) / categories.length);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-white">Statistics</h1>
        <p className="text-white/40 text-sm mt-0.5">Your learning progress at a glance</p>
      </div>

      {/* Overall stats */}
      <div className="px-5 mb-5 grid grid-cols-2 gap-3">
        <div className="bg-card border border-white/8 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/40 text-xs">Reviews</span>
            <TrendingUp className="w-4 h-4 text-blue-400/50" />
          </div>
          <div className="text-2xl font-bold text-white">{overall.totalReviews}</div>
        </div>
        <div className="bg-card border border-white/8 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/40 text-xs">Accuracy</span>
            <Target className="w-4 h-4 text-green-400/50" />
          </div>
          <div className="text-2xl font-bold text-white">{overall.overallAccuracy.toFixed(1)}%</div>
        </div>
        <div className="bg-card border border-white/8 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/40 text-xs">Study time</span>
            <Clock className="w-4 h-4 text-purple-400/50" />
          </div>
          <div className="text-2xl font-bold text-white">{formatTime(overall.totalTimeSpent)}</div>
        </div>
        <div className="bg-card border border-white/8 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/40 text-xs">Day streak</span>
            <Zap className="w-4 h-4 text-orange-400/50" />
          </div>
          <div className="text-2xl font-bold text-white">{overall.streak} 🔥</div>
        </div>
      </div>

      {/* Category progress */}
      <div className="px-5 mb-5">
        <p className="text-white/40 text-xs uppercase tracking-wider mb-3 font-medium">Category Progress</p>
        <div className="space-y-3">
          {categories.map((cat) => {
            const pct = itemsPerCat > 0 ? (donePerCat / itemsPerCat) * 100 : 0;
            const accColor = overall.overallAccuracy >= 80 ? "text-green-400"
              : overall.overallAccuracy >= 60 ? "text-blue-400" : "text-orange-400";

            return (
              <div key={cat.value} className="bg-card border border-white/8 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cat.icon}</span>
                    <div>
                      <div className="text-white font-semibold text-sm">{cat.label}</div>
                      <div className="text-white/30 text-xs">{donePerCat}/{itemsPerCat} done</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${accColor}`}>
                      {overall.overallAccuracy.toFixed(0)}%
                    </div>
                    <div className="text-white/30 text-xs">{formatTime(Math.floor(overall.totalTimeSpent / categories.length))}</div>
                  </div>
                </div>
                <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-5 flex gap-3">
        <button
          onClick={() => navigate("/lessons")}
          className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
        >
          <BookOpen className="w-4 h-4" /> Back to Lessons
        </button>
        <button
          onClick={() => navigate("/review")}
          className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-400 transition-all blue-glow"
        >
          Continue Review
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
