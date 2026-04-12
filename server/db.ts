import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, pronunciationExercises, pronunciationRecords, userStatistics, dailyChallenges, challengeProgress } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "passwordHash"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Pronunciation exercises queries
 */
export async function getPronunciationExercises(language: "lao" | "thai", category?: string, difficulty?: string) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select().from(pronunciationExercises).where(eq(pronunciationExercises.language, language));
  
  let filtered = result;
  if (category) {
    filtered = filtered.filter(e => e.category === category);
  }
  
  if (difficulty) {
    filtered = filtered.filter(e => e.difficulty === difficulty);
  }

  return filtered;
}

export async function getPronunciationExerciseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(pronunciationExercises).where(eq(pronunciationExercises.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createPronunciationRecord(record: {
  userId: number;
  exerciseId: number;
  audioUrl: string;
  transcribedText?: string;
  accuracyScore?: number;
  feedback?: string;
  pitchData?: any;
  duration?: number;
}) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(pronunciationRecords).values({
    userId: record.userId,
    exerciseId: record.exerciseId,
    audioUrl: record.audioUrl,
    transcribedText: record.transcribedText,
    accuracyScore: record.accuracyScore ? (record.accuracyScore as any) : undefined,
    feedback: record.feedback,
    pitchData: record.pitchData,
    duration: record.duration,
  });

  return result;
}

export async function getUserPronunciationRecords(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(pronunciationRecords).where(eq(pronunciationRecords.userId, userId as any)).limit(limit);
}

export async function getUserStatistics(userId: number) {
  const db = await getDb();
  if (!db) {
    return {
      id: 0,
      userId,
      totalXP: 0,
      level: 1,
      streak: 0,
      totalPronunciationAttempts: 0,
      averageAccuracy: '0.00' as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  const result = await db.select().from(userStatistics).where(eq(userStatistics.userId, userId)).limit(1);
  if (result.length > 0) {
    return result[0];
  }
  
  // Return default statistics if not found
  return {
    id: 0,
    userId,
    totalXP: 0,
    level: 1,
    streak: 0,
    totalPronunciationAttempts: 0,
    averageAccuracy: '0.00' as any,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function upsertUserStatistics(userId: number, stats: Partial<{
  totalXP: number;
  level: number;
  streak: number;
  totalPronunciationAttempts: number;
  averageAccuracy: number;
}>) {
  const db = await getDb();
  if (!db) return undefined;

  const values: any = {
    userId,
    ...stats,
  };

  const updateSet: any = {};
  if (stats.totalXP !== undefined) updateSet.totalXP = stats.totalXP;
  if (stats.level !== undefined) updateSet.level = stats.level;
  if (stats.streak !== undefined) updateSet.streak = stats.streak;
  if (stats.totalPronunciationAttempts !== undefined) updateSet.totalPronunciationAttempts = stats.totalPronunciationAttempts;
  if (stats.averageAccuracy !== undefined) updateSet.averageAccuracy = stats.averageAccuracy as any;

  const result = await db.insert(userStatistics).values(values).onDuplicateKeyUpdate({
    set: updateSet,
  });

  return result;
}

/**
 * Daily challenges queries
 */
export async function getTodayChallenge() {
  const db = await getDb();
  if (!db) {
    return {
      id: 0,
      date: new Date().toISOString().split('T')[0],
      title: 'Daily Challenge',
      description: 'Practice your pronunciation skills today',
      language: 'thai' as const,
      targetCount: 10,
      xpReward: 50,
      createdAt: new Date(),
    };
  }

  const today = new Date().toISOString().split('T')[0];
  const result = await db.select().from(dailyChallenges).where(eq(dailyChallenges.date, today)).limit(1);
  
  if (result.length > 0) {
    return result[0];
  }
  
  // Return default challenge if not found
  return {
    id: 0,
    date: today,
    title: 'Daily Challenge',
    description: 'Practice your pronunciation skills today',
    language: 'thai' as const,
    targetCount: 10,
    xpReward: 50,
    createdAt: new Date(),
  };
}

export async function getUserChallengeProgress(userId: number, challengeId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(challengeProgress).where(
    eq(challengeProgress.userId, userId as any)
  ).limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function updateChallengeProgress(userId: number, challengeId: number, updates: {
  completed?: number;
  isCompleted?: number;
  xpEarned?: number;
}) {
  const db = await getDb();
  if (!db) return undefined;

  // First check if record exists
  const existing = await getUserChallengeProgress(userId, challengeId);
  
  if (!existing) {
    // Create new record
    return await db.insert(challengeProgress).values({
      userId,
      challengeId,
      ...updates,
    });
  } else {
    // Update existing record
    return await db.update(challengeProgress).set(updates).where(
      eq(challengeProgress.userId, userId as any)
    );
  }
}
