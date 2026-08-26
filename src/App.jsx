import React, { useState, useEffect, useRef } from 'react';
import { 
  Dumbbell, 
  Calendar as CalendarIcon, 
  Plus, 
  Play, 
  Trash2, 
  CheckCircle, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Settings,
  Moon,
  Sun,
  Timer,
  Copy,
  Bell,
  BarChart3,
  Target,
  ArrowRight,
  ArrowLeft,
  Trophy,
  History,
  Zap,
  Activity,
  UserCheck
} from 'lucide-react';

export default function WorkoutApp() {
  // SPLASH SCREEN STATE
  const [showSplash, setShowSplash] = useState(true);

  // PERSISTENT STATE
  const [theme, setTheme] = useState(() => localStorage.getItem('pm_theme') || 'dark');
  const [exerciseDb, setExerciseDb] = useState(() => {
    const saved = localStorage.getItem('pm_exercises');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Rozpiętki na maszynie', category: 'Klatka' },
      { id: '2', name: 'Wyciskanie hantli nad głowę', category: 'Barki' },
      { id: '3', name: 'Przysiady ze sztangą', category: 'Nogi' },
      { id: '4', name: 'Uginanie ramion ze sztangą', category: 'Biceps' }
    ];
  });

  const [plans, setPlans] = useState(() => {
    const saved = localStorage.getItem('pm_plans');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Plan FBW A', exerciseIds: ['1', '2', '3', '4'] }
    ];
  });

  const [workoutHistory, setWorkoutHistory] = useState(() => {
    const saved = localStorage.getItem('pm_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [markedDays, setMarkedDays] = useState(() => {
    const saved = localStorage.getItem('pm_marked_days');
    return saved ? JSON.parse(saved) : [];
  });

  // BODY MEASUREMENTS STATE
  const [bodyStats, setBodyStats] = useState(() => {
    const saved = localStorage.getItem('pm_body_stats');
    return saved ? JSON.parse(saved) : [
      { id: '1', date: '2026-08-01', weight: 82.5, chest: 108, arm: 39, waist: 86, thigh: 61 }
    ];
  });

  // UI STATES
  const [activeTab, setActiveTab] = useState('start');
  const [statsSubTab, setStatsSubTab] = useState('records'); // 'records' | 'body' | 'history'
  const [selectedBodyPart, setSelectedBodyPart] = useState('arm');
  const [newExName, setNewExName] = useState('');
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [selectedExForPlan, setSelectedExForPlan] = useState([]);
  const [selectedStatExId, setSelectedStatExId] = useState('');

  // MEASUREMENT FORM STATE
  const [newWeight, setNewWeight] = useState('');
  const [newChest, setNewChest] = useState('');
  const [newArm, setNewArm] = useState('');
  const [newWaist, setNewWaist] = useState('');
  const [newThigh, setNewThigh] = useState('');

  // WORKOUT SESSION STATE
  const [activeSession, setActiveSession] = useState(null);
  const activeSessionRef = useRef(activeSession);
  activeSessionRef.current = activeSession;

  const [activeExIdx, setActiveExIdx] = useState(0);
  const [showStartModal, setShowStartModal] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [summaryData, setSummaryData] = useState(null);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(null);

  // SETTINGS & CREATINE
  const [creatineTime, setCreatineTime] = useState('09:00');
  const [currentDate, setCurrentDate] = useState(new Date());

  // SPLASH SCREEN TIMER
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // SAVE TO LOCALSTORAGE
  useEffect(() => { localStorage.setItem('pm_theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('pm_exercises', JSON.stringify(exerciseDb)); }, [exerciseDb]);
  useEffect(() => { localStorage.setItem('pm_plans', JSON.stringify(plans)); }, [plans]);
  useEffect(() => { localStorage.setItem('pm_history', JSON.stringify(workoutHistory)); }, [workoutHistory]);
  useEffect(() => { localStorage.setItem('pm_marked_days', JSON.stringify(markedDays)); }, [markedDays]);
  useEffect(() => { localStorage.setItem('pm_body_stats', JSON.stringify(bodyStats)); }, [bodyStats]);

  // OPTIMIZED TIMER
  useEffect(() => {
    let interval = null;
    if (activeSession) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setTimerSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSession ? true : false]);

  const formatTime = (sec) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // WORKOUT LOGIC
  const startWorkout = (plan) => {
    const sessionExercises = plan.exerciseIds.map(id => {
      const ex = exerciseDb.find(e => e.id === id);
      return {
        id: id,
        name: ex ? ex.name : 'Ćwiczenie',
        sets: [
          { reps: '', weight: '' },
          { reps: '', weight: '' },
          { reps: '', weight: '' }
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
    updated.exercises[exIdx].sets.push({ reps: '', weight: '' });
    setActiveSession(updated);
  };

  // USUWANIE KONKRETNEJ SERII
  const deleteSpecificSet = (exIdx, setIdx) => {
    const updated = { ...activeSession };
    if (updated.exercises[exIdx].sets.length > 1) {
      updated.exercises[exIdx].sets.splice(setIdx, 1);
      setActiveSession(updated);
    }
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
    
    let totalReps = 0;
    let totalWeight = 0;

    activeSession.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        const r = parseInt(s.reps) || 0;
        const w = parseFloat(s.weight) || 0;
        totalReps += r;
        totalWeight += r * w;
      });
    });

    const newEntry = {
      id: Date.now().toString(),
      date: todayStr,
      duration: formatTime(timerSeconds),
      planName: activeSession.planName,
      totalReps,
      totalWeight,
      exercises: activeSession.exercises
    };

    setWorkoutHistory([newEntry, ...workoutHistory]);

    if (!markedDays.includes(todayStr)) {
      setMarkedDays([...markedDays, todayStr]);
    }

    setSummaryData(newEntry);
    setActiveSession(null);
  };

  const deleteWorkoutHistory = (id) => {
    setWorkoutHistory(prev => prev.filter(item => item.id !== id));
  };

  // ZAPISYWANIE POMIARÓW Z HISTORIĄ
  const saveBodyStats = (e) => {
    e.preventDefault();
    if (!newWeight && !newArm && !newWaist && !newChest && !newThigh) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const prev = bodyStats[0] || {};

    const newEntry = {
      id: Date.now().toString(),
      date: todayStr,
      weight: newWeight !== '' ? parseFloat(newWeight) : (prev.weight || 0),
      chest: newChest !== '' ? parseFloat(newChest) : (prev.chest || 0),
      arm: newArm !== '' ? parseFloat(newArm) : (prev.arm || 0),
      waist: newWaist !== '' ? parseFloat(newWaist) : (prev.waist || 0),
      thigh: newThigh !== '' ? parseFloat(newThigh) : (prev.thigh || 0)
    };

    setBodyStats([newEntry, ...bodyStats]);
    setNewWeight(''); setNewChest(''); setNewArm(''); setNewWaist(''); setNewThigh('');
  };

  const toggleDayMark = (dateStr) => {
    if (markedDays.includes(dateStr)) {
      setMarkedDays(markedDays.filter(d => d !== dateStr));
    } else {
      setMarkedDays([...markedDays, dateStr]);
    }
  };

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

  // INDIVIDUAL PREVIOUS DATA LOGIC
  const getPreviousExData = (exId, exName) => {
    for (let w of workoutHistory) {
      const found = w.exercises.find(e => (e.id && e.id === exId) || e.name === exName);
      if (found && found.sets.some(s => parseFloat(s.weight) > 0 || parseInt(s.reps) > 0)) {
        return found;
      }
    }
    return null;
  };

  // CALCULATIONS FOR ACTIVE EXERCISE
  const currentEx = activeSession?.exercises[activeExIdx];
  const prevExData = currentEx ? getPreviousExData(currentEx.id, currentEx.name) : null;

  const currentExReps = currentEx?.sets.reduce((acc, s) => acc + (parseInt(s.reps) || 0), 0) || 0;
  const currentExWeight = currentEx?.sets.reduce((acc, s) => acc + ((parseInt(s.reps) || 0) * (parseFloat(s.weight) || 0)), 0) || 0;

  // THEME COLOR SCHEME
  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-neutral-950 text-white' : 'bg-gray-100 text-gray-900';
  const bgCard = isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-gray-200 shadow-sm';
  const bgInput = isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900';
  const textMuted = isDark ? 'text-neutral-400' : 'text-gray-600';

  const accentText = isDark ? 'text-cyan-400' : 'text-cyan-600';
  const accentBg = isDark ? 'bg-cyan-400 text-black' : 'bg-cyan-600 text-white';
  const accentBorder = isDark ? 'border-cyan-400' : 'border-cyan-600';

  const historyForSelectedDate = selectedHistoryDate 
    ? workoutHistory.filter(w => w.date === selectedHistoryDate)
    : [];

  const latestStats = bodyStats[0] || {};

  return (
    <div className={`min-h-screen ${bgMain} flex flex-col font-sans transition-colors duration-200 relative`}>
      
      {/* EKRAN POWITALNY */}
      {showSplash && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white transition-opacity duration-500 p-6 text-center">
          <img 
            src="/logo.gif?v=1" 
            alt="Pakiernia U Matiego" 
            className="w-44 h-44 object-cover rounded-2xl mb-4 border-2 border-cyan-400 shadow-xl shadow-cyan-500/30" 
          />
          <h1 className="text-xl font-black uppercase tracking-widest text-cyan-400">
            PAKIERNIA U MATIEGO
          </h1>
          
          <div className="w-64 max-w-xs mt-6 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-neutral-400">
              <span className="flex items-center space-x-1">
                <Zap className="h-3 w-3 text-cyan-400 animate-pulse" />
                <span>Ładowanie formy...</span>
              </span>
              <span className="text-cyan-400 font-bold">100%</span>
            </div>
            <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden border border-neutral-700">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full animate-pulse transition-all duration-1000 w-full"></div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className={`p-4 border-b ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-gray-200'} sticky top-0 z-10 flex justify-between items-center`}>
        <div className="flex items-center space-x-2">
          <Dumbbell className={`h-6 w-6 ${accentText}`} />
          <h1 className="text-lg font-black tracking-wider uppercase">
            PAKIERNIA <span className={accentText}>U MATIEGO</span>
          </h1>
        </div>
        {activeSession && (
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono font-bold ${isDark ? 'bg-neutral-800 text-cyan-400 border border-cyan-500/30' : 'bg-gray-100 text-cyan-700 border border-cyan-200'}`}>
            <Timer className="h-3.5 w-3.5" />
            <span>{formatTime(timerSeconds)}</span>
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 max-w-lg w-full mx-auto pb-28">
        
        {/* ACTIVE WORKOUT MODE */}
        {activeSession ? (
          <div className="space-y-4">
            
            {/* POPRAWIONA NAWIGACJA PO ĆWICZENIACH (BEZ UCINANIA TEKSTU) */}
            <div className={`p-3 rounded-xl border ${bgCard} space-y-2`}>
              <div className="flex items-center justify-between text-xs font-bold">
                <button 
                  disabled={activeExIdx === 0}
                  onClick={() => setActiveExIdx(prev => Math.max(0, prev - 1))}
                  className="p-1.5 disabled:opacity-30 hover:bg-neutral-800/50 rounded-lg text-cyan-400 flex items-center space-x-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Poprzednie</span>
                </button>

                <span className={`text-xs ${textMuted} font-mono`}>
                  Ćwiczenie <strong className="text-cyan-400">{activeExIdx + 1}</strong> z {activeSession.exercises.length}
                </span>

                <button 
                  disabled={activeExIdx === activeSession.exercises.length - 1}
                  onClick={() => setActiveExIdx(prev => Math.min(activeSession.exercises.length - 1, prev + 1))}
                  className="p-1.5 disabled:opacity-30 hover:bg-neutral-800/50 rounded-lg text-cyan-400 flex items-center space-x-1"
                >
                  <span>Następne</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* PASEK WSKAŹNIKOWY (DOTS) */}
              <div className="flex gap-1.5 justify-center pt-1">
                {activeSession.exercises.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveExIdx(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === activeExIdx 
                        ? 'w-6 bg-cyan-400' 
                        : isDark ? 'w-2 bg-neutral-800 hover:bg-neutral-700' : 'w-2 bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* TARGET / PREVIOUS PERFORMANCE CARD */}
            <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-cyan-950/40 border-cyan-500/40 text-white' : 'bg-cyan-50 border-cyan-300 text-gray-900'}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-1.5 font-bold text-xs">
                  <Target className={`h-4 w-4 ${accentText}`} />
                  <span className="uppercase tracking-wider">Cel i Wynik z poprzedniego treningu</span>
                </div>
              </div>

              {prevExData ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {prevExData.sets.map((s, idx) => (
                      <div key={idx} className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border ${isDark ? 'bg-neutral-900 border-cyan-500/30 text-cyan-300' : 'bg-white border-cyan-200 text-cyan-900'}`}>
                        S{idx + 1}: {s.reps || 0} × {s.weight || 0} kg
                      </div>
                    ))}
                  </div>
                  <div className={`text-xs font-bold p-2 rounded-lg flex items-center justify-between ${isDark ? 'bg-cyan-400/10 text-cyan-300' : 'bg-cyan-100 text-cyan-900'}`}>
                    <span>🎯 Dzisiejszy cel:</span>
                    <span className="font-extrabold">+1 powtórzenie lub +2.5 kg!</span>
                  </div>
                </div>
              ) : (
                <p className={`text-xs font-medium ${textMuted}`}>Brak historii dla tego ćwiczenia. Zrób serie bazowe!</p>
              )}
            </div>

            {/* CURRENT EXERCISE CARD */}
            <div className={`border rounded-xl p-4 space-y-4 ${bgCard}`}>
              <div className="flex justify-between items-center">
                <h2 className={`text-lg font-black ${accentText}`}>{currentEx?.name}</h2>
              </div>

              {/* LIVE EXERCISE STATS */}
              <div className={`grid grid-cols-2 gap-2 text-center py-2 border-y ${isDark ? 'border-neutral-800' : 'border-gray-200'}`}>
                <div>
                  <div className={`text-xs ${textMuted}`}>Suma powtórzeń</div>
                  <div className="text-lg font-black">{currentExReps}</div>
                </div>
                <div>
                  <div className={`text-xs ${textMuted}`}>Suma ciężaru</div>
                  <div className={`text-lg font-black ${accentText}`}>{currentExWeight} kg</div>
                </div>
              </div>

              {/* TABLE HEADERS */}
              <div className={`grid grid-cols-12 gap-2 text-xs font-bold ${textMuted} px-1 text-center`}>
                <div className="col-span-1">#</div>
                <div className="col-span-4">Powtórzenia</div>
                <div className="col-span-4">Ciężar (kg)</div>
                <div className="col-span-3">Akcje</div>
              </div>

              {/* SET ROWS WITH NUMERIC KEYBOARD & DELETE OPTION */}
              {currentEx?.sets.map((set, sIdx) => (
                <div key={sIdx} className="grid grid-cols-12 gap-2 items-center">
                  <span className={`col-span-1 font-bold text-xs text-center ${textMuted}`}>{sIdx + 1}</span>
                  <input 
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={set.reps}
                    onChange={(e) => updateSet(activeExIdx, sIdx, 'reps', e.target.value)}
                    className={`col-span-4 border rounded-lg p-2 text-center font-bold text-sm ${bgInput}`}
                  />
                  <input 
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={set.weight}
                    onChange={(e) => updateSet(activeExIdx, sIdx, 'weight', e.target.value)}
                    className={`col-span-4 border rounded-lg p-2 text-center font-bold text-sm ${bgInput}`}
                  />
                  <div className="col-span-3 flex justify-center items-center space-x-1">
                    <button 
                      onClick={() => copyPreviousSet(activeExIdx, sIdx)}
                      disabled={sIdx === 0}
                      className="p-1.5 text-neutral-400 hover:text-cyan-400 disabled:opacity-20"
                      title="Kopiuj z poprzedniej serii"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => deleteSpecificSet(activeExIdx, sIdx)}
                      disabled={currentEx.sets.length <= 1}
                      className="p-1.5 text-neutral-400 hover:text-red-500 disabled:opacity-20"
                      title="Usuń tę serię"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* SET CONTROL BUTTONS */}
              <div className="flex space-x-2 pt-2">
                <button 
                  onClick={() => addSet(activeExIdx)}
                  className={`flex-1 py-2.5 ${accentBg} font-bold rounded-lg text-xs flex items-center justify-center space-x-1 shadow-sm`}
                >
                  <Plus className="h-4 w-4" />
                  <span>Dodaj serię</span>
                </button>
                <button 
                  onClick={() => removeSet(activeExIdx)}
                  disabled={currentEx?.sets.length <= 1}
                  className={`px-3 py-2.5 border rounded-lg text-xs font-bold disabled:opacity-30 ${isDark ? 'border-neutral-800 text-neutral-400 hover:text-red-400' : 'border-gray-300 text-gray-700 hover:text-red-600'}`}
                >
                  Usuń ostatnią
                </button>
              </div>
            </div>

            {/* EXERCISE NAVIGATION BUTTONS */}
            <div className="flex justify-between items-center space-x-2">
              <button
                disabled={activeExIdx === 0}
                onClick={() => setActiveExIdx(prev => Math.max(0, prev - 1))}
                className={`flex-1 py-2.5 px-3 border rounded-xl text-xs font-bold flex items-center justify-center space-x-1 disabled:opacity-30 ${isDark ? 'border-neutral-800 bg-neutral-900' : 'border-gray-300 bg-white'}`}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Poprzednie</span>
              </button>

              <button
                disabled={activeExIdx === activeSession.exercises.length - 1}
                onClick={() => setActiveExIdx(prev => Math.min(activeSession.exercises.length - 1, prev + 1))}
                className={`flex-1 py-2.5 px-3 border rounded-xl text-xs font-bold flex items-center justify-center space-x-1 disabled:opacity-30 ${isDark ? 'border-neutral-800 bg-neutral-900' : 'border-gray-300 bg-white'}`}
              >
                <span>Następne</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* CANCEL & FINISH BUTTONS */}
            <div className="flex justify-between items-center pt-2">
              <button 
                onClick={() => setActiveSession(null)}
                className="text-xs font-bold text-red-500 hover:underline"
              >
                Anuluj trening
              </button>
              <button 
                onClick={finishWorkout}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm flex items-center space-x-1.5 shadow-lg shadow-emerald-600/20"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Zakończ trening</span>
              </button>
            </div>

          </div>
        ) : (
          <>
            {/* TAB 1: START */}
            {activeTab === 'start' && (
              <div className="space-y-6">
                
                {/* LAST WORKOUT SUMMARY */}
                <div>
                  <h2 className={`text-xs font-bold uppercase tracking-wider ${textMuted} mb-3`}>Ostatni trening</h2>
                  {workoutHistory.length > 0 ? (
                    <div className={`p-4 rounded-xl border space-y-3 ${bgCard}`}>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm">{workoutHistory[0].planName}</span>
                        <span className={`text-xs ${textMuted}`}>{workoutHistory[0].date}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-gray-200 dark:border-neutral-800">
                        <div>
                          <div className={`text-[10px] ${textMuted}`}>Czas</div>
                          <div className="font-bold text-xs">{workoutHistory[0].duration}</div>
                        </div>
                        <div>
                          <div className={`text-[10px] ${textMuted}`}>Powtórzenia</div>
                          <div className="font-bold text-xs">{workoutHistory[0].totalReps}</div>
                        </div>
                        <div>
                          <div className={`text-[10px] ${textMuted}`}>Tonaż</div>
                          <div className={`font-bold text-xs ${accentText}`}>{workoutHistory[0].totalWeight} kg</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`p-4 rounded-xl border text-center ${bgCard}`}>
                      <p className={`text-xs ${textMuted}`}>Brak zarejestrowanych treningów. Czas na pierwszy trening!</p>
                    </div>
                  )}
                </div>

                {/* START WORKOUT BUTTON */}
                <button 
                  onClick={() => setShowStartModal(true)}
                  className={`w-full py-4 ${accentBg} font-black tracking-wider uppercase rounded-xl shadow-lg shadow-cyan-500/10 text-center transition-transform active:scale-95 flex items-center justify-center space-x-2 text-base`}
                >
                  <Play className="h-5 w-5 fill-current" />
                  <span>ROZPOCZNIJ TRENING</span>
                </button>

              </div>
            )}

            {/* TAB 2: HISTORIA & KALENDARZ */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold">Kalendarz i Historia</h2>
                  <p className={`text-xs ${textMuted}`}>Kliknij dzień w kalendarzu, aby zobaczyć podsumowanie treningu.</p>
                </div>

                {/* CALENDAR */}
                <div className={`border rounded-xl p-4 space-y-4 ${bgCard}`}>
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm">
                      {currentDate.toLocaleString('pl-PL', { month: 'long', year: 'numeric' }).toUpperCase()}
                    </h3>
                    <div className="flex space-x-1">
                      <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className={`p-1.5 rounded-lg border ${isDark ? 'border-neutral-800 bg-neutral-950' : 'border-gray-300 bg-gray-50'}`}>
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className={`p-1.5 rounded-lg border ${isDark ? 'border-neutral-800 bg-neutral-950' : 'border-gray-300 bg-gray-50'}`}>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* CALENDAR GRID */}
                  <div className={`grid grid-cols-7 gap-1 text-center font-bold text-xs ${textMuted}`}>
                    <div>Pn</div><div>Wt</div><div>Śr</div><div>Cz</div><div>Pt</div><div>So</div><div>Nd</div>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: (new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() || 7) - 1 }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-9"></div>
                    ))}
                    {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                      const dayNum = i + 1;
                      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                      const isMarked = markedDays.includes(dateStr);
                      const isSelected = selectedHistoryDate === dateStr;

                      return (
                        <button
                          key={dayNum}
                          onClick={() => {
                            toggleDayMark(dateStr);
                            setSelectedHistoryDate(dateStr);
                          }}
                          className={`h-9 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                            isMarked
                              ? `${accentBg} font-black`
                              : isSelected
                              ? 'border-2 border-cyan-400'
                              : isDark ? 'bg-neutral-950 text-neutral-400 hover:bg-neutral-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {dayNum}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ODNOWIONY WIDOK SZCZEGÓŁÓW DNIA */}
                {selectedHistoryDate && (
                  <div className={`border rounded-xl p-4 space-y-4 ${bgCard}`}>
                    <div className="flex justify-between items-center border-b pb-2 dark:border-neutral-800 border-gray-200">
                      <div>
                        <h3 className="font-bold text-sm">Trening z dnia {selectedHistoryDate}</h3>
                      </div>
                      <button onClick={() => setSelectedHistoryDate(null)}>
                        <X className="h-4 w-4 text-neutral-400" />
                      </button>
                    </div>

                    {historyForSelectedDate.length > 0 ? (
                      historyForSelectedDate.map(h => (
                        <div key={h.id} className="space-y-3 relative">
                          <div className="flex justify-between items-center pr-8">
                            <span className={`font-black text-sm ${accentText}`}>{h.planName}</span>
                            <span className={`text-xs font-mono ${textMuted}`}>{h.duration} | Tonaż: {h.totalWeight} kg</span>
                          </div>

                          <button 
                            onClick={() => deleteWorkoutHistory(h.id)}
                            className="absolute top-0 right-0 text-neutral-500 hover:text-red-500 p-1"
                            title="Usuń trening z historii"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          
                          <div className="space-y-2 pt-1">
                            {h.exercises.map((e, idx) => (
                              <div key={idx} className={`p-3 rounded-xl border text-xs space-y-1.5 ${isDark ? 'bg-neutral-950/80 border-neutral-800' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-xs">{e.name}</span>
                                  <span className="text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono">
                                    {e.sets.length} serie
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {e.sets.map((s, sIdx) => (
                                    <span key={sIdx} className={`px-2 py-1 rounded-md text-[11px] font-mono border ${isDark ? 'bg-neutral-900 border-neutral-700 text-cyan-300' : 'bg-white border-gray-300 text-cyan-800'}`}>
                                      S{sIdx + 1}: <strong>{s.reps || 0}</strong> powt. × <strong>{s.weight || 0}</strong> kg
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className={`text-xs ${textMuted}`}>Brak zapisanego treningu w tym dniu.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: STATYSTYKI & POMIARY FORMIE */}
            {activeTab === 'stats' && (
              <div className="space-y-4">
                
                {/* SUB-TABS NAVIGATION */}
                <div className={`p-1 rounded-xl border flex text-xs font-bold ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-gray-200 border-gray-300'}`}>
                  <button 
                    onClick={() => setStatsSubTab('records')}
                    className={`flex-1 py-2 rounded-lg text-center transition-all ${statsSubTab === 'records' ? accentBg : textMuted}`}
                  >
                    Rekordy PR
                  </button>
                  <button 
                    onClick={() => setStatsSubTab('body')}
                    className={`flex-1 py-2 rounded-lg text-center transition-all ${statsSubTab === 'body' ? accentBg : textMuted}`}
                  >
                    Pomiary Ciała
                  </button>
                  <button 
                    onClick={() => setStatsSubTab('history')}
                    className={`flex-1 py-2 rounded-lg text-center transition-all ${statsSubTab === 'history' ? accentBg : textMuted}`}
                  >
                    Ćwiczenia
                  </button>
                </div>

                {/* SUB-TAB 1: REKORDY ŻYCIOWE */}
                {statsSubTab === 'records' && (
                  <div className={`p-4 rounded-xl border space-y-3 ${bgCard}`}>
                    <h3 className="font-bold text-sm flex items-center space-x-1.5">
                      <Trophy className="h-4 w-4 text-amber-400" />
                      <span>Rekordy Życiowe (Max Ciężar)</span>
                    </h3>
                    <div className="space-y-2">
                      {exerciseDb.map(ex => {
                        let maxWeight = 0;
                        let bestReps = 0;

                        workoutHistory.forEach(w => {
                          const found = w.exercises.find(e => (e.id && e.id === ex.id) || e.name === ex.name);
                          if (found) {
                            found.sets.forEach(s => {
                              const wVal = parseFloat(s.weight) || 0;
                              const rVal = parseInt(s.reps) || 0;
                              if (wVal > maxWeight) {
                                maxWeight = wVal;
                                bestReps = rVal;
                              }
                            });
                          }
                        });

                        return (
                          <div key={ex.id} className="flex justify-between items-center text-xs py-1.5 border-b border-gray-100 dark:border-neutral-800 last:border-0">
                            <span className="font-semibold">{ex.name}</span>
                            <span className={`font-bold font-mono ${maxWeight > 0 ? accentText : textMuted}`}>
                              {maxWeight > 0 ? `${maxWeight} kg (${bestReps} powt.)` : 'Brak danych'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SUB-TAB 2: POMIARY FORMIE & NOWA SYLWETKA SVG */}
                {statsSubTab === 'body' && (
                  <div className="space-y-4">
                    
                    {/* WIZUALIZACJA SYLWETKI SVG & DANYCH */}
                    <div className={`p-4 rounded-xl border space-y-4 ${bgCard}`}>
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-sm flex items-center space-x-1.5">
                          <Activity className={`h-4 w-4 ${accentText}`} />
                          <span>Anatomia Formy & Wyniki</span>
                        </h3>
                        <span className={`text-[10px] font-mono ${textMuted}`}>Ostatnia zmiana: {latestStats.date || 'Brak'}</span>
                      </div>

                      {/* POPRAWIONY WEKTOROWY SZKIELET SYLWETKI */}
                      <div className="relative w-full h-64 bg-neutral-950/60 rounded-2xl border border-neutral-800 flex items-center justify-between p-4 overflow-hidden">
                        
                        {/* WEKTOR SVG */}
                        <div className="w-1/2 h-full flex items-center justify-center">
                          <svg viewBox="0 0 100 200" className="h-full w-auto text-neutral-700 stroke-current stroke-2 fill-neutral-900/80">
                            {/* Głowa */}
                            <circle cx="50" cy="22" r="13" />
                            {/* Szyja */}
                            <path d="M46 35 H54 V42 H46 Z" />
                            {/* Tułów / Klatka */}
                            <path d="M28 42 L72 42 L62 110 L38 110 Z" />
                            {/* Lewe Ramię */}
                            <path d="M28 42 L14 80 L20 110" strokeLinecap="round" />
                            {/* Prawe Ramię */}
                            <path d="M72 42 L86 80 L80 110" strokeLinecap="round" />
                            {/* Lewa Noga */}
                            <path d="M40 110 L36 150 L38 192" strokeLinecap="round" />
                            {/* Prawa Noga */}
                            <path d="M60 110 L64 150 L62 192" strokeLinecap="round" />
                          </svg>
                        </div>

                        {/* ETYKIETY Z DANYMI */}
                        <div className="w-1/2 space-y-2">
                          <div className={`p-2 rounded-xl border flex justify-between items-center ${isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-gray-50 border-gray-200'}`}>
                            <span className={`text-xs ${textMuted}`}>Klatka</span>
                            <span className="text-xs font-bold font-mono text-cyan-400">{latestStats.chest || 0} cm</span>
                          </div>
                          <div className={`p-2 rounded-xl border flex justify-between items-center ${isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-gray-50 border-gray-200'}`}>
                            <span className={`text-xs ${textMuted}`}>Ramię</span>
                            <span className="text-xs font-bold font-mono text-cyan-400">{latestStats.arm || 0} cm</span>
                          </div>
                          <div className={`p-2 rounded-xl border flex justify-between items-center ${isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-gray-50 border-gray-200'}`}>
                            <span className={`text-xs ${textMuted}`}>Pas</span>
                            <span className="text-xs font-bold font-mono text-cyan-400">{latestStats.waist || 0} cm</span>
                          </div>
                          <div className={`p-2 rounded-xl border flex justify-between items-center ${isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-gray-50 border-gray-200'}`}>
                            <span className={`text-xs ${textMuted}`}>Udo</span>
                            <span className="text-xs font-bold font-mono text-cyan-400">{latestStats.thigh || 0} cm</span>
                          </div>
                        </div>
                      </div>

                      {/* WAGA CIAŁA */}
                      <div className={`p-3 rounded-xl border flex justify-between items-center ${isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center space-x-2">
                          <UserCheck className={`h-5 w-5 ${accentText}`} />
                          <div>
                            <div className="text-xs font-bold">Waga Ciała</div>
                            <div className={`text-xs ${textMuted}`}>Ostatni pomiar</div>
                          </div>
                        </div>
                        <div className="text-xl font-black font-mono tracking-tight text-cyan-400">
                          {latestStats.weight || 0} <span className="text-xs text-neutral-400 font-normal">kg</span>
                        </div>
                      </div>

                      {/* FORMULARZ DODAWANIA POMIARÓW */}
                      <form onSubmit={saveBodyStats} className="space-y-3 pt-2 border-t border-neutral-800">
                        <div className="text-xs font-bold">Dodaj nowy pomiar:</div>
                        <div className="grid grid-cols-3 gap-2">
                          <input 
                            type="text" 
                            inputMode="decimal" 
                            placeholder="Waga (kg)" 
                            value={newWeight} 
                            onChange={(e) => setNewWeight(e.target.value)} 
                            className={`p-2 rounded-lg border text-xs font-bold text-center ${bgInput}`}
                          />
                          <input 
                            type="text" 
                            inputMode="decimal" 
                            placeholder="Ramię (cm)" 
                            value={newArm} 
                            onChange={(e) => setNewArm(e.target.value)} 
                            className={`p-2 rounded-lg border text-xs font-bold text-center ${bgInput}`}
                          />
                          <input 
                            type="text" 
                            inputMode="decimal" 
                            placeholder="Klatka (cm)" 
                            value={newChest} 
                            onChange={(e) => setNewChest(e.target.value)} 
                            className={`p-2 rounded-lg border text-xs font-bold text-center ${bgInput}`}
                          />
                          <input 
                            type="text" 
                            inputMode="decimal" 
                            placeholder="Pas (cm)" 
                            value={newWaist} 
                            onChange={(e) => setNewWaist(e.target.value)} 
                            className={`p-2 rounded-lg border text-xs font-bold text-center ${bgInput}`}
                          />
                          <input 
                            type="text" 
                            inputMode="decimal" 
                            placeholder="Udo (cm)" 
                            value={newThigh} 
                            onChange={(e) => setNewThigh(e.target.value)} 
                            className={`p-2 rounded-lg border text-xs font-bold text-center ${bgInput}`}
                          />
                          <button 
                            type="submit" 
                            className={`py-2 ${accentBg} font-bold rounded-lg text-xs transition-colors`}
                          >
                            Zapisz
                          </button>
                        </div>
                      </form>

                      {/* HISTORIA HISTORYCZNYCH POMIARÓW */}
                      <div className="pt-3 border-t border-neutral-800 space-y-2">
                        <div className="text-xs font-bold flex items-center space-x-1">
                          <History className="h-3.5 w-3.5 text-cyan-400" />
                          <span>Historia wpisów pomiarowych:</span>
                        </div>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                          {bodyStats.map(st => (
                            <div key={st.id} className={`p-2 rounded-lg border text-[11px] font-mono flex justify-between items-center ${isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-gray-50 border-gray-200'}`}>
                              <span className={textMuted}>{st.date}</span>
                              <div className="space-x-2">
                                <span><b>{st.weight}</b>kg</span>
                                <span className={textMuted}>|</span>
                                <span>Pas: <b>{st.waist}</b>cm</span>
                                <span className={textMuted}>|</span>
                                <span>Arm: <b>{st.arm}</b>cm</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>
                )}

                {/* SUB-TAB 3: SZCZEGÓŁOWA HISTORIA ĆWICZEŃ */}
                {statsSubTab === 'history' && (
                  <div className={`p-4 rounded-xl border space-y-3 ${bgCard}`}>
                    <h3 className="font-bold text-sm flex items-center space-x-1.5">
                      <History className={`h-4 w-4 ${accentText}`} />
                      <span>Szczegółowa Historia Ćwiczenia</span>
                    </h3>
                    
                    <select 
                      onChange={(e) => setSelectedStatExId(e.target.value)}
                      value={selectedStatExId || ''}
                      className={`w-full p-2.5 rounded-lg border text-xs font-bold ${bgInput}`}
                    >
                      <option value="">-- Wybierz ćwiczenie z bazy --</option>
                      {exerciseDb.map(ex => (
                        <option key={ex.id} value={ex.id}>{ex.name}</option>
                      ))}
                    </select>

                    {selectedStatExId && (
                      <div className="space-y-2 pt-2">
                        {(() => {
                          const targetEx = exerciseDb.find(e => e.id === selectedStatExId);
                          const exHistory = workoutHistory.filter(w => 
                            w.exercises.some(e => (e.id && e.id === selectedStatExId) || e.name === targetEx?.name)
                          );

                          if (exHistory.length === 0) {
                            return <p className={`text-xs ${textMuted} text-center py-2`}>Brak wykonanych treningów z tym ćwiczeniem.</p>;
                          }

                          return exHistory.map((w, idx) => {
                            const exDetails = w.exercises.find(e => (e.id && e.id === selectedStatExId) || e.name === targetEx?.name);
                            return (
                              <div key={idx} className={`p-3 rounded-lg border space-y-1.5 text-xs ${isDark ? 'bg-neutral-950/80 border-neutral-800' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex justify-between font-bold">
                                  <span>{w.date} ({w.planName})</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {exDetails?.sets.map((s, sIdx) => (
                                    <span key={sIdx} className={`px-2 py-1 rounded text-[11px] font-mono border ${isDark ? 'bg-neutral-900 border-neutral-700 text-cyan-300' : 'bg-white border-gray-300 text-cyan-800'}`}>
                                      S{sIdx + 1}: <strong>{s.reps || 0}</strong> × <strong>{s.weight || 0}kg</strong>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

            {/* TAB 4: PLANY */}
            {activeTab === 'plans' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold">Plany Treningowe</h2>
                  {!isCreatingPlan && (
                    <button onClick={() => setIsCreatingPlan(true)} className={`px-3 py-2 ${accentBg} font-bold text-xs rounded-lg flex items-center space-x-1`}>
                      <Plus className="h-3.5 w-3.5" />
                      <span>Dodaj plan</span>
                    </button>
                  )}
                </div>

                {isCreatingPlan && (
                  <div className={`p-4 rounded-xl border space-y-3 ${bgCard}`}>
                    <input 
                      type="text" 
                      placeholder="Nazwa planu (np. Push / Pull)"
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
                          className={`w-full text-left p-2 rounded text-xs flex justify-between items-center ${
                            selectedExForPlan.includes(ex.id) 
                              ? isDark ? 'bg-cyan-950 text-cyan-400 font-bold' : 'bg-cyan-50 text-cyan-700 font-bold'
                              : textMuted
                          }`}
                        >
                          <span>{ex.name}</span>
                          {selectedExForPlan.includes(ex.id) && <CheckCircle className="h-3.5 w-3.5" />}
                        </button>
                      ))}
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <button 
                        onClick={() => {
                          if (!newPlanName) return;
                          setPlans([...plans, { id: Date.now().toString(), name: newPlanName, exerciseIds: selectedExForPlan }]);
                          setIsCreatingPlan(false);
                          setNewPlanName('');
                          setSelectedExForPlan([]);
                        }}
                        className={`flex-1 py-2 ${accentBg} font-bold rounded-lg text-xs`}
                      >
                        Zapisz Plan
                      </button>
                      <button onClick={() => setIsCreatingPlan(false)} className={`px-4 py-2 border rounded-lg text-xs font-bold ${isDark ? 'border-neutral-800' : 'border-gray-300'}`}>
                        Anuluj
                      </button>
                    </div>
                  </div>
                )}

                {plans.map(p => (
                  <div key={p.id} className={`p-4 rounded-xl border flex justify-between items-center ${bgCard}`}>
                    <div>
                      <h3 className="font-bold text-sm">{p.name}</h3>
                      <p className={`text-xs ${textMuted} mt-0.5`}>{p.exerciseIds.length} ćwiczeń w zestawieniu</p>
                    </div>
                    <button onClick={() => setPlans(plans.filter(item => item.id !== p.id))} className="text-neutral-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 5: BAZA ĆWICZEŃ */}
            {activeTab === 'exercises' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold">Baza Ćwiczeń</h2>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    placeholder="Nazwa nowego ćwiczenia..."
                    value={newExName}
                    onChange={(e) => setNewExName(e.target.value)}
                    className={`flex-1 p-2.5 rounded-lg border text-sm ${bgInput}`}
                  />
                  <button 
                    onClick={() => {
                      if (!newExName) return;
                      setExerciseDb([...exerciseDb, { id: Date.now().toString(), name: newExName, category: 'Ogólne' }]);
                      setNewExName('');
                    }}
                    className={`px-4 ${accentBg} font-bold rounded-lg text-xs`}
                  >
                    Dodaj
                  </button>
                </div>

                <div className={`border rounded-xl divide-y ${bgCard} ${isDark ? 'divide-neutral-800' : 'divide-gray-200'}`}>
                  {exerciseDb.map(ex => (
                    <div key={ex.id} className="p-3.5 flex justify-between items-center text-xs font-semibold">
                      <span>{ex.name}</span>
                      <button onClick={() => setExerciseDb(exerciseDb.filter(e => e.id !== ex.id))} className="text-neutral-400 hover:text-red-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: USTAWIENIA */}
            {activeTab === 'settings' && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold">Ustawienia</h2>

                {/* THEME TOGGLE */}
                <div className={`p-4 rounded-xl border flex justify-between items-center ${bgCard}`}>
                  <div>
                    <div className="text-sm font-bold">Motyw aplikacji</div>
                    <div className={`text-xs ${textMuted}`}>Aplikacja zapamięta Twój wybór.</div>
                  </div>
                  <button 
                    onClick={() => setTheme(isDark ? 'light' : 'dark')}
                    className={`p-2.5 rounded-xl flex items-center space-x-2 text-xs font-bold border ${isDark ? 'bg-neutral-800 border-neutral-700 text-cyan-400' : 'bg-gray-100 border-gray-300 text-gray-800'}`}
                  >
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    <span>{isDark ? 'Jasny' : 'Ciemny'}</span>
                  </button>
                </div>

                {/* CREATINE REMINDER */}
                <div className={`p-4 rounded-xl border space-y-3 ${bgCard}`}>
                  <div className={`flex items-center space-x-2 ${accentText}`}>
                    <Bell className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Kreatyna o 9:00</span>
                  </div>
                  <p className={`text-xs ${textMuted}`}>
                    Ustaw godzinę przypomnienia i pobierz plik `.ics` do Kalendarza na iOS lub Android.
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
                      className={`flex-1 ${accentBg} font-bold rounded-lg text-xs py-2`}
                    >
                      Dodaj do Kalendarza iOS
                    </button>
                  </div>
                </div>

              </div>
            )}
          </>
        )}

      </main>

      {/* START WORKOUT MODAL */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`border rounded-xl p-4 max-w-xs w-full space-y-3 ${bgCard}`}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm">Wybierz plan treningowy</h3>
              <button onClick={() => setShowStartModal(false)}>
                <X className="h-4 w-4 text-neutral-400" />
              </button>
            </div>
            {plans.map(p => (
              <button
                key={p.id}
                onClick={() => startWorkout(p)}
                className={`w-full text-left p-3 rounded-xl border font-bold text-xs flex justify-between items-center transition-all ${
                  isDark ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/40' : 'bg-cyan-50 border-cyan-200 text-cyan-800 hover:bg-cyan-100'
                }`}
              >
                <span>{p.name}</span>
                <Play className="h-3.5 w-3.5 fill-current" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* WORKOUT SUMMARY MODAL */}
      {summaryData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`border rounded-xl p-5 max-w-sm w-full space-y-4 text-center ${bgCard}`}>
            <div className="flex justify-center">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-full">
                <CheckCircle className="h-8 w-8" />
              </div>
            </div>
            <h3 className="font-black text-lg">Trening Ukończony!</h3>
            
            <div className={`grid grid-cols-3 gap-2 py-3 border-y text-center ${isDark ? 'border-neutral-800' : 'border-gray-200'}`}>
              <div>
                <div className={`text-[10px] ${textMuted}`}>Czas</div>
                <div className="font-bold text-sm">{summaryData.duration}</div>
              </div>
              <div>
                <div className={`text-[10px] ${textMuted}`}>Powtórzenia</div>
                <div className="font-bold text-sm">{summaryData.totalReps}</div>
              </div>
              <div>
                <div className={`text-[10px] ${textMuted}`}>Tonaż</div>
                <div className={`font-bold text-sm ${accentText}`}>{summaryData.totalWeight} kg</div>
              </div>
            </div>

            <button 
              onClick={() => setSummaryData(null)}
              className={`w-full py-3 ${accentBg} font-bold rounded-xl text-xs`}
            >
              Zamknij
            </button>
          </div>
        </div>
      )}

      {/* FIXED BOTTOM NAVIGATION */}
      {!activeSession && (
        <nav className={`fixed bottom-0 left-0 right-0 border-t p-2 flex justify-around z-50 backdrop-blur-md ${isDark ? 'bg-neutral-950/90 border-neutral-800' : 'bg-white/90 border-gray-200 shadow-lg'}`}>
          <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center p-1 text-[10px] font-bold ${activeTab === 'history' ? accentText : textMuted}`}>
            <CalendarIcon className="h-4 w-4 mb-0.5" />
            <span>Historia</span>
          </button>

          <button onClick={() => setActiveTab('stats')} className={`flex flex-col items-center p-1 text-[10px] font-bold ${activeTab === 'stats' ? accentText : textMuted}`}>
            <BarChart3 className="h-4 w-4 mb-0.5" />
            <span>Statystyki</span>
          </button>

          <button onClick={() => setActiveTab('plans')} className={`flex flex-col items-center p-1 text-[10px] font-bold ${activeTab === 'plans' ? accentText : textMuted}`}>
            <Dumbbell className="h-4 w-4 mb-0.5" />
            <span>Plany</span>
          </button>

          <button onClick={() => setActiveTab('start')} className={`flex flex-col items-center p-1 text-[10px] font-bold ${activeTab === 'start' ? accentText : textMuted}`}>
            <Play className="h-4 w-4 mb-0.5 fill-current" />
            <span>Start</span>
          </button>

          <button onClick={() => setActiveTab('exercises')} className={`flex flex-col items-center p-1 text-[10px] font-bold ${activeTab === 'exercises' ? accentText : textMuted}`}>
            <Plus className="h-4 w-4 mb-0.5" />
            <span>Ćwiczenia</span>
          </button>

          <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center p-1 text-[10px] font-bold ${activeTab === 'settings' ? accentText : textMuted}`}>
            <Settings className="h-4 w-4 mb-0.5" />
            <span>Ustawienia</span>
          </button>
        </nav>
      )}

    </div>
  );
}
