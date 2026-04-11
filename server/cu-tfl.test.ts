import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

let userIdCounter = 1;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userIdCounter++,
    openId: `test-user-cu-tfl-${userIdCounter}`,
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
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

describe("CU-TFL Level System", () => {
  beforeEach(() => {
    userIdCounter = 1;
  });
  describe("getAllLevels", () => {
    it("should return all CU-TFL levels", async () => {
      const caller = appRouter.createCaller({} as TrpcContext);
      const levels = await caller.cuTfl.getAllLevels();

      expect(levels).toBeDefined();
      expect(levels.length).toBeGreaterThan(0);
      expect(levels[0]).toHaveProperty("levelCode");
      expect(levels[0]).toHaveProperty("levelName");
      expect(levels[0]).toHaveProperty("minXP");
    });

    it("should return levels in correct order", async () => {
      const caller = appRouter.createCaller({} as TrpcContext);
      const levels = await caller.cuTfl.getAllLevels();

      for (let i = 1; i < levels.length; i++) {
        expect(levels[i].levelOrder).toBeGreaterThan(levels[i - 1].levelOrder);
      }
    });
  });

  describe("initializeUserLevel", () => {
    it("should initialize user proficiency level", async () => {
      userIdCounter = 100; // Use unique ID
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.cuTfl.initializeUserLevel({
        currentLevelCode: "novice",
        targetLevelCode: "intermediate",
        goalType: "general",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("successfully");
    });

    it("should reject if target level is not higher than current level", async () => {
      userIdCounter = 101; // Use unique ID
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.cuTfl.initializeUserLevel({
          currentLevelCode: "intermediate",
          targetLevelCode: "novice",
          goalType: "general",
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect((error as Error).message).toContain("higher");
      }
    });

    it("should reject if same level is selected", async () => {
      userIdCounter = 102; // Use unique ID
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.cuTfl.initializeUserLevel({
          currentLevelCode: "novice",
          targetLevelCode: "novice",
          goalType: "general",
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect((error as Error).message).toContain("higher");
      }
    });
  });

  describe("getUserLevel", () => {
    it("should return null if user has no proficiency level", async () => {
      userIdCounter = 103; // Use unique ID
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const userLevel = await caller.cuTfl.getUserLevel();
      expect(userLevel).toBeNull();
    });

    it("should return user level after initialization", async () => {
      userIdCounter = 104; // Use unique ID
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Initialize first
      await caller.cuTfl.initializeUserLevel({
        currentLevelCode: "novice",
        targetLevelCode: "advanced",
        goalType: "test",
      });

      // Then query
      const userLevel = await caller.cuTfl.getUserLevel();

      expect(userLevel).toBeDefined();
      expect(userLevel?.goalType).toBe("test");
      expect(userLevel?.currentXP).toBe(0);
      expect(userLevel?.currentAccuracy).toBe(0);
      expect(userLevel?.progress).toBeDefined();
    });
  });

  describe("getStudyRoadmaps", () => {
    it("should return roadmaps for general learning", async () => {
      const caller = appRouter.createCaller({} as TrpcContext);
      const roadmaps = await caller.cuTfl.getStudyRoadmaps({
        goalType: "general",
      });

      expect(roadmaps).toBeDefined();
      expect(roadmaps.length).toBeGreaterThan(0);
      expect(roadmaps[0]).toHaveProperty("durationDays");
      expect(roadmaps[0]).toHaveProperty("dailyXPTarget");
    });

    it("should return roadmaps for test preparation", async () => {
      const caller = appRouter.createCaller({} as TrpcContext);
      const roadmaps = await caller.cuTfl.getStudyRoadmaps({
        goalType: "test",
      });

      expect(roadmaps).toBeDefined();
      expect(roadmaps.length).toBeGreaterThan(0);
    });
  });

  describe("getActiveGoals", () => {
    it("should return empty array if user has no goals", async () => {
      userIdCounter = 105; // Use unique ID
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const goals = await caller.cuTfl.getActiveGoals();
      expect(goals).toEqual([]);
    });

    it("should return active goals after initialization", async () => {
      userIdCounter = 106; // Use unique ID
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Initialize first
      await caller.cuTfl.initializeUserLevel({
        currentLevelCode: "novice",
        targetLevelCode: "intermediate",
        goalType: "general",
      });

      // Then query goals
      const goals = await caller.cuTfl.getActiveGoals();

      expect(goals).toBeDefined();
      expect(goals.length).toBeGreaterThan(0);
      // Should have daily, weekly, monthly, quarterly, annual goals
      expect(goals.length).toBe(5);
    });

    it("should have correct goal types", async () => {
      userIdCounter = 107; // Use unique ID
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Initialize first
      await caller.cuTfl.initializeUserLevel({
        currentLevelCode: "novice",
        targetLevelCode: "intermediate",
        goalType: "general",
      });

      // Then query goals
      const goals = await caller.cuTfl.getActiveGoals();

      const goalTypes = goals.map((g) => g.goalType);
      expect(goalTypes).toContain("daily");
      expect(goalTypes).toContain("weekly");
      expect(goalTypes).toContain("monthly");
      expect(goalTypes).toContain("quarterly");
      expect(goalTypes).toContain("annual");
    });
  });

  describe("getGoalByType", () => {
    it("should return null if goal does not exist", async () => {
      userIdCounter = 108; // Use unique ID
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const goal = await caller.cuTfl.getGoalByType({
        goalType: "daily",
      });

      expect(goal).toBeNull();
    });

    it("should return specific goal after initialization", async () => {
      userIdCounter = 109; // Use unique ID
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Initialize first
      await caller.cuTfl.initializeUserLevel({
        currentLevelCode: "novice",
        targetLevelCode: "intermediate",
        goalType: "general",
      });

      // Then query specific goal
      const dailyGoal = await caller.cuTfl.getGoalByType({
        goalType: "daily",
      });

      expect(dailyGoal).toBeDefined();
      expect(dailyGoal?.goalType).toBe("daily");
      expect(dailyGoal?.targetXP).toBe(167);
      expect(dailyGoal?.targetExercises).toBe(5);
      expect(dailyGoal?.progress).toBeDefined();
    });

    it("should have correct progress calculations", async () => {
      userIdCounter = 110; // Use unique ID
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Initialize first
      await caller.cuTfl.initializeUserLevel({
        currentLevelCode: "novice",
        targetLevelCode: "intermediate",
        goalType: "general",
      });

      // Then query specific goal
      const weeklyGoal = await caller.cuTfl.getGoalByType({
        goalType: "weekly",
      });

      expect(weeklyGoal?.progress).toBeDefined();
      expect(weeklyGoal?.progress?.xpProgress).toBe(0);
      expect(weeklyGoal?.progress?.accuracyProgress).toBe(0);
      expect(weeklyGoal?.progress?.exercisesProgress).toBe(0);
      expect(weeklyGoal?.progress?.daysProgress).toBe(0);
    });
  });

  describe("getAchievements", () => {
    it("should return empty array if user has no achievements", async () => {
      userIdCounter = 111; // Use unique ID
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const achievements = await caller.cuTfl.getAchievements();
      expect(achievements).toEqual([]);
    });
  });

  describe("Integration test: Full onboarding flow", () => {
    it("should complete full onboarding and setup study goals", async () => {
      userIdCounter = 200; // Use unique ID
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Step 1: Get available levels
      const levels = await caller.cuTfl.getAllLevels();
      expect(levels.length).toBeGreaterThan(0);

      // Step 2: Get study roadmaps
      const roadmaps = await caller.cuTfl.getStudyRoadmaps({
        goalType: "general",
      });
      expect(roadmaps.length).toBeGreaterThan(0);

      // Step 3: Initialize user level
      const initResult = await caller.cuTfl.initializeUserLevel({
        currentLevelCode: "novice",
        targetLevelCode: "advanced",
        goalType: "general",
      });
      expect(initResult.success).toBe(true);

      // Step 4: Get user level
      const userLevel = await caller.cuTfl.getUserLevel();
      expect(userLevel).toBeDefined();
      expect(userLevel?.goalType).toBe("general");

      // Step 5: Get active goals
      const goals = await caller.cuTfl.getActiveGoals();
      expect(goals.length).toBe(5);

      // Step 6: Get specific goal
      const dailyGoal = await caller.cuTfl.getGoalByType({
        goalType: "daily",
      });
      expect(dailyGoal).toBeDefined();
      expect(dailyGoal?.targetXP).toBe(167);
    });
  });
});
