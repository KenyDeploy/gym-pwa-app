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
  // SPLASH SCREEN
  const [showSplash, setShowSplash] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

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

  // BODY MEASUREMENTS
  const [bodyStats, setBodyStats] = useState(() => {
    const saved = localStorage.getItem('pm_body_stats');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        date: '2026-08-01',
        weight: 82.5,
        chest: 108,
        arm: 39,
        waist: 86,
        thigh: 61
      }
    ];
  });

  // UI STATES
  const [activeTab, setActiveTab] = useState('start');
  const [statsSubTab, setStatsSubTab] = useState('records');
  const [newExName, setNewExName] = useState('');
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [selectedExForPlan, setSelectedExForPlan] = useState([]);
  const [selectedStatExId, setSelectedStatExId] = useState('');

  // MEASUREMENT FORM
  const [newWeight, setNewWeight] = useState('');
  const [newChest, setNewChest] = useState('');
  const [newArm, setNewArm] = useState('');
  const [newWaist, setNewWaist] = useState('');
  const [newThigh, setNewThigh] = useState('');

  // WORKOUT SESSION
  const [activeSession, setActiveSession] = useState(null);
  const activeSessionRef = useRef(activeSession);
  activeSessionRef.current = activeSession;

  const [activeExIdx, setActiveExIdx] = useState(0);
  const [showStartModal, setShowStartModal] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [summaryData, setSummaryData] = useState(null);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(null);

  // SETTINGS
  const [creatineTime, setCreatineTime] = useState('09:00');
  const [currentDate, setCurrentDate] = useState(new Date());

  // LOCAL DATE - avoids UTC date shifting
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Brak';
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString('pl-PL');
  };

  // SPLASH SCREEN - REAL PROGRESS
  useEffect(() => {
    let progress = 0;

    const interval = setInterval(() => {
      progress += Math.random() * 10 + 5;

      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        setTimeout(() => {
          setShowSplash(false);
        }, 350);
      }

      setLoadingProgress(Math.floor(progress));
    }, 130);

    return () => clearInterval(interval);
  }, []);

  // SAVE TO LOCALSTORAGE
  useEffect(() => {
    localStorage.setItem('pm_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('pm_exercises', JSON.stringify(exerciseDb));
  }, [exerciseDb]);

  useEffect(() => {
    localStorage.setItem('pm_plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem('pm_history', JSON.stringify(workoutHistory));
  }, [workoutHistory]);

  useEffect(() => {
    localStorage.setItem('pm_marked_days', JSON.stringify(markedDays));
  }, [markedDays]);

  useEffect(() => {
    localStorage.setItem('pm_body_stats', JSON.stringify(bodyStats));
  }, [bodyStats]);

  // TIMER
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

    return `${hrs > 0 ? hrs + ':' : ''}${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // WORKOUT LOGIC
  const startWorkout = (plan) => {
    const sessionExercises = plan.exerciseIds.map(id => {
      const ex = exerciseDb.find(e => e.id === id);

      return {
        id,
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
    const updated = {
      ...activeSession,
      exercises: activeSession.exercises.map((exercise, idx) =>
        idx === exIdx
          ? {
              ...exercise,
              sets: [...exercise.sets, { reps: '', weight: '' }]
            }
          : exercise
      )
    };

    setActiveSession(updated);
  };

  const deleteSpecificSet = (exIdx, setIdx) => {
    const updated = {
      ...activeSession,
      exercises: activeSession.exercises.map((exercise, idx) =>
        idx === exIdx && exercise.sets.length > 1
          ? {
              ...exercise,
              sets: exercise.sets.filter((_, i) => i !== setIdx)
            }
          : exercise
      )
    };

    setActiveSession(updated);
  };

  const removeSet = (exIdx) => {
    const updated = {
      ...activeSession,
      exercises: activeSession.exercises.map((exercise, idx) =>
        idx === exIdx && exercise.sets.length > 1
          ? {
              ...exercise,
              sets: exercise.sets.slice(0, -1)
            }
          : exercise
      )
    };

    setActiveSession(updated);
  };

  const updateSet = (exIdx, setIdx, field, val) => {
    const updated = {
      ...activeSession,
      exercises: activeSession.exercises.map((exercise, idx) =>
        idx === exIdx
          ? {
              ...exercise,
              sets: exercise.sets.map((set, i) =>
                i === setIdx
                  ? { ...set, [field]: val }
                  : set
              )
            }
          : exercise
      )
    };

    setActiveSession(updated);
  };

  const copyPreviousSet = (exIdx, setIdx) => {
    if (setIdx === 0) return;

    const updated = {
      ...activeSession,
      exercises: activeSession.exercises.map((exercise, idx) =>
        idx === exIdx
          ? {
              ...exercise,
              sets: exercise.sets.map((set, i) =>
                i === setIdx
                  ? { ...exercise.sets[setIdx - 1] }
                  : set
              )
            }
          : exercise
      )
    };

    setActiveSession(updated);
  };

  const finishWorkout = () => {
    if (!activeSession) return;

    const todayStr = getLocalDateString();

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

    setWorkoutHistory(prev => [newEntry, ...prev]);

    if (!markedDays.includes(todayStr)) {
      setMarkedDays(prev => [...prev, todayStr]);
    }

    setSummaryData(newEntry);
    setActiveSession(null);
  };

  const deleteWorkoutHistory = (id) => {
    setWorkoutHistory(prev => prev.filter(item => item.id !== id));
  };

  // BODY STATS
  const saveBodyStats = (e) => {
    e.preventDefault();

    if (!newWeight && !newArm && !newWaist && !newChest && !newThigh) {
      return;
    }

    const todayStr = getLocalDateString();
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

    setBodyStats(prevStats => [newEntry, ...prevStats]);

    setNewWeight('');
    setNewChest('');
    setNewArm('');
    setNewWaist('');
    setNewThigh('');
  };

  const toggleDayMark = (dateStr) => {
    if (markedDays.includes(dateStr)) {
      setMarkedDays(prev => prev.filter(d => d !== dateStr));
    } else {
      setMarkedDays(prev => [...prev, dateStr]);
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
DTSTART:${getLocalDateString().replaceAll('-', '')}T${hh}${mm}00
DURATION:PT15M
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], {
      type: 'text/calendar;charset=utf-8;'
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.setAttribute('download', 'kreatyna.ics');

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  };

  const getPreviousExData = (exId, exName) => {
    for (const w of workoutHistory) {
      const found = w.exercises.find(
        e => (e.id && e.id === exId) || e.name === exName
      );

      if (
        found &&
        found.sets.some(
          s => parseFloat(s.weight) > 0 || parseInt(s.reps) > 0
        )
      ) {
        return found;
      }
    }

    return null;
  };

  const currentEx = activeSession?.exercises[activeExIdx];

  const prevExData = currentEx
    ? getPreviousExData(currentEx.id, currentEx.name)
    : null;

  const currentExReps =
    currentEx?.sets.reduce(
      (acc, s) => acc + (parseInt(s.reps) || 0),
      0
    ) || 0;

  const currentExWeight =
    currentEx?.sets.reduce(
      (acc, s) =>
        acc +
        ((parseInt(s.reps) || 0) * (parseFloat(s.weight) || 0)),
      0
    ) || 0;

  // THEME
  const isDark = theme === 'dark';

  const bgMain = isDark
    ? 'bg-neutral-950 text-white'
    : 'bg-slate-50 text-slate-900';

  const bgCard = isDark
    ? 'bg-neutral-900/90 border-neutral-800'
    : 'bg-white border-slate-200 shadow-sm';

  const bgInput = isDark
    ? 'bg-neutral-950 border-neutral-800 text-white'
    : 'bg-slate-100 border-slate-300 text-slate-900';

  const textMuted = isDark
    ? 'text-neutral-400'
    : 'text-slate-500';

  const accentText = isDark
    ? 'text-violet-400'
    : 'text-indigo-600';

  const accentBg = isDark
    ? 'bg-violet-500 text-white hover:bg-violet-400'
    : 'bg-indigo-600 text-white hover:bg-indigo-700';

  const historyForSelectedDate = selectedHistoryDate
    ? workoutHistory.filter(w => w.date === selectedHistoryDate)
    : [];

  const latestStats = bodyStats[0] || {};

  return (
    <div className={`min-h-screen ${bgMain} flex flex-col font-sans transition-colors duration-200 relative`}>

      {/* SPLASH SCREEN */}
      {showSplash && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-neutral-950 text-white p-6 text-center">

          <div className="relative mb-5">
            <div className="absolute inset-0 rounded-3xl bg-violet-500/20 blur-2xl scale-110" />

            <img
              src="/logo.png"
              alt="Pakiernia U Matiego"
              className="relative w-44 h-44 object-cover rounded-3xl border-2 border-violet-400 shadow-2xl shadow-violet-500/30"
              onError={(e) => {
                e.currentTarget.style.opacity = '0';
              }}
            />
          </div>

          <h1 className="text-xl font-black uppercase tracking-[0.18em] bg-gradient-to-r from-violet-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
            PAKIERNIA U MATIEGO
          </h1>

          <div className="w-64 max-w-xs mt-8 space-y-3">

            <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-neutral-400">
              <span className="flex items-center space-x-1.5">
                <Zap className="h-3 w-3 text-violet-400 animate-pulse" />
                <span>
                  {loadingProgress < 100
                    ? 'Ładowanie formy...'
                    : 'Gotowe!'}
                </span>
              </span>

              <span className="text-violet-400 font-bold">
                {loadingProgress}%
              </span>
            </div>

            <div className="h-2.5 w-full bg-neutral-800 rounded-full overflow-hidden border border-neutral-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-400 shadow-lg shadow-violet-500/30 transition-all duration-150 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>

            <div className="text-[9px] text-neutral-600 font-mono">
              SYSTEM TRENINGOWY • PAKIERNIA
            </div>

          </div>
        </div>
      )}

      {/* HEADER */}
      <header className={`p-4 border-b ${
        isDark
          ? 'bg-neutral-900 border-neutral-800'
          : 'bg-white border-slate-200'
      } sticky top-0 z-10 flex justify-between items-center`}>

        <div className="flex items-center space-x-2">
          <Dumbbell className={`h-6 w-6 ${accentText}`} />

          <h1 className="text-lg font-black tracking-wider uppercase">
            PAKIERNIA{' '}
            <span className={accentText}>
              U MATIEGO
            </span>
          </h1>
        </div>

        {activeSession && (
          <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold ${
            isDark
              ? 'bg-violet-950 text-violet-400 border border-violet-500/30'
              : 'bg-violet-50 text-violet-700 border border-violet-200'
          }`}>
            <Timer className="h-3.5 w-3.5" />
            <span>{formatTime(timerSeconds)}</span>
          </div>
        )}
      </header>

      {/* MAIN */}
      <main className="flex-1 p-4 max-w-lg w-full mx-auto pb-28">

        {/* ACTIVE WORKOUT */}
        {activeSession ? (
          <div className="space-y-4">

            <div className={`p-3.5 rounded-2xl border ${bgCard} shadow-sm space-y-2.5`}>
              <div className="flex items-center justify-between text-xs font-bold">

                <button
                  disabled={activeExIdx === 0}
                  onClick={() =>
                    setActiveExIdx(prev => Math.max(0, prev - 1))
                  }
                  className={`px-3 py-1.5 rounded-xl flex items-center space-x-1 transition-all disabled:opacity-30 ${
                    isDark
                      ? 'bg-neutral-800 text-violet-400 hover:bg-neutral-700'
                      : 'bg-slate-100 text-indigo-700 hover:bg-slate-200'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Poprzednie</span>
                </button>

                <span className={`text-xs font-mono font-bold ${textMuted}`}>
                  Ćwiczenie{' '}
                  <span className={`${accentText} font-black`}>
                    {activeExIdx + 1}
                  </span>{' '}
                  z {activeSession.exercises.length}
                </span>

                <button
                  disabled={
                    activeExIdx === activeSession.exercises.length - 1
                  }
                  onClick={() =>
                    setActiveExIdx(prev =>
                      Math.min(
                        activeSession.exercises.length - 1,
                        prev + 1
                      )
                    )
                  }
                  className={`px-3 py-1.5 rounded-xl flex items-center space-x-1 transition-all disabled:opacity-30 ${
                    isDark
                      ? 'bg-neutral-800 text-violet-400 hover:bg-neutral-700'
                      : 'bg-slate-100 text-indigo-700 hover:bg-slate-200'
                  }`}
                >
                  <span>Następne</span>
                  <ChevronRight className="h-4 w-4" />
                </button>

              </div>

              <div className="flex gap-1.5 justify-center pt-1">
                {activeSession.exercises.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveExIdx(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === activeExIdx
                        ? 'w-7 bg-violet-500 shadow-sm'
                        : isDark
                          ? 'w-2 bg-neutral-800'
                          : 'w-2 bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* PREVIOUS RESULT */}
            <div className={`p-4 rounded-2xl border ${
              isDark
                ? 'bg-violet-950/30 border-violet-500/30 text-white'
                : 'bg-violet-50/80 border-violet-200 text-slate-900'
            } space-y-2.5`}>

              <div className="flex items-center space-x-2 font-bold text-xs uppercase tracking-wider text-violet-500">
                <Target className="h-4 w-4" />
                <span>Cel i wynik z poprzedniego treningu</span>
              </div>

              {prevExData ? (
                <div className="space-y-2">

                  <div className="flex flex-wrap gap-1.5">
                    {prevExData.sets.map((s, idx) => (
                      <div
                        key={idx}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border ${
                          isDark
                            ? 'bg-neutral-900 border-violet-500/40 text-violet-300'
                            : 'bg-white border-violet-200 text-violet-900 shadow-sm'
                        }`}
                      >
                        S{idx + 1}: {s.reps || 0} × {s.weight || 0} kg
                      </div>
                    ))}
                  </div>

                  <div className={`text-xs font-bold p-2 rounded-xl flex items-center justify-between ${
                    isDark
                      ? 'bg-violet-400/10 text-violet-300'
                      : 'bg-violet-100/70 text-violet-900'
                  }`}>
                    <span>🎯 Dzisiejszy cel:</span>
                    <span className="font-black">
                      +1 powtórzenie lub +2.5 kg!
                    </span>
                  </div>

                </div>
              ) : (
                <p className={`text-xs font-medium ${textMuted}`}>
                  Brak historii dla tego ćwiczenia. Zrób serie bazowe!
                </p>
              )}
            </div>

            {/* ACTIVE EXERCISE */}
            <div className={`border rounded-2xl p-4 space-y-4 ${bgCard}`}>

              <h2 className={`text-xl font-black ${accentText} tracking-tight`}>
                {currentEx?.name}
              </h2>

              <div className={`grid grid-cols-2 gap-2 text-center py-2.5 rounded-xl border ${
                isDark
                  ? 'bg-neutral-950/60 border-neutral-800'
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <div className={`text-[11px] ${textMuted} uppercase font-semibold`}>
                    Suma powtórzeń
                  </div>
                  <div className="text-lg font-black">
                    {currentExReps}
                  </div>
                </div>

                <div>
                  <div className={`text-[11px] ${textMuted} uppercase font-semibold`}>
                    Suma ciężaru
                  </div>
                  <div className={`text-lg font-black ${accentText}`}>
                    {currentExWeight} kg
                  </div>
                </div>
              </div>

              <div className={`grid grid-cols-12 gap-2 text-xs font-bold ${textMuted} px-1 text-center`}>
                <div className="col-span-1">#</div>
                <div className="col-span-4">Powtórzenia</div>
                <div className="col-span-4">Ciężar (kg)</div>
                <div className="col-span-3">Akcje</div>
              </div>

              {currentEx?.sets.map((set, sIdx) => (
                <div key={sIdx} className="grid grid-cols-12 gap-2 items-center">

                  <span className={`col-span-1 font-black text-xs text-center ${textMuted}`}>
                    {sIdx + 1}
                  </span>

                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={set.reps}
                    onChange={(e) =>
                      updateSet(
                        activeExIdx,
                        sIdx,
                        'reps',
                        e.target.value
                      )
                    }
                    className={`col-span-4 border rounded-xl p-2.5 text-center font-black text-base transition-all focus:border-violet-500 focus:outline-none ${bgInput}`}
                  />

                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={set.weight}
                    onChange={(e) =>
                      updateSet(
                        activeExIdx,
                        sIdx,
                        'weight',
                        e.target.value
                      )
                    }
                    className={`col-span-4 border rounded-xl p-2.5 text-center font-black text-base transition-all focus:border-violet-500 focus:outline-none ${bgInput}`}
                  />

                  <div className="col-span-3 flex justify-center items-center space-x-1">

                    <button
                      onClick={() =>
                        copyPreviousSet(activeExIdx, sIdx)
                      }
                      disabled={sIdx === 0}
                      className="p-2 text-slate-400 hover:text-violet-500 disabled:opacity-20 transition-colors"
                      title="Kopiuj z poprzedniej serii"
                    >
                      <Copy className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() =>
                        deleteSpecificSet(activeExIdx, sIdx)
                      }
                      disabled={currentEx.sets.length <= 1}
                      className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-20 transition-colors"
                      title="Usuń tę serię"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                  </div>
                </div>
              ))}

              <div className="flex space-x-2 pt-2">

                <button
                  onClick={() => addSet(activeExIdx)}
                  className={`flex-1 py-3 ${accentBg} font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-violet-500/10 active:scale-[0.98] transition-all`}
                >
                  <Plus className="h-4 w-4" />
                  <span>Dodaj serię</span>
                </button>

                <button
                  onClick={() => removeSet(activeExIdx)}
                  disabled={currentEx?.sets.length <= 1}
                  className={`px-4 py-3 border rounded-xl text-xs font-bold transition-all disabled:opacity-30 ${
                    isDark
                      ? 'border-neutral-800 text-neutral-400 hover:text-red-400 hover:border-red-900'
                      : 'border-slate-300 text-slate-700 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  Usuń ostatnią
                </button>

              </div>
            </div>

            {/* EXERCISE NAV */}
            <div className="flex justify-between items-center space-x-2">

              <button
                disabled={activeExIdx === 0}
                onClick={() =>
                  setActiveExIdx(prev => Math.max(0, prev - 1))
                }
                className={`flex-1 py-3 px-3 border rounded-2xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all disabled:opacity-30 ${
                  isDark
                    ? 'border-neutral-800 bg-neutral-900 text-neutral-300'
                    : 'border-slate-300 bg-white text-slate-700 shadow-sm'
                }`}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Poprzednie</span>
              </button>

              <button
                disabled={
                  activeExIdx === activeSession.exercises.length - 1
                }
                onClick={() =>
                  setActiveExIdx(prev =>
                    Math.min(
                      activeSession.exercises.length - 1,
                      prev + 1
                    )
                  )
                }
                className={`flex-1 py-3 px-3 border rounded-2xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all disabled:opacity-30 ${
                  isDark
                    ? 'border-neutral-800 bg-neutral-900 text-neutral-300'
                    : 'border-slate-300 bg-white text-slate-700 shadow-sm'
                }`}
              >
                <span>Następne</span>
                <ArrowRight className="h-4 w-4" />
              </button>

            </div>

            <div className="flex justify-between items-center pt-2">

              <button
                onClick={() => setActiveSession(null)}
                className="text-xs font-bold text-red-500 hover:underline px-2 py-1"
              >
                Anuluj trening
              </button>

              <button
                onClick={finishWorkout}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-6 rounded-2xl text-xs flex items-center space-x-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
              >
                <CheckCircle className="h-4 w-4" />
                <span>ZAKOŃCZ TRENING</span>
              </button>

            </div>
          </div>

        ) : (

          <>
            {/* START */}
            {activeTab === 'start' && (
              <div className="space-y-6">

                <div>
                  <h2 className={`text-xs font-bold uppercase tracking-wider ${textMuted} mb-3`}>
                    Ostatni trening
                  </h2>

                  {workoutHistory.length > 0 ? (
                    <div className={`p-4 rounded-xl border space-y-3 ${bgCard}`}>

                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm">
                          {workoutHistory[0].planName}
                        </span>
                        <span className={`text-xs ${textMuted}`}>
                          {formatDate(workoutHistory[0].date)}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-200 dark:border-neutral-800">

                        <div>
                          <div className={`text-[10px] ${textMuted}`}>
                            Czas
                          </div>
                          <div className="font-bold text-xs">
                            {workoutHistory[0].duration}
                          </div>
                        </div>

                        <div>
                          <div className={`text-[10px] ${textMuted}`}>
                            Powtórzenia
                          </div>
                          <div className="font-bold text-xs">
                            {workoutHistory[0].totalReps}
                          </div>
                        </div>

                        <div>
                          <div className={`text-[10px] ${textMuted}`}>
                            Tonaż
                          </div>
                          <div className={`font-bold text-xs ${accentText}`}>
                            {workoutHistory[0].totalWeight} kg
                          </div>
                        </div>

                      </div>
                    </div>
                  ) : (
                    <div className={`p-4 rounded-xl border text-center ${bgCard}`}>
                      <p className={`text-xs ${textMuted}`}>
                        Brak zarejestrowanych treningów. Czas na pierwszy trening!
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowStartModal(true)}
                  className={`w-full py-4 ${accentBg} font-black tracking-wider uppercase rounded-2xl shadow-xl shadow-violet-500/10 text-center transition-transform active:scale-95 flex items-center justify-center space-x-2 text-base`}
                >
                  <Play className="h-5 w-5 fill-current" />
                  <span>ROZPOCZNIJ TRENING</span>
                </button>

              </div>
            )}

            {/* HISTORY */}
            {activeTab === 'history' && (
              <div className="space-y-4">

                <div>
                  <h2 className="text-lg font-bold">
                    Kalendarz i Historia
                  </h2>
                  <p className={`text-xs ${textMuted}`}>
                    Kliknij dzień w kalendarzu, aby zobaczyć podsumowanie treningu.
                  </p>
                </div>

                <div className={`border rounded-xl p-4 space-y-4 ${bgCard}`}>

                  <div className="flex justify-between items-center">

                    <h3 className="font-bold text-sm">
                      {currentDate
                        .toLocaleString('pl-PL', {
                          month: 'long',
                          year: 'numeric'
                        })
                        .toUpperCase()}
                    </h3>

                    <div className="flex space-x-1">

                      <button
                        onClick={() =>
                          setCurrentDate(
                            new Date(
                              currentDate.getFullYear(),
                              currentDate.getMonth() - 1,
                              1
                            )
                          )
                        }
                        className={`p-1.5 rounded-lg border ${
                          isDark
                            ? 'border-neutral-800 bg-neutral-950'
                            : 'border-slate-300 bg-slate-50'
                        }`}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() =>
                          setCurrentDate(
                            new Date(
                              currentDate.getFullYear(),
                              currentDate.getMonth() + 1,
                              1
                            )
                          )
                        }
                        className={`p-1.5 rounded-lg border ${
                          isDark
                            ? 'border-neutral-800 bg-neutral-950'
                            : 'border-slate-300 bg-slate-50'
                        }`}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>

                    </div>
                  </div>

                  <div className={`grid grid-cols-7 gap-1 text-center font-bold text-xs ${textMuted}`}>
                    <div>Pn</div>
                    <div>Wt</div>
                    <div>Śr</div>
                    <div>Cz</div>
                    <div>Pt</div>
                    <div>So</div>
                    <div>Nd</div>
                  </div>

                  <div className="grid grid-cols-7 gap-1">

                    {Array.from({
                      length:
                        (new Date(
                          currentDate.getFullYear(),
                          currentDate.getMonth(),
                          1
                        ).getDay() || 7) - 1
                    }).map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="h-9"
                      />
                    ))}

                    {Array.from({
                      length: new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() + 1,
                        0
                      ).getDate()
                    }).map((_, i) => {

                      const dayNum = i + 1;

                      const dateStr = `${currentDate.getFullYear()}-${String(
                        currentDate.getMonth() + 1
                      ).padStart(2, '0')}-${String(dayNum).padStart(
                        2,
                        '0'
                      )}`;

                      const isMarked = markedDays.includes(dateStr);
                      const isSelected =
                        selectedHistoryDate === dateStr;

                      return (
                        <button
                          key={dayNum}
                          onClick={() => {
                            if (!isMarked) {
                              toggleDayMark(dateStr);
                            }
                            setSelectedHistoryDate(dateStr);
                          }}
                          className={`h-9 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                            isMarked
                              ? `${accentBg} font-black`
                              : isSelected
                                ? 'border-2 border-violet-500'
                                : isDark
                                  ? 'bg-neutral-950 text-neutral-400 hover:bg-neutral-800'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {dayNum}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedHistoryDate && (
                  <div className={`border rounded-xl p-4 space-y-4 ${bgCard}`}>

                    <div className="flex justify-between items-center border-b pb-2 dark:border-neutral-800 border-slate-200">

                      <h3 className="font-bold text-sm">
                        Trening z dnia {formatDate(selectedHistoryDate)}
                      </h3>

                      <button
                        onClick={() => setSelectedHistoryDate(null)}
                      >
                        <X className="h-4 w-4 text-slate-400" />
                      </button>

                    </div>

                    {historyForSelectedDate.length > 0 ? (
                      historyForSelectedDate.map(h => (
                        <div
                          key={h.id}
                          className="space-y-3 relative"
                        >

                          <div className="flex justify-between items-center pr-8">

                            <span className={`font-black text-sm ${accentText}`}>
                              {h.planName}
                            </span>

                            <span className={`text-xs font-mono ${textMuted}`}>
                              {h.duration} | Tonaż: {h.totalWeight} kg
                            </span>

                          </div>

                          <button
                            onClick={() =>
                              deleteWorkoutHistory(h.id)
                            }
                            className="absolute top-0 right-0 text-slate-400 hover:text-red-500 p-1"
                            title="Usuń trening z historii"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                          <div className="space-y-2 pt-1">

                            {h.exercises.map((e, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                                  isDark
                                    ? 'bg-neutral-950/80 border-neutral-800'
                                    : 'bg-slate-50 border-slate-200'
                                }`}
                              >

                                <div className="flex justify-between items-center">

                                  <span className="font-bold text-xs">
                                    {e.name}
                                  </span>

                                  <span className="text-[10px] text-violet-500 font-mono">
                                    {e.sets.length} serie
                                  </span>

                                </div>

                                <div className="flex flex-wrap gap-1.5 pt-1">

                                  {e.sets.map((s, sIdx) => (
                                    <span
                                      key={sIdx}
                                      className={`px-2 py-1 rounded-md text-[11px] font-mono border ${
                                        isDark
                                          ? 'bg-neutral-900 border-neutral-700 text-violet-300'
                                          : 'bg-white border-slate-300 text-violet-900'
                                      }`}
                                    >
                                      S{sIdx + 1}:{' '}
                                      <strong>{s.reps || 0}</strong>{' '}
                                      powt. ×{' '}
                                      <strong>{s.weight || 0}</strong>{' '}
                                      kg
                                    </span>
                                  ))}

                                </div>
                              </div>
                            ))}

                          </div>
                        </div>
                      ))
                    ) : (
                      <p className={`text-xs ${textMuted}`}>
                        Brak zapisanego treningu w tym dniu.
                      </p>
                    )}

                  </div>
                )}

              </div>
            )}

            {/* STATS */}
            {activeTab === 'stats' && (
              <div className="space-y-4">

                <div className={`p-1 rounded-xl border flex text-xs font-bold ${
                  isDark
                    ? 'bg-neutral-900 border-neutral-800'
                    : 'bg-slate-200 border-slate-300'
                }`}>

                  <button
                    onClick={() => setStatsSubTab('records')}
                    className={`flex-1 py-2 rounded-lg text-center transition-all ${
                      statsSubTab === 'records'
                        ? accentBg
                        : textMuted
                    }`}
                  >
                    Rekordy PR
                  </button>

                  <button
                    onClick={() => setStatsSubTab('body')}
                    className={`flex-1 py-2 rounded-lg text-center transition-all ${
                      statsSubTab === 'body'
                        ? accentBg
                        : textMuted
                    }`}
                  >
                    Pomiary Ciała
                  </button>

                  <button
                    onClick={() => setStatsSubTab('history')}
                    className={`flex-1 py-2 rounded-lg text-center transition-all ${
                      statsSubTab === 'history'
                        ? accentBg
                        : textMuted
                    }`}
                  >
                    Ćwiczenia
                  </button>

                </div>

                {/* RECORDS */}
                {statsSubTab === 'records' && (
                  <div className={`p-4 rounded-xl border space-y-3 ${bgCard}`}>

                    <h3 className="font-bold text-sm flex items-center space-x-1.5">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      <span>Rekordy Życiowe (Max Ciężar)</span>
                    </h3>

                    <div className="space-y-2">

                      {exerciseDb.map(ex => {

                        let maxWeight = 0;
                        let bestReps = 0;

                        workoutHistory.forEach(w => {

                          const found = w.exercises.find(
                            e =>
                              (e.id && e.id === ex.id) ||
                              e.name === ex.name
                          );

                          if (found) {
                            found.sets.forEach(s => {

                              const wVal =
                                parseFloat(s.weight) || 0;

                              const rVal =
                                parseInt(s.reps) || 0;

                              if (wVal > maxWeight) {
                                maxWeight = wVal;
                                bestReps = rVal;
                              }
                            });
                          }
                        });

                        return (
                          <div
                            key={ex.id}
                            className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100 dark:border-neutral-800 last:border-0"
                          >
                            <span className="font-semibold">
                              {ex.name}
                            </span>

                            <span className={`font-bold font-mono ${
                              maxWeight > 0
                                ? accentText
                                : textMuted
                            }`}>
                              {maxWeight > 0
                                ? `${maxWeight} kg (${bestReps} powt.)`
                                : 'Brak danych'}
                            </span>
                          </div>
                        );
                      })}

                    </div>
                  </div>
                )}

                {/* BODY */}
                {statsSubTab === 'body' && (
                  <div className="space-y-4">

                    <div className={`p-4 rounded-2xl border space-y-4 ${bgCard}`}>

                      <div className="flex justify-between items-center">

                        <h3 className="font-bold text-sm flex items-center space-x-1.5">
                          <Activity className={`h-4 w-4 ${accentText}`} />
                          <span>Anatomia Formy & Wyniki</span>
                        </h3>

                        <span className={`text-[10px] font-mono ${textMuted}`}>
                          Data: {latestStats.date
                            ? formatDate(latestStats.date)
                            : 'Brak'}
                        </span>

                      </div>

                      {/* REALISTIC BODY IMAGE */}
                      <div className={`relative w-full h-80 rounded-2xl border flex items-center justify-between p-4 overflow-hidden ${
                        isDark
                          ? 'bg-neutral-950 border-neutral-800'
                          : 'bg-slate-100 border-slate-200'
                      }`}>

                        <div className="absolute left-[22%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-64 bg-violet-500/10 blur-3xl rounded-full" />

                        <div className="relative w-[52%] h-full flex items-center justify-center">

                          <img
                            src="/body.png"
                            alt="Sylwetka człowieka"
                            className={`h-full w-auto max-w-full object-contain ${
                              isDark
                                ? 'drop-shadow-[0_0_18px_rgba(139,92,246,0.25)]'
                                : 'drop-shadow-[0_5px_15px_rgba(79,70,229,0.15)]'
                            }`}
                            onError={(e) => {
                              e.currentTarget.style.opacity = '0.2';
                            }}
                          />

                        </div>

                        <div className="relative w-[48%] space-y-2">

                          <div className={`p-2.5 rounded-xl border flex justify-between items-center ${
                            isDark
                              ? 'bg-neutral-900/90 border-violet-500/20'
                              : 'bg-white border-slate-200 shadow-sm'
                          }`}>
                            <span className={`text-xs ${textMuted}`}>
                              Klatka
                            </span>
                            <span className="text-xs font-bold font-mono text-violet-400">
                              {latestStats.chest || 0} cm
                            </span>
                          </div>

                          <div className={`p-2.5 rounded-xl border flex justify-between items-center ${
                            isDark
                              ? 'bg-neutral-900/90 border-violet-500/20'
                              : 'bg-white border-slate-200 shadow-sm'
                          }`}>
                            <span className={`text-xs ${textMuted}`}>
                              Ramię
                            </span>
                            <span className="text-xs font-bold font-mono text-violet-400">
                              {latestStats.arm || 0} cm
                            </span>
                          </div>

                          <div className={`p-2.5 rounded-xl border flex justify-between items-center ${
                            isDark
                              ? 'bg-neutral-900/90 border-violet-500/20'
                              : 'bg-white border-slate-200 shadow-sm'
                          }`}>
                            <span className={`text-xs ${textMuted}`}>
                              Pas
                            </span>
                            <span className="text-xs font-bold font-mono text-violet-400">
                              {latestStats.waist || 0} cm
                            </span>
                          </div>

                          <div className={`p-2.5 rounded-xl border flex justify-between items-center ${
                            isDark
                              ? 'bg-neutral-900/90 border-violet-500/20'
                              : 'bg-white border-slate-200 shadow-sm'
                          }`}>
                            <span className={`text-xs ${textMuted}`}>
                              Udo
                            </span>
                            <span className="text-xs font-bold font-mono text-violet-400">
                              {latestStats.thigh || 0} cm
                            </span>
                          </div>

                        </div>
                      </div>

                      {/* WEIGHT */}
                      <div className={`p-3 rounded-xl border flex justify-between items-center ${
                        isDark
                          ? 'bg-neutral-950 border-neutral-800'
                          : 'bg-slate-100 border-slate-200'
                      }`}>

                        <div className="flex items-center space-x-2">

                          <UserCheck className={`h-5 w-5 ${accentText}`} />

                          <div>
                            <div className="text-xs font-bold">
                              Waga Ciała
                            </div>

                            <div className={`text-[10px] ${textMuted}`}>
                              Ostatni pomiar
                            </div>
                          </div>

                        </div>

                        <div className="text-xl font-black font-mono tracking-tight text-violet-500">
                          {latestStats.weight || 0}{' '}
                          <span className="text-xs text-slate-400 font-normal">
                            kg
                          </span>
                        </div>

                      </div>

                      {/* MEASUREMENT FORM */}
                      <form
                        onSubmit={saveBodyStats}
                        className="space-y-3 pt-2 border-t border-slate-200 dark:border-neutral-800"
                      >

                        <div className="text-xs font-bold">
                          Dodaj nowy pomiar:
                        </div>

                        <div className="grid grid-cols-3 gap-2">

                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder="Waga (kg)"
                            value={newWeight}
                            onChange={e =>
                              setNewWeight(e.target.value)
                            }
                            className={`p-2.5 rounded-xl border text-xs font-bold text-center ${bgInput}`}
                          />

                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder="Ramię (cm)"
                            value={newArm}
                            onChange={e =>
                              setNewArm(e.target.value)
                            }
                            className={`p-2.5 rounded-xl border text-xs font-bold text-center ${bgInput}`}
                          />

                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder="Klatka (cm)"
                            value={newChest}
                            onChange={e =>
                              setNewChest(e.target.value)
                            }
                            className={`p-2.5 rounded-xl border text-xs font-bold text-center ${bgInput}`}
                          />

                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder="Pas (cm)"
                            value={newWaist}
                            onChange={e =>
                              setNewWaist(e.target.value)
                            }
                            className={`p-2.5 rounded-xl border text-xs font-bold text-center ${bgInput}`}
                          />

                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder="Udo (cm)"
                            value={newThigh}
                            onChange={e =>
                              setNewThigh(e.target.value)
                            }
                            className={`p-2.5 rounded-xl border text-xs font-bold text-center ${bgInput}`}
                          />

                          <button
                            type="submit"
                            className={`py-2.5 ${accentBg} font-bold rounded-xl text-xs transition-colors`}
                          >
                            Zapisz
                          </button>

                        </div>
                      </form>

                      {/* MEASUREMENT HISTORY */}
                      <div className="pt-3 border-t border-slate-200 dark:border-neutral-800 space-y-2">

                        <div className="text-xs font-bold flex items-center space-x-1.5">
                          <History className="h-4 w-4 text-violet-500" />
                          <span>
                            Pełna historia pomiarów:
                          </span>
                        </div>

                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">

                          {bodyStats.map(st => (
                            <div
                              key={st.id}
                              className={`p-3 rounded-xl border space-y-1.5 ${
                                isDark
                                  ? 'bg-neutral-950 border-neutral-800'
                                  : 'bg-slate-50 border-slate-200'
                              }`}
                            >

                              <div className="flex justify-between items-center text-xs font-bold">

                                <span className={textMuted}>
                                  {formatDate(st.date)}
                                </span>

                                <span className="text-violet-400 font-mono font-black">
                                  {st.weight || 0} kg
                                </span>

                              </div>

                              <div className="flex flex-wrap gap-1.5 pt-1">

                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                                  isDark
                                    ? 'bg-neutral-900 border-neutral-800 text-neutral-300'
                                    : 'bg-white border-slate-200 text-slate-700'
                                }`}>
                                  Waga: <b>{st.weight || 0}</b> kg
                                </span>

                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                                  isDark
                                    ? 'bg-neutral-900 border-neutral-800 text-neutral-300'
                                    : 'bg-white border-slate-200 text-slate-700'
                                }`}>
                                  Ramię: <b>{st.arm || 0}</b> cm
                                </span>

                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                                  isDark
                                    ? 'bg-neutral-900 border-neutral-800 text-neutral-300'
                                    : 'bg-white border-slate-200 text-slate-700'
                                }`}>
                                  Klatka: <b>{st.chest || 0}</b> cm
                                </span>

                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                                  isDark
                                    ? 'bg-neutral-900 border-neutral-800 text-neutral-300'
                                    : 'bg-white border-slate-200 text-slate-700'
                                }`}>
                                  Pas: <b>{st.waist || 0}</b> cm
                                </span>

                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                                  isDark
                                    ? 'bg-neutral-900 border-neutral-800 text-neutral-300'
                                    : 'bg-white border-slate-200 text-slate-700'
                                }`}>
                                  Udo: <b>{st.thigh || 0}</b> cm
                                </span>

                              </div>
                            </div>
                          ))}

                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* EXERCISE HISTORY */}
                {statsSubTab === 'history' && (
                  <div className={`p-4 rounded-xl border space-y-3 ${bgCard}`}>

                    <h3 className="font-bold text-sm flex items-center space-x-1.5">
                      <History className={`h-4 w-4 ${accentText}`} />
                      <span>Szczegółowa Historia Ćwiczenia</span>
                    </h3>

                    <select
                      onChange={e =>
                        setSelectedStatExId(e.target.value)
                      }
                      value={selectedStatExId || ''}
                      className={`w-full p-2.5 rounded-xl border text-xs font-bold ${bgInput}`}
                    >
                      <option value="">
                        -- Wybierz ćwiczenie z bazy --
                      </option>

                      {exerciseDb.map(ex => (
                        <option key={ex.id} value={ex.id}>
                          {ex.name}
                        </option>
                      ))}
                    </select>

                    {selectedStatExId && (
                      <div className="space-y-2 pt-2">

                        {(() => {

                          const targetEx = exerciseDb.find(
                            e => e.id === selectedStatExId
                          );

                          const exHistory = workoutHistory.filter(w =>
                            w.exercises.some(
                              e =>
                                (e.id &&
                                  e.id === selectedStatExId) ||
                                e.name === targetEx?.name
                            )
                          );

                          if (exHistory.length === 0) {
                            return (
                              <p className={`text-xs ${textMuted} text-center py-2`}>
                                Brak wykonanych treningów z tym ćwiczeniem.
                              </p>
                            );
                          }

                          return exHistory.map((w, idx) => {

                            const exDetails = w.exercises.find(
                              e =>
                                (e.id &&
                                  e.id === selectedStatExId) ||
                                e.name === targetEx?.name
                            );

                            return (
                              <div
                                key={idx}
                                className={`p-3 rounded-xl border space-y-1.5 text-xs ${
                                  isDark
                                    ? 'bg-neutral-950/80 border-neutral-800'
                                    : 'bg-slate-50 border-slate-200'
                                }`}
                              >

                                <div className="flex justify-between font-bold">
                                  <span>
                                    {formatDate(w.date)} ({w.planName})
                                  </span>
                                </div>

                                <div className="flex flex-wrap gap-1.5">

                                  {exDetails?.sets.map((s, sIdx) => (
                                    <span
                                      key={sIdx}
                                      className={`px-2 py-1 rounded text-[11px] font-mono border ${
                                        isDark
                                          ? 'bg-neutral-900 border-neutral-700 text-violet-300'
                                          : 'bg-white border-slate-300 text-violet-900'
                                      }`}
                                    >
                                      S{sIdx + 1}:{' '}
                                      <strong>{s.reps || 0}</strong>{' '}
                                      ×{' '}
                                      <strong>
                                        {s.weight || 0}kg
                                      </strong>
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

            {/* PLANS */}
            {activeTab === 'plans' && (
              <div className="space-y-4">

                <div className="flex justify-between items-center">

                  <h2 className="text-lg font-bold">
                    Plany Treningowe
                  </h2>

                  {!isCreatingPlan && (
                    <button
                      onClick={() => setIsCreatingPlan(true)}
                      className={`px-3 py-2 ${accentBg} font-bold text-xs rounded-xl flex items-center space-x-1`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Dodaj plan</span>
                    </button>
                  )}

                </div>

                {isCreatingPlan && (
                  <div className={`p-4 rounded-2xl border space-y-3 ${bgCard}`}>

                    <input
                      type="text"
                      placeholder="Nazwa planu (np. Push / Pull)"
                      value={newPlanName}
                      onChange={e =>
                        setNewPlanName(e.target.value)
                      }
                      className={`w-full p-2.5 rounded-xl border text-sm ${bgInput}`}
                    />

                    <div className="space-y-1 max-h-40 overflow-y-auto">

                      {exerciseDb.map(ex => (
                        <button
                          key={ex.id}
                          onClick={() => {

                            if (
                              selectedExForPlan.includes(ex.id)
                            ) {
                              setSelectedExForPlan(
                                selectedExForPlan.filter(
                                  i => i !== ex.id
                                )
                              );
                            } else {
                              setSelectedExForPlan([
                                ...selectedExForPlan,
                                ex.id
                              ]);
                            }
                          }}
                          className={`w-full text-left p-2 rounded-lg text-xs flex justify-between items-center ${
                            selectedExForPlan.includes(ex.id)
                              ? isDark
                                ? 'bg-violet-950 text-violet-400 font-bold'
                                : 'bg-violet-50 text-indigo-700 font-bold'
                              : textMuted
                          }`}
                        >
                          <span>{ex.name}</span>

                          {selectedExForPlan.includes(ex.id) && (
                            <CheckCircle className="h-3.5 w-3.5" />
                          )}
                        </button>
                      ))}

                    </div>

                    <div className="flex space-x-2 pt-2">

                      <button
                        onClick={() => {

                          if (
                            !newPlanName ||
                            selectedExForPlan.length === 0
                          ) {
                            return;
                          }

                          setPlans(prev => [
                            ...prev,
                            {
                              id: Date.now().toString(),
                              name: newPlanName,
                              exerciseIds: selectedExForPlan
                            }
                          ]);

                          setIsCreatingPlan(false);
                          setNewPlanName('');
                          setSelectedExForPlan([]);
                        }}
                        className={`flex-1 py-2.5 ${accentBg} font-bold rounded-xl text-xs`}
                      >
                        Zapisz Plan
                      </button>

                      <button
                        onClick={() =>
                          setIsCreatingPlan(false)
                        }
                        className={`px-4 py-2.5 border rounded-xl text-xs font-bold ${
                          isDark
                            ? 'border-neutral-800'
                            : 'border-slate-300'
                        }`}
                      >
                        Anuluj
                      </button>

                    </div>
                  </div>
                )}

                {plans.map(p => (
                  <div
                    key={p.id}
                    className={`p-4 rounded-2xl border flex justify-between items-center ${bgCard}`}
                  >

                    <div>
                      <h3 className="font-bold text-sm">
                        {p.name}
                      </h3>

                      <p className={`text-xs ${textMuted} mt-0.5`}>
                        {p.exerciseIds.length} ćwiczeń w zestawieniu
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        setPlans(prev =>
                          prev.filter(item => item.id !== p.id)
                        )
                      }
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                  </div>
                ))}
              </div>
            )}

            {/* EXERCISES */}
            {activeTab === 'exercises' && (
              <div className="space-y-4">

                <h2 className="text-lg font-bold">
                  Baza Ćwiczeń
                </h2>

                <div className="flex space-x-2">

                  <input
                    type="text"
                    placeholder="Nazwa nowego ćwiczenia..."
                    value={newExName}
                    onChange={e =>
                      setNewExName(e.target.value)
                    }
                    className={`flex-1 p-2.5 rounded-xl border text-sm ${bgInput}`}
                  />

                  <button
                    onClick={() => {

                      if (!newExName) return;

                      setExerciseDb(prev => [
                        ...prev,
                        {
                          id: Date.now().toString(),
                          name: newExName,
                          category: 'Ogólne'
                        }
                      ]);

                      setNewExName('');
                    }}
                    className={`px-4 ${accentBg} font-bold rounded-xl text-xs`}
                  >
                    Dodaj
                  </button>

                </div>

                <div className={`border rounded-2xl divide-y ${bgCard} ${
                  isDark
                    ? 'divide-neutral-800'
                    : 'divide-slate-200'
                }`}>

                  {exerciseDb.map(ex => (
                    <div
                      key={ex.id}
                      className="p-3.5 flex justify-between items-center text-xs font-semibold"
                    >

                      <span>{ex.name}</span>

                      <button
                        onClick={() =>
                          setExerciseDb(prev =>
                            prev.filter(e => e.id !== ex.id)
                          )
                        }
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                    </div>
                  ))}

                </div>
              </div>
            )}

            {/* SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-5">

                <h2 className="text-lg font-bold">
                  Ustawienia
                </h2>

                <div className={`p-4 rounded-2xl border flex justify-between items-center ${bgCard}`}>

                  <div>
                    <div className="text-sm font-bold">
                      Motyw aplikacji
                    </div>

                    <div className={`text-xs ${textMuted}`}>
                      Aplikacja zapamięta Twój wybór.
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setTheme(isDark ? 'light' : 'dark')
                    }
                    className={`p-2.5 rounded-xl flex items-center space-x-2 text-xs font-bold border ${
                      isDark
                        ? 'bg-neutral-800 border-neutral-700 text-violet-400'
                        : 'bg-slate-100 border-slate-300 text-slate-800'
                    }`}
                  >
                    {isDark ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}

                    <span>
                      {isDark ? 'Jasny' : 'Ciemny'}
                    </span>
                  </button>

                </div>

                <div className={`p-4 rounded-2xl border space-y-3 ${bgCard}`}>

                  <div className={`flex items-center space-x-2 ${accentText}`}>
                    <Bell className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Kreatyna o 9:00
                    </span>
                  </div>

                  <p className={`text-xs ${textMuted}`}>
                    Ustaw godzinę przypomnienia i pobierz plik `.ics` do Kalendarza na iOS lub Android.
                  </p>

                  <div className="flex space-x-2">

                    <input
                      type="time"
                      value={creatineTime}
                      onChange={e =>
                        setCreatineTime(e.target.value)
                      }
                      className={`p-2.5 rounded-xl border text-xs font-bold ${bgInput}`}
                    />

                    <button
                      onClick={downloadCreatineReminder}
                      className={`flex-1 ${accentBg} font-bold rounded-xl text-xs py-2.5`}
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

          <div className={`border rounded-2xl p-4 max-w-xs w-full space-y-3 ${bgCard}`}>

            <div className="flex justify-between items-center">

              <h3 className="font-bold text-sm">
                Wybierz plan treningowy
              </h3>

              <button
                onClick={() => setShowStartModal(false)}
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>

            </div>

            {plans.map(p => (
              <button
                key={p.id}
                onClick={() => startWorkout(p)}
                className={`w-full text-left p-3.5 rounded-xl border font-bold text-xs flex justify-between items-center transition-all ${
                  isDark
                    ? 'bg-violet-950/40 border-violet-500/30 text-violet-400 hover:bg-violet-900/40'
                    : 'bg-violet-50 border-violet-200 text-violet-900 hover:bg-violet-100'
                }`}
              >
                <span>{p.name}</span>
                <Play className="h-3.5 w-3.5 fill-current" />
              </button>
            ))}

          </div>
        </div>
      )}

      {/* WORKOUT SUMMARY */}
      {summaryData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">

          <div className={`border rounded-2xl p-5 max-w-sm w-full space-y-4 text-center ${bgCard}`}>

            <div className="flex justify-center">

              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-full">
                <CheckCircle className="h-8 w-8" />
              </div>

            </div>

            <h3 className="font-black text-lg">
              Trening Ukończony!
            </h3>

            <div className={`grid grid-cols-3 gap-2 py-3 border-y text-center ${
              isDark
                ? 'border-neutral-800'
                : 'border-slate-200'
            }`}>

              <div>
                <div className={`text-[10px] ${textMuted}`}>
                  Czas
                </div>
                <div className="font-bold text-sm">
                  {summaryData.duration}
                </div>
              </div>

              <div>
                <div className={`text-[10px] ${textMuted}`}>
                  Powtórzenia
                </div>
                <div className="font-bold text-sm">
                  {summaryData.totalReps}
                </div>
              </div>

              <div>
                <div className={`text-[10px] ${textMuted}`}>
                  Tonaż
                </div>
                <div className={`font-bold text-sm ${accentText}`}>
                  {summaryData.totalWeight} kg
                </div>
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

      {/* BOTTOM NAVIGATION */}
      {!activeSession && !showSplash && (
        <nav className={`fixed bottom-0 left-0 right-0 border-t p-2 flex justify-around z-40 backdrop-blur-md ${
          isDark
            ? 'bg-neutral-950/90 border-neutral-800'
            : 'bg-white/90 border-slate-200 shadow-lg'
        }`}>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center p-1 text-[10px] font-bold ${
              activeTab === 'history'
                ? accentText
                : textMuted
            }`}
          >
            <CalendarIcon className="h-4 w-4 mb-0.5" />
            <span>Historia</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center p-1 text-[10px] font-bold ${
              activeTab === 'stats'
                ? accentText
                : textMuted
            }`}
          >
            <BarChart3 className="h-4 w-4 mb-0.5" />
            <span>Statystyki</span>
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            className={`flex flex-col items-center p-1 text-[10px] font-bold ${
              activeTab === 'plans'
                ? accentText
                : textMuted
            }`}
          >
            <Dumbbell className="h-4 w-4 mb-0.5" />
            <span>Plany</span>
          </button>

          <button
            onClick={() => setActiveTab('start')}
            className={`flex flex-col items-center p-1 text-[10px] font-bold ${
              activeTab === 'start'
                ? accentText
                : textMuted
            }`}
          >
            <Play className="h-4 w-4 mb-0.5 fill-current" />
            <span>Start</span>
          </button>

          <button
            onClick={() => setActiveTab('exercises')}
            className={`flex flex-col items-center p-1 text-[10px] font-bold ${
              activeTab === 'exercises'
                ? accentText
                : textMuted
            }`}
          >
            <Plus className="h-4 w-4 mb-0.5" />
            <span>Ćwiczenia</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center p-1 text-[10px] font-bold ${
              activeTab === 'settings'
                ? accentText
                : textMuted
            }`}
          >
            <Settings className="h-4 w-4 mb-0.5" />
            <span>Ustawienia</span>
          </button>

        </nav>
      )}

    </div>
  );
}
