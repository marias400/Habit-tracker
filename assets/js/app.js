/* =========================================
   HABIT TRACKER — app.js
   Único archivo JS. Maneja:
   - Datos de hábitos en localStorage
   - Toggle check-ins en Dashboard
   - Renderizado dinámico
   - Modal para agregar hábitos
   - Login/Logout
   - Tabla de estadísticas
   ========================================= */

// ---- Category emoji map ----
const CAT_EMOJI = {
  salud: '💧',
  ejercicio: '🏃',
  creatividad: '🎸',
  bienestar: '🧘',
  educacion: '📚',
};

const CAT_BG = {
  salud: '#E0F2FE',
  ejercicio: '#DCFCE7',
  creatividad: '#FEF3C7',
  bienestar: '#EDE9FE',
  educacion: '#FCE7F3',
};

// ---- Default seed habits ----
const DEFAULT_HABITS = [
  { id: 'h1', name: 'Meditar', category: 'bienestar' },
  { id: 'h2', name: 'Tesis', category: 'educacion' },
  { id: 'h3', name: 'Software', category: 'educacion' },
  { id: 'h4', name: 'Moto', category: 'ejercicio' },
  { id: 'h5', name: 'Cocinar', category: 'creatividad' },
];

// ---- LocalStorage helpers ----
function getHabits() {
  const raw = localStorage.getItem('ht_habits');
  if (!raw) {
    localStorage.setItem('ht_habits', JSON.stringify(DEFAULT_HABITS));
    return [...DEFAULT_HABITS];
  }
  return JSON.parse(raw);
}

function saveHabits(habits) {
  localStorage.setItem('ht_habits', JSON.stringify(habits));
}

function getCheckins() {
  // Seed demo data on first load (only once)
  if (!localStorage.getItem('ht_seeded')) {
    seedDemoData();
    localStorage.setItem('ht_seeded', 'true');
  }
  const raw = localStorage.getItem('ht_checkins');
  return raw ? JSON.parse(raw) : {};
}

function saveCheckins(checkins) {
  localStorage.setItem('ht_checkins', JSON.stringify(checkins));
}

// ---- Seed Demo Data (last 90 days) ----
function seedDemoData() {
  const habits = getHabits();
  const checkins = {};

  // Completion probability per habit (makes stats interesting and varied)
  const completionRates = {
    h1: 0.85,  // Meditar — very consistent
    h2: 0.55,  // Tesis — moderate, some slumps
    h3: 0.70,  // Software — good
    h4: 0.40,  // Moto — inconsistent
    h5: 0.75,  // Cocinar — good
  };

  // Simple seeded pseudo-random for deterministic but natural-looking data
  let seed = 42;
  function seededRandom() {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  const today = new Date();
  const daysBack = 90; // ~3 months of data

  habits.forEach(habit => {
    checkins[habit.id] = {};
    const baseRate = completionRates[habit.id] || 0.6;

    for (let i = 0; i < daysBack; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      // Add weekly rhythm: slightly lower on weekends for some habits
      const dayOfWeek = d.getDay(); // 0=Sun, 6=Sat
      let adjustedRate = baseRate;

      // Moto and Tesis less likely on weekends
      if ((habit.id === 'h2' || habit.id === 'h4') && (dayOfWeek === 0 || dayOfWeek === 6)) {
        adjustedRate *= 0.4;
      }

      // Cocinar more likely on weekends
      if (habit.id === 'h5' && (dayOfWeek === 0 || dayOfWeek === 6)) {
        adjustedRate = Math.min(adjustedRate * 1.3, 1.0);
      }

      // Simulate a "slump week" around 30-40 days ago
      if (i >= 30 && i <= 37) {
        adjustedRate *= 0.3;
      }

      // Simulate a "great week" around 14-20 days ago
      if (i >= 14 && i <= 20) {
        adjustedRate = Math.min(adjustedRate * 1.4, 1.0);
      }

      if (seededRandom() < adjustedRate) {
        checkins[habit.id][key] = true;
      }
    }
  });

  saveCheckins(checkins);
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getSelectedDateKey() {
  const dateInput = document.getElementById('dateInput');
  return (dateInput && dateInput.value) ? dateInput.value : todayKey();
}

function isChecked(habitId) {
  const checkins = getCheckins();
  return !!checkins[habitId]?.[getSelectedDateKey()];
}

function toggleCheckin(habitId) {
  const checkins = getCheckins();
  if (!checkins[habitId]) checkins[habitId] = {};
  const key = getSelectedDateKey();
  checkins[habitId][key] = !checkins[habitId][key];
  saveCheckins(checkins);
}

function deleteHabit(habitId) {
  const habits = getHabits().filter(h => h.id !== habitId);
  saveHabits(habits);
  const checkins = getCheckins();
  delete checkins[habitId];
  saveCheckins(checkins);
}

function calculateStreak(habitId) {
  const checkins = getCheckins()[habitId] || {};
  let streak = 0;
  const d = new Date();
  
  // Check today first
  const keyToday = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  if (checkins[keyToday]) {
    streak = 1;
  }
  
  // Go backwards
  for (let i = streak === 1 ? 1 : 1; i < 365; i++) {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - i);
    const key = `${pastDate.getFullYear()}-${String(pastDate.getMonth()+1).padStart(2,'0')}-${String(pastDate.getDate()).padStart(2,'0')}`;
    if (checkins[key]) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// ---- Toast ----
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.classList.add('fade-out'); }, 2000);
  setTimeout(() => { t.remove(); }, 2300);
}

