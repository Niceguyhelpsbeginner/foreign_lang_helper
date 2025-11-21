/**
 * JSON 데이터를 Supabase로 마이그레이션하는 스크립트
 * 
 * 사용 방법:
 * 1. Node.js가 설치되어 있어야 합니다
 * 2. npm install @supabase/supabase-js node-fetch
 * 3. supabase_config.js 파일에 API 키를 입력하세요
 * 4. node migrate_data.js 실행
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase 설정 (supabase_config.js에서 가져오기)
const config = require('./supabase_config.js');

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

// JSON 파일 읽기 함수
function readJsonFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`파일 읽기 오류 (${filePath}):`, error.message);
        return null;
    }
}

// 단어 데이터 마이그레이션
async function migrateWords() {
    console.log('단어 데이터 마이그레이션 시작...\n');

    // 1. 일본어 복합 단어
    console.log('1. 일본어 복합 단어 마이그레이션 중...');
    const compoundWords = readJsonFile('./jlpt/vocabulary/compound_word.json');
    if (compoundWords && compoundWords.words) {
        const wordsToInsert = compoundWords.words.map(word => ({
            word: word.word,
            meaning: word.meaning,
            pronunciation: word.pronunciation,
            hiragana: word.hiragana,
            type: word.type || 'word',
            language: 'ja',
            level: null, // 필요시 추가
            kanji_components: word.kanjiComponents || null,
            example: null,
            synonyms: null
        }));

        // 배치로 나누어서 삽입
        const batchSize = 100;
        let successCount = 0;
        for (let i = 0; i < wordsToInsert.length; i += batchSize) {
            const batch = wordsToInsert.slice(i, i + batchSize);
            const { data, error } = await supabase
                .from('words')
                .upsert(batch, { 
                    onConflict: 'word,language',
                    ignoreDuplicates: false 
                });
            
            if (error) {
                console.error(`  배치 ${i / batchSize + 1} 오류:`, error.message);
            } else {
                successCount += batch.length;
                console.log(`  배치 ${i / batchSize + 1} 완료`);
            }
        }
        console.log(`✓ ${successCount}개의 복합 단어 추가 완료`);
    }

    // 2. 일본어 단일 한자
    console.log('\n2. 일본어 단일 한자 마이그레이션 중...');
    const singleCharacters = readJsonFile('./jlpt/vocabulary/single_character.json');
    if (singleCharacters && singleCharacters.words) {
        const wordsToInsert = singleCharacters.words.map(word => ({
            word: word.word,
            meaning: word.meaning,
            pronunciation: word.pronunciation,
            hiragana: word.hiragana,
            type: word.type || 'kanji',
            language: 'ja',
            level: null,
            kanji_components: null,
            example: null,
            synonyms: null
        }));

        // 배치로 나누어서 삽입
        const batchSize = 100;
        let successCount = 0;
        for (let i = 0; i < wordsToInsert.length; i += batchSize) {
            const batch = wordsToInsert.slice(i, i + batchSize);
            const { data, error } = await supabase
                .from('words')
                .upsert(batch, { 
                    onConflict: 'word,language',
                    ignoreDuplicates: false 
                });
            
            if (error) {
                console.error(`  배치 ${i / batchSize + 1} 오류:`, error.message);
            } else {
                successCount += batch.length;
                console.log(`  배치 ${i / batchSize + 1} 완료`);
            }
        }
        console.log(`✓ ${successCount}개의 단일 한자 추가 완료`);
    }

    // 3. TOEIC 영어 단어
    console.log('\n3. TOEIC 영어 단어 마이그레이션 중...');
    const toeicWords = readJsonFile('./toeic/vocabulary/dictionary.json');
    if (toeicWords && toeicWords.words) {
        const wordsToInsert = toeicWords.words.map(word => ({
            word: word.word,
            meaning: word.meaning,
            pronunciation: word.pronunciation,
            hiragana: null,
            type: word.type || null,
            language: 'en',
            level: word.level || 'intermediate',
            kanji_components: null,
            example: word.example || null,
            synonyms: word.synonyms || null
        }));

        // 배치로 나누어서 삽입
        const batchSize = 100;
        let successCount = 0;
        for (let i = 0; i < wordsToInsert.length; i += batchSize) {
            const batch = wordsToInsert.slice(i, i + batchSize);
            const { data, error } = await supabase
                .from('words')
                .upsert(batch, { 
                    onConflict: 'word,language',
                    ignoreDuplicates: false 
                });
            
            if (error) {
                console.error(`  배치 ${i / batchSize + 1} 오류:`, error.message);
            } else {
                successCount += batch.length;
                console.log(`  배치 ${i / batchSize + 1} 완료`);
            }
        }
        console.log(`✓ ${successCount}개의 TOEIC 단어 추가 완료`);
    }

    console.log('\n✅ 단어 데이터 마이그레이션 완료!');
}

// 메인 실행
async function main() {
    try {
        await migrateWords();
        
        // 통계 출력
        const { count } = await supabase
            .from('words')
            .select('*', { count: 'exact', head: true });
        
        console.log(`\n총 ${count}개의 단어가 데이터베이스에 저장되었습니다.`);
    } catch (error) {
        console.error('마이그레이션 오류:', error);
    }
}

main();

