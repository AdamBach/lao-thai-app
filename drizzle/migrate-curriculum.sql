-- Clear existing lessons and create new curriculum structure
DELETE FROM beginner_lessons;

-- 1. Hello (สวัสดี / ສະບາຍດີ)
INSERT INTO beginner_lessons (language, category, title, description, content, difficulty, order)
VALUES 
('thai', 'hello', 'สวัสดี', 'Learn basic Thai greetings', 
'[{"thai":"สวัสดี","romanization":"Sawasdee","english":"Hello"},{"thai":"สวัสดีค่ะ","romanization":"Sawasdee kha","english":"Hello (polite - female)"},{"thai":"สวัสดีครับ","romanization":"Sawasdee khrap","english":"Hello (polite - male)"},{"thai":"ยินดีที่ได้รู้จัก","romanization":"Yin dee tee dai roo jak","english":"Nice to meet you"}]',
'beginner', 1),
('lao', 'hello', 'ສະບາຍດີ', 'Learn basic Lao greetings',
'[{"lao":"ສະບາຍດີ","romanization":"Sabaidee","english":"Hello"},{"lao":"ສະບາຍດີ","romanization":"Sabaidee","english":"Hello (formal)"},{"lao":"ຍິນດີທີ່ໄດ້ຮູ້ຈັກ","romanization":"Yin dee tee dai hoo jak","english":"Nice to meet you"}]',
'beginner', 1);

-- 2. My Family (ครอบครัวของฉัน / ຄອບຄົວຂອງຂ້ອຍ)
INSERT INTO beginner_lessons (language, category, title, description, content, difficulty, order)
VALUES 
('thai', 'family', 'ครอบครัวของฉัน', 'Learn Thai family vocabulary',
'[{"thai":"พ่อ","romanization":"Pho","english":"Father"},{"thai":"แม่","romanization":"Mae","english":"Mother"},{"thai":"พี่ชาย","romanization":"Phi chai","english":"Older brother"},{"thai":"น้องชาย","romanization":"Nong chai","english":"Younger brother"},{"thai":"พี่สาว","romanization":"Phi sao","english":"Older sister"},{"thai":"น้องสาว","romanization":"Nong sao","english":"Younger sister"}]',
'beginner', 2),
('lao', 'family', 'ຄອບຄົວຂອງຂ້ອຍ', 'Learn Lao family vocabulary',
'[{"lao":"ພໍ່","romanization":"Pho","english":"Father"},{"lao":"ແມ່","romanization":"Mae","english":"Mother"},{"lao":"ອ້າຍຊາຍ","romanization":"Ai chai","english":"Older brother"},{"lao":"ນ້ອງຊາຍ","romanization":"Nong chai","english":"Younger brother"},{"lao":"ອ້າຍສາວ","romanization":"Ai sao","english":"Older sister"},{"lao":"ນ້ອງສາວ","romanization":"Nong sao","english":"Younger sister"}]',
'beginner', 2);

-- 3. Food (อาหาร / ອາຫານ)
INSERT INTO beginner_lessons (language, category, title, description, content, difficulty, order)
VALUES 
('thai', 'food', 'อาหาร', 'Learn Thai food vocabulary',
'[{"thai":"ข้าว","romanization":"Khao","english":"Rice"},{"thai":"ไก่","romanization":"Gai","english":"Chicken"},{"thai":"ปลา","romanization":"Pla","english":"Fish"},{"thai":"ผัก","romanization":"Phak","english":"Vegetable"},{"thai":"ผลไม้","romanization":"Phon-la-mai","english":"Fruit"},{"thai":"น้ำ","romanization":"Nam","english":"Water"}]',
'beginner', 3),
('lao', 'food', 'ອາຫານ', 'Learn Lao food vocabulary',
'[{"lao":"ເຂົ້າ","romanization":"Khao","english":"Rice"},{"lao":"ໄກ່","romanization":"Gai","english":"Chicken"},{"lao":"ປາ","romanization":"Pa","english":"Fish"},{"lao":"ຜັກ","romanization":"Phak","english":"Vegetable"},{"lao":"ໝາກໄມ້","romanization":"Mak mai","english":"Fruit"},{"lao":"ນ້ຳ","romanization":"Nam","english":"Water"}]',
'beginner', 3);

