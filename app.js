// 전역 상태 관리
const AppState = {
    currentPage: 'home',
    vocabulary: [],
    searchHistory: [],
    settings: {
        targetCertification: 'none',
        dailyGoal: 10,
        ttsLanguage: 'ja',
        naverClientId: '',
        naverClientSecret: ''
    },
    currentQuiz: null,
    currentTest: null,
    currentFlashcardIndex: 0,
    dailyProgress: {
        date: new Date().toDateString(),
        wordsLearned: 0,
        goal: 10
    }
};

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initializeEventListeners();
    updateUI();
});

// 데이터 로드
function loadData() {
    const savedVocab = localStorage.getItem('vocabulary');
    const savedHistory = localStorage.getItem('searchHistory');
    const savedSettings = localStorage.getItem('settings');
    const savedProgress = localStorage.getItem('dailyProgress');

    if (savedVocab) {
        AppState.vocabulary = JSON.parse(savedVocab);
    }
    if (savedHistory) {
        AppState.searchHistory = JSON.parse(savedHistory);
    }
    if (savedSettings) {
        AppState.settings = { ...AppState.settings, ...JSON.parse(savedSettings) };
    }
    if (savedProgress) {
        AppState.dailyProgress = JSON.parse(savedProgress);
        // 날짜가 다르면 초기화
        if (AppState.dailyProgress.date !== new Date().toDateString()) {
            AppState.dailyProgress = {
                date: new Date().toDateString(),
                wordsLearned: 0,
                goal: AppState.settings.dailyGoal
            };
        }
    }
}

// 데이터 저장
function saveData() {
    localStorage.setItem('vocabulary', JSON.stringify(AppState.vocabulary));
    localStorage.setItem('searchHistory', JSON.stringify(AppState.searchHistory));
    localStorage.setItem('settings', JSON.stringify(AppState.settings));
    localStorage.setItem('dailyProgress', JSON.stringify(AppState.dailyProgress));
}

// 이벤트 리스너 초기화
function initializeEventListeners() {
    // 네비게이션
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const page = e.target.dataset.page;
            showPage(page);
        });
    });

    // 설정 버튼
    document.getElementById('settingsBtn').addEventListener('click', () => {
        openSettingsModal();
    });

    // 단어 추가
    document.getElementById('addWordBtn').addEventListener('click', () => {
        openAddWordModal();
    });

    document.getElementById('saveWordBtn').addEventListener('click', saveWord);
    document.getElementById('cancelAddBtn').addEventListener('click', closeAddWordModal);
    document.getElementById('closeModalBtn').addEventListener('click', closeAddWordModal);

    // 설정 모달
    document.getElementById('closeSettingsBtn').addEventListener('click', closeSettingsModal);
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);

    // 사전 검색
    document.getElementById('dictSearchBtn').addEventListener('click', searchDictionary);
    document.getElementById('dictSearchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchDictionary();
    });

    // 플래시카드
    document.getElementById('flashcard').addEventListener('click', flipCard);
    document.getElementById('prevBtn').addEventListener('click', () => changeCard(-1));
    document.getElementById('nextBtn').addEventListener('click', () => changeCard(1));
    document.getElementById('knowBtn').addEventListener('click', () => markWord(true));
    document.getElementById('dontKnowBtn').addEventListener('click', () => markWord(false));

    // 퀴즈
    document.getElementById('startQuizBtn').addEventListener('click', startQuiz);
    document.getElementById('submitAnswerBtn').addEventListener('click', submitQuizAnswer);
    document.getElementById('retryQuizBtn').addEventListener('click', () => {
        document.getElementById('quiz-start').style.display = 'block';
        document.getElementById('quiz-question').style.display = 'none';
        document.getElementById('quiz-result').style.display = 'none';
    });

    // 독해
    document.getElementById('uploadImageBtn').addEventListener('click', () => {
        document.getElementById('imageInput').click();
    });
    document.getElementById('imageInput').addEventListener('change', handleImageUpload);
    document.getElementById('ttsBtn').addEventListener('click', readText);
    document.getElementById('loadReadingBtn').addEventListener('click', loadReadingPassage);

    // 모의고사
    document.getElementById('submitTestBtn').addEventListener('click', submitTestAnswer);
    document.getElementById('retryTestBtn').addEventListener('click', () => {
        document.querySelector('.test-selector').style.display = 'grid';
        document.getElementById('testContainer').style.display = 'none';
        document.getElementById('testResult').style.display = 'none';
    });

    // 모달 닫기 (배경 클릭)
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// 페이지 전환
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
        AppState.currentPage = pageName;
    }

    const targetBtn = document.querySelector(`[data-page="${pageName}"]`);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }

    // 페이지별 초기화
    if (pageName === 'vocabulary') {
        renderVocabularyList();
    } else if (pageName === 'dictionary') {
        renderSearchHistory();
    } else if (pageName === 'progress') {
        updateProgressPage();
    } else if (pageName === 'learn') {
        updateFlashcard();
    }
}

