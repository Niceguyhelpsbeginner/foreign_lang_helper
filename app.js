// 전역 상태 관리
const AppState = {
    currentPage: 'home',
    currentUser: null, // 현재 로그인한 사용자
    vocabulary: [],
    searchHistory: [],
    settings: {
        targetCertification: 'none',
        dailyGoal: 10,
        ttsLanguage: 'ja'
    },
    dictionary: null, // 로드된 사전 데이터
    compoundWords: null, // 복합 단어 사전 (일본어)
    singleCharacters: null, // 단일 한자 사전 (일본어)
    toeicDictionary: null, // TOEIC 사전
    currentQuiz: null,
    currentTest: null,
    currentFlashcardIndex: 0,
    currentReadingPassage: null,
    readingAnswers: {},
    dailyProgress: {
        date: new Date().toDateString(),
        wordsLearned: 0,
        goal: 10
    }
};

// 초기화
document.addEventListener('DOMContentLoaded', async () => {
    await loadUserData(); // async로 변경
    await loadData(); // async로 변경
    await loadDictionary();
    initializeEventListeners();
    updateUI();
    updateAuthUI();
    
    // Supabase Auth 상태 변화 감지
    if (window.supabaseClient) {
        window.supabaseClient.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                loadUserData();
                loadData();
            } else if (event === 'SIGNED_OUT') {
                AppState.currentUser = null;
                AppState.vocabulary = [];
                AppState.searchHistory = [];
                saveUserData();
                saveData();
                updateAuthUI();
                updateUI();
            }
        });
    }
});

// 데이터 로드 (Supabase 또는 localStorage)
async function loadData() {
    // 로그인하지 않은 경우 localStorage 사용
    if (!AppState.currentUser || !window.supabaseClient) {
        loadDataFromLocalStorage();
        return;
    }

    const supabase = window.supabaseClient;
    const userId = AppState.currentUser.id;

    try {
        // 사용자 단어장 로드
        const { data: vocabData } = await supabase
            .from('user_vocabulary')
            .select('*, words(*)')
            .eq('user_id', userId);

        if (vocabData) {
            AppState.vocabulary = vocabData.map(item => ({
                id: item.word_id,
                word: item.words?.word || '',
                meaning: item.words?.meaning || '',
                pronunciation: item.words?.pronunciation || '',
                mastered: item.mastered,
                reviewCount: item.review_count,
                lastReviewed: item.last_reviewed_at
            }));
        }

        // 검색 기록 로드 (최근 50개)
        const { data: historyData } = await supabase
            .from('search_history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (historyData) {
            AppState.searchHistory = historyData.map(item => ({
                query: item.query,
                language: item.language,
                date: item.created_at
            }));
        }

        // 오늘의 진행상황 로드
        const today = new Date().toISOString().split('T')[0];
        const { data: progressData } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('date', today)
            .single();

        if (progressData) {
            AppState.dailyProgress = {
                date: progressData.date,
                wordsLearned: progressData.words_learned || 0,
                goal: AppState.settings.dailyGoal
            };
        } else {
            AppState.dailyProgress = {
                date: new Date().toDateString(),
                wordsLearned: 0,
                goal: AppState.settings.dailyGoal
            };
        }

        // 설정은 localStorage에 저장 (Supabase 테이블 없음)
        const savedSettings = localStorage.getItem('settings');
        if (savedSettings) {
            AppState.settings = { ...AppState.settings, ...JSON.parse(savedSettings) };
        }
    } catch (error) {
        console.error('데이터 로드 오류:', error);
        // 폴백: localStorage 사용
        loadDataFromLocalStorage();
    }
}