// ---- Wait for DOM ----
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  const path = window.location.pathname;

  // ========== LOGIN PAGE ==========
  if (path.endsWith('login.html') || path.endsWith('login')) {
    const form = document.getElementById('loginForm');
    const togglePw = document.getElementById('togglePw');
    const pwInput = document.getElementById('loginPassword');

    if (togglePw && pwInput) {
      togglePw.addEventListener('click', () => {
        const isPassword = pwInput.type === 'password';
        pwInput.type = isPassword ? 'text' : 'password';
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        localStorage.setItem('ht_logged_in', 'true');
        window.location.href = 'index.html';
      });
    }
    return; // Don't run the rest on login page
  }

  // ========== BELL BUTTON (all pages) ==========
  const bellBtn = document.getElementById('bellBtn');
  if (bellBtn) {
    bellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      let notifPanel = document.getElementById('notifPanel');
      if (!notifPanel) {
        notifPanel = document.createElement('div');
        notifPanel.id = 'notifPanel';
        notifPanel.className = 'notif-panel';
        notifPanel.innerHTML = `
          <div class="notif-header">Notificaciones</div>
          <div class="notif-item">
            <div class="notif-icon"><i data-lucide="award"></i></div>
            <div class="notif-text">¡Llegaste a una racha de 7 días!</div>
          </div>
          <div class="notif-item">
            <div class="notif-icon"><i data-lucide="bell"></i></div>
            <div class="notif-text">No olvides completar tus hábitos de hoy.</div>
          </div>
        `;
        document.body.appendChild(notifPanel);
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
      notifPanel.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      const notifPanel = document.getElementById('notifPanel');
      if (notifPanel && notifPanel.classList.contains('show') && !e.target.closest('#notifPanel') && !e.target.closest('#bellBtn')) {
        notifPanel.classList.remove('show');
      }
    });
  }

  // ========== DASHBOARD DATE SELECTOR ==========
  const dateInput = document.getElementById('dateInput');
  if (dateInput) {
    dateInput.value = todayKey();
    dateInput.addEventListener('change', () => {
      renderDashboard();
    });
  }

  // ========== MOBILE SIDEBAR TOGGLE ==========
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const sidebar = document.querySelector('.sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  function openSidebar() {
    if (sidebar) sidebar.classList.add('open');
    if (sidebarOverlay) sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
      if (sidebar && sidebar.classList.contains('open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
  }

  // Close sidebar when a nav link is clicked (mobile)
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        closeSidebar();
      }
    });
  });

  // Close sidebar on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      closeSidebar();
    }
  });

  // ========== DARK MODE ==========
  const savedTheme = localStorage.getItem('ht_theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }

  const themeToggle = document.getElementById('themeToggle');
  const themeText = document.getElementById('themeText');
  const themeIcon = document.getElementById('themeIcon');
  if (themeToggle && themeText && themeIcon) {
    if (document.body.classList.contains('dark-mode')) {
      themeText.textContent = 'Claro';
      themeIcon.setAttribute('data-lucide', 'sun');
      themeToggle.checked = true;
    }

    themeToggle.addEventListener('change', (e) => {
      const isDark = e.target.checked;
      if (isDark) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
      localStorage.setItem('ht_theme', isDark ? 'dark' : 'light');
      
      themeText.textContent = isDark ? 'Claro' : 'Oscuro';
      themeIcon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
      lucide.createIcons();

      if (window.location.pathname.includes('statistics.html')) {
        renderStats();
      }
    });
  }

  // ========== LOGOUT (all pages) ==========
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('¿Cerrar sesión?')) {
        localStorage.removeItem('ht_logged_in');
        window.location.href = 'login.html';
      }
    });
  }

  // ========== DASHBOARD (index.html) ==========
  const habitListEl = document.getElementById('habitList');
  if (habitListEl) {
    renderDashboard();
  }

  // ========== EXCEL IMPORT/EXPORT ==========
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const habits = getHabits();
      const checkins = getCheckins();
      
      const data = [];
      habits.forEach(h => {
        const row = { ID: h.id, Nombre: h.name, Categoria: h.category };
        const habitCheckins = checkins[h.id] || {};
        Object.keys(habitCheckins).forEach(date => {
          if (habitCheckins[date]) row[date] = '✔';
        });
        data.push(row);
      });

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Habitos");
      XLSX.writeFile(wb, "HabitTracker_Data.xlsx");
      showToast('✅ Exportado a Excel exitosamente');
    });
  }

  const importFile = document.getElementById('importFile');
  if (importFile) {
    importFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        const newHabits = [];
        const newCheckins = {};
        
        json.forEach(row => {
          if (!row.ID || !row.Nombre) return;
          newHabits.push({ id: row.ID, name: row.Nombre, category: row.Categoria || 'bienestar' });
          newCheckins[row.ID] = {};
          Object.keys(row).forEach(key => {
            if (key !== 'ID' && key !== 'Nombre' && key !== 'Categoria') {
              if (row[key] === '✔') newCheckins[row.ID][key] = true;
            }
          });
        });

        if (newHabits.length > 0) {
          saveHabits(newHabits);
          saveCheckins(newCheckins);
          showToast('✅ Datos importados correctamente');
          if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            renderDashboard();
          }
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  // ========== STATISTICS (statistics.html) ==========
  const statsTable = document.getElementById('statsTable');
  if (statsTable) {
    const periodSelect = document.querySelector('.period-select');
    if (periodSelect) {
      periodSelect.addEventListener('change', (e) => {
        const isMonth = e.target.value.toLowerCase().includes('mes');
        renderStats(isMonth ? 30 : 7);
      });
    }
    renderStats(7);
  }

  // ========== CALENDAR (calendar.html) ==========
  const calGrid = document.getElementById('calGrid');
  if (calGrid) {
    initCalendar();
  }
});

