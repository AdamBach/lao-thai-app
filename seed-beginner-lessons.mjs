import mysql from 'mysql2/promise';

const lessonsData = [
  // Hello (สวัสดี / ສະບາຍດີ)
  {
    language: 'thai',
    category: 'hello',
    title: 'สวัสดี - Hello',
    description: 'Learn basic Thai greetings',
    difficulty: 'beginner',
    order: 1,
    content: JSON.stringify([
      { thai: 'สวัสดี', lao: 'ສະບາຍດີ', english: 'Hello', pronunciation: 'sa-wad-dee' },
      { thai: 'ขอบคุณ', lao: 'ຂອບໃຈ', english: 'Thank you', pronunciation: 'khop-khun' },
      { thai: 'ใช่', lao: 'ແມ່ນ', english: 'Yes', pronunciation: 'chai' },
      { thai: 'ไม่', lao: 'ບໍ່', english: 'No', pronunciation: 'mai' },
      { thai: 'ขออภัย', lao: 'ຂໍໂທດ', english: 'Sorry', pronunciation: 'kho-a-pai' },
      { thai: 'ได้ไหม', lao: 'ໄດ້ບໍ່', english: 'Can you?', pronunciation: 'dai-mai' },
      { thai: 'ดีมาก', lao: 'ດີຫຼາຍ', english: 'Very good', pronunciation: 'dee-mak' },
      { thai: 'ไม่ดี', lao: 'ບໍ່ດີ', english: 'Not good', pronunciation: 'mai-dee' },
      { thai: 'สวัสดีค่ะ', lao: 'ສະບາຍດີຄະ', english: 'Hello (polite)', pronunciation: 'sa-wad-dee-kha' },
      { thai: 'สวัสดีครับ', lao: 'ສະບາຍດີຄຣັບ', english: 'Hello (male)', pronunciation: 'sa-wad-dee-krap' },
    ]),
  },
  {
    language: 'lao',
    category: 'hello',
    title: 'ສະບາຍດີ - Hello',
    description: 'Learn basic Lao greetings',
    difficulty: 'beginner',
    order: 1,
    content: JSON.stringify([
      { lao: 'ສະບາຍດີ', thai: 'สวัสดี', english: 'Hello', pronunciation: 'sa-bai-di' },
      { lao: 'ຂອບໃຈ', thai: 'ขอบคุณ', english: 'Thank you', pronunciation: 'khop-jai' },
      { lao: 'ແມ່ນ', thai: 'ใช่', english: 'Yes', pronunciation: 'men' },
      { lao: 'ບໍ່', thai: 'ไม่', english: 'No', pronunciation: 'bo' },
      { lao: 'ຂໍໂທດ', thai: 'ขออภัย', english: 'Sorry', pronunciation: 'kho-thot' },
      { lao: 'ໄດ້ບໍ່', thai: 'ได้ไหม', english: 'Can you?', pronunciation: 'dai-bo' },
      { lao: 'ດີຫຼາຍ', thai: 'ดีมาก', english: 'Very good', pronunciation: 'di-lai' },
      { lao: 'ບໍ່ດີ', thai: 'ไม่ดี', english: 'Not good', pronunciation: 'bo-di' },
      { lao: 'ສະບາຍດີຄະ', thai: 'สวัสดีค่ะ', english: 'Hello (polite)', pronunciation: 'sa-bai-di-kha' },
      { lao: 'ສະບາຍດີຄຣັບ', thai: 'สวัสดีครับ', english: 'Hello (male)', pronunciation: 'sa-bai-di-krap' },
    ]),
  },
  // Family (ครอบครัว / ຄອບຄົວ)
  {
    language: 'thai',
    category: 'family',
    title: 'ครอบครัว - Family',
    description: 'Learn Thai family members',
    difficulty: 'beginner',
    order: 2,
    content: JSON.stringify([
      { thai: 'พ่อ', lao: 'ພໍ່', english: 'Father', pronunciation: 'pho' },
      { thai: 'แม่', lao: 'ແມ່', english: 'Mother', pronunciation: 'mae' },
      { thai: 'พี่ชาย', lao: 'ອ້າຍຊາຍ', english: 'Older brother', pronunciation: 'phi-chai' },
      { thai: 'พี่สาว', lao: 'ອ້າຍສາວ', english: 'Older sister', pronunciation: 'phi-sao' },
      { thai: 'น้องชาย', lao: 'ນ້ອງຊາຍ', english: 'Younger brother', pronunciation: 'nong-chai' },
      { thai: 'น้องสาว', lao: 'ນ້ອງສາວ', english: 'Younger sister', pronunciation: 'nong-sao' },
      { thai: 'ลุง', lao: 'ລຸງ', english: 'Uncle', pronunciation: 'lung' },
      { thai: 'ป้า', lao: 'ປ້າ', english: 'Aunt', pronunciation: 'pa' },
      { thai: 'ครอบครัว', lao: 'ຄອບຄົວ', english: 'Family', pronunciation: 'krop-krua' },
      { thai: 'ปู่', lao: 'ປູ່', english: 'Grandfather', pronunciation: 'pu' },
    ]),
  },
  {
    language: 'lao',
    category: 'family',
    title: 'ຄອບຄົວ - Family',
    description: 'Learn Lao family members',
    difficulty: 'beginner',
    order: 2,
    content: JSON.stringify([
      { lao: 'ພໍ່', thai: 'พ่อ', english: 'Father', pronunciation: 'pho' },
      { lao: 'แມ່', thai: 'แม่', english: 'Mother', pronunciation: 'mae' },
      { lao: 'ອ້າຍຊາຍ', thai: 'พี่ชาย', english: 'Older brother', pronunciation: 'ai-sai' },
      { lao: 'ອ້າຍສາວ', thai: 'พี่สาว', english: 'Older sister', pronunciation: 'ai-sao' },
      { lao: 'ນ້ອງຊາຍ', thai: 'น้องชาย', english: 'Younger brother', pronunciation: 'nong-sai' },
      { lao: 'ນ້ອງສາວ', thai: 'น้องสาว', english: 'Younger sister', pronunciation: 'nong-sao' },
      { lao: 'ລຸງ', thai: 'ลุง', english: 'Uncle', pronunciation: 'lung' },
      { lao: 'ປ້າ', thai: 'ป้า', english: 'Aunt', pronunciation: 'pa' },
      { lao: 'ຄອບຄົວ', thai: 'ครอบครัว', english: 'Family', pronunciation: 'khop-khua' },
      { lao: 'ປູ່', thai: 'ปู่', english: 'Grandfather', pronunciation: 'pu' },
    ]),
  },
  // Food (อาหาร / ອາຫານ)
  {
    language: 'thai',
    category: 'food',
    title: 'อาหาร - Food',
    description: 'Learn Thai food vocabulary',
    difficulty: 'beginner',
    order: 3,
    content: JSON.stringify([
      { thai: 'ข้าว', lao: 'ເຂົ້າ', english: 'Rice', pronunciation: 'khao' },
      { thai: 'เนื้อ', lao: 'ນື້ອ', english: 'Meat', pronunciation: 'neua' },
      { thai: 'ไก่', lao: 'ໄກ່', english: 'Chicken', pronunciation: 'gai' },
      { thai: 'ปลา', lao: 'ປາ', english: 'Fish', pronunciation: 'pla' },
      { thai: 'ผัก', lao: 'ຜັກ', english: 'Vegetable', pronunciation: 'phak' },
      { thai: 'ผลไม้', lao: 'ຜົນໄມ້', english: 'Fruit', pronunciation: 'phon-mai' },
      { thai: 'น้ำ', lao: 'ນ້ຳ', english: 'Water', pronunciation: 'nam' },
      { thai: 'ชา', lao: 'ຊາ', english: 'Tea', pronunciation: 'cha' },
      { thai: 'กาแฟ', lao: 'ກາແຟ', english: 'Coffee', pronunciation: 'ga-fae' },
      { thai: 'อาหาร', lao: 'ອາຫານ', english: 'Food', pronunciation: 'a-han' },
    ]),
  },
  {
    language: 'lao',
    category: 'food',
    title: 'ອາຫານ - Food',
    description: 'Learn Lao food vocabulary',
    difficulty: 'beginner',
    order: 3,
    content: JSON.stringify([
      { lao: 'ເຂົ້າ', thai: 'ข้าว', english: 'Rice', pronunciation: 'khao' },
      { lao: 'ນື້ອ', thai: 'เนื้อ', english: 'Meat', pronunciation: 'neua' },
      { lao: 'ໄກ່', thai: 'ไก่', english: 'Chicken', pronunciation: 'gai' },
      { lao: 'ປາ', thai: 'ปลา', english: 'Fish', pronunciation: 'pa' },
      { lao: 'ຜັກ', thai: 'ผัก', english: 'Vegetable', pronunciation: 'phak' },
      { lao: 'ຜົນໄມ້', thai: 'ผลไม้', english: 'Fruit', pronunciation: 'phon-mai' },
      { lao: 'ນ້ຳ', thai: 'น้ำ', english: 'Water', pronunciation: 'nam' },
      { lao: 'ຊາ', thai: 'ชา', english: 'Tea', pronunciation: 'cha' },
      { lao: 'ກາແຟ', thai: 'กาแฟ', english: 'Coffee', pronunciation: 'ga-fae' },
      { lao: 'ອາຫານ', thai: 'อาหาร', english: 'Food', pronunciation: 'a-han' },
    ]),
  },
  // Languages (ภาษา / ພາສາ)
  {
    language: 'thai',
    category: 'languages',
    title: 'ภาษา - Languages',
    description: 'Learn language names in Thai',
    difficulty: 'beginner',
    order: 4,
    content: JSON.stringify([
      { thai: 'ภาษาไทย', lao: 'ພາສາໄທ', english: 'Thai language', pronunciation: 'pha-sa-thai' },
      { thai: 'ภาษาลาว', lao: 'ພາສາລາວ', english: 'Lao language', pronunciation: 'pha-sa-lao' },
      { thai: 'ภาษาอังกฤษ', lao: 'ພາສາອັງກິດ', english: 'English language', pronunciation: 'pha-sa-ang-krit' },
      { thai: 'ภาษาจีน', lao: 'ພາສາຈີນ', english: 'Chinese language', pronunciation: 'pha-sa-chin' },
      { thai: 'ภาษาญี่ปุ่น', lao: 'ພາສາຍີ່ປຸ່ນ', english: 'Japanese language', pronunciation: 'pha-sa-yip-pun' },
      { thai: 'ภาษาเกาหลี', lao: 'ພາສາເກົາຫລີ', english: 'Korean language', pronunciation: 'pha-sa-gao-li' },
      { thai: 'ภาษาเวียดนาม', lao: 'ພາສາວຽດນາມ', english: 'Vietnamese language', pronunciation: 'pha-sa-wiat-nam' },
      { thai: 'ภาษาพม่า', lao: 'ພາສາພະມ້າ', english: 'Burmese language', pronunciation: 'pha-sa-phama' },
      { thai: 'ภาษากัมพูชา', lao: 'ພາສາກຳພູດ', english: 'Khmer language', pronunciation: 'pha-sa-kham-phu-cha' },
      { thai: 'ภาษา', lao: 'ພາສາ', english: 'Language', pronunciation: 'pha-sa' },
    ]),
  },
  {
    language: 'lao',
    category: 'languages',
    title: 'ພາສາ - Languages',
    description: 'Learn language names in Lao',
    difficulty: 'beginner',
    order: 4,
    content: JSON.stringify([
      { lao: 'ພາສາໄທ', thai: 'ภาษาไทย', english: 'Thai language', pronunciation: 'pha-sa-thai' },
      { lao: 'ພາສາລາວ', thai: 'ภาษาลาว', english: 'Lao language', pronunciation: 'pha-sa-lao' },
      { lao: 'ພາສາອັງກິດ', thai: 'ภาษาอังกฤษ', english: 'English language', pronunciation: 'pha-sa-ang-kit' },
      { lao: 'ພາສາຈີນ', thai: 'ภาษาจีน', english: 'Chinese language', pronunciation: 'pha-sa-chin' },
      { lao: 'ພາສາຍີ່ປຸ່ນ', thai: 'ภาษาญี่ปุ่น', english: 'Japanese language', pronunciation: 'pha-sa-yip-pun' },
      { lao: 'ພາສາເກົາຫລີ', thai: 'ภาษาเกาหลี', english: 'Korean language', pronunciation: 'pha-sa-gao-li' },
      { lao: 'ພາສາວຽດນາມ', thai: 'ภาษาเวียดนาม', english: 'Vietnamese language', pronunciation: 'pha-sa-viet-nam' },
      { lao: 'ພາສາພະມ້າ', thai: 'ภาษาพม่า', english: 'Burmese language', pronunciation: 'pha-sa-pha-ma' },
      { lao: 'ພາສາກຳພູດ', thai: 'ภาษากัมพูชา', english: 'Khmer language', pronunciation: 'pha-sa-kam-phut' },
      { lao: 'ພາສາ', thai: 'ภาษา', english: 'Language', pronunciation: 'pha-sa' },
    ]),
  },
  // Family & Counting (ครอบครัวและการนับ / ຄອບຄົວ ແລະ ການນັບ)
  {
    language: 'thai',
    category: 'family_counting',
    title: 'ครอบครัวและการนับ - Family & Counting',
    description: 'Learn family and numbers in Thai',
    difficulty: 'beginner',
    order: 5,
    content: JSON.stringify([
      { thai: 'หนึ่ง', lao: 'ໜຶ່ງ', english: 'One', pronunciation: 'neung' },
      { thai: 'สอง', lao: 'ສອງ', english: 'Two', pronunciation: 'song' },
      { thai: 'สาม', lao: 'ສາມ', english: 'Three', pronunciation: 'sam' },
      { thai: 'สี่', lao: 'ສີ່', english: 'Four', pronunciation: 'si' },
      { thai: 'ห้า', lao: 'ຫ້າ', english: 'Five', pronunciation: 'ha' },
      { thai: 'หกครอบครัว', lao: 'ຫົກຄອບຄົວ', english: 'Six families', pronunciation: 'hok krop-krua' },
      { thai: 'เจ็ดคน', lao: 'ເຈັດຄົນ', english: 'Seven people', pronunciation: 'chet khon' },
      { thai: 'แปดพี่น้อง', lao: 'ແປດພີ່ນ້ອງ', english: 'Eight siblings', pronunciation: 'paet phi-nong' },
      { thai: 'เก้าสมาชิก', lao: 'ເກົ້າສະມາຊິກ', english: 'Nine members', pronunciation: 'gao samachik' },
      { thai: 'สิบคน', lao: 'ສິບຄົນ', english: 'Ten people', pronunciation: 'sip khon' },
    ]),
  },
  {
    language: 'lao',
    category: 'family_counting',
    title: 'ຄອບຄົວ ແລະ ການນັບ - Family & Counting',
    description: 'Learn family and numbers in Lao',
    difficulty: 'beginner',
    order: 5,
    content: JSON.stringify([
      { lao: 'ໜຶ່ງ', thai: 'หนึ่ง', english: 'One', pronunciation: 'neung' },
      { lao: 'ສອງ', thai: 'สอง', english: 'Two', pronunciation: 'song' },
      { lao: 'ສາມ', thai: 'สาม', english: 'Three', pronunciation: 'sam' },
      { lao: 'ສີ່', thai: 'สี่', english: 'Four', pronunciation: 'si' },
      { lao: 'ຫ້າ', thai: 'ห้า', english: 'Five', pronunciation: 'ha' },
      { lao: 'ຫົກຄອບຄົວ', thai: 'หกครอบครัว', english: 'Six families', pronunciation: 'hok khop-khua' },
      { lao: 'ເຈັດຄົນ', thai: 'เจ็ดคน', english: 'Seven people', pronunciation: 'chet khon' },
      { lao: 'แປດພີ່ນ້ອງ', thai: 'แปดพี่น้อง', english: 'Eight siblings', pronunciation: 'paet phi-nong' },
      { lao: 'ເກົ້າສະມາຊິກ', thai: 'เก้าสมาชิก', english: 'Nine members', pronunciation: 'gao samachik' },
      { lao: 'ສິບຄົນ', thai: 'สิบคน', english: 'Ten people', pronunciation: 'sip khon' },
    ]),
  },
  // Age & Counting (อายุและการนับ / ອາຍຸ ແລະ ການນັບ)
  {
    language: 'thai',
    category: 'age_counting',
    title: 'อายุและการนับ - Age & Counting',
    description: 'Learn age and numbers in Thai',
    difficulty: 'beginner',
    order: 6,
    content: JSON.stringify([
      { thai: 'อายุ', lao: 'ອາຍຸ', english: 'Age', pronunciation: 'ayu' },
      { thai: 'ฉันอายุ 20 ปี', lao: 'ຂ້ອຍອາຍຸ 20 ປີ', english: 'I am 20 years old', pronunciation: 'chan ayu 20 pi' },
      { thai: 'เขาอายุ 30 ปี', lao: 'ລາວອາຍຸ 30 ປີ', english: 'He/She is 30 years old', pronunciation: 'khao ayu 30 pi' },
      { thai: 'เด็ก', lao: 'ເດັກ', english: 'Child', pronunciation: 'dek' },
      { thai: 'วัยรุ่น', lao: 'ວັຍຮຸ່ນ', english: 'Teenager', pronunciation: 'wai-run' },
      { thai: 'ผู้ใหญ่', lao: 'ຜູ້ໃຫຍ່', english: 'Adult', pronunciation: 'phu-yai' },
      { thai: 'ผู้สูงอายุ', lao: 'ຜູ້ສູງອາຍຸ', english: 'Elderly', pronunciation: 'phu-sung-ayu' },
      { thai: 'บ่อย', lao: 'ບ່ອຍ', english: 'Often', pronunciation: 'boi' },
      { thai: 'บางครั้ง', lao: 'ບາງຄັ້ງ', english: 'Sometimes', pronunciation: 'bang-khrang' },
      { thai: 'ไม่เคย', lao: 'ບໍ່ເຄີຍ', english: 'Never', pronunciation: 'mai-khoi' },
    ]),
  },
  {
    language: 'lao',
    category: 'age_counting',
    title: 'ອາຍຸ ແລະ ການນັບ - Age & Counting',
    description: 'Learn age and numbers in Lao',
    difficulty: 'beginner',
    order: 6,
    content: JSON.stringify([
      { lao: 'ອາຍຸ', thai: 'อายุ', english: 'Age', pronunciation: 'ayu' },
      { lao: 'ຂ້ອຍອາຍຸ 20 ປີ', thai: 'ฉันอายุ 20 ปี', english: 'I am 20 years old', pronunciation: 'khoy ayu 20 pi' },
      { lao: 'ລາວອາຍຸ 30 ປີ', thai: 'เขาอายุ 30 ปี', english: 'He/She is 30 years old', pronunciation: 'lao ayu 30 pi' },
      { lao: 'ເດັກ', thai: 'เด็ก', english: 'Child', pronunciation: 'dek' },
      { lao: 'ວັຍຮຸ່ນ', thai: 'วัยรุ่น', english: 'Teenager', pronunciation: 'wai-hun' },
      { lao: 'ຜູ້ໃຫຍ່', thai: 'ผู้ใหญ่', english: 'Adult', pronunciation: 'phu-yai' },
      { lao: 'ຜູ້ສູງອາຍຸ', thai: 'ผู้สูงอายุ', english: 'Elderly', pronunciation: 'phu-sung-ayu' },
      { lao: 'ບ່ອຍ', thai: 'บ่อย', english: 'Often', pronunciation: 'boi' },
      { lao: 'ບາງຄັ້ງ', thai: 'บางครั้ง', english: 'Sometimes', pronunciation: 'bang-khang' },
      { lao: 'ບໍ່ເຄີຍ', thai: 'ไม่เคย', english: 'Never', pronunciation: 'bo-khoi' },
    ]),
  },
];

async function seedLessons() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lao_thai_learning',
  });

  try {
    // Clear existing data
    await connection.execute('DELETE FROM beginner_lessons');
    console.log('✓ Cleared existing lessons');

    // Insert new data
    for (const lesson of lessonsData) {
      const query = `
        INSERT INTO beginner_lessons 
        (language, category, title, description, content, difficulty, \`order\`, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      await connection.execute(query, [
        lesson.language,
        lesson.category,
        lesson.title,
        lesson.description,
        lesson.content,
        lesson.difficulty,
        lesson.order,
      ]);
    }

    console.log(`✓ Seeded ${lessonsData.length} lessons successfully`);
  } catch (error) {
    console.error('Error seeding lessons:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedLessons().catch(console.error);