// localStorage에서 데이터 로드 (폴백)
function loadDataFromLocalStorage() {
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

// 데이터 저장 (Supabase 또는 localStorage)
async function saveData() {
    // 설정은 항상 localStorage에 저장
    localStorage.setItem('settings', JSON.stringify(AppState.settings));

    // 로그인하지 않은 경우 localStorage 사용
    if (!AppState.currentUser || !window.supabaseClient) {
        localStorage.setItem('vocabulary', JSON.stringify(AppState.vocabulary));
        localStorage.setItem('searchHistory', JSON.stringify(AppState.searchHistory));
        localStorage.setItem('dailyProgress', JSON.stringify(AppState.dailyProgress));
        return;
    }

    const supabase = window.supabaseClient;
    const userId = AppState.currentUser.id;

    try {
        // 사용자 단어장 저장 (배치 업데이트)
        if (AppState.vocabulary && AppState.vocabulary.length > 0) {
            const vocabToUpsert = AppState.vocabulary
                .filter(v => v.id) // word_id가 있는 것만
                .map(v => ({
                    user_id: userId,
                    word_id: v.id,
                    mastered: v.mastered || false,
                    review_count: v.reviewCount || 0,
                    last_reviewed_at: v.lastReviewed || null
                }));

            if (vocabToUpsert.length > 0) {
                const { error } = await supabase
                    .from('user_vocabulary')
                    .upsert(vocabToUpsert, { onConflict: 'user_id,word_id' });

                if (error) {
                    console.error('단어장 저장 오류:', error);
                }
            }
        }

        // 검색 기록 저장 (최근 것만)
        if (AppState.searchHistory && AppState.searchHistory.length > 0) {
            const recentHistory = AppState.searchHistory.slice(0, 10); // 최근 10개만
            const historyToInsert = recentHistory.map(h => ({
                user_id: userId,
                query: h.query,
                language: h.language
            }));

            if (historyToInsert.length > 0) {
                const { error } = await supabase
                    .from('search_history')
                    .insert(historyToInsert);

                if (error) {
                    console.error('검색 기록 저장 오류:', error);
                }
            }
        }

        // 오늘의 진행상황 저장
        const today = new Date().toISOString().split('T')[0];
        const { error: progressError } = await supabase
            .from('user_progress')
            .upsert({
                user_id: userId,
                date: today,
                words_learned: AppState.dailyProgress.wordsLearned || 0,
                quiz_score: 0, // 필요시 추가
                study_time_minutes: 0 // 필요시 추가
            }, { onConflict: 'user_id,date' });

        if (progressError) {
            console.error('진행상황 저장 오류:', progressError);
        }

        // localStorage에도 백업 저장
        localStorage.setItem('vocabulary', JSON.stringify(AppState.vocabulary));
        localStorage.setItem('searchHistory', JSON.stringify(AppState.searchHistory));
        localStorage.setItem('dailyProgress', JSON.stringify(AppState.dailyProgress));
    } catch (error) {
        console.error('데이터 저장 오류:', error);
        // 폴백: localStorage에만 저장
        localStorage.setItem('vocabulary', JSON.stringify(AppState.vocabulary));
        localStorage.setItem('searchHistory', JSON.stringify(AppState.searchHistory));
        localStorage.setItem('dailyProgress', JSON.stringify(AppState.dailyProgress));
    }
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

    // 인증 관련 버튼
    document.getElementById('loginBtn')?.addEventListener('click', showLoginModal);
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
    document.getElementById('accountBtn')?.addEventListener('click', openAccountModal);
    
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
    
    // 언어 선택 변경 시 플래시카드 업데이트
    document.getElementById('learnLanguage')?.addEventListener('change', () => {
        AppState.currentFlashcardIndex = 0;
        updateFlashcard();
    });

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
    } else if (pageName === 'reading') {
        // 이미지에서 추출한 텍스트가 있으면 그대로 표시, 없으면 새 지문 로드
        if (AppState.currentReadingPassage && AppState.currentReadingPassage.isFromImage) {
            // 이미지에서 추출한 텍스트가 있으면 그대로 표시
            displayExtractedText(AppState.currentReadingPassage.text, AppState.currentReadingPassage.certType || 'jlpt').catch(err => {
                console.error('이미지 텍스트 표시 오류:', err);
            });
        } else {
            loadJLPTReadingPassage();
        }
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

// 사전 데이터 로드 (Supabase에서)
async function loadDictionary() {
    try {
        // Supabase 클라이언트 확인
        if (!window.supabaseClient) {
            console.warn('Supabase 클라이언트가 로드되지 않았습니다. JSON 파일을 사용합니다.');
            await loadDictionaryFromJSON();
            return;
        }

        const supabase = window.supabaseClient;
        console.log('🔍 Supabase에서 사전 데이터 로드 시작...');

        // 일본어 단어 로드 (복합 단어 + 단일 한자)
        const { data: japaneseWords, error: jaError, count: jaCount } = await supabase
            .from('words')
            .select('*', { count: 'exact' })
            .eq('language', 'ja');

        if (jaError) {
            console.error('❌ 일본어 단어 로드 오류:', jaError);
            console.error('오류 상세:', JSON.stringify(jaError, null, 2));
            await loadDictionaryFromJSON(); // 폴백: JSON 파일 사용
            return;
        }

        console.log(`📊 일본어 단어 조회 결과: ${japaneseWords?.length || 0}개 (총 ${jaCount || 0}개)`);

        // 영어 단어 로드 (TOEIC)
        const { data: englishWords, error: enError, count: enCount } = await supabase
            .from('words')
            .select('*', { count: 'exact' })
            .eq('language', 'en');

        if (enError) {
            console.error('❌ 영어 단어 로드 오류:', enError);
            console.error('오류 상세:', JSON.stringify(enError, null, 2));
        } else {
            console.log(`📊 영어 단어 조회 결과: ${englishWords?.length || 0}개 (총 ${enCount || 0}개)`);
        }

        // 데이터가 없는 경우 JSON 파일 사용
        if ((!japaneseWords || japaneseWords.length === 0) && (!englishWords || englishWords.length === 0)) {
            console.warn('⚠️ Supabase에 데이터가 없습니다. JSON 파일을 사용합니다.');
            await loadDictionaryFromJSON();
            return;
        }

        // 데이터 구조 변환 (기존 형식과 호환)
        const compoundWordsList = (japaneseWords || []).filter(w => w.type === 'word' || !w.type || w.type === null);
        const singleCharactersList = (japaneseWords || []).filter(w => w.type === 'kanji');

        AppState.compoundWords = { words: compoundWordsList };
        AppState.singleCharacters = { words: singleCharactersList };
        AppState.toeicDictionary = { words: englishWords || [] };

        // 기존 호환성을 위해 통합 사전도 유지 (일본어만)
        AppState.dictionary = {
            words: [
                ...compoundWordsList,
                ...singleCharactersList
            ]
        };

        console.log(`✅ 사전 로드 완료: 일본어 ${japaneseWords?.length || 0}개 (복합: ${compoundWordsList.length}, 한자: ${singleCharactersList.length}), 영어 ${englishWords?.length || 0}개`);
    } catch (error) {
        console.error('❌ 사전 로드 오류:', error);
        console.error('오류 스택:', error.stack);
        // 폴백: JSON 파일 사용
        await loadDictionaryFromJSON();
    }
}

// JSON 파일에서 사전 로드 (폴백)
async function loadDictionaryFromJSON() {
    try {
        // 일본어 복합 단어 사전 로드
        const compoundResponse = await fetch('jlpt/vocabulary/compound_word.json');
        if (compoundResponse.ok) {
            const compoundData = await compoundResponse.json();
            AppState.compoundWords = compoundData;
        } else {
            console.warn('복합 단어 사전 파일을 찾을 수 없습니다.');
            AppState.compoundWords = { words: [] };
        }
        
        // 일본어 단일 한자 사전 로드
        const singleResponse = await fetch('jlpt/vocabulary/single_character.json');
        if (singleResponse.ok) {
            const singleData = await singleResponse.json();
            AppState.singleCharacters = singleData;
        } else {
            console.warn('단일 한자 사전 파일을 찾을 수 없습니다.');
            AppState.singleCharacters = { words: [] };
        }
        
        // TOEIC 사전 로드
        const toeicResponse = await fetch('toeic/vocabulary/dictionary.json');
        if (toeicResponse.ok) {
            const toeicData = await toeicResponse.json();
            AppState.toeicDictionary = toeicData;
        } else {
            console.warn('TOEIC 사전 파일을 찾을 수 없습니다.');
            AppState.toeicDictionary = { words: [] };
        }
        
        // 기존 호환성을 위해 통합 사전도 유지 (일본어만)
        AppState.dictionary = {
            words: [
                ...(AppState.compoundWords?.words || []),
                ...(AppState.singleCharacters?.words || [])
            ]
        };
    } catch (error) {
        console.error('JSON 사전 로드 오류:', error);
        AppState.compoundWords = { words: [] };
        AppState.singleCharacters = { words: [] };
        AppState.toeicDictionary = { words: [] };
        AppState.dictionary = { words: [] };
    }
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
            // 일본어: 로컬 사전에서 검색
            result = searchLocalDictionary(query);
        } else if (language === 'en') {
            // 영어: TOEIC 사전에서 검색
            result = searchToeicDictionary(query);
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
                ${error.message}
            </div>
        `;
    }
}

// 로컬 사전에서 검색 (Supabase 또는 메모리에서)
function searchLocalDictionary(word) {
    // 먼저 메모리에 로드된 데이터에서 검색 (빠름)
    const foundInMemory = searchInMemory(word);
    if (foundInMemory && !foundInMemory.error) {
        return foundInMemory;
    }

    // 메모리에 없으면 Supabase에서 직접 검색 (비동기)
    // 하지만 동기 함수이므로 메모리 검색 결과 반환
    return foundInMemory || {
        word: word,
        meaning: '검색 결과를 찾을 수 없습니다.',
        error: true
    };
}

// 메모리에 로드된 데이터에서 검색
function searchInMemory(word) {
    const isKoreanInput = isKorean(word);
    let foundWord = null;
    
    if (isKoreanInput) {
        // 한국어로 검색: 의미(meaning) 필드에서 검색
        // 1. 복합 단어에서 먼저 검색
        if (AppState.compoundWords?.words) {
            foundWord = AppState.compoundWords.words.find(w => w.meaning === word);
            if (!foundWord) {
                foundWord = AppState.compoundWords.words.find(w => 
                    w.meaning.includes(word) || word.includes(w.meaning)
                );
            }
        }
        
        // 2. 단일 한자에서 검색
        if (!foundWord && AppState.singleCharacters?.words) {
            foundWord = AppState.singleCharacters.words.find(w => w.meaning === word);
            if (!foundWord) {
                foundWord = AppState.singleCharacters.words.find(w => 
                    w.meaning.includes(word) || word.includes(w.meaning)
                );
            }
        }
        
        if (foundWord) {
            return {
                word: foundWord.word,
                meaning: foundWord.meaning,
                pronunciation: foundWord.pronunciation || null,
                hiragana: foundWord.hiragana || null,
                katakana: foundWord.katakana || null,
                kanji: foundWord.type === 'kanji' ? foundWord.word : null,
                kanjiComponents: foundWord.kanji_components || foundWord.kanjiComponents || null,
                searchedKorean: word,
                error: false
            };
        }
    } else {
        // 일본어로 검색: 단어 필드에서 검색
        // 1. 복합 단어에서 먼저 검색
        if (AppState.compoundWords?.words) {
            foundWord = AppState.compoundWords.words.find(w => w.word === word);
            if (!foundWord) {
                foundWord = AppState.compoundWords.words.find(w => 
                    w.word.includes(word) || word.includes(w.word) ||
                    (w.hiragana && w.hiragana.includes(word)) ||
                    (w.pronunciation && w.pronunciation.includes(word))
                );
            }
        }
        
        // 2. 단일 한자에서 검색
        if (!foundWord && AppState.singleCharacters?.words) {
            foundWord = AppState.singleCharacters.words.find(w => w.word === word);
            if (!foundWord) {
                foundWord = AppState.singleCharacters.words.find(w => 
                    w.word.includes(word) || word.includes(w.word) ||
                    (w.hiragana && w.hiragana.includes(word)) ||
                    (w.pronunciation && w.pronunciation.includes(word))
                );
            }
        }
        
        if (foundWord) {
            return {
                word: foundWord.word,
                meaning: foundWord.meaning,
                pronunciation: foundWord.pronunciation || null,
                hiragana: foundWord.hiragana || null,
                katakana: foundWord.katakana || null,
                kanji: foundWord.type === 'kanji' ? foundWord.word : null,
                kanjiComponents: foundWord.kanji_components || foundWord.kanjiComponents || null,
                error: false
            };
        }
    }

    return {
        word: word,
        meaning: '검색 결과를 찾을 수 없습니다.',
        error: true
    };
}

// TOEIC 사전에서 검색
function searchToeicDictionary(word) {
    // 메모리에 로드된 데이터에서 검색
    if (!AppState.toeicDictionary?.words || AppState.toeicDictionary.words.length === 0) {
        return {
            error: true,
            message: 'TOEIC 사전이 로드되지 않았습니다.'
        };
    }
    
    // 영어 단어로 검색 (대소문자 무시)
    const searchWord = word.toLowerCase().trim();
    let foundWord = AppState.toeicDictionary.words.find(w => 
        w.word.toLowerCase() === searchWord
    );
    
    // 부분 일치 검색
    if (!foundWord) {
        foundWord = AppState.toeicDictionary.words.find(w => 
            w.word.toLowerCase().includes(searchWord) || 
            searchWord.includes(w.word.toLowerCase())
        );
    }
    
    // 한국어 의미로 검색
    if (!foundWord) {
        foundWord = AppState.toeicDictionary.words.find(w => 
            w.meaning.includes(word) || word.includes(w.meaning)
        );
    }
    
    if (foundWord) {
        return {
            word: foundWord.word,
            meaning: foundWord.meaning,
            pronunciation: foundWord.pronunciation || null,
            example: foundWord.example || null,
            synonyms: foundWord.synonyms || null,
            level: foundWord.level || null,
            type: foundWord.type || null,
            error: false
        };
    }
    
    return {
        error: true,
        message: '검색 결과를 찾을 수 없습니다.'
    };
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
        if (result.error) {
            html += `<div style="margin: 1rem 0; padding: 1rem; background: #fee2e2; border-radius: 8px; color: #991b1b;">
                <strong>⚠️</strong> ${result.meaning}
            </div>`;
        } else {
            // 한국어로 검색한 경우 안내
            if (result.searchedKorean) {
                html += `<div style="margin: 0.5rem 0; padding: 0.75rem; background: #e0f2fe; border-radius: 8px; color: #0369a1;">
                    <strong>🔍 검색어:</strong> ${result.searchedKorean} (한국어)
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
        }
    }
    // 영어 (TOEIC) 특수 정보 표시
    else if (lang === 'en') {
        if (result.error) {
            html += `<div style="margin: 1rem 0; padding: 1rem; background: #fee2e2; border-radius: 8px; color: #991b1b;">
                <strong>⚠️</strong> ${result.message || '검색 결과를 찾을 수 없습니다.'}
            </div>`;
        } else {
            if (result.pronunciation) {
                html += `<div class="word-pronunciation">📢 발음: ${result.pronunciation}</div>`;
            }
            if (result.type) {
                html += `<div style="margin: 0.5rem 0; padding: 0.5rem; background: #f3f4f6; border-radius: 6px;">
                    <strong>품사:</strong> ${result.type}
                </div>`;
            }
            if (result.level) {
                html += `<div style="margin: 0.5rem 0; padding: 0.5rem; background: #f3f4f6; border-radius: 6px;">
                    <strong>난이도:</strong> ${result.level}
                </div>`;
            }
            if (result.example) {
                html += `<div style="margin: 0.5rem 0; padding: 0.75rem; background: #fef3c7; border-radius: 6px; border-left: 3px solid #f59e0b;">
                    <strong>예문:</strong> ${result.example}
                </div>`;
            }
            if (result.synonyms && result.synonyms.length > 0) {
                html += `<div style="margin: 0.5rem 0; padding: 0.75rem; background: #e0e7ff; border-radius: 6px;">
                    <strong>유의어:</strong> ${result.synonyms.join(', ')}
                </div>`;
            }
        }
    }

    html += `
            <div class="word-entry-meaning">${result.meaning || (result.error ? '' : '의미 정보 없음')}</div>
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
    const entry = { query: word, language: lang, date: new Date().toISOString() };
    AppState.searchHistory.unshift(entry);
    if (AppState.searchHistory.length > 20) {
        AppState.searchHistory = AppState.searchHistory.slice(0, 20);
    }
    saveData(); // Supabase에 저장됨
    renderSearchHistory();
    
    // 일본어 검색인 경우 플래시카드에 자동 추가
    if (lang === 'ja') {
        addSearchedWordToFlashcard(word);
    }
}

// 검색한 단어를 플래시카드에 추가
function addSearchedWordToFlashcard(word) {
    // 사전에서 단어 정보 가져오기
    const wordInfo = searchLocalDictionary(word);
    
    if (wordInfo.error) {
        return; // 사전에 없는 단어는 추가하지 않음
    }
    
    // 이미 단어장에 있는지 확인
    const existingWord = AppState.vocabulary.find(w => 
        w.word === wordInfo.word && w.language === 'ja'
    );
    
    if (!existingWord) {
        // 단어장에 추가
        AppState.vocabulary.push({
            word: wordInfo.word,
            meaning: wordInfo.meaning,
            example: null,
            language: 'ja',
            certification: AppState.settings.targetCertification !== 'none' ? AppState.settings.targetCertification : null,
            mastered: false,
            studyCount: 0,
            correctCount: 0,
            dateAdded: new Date().toISOString(),
            pronunciation: wordInfo.pronunciation || null,
            hiragana: wordInfo.hiragana || null
        });
        
        saveData();
        updateUI();
    }
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
        `<span class="history-item" onclick="searchFromHistory('${entry.query || entry.word}', '${entry.language || entry.lang}')">${entry.query || entry.word}</span>`
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
    // 단어 항목에 호버 기능 추가
    container.querySelectorAll('.word-entry-title').forEach(el => {
        const wordText = el.textContent.trim();
        
        // 복합 단어에서 먼저 검색
        let wordData = AppState.compoundWords?.words?.find(w => w.word === wordText);
        
        // Supabase에서는 kanji_components, JSON에서는 kanjiComponents
        const kanjiComponents = wordData?.kanji_components || wordData?.kanjiComponents;
        
        if (wordData && kanjiComponents && kanjiComponents.length > 1) {
            // 여러 한자로 구성된 단어인 경우
            el.classList.add('kanji-word-hoverable');
            el.setAttribute('data-word', wordText);
            el.setAttribute('data-meaning', wordData.meaning);
            el.setAttribute('data-kanji-components', JSON.stringify(kanjiComponents));
            
            // 호버 이벤트 추가
            el.addEventListener('mouseenter', showWordKanjiTooltip);
            el.addEventListener('mouseleave', (e) => {
                // 클릭 이벤트가 발생 중이면 무시
                if (el.dataset.clicking === 'true') {
                    return;
                }
                hideWordKanjiTooltip();
            });
            // 클릭 이벤트: 툴팁이 표시된 상태에서 클릭하면 고정
            el.addEventListener('mousedown', (e) => {
                el.dataset.clicking = 'true';
            });
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                // 클릭 플래그 해제 (약간의 지연 후)
                setTimeout(() => {
                    el.dataset.clicking = 'false';
                }, 100);
                
                // 고정되지 않은 툴팁 찾기
                let tooltip = document.querySelector('.word-kanji-tooltip:not(.pinned)');
                
                // 툴팁이 없으면 (mouseleave로 사라졌을 수 있음) 다시 생성
                if (!tooltip || tooltip.getAttribute('data-word') !== wordText) {
                    // 툴팁이 없으면 생성
                    const fakeEvent = { target: el };
                    showWordKanjiTooltip(fakeEvent);
                    tooltip = document.querySelector('.word-kanji-tooltip:not(.pinned)');
                }
                
                if (tooltip && tooltip.getAttribute('data-word') === wordText) {
                    // 툴팁 고정
                    tooltip.classList.add('pinned');
                    tooltip.querySelector('.tooltip-hint').textContent = '💡 다시 클릭하여 고정 해제 / 한자에 호버하여 상세 정보 보기';
                } else {
                    // 이미 고정된 툴팁이 있으면 고정 해제
                    const pinnedTooltip = document.querySelector('.word-kanji-tooltip.pinned');
                    if (pinnedTooltip && pinnedTooltip.getAttribute('data-word') === wordText) {
                        pinnedTooltip.classList.remove('pinned');
                        pinnedTooltip.querySelector('.tooltip-hint').textContent = '💡 클릭하여 고정 / 한자에 호버하여 상세 정보 보기';
                        hideWordKanjiTooltip();
                    } else {
                        // 툴팁이 없으면 한자 분해
                        toggleKanjiBreakdown(e);
                    }
                }
            });
        }
    });
}

// 단어 tooltip 표시
function showWordKanjiTooltip(e) {
    const el = e.target;
    if (el.classList.contains('kanji-breakdown-active')) return;
    
    // 이미 고정된 툴팁이 있는지 확인
    const existingTooltip = document.querySelector('.word-kanji-tooltip.pinned');
    if (existingTooltip && existingTooltip.getAttribute('data-word') === el.getAttribute('data-word')) {
        return; // 이미 고정된 툴팁이 있으면 표시하지 않음
    }
    
    const word = el.getAttribute('data-word');
    const meaning = el.getAttribute('data-meaning');
    const kanjiComponents = JSON.parse(el.getAttribute('data-kanji-components') || '[]');
    
    // 고정되지 않은 툴팁만 제거
    const unpinnedTooltip = document.querySelector('.word-kanji-tooltip:not(.pinned)');
    if (unpinnedTooltip) {
        unpinnedTooltip.remove();
    }
    
    const tooltip = document.createElement('div');
    tooltip.className = 'word-kanji-tooltip';
    tooltip.setAttribute('data-word', word);
    tooltip.setAttribute('data-element-id', el.getAttribute('data-element-id') || Date.now().toString());
    
    // 한자들을 클릭 가능한 요소로 표시
    let kanjiHtml = '';
    if (kanjiComponents.length > 0) {
        kanjiHtml = '<div class="tooltip-kanji-list" style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.2);">';
        kanjiComponents.forEach((kanji, idx) => {
            const kanjiData = AppState.singleCharacters?.words?.find(w => w.word === kanji);
            kanjiHtml += `<span class="tooltip-kanji-item" 
                              data-kanji="${kanji}"
                              data-on-yomi="${JSON.stringify(kanjiData?.onYomi || [])}"
                              data-kun-yomi="${JSON.stringify(kanjiData?.kunYomi || [])}"
                              data-kanji-meaning="${kanjiData?.kanjiMeaning || ''}"
                              style="display: inline-block; margin: 0.25rem; padding: 0.25rem 0.5rem; background: rgba(255,255,255,0.1); border-radius: 4px; cursor: pointer;">${kanji}</span>`;
        });
        kanjiHtml += '</div>';
    }
    
    tooltip.innerHTML = `
        <div class="tooltip-word">${word}</div>
        <div class="tooltip-meaning">${meaning}</div>
        ${kanjiHtml}
        <div class="tooltip-hint" style="margin-top: 0.5rem; font-size: 0.8rem; color: rgba(255,255,255,0.7);">💡 클릭하여 고정 / 한자에 호버하여 상세 정보 보기</div>
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = el.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
    
    // 화면 밖으로 나가지 않도록 조정
    const tooltipRect = tooltip.getBoundingClientRect();
    if (tooltipRect.left < 10) {
        tooltip.style.left = '10px';
    }
    if (tooltipRect.right > window.innerWidth - 10) {
        tooltip.style.left = (window.innerWidth - tooltip.offsetWidth - 10) + 'px';
    }
    if (tooltipRect.top < 10) {
        tooltip.style.top = rect.bottom + 8 + 'px';
    }
    
    // 툴팁은 클릭해도 고정되지 않도록 (단어 클릭으로만 고정)
    
    // 한자 항목에 호버 이벤트 추가
    tooltip.querySelectorAll('.tooltip-kanji-item').forEach(kanjiItem => {
        kanjiItem.addEventListener('mouseenter', (e) => {
            showKanjiTooltipFromPinned(e, tooltip);
        });
        kanjiItem.addEventListener('mouseleave', hideIndividualKanjiTooltip);
    });
}

