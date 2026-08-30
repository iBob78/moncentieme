import React from 'react';
import { ClockSettings, TimeState } from '../types/clock';
import { AnalogClockNormal } from './AnalogClockNormal';
import { AnalogClockCentesimal } from './AnalogClockCentesimal';
import { formatSexagesimalTime, timeToCentesimal, formatCentesimalTime } from '../utils/timeCalculations';
import { THEME_CONFIGS } from './ClockStyles';
import { Copy, Check, Clock, Cpu, Info } from 'lucide-react';

interface DualClockDisplayProps {
  time: TimeState;
  settings: ClockSettings;
  onOpenInfo: () => void;
}

export const DualClockDisplay: React.FC<DualClockDisplayProps> = ({
  time,
  settings,
  onOpenInfo,
}) => {
  const [copiedNormal, setCopiedNormal] = React.useState(false);
  const [copiedCent, setCopiedCent] = React.useState(false);

  const themeConfig = THEME_CONFIGS[settings.theme];
  const { colors } = themeConfig;

  // Digital formats
  const { display: normalTimeDisplay, period } = formatSexagesimalTime(
    time.hours,
    time.minutes,
    time.seconds,
    settings.showSeconds,
    settings.use24Hour
  );

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

  const handleCopyNormal = () => {
    navigator.clipboard.writeText(normalTimeDisplay);
    setCopiedNormal(true);
    setTimeout(() => setCopiedNormal(false), 2000);
  };

  const handleCopyCent = () => {
    navigator.clipboard.writeText(`${centesimalDisplay}h`);
    setCopiedCent(true);
    setTimeout(() => setCopiedCent(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Grid of the two clocks side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* CLOCK 1: HORLOGE NORMALE / SEXAGÉSIMALE */}
        <div className="relative group rounded-3xl p-6 sm:p-8 bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-between transition-all duration-300 hover:border-sky-500/30">
          {/* Header pill */}
          <div className="w-full flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Horloge Normale
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Système Sexagésimal (Base 60)
                </p>
              </div>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full font-mono font-semibold bg-slate-800 text-sky-300 border border-slate-700">
              1h = 60m
            </span>
          </div>

          {/* Analog Dial */}
          <div className="my-3 flex justify-center w-full">
            <div className={`rounded-full p-2.5 bg-slate-950/80 border border-slate-800/80 ${colors.glowClass}`}>
              <AnalogClockNormal time={time} settings={settings} size={280} />
            </div>
          </div>

          {/* Digital Time Readout */}
          <div className="w-full mt-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col items-center">
            <span className="text-[11px] uppercase tracking-widest text-slate-500 font-bold mb-1">
              Affichage Numérique Classique
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold font-mono-digits text-white tracking-tight">
                {normalTimeDisplay}
              </span>
              {period && (
                <span className="text-sm font-bold text-sky-400 font-mono">
                  {period}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-slate-400 font-mono">
                {String(time.hours).padStart(2, '0')}h {String(time.minutes).padStart(2, '0')}min {settings.showSeconds ? `${String(time.seconds).padStart(2, '0')}s` : ''}
              </span>
              <span className="text-slate-600">•</span>
              <button
                onClick={handleCopyNormal}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-sky-300 transition-colors"
                title="Copier l'heure"
              >
                {copiedNormal ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Educational footnote badge */}
          <div className="w-full mt-4 text-[11px] text-slate-400 text-center bg-slate-950/40 py-2 px-3 rounded-lg border border-slate-800/50">
            Cadran divisé en <strong className="text-slate-200">12 heures</strong> et <strong className="text-slate-200">60 minutes</strong> (6° par minute).
          </div>
        </div>

        {/* CLOCK 2: HORLOGE CENTÉSIMALE / BASE 100 */}
        <div className="relative group rounded-3xl p-6 sm:p-8 bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-between transition-all duration-300 hover:border-cyan-500/30">
          {/* Header pill */}
          <div className="w-full flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                  Horloge au Centième
                  <button
                    onClick={onOpenInfo}
                    className="p-0.5 text-cyan-400 hover:text-cyan-300 transition-colors"
                    title="Comprendre l'heure centésimale"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </h2>
                <p className="text-xs text-cyan-400/90 font-medium">
                  Système Centésimal / Industriel (Base 100)
                </p>
              </div>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full font-mono font-semibold bg-cyan-950/70 text-cyan-300 border border-cyan-800/50">
              1h = 100c
            </span>
          </div>

          {/* Analog Dial Centesimal */}
          <div className="my-3 flex justify-center w-full">
            <div className={`rounded-full p-2.5 bg-slate-950/80 border border-slate-800/80 ${colors.glowClass}`}>
              <AnalogClockCentesimal time={time} settings={settings} size={280} />
            </div>
          </div>

          {/* Digital Time Readout Centesimal */}
          <div className="w-full mt-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col items-center">
            <span className="text-[11px] uppercase tracking-widest text-cyan-400 font-bold mb-1">
              Affichage Numérique en Centièmes
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold font-mono-digits text-cyan-400 tracking-tight">
                {centesimalDisplay}
              </span>
              <span className="text-lg font-bold text-cyan-500/80 font-mono">
                h
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-cyan-300/80 font-mono">
                {time.hours} h et {((centesimalVal % 1) * 100).toFixed(settings.decimalPlaces === 2 ? 0 : 1)} centièmes
              </span>
              <span className="text-slate-600">•</span>
              <button
                onClick={handleCopyCent}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-300 transition-colors"
                title="Copier l'heure centésimale"
              >
                {copiedCent ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Educational footnote badge */}
          <div className="w-full mt-4 text-[11px] text-cyan-400/90 text-center bg-cyan-950/20 py-2 px-3 rounded-lg border border-cyan-800/30">
            Cadran gradué en <strong className="text-cyan-300">100 centièmes</strong> (3.6° par centième). Utilisé en Paie & RH.
          </div>
        </div>

      </div>
    </div>
  );
};
