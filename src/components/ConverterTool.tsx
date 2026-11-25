import React, { useId, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { timeToCentesimal, decimalHoursToMinutes, parseNonNegativeDecimal, formatCentesimalTime } from '../utils/timeCalculations';

export const ConverterTool: React.FC = () => {
  const id = useId();
  const [activeTab, setActiveTab] = useState<'sexToCent' | 'centToSex'>('sexToCent');
  const [inputHours, setInputHours] = useState('0');
  const [inputMinutes, setInputMinutes] = useState('0');
  const [inputDecimal, setInputDecimal] = useState('0');
  const [copied, setCopied] = useState(false);

  const hours = /^\d+$/.test(inputHours) ? Number(inputHours) : NaN;
  const minutes = /^\d+$/.test(inputMinutes) ? Number(inputMinutes) : NaN;
  const validNormal = Number.isInteger(hours) && hours >= 0 && hours <= 999 && Number.isInteger(minutes) && minutes >= 0 && minutes <= 59;
  const decimal = parseNonNegativeDecimal(inputDecimal);
  const normal = decimal === null ? null : decimalHoursToMinutes(decimal);
  const result = activeTab === 'sexToCent'
    ? (validNormal ? formatCentesimalTime(timeToCentesimal(hours, minutes), 2, ',') + ' h' : null)
    : (normal ? normal.hours + 'h' + String(normal.minutes).padStart(2, '0') : null);
  const copyValue = activeTab === 'sexToCent' && result !== null ? result.slice(0, -2) : result;
  const error = activeTab === 'sexToCent' ? 'Heures : 0 à 999 ; minutes : 0 à 59.' : 'Saisissez un nombre positif ou nul.';

  const handleCopy = async () => {
    if (copyValue === null) return;
    try {
      await navigator.clipboard.writeText(copyValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };
  const selectMode = (mode: 'sexToCent' | 'centToSex') => {
    setActiveTab(mode);
    setCopied(false);
  };
  const fieldClass = 'w-full min-w-0 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-base font-mono font-semibold text-white focus:border-sky-400 focus:outline-none';

  return (
    <section aria-label="Convertisseur" className="tool-panel converter-panel w-full max-w-2xl mx-auto my-2 p-2 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800">
      <h2 className="text-sm font-bold text-white mb-2">Convertisseur</h2>
      <div role="group" aria-label="Sens de conversion" className="grid grid-cols-2 gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 mb-2">
        <button type="button" aria-pressed={activeTab === 'sexToCent'} onClick={() => selectMode('sexToCent')}
          className={`min-w-0 px-1.5 py-1 rounded-md text-xs font-semibold ${activeTab === 'sexToCent' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'}`}>Heures → Centièmes</button>
        <button type="button" aria-pressed={activeTab === 'centToSex'} onClick={() => selectMode('centToSex')}
          className={`min-w-0 px-1.5 py-1 rounded-md text-xs font-semibold ${activeTab === 'centToSex' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>Centièmes → Heures</button>
      </div>
      {activeTab === 'sexToCent' ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="min-w-0">
            <label htmlFor={id + '-hours'} className="block text-xs text-slate-400 mb-0.5">Heures</label>
            <input id={id + '-hours'} type="text" inputMode="numeric" value={inputHours} aria-invalid={!Number.isInteger(hours) || hours < 0 || hours > 999}
              onFocus={e => e.currentTarget.select()} onChange={e => { setInputHours(e.target.value); setCopied(false); }} className={fieldClass} />
          </div>
          <div className="min-w-0">
            <label htmlFor={id + '-minutes'} className="block text-xs text-slate-400 mb-0.5">Minutes</label>
            <input id={id + '-minutes'} type="text" inputMode="numeric" value={inputMinutes} aria-invalid={!Number.isInteger(minutes) || minutes < 0 || minutes > 59}
              onFocus={e => e.currentTarget.select()} onChange={e => { setInputMinutes(e.target.value); setCopied(false); }} className={fieldClass} />
          </div>
        </div>
      ) : (
        <div>
          <label htmlFor={id + '-decimal'} className="block text-xs text-slate-400 mb-0.5">Heures au centième</label>
          <input id={id + '-decimal'} type="text" inputMode="decimal" value={inputDecimal} aria-invalid={decimal === null}
            onFocus={e => e.currentTarget.select()} onChange={e => { setInputDecimal(e.target.value); setCopied(false); }} className={fieldClass} />
        </div>
      )}
      {result === null && <p role="alert" className="text-xs text-rose-300 mt-1">{error}</p>}
      <div className="flex items-center justify-between gap-2 mt-2 px-2 py-1 rounded-lg bg-slate-950 border border-cyan-500/25">
        <div className="min-w-0" aria-live="polite">
          <span className="block text-[11px] text-slate-400">{activeTab === 'sexToCent' ? 'Centièmes' : 'Heures et minutes (arrondies)'}</span>
          <strong className="block text-xl sm:text-2xl font-mono-digits text-cyan-300 break-all">{result ?? '—'}</strong>
        </div>
        <button type="button" disabled={result === null} onClick={handleCopy} aria-label={copied ? 'Copié' : 'Copier le résultat'}
          className="shrink-0 flex items-center gap-1 rounded-md border border-slate-700 px-2 py-1 text-xs font-semibold text-slate-200 disabled:opacity-40">
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copié' : 'Copier'}
        </button>
      </div>
    </section>
  );
};