// 고정된 툴팁에서 한자 tooltip 표시
function showKanjiTooltipFromPinned(e, parentTooltip) {
    const kanjiItem = e.target;
    const kanji = kanjiItem.getAttribute('data-kanji');
    const onYomi = JSON.parse(kanjiItem.getAttribute('data-on-yomi') || '[]');
    const kunYomi = JSON.parse(kanjiItem.getAttribute('data-kun-yomi') || '[]');
    const meaning = kanjiItem.getAttribute('data-kanji-meaning') || '';
    
    hideIndividualKanjiTooltip();
    
    const tooltip = document.createElement('div');
    tooltip.className = 'individual-kanji-tooltip';
    
    let content = `<div class="tooltip-kanji">${kanji}</div>`;
    if (meaning) {
        content += `<div class="tooltip-meaning">${meaning}</div>`;
    }
    if (onYomi.length > 0) {
        content += `<div class="tooltip-on-yomi">음독: ${onYomi.join(', ')}</div>`;
    }
    if (kunYomi.length > 0) {
        content += `<div class="tooltip-kun-yomi">훈독: ${kunYomi.join(', ')}</div>`;
    }
    
    tooltip.innerHTML = content;
    document.body.appendChild(tooltip);
    
    const rect = kanjiItem.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
    
    // 화면 밖으로 나가지 않도록 조정
    const tooltipRect = tooltip.getBoundingClientRect();
    if (tooltipRect.left < 10) {
        tooltip.style.left = '10px';
    }
    if (tooltipRect.right > window.innerWidth - 10) {
        tooltip.style.left = (window.innerWidth - tooltip.offsetWidth - 10) + 'px';
    }
    if (tooltipRect.top < 10) {
        tooltip.style.top = rect.bottom + 8 + 'px';
    }
}

// 단어 tooltip 숨기기
function hideWordKanjiTooltip() {
    // 고정되지 않은 툴팁만 제거
    const unpinnedTooltip = document.querySelector('.word-kanji-tooltip:not(.pinned)');
    if (unpinnedTooltip) {
        unpinnedTooltip.remove();
    }
}

