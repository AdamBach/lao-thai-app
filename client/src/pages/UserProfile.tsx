import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, LogOut, Trophy, Zap, Gift, Settings } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface Badge {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  rarity: string;
  xpReward: number;
  unlockedAt?: string;
}

interface InventoryItem {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  itemType: string;
  value: number;
  rarity: string;
  quantity: number;
  usedCount: number;
}

export default function UserProfile() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user stats
  const userStatsQuery = trpc.pronunciation.getUserStats.useQuery();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (userStatsQuery.data) {
          setUserStats(userStatsQuery.data);
        }
        // TODO: Fetch badges and inventory from API
        // For now, we'll use mock data
        setBadges([]);
        setInventory([]);
      } catch (error) {
        console.error("Error loading profile data:", error);
        toast.error("프로필 데이터를 불러올 수 없습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userStatsQuery.data]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      toast.success("로그아웃되었습니다.");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("로그아웃 중 오류가 발생했습니다.");
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "bg-yellow-100 border-yellow-300 text-yellow-900";
      case "epic":
        return "bg-purple-100 border-purple-300 text-purple-900";
      case "rare":
        return "bg-blue-100 border-blue-300 text-blue-900";
      case "uncommon":
        return "bg-green-100 border-green-300 text-green-900";
      default:
        return "bg-gray-100 border-gray-300 text-gray-900";
    }
  };

  const getItemTypeLabel = (itemType: string) => {
    const labels: Record<string, string> = {
      bonus_xp: "보너스 XP",
      hint: "힌트",
      skip: "스킵",
      power_up: "파워업",
      cosmetic: "코스메틱",
    };
    return labels[itemType] || itemType;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="p-8 bg-white shadow-lg text-center">
          <p className="text-gray-600 mb-4">로그인이 필요합니다.</p>
          <Button onClick={() => navigate("/")} className="bg-indigo-600 hover:bg-indigo-700">
            홈으로 돌아가기
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="gap-2"
              size="lg"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </Button>
          </div>
        </div>

        {/* User Stats */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6 bg-white shadow-lg border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">레벨</p>
                  <p className="text-3xl font-bold text-blue-600">{userStats.level}</p>
                </div>
                <Trophy className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </Card>

            <Card className="p-6 bg-white shadow-lg border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">총 XP</p>
                  <p className="text-3xl font-bold text-yellow-600">{userStats.totalXP}</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-500 opacity-50" />
              </div>
            </Card>

            <Card className="p-6 bg-white shadow-lg border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">연속 일수</p>
                  <p className="text-3xl font-bold text-red-600">{userStats.streak}</p>
                </div>
                <span className="text-3xl">🔥</span>
              </div>
            </Card>

            <Card className="p-6 bg-white shadow-lg border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">평균 정확도</p>
                  <p className="text-3xl font-bold text-green-600">
                    {Math.round(userStats.averageAccuracy)}%
                  </p>
                </div>
                <span className="text-3xl">🎯</span>
              </div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="badges" className="bg-white rounded-lg shadow-lg p-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="badges" className="gap-2">
              <Trophy className="w-4 h-4" />
              배지 ({badges.length})
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-2">
              <Gift className="w-4 h-4" />
              인벤토리 ({inventory.length})
            </TabsTrigger>
          </TabsList>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-4">
            {badges.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">아직 배지를 획득하지 못했습니다.</p>
                <p className="text-gray-500 text-sm">
                  챌린지를 완료하고 특별한 조건을 달성하여 배지를 획득하세요!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((badge) => (
                  <Card
                    key={badge.id}
                    className={`p-6 border-2 ${getRarityColor(badge.rarity)}`}
                  >
                    <div className="text-center">
                      <div className="text-5xl mb-3">{badge.icon || "🏆"}</div>
                      <h3 className="text-lg font-bold mb-2">{badge.name}</h3>
                      <p className="text-sm mb-3">{badge.description}</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs font-semibold px-2 py-1 bg-white bg-opacity-50 rounded">
                          {badge.rarity.toUpperCase()}
                        </span>
                        <span className="text-xs font-semibold px-2 py-1 bg-white bg-opacity-50 rounded">
                          +{badge.xpReward} XP
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            {inventory.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">아직 특별한 아이템을 획득하지 못했습니다.</p>
                <p className="text-gray-500 text-sm">
                  주간 챌린지를 완료하여 특별한 아이템을 획득하세요!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inventory.map((item) => (
                  <Card
                    key={item.id}
                    className={`p-6 border-2 ${getRarityColor(item.rarity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-3xl">{item.icon || "🎁"}</div>
                          <div>
                            <h3 className="text-lg font-bold">{item.name}</h3>
                            <p className="text-xs font-semibold">
                              {getItemTypeLabel(item.itemType)}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm mb-3">{item.description}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold px-2 py-1 bg-white bg-opacity-50 rounded">
                            {item.rarity.toUpperCase()}
                          </span>
                          {item.value > 0 && (
                            <span className="text-xs font-semibold px-2 py-1 bg-white bg-opacity-50 rounded">
                              +{item.value}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-indigo-600 mb-1">
                          {item.quantity}
                        </div>
                        <p className="text-xs text-gray-600">보유 중</p>
                        {item.usedCount > 0 && (
                          <p className="text-xs text-gray-600 mt-1">
                            사용함: {item.usedCount}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Settings Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">설정</h2>
          </div>

          <div className="space-y-4">
            <Card className="p-4 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-2">계정 정보</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600">이름</p>
                  <p className="font-semibold text-gray-900">{user.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">이메일</p>
                  <p className="font-semibold text-gray-900">{user.email}</p>
                </div>
                <div>
                  <p className="text-gray-600">로그인 방법</p>
                  <p className="font-semibold text-gray-900">{user.loginMethod}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-2">학습 통계</h3>
              {userStats && (
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-600">총 발음 연습 횟수</p>
                    <p className="font-semibold text-gray-900">
                      {userStats.totalPronunciationAttempts}회
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">평균 정확도</p>
                    <p className="font-semibold text-gray-900">
                      {Math.round(userStats.averageAccuracy)}%
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
