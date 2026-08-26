import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  Award,
  BarChart3,
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Copy,
  Dumbbell,
  Flame,
  Gauge,
  History,
  Moon,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  PlusCircle,
  RotateCcw,
  Settings,
  SkipForward,
  Sparkles,
  Sun,
  Target,
  Timer,
  Trash2,
  Trophy,
  UserCheck,
  X,
  Zap,
  Check,
  ChevronDown,
  Download,
  Upload,
  RefreshCcw,
  Layers3,
  Scale,
} from 'lucide-react';

const STORAGE = {
  theme: 'pm_theme',
  exercises: 'pm_exercises',
  plans: 'pm_plans',
  history: 'pm_history',
  markedDays: 'pm_marked_days',
  bodyStats: 'pm_body_stats',
  settings: 'pm_settings',
};

const DEFAULT_EXERCISES = [
  { id: '1', name: 'Rozpiętki na maszynie', category: 'Klatka' },
  { id: '2', name: 'Wyciskanie hantli nad głowę', category: 'Barki' },
  { id: '3', name: 'Przysiady ze sztangą', category: 'Nogi' },
  { id: '4', name: 'Uginanie ramion ze sztangą', category: 'Biceps' },
  { id: '5', name: 'Wyciskanie sztangi leżąc', category: 'Klatka' },
  { id: '6', name: 'Ściąganie drążka wyciągu', category: 'Plecy' },
];

const DEFAULT_PLANS = [
  { id: '1', name: 'FBW A', exerciseIds: ['5', '6', '2', '3'] },
  { id: '2', name: 'GÓRA', exerciseIds: ['5', '6', '2', '4'] },
];