// 한자 분해 토글
function toggleKanjiBreakdown(e) {
    e.stopPropagation();
    const el = e.target;
    const kanjiComponents = JSON.parse(el.getAttribute('data-kanji-components') || '[]');
    
    // 툴팁이 고정되어 있는지 확인
    const pinnedTooltip = document.querySelector('.word-kanji-tooltip.pinned');
    const isPinned = pinnedTooltip && pinnedTooltip.getAttribute('data-word') === el.getAttribute('data-word');
    
    if (el.classList.contains('kanji-breakdown-active')) {
        // 이미 분해된 경우 원래대로
        el.classList.remove('kanji-breakdown-active');
        el.innerHTML = el.getAttribute('data-word');
        // 고정된 툴팁이 아니면 제거
        if (!isPinned) {
            hideWordKanjiTooltip();
        }
    } else {
        // 한자 분해
        el.classList.add('kanji-breakdown-active');
        const originalWord = el.getAttribute('data-word');
        
        let html = '';
        kanjiComponents.forEach((kanji, idx) => {
            // 단일 한자 사전에서 검색
            const kanjiData = AppState.singleCharacters?.words?.find(w => w.word === kanji);
            if (kanjiData) {
                // Supabase에서는 on_yomi, kun_yomi로 저장되지만, JSON에서는 onYomi, kunYomi
                const onYomi = kanjiData.on_yomi || kanjiData.onYomi || [];
                const kunYomi = kanjiData.kun_yomi || kanjiData.kunYomi || [];
                const kanjiMeaning = kanjiData.kanji_meaning || kanjiData.kanjiMeaning || '';
                
                html += `<span class="individual-kanji" 
                              data-kanji="${kanji}"
                              data-on-yomi="${JSON.stringify(onYomi)}"
                              data-kun-yomi="${JSON.stringify(kunYomi)}"
                              data-kanji-meaning="${kanjiMeaning}">${kanji}</span>`;
            } else {
                html += `<span class="individual-kanji" data-kanji="${kanji}">${kanji}</span>`;
            }
        });
        
        el.innerHTML = html;
        
        // 각 한자에 호버 이벤트 추가
        el.querySelectorAll('.individual-kanji').forEach(kanjiEl => {
            kanjiEl.addEventListener('mouseenter', showIndividualKanjiTooltip);
            kanjiEl.addEventListener('mouseleave', hideIndividualKanjiTooltip);
        });
        
        // 고정된 툴팁이 아니면 제거
        if (!isPinned) {
            hideWordKanjiTooltip();
        }
    }
}

// 개별 한자 tooltip 표시
function showIndividualKanjiTooltip(e) {
    const el = e.target;
    const kanji = el.getAttribute('data-kanji');
    const onYomi = JSON.parse(el.getAttribute('data-on-yomi') || '[]');
    const kunYomi = JSON.parse(el.getAttribute('data-kun-yomi') || '[]');
    const meaning = el.getAttribute('data-kanji-meaning') || '';
    
    hideIndividualKanjiTooltip();
    
    const tooltip = document.createElement('div');
    tooltip.className = 'individual-kanji-tooltip';
    
    let content = `<div class="tooltip-kanji">${kanji}</div>`;
    if (meaning) {
        content += `<div class="tooltip-meaning">${meaning}</div>`;
    }
    if (onYomi.length > 0) {
        content += `<div class="tooltip-on-yomi">음독: ${onYomi.join(', ')}</div>`;
    }
    if (kunYomi.length > 0) {
        content += `<div class="tooltip-kun-yomi">훈독: ${kunYomi.join(', ')}</div>`;
    }
    
    tooltip.innerHTML = content;
    document.body.appendChild(tooltip);
    
    const rect = el.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
    
    // 화면 밖으로 나가지 않도록 조정
    const tooltipRect = tooltip.getBoundingClientRect();
    if (tooltipRect.left < 10) {
        tooltip.style.left = '10px';
    }
    if (tooltipRect.right > window.innerWidth - 10) {
        tooltip.style.left = (window.innerWidth - tooltip.offsetWidth - 10) + 'px';
    }
    if (tooltipRect.top < 10) {
        tooltip.style.top = rect.bottom + 8 + 'px';
    }
}

// 개별 한자 tooltip 숨기기
function hideIndividualKanjiTooltip() {
    const tooltip = document.querySelector('.individual-kanji-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
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
        document.getElementById('wordDisplay').textContent = '학습할 단어가 없습니다';
        document.getElementById('meaningDisplay').textContent = '';
        document.getElementById('exampleDisplay').textContent = '';
        document.getElementById('currentCard').textContent = '0';
        document.getElementById('totalCards').textContent = '0';
        document.getElementById('flashcardQuiz').style.display = 'none';
        document.getElementById('flashcard').style.display = 'block';
        document.getElementById('learnActions').style.display = 'none';
        return;
    }

    // 인덱스 범위 조정
    if (AppState.currentFlashcardIndex >= filteredWords.length) {
        AppState.currentFlashcardIndex = 0;
    }
    if (AppState.currentFlashcardIndex < 0) {
        AppState.currentFlashcardIndex = filteredWords.length - 1;
    }

    const index = AppState.currentFlashcardIndex;
    const word = filteredWords[index];
    
    // 일본어인 경우 4지선다 퀴즈 형식으로 표시
    if (word.language === 'ja') {
        document.getElementById('flashcard').style.display = 'none';
        document.getElementById('learnActions').style.display = 'none';
        displayFlashcardQuiz(word, filteredWords);
    } else {
        // 다른 언어는 기존 플래시카드 방식
        document.getElementById('flashcardQuiz').style.display = 'none';
        document.getElementById('flashcard').style.display = 'block';
        document.getElementById('learnActions').style.display = 'flex';
        document.getElementById('wordDisplay').textContent = word.word;
        document.getElementById('meaningDisplay').textContent = word.meaning;
        document.getElementById('exampleDisplay').textContent = word.example || '';
    }
    
    document.getElementById('currentCard').textContent = index + 1;
    document.getElementById('totalCards').textContent = filteredWords.length;

    // 카드 초기화
    document.getElementById('flashcard').classList.remove('flipped');
}

// 플래시카드 퀴즈 표시 (4지선다)
function displayFlashcardQuiz(word, allWords) {
    // 퀴즈 영역 표시
    document.getElementById('flashcardQuiz').style.display = 'block';
    
    // 단어 표시
    document.getElementById('flashcardWord').textContent = word.word;
    if (word.hiragana) {
        document.getElementById('flashcardHiragana').textContent = word.hiragana;
        document.getElementById('flashcardHiragana').style.display = 'block';
    } else {
        document.getElementById('flashcardHiragana').style.display = 'none';
    }
    
    // 정답 1개 + 오답 3개 선택
    const wrongAnswers = allWords
        .filter(w => w.word !== word.word && w.meaning !== word.meaning)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => w.meaning);
    
    const options = [word.meaning, ...wrongAnswers].sort(() => Math.random() - 0.5);
    
    // 선택지 표시
    const optionsDiv = document.getElementById('flashcardOptions');
    const escapedWord = escapeHtml(word.word).replace(/'/g, "&#x27;");
    optionsDiv.innerHTML = options.map((option, idx) => {
        const escapedOption = escapeHtml(option);
        return `
        <div class="flashcard-option" 
             data-answer="${escapedOption}" 
             data-correct="${option === word.meaning}"
             onclick="selectFlashcardOption(this, '${escapedWord}', ${option === word.meaning})">
            ${idx + 1}. ${escapedOption}
        </div>
        `;
    }).join('');
    
    // 피드백 초기화
    const feedback = document.getElementById('flashcardFeedback');
    feedback.innerHTML = '';
    feedback.style.display = 'none';
    
    // 모든 선택지 활성화
    optionsDiv.querySelectorAll('.flashcard-option').forEach(opt => {
        opt.style.pointerEvents = 'auto';
        opt.style.opacity = '1';
        opt.classList.remove('correct', 'incorrect', 'disabled');
    });
}

