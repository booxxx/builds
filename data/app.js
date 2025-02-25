const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// JSON 파싱 미들웨어
app.use(express.json());

// 정적 파일 제공
app.use(express.static('public'));

// data 디렉토리 경로
const dataDir = path.join(__dirname, 'data');
const goalsFilePath = path.join(dataDir, 'goals.json');

// data 디렉토리가 없으면 생성
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 초기 goals.json 파일이 없으면 생성
if (!fs.existsSync(goalsFilePath)) {
  const initialData = [
    { id: 1, title: "주 3회 운동하기", current: 2, total: 3 },
    { id: 2, title: "한달 독서 목표", current: 3, total: 10 }
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

// 메인 HTML 파일 제공
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
