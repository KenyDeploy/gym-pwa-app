import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, Calendar, LineChart, Play, 
  Check, Award, Timer, Flame 
} from 'lucide-react';

export default function GymFlowApp() {
  const [activeTab, setActiveTab] = useState('workout');
  const [inWorkout, setInWorkout] = useState(false);
  const [workoutTimer, setWorkoutTimer] = useState(0);
  
  // Timer Przerw
  const [restTimer, setRestTimer] = useState(0);
  const [restActive, setRestActive] = useState(false);

  // Kalkulator Ciężaru
  const [selectedWeight, setSelectedWeight] = useState(80);

  // Stoper treningu
  useEffect(() => {
    let interval = null;
    if (inWorkout) {
      interval = setInterval(() => {
        setWorkoutTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
      setWorkoutTimer(0);
    }
    return () => clearInterval(interval);
  }, [inWorkout]);

  // Stoper przerw
  useEffect(() => {
    let interval = null;
    if (restActive && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => prev - 1);
      }, 1000);
    } else if (restTimer === 0 && restActive) {
      setRestActive(false);
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }
    return () => clearInterval(interval);
  }, [restActive, restTimer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculatePlates = (targetWeight) => {
    const barWeight = 20;
    if (targetWeight <= barWeight) return [];
    let remainingPerSide = (targetWeight - barWeight) / 2;
    const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];
    const result = [];

    availablePlates.forEach((plate) => {
      while (remainingPerSide >= plate) {
        result.push(plate);
        remainingPerSide -= plate;
      }
    });
    return result;
  };

  const calculate1RM = (weight, reps) => {
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-20">
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Dumbbell className="text-sky-400 w-6 h-6" />
          <span className="font-extrabold text-xl tracking-wider text-sky-400">GYMFLOW</span>
        </div>
        {inWorkout && (
          <div className="flex items-center gap-2 bg-sky-500/10 border border-sky-500/30 px-3 py-1 rounded-full text-sky-400 font-mono text-sm">
            <Timer className="w-4 h-4 animate-pulse" />
            <span>{formatTime(workoutTimer)}</span>
          </div>
        )}
      </header>

      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        {activeTab === 'workout' && !inWorkout && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-100 mb-2">Wybierz Plan Treningowy</h2>
            
            {['Plan A: Push (Klatka / Barki / Triceps)', 'Plan B: Pull (Plecy / Biceps)', 'Plan C: Legs (Nogi / Brzuch)'].map((plan, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-sky-500/50 transition">
                <h3 className="font-bold text-lg text-slate-200">{plan}</h3>
                <p className="text-xs text-slate-400 mt-1">4 ćwiczenia • ok. 60 min</p>
                <button 
                  onClick={() => setInWorkout(true)}
                  className="mt-4 w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <Play className="w-4 h-4 fill-slate-950" /> Rozpocznij Trening
                </button>
              </div>
            ))}

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mt-6">
              <h3 className="font-bold text-sm text-slate-300 mb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-sky-400" /> Kalkulator Talerzy (Plate Calculator)
              </h3>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  value={selectedWeight} 
                  onChange={(e) => setSelectedWeight(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 w-24 text-center font-bold text-sky-400"
                />
                <span className="text-xs text-slate-400">kg na sztandze</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                <span className="text-xs text-slate-500">Na jedną stronę:</span>
                {calculatePlates(selectedWeight).map((plate, i) => (
                  <span key={i} className="bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold px-2 py-0.5 rounded">
                    {plate}kg
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {inWorkout && (
          <div className="space-y-4">
            {restActive && (
              <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-3 flex justify-between items-center text-amber-400">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-semibold">Czas na odpoczynek:</span>
                </div>
                <span className="font-mono font-bold text-xl">{formatTime(restTimer)}</span>
              </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold uppercase text-sky-400 tracking-wider">Ćwiczenie 1 z 4</span>
                  <h3 className="text-xl font-bold text-slate-100">Wyciskanie Sztangi Leżąc</h3>
                </div>
                <button className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded">
                  Zmień ćwiczenie
                </button>
              </div>

              <div className="mt-3 bg-sky-950/40 border border-sky-800/40 rounded-lg p-2.5 text-xs text-sky-200 space-y-1">
                <p className="flex items-center gap-1 font-semibold">
                  <Flame className="w-3.5 h-3.5 text-amber-400" /> Progresja: Ostatnio 80kg × 8. Spróbuj 82.5kg!
                </p>
                <p className="text-slate-400">Szacowany 1RM: <strong className="text-slate-200">{calculate1RM(80, 8)} kg</strong></p>
              </div>

              <div className="mt-4 space-y-2">
                <div className="grid grid-cols-4 gap-2 text-center text-xs text-slate-400 font-semibold mb-1">
                  <span>SERIA</span>
                  <span>KG</span>
                  <span>REPS</span>
                  <span>ZROBIONE</span>
                </div>
                {[1, 2, 3].map((setNum) => (
                  <div key={setNum} className="grid grid-cols-4 gap-2 items-center bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-center font-bold text-xs text-slate-400">#{setNum}</span>
                    <input type="number" defaultValue={82.5} className="bg-slate-900 text-center font-bold text-slate-100 py-1 rounded border border-slate-800 w-full" />
                    <input type="number" defaultValue={8} className="bg-slate-900 text-center font-bold text-slate-100 py-1 rounded border border-slate-800 w-full" />
                    <button 
                      onClick={() => {
                        setRestTimer(90);
                        setRestActive(true);
                      }}
                      className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 p-1.5 rounded flex items-center justify-center transition"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setInWorkout(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl border border-slate-700"
            >
              Zakończ i Zapisz Trening
            </button>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-100">Kalendarz Treningowy</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
              <p className="text-slate-400 text-sm">Podgląd serii treningowych i ciągłości (Streak: 🔥 4 dni z rzędu)</p>
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-100">Pomiary Sylwetki</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-sm text-slate-400">Aktualna Waga:</span>
                <span className="font-bold text-sky-400">81.5 kg</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-sm text-slate-400">Obwód Bicepsa:</span>
                <span className="font-bold text-slate-200">39.0 cm</span>
              </div>
              <button className="w-full bg-sky-500/10 text-sky-400 border border-sky-500/30 font-semibold py-2 rounded-lg text-sm">
                + Dodaj Cotygodniowy Pomiar & Zdjęcie
              </button>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-2 flex justify-around items-center z-50">
        <button 
          onClick={() => setActiveTab('workout')}
          className={`flex flex-col items-center gap-1 text-xs ${activeTab === 'workout' ? 'text-sky-400 font-bold' : 'text-slate-400'}`}
        >
          <Dumbbell className="w-5 h-5" />
          <span>Trening</span>
        </button>
        <button 
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center gap-1 text-xs ${activeTab === 'calendar' ? 'text-sky-400 font-bold' : 'text-slate-400'}`}
        >
          <Calendar className="w-5 h-5" />
          <span>Kalendarz</span>
        </button>
        <button 
          onClick={() => setActiveTab('metrics')}
          className={`flex flex-col items-center gap-1 text-xs ${activeTab === 'metrics' ? 'text-sky-400 font-bold' : 'text-slate-400'}`}
        >
          <LineChart className="w-5 h-5" />
          <span>Pomiary</span>
        </button>
      </nav>
    </div>
  );
}
