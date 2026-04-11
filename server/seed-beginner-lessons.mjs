import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { beginnerLessons } from "../drizzle/schema.ts";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// Beginner lessons data
const lessons = [
  // Lao Numbers
  {
    language: "lao",
    category: "numbers",
    title: "라오어 숫자 0-10",
    description: "라오어로 0부터 10까지 숫자를 배웁니다",
    content: JSON.stringify([
      { number: 0, lao: "ສູນ", romanization: "soon", thai: "ศูนย์" },
      { number: 1, lao: "ນຶ່ງ", romanization: "neung", thai: "หนึ่ง" },
      { number: 2, lao: "ສອງ", romanization: "song", thai: "สอง" },
      { number: 3, lao: "ສາມ", romanization: "sam", thai: "สาม" },
      { number: 4, lao: "ສີ່", romanization: "see", thai: "สี่" },
      { number: 5, lao: "ຫ້າ", romanization: "ha", thai: "ห้า" },
      { number: 6, lao: "ຫົກ", romanization: "hok", thai: "หก" },
      { number: 7, lao: "ເຈັດ", romanization: "chet", thai: "เจ็ด" },
      { number: 8, lao: "ແປດ", romanization: "paet", thai: "แปด" },
      { number: 9, lao: "ເກົ້າ", romanization: "kao", thai: "เก้า" },
      { number: 10, lao: "ສິບ", romanization: "sip", thai: "สิบ" },
    ]),
    order: 1,
    difficulty: "beginner",
  },
  // Thai Numbers
  {
    language: "thai",
    category: "numbers",
    title: "태국어 숫자 0-10",
    description: "태국어로 0부터 10까지 숫자를 배웁니다",
    content: JSON.stringify([
      { number: 0, thai: "ศูนย์", romanization: "soon", lao: "ສູນ" },
      { number: 1, thai: "หนึ่ง", romanization: "neung", lao: "ນຶ່ງ" },
      { number: 2, thai: "สอง", romanization: "song", lao: "ສອງ" },
      { number: 3, thai: "สาม", romanization: "sam", lao: "ສາມ" },
      { number: 4, thai: "สี่", romanization: "see", lao: "ສີ່" },
      { number: 5, thai: "ห้า", romanization: "ha", lao: "ຫ້າ" },
      { number: 6, thai: "หก", romanization: "hok", lao: "ຫົກ" },
      { number: 7, thai: "เจ็ด", romanization: "chet", lao: "ເຈັດ" },
      { number: 8, thai: "แปด", romanization: "paet", lao: "ແປດ" },
      { number: 9, thai: "เก้า", romanization: "kao", lao: "ເກົ້າ" },
      { number: 10, thai: "สิบ", romanization: "sip", lao: "ສິບ" },
    ]),
    order: 1,
    difficulty: "beginner",
  },
  // Lao Days
  {
    language: "lao",
    category: "days",
    title: "라오어 요일",
    description: "라오어로 요일을 배웁니다",
    content: JSON.stringify([
      { day: "Monday", lao: "ວັນຈັນ", romanization: "van chan", thai: "วันจันทร์" },
      { day: "Tuesday", lao: "ວັນອັງຄານ", romanization: "van angkhan", thai: "วันอังคาร" },
      { day: "Wednesday", lao: "ວັນພຸດ", romanization: "van phut", thai: "วันพุธ" },
      { day: "Thursday", lao: "ວັນພະຫັດ", romanization: "van phahat", thai: "วันพฤหัสบดี" },
      { day: "Friday", lao: "ວັນສຸກ", romanization: "van suk", thai: "วันศุกร์" },
      { day: "Saturday", lao: "ວັນເສົາ", romanization: "van sao", thai: "วันเสาร์" },
      { day: "Sunday", lao: "ວັນອາທິດ", romanization: "van athit", thai: "วันอาทิตย์" },
    ]),
    order: 2,
    difficulty: "beginner",
  },
  // Thai Days
  {
    language: "thai",
    category: "days",
    title: "태국어 요일",
    description: "태국어로 요일을 배웁니다",
    content: JSON.stringify([
      { day: "Monday", thai: "วันจันทร์", romanization: "wan chan", lao: "ວັນຈັນ" },
      { day: "Tuesday", thai: "วันอังคาร", romanization: "wan angkhan", lao: "ວັນອັງຄານ" },
      { day: "Wednesday", thai: "วันพุธ", romanization: "wan phut", lao: "ວັນພຸດ" },
      { day: "Thursday", thai: "วันพฤหัสบดี", romanization: "wan phahat", lao: "ວັນພະຫັດ" },
      { day: "Friday", thai: "วันศุกร์", romanization: "wan suk", lao: "ວັນສຸກ" },
      { day: "Saturday", thai: "วันเสาร์", romanization: "wan sao", lao: "ວັນເສົາ" },
      { day: "Sunday", thai: "วันอาทิตย์", romanization: "wan athit", lao: "ວັນອາທິດ" },
    ]),
    order: 2,
    difficulty: "beginner",
  },
  // Lao Months
  {
    language: "lao",
    category: "months",
    title: "라오어 월",
    description: "라오어로 월을 배웁니다",
    content: JSON.stringify([
      { month: "January", lao: "ມັງກອນ", romanization: "mangkorn", thai: "มกราคม" },
      { month: "February", lao: "ກຸມພາ", romanization: "kumpha", thai: "กุมภาพันธ์" },
      { month: "March", lao: "ມີນາ", romanization: "meena", thai: "มีนาคม" },
      { month: "April", lao: "ເມສາ", romanization: "meesa", thai: "เมษายน" },
      { month: "May", lao: "ພຶດສະພາ", romanization: "phutsapha", thai: "พฤษภาคม" },
      { month: "June", lao: "ມິຖຸນາ", romanization: "mithuna", thai: "มิถุนายน" },
      { month: "July", lao: "ກໍລະກົດ", romanization: "karakot", thai: "กรกฎาคม" },
      { month: "August", lao: "ສິງຫາ", romanization: "singha", thai: "สิงหาคม" },
      { month: "September", lao: "ກັນຍາ", romanization: "kanya", thai: "กันยายน" },
      { month: "October", lao: "ຕຸລາ", romanization: "tula", thai: "ตุลาคม" },
      { month: "November", lao: "ພະຈິກ", romanization: "phaichik", thai: "พฤศจิกายน" },
      { month: "December", lao: "ທັນວາ", romanization: "thanwa", thai: "ธันวาคม" },
    ]),
    order: 3,
    difficulty: "beginner",
  },
  // Thai Months
  {
    language: "thai",
    category: "months",
    title: "태국어 월",
    description: "태국어로 월을 배웁니다",
    content: JSON.stringify([
      { month: "January", thai: "มกราคม", romanization: "mangkorn", lao: "ມັງກອນ" },
      { month: "February", thai: "กุมภาพันธ์", romanization: "kumpha", lao: "ກຸມພາ" },
      { month: "March", thai: "มีนาคม", romanization: "meena", lao: "ມີນາ" },
      { month: "April", thai: "เมษายน", romanization: "meesa", lao: "ເມສາ" },
      { month: "May", thai: "พฤษภาคม", romanization: "phutsapha", lao: "ພຶດສະພາ" },
      { month: "June", thai: "มิถุนายน", romanization: "mithuna", lao: "ມິຖຸນາ" },
      { month: "July", thai: "กรกฎาคม", romanization: "karakot", lao: "ກໍລະກົດ" },
      { month: "August", thai: "สิงหาคม", romanization: "singha", lao: "ສິງຫາ" },
      { month: "September", thai: "กันยายน", romanization: "kanya", lao: "ກັນຍາ" },
      { month: "October", thai: "ตุลาคม", romanization: "tula", lao: "ຕຸລາ" },
      { month: "November", thai: "พฤศจิกายน", romanization: "phaichik", lao: "ພະຈິກ" },
      { month: "December", thai: "ธันวาคม", romanization: "thanwa", lao: "ທັນວາ" },
    ]),
    order: 3,
    difficulty: "beginner",
  },
  // Lao Time
  {
    language: "lao",
    category: "time",
    title: "라오어 시간 표현",
    description: "라오어로 시간을 읽고 표현하는 방법을 배웁니다",
    content: JSON.stringify([
      { time: "Morning", lao: "ເຊົ້າ", romanization: "chao", thai: "เช้า" },
      { time: "Afternoon", lao: "ບ່າຍ", romanization: "bai", thai: "บ่าย" },
      { time: "Evening", lao: "ແລ່ງ", romanization: "laeng", thai: "เย็น" },
      { time: "Night", lao: "ຄືນ", romanization: "khuen", thai: "คืน" },
      { time: "Midnight", lao: "ເວລາທ່ຽງຄືນ", romanization: "vela thiang khuen", thai: "เที่ยงคืน" },
      { time: "Noon", lao: "ທ່ຽງ", romanization: "thiang", thai: "เที่ยง" },
    ]),
    order: 4,
    difficulty: "beginner",
  },
  // Thai Time
  {
    language: "thai",
    category: "time",
    title: "태국어 시간 표현",
    description: "태국어로 시간을 읽고 표현하는 방법을 배웁니다",
    content: JSON.stringify([
      { time: "Morning", thai: "เช้า", romanization: "chao", lao: "ເຊົ້າ" },
      { time: "Afternoon", thai: "บ่าย", romanization: "bai", lao: "ບ່າຍ" },
      { time: "Evening", thai: "เย็น", romanization: "yen", lao: "ແລ່ງ" },
      { time: "Night", thai: "คืน", romanization: "khuen", lao: "ຄືນ" },
      { time: "Midnight", thai: "เที่ยงคืน", romanization: "thiang khuen", lao: "ເວລາທ່ຽງຄືນ" },
      { time: "Noon", thai: "เที่ยง", romanization: "thiang", lao: "ທ່ຽງ" },
    ]),
    order: 4,
    difficulty: "beginner",
  },
  // Lao Basic Phrases
  {
    language: "lao",
    category: "phrases",
    title: "라오어 기본 인사말",
    description: "라오어로 기본 인사말과 표현을 배웁니다",
    content: JSON.stringify([
      { phrase: "Hello", lao: "ສະບາຍດີ", romanization: "sabai di", thai: "สวัสดี" },
      { phrase: "Hi", lao: "ຫາຍ", romanization: "hai", thai: "ไฮ" },
      { phrase: "Good morning", lao: "ສະບາຍດີຕອນເຊົ້າ", romanization: "sabai di ton chao", thai: "สวัสดีตอนเช้า" },
      { phrase: "Good afternoon", lao: "ສະບາຍດີຕອນບ່າຍ", romanization: "sabai di ton bai", thai: "สวัสดีตอนบ่าย" },
      { phrase: "Good evening", lao: "ສະບາຍດີຕອນແລ່ງ", romanization: "sabai di ton laeng", thai: "สวัสดีตอนเย็น" },
      { phrase: "How are you?", lao: "ເຈົ້າສະບາຍດີບໍ?", romanization: "chao sabai di bo", thai: "คุณสบายดีไหม" },
      { phrase: "I'm fine", lao: "ຂ້ອຍສະບາຍດີ", romanization: "khoi sabai di", thai: "ฉันสบายดี" },
      { phrase: "Thank you", lao: "ຂອບໃຈ", romanization: "khop chai", thai: "ขอบคุณ" },
      { phrase: "I'm sorry", lao: "ຂໍໂທດ", romanization: "kho thot", thai: "ขอโทษ" },
      { phrase: "Goodbye", lao: "ລາກ່ອນ", romanization: "la kon", thai: "ลาก่อน" },
      { phrase: "What's your name?", lao: "ເຈົ້າຊື່ຫຍັງ?", romanization: "chao sue yang", thai: "คุณชื่ออะไร" },
      { phrase: "My name is...", lao: "ຂ້ອຍຊື່...", romanization: "khoi sue", thai: "ฉันชื่อ..." },
    ]),
    order: 5,
    difficulty: "beginner",
  },
  // Thai Basic Phrases
  {
    language: "thai",
    category: "phrases",
    title: "태국어 기본 인사말",
    description: "태국어로 기본 인사말과 표현을 배웁니다",
    content: JSON.stringify([
      { phrase: "Hello", thai: "สวัสดี", romanization: "sabai di", lao: "ສະບາຍດີ" },
      { phrase: "Hi", thai: "ไฮ", romanization: "hai", lao: "ຫາຍ" },
      { phrase: "Good morning", thai: "สวัสดีตอนเช้า", romanization: "sabai di ton chao", lao: "ສະບາຍດີຕອນເຊົ້າ" },
      { phrase: "Good afternoon", thai: "สวัสดีตอนบ่าย", romanization: "sabai di ton bai", lao: "ສະບາຍດີຕອນບ່າຍ" },
      { phrase: "Good evening", thai: "สวัสดีตอนเย็น", romanization: "sabai di ton yen", lao: "ສະບາຍດີຕອນແລ່ງ" },
      { phrase: "How are you?", thai: "คุณสบายดีไหม", romanization: "khun sabai di mai", lao: "ເຈົ້າສະບາຍດີບໍ" },
      { phrase: "I'm fine", thai: "ฉันสบายดี", romanization: "chan sabai di", lao: "ຂ້ອຍສະບາຍດີ" },
      { phrase: "Thank you", thai: "ขอบคุณ", romanization: "khop khun", lao: "ຂອບໃຈ" },
      { phrase: "I'm sorry", thai: "ขอโทษ", romanization: "kho thot", lao: "ຂໍໂທດ" },
      { phrase: "Goodbye", thai: "ลาก่อน", romanization: "la kon", lao: "ລາກ່ອນ" },
      { phrase: "What's your name?", thai: "คุณชื่ออะไร", romanization: "khun sue arai", lao: "ເຈົ້າຊື່ຫຍັງ" },
      { phrase: "My name is...", thai: "ฉันชื่อ...", romanization: "chan sue", lao: "ຂ້ອຍຊື່..." },
    ]),
    order: 5,
    difficulty: "beginner",
  },
];

try {
  console.log("🌱 Seeding beginner lessons...");
  
  for (const lesson of lessons) {
    await db.insert(beginnerLessons).values(lesson);
    console.log(`✅ Created lesson: ${lesson.title}`);
  }

  console.log(`\n✨ Successfully seeded ${lessons.length} beginner lessons!`);
} catch (error) {
  console.error("❌ Error seeding lessons:", error);
} finally {
  await connection.end();
}