// ===================================
// DASHBOARD RENDERING
// ===================================
function renderDashboard() {
  const habits = getHabits();
  const listEl = document.getElementById('habitList');
  if (!listEl) return;

  listEl.innerHTML = '';

  habits.forEach((habit) => {
    const checked = isChecked(habit.id);
    const emoji = CAT_EMOJI[habit.category] || '✨';
    const bg = CAT_BG[habit.category] || 'transparent';

    const streak = calculateStreak(habit.id);
    
    const card = document.createElement('div');
    card.className = 'habit-card';
    card.innerHTML = `
      <div class="habit-icon" style="background:${checked ? 'transparent' : bg}">${emoji}</div>
      <div class="habit-name" style="${checked ? 'opacity:.5;' : ''}">
        <span style="${checked ? 'text-decoration:line-through;' : ''}">${habit.name}</span>
        ${streak > 0 ? `<span style="font-size:12px; color:#F59E0B; margin-left:8px; text-decoration:none; display:inline-block;" title="Racha de ${streak} días">🔥 ${streak}</span>` : ''}
      </div>
      <button class="delete-btn" style="background:none; border:none; color:var(--danger); margin-right:12px; padding:4px;" title="Eliminar">
        <i data-lucide="trash-2" style="width:18px; height:18px;"></i>
      </button>
      <label class="toggle">
        <input type="checkbox" ${checked ? 'checked' : ''} data-id="${habit.id}">
        <span class="toggle-slider"></span>
      </label>
    `;

    const checkbox = card.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', () => {
      toggleCheckin(habit.id);
      renderDashboard();
      if (!isChecked(habit.id)) {
        // unchecked
      } else {
        showToast(`✅ ${habit.name} completado!`);
      }
    });

    const deleteBtn = card.querySelector('.delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        if (confirm(`¿Estás seguro de eliminar el hábito "${habit.name}"?`)) {
          deleteHabit(habit.id);
          renderDashboard();
          showToast(`🗑️ Hábito eliminado`);
        }
      });
    }

    listEl.appendChild(card);
  });

  updateProgressRing(habits);

  // Reinitialize icons for new content
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // ---- Add Habit Modal ----
  const addBtn = document.getElementById('addHabitBtn');
  const modal = document.getElementById('addModal');
  const cancelBtn = document.getElementById('cancelModal');
  const addForm = document.getElementById('addHabitForm');

  if (addBtn && modal) {
    addBtn.onclick = () => modal.classList.remove('hidden');
  }
  if (cancelBtn && modal) {
    cancelBtn.onclick = () => modal.classList.add('hidden');
  }
  if (modal) {
    modal.onclick = (e) => { if (e.target === modal) modal.classList.add('hidden'); };
  }
  if (addForm) {
    addForm.onsubmit = (e) => {
      e.preventDefault();
      const name = document.getElementById('newHabitName').value.trim();
      const cat = document.getElementById('newHabitCat').value;
      if (!name) return;

      const habits = getHabits();
      habits.push({ id: 'h_' + Date.now(), name, category: cat });
      saveHabits(habits);

      document.getElementById('newHabitName').value = '';
      modal.classList.add('hidden');
      showToast(`🎉 Hábito "${name}" creado!`);
      renderDashboard();
    };
  }
}

