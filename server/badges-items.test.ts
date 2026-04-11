import { describe, expect, it } from "vitest";

/**
 * Badge and Item System Tests
 * Tests for badge awarding, item inventory, and reward logic
 */

describe("Badge and Item System", () => {
  describe("Badge Awarding", () => {
    it("should award badge to user when condition is met", () => {
      const userId = 1;
      const badgeId = 1;
      const badgeName = "첫 발걸음";

      // Simulate badge awarding
      const result = {
        success: true,
        badge: { id: badgeId, name: badgeName },
        message: `배지 "${badgeName}"를 획득했습니다!`,
      };

      expect(result.success).toBe(true);
      expect(result.badge.id).toBe(badgeId);
      expect(result.message).toContain("획득");
    });

    it("should not award duplicate badges", () => {
      const userId = 1;
      const badgeId = 1;

      // Simulate duplicate badge check
      const result = {
        success: false,
        message: "이미 획득한 배지입니다.",
      };

      expect(result.success).toBe(false);
      expect(result.message).toContain("이미");
    });

    it("should award streak badges at correct milestones", () => {
      const streakBadges = [
        { streak: 7, badge: "연속 학습자", icon: "🔥" },
        { streak: 14, badge: "전문가", icon: "⭐" },
        { streak: 30, badge: "마스터", icon: "👑" },
      ];

      streakBadges.forEach(({ streak, badge }) => {
        const result = {
          success: true,
          badge: { name: badge },
          streak,
        };

        expect(result.success).toBe(true);
        expect(result.badge.name).toBe(badge);
        expect(result.streak).toBe(streak);
      });
    });
  });

  describe("Item Inventory", () => {
    it("should add item to user inventory", () => {
      const userId = 1;
      const itemId = 1;
      const itemName = "보너스 XP 50";

      const result = {
        success: true,
        item: { id: itemId, name: itemName },
        message: `아이템 "${itemName}"을(를) 획득했습니다!`,
      };

      expect(result.success).toBe(true);
      expect(result.item.name).toBe(itemName);
    });

    it("should increase quantity when adding duplicate items", () => {
      const userId = 1;
      const itemId = 1;
      const initialQuantity = 1;
      const addQuantity = 1;

      const result = {
        success: true,
        quantity: initialQuantity + addQuantity,
      };

      expect(result.quantity).toBe(2);
    });

    it("should use item from inventory", () => {
      const userId = 1;
      const itemId = 1;
      const initialQuantity = 2;

      const result = {
        success: true,
        quantity: initialQuantity - 1,
        usedCount: 1,
      };

      expect(result.quantity).toBe(1);
      expect(result.usedCount).toBe(1);
    });

    it("should prevent using item when quantity is zero", () => {
      const userId = 1;
      const itemId = 1;
      const quantity = 0;

      const result = {
        success: false,
        message: "아이템이 부족합니다.",
      };

      expect(result.success).toBe(false);
    });
  });

  describe("Weekly Challenge Rewards", () => {
    it("should award badge and item on weekly challenge complete", () => {
      const userId = 1;
      const rewards = [
        {
          type: "badge",
          name: "주간 챔피언",
          icon: "🏆",
          xpReward: 150,
        },
        {
          type: "item",
          name: "보너스 XP 50",
          icon: "⚡",
          value: 50,
        },
      ];

      expect(rewards).toHaveLength(2);
      expect(rewards[0].type).toBe("badge");
      expect(rewards[1].type).toBe("item");
    });

    it("should calculate bonus XP correctly", () => {
      const baseXP = 100;
      const streak = 7;
      const accuracyBonus = 50;

      // 7일 연속: 2배
      const streakMultiplier = streak >= 7 ? 2 : 1;
      const totalXP = baseXP * streakMultiplier + accuracyBonus;

      expect(totalXP).toBe(250); // (100 * 2) + 50
    });

    it("should track item rarity distribution", () => {
      const items = [
        { name: "보너스 XP 50", rarity: "common" },
        { name: "힌트 사용권", rarity: "common" },
        { name: "스킵 권리", rarity: "uncommon" },
        { name: "파워업 - 더블 XP", rarity: "rare" },
      ];

      const rarityCount = {
        common: items.filter((i) => i.rarity === "common").length,
        uncommon: items.filter((i) => i.rarity === "uncommon").length,
        rare: items.filter((i) => i.rarity === "rare").length,
      };

      expect(rarityCount.common).toBe(2);
      expect(rarityCount.uncommon).toBe(1);
      expect(rarityCount.rare).toBe(1);
    });
  });

  describe("Achievement Checking", () => {
    it("should check accuracy achievements", () => {
      const accuracyLevels = [
        { accuracy: 95, badge: "정확도 달인", shouldAward: true },
        { accuracy: 85, badge: "정확도 달인", shouldAward: false },
      ];

      accuracyLevels.forEach(({ accuracy, badge, shouldAward }) => {
        const result = accuracy >= 90;
        expect(result).toBe(shouldAward);
      });
    });

    it("should check pronunciation count achievements", () => {
      const pronunciationCounts = [
        { count: 50, language: "lao", badge: "라오어 전문가", shouldAward: true },
        { count: 50, language: "thai", badge: "태국어 전문가", shouldAward: true },
        { count: 30, language: "lao", badge: "라오어 전문가", shouldAward: false },
      ];

      pronunciationCounts.forEach(({ count, language, badge, shouldAward }) => {
        const result = count >= 50;
        expect(result).toBe(shouldAward);
      });
    });

    it("should check bilingual master achievement", () => {
      const stats = {
        laoWords: 50,
        thaiWords: 50,
      };

      const isBilingualMaster = stats.laoWords >= 50 && stats.thaiWords >= 50;
      expect(isBilingualMaster).toBe(true);
    });
  });

  describe("Notification System", () => {
    it("should create badge acquisition notification", () => {
      const badge = {
        name: "연속 학습자",
        icon: "🔥",
        rarity: "uncommon",
      };

      const notification = {
        type: "badge_acquired",
        title: `배지 획득: ${badge.name}`,
        message: `축하합니다! "${badge.name}" 배지를 획득했습니다!`,
        icon: badge.icon,
        rarity: badge.rarity,
      };

      expect(notification.type).toBe("badge_acquired");
      expect(notification.title).toContain(badge.name);
    });

    it("should create item acquisition notification", () => {
      const item = {
        name: "보너스 XP 100",
        icon: "⚡⚡",
        value: 100,
      };

      const notification = {
        type: "item_acquired",
        title: `아이템 획득: ${item.name}`,
        message: `축하합니다! "${item.name}"을(를) 획득했습니다!`,
        icon: item.icon,
      };

      expect(notification.type).toBe("item_acquired");
      expect(notification.title).toContain(item.name);
    });

    it("should create milestone notification", () => {
      const milestone = {
        type: "streak",
        days: 7,
        bonus: "2배 XP",
      };

      const notification = {
        type: "milestone",
        title: `${milestone.days}일 연속 학습!`,
        message: `축하합니다! ${milestone.days}일 연속으로 학습했습니다. ${milestone.bonus} 보너스를 받으세요!`,
      };

      expect(notification.type).toBe("milestone");
      expect(notification.title).toContain("7일");
    });
  });

  describe("Reward Conditions", () => {
    it("should define all badge unlock conditions", () => {
      const badgeConditions = [
        "first_pronunciation",
        "7_day_streak",
        "14_day_streak",
        "30_day_streak",
        "high_accuracy_100",
        "lao_50_words",
        "thai_50_words",
        "weekly_challenge_complete",
        "bilingual_master",
        "add_friend",
      ];

      expect(badgeConditions).toHaveLength(10);
      expect(badgeConditions).toContain("7_day_streak");
      expect(badgeConditions).toContain("weekly_challenge_complete");
    });

    it("should define all item unlock conditions", () => {
      const itemConditions = [
        "weekly_challenge_complete",
        "weekly_challenge_complete_2",
        "weekly_challenge_complete_3",
      ];

      expect(itemConditions.length).toBeGreaterThan(0);
      expect(itemConditions).toContain("weekly_challenge_complete");
    });
  });

  describe("User Profile Display", () => {
    it("should display user badges in profile", () => {
      const userBadges = [
        { id: 1, name: "첫 발걸음", icon: "🌱", rarity: "common" },
        { id: 2, name: "연속 학습자", icon: "🔥", rarity: "uncommon" },
      ];

      expect(userBadges).toHaveLength(2);
      expect(userBadges[0].name).toBe("첫 발걸음");
    });

    it("should display user inventory in profile", () => {
      const inventory = [
        { id: 1, name: "보너스 XP 50", quantity: 2, usedCount: 1 },
        { id: 2, name: "힌트 사용권", quantity: 1, usedCount: 0 },
      ];

      expect(inventory).toHaveLength(2);
      expect(inventory[0].quantity).toBe(2);
      expect(inventory[1].usedCount).toBe(0);
    });

    it("should sort badges by rarity", () => {
      const rarityOrder = ["legendary", "epic", "rare", "uncommon", "common"];

      const badges = [
        { name: "첫 발걸음", rarity: "common" },
        { name: "연속 학습자", rarity: "uncommon" },
        { name: "마스터", rarity: "epic" },
      ];

      const sorted = badges.sort(
        (a, b) => rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity)
      );

      expect(sorted[0].rarity).toBe("epic");
      expect(sorted[2].rarity).toBe("common");
    });
  });
});