-- 4. Languages (ภาษา / ພາສາ)
INSERT INTO beginner_lessons (language, category, title, description, content, difficulty, order)
VALUES 
('thai', 'languages', 'ภาษา', 'Learn Thai language vocabulary',
'[{"thai":"ภาษาไทย","romanization":"Phasa Thai","english":"Thai language"},{"thai":"ภาษาอังกฤษ","romanization":"Phasa Angkrit","english":"English language"},{"thai":"ภาษาจีน","romanization":"Phasa Chin","english":"Chinese language"},{"thai":"ภาษาลาว","romanization":"Phasa Lao","english":"Lao language"},{"thai":"พูด","romanization":"Phoot","english":"Speak"},{"thai":"เขียน","romanization":"Khian","english":"Write"}]',
'beginner', 4),
('lao', 'languages', 'ພາສາ', 'Learn Lao language vocabulary',
'[{"lao":"ພາສາລາວ","romanization":"Phasa Lao","english":"Lao language"},{"lao":"ພາສາໄທ","romanization":"Phasa Thai","english":"Thai language"},{"lao":"ພາສາອັງກິດ","romanization":"Phasa Angkit","english":"English language"},{"lao":"ພາສາຈີນ","romanization":"Phasa Chin","english":"Chinese language"},{"lao":"ເວົ້າ","romanization":"Vao","english":"Speak"},{"lao":"ຂຽນ","romanization":"Khian","english":"Write"}]',
'beginner', 4);

-- 5. Family & Counting (ครอบครัวและการนับ / ຄອບຄົວ ແລະ ການນັບ)
INSERT INTO beginner_lessons (language, category, title, description, content, difficulty, order)
VALUES 
('thai', 'family_counting', 'ครอบครัวและการนับ', 'Learn to count family members',
'[{"thai":"หนึ่ง","romanization":"Neung","english":"One"},{"thai":"สอง","romanization":"Song","english":"Two"},{"thai":"สาม","romanization":"Sam","english":"Three"},{"thai":"สี่","romanization":"See","english":"Four"},{"thai":"ห้า","romanization":"Ha","english":"Five"},{"thai":"ฉันมีพี่สาวสองคน","romanization":"Chan mee phi sao song khon","english":"I have two older sisters"}]',
'intermediate', 5),
('lao', 'family_counting', 'ຄອບຄົວ ແລະ ການນັບ', 'Learn to count family members',
'[{"lao":"ໜຶ່ງ","romanization":"Neung","english":"One"},{"lao":"ສອງ","romanization":"Song","english":"Two"},{"lao":"ສາມ","romanization":"Sam","english":"Three"},{"lao":"ສີ່","romanization":"See","english":"Four"},{"lao":"ຫ້າ","romanization":"Ha","english":"Five"},{"lao":"ຂ້ອຍມີອ້າຍສາວສອງຄົນ","romanization":"Khoi mee ai sao song khon","english":"I have two older sisters"}]',
'intermediate', 5);

-- 6. Age & Counting (อายุและการนับ / ອາຍຸ ແລະ ການນັບ)
INSERT INTO beginner_lessons (language, category, title, description, content, difficulty, order)
VALUES 
('thai', 'age_counting', 'อายุและการนับ', 'Learn numbers and age',
'[{"thai":"หก","romanization":"Hok","english":"Six"},{"thai":"เจ็ด","romanization":"Jet","english":"Seven"},{"thai":"แปด","romanization":"Paet","english":"Eight"},{"thai":"เก้า","romanization":"Gao","english":"Nine"},{"thai":"สิบ","romanization":"Sip","english":"Ten"},{"thai":"ฉันอายุ 25 ปี","romanization":"Chan ayu yee sip ha pee","english":"I am 25 years old"}]',
'intermediate', 6),
('lao', 'age_counting', 'ອາຍຸ ແລະ ການນັບ', 'Learn numbers and age',
'[{"lao":"ຫົກ","romanization":"Hok","english":"Six"},{"lao":"ເຈັດ","romanization":"Jet","english":"Seven"},{"lao":"ແປດ","romanization":"Paet","english":"Eight"},{"lao":"ເກົ້າ","romanization":"Gao","english":"Nine"},{"lao":"ສິບ","romanization":"Sip","english":"Ten"},{"lao":"ຂ້ອຍອາຍຸ 25 ປີ","romanization":"Khoi ayu yee sip ha pee","english":"I am 25 years old"}]',
'intermediate', 6);
