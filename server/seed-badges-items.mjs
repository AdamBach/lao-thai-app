import mysql from 'mysql2/promise';

const badges = [
  {
    name: 'First Steps',
    description: 'Completed your first pronunciation practice!',
    icon: '🌱',
    rarity: 'common',
    unlockedCondition: 'first_pronunciation',
    xpReward: 10,
  },
  {
    name: 'Streak Learner',
    description: 'Completed challenges 7 days in a row!',
    icon: '🔥',
    rarity: 'uncommon',
    unlockedCondition: '7_day_streak',
    xpReward: 50,
  },
  {
    name: 'Expert',
    description: 'Completed challenges 14 days in a row!',
    icon: '⭐',
    rarity: 'rare',
    unlockedCondition: '14_day_streak',
    xpReward: 100,
  },
  {
    name: 'Master',
    description: 'Completed challenges 30 days in a row!',
    icon: '👑',
    rarity: 'epic',
    unlockedCondition: '30_day_streak',
    xpReward: 200,
  },
  {
    name: 'Accuracy Pro',
    description: 'Pronounced 100 words with 90%+ accuracy!',
    icon: '🎯',
    rarity: 'uncommon',
    unlockedCondition: 'high_accuracy_100',
    xpReward: 75,
  },
  {
    name: 'Lao Expert',
    description: 'Perfectly pronounced 50 Lao words!',
    icon: '🇱🇦',
    rarity: 'rare',
    unlockedCondition: 'lao_50_words',
    xpReward: 100,
  },
  {
    name: 'Thai Expert',
    description: 'Perfectly pronounced 50 Thai words!',
    icon: '🇹🇭',
    rarity: 'rare',
    unlockedCondition: 'thai_50_words',
    xpReward: 100,
  },
  {
    name: 'Weekly Champion',
    description: 'Completed all challenges for the week!',
    icon: '🏆',
    rarity: 'epic',
    unlockedCondition: 'weekly_challenge_complete',
    xpReward: 150,
  },
  {
    name: 'Language Master',
    description: 'Perfectly pronounced 100 words in both Lao and Thai!',
    icon: '🌍',
    rarity: 'legendary',
    unlockedCondition: 'bilingual_master',
    xpReward: 500,
  },
  {
    name: 'Community Star',
    description: 'Learning together with friends!',
    icon: '⭐✨',
    rarity: 'uncommon',
    unlockedCondition: 'add_friend',
    xpReward: 25,
  },
];

const specialItems = [
  {
    name: 'Bonus XP 50',
    description: 'Earn 50 extra XP in your next challenge.',
    icon: '⚡',
    itemType: 'bonus_xp',
    value: 50,
    rarity: 'common',
    unlockedCondition: 'weekly_challenge_complete',
  },
  {
    name: 'Bonus XP 100',
    description: 'Earn 100 extra XP in your next challenge.',
    icon: '⚡⚡',
    itemType: 'bonus_xp',
    value: 100,
    rarity: 'uncommon',
    unlockedCondition: 'weekly_challenge_complete_2',
  },
  {
    name: 'Hint Pass',
    description: 'Use a hint once during pronunciation practice.',
    icon: '💡',
    itemType: 'hint',
    value: 1,
    rarity: 'common',
    unlockedCondition: 'weekly_challenge_complete',
  },
  {
    name: 'Skip Pass',
    description: 'Skip a difficult word once.',
    icon: '⏭️',
    itemType: 'skip',
    value: 1,
    rarity: 'uncommon',
    unlockedCondition: 'weekly_challenge_complete_2',
  },
  {
    name: 'Power-Up: Double XP',
    description: 'All XP earned in your next challenge is doubled.',
    icon: '🚀',
    itemType: 'power_up',
    value: 2,
    rarity: 'rare',
    unlockedCondition: 'weekly_challenge_complete_3',
  },
];

async function seedDatabase() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    console.log('Seeding badges and special items...');

    // Seed badges
    for (const badge of badges) {
      await connection.execute(
        `INSERT INTO badges (name, description, icon, rarity, unlockedCondition, xpReward) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          badge.name,
          badge.description,
          badge.icon,
          badge.rarity,
          badge.unlockedCondition,
          badge.xpReward,
        ]
      );
    }

    console.log(`✓ Successfully seeded ${badges.length} badges`);

    // Seed special items
    for (const item of specialItems) {
      await connection.execute(
        `INSERT INTO special_items (name, description, icon, itemType, value, rarity, unlockedCondition) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          item.name,
          item.description,
          item.icon,
          item.itemType,
          item.value,
          item.rarity,
          item.unlockedCondition,
        ]
      );
    }

    console.log(`✓ Successfully seeded ${specialItems.length} special items`);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedDatabase().catch(console.error);
