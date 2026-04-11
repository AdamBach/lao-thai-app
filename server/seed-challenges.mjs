import mysql from 'mysql2/promise';

const dailyChallenges = [
  {
    date: new Date(Date.now() + 0 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Today
    title: '라오어 인사말 마스터',
    description: '라오어 인사말 5개를 배우고 정확하게 발음해보세요. 각 단어를 3번 이상 연습하면 완료됩니다.',
    language: 'lao',
    targetCount: 5,
    xpReward: 100,
  },
  {
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    title: '태국어 숫자 배우기',
    description: '태국어 숫자 1부터 10까지를 배우세요. 정확도 80% 이상이면 완료됩니다.',
    language: 'thai',
    targetCount: 10,
    xpReward: 150,
  },
  {
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    title: '라오어 음식 어휘',
    description: '라오어 음식 관련 단어 8개를 발음 연습하세요. 평균 정확도 75% 이상이면 완료됩니다.',
    language: 'lao',
    targetCount: 8,
    xpReward: 120,
  },
  {
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    title: '태국어 인사말 완벽하게',
    description: '태국어 인사말을 완벽하게 발음해보세요. 정확도 90% 이상으로 5개 단어를 연습하면 완료됩니다.',
    language: 'thai',
    targetCount: 5,
    xpReward: 200,
  },
  {
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    title: '라오어 종합 연습',
    description: '라오어 인사말, 숫자, 음식 등 다양한 카테고리에서 10개 단어를 연습하세요.',
    language: 'lao',
    targetCount: 10,
    xpReward: 250,
  },
  {
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    title: '태국어 종합 연습',
    description: '태국어 인사말, 숫자, 음식 등 다양한 카테고리에서 10개 단어를 연습하세요.',
    language: 'thai',
    targetCount: 10,
    xpReward: 250,
  },
  {
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    title: '주간 챌린지 완료!',
    description: '이번 주 모든 챌린지를 완료하고 최종 보너스 XP를 획득하세요!',
    language: 'lao',
    targetCount: 1,
    xpReward: 500,
  },
];

async function seedDatabase() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    console.log('Seeding daily challenges...');

    for (const challenge of dailyChallenges) {
      await connection.execute(
        `INSERT INTO daily_challenges (date, title, description, language, targetCount, xpReward) 
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         title = VALUES(title), 
         description = VALUES(description), 
         language = VALUES(language), 
         targetCount = VALUES(targetCount), 
         xpReward = VALUES(xpReward)`,
        [
          challenge.date,
          challenge.title,
          challenge.description,
          challenge.language,
          challenge.targetCount,
          challenge.xpReward,
        ]
      );
    }

    console.log(`✓ Successfully seeded ${dailyChallenges.length} daily challenges`);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedDatabase().catch(console.error);
