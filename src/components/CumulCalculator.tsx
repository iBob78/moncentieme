import React, { useState } from 'react';
import { centesimalToSexagesimal } from '../utils/timeCalculations';
import { Plus, Trash2, Clock, Cpu, RotateCcw, Copy, Check } from 'lucide-react';

interface CumulEntry {
  id: string;
  label: string;
  value: number;
  valueRaw: string;
}

export const CumulCalculator: React.FC = () => {
  const [entries, setEntries] = useState<CumulEntry[]>([
    { id: '1', label: 'Début de journée', value: 7.33, valueRaw: '7.33' },
  ]);
  const [newLabel, setNewLabel] = useState<string>('');
  const [newValue, setNewValue] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Total cumulé
  const totalCentesimal = entries.reduce((acc, e) => acc + e.value, 0);
  const totalSexagesimal = centesimalToSexagesimal(totalCentesimal);

  const handleAddEntry = () => {
    const parsed = parseFloat(newValue.replace(',', '.'));
    if (isNaN(parsed)) return;

    const entry: CumulEntry = {
      id: String(Date.now()),
      label: newLabel.trim() || `Ajout #${entries.length + 1}`,
      value: parsed,
      valueRaw: newValue,
    };

    setEntries([...entries, entry]);
    setNewLabel('');
    setNewValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEntry();
    }
  };

  const handleRemoveEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  const handleUpdateValue = (id: string, raw: string) => {
    const parsed = parseFloat(raw.replace(',', '.'));
    setEntries(
      entries.map((e) =>
        e.id === id
          ? { ...e, valueRaw: raw, value: isNaN(parsed) ? 0 : parsed }
          : e
      )
    );
  };

  const handleUpdateLabel = (id: string, label: string) => {
    setEntries(entries.map((e) => (e.id === id ? { ...e, label } : e)));
  };

  const handleReset = () => {
    setEntries([]);
    setNewLabel('');
    setNewValue('');
  };

  const handleCopyTotal = () => {
    const text = `Total : ${totalCentesimal.toFixed(2)}h centésimal = ${totalSexagesimal.hours}h${String(totalSexagesimal.minutes).padStart(2, '0')}min`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Sous-totaux partiels pour afficher le cumul progressif
  const runningTotals: number[] = [];
  let runningSum = 0;
  for (const entry of entries) {
    runningSum += entry.value;
    runningTotals.push(runningSum);
  }

  return (
    <div className="w-full max-w-4xl mx-auto my-8 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/30 text-violet-400">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Cumul de la journée
            </h2>
            <p className="text-xs text-slate-400">
              Additionnez vos heures en centièmes au fur et à mesure — total converti en temps classique
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          disabled={entries.length === 0}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Réinitialiser</span>
        </button>
      </div>

      {/* Entries list */}
      {entries.length > 0 && (
        <div className="space-y-2.5 mb-6">
          {entries.map((entry, idx) => {
            const sex = centesimalToSexagesimal(entry.value);
            const cumul = runningTotals[idx];
            const cumulSex = centesimalToSexagesimal(cumul);

            return (
              <div
                key={entry.id}
                className="group p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: label + value */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Row number */}
                    <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>

                    {/* Label input */}
                    <input
                      type="text"
                      value={entry.label}
                      onChange={(e) => handleUpdateLabel(entry.id, e.target.value)}
                      className="flex-1 min-w-0 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-sky-500 text-sm text-slate-200 font-medium focus:outline-none py-0.5 transition-colors"
                      placeholder="Libellé..."
                    />
                  </div>

                  {/* Center: value + conversion */}
                  <div className="flex items-center gap-4">
                    {/* Centesimal value (editable) */}
                    <div className="flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                      <input
                        type="text"
                        value={entry.valueRaw}
                        onChange={(e) => handleUpdateValue(entry.id, e.target.value)}
                        className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-sm font-mono font-bold text-cyan-300 text-right focus:outline-none focus:border-cyan-500"
                      />
                      <span className="text-xs text-cyan-500 font-mono font-bold">h</span>
                    </div>

                    {/* Arrow */}
                    <span className="text-slate-600 text-xs">=</span>

                    {/* Sexagesimal equivalent */}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      <span className="text-sm font-mono font-semibold text-white whitespace-nowrap">
                        {sex.hours}h{String(sex.minutes).padStart(2, '0')}
                        {sex.seconds > 0 && (
                          <span className="text-slate-400 text-xs">:{String(sex.seconds).padStart(2, '0')}</span>
                        )}
                      </span>
                    </div>

                    {/* Running total badge */}
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-[11px] font-mono text-violet-300 whitespace-nowrap">
                      Σ {cumul.toFixed(2)}h
                      <span className="text-violet-500">
                        ({cumulSex.hours}h{String(cumulSex.minutes).padStart(2, '0')})
                      </span>
                    </span>

                    {/* Delete button */}
                    <button
                      onClick={() => handleRemoveEntry(entry.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                      title="Supprimer cette ligne"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Mobile running total */}
                <div className="sm:hidden mt-2 text-[11px] font-mono text-violet-300">
                  Cumul : {cumul.toFixed(2)}h centésimal = {cumulSex.hours}h{String(cumulSex.minutes).padStart(2, '0')}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-10 text-slate-500 text-sm">
          Aucune entrée. Ajoutez votre première heure en centièmes ci-dessous.
        </div>
      )}

      {/* Add new entry form */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-dashed border-slate-700 hover:border-cyan-500/40 transition-colors">
        <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-3">
          Ajouter une heure en centièmes :
        </span>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          {/* Label */}
          <div className="flex-1">
            <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
              Libellé (optionnel)
            </label>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex: Matin, Pause, Réunion..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Value */}
          <div className="w-full sm:w-36">
            <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
              Heures en centièmes
            </label>
            <div className="relative">
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ex: 7.33"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-500 pr-8"
              />
              <span className="absolute right-2.5 top-2 text-xs text-slate-500 font-mono">h</span>
            </div>
          </div>

          {/* Preview of what it equals */}
          {newValue && !isNaN(parseFloat(newValue.replace(',', '.'))) && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 self-end whitespace-nowrap">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-mono font-semibold">
                = {centesimalToSexagesimal(parseFloat(newValue.replace(',', '.'))).hours}h
                {String(centesimalToSexagesimal(parseFloat(newValue.replace(',', '.'))).minutes).padStart(2, '0')}
              </span>
            </div>
          )}

          {/* Add button */}
          <button
            onClick={handleAddEntry}
            disabled={!newValue || isNaN(parseFloat(newValue.replace(',', '.')))}
            className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md transition-all self-end"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter</span>
          </button>
        </div>
      </div>

      {/* TOTAL BANNER */}
      {entries.length > 0 && (
        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950/30 border border-violet-500/30 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
            {/* Total centésimal */}
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold text-cyan-300 block">
                  Total en Centièmes
                </span>
                <p className="text-3xl font-extrabold font-mono text-cyan-300">
                  {totalCentesimal.toFixed(2)}
                  <span className="text-lg text-cyan-500 font-bold ml-1">h</span>
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <div className="px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold">
                =
              </div>
            </div>

            {/* Total sexagésimal */}
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-sky-500/20 text-sky-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold text-sky-300 block">
                  Total en Heures & Minutes
                </span>
                <p className="text-3xl font-extrabold font-mono text-white">
                  {totalSexagesimal.hours}h{String(totalSexagesimal.minutes).padStart(2, '0')}
                  {totalSexagesimal.seconds > 0 && (
                    <span className="text-xl text-slate-400 ml-1">
                      {String(totalSexagesimal.seconds).padStart(2, '0')}s
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Entries count & copy */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-400">
              {entries.length} entrée{entries.length > 1 ? 's' : ''} cumulée{entries.length > 1 ? 's' : ''}
            </span>

            <button
              onClick={handleCopyTotal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Copier le total</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