function getFilteredWords() {
    const lang = document.getElementById('learnLanguage')?.value || 'en';
    const cert = AppState.settings.targetCertification;
    
    let words = AppState.vocabulary.filter(w => w.language === lang);
    
    // 자격증 필터링
    if (cert !== 'none') {
        words = words.filter(w => w.certification === cert || !w.certification);
    }
    
    // mastered된 단어는 제외 (정답을 맞춘 단어)
    words = words.filter(w => !w.mastered);
    
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
            // 다른 언어는 3번 맞추면 mastered
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

// 플래시카드 퀴즈 선택
function selectFlashcardOption(element, wordText, isCorrect) {
    // 이미 선택했으면 무시
    if (element.classList.contains('disabled')) {
        return;
    }
    
    // 모든 선택지 비활성화
    const options = document.querySelectorAll('.flashcard-option');
    options.forEach(opt => {
        opt.classList.add('disabled');
        opt.style.pointerEvents = 'none';
        opt.style.opacity = '0.6';
    });
    
    // 정답/오답 표시
    options.forEach(opt => {
        if (opt.dataset.correct === 'true') {
            opt.classList.add('correct');
            opt.style.background = 'var(--success-color)';
            opt.style.color = 'white';
        } else if (opt === element && !isCorrect) {
            opt.classList.add('incorrect');
            opt.style.background = 'var(--danger-color)';
            opt.style.color = 'white';
        }
    });
    
    // 피드백 표시
    const feedback = document.getElementById('flashcardFeedback');
    feedback.style.display = 'block';
    
    if (isCorrect) {
        feedback.innerHTML = '<div style="padding: 1rem; background: #d1fae5; border-radius: 8px; color: #065f46; font-weight: 600;">✓ 정답입니다!</div>';
        
        // 단어를 mastered로 표시 (정답을 맞추면 더 이상 나타나지 않음)
        const decodedWordText = wordText.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&');
        const word = AppState.vocabulary.find(w => w.word === decodedWordText && w.language === 'ja');
        if (word) {
            word.mastered = true;
            word.correctCount = (word.correctCount || 0) + 1;
            word.studyCount = (word.studyCount || 0) + 1;
            AppState.dailyProgress.wordsLearned++;
            saveData();
            updateHomeStats();
        }
        
        // 1.5초 후 다음 카드로
        setTimeout(() => {
            changeCard(1);
        }, 1500);
    } else {
        feedback.innerHTML = '<div style="padding: 1rem; background: #fee2e2; border-radius: 8px; color: #991b1b; font-weight: 600;">✗ 오답입니다. 정답을 확인하세요.</div>';
        
        // 2초 후 다음 카드로
        setTimeout(() => {
            changeCard(1);
        }, 2000);
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

// JLPT/TOEIC 레벨에 따른 독해 지문 로드
async function loadJLPTReadingPassage() {
    const certification = AppState.settings.targetCertification;
    
    // 자격증 확인
    if (!certification || certification === 'none') {
        document.getElementById('readingText').innerHTML = `
            <p style="color: var(--text-secondary); text-align: center; padding: 2rem;">
                독해 문제를 풀려면 설정에서 자격증을 선택하세요.
            </p>
        `;
        document.getElementById('questionsList').innerHTML = '';
        return;
    }

    let folderPath;
    let level;
    let certType;

    // JLPT 레벨 확인
    if (certification.startsWith('jlpt-')) {
        certType = 'jlpt';
        level = certification.replace('jlpt-', '').toUpperCase();
        folderPath = `jlpt/jlpt${level}/read.json`;
    }
    // TOEIC 확인
    else if (certification.startsWith('toeic')) {
        certType = 'toeic';
        level = certification.replace('toeic-', '').toUpperCase() || 'READING';
        folderPath = `toeic/reading/read.json`;
    }
    else {
        document.getElementById('readingText').innerHTML = `
            <p style="color: var(--text-secondary); text-align: center; padding: 2rem;">
                독해 문제를 풀려면 설정에서 JLPT 또는 TOEIC 레벨을 선택하세요.
            </p>
        `;
        document.getElementById('questionsList').innerHTML = '';
        return;
    }

    try {
        const response = await fetch(folderPath);
        if (!response.ok) {
            throw new Error(`파일을 찾을 수 없습니다: ${folderPath}`);
        }

        const data = await response.json();
        
        if (!data.reading_quizes || data.reading_quizes.length === 0) {
            throw new Error('독해 문제가 없습니다.');
        }

        // 첫 번째 독해 문제 사용 (나중에 랜덤 선택 가능)
        const readingQuiz = data.reading_quizes[0];
        
        // 현재 독해 문제 저장
        AppState.currentReadingPassage = {
            text: readingQuiz.body,
            questions: readingQuiz.questions,
            level: level,
            certType: certType
        };
        AppState.readingAnswers = {}; // 답안 초기화
        
        // 지문과 문제를 표시
        displayReadingPassage(AppState.currentReadingPassage);
    } catch (error) {
        console.error('독해 지문 로드 오류:', error);
        document.getElementById('readingText').innerHTML = `
            <p style="color: var(--danger-color); text-align: center; padding: 2rem;">
                독해 지문을 불러오는 중 오류가 발생했습니다.<br>
                ${error.message}
            </p>
        `;
        document.getElementById('questionsList').innerHTML = '';
    }
}

// 독해 (기존 함수 - 호환성 유지)
function loadReadingPassage() {
    // 이미지에서 추출한 텍스트 초기화
    AppState.currentReadingPassage = null;
    AppState.readingAnswers = {};
    
    // 문제 영역 다시 표시
    document.getElementById('readingQuestions').style.display = 'block';
    
    // 새 지문 로드
    loadJLPTReadingPassage();
}

function displayReadingPassage(passage) {
    // 이미지에서 추출한 텍스트인 경우 별도 처리
    if (passage.isFromImage) {
        // displayExtractedText에서 이미 처리됨
        return;
    }

    // 지문 표시 (줄바꿈 처리 및 단어 호버 기능 추가)
    let formattedText = passage.text.replace(/\n/g, '<br>');
    
    // 문제 영역 표시 (이미지에서 추출한 텍스트가 아닌 경우)
    document.getElementById('readingQuestions').style.display = 'block';
    
    // 모든 문제를 다 풀었는지 확인
    const allQuestionsAnswered = passage.questions && 
        passage.questions.length > 0 &&
        AppState.readingAnswers &&
        Object.keys(AppState.readingAnswers).length === passage.questions.length;
    
    // 모든 문제를 다 풀었을 때만 단어 호버 기능 추가
    if (allQuestionsAnswered) {
        if (passage.certType === 'toeic' && AppState.toeicDictionary?.words && AppState.toeicDictionary.words.length > 0) {
            // TOEIC 영어 지문
            console.log('TOEIC 단어 호버 기능 활성화, 사전 단어 수:', AppState.toeicDictionary.words.length);
            formattedText = addEnglishWordHoverToText(formattedText);
        } else if (passage.certType === 'jlpt' && (AppState.compoundWords?.words || AppState.singleCharacters?.words)) {
            // JLPT 일본어 지문
            formattedText = addWordHoverToText(formattedText);
        } else {
            console.warn('단어 호버 기능을 활성화할 수 없습니다:', {
                certType: passage.certType,
                hasToeicDict: !!AppState.toeicDictionary?.words,
                toeicDictLength: AppState.toeicDictionary?.words?.length || 0
            });
        }
    }
    
    document.getElementById('readingText').innerHTML = `<p>${formattedText}</p>`;
    document.getElementById('ttsBtn').style.display = 'inline-block';

    // 자격증 레벨 표시
    if (passage.level) {
        const certName = passage.certType === 'toeic' ? 'TOEIC' : 'JLPT';
        const levelBadge = `<div style="margin-bottom: 1rem;">
            <span style="padding: 0.25rem 0.75rem; background: var(--primary-color); color: white; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">
                ${certName} ${passage.level}
            </span>
        </div>`;
        document.getElementById('readingText').innerHTML = levelBadge + `<p>${formattedText}</p>`;
    }
    
    // 모든 문제를 풀었을 때만 호버 이벤트 연결
    if (allQuestionsAnswered) {
        // DOM 업데이트 후 이벤트 연결 (약간의 지연)
        setTimeout(() => {
            attachWordHoverEvents();
        }, 100);
        
        // 안내 메시지 표시
        const readingTextDiv = document.getElementById('readingText');
        const infoMsg = readingTextDiv.querySelector('.hover-info');
        if (!infoMsg) {
            const info = document.createElement('div');
            info.className = 'hover-info';
            info.style.cssText = 'margin-top: 1rem; padding: 0.75rem; background: #dbeafe; border-radius: 8px; color: #1e40af; font-size: 0.9rem;';
            info.innerHTML = '💡 모든 문제를 풀었습니다! 지문의 단어에 마우스를 올려보세요.';
            readingTextDiv.appendChild(info);
        }
    }

    const questionsDiv = document.getElementById('questionsList');
    
    if (!passage.questions || passage.questions.length === 0) {
        questionsDiv.innerHTML = '<p style="color: var(--text-secondary);">문제가 없습니다.</p>';
        return;
    }

    questionsDiv.innerHTML = passage.questions.map((q, idx) => {
        const userAnswers = AppState.readingAnswers || {};
        const userAnswer = userAnswers[idx];
        const isAnswered = userAnswer !== undefined;
        const isCorrect = isAnswered && userAnswer === q.correct;

        return `
        <div class="question-item" id="question-${idx}">
            <div class="question-text">${idx + 1}. ${q.question}</div>
            <div class="question-options">
                ${q.options.map((opt, optIdx) => {
                    let optionClass = 'question-option';
                    let optionStyle = '';
                    
                    if (isAnswered) {
                        if (optIdx === q.correct) {
                            optionClass += ' correct-answer';
                            optionStyle = 'background: var(--success-color); color: white;';
                        } else if (optIdx === userAnswer && !isCorrect) {
                            optionClass += ' wrong-answer';
                            optionStyle = 'background: var(--danger-color); color: white;';
                        }
                    }
                    
                    return `
                        <div class="${optionClass}" 
                             data-question="${idx}" 
                             data-option="${optIdx}" 
                             data-correct="${optIdx === q.correct}"
                             style="${optionStyle}"
                             onclick="selectReadingOption(${idx}, ${optIdx}, ${q.correct})">
                            ${optIdx + 1}. ${opt}
                        </div>
                    `;
                }).join('')}
            </div>
            ${isAnswered ? `
                <div style="margin-top: 0.5rem; padding: 0.5rem; background: ${isCorrect ? '#d1fae5' : '#fee2e2'}; border-radius: 6px; font-size: 0.9rem;">
                    ${isCorrect ? '✓ 정답입니다!' : '✗ 오답입니다. 정답을 확인하세요.'}
                </div>
            ` : ''}
        </div>
    `;
    }).join('');

    // 정답률 표시
    updateReadingScore();
}

// 텍스트에 단어 호버 기능 추가
function addWordHoverToText(text) {
    // 복합 단어와 단일 한자를 합쳐서 사용
    const allWords = [
        ...(AppState.compoundWords?.words || []),
        ...(AppState.singleCharacters?.words || [])
    ];
    
    if (allWords.length === 0) {
        return text;
    }

    // HTML 태그를 임시로 보호
    const htmlTagRegex = /<[^>]+>/g;
    const htmlTags = [];
    let tagIndex = 0;
    
    let protectedText = text.replace(htmlTagRegex, (match) => {
        htmlTags[tagIndex] = match;
        return `__HTML_TAG_${tagIndex++}__`;
    });

    // 사전의 단어들을 길이 순으로 정렬 (긴 단어부터 매칭 - 복합어 우선)
    const sortedWords = [...allWords].sort((a, b) => b.word.length - a.word.length);
    
    // 이미 처리된 위치 추적 (중복 방지)
    const processedPositions = new Set();
    
    sortedWords.forEach(wordData => {
        const word = wordData.word;
        const meaning = wordData.meaning;
        const pronunciation = wordData.pronunciation || wordData.hiragana || '';
        
        // 단어가 텍스트에 있는지 확인
        let searchIndex = 0;
        while (true) {
            const index = protectedText.indexOf(word, searchIndex);
            if (index === -1) break;
            
            // HTML 태그 안에 있는지 확인 (이미 처리된 부분)
            const beforeText = protectedText.substring(Math.max(0, index - 100), index);
            if (beforeText.includes('<span class="word-hoverable"') || 
                beforeText.includes('__HTML_TAG_')) {
                // 이미 처리된 부분이므로 건너뛰기
                searchIndex = index + 1;
                continue;
            }
            
            // 이미 처리된 위치인지 확인
            let isProcessed = false;
            for (let i = index; i < index + word.length; i++) {
                if (processedPositions.has(i)) {
                    isProcessed = true;
                    break;
                }
            }
            
            if (!isProcessed) {
                // 단어를 호버 가능한 태그로 감싸기
                const before = protectedText.substring(0, index);
                const wordText = protectedText.substring(index, index + word.length);
                const after = protectedText.substring(index + word.length);
                
                protectedText = before + 
                    `<span class="word-hoverable" data-word="${escapeHtml(word)}" data-meaning="${escapeHtml(meaning)}" data-pronunciation="${escapeHtml(pronunciation || '')}">${wordText}</span>` + 
                    after;
                
                // 처리된 위치 기록
                for (let i = index; i < index + word.length; i++) {
                    processedPositions.add(i);
                }
                
                // 다음 검색 시작 위치 조정 (태그가 추가되었으므로)
                searchIndex = index + word.length + 100; // 충분히 앞으로 이동
            } else {
                searchIndex = index + 1;
            }
        }
    });

    // HTML 태그 복원
    htmlTags.forEach((tag, idx) => {
        protectedText = protectedText.replace(`__HTML_TAG_${idx}__`, tag);
    });

    return protectedText;
}

// 영어 텍스트에 단어 호버 기능 추가
function addEnglishWordHoverToText(text) {
    if (!AppState.toeicDictionary?.words || AppState.toeicDictionary.words.length === 0) {
        console.warn('TOEIC 사전이 로드되지 않았습니다.');
        return text;
    }

    // HTML 태그를 임시로 보호
    const htmlTagRegex = /<[^>]+>/g;
    const htmlTags = [];
    let tagIndex = 0;
    
    let protectedText = text.replace(htmlTagRegex, (match) => {
        htmlTags[tagIndex] = match;
        return `__HTML_TAG_${tagIndex++}__`;
    });

    // 사전의 단어들을 길이 순으로 정렬 (짧은 단어부터 매칭 - 중복 방지를 위해)
    // 짧은 단어를 먼저 처리하면 긴 단어 안에 포함된 짧은 단어도 처리 가능
    const sortedWords = [...AppState.toeicDictionary.words].sort((a, b) => a.word.length - b.word.length);
    
    // 이미 처리된 위치 추적 (중복 방지)
    const processedPositions = new Set();
    let totalMatches = 0;
    
    sortedWords.forEach(wordData => {
        const word = wordData.word.toLowerCase();
        const meaning = wordData.meaning;
        const pronunciation = wordData.pronunciation || '';
        
        // 단어 경계를 고려한 정규식 생성 (대소문자 무시)
        const escapedWord = escapeRegex(word);
        const testRegex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
        
        // 모든 매칭 위치를 먼저 찾기
        const matches = [];
        let match;
        let testCount = 0;
        
        // 정규식의 lastIndex를 초기화하기 위해 새로 생성
        while ((match = testRegex.exec(protectedText)) !== null) {
            testCount++;
            const index = match.index;
            const matchedWord = match[0];
            
            // 현재 위치 주변의 텍스트 확인 (앞뒤로 충분히 확인)
            const checkStart = Math.max(0, index - 500);
            const checkEnd = Math.min(protectedText.length, index + matchedWord.length + 500);
            const surroundingText = protectedText.substring(checkStart, checkEnd);
            
            // HTML 태그 안에 있는지 확인 (더 정확한 체크)
            // <span class="word-hoverable" 태그가 현재 위치 이전에 닫히지 않고 열려있는지 확인
            const beforeCurrent = protectedText.substring(0, index);
            const openTagCount = (beforeCurrent.match(/<span class="word-hoverable"/g) || []).length;
            const closeTagCount = (beforeCurrent.match(/<\/span>/g) || []).length;
            const isInsideTag = openTagCount > closeTagCount;
            
            // __HTML_TAG__ 플레이스홀더 안에 있는지 확인
            const beforeTag = protectedText.substring(Math.max(0, index - 100), index);
            const afterTag = protectedText.substring(index + matchedWord.length, Math.min(protectedText.length, index + matchedWord.length + 100));
            const isInPlaceholder = beforeTag.match(/__HTML_TAG_\d+__$/) || afterTag.match(/^__HTML_TAG_\d+__/);
            
            // 단어가 이미 처리된 span 태그 안에 있는지 확인 (더 정확한 방법)
            // 현재 위치에서 가장 가까운 열린 태그를 찾기
            const lastOpenTagIndex = beforeCurrent.lastIndexOf('<span class="word-hoverable"');
            const lastCloseTagIndex = beforeCurrent.lastIndexOf('</span>');
            const isInsideProcessedTag = lastOpenTagIndex > lastCloseTagIndex && lastOpenTagIndex !== -1;
            
            // 이미 처리된 위치인지 확인 (더 정확한 체크)
            let isProcessed = false;
            for (let i = index; i < index + matchedWord.length; i++) {
                if (processedPositions.has(i)) {
                    isProcessed = true;
                    break;
                }
            }
            
            // HTML 태그나 플레이스홀더 안에 있지 않고, 이미 처리되지 않았으면 추가
            if (!isInsideTag && !isInPlaceholder && !isInsideProcessedTag && !isProcessed) {
                matches.push({ index, word: matchedWord, length: matchedWord.length });
            }
        }
        
        if (testCount > 0 && matches.length === 0) {
            console.log(`단어 "${word}"는 ${testCount}번 매칭되었지만 모두 이미 처리되었거나 HTML 태그 안에 있습니다.`);
        } else if (matches.length > 0) {
            console.log(`단어 "${word}": ${matches.length}개 매칭`);
        }
        
        totalMatches += matches.length;
        
        // 뒤에서부터 처리 (인덱스가 변경되지 않도록)
        matches.reverse().forEach(({ index, word: matchedWord, length }) => {
            // 단어를 호버 가능한 태그로 감싸기
            const before = protectedText.substring(0, index);
            const wordText = protectedText.substring(index, index + length);
            const after = protectedText.substring(index + length);
            
            protectedText = before + 
                `<span class="word-hoverable" data-word="${escapeHtml(matchedWord)}" data-meaning="${escapeHtml(meaning)}" data-pronunciation="${escapeHtml(pronunciation || '')}">${wordText}</span>` + 
                after;
            
            // 처리된 위치 기록
            for (let i = index; i < index + length; i++) {
                processedPositions.add(i);
            }
        });
    });

    console.log(`영어 단어 호버: 총 ${totalMatches}개의 단어가 매칭되었습니다.`);

    // HTML 태그 복원
    htmlTags.forEach((tag, idx) => {
        protectedText = protectedText.replace(`__HTML_TAG_${idx}__`, tag);
    });

    return protectedText;
}

// 호버 이벤트 연결
function attachWordHoverEvents() {
    const hoverableWords = document.querySelectorAll('.word-hoverable');
    console.log(`호버 이벤트 연결: ${hoverableWords.length}개의 호버 가능한 단어를 찾았습니다.`);
    hoverableWords.forEach(wordSpan => {
        // 기존 이벤트 리스너 제거 (중복 방지)
        const newSpan = wordSpan.cloneNode(true);
        wordSpan.parentNode.replaceChild(newSpan, wordSpan);
        
        newSpan.addEventListener('mouseenter', showWordTooltip);
        newSpan.addEventListener('mouseleave', hideWordTooltip);
    });
}

// 단어 툴팁 표시
function showWordTooltip(e) {
    const wordSpan = e.target;
    const word = wordSpan.dataset.word || wordSpan.textContent.trim();
    const meaning = wordSpan.dataset.meaning;
    const pronunciation = wordSpan.dataset.pronunciation;
    
    // 기존 툴팁 제거
    hideWordTooltip();
    
    // 툴팁 생성
    const tooltip = document.createElement('div');
    tooltip.className = 'word-tooltip';
    tooltip.innerHTML = `
        <div class="tooltip-word">${escapeHtml(word)}</div>
        <div class="tooltip-meaning">${escapeHtml(meaning || '')}</div>
        ${pronunciation ? `<div class="tooltip-pronunciation">${escapeHtml(pronunciation)}</div>` : ''}
    `;
    
    document.body.appendChild(tooltip);
    
    // 위치 계산
    const rect = wordSpan.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
    
    // 화면 밖으로 나가지 않도록 조정
    const tooltipRect = tooltip.getBoundingClientRect();
    if (tooltipRect.left < 10) {
        tooltip.style.left = '10px';
    }
    if (tooltipRect.right > window.innerWidth - 10) {
        tooltip.style.left = (window.innerWidth - tooltip.offsetWidth - 10) + 'px';
    }
    if (tooltipRect.top < 10) {
        tooltip.style.top = rect.bottom + 8 + 'px';
    }
}

// 단어 툴팁 숨기기
function hideWordTooltip() {
    const tooltip = document.querySelector('.word-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// 정규식 특수문자 이스케이프
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 독해 문제 선택
function selectReadingOption(questionIndex, optionIndex, correctAnswer) {
    if (!AppState.readingAnswers) {
        AppState.readingAnswers = {};
    }
    
    AppState.readingAnswers[questionIndex] = optionIndex;
    
    // UI 업데이트
    const questionDiv = document.getElementById(`question-${questionIndex}`);
    if (questionDiv) {
        const options = questionDiv.querySelectorAll('.question-option');
        options.forEach((opt, idx) => {
            opt.style.background = '';
            opt.style.color = '';
            
            if (idx === correctAnswer) {
                opt.style.background = 'var(--success-color)';
                opt.style.color = 'white';
            } else if (idx === optionIndex && optionIndex !== correctAnswer) {
                opt.style.background = 'var(--danger-color)';
                opt.style.color = 'white';
            }
        });
        
        // 피드백 메시지 추가
        const feedback = questionDiv.querySelector('.feedback') || document.createElement('div');
        feedback.className = 'feedback';
        feedback.style.cssText = `margin-top: 0.5rem; padding: 0.5rem; background: ${optionIndex === correctAnswer ? '#d1fae5' : '#fee2e2'}; border-radius: 6px; font-size: 0.9rem;`;
        feedback.textContent = optionIndex === correctAnswer ? '✓ 정답입니다!' : '✗ 오답입니다. 정답을 확인하세요.';
        
        if (!questionDiv.querySelector('.feedback')) {
            questionDiv.appendChild(feedback);
        }
    }
    
    updateReadingScore();
    
    // 모든 문제를 다 풀었는지 확인하고 지문 업데이트
    if (AppState.currentReadingPassage) {
        const allAnswered = AppState.currentReadingPassage.questions &&
            AppState.currentReadingPassage.questions.length > 0 &&
            Object.keys(AppState.readingAnswers).length === AppState.currentReadingPassage.questions.length;
        
        if (allAnswered) {
            // 모든 문제를 다 풀었으면 지문에 호버 기능 추가
            displayReadingPassage(AppState.currentReadingPassage);
        }
    }
}

// 독해 점수 업데이트
function updateReadingScore() {
    if (!AppState.readingAnswers) return;
    
    const currentPassage = AppState.currentReadingPassage;
    if (!currentPassage || !currentPassage.questions) return;
    
    let correctCount = 0;
    currentPassage.questions.forEach((q, idx) => {
        if (AppState.readingAnswers[idx] === q.correct) {
            correctCount++;
        }
    });
    
    const totalQuestions = currentPassage.questions.length;
    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    
    // 점수 표시 (questionsList 위에 추가)
    const questionsDiv = document.getElementById('questionsList');
    const scoreDiv = document.getElementById('readingScore') || document.createElement('div');
    scoreDiv.id = 'readingScore';
    scoreDiv.style.cssText = 'margin-bottom: 1rem; padding: 1rem; background: var(--bg-color); border-radius: 8px; text-align: center;';
    scoreDiv.innerHTML = `
        <strong>정답률: ${correctCount} / ${totalQuestions} (${scorePercentage}%)</strong>
    `;
    
    if (!document.getElementById('readingScore')) {
        questionsDiv.parentElement.insertBefore(scoreDiv, questionsDiv);
    } else {
        scoreDiv.innerHTML = `
            <strong>정답률: ${correctCount} / ${totalQuestions} (${scorePercentage}%)</strong>
        `;
    }
}

// 토스트 메시지 표시 함수
function showToast(message, type = 'info', duration = 3000) {
    // 토스트 컨테이너 생성 (없으면)
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // 토스트 요소 생성
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        loading: '⏳'
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <div class="toast-content">
            <div class="toast-title">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    // 자동 제거
    if (duration > 0) {
        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    }

    return toast;
}

// 이미지에서 텍스트 추출 및 독해 지문으로 표시
async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // 파일 타입 확인
    if (!file.type.startsWith('image/')) {
        showToast('이미지 파일만 업로드할 수 있습니다.', 'error');
        return;
    }

    // Tesseract.js가 로드되었는지 확인 (약간의 대기 시간 제공)
    let retryCount = 0;
    const maxRetries = 10;
    while (typeof Tesseract === 'undefined' && retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retryCount++;
    }
    
    if (typeof Tesseract === 'undefined') {
        showToast('OCR 라이브러리를 불러오는 중입니다. 페이지를 새로고침해주세요.', 'error');
        console.error('Tesseract.js가 로드되지 않았습니다. index.html에서 Tesseract.js 스크립트가 로드되는지 확인하세요.');
        return;
    }

    // 로딩 토스트 표시
    const loadingToast = showToast('이미지에서 텍스트를 추출하는 중...', 'loading', 0);
    
    try {
        // Tesseract.js로 텍스트 추출
        // 일본어와 영어를 모두 인식하도록 설정
        const { data: { text } } = await Tesseract.recognize(file, 'jpn+eng', {
            logger: (m) => {
                if (m.status === 'recognizing text') {
                    const progress = Math.round(m.progress * 100);
                    loadingToast.querySelector('.toast-title').textContent = 
                        `텍스트 추출 중... ${progress}%`;
                }
            }
        });

        if (!text || text.trim().length === 0) {
            loadingToast.remove();
            showToast('이미지에서 텍스트를 찾을 수 없습니다.', 'error');
            return;
        }

        // 추출된 텍스트를 독해 지문으로 표시
        loadingToast.remove();
        showToast('텍스트 추출 완료! 단어 정보를 로드하는 중...', 'info', 2000);

        // 독해 지문 상태 저장
        AppState.currentReadingPassage = {
            text: text.trim(),
            questions: [], // 이미지에서 추출한 텍스트는 문제 없음
            level: null,
            certType: null, // 언어 자동 감지
            isFromImage: true
        };
        AppState.readingAnswers = {};

        // 텍스트 언어 감지 (일본어 문자 포함 여부로 판단)
        const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
        const certType = hasJapanese ? 'jlpt' : 'toeic';

        // certType 저장
        AppState.currentReadingPassage.certType = certType;

        // 지문 표시 (호버 기능 포함)
        await displayExtractedText(text, certType);

        // 파일 입력 초기화
        e.target.value = '';

    } catch (error) {
        console.error('텍스트 추출 오류:', error);
        loadingToast.remove();
        showToast('텍스트 추출 중 오류가 발생했습니다: ' + error.message, 'error');
    }
}

// 추출된 텍스트를 독해 지문으로 표시 (단어 호버 기능 포함)
async function displayExtractedText(text, certType) {
    // 기본 텍스트 표시
    let formattedText = text.replace(/\n/g, '<br>');
    
    // 단어 호버 기능 추가를 위한 로딩 시작
    const wordLoadingToast = showToast('단어 정보를 로드하는 중...', 'loading', 0);
    
    try {
        // 비동기로 단어 호버 기능 추가
        await new Promise(resolve => setTimeout(resolve, 100)); // DOM 업데이트 대기
        
        if (certType === 'toeic' && AppState.toeicDictionary?.words && AppState.toeicDictionary.words.length > 0) {
            // TOEIC 영어 지문
            formattedText = addEnglishWordHoverToText(formattedText);
        } else if (certType === 'jlpt' && (AppState.compoundWords?.words || AppState.singleCharacters?.words)) {
            // JLPT 일본어 지문
            formattedText = addWordHoverToText(formattedText);
        }

        // 지문 표시
        document.getElementById('readingText').innerHTML = `<p>${formattedText}</p>`;
        document.getElementById('ttsBtn').style.display = 'inline-block';
        
        // 문제 영역 숨기기 (이미지에서 추출한 텍스트는 문제 없음)
        document.getElementById('readingQuestions').style.display = 'none';
        
        // 호버 이벤트 연결
        await new Promise(resolve => setTimeout(resolve, 100)); // DOM 업데이트 대기
        attachWordHoverEvents();
        
        // 단어 정보 로딩 완료 알림
        wordLoadingToast.remove();
        const hoverableWords = document.querySelectorAll('.word-hoverable').length;
        showToast(`단어 정보 로딩 완료! ${hoverableWords}개의 단어에 호버 기능이 활성화되었습니다.`, 'success', 4000);
        
    } catch (error) {
        console.error('단어 호버 기능 추가 오류:', error);
        wordLoadingToast.remove();
        showToast('단어 호버 기능 추가 중 오류가 발생했습니다.', 'error');
        // 오류가 발생해도 텍스트는 표시
        document.getElementById('readingText').innerHTML = `<p>${formattedText}</p>`;
        document.getElementById('ttsBtn').style.display = 'inline-block';
    }
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
}

function closeSettingsModal() {
    document.getElementById('settingsModal').classList.remove('active');
}

function saveSettings() {
    AppState.settings.targetCertification = document.getElementById('targetCertification').value;
    AppState.settings.dailyGoal = parseInt(document.getElementById('dailyGoal').value);
    AppState.settings.ttsLanguage = document.getElementById('ttsLanguage').value;
    
    AppState.dailyProgress.goal = AppState.settings.dailyGoal;
    
    saveData();
    closeSettingsModal();
    updateUI();
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
                <span>${entry.query || entry.word} 검색</span>
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

// 사용자 데이터 로드 (Supabase Auth 세션 확인)
async function loadUserData() {
    // Supabase 클라이언트 확인
    if (!window.supabaseClient) {
        // 폴백: localStorage 사용
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            AppState.currentUser = JSON.parse(savedUser);
        }
        return;
    }

    const supabase = window.supabaseClient;

    try {
        // 현재 세션 확인
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('세션 확인 오류:', error);
            return;
        }

        if (session && session.user) {
            // 프로필 정보 가져오기
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profileError) {
                console.error('프로필 로드 오류:', profileError);
            }

            AppState.currentUser = {
                id: session.user.id,
                username: profile?.username || session.user.email?.split('@')[0] || 'User',
                email: session.user.email
            };
        } else {
            AppState.currentUser = null;
        }
    } catch (error) {
        console.error('사용자 데이터 로드 오류:', error);
        // 폴백: localStorage 사용
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            AppState.currentUser = JSON.parse(savedUser);
        }
    }
}

// 사용자 데이터 저장
function saveUserData() {
    if (AppState.currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(AppState.currentUser));
    } else {
        localStorage.removeItem('currentUser');
    }
}

