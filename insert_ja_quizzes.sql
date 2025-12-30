-- 일본어 퀴즈 데이터 삽입
-- ja_ko_quizzes, ja_zh_quizzes, ja_en_quizzes 테이블에 문제 삽입

-- ============================================
-- 1. ja_ko_quizzes (일본어 -> 한국어 퀴즈)
-- ============================================

-- word_id는 ja_ko 테이블의 실제 id를 참조합니다.
-- 서브쿼리를 사용하여 source_word로 word_id를 찾습니다.

-- 초급 문제들
INSERT INTO ja_ko_quizzes (word_id, question_type, question_text, options, correct_answer, difficulty, explanation)
SELECT 
    id,
    'multiple_choice',
    '"こんにちは"의 의미는?',
    '["안녕하세요", "감사합니다", "죄송합니다", "안녕히가세요"]'::jsonb,
    0,
    'easy',
    'こんにちは는 낮 인사로 "안녕하세요"를 의미합니다.'
FROM ja_ko WHERE source_word = 'こんにちは'
LIMIT 1;

INSERT INTO ja_ko_quizzes (word_id, question_type, question_text, options, correct_answer, difficulty, explanation)
SELECT 
    id,
    'multiple_choice',
    '"ありがとう"의 의미는?',
    '["감사합니다", "죄송합니다", "안녕하세요", "안녕히가세요"]'::jsonb,
    0,
    'easy',
    'ありがとう는 "감사합니다"를 의미하는 일본어 인사말입니다.'
FROM ja_ko WHERE source_word = 'ありがとう'
LIMIT 1;

INSERT INTO ja_ko_quizzes (word_id, question_type, question_text, options, correct_answer, difficulty, explanation)
SELECT 
    id,
    'multiple_choice',
    '"すみません"의 의미는?',
    '["죄송합니다", "감사합니다", "안녕하세요", "괜찮습니다"]'::jsonb,
    0,
    'easy',
    'すみません는 "죄송합니다" 또는 "실례합니다"를 의미합니다.'
FROM ja_ko WHERE source_word = 'すみません'
LIMIT 1;

INSERT INTO ja_ko_quizzes (word_id, question_type, question_text, options, correct_answer, difficulty, explanation)
SELECT 
    id,
    'multiple_choice',
    '"若者"의 의미는?',
    '["젊은이", "노인", "아이", "성인"]'::jsonb,
    0,
    'medium',
    '若者(わかもの)는 "젊은이"를 의미합니다.'
FROM ja_ko WHERE source_word = '若者'
LIMIT 1;

INSERT INTO ja_ko_quizzes (word_id, question_type, question_text, options, correct_answer, difficulty, explanation)
SELECT 
    id,
    'multiple_choice',
    '"学"의 의미는?',
    '["배울 학", "가르칠 교", "책 서", "읽을 독"]'::jsonb,
    0,
    'medium',
    '学(がく)는 "배울 학"을 의미하는 한자입니다.'
FROM ja_ko WHERE source_word = '学'
LIMIT 1;

INSERT INTO ja_ko_quizzes (word_id, question_type, question_text, options, correct_answer, difficulty, explanation)
SELECT 
    id,
    'multiple_choice',
    '"間"의 의미는?',
    '["사이 간", "안 안", "밖 외", "위 상"]'::jsonb,
    0,
    'medium',
    '間(あいだ)는 "사이" 또는 "간격"을 의미합니다.'
FROM ja_ko WHERE source_word = '間'
LIMIT 1;

INSERT INTO ja_ko_quizzes (word_id, question_type, question_text, options, correct_answer, difficulty, explanation)
SELECT 
    id,
    'multiple_choice',
    '"志向"의 의미는?',
    '["지향", "목표", "의향", "방향"]'::jsonb,
    0,
    'hard',
    '志向(しこう)는 "지향" 또는 "목표로 하는 방향"을 의미합니다.'
FROM ja_ko WHERE source_word = '志向'
LIMIT 1;

-- ============================================
-- 2. ja_zh_quizzes (일본어 -> 중국어 퀴즈)
-- ============================================

INSERT INTO ja_zh_quizzes (word_id, question_type, question_text, options, correct_answer, difficulty, explanation)
SELECT 
    id,
    'multiple_choice',
    '"こんにちは"的意思是什么？',
    '["你好", "谢谢", "对不起", "再见"]'::jsonb,
    0,
    'easy',
    'こんにちは是日间问候语，意思是"你好"。'
FROM ja_zh WHERE source_word = 'こんにちは'
LIMIT 1;

INSERT INTO ja_zh_quizzes (word_id, question_type, question_text, options, correct_answer, difficulty, explanation)
SELECT 
    id,
    'multiple_choice',
    '"ありがとう"的意思是什么？',
    '["谢谢", "对不起", "你好", "再见"]'::jsonb,
    0,
    'easy',
    'ありがとう是"谢谢"的意思。'
FROM ja_zh WHERE source_word = 'ありがとう'
LIMIT 1;

INSERT INTO ja_zh_quizzes (word_id, question_type, question_text, options, correct_answer, difficulty, explanation)
SELECT 
    id,
    'multiple_choice',
    '"すみません"的意思是什么？',
    '["对不起", "谢谢", "你好", "没关系"]'::jsonb,
    0,
    'easy',
    'すみません是"对不起"或"打扰一下"的意思。'
FROM ja_zh WHERE source_word = 'すみません'
LIMIT 1;

