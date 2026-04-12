import mysql from 'mysql2/promise';

const dailyChallenges = [
  {
    date: new Date(Date.now() + 0 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Today
    title: 'Lao Greetings Master',
    description: 'Learn 5 Lao greetings and pronounce them accurately. Practice each word 3+ times to complete.',
    language: 'lao',
    targetCount: 5,
    xpReward: 100,
  },
  {
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    title: 'Thai Numbers Practice',
    description: 'Learn Thai numbers 1 through 10. Complete with 80%+ accuracy.',
    language: 'thai',
    targetCount: 10,
    xpReward: 150,
  },
  {
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    title: 'Lao Food Vocabulary',
    description: 'Practice pronouncing 8 Lao food words. Complete with 75%+ average accuracy.',
    language: 'lao',
    targetCount: 8,
    xpReward: 120,
  },
  {
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    title: 'Perfect Thai Greetings',
    description: 'Pronounce Thai greetings perfectly. Practice 5 words with 90%+ accuracy to complete.',
    language: 'thai',
    targetCount: 5,
    xpReward: 200,
  },
  {
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    title: 'Lao Comprehensive Practice',
    description: 'Practice 10 words across various categories including Lao greetings, numbers, and food.',
    language: 'lao',
    targetCount: 10,
    xpReward: 250,
  },
  {
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    title: 'Thai Comprehensive Practice',
    description: 'Practice 10 words across various categories including Thai greetings, numbers, and food.',
    language: 'thai',
    targetCount: 10,
    xpReward: 250,
  },
  {
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    title: 'Weekly Challenge Complete!',
    description: 'Complete all challenges this week and earn the final bonus XP!',
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
