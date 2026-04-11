import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../drizzle/schema.js";
// Note: This will be transpiled at runtime

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

async function seed() {
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection, { schema, mode: "default" });

  console.log("🌱 Seeding CU-TFL Levels...");

  // Insert CU-TFL Levels
  const levels = [
    {
      levelName: "Chula Novice",
      levelCode: "NOVICE",
      levelOrder: 1,
      description: "Basic level - Can understand and produce very simple utterances",
      minXP: 0,
      minAccuracy: 40,
      minConsecutiveDays: 1,
      estimatedMonths: 0,
    },
    {
      levelName: "Chula Intermediate",
      levelCode: "INTERMEDIATE",
      levelOrder: 2,
      description: "Intermediate level - Can handle most social situations",
      minXP: 5000,
      minAccuracy: 60,
      minConsecutiveDays: 14,
      estimatedMonths: 1,
    },
    {
      levelName: "Chula Advanced",
      levelCode: "ADVANCED",
      levelOrder: 3,
      description: "Good level - Can discuss complex topics with some effort",
      minXP: 15000,
      minAccuracy: 75,
      minConsecutiveDays: 30,
      estimatedMonths: 3,
    },
    {
      levelName: "Chula Superior",
      levelCode: "SUPERIOR",
      levelOrder: 4,
      description: "Very Good level - Can speak fluently on most topics",
      minXP: 30000,
      minAccuracy: 85,
      minConsecutiveDays: 60,
      estimatedMonths: 6,
    },
    {
      levelName: "Chula Distinguished",
      levelCode: "DISTINGUISHED",
      levelOrder: 5,
      description: "Outstanding level - Near-native proficiency",
      minXP: 50000,
      minAccuracy: 95,
      minConsecutiveDays: 90,
      estimatedMonths: 12,
    },
  ];

  for (const level of levels) {
    await db.insert(schema.cuTflLevels).values(level);
    console.log(`✓ Created level: ${level.levelName}`);
  }

  console.log("\n🌱 Seeding Study Roadmaps...");

  // Insert Study Roadmaps for General Learning
  const roadmaps = [
    {
      fromLevelId: 1,
      toLevelId: 2,
      goalType: "general",
      durationDays: 30,
      dailyXPTarget: 167,
      weeklyXPTarget: 1167,
      monthlyXPTarget: 5000,
      requiredAccuracy: 60,
      requiredConsecutiveDays: 14,
      description: "Path from Novice to Intermediate (General Learning)",
    },
    {
      fromLevelId: 2,
      toLevelId: 3,
      goalType: "general",
      durationDays: 60,
      dailyXPTarget: 167,
      weeklyXPTarget: 1167,
      monthlyXPTarget: 5000,
      requiredAccuracy: 75,
      requiredConsecutiveDays: 30,
      description: "Path from Intermediate to Advanced (General Learning)",
    },
    {
      fromLevelId: 3,
      toLevelId: 4,
      goalType: "general",
      durationDays: 90,
      dailyXPTarget: 167,
      weeklyXPTarget: 1167,
      monthlyXPTarget: 5000,
      requiredAccuracy: 85,
      requiredConsecutiveDays: 60,
      description: "Path from Advanced to Superior (General Learning)",
    },
    {
      fromLevelId: 4,
      toLevelId: 5,
      goalType: "general",
      durationDays: 180,
      dailyXPTarget: 111,
      weeklyXPTarget: 778,
      monthlyXPTarget: 3333,
      requiredAccuracy: 95,
      requiredConsecutiveDays: 90,
      description: "Path from Superior to Distinguished (General Learning)",
    },
  ];

  // Add Test Preparation Roadmaps (faster pace)
  const testRoadmaps = [
    {
      fromLevelId: 1,
      toLevelId: 2,
      goalType: "test",
      durationDays: 20,
      dailyXPTarget: 250,
      weeklyXPTarget: 1750,
      monthlyXPTarget: 7500,
      requiredAccuracy: 60,
      requiredConsecutiveDays: 14,
      description: "Path from Novice to Intermediate (Test Prep - Intensive)",
    },
    {
      fromLevelId: 2,
      toLevelId: 3,
      goalType: "test",
      durationDays: 40,
      dailyXPTarget: 250,
      weeklyXPTarget: 1750,
      monthlyXPTarget: 7500,
      requiredAccuracy: 75,
      requiredConsecutiveDays: 30,
      description: "Path from Intermediate to Advanced (Test Prep - Intensive)",
    },
    {
      fromLevelId: 3,
      toLevelId: 4,
      goalType: "test",
      durationDays: 60,
      dailyXPTarget: 250,
      weeklyXPTarget: 1750,
      monthlyXPTarget: 7500,
      requiredAccuracy: 85,
      requiredConsecutiveDays: 60,
      description: "Path from Advanced to Superior (Test Prep - Intensive)",
    },
  ];

  for (const roadmap of [...roadmaps, ...testRoadmaps]) {
    await db.insert(schema.studyRoadmaps).values(roadmap);
    console.log(`✓ Created roadmap: ${roadmap.description}`);
  }

  console.log("\n✅ Seeding completed successfully!");
  await connection.end();
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