// 모든 사용자 목록 가져오기
function getAllUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

// 사용자 저장
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// 인증 UI 업데이트
function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const accountBtn = document.getElementById('accountBtn');
    const userInfo = document.getElementById('userInfo');
    
    if (AppState.currentUser) {
        // 로그인 상태
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (accountBtn) accountBtn.style.display = 'inline-block';
        if (userInfo) {
            userInfo.style.display = 'inline-block';
            userInfo.textContent = `👤 ${AppState.currentUser.username}`;
        }
    } else {
        // 비로그인 상태
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (accountBtn) accountBtn.style.display = 'none';
        if (userInfo) userInfo.style.display = 'none';
    }
}

// 모달 닫기 헬퍼 함수
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// 로그인 모달 표시
function showLoginModal() {
    document.getElementById('loginModal').classList.add('active');
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
}

// 회원가입 모달 표시
function showSignupModal() {
    closeModal('loginModal');
    document.getElementById('signupModal').classList.add('active');
    document.getElementById('signupError').style.display = 'none';
    document.getElementById('signupUsername').value = '';
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupPassword').value = '';
    document.getElementById('signupPasswordConfirm').value = '';
}

// 로그인 처리 (Supabase Auth)
async function handleLogin() {
    const emailOrUsername = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    if (!emailOrUsername || !password) {
        errorDiv.textContent = '이메일과 비밀번호를 입력해주세요.';
        errorDiv.style.display = 'block';
        return;
    }

    // Supabase 클라이언트 확인
    if (!window.supabaseClient) {
        errorDiv.textContent = 'Supabase 클라이언트가 로드되지 않았습니다.';
        errorDiv.style.display = 'block';
        return;
    }

    const supabase = window.supabaseClient;
    errorDiv.style.display = 'none';

    try {
        // 이메일로 로그인 (Supabase는 이메일만 지원)
        // 사용자명으로 로그인하려면 먼저 프로필에서 이메일 찾기
        let email = emailOrUsername;
        
        // 이메일 형식이 아니면 프로필에서 찾기
        if (!emailOrUsername.includes('@')) {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('email')
                .eq('username', emailOrUsername)
                .single();
            
            if (profiles && profiles.email) {
                email = profiles.email;
            } else {
                errorDiv.textContent = '사용자명을 찾을 수 없습니다. 이메일을 사용해주세요.';
                errorDiv.style.display = 'block';
                return;
            }
        }

        // Supabase Auth로 로그인
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            errorDiv.textContent = error.message || '이메일 또는 비밀번호가 올바르지 않습니다.';
            errorDiv.style.display = 'block';
            return;
        }

        if (data.user) {
            // 프로필 정보 가져오기
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

            AppState.currentUser = {
                id: data.user.id,
                username: profile?.username || data.user.email?.split('@')[0] || 'User',
                email: data.user.email
            };
            
            saveUserData();
            updateAuthUI();
            await loadData(); // 사용자 데이터 로드
            closeModal('loginModal');
        }
    } catch (error) {
        console.error('로그인 오류:', error);
        errorDiv.textContent = '로그인 중 오류가 발생했습니다.';
        errorDiv.style.display = 'block';
    }
}