// UI 업데이트
function updateUI() {
    updateHomeStats();
    updateFlashcard();
    renderSearchHistory();
}

// 홈 통계 업데이트
function updateHomeStats() {
    const totalWords = AppState.vocabulary.length;
    const learnedWords = AppState.vocabulary.filter(w => w.mastered).length;
    const quizScores = JSON.parse(localStorage.getItem('quizScores') || '[]');
    const avgScore = quizScores.length > 0 
        ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) 
        : 0;

    document.getElementById('totalWords').textContent = totalWords;
    document.getElementById('learnedWords').textContent = learnedWords;
    document.getElementById('quizScore').textContent = `${avgScore}%`;
    document.getElementById('studyStreak').textContent = calculateStreak();
}

// 연속 학습일 계산
function calculateStreak() {
    const lastStudyDate = localStorage.getItem('lastStudyDate');
    if (!lastStudyDate) return 0;
    
    const today = new Date();
    const lastDate = new Date(lastStudyDate);
    const diffTime = today - lastDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 1 ? (parseInt(localStorage.getItem('streak') || '0') + 1) : 0;
}

// 한국어인지 확인하는 함수
function isKorean(text) {
    return /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text);
}

// 일본어인지 확인하는 함수
function isJapanese(text) {
    return /[\u3040-\u309F\u30A0-\u30FF\u4e00-\u9faf]/.test(text);
}

// 사전 검색
async function searchDictionary() {
    const query = document.getElementById('dictSearchInput').value.trim();
    const language = document.getElementById('dictLanguage').value;
    
    if (!query) return;

    const resultDiv = document.getElementById('dictResult');
    resultDiv.innerHTML = '<div class="dict-placeholder">검색 중...</div>';

    // 검색 기록에 추가
    addToSearchHistory(query, language);

    try {
        let result;
        if (language === 'ja') {
            // 네이버 검색 API 사용 (한국어, 일본어 모두 지원)
            result = await searchNaverJapaneseDictionary(query);
        } else {
            // 다른 언어는 기존 시뮬레이션 사용
            result = await mockDictionarySearch(query, language);
        }
        displayDictionaryResult(result, query, language);
    } catch (error) {
        console.error('검색 오류:', error);
        resultDiv.innerHTML = `
            <div class="dict-placeholder" style="color: var(--danger-color);">
                검색 중 오류가 발생했습니다.<br>
                ${error.message}<br>
                <small>네이버 API 키가 설정되어 있는지 확인하세요.</small>
            </div>
        `;
    }
}

