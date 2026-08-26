import React, { useState } from 'react';
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
  Save
} from 'lucide-react';

export default function WorkoutApp() {
  // --- STANY APLIKACJI ---
  const [activeTab, setActiveTab] = useState('plans'); // 'plans', 'exercises', 'history', 'body'
  
  // 1. Baza ćwiczeń
  const [exerciseDb, setExerciseDb] = useState([
    { id: '1', name: 'Wyciskanie sztangi na ławce płaskiej', category: 'Klatka' },
    { id: '2', name: 'Przysiady ze sztangą', category: 'Nogi' },
    { id: '3', name: 'Martwy ciąg', category: 'Plecy' },
    { id: '4', name: 'Wyciskanie żołnierskie (OHP)', category: 'Barki' },
    { id: '5', name: 'Uginanie ramion ze sztangą', category: 'Biceps' }
  ]);
  const [newExName, setNewExName] = useState('');
  const [newExCategory, setNewExCategory] = useState('Klatka');

  // 2. Plany treningowe (max 3)
  const [plans, setPlans] = useState([
    { id: '1', name: 'FBW A', exerciseIds: ['1', '2', '4'] }
  ]);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [selectedExForPlan, setSelectedExForPlan] = useState([]);

  // 3. Trening w trakcie
  const [activeSession, setActiveSession] = useState(null); // { planName, exercises: [...] }
  const [showStartModal, setShowStartModal] = useState(false);

  // 4. Kalendarz i Historia Treningów (Format daty: YYYY-MM-DD)
  const [completedWorkouts, setCompletedWorkouts] = useState([
    '2026-08-24',
    '2026-08-20'
  ]);
  const [currentDate, setCurrentDate] = useState(new Date());

  // 5. Pomiary ciała
  const [bodyLogs, setBodyLogs] = useState([
    { date: '2026-08-01', weight: '80', chest: '102', waist: '84', arm: '38' }
  ]);
  const [measureForm, setMeasureForm] = useState({ weight: '', chest: '', waist: '', arm: '' });

  // --- LOGIKA BAZY ĆWICZEŃ ---
  const handleAddExercise = (e) => {
    e.preventDefault();
    if (!newExName.trim()) return;
    const item = {
      id: Date.now().toString(),
      name: newExName.trim(),
      category: newExCategory
    };
    setExerciseDb([...exerciseDb, item]);
    setNewExName('');
  };

  const handleDeleteExercise = (id) => {
    setExerciseDb(exerciseDb.filter(ex => ex.id !== id));
    // Usuń też z planów
    setPlans(plans.map(p => ({
      ...p,
      exerciseIds: p.exerciseIds.filter(exId => exId !== id)
    })));
  };

  // --- LOGIKA PLANÓW ---
  const handleCreatePlan = (e) => {
    e.preventDefault();
    if (!newPlanName.trim() || selectedExForPlan.length === 0) return;
    if (plans.length >= 3) {
      alert("Możesz posiadać maksymalnie 3 plany!");
      return;
    }
    const newPlan = {
      id: Date.now().toString(),
      name: newPlanName.trim(),
      exerciseIds: selectedExForPlan
    };
    setPlans([...plans, newPlan]);
    setNewPlanName('');
    setSelectedExForPlan([]);
    setIsCreatingPlan(false);
  };

  const toggleSelectExForPlan = (id) => {
    if (selectedExForPlan.includes(id)) {
      setSelectedExForPlan(selectedExForPlan.filter(i => i !== id));
    } else {
      setSelectedExForPlan([...selectedExForPlan, id]);
    }
  };

  const handleDeletePlan = (id) => {
    setPlans(plans.filter(p => p.id !== id));
  };

  // --- LOGIKA TRENINGU ---
  const startWorkout = (plan) => {
    const sessionExercises = plan.exerciseIds.map(id => {
      const ex = exerciseDb.find(e => e.id === id);
      return {
        id: id,
        name: ex ? ex.name : 'Ćwiczenie usunięte',
        sets: [{ weight: '', reps: '' }]
      };
    });
    setActiveSession({
      planName: plan.name,
      exercises: sessionExercises
    });
    setShowStartModal(false);
  };

  const addSetToExercise = (exIndex) => {
    const updated = { ...activeSession };
    updated.exercises[exIndex].sets.push({ weight: '', reps: '' });
    setActiveSession(updated);
  };

  const updateSetData = (exIndex, setIndex, field, val) => {
    const updated = { ...activeSession };
    updated.exercises[exIndex].sets[setIndex][field] = val;
    setActiveSession(updated);
  };

  const finishWorkout = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (!completedWorkouts.includes(todayStr)) {
      setCompletedWorkouts([...completedWorkouts, todayStr]);
    }
    setActiveSession(null);
    alert('Trening zakończony i zapisany w kalendarzu!');
  };

  // --- LOGIKA POMIARÓW ---
  const handleAddMeasurement = (e) => {
    e.preventDefault();
    if (!measureForm.weight) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const log = {
      date: todayStr,
      ...measureForm
    };
    setBodyLogs([log, ...bodyLogs]);
    setMeasureForm({ weight: '', chest: '', waist: '', arm: '' });
  };

  // --- KALENDARZ HELPERY ---
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Poniedziałek = 0
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    // Puste pola przed 1 dniem miesiąca
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 border border-neutral-900 bg-neutral-950/40 rounded"></div>);
    }
    
    // Dni miesiąca
    for (let d = 1; d <= daysInMonth; d++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isDone = completedWorkouts.includes(dateString);
      
      days.push(
        <div 
          key={d} 
          className={`h-10 border border-neutral-800 rounded flex items-center justify-center font-bold text-sm transition-colors ${
            isDone 
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900/30' 
              : 'bg-neutral-900 text-neutral-400'
          }`}
        >
          {d}
        </div>
      );
    }

    return days;
  };

  const changeMonth = (delta) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      
      {/* NAGŁÓWEK */}
      <header className="bg-neutral-900 border-b border-red-950/60 p-4 sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center space-x-3">
  <Dumbbell className="h-7 w-7 text-red-600" />
  <h1 className="text-xl font-black tracking-wider uppercase text-white">
    PAKIERNIA <span className="text-red-600">U MATIEGO</span>
  </h1>
        </div>

        {/* PRZYCISK START TRENINGU */}
        {!activeSession && (
          <button 
            onClick={() => setShowStartModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-all shadow-lg shadow-red-900/40"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>ROZPOCZNIJ</span>
          </button>
        )}
      </header>

      {/* TREŚĆ GŁÓWNA */}
      <main className="flex-1 p-4 max-w-4xl w-full mx-auto pb-24">
        
        {/* WIDOK: TRENING W TRAKCIE */}
        {activeSession ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-red-950/30 border border-red-900/50 p-4 rounded-xl">
              <div>
                <span className="text-xs uppercase tracking-widest text-red-500 font-bold">W trakcie</span>
                <h2 className="text-2xl font-black text-white">{activeSession.planName}</h2>
              </div>
              <button 
                onClick={finishWorkout}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold flex items-center space-x-2"
              >
                <CheckCircle className="h-5 w-5" />
                <span>Zakończ</span>
              </button>
            </div>

            {activeSession.exercises.map((ex, exIdx) => (
              <div key={exIdx} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
                <h3 className="text-lg font-bold text-red-500">{ex.name}</h3>
                
                <div className="grid grid-cols-12 gap-2 text-xs font-bold text-neutral-400 uppercase tracking-wider px-1">
                  <div className="col-span-2">Seria</div>
                  <div className="col-span-5">Ciężar (kg)</div>
                  <div className="col-span-5">Powtórzenia</div>
                </div>

                {ex.sets.map((set, setIdx) => (
                  <div key={setIdx} className="grid grid-cols-12 gap-2 items-center">
                    <span className="col-span-2 font-bold text-neutral-500">#{setIdx + 1}</span>
                    <input 
                      type="number" 
                      placeholder="0"
                      value={set.weight}
                      onChange={(e) => updateSetData(exIdx, setIdx, 'weight', e.target.value)}
                      className="col-span-5 bg-neutral-950 border border-neutral-800 rounded p-2 text-white focus:outline-none focus:border-red-600"
                    />
                    <input 
                      type="number" 
                      placeholder="0"
                      value={set.reps}
                      onChange={(e) => updateSetData(exIdx, setIdx, 'reps', e.target.value)}
                      className="col-span-5 bg-neutral-950 border border-neutral-800 rounded p-2 text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                ))}

                <button 
                  onClick={() => addSetToExercise(exIdx)}
                  className="w-full py-2 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded-lg text-sm font-semibold mt-2"
                >
                  + Dodaj serię
                </button>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* ZAKŁADKA 1: PLANY TRENINGOWE */}
            {activeTab === 'plans' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">Twoje Plany</h2>
                    <p className="text-xs text-neutral-400">Maksymalnie 3 plany ({plans.length}/3)</p>
                  </div>
                  {plans.length < 3 && !isCreatingPlan && (
                    <button 
                      onClick={() => setIsCreatingPlan(true)}
                      className="bg-neutral-900 border border-red-900/60 hover:bg-neutral-800 text-red-500 font-bold py-2 px-3 rounded-lg text-sm flex items-center space-x-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Nowy Plan</span>
                    </button>
                  )}
                </div>

                {/* KREATOR PLANU */}
                {isCreatingPlan && (
                  <form onSubmit={handleCreatePlan} className="bg-neutral-900 border border-red-900/40 p-4 rounded-xl space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-red-500">Stwórz nowy plan</h3>
                      <button type="button" onClick={() => setIsCreatingPlan(false)}>
                        <X className="h-5 w-5 text-neutral-400" />
                      </button>
                    </div>

                    <input 
                      type="text" 
                      placeholder="Nazwa planu (np. Trening A)"
                      value={newPlanName}
                      onChange={(e) => setNewPlanName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:outline-none focus:border-red-600"
                    />

                    <div>
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                        Wybierz ćwiczenia z bazy:
                      </label>
                      {exerciseDb.length === 0 ? (
                        <p className="text-xs text-neutral-500">Brak ćwiczeń w bazie. Dodaj je w zakładce Ćwiczenia.</p>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {exerciseDb.map(ex => (
                            <div 
                              key={ex.id} 
                              onClick={() => toggleSelectExForPlan(ex.id)}
                              className={`p-2.5 rounded-lg border text-sm flex justify-between items-center cursor-pointer transition-all ${
                                selectedExForPlan.includes(ex.id) 
                                  ? 'bg-red-950/40 border-red-600 text-white' 
                                  : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                              }`}
                            >
                              <span>{ex.name} <span className="text-xs text-neutral-500">({ex.category})</span></span>
                              {selectedExForPlan.includes(ex.id) && <CheckCircle className="h-4 w-4 text-red-500" />}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg"
                    >
                      Zapisz Plan
                    </button>
                  </form>
                )}

                {/* LISTA PLANÓW */}
                <div className="grid grid-cols-1 gap-4">
                  {plans.map(plan => (
                    <div key={plan.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                        <div className="flex flex-wrap gap-1">
                          {plan.exerciseIds.map(exId => {
                            const ex = exerciseDb.find(e => e.id === exId);
                            return (
                              <span key={exId} className="bg-neutral-950 text-neutral-400 text-xs px-2.5 py-1 rounded border border-neutral-800">
                                {ex ? ex.name : 'Nieznane'}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeletePlan(plan.id)}
                        className="text-neutral-500 hover:text-red-500 p-1"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  {plans.length === 0 && (
                    <div className="text-center py-8 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                      Nie masz jeszcze utworzonych planów.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ZAKŁADKA 2: BAZA ĆWICZEŃ */}
            {activeTab === 'exercises' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold">Baza Ćwiczeń</h2>
                  <p className="text-xs text-neutral-400">Dodawaj ćwiczenia, które wybierzesz do swoich planów</p>
                </div>

                <form onSubmit={handleAddExercise} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex flex-col md:flex-row gap-2">
                  <input 
                    type="text" 
                    placeholder="Nazwa ćwiczenia..."
                    value={newExName}
                    onChange={(e) => setNewExName(e.target.value)}
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600 text-sm"
                  />
                  <select 
                    value={newExCategory} 
                    onChange={(e) => setNewExCategory(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600 text-sm"
                  >
                    <option value="Klatka">Klatka</option>
                    <option value="Plecy">Plecy</option>
                    <option value="Nogi">Nogi</option>
                    <option value="Barki">Barki</option>
                    <option value="Biceps">Biceps</option>
                    <option value="Triceps">Triceps</option>
                    <option value="Brzuch">Brzuch</option>
                  </select>
                  <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-lg text-sm flex items-center justify-center space-x-1">
                    <Plus className="h-4 w-4" />
                    <span>Dodaj</span>
                  </button>
                </form>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl divide-y divide-neutral-800">
                  {exerciseDb.map(ex => (
                    <div key={ex.id} className="p-3 flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-sm">{ex.name}</div>
                        <div className="text-xs text-red-500 font-medium">{ex.category}</div>
                      </div>
                      <button onClick={() => handleDeleteExercise(ex.id)} className="text-neutral-500 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ZAKŁADKA 3: KALENDARZ */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold">Kalendarz Treningowy</h2>
                  <p className="text-xs text-neutral-400">Zielone pola oznaczają dni z odbytym treningiem</p>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-4">
                  {/* Nawigacja Miesiąca */}
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-white">
                      {currentDate.toLocaleString('pl-PL', { month: 'long', year: 'numeric' }).toUpperCase()}
                    </h3>
                    <div className="flex space-x-1">
                      <button onClick={() => changeMonth(-1)} className="p-2 bg-neutral-950 rounded hover:bg-neutral-800">
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button onClick={() => changeMonth(1)} className="p-2 bg-neutral-950 rounded hover:bg-neutral-800">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Dni tygodnia */}
                  <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-neutral-500">
                    <div>Pn</div><div>Wt</div><div>Śr</div><div>Cz</div><div>Pt</div><div>Sob</div><div>Nd</div>
                  </div>

                  {/* Siatka kalendarza */}
                  <div className="grid grid-cols-7 gap-1">
                    {renderCalendar()}
                  </div>
                </div>
              </div>
            )}

            {/* ZAKŁADKA 4: POMIARY CIAŁA */}
            {activeTab === 'body' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold">Pomiary Ciała</h2>
                  <p className="text-xs text-neutral-400">Wprowadź swoje aktualne wymiary ręcznie</p>
                </div>

                <form onSubmit={handleAddMeasurement} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-4">
                  <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider">Nowy Wpis</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs text-neutral-400 block mb-1">Waga (kg)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        placeholder="0.0"
                        value={measureForm.weight}
                        onChange={(e) => setMeasureForm({...measureForm, weight: e.target.value})}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white focus:outline-none focus:border-red-600 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 block mb-1">Klatka (cm)</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={measureForm.chest}
                        onChange={(e) => setMeasureForm({...measureForm, chest: e.target.value})}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white focus:outline-none focus:border-red-600 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 block mb-1">Pas (cm)</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={measureForm.waist}
                        onChange={(e) => setMeasureForm({...measureForm, waist: e.target.value})}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white focus:outline-none focus:border-red-600 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 block mb-1">Biceps (cm)</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={measureForm.arm}
                        onChange={(e) => setMeasureForm({...measureForm, arm: e.target.value})}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white focus:outline-none focus:border-red-600 text-sm"
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg text-sm flex items-center justify-center space-x-1">
                    <Save className="h-4 w-4" />
                    <span>Zapisz pomiary</span>
                  </button>
                </form>

                {/* HISTORIA POMIARÓW */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Historia</h3>
                  <div className="space-y-2">
                    {bodyLogs.map((log, idx) => (
                      <div key={idx} className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl flex justify-between items-center text-sm">
                        <span className="font-bold text-red-500">{log.date}</span>
                        <div className="flex space-x-4 text-xs text-neutral-300">
                          {log.weight && <span>Waga: <strong>{log.weight} kg</strong></span>}
                          {log.chest && <span>Klatka: <strong>{log.chest} cm</strong></span>}
                          {log.waist && <span>Pas: <strong>{log.waist} cm</strong></span>}
                          {log.arm && <span>Ramę: <strong>{log.arm} cm</strong></span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL WYBORU PLANU DO TRENINGU */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-red-900/60 rounded-xl p-5 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">Wybierz plan na dziś</h3>
              <button onClick={() => setShowStartModal(false)}>
                <X className="h-5 w-5 text-neutral-400" />
              </button>
            </div>
            
            <div className="space-y-2">
              {plans.map(p => (
                <button
                  key={p.id}
                  onClick={() => startWorkout(p)}
                  className="w-full text-left p-3 rounded-lg bg-neutral-950 hover:bg-red-950/40 border border-neutral-800 hover:border-red-600 transition-all text-white font-bold flex justify-between items-center"
                >
                  <span>{p.name}</span>
                  <Play className="h-4 w-4 text-red-500 fill-current" />
                </button>
              ))}
              {plans.length === 0 && (
                <p className="text-xs text-neutral-400 text-center py-4">
                  Nie masz żadnego stworzonego planu. Przejdź do zakładki "Plany" i dodaj pierwszy!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PASEK NAWIGACJI DOLNEJ */}
      {!activeSession && (
        <nav className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 p-2 flex justify-around z-10">
          <button 
            onClick={() => setActiveTab('plans')} 
            className={`flex flex-col items-center p-2 text-xs font-semibold ${activeTab === 'plans' ? 'text-red-500' : 'text-neutral-500'}`}
          >
            <Dumbbell className="h-5 w-5 mb-1" />
            <span>Plany</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('exercises')} 
            className={`flex flex-col items-center p-2 text-xs font-semibold ${activeTab === 'exercises' ? 'text-red-500' : 'text-neutral-500'}`}
          >
            <Plus className="h-5 w-5 mb-1" />
            <span>Ćwiczenia</span>
          </button>

          <button 
            onClick={() => setActiveTab('history')} 
            className={`flex flex-col items-center p-2 text-xs font-semibold ${activeTab === 'history' ? 'text-red-500' : 'text-neutral-500'}`}
          >
            <CalendarIcon className="h-5 w-5 mb-1" />
            <span>Kalendarz</span>
          </button>

          <button 
            onClick={() => setActiveTab('body')} 
            className={`flex flex-col items-center p-2 text-xs font-semibold ${activeTab === 'body' ? 'text-red-500' : 'text-neutral-500'}`}
          >
            <TrendingUp className="h-5 w-5 mb-1" />
            <span>Pomiary</span>
          </button>
        </nav>
      )}

    </div>
  );
}