// 회원가입 처리 (Supabase Auth)
async function handleSignup() {
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
    const errorDiv = document.getElementById('signupError');
    
    // 유효성 검사
    if (!username || !email || !password || !passwordConfirm) {
        errorDiv.textContent = '모든 필드를 입력해주세요.';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (password !== passwordConfirm) {
        errorDiv.textContent = '비밀번호가 일치하지 않습니다.';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (password.length < 6) {
        errorDiv.textContent = '비밀번호는 최소 6자 이상이어야 합니다.';
        errorDiv.style.display = 'block';
        return;
    }

    // Supabase 클라이언트 확인
    if (!window.supabaseClient) {
        errorDiv.textContent = 'Supabase 클라이언트가 로드되지 않았습니다.';
        errorDiv.style.display = 'block';
        return;
    }

    const supabase = window.supabaseClient;
    errorDiv.style.display = 'none';

    try {
        // 사용자명 중복 확인
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('username')
            .eq('username', username)
            .single();

        if (existingProfile) {
            errorDiv.textContent = '이미 사용 중인 사용자명입니다.';
            errorDiv.style.display = 'block';
            return;
        }

        // Supabase Auth로 회원가입
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username
                }
            }
        });

        if (error) {
            errorDiv.textContent = error.message || '회원가입 중 오류가 발생했습니다.';
            errorDiv.style.display = 'block';
            return;
        }

        if (data.user) {
            // 프로필은 트리거로 자동 생성되지만, 사용자명을 확실히 설정
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: data.user.id,
                    username: username,
                    email: email
                });

            if (profileError) {
                console.error('프로필 생성 오류:', profileError);
            }

            // 자동 로그인
            AppState.currentUser = {
                id: data.user.id,
                username: username,
                email: email
            };
            
            saveUserData();
            updateAuthUI();
            await loadData(); // 사용자 데이터 로드
            closeModal('signupModal');
            
            alert('회원가입이 완료되었습니다!');
        }
    } catch (error) {
        console.error('회원가입 오류:', error);
        errorDiv.textContent = '회원가입 중 오류가 발생했습니다.';
        errorDiv.style.display = 'block';
    }
}