function updateProgressRing(habits) {
  const total = habits.length;
  const done = habits.filter(h => isChecked(h.id)).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const ringText = document.getElementById('dashRingText');
  const ringFill = document.getElementById('dashRingFill');
  const countText = document.getElementById('dashCount');

  if (ringText) ringText.textContent = `${pct}%`;
  if (countText) countText.textContent = `${done} DE ${total}`;

  if (ringFill) {
    const circumference = 201.1; // 2 * PI * 32
    const offset = circumference - (pct / 100) * circumference;
    ringFill.style.strokeDashoffset = offset;
  }
}

// ===================================
// STATISTICS RENDERING
// ===================================
function renderStats(daysBack = 7) {
  const habits = getHabits();
  const checkins = getCheckins();
  const tbody = document.querySelector('#statsTable tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  // Calculate a pseudo-average for each habit
  habits.forEach(habit => {
    let daysChecked = 0;
    for (let i = 0; i < daysBack; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      if (checkins[habit.id]?.[key]) daysChecked++;
    }
    const pct = Math.round((daysChecked / daysBack) * 100);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${habit.name}</td>
      <td>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" style="width:${pct}%"></div>
          <div class="progress-bar-text">${pct}%</div>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Update summary cards for the selected period
  let periodTotalCheckins = 0;
  habits.forEach(habit => {
    for (let i = 0; i < daysBack; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      if (checkins[habit.id]?.[key]) periodTotalCheckins++;
    }
  });

  const statCompleted = document.getElementById('statCompleted');
  if (statCompleted) statCompleted.textContent = periodTotalCheckins;
  
  // Calculate efficiency average for the period
  const statEfficiency = document.getElementById('statEfficiency');
  if (statEfficiency) {
    const maxPossible = habits.length * daysBack;
    const effPct = maxPossible > 0 ? Math.round((periodTotalCheckins / maxPossible) * 100) : 0;
    statEfficiency.textContent = `${effPct}%`;
    statEfficiency.nextElementSibling.textContent = daysBack === 7 ? 'Promedio semanal' : 'Promedio mensual';
  }

  // Update streak (overall)
  const statStreak = document.getElementById('statStreak');
  if (statStreak && habits.length > 0) {
    let maxStreak = 0;
    habits.forEach(h => {
       const s = calculateStreak(h.id);
       if (s > maxStreak) maxStreak = s;
    });
    statStreak.textContent = maxStreak;
  }

  // Render Chart.js
  const ctx = document.getElementById('statsChart');
  if (ctx) {
    const labels = [];
    const data = [];
    for (let i = daysBack - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      
      if (daysBack > 7) {
        labels.push(d.getDate()); // Just numbers for month view to fit
      } else {
        const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' });
        labels.push(dayName.charAt(0).toUpperCase() + dayName.slice(1));
      }
      
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      let dayTotal = 0;
      habits.forEach(h => {
        if (checkins[h.id]?.[key]) dayTotal++;
      });
      const max = habits.length || 1;
      data.push(Math.round((dayTotal / max) * 100));
    }

    // Destroy existing chart if any
    if (window.myStatsChart) {
      window.myStatsChart.destroy();
    }

    const isDarkMode = document.body.classList.contains('dark-mode');
    const primaryColor = isDarkMode ? '#00E676' : '#7C3AED';
    const gridColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
    const textColor = isDarkMode ? '#A1A1AA' : '#64748B';

    window.myStatsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Efectividad (%)',
          data: data,
          backgroundColor: primaryColor,
          borderRadius: 4,
          barPercentage: daysBack > 7 ? 0.8 : 0.6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) { return value + '%' },
              color: textColor,
              font: { family: "'Inter', sans-serif", size: 12 }
            },
            grid: { color: gridColor }
          },
          x: {
            grid: { display: false },
            ticks: {
              color: textColor,
              font: { family: "'Inter', sans-serif", size: daysBack > 7 ? 10 : 12 }
            }
          }
        }
      }
    });
  }
}

