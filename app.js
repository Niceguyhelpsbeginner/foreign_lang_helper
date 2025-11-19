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
    compoundWords: null, // 복합 단어 사전
    singleCharacters: null, // 단일 한자 사전
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
    loadUserData();
    loadData();
    await loadDictionary();
    initializeEventListeners();
    updateUI();
    updateAuthUI();
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
        loadJLPTReadingPassage();
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

// 사전 데이터 로드
async function loadDictionary() {
    try {
        // 복합 단어 사전 로드
        const compoundResponse = await fetch('vocabulary/compound_word.json');
        if (compoundResponse.ok) {
            const compoundData = await compoundResponse.json();
            AppState.compoundWords = compoundData;
        } else {
            console.warn('복합 단어 사전 파일을 찾을 수 없습니다.');
            AppState.compoundWords = { words: [] };
        }
        
        // 단일 한자 사전 로드
        const singleResponse = await fetch('vocabulary/single_character.json');
        if (singleResponse.ok) {
            const singleData = await singleResponse.json();
            AppState.singleCharacters = singleData;
        } else {
            console.warn('단일 한자 사전 파일을 찾을 수 없습니다.');
            AppState.singleCharacters = { words: [] };
        }
        
        // 기존 호환성을 위해 통합 사전도 유지
        AppState.dictionary = {
            words: [
                ...(AppState.compoundWords?.words || []),
                ...(AppState.singleCharacters?.words || [])
            ]
        };
    } catch (error) {
        console.error('사전 로드 오류:', error);
        AppState.compoundWords = { words: [] };
        AppState.singleCharacters = { words: [] };
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
            // 로컬 사전에서 검색
            result = searchLocalDictionary(query);
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

// 로컬 사전에서 검색
function searchLocalDictionary(word) {
    // 한국어 입력인지 확인
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
                kanjiComponents: foundWord.kanjiComponents || null,
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
                kanjiComponents: foundWord.kanjiComponents || null,
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
    // 단어 항목에 호버 기능 추가
    container.querySelectorAll('.word-entry-title').forEach(el => {
        const wordText = el.textContent.trim();
        
        // 복합 단어에서 먼저 검색
        let wordData = AppState.compoundWords?.words?.find(w => w.word === wordText);
        
        if (wordData && wordData.kanjiComponents && wordData.kanjiComponents.length > 1) {
            // 여러 한자로 구성된 단어인 경우
            el.classList.add('kanji-word-hoverable');
            el.setAttribute('data-word', wordText);
            el.setAttribute('data-meaning', wordData.meaning);
            el.setAttribute('data-kanji-components', JSON.stringify(wordData.kanjiComponents));
            
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
                html += `<span class="individual-kanji" 
                              data-kanji="${kanji}"
                              data-on-yomi="${JSON.stringify(kanjiData.onYomi || [])}"
                              data-kun-yomi="${JSON.stringify(kanjiData.kunYomi || [])}"
                              data-kanji-meaning="${kanjiData.kanjiMeaning || ''}">${kanji}</span>`;
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

// JLPT 레벨에 따른 독해 지문 로드
async function loadJLPTReadingPassage() {
    const certification = AppState.settings.targetCertification;
    
    // JLPT 레벨 확인
    if (!certification || !certification.startsWith('jlpt-')) {
        document.getElementById('readingText').innerHTML = `
            <p style="color: var(--text-secondary); text-align: center; padding: 2rem;">
                독해 문제를 풀려면 설정에서 JLPT 레벨을 선택하세요.
            </p>
        `;
        document.getElementById('questionsList').innerHTML = '';
        return;
    }

    // JLPT 레벨에 따른 폴더 경로
    const jlptLevel = certification.replace('jlpt-', '').toUpperCase();
    const folderPath = `jlpt${jlptLevel}/read.json`;

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
            level: jlptLevel
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
    loadJLPTReadingPassage();
}

function displayReadingPassage(passage) {
    // 지문 표시 (줄바꿈 처리 및 단어 호버 기능 추가)
    let formattedText = passage.text.replace(/\n/g, '<br>');
    
    // 모든 문제를 다 풀었는지 확인
    const allQuestionsAnswered = passage.questions && 
        passage.questions.length > 0 &&
        AppState.readingAnswers &&
        Object.keys(AppState.readingAnswers).length === passage.questions.length;
    
    // 모든 문제를 다 풀었을 때만 단어 호버 기능 추가
    if (allQuestionsAnswered && (AppState.compoundWords?.words || AppState.singleCharacters?.words)) {
        formattedText = addWordHoverToText(formattedText);
    }
    
    document.getElementById('readingText').innerHTML = `<p>${formattedText}</p>`;
    document.getElementById('ttsBtn').style.display = 'inline-block';

    // JLPT 레벨 표시
    if (passage.level) {
        const levelBadge = `<div style="margin-bottom: 1rem;">
            <span style="padding: 0.25rem 0.75rem; background: var(--primary-color); color: white; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">
                JLPT ${passage.level}
            </span>
        </div>`;
        document.getElementById('readingText').innerHTML = levelBadge + `<p>${formattedText}</p>`;
    }
    
    // 모든 문제를 풀었을 때만 호버 이벤트 연결
    if (allQuestionsAnswered) {
        attachWordHoverEvents();
        
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

// 호버 이벤트 연결
function attachWordHoverEvents() {
    const hoverableWords = document.querySelectorAll('.word-hoverable');
    hoverableWords.forEach(wordSpan => {
        wordSpan.addEventListener('mouseenter', showWordTooltip);
        wordSpan.addEventListener('mouseleave', hideWordTooltip);
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

// 사용자 데이터 로드
function loadUserData() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        AppState.currentUser = JSON.parse(savedUser);
    }
    
    const savedUsers = localStorage.getItem('users');
    if (!savedUsers) {
        localStorage.setItem('users', JSON.stringify([]));
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

// 로그인 처리
function handleLogin() {
    const emailOrUsername = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    if (!emailOrUsername || !password) {
        errorDiv.textContent = '이메일/사용자명과 비밀번호를 입력해주세요.';
        errorDiv.style.display = 'block';
        return;
    }
    
    const users = getAllUsers();
    const user = users.find(u => 
        (u.email === emailOrUsername || u.username === emailOrUsername) && 
        u.password === password
    );
    
    if (user) {
        // 비밀번호는 저장하지 않음
        AppState.currentUser = {
            id: user.id,
            username: user.username,
            email: user.email
        };
        saveUserData();
        updateAuthUI();
        closeModal('loginModal');
    } else {
        errorDiv.textContent = '이메일/사용자명 또는 비밀번호가 올바르지 않습니다.';
        errorDiv.style.display = 'block';
    }
}

// 회원가입 처리
function handleSignup() {
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
    
    if (password.length < 4) {
        errorDiv.textContent = '비밀번호는 최소 4자 이상이어야 합니다.';
        errorDiv.style.display = 'block';
        return;
    }
    
    const users = getAllUsers();
    
    // 중복 확인
    if (users.find(u => u.email === email)) {
        errorDiv.textContent = '이미 사용 중인 이메일입니다.';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (users.find(u => u.username === username)) {
        errorDiv.textContent = '이미 사용 중인 사용자명입니다.';
        errorDiv.style.display = 'block';
        return;
    }
    
    // 새 사용자 생성
    const newUser = {
        id: Date.now().toString(),
        username: username,
        email: email,
        password: password, // 실제로는 해시화해야 함
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    // 자동 로그인
    AppState.currentUser = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
    };
    saveUserData();
    updateAuthUI();
    closeModal('signupModal');
    
    alert('회원가입이 완료되었습니다!');
}

// 로그아웃 처리
function handleLogout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        AppState.currentUser = null;
        saveUserData();
        updateAuthUI();
    }
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

// 비밀번호 변경 처리
function handlePasswordChange() {
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
    
    if (newPassword.length < 4) {
        errorDiv.textContent = '비밀번호는 최소 4자 이상이어야 합니다.';
        errorDiv.style.display = 'block';
        return;
    }
    
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === AppState.currentUser.id);
    
    if (userIndex === -1) {
        errorDiv.textContent = '사용자를 찾을 수 없습니다.';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (users[userIndex].password !== currentPassword) {
        errorDiv.textContent = '현재 비밀번호가 올바르지 않습니다.';
        errorDiv.style.display = 'block';
        return;
    }
    
    // 비밀번호 변경
    users[userIndex].password = newPassword;
    saveUsers(users);
    
    successDiv.textContent = '비밀번호가 성공적으로 변경되었습니다.';
    successDiv.style.display = 'block';
    
    // 입력 필드 초기화
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('newPasswordConfirm').value = '';
}

// 회원 탈퇴 처리
function handleAccountDeletion() {
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
    
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === AppState.currentUser.id);
    
    if (userIndex === -1) {
        errorDiv.textContent = '사용자를 찾을 수 없습니다.';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (users[userIndex].password !== password) {
        errorDiv.textContent = '비밀번호가 올바르지 않습니다.';
        errorDiv.style.display = 'block';
        return;
    }
    
    // 사용자 삭제
    users.splice(userIndex, 1);
    saveUsers(users);
    
    // 로그아웃 및 데이터 초기화
    AppState.currentUser = null;
    AppState.vocabulary = [];
    AppState.searchHistory = [];
    saveUserData();
    saveData();
    updateAuthUI();
    updateUI();
    
    closeModal('accountModal');
    alert('회원 탈퇴가 완료되었습니다.');
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

