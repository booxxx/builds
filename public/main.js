// 전역 변수 선언
let goals = [];

// 목표를 화면에 렌더링하는 함수
function renderGoals() {
  const goalsContainer = document.getElementById('goals-container');
  if (!goalsContainer) return;
  goalsContainer.innerHTML = '';

  goals.forEach(goal => {
    const goalDiv = document.createElement('div');
    goalDiv.classList.add('progress-container');

    // 목표 제목 및 진행률 표시
    const progressPercentage = Math.min(100, Math.round((goal.current / goal.total) * 100));
    goalDiv.innerHTML = `
      <div class="progress-title">
        <span>${goal.title}</span>
        <span>${goal.current} / ${goal.total}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-text">${progressPercentage}%</div>
        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
      </div>
      <div class="progress-markers" id="markers-${goal.id}"></div>
    `;

    // 마커 렌더링
    const markersContainer = goalDiv.querySelector('.progress-markers');
    if (goal.markers && goal.markers.length > 0) {
      goal.markers.forEach(markerDate => {
        const markerDiv = document.createElement('div');
        markerDiv.classList.add('progress-marker');
        markerDiv.style.left = `${Math.min(100, (goal.current / goal.total) * 100)}%`;
        markerDiv.innerHTML = `
          <div class="marker-line"></div>
          <div class="marker-date">${markerDate}</div>
        `;
        markersContainer.appendChild(markerDiv);
      });
    }

    goalsContainer.appendChild(goalDiv);
  });
}

// 목표 데이터 로드
async function loadGoals() {
  try {
    const response = await fetch('/api/goals');
    if (!response.ok) {
      throw new Error(`서버에서 데이터를 불러오는데 실패했습니다: ${response.status}`);
    }
    goals = await response.json();
    renderGoals();
  } catch (error) {
    console.error('데이터 로딩 에러:', error);
  }
}

// 목표 데이터 저장
async function saveGoals() {
  try {
    const response = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goals)
    });
    
    if (!response.ok) {
      throw new Error(`데이터 저장에 실패했습니다`);
    }
    
    const data = await response.json();
    if (data.success) {
      console.log('데이터가 성공적으로 저장되었습니다.');
    }
  } catch (error) {
    console.error('저장 에러:', error);
  }
}

// 목표 데이터 수정
function updateGoal(goalId, newCurrent) {
  const goalIndex = goals.findIndex(g => g.id === goalId);
  if (goalIndex === -1) return;

  const goal = goals[goalIndex];
  
  // 현재 값이 증가한 경우에만 처리
  if (newCurrent > goal.current) {
    // 날짜 포맷 (MM/DD)
    const date = new Date();
    const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;

    // 마커 추가 (없으면 배열 생성)
    if (!goal.markers) {
      goal.markers = [];
    }
    goal.markers.push(formattedDate);

    // 현재 값 업데이트
    goal.current = newCurrent;
    goal.lastModified = new Date().toISOString();

    // UI 업데이트 및 저장
    renderGoals();
    saveGoals();
  }
}

// 관리자 패널 초기화
function initAdminPanel() {
  const showLoginBtn = document.getElementById('show-login-btn');
  const loginContainer = document.getElementById('login-container');
  const loginBtn = document.getElementById('login-btn');
  const cancelLoginBtn = document.getElementById('cancel-login-btn');
  const passwordInput = document.getElementById('password');
  const loginError = document.getElementById('login-error');
  const adminPanel = document.getElementById('admin-panel');
  const logoutBtn = document.getElementById('logout-btn');
  const addGoalBtn = document.getElementById('add-goal-btn');
  const editForm = document.getElementById('edit-form');
  const saveEditBtn = document.getElementById('save-edit-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');

  let currentEditGoalId = null;

  // 관리자 로그인 버튼 클릭 시
  showLoginBtn.addEventListener('click', () => {
    loginContainer.classList.remove('hidden');
  });

  // 로그인 취소 버튼 클릭 시
  cancelLoginBtn.addEventListener('click', () => {
    loginContainer.classList.add('hidden');
    passwordInput.value = '';
    loginError.classList.add('hidden');
  });

  // 로그인 버튼 클릭 시
  loginBtn.addEventListener('click', () => {
    // 비밀번호 임시 하드코딩 (실제 운영 시 보안 강화 필요)
    if (passwordInput.value === 'admin123') {
      loginContainer.classList.add('hidden');
      adminPanel.classList.remove('hidden');
      
      // 목표 추가 기능
      addGoalBtn.addEventListener('click', () => {
        const title = document.getElementById('goal-title').value;
        const current = parseInt(document.getElementById('current-count').value);
        const total = parseInt(document.getElementById('total-count').value);

        if (title && !isNaN(current) && !isNaN(total) && total > 0) {
          const newGoal = {
            id: goals.length > 0 ? Math.max(...goals.map(g => g.id)) + 1 : 1,
            title,
            current,
            total,
            markers: [],
            lastModified: new Date().toISOString()
          };

          goals.push(newGoal);
          saveGoals();
          renderGoals();

          // 입력 필드 초기화
          document.getElementById('goal-title').value = '';
          document.getElementById('current-count').value = '0';
          document.getElementById('total-count').value = '10';
        }
      });

      // 목표 수정 기능 초기화
      goals.forEach(goal => {
        const editButton = document.createElement('button');
        editButton.textContent = '수정';
        editButton.addEventListener('click', () => {
          currentEditGoalId = goal.id;
          document.getElementById('edit-title').value = goal.title;
          document.getElementById('edit-current').value = goal.current;
          document.getElementById('edit-total').value = goal.total;
          editForm.classList.remove('hidden');
        });
        
        const goalContainer = document.querySelector(`.progress-container:nth-child(${goals.indexOf(goal) + 1})`);
        if (goalContainer) {
          goalContainer.appendChild(editButton);
        }
      });

      // 목표 수정 저장 버튼
      saveEditBtn.addEventListener('click', () => {
        const goalIndex = goals.findIndex(g => g.id === currentEditGoalId);
        if (goalIndex !== -1) {
          goals[goalIndex].title = document.getElementById('edit-title').value;
          goals[goalIndex].current = parseInt(document.getElementById('edit-current').value);
          goals[goalIndex].total = parseInt(document.getElementById('edit-total').value);
          
          saveGoals();
          renderGoals();
          editForm.classList.add('hidden');
        }
      });

      // 목표 수정 취소 버튼
      cancelEditBtn.addEventListener('click', () => {
        editForm.classList.add('hidden');
      });

      // 로그아웃 기능
      logoutBtn.addEventListener('click', () => {
        adminPanel.classList.add('hidden');
        passwordInput.value = '';
      });
    } else {
      loginError.classList.remove('hidden');
    }
  });
}

// 초기 실행
document.addEventListener('DOMContentLoaded', () => {
  loadGoals();
  initAdminPanel();
});

// 개발 편의를 위한 글로벌 함수 (콘솔에서 목표 업데이트 테스트 가능)
window.updateGoal = updateGoal;