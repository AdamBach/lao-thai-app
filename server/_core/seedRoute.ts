import type { Express, Request, Response } from "express";
import { getDb } from "../db.js";
import { beginnerLessons } from "../../drizzle/schema.js";
import { createPool } from "mysql2/promise";

async function applySchema(): Promise<{ added: string[]; existing: string[]; error?: string }> {
  const url = process.env.DATABASE_URL;
  if (!url) return { added: [], existing: [], error: "No DATABASE_URL" };

  // Pass raw URL — same as drizzle does internally
  const pool = createPool(url);
  const added: string[] = [];
  const existing: string[] = [];
  try {
    const [rows] = await pool.query<any[]>(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'passwordHash'`
    );
    if (rows.length === 0) {
      await pool.query(`ALTER TABLE users ADD COLUMN passwordHash VARCHAR(255) NULL`);
      added.push("users.passwordHash");
    } else {
      existing.push("users.passwordHash");
    }
    await pool.query(`CREATE TABLE IF NOT EXISTS beginner_lessons (
      id INT AUTO_INCREMENT PRIMARY KEY, language ENUM('lao','thai') NOT NULL,
      title VARCHAR(255) NOT NULL, description TEXT,
      level ENUM('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
      category VARCHAR(100) NOT NULL, orderIndex INT NOT NULL DEFAULT 0,
      content JSON NOT NULL, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS user_lesson_progress (
      id INT AUTO_INCREMENT PRIMARY KEY, userId INT NOT NULL, lessonId INT NOT NULL,
      completed TINYINT(1) NOT NULL DEFAULT 0, score INT, completedAt TIMESTAMP NULL,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_user_lesson (userId, lessonId)
    )`);
  } catch (e: any) {
    return { added, existing, error: e.message };
  } finally {
    await pool.end().catch(() => {});
  }
  return { added, existing };
}

const LESSONS = [
  // ── THAI ──────────────────────────────────────────────────────────────
  {
    language: "thai" as const,
    category: "hello",
    title: "Thai Greetings",
    description: "Essential Thai greetings for every situation",
    order: 1,
    difficulty: "beginner",
    content: JSON.stringify([
      { thai: "สวัสดี",        lao: "ສະບາຍດີ",       romanization: "sa-wat-dee",      english: "Hello / Goodbye",     tonePattern: "mid-mid-rising" },
      { thai: "สวัสดีตอนเช้า", lao: "ສະບາຍດີຕອນເຊົ້າ", romanization: "sa-wat-dee ton chao", english: "Good morning",      tonePattern: "mid-mid-rising" },
      { thai: "สวัสดีตอนเย็น", lao: "ສະບາຍດີຕອນແລ່ງ", romanization: "sa-wat-dee ton yen",  english: "Good evening",      tonePattern: "mid-mid-rising" },
      { thai: "คุณสบายดีไหม",  lao: "ເຈົ້າສະບາຍດີບໍ",  romanization: "khun sa-bai-dee mai", english: "How are you?",      tonePattern: "mid-mid-high" },
      { thai: "ฉันสบายดี",     lao: "ຂ້ອຍສະບາຍດີ",    romanization: "chan sa-bai-dee",     english: "I'm fine",          tonePattern: "falling-mid" },
      { thai: "ขอบคุณ",        lao: "ຂອບໃຈ",          romanization: "khop-khun",           english: "Thank you",         tonePattern: "falling-mid" },
      { thai: "ขอโทษ",         lao: "ຂໍໂທດ",          romanization: "kho-thot",            english: "Sorry / Excuse me", tonePattern: "falling-high" },
      { thai: "ลาก่อน",        lao: "ລາກ່ອນ",         romanization: "la-kon",              english: "Goodbye",           tonePattern: "mid-low" },
      { thai: "ยินดีที่รู้จัก", lao: "ດີໃຈທີ່ຮູ້ຈັກ",  romanization: "yin-dee-thee-roo-jak", english: "Nice to meet you", tonePattern: "rising-high" },
      { thai: "ไม่เป็นไร",     lao: "ບໍ່ເປັນຫຍັງ",    romanization: "mai-pen-rai",         english: "Never mind / No worries", tonePattern: "low-mid-mid" },
    ]),
  },
  {
    language: "thai" as const,
    category: "family",
    title: "Thai Family",
    description: "Words for family members in Thai",
    order: 2,
    difficulty: "beginner",
    content: JSON.stringify([
      { thai: "พ่อ",    lao: "ພໍ່",    romanization: "pho",       english: "Father",          tonePattern: "low" },
      { thai: "แม่",    lao: "ແມ່",    romanization: "mae",       english: "Mother",          tonePattern: "low" },
      { thai: "พี่ชาย", lao: "ອ້າຍ",   romanization: "phi-chai",  english: "Older brother",   tonePattern: "rising-mid" },
      { thai: "พี่สาว", lao: "ອ້າຍ",   romanization: "phi-sao",   english: "Older sister",    tonePattern: "rising-low" },
      { thai: "น้องชาย",lao: "ນ້ອງ",   romanization: "nong-chai", english: "Younger brother", tonePattern: "high-mid" },
      { thai: "น้องสาว",lao: "ນ້ອງ",   romanization: "nong-sao",  english: "Younger sister",  tonePattern: "high-low" },
      { thai: "ปู่",    lao: "ປູ່",    romanization: "pu",        english: "Grandfather (pat.)",tonePattern: "low" },
      { thai: "ย่า",    lao: "ຍ່າ",    romanization: "ya",        english: "Grandmother (pat.)",tonePattern: "low" },
      { thai: "ตา",     lao: "ຕາ",    romanization: "ta",        english: "Grandfather (mat.)",tonePattern: "mid" },
      { thai: "ยาย",    lao: "ຍາຍ",   romanization: "yai",       english: "Grandmother (mat.)",tonePattern: "mid" },
      { thai: "ลูกชาย", lao: "ລູກຊາຍ", romanization: "luk-chai",  english: "Son",             tonePattern: "high-mid" },
      { thai: "ลูกสาว", lao: "ລູກສາວ", romanization: "luk-sao",   english: "Daughter",        tonePattern: "high-low" },
    ]),
  },
  {
    language: "thai" as const,
    category: "food",
    title: "Thai Food & Drinks",
    description: "Essential food and drink vocabulary",
    order: 3,
    difficulty: "beginner",
    content: JSON.stringify([
      { thai: "ข้าว",       lao: "ເຂົ້າ",       romanization: "khao",         english: "Rice",           tonePattern: "falling" },
      { thai: "น้ำ",        lao: "ນ້ຳ",         romanization: "nam",          english: "Water",          tonePattern: "high" },
      { thai: "อาหาร",      lao: "ອາຫານ",       romanization: "a-han",        english: "Food",           tonePattern: "mid-mid" },
      { thai: "ผัดไทย",     lao: "ຜັດໄທ",       romanization: "phat-thai",    english: "Pad Thai",       tonePattern: "high-mid" },
      { thai: "ต้มยำกุ้ง",  lao: "ຕົ້ມຍຳກຸ້ງ",  romanization: "tom-yam-kung", english: "Tom Yum soup",   tonePattern: "falling" },
      { thai: "ส้มตำ",      lao: "ຕຳໝາກຫຸ່ງ",  romanization: "som-tam",      english: "Papaya salad",   tonePattern: "falling-mid" },
      { thai: "เบียร์",     lao: "ເບຍ",         romanization: "bia",          english: "Beer",           tonePattern: "mid" },
      { thai: "ชา",         lao: "ຊາ",          romanization: "cha",          english: "Tea",            tonePattern: "mid" },
      { thai: "กาแฟ",       lao: "ກາເຟ",        romanization: "ka-fae",       english: "Coffee",         tonePattern: "mid-mid" },
      { thai: "ผลไม้",      lao: "ໝາກໄມ້",      romanization: "phon-la-mai",  english: "Fruit",          tonePattern: "high-mid" },
      { thai: "เนื้อ",      lao: "ຊີ້ນ",        romanization: "nuea",         english: "Meat",           tonePattern: "high" },
      { thai: "ปลา",        lao: "ປາ",          romanization: "pla",          english: "Fish",           tonePattern: "mid" },
    ]),
  },
  {
    language: "thai" as const,
    category: "numbers",
    title: "Thai Numbers 0-20",
    description: "Count in Thai from 0 to 20",
    order: 4,
    difficulty: "beginner",
    content: JSON.stringify([
      { number: 0,  thai: "ศูนย์",  lao: "ສູນ",    romanization: "soon",       english: "Zero"    },
      { number: 1,  thai: "หนึ่ง",  lao: "ໜຶ່ງ",   romanization: "nueng",      english: "One"     },
      { number: 2,  thai: "สอง",    lao: "ສອງ",    romanization: "song",       english: "Two"     },
      { number: 3,  thai: "สาม",    lao: "ສາມ",    romanization: "sam",        english: "Three"   },
      { number: 4,  thai: "สี่",    lao: "ສີ່",    romanization: "see",        english: "Four"    },
      { number: 5,  thai: "ห้า",    lao: "ຫ້າ",    romanization: "ha",         english: "Five"    },
      { number: 6,  thai: "หก",     lao: "ຫົກ",    romanization: "hok",        english: "Six"     },
      { number: 7,  thai: "เจ็ด",   lao: "ເຈັດ",   romanization: "chet",       english: "Seven"   },
      { number: 8,  thai: "แปด",    lao: "ແປດ",    romanization: "paet",       english: "Eight"   },
      { number: 9,  thai: "เก้า",   lao: "ເກົ້າ",  romanization: "kao",        english: "Nine"    },
      { number: 10, thai: "สิบ",    lao: "ສິບ",    romanization: "sip",        english: "Ten"     },
      { number: 20, thai: "ยี่สิบ", lao: "ຊາວ",    romanization: "yee-sip",    english: "Twenty"  },
      { number: 100,thai: "ร้อย",   lao: "ຮ້ອຍ",   romanization: "roi",        english: "Hundred" },
    ]),
  },
  {
    language: "thai" as const,
    category: "days",
    title: "Thai Days of the Week",
    description: "All 7 days of the week in Thai",
    order: 5,
    difficulty: "beginner",
    content: JSON.stringify([
      { thai: "วันจันทร์",    lao: "ວັນຈັນ",      romanization: "wan-chan",     english: "Monday",    day: "Monday" },
      { thai: "วันอังคาร",    lao: "ວັນອັງຄານ",   romanization: "wan-ang-karn", english: "Tuesday",   day: "Tuesday" },
      { thai: "วันพุธ",       lao: "ວັນພຸດ",      romanization: "wan-phut",     english: "Wednesday", day: "Wednesday" },
      { thai: "วันพฤหัสบดี",  lao: "ວັນພະຫັດ",   romanization: "wan-pha-rhu-hat", english: "Thursday", day: "Thursday" },
      { thai: "วันศุกร์",     lao: "ວັນສຸກ",      romanization: "wan-suk",      english: "Friday",    day: "Friday" },
      { thai: "วันเสาร์",     lao: "ວັນເສົາ",     romanization: "wan-sao",      english: "Saturday",  day: "Saturday" },
      { thai: "วันอาทิตย์",   lao: "ວັນອາທິດ",    romanization: "wan-a-thit",   english: "Sunday",    day: "Sunday" },
    ]),
  },
  {
    language: "thai" as const,
    category: "phrases",
    title: "Thai Essential Phrases",
    description: "Must-know phrases for daily life",
    order: 6,
    difficulty: "beginner",
    content: JSON.stringify([
      { thai: "คุณชื่ออะไร",      romanization: "khun-chue-arai",       english: "What is your name?" },
      { thai: "ฉันชื่อ...",        romanization: "chan-chue",             english: "My name is..." },
      { thai: "คุณมาจากไหน",      romanization: "khun-ma-chak-nai",     english: "Where are you from?" },
      { thai: "ฉันมาจาก...",       romanization: "chan-ma-chak",          english: "I'm from..." },
      { thai: "ราคาเท่าไหร่",      romanization: "ra-kha-thao-rai",      english: "How much does it cost?" },
      { thai: "ฉันไม่เข้าใจ",      romanization: "chan-mai-khao-jai",     english: "I don't understand" },
      { thai: "พูดช้าๆ หน่อย",     romanization: "phut-cha-cha-noi",     english: "Please speak slowly" },
      { thai: "ช่วยด้วย",          romanization: "chuay-duay",            english: "Help me please" },
      { thai: "ห้องน้ำอยู่ที่ไหน", romanization: "hong-nam-yu-thee-nai", english: "Where is the bathroom?" },
      { thai: "เท่าไหร่",          romanization: "thao-rai",              english: "How much?" },
    ]),
  },

  // ── LAO ──────────────────────────────────────────────────────────────
  {
    language: "lao" as const,
    category: "hello",
    title: "Lao Greetings",
    description: "Essential Lao greetings for every situation",
    order: 1,
    difficulty: "beginner",
    content: JSON.stringify([
      { lao: "ສະບາຍດີ",          thai: "สวัสดี",          romanization: "sa-bai-dee",          english: "Hello / Goodbye",     tonePattern: "low-rising" },
      { lao: "ສະບາຍດີຕອນເຊົ້າ",  thai: "สวัสดีตอนเช้า",  romanization: "sa-bai-dee ton chao", english: "Good morning",        tonePattern: "low-rising" },
      { lao: "ສະບາຍດີຕອນແລ່ງ",  thai: "สวัสดีตอนเย็น",  romanization: "sa-bai-dee ton laeng",english: "Good evening",        tonePattern: "low-rising" },
      { lao: "ເຈົ້າສະບາຍດີບໍ",   thai: "คุณสบายดีไหม",   romanization: "chao sa-bai-dee bor", english: "How are you?",        tonePattern: "mid-low" },
      { lao: "ຂ້ອຍສະບາຍດີ",      thai: "ฉันสบายดี",      romanization: "khoi sa-bai-dee",     english: "I'm fine",            tonePattern: "falling" },
      { lao: "ຂອບໃຈ",            thai: "ขอบคุณ",         romanization: "khop-chai",           english: "Thank you",           tonePattern: "low-rising" },
      { lao: "ຂໍໂທດ",            thai: "ขอโทษ",          romanization: "kho-thot",            english: "Sorry / Excuse me",   tonePattern: "low-high" },
      { lao: "ລາກ່ອນ",           thai: "ลาก่อน",         romanization: "la-kon",              english: "Goodbye",             tonePattern: "mid-low" },
      { lao: "ດີໃຈທີ່ຮູ້ຈັກ",   thai: "ยินดีที่รู้จัก", romanization: "dee-jai-thee-hoo-jak",english: "Nice to meet you",    tonePattern: "rising-mid" },
      { lao: "ບໍ່ເປັນຫຍັງ",      thai: "ไม่เป็นไร",      romanization: "bor-pen-nyang",       english: "Never mind / No worries", tonePattern: "low-mid" },
    ]),
  },
  {
    language: "lao" as const,
    category: "family",
    title: "Lao Family",
    description: "Words for family members in Lao",
    order: 2,
    difficulty: "beginner",
    content: JSON.stringify([
      { lao: "ພໍ່",     thai: "พ่อ",    romanization: "pho",      english: "Father",            tonePattern: "low" },
      { lao: "ແມ່",     thai: "แม่",    romanization: "mae",      english: "Mother",            tonePattern: "low" },
      { lao: "ອ້າຍ",    thai: "พี่ชาย", romanization: "ai",       english: "Older brother",     tonePattern: "falling" },
      { lao: "ອ້າຍ",    thai: "พี่สาว", romanization: "e",        english: "Older sister",      tonePattern: "rising" },
      { lao: "ນ້ອງ",    thai: "น้องชาย",romanization: "nong",     english: "Younger sibling",   tonePattern: "high" },
      { lao: "ປູ່",     thai: "ปู่",    romanization: "pu",       english: "Grandfather (pat.)",tonePattern: "low" },
      { lao: "ຍ່າ",     thai: "ย่า",    romanization: "ya",       english: "Grandmother (pat.)",tonePattern: "low" },
      { lao: "ຕາ",      thai: "ตา",     romanization: "ta",       english: "Grandfather (mat.)",tonePattern: "mid" },
      { lao: "ຍາຍ",     thai: "ยาย",    romanization: "yai",      english: "Grandmother (mat.)",tonePattern: "mid" },
      { lao: "ລູກຊາຍ",  thai: "ลูกชาย", romanization: "luk-sai",  english: "Son",               tonePattern: "high-mid" },
      { lao: "ລູກສາວ",  thai: "ลูกสาว", romanization: "luk-sao",  english: "Daughter",          tonePattern: "high-low" },
    ]),
  },
  {
    language: "lao" as const,
    category: "food",
    title: "Lao Food & Drinks",
    description: "Essential food and drink vocabulary",
    order: 3,
    difficulty: "beginner",
    content: JSON.stringify([
      { lao: "ເຂົ້າ",       thai: "ข้าว",       romanization: "khao",        english: "Rice",           tonePattern: "falling" },
      { lao: "ນ້ຳ",         thai: "น้ำ",        romanization: "nam",         english: "Water",          tonePattern: "high" },
      { lao: "ອາຫານ",       thai: "อาหาร",      romanization: "a-han",       english: "Food",           tonePattern: "mid-mid" },
      { lao: "ເຂົ້າໜຽວ",   thai: "ข้าวเหนียว",  romanization: "khao-niao",   english: "Sticky rice",    tonePattern: "falling-rising" },
      { lao: "ຕົ້ມໝາກເຜັດ", thai: "แกงเผ็ด",    romanization: "tom-mak-phet",english: "Spicy stew",     tonePattern: "falling" },
      { lao: "ຕຳໝາກຫຸ່ງ",  thai: "ส้มตำ",      romanization: "tam-mak-hung",english: "Papaya salad",   tonePattern: "rising" },
      { lao: "ເບຍ",         thai: "เบียร์",     romanization: "bia",         english: "Beer",           tonePattern: "mid" },
      { lao: "ຊາ",          thai: "ชา",         romanization: "sa",          english: "Tea",            tonePattern: "mid" },
      { lao: "ກາເຟ",        thai: "กาแฟ",       romanization: "ka-fe",       english: "Coffee",         tonePattern: "mid-mid" },
      { lao: "ໝາກໄມ້",      thai: "ผลไม้",      romanization: "mak-mai",     english: "Fruit",          tonePattern: "high-mid" },
      { lao: "ຊີ້ນ",        thai: "เนื้อ",      romanization: "sin",         english: "Meat",           tonePattern: "high" },
      { lao: "ປາ",          thai: "ปลา",        romanization: "pa",          english: "Fish",           tonePattern: "mid" },
    ]),
  },
  {
    language: "lao" as const,
    category: "numbers",
    title: "Lao Numbers 0-20",
    description: "Count in Lao from 0 to 20",
    order: 4,
    difficulty: "beginner",
    content: JSON.stringify([
      { number: 0,   lao: "ສູນ",    thai: "ศูนย์",  romanization: "soon",    english: "Zero"    },
      { number: 1,   lao: "ໜຶ່ງ",   thai: "หนึ่ง",  romanization: "nueng",   english: "One"     },
      { number: 2,   lao: "ສອງ",    thai: "สอง",    romanization: "song",    english: "Two"     },
      { number: 3,   lao: "ສາມ",    thai: "สาม",    romanization: "sam",     english: "Three"   },
      { number: 4,   lao: "ສີ່",    thai: "สี่",    romanization: "see",     english: "Four"    },
      { number: 5,   lao: "ຫ້າ",    thai: "ห้า",    romanization: "ha",      english: "Five"    },
      { number: 6,   lao: "ຫົກ",    thai: "หก",     romanization: "hok",     english: "Six"     },
      { number: 7,   lao: "ເຈັດ",   thai: "เจ็ด",   romanization: "chet",    english: "Seven"   },
      { number: 8,   lao: "ແປດ",    thai: "แปด",    romanization: "paet",    english: "Eight"   },
      { number: 9,   lao: "ເກົ້າ",  thai: "เก้า",   romanization: "kao",     english: "Nine"    },
      { number: 10,  lao: "ສິບ",    thai: "สิบ",    romanization: "sip",     english: "Ten"     },
      { number: 20,  lao: "ຊາວ",    thai: "ยี่สิบ", romanization: "sao",     english: "Twenty"  },
      { number: 100, lao: "ຮ້ອຍ",   thai: "ร้อย",   romanization: "hoi",     english: "Hundred" },
    ]),
  },
  {
    language: "lao" as const,
    category: "days",
    title: "Lao Days of the Week",
    description: "All 7 days of the week in Lao",
    order: 5,
    difficulty: "beginner",
    content: JSON.stringify([
      { lao: "ວັນຈັນ",      thai: "วันจันทร์",   romanization: "van-chan",      english: "Monday",    day: "Monday" },
      { lao: "ວັນອັງຄານ",  thai: "วันอังคาร",   romanization: "van-ang-kaan",  english: "Tuesday",   day: "Tuesday" },
      { lao: "ວັນພຸດ",      thai: "วันพุธ",      romanization: "van-phut",      english: "Wednesday", day: "Wednesday" },
      { lao: "ວັນພະຫັດ",   thai: "วันพฤหัสบดี", romanization: "van-pha-hat",   english: "Thursday",  day: "Thursday" },
      { lao: "ວັນສຸກ",      thai: "วันศุกร์",    romanization: "van-suk",       english: "Friday",    day: "Friday" },
      { lao: "ວັນເສົາ",     thai: "วันเสาร์",    romanization: "van-sao",       english: "Saturday",  day: "Saturday" },
      { lao: "ວັນອາທິດ",    thai: "วันอาทิตย์",  romanization: "van-a-thit",    english: "Sunday",    day: "Sunday" },
    ]),
  },
  {
    language: "lao" as const,
    category: "phrases",
    title: "Lao Essential Phrases",
    description: "Must-know phrases for daily life in Lao",
    order: 6,
    difficulty: "beginner",
    content: JSON.stringify([
      { lao: "ເຈົ້າຊື່ຫຍັງ",     romanization: "chao-sue-nyang",      english: "What is your name?" },
      { lao: "ຂ້ອຍຊື່...",        romanization: "khoi-sue",             english: "My name is..." },
      { lao: "ເຈົ້າມາຈາກໃສ",     romanization: "chao-ma-chak-sai",    english: "Where are you from?" },
      { lao: "ຂ້ອຍມາຈາກ...",      romanization: "khoi-ma-chak",         english: "I'm from..." },
      { lao: "ລາຄາເທົ່າໃດ",       romanization: "la-kha-thao-dai",     english: "How much does it cost?" },
      { lao: "ຂ້ອຍບໍ່ເຂົ້າໃຈ",   romanization: "khoi-bor-khao-chai",  english: "I don't understand" },
      { lao: "ກະລຸນາເວົ້າຊ້າໆ",  romanization: "ka-lu-na-vao-sa-sa",  english: "Please speak slowly" },
      { lao: "ຊ່ວຍດ້ວຍ",          romanization: "suay-duay",            english: "Help me please" },
      { lao: "ຫ້ອງນ້ຳຢູ່ໃສ",      romanization: "hong-nam-yu-sai",     english: "Where is the bathroom?" },
      { lao: "ເທົ່າໃດ",           romanization: "thao-dai",             english: "How much?" },
    ]),
  },
];

/** Called automatically on server startup — seeds lessons if the table is empty */
export async function seedLessonsIfEmpty() {
  const db = await getDb();
  if (!db) return;
  try {
    const existing = await db.select().from(beginnerLessons).limit(1);
    if (existing.length > 0) return; // already seeded
    for (const lesson of LESSONS) {
      await db.insert(beginnerLessons).values(lesson);
    }
    console.log(`[Seed] Auto-seeded ${LESSONS.length} lessons.`);
  } catch (err) {
    console.warn("[Seed] Auto-seed failed:", err);
  }
}

export function registerSeedRoute(app: Express) {
  // GET /api/admin/fix-schema — apply missing columns/tables and return status
  app.get("/api/admin/fix-schema", async (_req: Request, res: Response) => {
    const result = await applySchema();
    res.json(result);
  });

  app.post("/api/admin/seed-lessons", async (req, res) => {
    const secret = req.headers["x-admin-secret"];
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    try {
      // Check if already seeded
      const existing = await db.select().from(beginnerLessons).limit(1);
      if (existing.length > 0 && !req.query.force) {
        return res.json({ message: "Already seeded. Add ?force=1 to re-seed.", count: existing.length });
      }

      // Clear and re-insert
      if (req.query.force) {
        await db.delete(beginnerLessons);
      }

      let inserted = 0;
      for (const lesson of LESSONS) {
        await db.insert(beginnerLessons).values(lesson);
        inserted++;
      }

      res.json({ success: true, inserted, message: `Seeded ${inserted} lessons successfully!` });
    } catch (error: any) {
      console.error("[Seed] Error:", error);
      res.status(500).json({ error: error.message });
    }
  });
}
