import { eq, and, gte, lte } from "drizzle-orm";
import { getDb } from "./db";
import * as schema from "../drizzle/schema";

/**
 * Get all CU-TFL levels
 */
export async function getAllCuTflLevels() {
  const db = await getDb();
  if (!db) return [];

  const levels = await db
    .select()
    .from(schema.cuTflLevels)
    .orderBy(schema.cuTflLevels.levelOrder);

  return levels;
}

/**
 * Get CU-TFL level by ID
 */
export async function getCuTflLevelById(levelId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(schema.cuTflLevels)
    .where(eq(schema.cuTflLevels.id, levelId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Get CU-TFL level by code
 */
export async function getCuTflLevelByCode(levelCode: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(schema.cuTflLevels)
    .where(eq(schema.cuTflLevels.levelCode, levelCode))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Get user proficiency level
 */
export async function getUserProficiencyLevel(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(schema.userProficiencyLevels)
    .where(eq(schema.userProficiencyLevels.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Create user proficiency level
 */
export async function createUserProficiencyLevel(
  userId: number,
  currentLevelId: number,
  targetLevelId: number,
  goalType: "general" | "test"
) {
  const db = await getDb();
  if (!db) return null;

  // Get target level to determine required XP
  const targetLevel = await getCuTflLevelById(targetLevelId);
  if (!targetLevel) throw new Error("Target level not found");

  const result = await db.insert(schema.userProficiencyLevels).values({
    userId: userId,
    currentLevelId: currentLevelId,
    targetLevelId: targetLevelId,
    goalType: goalType,
    currentXP: 0,
    targetXP: targetLevel.minXP,
    currentAccuracy: "0.00",
    currentConsecutiveDays: 0,
    maxConsecutiveDays: 0,
  });

  return result;
}

/**
 * Update user proficiency level progress
 */
export async function updateUserProficiencyProgress(
  userId: number,
  currentXP: number,
  currentAccuracy: number,
  currentConsecutiveDays: number
) {
  const db = await getDb();
  if (!db) return null;

  const userLevel = await getUserProficiencyLevel(userId);
  if (!userLevel) return null;

  // Calculate max consecutive days
  const maxConsecutiveDays = Math.max(
    userLevel.maxConsecutiveDays,
    currentConsecutiveDays
  );

  // Check if user has reached target level
  let levelUpAt = userLevel.levelUpAt;
  let currentLevelId = userLevel.currentLevelId;
  let targetLevelId = userLevel.targetLevelId;

  if (currentXP >= userLevel.targetXP && currentAccuracy >= 75) {
    // User has reached target level
    levelUpAt = new Date();
    currentLevelId = userLevel.targetLevelId;

    // Set new target to next level
    const nextLevel = await db
      .select()
      .from(schema.cuTflLevels)
      .where(
        eq(
          schema.cuTflLevels.levelOrder,
          (await getCuTflLevelById(targetLevelId))?.levelOrder! + 1
        )
      )
      .limit(1);

    if (nextLevel.length > 0) {
      targetLevelId = nextLevel[0].id;
    }

    // Record achievement
    await db.insert(schema.levelAchievements).values({
      userId: userId,
      levelId: userLevel.targetLevelId,
      totalDaysToReach: currentConsecutiveDays,
      totalXPEarned: currentXP,
      finalAccuracy: currentAccuracy.toString(),
    });
  }

  // Estimate target date
  const targetLevel = await getCuTflLevelById(targetLevelId);
  const xpRemaining = Math.max(0, (targetLevel?.minXP || 0) - currentXP);
  const daysRemaining = Math.ceil(xpRemaining / 167); // Average 167 XP per day
  const estimatedTargetDate = new Date();
  estimatedTargetDate.setDate(estimatedTargetDate.getDate() + daysRemaining);

  const result = await db
    .update(schema.userProficiencyLevels)
    .set({
      currentXP: currentXP,
      currentAccuracy: currentAccuracy.toString(),
      currentConsecutiveDays: currentConsecutiveDays,
      maxConsecutiveDays: maxConsecutiveDays,
      levelUpAt: levelUpAt,
      currentLevelId: currentLevelId,
      targetLevelId: targetLevelId,
      estimatedTargetDate: estimatedTargetDate,
      updatedAt: new Date(),
    })
    .where(eq(schema.userProficiencyLevels.userId, userId));

  return result;
}

/**
 * Get study roadmap
 */
export async function getStudyRoadmap(
  fromLevelId: number,
  toLevelId: number,
  goalType: "general" | "test"
) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(schema.studyRoadmaps)
    .where(
      and(
        eq(schema.studyRoadmaps.fromLevelId, fromLevelId),
        eq(schema.studyRoadmaps.toLevelId, toLevelId),
        eq(schema.studyRoadmaps.goalType, goalType)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Get all study roadmaps for a goal type
 */
export async function getStudyRoadmapsByGoalType(goalType: "general" | "test") {
  const db = await getDb();
  if (!db) return [];

  const roadmaps = await db
    .select()
    .from(schema.studyRoadmaps)
    .where(eq(schema.studyRoadmaps.goalType, goalType));

  return roadmaps;
}

/**
 * Create study goal
 */
export async function createStudyGoal(
  userId: number,
  goalType: "daily" | "weekly" | "monthly" | "quarterly" | "annual",
  targetXP: number,
  targetAccuracy: number,
  targetExercises: number,
  targetConsecutiveDays: number,
  endDate: string
) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(schema.studyGoals).values({
    userId: userId,
    goalType: goalType,
    targetXP: targetXP,
    targetAccuracy: targetAccuracy,
    targetExercises: targetExercises,
    targetConsecutiveDays: targetConsecutiveDays,
    currentXP: 0,
    currentAccuracy: "0.00",
    currentExercises: 0,
    currentConsecutiveDays: 0,
    isCompleted: 0,
    endDate: endDate,
  })

  return result;
}

/**
 * Get active study goals for user
 */
export async function getActiveStudyGoals(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const goals = await db
    .select()
    .from(schema.studyGoals)
    .where(
      and(
        eq(schema.studyGoals.userId, userId),
        eq(schema.studyGoals.isCompleted, 0)
      )
    );

  return goals;
}

/**
 * Get study goal by type and user
 */
export async function getStudyGoalByType(
  userId: number,
  goalType: "daily" | "weekly" | "monthly" | "quarterly" | "annual"
) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(schema.studyGoals)
    .where(
      and(
        eq(schema.studyGoals.userId, userId),
        eq(schema.studyGoals.goalType, goalType),
        eq(schema.studyGoals.isCompleted, 0)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Update study goal progress
 */
export async function updateStudyGoalProgress(
  goalId: number,
  currentXP: number,
  currentAccuracy: number,
  currentExercises: number,
  currentConsecutiveDays: number
) {
  const db = await getDb();
  if (!db) return null;

  const goal = await db
    .select()
    .from(schema.studyGoals)
    .where(eq(schema.studyGoals.id, goalId))
    .limit(1);

  if (goal.length === 0) return null;

  const goalData = goal[0];
  const isCompleted =
    currentXP >= goalData.targetXP &&
    currentAccuracy >= goalData.targetAccuracy &&
    currentExercises >= goalData.targetExercises &&
    currentConsecutiveDays >= goalData.targetConsecutiveDays
      ? 1
      : 0;

  const result = await db
    .update(schema.studyGoals)
    .set({
      currentXP: currentXP,
      currentAccuracy: currentAccuracy.toString(),
      currentExercises: currentExercises,
      currentConsecutiveDays: currentConsecutiveDays,
      isCompleted: isCompleted,
      completedAt: isCompleted === 1 ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(schema.studyGoals.id, goalId));

  return result;
}

/**
 * Get level achievements for user
 */
export async function getUserLevelAchievements(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const achievements = await db
    .select()
    .from(schema.levelAchievements)
    .where(eq(schema.levelAchievements.userId, userId));

  return achievements;
}

/**
 * Calculate progress to next level
 */
export async function calculateProgressToNextLevel(userId: number) {
  const userLevel = await getUserProficiencyLevel(userId);
  if (!userLevel) return null;

  const currentLevel = await getCuTflLevelById(userLevel.currentLevelId);
  const targetLevel = await getCuTflLevelById(userLevel.targetLevelId);

  if (!currentLevel || !targetLevel) return null;

  const xpProgress = Math.min(
    100,
    Math.floor(
      (userLevel.currentXP / userLevel.targetXP) * 100
    )
  );

  const accuracyProgress = Math.min(
    100,
    Math.floor(parseFloat(userLevel.currentAccuracy.toString()))
  );

  const daysRemaining = Math.max(
    0,
    targetLevel.minConsecutiveDays - userLevel.currentConsecutiveDays
  );

  const estimatedDaysToComplete = Math.ceil(
    (userLevel.targetXP - userLevel.currentXP) / 167
  );

  return {
    currentLevel: currentLevel.levelName,
    targetLevel: targetLevel.levelName,
    xpProgress,
    accuracyProgress,
    daysRemaining,
    estimatedDaysToComplete,
    currentXP: userLevel.currentXP,
    targetXP: userLevel.targetXP,
    currentAccuracy: userLevel.currentAccuracy,
    targetConsecutiveDays: targetLevel.minConsecutiveDays,
    currentConsecutiveDays: userLevel.currentConsecutiveDays,
  };
}
