import React, { useState } from 'react';
import { TimeState, ClockSettings } from '../types/clock';
import { AnalogClockCentesimal } from './AnalogClockCentesimal';
import { timeToCentesimal, formatCentesimalTime } from '../utils/timeCalculations';
import { THEME_CONFIGS } from './ClockStyles';
import { Copy, Check, Cpu, Sparkles, Clock, ArrowRight, Share2 } from 'lucide-react';

interface OptionBCentesimalOnlyProps {
  time: TimeState;
  settings: ClockSettings;
  onSwitchToOptionA: () => void;
  onOpenInfo: () => void;
}

export const OptionBCentesimalOnly: React.FC<OptionBCentesimalOnlyProps> = ({
  time,
  settings,
  onSwitchToOptionA,
  onOpenInfo,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const colors = THEME_CONFIGS[settings.theme].colors;

  const centesimalVal = timeToCentesimal(
    time.hours,
    time.minutes,
    time.seconds,
    settings.sweep === 'smooth' ? time.milliseconds : 0
  );

  const centesimalDisplay = formatCentesimalTime(
    centesimalVal,
    settings.decimalPlaces,
    settings.decimalSeparator
  );

  const centiemeFraction = (centesimalVal % 1) * 100;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${centesimalDisplay}h`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareOptionB = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'option-b');
    navigator.clipboard.writeText(url.toString());
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Option B Badge & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-xl bg-cyan-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-md shadow-cyan-500/20">
            Option B
          </span>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              Horloge au Centième Dédiée (Base 100 Pure)
            </h2>
            <p className="text-xs text-cyan-300/80">
              Affichage exclusif pour postes RH, ateliers, chronométrage & paie
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShareOptionB}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            title="Copier le lien direct vers l'Option B"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-sans">Lien copié</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Lien direct Option B</span>
              </>
            )}
          </button>

          <button
            onClick={onSwitchToOptionA}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Basculer vers Option A (Duo)</span>
          </button>
        </div>
      </div>

      {/* Main Focus Card: Large Centesimal Clock */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center">
        
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header tag */}
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Cpu className="w-5 h-5" />
          </div>
          <span className="text-xs uppercase font-bold tracking-widest text-cyan-300">
            Cadran Centésimal 100 Graduations (3,6° par centième)
          </span>
        </div>

        {/* Big Centesimal Dial */}
        <div className={`p-4 rounded-full bg-slate-950/80 border border-slate-800 ${colors.glowClass}`}>
          <AnalogClockCentesimal time={time} settings={settings} size={320} />
        </div>

        {/* Huge Digital Readout */}
        <div className="mt-8 text-center flex flex-col items-center">
          <div className="text-xs uppercase tracking-widest text-cyan-400/90 font-bold mb-1">
            Heure Industrielle Actuelle
          </div>

          <div className="flex items-baseline justify-center gap-2">
            <span className="text-5xl sm:text-7xl font-extrabold font-mono-digits text-cyan-300 tracking-tight">
              {centesimalDisplay}
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-cyan-500/90 font-mono">
              h
            </span>
          </div>

          {/* Corresponding normal time badge */}
          <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400">Équivalent en temps normal :</span>
            <span className="font-bold text-white font-mono text-sm">
              {String(time.hours).padStart(2, '0')}h{String(time.minutes).padStart(2, '0')}
              {settings.showSeconds && `:${String(time.seconds).padStart(2, '0')}`}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400 font-mono font-semibold">
              {centiemeFraction.toFixed(1)} / 100 centièmes
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copié dans le presse-papier !</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copier l'heure ({centesimalDisplay}h)</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenInfo}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Pourquoi {String(time.hours).padStart(2, '0')}h30 = {time.hours}.50 ?</span>
            </button>
          </div>
        </div>

        {/* Quick Reference Footer Bar */}
        <div className="w-full mt-10 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <span className="text-[11px] text-slate-400 block">15 minutes</span>
            <span className="text-sm font-bold font-mono text-cyan-300">0,25 h (¼ h)</span>
          </div>
          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
            <span className="text-[11px] text-cyan-300 block font-semibold">30 minutes</span>
            <span className="text-sm font-extrabold font-mono text-cyan-200">0,50 h (½ h)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <span className="text-[11px] text-slate-400 block">45 minutes</span>
            <span className="text-sm font-bold font-mono text-cyan-300">0,75 h (¾ h)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <span className="text-[11px] text-slate-400 block">6 minutes</span>
            <span className="text-sm font-bold font-mono text-cyan-300">0,10 h (1/10 h)</span>
          </div>
        </div>

      </div>

      {/* Switcher Banner to Option A */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/40 via-slate-950 to-slate-900 border border-sky-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">
              Besoin de comparer en direct avec l'horloge normale ?
            </span>
            <span className="text-[11px] text-slate-400">
              L'Option A affiche les deux cadrans synchronisés côte à côte en temps réel.
            </span>
          </div>
        </div>

        <button
          onClick={onSwitchToOptionA}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold border border-slate-700 transition-colors whitespace-nowrap"
        >
          <span>Voir l'Option A (Duo)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