INSERT INTO ja_zh_quizzes (word_id, question_type, question_text, options, correct_answer, difficulty, explanation)
SELECT 
    id,
    'multiple_choice',
    '"若者"的意思是什么？',
    '["年轻人", "老人", "孩子", "成年人"]'::jsonb,
    0,
    'medium',
    '若者(わかもの)是"年轻人"的意思。'
FROM ja_zh WHERE source_word = '若者'
LIMIT 1;

INSERT INTO ja_zh_quizzes (word_id, question_type, question_text, options, correct_answer, difficulty, explanation)
SELECT 
    id,
    'multiple_choice',
    '"学"的意思是什么？',
    '["学习", "教学", "书籍", "阅读"]'::jsonb,
    0,
    'medium',
    '学(がく)是"学习"的意思。'
FROM ja_zh WHERE source_word = '学'
LIMIT 1;

INSERT INTO ja_zh_quizzes (word_id, question_type, question_text, options, correct_answer, difficulty, explanation)
SELECT 
    id,
    'multiple_choice',
    '"間"的意思是什么？',
    '["之间", "里面", "外面", "上面"]'::jsonb,
    0,
    'medium',
    '間(あいだ)是"之间"或"间隔"的意思。'
FROM ja_zh WHERE source_word = '間'
LIMIT 1;

INSERT INTO ja_zh_quizzes (word_id, question_type, question_text, options, correct_answer, difficulty, explanation)
SELECT 
    id,
    'multiple_choice',
    '"志向"的意思是什么？',
    '["志向", "目标", "意向", "方向"]'::jsonb,
    0,
    'hard',
    '志向(しこう)是"志向"或"目标方向"的意思。'
FROM ja_zh WHERE source_word = '志向'
LIMIT 1;

-- ============================================
-- 3. ja_en_quizzes (일본어 -> 영어 퀴즈)
-- ============================================

INSERT INTO ja_en_quizzes (word_id, question_type, question_text, options, correct_answer, difficulty, explanation)
SELECT 
    id,
    'multiple_choice',
    'What is the meaning of "こんにちは"?',
    '["Hello", "Thank you", "Sorry", "Goodbye"]'::jsonb,
    0,
    'easy',
    'こんにちは is a daytime greeting meaning "Hello".'
FROM ja_en WHERE source_word = 'こんにちは'
LIMIT 1;

INSERT INTO ja_en_quizzes (word_id, question_type, question_text, options, correct_answer, difficulty, explanation)
SELECT 
    id,
    'multiple_choice',
    'What is the meaning of "ありがとう"?',
    '["Thank you", "Sorry", "Hello", "Goodbye"]'::jsonb,
    0,
    'easy',
    'ありがとう means "Thank you" in Japanese.'
FROM ja_en WHERE source_word = 'ありがとう'
LIMIT 1;

INSERT INTO ja_en_quizzes (word_id, question_type, question_text, options, correct_answer, difficulty, explanation)
SELECT 
    id,
    'multiple_choice',
    'What is the meaning of "すみません"?',
    '["Sorry", "Thank you", "Hello", "It''s okay"]'::jsonb,
    0,
    'easy',
    'すみません means "Sorry" or "Excuse me".'
FROM ja_en WHERE source_word = 'すみません'
LIMIT 1;

INSERT INTO ja_en_quizzes (word_id, question_type, question_text, options, correct_answer, difficulty, explanation)
SELECT 
    id,
    'multiple_choice',
    'What is the meaning of "若者"?',
    '["Young person", "Old person", "Child", "Adult"]'::jsonb,
    0,
    'medium',
    '若者(わかもの) means "young person" or "youth".'
FROM ja_en WHERE source_word = '若者'
LIMIT 1;

INSERT INTO ja_en_quizzes (word_id, question_type, question_text, options, correct_answer, difficulty, explanation)
SELECT 
    id,
    'multiple_choice',
    'What is the meaning of "学"?',
    '["Study", "Teach", "Book", "Read"]'::jsonb,
    0,
    'medium',
    '学(がく) means "study" or "learning".'
FROM ja_en WHERE source_word = '学'
LIMIT 1;

INSERT INTO ja_en_quizzes (word_id, question_type, question_text, options, correct_answer, difficulty, explanation)
SELECT 
    id,
    'multiple_choice',
    'What is the meaning of "間"?',
    '["Between", "Inside", "Outside", "Above"]'::jsonb,
    0,
    'medium',
    '間(あいだ) means "between" or "interval".'
FROM ja_en WHERE source_word = '間'
LIMIT 1;

INSERT INTO ja_en_quizzes (word_id, question_type, question_text, options, correct_answer, difficulty, explanation)
SELECT 
    id,
    'multiple_choice',
    'What is the meaning of "志向"?',
    '["Aspiration", "Goal", "Intention", "Direction"]'::jsonb,
    0,
    'hard',
    '志向(しこう) means "aspiration" or "direction of goal".'
FROM ja_en WHERE source_word = '志向'
LIMIT 1;

-- ============================================
-- 참고사항:
-- ============================================
-- 1. 위의 INSERT 문은 서브쿼리를 사용하여 ja_ko, ja_zh, ja_en 테이블에서
--    source_word로 word_id를 찾습니다.
--
-- 2. 실제 데이터베이스에 해당 단어가 없으면 INSERT가 실행되지 않습니다.
--
-- 3. 단어가 여러 개 있으면 LIMIT 1로 첫 번째 것만 사용합니다.
--
-- 4. 실제 데이터베이스의 단어에 맞게 source_word 값을 수정하세요.
--
-- 5. 더 많은 문제를 추가하려면 위 패턴을 따라 추가하세요.