// 네이버 검색 API를 사용한 일본어 사전 검색
async function searchNaverJapaneseDictionary(word) {
    const clientId = AppState.settings.naverClientId;
    const clientSecret = AppState.settings.naverClientSecret;

    if (!clientId || !clientSecret) {
        throw new Error('네이버 API 키가 설정되지 않았습니다. 설정에서 API 키를 입력하세요.');
    }

    const isKoreanInput = isKorean(word);
    const isJapaneseInput = isJapanese(word);

    try {
        // 네이버 검색 API - 백과사전 검색 사용
        // 한국어 입력: "단어 일본어" 형태로 검색
        // 일본어 입력: "단어" 그대로 검색
        const searchQuery = isKoreanInput ? `${word} 일본어` : word;
        const searchUrl = `https://openapi.naver.com/v1/search/encyc.json?query=${encodeURIComponent(searchQuery)}&display=10`;
        
        const response = await fetch(searchUrl, {
            method: 'GET',
            headers: {
                'X-Naver-Client-Id': clientId,
                'X-Naver-Client-Secret': clientSecret
            }
        });

        if (!response.ok) {
            throw new Error(`API 오류: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
            return {
                word: word,
                meaning: '검색 결과를 찾을 수 없습니다.',
                example: null,
                etymology: null,
                songs: null,
                pronunciation: null,
                kanji: null,
                hiragana: null,
                katakana: null,
                examples: [],
                isFromKorean: isKoreanInput,
                error: false
            };
        }

        // 검색 결과 파싱
        const item = data.items[0];
        const title = item.title.replace(/<[^>]*>/g, ''); // HTML 태그 제거
        const description = item.description.replace(/<[^>]*>/g, '');

        // 일본어 문자 추출
        let kanji = '';
        let hiragana = '';
        let katakana = '';
        
        // 제목과 설명에서 일본어 문자 추출
        const allText = title + ' ' + description;
        const kanjiMatch = allText.match(/[\u4e00-\u9faf]+/g);
        const hiraganaMatch = allText.match(/[\u3040-\u309F]+/g);
        const katakanaMatch = allText.match(/[\u30A0-\u30FF]+/g);

        if (kanjiMatch && kanjiMatch.length > 0) {
            kanji = kanjiMatch[0];
        }
        if (hiraganaMatch && hiraganaMatch.length > 0) {
            hiragana = hiraganaMatch[0];
        }
        if (katakanaMatch && katakanaMatch.length > 0) {
            katakana = katakanaMatch[0];
        }

        // 의미 추출 (한국어 입력인 경우 한국어 의미, 일본어 입력인 경우 영어 의미)
        let meaning = description;
        if (isKoreanInput) {
            // 한국어 입력인 경우, 설명에서 의미 추출
            meaning = description.split(/[。\n]/)[0] || description;
        } else {
            // 일본어 입력인 경우, 영어 의미 추출 시도
            meaning = description;
        }

        return {
            word: word,
            meaning: meaning || title,
            example: null,
            etymology: null,
            songs: null,
            pronunciation: null,
            kanji: kanji || null,
            hiragana: hiragana || null,
            katakana: katakana || null,
            examples: [],
            isFromKorean: isKoreanInput,
            naverUrl: `https://ja.dict.naver.com/search/all?query=${encodeURIComponent(word)}`,
            fullData: item,
            error: false
        };
    } catch (error) {
        console.error('네이버 검색 API 오류:', error);
        throw new Error('사전 검색 중 오류가 발생했습니다: ' + error.message);
    }
}

// 사전 검색 시뮬레이션 (다른 언어용)
async function mockDictionarySearch(word, lang) {
    // 실제로는 외부 API를 호출해야 합니다
    // 여기서는 예시 데이터를 반환합니다
    return {
        word: word,
        meaning: `${word}의 의미입니다.`,
        example: `예문: ${word}를 사용한 문장입니다.`,
        etymology: lang === 'en' ? getEnglishEtymology(word) : null,
        songs: getSongRecommendations(word, lang)
    };
}

// 영어 어원 정보 (시뮬레이션)
function getEnglishEtymology(word) {
    const etymologyMap = {
        'un': { prefix: 'un-', meaning: '부정, 반대' },
        're': { prefix: 're-', meaning: '다시, 재' },
        'pre': { prefix: 'pre-', meaning: '이전, 미리' },
        'tion': { suffix: '-tion', meaning: '명사형 접미사' },
        'ly': { suffix: '-ly', meaning: '부사형 접미사' }
    };

    for (const [key, info] of Object.entries(etymologyMap)) {
        if (word.startsWith(key) && key.length > 2) {
            return { type: 'prefix', ...info };
        }
        if (word.endsWith(key)) {
            return { type: 'suffix', ...info };
        }
    }
    return null;
}

// 노래 추천 (시뮬레이션)
function getSongRecommendations(word, lang) {
    // 실제로는 음악 API를 사용해야 합니다
    return [
        { title: '예시 노래 1', artist: '아티스트 1', lyrics: `${word}가 포함된 가사...` },
        { title: '예시 노래 2', artist: '아티스트 2', lyrics: `${word}가 포함된 가사...` }
    ];
}

// 사전 결과 표시
function displayDictionaryResult(result, word, lang) {
    const resultDiv = document.getElementById('dictResult');
    
    let html = `
        <div class="word-entry">
            <div class="word-entry-title" onclick="showWordDetail('${word}', '${lang}')">${result.word}</div>
    `;

    // 일본어 특수 정보 표시
    if (lang === 'ja') {
        // 한국어에서 검색한 경우 안내
        if (result.isFromKorean) {
            html += `<div style="margin: 0.5rem 0; padding: 0.75rem; background: #e0f2fe; border-radius: 8px; color: #0369a1;">
                <strong>🔍 검색어:</strong> ${result.word} (한국어)
            </div>`;
        }

        // 한자, 히라가나, 가타카나 표시
        const wordForms = [];
        if (result.kanji) wordForms.push(`<span class="word-kanji">${result.kanji}</span>`);
        if (result.hiragana) wordForms.push(`<span class="word-hiragana">${result.hiragana}</span>`);
        if (result.katakana) wordForms.push(`<span class="word-katakana">${result.katakana}</span>`);
        
        if (wordForms.length > 0) {
            html += `<div style="margin: 0.5rem 0; font-size: 1.2rem; line-height: 1.8;">
                ${wordForms.join(' ')}
            </div>`;
        }

        if (result.pronunciation) {
            html += `<div class="word-pronunciation">📢 발음: ${result.pronunciation}</div>`;
        }

        // 네이버 일본어사전 링크
        if (result.naverUrl) {
            html += `<div style="margin-top: 1rem;">
                <a href="${result.naverUrl}" target="_blank" class="btn btn-secondary" style="display: inline-block;">
                    네이버 일본어사전에서 더 보기 →
                </a>
            </div>`;
        }
    }

    html += `
            <div class="word-entry-meaning">${result.meaning}</div>
            ${result.example ? `<div class="word-entry-example">${result.example}</div>` : ''}
            ${result.etymology ? `
                <div class="etymology-info">
                    <h5>어원</h5>
                    <p>${result.etymology.type === 'prefix' ? '접두어' : '접미어'}: ${result.etymology.prefix || result.etymology.suffix} - ${result.etymology.meaning}</p>
                </div>
            ` : ''}
        </div>
    `;

    resultDiv.innerHTML = html;

    // 한자/일본어 단어에 호버 기능 추가
    if (lang === 'ja' || lang === 'zh') {
        addKanjiHover(resultDiv);
    }

    // 영어 단어에 어원 호버 기능 추가
    if (lang === 'en') {
        addEtymologyHover(resultDiv, word);
    }
}

// 검색 기록에 추가
function addToSearchHistory(word, lang) {
    const entry = { word, lang, date: new Date().toISOString() };
    AppState.searchHistory.unshift(entry);
    if (AppState.searchHistory.length > 20) {
        AppState.searchHistory = AppState.searchHistory.slice(0, 20);
    }
    saveData();
    renderSearchHistory();
}

// 검색 기록 렌더링
function renderSearchHistory() {
    const historyList = document.getElementById('searchHistoryList');
    if (!historyList) return;

    if (AppState.searchHistory.length === 0) {
        historyList.innerHTML = '<p style="color: var(--text-secondary);">검색 기록이 없습니다.</p>';
        return;
    }

    historyList.innerHTML = AppState.searchHistory.map(entry => 
        `<span class="history-item" onclick="searchFromHistory('${entry.word}', '${entry.lang}')">${entry.word}</span>`
    ).join('');
}

// 검색 기록에서 검색
function searchFromHistory(word, lang) {
    document.getElementById('dictSearchInput').value = word;
    document.getElementById('dictLanguage').value = lang;
    searchDictionary();
}

// 단어 상세 모달
function showWordDetail(word, lang) {
    const modal = document.getElementById('wordDetailModal');
    const result = mockDictionarySearch(word, lang);
    
    document.getElementById('wordDetailTitle').textContent = word;
    document.getElementById('wordDetailMeaning').textContent = result.meaning;
    
    const etymologySection = document.getElementById('etymologySection');
    const etymologyDiv = document.getElementById('wordEtymology');
    if (result.etymology) {
        etymologySection.style.display = 'block';
        etymologyDiv.innerHTML = `
            <p><strong>${result.etymology.type === 'prefix' ? '접두어' : '접미어'}:</strong> ${result.etymology.prefix || result.etymology.suffix}</p>
            <p><strong>의미:</strong> ${result.etymology.meaning}</p>
        `;
    } else {
        etymologySection.style.display = 'none';
    }

    const songSection = document.getElementById('songSection');
    const songsDiv = document.getElementById('wordSongs');
    if (result.songs && result.songs.length > 0) {
        songSection.style.display = 'block';
        songsDiv.innerHTML = result.songs.map(song => `
            <div class="song-item">
                <h5>${song.title}</h5>
                <p>${song.artist}</p>
                <p style="margin-top: 0.5rem; font-size: 0.85rem;">${song.lyrics}</p>
            </div>
        `).join('');
    } else {
        songSection.style.display = 'none';
    }

    document.getElementById('closeWordDetailBtn').onclick = () => {
        modal.classList.remove('active');
    };

    modal.classList.add('active');
}

// 한자 호버 기능
function addKanjiHover(container) {
    const text = container.textContent;
    const kanjiRegex = /[\u4e00-\u9faf]/g;
    const kanjis = text.match(kanjiRegex);
    
    if (!kanjis) return;

    container.querySelectorAll('.word-entry-title, .word-entry-meaning').forEach(el => {
        let html = el.innerHTML;
        kanjis.forEach(kanji => {
            const tooltip = `<span class="kanji-tooltip">${kanji}: 한자 뜻과 발음</span>`;
            html = html.replace(new RegExp(kanji, 'g'), 
                `<span class="kanji-hover">${kanji}${tooltip}</span>`);
        });
        el.innerHTML = html;
    });
}

// 어원 호버 기능
function addEtymologyHover(container, word) {
    const etymology = getEnglishEtymology(word);
    if (!etymology) return;

    container.querySelectorAll('.word-entry-title').forEach(el => {
        const prefix = etymology.prefix || '';
        const suffix = etymology.suffix || '';
        const part = prefix || suffix;
        
        if (word.includes(part)) {
            let html = el.innerHTML;
            const tooltip = `<span class="etymology-tooltip">${part}: ${etymology.meaning}</span>`;
            html = html.replace(part, `<span class="etymology-hover">${part}${tooltip}</span>`);
            el.innerHTML = html;
        }
    });
}

// 플래시카드
function updateFlashcard() {
    const filteredWords = getFilteredWords();
    if (filteredWords.length === 0) {
        document.getElementById('wordDisplay').textContent = '단어를 추가해주세요';
        document.getElementById('meaningDisplay').textContent = '';
        document.getElementById('currentCard').textContent = '0';
        document.getElementById('totalCards').textContent = '0';
        return;
    }

    const index = AppState.currentFlashcardIndex;
    const word = filteredWords[index];
    
    document.getElementById('wordDisplay').textContent = word.word;
    document.getElementById('meaningDisplay').textContent = word.meaning;
    document.getElementById('exampleDisplay').textContent = word.example || '';
    document.getElementById('currentCard').textContent = index + 1;
    document.getElementById('totalCards').textContent = filteredWords.length;

    // 카드 초기화
    document.getElementById('flashcard').classList.remove('flipped');
}

function getFilteredWords() {
    const lang = document.getElementById('learnLanguage')?.value || 'en';
    const cert = AppState.settings.targetCertification;
    
    let words = AppState.vocabulary.filter(w => w.language === lang);
    
    // 자격증 필터링
    if (cert !== 'none') {
        words = words.filter(w => w.certification === cert || !w.certification);
    }
    
    return words;
}

function flipCard() {
    document.getElementById('flashcard').classList.toggle('flipped');
}

function changeCard(direction) {
    const filteredWords = getFilteredWords();
    if (filteredWords.length === 0) return;

    AppState.currentFlashcardIndex += direction;
    if (AppState.currentFlashcardIndex < 0) {
        AppState.currentFlashcardIndex = filteredWords.length - 1;
    } else if (AppState.currentFlashcardIndex >= filteredWords.length) {
        AppState.currentFlashcardIndex = 0;
    }
    
    updateFlashcard();
}

function markWord(know) {
    const filteredWords = getFilteredWords();
    const currentWord = filteredWords[AppState.currentFlashcardIndex];
    
    if (currentWord) {
        if (!currentWord.studyCount) currentWord.studyCount = 0;
        if (!currentWord.correctCount) currentWord.correctCount = 0;
        
        currentWord.studyCount++;
        if (know) {
            currentWord.correctCount++;
            if (currentWord.correctCount >= 3) {
                currentWord.mastered = true;
            }
        }
        
        AppState.dailyProgress.wordsLearned++;
        saveData();
        updateHomeStats();
        
        // 다음 카드로
        setTimeout(() => changeCard(1), 500);
    }
}

// 퀴즈
function startQuiz() {
    const count = parseInt(document.getElementById('quizCount').value);
    const filteredWords = getFilteredWords();
    
    if (filteredWords.length === 0) {
        alert('퀴즈를 풀 수 있는 단어가 없습니다. 단어를 추가해주세요.');
        return;
    }

    // 검색 기록에서 단어 가져오기
    const searchWords = AppState.searchHistory
        .filter(h => filteredWords.some(w => w.word === h.word))
        .slice(0, count)
        .map(h => filteredWords.find(w => w.word === h.word))
        .filter(Boolean);

    const quizWords = searchWords.length >= count 
        ? searchWords.slice(0, count)
        : [...searchWords, ...filteredWords].slice(0, count);

    AppState.currentQuiz = {
        words: quizWords,
        currentIndex: 0,
        answers: [],
        score: 0
    };

    document.getElementById('quiz-start').style.display = 'none';
    document.getElementById('quiz-question').style.display = 'block';
    showQuizQuestion();
}

function showQuizQuestion() {
    const quiz = AppState.currentQuiz;
    if (!quiz || quiz.currentIndex >= quiz.words.length) {
        showQuizResult();
        return;
    }

    const word = quiz.words[quiz.currentIndex];
    const allWords = getFilteredWords();
    const wrongAnswers = allWords
        .filter(w => w.word !== word.word)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => w.meaning);
    
    const options = [word.meaning, ...wrongAnswers].sort(() => Math.random() - 0.5);

    document.getElementById('quizQuestionText').textContent = `"${word.word}"의 의미는?`;
    document.getElementById('quizProgressText').textContent = `${quiz.currentIndex + 1} / ${quiz.words.length}`;
    document.getElementById('quizProgress').style.width = `${((quiz.currentIndex + 1) / quiz.words.length) * 100}%`;

    const optionsDiv = document.getElementById('quizOptions');
    optionsDiv.innerHTML = options.map((option, idx) => `
        <div class="quiz-option" data-answer="${option}" onclick="selectQuizOption(this)">
            ${idx + 1}. ${option}
        </div>
    `).join('');

    document.getElementById('submitAnswerBtn').disabled = true;
}