// ===================================
// CALENDAR RENDERING
// ===================================
let currentCalDate = new Date(); // Month we are currently viewing

function initCalendar() {
  const prevBtn = document.getElementById('calPrev');
  const nextBtn = document.getElementById('calNext');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentCalDate.setMonth(currentCalDate.getMonth() - 1);
      renderCalendar();
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentCalDate.setMonth(currentCalDate.getMonth() + 1);
      renderCalendar();
    });
  }

  renderCalendar();
}

function renderCalendar() {
  const calGrid = document.getElementById('calGrid');
  const calTitle = document.getElementById('calTitle');
  if (!calGrid || !calTitle) return;

  const habits = getHabits();
  const checkins = getCheckins();
  
  // Set Title
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  calTitle.innerHTML = `${monthNames[currentCalDate.getMonth()]} <span>${currentCalDate.getFullYear()}</span>`;

  // Clear grid
  calGrid.innerHTML = `
    <!-- Weekdays -->
    <div class="cal-weekday">Dom</div>
    <div class="cal-weekday">Lun</div>
    <div class="cal-weekday">Mar</div>
    <div class="cal-weekday">Mié</div>
    <div class="cal-weekday">Jue</div>
    <div class="cal-weekday">Vie</div>
    <div class="cal-weekday">Sáb</div>
  `;

  const year = currentCalDate.getFullYear();
  const month = currentCalDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const div = document.createElement('div');
    div.className = 'cal-day';
    div.innerHTML = `<div class="day-num other">${d}</div>`;
    calGrid.appendChild(div);
  }

  // Current month days
  const today = new Date();
  
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday = today.getDate() === i && today.getMonth() === month && today.getFullYear() === year;
    const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
    
    // Check what habits were done this day
    let dayEvents = '';
    let doneCount = 0;
    habits.forEach((h, index) => {
      if (checkins[h.id]?.[dateKey]) {
        doneCount++;
        const bgClass = index % 2 === 0 ? 'cal-event' : 'cal-event alt';
        if (doneCount <= 3) {
          dayEvents += `<div class="${bgClass}">${h.name}</div>`;
        }
      }
    });
    
    if (doneCount > 3) {
       dayEvents += `<div class="cal-more">+${doneCount - 3} más</div>`;
    }

    const dayClass = isToday ? 'day-num today' : 'day-num';
    
    const dayDiv = document.createElement('div');
    dayDiv.className = 'cal-day';
    dayDiv.innerHTML = `<div class="${dayClass}">${i}</div>${dayEvents}`;
    
    dayDiv.addEventListener('click', () => {
      renderDayPanel(dateKey, i, month, year, habits, checkins);
    });

    calGrid.appendChild(dayDiv);
  }

  // Next month leading days to fill grid
  const totalCellsRendered = firstDayOfMonth + daysInMonth;
  const remainingCells = (totalCellsRendered > 35 ? 42 : 35) - totalCellsRendered;
  
  for (let i = 1; i <= remainingCells; i++) {
    const div = document.createElement('div');
    div.className = 'cal-day';
    div.innerHTML = `<div class="day-num other">${i}</div>`;
    calGrid.appendChild(div);
  }
  
  // Render today's panel if viewing current month, or 1st day otherwise
  const isCurrentMonthView = today.getMonth() === month && today.getFullYear() === year;
  const focusDay = isCurrentMonthView ? today.getDate() : 1;
  const focusKey = `${year}-${String(month+1).padStart(2,'0')}-${String(focusDay).padStart(2,'0')}`;
  
  renderDayPanel(focusKey, focusDay, month, year, habits, checkins);
}

