<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>PAKIERNA U MATIEGO</title>
    <style>
        :root {
            --bg-body: #f4f7f9;
            --card-bg: #ffffff;
            --primary: #0284c7;
            --primary-light: #e0f2fe;
            --primary-hover: #0369a1;
            --accent-green: #10b981;
            --text-main: #0f172a;
            --text-muted: #64748b;
            --border: #e2e8f0;
            --danger: #ef4444;
            --danger-light: #fef2f2;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            -webkit-tap-highlight-color: transparent;
        }

        body {
            background-color: var(--bg-body);
            color: var(--text-main);
            padding-bottom: 80px; /* Miejsce na dolną nawigację */
        }

        /* HEADER Z LOGO I STOPEREM */
        .app-header {
            background: #ffffff;
            padding: 12px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border);
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .logo {
            font-size: 1.1rem;
            font-weight: 800;
            color: #0f172a;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .logo span {
            color: var(--primary);
        }

        .timer-badge {
            background: var(--primary-light);
            color: var(--primary);
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        /* PRZYPIĘTA NAWIGACJA PO ĆWICZENIACH (FIXED / STICKY) */
        .sticky-exercise-bar {
            position: sticky;
            top: 49px; /* Odległość pod nagłówkiem głównym */
            z-index: 90;
            background: rgba(255, 255, 255, 0.92);
            backdrop-filter: blur(10px);
            padding: 10px 12px;
            border-bottom: 1px solid var(--border);
            box-shadow: 0 4px 12px rgba(0,0,0,0.03);
            display: flex;
            gap: 8px;
            overflow-x: auto;
            scrollbar-width: none;
        }

        .sticky-exercise-bar::-webkit-scrollbar { display: none; }

        .ex-tab {
            padding: 8px 14px;
            border-radius: 20px;
            border: 1px solid var(--border);
            background: #f8fafc;
            color: var(--text-muted);
            font-size: 0.85rem;
            font-weight: 600;
            white-space: nowrap;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .ex-tab.active {
            background: var(--primary);
            color: #ffffff;
            border-color: var(--primary);
            box-shadow: 0 2px 6px rgba(2, 132, 199, 0.3);
        }

        /* KONTENER GŁÓWNY */
        .container {
            max-width: 500px;
            margin: 0 auto;
            padding: 12px;
        }

        /* KARTY I SEKCJE */
        .card {
            background: var(--card-bg);
            border-radius: 14px;
            padding: 16px;
            margin-bottom: 12px;
            border: 1px solid var(--border);
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .info-box {
            background: var(--primary-light);
            border: 1px solid #bae6fd;
            border-radius: 10px;
            padding: 12px;
            margin-bottom: 12px;
            font-size: 0.85rem;
            color: #0369a1;
        }

        .exercise-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        /* TABELA SERII */
        .set-header {
            display: grid;
            grid-template-columns: 28px 1fr 1fr 36px 36px;
            gap: 6px;
            font-size: 0.75rem;
            font-weight: 700;
            color: var(--text-muted);
            text-align: center;
            margin-bottom: 6px;
        }

        .set-row {
            display: grid;
            grid-template-columns: 28px 1fr 1fr 36px 36px;
            gap: 6px;
            align-items: center;
            margin-bottom: 8px;
        }

        .set-num {
            font-weight: 700;
            font-size: 0.85rem;
            color: var(--text-muted);
            text-align: center;
        }

        .input-box {
            width: 100%;
            padding: 10px;
            border: 1px solid var(--border);
            border-radius: 8px;
            background: #f8fafc;
            text-align: center;
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--text-main);
            outline: none;
        }

        .input-box:focus {
            border-color: var(--primary);
            background: #ffffff;
        }

        .icon-btn {
            background: #f1f5f9;
            border: 1px solid var(--border);
            border-radius: 8px;
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .icon-btn.delete {
            background: var(--danger-light);
            border-color: #fecaca;
            color: var(--danger);
        }

        /* PRZYCISKI AKCJI */
        .action-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
            margin-top: 12px;
        }

        .btn {
            padding: 12px;
            border-radius: 10px;
            border: none;
            font-size: 0.9rem;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }

        .btn-primary { background: var(--primary); color: white; }
        .btn-success { background: var(--accent-green); color: white; }
        .btn-outline { background: white; border: 1px solid var(--border); color: var(--text-muted); }

        /* NAWIGACJA DOLNA */
        .bottom-nav {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #ffffff;
            border-top: 1px solid var(--border);
            display: flex;
            justify-content: space-around;
            padding: 8px 0;
            z-index: 100;
        }

        .nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            font-size: 0.7rem;
            color: var(--text-muted);
            text-decoration: none;
            cursor: pointer;
            gap: 3px;
        }

        .nav-item.active {
            color: var(--primary);
            font-weight: 700;
        }

        .nav-icon { font-size: 1.2rem; }

        /* HISTORIA I STATYSTYKI POMIARÓW */
        .history-card {
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 12px;
            margin-bottom: 10px;
            background: white;
        }

        .history-header {
            display: flex;
            justify-content: space-between;
            font-weight: 700;
            font-size: 0.9rem;
            margin-bottom: 6px;
        }

        .badge-diff {
            font-size: 0.75rem;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 700;
        }
        .diff-up { background: #dcfce7; color: #15803d; }
        .diff-down { background: #fee2e2; color: #b91c1c; }

        .tab-page { display: none; }
        .tab-page.active { display: block; }
    </style>
</head>
<body>

    <!-- GŁÓWNY NAGŁÓWEK -->
    <div class="app-header">
        <div class="logo">🏋️ PAKIERNA <span>U MATIEGO</span></div>
        <div class="timer-badge">⏱️ 00:42</div>
    </div>

    <!-- STRONA: TRENING AKTYWNY -->
    <div id="page-workout" class="tab-page active">
        <!-- PRZYPIĘTA NAWIGACJA ĆWICZEŃ (STICKY HEADER) -->
        <div class="sticky-exercise-bar" id="exerciseTabNav">
            <button class="ex-tab active" onclick="selectExercise(0)">Rozpiętki na maszynie</button>
            <button class="ex-tab" onclick="selectExercise(1)">Wyciskanie hantli nad głowę</button>
            <button class="ex-tab" onclick="selectExercise(2)">Przysiady ze sztangą</button>
        </div>

        <div class="container">
            <div class="info-box">
                🎯 <strong>CEL Z POPRZEDNIEGO TRENINGU:</strong><br>
                Ostatnio: 30 kg × 10 powt. Spróbuj dodać +1 powtórzenie!
            </div>

            <div class="card">
                <div class="exercise-title">
                    <span id="currentExerciseName">Rozpiętki na maszynie</span>
                    <span style="font-size: 0.8rem; color: var(--text-muted);" id="exerciseProgress">Ćwiczenie 1 z 3</span>
                </div>

                <div class="set-header">
                    <div>#</div>
                    <div>Powtórzenia</div>
                    <div>Ciężar (kg)</div>
                    <div>Kopiuj</div>
                    <div>Usuń</div>
                </div>

                <div id="setsList">
                    <!-- Dynamiczne serie -->
                </div>

                <div class="action-grid">
                    <button class="btn btn-primary" onclick="addSet()">+ Dodaj serię</button>
                </div>
            </div>

            <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                <button class="btn btn-outline" style="flex:1;" onclick="prevExercise()">← Poprzednie</button>
                <button class="btn btn-outline" style="flex:1;" onclick="nextExercise()">Następne →</button>
            </div>

            <button class="btn btn-success" style="width: 100%; padding: 14px;" onclick="finishWorkout()">✓ Zakończ trening</button>
        </div>
    </div>

    <!-- STRONA: HISTORIA TRENINGÓW -->
    <div id="page-history" class="tab-page">
        <div class="container">
            <h3 style="margin-bottom: 12px;">Historia Treningów</h3>
            <div id="historyLog"></div>
        </div>
    </div>

    <!-- STRONA: POMIARY CIAŁA I STATYSTYKI -->
    <div id="page-stats" class="tab-page">
        <div class="container">
            <div class="card">
                <h3 style="margin-bottom: 12px; color: var(--primary);">📏 Nowy Pomiar Ciała</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
                    <select id="bodyPart" class="input-box" style="text-align: left;">
                        <option value="Klatka piersiowa">Klatka piersiowa</option>
                        <option value="Biceps">Biceps</option>
                        <option value="Pas">Pas / Brzuch</option>
                        <option value="Udo">Udo</option>
                    </select>
                    <input type="number" id="bodyValue" class="input-box" placeholder="cm (np. 105)" step="0.5">
                </div>
                <button class="btn btn-primary" style="width: 100%;" onclick="saveBodyMeasurement()">Zapisz Pomiar</button>
            </div>

            <div class="card">
                <h3 style="margin-bottom: 12px;">📜 Historia Pomiarów</h3>
                <div id="bodyHistoryList"></div>
            </div>
        </div>
    </div>

    <!-- DOLNE MENU NAVIGATION -->
    <div class="bottom-nav">
        <div class="nav-item active" onclick="switchNav('workout', this)">
            <span class="nav-icon">🏋️</span>
            <span>Trening</span>
        </div>
        <div class="nav-item" onclick="switchNav('history', this)">
            <span class="nav-icon">📅</span>
            <span>Historia</span>
        </div>
        <div class="nav-item" onclick="switchNav('stats', this)">
            <span class="nav-icon">📊</span>
            <span>Pomiary</span>
        </div>
    </div>

<script>
    // DANE APLIKACJI
    let exercises = [
        { name: "Rozpiętki na maszynie", sets: [{ reps: 10, weight: 25 }, { reps: 10, weight: 25 }, { reps: 8, weight: 30 }] },
        { name: "Wyciskanie hantli nad głowę", sets: [{ reps: 12, weight: 16 }, { reps: 10, weight: 18 }] },
        { name: "Przysiady ze sztangą", sets: [{ reps: 8, weight: 80 }, { reps: 8, weight: 85 }] }
    ];

    let currentExIndex = 0;

    let bodyMeasurements = JSON.parse(localStorage.getItem('bodyMeasurements')) || [
        { date: "2026-07-24", part: "Klatka piersiowa", val: 105.0 },
        { date: "2026-08-26", part: "Klatka piersiowa", val: 110.0 },
        { date: "2026-08-26", part: "Biceps", val: 38.5 }
    ];

    // INICJALIZACJA
    function init() {
        renderExerciseTabs();
        renderCurrentExercise();
        renderBodyHistory();
    }

    // PRZEŁĄCZANIE ZAKŁADEK DOLNYCH
    function switchNav(pageId, element) {
        document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        
        document.getElementById('page-' + pageId).classList.add('active');
        element.classList.add('active');

        if(pageId === 'history') renderHistoryLog();
    }

    // NAWIGACJA PO ĆWICZENIACH
    function renderExerciseTabs() {
        const nav = document.getElementById('exerciseTabNav');
        nav.innerHTML = exercises.map((ex, idx) => `
            <button class="ex-tab ${idx === currentExIndex ? 'active' : ''}" onclick="selectExercise(${idx})">
                ${ex.name}
            </button>
        `).join('');
    }

    function selectExercise(index) {
        currentExIndex = index;
        renderExerciseTabs();
        renderCurrentExercise();
    }

    function prevExercise() {
        if(currentExIndex > 0) selectExercise(currentExIndex - 1);
    }

    function nextExercise() {
        if(currentExIndex < exercises.length - 1) selectExercise(currentExIndex + 1);
    }

    // RENDEROWANIE SERII W AKTYWNYM ĆWICZENIU
    function renderCurrentExercise() {
        const ex = exercises[currentExIndex];
        document.getElementById('currentExerciseName').innerText = ex.name;
        document.getElementById('exerciseProgress').innerText = `Ćwiczenie ${currentExIndex + 1} z ${exercises.length}`;

        const container = document.getElementById('setsList');
        container.innerHTML = '';

        ex.sets.forEach((set, sIdx) => {
            const row = document.createElement('div');
            row.className = 'set-row';
            row.innerHTML = `
                <div class="set-num">${sIdx + 1}</div>
                <input type="number" class="input-box" value="${set.reps}" onchange="updateSet(${sIdx}, 'reps', this.value)">
                <input type="number" class="input-box" value="${set.weight}" onchange="updateSet(${sIdx}, 'weight', this.value)">
                <button class="icon-btn" onclick="copySet(${sIdx})">📋</button>
                <button class="icon-btn delete" onclick="deleteSet(${sIdx})">🗑️</button>
            `;
            container.appendChild(row);
        });
    }

    function updateSet(index, field, value) {
        exercises[currentExIndex].sets[index][field] = parseFloat(value) || 0;
    }

    function addSet() {
        const sets = exercises[currentExIndex].sets;
        const lastSet = sets[sets.length - 1] || { reps: 10, weight: 0 };
        sets.push({ reps: lastSet.reps, weight: lastSet.weight });
        renderCurrentExercise();
    }

    function copySet(index) {
        const setToCopy = exercises[currentExIndex].sets[index];
        exercises[currentExIndex].sets.splice(index + 1, 0, { ...setToCopy });
        renderCurrentExercise();
    }

    function deleteSet(index) {
        exercises[currentExIndex].sets.splice(index, 1);
        renderCurrentExercise();
    }

    // OBSŁUGA POMIARÓW CIAŁA Z HISTORIĄ
    function saveBodyMeasurement() {
        const part = document.getElementById('bodyPart').value;
        const val = parseFloat(document.getElementById('bodyValue').value);
        if(!val) return alert('Wpisz poprawną wartość!');

        const date = new Date().toISOString().split('T')[0];
        bodyMeasurements.push({ date, part, val });
        localStorage.setItem('bodyMeasurements', JSON.stringify(bodyMeasurements));
        
        document.getElementById('bodyValue').value = '';
        renderBodyHistory();
    }

    function renderBodyHistory() {
        const container = document.getElementById('bodyHistoryList');
        container.innerHTML = '';

        // Grupuj po partii ciała
        const parts = [...new Set(bodyMeasurements.map(m => m.part))];

        parts.forEach(part => {
            const history = bodyMeasurements.filter(m => m.part === part).sort((a,b) => new Date(a.date) - new Date(b.date));
            
            let historyHtml = history.map((item, idx) => {
                let badge = '';
                if(idx > 0) {
                    const diff = (item.val - history[idx-1].val).toFixed(1);
                    if(diff > 0) badge = `<span class="badge-diff diff-up">+${diff} cm</span>`;
                    else if(diff < 0) badge = `<span class="badge-diff diff-down">${diff} cm</span>`;
                    else badge = `<span class="badge-diff" style="background:#f1f5f9; color:#64748b;">0 cm</span>`;
                }

                return `
                    <div style="display:flex; justify-between; align-items:center; padding: 6px 0; border-bottom: 1px solid #f1f5f9;">
                        <span style="font-size:0.8rem; color: var(--text-muted);">${item.date}</span>
                        <div>
                            <strong>${item.val} cm</strong>
                            ${badge}
                        </div>
                    </div>
                `;
            }).reverse().join('');

            container.innerHTML += `
                <div class="history-card">
                    <div class="history-header" style="color: var(--primary);">${part}</div>
                    ${historyHtml}
                </div>
            `;
        });
    }

    function renderHistoryLog() {
        const container = document.getElementById('historyLog');
        container.innerHTML = `
            <div class="history-card">
                <div class="history-header">
                    <span>Plan FBW A</span>
                    <span style="color: var(--text-muted); font-size: 0.8rem;">2026-08-26</span>
                </div>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">Czas: 42 min | Tonaż: 1 450 kg</div>
                ${exercises.map(ex => `
                    <div style="font-size:0.85rem; margin-top: 4px;">
                        <strong>${ex.name}:</strong> ${ex.sets.map(s => `${s.reps}×${s.weight}kg`).join(', ')}
                    </div>
                `).join('')}
            </div>
        `;
    }

    function finishWorkout() {
        alert('Trening został pomyślnie zapisany w historii!');
    }

    init();
</script>
</body>
</html>
