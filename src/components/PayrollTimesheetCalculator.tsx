import React, { useState } from 'react';
import { WorkPeriod } from '../types/clock';
import { calculateDuration } from '../utils/timeCalculations';
import { Briefcase, Plus, Trash2, Copy, Check, DollarSign, Clock } from 'lucide-react';

export const PayrollTimesheetCalculator: React.FC = () => {
  const [periods, setPeriods] = useState<WorkPeriod[]>([
    { id: '1', label: 'Matinée', start: '08:30', end: '12:00' },
    { id: '2', label: 'Après-midi', start: '13:00', end: '17:15' },
  ]);

  const [hourlyRate, setHourlyRate] = useState<string>('25.00');
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Compute durations
  const calculations = periods.map((p) => ({
    ...p,
    result: calculateDuration(p.start, p.end),
  }));

  const totalMinutes = calculations.reduce((acc, curr) => acc + curr.result.minutesTotal, 0);
  const totalHoursNormal = Math.floor(totalMinutes / 60);
  const totalRemainingMinutes = totalMinutes % 60;

  const totalCentesimalHours = calculations.reduce(
    (acc, curr) => acc + curr.result.centesimalHours,
    0
  );

  const rateNum = parseFloat(hourlyRate.replace(',', '.')) || 0;
  const totalEarnings = totalCentesimalHours * rateNum;

  const handleAddPeriod = () => {
    const newId = String(Date.now());
    setPeriods([
      ...periods,
      { id: newId, label: `Session ${periods.length + 1}`, start: '09:00', end: '12:00' },
    ]);
  };

  const handleRemovePeriod = (id: string) => {
    if (periods.length <= 1) return;
    setPeriods(periods.filter((p) => p.id !== id));
  };

  const handleUpdate = (id: string, field: 'label' | 'start' | 'end', val: string) => {
    setPeriods(periods.map((p) => (p.id === id ? { ...p, [field]: val } : p)));
  };

  const copySummary = () => {
    const text = `Relevé d'heures :
${calculations
  .map(
    (c) =>
      `• ${c.label} (${c.start} - ${c.end}) : ${c.result.hours}h${String(c.result.minutes).padStart(2, '0')} = ${c.result.centesimalHours.toFixed(2)}h centièmes`
  )
  .join('\n')}
Total : ${totalHoursNormal}h${String(totalRemainingMinutes).padStart(2, '0')} (${totalCentesimalHours.toFixed(2)} heures industrielles)
${rateNum > 0 ? `Montant total (${rateNum} €/h) : ${totalEarnings.toFixed(2)} €` : ''}`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Calculateur de Pointage & Fiche de Paie (RH)
            </h2>
            <p className="text-xs text-slate-400">
              Calculez vos heures travaillées en centièmes pour votre logiciel de paie (SAP, Cegid, Sage, Lucca)
            </p>
          </div>
        </div>

        <button
          onClick={handleAddPeriod}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold border border-slate-700 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une plage</span>
        </button>
      </div>

      {/* Input periods table */}
      <div className="space-y-3">
        {calculations.map((period) => (
          <div
            key={period.id}
            className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            {/* Label */}
            <div className="w-full sm:w-1/4">
              <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                Période
              </label>
              <input
                type="text"
                value={period.label}
                onChange={(e) => handleUpdate(period.id, 'label', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Start & End time */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                  Début
                </label>
                <input
                  type="time"
                  value={period.start}
                  onChange={(e) => handleUpdate(period.id, 'start', e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <span className="text-slate-500 mt-4">➔</span>

              <div>
                <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                  Fin
                </label>
                <input
                  type="time"
                  value={period.end}
                  onChange={(e) => handleUpdate(period.id, 'end', e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Calculated Result for Period */}
            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-mono">
                  {period.result.hours}h {String(period.result.minutes).padStart(2, '0')}m
                </span>
                <span className="text-sm font-bold font-mono text-cyan-400">
                  {period.result.centesimalHours.toFixed(2)} h
                </span>
              </div>

              {periods.length > 1 && (
                <button
                  onClick={() => handleRemovePeriod(period.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Supprimer la plage"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Totals & Hourly Rate banner */}
      <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Normal Total */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-slate-800/80 text-sky-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-semibold text-slate-400">
                Temps Total Classique
              </span>
              <p className="text-2xl font-extrabold font-mono text-white">
                {totalHoursNormal}h {String(totalRemainingMinutes).padStart(2, '0')}m
              </p>
              <span className="text-[11px] text-slate-500 font-mono">
                {totalMinutes} minutes
              </span>
            </div>
          </div>

          {/* Centesimal Total (For Payroll) */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
            <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-cyan-300">
                Total en Centièmes (Paie)
              </span>
              <p className="text-3xl font-extrabold font-mono text-cyan-300">
                {totalCentesimalHours.toFixed(2)}
                <span className="text-lg text-cyan-500 font-bold ml-1">h</span>
              </p>
              <span className="text-[11px] text-cyan-400/70 font-mono">
                À saisir dans le logiciel RH
              </span>
            </div>
          </div>

          {/* Hourly Rate & Gross Cost */}
          <div className="flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Taux horaire (€/h) :
              </span>
              <input
                type="text"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-20 bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs text-right font-mono text-white"
              />
            </div>
            <div className="text-right mt-1">
              <span className="text-[10px] text-slate-500 uppercase">Rémunération Brute Estimée</span>
              <p className="text-2xl font-bold font-mono text-emerald-400">
                {totalEarnings.toFixed(2)} €
              </p>
            </div>
          </div>
        </div>

        {/* Copy summary button */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex justify-end">
          <button
            onClick={copySummary}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            {copiedSummary ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Récapitulatif copié !</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copier le récapitulatif</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