function selectQuizOption(element) {
    document.querySelectorAll('.quiz-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    element.classList.add('selected');
    document.getElementById('submitAnswerBtn').disabled = false;
}

function submitQuizAnswer() {
    const quiz = AppState.currentQuiz;
    const selected = document.querySelector('.quiz-option.selected');
    
    if (!selected) return;

    const correctAnswer = quiz.words[quiz.currentIndex].meaning;
    const userAnswer = selected.dataset.answer;
    const isCorrect = userAnswer === correctAnswer;

    if (isCorrect) {
        quiz.score++;
        selected.classList.add('correct');
    } else {
        selected.classList.add('incorrect');
        document.querySelectorAll('.quiz-option').forEach(opt => {
            if (opt.dataset.answer === correctAnswer) {
                opt.classList.add('correct');
            }
        });
    }

    quiz.answers.push({ word: quiz.words[quiz.currentIndex].word, correct: isCorrect });
    quiz.currentIndex++;

    setTimeout(() => {
        showQuizQuestion();
    }, 1500);
}

function showQuizResult() {
    const quiz = AppState.currentQuiz;
    const percentage = Math.round((quiz.score / quiz.words.length) * 100);

    document.getElementById('quiz-question').style.display = 'none';
    document.getElementById('quiz-result').style.display = 'block';
    document.getElementById('quizScoreDisplay').textContent = quiz.score;
    document.getElementById('quizTotalDisplay').textContent = quiz.words.length;
    document.getElementById('resultPercentage').textContent = `${percentage}%`;

    // 점수 저장
    const scores = JSON.parse(localStorage.getItem('quizScores') || '[]');
    scores.push(percentage);
    localStorage.setItem('quizScores', JSON.stringify(scores));
}

// 독해
function loadReadingPassage() {
    // 예시 독해 지문
    const passages = [
        {
            text: "The quick brown fox jumps over the lazy dog. This is a sample reading passage for comprehension practice.",
            questions: [
                {
                    question: "What does the fox do?",
                    options: ["Jumps", "Runs", "Walks", "Sleeps"],
                    correct: 0
                },
                {
                    question: "What is the dog doing?",
                    options: ["Running", "Jumping", "Sleeping", "Playing"],
                    correct: 2
                }
            ]
        }
    ];

    const passage = passages[Math.floor(Math.random() * passages.length)];
    displayReadingPassage(passage);
}

function displayReadingPassage(passage) {
    document.getElementById('readingText').innerHTML = `<p>${passage.text}</p>`;
    document.getElementById('ttsBtn').style.display = 'inline-block';

    const questionsDiv = document.getElementById('questionsList');
    questionsDiv.innerHTML = passage.questions.map((q, idx) => `
        <div class="question-item">
            <div class="question-text">${idx + 1}. ${q.question}</div>
            <div class="question-options">
                ${q.options.map((opt, optIdx) => `
                    <div class="question-option" data-correct="${optIdx === q.correct}">${opt}</div>
                `).join('')}
            </div>
        </div>
    `).join('');

    // 옵션 클릭 이벤트
    questionsDiv.querySelectorAll('.question-option').forEach(opt => {
        opt.addEventListener('click', function() {
            this.parentElement.querySelectorAll('.question-option').forEach(o => {
                o.style.background = '';
            });
            this.style.background = this.dataset.correct === 'true' 
                ? 'var(--success-color)' 
                : 'var(--danger-color)';
        });
    });
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // 실제로는 OCR API를 사용해야 합니다 (예: Tesseract.js, Google Cloud Vision)
    // 여기서는 시뮬레이션
    alert('이미지에서 텍스트를 추출하는 기능은 실제 OCR API가 필요합니다.\n예: Tesseract.js 또는 Google Cloud Vision API');
    
    // Tesseract.js 사용 예시 (주석 처리)
    /*
    Tesseract.recognize(file)
        .then(result => {
            document.getElementById('readingText').innerHTML = `<p>${result.data.text}</p>`;
            document.getElementById('ttsBtn').style.display = 'inline-block';
        });
    */
}

function readText() {
    const text = document.getElementById('readingText').textContent;
    const lang = AppState.settings.ttsLanguage;
    
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'ko' ? 'ko-KR' : lang === 'ja' ? 'ja-JP' : lang === 'zh' ? 'zh-CN' : 'en-US';
        speechSynthesis.speak(utterance);
    } else {
        alert('이 브라우저는 TTS를 지원하지 않습니다.');
    }
}

