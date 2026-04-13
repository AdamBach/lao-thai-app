"use client";
import { useState, useEffect } from "react";
import { Loader2, LogOut, Trophy, Zap, Gift, Settings, User } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useLocation } from "wouter";
import BottomNav from "@/components/BottomNav";

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

type Tab = "badges" | "inventory" | "settings";

const rarityBorder: Record<string, string> = {
  legendary: "border-yellow-400/50 bg-yellow-400/5",
  epic: "border-purple-400/50 bg-purple-400/5",
  rare: "border-blue-400/50 bg-blue-400/5",
  uncommon: "border-green-400/50 bg-green-400/5",
  common: "border-white/10 bg-white/5",
};

const rarityLabel: Record<string, string> = {
  legendary: "text-yellow-400",
  epic: "text-purple-400",
  rare: "text-blue-400",
  uncommon: "text-green-400",
  common: "text-white/40",
};

const itemTypeLabel: Record<string, string> = {
  bonus_xp: "Bonus XP",
  hint: "Hint",
  skip: "Skip",
  power_up: "Power Up",
  cosmetic: "Cosmetic",
};

export default function UserProfile() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("badges");

  const userStatsQuery = trpc.pronunciation.getUserStats.useQuery();

  useEffect(() => {
    setIsLoading(true);
    if (userStatsQuery.data) setUserStats(userStatsQuery.data);
    setBadges([]);
    setInventory([]);
    setIsLoading(false);
  }, [userStatsQuery.data]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      toast.success("Logged out successfully.");
    } catch {
      toast.error("Error logging out.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <div className="bg-card border border-white/8 rounded-2xl p-8 text-center max-w-sm w-full">
          <User className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 mb-5">Please log in to view your profile.</p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-400 transition-all blue-glow"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <span className="text-xl font-bold text-blue-400">
                {(user.name || user.email || "?")[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">{user.name || "User"}</h1>
              <p className="text-white/40 text-sm">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white/50 hover:text-white hover:bg-white/10 transition-all text-sm"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* Stats strip */}
        {userStats && (
          <div className="bg-card border border-white/8 rounded-2xl p-4 grid grid-cols-4 gap-2">
            <div className="text-center">
              <div className="text-blue-400 font-bold text-lg">{userStats.level || 1}</div>
              <div className="text-white/40 text-xs">Level</div>
            </div>
            <div className="text-center border-x border-white/8">
              <div className="text-yellow-400 font-bold text-lg">{userStats.totalXP || 0}</div>
              <div className="text-white/40 text-xs">XP ⚡</div>
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
        )}
      </div>

      {/* Tabs */}
      <div className="px-5 mb-4">
        <div className="flex bg-card border border-white/8 rounded-xl overflow-hidden">
          {(["badges", "inventory", "settings"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors capitalize ${
                activeTab === tab ? "bg-blue-500 text-white" : "text-white/40 hover:text-white/70"
              }`}
            >
              {tab === "badges" ? `🏆 Badges` : tab === "inventory" ? `🎁 Items` : `⚙️ Settings`}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5">
        {/* Badges */}
        {activeTab === "badges" && (
          badges.length === 0 ? (
            <div className="bg-card border border-white/8 rounded-2xl p-10 text-center">
              <Trophy className="w-12 h-12 text-white/15 mx-auto mb-3" />
              <p className="text-white/40 font-medium">No badges yet</p>
              <p className="text-white/25 text-sm mt-1">Complete challenges to earn your first badge!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {badges.map((badge) => (
                <div key={badge.id} className={`border rounded-2xl p-4 text-center ${rarityBorder[badge.rarity] || rarityBorder.common}`}>
                  <div className="text-4xl mb-2">{badge.icon || "🏆"}</div>
                  <h3 className="text-white font-semibold text-sm mb-1">{badge.name}</h3>
                  <p className="text-white/40 text-xs mb-2">{badge.description}</p>
                  <span className={`text-xs font-bold uppercase ${rarityLabel[badge.rarity] || "text-white/40"}`}>
                    {badge.rarity}
                  </span>
                </div>
              ))}
            </div>
          )
        )}

        {/* Inventory */}
        {activeTab === "inventory" && (
          inventory.length === 0 ? (
            <div className="bg-card border border-white/8 rounded-2xl p-10 text-center">
              <Gift className="w-12 h-12 text-white/15 mx-auto mb-3" />
              <p className="text-white/40 font-medium">No items yet</p>
              <p className="text-white/25 text-sm mt-1">Complete weekly challenges to earn special items!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {inventory.map((item) => (
                <div key={item.id} className={`border rounded-2xl p-4 flex items-start justify-between ${rarityBorder[item.rarity] || rarityBorder.common}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-2xl">{item.icon || "🎁"}</span>
                      <div>
                        <h3 className="text-white font-semibold text-sm">{item.name}</h3>
                        <span className="text-white/40 text-xs">{itemTypeLabel[item.itemType] || item.itemType}</span>
                      </div>
                    </div>
                    <p className="text-white/40 text-xs">{item.description}</p>
                  </div>
                  <div className="text-right ml-3">
                    <div className="text-blue-400 font-bold text-xl">×{item.quantity}</div>
                    <p className="text-white/30 text-xs">owned</p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <div className="space-y-3">
            {/* Account info */}
            <div className="bg-card border border-white/8 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4 text-white/40" /> Account
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Name</p>
                  <p className="text-white font-medium">{user.name || "—"}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Email</p>
                  <p className="text-white font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Login Method</p>
                  <p className="text-white font-medium capitalize">{user.loginMethod || "email"}</p>
                </div>
              </div>
            </div>

            {/* Learning stats */}
            {userStats && (
              <div className="bg-card border border-white/8 rounded-2xl p-5">
                <h3 className="text-white font-semibold mb-3">Learning Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 text-sm">Total pronunciation attempts</span>
                    <span className="text-white font-bold">{userStats.totalPronunciationAttempts || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 text-sm">Average accuracy</span>
                    <span className="text-white font-bold">{Math.round(userStats.averageAccuracy || 0)}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Upgrade banner */}
            <div className="bg-gradient-to-r from-blue-600/15 to-purple-600/15 border border-blue-500/20 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold mb-1">Go Premium 🚀</p>
                  <p className="text-white/50 text-xs">Unlock all lessons + AI pronunciation</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-400 font-bold">$9.99</p>
                  <p className="text-white/30 text-xs">/month</p>
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/50 font-medium flex items-center justify-center gap-2 hover:bg-white/10 hover:text-white/80 transition-all"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
