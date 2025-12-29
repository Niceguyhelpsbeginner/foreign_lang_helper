/**
 * 기존 words 테이블 데이터를 언어 쌍별 테이블로 마이그레이션
 * 
 * 사용 방법:
 * 1. 먼저 create_language_pair_tables.sql을 Supabase에서 실행
 * 2. node migrate_to_language_pairs.js 실행
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase 설정
const config = require('./supabase_config.js');

// 마이그레이션은 서비스 역할 키를 사용해야 RLS 정책을 우회할 수 있습니다
// supabase_config.js에 SUPABASE_SERVICE_ROLE_KEY를 추가하거나
// SUPABASE_ANON_KEY 대신 서비스 역할 키를 사용하세요
const supabaseKey = config.SUPABASE_SERVICE_ROLE_KEY || config.SUPABASE_ANON_KEY;
const supabase = createClient(config.SUPABASE_URL, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

if (config.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('⚠️  서비스 역할 키를 사용합니다. RLS 정책을 우회합니다.\n');
} else {
    console.log('⚠️  ANON_KEY를 사용합니다. RLS 정책 오류가 발생할 수 있습니다.\n');
    console.log('💡 해결 방법: supabase_config.js에 SUPABASE_SERVICE_ROLE_KEY를 추가하세요.\n');
}

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

// 언어 쌍별 테이블에 데이터 삽입
async function insertToLanguagePair(tableName, data) {
    const batchSize = 100;
    let successCount = 0;
    
    // 중복 제거: source_word 기준으로 마지막 항목만 유지
    const uniqueData = [];
    const seen = new Map();
    for (const item of data) {
        if (item.source_word) {
            seen.set(item.source_word, item);
        }
    }
    uniqueData.push(...seen.values());
    
    console.log(`  총 ${data.length}개 중 중복 제거 후 ${uniqueData.length}개`);
    
    for (let i = 0; i < uniqueData.length; i += batchSize) {
        const batch = uniqueData.slice(i, i + batchSize);
        const { error } = await supabase
            .from(tableName)
            .upsert(batch, { 
                onConflict: 'source_word',
                ignoreDuplicates: false 
            });
        
        if (error) {
            console.error(`  배치 ${Math.floor(i / batchSize) + 1} 오류:`, error.message);
            // 오류 발생 시 개별 삽입 시도
            let batchSuccessCount = 0;
            for (const item of batch) {
                const { error: singleError } = await supabase
                    .from(tableName)
                    .upsert(item, { 
                        onConflict: 'source_word',
                        ignoreDuplicates: false 
                    });
                if (!singleError) {
                    batchSuccessCount++;
                } else {
                    console.error(`    단어 "${item.source_word}" 삽입 실패:`, singleError.message);
                }
            }
            successCount += batchSuccessCount;
            if (batchSuccessCount > 0) {
                console.log(`  배치 ${Math.floor(i / batchSize) + 1} 개별 삽입 완료 (${batchSuccessCount}/${batch.length}개)`);
            }
        } else {
            successCount += batch.length;
            console.log(`  배치 ${Math.floor(i / batchSize) + 1} 완료 (${batch.length}개)`);
        }
    }
    
    return successCount;
}

// 기존 words 테이블에서 데이터를 읽어서 언어 쌍별 테이블로 변환
async function migrateFromWordsTable() {
    console.log('기존 words 테이블에서 데이터 읽기...\n');
    
    // 일본어 단어 (한국어 뜻 포함)
    const { data: jaWords } = await supabase
        .from('words')
        .select('*')
        .eq('language', 'ja');
    
    if (jaWords && jaWords.length > 0) {
        // ja_ko 테이블에 삽입
        console.log('1. 일본어 -> 한국어 (ja_ko) 마이그레이션 중...');
        const jaKoData = jaWords.map(word => ({
            source_word: word.word,
            target_meaning: word.meaning,
            pronunciation: word.pronunciation || null,
            hiragana: word.hiragana || null,
            type: word.type || null,
            level: word.level || null,
            example: null
        }));
        const jaKoCount = await insertToLanguagePair('ja_ko', jaKoData);
        console.log(`✓ ${jaKoCount}개의 단어 추가 완료\n`);
    }
    
    // 영어 단어 (한국어, 중국어, 일본어 뜻 포함)
    const { data: enWords } = await supabase
        .from('words')
        .select('*')
        .eq('language', 'en');
    
    if (enWords && enWords.length > 0) {
        // en_ko 테이블에 삽입
        console.log('2. 영어 -> 한국어 (en_ko) 마이그레이션 중...');
        const enKoData = enWords.map(word => ({
            source_word: word.word,
            target_meaning: word.meaning,
            pronunciation: word.pronunciation || null,
            type: word.type || null,
            level: word.level || null,
            example: word.example || null,
            synonyms: word.synonyms || null
        }));
        const enKoCount = await insertToLanguagePair('en_ko', enKoData);
        console.log(`✓ ${enKoCount}개의 단어 추가 완료\n`);
        
        // en_zh 테이블에 삽입
        console.log('3. 영어 -> 중국어 (en_zh) 마이그레이션 중...');
        const enZhData = enWords
            .filter(word => word.chinese_meaning && word.chinese_meaning.trim() !== '')
            .map(word => ({
                source_word: word.word,
                target_meaning: word.chinese_meaning,
                pronunciation: word.pronunciation || null,
                type: word.type || null,
                level: word.level || null,
                example: word.example || null,
                synonyms: word.synonyms || null
            }));
        const enZhCount = await insertToLanguagePair('en_zh', enZhData);
        console.log(`✓ ${enZhCount}개의 단어 추가 완료\n`);
        
        // en_ja 테이블에 삽입
        console.log('4. 영어 -> 일본어 (en_ja) 마이그레이션 중...');
        const enJaData = enWords
            .filter(word => word.japanese_meaning && word.japanese_meaning.trim() !== '')
            .map(word => ({
                source_word: word.word,
                target_meaning: word.japanese_meaning,
                pronunciation: word.pronunciation || null,
                type: word.type || null,
                level: word.level || null,
                example: word.example || null,
                synonyms: word.synonyms || null
            }));
        const enJaCount = await insertToLanguagePair('en_ja', enJaData);
        console.log(`✓ ${enJaCount}개의 단어 추가 완료\n`);
    }
}

// JSON 파일에서 직접 마이그레이션
async function migrateFromJSONFiles() {
    console.log('JSON 파일에서 데이터 마이그레이션...\n');
    
    // 일본어 -> 한국어 (JLPT 사전)
    console.log('1. 일본어 -> 한국어 (ja_ko) 마이그레이션 중...');
    const singleChars = readJsonFile('./jlpt/vocabulary/single_character.json');
    if (singleChars && singleChars.words) {
        const jaKoData = singleChars.words.map(word => ({
            source_word: word.word,
            target_meaning: word.meaning,
            pronunciation: word.pronunciation || null,
            hiragana: word.hiragana || null,
            type: word.type || 'kanji',
            level: null,
            example: null
        }));
        const count = await insertToLanguagePair('ja_ko', jaKoData);
        console.log(`✓ ${count}개의 단어 추가 완료\n`);
    }
    
    // 영어 -> 한국어 (TOEIC 사전)
    console.log('2. 영어 -> 한국어 (en_ko) 마이그레이션 중...');
    const toeicWords = readJsonFile('./toeic/vocabulary/dictionary.json');
    if (toeicWords && toeicWords.words) {
        const enKoData = toeicWords.words.map(word => ({
            source_word: word.word,
            target_meaning: word.meaning,
            pronunciation: word.pronunciation || null,
            type: word.type || null,
            level: word.level || 'intermediate',
            example: word.example || null,
            synonyms: word.synonyms || null
        }));
        const count = await insertToLanguagePair('en_ko', enKoData);
        console.log(`✓ ${count}개의 단어 추가 완료\n`);
        
        // 영어 -> 중국어
        console.log('3. 영어 -> 중국어 (en_zh) 마이그레이션 중...');
        const enZhData = toeicWords.words
            .filter(word => word.chineseMeaning && word.chineseMeaning.trim() !== '')
            .map(word => ({
                source_word: word.word,
                target_meaning: word.chineseMeaning,
                pronunciation: word.pronunciation || null,
                type: word.type || null,
                level: word.level || 'intermediate',
                example: word.example || null,
                synonyms: word.synonyms || null
            }));
        const enZhCount = await insertToLanguagePair('en_zh', enZhData);
        console.log(`✓ ${enZhCount}개의 단어 추가 완료\n`);
        
        // 영어 -> 일본어
        console.log('4. 영어 -> 일본어 (en_ja) 마이그레이션 중...');
        const enJaData = toeicWords.words
            .filter(word => word.japaneseMeaning && word.japaneseMeaning.trim() !== '')
            .map(word => ({
                source_word: word.word.trim(), // 공백 제거
                target_meaning: word.japaneseMeaning.trim(),
                pronunciation: word.pronunciation || null,
                type: word.type || null,
                level: word.level || 'intermediate',
                example: word.example || null,
                synonyms: word.synonyms || null
            }));
        console.log(`  총 ${enJaData.length}개의 단어가 en_ja 테이블에 추가될 예정입니다.`);
        const enJaCount = await insertToLanguagePair('en_ja', enJaData);
        console.log(`✓ ${enJaCount}개의 단어 추가 완료\n`);
    }
}

// 메인 실행
async function main() {
    try {
        console.log('언어 쌍별 테이블 마이그레이션 시작...\n');
        
        // JSON 파일에서 마이그레이션
        await migrateFromJSONFiles();
        
        // 기존 words 테이블에서도 마이그레이션 (선택사항)
        // await migrateFromWordsTable();
        
        console.log('✅ 마이그레이션 완료!');
        
        // 통계 출력
        const tables = ['ja_ko', 'ko_ja', 'en_zh', 'zh_en', 'zh_ja', 'ja_zh', 'en_ja', 'ja_en', 'ko_en', 'en_ko', 'ko_zh', 'zh_ko'];
        console.log('\n통계:');
        for (const table of tables) {
            const { count } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });
            console.log(`  ${table}: ${count || 0}개`);
        }
    } catch (error) {
        console.error('마이그레이션 오류:', error);
    }
}

main();

