/**
 * 언어 쌍별 테이블에 역방향 데이터 추가 스크립트
 * 
 * 예: ja_ko 테이블의 데이터를 읽어서 ko_ja 테이블에 역방향으로 추가
 * 
 * 사용 방법:
 * node add_reverse_direction_data.js
 */

const { createClient } = require('@supabase/supabase-js');
const config = require('./supabase_config.js');

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

// 언어 쌍 매핑 (원본 테이블 -> 역방향 테이블)
const reverseMappings = [
    { from: 'ja_ko', to: 'ko_ja' },
    { from: 'ko_ja', to: 'ja_ko' },
    { from: 'en_zh', to: 'zh_en' },
    { from: 'zh_en', to: 'en_zh' },
    { from: 'zh_ja', to: 'ja_zh' },
    { from: 'ja_zh', to: 'zh_ja' },
    { from: 'en_ja', to: 'ja_en' },
    { from: 'ja_en', to: 'en_ja' },
    { from: 'ko_en', to: 'en_ko' },
    { from: 'en_ko', to: 'ko_en' },
    { from: 'ko_zh', to: 'zh_ko' },
    { from: 'zh_ko', to: 'ko_zh' }
];

// 역방향 데이터 추가 함수
async function addReverseData(fromTable, toTable) {
    console.log(`\n${fromTable} -> ${toTable} 역방향 데이터 추가 중...`);
    
    // 원본 테이블에서 데이터 읽기
    const { data: sourceData, error: readError } = await supabase
        .from(fromTable)
        .select('*');
    
    if (readError) {
        console.error(`  오류: ${readError.message}`);
        return 0;
    }
    
    if (!sourceData || sourceData.length === 0) {
        console.log(`  ${fromTable} 테이블에 데이터가 없습니다.`);
        return 0;
    }
    
    console.log(`  ${fromTable}에서 ${sourceData.length}개의 데이터를 읽었습니다.`);
    
    // 역방향 데이터 생성 (source_word와 target_meaning을 바꿈)
    const reverseData = sourceData.map(item => {
        const reverseItem = {
            source_word: item.target_meaning,  // 원본의 target_meaning을 source_word로
            target_meaning: item.source_word,   // 원본의 source_word를 target_meaning으로
            pronunciation: item.pronunciation || null,
            type: item.type || null,
            level: item.level || null,
            example: item.example || null
        };
        
        // 일본어 관련 필드 추가 (hiragana)
        if (item.hiragana) {
            reverseItem.hiragana = item.hiragana;
        }
        
        // 영어 관련 필드 추가 (synonyms)
        if (item.synonyms) {
            reverseItem.synonyms = item.synonyms;
        }
        
        return reverseItem;
    });
    
    // 중복 제거 (같은 source_word가 여러 개 있을 수 있음)
    const uniqueData = [];
    const seen = new Set();
    
    for (const item of reverseData) {
        const key = item.source_word;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueData.push(item);
        } else {
            // 중복된 경우, 기존 항목과 병합 (여러 target_meaning을 하나로 합치기)
            const existing = uniqueData.find(d => d.source_word === key);
            if (existing && existing.target_meaning !== item.target_meaning) {
                // 여러 뜻이 있는 경우 쉼표로 구분하여 추가
                if (!existing.target_meaning.includes(item.target_meaning)) {
                    existing.target_meaning += `, ${item.target_meaning}`;
                }
            }
        }
    }
    
    console.log(`  중복 제거 후 ${uniqueData.length}개의 고유 데이터로 변환되었습니다.`);
    
    // 배치로 삽입
    const batchSize = 100;
    let successCount = 0;
    
    for (let i = 0; i < uniqueData.length; i += batchSize) {
        const batch = uniqueData.slice(i, i + batchSize);
        const { error: insertError } = await supabase
            .from(toTable)
            .upsert(batch, { 
                onConflict: 'source_word',
                ignoreDuplicates: false 
            });
        
        if (insertError) {
            console.error(`  배치 ${Math.floor(i / batchSize) + 1} 오류:`, insertError.message);
        } else {
            successCount += batch.length;
            console.log(`  배치 ${Math.floor(i / batchSize) + 1} 완료 (${batch.length}개)`);
        }
    }
    
    console.log(`✓ ${successCount}개의 역방향 데이터 추가 완료`);
    return successCount;
}

// 메인 실행 함수
async function main() {
    console.log('역방향 데이터 추가 시작...\n');
    console.log('='.repeat(80));
    
    let totalAdded = 0;
    
    for (const mapping of reverseMappings) {
        const count = await addReverseData(mapping.from, mapping.to);
        totalAdded += count;
    }
    
    console.log('\n' + '='.repeat(80));
    console.log(`✅ 전체 역방향 데이터 추가 완료!`);
    console.log(`총 ${totalAdded}개의 역방향 데이터가 추가되었습니다.`);
    
    // 최종 통계 출력
    console.log('\n최종 통계:');
    for (const mapping of reverseMappings) {
        const { count } = await supabase
            .from(mapping.to)
            .select('*', { count: 'exact', head: true });
        console.log(`  ${mapping.to}: ${count || 0}개`);
    }
}

// 실행
main().catch(console.error);