// 모의고사
function startMockTest() {
    document.querySelector('.test-selector').style.display = 'none';
    document.getElementById('testContainer').style.display = 'block';
    
    // 모의고사 문제 생성 (실제로는 서버에서 가져와야 함)
    AppState.currentTest = {
        type: 'mock',
        questions: generateMockTestQuestions(),
        currentIndex: 0,
        answers: [],
        startTime: Date.now()
    };

    showTestQuestion();
}

function startLevelTest() {
    document.querySelector('.test-selector').style.display = 'none';
    document.getElementById('testContainer').style.display = 'block';
    
    AppState.currentTest = {
        type: 'level',
        questions: generateLevelTestQuestions(),
        currentIndex: 0,
        answers: [],
        startTime: Date.now()
    };

    showTestQuestion();
}

function generateMockTestQuestions() {
    // 실제로는 서버에서 문제를 가져와야 합니다
    return [
        { question: "다음 중 올바른 문법은?", options: ["Option 1", "Option 2", "Option 3", "Option 4"], correct: 0 },
        { question: "다음 단어의 의미는?", options: ["의미 1", "의미 2", "의미 3", "의미 4"], correct: 1 }
    ];
}

function generateLevelTestQuestions() {
    const allWords = AppState.vocabulary;
    return allWords.slice(0, 20).map(word => ({
        question: `"${word.word}"의 의미는?`,
        options: [
            word.meaning,
            ...allWords.filter(w => w.word !== word.word).slice(0, 3).map(w => w.meaning)
        ].sort(() => Math.random() - 0.5),
        correct: 0
    }));
}

