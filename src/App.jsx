import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Plus, 
  Play, 
  Trash2, 
  CheckCircle, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Save,
  Settings,
  Moon,
  Sun,
  Timer,
  Copy,
  Bell
} from 'lucide-react';

export default function WorkoutApp() {
  const [activeTab, setActiveTab] = useState('start'); // 'start', 'history', 'plans', 'exercises', 'settings'
  const [theme, setTheme] = useState('dark');

  // --- BAZA ĆWICZEŃ ---
  const [exerciseDb, setExerciseDb] = useState([
    { id: '1', name: 'Rozpiętki na maszynie', category: 'Klatka' },
    { id: '2', name: 'Wyciskanie hantli nad głowę siedząc', category: 'Barki' },
    { id: '3', name: 'Przysiady ze sztangą', category: 'Nogi' },
    { id: '4', name: 'Uginanie ramion ze sztangą', category: 'Biceps' }
  ]);
  const [newExName, setNewExName] = useState('');
  const [newExCategory, setNewExCategory] = useState('Klatka');

  // --- PLANY TRENINGOWE ---
  const [plans, setPlans] = useState([
    { id: '1', name: 'C fbw', exerciseIds: ['1', '2', '3'] }
  ]);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [selectedExForPlan, setSelectedExForPlan] = useState([]);

  // --- TRENING W TRAKCIE ---
  const [activeSession, setActiveSession] = useState(null);
  const [activeExIdx, setActiveExIdx] = useState(0);
  const [showStartModal, setShowStartModal] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // --- KALENDARZ & HISTORIA ---
  const [markedDays, setMarkedDays] = useState(['2026-08-24', '2026-08-26']);
  const [currentDate, setCurrentDate] = useState(new Date());

  // --- POMIARY CIAŁA ---
  const [bodyLogs, setBodyLogs] = useState([]);
  const [measureForm, setMeasureForm] = useState({ weight: '', chest: '', waist: '', arm: '' });

  // --- PRZYPOMNIENIA ---
  const [creatineTime, setCreatineTime] = useState('09:00');

  // --- STOPER TRENINGU ---
  useEffect(() => {
    let interval = null;
    if (activeSession) {
      interval = setInterval(() => setTimerSeconds(prev => prev + 1), 1000);
    } else {
      setTimerSeconds(0);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const formatTime = (sec) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- LOGIKA TRENINGU ---
  const startWorkout = (plan) => {
    const sessionExercises = plan.exerciseIds.map(id => {
      const ex = exerciseDb.find(e => e.id === id);
      return {
        id: id,
        name: ex ? ex.name : 'Ćwiczenie usunięte',
        sets: [
          { reps: '0', weight: '0' },
          { reps: '0', weight: '0' },
          { reps: '0', weight: '0' }
        ]
      };
    });
    setActiveSession({
      planName: plan.name,
      exercises: sessionExercises
    });
    setActiveExIdx(0);
    setShowStartModal(false);
  };

  const addSet = (exIdx) => {
    const updated = { ...activeSession };
    updated.exercises[exIdx].sets.push({ reps: '0', weight: '0' });
    setActiveSession(updated);
  };

  const removeSet = (exIdx) => {
    const updated = { ...activeSession };
    if (updated.exercises[exIdx].sets.length > 1) {
      updated.exercises[exIdx].sets.pop();
      setActiveSession(updated);
    }
  };

  const updateSet = (exIdx, setIdx, field, val) => {
    const updated = { ...activeSession };
    updated.exercises[exIdx].sets[setIdx][field] = val;
    setActiveSession(updated);
  };

  const copyPreviousSet = (exIdx, setIdx) => {
    if (setIdx === 0) return;
    const updated = { ...activeSession };
    const prevSet = updated.exercises[exIdx].sets[setIdx - 1];
    updated.exercises[exIdx].sets[setIdx] = { ...prevSet };
    setActiveSession(updated);
  };

  const finishWorkout = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (!markedDays.includes(todayStr)) {
      setMarkedDays([...markedDays, todayStr]);
    }
    setActiveSession(null);
    alert('Trening ukończony!');
  };

  // --- LOGIKA KALENDARZA (RĘCZNE ZAZNACZANIE DNI) ---
  const toggleDayMark = (dateStr) => {
    if (markedDays.includes(dateStr)) {
      setMarkedDays(markedDays.filter(d => d !== dateStr));
    } else {
      setMarkedDays([...markedDays, dateStr]);
    }
  };

  // --- PRZYPOMNIENIE O KREATYNIE (Pobieranie pliku .ics dla iOS/Google) ---
  const downloadCreatineReminder = () => {
    const [hh, mm] = creatineTime.split(':');
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Pakiernia U Matiego//Kreatyna//PL
BEGIN:VEVENT
SUMMARY:Bierz Kreatynę! 5g
DESCRIPTION:Przypomnienie o codziennej dawce kreatyny.
RRULE:FREQ=DAILY
DTSTART:20260826T${hh}${mm}00
DURATION:PT15M
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'kreatyna.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Wyliczanie statystyk dla aktualnego ćwiczenia
  const currentEx = activeSession?.exercises[activeExIdx];
  const totalReps = currentEx?.sets.reduce((acc, s) => acc + (parseInt(s.reps) || 0), 0) || 0;
  const totalWeight = currentEx?.sets.reduce((acc, s) => acc + ((parseInt(s.reps) || 0) * (parseFloat(s.weight) || 0)), 0) || 0;

  // Wygląd w zależności od wybranego motywu
  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-black text-white' : 'bg-gray-100 text-gray-900';
  const bgCard = isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-gray-200 shadow-sm';
  const bgInput = isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900';

  return (
    <div className={`min-h-screen ${bgMain} flex flex-col font-sans transition-colors duration-200`}>
      
      {/* NAGŁÓWEK */}
      <header className={`p-4 border-b ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-gray-200'} sticky top-0 z-10 flex justify-between items-center`}>
        <div className="flex items-center space-x-2">
          <Dumbbell className="h-6 w-6 text-orange-500" />
          <h1 className="text-lg font-black tracking-wider uppercase">
            PAKIERNIA <span className="text-orange-500">U MATIEGO</span>
          </h1>
        </div>
        {activeSession && (
          <div className="flex items-center space-x-2 bg-neutral-800/80 px-3 py-1 rounded-full text-xs font-mono text-orange-400 border border-orange-500/30">
            <Timer className="h-3.5 w-3.5" />
            <span>{formatTime(timerSeconds)}</span>
          </div>
        )}
      </header>

      {/* GŁÓWNY EKRAN */}
      <main className="flex-1 p-4 max-w-lg w-full mx-auto pb-24">
        
        {/* WIDOK: TRENING W TRAKCIE */}
        {activeSession ? (
          <div className="space-y-4">
            
            {/* KARUZELA ĆWICZEŃ */}
            <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-none">
              {activeSession.exercises.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveExIdx(idx)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                    activeExIdx === idx
                      ? 'bg-orange-500 text-black border-orange-500 shadow-md shadow-orange-500/20'
                      : isDark ? 'bg-neutral-900 text-neutral-400 border-neutral-800' : 'bg-gray-200 text-gray-700 border-gray-300'
                  }`}
                >
                  {ex.name}
                </button>
              ))}
            </div>

            {/* SEKCJA DANEGO ĆWICZENIA */}
            <div className={`border rounded-xl p-4 space-y-4 ${bgCard}`}>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-orange-500">{currentEx?.name}</h2>
                <span className="text-xs text-neutral-400 font-medium">Serie: {currentEx?.sets.length}</span>
              </div>

              {/* PODSUMOWANIE STATYSTYK NA ŻYWO */}
              <div className="grid grid-cols-2 gap-2 text-center py-2 border-y border-neutral-800">
                <div>
                  <div className="text-xs text-neutral-400">Powtórzenia</div>
                  <div className="text-lg font-black text-white">{totalReps}</div>
                </div>
                <div>
                  <div className="text-xs text-neutral-400">Ciężar łącznie</div>
                  <div className="text-lg font-black text-orange-500">{totalWeight} kg</div>
                </div>
              </div>

              {/* NAGŁÓWKI TABELI */}
              <div className="grid grid-cols-12 gap-2 text-xs font-bold text-neutral-400 px-1">
                <div className="col-span-1">#</div>
                <div className="col-span-4">Powt.</div>
                <div className="col-span-5">Ciężar (kg)</div>
                <div className="col-span-2 text-center">Kopiuj</div>
              </div>

              {/* WIERSE SERII */}
              {currentEx?.sets.map((set, sIdx) => (
                <div key={sIdx} className="grid grid-cols-12 gap-2 items-center">
                  <span className="col-span-1 font-bold text-xs text-neutral-500">{sIdx + 1}</span>
                  <input 
                    type="number"
                    value={set.reps}
                    onChange={(e) => updateSet(activeExIdx, sIdx, 'reps', e.target.value)}
                    className={`col-span-4 border rounded p-2 text-center font-bold text-sm ${bgInput}`}
                  />
                  <input 
                    type="number"
                    value={set.weight}
                    onChange={(e) => updateSet(activeExIdx, sIdx, 'weight', e.target.value)}
                    className={`col-span-5 border rounded p-2 text-center font-bold text-sm ${bgInput}`}
                  />
                  <button 
                    onClick={() => copyPreviousSet(activeExIdx, sIdx)}
                    disabled={sIdx === 0}
                    className="col-span-2 flex justify-center text-neutral-500 hover:text-orange-500 disabled:opacity-20"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {/* PRZYCISKI SERII */}
              <div className="flex space-x-2 pt-2">
                <button 
                  onClick={() => addSet(activeExIdx)}
                  className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-black font-bold rounded-lg text-xs flex items-center justify-center space-x-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Dodaj serię</span>
                </button>
                <button 
                  onClick={() => removeSet(activeExIdx)}
                  className={`px-4 py-2 border border-neutral-800 rounded-lg text-xs font-bold ${isDark ? 'text-neutral-400 hover:text-red-500' : 'text-gray-600'}`}
                >
                  Usuń
                </button>
              </div>
            </div>

            {/* PRZYCISKI ANULUJ / ZAKOŃCZ */}
            <div className="flex justify-between items-center pt-4">
              <button 
                onClick={() => setActiveSession(null)}
                className="text-xs font-bold text-neutral-500 hover:text-red-500"
              >
                Anuluj
              </button>
              <button 
                onClick={finishWorkout}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm flex items-center space-x-1"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Zakończ</span>
              </button>
            </div>

          </div>
        ) : (
          <>
            {/* TAB 1: START (GYMPAD DASHBOARD) */}
            {activeTab === 'start' && (
              <div className="space-y-6">
                
                {/* OSTATNI TRENING - KARTY PODSUMOWANIA */}
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">Ostatni trening</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-4 rounded-xl border ${bgCard}`}>
                      <div className="text-2xl font-black text-orange-500">0</div>
                      <div className="text-xs text-neutral-400 mt-1">postęp kg</div>
                    </div>
                    <div className={`p-4 rounded-xl border ${bgCard}`}>
                      <div className="text-2xl font-black text-orange-500">0</div>
                      <div className="text-xs text-neutral-400 mt-1">suma kg</div>
                    </div>
                    <div className={`p-4 rounded-xl border ${bgCard}`}>
                      <div className="text-2xl font-black text-orange-500">0</div>
                      <div className="text-xs text-neutral-400 mt-1">postęp powt.</div>
                    </div>
                    <div className={`p-4 rounded-xl border ${bgCard}`}>
                      <div className="text-2xl font-black text-orange-500">0</div>
                      <div className="text-xs text-neutral-400 mt-1">suma powt.</div>
                    </div>
                  </div>
                </div>

                {/* PRZYCISK ROZPOCZNIJ TRENING */}
                <button 
                  onClick={() => setShowStartModal(true)}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-black font-black tracking-wider uppercase rounded-xl shadow-lg shadow-orange-500/20 text-center transition-transform active:scale-95 flex items-center justify-center space-x-2"
                >
                  <Play className="h-5 w-5 fill-current" />
                  <span>ROZPOCZNIJ TRENING</span>
                </button>

              </div>
            )}

            {/* TAB 2: KALENDARZ / HISTORIA */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold">Kalendarz</h2>
                  <p className="text-xs text-neutral-400">Kliknij na dowolny dzień, aby ręcznie go zaznaczyć/odznaczyć.</p>
                </div>

                <div className={`border rounded-xl p-4 space-y-4 ${bgCard}`}>
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm">
                      {currentDate.toLocaleString('pl-PL', { month: 'long', year: 'numeric' }).toUpperCase()}
                    </h3>
                    <div className="flex space-x-1">
                      <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1 rounded bg-neutral-800">
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1 rounded bg-neutral-800">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* SIATKA KALENDARZA */}
                  <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-neutral-500">
                    <div>Pn</div><div>Wt</div><div>Śr</div><div>Cz</div><div>Pt</div><div>So</div><div>Nd</div>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() - 1 }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-9"></div>
                    ))}
                    {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                      const dayNum = i + 1;
                      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                      const isMarked = markedDays.includes(dateStr);

                      return (
                        <button
                          key={dayNum}
                          onClick={() => toggleDayMark(dateStr)}
                          className={`h-9 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                            isMarked
                              ? 'bg-orange-500 text-black font-black'
                              : isDark ? 'bg-neutral-950 text-neutral-400 hover:bg-neutral-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {dayNum}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PLANY */}
            {activeTab === 'plans' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold">Plany Treningowe</h2>
                  {!isCreatingPlan && (
                    <button onClick={() => setIsCreatingPlan(true)} className="bg-orange-500 text-black font-bold text-xs px-3 py-2 rounded-lg flex items-center space-x-1">
                      <Plus className="h-3.5 w-3.5" />
                      <span>Dodaj plan</span>
                    </button>
                  )}
                </div>

                {/* CREATOR */}
                {isCreatingPlan && (
                  <div className={`p-4 rounded-xl border space-y-3 ${bgCard}`}>
                    <input 
                      type="text" 
                      placeholder="Nazwa planu (np. Push)"
                      value={newPlanName}
                      onChange={(e) => setNewPlanName(e.target.value)}
                      className={`w-full p-2.5 rounded-lg border text-sm ${bgInput}`}
                    />
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {exerciseDb.map(ex => (
                        <button
                          key={ex.id}
                          onClick={() => {
                            if (selectedExForPlan.includes(ex.id)) {
                              setSelectedExForPlan(selectedExForPlan.filter(i => i !== ex.id));
                            } else {
                              setSelectedExForPlan([...selectedExForPlan, ex.id]);
                            }
                          }}
                          className={`w-full text-left p-2 rounded text-xs flex justify-between ${
                            selectedExForPlan.includes(ex.id) ? 'bg-orange-500/20 text-orange-500 font-bold' : 'text-neutral-400'
                          }`}
                        >
                          <span>{ex.name}</span>
                          {selectedExForPlan.includes(ex.id) && <CheckCircle className="h-3.5 w-3.5" />}
                        </button>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          if (!newPlanName) return;
                          setPlans([...plans, { id: Date.now().toString(), name: newPlanName, exerciseIds: selectedExForPlan }]);
                          setIsCreatingPlan(false);
                          setNewPlanName('');
                          setSelectedExForPlan([]);
                        }}
                        className="flex-1 py-2 bg-orange-500 text-black font-bold rounded-lg text-xs"
                      >
                        Zapisz
                      </button>
                      <button onClick={() => setIsCreatingPlan(false)} className="px-4 py-2 border border-neutral-800 rounded-lg text-xs">
                        Anuluj
                      </button>
                    </div>
                  </div>
                )}

                {/* LISTA PLANÓW */}
                {plans.map(p => (
                  <div key={p.id} className={`p-4 rounded-xl border flex justify-between items-center ${bgCard}`}>
                    <div>
                      <h3 className="font-bold text-sm">{p.name}</h3>
                      <p className="text-xs text-neutral-400 mt-1">{p.exerciseIds.length} ćwiczeń</p>
                    </div>
                    <button onClick={() => setPlans(plans.filter(item => item.id !== p.id))} className="text-neutral-500 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: BAZA ĆWICZEŃ */}
            {activeTab === 'exercises' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold">Baza Ćwiczeń</h2>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    placeholder="Nazwa ćwiczenia..."
                    value={newExName}
                    onChange={(e) => setNewExName(e.target.value)}
                    className={`flex-1 p-2.5 rounded-lg border text-sm ${bgInput}`}
                  />
                  <button 
                    onClick={() => {
                      if (!newExName) return;
                      setExerciseDb([...exerciseDb, { id: Date.now().toString(), name: newExName, category: newExCategory }]);
                      setNewExName('');
                    }}
                    className="bg-orange-500 text-black font-bold px-4 rounded-lg text-xs"
                  >
                    Dodaj
                  </button>
                </div>

                <div className={`border rounded-xl divide-y ${bgCard} ${isDark ? 'divide-neutral-800' : 'divide-gray-200'}`}>
                  {exerciseDb.map(ex => (
                    <div key={ex.id} className="p-3 flex justify-between items-center text-xs font-semibold">
                      <span>{ex.name}</span>
                      <button onClick={() => setExerciseDb(exerciseDb.filter(e => e.id !== ex.id))} className="text-neutral-500 hover:text-red-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: USTAWIENIA */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold">Ustawienia</h2>

                {/* PRZEŁĄCZNIK MOTYWU */}
                <div className={`p-4 rounded-xl border flex justify-between items-center ${bgCard}`}>
                  <span className="text-xs font-bold">Motyw aplikacji</span>
                  <button 
                    onClick={() => setTheme(isDark ? 'light' : 'dark')}
                    className="p-2 rounded-lg bg-neutral-800 text-orange-400 flex items-center space-x-2 text-xs font-bold"
                  >
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    <span>{isDark ? 'Jasny' : 'Ciemny'}</span>
                  </button>
                </div>

                {/* PRZYPOMNIENIE O KREATYNIE */}
                <div className={`p-4 rounded-xl border space-y-3 ${bgCard}`}>
                  <div className="flex items-center space-x-2 text-orange-500">
                    <Bell className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Kreatyna o 9:00</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Ustaw godzine przypomnienia i pobierz wpis do kalendarza w swoim telefonie iPhone/Android.
                  </p>
                  <div className="flex space-x-2">
                    <input 
                      type="time" 
                      value={creatineTime}
                      onChange={(e) => setCreatineTime(e.target.value)}
                      className={`p-2 rounded-lg border text-xs font-bold ${bgInput}`}
                    />
                    <button 
                      onClick={downloadCreatineReminder}
                      className="flex-1 bg-orange-500 text-black font-bold rounded-lg text-xs py-2"
                    >
                      Dodaj do Kalendarza iOS
                    </button>
                  </div>
                </div>

                {/* POMIARY CIAŁA */}
                <div className={`p-4 rounded-xl border space-y-3 ${bgCard}`}>
                  <span className="text-xs font-bold uppercase text-neutral-400">Pomiary ciała</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="number" 
                      placeholder="Waga (kg)"
                      value={measureForm.weight}
                      onChange={(e) => setMeasureForm({...measureForm, weight: e.target.value})}
                      className={`p-2 rounded border text-xs ${bgInput}`}
                    />
                    <input 
                      type="number" 
                      placeholder="Biceps (cm)"
                      value={measureForm.arm}
                      onChange={(e) => setMeasureForm({...measureForm, arm: e.target.value})}
                      className={`p-2 rounded border text-xs ${bgInput}`}
                    />
                  </div>
                  <button 
                    onClick={() => {
                      if (!measureForm.weight) return;
                      setBodyLogs([{ date: new Date().toISOString().split('T')[0], ...measureForm }, ...bodyLogs]);
                      setMeasureForm({ weight: '', chest: '', waist: '', arm: '' });
                    }}
                    className="w-full py-2 bg-neutral-800 text-xs font-bold rounded-lg"
                  >
                    Zapisz pomiar
                  </button>
                </div>

              </div>
            )}
          </>
        )}

      </main>

      {/* MODAL WYBORU PLANU */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`border rounded-xl p-4 max-w-xs w-full space-y-3 ${bgCard}`}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm">Wybierz plan</h3>
              <button onClick={() => setShowStartModal(false)}>
                <X className="h-4 w-4 text-neutral-400" />
              </button>
            </div>
            {plans.map(p => (
              <button
                key={p.id}
                onClick={() => startWorkout(p)}
                className="w-full text-left p-3 rounded-lg bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 text-orange-500 font-bold text-xs flex justify-between items-center"
              >
                <span>{p.name}</span>
                <Play className="h-3.5 w-3.5 fill-current" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* DOLNA NAWIGACJA (GYMPAD STYLE) */}
      {!activeSession && (
        <nav className={`fixed bottom-0 left-0 right-0 border-t p-2 flex justify-around z-10 ${isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-gray-200'}`}>
          <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center p-1 text-[10px] font-bold ${activeTab === 'history' ? 'text-orange-500' : 'text-neutral-500'}`}>
            <CalendarIcon className="h-4 w-4 mb-0.5" />
            <span>Historia</span>
          </button>
          
          <button onClick={() => setActiveTab('plans')} className={`flex flex-col items-center p-1 text-[10px] font-bold ${activeTab === 'plans' ? 'text-orange-500' : 'text-neutral-500'}`}>
            <Dumbbell className="h-4 w-4 mb-0.5" />
            <span>Plany</span>
          </button>

          <button onClick={() => setActiveTab('start')} className={`flex flex-col items-center p-1 text-[10px] font-bold ${activeTab === 'start' ? 'text-orange-500' : 'text-neutral-500'}`}>
            <Play className="h-4 w-4 mb-0.5 fill-current" />
            <span>Start</span>
          </button>

          <button onClick={() => setActiveTab('exercises')} className={`flex flex-col items-center p-1 text-[10px] font-bold ${activeTab === 'exercises' ? 'text-orange-500' : 'text-neutral-500'}`}>
            <Plus className="h-4 w-4 mb-0.5" />
            <span>Ćwiczenia</span>
          </button>

          <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center p-1 text-[10px] font-bold ${activeTab === 'settings' ? 'text-orange-500' : 'text-neutral-500'}`}>
            <Settings className="h-4 w-4 mb-0.5" />
            <span>Ustawienia</span>
          </button>
        </nav>
      )}

    </div>
  );
}
