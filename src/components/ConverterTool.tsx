import React, { useState } from 'react';
import { ArrowRightLeft, Copy, Check, Calculator, HelpCircle } from 'lucide-react';
import { timeToCentesimal, centesimalToSexagesimal } from '../utils/timeCalculations';

export const ConverterTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sexToCent' | 'centToSex'>('sexToCent');

  // State for Sexagesimal -> Centesimal
  const [inputHours, setInputHours] = useState<number>(13);
  const [inputMinutes, setInputMinutes] = useState<number>(30);
  const [inputSeconds, setInputSeconds] = useState<number>(0);

  // State for Centesimal -> Sexagesimal
  const [inputDecimal, setInputDecimal] = useState<string>('13.50');

  const [copied, setCopied] = useState<boolean>(false);

  // Computed: Sexagesimal -> Centesimal
  const centesimalResult = timeToCentesimal(
    Number(inputHours) || 0,
    Number(inputMinutes) || 0,
    Number(inputSeconds) || 0
  );

  // Computed: Centesimal -> Sexagesimal
  const parsedDecimal = parseFloat(inputDecimal.replace(',', '.')) || 0;
  const sexagesimalResult = centesimalToSexagesimal(parsedDecimal);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500/20 to-cyan-500/20 border border-sky-500/30 text-sky-400">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Convertisseur & Calculatrice de Temps
            </h2>
            <p className="text-xs text-slate-400">
              Convertissez instantanément entre heures classiques (Base 60) et heures industrielles (Base 100)
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('sexToCent')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'sexToCent'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Classique ➔ Centièmes
          </button>
          <button
            onClick={() => setActiveTab('centToSex')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'centToSex'
                ? 'bg-cyan-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Centièmes ➔ Classique
          </button>
        </div>
      </div>

      {/* TAB 1: SEXAGESIMAL -> CENTESIMAL */}
      {activeTab === 'sexToCent' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Hours Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Heures (0 - 23+)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={inputHours}
                  onChange={(e) => setInputHours(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-lg font-mono font-bold text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
                <span className="absolute right-3.5 top-3.5 text-xs text-slate-500 font-mono">h</span>
              </div>
            </div>

            {/* Minutes Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Minutes (0 - 59)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={inputMinutes}
                  onChange={(e) => setInputMinutes(Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-lg font-mono font-bold text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
                <span className="absolute right-3.5 top-3.5 text-xs text-slate-500 font-mono">min</span>
              </div>
            </div>

            {/* Seconds Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Secondes (optionnel 0 - 59)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={inputSeconds}
                  onChange={(e) => setInputSeconds(Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-lg font-mono font-bold text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
                <span className="absolute right-3.5 top-3.5 text-xs text-slate-500 font-mono">sec</span>
              </div>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-500 font-medium">Exemples :</span>
            {[
              { label: '13h30 (Prompt)', h: 13, m: 30 },
              { label: '7h45', h: 7, m: 45 },
              { label: '8h15', h: 8, m: 15 },
              { label: '7h36 (Pointage)', h: 7, m: 36 },
              { label: '1h12', h: 1, m: 12 },
            ].map((ex, i) => (
              <button
                key={i}
                onClick={() => {
                  setInputHours(ex.h);
                  setInputMinutes(ex.m);
                  setInputSeconds(0);
                }}
                className="text-xs px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono transition-colors"
              >
                {ex.label}
              </button>
            ))}
          </div>

          {/* Result Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/40 via-cyan-950/30 to-slate-950 border border-cyan-500/30 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                  Résultat en Heures Centésimales (Décimales) :
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-4xl sm:text-5xl font-extrabold font-mono-digits text-cyan-300">
                    {centesimalResult.toFixed(2)}
                    <span className="text-2xl font-bold text-cyan-500 ml-1">h</span>
                  </span>
                  <span className="text-sm font-mono text-slate-400">
                    ou {centesimalResult.toFixed(4)}h (haute précision)
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleCopy(`${centesimalResult.toFixed(2)}`)}
                className="self-start sm:self-center flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-sm font-semibold transition-all shadow-md"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copié dans le presse-papier !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copier ({centesimalResult.toFixed(2)})</span>
                  </>
                )}
              </button>
            </div>

            {/* Step by step mathematical detail */}
            <div className="mt-4 pt-4 border-t border-cyan-800/30 text-xs text-slate-300 space-y-1.5 font-mono">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Détail du calcul mathématique :</span>
              </div>
              <p className="text-slate-400">
                1. Conversion des minutes en fraction d'heure : {inputMinutes} ÷ 60 = {(inputMinutes / 60).toFixed(4)} h
              </p>
              {inputSeconds > 0 && (
                <p className="text-slate-400">
                  2. Conversion des secondes : {inputSeconds} ÷ 3600 = {(inputSeconds / 3600).toFixed(4)} h
                </p>
              )}
              <p className="text-slate-200 font-semibold">
                ➔ Total : {inputHours} h + {(inputMinutes / 60 + inputSeconds / 3600).toFixed(4)} h ={' '}
                <span className="text-cyan-300">{centesimalResult.toFixed(2)} h</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CENTESIMAL -> SEXAGESIMAL */}
      {activeTab === 'centToSex' && (
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Heures Décimales / Centésimales (Ex: 13.50 ou 7.75)
            </label>
            <div className="relative max-w-md">
              <input
                type="text"
                value={inputDecimal}
                onChange={(e) => setInputDecimal(e.target.value)}
                placeholder="13.50"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xl font-mono font-bold text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
              <span className="absolute right-3.5 top-3.5 text-xs text-slate-500 font-mono">heures</span>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-500 font-medium">Exemples :</span>
            {[
              { label: '13.50 (Prompt)', val: '13.50' },
              { label: '7.75 (7h45)', val: '7.75' },
              { label: '8.25 (8h15)', val: '8.25' },
              { label: '7.60 (7h36)', val: '7.60' },
              { label: '12.10 (12h06)', val: '12.10' },
              { label: '35.00 (Temps plein)', val: '35.00' },
            ].map((ex, i) => (
              <button
                key={i}
                onClick={() => setInputDecimal(ex.val)}
                className="text-xs px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono transition-colors"
              >
                {ex.label}
              </button>
            ))}
          </div>

          {/* Result Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-950/40 via-sky-950/30 to-slate-950 border border-sky-500/30 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
                  Résultat en Heures & Minutes Sexagésimales :
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-4xl sm:text-5xl font-extrabold font-mono-digits text-white">
                    {sexagesimalResult.hours}h {String(sexagesimalResult.minutes).padStart(2, '0')}m
                    {sexagesimalResult.seconds > 0 && (
                      <span className="text-xl text-slate-400 ml-2">
                        {String(sexagesimalResult.seconds).padStart(2, '0')}s
                      </span>
                    )}
                  </span>
                  <span className="text-sm font-mono text-slate-400">
                    ({String(sexagesimalResult.hours).padStart(2, '0')}:{String(sexagesimalResult.minutes).padStart(2, '0')}:{String(sexagesimalResult.seconds).padStart(2, '0')})
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleCopy(`${sexagesimalResult.hours}h${String(sexagesimalResult.minutes).padStart(2, '0')}`)}
                className="self-start sm:self-center flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-sm font-semibold transition-all shadow-md"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copié dans le presse-papier !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copier ({sexagesimalResult.hours}h{String(sexagesimalResult.minutes).padStart(2, '0')})</span>
                  </>
                )}
              </button>
            </div>

            {/* Step by step mathematical detail */}
            <div className="mt-4 pt-4 border-t border-sky-800/30 text-xs text-slate-300 space-y-1.5 font-mono">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Détail du calcul inverse :</span>
              </div>
              <p className="text-slate-400">
                1. Partie entière = {sexagesimalResult.hours} heures complètes
              </p>
              <p className="text-slate-400">
                2. Partie décimale : {(parsedDecimal % 1).toFixed(4)} × 60 = {( (parsedDecimal % 1) * 60 ).toFixed(2)} minutes
              </p>
              <p className="text-slate-200 font-semibold">
                ➔ Total : {sexagesimalResult.hours} heures et {sexagesimalResult.minutes} minutes {sexagesimalResult.seconds > 0 ? `(${sexagesimalResult.seconds} sec)` : ''}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
