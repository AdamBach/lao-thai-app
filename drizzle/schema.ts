import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Pronunciation exercises table - stores vocabulary items for pronunciation practice
 */
export const pronunciationExercises = mysqlTable("pronunciation_exercises", {
  id: int("id").autoincrement().primaryKey(),
  language: mysqlEnum("language", ["lao", "thai"]).notNull(),
  word: varchar("word", { length: 255 }).notNull(),
  romanization: varchar("romanization", { length: 255 }).notNull(),
  englishTranslation: varchar("englishTranslation", { length: 255 }).notNull(),
  koreanTranslation: varchar("koreanTranslation", { length: 255 }).notNull(),
  chineseTranslation: varchar("chineseTranslation", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // e.g., "greeting", "number", "food"
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).default("beginner").notNull(),
  audioUrl: varchar("audioUrl", { length: 512 }), // Reference audio URL
  tonePattern: varchar("tonePattern", { length: 100 }), // e.g., "low-high" for Lao
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PronunciationExercise = typeof pronunciationExercises.$inferSelect;
export type InsertPronunciationExercise = typeof pronunciationExercises.$inferInsert;

/**
 * Pronunciation records table - stores user pronunciation attempts and feedback
 */
export const pronunciationRecords = mysqlTable("pronunciation_records", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  exerciseId: int("exerciseId").notNull(),
  audioUrl: varchar("audioUrl", { length: 512 }).notNull(), // User's recorded audio
  transcribedText: text("transcribedText"), // Whisper API transcription result
  accuracyScore: decimal("accuracyScore", { precision: 5, scale: 2 }), // 0-100
  feedback: text("feedback"), // AI-generated feedback
  pitchData: json("pitchData"), // Pitch pattern data for visualization
  duration: int("duration"), // Recording duration in milliseconds
  attempts: int("attempts").default(1).notNull(), // Number of attempts for this exercise
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PronunciationRecord = typeof pronunciationRecords.$inferSelect;
export type InsertPronunciationRecord = typeof pronunciationRecords.$inferInsert;

/**
 * Daily challenges table - stores daily challenge definitions
 */
export const dailyChallenges = mysqlTable("daily_challenges", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 10 }).notNull().unique(), // YYYY-MM-DD format
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  language: mysqlEnum("language", ["lao", "thai"]).notNull(),
  targetCount: int("targetCount").notNull(), // e.g., 10 words to practice
  xpReward: int("xpReward").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyChallenge = typeof dailyChallenges.$inferSelect;
export type InsertDailyChallenge = typeof dailyChallenges.$inferInsert;

/**
 * Challenge progress table - tracks user progress on daily challenges
 */
export const challengeProgress = mysqlTable("challenge_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  challengeId: int("challengeId").notNull(),
  completed: int("completed").default(0).notNull(), // Number of items completed
  isCompleted: int("isCompleted").default(0).notNull(), // 0 or 1 (boolean)
  xpEarned: int("xpEarned").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChallengeProgress = typeof challengeProgress.$inferSelect;
export type InsertChallengeProgress = typeof challengeProgress.$inferInsert;

/**
 * User statistics table - tracks overall user progress and achievements
 */
export const userStatistics = mysqlTable("user_statistics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  totalXP: int("totalXP").default(0).notNull(),
  level: int("level").default(1).notNull(),
  streak: int("streak").default(0).notNull(), // Consecutive days of practice
  totalPronunciationAttempts: int("totalPronunciationAttempts").default(0).notNull(),
  averageAccuracy: decimal("averageAccuracy", { precision: 5, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserStatistics = typeof userStatistics.$inferSelect;
export type InsertUserStatistics = typeof userStatistics.$inferInsert;

/**
 * Badges table - stores badge definitions
 */
export const badges = mysqlTable("badges", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 512 }), // Emoji or icon URL
  rarity: mysqlEnum("rarity", ["common", "uncommon", "rare", "epic", "legendary"]).default("common").notNull(),
  unlockedCondition: varchar("unlockedCondition", { length: 255 }).notNull(), // e.g., "7_day_streak", "100_accuracy"
  xpReward: int("xpReward").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

/**
 * User badges table - tracks badges earned by users
 */
export const userBadges = mysqlTable("user_badges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  badgeId: int("badgeId").notNull(),
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;

/**
 * Special items table - stores special learning items as rewards
 */
export const specialItems = mysqlTable("special_items", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 512 }), // Emoji or icon URL
  itemType: mysqlEnum("itemType", ["bonus_xp", "hint", "skip", "power_up", "cosmetic"]).notNull(),
  value: int("value").default(0).notNull(), // e.g., bonus XP amount
  rarity: mysqlEnum("rarity", ["common", "uncommon", "rare", "epic", "legendary"]).default("common").notNull(),
  unlockedCondition: varchar("unlockedCondition", { length: 255 }).notNull(), // e.g., "weekly_challenge_complete"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SpecialItem = typeof specialItems.$inferSelect;
export type InsertSpecialItem = typeof specialItems.$inferInsert;

/**
 * User inventory table - tracks special items owned by users
 */
export const userInventory = mysqlTable("user_inventory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  itemId: int("itemId").notNull(),
  quantity: int("quantity").default(1).notNull(),
  usedCount: int("usedCount").default(0).notNull(),
  acquiredAt: timestamp("acquiredAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserInventoryItem = typeof userInventory.$inferSelect;
export type InsertUserInventoryItem = typeof userInventory.$inferInsert;

/**
 * Friendships table - tracks user friendships for friend leaderboard
 */
export const friendships = mysqlTable("friendships", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  friendId: int("friendId").notNull(),
  status: mysqlEnum("status", ["pending", "accepted", "blocked"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Friendship = typeof friendships.$inferSelect;
export type InsertFriendship = typeof friendships.$inferInsert;

/**
 * Weekly leaderboard snapshots - stores weekly ranking snapshots for historical tracking
 */
export const weeklyLeaderboard = mysqlTable("weekly_leaderboard", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  weekStart: varchar("weekStart", { length: 10 }).notNull(), // YYYY-MM-DD format
  weekEnd: varchar("weekEnd", { length: 10 }).notNull(),
  rank: int("rank").notNull(),
  totalXP: int("totalXP").notNull(),
  totalAttempts: int("totalAttempts").notNull(),
  averageAccuracy: decimal("averageAccuracy", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WeeklyLeaderboard = typeof weeklyLeaderboard.$inferSelect;
export type InsertWeeklyLeaderboard = typeof weeklyLeaderboard.$inferInsert;

/**
 * CU-TFL Proficiency Levels - defines the 5 CU-TFL proficiency levels
 */
export const cuTflLevels = mysqlTable("cu_tfl_levels", {
  id: int("id").autoincrement().primaryKey(),
  levelName: varchar("levelName", { length: 50 }).notNull(), // "Novice", "Intermediate", "Advanced", "Superior", "Distinguished"
  levelCode: varchar("levelCode", { length: 20 }).notNull().unique(), // "NOVICE", "INTERMEDIATE", "ADVANCED", "SUPERIOR", "DISTINGUISHED"
  levelOrder: int("levelOrder").notNull(), // 1-5 for sorting
  description: text("description"),
  minXP: int("minXP").notNull(), // Minimum XP required to reach this level
  minAccuracy: int("minAccuracy").notNull(), // Minimum accuracy percentage (0-100)
  minConsecutiveDays: int("minConsecutiveDays").notNull(), // Minimum consecutive days
  estimatedMonths: int("estimatedMonths").notNull(), // Estimated months to reach from Novice
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CuTflLevel = typeof cuTflLevels.$inferSelect;
export type InsertCuTflLevel = typeof cuTflLevels.$inferInsert;

/**
 * User Proficiency Levels - tracks each user's current CU-TFL level and progress
 */
export const userProficiencyLevels = mysqlTable("user_proficiency_levels", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  currentLevelId: int("currentLevelId").notNull(),
  targetLevelId: int("targetLevelId").notNull(),
  goalType: mysqlEnum("goalType", ["general", "test"]).default("general").notNull(), // "general" or "test"
  currentXP: int("currentXP").default(0).notNull(),
  targetXP: int("targetXP").notNull(), // XP needed for target level
  currentAccuracy: decimal("currentAccuracy", { precision: 5, scale: 2 }).default("0.00").notNull(),
  currentConsecutiveDays: int("currentConsecutiveDays").default(0).notNull(),
  maxConsecutiveDays: int("maxConsecutiveDays").default(0).notNull(),
  levelUpAt: timestamp("levelUpAt"), // When user reached current level
  estimatedTargetDate: timestamp("estimatedTargetDate"), // Estimated date to reach target level
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProficiencyLevel = typeof userProficiencyLevels.$inferSelect;
export type InsertUserProficiencyLevel = typeof userProficiencyLevels.$inferInsert;

/**
 * Study Goals - tracks daily, weekly, monthly, quarterly, and annual goals
 */
export const studyGoals = mysqlTable("study_goals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  goalType: mysqlEnum("goalType", ["daily", "weekly", "monthly", "quarterly", "annual"]).notNull(),
  targetXP: int("targetXP").notNull(),
  targetAccuracy: int("targetAccuracy").notNull(), // 0-100
  targetExercises: int("targetExercises").notNull(),
  targetConsecutiveDays: int("targetConsecutiveDays").notNull(),
  currentXP: int("currentXP").default(0).notNull(),
  currentAccuracy: decimal("currentAccuracy", { precision: 5, scale: 2 }).default("0.00").notNull(),
  currentExercises: int("currentExercises").default(0).notNull(),
  currentConsecutiveDays: int("currentConsecutiveDays").default(0).notNull(),
  isCompleted: int("isCompleted").default(0).notNull(), // 0 or 1
  completedAt: timestamp("completedAt"),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: varchar("endDate", { length: 10 }).notNull(), // YYYY-MM-DD format
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudyGoal = typeof studyGoals.$inferSelect;
export type InsertStudyGoal = typeof studyGoals.$inferInsert;

/**
 * Study Roadmap - predefined learning paths for each level transition
 */
export const studyRoadmaps = mysqlTable("study_roadmaps", {
  id: int("id").autoincrement().primaryKey(),
  fromLevelId: int("fromLevelId").notNull(),
  toLevelId: int("toLevelId").notNull(),
  goalType: mysqlEnum("goalType", ["general", "test"]).default("general").notNull(),
  durationDays: int("durationDays").notNull(), // Estimated days to complete
  dailyXPTarget: int("dailyXPTarget").notNull(),
  weeklyXPTarget: int("weeklyXPTarget").notNull(),
  monthlyXPTarget: int("monthlyXPTarget").notNull(),
  requiredAccuracy: int("requiredAccuracy").notNull(), // 0-100
  requiredConsecutiveDays: int("requiredConsecutiveDays").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StudyRoadmap = typeof studyRoadmaps.$inferSelect;
export type InsertStudyRoadmap = typeof studyRoadmaps.$inferInsert;

/**
 * Level Achievements - tracks when users achieve level milestones
 */
export const levelAchievements = mysqlTable("level_achievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  levelId: int("levelId").notNull(),
  achievedAt: timestamp("achievedAt").defaultNow().notNull(),
  totalDaysToReach: int("totalDaysToReach").notNull(),
  totalXPEarned: int("totalXPEarned").notNull(),
  finalAccuracy: decimal("finalAccuracy", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LevelAchievement = typeof levelAchievements.$inferSelect;
export type InsertLevelAchievement = typeof levelAchievements.$inferInsert;


/**
 * Beginner Lessons - structured lessons for complete beginners
 * Categories: numbers, days, months, time, basic phrases
 */
export const beginnerLessons = mysqlTable("beginner_lessons", {
  id: int("id").autoincrement().primaryKey(),
  language: mysqlEnum("language", ["lao", "thai"]).notNull(),
  category: mysqlEnum("category", ["numbers", "days", "months", "time", "phrases", "hello", "family", "food", "languages", "family_counting", "age_counting"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  content: text("content").notNull(), // JSON array of lesson items
  order: int("order").notNull(), // Display order
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate"]).default("beginner").notNull(),
  audioUrl: varchar("audioUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type BeginnerLesson = typeof beginnerLessons.$inferSelect;
export type InsertBeginnerLesson = typeof beginnerLessons.$inferInsert;

/**
 * User Lesson Progress - tracks user progress through beginner lessons
 */
export const userLessonProgress = mysqlTable("user_lesson_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  lessonId: int("lessonId").notNull(),
  isCompleted: int("isCompleted").default(0).notNull(), // 0 or 1
  completedAt: timestamp("completedAt"),
  lastAccessedAt: timestamp("lastAccessedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type UserLessonProgress = typeof userLessonProgress.$inferSelect;
export type InsertUserLessonProgress = typeof userLessonProgress.$inferInsert;

/**
 * Email Subscriptions - tracks weekly email subscriptions
 */
export const emailSubscriptions = mysqlTable("email_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  userId: int("userId"), // Optional: link to user if logged in
  language: mysqlEnum("language", ["lao", "thai"]).default("thai").notNull(),
  subscriptionType: mysqlEnum("subscriptionType", ["weekly_phrases", "daily_tips", "all"]).default("weekly_phrases").notNull(),
  isActive: int("isActive").default(1).notNull(), // 0 or 1
  lastEmailSentAt: timestamp("lastEmailSentAt"),
  unsubscribedAt: timestamp("unsubscribedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type EmailSubscription = typeof emailSubscriptions.$inferSelect;
export type InsertEmailSubscription = typeof emailSubscriptions.$inferInsert;

/**
 * Lesson Audio - stores generated TTS audio URLs for vocabulary items
 */
export const lessonAudio = mysqlTable("lesson_audio", {
  id: int("id").autoincrement().primaryKey(),
  lessonId: int("lessonId").notNull(),
  itemIndex: int("itemIndex").notNull(), // Index of the item in the lesson content array
  text: varchar("text", { length: 512 }).notNull(), // The text that was converted to audio
  language: mysqlEnum("language", ["lao", "thai"]).notNull(),
  audioUrl: varchar("audioUrl", { length: 512 }).notNull(), // S3 URL to the audio file
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LessonAudio = typeof lessonAudio.$inferSelect;
export type InsertLessonAudio = typeof lessonAudio.$inferInsert;

/**
 * Review Mode Sessions - tracks user review mode practice sessions
 */
export const reviewSessions = mysqlTable("review_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  lessonId: int("lessonId").notNull(),
  totalItems: int("totalItems").notNull(), // Total vocabulary items in the session
  correctAnswers: int("correctAnswers").default(0).notNull(),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }).default("0.00").notNull(), // Percentage
  duration: int("duration").default(0).notNull(), // Duration in seconds
  isCompleted: int("isCompleted").default(0).notNull(), // 0 or 1
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReviewSession = typeof reviewSessions.$inferSelect;
export type InsertReviewSession = typeof reviewSessions.$inferInsert;