const CATEGORY_META = {
  Klatka: { icon: '◉', label: 'Klatka' },
  Plecy: { icon: '↕', label: 'Plecy' },
  Barki: { icon: '◇', label: 'Barki' },
  Nogi: { icon: '△', label: 'Nogi' },
  Biceps: { icon: '◎', label: 'Biceps' },
  Triceps: { icon: '○', label: 'Triceps' },
  Brzuch: { icon: '□', label: 'Brzuch' },
};

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function uid(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function localDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseLocalDate(value) {
  return new Date(`${value}T00:00:00`);
}

function formatDate(value, options = {}) {
  if (!value) return '—';
  return parseLocalDate(value).toLocaleDateString('pl-PL', options);
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatNumber(value) {
  return new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 1 }).format(value || 0);
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function diffDays(a, b) {
  const ms = parseLocalDate(a).getTime() - parseLocalDate(b).getTime();
  return Math.round(ms / 86400000);
}

export default function WorkoutApp() {
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE.theme) || 'light');
  const isDark = theme === 'dark';

  const [exerciseDb, setExerciseDb] = useState(() => readStorage(STORAGE.exercises, DEFAULT_EXERCISES));
  const [plans, setPlans] = useState(() => readStorage(STORAGE.plans, DEFAULT_PLANS));
  const [workoutHistory, setWorkoutHistory] = useState(() => readStorage(STORAGE.history, []));
  const [markedDays, setMarkedDays] = useState(() => readStorage(STORAGE.markedDays, []));
  const [bodyStats, setBodyStats] = useState(() => readStorage(STORAGE.bodyStats, []));
  const [settings, setSettings] = useState(() => ({
    defaultRest: 90,
    vibration: true,
    ...readStorage(STORAGE.settings, {}),
  }));

  const [activeTab, setActiveTab] = useState('home');
  const [activeSession, setActiveSession] = useState(null);
  const [activeExIdx, setActiveExIdx] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [restSeconds, setRestSeconds] = useState(0);
  const [restRunning, setRestRunning] = useState(false);
  const [selectedDate, setSelectedDate] = useState(localDateString());
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [showPlanSheet, setShowPlanSheet] = useState(false);
  const [showFinishSheet, setShowFinishSheet] = useState(false);
  const [finishNote, setFinishNote] = useState('');
  const [toast, setToast] = useState(null);
  const [exerciseQuery, setExerciseQuery] = useState('');
  const [selectedStatsExercise, setSelectedStatsExercise] = useState('');
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseCategory, setNewExerciseCategory] = useState('Klatka');
  const [newPlanName, setNewPlanName] = useState('');
  const [selectedPlanExerciseIds, setSelectedPlanExerciseIds] = useState([]);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newChest, setNewChest] = useState('');
  const [newArm, setNewArm] = useState('');
  const [newWaist, setNewWaist] = useState('');
  const [newThigh, setNewThigh] = useState('');
  const [restPulse, setRestPulse] = useState(0);
  const importRef = useRef(null);
  const timerRef = useRef(null);
  const restTimerRef = useRef(null);

  const notify = (message, tone = 'default') => {
    setToast({ id: Date.now(), message, tone });
    window.setTimeout(() => setToast(null), 2400);
  };

  useEffect(() => localStorage.setItem(STORAGE.theme, theme), [theme]);
  useEffect(() => localStorage.setItem(STORAGE.exercises, JSON.stringify(exerciseDb)), [exerciseDb]);
  useEffect(() => localStorage.setItem(STORAGE.plans, JSON.stringify(plans)), [plans]);
  useEffect(() => localStorage.setItem(STORAGE.history, JSON.stringify(workoutHistory)), [workoutHistory]);
  useEffect(() => localStorage.setItem(STORAGE.markedDays, JSON.stringify(markedDays)), [markedDays]);
  useEffect(() => localStorage.setItem(STORAGE.bodyStats, JSON.stringify(bodyStats)), [bodyStats]);
  useEffect(() => localStorage.setItem(STORAGE.settings, JSON.stringify(settings)), [settings]);

  useEffect(() => {
    if (!activeSession) return undefined;
    timerRef.current = window.setInterval(() => setSessionSeconds((v) => v + 1), 1000);
    return () => window.clearInterval(timerRef.current);
  }, [activeSession]);

  useEffect(() => {
    if (!restRunning) return undefined;
    restTimerRef.current = window.setInterval(() => {
      setRestSeconds((value) => {
        if (value <= 1) {
          window.clearInterval(restTimerRef.current);
          setRestRunning(false);
          setRestPulse((v) => v + 1);
          if (settings.vibration && navigator.vibrate) navigator.vibrate([120, 80, 120]);
          notify('Przerwa zakończona. Lecimy dalej 🔥', 'success');
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(restTimerRef.current);
  }, [restRunning, settings.vibration]);

  useEffect(() => {
    if (restPulse > 0) document.title = '🔥 GOTOWE — PAKIERNIA';
  }, [restPulse]);

  const today = localDateString();
  const latestStats = bodyStats[0] || {};

  const historyDays = useMemo(() => new Set(workoutHistory.map((w) => w.date)), [workoutHistory]);
  const markedSet = useMemo(() => new Set(markedDays), [markedDays]);

  const sortedHistory = useMemo(
    () => [...workoutHistory].sort((a, b) => `${b.date}-${b.id}`.localeCompare(`${a.date}-${a.id}`)),
    [workoutHistory],
  );

  const currentMonthKey = `${new Date().getFullYear()}-${new Date().getMonth()}`;
  const monthWorkouts = useMemo(
    () => workoutHistory.filter((w) => {
      const d = parseLocalDate(w.date);
      return `${d.getFullYear()}-${d.getMonth()}` === currentMonthKey;
    }),
    [workoutHistory, currentMonthKey],
  );

  const streak = useMemo(() => {
    const unique = [...new Set(workoutHistory.map((w) => w.date))].sort((a, b) => b.localeCompare(a));
    if (!unique.length) return 0;
    let base = unique[0];
    if (diffDays(today, base) > 1) return 0;
    let count = 1;
    for (let i = 1; i < unique.length; i += 1) {
      if (diffDays(base, unique[i]) === 1) {
        count += 1;
        base = unique[i];
      } else break;
    }
    return count;
  }, [workoutHistory, today]);

  const lastWorkout = sortedHistory[0] || null;
  const totalVolume = workoutHistory.reduce((sum, w) => sum + (Number(w.totalWeight) || 0), 0);
  const totalSets = workoutHistory.reduce(
    (sum, w) => sum + (w.exercises || []).reduce((s, ex) => s + (ex.sets || []).length, 0),
    0,
  );
  const activeExercise = activeSession?.exercises?.[activeExIdx] || null;

  const previousExerciseData = useMemo(() => {
    if (!activeExercise) return null;
    for (const workout of sortedHistory) {
      const found = (workout.exercises || []).find(
        (e) => (e.id && e.id === activeExercise.id) || e.name === activeExercise.name,
      );
      if (found) return found;
    }
    return null;
  }, [activeExercise, sortedHistory]);

  const exercisePR = useMemo(() => {
    if (!activeExercise) return 0;
    let max = 0;
    workoutHistory.forEach((w) => {
      (w.exercises || []).forEach((ex) => {
        if ((ex.id && ex.id === activeExercise.id) || ex.name === activeExercise.name) {
          (ex.sets || []).forEach((s) => {
            max = Math.max(max, Number(s.weight) || 0);
          });
        }
      });
    });
    return max;
  }, [activeExercise, workoutHistory]);

  const sessionProgress = activeSession
    ? Math.round(
        (activeSession.exercises.reduce((done, ex) => done + ex.sets.filter((s) => s.done).length, 0) /
          Math.max(1, activeSession.exercises.reduce((all, ex) => all + ex.sets.length, 0))) *
          100,
      )
    : 0;

  const currentExerciseVolume = activeExercise
    ? activeExercise.sets.reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0)
    : 0;

  const startWorkout = (plan) => {
    const sessionExercises = (plan.exerciseIds || []).map((id) => {
      const ex = exerciseDb.find((item) => item.id === id);
      const previous = sortedHistory.flatMap((w) => w.exercises || []).find(
        (e) => (e.id && e.id === id) || e.name === ex?.name,
      );
      const baseSets = previous?.sets?.length ? previous.sets : [{ reps: '', weight: '', rpe: '', done: false }, { reps: '', weight: '', rpe: '', done: false }, { reps: '', weight: '', rpe: '', done: false }];
      return {
        id,
        name: ex?.name || 'Ćwiczenie',
        category: ex?.category || 'Trening',
        sets: baseSets.map((s) => ({ reps: s.reps ?? '', weight: s.weight ?? '', rpe: s.rpe ?? '', done: false })),
      };
    });
    setActiveSession({ id: uid('session'), planId: plan.id, planName: plan.name, exercises: sessionExercises, startedAt: Date.now(), note: '' });
    setActiveExIdx(0);
    setSessionSeconds(0);
    setRestSeconds(0);
    setRestRunning(false);
    setActiveTab('workout');
    setShowPlanSheet(false);
  };

  const startQuickWorkout = () => {
    startWorkout({ id: uid('quick'), name: 'Szybki trening', exerciseIds: [exerciseDb[0]?.id || '1'] });
  };

  const updateSessionSet = (exIdx, setIdx, field, value) => {
    setActiveSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise, idx) =>
        idx !== exIdx
          ? exercise
          : { ...exercise, sets: exercise.sets.map((s, i) => (i === setIdx ? { ...s, [field]: value } : s)) },
      ),
    }));
  };

  const toggleSetDone = (exIdx, setIdx) => {
    const next = !activeSession.exercises[exIdx].sets[setIdx].done;
    updateSessionSet(exIdx, setIdx, 'done', next);
    if (next) {
      setRestSeconds(settings.defaultRest);
      setRestRunning(true);
      if (settings.vibration && navigator.vibrate) navigator.vibrate(50);
    }
  };

  const addSet = (exIdx, copyLast = false) => {
    setActiveSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise, idx) => {
        if (idx !== exIdx) return exercise;
        const last = exercise.sets[exercise.sets.length - 1];
        const fresh = copyLast && last ? { ...last, done: false } : { reps: '', weight: '', rpe: '', done: false };
        return { ...exercise, sets: [...exercise.sets, fresh] };
      }),
    }));
  };

  const removeSet = (exIdx, setIdx) => {
    setActiveSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise, idx) =>
        idx === exIdx && exercise.sets.length > 1
          ? { ...exercise, sets: exercise.sets.filter((_, i) => i !== setIdx) }
          : exercise,
      ),
    }));
  };

  const applyPrevious = () => {
    if (!previousExerciseData) return;
    setActiveSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise, idx) =>
        idx !== activeExIdx
          ? exercise
          : {
              ...exercise,
              sets: previousExerciseData.sets.map((s) => ({ reps: s.reps ?? '', weight: s.weight ?? '', rpe: '', done: false })),
            },
      ),
    }));
    notify('Wynik z ostatniego treningu został wczytany');
  };

  const finishWorkout = () => {
    if (!activeSession) return;
    const cleanExercises = activeSession.exercises.map((ex) => ({
      ...ex,
      sets: ex.sets.map((s) => ({ ...s, done: Boolean(s.done) })),
    }));
    const totalReps = cleanExercises.reduce((sum, ex) => sum + ex.sets.reduce((s, set) => s + (Number(set.reps) || 0), 0), 0);
    const totalWeight = cleanExercises.reduce(
      (sum, ex) => sum + ex.sets.reduce((s, set) => s + (Number(set.weight) || 0) * (Number(set.reps) || 0), 0),
      0,
    );
    const entry = {
      id: uid('workout'),
      date: today,
      duration: formatDuration(sessionSeconds),
      planName: activeSession.planName,
      totalReps,
      totalWeight,
      note: finishNote,
      exercises: cleanExercises,
    };
    setWorkoutHistory((prev) => [entry, ...prev]);
    setMarkedDays((prev) => (prev.includes(today) ? prev : [...prev, today]));
    setActiveSession(null);
    setShowFinishSheet(false);
    setFinishNote('');
    setActiveTab('home');
    setRestRunning(false);
    setRestSeconds(0);
    notify('Trening zapisany. Dobra robota! 💪', 'success');
  };

  const deleteWorkout = (id) => {
    const item = workoutHistory.find((w) => w.id === id);
    if (!item) return;
    setWorkoutHistory((prev) => prev.filter((w) => w.id !== id));
    const dayHasOther = workoutHistory.some((w) => w.id !== id && w.date === item.date);
    if (!dayHasOther) {
      setMarkedDays((prev) => prev.filter((d) => d !== item.date));
    }
    notify('Trening usunięty');
  };

  const toggleMarkedDay = (date) => {
    if (historyDays.has(date)) {
      setSelectedDate(date);
      return;
    }
    setMarkedDays((prev) => (prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]));
    setSelectedDate(date);
  };

  const saveBodyMeasurement = (e) => {
    e.preventDefault();
    if (![newWeight, newChest, newArm, newWaist, newThigh].some(Boolean)) return;
    const previous = bodyStats[0] || {};
    const entry = {
      id: uid('measurement'), date: today,
      weight: newWeight !== '' ? Number(newWeight) : Number(previous.weight) || 0,
      chest: newChest !== '' ? Number(newChest) : Number(previous.chest) || 0,
      arm: newArm !== '' ? Number(newArm) : Number(previous.arm) || 0,
      waist: newWaist !== '' ? Number(newWaist) : Number(previous.waist) || 0,
      thigh: newThigh !== '' ? Number(newThigh) : Number(previous.thigh) || 0,
    };
    setBodyStats((prev) => [entry, ...prev]);
    setNewWeight(''); setNewChest(''); setNewArm(''); setNewWaist(''); setNewThigh('');
    notify('Pomiar zapisany', 'success');
  };

  const createExercise = (e) => {
    e.preventDefault();
    if (!newExerciseName.trim()) return;
    const item = { id: uid('exercise'), name: newExerciseName.trim(), category: newExerciseCategory };
    setExerciseDb((prev) => [...prev, item]);
    setNewExerciseName('');
    notify('Dodano ćwiczenie');
  };

  const createPlan = (e) => {
    e.preventDefault();
    if (!newPlanName.trim() || selectedPlanExerciseIds.length === 0) return;
    setPlans((prev) => [...prev, { id: uid('plan'), name: newPlanName.trim(), exerciseIds: selectedPlanExerciseIds }]);
    setNewPlanName('');
    setSelectedPlanExerciseIds([]);
    setShowCreatePlan(false);
    notify('Plan utworzony', 'success');
  };

  const exportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      version: 3,
      theme, exerciseDb, plans, workoutHistory, markedDays, bodyStats, settings,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pakiernia-backup-${today}.json`;
    link.click();
    URL.revokeObjectURL(url);
    notify('Backup pobrany');
  };

  const importData = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (Array.isArray(data.workoutHistory)) setWorkoutHistory(data.workoutHistory);
        if (Array.isArray(data.exerciseDb)) setExerciseDb(data.exerciseDb);
        if (Array.isArray(data.plans)) setPlans(data.plans);
        if (Array.isArray(data.markedDays)) setMarkedDays(data.markedDays);
        if (Array.isArray(data.bodyStats)) setBodyStats(data.bodyStats);
        if (data.settings) setSettings((prev) => ({ ...prev, ...data.settings }));
        notify('Backup przywrócony', 'success');
      } catch {
        notify('Nie udało się odczytać pliku', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const calendarGrid = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const first = new Date(year, month, 1);
    const days = new Date(year, month + 1, 0).getDate();
    const blank = (first.getDay() || 7) - 1;
    return [...Array(blank).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  }, [calendarMonth]);

  const selectedDateWorkouts = workoutHistory.filter((w) => w.date === selectedDate);

  const statsForExercise = useMemo(() => {
    if (!selectedStatsExercise) return [];
    const target = exerciseDb.find((e) => e.id === selectedStatsExercise);
    if (!target) return [];
    return [...workoutHistory]
      .filter((w) => (w.exercises || []).some((e) => (e.id && e.id === target.id) || e.name === target.name))
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((w) => {
        const ex = (w.exercises || []).find((e) => (e.id && e.id === target.id) || e.name === target.name);
        const maxWeight = Math.max(0, ...(ex?.sets || []).map((s) => Number(s.weight) || 0));
        const volume = (ex?.sets || []).reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);
        return { date: w.date, maxWeight, volume, sets: ex?.sets?.length || 0 };
      });
  }, [selectedStatsExercise, exerciseDb, workoutHistory]);

  const navItems = [
    { id: 'history', label: 'Historia', icon: CalendarDays },
    { id: 'stats', label: 'Postęp', icon: BarChart3 },
    { id: 'plans', label: 'Plany', icon: Layers3 },
    { id: 'home', label: 'Start', icon: Play, primary: true },
    { id: 'exercises', label: 'Ćwiczenia', icon: Plus },
    { id: 'settings', label: 'Ustawienia', icon: Settings },
  ];

  const shell = isDark
    ? 'bg-[#08080d] text-white'
    : 'bg-[#f6f8fc] text-[#101729]';
  const card = isDark
    ? 'bg-[#11131b] border-white/[0.07]'
    : 'bg-white border-[#e4e8f1]';
  const muted = isDark ? 'text-[#8e95a7]' : 'text-[#6f7a8e]';
  const soft = isDark ? 'bg-white/[0.035]' : 'bg-[#f3f6fb]';
  const primary = 'bg-[#5b4df4] hover:bg-[#4f42df] text-white';
  const primaryText = isDark ? 'text-[#9a90ff]' : 'text-[#5447e9]';

  const StatPill = ({ icon: Icon, label, value, accent = false }) => (
    <div className={`rounded-2xl border px-4 py-3 ${card}`}>
      <div className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] ${muted}`}>
        <Icon className={`h-4 w-4 ${accent ? primaryText : ''}`} />
        <span>{label}</span>
      </div>
      <div className={`mt-1.5 text-2xl font-black tracking-tight ${accent ? primaryText : ''}`}>{value}</div>
    </div>
  );

  const Header = () => (
    <header className={`sticky top-0 z-40 border-b backdrop-blur-xl ${isDark ? 'bg-[#08080d]/85 border-white/[0.06]' : 'bg-white/85 border-[#e9ecf3]'}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 lg:px-6">
        <button onClick={() => setActiveTab('home')} className="flex items-center gap-3 text-left">
          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isDark ? 'bg-[#171522]' : 'bg-[#f0edff]'}`}>
            <Dumbbell className={`h-5 w-5 ${primaryText}`} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.24em]">PAKIERNIA</div>
            <div className={`-mt-0.5 text-sm font-black ${primaryText}`}>U MATIEGO</div>
          </div>
        </button>
        {activeSession && (
          <button
            onClick={() => setActiveTab('workout')}
            className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-black ${isDark ? 'border-[#6b5cff]/30 bg-[#6b5cff]/10 text-[#a59dff]' : 'border-[#d8d3ff] bg-[#f3f1ff] text-[#5144e7]'}`}
          >
            <Timer className="h-4 w-4" />
            {formatDuration(sessionSeconds)}
          </button>
        )}
      </div>
    </header>
  );

  const HomePage = () => {
    const week = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek(new Date()));
      d.setDate(d.getDate() + i);
      return { date: localDateString(d), day: d.toLocaleDateString('pl-PL', { weekday: 'short' }).replace('.', ''), num: d.getDate() };
    });

    return (
      <div className="space-y-5">
        <section className={`overflow-hidden rounded-[28px] border p-5 sm:p-6 ${card}`}>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className={`text-[10px] font-black uppercase tracking-[0.25em] ${primaryText}`}>DASHBOARD</div>
              <h1 className="mt-2 max-w-xl text-[34px] font-black leading-[1.04] tracking-[-0.04em] sm:text-5xl">
                {streak > 0 ? 'Trzymasz tempo. Nie odpuszczaj.' : 'Gotowy na kolejny trening?'}
              </h1>
              <p className={`mt-3 max-w-xl text-sm leading-6 ${muted}`}>
                Wszystko w jednym miejscu: plan, progres, rekordy i historia. Podczas treningu liczy się tylko następna seria.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <button onClick={() => setShowPlanSheet(true)} className={`rounded-2xl px-5 py-3.5 text-sm font-black shadow-[0_12px_30px_rgba(91,77,244,0.22)] ${primary}`}>
                <span className="flex items-center gap-2"><Play className="h-4 w-4 fill-current" /> Rozpocznij</span>
              </button>
              <button onClick={startQuickWorkout} className={`rounded-2xl border px-5 py-3.5 text-sm font-black ${card}`}>
                <span className="flex items-center gap-2"><PlusCircle className="h-4 w-4" /> Szybki</span>
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatPill icon={Flame} label="Streak" value={`${streak} dni`} accent />
          <StatPill icon={CalendarDays} label="W tym miesiącu" value={monthWorkouts.length} />
          <StatPill icon={Trophy} label="Treningów" value={workoutHistory.length} />
          <StatPill icon={Activity} label="Łączny tonaż" value={`${formatNumber(totalVolume)} kg`} />
        </div>

        <section className="grid gap-5 lg:grid-cols-[1.4fr_.9fr]">
          <div className={`rounded-[26px] border p-5 ${card}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className={`text-[10px] font-black uppercase tracking-[0.22em] ${muted}`}>OSTATNI TRENING</div>
                <div className="mt-2 text-xl font-black">{lastWorkout?.planName || 'Jeszcze nie trenowałeś'}</div>
              </div>
              {lastWorkout && <div className={`text-right text-xs font-bold ${muted}`}>{formatDate(lastWorkout.date)}</div>}
            </div>
            {lastWorkout ? (
              <div className="mt-5 grid grid-cols-3 gap-2">
                <div className={`rounded-2xl p-3 ${soft}`}><div className={`text-[10px] uppercase font-black ${muted}`}>Czas</div><div className="mt-1 font-black">{lastWorkout.duration}</div></div>
                <div className={`rounded-2xl p-3 ${soft}`}><div className={`text-[10px] uppercase font-black ${muted}`}>Powtórzenia</div><div className="mt-1 font-black">{lastWorkout.totalReps || 0}</div></div>
                <div className={`rounded-2xl p-3 ${soft}`}><div className={`text-[10px] uppercase font-black ${muted}`}>Tonaż</div><div className={`mt-1 font-black ${primaryText}`}>{formatNumber(lastWorkout.totalWeight)} kg</div></div>
              </div>
            ) : (
              <div className={`mt-5 rounded-2xl p-4 text-sm ${soft} ${muted}`}>Zacznij pierwszy trening i tutaj pojawi się podsumowanie.</div>
            )}
          </div>

          <div className={`rounded-[26px] border p-5 ${card}`}>
            <div className="flex items-center justify-between">
              <div><div className={`text-[10px] font-black uppercase tracking-[0.22em] ${muted}`}>TEN TYDZIEŃ</div><div className="mt-2 text-xl font-black">Rytm treningowy</div></div>
              <Flame className={`h-5 w-5 ${primaryText}`} />
            </div>
            <div className="mt-5 grid grid-cols-7 gap-1.5">
              {week.map((item) => {
                const done = historyDays.has(item.date);
                const planned = markedSet.has(item.date);
                const isToday = item.date === today;
                return (
                  <button key={item.date} onClick={() => { setSelectedDate(item.date); setActiveTab('history'); }} className={`rounded-2xl p-2 text-center transition ${done ? 'bg-[#5b4df4] text-white' : planned ? (isDark ? 'bg-[#5b4df4]/15 text-[#a49cff]' : 'bg-[#eeecff] text-[#574be3]') : soft} ${isToday ? 'ring-2 ring-[#5b4df4]/30' : ''}`}>
                    <div className="text-[9px] font-black uppercase opacity-70">{item.day}</div>
                    <div className="mt-1 text-sm font-black">{item.num}</div>
                    {done && <div className="mx-auto mt-1 h-1 w-1 rounded-full bg-white" />}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className={`rounded-[26px] border p-5 ${card}`}>
          <div className="flex items-center justify-between">
            <div><div className={`text-[10px] font-black uppercase tracking-[0.22em] ${muted}`}>SZYBKIE AKCJE</div><div className="mt-2 text-xl font-black">Co dziś robimy?</div></div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <button onClick={() => setShowPlanSheet(true)} className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${card}`}>
              <Play className={`h-5 w-5 ${primaryText}`} />
              <div className="mt-3 font-black">Kontynuuj plan</div><div className={`mt-1 text-xs ${muted}`}>Wybierz gotowy trening</div>
            </button>
            <button onClick={() => { setActiveTab('stats'); setSelectedStatsExercise(''); }} className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${card}`}>
              <BarChart3 className={`h-5 w-5 ${primaryText}`} /><div className="mt-3 font-black">Sprawdź progres</div><div className={`mt-1 text-xs ${muted}`}>Siła, tonaż i rekordy</div>
            </button>
            <button onClick={() => setActiveTab('history')} className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${card}`}>
              <CalendarDays className={`h-5 w-5 ${primaryText}`} /><div className="mt-3 font-black">Historia</div><div className={`mt-1 text-xs ${muted}`}>Kalendarz i zapisane treningi</div>
            </button>
          </div>
        </section>
      </div>
    );
  };

  const WorkoutPage = () => {
    if (!activeSession) return null;
    const exDone = activeSession.exercises.filter((ex) => ex.sets.length && ex.sets.every((s) => s.done)).length;
    const category = activeExercise?.category || 'Trening';
    return (
      <div className="space-y-4 pb-8">
        <div className="flex items-center justify-between">
          <button onClick={() => setActiveTab('home')} className={`rounded-2xl border px-3 py-2 text-xs font-black ${card}`}><ChevronLeft className="inline h-4 w-4" /> Wyjdź</button>
          <div className={`rounded-full px-3 py-2 text-[11px] font-black ${isDark ? 'bg-[#171522] text-[#a59dff]' : 'bg-[#eeecff] text-[#5649e5]'}`}>
            {activeSession.planName}
          </div>
          <button onClick={() => setShowFinishSheet(true)} className="rounded-2xl border border-red-200 px-3 py-2 text-xs font-black text-red-500">Zakończ</button>
        </div>

        <section className={`rounded-[30px] border p-5 ${card}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${muted}`}>ĆWICZENIE {String(activeExIdx + 1).padStart(2, '0')} / {String(activeSession.exercises.length).padStart(2, '0')}</div>
              <h1 className="mt-2 truncate text-3xl font-black tracking-[-0.04em] sm:text-4xl">{activeExercise?.name}</h1>
              <div className={`mt-1 text-sm font-bold ${muted}`}>{category}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${soft}`}>PR {exercisePR || 0} kg</span>
                {previousExerciseData && <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${soft}`}>Ostatnio {previousExerciseData.sets.length} serii</span>}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className={`text-[10px] font-black uppercase tracking-[0.18em] ${muted}`}>TONAŻ</div>
              <div className={`mt-1 text-2xl font-black ${primaryText}`}>{formatNumber(currentExerciseVolume)} kg</div>
            </div>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/5">
            <div className="h-full rounded-full bg-[#5b4df4] transition-all duration-300" style={{ width: `${sessionProgress}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-black">
            <span className={muted}>{exDone}/{activeSession.exercises.length} ćwiczeń</span><span className={primaryText}>{sessionProgress}%</span>
          </div>
        </section>

        {restSeconds > 0 && (
          <section key={restPulse} className={`rounded-[26px] border p-5 ${isDark ? 'border-amber-400/20 bg-amber-300/5' : 'border-amber-200 bg-amber-50'}`}>
            <div className="flex items-center justify-between gap-4">
              <div><div className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-600">PRZERWA</div><div className="mt-1 text-4xl font-black tabular-nums">{formatDuration(restSeconds)}</div></div>
              <div className="flex gap-2">
                <button onClick={() => setRestSeconds((v) => v + 30)} className="rounded-2xl border border-amber-200 bg-white px-4 py-3 text-xs font-black text-amber-700">+30s</button>
                <button onClick={() => setRestRunning((v) => !v)} className="rounded-2xl border bg-white px-4 py-3 text-amber-800"><Pause className="h-4 w-4" /></button>
                <button onClick={() => { setRestRunning(false); setRestSeconds(0); }} className="rounded-2xl border bg-white px-4 py-3 text-amber-800"><SkipForward className="h-4 w-4" /></button>
              </div>
            </div>
          </section>
        )}

        {previousExerciseData && (
          <section className={`rounded-[26px] border p-4 ${card}`}>
            <div className="flex items-center justify-between gap-3">
              <div><div className={`text-[10px] font-black uppercase tracking-[0.2em] ${muted}`}>OSTATNI WYNIK</div><div className="mt-1 text-sm font-black">{previousExerciseData.sets.map((s, i) => `${s.reps || 0} × ${s.weight || 0}`).join('  ·  ')}</div></div>
              <button onClick={applyPrevious} className={`rounded-xl border px-3 py-2 text-[11px] font-black ${isDark ? 'border-[#6256f6]/30 bg-[#6256f6]/10 text-[#aaa4ff]' : 'border-[#d8d3ff] bg-[#f3f1ff] text-[#5144e7]'}`}><RotateCcw className="mr-1 inline h-3.5 w-3.5" /> Użyj ostatniego</button>
            </div>
          </section>
        )}

        <section className={`rounded-[28px] border p-4 sm:p-5 ${card}`}>
          <div className="mb-4 flex items-end justify-between"><div><div className={`text-[10px] font-black uppercase tracking-[0.22em] ${muted}`}>SERIE</div><h2 className="mt-1 text-xl font-black">Wynik każdej serii</h2></div><div className={`text-[11px] font-bold ${muted}`}>{activeExercise?.sets.length} serii</div></div>
          <div className="space-y-3">
            {activeExercise?.sets.map((set, index) => (
              <div key={`${index}-${set.done}`} className={`rounded-[22px] border p-3 transition-all ${set.done ? (isDark ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-emerald-200 bg-emerald-50') : soft}`}>
                <div className="grid grid-cols-[36px_1fr_auto] items-start gap-3">
                  <div className={`mt-1 flex h-9 w-9 items-center justify-center rounded-2xl text-xs font-black ${set.done ? 'bg-emerald-500 text-white' : (isDark ? 'bg-white/5 text-white/50' : 'bg-white text-[#667086] border border-[#e6eaf1]')}`}>{index + 1}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block"><span className={`mb-1 block text-[9px] font-black uppercase tracking-[0.16em] ${muted}`}>Powt.</span><input value={set.reps} onChange={(e) => updateSessionSet(activeExIdx, index, 'reps', e.target.value)} inputMode="decimal" className={`w-full rounded-2xl border px-3 py-3 text-center text-lg font-black outline-none transition focus:border-[#5b4df4] ${isDark ? 'border-white/10 bg-[#0b0c12]' : 'border-[#dfe4ec] bg-white'}`} /></label>
                    <label className="block"><span className={`mb-1 block text-[9px] font-black uppercase tracking-[0.16em] ${muted}`}>Ciężar</span><input value={set.weight} onChange={(e) => updateSessionSet(activeExIdx, index, 'weight', e.target.value)} inputMode="decimal" className={`w-full rounded-2xl border px-3 py-3 text-center text-lg font-black outline-none transition focus:border-[#5b4df4] ${isDark ? 'border-white/10 bg-[#0b0c12]' : 'border-[#dfe4ec] bg-white'}`} /></label>
                    <div className="col-span-2"><div className={`mb-1 text-[9px] font-black uppercase tracking-[0.16em] ${muted}`}>RPE <span className="normal-case font-bold opacity-70">opcjonalne</span></div><div className="grid grid-cols-5 gap-1.5">{[6,7,8,9,10].map((rpe) => <button key={rpe} onClick={() => updateSessionSet(activeExIdx, index, 'rpe', set.rpe === rpe ? '' : rpe)} className={`rounded-xl border py-2 text-xs font-black ${set.rpe === rpe ? 'border-[#5b4df4] bg-[#5b4df4] text-white' : isDark ? 'border-white/10 bg-black/10 text-white/55' : 'border-[#dde2ea] bg-white text-[#697489]'}`}>{rpe}</button>)}</div></div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button onClick={() => toggleSetDone(activeExIdx, index)} className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${set.done ? 'border-emerald-500 bg-emerald-500 text-white' : isDark ? 'border-white/10 bg-[#0c0d13] text-white/45' : 'border-[#dfe4ec] bg-white text-[#748095]'}`}><Check className="h-5 w-5" /></button>
                    <button onClick={() => removeSet(activeExIdx, index)} disabled={activeExercise.sets.length <= 1} className={`flex h-8 w-10 items-center justify-center rounded-xl text-red-400 disabled:opacity-20`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={() => addSet(activeExIdx, true)} className={`rounded-2xl border py-3 text-xs font-black ${card}`}><Copy className="mr-1 inline h-4 w-4" /> Kopiuj serię</button>
            <button onClick={() => addSet(activeExIdx)} className={`rounded-2xl py-3 text-xs font-black ${primary}`}><Plus className="mr-1 inline h-4 w-4" /> Dodaj serię</button>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-2">
          <button disabled={activeExIdx === 0} onClick={() => setActiveExIdx((v) => Math.max(0, v - 1))} className={`rounded-2xl border py-3.5 text-xs font-black disabled:opacity-25 ${card}`}><ChevronLeft className="mr-1 inline h-4 w-4" /> Poprzednie</button>
          <button disabled={activeExIdx === activeSession.exercises.length - 1} onClick={() => setActiveExIdx((v) => Math.min(activeSession.exercises.length - 1, v + 1))} className={`rounded-2xl border py-3.5 text-xs font-black disabled:opacity-25 ${card}`}>Następne <ChevronRight className="ml-1 inline h-4 w-4" /></button>
        </div>
      </div>
    );
  };

  const HistoryPage = () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><div className={`text-[10px] font-black uppercase tracking-[0.24em] ${primaryText}`}>HISTORIA</div><h1 className="mt-1 text-4xl font-black tracking-[-0.04em]">Kalendarz treningów</h1><p className={`mt-2 text-sm ${muted}`}>Kliknij dzień, żeby zobaczyć szczegóły. Dni bez historii możesz ręcznie oznaczać jako planowane.</p></div>
        <button onClick={() => { setCalendarMonth(new Date()); setSelectedDate(today); }} className={`rounded-2xl border px-4 py-3 text-xs font-black ${card}`}>Dzisiaj</button>
      </div>

      <section className={`rounded-[28px] border p-4 sm:p-5 ${card}`}>
        <div className="flex items-center justify-between"><div><div className="text-lg font-black">{calendarMonth.toLocaleString('pl-PL',{month:'long',year:'numeric'})}</div><div className={`text-xs uppercase tracking-[0.12em] ${muted}`}>Twój rytm</div></div><div className="flex gap-1.5"><button onClick={() => setCalendarMonth((d) => new Date(d.getFullYear(), d.getMonth()-1,1))} className={`rounded-xl border p-2.5 ${card}`}><ChevronLeft className="h-4 w-4" /></button><button onClick={() => setCalendarMonth((d) => new Date(d.getFullYear(), d.getMonth()+1,1))} className={`rounded-xl border p-2.5 ${card}`}><ChevronRight className="h-4 w-4" /></button></div></div>
        <div className={`mt-5 grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase tracking-wide ${muted}`}>{['Pn','Wt','Śr','Cz','Pt','So','Nd'].map((d) => <div key={d}>{d}</div>)}</div>
        <div className="mt-2 grid grid-cols-7 gap-2">
          {calendarGrid.map((day, idx) => {
            if (!day) return <div key={`blank-${idx}`} className="aspect-square" />;
            const date = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const done = historyDays.has(date); const marked = markedSet.has(date); const selected = selectedDate === date; const isToday = date === today;
            const trainings = workoutHistory.filter((w) => w.date === date);
            return <button key={date} onClick={() => toggleMarkedDay(date)} className={`relative flex aspect-square flex-col items-center justify-center rounded-2xl border text-sm font-black transition ${done ? 'border-transparent bg-[#5b4df4] text-white shadow-[0_8px_24px_rgba(91,77,244,0.2)]' : marked ? (isDark ? 'border-[#6459ee]/30 bg-[#6459ee]/10 text-[#b0aaff]' : 'border-[#d6d2ff] bg-[#efedff] text-[#5a4de7]') : (isDark ? 'border-white/[0.06] bg-white/[0.02] text-white/60' : 'border-[#e4e8ef] bg-[#fbfcfe] text-[#667184]')} ${selected ? 'ring-2 ring-[#5b4df4]/30' : ''}`}><span>{day}</span>{trainings.length > 0 && <span className={`mt-1 text-[8px] font-black ${done ? 'text-white/80' : primaryText}`}>{trainings.length}×</span>}{isToday && !done && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#5b4df4]" />}</button>;
          })}
        </div>
        <div className={`mt-4 flex flex-wrap gap-4 text-[10px] font-bold ${muted}`}><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-[#5b4df4]" /> trening</span><span><i className={`mr-1 inline-block h-2.5 w-2.5 rounded-full ${isDark ? 'bg-[#5b4df4]/20' : 'bg-[#eeecff]'}`} /> planowany</span></div>
      </section>

      <section className={`rounded-[28px] border p-5 ${card}`}>
        <div className="flex items-center justify-between border-b pb-4" style={{borderColor:isDark?'rgba(255,255,255,.06)':'#edf0f4'}}>
          <div><div className={`text-[10px] font-black uppercase tracking-[0.2em] ${muted}`}>{formatDate(selectedDate, {weekday:'long'})}</div><h2 className="mt-1 text-xl font-black">{formatDate(selectedDate)}</h2></div>
          {historyDays.has(selectedDate) && <div className={`rounded-full px-3 py-1.5 text-[10px] font-black ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>TRENING</div>}
        </div>
        <div className="mt-4 space-y-3">
          {selectedDateWorkouts.length === 0 ? <div className={`rounded-2xl p-4 text-sm ${soft} ${muted}`}>{markedSet.has(selectedDate) ? 'Dzień oznaczony jako planowany. Nie ma jeszcze zapisanego treningu.' : 'Brak treningu w tym dniu.'}</div> : selectedDateWorkouts.map((w) => <div key={w.id} className={`rounded-2xl border p-4 ${soft}`}><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><div className={`text-sm font-black ${primaryText}`}>{w.planName}</div><div className={`mt-1 text-xs ${muted}`}>{w.duration} • {formatNumber(w.totalWeight)} kg • {w.totalReps || 0} powt.</div></div><button onClick={() => deleteWorkout(w.id)} className="self-end rounded-xl p-2 text-red-400 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></div><div className="mt-3 grid gap-2">{(w.exercises || []).map((ex) => <div key={`${w.id}-${ex.id}-${ex.name}`} className={`rounded-xl border p-3 ${isDark ? 'border-white/[0.05] bg-black/10' : 'border-white bg-white'}`}><div className="flex items-center justify-between"><span className="text-xs font-black">{ex.name}</span><span className={`text-[10px] font-black ${primaryText}`}>{ex.sets.length} serii</span></div><div className={`mt-2 text-[11px] font-mono ${muted}`}>{ex.sets.map((s,i)=>`S${i+1}: ${s.reps||0}×${s.weight||0}${s.rpe ? ` RPE${s.rpe}` : ''}`).join('  ·  ')}</div></div>)}</div>{w.note && <div className={`mt-3 rounded-xl p-3 text-xs ${soft}`}><span className="font-black">Notatka:</span> {w.note}</div>}</div>)}
        </div>
      </section>
    </div>
  );

  const StatsPage = () => {
    const allPRs = exerciseDb.map((ex) => {
      let max = 0, maxReps = 0;
      workoutHistory.forEach((w) => (w.exercises || []).forEach((e) => { if ((e.id && e.id === ex.id) || e.name === ex.name) (e.sets || []).forEach((s) => { const weight = Number(s.weight)||0; if(weight > max){max=weight; maxReps=Number(s.reps)||0;} }); }));
      return { ...ex, max, maxReps };
    }).filter((x)=>x.max>0).sort((a,b)=>b.max-a.max);
    const bodyDelta = bodyStats.length > 1 ? (Number(bodyStats[0].weight||0)-Number(bodyStats[1].weight||0)) : 0;
    return (
      <div className="space-y-5">
        <div><div className={`text-[10px] font-black uppercase tracking-[0.24em] ${primaryText}`}>POSTĘP</div><h1 className="mt-1 text-4xl font-black tracking-[-0.04em]">Twoja forma, liczby, progres.</h1><p className={`mt-2 text-sm ${muted}`}>Bez zbędnych ozdobników. Tylko rzeczy, które pomagają trenować mądrzej.</p></div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><StatPill icon={Trophy} label="Rekordy" value={allPRs.length} accent /><StatPill icon={Activity} label="Tonaż" value={`${formatNumber(totalVolume)} kg`} /><StatPill icon={Gauge} label="Serie" value={totalSets} /><StatPill icon={Scale} label="Waga" value={`${latestStats.weight || 0} kg`} /></div>
        <div className="grid gap-5 lg:grid-cols-2">
          <section className={`rounded-[28px] border p-5 ${card}`}>
            <div className="flex items-center justify-between"><div><div className={`text-[10px] font-black uppercase tracking-[0.2em] ${muted}`}>REKORDY</div><h2 className="mt-1 text-xl font-black">Najlepsze wyniki</h2></div><Trophy className="h-5 w-5 text-amber-500" /></div>
            <div className="mt-4 space-y-2">{allPRs.length ? allPRs.slice(0,7).map((ex)=><div key={ex.id} className={`flex items-center justify-between rounded-2xl p-3 ${soft}`}><div className="min-w-0"><div className="truncate text-xs font-black">{ex.name}</div><div className={`mt-0.5 text-[10px] ${muted}`}>{ex.category}</div></div><div className="text-right"><div className={`text-sm font-black ${primaryText}`}>{ex.max} kg</div><div className={`text-[10px] ${muted}`}>{ex.maxReps} powt.</div></div></div>) : <div className={`rounded-2xl p-4 text-sm ${soft} ${muted}`}>Jeszcze nie ma rekordów.</div>}</div>
          </section>
          <section className={`rounded-[28px] border p-5 ${card}`}>
            <div><div className={`text-[10px] font-black uppercase tracking-[0.2em] ${muted}`}>ĆWICZENIE</div><h2 className="mt-1 text-xl font-black">Historia wyniku</h2></div>
            <select value={selectedStatsExercise} onChange={(e)=>setSelectedStatsExercise(e.target.value)} className={`mt-4 w-full rounded-2xl border px-3 py-3 text-sm font-black outline-none ${isDark?'border-white/10 bg-[#0b0c12]':'border-[#dfe4ec] bg-white'}`}><option value="">Wybierz ćwiczenie</option>{exerciseDb.map(ex=><option key={ex.id} value={ex.id}>{ex.name}</option>)}</select>
            {selectedStatsExercise ? <div className="mt-4 space-y-2">{statsForExercise.length ? statsForExercise.slice(-8).reverse().map((row)=><div key={row.date} className={`flex items-center justify-between rounded-2xl p-3 ${soft}`}><div className={`text-xs font-black ${muted}`}>{formatDate(row.date)}</div><div className="text-xs font-black"><span className={primaryText}>{row.maxWeight} kg</span> <span className={muted}>• {formatNumber(row.volume)} kg</span></div></div>) : <div className={`rounded-2xl p-4 text-sm ${soft} ${muted}`}>Brak zapisów.</div>}</div> : <div className={`mt-4 rounded-2xl p-4 text-sm ${soft} ${muted}`}>Wybierz ćwiczenie, aby zobaczyć zmianę ciężaru i tonażu.</div>}
          </section>
        </div>
        <section className={`rounded-[28px] border p-5 ${card}`}>
          <div className="flex items-center justify-between"><div><div className={`text-[10px] font-black uppercase tracking-[0.2em] ${muted}`}>CIAŁO</div><h2 className="mt-1 text-xl font-black">Ostatni pomiar</h2></div><Activity className={`h-5 w-5 ${primaryText}`} /></div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5"><div className={`rounded-2xl p-3 ${soft}`}><div className={`text-[10px] ${muted}`}>Waga</div><div className="mt-1 font-black">{latestStats.weight || 0} kg</div></div><div className={`rounded-2xl p-3 ${soft}`}><div className={`text-[10px] ${muted}`}>Klatka</div><div className="mt-1 font-black">{latestStats.chest || 0} cm</div></div><div className={`rounded-2xl p-3 ${soft}`}><div className={`text-[10px] ${muted}`}>Ramię</div><div className="mt-1 font-black">{latestStats.arm || 0} cm</div></div><div className={`rounded-2xl p-3 ${soft}`}><div className={`text-[10px] ${muted}`}>Pas</div><div className="mt-1 font-black">{latestStats.waist || 0} cm</div></div><div className={`rounded-2xl p-3 ${soft}`}><div className={`text-[10px] ${muted}`}>Zmiana wagi</div><div className={`mt-1 font-black ${bodyDelta < 0 ? 'text-emerald-500' : bodyDelta > 0 ? 'text-amber-500' : ''}`}>{bodyDelta > 0 ? '+' : ''}{formatNumber(bodyDelta)} kg</div></div></div>
        </section>
        <section className={`rounded-[28px] border p-5 ${card}`}><form onSubmit={saveBodyMeasurement}><div className={`text-[10px] font-black uppercase tracking-[0.2em] ${muted}`}>NOWY POMIAR</div><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5"><input value={newWeight} onChange={(e)=>setNewWeight(e.target.value)} placeholder="Waga" inputMode="decimal" className={`rounded-2xl border px-3 py-3 text-center text-xs font-black ${isDark?'border-white/10 bg-[#0b0c12]':'border-[#dfe4ec] bg-white'}`} /><input value={newChest} onChange={(e)=>setNewChest(e.target.value)} placeholder="Klatka" inputMode="decimal" className={`rounded-2xl border px-3 py-3 text-center text-xs font-black ${isDark?'border-white/10 bg-[#0b0c12]':'border-[#dfe4ec] bg-white'}`} /><input value={newArm} onChange={(e)=>setNewArm(e.target.value)} placeholder="Ramię" inputMode="decimal" className={`rounded-2xl border px-3 py-3 text-center text-xs font-black ${isDark?'border-white/10 bg-[#0b0c12]':'border-[#dfe4ec] bg-white'}`} /><input value={newWaist} onChange={(e)=>setNewWaist(e.target.value)} placeholder="Pas" inputMode="decimal" className={`rounded-2xl border px-3 py-3 text-center text-xs font-black ${isDark?'border-white/10 bg-[#0b0c12]':'border-[#dfe4ec] bg-white'}`} /><input value={newThigh} onChange={(e)=>setNewThigh(e.target.value)} placeholder="Udo" inputMode="decimal" className={`rounded-2xl border px-3 py-3 text-center text-xs font-black ${isDark?'border-white/10 bg-[#0b0c12]':'border-[#dfe4ec] bg-white'}`} /></div><button type="submit" className={`mt-3 rounded-2xl px-4 py-3 text-xs font-black ${primary}`}>Zapisz pomiar</button></form></section>
      </div>
    );
  };

  const PlansPage = () => (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><div className={`text-[10px] font-black uppercase tracking-[0.24em] ${primaryText}`}>PLANY</div><h1 className="mt-1 text-4xl font-black tracking-[-0.04em]">Treningi gotowe do odpalenia.</h1><p className={`mt-2 text-sm ${muted}`}>Dobierasz plan, naciskasz start i aplikacja prowadzi Cię przez cały trening.</p></div><button onClick={()=>setShowCreatePlan(true)} className={`rounded-2xl px-4 py-3 text-xs font-black ${primary}`}><Plus className="mr-1 inline h-4 w-4"/> Nowy plan</button></div>
      <div className="grid gap-4 sm:grid-cols-2">{plans.map((plan) => <section key={plan.id} className={`rounded-[28px] border p-5 ${card}`}><div className="flex items-start justify-between"><div><div className={`text-[10px] font-black uppercase tracking-[0.2em] ${muted}`}>PLAN</div><h2 className="mt-1 text-2xl font-black">{plan.name}</h2></div><Dumbbell className={`h-5 w-5 ${primaryText}`}/></div><div className="mt-4 space-y-1.5">{plan.exerciseIds.map((id,idx)=>{const ex=exerciseDb.find(e=>e.id===id); return <div key={`${plan.id}-${id}-${idx}`} className={`flex items-center justify-between rounded-xl px-3 py-2 ${soft}`}><span className="text-xs font-bold">{idx+1}. {ex?.name || 'Ćwiczenie'}</span><span className={`text-[10px] font-black ${muted}`}>{ex?.category}</span></div>})}</div><button onClick={()=>startWorkout(plan)} className={`mt-4 w-full rounded-2xl py-3.5 text-sm font-black ${primary}`}><Play className="mr-1 inline h-4 w-4 fill-current"/> Start treningu</button></section>)}</div>
      {showCreatePlan && <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center"><form onSubmit={createPlan} className={`w-full max-w-lg rounded-[28px] border p-5 ${card}`}><div className="flex items-center justify-between"><div><div className={`text-[10px] font-black uppercase tracking-[0.2em] ${primaryText}`}>NOWY PLAN</div><h2 className="mt-1 text-2xl font-black">Zbuduj trening</h2></div><button type="button" onClick={()=>setShowCreatePlan(false)}><X className="h-5 w-5"/></button></div><input value={newPlanName} onChange={(e)=>setNewPlanName(e.target.value)} placeholder="Nazwa planu" className={`mt-4 w-full rounded-2xl border px-4 py-3 text-sm font-black ${isDark?'border-white/10 bg-[#0b0c12]':'border-[#dfe4ec] bg-white'}`}/><div className="mt-4 max-h-72 space-y-2 overflow-auto">{exerciseDb.map((ex)=><button type="button" key={ex.id} onClick={()=>setSelectedPlanExerciseIds((prev)=>prev.includes(ex.id)?prev.filter(id=>id!==ex.id):[...prev,ex.id])} className={`flex w-full items-center justify-between rounded-2xl border p-3 text-left ${selectedPlanExerciseIds.includes(ex.id) ? (isDark?'border-[#5b4df4]/40 bg-[#5b4df4]/10':'border-[#d5d1ff] bg-[#f1efff]') : card}`}><div><div className="text-sm font-black">{ex.name}</div><div className={`text-[10px] ${muted}`}>{ex.category}</div></div>{selectedPlanExerciseIds.includes(ex.id) ? <Check className={`h-5 w-5 ${primaryText}`}/> : <Plus className={`h-5 w-5 ${muted}`}/>}</button>)}</div><button type="submit" className={`mt-4 w-full rounded-2xl py-3.5 text-sm font-black ${primary}`}>Utwórz plan</button></form></div>}
    </div>
  );

  const ExercisesPage = () => {
    const filtered = exerciseDb.filter((ex)=>ex.name.toLowerCase().includes(exerciseQuery.toLowerCase()) || ex.category.toLowerCase().includes(exerciseQuery.toLowerCase()));
    return <div className="space-y-5"><div><div className={`text-[10px] font-black uppercase tracking-[0.24em] ${primaryText}`}>ĆWICZENIA</div><h1 className="mt-1 text-4xl font-black tracking-[-0.04em]">Twoja baza ruchów.</h1></div><section className={`rounded-[28px] border p-5 ${card}`}><form onSubmit={createExercise} className="grid gap-2 sm:grid-cols-[1fr_150px_auto]"><input value={newExerciseName} onChange={(e)=>setNewExerciseName(e.target.value)} placeholder="Np. Wiosłowanie hantlem" className={`rounded-2xl border px-4 py-3 text-sm font-black ${isDark?'border-white/10 bg-[#0b0c12]':'border-[#dfe4ec] bg-white'}`} /><select value={newExerciseCategory} onChange={(e)=>setNewExerciseCategory(e.target.value)} className={`rounded-2xl border px-4 py-3 text-sm font-black ${isDark?'border-white/10 bg-[#0b0c12]':'border-[#dfe4ec] bg-white'}`}>{Object.keys(CATEGORY_META).map(c=><option key={c}>{c}</option>)}</select><button className={`rounded-2xl px-5 py-3 text-sm font-black ${primary}`}>Dodaj</button></form></section><div className="flex gap-2"><div className={`flex flex-1 items-center gap-2 rounded-2xl border px-4 ${card}`}><Activity className={`h-4 w-4 ${muted}`}/><input value={exerciseQuery} onChange={(e)=>setExerciseQuery(e.target.value)} placeholder="Szukaj ćwiczenia" className="w-full bg-transparent py-3 text-sm font-bold outline-none"/></div></div><section className="grid gap-2 sm:grid-cols-2">{filtered.map((ex)=><div key={ex.id} className={`flex items-center justify-between rounded-2xl border p-4 ${card}`}><div className="flex items-center gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${soft} ${primaryText}`}>{CATEGORY_META[ex.category]?.icon || '•'}</div><div><div className="text-sm font-black">{ex.name}</div><div className={`mt-0.5 text-[10px] font-bold ${muted}`}>{ex.category}</div></div></div><button onClick={()=>setExerciseDb((prev)=>prev.filter(e=>e.id!==ex.id))} className={`rounded-xl p-2 ${muted}`}><Trash2 className="h-4 w-4"/></button></div>)}</section></div>;
  };

  const SettingsPage = () => (
    <div className="space-y-5"><div><div className={`text-[10px] font-black uppercase tracking-[0.24em] ${primaryText}`}>USTAWIENIA</div><h1 className="mt-1 text-4xl font-black tracking-[-0.04em]">Dopasuj aplikację do siebie.</h1></div><section className={`rounded-[28px] border p-5 ${card}`}><div className="flex items-center justify-between"><div><div className="text-sm font-black">Wygląd</div><div className={`mt-1 text-xs ${muted}`}>Light / Dark</div></div><button onClick={()=>setTheme(isDark?'light':'dark')} className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-black ${card}`}>{isDark?<Sun className="h-4 w-4"/>:<Moon className="h-4 w-4"/>}{isDark?'Jasny':'Ciemny'}</button></div><div className="mt-5 flex items-center justify-between border-t pt-5" style={{borderColor:isDark?'rgba(255,255,255,.06)':'#edf0f4'}}><div><div className="text-sm font-black">Domyślna przerwa</div><div className={`mt-1 text-xs ${muted}`}>Automatycznie startuje po zaliczeniu serii.</div></div><select value={settings.defaultRest} onChange={(e)=>setSettings((s)=>({...s,defaultRest:Number(e.target.value)}))} className={`rounded-2xl border px-3 py-3 text-xs font-black ${isDark?'border-white/10 bg-[#0b0c12]':'border-[#dfe4ec] bg-white'}`}><option value={45}>45 s</option><option value={60}>60 s</option><option value={75}>75 s</option><option value={90}>90 s</option><option value={120}>120 s</option><option value={150}>150 s</option></select></div><div className="mt-5 flex items-center justify-between border-t pt-5" style={{borderColor:isDark?'rgba(255,255,255,.06)':'#edf0f4'}}><div><div className="text-sm font-black">Wibracje</div><div className={`mt-1 text-xs ${muted}`}>Delikatne powiadomienie po końcu przerwy.</div></div><button onClick={()=>setSettings((s)=>({...s,vibration:!s.vibration}))} className={`relative h-7 w-12 rounded-full transition ${settings.vibration?'bg-[#5b4df4]':'bg-black/10 dark:bg-white/10'}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${settings.vibration?'left-6':'left-1'}`}/></button></div></section><section className={`rounded-[28px] border p-5 ${card}`}><div className="flex items-center gap-2"><RefreshCcw className={`h-5 w-5 ${primaryText}`}/><div><div className="text-sm font-black">Twoje dane</div><div className={`mt-1 text-xs ${muted}`}>Backup i przywracanie bez chmury.</div></div></div><div className="mt-4 grid gap-2 sm:grid-cols-2"><button onClick={exportData} className={`rounded-2xl border py-3 text-xs font-black ${card}`}><Download className="mr-1 inline h-4 w-4"/> Eksportuj backup</button><button onClick={()=>importRef.current?.click()} className={`rounded-2xl border py-3 text-xs font-black ${card}`}><Upload className="mr-1 inline h-4 w-4"/> Przywróć backup</button></div><input ref={importRef} type="file" accept="application/json" onChange={importData} className="hidden"/><div className={`mt-3 rounded-2xl p-3 text-[11px] ${soft} ${muted}`}>Backup zawiera treningi, plany, ćwiczenia, pomiary i ustawienia.</div></section></div>
  );

  const PlanSheet = () => showPlanSheet && (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center">
      <div className={`w-full max-w-xl rounded-[30px] border p-5 ${card}`}>
        <div className="flex items-center justify-between"><div><div className={`text-[10px] font-black uppercase tracking-[0.2em] ${primaryText}`}>START</div><h2 className="mt-1 text-2xl font-black">Wybierz trening</h2></div><button onClick={()=>setShowPlanSheet(false)}><X className="h-5 w-5"/></button></div>
        <div className="mt-4 grid gap-2">{plans.map((p)=><button key={p.id} onClick={()=>startWorkout(p)} className={`flex items-center justify-between rounded-2xl border p-4 text-left ${card}`}><div><div className="text-sm font-black">{p.name}</div><div className={`mt-1 text-xs ${muted}`}>{p.exerciseIds.length} ćwiczeń</div></div><Play className={`h-5 w-5 ${primaryText} fill-current`}/></button>)}</div>
        <button onClick={startQuickWorkout} className={`mt-3 w-full rounded-2xl border py-3.5 text-sm font-black ${card}`}><PlusCircle className={`mr-1 inline h-4 w-4 ${primaryText}`}/> Pusty / szybki trening</button>
      </div>
    </div>
  );

  const FinishSheet = () => showFinishSheet && (
    <div className="fixed inset-0 z-[75] flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center">
      <div className={`w-full max-w-md rounded-[30px] border p-5 ${card}`}>
        <div className="flex items-center justify-between"><div><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">PODSUMOWANIE</div><h2 className="mt-1 text-2xl font-black">Kończymy?</h2></div><button onClick={()=>setShowFinishSheet(false)}><X className="h-5 w-5"/></button></div>
        <div className="mt-4 grid grid-cols-3 gap-2"><div className={`rounded-2xl p-3 text-center ${soft}`}><div className={`text-[9px] uppercase font-black ${muted}`}>Czas</div><div className="mt-1 font-black">{formatDuration(sessionSeconds)}</div></div><div className={`rounded-2xl p-3 text-center ${soft}`}><div className={`text-[9px] uppercase font-black ${muted}`}>Serie</div><div className="mt-1 font-black">{activeSession?.exercises.reduce((s,e)=>s+e.sets.filter(x=>x.done).length,0) || 0}</div></div><div className={`rounded-2xl p-3 text-center ${soft}`}><div className={`text-[9px] uppercase font-black ${muted}`}>Tonaż</div><div className={`mt-1 font-black ${primaryText}`}>{formatNumber(activeSession?.exercises.reduce((s,e)=>s+e.sets.reduce((x,z)=>x+(Number(z.weight)||0)*(Number(z.reps)||0),0),0)||0)} kg</div></div></div>
        <textarea value={finishNote} onChange={(e)=>setFinishNote(e.target.value)} placeholder="Notatka z treningu (opcjonalnie)" className={`mt-4 min-h-24 w-full resize-none rounded-2xl border p-3 text-sm font-bold outline-none ${isDark?'border-white/10 bg-[#0b0c12]':'border-[#dfe4ec] bg-white'}`} />
        <button onClick={finishWorkout} className="mt-3 w-full rounded-2xl bg-emerald-600 py-4 text-sm font-black text-white">Zapisz trening</button>
      </div>
    </div>
  );

  const Toast = () => toast && <div className="fixed bottom-24 left-1/2 z-[120] -translate-x-1/2 rounded-full border border-white/10 bg-[#11131b]/95 px-4 py-3 text-xs font-black text-white shadow-2xl backdrop-blur-xl">{toast.message}</div>;

  return (
    <div className={`${shell} min-h-screen transition-colors duration-200`}>
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-5 lg:px-6 lg:pb-10 lg:pt-7">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'workout' && <WorkoutPage />}
        {activeTab === 'history' && <HistoryPage />}
        {activeTab === 'stats' && <StatsPage />}
        {activeTab === 'plans' && <PlansPage />}
        {activeTab === 'exercises' && <ExercisesPage />}
        {activeTab === 'settings' && <SettingsPage />}
      </main>

      {!activeSession && <nav className={`fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-xl lg:sticky lg:bottom-auto lg:mx-auto lg:max-w-6xl lg:rounded-3xl lg:border ${isDark ? 'bg-[#0a0b10]/92 border-white/[0.06]' : 'bg-white/92 border-[#e7eaf0]'}`}><div className="mx-auto flex max-w-6xl items-center justify-around gap-1 px-2 py-2 lg:px-3">{navItems.map(({id,label,icon:Icon,primary:isPrimary})=><button key={id} onClick={()=>setActiveTab(id)} className={`flex min-w-0 flex-1 flex-col items-center rounded-2xl px-2 py-2 text-[10px] font-black transition ${activeTab===id ? (isPrimary ? 'bg-[#5b4df4] text-white shadow-[0_8px_25px_rgba(91,77,244,0.2)]' : `${primaryText} ${isDark?'bg-white/[0.05]':'bg-[#f4f2ff]'}`) : muted}`}><Icon className={`mb-1 h-4 w-4 ${isPrimary && activeTab===id?'fill-current':''}`}/><span>{label}</span></button>)}</div></nav>}
      <PlanSheet />
      <FinishSheet />
      <Toast />
    </div>
  );
}
