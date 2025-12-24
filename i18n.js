// 다국어 지원 파일
const translations = {
    ko: {
        // 헤더
        appTitle: "외국어 학습 도우미",
        login: "로그인",
        logout: "로그아웃",
        account: "계정 관리",
        settings: "설정",
        
        // 네비게이션
        home: "홈",
        vocabulary: "단어장",
        reading: "독해",
        mocktest: "모의고사",
        progress: "진행상황",
        
        // 홈 페이지
        welcome: "환영합니다! 👋",
        welcomeMessage: "외국어 학습을 시작해보세요.",
        totalWords: "총 단어",
        learnedWords: "학습한 단어",
        quizScore: "퀴즈 정답률",
        studyStreak: "연속 학습일",
        startLearning: "📚 학습 시작하기",
        startQuiz: "✏️ 퀴즈 풀기",
        
        // 학습 페이지
        wordLearning: "📚 단어 학습",
        learningLanguage: "학습 언어:",
        japanese: "일본어",
        english: "영어",
        korean: "한국어",
        chinese: "중국어",
        spanish: "스페인어",
        word: "단어",
        whatIsMeaning: "이 단어의 뜻은?",
        whatIsMeaningOfWord: '"{word}"의 의미는?',
        previous: "◀ 이전",
        next: "다음 ▶",
        know: "알고 있음 ✓",
        dontKnow: "모름 ✗",
        
        // 퀴즈 페이지
        quiz: "✏️ 퀴즈",
        questionCount: "문제 수:",
        questions5: "5문제",
        questions10: "10문제",
        questions20: "20문제",
        startQuizConfirm: "퀴즈를 시작하시겠습니까?",
        quizStart: "퀴즈 시작",
        submitAnswer: "답변 제출",
        quizResult: "퀴즈 결과",
        retryQuiz: "다시 풀기",
        noQuestions: "문제가 없습니다.",
        
        // 단어장 페이지
        vocabularyTitle: "📖 단어장",
        searchWord: "단어 검색...",
        refresh: "🔄 새로고침",
        totalWordCount: "총 단어 수:",
        learnedWordCount: "학습한 단어:",
        learningRate: "학습률:",
        selectCertification: "설정에서 목표 자격증을 선택하면 해당 자격증의 단어 리스트가 표시됩니다.",
        openSettings: "⚙️ 설정 열기",
        
        // 사전 페이지
        dictionary: "📖 사전",
        searchPlaceholder: "단어를 검색하세요...",
        language: "언어:",
        recentSearches: "최근 검색 기록",
        
        // 독해 페이지
        readingPractice: "📄 독해 연습",
        extractFromImage: "📷 사진에서 텍스트 추출",
        readAloud: "🔊 읽어주기",
        pause: "⏸️ 일시정지",
        stop: "⏹️ 중지",
        editText: "✏️ 텍스트 수정",
        save: "💾 저장",
        loadNewPassage: "새 독해 지문 불러오기",
        questions: "문제",
        selectPassage: "독해 지문을 선택하거나 사진을 업로드하여 텍스트를 추출하세요.",
        
        // 모의고사 페이지
        mockTest: "📝 모의고사 / 레벨테스트",
        mockTestDesc: "실제 시험 형식의 모의고사",
        levelTestDesc: "나의 실력을 측정해보세요",
        start: "시작하기",
        submitAnswer: "답안 제출",
        testResult: "시험 결과",
        retryTest: "다시 풀기",
        
        // 진행상황 페이지
        learningProgress: "📊 학습 진행상황",
        overallStats: "전체 통계",
        totalLearnedWords: "총 학습 단어:",
        fullyLearnedWords: "완전히 학습한 단어:",
        
        // 설정 모달
        settingsTitle: "⚙️ 설정",
        targetCertification: "목표 자격증:",
        dailyGoal: "일일 목표 단어 수:",
        ttsSettings: "음성 읽기 설정",
        ttsLanguage: "언어:",
        ttsRate: "속도:",
        ttsPitch: "음성 높이:",
        ttsVolume: "볼륨:",
        close: "닫기",
        save: "저장",
        
        // 로그인/회원가입
        email: "이메일",
        password: "비밀번호",
        username: "사용자명",
        confirmPassword: "비밀번호 확인",
        signup: "회원가입",
        loginTitle: "로그인",
        signupTitle: "회원가입",
        emailOrUsername: "이메일 또는 사용자명:",
        emailOrUsernamePlaceholder: "이메일 또는 사용자명 입력",
        passwordLabel: "비밀번호:",
        passwordPlaceholder: "비밀번호 입력",
        usernameLabel: "사용자명:",
        usernamePlaceholder: "사용자명 입력",
        emailLabel: "이메일:",
        emailPlaceholder: "이메일 입력",
        passwordConfirmLabel: "비밀번호 확인:",
        passwordConfirmPlaceholder: "비밀번호 다시 입력",
        accountManagement: "계정 관리",
        accountUsername: "사용자명:",
        accountEmail: "이메일:",
        changePassword: "비밀번호 변경",
        currentPassword: "현재 비밀번호:",
        currentPasswordPlaceholder: "현재 비밀번호 입력",
        newPassword: "새 비밀번호:",
        newPasswordPlaceholder: "새 비밀번호 입력",
        newPasswordConfirm: "새 비밀번호 확인:",
        newPasswordConfirmPlaceholder: "새 비밀번호 다시 입력",
        changePasswordBtn: "비밀번호 변경",
        dangerousActions: "위험한 작업",
        deleteAccountWarning: "회원 탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.",
        deletePasswordConfirm: "비밀번호 확인:",
        deletePasswordPlaceholder: "탈퇴를 위해 비밀번호 입력",
        deleteAccount: "회원 탈퇴",
        addWord: "단어 추가",
        wordLabel: "단어",
        wordPlaceholder: "단어를 입력하세요",
        meaningLabel: "의미",
        meaningPlaceholder: "의미를 입력하세요",
        exampleLabel: "예문 (선택사항)",
        examplePlaceholder: "예문을 입력하세요",
        cancel: "취소",
        wordDetail: "단어 상세",
        meaning: "의미",
        etymology: "어원",
        songRecommendations: "노래 추천",
        slow: "느림",
        fast: "빠름",
        low: "낮음",
        high: "높음",
        small: "작음",
        large: "큼",
        dictionaryFeature: "✅ 일본어 사전 기능",
        dictionaryFeatureDesc: "로컬 사전 파일(vocabulary/dictionary.json)을 사용합니다.\n독해 문제를 풀고 나면 지문의 단어에 마우스를 올려 뜻을 확인할 수 있습니다.",
        enterEmailAndPassword: "이메일과 비밀번호를 입력해주세요.",
        supabaseClientNotLoaded: "Supabase 클라이언트가 로드되지 않았습니다.",
        usernameNotFound: "사용자명을 찾을 수 없습니다. 이메일을 사용해주세요.",
        emailOrPasswordIncorrect: "이메일 또는 비밀번호가 올바르지 않습니다.",
        loginError: "로그인 중 오류가 발생했습니다.",
        fillAllFields: "모든 필드를 입력해주세요.",
        passwordsDoNotMatch: "비밀번호가 일치하지 않습니다.",
        passwordMinLength: "비밀번호는 최소 6자 이상이어야 합니다.",
        usernameAlreadyExists: "이미 사용 중인 사용자명입니다.",
        signupError: "회원가입 중 오류가 발생했습니다.",
        passwordChangeSuccess: "비밀번호가 변경되었습니다.",
        passwordChangeError: "비밀번호 변경 중 오류가 발생했습니다.",
        accountDeleteSuccess: "계정이 삭제되었습니다.",
        accountDeleteError: "계정 삭제 중 오류가 발생했습니다.",
        wordAndMeaningRequired: "단어와 의미를 입력해주세요.",
        noWordsFound: "단어를 찾을 수 없습니다.",
        editWord: "단어 수정",
        deleteWord: "단어 삭제",
        confirmDelete: "이 단어를 삭제하시겠습니까?",
        levelTest: "레벨테스트",
        loginRequired: "로그인이 필요합니다.",
        selectCertificationPrompt: "목표 자격증을 선택해주세요",
        noSearchResults: "검색 결과가 없습니다.",
        loadingWords: "단어 데이터를 불러오는 중입니다...",
        pleaseTryAgain: "잠시 후 다시 시도해주세요.",
        targetCertificationLabel: "목표 자격증:",
        accountDeletedSuccess: "회원 탈퇴가 완료되었습니다.",
        accountDeleteErrorMsg: "회원 탈퇴 중 오류가 발생했습니다.",
        signupSuccess: "회원가입이 완료되었습니다!",
        detail: "상세",
        markAsLearned: "학습 완료",
        
        // 기타
        loading: "로딩 중...",
        error: "오류",
        success: "성공",
        info: "정보",
        vocabularyRefreshed: "단어장을 새로고침했습니다.",
        textSaved: "텍스트가 저장되었습니다. 단어 정보를 다시 로드하는 중...",
        noWordsToLearn: "학습할 단어가 없습니다",
        noWordsForQuiz: "퀴즈를 풀 수 있는 단어가 없습니다. 단어를 추가해주세요.",
        correctAnswer: "정답입니다!",
        incorrectAnswer: "오답입니다. 정답을 확인하세요.",
        readingLabel: "읽기:",
        onYomiLabel: "음독 (音読み):",
        kunYomiLabel: "훈독 (訓読み):",
        allQuestionsAnswered: "💡 모든 문제를 풀었습니다! 지문의 단어에 마우스를 올려보세요.",
        clickToPin: "💡 클릭하여 고정",
        clickToUnpin: "💡 다시 클릭하여 고정 해제",
        onYomiExamples: "음독 예시:",
        kunYomiExamples: "훈독 예시:"
    },
    ja: {
        // ヘッダー
        appTitle: "外国語学習ヘルパー",
        login: "ログイン",
        logout: "ログアウト",
        account: "アカウント管理",
        settings: "設定",
        
        // ナビゲーション
        home: "ホーム",
        vocabulary: "単語帳",
        reading: "読解",
        mocktest: "模擬試験",
        progress: "進捗状況",
        
        // ホームページ
        welcome: "ようこそ！👋",
        welcomeMessage: "外国語学習を始めましょう。",
        totalWords: "総単語数",
        learnedWords: "学習した単語",
        quizScore: "クイズ正答率",
        studyStreak: "連続学習日数",
        startLearning: "📚 学習を始める",
        startQuiz: "✏️ クイズを解く",
        
        // 学習ページ
        wordLearning: "📚 単語学習",
        learningLanguage: "学習言語：",
        japanese: "日本語",
        english: "英語",
        korean: "韓国語",
        chinese: "中国語",
        spanish: "スペイン語",
        word: "単語",
        whatIsMeaning: "この単語の意味は？",
        whatIsMeaningOfWord: '"{word}"の意味は？',
        previous: "◀ 前へ",
        next: "次へ ▶",
        know: "知っている ✓",
        dontKnow: "知らない ✗",
        
        // クイズページ
        quiz: "✏️ クイズ",
        questionCount: "問題数：",
        questions5: "5問",
        questions10: "10問",
        questions20: "20問",
        startQuizConfirm: "クイズを開始しますか？",
        quizStart: "クイズ開始",
        submitAnswer: "回答を提出",
        quizResult: "クイズ結果",
        retryQuiz: "もう一度解く",
        noQuestions: "問題がありません。",
        
        // 単語帳ページ
        vocabularyTitle: "📖 単語帳",
        searchWord: "単語を検索...",
        refresh: "🔄 更新",
        totalWordCount: "総単語数：",
        learnedWordCount: "学習した単語：",
        learningRate: "学習率：",
        selectCertification: "設定で目標資格を選択すると、該当資格の単語リストが表示されます。",
        openSettings: "⚙️ 設定を開く",
        
        // 辞書ページ
        dictionary: "📖 辞書",
        searchPlaceholder: "単語を検索してください...",
        language: "言語：",
        recentSearches: "最近の検索履歴",
        
        // 読解ページ
        readingPractice: "📄 読解練習",
        extractFromImage: "📷 写真からテキストを抽出",
        readAloud: "🔊 読み上げる",
        pause: "⏸️ 一時停止",
        stop: "⏹️ 停止",
        editText: "✏️ テキストを編集",
        save: "💾 保存",
        loadNewPassage: "新しい読解問題を読み込む",
        questions: "問題",
        selectPassage: "読解問題を選択するか、写真をアップロードしてテキストを抽出してください。",
        
        // 模擬試験ページ
        mockTest: "📝 模擬試験・レベルテスト",
        mockTestDesc: "実際の試験形式の模擬試験",
        levelTestDesc: "自分の実力を測定してみましょう",
        start: "開始する",
        submitAnswer: "回答を提出",
        testResult: "試験結果",
        retryTest: "もう一度解く",
        
        // 進捗状況ページ
        learningProgress: "📊 学習進捗状況",
        overallStats: "全体統計",
        totalLearnedWords: "総学習単語数：",
        fullyLearnedWords: "完全に学習した単語：",
        
        // 設定モーダル
        settingsTitle: "⚙️ 設定",
        targetCertification: "目標資格：",
        dailyGoal: "1日の目標単語数：",
        ttsSettings: "音声読み上げ設定",
        ttsLanguage: "言語：",
        ttsRate: "速度：",
        ttsPitch: "音声の高さ：",
        ttsVolume: "音量：",
        close: "閉じる",
        save: "保存",
        
        // ログイン/サインアップ
        email: "メールアドレス",
        password: "パスワード",
        username: "ユーザー名",
        confirmPassword: "パスワード確認",
        signup: "サインアップ",
        loginTitle: "ログイン",
        signupTitle: "サインアップ",
        emailOrUsername: "メールアドレスまたはユーザー名：",
        emailOrUsernamePlaceholder: "メールアドレスまたはユーザー名を入力",
        passwordLabel: "パスワード：",
        passwordPlaceholder: "パスワードを入力",
        usernameLabel: "ユーザー名：",
        usernamePlaceholder: "ユーザー名を入力",
        emailLabel: "メールアドレス：",
        emailPlaceholder: "メールアドレスを入力",
        passwordConfirmLabel: "パスワード確認：",
        passwordConfirmPlaceholder: "パスワードを再度入力",
        accountManagement: "アカウント管理",
        accountUsername: "ユーザー名：",
        accountEmail: "メールアドレス：",
        changePassword: "パスワード変更",
        currentPassword: "現在のパスワード：",
        currentPasswordPlaceholder: "現在のパスワードを入力",
        newPassword: "新しいパスワード：",
        newPasswordPlaceholder: "新しいパスワードを入力",
        newPasswordConfirm: "新しいパスワード確認：",
        newPasswordConfirmPlaceholder: "新しいパスワードを再度入力",
        changePasswordBtn: "パスワードを変更",
        dangerousActions: "危険な操作",
        deleteAccountWarning: "アカウントを削除すると、すべてのデータが削除され、復元できません。",
        deletePasswordConfirm: "パスワード確認：",
        deletePasswordPlaceholder: "削除のためにパスワードを入力",
        deleteAccount: "アカウント削除",
        addWord: "単語を追加",
        wordLabel: "単語",
        wordPlaceholder: "単語を入力",
        meaningLabel: "意味",
        meaningPlaceholder: "意味を入力",
        exampleLabel: "例文（任意）",
        examplePlaceholder: "例文を入力",
        cancel: "キャンセル",
        wordDetail: "単語詳細",
        meaning: "意味",
        etymology: "語源",
        songRecommendations: "歌の推薦",
        slow: "遅い",
        fast: "速い",
        low: "低い",
        high: "高い",
        small: "小さい",
        large: "大きい",
        dictionaryFeature: "✅ 日本語辞書機能",
        dictionaryFeatureDesc: "ローカル辞書ファイル(vocabulary/dictionary.json)を使用します。\n読解問題を解いた後、文章の単語にマウスを乗せて意味を確認できます。",
        enterEmailAndPassword: "メールアドレスとパスワードを入力してください。",
        supabaseClientNotLoaded: "Supabaseクライアントがロードされていません。",
        usernameNotFound: "ユーザー名が見つかりません。メールアドレスを使用してください。",
        emailOrPasswordIncorrect: "メールアドレスまたはパスワードが正しくありません。",
        loginError: "ログイン中にエラーが発生しました。",
        fillAllFields: "すべてのフィールドを入力してください。",
        passwordsDoNotMatch: "パスワードが一致しません。",
        passwordMinLength: "パスワードは6文字以上である必要があります。",
        usernameAlreadyExists: "このユーザー名は既に使用されています。",
        signupError: "サインアップ中にエラーが発生しました。",
        passwordChangeSuccess: "パスワードが変更されました。",
        passwordChangeError: "パスワード変更中にエラーが発生しました。",
        accountDeleteSuccess: "アカウントが削除されました。",
        accountDeleteError: "アカウント削除中にエラーが発生しました。",
        wordAndMeaningRequired: "単語と意味を入力してください。",
        noWordsFound: "単語が見つかりません。",
        editWord: "単語を編集",
        deleteWord: "単語を削除",
        confirmDelete: "この単語を削除しますか？",
        levelTest: "レベルテスト",
        loginRequired: "ログインが必要です。",
        selectCertificationPrompt: "目標資格を選択してください",
        noSearchResults: "検索結果がありません。",
        loadingWords: "単語データを読み込み中...",
        pleaseTryAgain: "しばらくしてからもう一度お試しください。",
        targetCertificationLabel: "目標資格：",
        accountDeletedSuccess: "アカウント削除が完了しました。",
        accountDeleteErrorMsg: "アカウント削除中にエラーが発生しました。",
        signupSuccess: "サインアップが完了しました！",
        detail: "詳細",
        markAsLearned: "学習完了",
        
        // その他
        loading: "読み込み中...",
        error: "エラー",
        success: "成功",
        info: "情報",
        vocabularyRefreshed: "単語帳を更新しました。",
        textSaved: "テキストが保存されました。単語情報を再読み込み中...",
        noWordsToLearn: "学習する単語がありません",
        noWordsForQuiz: "クイズを解くことができる単語がありません。単語を追加してください。",
        correctAnswer: "正解です！",
        incorrectAnswer: "不正解です。正解を確認してください。",
        readingLabel: "読み方：",
        onYomiLabel: "音読み：",
        kunYomiLabel: "訓読み：",
        allQuestionsAnswered: "💡 すべての問題を解きました！文章の単語にマウスを乗せてみてください。",
        clickToPin: "💡 クリックして固定",
        clickToUnpin: "💡 もう一度クリックして固定解除",
        onYomiExamples: "音読み例：",
        kunYomiExamples: "訓読み例："
    },
    en: {
        // Header
        appTitle: "Foreign Language Helper",
        login: "Login",
        logout: "Logout",
        account: "Account",
        settings: "Settings",
        
        // Navigation
        home: "Home",
        vocabulary: "Vocabulary",
        reading: "Reading",
        mocktest: "Mock Test",
        progress: "Progress",
        
        // Home Page
        welcome: "Welcome! 👋",
        welcomeMessage: "Start learning foreign languages.",
        totalWords: "Total Words",
        learnedWords: "Learned Words",
        quizScore: "Quiz Score",
        studyStreak: "Study Streak",
        startLearning: "📚 Start Learning",
        startQuiz: "✏️ Take Quiz",
        
        // Learning Page
        wordLearning: "📚 Word Learning",
        learningLanguage: "Learning Language:",
        japanese: "Japanese",
        english: "English",
        korean: "Korean",
        chinese: "Chinese",
        spanish: "Spanish",
        word: "Word",
        whatIsMeaning: "What is the meaning of this word?",
        whatIsMeaningOfWord: 'What is the meaning of "{word}"?',
        previous: "◀ Previous",
        next: "Next ▶",
        know: "Know ✓",
        dontKnow: "Don't Know ✗",
        
        // Quiz Page
        quiz: "✏️ Quiz",
        questionCount: "Question Count:",
        questions5: "5 Questions",
        questions10: "10 Questions",
        questions20: "20 Questions",
        startQuizConfirm: "Would you like to start the quiz?",
        quizStart: "Start Quiz",
        submitAnswer: "Submit Answer",
        quizResult: "Quiz Result",
        retryQuiz: "Retry Quiz",
        noQuestions: "No questions available.",
        
        // Vocabulary Page
        vocabularyTitle: "📖 Vocabulary",
        searchWord: "Search word...",
        refresh: "🔄 Refresh",
        totalWordCount: "Total Words:",
        learnedWordCount: "Learned Words:",
        learningRate: "Learning Rate:",
        selectCertification: "Select your target certification in settings to see the word list.",
        openSettings: "⚙️ Open Settings",
        
        // Dictionary Page
        dictionary: "📖 Dictionary",
        searchPlaceholder: "Search for a word...",
        language: "Language:",
        recentSearches: "Recent Searches",
        
        // Reading Page
        readingPractice: "📄 Reading Practice",
        extractFromImage: "📷 Extract Text from Image",
        readAloud: "🔊 Read Aloud",
        pause: "⏸️ Pause",
        stop: "⏹️ Stop",
        editText: "✏️ Edit Text",
        save: "💾 Save",
        loadNewPassage: "Load New Reading Passage",
        questions: "Questions",
        selectPassage: "Select a reading passage or upload an image to extract text.",
        
        // Mock Test Page
        mockTest: "📝 Mock Test / Level Test",
        mockTestDesc: "Mock test in actual exam format",
        levelTestDesc: "Measure your skill level",
        start: "Start",
        submitAnswer: "Submit Answer",
        testResult: "Test Result",
        retryTest: "Retry Test",
        
        // Progress Page
        learningProgress: "📊 Learning Progress",
        overallStats: "Overall Statistics",
        totalLearnedWords: "Total Learned Words:",
        fullyLearnedWords: "Fully Learned Words:",
        
        // Settings Modal
        settingsTitle: "⚙️ Settings",
        targetCertification: "Target Certification:",
        dailyGoal: "Daily Goal (words):",
        ttsSettings: "Text-to-Speech Settings",
        ttsLanguage: "Language:",
        ttsRate: "Rate:",
        ttsPitch: "Pitch:",
        ttsVolume: "Volume:",
        close: "Close",
        save: "Save",
        
        // Login/Signup
        email: "Email",
        password: "Password",
        username: "Username",
        confirmPassword: "Confirm Password",
        signup: "Sign Up",
        
        // Others
        loading: "Loading...",
        error: "Error",
        success: "Success",
        info: "Info",
        vocabularyRefreshed: "Vocabulary refreshed.",
        textSaved: "Text saved. Reloading word information...",
        noWordsToLearn: "No words to learn",
        noWordsForQuiz: "No words available for quiz. Please add words.",
        correctAnswer: "Correct!",
        incorrectAnswer: "Incorrect. Please check the correct answer.",
        readingLabel: "Reading:",
        onYomiLabel: "On-yomi (音読み):",
        kunYomiLabel: "Kun-yomi (訓読み):",
        allQuestionsAnswered: "💡 All questions answered! Hover over words in the passage.",
        clickToPin: "💡 Click to pin",
        clickToUnpin: "💡 Click again to unpin",
        onYomiExamples: "On-yomi examples:",
        kunYomiExamples: "Kun-yomi examples:",
        loginRequired: "Login required.",
        selectCertificationPrompt: "Please select a target certification",
        noSearchResults: "No search results found.",
        loadingWords: "Loading word data...",
        pleaseTryAgain: "Please try again later.",
        targetCertificationLabel: "Target Certification:",
        accountDeletedSuccess: "Account deletion completed.",
        accountDeleteErrorMsg: "An error occurred during account deletion.",
        signupSuccess: "Sign up completed!",
        detail: "Detail",
        markAsLearned: "Mark as Learned"
    },
    zh: {
        // 标题
        appTitle: "外语学习助手",
        login: "登录",
        logout: "登出",
        account: "账户管理",
        settings: "设置",
        
        // 导航
        home: "首页",
        vocabulary: "单词本",
        reading: "阅读",
        mocktest: "模拟考试",
        progress: "学习进度",
        
        // 首页
        welcome: "欢迎！👋",
        welcomeMessage: "开始学习外语吧。",
        totalWords: "总单词数",
        learnedWords: "已学单词",
        quizScore: "测验正确率",
        studyStreak: "连续学习天数",
        startLearning: "📚 开始学习",
        startQuiz: "✏️ 做测验",
        
        // 学习页面
        wordLearning: "📚 单词学习",
        learningLanguage: "学习语言：",
        japanese: "日语",
        english: "英语",
        korean: "韩语",
        chinese: "中文",
        spanish: "西班牙语",
        word: "单词",
        whatIsMeaning: "这个单词的意思是什么？",
        whatIsMeaningOfWord: '"{word}"的意思是什么？',
        previous: "◀ 上一个",
        next: "下一个 ▶",
        know: "知道 ✓",
        dontKnow: "不知道 ✗",
        
        // 测验页面
        quiz: "✏️ 测验",
        questionCount: "题目数量：",
        questions5: "5题",
        questions10: "10题",
        questions20: "20题",
        startQuizConfirm: "要开始测验吗？",
        quizStart: "开始测验",
        submitAnswer: "提交答案",
        quizResult: "测验结果",
        retryQuiz: "重做",
        
        // 单词本页面
        vocabularyTitle: "📖 单词本",
        searchWord: "搜索单词...",
        refresh: "🔄 刷新",
        totalWordCount: "总单词数：",
        learnedWordCount: "已学单词：",
        learningRate: "学习率：",
        selectCertification: "在设置中选择目标资格证，即可查看相应的单词列表。",
        openSettings: "⚙️ 打开设置",
        
        // 词典页面
        dictionary: "📖 词典",
        searchPlaceholder: "搜索单词...",
        language: "语言：",
        recentSearches: "最近搜索",
        
        // 阅读页面
        readingPractice: "📄 阅读练习",
        extractFromImage: "📷 从图片提取文本",
        readAloud: "🔊 朗读",
        pause: "⏸️ 暂停",
        stop: "⏹️ 停止",
        editText: "✏️ 编辑文本",
        save: "💾 保存",
        loadNewPassage: "加载新的阅读文章",
        questions: "问题",
        selectPassage: "选择阅读文章或上传图片以提取文本。",
        
        // 模拟考试页面
        mockTest: "📝 模拟考试 / 水平测试",
        mockTestDesc: "实际考试格式的模拟考试",
        levelTestDesc: "测量您的技能水平",
        start: "开始",
        submitAnswer: "提交答案",
        testResult: "考试结果",
        retryTest: "重做",
        
        // 学习进度页面
        learningProgress: "📊 学习进度",
        overallStats: "整体统计",
        totalLearnedWords: "总学习单词数：",
        fullyLearnedWords: "完全掌握的单词：",
        
        // 设置模态框
        settingsTitle: "⚙️ 设置",
        targetCertification: "目标资格证：",
        dailyGoal: "每日目标单词数：",
        ttsSettings: "语音朗读设置",
        ttsLanguage: "语言：",
        ttsRate: "速度：",
        ttsPitch: "音高：",
        ttsVolume: "音量：",
        close: "关闭",
        save: "保存",
        
        // 登录/注册
        email: "电子邮件",
        password: "密码",
        username: "用户名",
        confirmPassword: "确认密码",
        signup: "注册",
        loginTitle: "登录",
        signupTitle: "注册",
        emailOrUsername: "电子邮件或用户名：",
        emailOrUsernamePlaceholder: "输入电子邮件或用户名",
        passwordLabel: "密码：",
        passwordPlaceholder: "输入密码",
        usernameLabel: "用户名：",
        usernamePlaceholder: "输入用户名",
        emailLabel: "电子邮件：",
        emailPlaceholder: "输入电子邮件",
        passwordConfirmLabel: "确认密码：",
        passwordConfirmPlaceholder: "再次输入密码",
        accountManagement: "账户管理",
        accountUsername: "用户名：",
        accountEmail: "电子邮件：",
        changePassword: "更改密码",
        currentPassword: "当前密码：",
        currentPasswordPlaceholder: "输入当前密码",
        newPassword: "新密码：",
        newPasswordPlaceholder: "输入新密码",
        newPasswordConfirm: "确认新密码：",
        newPasswordConfirmPlaceholder: "再次输入新密码",
        changePasswordBtn: "更改密码",
        dangerousActions: "危险操作",
        deleteAccountWarning: "删除账户将永久删除所有数据，无法恢复。",
        deletePasswordConfirm: "密码确认：",
        deletePasswordPlaceholder: "输入密码以删除",
        deleteAccount: "删除账户",
        addWord: "添加单词",
        wordLabel: "单词",
        wordPlaceholder: "输入单词",
        meaningLabel: "含义",
        meaningPlaceholder: "输入含义",
        exampleLabel: "例句（可选）",
        examplePlaceholder: "输入例句",
        cancel: "取消",
        wordDetail: "单词详情",
        meaning: "含义",
        etymology: "词源",
        songRecommendations: "歌曲推荐",
        slow: "慢",
        fast: "快",
        low: "低",
        high: "高",
        small: "小",
        large: "大",
        dictionaryFeature: "✅ 日语词典功能",
        dictionaryFeatureDesc: "使用本地词典文件(vocabulary/dictionary.json)。\n解决阅读问题后，将鼠标悬停在文章中的单词上以查看其含义。",
        enterEmailAndPassword: "请输入电子邮件和密码。",
        supabaseClientNotLoaded: "Supabase客户端未加载。",
        usernameNotFound: "未找到用户名。请使用电子邮件。",
        emailOrPasswordIncorrect: "电子邮件或密码不正确。",
        loginError: "登录时发生错误。",
        fillAllFields: "请填写所有字段。",
        passwordsDoNotMatch: "密码不匹配。",
        passwordMinLength: "密码必须至少6个字符。",
        usernameAlreadyExists: "用户名已存在。",
        signupError: "注册时发生错误。",
        passwordChangeSuccess: "密码更改成功。",
        passwordChangeError: "更改密码时发生错误。",
        accountDeleteSuccess: "账户删除成功。",
        accountDeleteError: "删除账户时发生错误。",
        wordAndMeaningRequired: "请输入单词和含义。",
        noWordsFound: "未找到单词。",
        editWord: "编辑单词",
        deleteWord: "删除单词",
        confirmDelete: "确定要删除此单词吗？",
        levelTest: "水平测试",
        loginRequired: "需要登录。",
        selectCertificationPrompt: "请选择目标资格证",
        noSearchResults: "没有找到搜索结果。",
        loadingWords: "正在加载单词数据...",
        pleaseTryAgain: "请稍后再试。",
        targetCertificationLabel: "目标资格证：",
        accountDeletedSuccess: "账户删除完成。",
        accountDeleteErrorMsg: "删除账户时发生错误。",
        signupSuccess: "注册完成！",
        detail: "详情",
        markAsLearned: "标记为已学习",
        
        // 其他
        loading: "加载中...",
        error: "错误",
        success: "成功",
        info: "信息",
        vocabularyRefreshed: "单词本已刷新。",
        textSaved: "文本已保存。正在重新加载单词信息...",
        noWordsToLearn: "没有要学习的单词",
        noWordsForQuiz: "没有可用于测验的单词。请添加单词。",
        correctAnswer: "正确答案！",
        incorrectAnswer: "错误答案。请查看正确答案。",
        readingLabel: "读音：",
        onYomiLabel: "音读（音読み）：",
        kunYomiLabel: "训读（訓読み）：",
        allQuestionsAnswered: "💡 所有问题已回答！请将鼠标悬停在文章中的单词上。",
        clickToPin: "💡 点击固定",
        clickToUnpin: "💡 再次点击取消固定",
        onYomiExamples: "音读例子：",
        kunYomiExamples: "训读例子："
    }
};

