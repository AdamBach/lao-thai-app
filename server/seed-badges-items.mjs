import mysql from 'mysql2/promise';

const badges = [
  {
    name: '첫 발걸음',
    description: '첫 번째 발음 연습을 완료했어요!',
    icon: '🌱',
    rarity: 'common',
    unlockedCondition: 'first_pronunciation',
    xpReward: 10,
  },
  {
    name: '연속 학습자',
    description: '7일 연속으로 챌린지를 완료했어요!',
    icon: '🔥',
    rarity: 'uncommon',
    unlockedCondition: '7_day_streak',
    xpReward: 50,
  },
  {
    name: '전문가',
    description: '14일 연속으로 챌린지를 완료했어요!',
    icon: '⭐',
    rarity: 'rare',
    unlockedCondition: '14_day_streak',
    xpReward: 100,
  },
  {
    name: '마스터',
    description: '30일 연속으로 챌린지를 완료했어요!',
    icon: '👑',
    rarity: 'epic',
    unlockedCondition: '30_day_streak',
    xpReward: 200,
  },
  {
    name: '정확도 달인',
    description: '100개 단어를 90% 이상의 정확도로 발음했어요!',
    icon: '🎯',
    rarity: 'uncommon',
    unlockedCondition: 'high_accuracy_100',
    xpReward: 75,
  },
  {
    name: '라오어 전문가',
    description: '라오어 50개 단어를 완벽하게 발음했어요!',
    icon: '🇱🇦',
    rarity: 'rare',
    unlockedCondition: 'lao_50_words',
    xpReward: 100,
  },
  {
    name: '태국어 전문가',
    description: '태국어 50개 단어를 완벽하게 발음했어요!',
    icon: '🇹🇭',
    rarity: 'rare',
    unlockedCondition: 'thai_50_words',
    xpReward: 100,
  },
  {
    name: '주간 챔피언',
    description: '한 주의 모든 챌린지를 완료했어요!',
    icon: '🏆',
    rarity: 'epic',
    unlockedCondition: 'weekly_challenge_complete',
    xpReward: 150,
  },
  {
    name: '언어 마스터',
    description: '라오어와 태국어 모두 100개 단어를 완벽하게 발음했어요!',
    icon: '🌍',
    rarity: 'legendary',
    unlockedCondition: 'bilingual_master',
    xpReward: 500,
  },
  {
    name: '커뮤니티 스타',
    description: '친구들과 함께 학습하고 있어요!',
    icon: '⭐✨',
    rarity: 'uncommon',
    unlockedCondition: 'add_friend',
    xpReward: 25,
  },
];

const specialItems = [
  {
    name: '보너스 XP 50',
    description: '다음 챌린지에서 50 XP를 추가로 획득합니다.',
    icon: '⚡',
    itemType: 'bonus_xp',
    value: 50,
    rarity: 'common',
    unlockedCondition: 'weekly_challenge_complete',
  },
  {
    name: '보너스 XP 100',
    description: '다음 챌린지에서 100 XP를 추가로 획득합니다.',
    icon: '⚡⚡',
    itemType: 'bonus_xp',
    value: 100,
    rarity: 'uncommon',
    unlockedCondition: 'weekly_challenge_complete_2',
  },
  {
    name: '힌트 사용권',
    description: '발음 연습에서 한 번 힌트를 사용할 수 있습니다.',
    icon: '💡',
    itemType: 'hint',
    value: 1,
    rarity: 'common',
    unlockedCondition: 'weekly_challenge_complete',
  },
  {
    name: '스킵 권리',
    description: '어려운 단어를 한 번 건너뛸 수 있습니다.',
    icon: '⏭️',
    itemType: 'skip',
    value: 1,
    rarity: 'uncommon',
    unlockedCondition: 'weekly_challenge_complete_2',
  },
  {
    name: '파워업 - 더블 XP',
    description: '다음 챌린지에서 획득하는 모든 XP가 2배가 됩니다.',
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
