import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  getGlobalLeaderboard,
  getUserGlobalRank,
  getFriendLeaderboard,
  getWeeklyLeaderboard,
  getUserWeeklyRank,
  addFriendship,
  acceptFriendship,
  getFriendRequests,
  recordWeeklyLeaderboardSnapshot,
  getLeaderboardStats,
} from "./db-leaderboard";

export const leaderboardRouter = router({
  /**
   * Get global leaderboard
   */
  getGlobalLeaderboard: publicProcedure
    .input(z.object({ limit: z.number().max(100).default(50) }))
    .query(async ({ input }) => {
      try {
        const leaderboard = await getGlobalLeaderboard(input.limit);
        return {
          success: true,
          data: leaderboard,
          total: leaderboard.length,
        };
      } catch (error) {
        console.error("Failed to get global leaderboard:", error);
        return {
          success: false,
          data: [],
          total: 0,
          error: "Failed to fetch global leaderboard",
        };
      }
    }),

  /**
   * Get user's rank in global leaderboard
   */
  getUserGlobalRank: protectedProcedure.query(async ({ ctx }) => {
    try {
      const rank = await getUserGlobalRank(ctx.user.id);
      return {
        success: true,
        rank: rank || 0,
      };
    } catch (error) {
      console.error("Failed to get user global rank:", error);
      return {
        success: false,
        rank: 0,
        error: "Failed to fetch user rank",
      };
    }
  }),

  /**
   * Get friend leaderboard
   */
  getFriendLeaderboard: protectedProcedure.query(async ({ ctx }) => {
    try {
      const leaderboard = await getFriendLeaderboard(ctx.user.id);
      return {
        success: true,
        data: leaderboard,
        total: leaderboard.length,
      };
    } catch (error) {
      console.error("Failed to get friend leaderboard:", error);
      return {
        success: false,
        data: [],
        total: 0,
        error: "Failed to fetch friend leaderboard",
      };
    }
  }),

  /**
   * Get weekly leaderboard
   */
  getWeeklyLeaderboard: publicProcedure
    .input(z.object({ limit: z.number().max(100).default(50) }))
    .query(async ({ input }) => {
      try {
        const leaderboard = await getWeeklyLeaderboard(input.limit);
        return {
          success: true,
          data: leaderboard,
          total: leaderboard.length,
        };
      } catch (error) {
        console.error("Failed to get weekly leaderboard:", error);
        return {
          success: false,
          data: [],
          total: 0,
          error: "Failed to fetch weekly leaderboard",
        };
      }
    }),

  /**
   * Get user's rank in weekly leaderboard
   */
  getUserWeeklyRank: protectedProcedure.query(async ({ ctx }) => {
    try {
      const rank = await getUserWeeklyRank(ctx.user.id);
      return {
        success: true,
        rank: rank || 0,
      };
    } catch (error) {
      console.error("Failed to get user weekly rank:", error);
      return {
        success: false,
        rank: 0,
        error: "Failed to fetch user weekly rank",
      };
    }
  }),

  /**
   * Add friend
   */
  addFriend: protectedProcedure
    .input(z.object({ friendId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        if (input.friendId === ctx.user.id) {
          return {
            success: false,
            error: "Cannot add yourself as friend",
          };
        }

        await addFriendship(ctx.user.id, input.friendId);
        return {
          success: true,
          message: "Friend request sent",
        };
      } catch (error) {
        console.error("Failed to add friend:", error);
        return {
          success: false,
          error: "Failed to send friend request",
        };
      }
    }),

  /**
   * Accept friend request
   */
  acceptFriend: protectedProcedure
    .input(z.object({ friendId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await acceptFriendship(input.friendId, ctx.user.id);
        return {
          success: true,
          message: "Friend request accepted",
        };
      } catch (error) {
        console.error("Failed to accept friend request:", error);
        return {
          success: false,
          error: "Failed to accept friend request",
        };
      }
    }),

  /**
   * Get friend requests
   */
  getFriendRequests: protectedProcedure.query(async ({ ctx }) => {
    try {
      const requests = await getFriendRequests(ctx.user.id);
      return {
        success: true,
        data: requests,
        total: requests.length,
      };
    } catch (error) {
      console.error("Failed to get friend requests:", error);
      return {
        success: false,
        data: [],
        total: 0,
        error: "Failed to fetch friend requests",
      };
    }
  }),

  /**
   * Record weekly leaderboard snapshot
   */
  recordWeeklySnapshot: publicProcedure
    .input(
      z.object({
        weekStart: z.string(),
        weekEnd: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await recordWeeklyLeaderboardSnapshot(input.weekStart, input.weekEnd);
        return {
          success: true,
          message: "Weekly leaderboard snapshot recorded",
        };
      } catch (error) {
        console.error("Failed to record weekly snapshot:", error);
        return {
          success: false,
          error: "Failed to record weekly snapshot",
        };
      }
    }),

  /**
   * Get leaderboard statistics
   */
  getStats: publicProcedure.query(async () => {
    try {
      const stats = await getLeaderboardStats();
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error("Failed to get leaderboard stats:", error);
      return {
        success: false,
        data: null,
        error: "Failed to fetch leaderboard statistics",
      };
    }
  }),
});
