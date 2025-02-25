// 전역 변수 선언
let goals = [];

// 목표를 화면에 렌더링하는 함수
function renderGoals() {
  const goalsContainer = document.getElementById('goals');
  if (!goalsContainer) return;
  goalsContainer.innerHTML = '';
  goals.forEach(goal => {
    const goalDiv = document.createElement('div');
    goalDiv.textContent = `${goal.title}: ${goal.current} / ${goal.total}`;
    goalsContainer.appendChild(goalDiv);
  });
}

// 상태 메시지를 표시하는 함수
function showStatus(message, isError = false) {
  const statusDiv = document.getElementById('status');
  if (statusDiv) {
    statusDiv.textContent = message;
    statusDiv.style.color = isError ? 'red' : 'green';
  } else {
    alert(message);
  }
}

// 목표 데이터 로드 (async/await 사용)
async function loadGoals() {
  try {
    const response = await fetch('/api/goals');
    if (!response.ok) {
      throw new Error(`서버에서 데이터를 불러오는데 실패했습니다: ${response.status}`);
    }
    const data = await response.json();
    console.log('서버에서 로드된 데이터:', data);
    if (Array.isArray(data)) {
      goals = data;
    } else if (data.error) {
      console.error('서버 에러:', data.error);
      alert(`데이터 로딩 에러: ${data.error}`);
      // 기본 데이터 사용
      goals = [
        { id: 1, title: "주 3회 운동하기", current: 2, total: 3 },
        { id: 2, title: "한달 독서 목표", current: 3, total: 10 }
      ];
    }
  } catch (error) {
    console.error('데이터 로딩 에러:', error);
    alert(`데이터 로딩 중 오류가 발생했습니다: ${error.message}`);
    // 통신 실패 시 기본 데이터 사용
    goals = [
      { id: 1, title: "주 3회 운동하기", current: 2, total: 3 },
      { id: 2, title: "한달 독서 목표", current: 3, total: 10 }
    ];
  } finally {
    renderGoals();
  }
}

// 목표 데이터 저장 (async/await 사용)
async function saveGoals() {
  try {
    console.log('저장할 데이터:', goals);
    const response = await fetch('/api/goals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(goals)
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(`데이터 저장에 실패했습니다: ${data.error || response.status}`);
    }
    const data = await response.json();
    console.log('저장 응답:', data);
    if (data.success) {
      showStatus('데이터가 성공적으로 저장되었습니다.');
    } else {
      showStatus(`데이터 저장에 실패했습니다: ${data.error || '알 수 없는 오류'}`, true);
    }
  } catch (error) {
    console.error('저장 에러:', error);
    showStatus(`서버 통신 중 오류가 발생했습니다: ${error.message}`, true);
  }
}
