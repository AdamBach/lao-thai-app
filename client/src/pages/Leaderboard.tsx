import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Users, TrendingUp } from "lucide-react";

export default function Leaderboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("global");

  // Queries
  const globalLeaderboard = trpc.leaderboard.getGlobalLeaderboard.useQuery(
    { limit: 100 },
    { enabled: activeTab === "global" }
  );
  const userGlobalRank = trpc.leaderboard.getUserGlobalRank.useQuery(
    undefined,
    { enabled: !!user }
  );
  const friendLeaderboard = trpc.leaderboard.getFriendLeaderboard.useQuery(
    undefined,
    { enabled: activeTab === "friends" && !!user }
  );
  const weeklyLeaderboard = trpc.leaderboard.getWeeklyLeaderboard.useQuery(
    { limit: 100 },
    { enabled: activeTab === "weekly" }
  );
  const userWeeklyRank = trpc.leaderboard.getUserWeeklyRank.useQuery(
    undefined,
    { enabled: !!user }
  );
  const stats = trpc.leaderboard.getStats.useQuery();

  const renderRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-600" />;
    return <span className="text-sm font-semibold text-gray-600">#{rank}</span>;
  };

  const LeaderboardTable = ({ data, isLoading }: { data: any[]; isLoading: boolean }) => (
    <div className="space-y-2">
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">로딩 중...</div>
      ) : data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">데이터가 없습니다.</div>
      ) : (
        data.map((entry, index) => (
          <div
            key={entry.userId}
            className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
              entry.userId === user?.id
                ? "bg-blue-50 border-blue-200"
                : "bg-white border-gray-200 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-8 h-8 flex items-center justify-center">
                {renderRankBadge(entry.rank)}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{entry.name || "Unknown"}</div>
                <div className="text-sm text-gray-500">Lv. {entry.level || 1}</div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{entry.totalXP || 0}</div>
                <div className="text-xs text-gray-500">XP</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {(entry.averageAccuracy || 0).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">정확도</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{entry.streak || 0}</div>
                <div className="text-xs text-gray-500">연속</div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-500" />
            리더보드
          </h1>
          <p className="text-gray-600">전 세계 학습자들과 경쟁하세요</p>
        </div>

        {/* User Stats */}
        {user && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">글로벌 순위</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  #{userGlobalRank.data?.rank || "-"}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">주간 순위</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  #{userWeeklyRank.data?.rank || "-"}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">통계</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  <div>
                    전체 사용자: <span className="font-bold">{stats.data?.data?.totalUsers || 0}</span>
                  </div>
                  <div>
                    친구: <span className="font-bold">{stats.data?.data?.totalFriendships || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Leaderboard Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>순위표</CardTitle>
            <CardDescription>사용자들의 학습 진행 상황을 확인하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="global" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  글로벌
                </TabsTrigger>
                <TabsTrigger value="friends" className="flex items-center gap-2" disabled={!user}>
                  <Users className="w-4 h-4" />
                  친구
                </TabsTrigger>
                <TabsTrigger value="weekly" className="flex items-center gap-2">
                  <Medal className="w-4 h-4" />
                  주간
                </TabsTrigger>
              </TabsList>

              <TabsContent value="global" className="mt-6">
                <LeaderboardTable
                  data={globalLeaderboard.data?.data || []}
                  isLoading={globalLeaderboard.isLoading}
                />
              </TabsContent>

              <TabsContent value="friends" className="mt-6">
                {!user ? (
                  <div className="text-center py-8 text-gray-500">
                    친구 리더보드를 보려면 로그인하세요
                  </div>
                ) : (
                  <LeaderboardTable
                    data={friendLeaderboard.data?.data || []}
                    isLoading={friendLeaderboard.isLoading}
                  />
                )}
              </TabsContent>

              <TabsContent value="weekly" className="mt-6">
                <LeaderboardTable
                  data={weeklyLeaderboard.data?.data || []}
                  isLoading={weeklyLeaderboard.isLoading}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🏆 글로벌 리더보드</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              전 세계 학습자들의 총 XP 기준 순위입니다. 매일 업데이트됩니다.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📊 주간 리더보드</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              이번 주 동안의 학습 성과를 기반으로 순위가 결정됩니다. 매주 월요일에 리셋됩니다.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
