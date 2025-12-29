/**
 * TOEIC 사전에 중국어/일본어 뜻 추가 스크립트
 * 
 * 사용 방법:
 * 1. node add_translations_to_toeic.js
 * 2. 또는 Supabase에서 직접 업데이트
 */

const fs = require('fs');
const path = require('path');

// TOEIC 사전 파일 읽기
const dictionaryPath = path.join(__dirname, 'toeic', 'vocabulary', 'dictionary.json');
const dictionary = JSON.parse(fs.readFileSync(dictionaryPath, 'utf8'));

// 영어 단어의 중국어/일본어 뜻 매핑 (주요 단어들)
// 나머지는 번역 API를 사용하거나 수동으로 추가해야 합니다
const translations = {
    "accommodate": { ja: "収容する、適応させる", zh: "容纳，适应" },
    "accomplish": { ja: "達成する、完成する", zh: "完成，达成" },
    "accurate": { ja: "正確な", zh: "准确的" },
    "acquire": { ja: "獲得する、買収する", zh: "获得，收购" },
    "adequate": { ja: "十分な、適切な", zh: "足够的，适当的" },
    "adjacent": { ja: "隣接した、隣の", zh: "相邻的，邻近的" },
    "adjust": { ja: "調整する、適応する", zh: "调整，适应" },
    "administration": { ja: "管理、行政", zh: "管理，行政" },
    "adverse": { ja: "不利な、逆効果の", zh: "不利的，逆效果的" },
    "advocate": { ja: "擁護する、支持者", zh: "拥护，支持者" },
    "affect": { ja: "影響を与える", zh: "影响" },
    "aggregate": { ja: "合計、総計", zh: "合计，总计" },
    "allocate": { ja: "割り当てる", zh: "分配" },
    "alternative": { ja: "代替、代替の", zh: "替代，替代的" },
    "annual": { ja: "年間の、毎年の", zh: "年度的，每年的" },
    "apparent": { ja: "明らかな、明白な", zh: "明显的，明白的" },
    "approach": { ja: "接近する、方法", zh: "接近，方法" },
    "appropriate": { ja: "適切な、適した", zh: "适当的，合适的" },
    "approximate": { ja: "おおよその、近似値", zh: "大约的，近似值" },
    "arbitrary": { ja: "任意の、独断的な", zh: "任意的，武断的" },
    "asset": { ja: "資産、財産", zh: "资产，财产" },
    "assume": { ja: "仮定する、推定する", zh: "假设，推定" },
    "assure": { ja: "保証する、確信させる", zh: "保证，确信" },
    "attach": { ja: "添付する、付ける", zh: "附加，贴上" },
    "attain": { ja: "達成する、獲得する", zh: "达成，获得" },
    "attend": { ja: "出席する", zh: "出席" },
    "attribute": { ja: "属性、特徴", zh: "属性，特征" },
    "authorize": { ja: "承認する、権限を与える", zh: "授权，批准" },
    "available": { ja: "利用可能な、使用できる", zh: "可用的，可获得的" },
    "average": { ja: "平均の", zh: "平均的" },
    "better": { ja: "より良い", zh: "更好的" },
    "blocks": { ja: "ブロック、区間", zh: "块，区间" },
    "browser": { ja: "ブラウザ", zh: "浏览器" },
    "burnout": { ja: "燃え尽き、疲労", zh: "倦怠，疲劳" },
    "categories": { ja: "カテゴリー", zh: "类别" },
    "categorizes": { ja: "分類する", zh: "分类" },
    "close": { ja: "閉じる", zh: "关闭" },
    "collaboration": { ja: "協力、協業", zh: "合作，协作" },
    "communication": { ja: "コミュニケーション、意思疎通", zh: "沟通，交流" },
    "concentration": { ja: "集中", zh: "集中" },
    "conclude": { ja: "結論を出す、終了する", zh: "得出结论，结束" },
    "confirm": { ja: "確認する", zh: "确认" },
    "consistently": { ja: "一貫して", zh: "一致地" },
    "contact": { ja: "連絡する", zh: "联系" },
    "covering": { ja: "カバーする、含む", zh: "覆盖，包含" },
    "create": { ja: "作る", zh: "创造" },
    "critical": { ja: "重要な、批判的な", zh: "关键的，批判的" },
    "crucial": { ja: "重要な、決定的な", zh: "关键的，决定性的" },
    "current": { ja: "現在の", zh: "当前的" },
    "customer": { ja: "顧客", zh: "顾客" },
    "deadlines": { ja: "締切、期限", zh: "截止日期，期限" },
    "dedicated": { ja: "専用の、献身的な", zh: "专用的，专注的" },
    "departments": { ja: "部門", zh: "部门" },
    "dietary": { ja: "食事の、食事療法の", zh: "饮食的，膳食的" },
    "different": { ja: "異なる", zh: "不同的" },
    "distractions": { ja: "気を散らすもの", zh: "干扰因素" },
    "distracted": { ja: "気が散った、邪魔された", zh: "分心的，被打扰的" },
    "effective": { ja: "効果的な", zh: "有效的" },
    "eliminate": { ja: "排除する", zh: "消除" },
    "employees": { ja: "従業員", zh: "员工" },
    "engagement": { ja: "関与、従事", zh: "参与，从事" },
    "entertainment": { ja: "娯楽、エンターテインメント", zh: "娱乐" },
    "environment": { ja: "環境", zh: "环境" },
    "essential": { ja: "必須の", zh: "必要的" },
    "evaluate": { ja: "評価する", zh: "评估" },
    "excellence": { ja: "優秀さ、卓越", zh: "卓越，优秀" },
    "expanding": { ja: "拡大する", zh: "扩展" },
    "extension": { ja: "内線番号", zh: "分机号" },
    "fast-paced": { ja: "高速の", zh: "快节奏的" },
    "finally": { ja: "最後に", zh: "最后" },
    "fiscal": { ja: "財政の、会計の", zh: "财政的，会计的" },
    "fitness": { ja: "健康、体力", zh: "健康，体能" },
    "focused": { ja: "集中した", zh: "专注的" },
    "free": { ja: "自由な、無料の", zh: "自由的，免费的" },
    "helpful": { ja: "役立つ", zh: "有帮助的" },
    "however": { ja: "しかし", zh: "然而" },
    "importance": { ja: "重要性", zh: "重要性" },
    "improve": { ja: "改善する", zh: "改善" },
    "includes": { ja: "含む", zh: "包括" },
    "indicate": { ja: "示す、表示する", zh: "表明，显示" },
    "information": { ja: "情報", zh: "信息" },
    "initiatives": { ja: "計画、イニシアチブ", zh: "计划，倡议" },
    "interruptions": { ja: "中断、妨害", zh: "中断，干扰" },
    "irrelevant": { ja: "無関係な", zh: "无关的" },
    "items": { ja: "項目", zh: "项目" },
    "learn": { ja: "学ぶ", zh: "学习" },
    "leads": { ja: "導く、もたらす", zh: "引导，导致" },
    "maintain": { ja: "維持する", zh: "维持" },
    "management": { ja: "管理、経営", zh: "管理，经营" },
    "meeting": { ja: "会議、会うこと", zh: "会议，见面" },
    "meetings": { ja: "会議", zh: "会议" },
    "minutes": { ja: "分", zh: "分钟" },
    "momentum": { ja: "推進力、モメンタム", zh: "动力，势头" },
    "moving": { ja: "移動する", zh: "移动的" },
    "multiple": { ja: "複数の", zh: "多个的" },
    "necessary": { ja: "必要な", zh: "必要的" },
    "notifications": { ja: "通知", zh: "通知" },
    "notify": { ja: "知らせる、通知する", zh: "通知" },
    "occupancy": { ja: "占有、収容", zh: "占用，容纳" },
    "only": { ja: "のみ", zh: "只有" },
    "opportunities": { ja: "機会", zh: "机会" },
    "outlining": { ja: "概要を説明する", zh: "概述" },
    "overcommitting": { ja: "過度に約束する", zh: "过度承诺" },
    "participants": { ja: "参加者", zh: "参与者" },
    "periods": { ja: "期間", zh: "期间" },
    "poor": { ja: "悪い、貧しい", zh: "差的，贫穷的" },
    "prefer": { ja: "好む", zh: "偏好" },
    "presentation": { ja: "発表、プレゼンテーション", zh: "演示，展示" },
    "prevent": { ja: "防ぐ", zh: "防止" },
    "prevents": { ja: "防ぐ", zh: "防止" },
    "priorities": { ja: "優先順位", zh: "优先级" },
    "prioritize": { ja: "優先順位を付ける", zh: "确定优先级" },
    "productivity": { ja: "生産性", zh: "生产力" },
    "professionals": { ja: "専門家", zh: "专业人士" },
    "protecting": { ja: "保護する", zh: "保护" },
    "quadrants": { ja: "象限", zh: "象限" },
    "quality": { ja: "品質", zh: "质量" },
    "recreational": { ja: "レクリエーションの", zh: "娱乐的" },
    "reduce": { ja: "減らす", zh: "减少" },
    "refocus": { ja: "再集中する", zh: "重新聚焦" },
    "request": { ja: "要求", zh: "请求" },
    "requested": { ja: "要求された", zh: "被请求的" },
    "requests": { ja: "要求", zh: "请求" },
    "required": { ja: "必要な、要求される", zh: "必需的，要求的" },
    "research": { ja: "研究", zh: "研究" },
    "responses": { ja: "応答", zh: "响应" },
    "restrictions": { ja: "制限", zh: "限制" },
    "results": { ja: "結果", zh: "结果" },
    "retreat": { ja: "会議、リトリート", zh: "静修，撤退" },
    "schedule": { ja: "スケジュールを組む", zh: "安排日程" },
    "shows": { ja: "示す", zh: "显示" },
    "significantly": { ja: "大幅に、かなり", zh: "显著地，大幅地" },
    "special": { ja: "特別な", zh: "特别的" },
    "specific": { ja: "具体的な", zh: "具体的" },
    "sports": { ja: "スポーツ", zh: "运动" },
    "strategic": { ja: "戦略的な", zh: "战略的" },
    "strategies": { ja: "戦略", zh: "策略" },
    "strengthen": { ja: "強化する", zh: "加强" },
    "stress": { ja: "ストレス", zh: "压力" },
    "struggle": { ja: "苦労する、困難に直面する", zh: "挣扎，困难" },
    "tabs": { ja: "タブ", zh: "标签" },
    "takes": { ja: "かかる", zh: "花费" },
    "tasks": { ja: "タスク", zh: "任务" },
    "techniques": { ja: "技術", zh: "技巧" },
    "those": { ja: "それら", zh: "那些" },
    "these": { ja: "これら", zh: "这些" },
    "topics": { ja: "トピック", zh: "主题" },
    "transform": { ja: "変える", zh: "转变" },
    "transportation": { ja: "交通、輸送", zh: "交通，运输" },
    "types": { ja: "タイプ", zh: "类型" },
    "unnecessary": { ja: "不要な", zh: "不必要的" },
    "upcoming": { ja: "来る、予定の", zh: "即将到来的" },
    "urgent": { ja: "緊急の", zh: "紧急的" },
    "urgency": { ja: "緊急", zh: "紧急" },
    "useful": { ja: "有用な", zh: "有用的" },
    "use": { ja: "使う", zh: "使用" },
    "valuable": { ja: "価値のある", zh: "有价值的" },
    "various": { ja: "様々な", zh: "各种各样的" },
    "vehicles": { ja: "車両", zh: "车辆" },
    "vision": { ja: "ビジョン、展望", zh: "愿景，展望" },
    "while": { ja: "間", zh: "当...时" },
    "work": { ja: "仕事、作業", zh: "工作" },
    "workday": { ja: "労働日", zh: "工作日" },
    "workshops": { ja: "ワークショップ、セミナー", zh: "研讨会，讲习班" },
    "workspace": { ja: "作業空間", zh: "工作空间" }
};

// 각 단어에 중국어/일본어 뜻 추가
dictionary.words.forEach(word => {
    const wordLower = word.word.toLowerCase();
    if (translations[wordLower]) {
        word.chineseMeaning = translations[wordLower].zh;
        word.japaneseMeaning = translations[wordLower].ja;
    } else {
        // 번역이 없는 경우 빈 문자열로 초기화
        word.chineseMeaning = word.chineseMeaning || '';
        word.japaneseMeaning = word.japaneseMeaning || '';
    }
});

// 파일 저장
fs.writeFileSync(dictionaryPath, JSON.stringify(dictionary, null, 2), 'utf8');

console.log(`✅ TOEIC 사전에 중국어/일본어 뜻 필드 추가 완료!`);
console.log(`총 ${dictionary.words.length}개의 단어 처리됨`);
console.log(`번역이 추가된 단어: ${Object.keys(translations).length}개`);
console.log(`번역이 필요한 단어: ${dictionary.words.length - Object.keys(translations).length}개`);

