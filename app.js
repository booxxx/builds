const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080; // 3000에서 8080으로 포트 변경

// JSON 파싱 미들웨어
app.use(express.json());

// public 폴더를 정적 파일 루트로 지정
app.use(express.static(path.join(__dirname, 'public')));

// 데이터 디렉토리와 goals 파일 경로 설정
const dataDir = path.join(__dirname, 'data'); // 필요 시 '/progresss/data' 로 변경 가능
const goalsFilePath = path.join(dataDir, 'goals.json');

// 데이터 디렉토리가 없으면 생성
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// goals.json 파일이 없으면 초기 데이터로 생성
if (!fs.existsSync(goalsFilePath)) {
  const initialData = [
    { id: 1, title: "주 3회 운동하기", current: 2, total: 3, lastModified: new Date().toISOString() },
    { id: 2, title: "한달 독서 목표", current: 3, total: 10, lastModified: new Date().toISOString() }
  ];
  fs.writeFileSync(goalsFilePath, JSON.stringify(initialData, null, 2), 'utf8');
}

// 목표 데이터 조회 API
app.get('/api/goals', (req, res) => {
  try {
    const data = fs.readFileSync(goalsFilePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('데이터 읽기 에러:', error);
    res.status(500).json({ error: '데이터를 불러오는 중 오류가 발생했습니다.' });
  }
});

// 목표 데이터 저장 API
app.post('/api/goals', (req, res) => {
  try {
    const goals = req.body;
    fs.writeFileSync(goalsFilePath, JSON.stringify(goals, null, 2), 'utf8');
    res.json({ success: true, message: '데이터가 성공적으로 저장되었습니다.' });
  } catch (error) {
    console.error('데이터 저장 에러:', error);
    res.status(500).json({ success: false, error: '데이터 저장 중 오류가 발생했습니다.' });
  }
});

// 그 외의 요청은 index.html 파일 제공 (SPA 구성 시 유용)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});