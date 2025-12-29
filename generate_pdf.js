const fs = require('fs');
const path = require('path');

// README.md 파일 읽기
const readmeContent = fs.readFileSync('README.md', 'utf8');

// 이미지 태그에서 width와 height 추출하여 비율 계산
const imageRegex = /<img[^>]*width="(\d+)"[^>]*height="(\d+)"[^>]*>/g;
let match;
const images = [];

while ((match = imageRegex.exec(readmeContent)) !== null) {
    const width = parseInt(match[1]);
    const height = parseInt(match[2]);
    const ratio = (height / width * 100).toFixed(2);
    images.push({ width, height, ratio, fullTag: match[0] });
    console.log(`이미지 발견: ${width}x${height} (비율: ${ratio}%)`);
}

// HTML 생성 (이미지 비율 유지)
let htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>外国語学習ヘルパー - ポートフォリオ</title>
    <style>
        @page {
            size: A4;
            margin: 2cm;
        }
        body {
            font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 100%;
            margin: 0;
            padding: 20px;
        }
        h1 {
            font-size: 2em;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-top: 30px;
        }
        h2 {
            font-size: 1.5em;
            border-bottom: 1px solid #666;
            padding-bottom: 5px;
            margin-top: 25px;
        }
        h3 {
            font-size: 1.2em;
            margin-top: 20px;
        }
        img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 20px auto;
            page-break-inside: avoid;
        }
        code {
            background-color: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        pre {
            background-color: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            page-break-inside: avoid;
        }
        ul, ol {
            margin: 10px 0;
            padding-left: 30px;
        }
        li {
            margin: 5px 0;
        }
        hr {
            border: none;
            border-top: 1px solid #ddd;
            margin: 30px 0;
        }
        blockquote {
            border-left: 4px solid #ddd;
            padding-left: 15px;
            margin: 15px 0;
            color: #666;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 15px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f4f4f4;
        }
    </style>
</head>
<body>
`;

// Markdown을 HTML로 변환 (간단한 변환)
const markdownToHtml = (md) => {
    let html = md;
    
    // 이미지 태그 처리 (비율 유지)
    html = html.replace(/<img[^>]*width="(\d+)"[^>]*height="(\d+)"[^>]*src="([^"]+)"[^>]*>/g, (match, width, height, src) => {
        const w = parseInt(width);
        const h = parseInt(height);
        const aspectRatio = (h / w * 100).toFixed(2);
        // PDF에서 이미지가 너무 크면 최대 너비 제한
        const maxWidth = 800;
        const calculatedWidth = w > maxWidth ? maxWidth : w;
        const calculatedHeight = (calculatedWidth * h / w).toFixed(0);
        
        return `<img src="${src}" alt="image" style="width: ${calculatedWidth}px; height: ${calculatedHeight}px; max-width: 100%; height: auto; aspect-ratio: ${w}/${h}; object-fit: contain;" />`;
    });
    
    // 헤더 변환
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // 볼드
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 리스트
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // 코드 블록
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // 링크
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    
    // 줄바꿈
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    html = html.replace(/<p><h/g, '<h');
    html = html.replace(/<\/h([1-6])><\/p>/g, '</h$1>');
    html = html.replace(/<p><ul>/g, '<ul>');
    html = html.replace(/<\/ul><\/p>/g, '</ul>');
    html = html.replace(/<p><pre>/g, '<pre>');
    html = html.replace(/<\/pre><\/p>/g, '</pre>');
    
    return html;
};

htmlContent += markdownToHtml(readmeContent);
htmlContent += `
</body>
</html>
`;

// HTML 파일 저장
fs.writeFileSync('README.html', htmlContent, 'utf8');
console.log('✅ README.html 파일이 생성되었습니다.');

// PDF 생성을 위한 안내
console.log('\n📄 PDF 생성 방법:');
console.log('1. 브라우저에서 README.html 파일을 엽니다');
console.log('2. Ctrl+P (또는 Cmd+P)를 눌러 인쇄 대화상자를 엽니다');
console.log('3. "대상"을 "PDF로 저장"으로 선택합니다');
console.log('4. "레이아웃"을 "세로"로 설정합니다');
console.log('5. "여백"을 "기본값" 또는 "없음"으로 설정합니다');
console.log('6. "배경 그래픽"을 체크합니다');
console.log('7. "저장"을 클릭합니다\n');

console.log('또는 puppeteer를 사용하여 자동으로 PDF를 생성할 수 있습니다:');
console.log('npm install puppeteer');
console.log('node generate_pdf_puppeteer.js');