function renderDayPanel(dateKey, day, month, year, habits, checkins) {
  const panelDate = document.getElementById('dayPanelDate');
  const panelList = document.getElementById('dayPanelList');
  const ringText = document.getElementById('dayRingText');
  const ringFill = document.getElementById('dayRingFill');
  const panelCount = document.getElementById('dayPanelCount');
  
  if (!panelDate) return;

  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  panelDate.innerHTML = `<i data-lucide="calendar-days"></i><span>${day} ${monthNames[month]} ${year}</span>`;
  
  if (typeof lucide !== 'undefined') lucide.createIcons();

  let completedHtml = '<div class="detail-section-title">Completados</div>';
  let pendingHtml = '<div class="detail-section-title" style="margin-top:24px;">Pendientes</div>';
  
  let done = 0;
  let total = habits.length;

  habits.forEach(h => {
    if (checkins[h.id]?.[dateKey]) {
      done++;
      completedHtml += `
        <div class="detail-habit">
          <div class="detail-check done"><i data-lucide="check"></i></div>
          ${h.name}
        </div>
      `;
    } else {
      pendingHtml += `
        <div class="detail-habit">
          <div class="detail-check pending"></div>
          ${h.name}
        </div>
      `;
    }
  });

  if (done === 0) completedHtml += '<div style="font-size:12px; color:var(--text-secondary);">Nada completado</div>';
  if (done === total && total > 0) pendingHtml += '<div style="font-size:12px; color:var(--text-secondary);">¡Todo listo!</div>';

  panelList.innerHTML = completedHtml + pendingHtml;
  if (typeof lucide !== 'undefined') lucide.createIcons();

  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  
  if (ringText) ringText.textContent = `${pct}%`;
  if (panelCount) panelCount.textContent = `${done} DE ${total}`;

  if (ringFill) {
    const circumference = 163.4; // 2 * PI * 26
    const offset = circumference - (pct / 100) * circumference;
    ringFill.style.strokeDashoffset = offset;
  }
}
