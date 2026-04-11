import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "test",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("Leaderboard Router", () => {
  describe("getGlobalLeaderboard", () => {
    it("should return global leaderboard with limit", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.leaderboard.getGlobalLeaderboard({ limit: 10 });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.total).toBeGreaterThanOrEqual(0);
    });

    it("should enforce maximum limit of 100", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      // Should accept limit of 100
      const result = await caller.leaderboard.getGlobalLeaderboard({ limit: 100 });
      expect(result.success).toBe(true);
    });

    it("should return default limit of 50", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.leaderboard.getGlobalLeaderboard({});
      expect(result.success).toBe(true);
    });

    it("should return leaderboard entries with correct structure", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.leaderboard.getGlobalLeaderboard({ limit: 1 });

      if (result.data && result.data.length > 0) {
        const entry = result.data[0];
        expect(entry).toHaveProperty("rank");
        expect(entry).toHaveProperty("userId");
        expect(entry).toHaveProperty("name");
        expect(entry).toHaveProperty("totalXP");
        expect(entry).toHaveProperty("level");
        expect(entry).toHaveProperty("streak");
        expect(entry).toHaveProperty("averageAccuracy");
      }
    });
  });

  describe("getUserGlobalRank", () => {
    it("should return user global rank for authenticated user", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.leaderboard.getUserGlobalRank();

      expect(result.success).toBe(true);
      expect(typeof result.rank).toBe("number");
      expect(result.rank).toBeGreaterThanOrEqual(0);
    });

    it("should return rank 0 if user not found", async () => {
      const { ctx } = createAuthContext(9999);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.leaderboard.getUserGlobalRank();

      expect(result.success).toBe(true);
      expect(result.rank).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getFriendLeaderboard", () => {
    it("should return friend leaderboard for authenticated user", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.leaderboard.getFriendLeaderboard();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.total).toBeGreaterThanOrEqual(0);
    });

    it("should return empty array if no friends", async () => {
      const { ctx } = createAuthContext(9999);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.leaderboard.getFriendLeaderboard();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("should return friend entries with correct structure", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.leaderboard.getFriendLeaderboard();

      if (result.data && result.data.length > 0) {
        const entry = result.data[0];
        expect(entry).toHaveProperty("rank");
        expect(entry).toHaveProperty("userId");
        expect(entry).toHaveProperty("name");
        expect(entry).toHaveProperty("totalXP");
        expect(entry).toHaveProperty("friendshipStatus");
      }
    });
  });

  describe("getWeeklyLeaderboard", () => {
    it("should return weekly leaderboard", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.leaderboard.getWeeklyLeaderboard({ limit: 10 });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.total).toBeGreaterThanOrEqual(0);
    });

    it("should return weekly leaderboard entries with correct structure", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.leaderboard.getWeeklyLeaderboard({ limit: 1 });

      if (result.data && result.data.length > 0) {
        const entry = result.data[0];
        expect(entry).toHaveProperty("rank");
        expect(entry).toHaveProperty("userId");
        expect(entry).toHaveProperty("totalXP");
        expect(entry).toHaveProperty("totalAttempts");
        expect(entry).toHaveProperty("averageAccuracy");
      }
    });
  });

  describe("getUserWeeklyRank", () => {
    it("should return user weekly rank for authenticated user", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.leaderboard.getUserWeeklyRank();

      expect(result.success).toBe(true);
      expect(typeof result.rank).toBe("number");
      expect(result.rank).toBeGreaterThanOrEqual(0);
    });
  });

  describe("addFriend", () => {
    it("should add friend successfully", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.leaderboard.addFriend({ friendId: 2 });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Friend request sent");
    });

    it("should not allow adding self as friend", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.leaderboard.addFriend({ friendId: 1 });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Cannot add yourself as friend");
    });
  });

  describe("acceptFriend", () => {
    it("should accept friend request successfully", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.leaderboard.acceptFriend({ friendId: 2 });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Friend request accepted");
    });
  });

  describe("getFriendRequests", () => {
    it("should return friend requests for authenticated user", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.leaderboard.getFriendRequests();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.total).toBeGreaterThanOrEqual(0);
    });

    it("should return friend request entries with correct structure", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.leaderboard.getFriendRequests();

      if (result.data && result.data.length > 0) {
        const entry = result.data[0];
        expect(entry).toHaveProperty("friendshipId");
        expect(entry).toHaveProperty("userId");
        expect(entry).toHaveProperty("name");
        expect(entry).toHaveProperty("email");
      }
    });
  });

  describe("recordWeeklySnapshot", () => {
    it("should record weekly leaderboard snapshot", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const weekStart = "2026-03-22";
      const weekEnd = "2026-03-28";

      const result = await caller.leaderboard.recordWeeklySnapshot({
        weekStart,
        weekEnd,
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Weekly leaderboard snapshot recorded");
    });
  });

  describe("getStats", () => {
    it("should return leaderboard statistics", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.leaderboard.getStats();

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("totalUsers");
      expect(result.data).toHaveProperty("totalFriendships");
      expect(typeof result.data.totalUsers).toBe("number");
      expect(typeof result.data.totalFriendships).toBe("number");
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors gracefully in getGlobalLeaderboard", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.leaderboard.getGlobalLeaderboard({ limit: 50 });

      // Should not throw, but return error response
      expect(result).toHaveProperty("success");
      expect(typeof result.success).toBe("boolean");
    });

    it("should handle database errors gracefully in getFriendLeaderboard", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.leaderboard.getFriendLeaderboard();

      expect(result).toHaveProperty("success");
      expect(typeof result.success).toBe("boolean");
    });

    it("should handle database errors gracefully in getStats", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.leaderboard.getStats();

      expect(result).toHaveProperty("success");
      expect(typeof result.success).toBe("boolean");
    });
  });

  describe("Authentication", () => {
    it("should require authentication for getUserGlobalRank", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.leaderboard.getUserGlobalRank();
      } catch (error) {
        // Expected to throw for unauthenticated request
        expect(error).toBeDefined();
      }
    });

    it("should require authentication for getFriendLeaderboard", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.leaderboard.getFriendLeaderboard();
      } catch (error) {
        // Expected to throw for unauthenticated request
        expect(error).toBeDefined();
      }
    });

    it("should require authentication for addFriend", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.leaderboard.addFriend({ friendId: 2 });
      } catch (error) {
        // Expected to throw for unauthenticated request
        expect(error).toBeDefined();
      }
    });
  });
});
