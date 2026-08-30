import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag, Timer } from 'lucide-react';

interface LapRecord {
  id: number;
  timeMs: number;
  classic: string;
  centesimal: string;
}

export const DualStopwatch: React.FC = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [laps, setLaps] = useState<LapRecord[]>([]);

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = performance.now();
      const update = (now: number) => {
        if (lastTimeRef.current !== null) {
          const delta = now - lastTimeRef.current;
          setElapsedMs((prev) => prev + delta);
        }
        lastTimeRef.current = now;
        requestRef.current = requestAnimationFrame(update);
      };
      requestRef.current = requestAnimationFrame(update);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      lastTimeRef.current = null;
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isRunning]);

  const toggleRun = () => setIsRunning(!isRunning);

  const reset = () => {
    setIsRunning(false);
    setElapsedMs(0);
    setLaps([]);
  };

  // Convert elapsed ms to standard time
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((elapsedMs % 1000) / 10);

  const classicString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;

  // Convert elapsed ms to centesimal hours (Base 100)
  // 1 hour = 3,600,000 ms
  const centesimalHours = elapsedMs / 3600000;
  const centesimalString = `${centesimalHours.toFixed(4)} h`;

  const addLap = () => {
    if (elapsedMs === 0) return;
    const newLap: LapRecord = {
      id: laps.length + 1,
      timeMs: elapsedMs,
      classic: classicString,
      centesimal: `${centesimalHours.toFixed(2)} h (${(centesimalHours * 100).toFixed(1)} c)`,
    };
    setLaps([newLap, ...laps]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Timer className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Chronomètre Double Format (Temps Réel & Industriel)
            </h2>
            <p className="text-xs text-slate-400">
              Mesurez vos durées de tâches directement en centièmes d'heure
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleRun}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Arrêter</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Démarrer</span>
              </>
            )}
          </button>

          <button
            onClick={addLap}
            disabled={elapsedMs === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Tour</span>
          </button>

          <button
            onClick={reset}
            disabled={elapsedMs === 0}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            title="Réinitialiser"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dual readouts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Classic Timer */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">
            Format Classique (HH:MM:SS.cs)
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono-digits text-white tracking-tight my-2">
            {classicString}
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {minutes} minutes et {seconds} secondes
          </span>
        </div>

        {/* Centesimal Timer */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 text-center">
          <span className="text-[11px] uppercase tracking-wider font-bold text-cyan-400 block mb-1">
            Format Centésimal (Heures Industrielles)
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono-digits text-cyan-300 tracking-tight my-2">
            {centesimalString}
          </div>
          <span className="text-xs text-cyan-500/80 font-mono">
            {(centesimalHours * 100).toFixed(2)} centièmes d'heure cumulés
          </span>
        </div>
      </div>

      {/* Laps table */}
      {laps.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Tours enregistrés ({laps.length})
          </h4>
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {laps.map((lap) => (
              <div
                key={lap.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono"
              >
                <span className="text-slate-500 font-bold">#{lap.id}</span>
                <span className="text-white">{lap.classic}</span>
                <span className="text-cyan-300 font-bold">{lap.centesimal}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
