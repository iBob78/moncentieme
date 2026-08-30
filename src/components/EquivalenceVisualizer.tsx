import React from 'react';
import { TimeState, ClockSettings } from '../types/clock';
import { timeToCentesimal, formatCentesimalTime, formatSexagesimalTime } from '../utils/timeCalculations';
import { ArrowRightLeft, Sparkles, Check, Copy } from 'lucide-react';

interface EquivalenceVisualizerProps {
  time: TimeState;
  settings: ClockSettings;
}

export const EquivalenceVisualizer: React.FC<EquivalenceVisualizerProps> = ({
  time,
  settings,
}) => {
  const [copiedNormal, setCopiedNormal] = React.useState(false);
  const [copiedCent, setCopiedCent] = React.useState(false);

  const centesimalVal = timeToCentesimal(time.hours, time.minutes, time.seconds, settings.sweep === 'smooth' ? time.milliseconds : 0);
  const centesimalFormatted = formatCentesimalTime(centesimalVal, settings.decimalPlaces, settings.decimalSeparator);

  const { display: normalFormatted } = formatSexagesimalTime(
    time.hours,
    time.minutes,
    time.seconds,
    settings.showSeconds,
    settings.use24Hour
  );

  // Exact fraction of current hour (0 to 1)
  const hourFraction = (time.minutes + time.seconds / 60) / 60;
  const minuteProgress = (time.minutes / 60) * 100;
  const centiemeProgress = (centesimalVal % 1) * 100;

  const copyToClipboard = (text: string, isCent: boolean) => {
    navigator.clipboard.writeText(text);
    if (isCent) {
      setCopiedCent(true);
      setTimeout(() => setCopiedCent(false), 1800);
    } else {
      setCopiedNormal(true);
      setTimeout(() => setCopiedNormal(false), 1800);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 p-4 md:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Équivalence en direct
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono-digits text-slate-400">
          <span>Avancement dans l'heure :</span>
          <span className="text-sky-400 font-bold">{(hourFraction * 100).toFixed(1)}%</span>
        </div>
      </div>

      {/* Main comparative values */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
        {/* Left: Normal Time */}
        <div className="md:col-span-3 flex flex-col p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-sky-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-slate-300">Heure Sexagésimale</span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-mono">Base 60</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono-digits text-white tracking-tight">
              {normalFormatted}
            </span>
            <button
              onClick={() => copyToClipboard(normalFormatted, false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Copier l'heure classique"
            >
              {copiedNormal ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 font-mono">
            {time.hours} h et {time.minutes} min {settings.showSeconds ? `(${time.seconds} s)` : ''}
          </p>
        </div>

        {/* Middle: Conversion Icon & Math Pill */}
        <div className="md:col-span-1 flex flex-col items-center justify-center py-2 md:py-0">
          <div className="p-3 rounded-full bg-slate-800/80 border border-slate-700 text-sky-400 shadow-md">
            <ArrowRightLeft className="w-5 h-5 animate-pulse" />
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-500 mt-1 tracking-wider">
            Égale
          </span>
        </div>

        {/* Right: Centesimal Time */}
        <div className="md:col-span-3 flex flex-col p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-cyan-300">Heure Centésimale (Industrielle)</span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 font-mono">
              Base 100
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono-digits text-cyan-400 tracking-tight">
              {centesimalFormatted}
              <span className="text-base text-cyan-500/70 ml-1 font-semibold">h</span>
            </span>
            <button
              onClick={() => copyToClipboard(`${centesimalFormatted}h`, true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
              title="Copier l'heure centésimale"
            >
              {copiedCent ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-cyan-400/80 mt-1.5 font-mono">
            {time.hours} h + {(centesimalVal % 1).toFixed(2).slice(2)} centièmes
          </p>
        </div>
      </div>

      {/* Dual Synchronized Linear Bars */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
        <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
          <span>Comparaison de l'aiguille des minutes vs aiguille des centièmes :</span>
          <span className="text-[11px] text-slate-500">Même position angulaire sur les deux cadrans</span>
        </div>

        {/* Minutes Bar (0 to 60) */}
        <div>
          <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span>0 min</span>
            <span className="text-sky-300 font-semibold">{time.minutes} minutes ({minuteProgress.toFixed(0)}%)</span>
            <span>60 min</span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, minuteProgress))}%` }}
            />
            {/* 15, 30, 45 min notch markers */}
            <div className="absolute top-0 bottom-0 left-[25%] w-0.5 bg-slate-700/80" title="15 min" />
            <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-slate-700/80" title="30 min (user example)" />
            <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-slate-700/80" title="45 min" />
          </div>
        </div>

        {/* Centièmes Bar (0 to 100) */}
        <div>
          <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span>00 c</span>
            <span className="text-cyan-300 font-semibold">{centiemeProgress.toFixed(1)} centièmes ({centiemeProgress.toFixed(0)}%)</span>
            <span>100 c</span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative">
            <div
              className="h-full bg-gradient-to-r from-teal-600 to-cyan-400 transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, centiemeProgress))}%` }}
            />
            {/* 25, 50, 75 centième notch markers */}
            <div className="absolute top-0 bottom-0 left-[25%] w-0.5 bg-cyan-700/60" title="25 centièmes" />
            <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-cyan-700/60" title="50 centièmes" />
            <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-cyan-700/60" title="75 centièmes" />
          </div>
        </div>

        {/* Formula Explanatory Box */}
        <div className="mt-3 p-3 rounded-lg bg-slate-950/50 border border-slate-800/60 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Formule appliquée :</span>
            <code className="px-2 py-0.5 rounded bg-slate-900 text-sky-300 border border-slate-700 font-mono text-[11px]">
              {time.hours} + ({time.minutes} / 60) = {time.hours} + {(time.minutes / 60).toFixed(2)} = {centesimalFormatted} h
            </code>
          </div>
          <span className="text-[11px] text-slate-400 italic">
            Exemple : 13h30 ➔ 13 + (30 ÷ 60) = 13,50
          </span>
        </div>
      </div>
    </div>
  );
};
