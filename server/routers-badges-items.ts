import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getAllBadges,
  getBadgeById,
  getUserBadges,
  awardBadgeToUser,
  getAllSpecialItems,
  getSpecialItemById,
  getUserInventory,
  addItemToInventory,
  useItemFromInventory,
  getBadgeByUnlockCondition,
  getSpecialItemByUnlockCondition,
} from "./db-badges-items";
import { getUserStatistics, updateChallengeProgress } from "./db";

/**
 * Badge and Item routers
 */
export const badgesItemsRouter = router({
  // Get all badges
  getAllBadges: protectedProcedure.query(async () => {
    return await getAllBadges();
  }),

  // Get user badges
  getUserBadges: protectedProcedure.query(async ({ ctx }) => {
    return await getUserBadges(ctx.user.id);
  }),

  // Award badge to user (internal use)
  awardBadge: protectedProcedure
    .input(z.object({ badgeId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const badge = await getBadgeById(input.badgeId);
      if (!badge) {
        throw new Error("Badge not found");
      }

      await awardBadgeToUser(ctx.user.id, input.badgeId);

      return {
        success: true,
        badge,
        message: `배지 "${badge.name}"를 획득했습니다!`,
      };
    }),

  // Check and award badge by condition
  checkAndAwardBadge: protectedProcedure
    .input(z.object({ condition: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const badge = await getBadgeByUnlockCondition(input.condition);
      if (!badge) {
        return { success: false, message: "해당 조건의 배지가 없습니다." };
      }

      const userBadges = await getUserBadges(ctx.user.id);
      const alreadyHas = userBadges.some((ub) => ub.badgeId === badge.id);

      if (alreadyHas) {
        return { success: false, message: "이미 획득한 배지입니다." };
      }

      await awardBadgeToUser(ctx.user.id, badge.id);

      return {
        success: true,
        badge,
        message: `배지 "${badge.name}"를 획득했습니다!`,
      };
    }),

  // Get all special items
  getAllSpecialItems: protectedProcedure.query(async () => {
    return await getAllSpecialItems();
  }),

  // Get user inventory
  getUserInventory: protectedProcedure.query(async ({ ctx }) => {
    return await getUserInventory(ctx.user.id);
  }),

  // Add item to inventory
  addItemToInventory: protectedProcedure
    .input(z.object({ itemId: z.number(), quantity: z.number().optional() }))
    .mutation(async ({ input, ctx }) => {
      const item = await getSpecialItemById(input.itemId);
      if (!item) {
        throw new Error("Item not found");
      }

      await addItemToInventory(ctx.user.id, input.itemId, input.quantity || 1);

      return {
        success: true,
        item,
        message: `아이템 "${item.name}"을(를) 획득했습니다!`,
      };
    }),

  // Use item from inventory
  useItem: protectedProcedure
    .input(z.object({ itemId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const item = await getSpecialItemById(input.itemId);
      if (!item) {
        throw new Error("Item not found");
      }

      await useItemFromInventory(ctx.user.id, input.itemId);

      return {
        success: true,
        item,
        message: `아이템 "${item.name}"을(를) 사용했습니다!`,
      };
    }),

  // Check and award item by condition
  checkAndAwardItem: protectedProcedure
    .input(z.object({ condition: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const item = await getSpecialItemByUnlockCondition(input.condition);
      if (!item) {
        return { success: false, message: "해당 조건의 아이템이 없습니다." };
      }

      await addItemToInventory(ctx.user.id, item.id, 1);

      return {
        success: true,
        item,
        message: `아이템 "${item.name}"을(를) 획득했습니다!`,
      };
    }),

  // Check achievements and award rewards
  checkAchievements: protectedProcedure.mutation(async ({ ctx }) => {
    const stats = await getUserStatistics(ctx.user.id);
    if (!stats) {
      return { success: false, message: "사용자 통계를 찾을 수 없습니다." };
    }

    const rewards = [];

    // Check streak achievements
    if (stats.streak === 7) {
      const result = await checkAndAwardBadge(ctx.user.id, "7_day_streak");
      if (result.success) rewards.push(result);
    }

    if (stats.streak === 14) {
      const result = await checkAndAwardBadge(ctx.user.id, "14_day_streak");
      if (result.success) rewards.push(result);
    }

    if (stats.streak === 30) {
      const result = await checkAndAwardBadge(ctx.user.id, "30_day_streak");
      if (result.success) rewards.push(result);
    }

    // Check accuracy achievements
    const avgAccuracy = typeof stats.averageAccuracy === 'string' 
      ? parseFloat(stats.averageAccuracy) 
      : stats.averageAccuracy;
    if (avgAccuracy >= 90) {
      const result = await checkAndAwardBadge(ctx.user.id, "high_accuracy_100");
      if (result.success) rewards.push(result);
    }

    return {
      success: true,
      rewards,
      message: rewards.length > 0 ? `${rewards.length}개의 보상을 획득했습니다!` : "새로운 보상이 없습니다.",
    };
  }),
});

/**
 * Helper function to check and award badge
 */
async function checkAndAwardBadge(userId: number, condition: string) {
  const badge = await getBadgeByUnlockCondition(condition);
  if (!badge) {
    return { success: false, message: "해당 조건의 배지가 없습니다." };
  }

  const userBadges = await getUserBadges(userId);
  const alreadyHas = userBadges.some((ub) => ub.badgeId === badge.id);

  if (alreadyHas) {
    return { success: false, message: "이미 획득한 배지입니다." };
  }

  await awardBadgeToUser(userId, badge.id);

  return {
    success: true,
    badge,
    message: `배지 "${badge.name}"를 획득했습니다!`,
  };
}

/**
 * Helper function to check and award item
 */
async function checkAndAwardItem(userId: number, condition: string) {
  const item = await getSpecialItemByUnlockCondition(condition);
  if (!item) {
    return { success: false, message: "해당 조건의 아이템이 없습니다." };
  }

  await addItemToInventory(userId, item.id, 1);

  return {
    success: true,
    item,
    message: `아이템 "${item.name}"을(를) 획득했습니다!`,
  };
}

/**
 * Function to award weekly challenge rewards
 */
export async function awardWeeklyChallengeRewards(userId: number) {
  const rewards = [];

  // Award badge
  const badgeResult = await checkAndAwardBadge(userId, "weekly_challenge_complete");
  if (badgeResult.success) {
    rewards.push(badgeResult);
  }

  // Award special item
  const itemResult = await checkAndAwardItem(userId, "weekly_challenge_complete");
  if (itemResult.success) {
    rewards.push(itemResult);
  }

  return rewards;
}
