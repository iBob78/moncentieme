import React from 'react';
import { TimeState } from '../types/clock';
import { Play, Pause, RotateCcw, Radio, FastForward } from 'lucide-react';

interface TimeTravelControllerProps {
  time: TimeState;
  isLive: boolean;
  isPlaying: boolean;
  simulationSpeed: number;
  onTogglePlay: () => void;
  onSetSpeed: (speed: number) => void;
  onGoLive: () => void;
  onSeekTime: (hours: number, minutes: number, seconds: number) => void;
}

export const TimeTravelController: React.FC<TimeTravelControllerProps> = ({
  time,
  isLive,
  isPlaying,
  simulationSpeed,
  onTogglePlay,
  onSetSpeed,
  onGoLive,
  onSeekTime,
}) => {
  // Current time in seconds of day (0 to 86399)
  const totalSeconds = time.hours * 3600 + time.minutes * 60 + time.seconds;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    const h = Math.floor(val / 3600);
    const m = Math.floor((val % 3600) / 60);
    const s = val % 60;
    onSeekTime(h, m, s);
  };

  const speedOptions = [1, 5, 30, 60, 300];

  const presets = [
    { label: '13h30 (Exemple utilisateur)', h: 13, m: 30, s: 0, cent: '13.50' },
    { label: '08h15 (Matin)', h: 8, m: 15, s: 0, cent: '8.25' },
    { label: '12h00 (Midi)', h: 12, m: 0, s: 0, cent: '12.00' },
    { label: '17h45 (Fin journée)', h: 17, m: 45, s: 0, cent: '17.75' },
    { label: '09h06 (6 min = 0.10)', h: 9, m: 6, s: 0, cent: '9.10' },
    { label: '14h36 (36 min = 0.60)', h: 14, m: 36, s: 0, cent: '14.60' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto my-6 p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl">
      {/* Top bar with Direct vs Simulation Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <button
            onClick={onGoLive}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              isLive
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isLive ? 'text-emerald-400 animate-pulse' : ''}`} />
            <span>Direct (Temps Réel)</span>
          </button>

          {!isLive && (
            <span className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Mode Simulation Active
            </span>
          )}
        </div>

        {/* Play / Pause & Speed controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            disabled={isLive}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isLive
                ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                : isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-sky-600 text-white hover:bg-sky-500 shadow-md'
            }`}
            title={isLive ? 'Quittez le direct pour animer manuellement' : isPlaying ? 'Pause' : 'Lecture'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Animer</span>
              </>
            )}
          </button>

          {/* Speed picker */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <FastForward className="w-3 h-3 text-slate-500 ml-1.5 mr-1" />
            {speedOptions.map((spd) => (
              <button
                key={spd}
                onClick={() => onSetSpeed(spd)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  simulationSpeed === spd
                    ? 'bg-sky-500 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            onClick={onGoLive}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            title="Réinitialiser à l'heure courante"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Timeline Slider */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-slate-400 font-mono mb-2">
          <span>00:00:00 (0.00h)</span>
          <span className="text-sky-300 font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            Curseur : {String(time.hours).padStart(2, '0')}:{String(time.minutes).padStart(2, '0')}:{String(time.seconds).padStart(2, '0')}
          </span>
          <span>23:59:59 (24.00h)</span>
        </div>

        <input
          type="range"
          min="0"
          max="86399"
          value={totalSeconds}
          onChange={handleSliderChange}
          className="w-full h-2.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-400 focus:outline-none"
        />

        <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1 px-1">
          <span>Minuit</span>
          <span>06:00</span>
          <span>12:00 Midi</span>
          <span>18:00</span>
          <span>Minuit</span>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-800/60">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Exemples et Préréglages Rapides :
        </span>
        <div className="flex flex-wrap gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => onSeekTime(p.h, p.m, p.s)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                time.hours === p.h && time.minutes === p.m
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow'
                  : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <span className="font-semibold">{p.h}h{String(p.m).padStart(2, '0')}</span>
              <span className="text-slate-500">➔</span>
              <span className="font-mono text-cyan-300 font-bold">{p.cent}h</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
