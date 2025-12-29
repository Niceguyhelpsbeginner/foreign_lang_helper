const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generatePDF() {
    console.log('🚀 PDF 생성 시작...');
    
    // README.md 파일 읽기
    const readmeContent = fs.readFileSync('README.md', 'utf8');
    
    // 이미지 태그에서 width와 height 추출하여 비율 계산 및 HTML 변환
    const processImages = (content) => {
        return content.replace(/<img[^>]*width="(\d+)"[^>]*height="(\d+)"[^>]*src="([^"]+)"[^>]*>/g, (match, width, height, src) => {
            const w = parseInt(width);
            const h = parseInt(height);
            const aspectRatio = (h / w * 100).toFixed(2);
            // PDF에서 이미지가 너무 크면 최대 너비 제한 (A4 용지에 맞춤)
            const maxWidth = 700; // A4 용지 너비에 맞춤
            const calculatedWidth = w > maxWidth ? maxWidth : w;
            const calculatedHeight = Math.round(calculatedWidth * h / w);
            
            console.log(`이미지 처리: ${w}x${h} -> ${calculatedWidth}x${calculatedHeight} (비율 유지: ${aspectRatio}%)`);
            
            return `<img src="${src}" alt="image" style="width: ${calculatedWidth}px; height: ${calculatedHeight}px; max-width: 100%; display: block; margin: 20px auto; page-break-inside: avoid;" />`;
        });
    };
    
    // Markdown을 HTML로 변환 (간단한 변환)
    const markdownToHtml = (md) => {
        let html = md;
        
        // 이미지 처리
        html = processImages(html);
        
        // 헤더 변환
        html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // 볼드
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // 이탤릭
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // 체크박스
        html = html.replace(/^- \[ \] (.*$)/gim, '<li style="list-style: none;">☐ $1</li>');
        html = html.replace(/^- \[x\] (.*$)/gim, '<li style="list-style: none;">☑ $1</li>');
        
        // 리스트
        html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        // 코드 블록
        html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // 링크
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
        
        // 수평선
        html = html.replace(/^---$/gim, '<hr>');
        
        // 줄바꿈 처리
        const lines = html.split('\n');
        let result = [];
        let inList = false;
        let inCode = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('<pre>')) {
                inCode = true;
                result.push(line);
            } else if (line.startsWith('</pre>')) {
                inCode = false;
                result.push(line);
            } else if (line.startsWith('<ul>') || line.startsWith('<li>')) {
                inList = true;
                result.push(line);
            } else if (line.startsWith('</ul>')) {
                inList = false;
                result.push(line);
            } else if (line.startsWith('<h') || line.startsWith('<img')) {
                result.push(line);
            } else if (line && !inCode && !inList) {
                result.push(`<p>${line}</p>`);
            } else if (line) {
                result.push(line);
            } else {
                result.push('<br>');
            }
        }
        
        return result.join('\n');
    };
    
    const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>外国語学習ヘルパー - ポートフォリオ</title>
    <style>
        @page {
            size: A4;
            margin: 2cm 1.5cm;
        }
        * {
            box-sizing: border-box;
        }
        body {
            font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Meiryo', 'MS PGothic', sans-serif;
            line-height: 1.8;
            color: #333;
            max-width: 100%;
            margin: 0;
            padding: 0;
            font-size: 11pt;
        }
        h1 {
            font-size: 24pt;
            border-bottom: 3px solid #333;
            padding-bottom: 10px;
            margin-top: 30px;
            margin-bottom: 20px;
            page-break-after: avoid;
        }
        h2 {
            font-size: 18pt;
            border-bottom: 2px solid #666;
            padding-bottom: 8px;
            margin-top: 25px;
            margin-bottom: 15px;
            page-break-after: avoid;
        }
        h3 {
            font-size: 14pt;
            margin-top: 20px;
            margin-bottom: 10px;
            page-break-after: avoid;
        }
        h4 {
            font-size: 12pt;
            margin-top: 15px;
            margin-bottom: 8px;
        }
        img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 20px auto;
            page-break-inside: avoid;
            page-break-after: avoid;
            border: 1px solid #ddd;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        code {
            background-color: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', 'Consolas', monospace;
            font-size: 10pt;
        }
        pre {
            background-color: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            page-break-inside: avoid;
            border: 1px solid #ddd;
            font-size: 9pt;
        }
        pre code {
            background: none;
            padding: 0;
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
            border-top: 2px solid #ddd;
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
            page-break-inside: avoid;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f4f4f4;
            font-weight: bold;
        }
        p {
            margin: 10px 0;
            text-align: justify;
        }
        a {
            color: #0066cc;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        strong {
            font-weight: bold;
        }
        em {
            font-style: italic;
        }
    </style>
</head>
<body>
${markdownToHtml(readmeContent)}
</body>
</html>
`;
    
    // HTML 파일 저장 (디버깅용)
    fs.writeFileSync('README_temp.html', htmlContent, 'utf8');
    console.log('✅ 임시 HTML 파일 생성 완료: README_temp.html');
    
    // Puppeteer로 PDF 생성
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // HTML 파일 경로를 file:// 프로토콜로 변환
    const htmlPath = path.resolve('README_temp.html');
    await page.goto(`file://${htmlPath}`, {
        waitUntil: 'networkidle0'
    });
    
    // 이미지 로딩 대기
    await page.evaluate(() => {
        return Promise.all(
            Array.from(document.images).map(img => {
                if (img.complete) return;
                return new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    setTimeout(resolve, 5000); // 타임아웃 5초
                });
            })
        );
    });
    
    // PDF 생성
    await page.pdf({
        path: 'README.pdf',
        format: 'A4',
        margin: {
            top: '2cm',
            right: '1.5cm',
            bottom: '2cm',
            left: '1.5cm'
        },
        printBackground: true,
        preferCSSPageSize: true
    });
    
    await browser.close();
    
    // 임시 HTML 파일 삭제
    fs.unlinkSync('README_temp.html');
    
    console.log('✅ PDF 생성 완료: README.pdf');
    console.log(`📄 파일 크기: ${(fs.statSync('README.pdf').size / 1024).toFixed(2)} KB`);
}

// 실행
generatePDF().catch(error => {
    console.error('❌ PDF 생성 오류:', error);
    process.exit(1);
});


