import mysql from 'mysql2/promise';

const pronunciationExercises = [
  // Lao - Greetings
  {
    language: 'lao',
    word: 'ສະບາຍດີ',
    romanization: 'sabai di',
    englishTranslation: 'Hello / Goodbye',
    koreanTranslation: '안녕하세요',
    chineseTranslation: '你好',
    category: 'greeting',
    difficulty: 'beginner',
    tonePattern: 'low-high',
  },
  {
    language: 'lao',
    word: 'ຂອບໃຈ',
    romanization: 'khob jai',
    englishTranslation: 'Thank you',
    koreanTranslation: '감사합니다',
    chineseTranslation: '谢谢',
    category: 'greeting',
    difficulty: 'beginner',
    tonePattern: 'high-high',
  },
  {
    language: 'lao',
    word: 'ບໍ່ເປັນຫຍັງ',
    romanization: 'bor pen nyang',
    englishTranslation: 'You\'re welcome',
    koreanTranslation: '괜찮습니다',
    chineseTranslation: '不客气',
    category: 'greeting',
    difficulty: 'beginner',
    tonePattern: 'low-low-low',
  },

  // Lao - Numbers
  {
    language: 'lao',
    word: 'ໜຶ່ງ',
    romanization: 'nueng',
    englishTranslation: 'One',
    koreanTranslation: '하나',
    chineseTranslation: '一',
    category: 'number',
    difficulty: 'beginner',
    tonePattern: 'high',
  },
  {
    language: 'lao',
    word: 'ສອງ',
    romanization: 'song',
    englishTranslation: 'Two',
    koreanTranslation: '둘',
    chineseTranslation: '二',
    category: 'number',
    difficulty: 'beginner',
    tonePattern: 'high',
  },
  {
    language: 'lao',
    word: 'ສາມ',
    romanization: 'sam',
    englishTranslation: 'Three',
    koreanTranslation: '셋',
    chineseTranslation: '三',
    category: 'number',
    difficulty: 'beginner',
    tonePattern: 'high',
  },

  // Lao - Food
  {
    language: 'lao',
    word: 'ເຂົ້າ',
    romanization: 'khao',
    englishTranslation: 'Rice',
    koreanTranslation: '쌀',
    chineseTranslation: '米',
    category: 'food',
    difficulty: 'beginner',
    tonePattern: 'high',
  },
  {
    language: 'lao',
    word: 'ນ້ຳ',
    romanization: 'nam',
    englishTranslation: 'Water',
    koreanTranslation: '물',
    chineseTranslation: '水',
    category: 'food',
    difficulty: 'beginner',
    tonePattern: 'high',
  },

  // Thai - Greetings
  {
    language: 'thai',
    word: 'สวัสดี',
    romanization: 'sawasdee',
    englishTranslation: 'Hello / Goodbye',
    koreanTranslation: '안녕하세요',
    chineseTranslation: '你好',
    category: 'greeting',
    difficulty: 'beginner',
    tonePattern: 'mid-mid-rising',
  },
  {
    language: 'thai',
    word: 'ขอบคุณ',
    romanization: 'khob khun',
    englishTranslation: 'Thank you',
    koreanTranslation: '감사합니다',
    chineseTranslation: '谢谢',
    category: 'greeting',
    difficulty: 'beginner',
    tonePattern: 'falling-mid',
  },
  {
    language: 'thai',
    word: 'ยินดี',
    romanization: 'yin di',
    englishTranslation: 'Happy / Pleased',
    koreanTranslation: '기쁜',
    chineseTranslation: '高兴',
    category: 'greeting',
    difficulty: 'beginner',
    tonePattern: 'rising-high',
  },

  // Thai - Numbers
  {
    language: 'thai',
    word: 'หนึ่ง',
    romanization: 'nueng',
    englishTranslation: 'One',
    koreanTranslation: '하나',
    chineseTranslation: '一',
    category: 'number',
    difficulty: 'beginner',
    tonePattern: 'high',
  },
  {
    language: 'thai',
    word: 'สอง',
    romanization: 'song',
    englishTranslation: 'Two',
    koreanTranslation: '둘',
    chineseTranslation: '二',
    category: 'number',
    difficulty: 'beginner',
    tonePattern: 'high',
  },
  {
    language: 'thai',
    word: 'สาม',
    romanization: 'sam',
    englishTranslation: 'Three',
    koreanTranslation: '셋',
    chineseTranslation: '三',
    category: 'number',
    difficulty: 'beginner',
    tonePattern: 'high',
  },

  // Thai - Food
  {
    language: 'thai',
    word: 'ข้าว',
    romanization: 'khao',
    englishTranslation: 'Rice',
    koreanTranslation: '쌀',
    chineseTranslation: '米',
    category: 'food',
    difficulty: 'beginner',
    tonePattern: 'high',
  },
  {
    language: 'thai',
    word: 'น้ำ',
    romanization: 'nam',
    englishTranslation: 'Water',
    koreanTranslation: '물',
    chineseTranslation: '水',
    category: 'food',
    difficulty: 'beginner',
    tonePattern: 'high',
  },
];

async function seedDatabase() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    console.log('Seeding pronunciation exercises...');

    for (const exercise of pronunciationExercises) {
      await connection.execute(
        `INSERT INTO pronunciation_exercises (language, word, romanization, englishTranslation, koreanTranslation, chineseTranslation, category, difficulty, tonePattern) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          exercise.language,
          exercise.word,
          exercise.romanization,
          exercise.englishTranslation,
          exercise.koreanTranslation,
          exercise.chineseTranslation,
          exercise.category,
          exercise.difficulty,
          exercise.tonePattern,
        ]
      );
    }

    console.log(`✓ Successfully seeded ${pronunciationExercises.length} pronunciation exercises`);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedDatabase().catch(console.error);