function showTestQuestion() {
    const test = AppState.currentTest;
    if (!test || test.currentIndex >= test.questions.length) {
        showTestResult();
        return;
    }

    const question = test.questions[test.currentIndex];
    document.getElementById('testProgressText').textContent = `${test.currentIndex + 1} / ${test.questions.length}`;
    document.getElementById('testProgress').style.width = `${((test.currentIndex + 1) / test.questions.length) * 100}%`;

    const questionDiv = document.getElementById('testQuestion');
    questionDiv.innerHTML = `
        <h3>${question.question}</h3>
        <div class="quiz-options" style="margin-top: 1.5rem;">
            ${question.options.map((opt, idx) => `
                <div class="quiz-option" data-answer="${idx}" onclick="selectTestOption(this)">
                    ${idx + 1}. ${opt}
                </div>
            `).join('')}
        </div>
    `;

    document.getElementById('submitTestBtn').disabled = true;
}

function selectTestOption(element) {
    document.querySelectorAll('.quiz-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    element.classList.add('selected');
    document.getElementById('submitTestBtn').disabled = false;
}

function submitTestAnswer() {
    const test = AppState.currentTest;
    const selected = document.querySelector('.quiz-option.selected');
    
    if (!selected) return;

    const answerIndex = parseInt(selected.dataset.answer);
    test.answers.push(answerIndex);
    test.currentIndex++;

    setTimeout(() => {
        showTestQuestion();
    }, 500);
}

function showTestResult() {
    const test = AppState.currentTest;
    const score = test.questions.reduce((acc, q, idx) => {
        return acc + (test.answers[idx] === q.correct ? 1 : 0);
    }, 0);
    const percentage = Math.round((score / test.questions.length) * 100);

    document.getElementById('testContainer').style.display = 'none';
    document.getElementById('testResult').style.display = 'block';

    const summary = document.getElementById('testResultSummary');
    summary.innerHTML = `
        <div class="result-score">${score} / ${test.questions.length}</div>
        <div class="result-percentage">${percentage}%</div>
    `;

    // 레벨 평가
    let level = '';
    if (percentage >= 90) level = '상급';
    else if (percentage >= 70) level = '중급';
    else if (percentage >= 50) level = '초중급';
    else level = '초급';

    const details = document.getElementById('testResultDetails');
    details.innerHTML = `
        <p><strong>예상 레벨:</strong> ${level}</p>
        <p><strong>소요 시간:</strong> ${Math.round((Date.now() - test.startTime) / 1000)}초</p>
    `;
}

// 단어장
function renderVocabularyList() {
    const list = document.getElementById('vocabularyList');
    const searchTerm = document.getElementById('searchWord')?.value.toLowerCase() || '';
    const filterLang = document.getElementById('filterLanguage')?.value || 'all';

    let words = AppState.vocabulary;
    
    if (searchTerm) {
        words = words.filter(w => 
            w.word.toLowerCase().includes(searchTerm) || 
            w.meaning.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filterLang !== 'all') {
        words = words.filter(w => w.language === filterLang);
    }

    if (words.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">단어가 없습니다.</p>';
        return;
    }

    list.innerHTML = words.map((word, idx) => `
        <div class="vocab-item">
            <div class="vocab-info">
                <div class="vocab-word">${word.word}</div>
                <div class="vocab-meaning">${word.meaning}</div>
            </div>
            <div class="vocab-actions">
                <button class="btn btn-secondary" onclick="showWordDetail('${word.word}', '${word.language}')">상세</button>
                <button class="btn btn-danger" onclick="deleteWord(${idx})">삭제</button>
            </div>
        </div>
    `).join('');
}

// 검색 필터 이벤트
document.getElementById('searchWord')?.addEventListener('input', renderVocabularyList);
document.getElementById('filterLanguage')?.addEventListener('change', renderVocabularyList);

function deleteWord(index) {
    if (confirm('이 단어를 삭제하시겠습니까?')) {
        AppState.vocabulary.splice(index, 1);
        saveData();
        renderVocabularyList();
        updateUI();
    }
}

// 단어 추가 모달
function openAddWordModal() {
    document.getElementById('addWordModal').classList.add('active');
    document.getElementById('modalWord').value = '';
    document.getElementById('modalMeaning').value = '';
    document.getElementById('modalExample').value = '';
}

function closeAddWordModal() {
    document.getElementById('addWordModal').classList.remove('active');
}

function saveWord() {
    const word = document.getElementById('modalWord').value.trim();
    const meaning = document.getElementById('modalMeaning').value.trim();
    const example = document.getElementById('modalExample').value.trim();
    const language = document.getElementById('modalLanguage').value;
    const cert = AppState.settings.targetCertification;

    if (!word || !meaning) {
        alert('단어와 의미를 입력해주세요.');
        return;
    }

    AppState.vocabulary.push({
        word,
        meaning,
        example,
        language,
        certification: cert !== 'none' ? cert : null,
        mastered: false,
        studyCount: 0,
        correctCount: 0,
        dateAdded: new Date().toISOString()
    });

    saveData();
    closeAddWordModal();
    renderVocabularyList();
    updateUI();
}

// 설정 모달
function openSettingsModal() {
    document.getElementById('settingsModal').classList.add('active');
    document.getElementById('targetCertification').value = AppState.settings.targetCertification;
    document.getElementById('dailyGoal').value = AppState.settings.dailyGoal;
    document.getElementById('ttsLanguage').value = AppState.settings.ttsLanguage;
    document.getElementById('naverClientId').value = AppState.settings.naverClientId || '';
    document.getElementById('naverClientSecret').value = AppState.settings.naverClientSecret || '';
}

function closeSettingsModal() {
    document.getElementById('settingsModal').classList.remove('active');
}

function saveSettings() {
    AppState.settings.targetCertification = document.getElementById('targetCertification').value;
    AppState.settings.dailyGoal = parseInt(document.getElementById('dailyGoal').value);
    AppState.settings.ttsLanguage = document.getElementById('ttsLanguage').value;
    AppState.settings.naverClientId = document.getElementById('naverClientId').value.trim();
    AppState.settings.naverClientSecret = document.getElementById('naverClientSecret').value.trim();
    
    AppState.dailyProgress.goal = AppState.settings.dailyGoal;
    
    saveData();
    closeSettingsModal();
    updateUI();
    
    if (AppState.settings.naverClientId && AppState.settings.naverClientSecret) {
        alert('네이버 API 키가 저장되었습니다. 일본어 사전 검색을 사용할 수 있습니다.');
    }
}

// 진행상황 페이지 업데이트
function updateProgressPage() {
    const totalWords = AppState.vocabulary.length;
    const learnedWords = AppState.vocabulary.filter(w => w.mastered).length;
    const learningWords = AppState.vocabulary.filter(w => !w.mastered && w.studyCount > 0).length;

    document.getElementById('progressTotalWords').textContent = totalWords;
    document.getElementById('progressLearnedWords').textContent = learnedWords;
    document.getElementById('progressLearningWords').textContent = learningWords;

    // 언어별 통계
    const langStats = {};
    AppState.vocabulary.forEach(w => {
        if (!langStats[w.language]) {
            langStats[w.language] = { total: 0, learned: 0 };
        }
        langStats[w.language].total++;
        if (w.mastered) langStats[w.language].learned++;
    });

    const langStatsDiv = document.getElementById('languageStats');
    langStatsDiv.innerHTML = Object.entries(langStats).map(([lang, stats]) => `
        <div class="stat-item">
            <span>${getLanguageName(lang)}:</span>
            <span>${stats.learned} / ${stats.total}</span>
        </div>
    `).join('');

    // 최근 활동
    const recentActivity = AppState.searchHistory.slice(0, 5);
    const activityDiv = document.getElementById('recentActivity');
    if (recentActivity.length === 0) {
        activityDiv.innerHTML = '<p style="color: var(--text-secondary);">최근 활동이 없습니다.</p>';
    } else {
        activityDiv.innerHTML = recentActivity.map(entry => `
            <div class="stat-item">
                <span>${entry.word} 검색</span>
                <span>${new Date(entry.date).toLocaleDateString()}</span>
            </div>
        `).join('');
    }
}

function getLanguageName(code) {
    const names = {
        'en': '영어',
        'ja': '일본어',
        'zh': '중국어',
        'es': '스페인어'
    };
    return names[code] || code;
}

// 전역 함수 (HTML에서 호출)
window.showPage = showPage;
window.startMockTest = startMockTest;
window.startLevelTest = startLevelTest;
window.selectQuizOption = selectQuizOption;
window.selectTestOption = selectTestOption;
window.showWordDetail = showWordDetail;
window.searchFromHistory = searchFromHistory;
window.deleteWord = deleteWord;