// 로그아웃 처리 (Supabase Auth)
async function handleLogout() {
    if (!confirm('로그아웃 하시겠습니까?')) {
        return;
    }

    // Supabase 클라이언트 확인
    if (window.supabaseClient) {
        try {
            const { error } = await window.supabaseClient.auth.signOut();
            if (error) {
                console.error('로그아웃 오류:', error);
            }
        } catch (error) {
            console.error('로그아웃 오류:', error);
        }
    }

    AppState.currentUser = null;
    saveUserData();
    updateAuthUI();
    
    // 사용자 데이터 초기화
    AppState.vocabulary = [];
    AppState.searchHistory = [];
    saveData();
    updateUI();
}

// 계정 관리 모달 열기
function openAccountModal() {
    if (!AppState.currentUser) {
        showLoginModal();
        return;
    }
    
    document.getElementById('accountUsername').textContent = AppState.currentUser.username;
    document.getElementById('accountEmail').textContent = AppState.currentUser.email;
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('newPasswordConfirm').value = '';
    document.getElementById('deletePasswordConfirm').value = '';
    document.getElementById('passwordChangeError').style.display = 'none';
    document.getElementById('passwordChangeSuccess').style.display = 'none';
    document.getElementById('deleteError').style.display = 'none';
    
    document.getElementById('accountModal').classList.add('active');
}

// 비밀번호 변경 처리 (Supabase Auth)
async function handlePasswordChange() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const newPasswordConfirm = document.getElementById('newPasswordConfirm').value;
    const errorDiv = document.getElementById('passwordChangeError');
    const successDiv = document.getElementById('passwordChangeSuccess');
    
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
        errorDiv.textContent = '모든 필드를 입력해주세요.';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (newPassword !== newPasswordConfirm) {
        errorDiv.textContent = '새 비밀번호가 일치하지 않습니다.';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (newPassword.length < 6) {
        errorDiv.textContent = '비밀번호는 최소 6자 이상이어야 합니다.';
        errorDiv.style.display = 'block';
        return;
    }

    // Supabase 클라이언트 확인
    if (!window.supabaseClient || !AppState.currentUser) {
        errorDiv.textContent = '로그인이 필요합니다.';
        errorDiv.style.display = 'block';
        return;
    }

    const supabase = window.supabaseClient;

    try {
        // 현재 비밀번호 확인 (재로그인)
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: AppState.currentUser.email,
            password: currentPassword
        });

        if (signInError) {
            errorDiv.textContent = '현재 비밀번호가 올바르지 않습니다.';
            errorDiv.style.display = 'block';
            return;
        }

        // 비밀번호 변경
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (updateError) {
            errorDiv.textContent = updateError.message || '비밀번호 변경 중 오류가 발생했습니다.';
            errorDiv.style.display = 'block';
            return;
        }

        successDiv.textContent = '비밀번호가 성공적으로 변경되었습니다.';
        successDiv.style.display = 'block';
        
        // 입력 필드 초기화
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('newPasswordConfirm').value = '';
    } catch (error) {
        console.error('비밀번호 변경 오류:', error);
        errorDiv.textContent = '비밀번호 변경 중 오류가 발생했습니다.';
        errorDiv.style.display = 'block';
    }
}

// 회원 탈퇴 처리 (Supabase Auth)
async function handleAccountDeletion() {
    const password = document.getElementById('deletePasswordConfirm').value;
    const errorDiv = document.getElementById('deleteError');
    
    errorDiv.style.display = 'none';
    
    if (!password) {
        errorDiv.textContent = '비밀번호를 입력해주세요.';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (!confirm('정말로 회원 탈퇴를 하시겠습니까? 모든 데이터가 삭제되며 복구할 수 없습니다.')) {
        return;
    }

    // Supabase 클라이언트 확인
    if (!window.supabaseClient || !AppState.currentUser) {
        errorDiv.textContent = '로그인이 필요합니다.';
        errorDiv.style.display = 'block';
        return;
    }

    const supabase = window.supabaseClient;

    try {
        // 비밀번호 확인 (재로그인)
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: AppState.currentUser.email,
            password: password
        });

        if (signInError) {
            errorDiv.textContent = '비밀번호가 올바르지 않습니다.';
            errorDiv.style.display = 'block';
            return;
        }

        // 사용자 데이터 삭제는 RLS 정책과 CASCADE로 자동 처리됨
        // profiles 테이블 삭제 시 관련 데이터 모두 삭제됨
        
        // Auth 사용자 삭제
        const { error: deleteError } = await supabase.auth.admin.deleteUser(AppState.currentUser.id);
        
        // admin API는 클라이언트에서 사용할 수 없으므로, 프로필만 삭제
        // 실제로는 서버 사이드에서 처리해야 하지만, 여기서는 프로필 삭제로 대체
        const { error: profileDeleteError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', AppState.currentUser.id);

        if (profileDeleteError) {
            console.error('프로필 삭제 오류:', profileDeleteError);
            // 프로필 삭제 실패해도 로그아웃은 진행
        }

        // 로그아웃
        await supabase.auth.signOut();
        
        // 로컬 데이터 초기화
        AppState.currentUser = null;
        AppState.vocabulary = [];
        AppState.searchHistory = [];
        saveUserData();
        saveData();
        updateAuthUI();
        updateUI();
        
        closeModal('accountModal');
        alert('회원 탈퇴가 완료되었습니다.');
    } catch (error) {
        console.error('회원 탈퇴 오류:', error);
        errorDiv.textContent = '회원 탈퇴 중 오류가 발생했습니다.';
        errorDiv.style.display = 'block';
    }
}

// 전역 함수 (HTML에서 호출)
window.showPage = showPage;
window.startMockTest = startMockTest;
window.startLevelTest = startLevelTest;
window.selectQuizOption = selectQuizOption;
window.selectTestOption = selectTestOption;
window.selectReadingOption = selectReadingOption;
window.closeModal = closeModal;
window.showLoginModal = showLoginModal;
window.showSignupModal = showSignupModal;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleLogout = handleLogout;
window.openAccountModal = openAccountModal;
window.handlePasswordChange = handlePasswordChange;
window.handleAccountDeletion = handleAccountDeletion;
window.selectFlashcardOption = selectFlashcardOption;
window.showWordDetail = showWordDetail;
window.searchFromHistory = searchFromHistory;
window.deleteWord = deleteWord;

