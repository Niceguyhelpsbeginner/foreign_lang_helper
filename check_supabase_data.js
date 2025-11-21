/**
 * Supabase 데이터 확인 스크립트
 * 
 * 사용 방법:
 * node check_supabase_data.js
 * 
 * Supabase에 데이터가 있는지 확인합니다.
 */

const { createClient } = require('@supabase/supabase-js');
const config = require('./supabase_config.js');

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

async function checkData() {
    console.log('🔍 Supabase 데이터 확인 중...\n');

    // 1. 전체 단어 수 확인
    const { count: totalCount, error: countError } = await supabase
        .from('words')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('❌ 단어 수 조회 오류:', countError);
        return;
    }

    console.log(`📊 전체 단어 수: ${totalCount || 0}개\n`);

    // 2. 언어별 단어 수 확인
    const { count: jaCount, error: jaError } = await supabase
        .from('words')
        .select('*', { count: 'exact', head: true })
        .eq('language', 'ja');

    const { count: enCount, error: enError } = await supabase
        .from('words')
        .select('*', { count: 'exact', head: true })
        .eq('language', 'en');

    console.log(`일본어 단어: ${jaCount || 0}개`);
    console.log(`영어 단어: ${enCount || 0}개\n`);

    // 3. 샘플 데이터 확인
    if (totalCount > 0) {
        const { data: samples, error: sampleError } = await supabase
            .from('words')
            .select('*')
            .limit(5);

        if (sampleError) {
            console.error('❌ 샘플 데이터 조회 오류:', sampleError);
        } else {
            console.log('📝 샘플 데이터 (최대 5개):');
            samples.forEach((word, idx) => {
                console.log(`  ${idx + 1}. ${word.word} (${word.language}) - ${word.meaning}`);
            });
        }
    } else {
        console.log('⚠️ 데이터가 없습니다. 마이그레이션을 실행하세요:');
        console.log('   npm run migrate');
    }

    // 4. RLS 정책 확인 (간접적으로)
    console.log('\n🔐 RLS 정책 확인:');
    console.log('   - words 테이블은 모든 사용자가 읽기 가능해야 합니다.');
    console.log('   - supabase_schema.sql의 RLS 정책을 확인하세요.');
}

checkData().catch(console.error);

