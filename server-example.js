// 네이버 일본어사전 크롤링을 위한 Node.js 서버 예제
// 이 파일은 참고용이며, 실제로는 별도의 백엔드 서버가 필요합니다.

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 네이버 일본어사전 검색 엔드포인트
app.get('/api/japanese-dict/:word', async (req, res) => {
    try {
        const word = req.params.word;
        const url = `https://ja.dict.naver.com/search/all?query=${encodeURIComponent(word)}`;
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const $ = cheerio.load(response.data);
        
        // 네이버 일본어사전 페이지 구조에 맞게 파싱
        const result = {
            word: word,
            meaning: '',
            pronunciation: '',
            hiragana: '',
            katakana: '',
            kanji: '',
            examples: []
        };
        
        // 실제 HTML 구조에 맞게 선택자를 수정해야 합니다
        // 예시:
        $('.mean_list').each((i, elem) => {
            const meaning = $(elem).find('.mean').text().trim();
            if (meaning) {
                result.meaning += meaning + '\n';
            }
        });
        
        // 발음 정보
        const pronunciation = $('.pronunciation').first().text().trim();
        if (pronunciation) {
            result.pronunciation = pronunciation;
        }
        
        // 히라가나/가타카나/한자 정보
        $('.entry_word').each((i, elem) => {
            const text = $(elem).text().trim();
            if (/[\u3040-\u309F]/.test(text)) {
                result.hiragana = text;
            } else if (/[\u30A0-\u30FF]/.test(text)) {
                result.katakana = text;
            } else if (/[\u4e00-\u9faf]/.test(text)) {
                result.kanji = text;
            }
        });
        
        res.json(result);
    } catch (error) {
        console.error('검색 오류:', error);
        res.status(500).json({ error: '검색 중 오류가 발생했습니다.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});

// 사용 방법:
// 1. npm install express axios cheerio cors
// 2. node server-example.js
// 3. 프론트엔드에서 http://localhost:3000/api/japanese-dict/단어 로 요청


