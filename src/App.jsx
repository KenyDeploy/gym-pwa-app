import React from 'react';
import { Calendar, Dumbbell, Clock, Flame, X, Trash2 } from 'lucide-react';

export const HistoryDayDetails = ({ selectedDate, workoutLog, onClose, onDeleteWorkout }) => {
  if (!workoutLog) return null;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mt-4 animate-in fade-in">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">{workoutLog.planName || 'Trening'}</h3>
          <p className="text-xs text-slate-500 font-medium">Zrobiony: {selectedDate}</p>
        </div>
        <div className="flex items-center gap-1">
          {onDeleteWorkout && (
            <button 
              onClick={() => onDeleteWorkout(workoutLog.id)}
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              title="Usuń trening"
            >
              <Trash2 size={18} />
            </button>
          )}
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Podsumowanie nagłówka */}
      <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-cyan-500" />
          <span className="text-xs font-semibold text-slate-600">{workoutLog.duration || '00:00'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-orange-500" />
          <span className="text-xs font-semibold text-slate-600">Tonaż: {workoutLog.totalVolume || 0} kg</span>
        </div>
      </div>

      {/* Zwięzła lista ćwiczeń */}
      <div className="space-y-3">
        {workoutLog.exercises?.map((ex, idx) => (
          <div key={idx} className="border border-slate-100 rounded-xl p-3 bg-white">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-sm text-slate-800">{ex.name}</span>
              <span className="text-xs text-cyan-600 font-semibold bg-cyan-50 px-2 py-0.5 rounded-full">
                {ex.sets?.length || 0} serie
              </span>
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {ex.sets?.map((set, sIdx) => (
                <span key={sIdx} className="text-xs bg-slate-50 border border-slate-200 text-slate-700 px-2 py-1 rounded-md font-mono">
                  S{sIdx + 1}: <strong className="text-slate-900">{set.reps}</strong>p × <strong className="text-cyan-600">{set.weight}</strong>kg
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