// 현재 언어 (기본값: 한국어)
let currentLanguage = localStorage.getItem('appLanguage') || 'ko';

// 언어 변경 함수
function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('appLanguage', lang);
        document.documentElement.lang = lang;
        updateAllTexts();
    }
}

// 텍스트 가져오기 함수
function t(key) {
    return translations[currentLanguage][key] || translations['ko'][key] || key;
}

// 모든 텍스트 업데이트 함수
function updateAllTexts() {
    // 헤더
    const headerTitle = document.querySelector('header h1');
    if (headerTitle) headerTitle.textContent = '🌍 ' + t('appTitle');
    
    document.getElementById('loginBtn')?.setAttribute('title', t('login'));
    document.getElementById('logoutBtn')?.setAttribute('title', t('logout'));
    document.getElementById('accountBtn')?.setAttribute('title', t('account'));
    document.getElementById('settingsBtn')?.setAttribute('title', t('settings'));
    
    // 언어 선택 드롭다운 옵션 업데이트
    const languageSelector = document.getElementById('languageSelector');
    if (languageSelector) {
        Array.from(languageSelector.options).forEach(option => {
            const value = option.value;
            if (value === 'ko') option.textContent = '🇰🇷 ' + t('korean');
            else if (value === 'ja') option.textContent = '🇯🇵 ' + t('japanese');
            else if (value === 'en') option.textContent = '🇺🇸 ' + t('english');
            else if (value === 'zh') option.textContent = '🇨🇳 ' + t('chinese');
        });
    }
    
    // 네비게이션
    const navBtns = document.querySelectorAll('.nav-btn');
    const pages = ['home', 'vocabulary', 'reading', 'mocktest', 'progress'];
    navBtns.forEach((btn, index) => {
        if (pages[index]) {
            btn.textContent = t(pages[index]);
        }
    });
    
    // 홈 페이지
    const welcomeCard = document.querySelector('.welcome-card');
    if (welcomeCard) {
        const welcomeH2 = welcomeCard.querySelector('h2');
        const welcomeP = welcomeCard.querySelector('p');
        if (welcomeH2) welcomeH2.textContent = t('welcome');
        if (welcomeP) welcomeP.textContent = t('welcomeMessage');
    }
    
    // 통계 라벨
    const statLabels = document.querySelectorAll('.stat-label');
    if (statLabels.length >= 4) {
        statLabels[0].textContent = t('totalWords');
        statLabels[1].textContent = t('learnedWords');
        statLabels[2].textContent = t('quizScore');
        statLabels[3].textContent = t('studyStreak');
    }
    
    // 빠른 작업 버튼
    const actionBtns = document.querySelectorAll('.action-btn');
    actionBtns.forEach((btn, idx) => {
        if (btn.classList.contains('primary')) {
            btn.textContent = t('startLearning');
        } else if (btn.classList.contains('secondary')) {
            btn.textContent = t('startQuiz');
        }
    });
    
    // 학습 페이지
    const learnPageHeader = document.querySelector('#learn-page .page-header h2');
    if (learnPageHeader) learnPageHeader.textContent = t('wordLearning');
    
    const learnLanguageLabel = document.querySelector('#learn-page .language-selector label');
    if (learnLanguageLabel) learnLanguageLabel.textContent = t('learningLanguage');
    
    // 언어 선택 옵션 업데이트
    const learnLanguageSelect = document.getElementById('learnLanguage');
    if (learnLanguageSelect) {
        Array.from(learnLanguageSelect.options).forEach(option => {
            const value = option.value;
            if (value === 'ja') option.textContent = t('japanese');
            else if (value === 'en') option.textContent = t('english');
            else if (value === 'ko') option.textContent = t('korean');
            else if (value === 'zh') option.textContent = t('chinese');
            else if (value === 'es') option.textContent = t('spanish');
        });
    }
    
    // 사전 언어 선택 옵션 업데이트
    const dictLanguageSelect = document.getElementById('dictLanguage');
    if (dictLanguageSelect) {
        Array.from(dictLanguageSelect.options).forEach(option => {
            const value = option.value;
            if (value === 'ja') option.textContent = t('japanese');
            else if (value === 'en') option.textContent = t('english');
            else if (value === 'ko') option.textContent = t('korean');
            else if (value === 'zh') option.textContent = t('chinese');
            else if (value === 'es') option.textContent = t('spanish');
        });
    }
    
    // 플래시카드 버튼
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const knowBtn = document.getElementById('knowBtn');
    const dontKnowBtn = document.getElementById('dontKnowBtn');
    if (prevBtn) prevBtn.textContent = t('previous');
    if (nextBtn) nextBtn.textContent = t('next');
    if (knowBtn) knowBtn.textContent = t('know');
    if (dontKnowBtn) dontKnowBtn.textContent = t('dontKnow');
    
    // 플래시카드 퀴즈 질문 텍스트
    const quizQuestionText = document.querySelector('.quiz-question-text');
    if (quizQuestionText) quizQuestionText.textContent = t('whatIsMeaning');
    
    // 퀴즈 페이지
    const quizPageHeader = document.querySelector('#quiz-page .page-header h2');
    if (quizPageHeader) quizPageHeader.textContent = t('quiz');
    
    const quizQuestionCountLabel = document.querySelector('#quiz-page .quiz-settings label');
    if (quizQuestionCountLabel) quizQuestionCountLabel.textContent = t('questionCount');
    
    const quizCountSelect = document.getElementById('quizCount');
    if (quizCountSelect) {
        Array.from(quizCountSelect.options).forEach(option => {
            const value = option.value;
            if (value === '5') option.textContent = t('questions5');
            else if (value === '10') option.textContent = t('questions10');
            else if (value === '20') option.textContent = t('questions20');
        });
    }
    
    const quizStartP = document.querySelector('#quiz-start p');
    const startQuizBtn = document.getElementById('startQuizBtn');
    const submitAnswerBtn = document.getElementById('submitAnswerBtn');
    const quizResultH3 = document.querySelector('#quiz-result h3');
    const retryQuizBtn = document.getElementById('retryQuizBtn');
    if (quizStartP) quizStartP.textContent = t('startQuizConfirm');
    if (startQuizBtn) startQuizBtn.textContent = t('quizStart');
    if (submitAnswerBtn) submitAnswerBtn.textContent = t('submitAnswer');
    if (quizResultH3) quizResultH3.textContent = t('quizResult');
    if (retryQuizBtn) retryQuizBtn.textContent = t('retryQuiz');
    
    // 단어장 페이지
    const vocabPageHeader = document.querySelector('#vocabulary-page .page-header h2');
    if (vocabPageHeader) vocabPageHeader.textContent = t('vocabularyTitle');
    
    const searchWordInput = document.getElementById('searchWord');
    const refreshVocabBtn = document.getElementById('refreshVocabBtn');
    if (searchWordInput) searchWordInput.placeholder = t('searchWord');
    if (refreshVocabBtn) refreshVocabBtn.textContent = t('refresh');
    
    // 사전 페이지
    const dictPageHeader = document.querySelector('#dictionary-page .page-header h2');
    const dictSearchInput = document.getElementById('dictSearchInput');
    const dictLanguageLabel = document.querySelector('#dictionary-page .language-selector label');
    const recentSearchesH3 = document.querySelector('#dictionary-page .search-history h3');
    if (dictPageHeader) dictPageHeader.textContent = t('dictionary');
    if (dictSearchInput) dictSearchInput.placeholder = t('searchPlaceholder');
    if (dictLanguageLabel) dictLanguageLabel.textContent = t('language');
    if (recentSearchesH3) recentSearchesH3.textContent = t('recentSearches');
    
    // 독해 페이지
    const readingPageHeader = document.querySelector('#reading-page .page-header h2');
    const uploadImageBtn = document.getElementById('uploadImageBtn');
    const ttsBtn = document.getElementById('ttsBtn');
    const ttsPauseBtn = document.getElementById('ttsPauseBtn');
    const ttsStopBtn = document.getElementById('ttsStopBtn');
    const editTextBtn = document.getElementById('editTextBtn');
    const saveTextBtn = document.getElementById('saveTextBtn');
    const loadReadingBtn = document.getElementById('loadReadingBtn');
    const readingQuestionsH3 = document.querySelector('#readingQuestions h3');
    if (readingPageHeader) readingPageHeader.textContent = t('readingPractice');
    if (uploadImageBtn) uploadImageBtn.textContent = t('extractFromImage');
    if (ttsBtn) ttsBtn.textContent = t('readAloud');
    if (ttsPauseBtn) ttsPauseBtn.textContent = t('pause');
    if (ttsStopBtn) ttsStopBtn.textContent = t('stop');
    if (editTextBtn) editTextBtn.textContent = t('editText');
    if (saveTextBtn) saveTextBtn.textContent = t('save');
    if (loadReadingBtn) loadReadingBtn.textContent = t('loadNewPassage');
    if (readingQuestionsH3) readingQuestionsH3.textContent = t('questions');
    
    // 모의고사 페이지
    const mockTestPageHeader = document.querySelector('#mocktest-page .page-header h2');
    const mockTestDesc = document.querySelector('.test-type-card[data-test="mock"] p');
    const levelTestDesc = document.querySelector('.test-type-card[data-test="level"] p');
    const mockTestStartBtn = document.querySelector('.test-type-card[data-test="mock"] .btn');
    const levelTestStartBtn = document.querySelector('.test-type-card[data-test="level"] .btn');
    const submitTestBtn = document.getElementById('submitTestBtn');
    const testResultH3 = document.querySelector('#testResult h3');
    const retryTestBtn = document.getElementById('retryTestBtn');
    if (mockTestPageHeader) mockTestPageHeader.textContent = t('mockTest');
    if (mockTestDesc) mockTestDesc.textContent = t('mockTestDesc');
    if (levelTestDesc) levelTestDesc.textContent = t('levelTestDesc');
    if (mockTestStartBtn) mockTestStartBtn.textContent = t('start');
    if (levelTestStartBtn) levelTestStartBtn.textContent = t('start');
    if (submitTestBtn) submitTestBtn.textContent = t('submitAnswer');
    if (testResultH3) testResultH3.textContent = t('testResult');
    if (retryTestBtn) retryTestBtn.textContent = t('retryTest');
    
    // 진행상황 페이지
    const progressPageHeader = document.querySelector('#progress-page .page-header h2');
    const overallStatsH3 = document.querySelector('#progress-page .progress-card h3');
    if (progressPageHeader) progressPageHeader.textContent = t('learningProgress');
    if (overallStatsH3) overallStatsH3.textContent = t('overallStats');
    
    // 로그인 모달
    const loginModalTitle = document.querySelector('#loginModal .modal-header h3');
    const loginEmailLabel = document.querySelector('#loginModal label[for="loginEmail"]');
    const loginPasswordLabel = document.querySelector('#loginModal label[for="loginPassword"]');
    const loginEmailInput = document.getElementById('loginEmail');
    const loginPasswordInput = document.getElementById('loginPassword');
    const loginBtn = document.querySelector('#loginModal .btn-primary');
    const signupLinkBtn = document.querySelector('#loginModal .btn-secondary');
    if (loginModalTitle) loginModalTitle.textContent = t('loginTitle');
    if (loginEmailLabel) loginEmailLabel.textContent = t('emailOrUsername');
    if (loginPasswordLabel) loginPasswordLabel.textContent = t('passwordLabel');
    if (loginEmailInput) loginEmailInput.placeholder = t('emailOrUsernamePlaceholder');
    if (loginPasswordInput) loginPasswordInput.placeholder = t('passwordPlaceholder');
    if (loginBtn) loginBtn.textContent = t('login');
    if (signupLinkBtn) signupLinkBtn.textContent = t('signup');
    
    // 회원가입 모달
    const signupModalTitle = document.querySelector('#signupModal .modal-header h3');
    const signupUsernameLabel = document.querySelector('#signupModal label[for="signupUsername"]');
    const signupEmailLabel = document.querySelector('#signupModal label[for="signupEmail"]');
    const signupPasswordLabel = document.querySelector('#signupModal label[for="signupPassword"]');
    const signupPasswordConfirmLabel = document.querySelector('#signupModal label[for="signupPasswordConfirm"]');
    const signupUsernameInput = document.getElementById('signupUsername');
    const signupEmailInput = document.getElementById('signupEmail');
    const signupPasswordInput = document.getElementById('signupPassword');
    const signupPasswordConfirmInput = document.getElementById('signupPasswordConfirm');
    const signupSubmitBtn = document.querySelector('#signupModal .btn-primary');
    const loginLinkBtn = document.querySelector('#signupModal .btn-secondary');
    if (signupModalTitle) signupModalTitle.textContent = t('signupTitle');
    if (signupUsernameLabel) signupUsernameLabel.textContent = t('usernameLabel');
    if (signupEmailLabel) signupEmailLabel.textContent = t('emailLabel');
    if (signupPasswordLabel) signupPasswordLabel.textContent = t('passwordLabel');
    if (signupPasswordConfirmLabel) signupPasswordConfirmLabel.textContent = t('passwordConfirmLabel');
    if (signupUsernameInput) signupUsernameInput.placeholder = t('usernamePlaceholder');
    if (signupEmailInput) signupEmailInput.placeholder = t('emailPlaceholder');
    if (signupPasswordInput) signupPasswordInput.placeholder = t('passwordPlaceholder');
    if (signupPasswordConfirmInput) signupPasswordConfirmInput.placeholder = t('passwordConfirmPlaceholder');
    if (signupSubmitBtn) signupSubmitBtn.textContent = t('signup');
    if (loginLinkBtn) loginLinkBtn.textContent = t('login');
    
    // 단어 추가 모달
    const addWordModalTitle = document.querySelector('#addWordModal .modal-header h3');
    const modalLanguageLabel = document.querySelector('#addWordModal .form-group:first-child label');
    const wordLabel = document.querySelector('#addWordModal .form-group:nth-child(2) label');
    const meaningLabel = document.querySelector('#addWordModal .form-group:nth-child(3) label');
    const exampleLabel = document.querySelector('#addWordModal .form-group:nth-child(4) label');
    const modalLanguageSelect = document.getElementById('modalLanguage');
    const modalWordInput = document.getElementById('modalWord');
    const modalMeaningInput = document.getElementById('modalMeaning');
    const modalExampleInput = document.getElementById('modalExample');
    const cancelAddBtn = document.getElementById('cancelAddBtn');
    const saveWordBtn = document.getElementById('saveWordBtn');
    if (addWordModalTitle) addWordModalTitle.textContent = t('addWord');
    if (modalLanguageLabel) modalLanguageLabel.textContent = t('language');
    if (wordLabel) wordLabel.textContent = t('wordLabel');
    if (meaningLabel) meaningLabel.textContent = t('meaningLabel');
    if (exampleLabel) exampleLabel.textContent = t('exampleLabel');
    if (modalLanguageSelect) {
        Array.from(modalLanguageSelect.options).forEach(option => {
            const value = option.value;
            if (value === 'ja') option.textContent = t('japanese');
            else if (value === 'en') option.textContent = t('english');
            else if (value === 'ko') option.textContent = t('korean');
            else if (value === 'zh') option.textContent = t('chinese');
            else if (value === 'es') option.textContent = t('spanish');
        });
    }
    if (modalWordInput) modalWordInput.placeholder = t('wordPlaceholder');
    if (modalMeaningInput) modalMeaningInput.placeholder = t('meaningPlaceholder');
    if (modalExampleInput) modalExampleInput.placeholder = t('examplePlaceholder');
    if (cancelAddBtn) cancelAddBtn.textContent = t('cancel');
    if (saveWordBtn) saveWordBtn.textContent = t('save');
    
    // 계정 관리 모달
    const accountModalTitle = document.querySelector('#accountModal .modal-header h3');
    const accountUsernameLabel = document.querySelector('#accountModal #accountInfo p:first-child strong');
    const accountEmailLabel = document.querySelector('#accountModal #accountInfo p:last-child strong');
    const changePasswordH4 = document.querySelector('#accountModal .account-section h4');
    const currentPasswordLabel = document.querySelector('#accountModal label[for="currentPassword"]');
    const newPasswordLabel = document.querySelector('#accountModal label[for="newPassword"]');
    const newPasswordConfirmLabel = document.querySelector('#accountModal label[for="newPasswordConfirm"]');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const newPasswordConfirmInput = document.getElementById('newPasswordConfirm');
    const changePasswordBtn = document.querySelector('#accountModal .account-section .btn-primary');
    const dangerousActionsH4 = document.querySelector('#accountModal .account-section:last-child h4');
    const deleteAccountWarning = document.querySelector('#accountModal .account-section:last-child p');
    const deletePasswordConfirmLabel = document.querySelector('#accountModal label[for="deletePasswordConfirm"]');
    const deletePasswordConfirmInput = document.getElementById('deletePasswordConfirm');
    const deleteAccountBtn = document.querySelector('#accountModal .btn-danger');
    if (accountModalTitle) accountModalTitle.textContent = t('accountManagement');
    if (accountUsernameLabel) accountUsernameLabel.textContent = t('accountUsername');
    if (accountEmailLabel) accountEmailLabel.textContent = t('accountEmail');
    if (changePasswordH4) changePasswordH4.textContent = t('changePassword');
    if (currentPasswordLabel) currentPasswordLabel.textContent = t('currentPassword');
    if (newPasswordLabel) newPasswordLabel.textContent = t('newPassword');
    if (newPasswordConfirmLabel) newPasswordConfirmLabel.textContent = t('newPasswordConfirm');
    if (currentPasswordInput) currentPasswordInput.placeholder = t('currentPasswordPlaceholder');
    if (newPasswordInput) newPasswordInput.placeholder = t('newPasswordPlaceholder');
    if (newPasswordConfirmInput) newPasswordConfirmInput.placeholder = t('newPasswordConfirmPlaceholder');
    if (changePasswordBtn) changePasswordBtn.textContent = t('changePasswordBtn');
    if (dangerousActionsH4) dangerousActionsH4.textContent = t('dangerousActions');
    if (deleteAccountWarning) deleteAccountWarning.textContent = t('deleteAccountWarning');
    if (deletePasswordConfirmLabel) deletePasswordConfirmLabel.textContent = t('deletePasswordConfirm');
    if (deletePasswordConfirmInput) deletePasswordConfirmInput.placeholder = t('deletePasswordPlaceholder');
    if (deleteAccountBtn) deleteAccountBtn.textContent = t('deleteAccount');
    
    // 설정 모달
    const settingsModalTitle = document.querySelector('#settingsModal .modal-header h3');
    const targetCertLabel = document.querySelector('#settingsModal label[for="targetCertification"]');
    const dailyGoalLabel = document.querySelector('#settingsModal label[for="dailyGoal"]');
    const ttsSettingsTitle = document.querySelector('#settingsModal .form-group:has(#ttsLanguageSetting) label');
    const ttsLanguageLabel = document.querySelector('#settingsModal label[for="ttsLanguageSetting"]');
    const ttsRateLabel = document.querySelector('#settingsModal label[for="ttsRate"]');
    const ttsPitchLabel = document.querySelector('#settingsModal label[for="ttsPitch"]');
    const ttsVolumeLabel = document.querySelector('#settingsModal label[for="ttsVolume"]');
    const ttsRateSmall = document.querySelector('#settingsModal #ttsRate').nextElementSibling;
    const ttsPitchSmall = document.querySelector('#settingsModal #ttsPitch').nextElementSibling;
    const ttsVolumeSmall = document.querySelector('#settingsModal #ttsVolume').nextElementSibling;
    const dictionaryFeatureStrong = document.querySelector('#settingsModal .form-group:last-child strong');
    const dictionaryFeatureDesc = document.querySelector('#settingsModal .form-group:last-child p');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (settingsModalTitle) settingsModalTitle.textContent = t('settingsTitle');
    if (targetCertLabel) targetCertLabel.textContent = t('targetCertification');
    if (dailyGoalLabel) dailyGoalLabel.textContent = t('dailyGoal');
    if (ttsSettingsTitle) ttsSettingsTitle.textContent = t('ttsSettings');
    if (ttsLanguageLabel) ttsLanguageLabel.textContent = t('ttsLanguage');
    if (ttsRateLabel) ttsRateLabel.textContent = t('ttsRate');
    if (ttsPitchLabel) ttsPitchLabel.textContent = t('ttsPitch');
    if (ttsVolumeLabel) ttsVolumeLabel.textContent = t('ttsVolume');
    if (ttsRateSmall) {
        const slowText = t('slow');
        const fastText = t('fast');
        ttsRateSmall.textContent = `${slowText} (0.5x) ← → ${fastText} (2.0x)`;
    }
    if (ttsPitchSmall) {
        const lowText = t('low');
        const highText = t('high');
        ttsPitchSmall.textContent = `${lowText} (0.5) ← → ${highText} (2.0)`;
    }
    if (ttsVolumeSmall) {
        const smallText = t('small');
        const largeText = t('large');
        ttsVolumeSmall.textContent = `${smallText} (0%) ← → ${largeText} (100%)`;
    }
    if (dictionaryFeatureStrong) dictionaryFeatureStrong.textContent = t('dictionaryFeature');
    if (dictionaryFeatureDesc) dictionaryFeatureDesc.innerHTML = t('dictionaryFeatureDesc').replace(/\n/g, '<br>');
    if (saveSettingsBtn) saveSettingsBtn.textContent = t('save');
    
    // 모의고사 페이지
    const mockTestPageHeader = document.querySelector('#mocktest-page .page-header h2');
    const mockTestCardTitle = document.querySelector('.test-type-card[data-test="mock"] h3');
    const mockTestCardDesc = document.querySelector('.test-type-card[data-test="mock"] p');
    const levelTestCardTitle = document.querySelector('.test-type-card[data-test="level"] h3');
    const levelTestCardDesc = document.querySelector('.test-type-card[data-test="level"] p');
    const mockTestStartBtn = document.querySelector('.test-type-card[data-test="mock"] .btn');
    const levelTestStartBtn = document.querySelector('.test-type-card[data-test="level"] .btn');
    if (mockTestPageHeader) mockTestPageHeader.textContent = t('mockTest');
    if (mockTestCardTitle) mockTestCardTitle.textContent = t('mockTest');
    if (mockTestCardDesc) mockTestCardDesc.textContent = t('mockTestDesc');
    if (levelTestCardTitle) levelTestCardTitle.textContent = t('levelTest');
    if (levelTestCardDesc) levelTestCardDesc.textContent = t('levelTestDesc');
    if (mockTestStartBtn) mockTestStartBtn.textContent = t('start');
    if (levelTestStartBtn) levelTestStartBtn.textContent = t('start');
}

