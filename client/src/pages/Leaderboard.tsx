"use client";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Trophy, Medal, Users, TrendingUp, Loader2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";

type Tab = "global" | "friends" | "weekly";

export default function Leaderboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("global");

  const globalLeaderboard = trpc.leaderboard.getGlobalLeaderboard.useQuery(
    { limit: 100 }, { enabled: activeTab === "global" }
  );
  const userGlobalRank = trpc.leaderboard.getUserGlobalRank.useQuery(undefined, { enabled: !!user });
  const friendLeaderboard = trpc.leaderboard.getFriendLeaderboard.useQuery(
    undefined, { enabled: activeTab === "friends" && !!user }
  );
  const weeklyLeaderboard = trpc.leaderboard.getWeeklyLeaderboard.useQuery(
    { limit: 100 }, { enabled: activeTab === "weekly" }
  );
  const userWeeklyRank = trpc.leaderboard.getUserWeeklyRank.useQuery(undefined, { enabled: !!user });
  const stats = trpc.leaderboard.getStats.useQuery();

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <span className="text-xl">🥇</span>;
    if (rank === 2) return <span className="text-xl">🥈</span>;
    if (rank === 3) return <span className="text-xl">🥉</span>;
    return <span className="text-sm font-bold text-white/40">#{rank}</span>;
  };

  const getActiveData = () => {
    if (activeTab === "global") return { data: globalLeaderboard.data?.data || [], isLoading: globalLeaderboard.isLoading };
    if (activeTab === "weekly") return { data: weeklyLeaderboard.data?.data || [], isLoading: weeklyLeaderboard.isLoading };
    return { data: friendLeaderboard.data?.data || [], isLoading: friendLeaderboard.isLoading };
  };

  const { data: entries, isLoading } = getActiveData();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
        </div>
        <p className="text-white/40 text-sm">Compete with learners worldwide</p>
      </div>

      {/* User rank cards */}
      {user && (
        <div className="px-5 mb-4">
          <div className="bg-card border border-white/8 rounded-2xl p-4 grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-blue-400 font-bold text-lg">#{userGlobalRank.data?.rank || "—"}</div>
              <div className="text-white/40 text-xs">Global Rank</div>
            </div>
            <div className="text-center border-x border-white/8">
              <div className="text-purple-400 font-bold text-lg">#{userWeeklyRank.data?.rank || "—"}</div>
              <div className="text-white/40 text-xs">Weekly Rank</div>
            </div>
            <div className="text-center">
              <div className="text-white/60 font-bold text-lg">{stats.data?.data?.totalUsers || 0}</div>
              <div className="text-white/40 text-xs">Total Players</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-5 mb-4">
        <div className="flex bg-card border border-white/8 rounded-xl overflow-hidden">
          {([
            { key: "global" as Tab, label: "Global", icon: <TrendingUp className="w-3.5 h-3.5" /> },
            { key: "friends" as Tab, label: "Friends", icon: <Users className="w-3.5 h-3.5" /> },
            { key: "weekly" as Tab, label: "Weekly", icon: <Medal className="w-3.5 h-3.5" /> },
          ]).map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              disabled={key === "friends" && !user}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === key ? "bg-blue-500 text-white" : "text-white/40 hover:text-white/70 disabled:opacity-30 disabled:cursor-not-allowed"
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard list */}
      <div className="px-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        ) : activeTab === "friends" && !user ? (
          <div className="bg-card border border-white/8 rounded-2xl p-8 text-center">
            <Users className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">Log in to see your friends leaderboard</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-card border border-white/8 rounded-2xl p-8 text-center">
            <Trophy className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">No data yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry: any) => {
              const isMe = entry.userId === user?.id;
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                    isMe
                      ? "bg-blue-500/10 border-blue-500/30"
                      : "bg-card border-white/8 hover:border-white/15"
                  }`}
                >
                  {/* Rank */}
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                    isMe ? "bg-blue-500/30 text-blue-300" : "bg-white/10 text-white/50"
                  }`}>
                    {(entry.name || "?")[0].toUpperCase()}
                  </div>

                  {/* Name & level */}
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-sm truncate ${isMe ? "text-blue-300" : "text-white"}`}>
                      {entry.name || "Anonymous"} {isMe && <span className="text-blue-400/70 text-xs">(you)</span>}
                    </div>
                    <div className="text-white/30 text-xs">Lv. {entry.level || 1}</div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-yellow-400 font-bold text-sm">{entry.totalXP || 0}</div>
                      <div className="text-white/30 text-xs">XP</div>
                    </div>
                    <div>
                      <div className="text-green-400 font-bold text-sm">{(entry.averageAccuracy || 0).toFixed(0)}%</div>
                      <div className="text-white/30 text-xs">Acc.</div>
                    </div>
                    <div>
                      <div className="text-orange-400 font-bold text-sm">{entry.streak || 0}</div>
                      <div className="text-white/30 text-xs">🔥</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info cards */}
      <div className="px-5 mt-5 grid grid-cols-2 gap-3">
        <div className="bg-card border border-white/8 rounded-2xl p-4">
          <p className="text-white font-semibold text-sm mb-1">🏆 Global</p>
          <p className="text-white/40 text-xs">Ranked by total XP. Updated daily.</p>
        </div>
        <div className="bg-card border border-white/8 rounded-2xl p-4">
          <p className="text-white font-semibold text-sm mb-1">📊 Weekly</p>
          <p className="text-white/40 text-xs">Resets every Monday. Win prizes!</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
