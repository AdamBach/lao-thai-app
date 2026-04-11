import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  getAllCuTflLevels,
  getCuTflLevelByCode,
  getUserProficiencyLevel,
  createUserProficiencyLevel,
  updateUserProficiencyProgress,
  getStudyRoadmapsByGoalType,
  createStudyGoal,
  getActiveStudyGoals,
  getStudyGoalByType,
  updateStudyGoalProgress,
  getUserLevelAchievements,
  calculateProgressToNextLevel,
} from "./db-cu-tfl";

export const cuTflRouter = router({
  /**
   * Get all CU-TFL levels
   */
  getAllLevels: publicProcedure.query(async () => {
    const levels = await getAllCuTflLevels();
    return levels.map((level) => ({
      id: level.id,
      levelCode: level.levelCode,
      levelName: level.levelName,
      levelOrder: level.levelOrder,
      description: level.description,
      minXP: level.minXP,
      minAccuracy: level.minAccuracy,
      minConsecutiveDays: level.minConsecutiveDays,
    }));
  }),

  /**
   * Get user proficiency level and progress
   */
  getUserLevel: protectedProcedure.query(async ({ ctx }) => {
    const userLevel = await getUserProficiencyLevel(ctx.user.id);
    if (!userLevel) {
      return null;
    }

    const progress = await calculateProgressToNextLevel(ctx.user.id);

    return {
      id: userLevel.id,
      userId: userLevel.userId,
      currentLevelId: userLevel.currentLevelId,
      targetLevelId: userLevel.targetLevelId,
      goalType: userLevel.goalType,
      currentXP: userLevel.currentXP,
      targetXP: userLevel.targetXP,
      currentAccuracy: parseFloat(userLevel.currentAccuracy.toString()),
      currentConsecutiveDays: userLevel.currentConsecutiveDays,
      maxConsecutiveDays: userLevel.maxConsecutiveDays,
      levelUpAt: userLevel.levelUpAt,
      estimatedTargetDate: userLevel.estimatedTargetDate,
      progress,
    };
  }),

  /**
   * Initialize user proficiency level (onboarding)
   */
  initializeUserLevel: protectedProcedure
    .input(
      z.object({
        currentLevelCode: z.enum([
          "novice",
          "intermediate",
          "advanced",
          "superior",
          "distinguished",
        ]),
        targetLevelCode: z.enum([
          "novice",
          "intermediate",
          "advanced",
          "superior",
          "distinguished",
        ]),
        goalType: z.enum(["general", "test"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already has a proficiency level
      const existingLevel = await getUserProficiencyLevel(ctx.user.id);
      if (existingLevel) {
        throw new Error("User already has a proficiency level set");
      }

      // Get level IDs from codes
      const currentLevel = await getCuTflLevelByCode(input.currentLevelCode);
      const targetLevel = await getCuTflLevelByCode(input.targetLevelCode);

      if (!currentLevel || !targetLevel) {
        throw new Error("Invalid level code");
      }

      if (currentLevel.levelOrder >= targetLevel.levelOrder) {
        throw new Error(
          "Target level must be higher than current level"
        );
      }

      // Create user proficiency level
      await createUserProficiencyLevel(
        ctx.user.id,
        currentLevel.id,
        targetLevel.id,
        input.goalType
      );

      // Create daily study goal
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);

      await createStudyGoal(
        ctx.user.id,
        "daily",
        167, // Average XP per day
        75, // Target accuracy 75%
        5, // Target 5 exercises
        1, // Target 1 consecutive day
        tomorrow.toISOString().split("T")[0]
      );

      // Create weekly study goal
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(23, 59, 59, 999);

      await createStudyGoal(
        ctx.user.id,
        "weekly",
        1169, // 167 * 7
        75,
        35, // 5 * 7
        7,
        nextWeek.toISOString().split("T")[0]
      );

      // Create monthly study goal
      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 30);
      nextMonth.setHours(23, 59, 59, 999);

      await createStudyGoal(
        ctx.user.id,
        "monthly",
        5010, // 167 * 30
        75,
        150, // 5 * 30
        30,
        nextMonth.toISOString().split("T")[0]
      );

      // Create quarterly study goal
      const nextQuarter = new Date();
      nextQuarter.setDate(nextQuarter.getDate() + 90);
      nextQuarter.setHours(23, 59, 59, 999);

      await createStudyGoal(
        ctx.user.id,
        "quarterly",
        15030, // 167 * 90
        80,
        450, // 5 * 90
        90,
        nextQuarter.toISOString().split("T")[0]
      );

      // Create annual study goal
      const nextYear = new Date();
      nextYear.setDate(nextYear.getDate() + 365);
      nextYear.setHours(23, 59, 59, 999);

      await createStudyGoal(
        ctx.user.id,
        "annual",
        60055, // 167 * 365
        85,
        1825, // 5 * 365
        365,
        nextYear.toISOString().split("T")[0]
      );

      return {
        success: true,
        message: "User proficiency level initialized successfully",
      };
    }),

  /**
   * Get study roadmaps for a goal type
   */
  getStudyRoadmaps: publicProcedure
    .input(z.object({ goalType: z.enum(["general", "test"]) }))
    .query(async ({ input }) => {
      const roadmaps = await getStudyRoadmapsByGoalType(input.goalType);
      return roadmaps.map((roadmap) => ({
        id: roadmap.id,
        fromLevelId: roadmap.fromLevelId,
        toLevelId: roadmap.toLevelId,
        goalType: roadmap.goalType,
        durationDays: roadmap.durationDays,
        dailyXPTarget: roadmap.dailyXPTarget,
        weeklyXPTarget: roadmap.weeklyXPTarget,
        monthlyXPTarget: roadmap.monthlyXPTarget,
        requiredAccuracy: roadmap.requiredAccuracy,
        requiredConsecutiveDays: roadmap.requiredConsecutiveDays,
        description: roadmap.description,
      }));
    }),

  /**
   * Get active study goals for user
   */
  getActiveGoals: protectedProcedure.query(async ({ ctx }) => {
    const goals = await getActiveStudyGoals(ctx.user.id);
    return goals.map((goal) => ({
      id: goal.id,
      goalType: goal.goalType,
      targetXP: goal.targetXP,
      targetAccuracy: parseFloat(goal.targetAccuracy.toString()),
      targetExercises: goal.targetExercises,
      targetConsecutiveDays: goal.targetConsecutiveDays,
      currentXP: goal.currentXP,
      currentAccuracy: parseFloat(goal.currentAccuracy.toString()),
      currentExercises: goal.currentExercises,
      currentConsecutiveDays: goal.currentConsecutiveDays,
      isCompleted: goal.isCompleted === 1,
      endDate: goal.endDate,
      completedAt: goal.completedAt,
      progress: {
        xpProgress: Math.min(100, Math.floor((goal.currentXP / goal.targetXP) * 100)),
        accuracyProgress: Math.min(100, Math.floor(parseFloat(goal.currentAccuracy.toString()))),
        exercisesProgress: Math.min(100, Math.floor((goal.currentExercises / goal.targetExercises) * 100)),
        daysProgress: Math.min(100, Math.floor((goal.currentConsecutiveDays / goal.targetConsecutiveDays) * 100)),
      },
    }));
  }),

  /**
   * Get specific study goal by type
   */
  getGoalByType: protectedProcedure
    .input(
      z.object({
        goalType: z.enum(["daily", "weekly", "monthly", "quarterly", "annual"]),
      })
    )
    .query(async ({ ctx, input }) => {
      const goal = await getStudyGoalByType(ctx.user.id, input.goalType);
      if (!goal) return null;

      return {
        id: goal.id,
        goalType: goal.goalType,
        targetXP: goal.targetXP,
        targetAccuracy: parseFloat(goal.targetAccuracy.toString()),
        targetExercises: goal.targetExercises,
        targetConsecutiveDays: goal.targetConsecutiveDays,
        currentXP: goal.currentXP,
        currentAccuracy: parseFloat(goal.currentAccuracy.toString()),
        currentExercises: goal.currentExercises,
        currentConsecutiveDays: goal.currentConsecutiveDays,
        isCompleted: goal.isCompleted === 1,
        endDate: goal.endDate,
        completedAt: goal.completedAt,
        progress: {
          xpProgress: Math.min(100, Math.floor((goal.currentXP / goal.targetXP) * 100)),
          accuracyProgress: Math.min(100, Math.floor(parseFloat(goal.currentAccuracy.toString()))),
          exercisesProgress: Math.min(100, Math.floor((goal.currentExercises / goal.targetExercises) * 100)),
          daysProgress: Math.min(100, Math.floor((goal.currentConsecutiveDays / goal.targetConsecutiveDays) * 100)),
        },
      };
    }),

  /**
   * Update study goal progress (called after each exercise)
   */
  updateGoalProgress: protectedProcedure
    .input(
      z.object({
        goalId: z.number(),
        currentXP: z.number(),
        currentAccuracy: z.number(),
        currentExercises: z.number(),
        currentConsecutiveDays: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      await updateStudyGoalProgress(
        input.goalId,
        input.currentXP,
        input.currentAccuracy,
        input.currentExercises,
        input.currentConsecutiveDays
      );

      return { success: true };
    }),

  /**
   * Get user level achievements
   */
  getAchievements: protectedProcedure.query(async ({ ctx }) => {
    const achievements = await getUserLevelAchievements(ctx.user.id);
    return achievements.map((achievement) => ({
      id: achievement.id,
      levelId: achievement.levelId,
      totalDaysToReach: achievement.totalDaysToReach,
      totalXPEarned: achievement.totalXPEarned,
      finalAccuracy: parseFloat(achievement.finalAccuracy.toString()),
      achievedAt: achievement.achievedAt,
    }));
  }),
});
