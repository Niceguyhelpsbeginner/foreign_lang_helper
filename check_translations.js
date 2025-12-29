/**
 * Supabase에 저장된 중국어/일본어 뜻 확인 스크립트
 */

const { createClient } = require('@supabase/supabase-js');
const config = require('./supabase_config.js');

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

async function checkTranslations() {
    console.log('Supabase에서 중국어/일본어 뜻 확인 중...\n');
    
    // 영어 단어 중 중국어/일본어 뜻이 있는 것 확인
    const { data, error } = await supabase
        .from('words')
        .select('word, meaning, chinese_meaning, japanese_meaning')
        .eq('language', 'en')
        .limit(10);
    
    if (error) {
        console.error('오류:', error);
        return;
    }
    
    console.log('샘플 데이터 (처음 10개):');
    console.log('='.repeat(80));
    
    data.forEach((word, index) => {
        console.log(`\n${index + 1}. ${word.word}`);
        console.log(`   한국어: ${word.meaning}`);
        console.log(`   중국어: ${word.chinese_meaning || '(null)'}`);
        console.log(`   일본어: ${word.japanese_meaning || '(null)'}`);
    });
    
    // 통계
    const { count: total } = await supabase
        .from('words')
        .select('*', { count: 'exact', head: true })
        .eq('language', 'en');
    
    const { count: withChinese } = await supabase
        .from('words')
        .select('*', { count: 'exact', head: true })
        .eq('language', 'en')
        .not('chinese_meaning', 'is', null);
    
    const { count: withJapanese } = await supabase
        .from('words')
        .select('*', { count: 'exact', head: true })
        .eq('language', 'en')
        .not('japanese_meaning', 'is', null);
    
    console.log('\n' + '='.repeat(80));
    console.log('통계:');
    console.log(`  총 영어 단어: ${total}개`);
    console.log(`  중국어 뜻이 있는 단어: ${withChinese}개`);
    console.log(`  일본어 뜻이 있는 단어: ${withJapanese}개`);
}

checkTranslations().catch(console.error);

