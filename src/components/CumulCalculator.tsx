import React, { useState, useCallback } from 'react';
import { centesimalToSexagesimal } from '../utils/timeCalculations';
import { Plus, Trash2, Clock, Cpu, RotateCcw, Copy, Check, GripVertical, ArrowRight } from 'lucide-react';

type EntryUnit = 'c' | 'h';

interface CumulEntry {
  id: string;
  label: string;
  value: number;
  valueRaw: string;
  unit: EntryUnit;
}

function parseSexagesimalInput(raw: string): number | null {
  const cleaned = raw.trim().replace(',', '.');

  // Format "1:30" or "1:30:45"
  if (cleaned.includes(':')) {
    const parts = cleaned.split(':').map(Number);
    if (parts.some(isNaN)) return null;
    const [h, m, s = 0] = parts;
    return h + m / 60 + s / 3600;
  }

  // Format "1.50" or "1,50"
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

function formatSexagesimalDisplay(value: number): string {
  const totalSeconds = Math.round(value * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (s > 0) return `${h}h${String(m).padStart(2, '0')}m${String(s).padStart(2, '0')}s`;
  return `${h}h${String(m).padStart(2, '0')}m`;
}

export const CumulCalculator: React.FC = () => {
  const [entries, setEntries] = useState<CumulEntry[]>([
    { id: '1', label: 'Début de journée', value: 7.33, valueRaw: '7.33', unit: 'c' },
  ]);
  const [newLabel, setNewLabel] = useState<string>('');
  const [newValue, setNewValue] = useState<string>('');
  const [newUnit, setNewUnit] = useState<EntryUnit>('c');
  const [copied, setCopied] = useState<boolean>(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const totalCentesimal = entries.reduce((acc, e) => acc + e.value, 0);
  const totalSexagesimal = centesimalToSexagesimal(totalCentesimal);

  const handleAddEntry = () => {
    let parsedValue: number | null = null;

    if (newUnit === 'c') {
      parsedValue = parseFloat(newValue.replace(',', '.'));
      if (isNaN(parsedValue)) return;
    } else {
      parsedValue = parseSexagesimalInput(newValue);
      if (parsedValue === null) return;
    }

    const entry: CumulEntry = {
      id: String(Date.now()),
      label: newLabel.trim() || `Ajout #${entries.length + 1}`,
      value: parsedValue,
      valueRaw: newValue,
      unit: newUnit,
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
    setEntries(
      entries.map((e) =>
        e.id === id ? { ...e, valueRaw: raw } : e
      )
    );
  };

  const handleUpdateLabel = (id: string, label: string) => {
    setEntries(entries.map((e) => (e.id === id ? { ...e, label } : e)));
  };

  const handleUpdateUnit = (id: string, unit: EntryUnit) => {
    setEntries(
      entries.map((e) =>
        e.id === id ? { ...e, unit, valueRaw: '' } : e
      )
    );
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

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = useCallback((dropIndex: number) => {
    if (draggingIndex === null || draggingIndex === dropIndex) {
      setDraggingIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newEntries = [...entries];
    const [draggedEntry] = newEntries.splice(draggingIndex, 1);
    newEntries.splice(dropIndex, 0, draggedEntry);

    setEntries(newEntries);
    setDraggingIndex(null);
    setDragOverIndex(null);
  }, [draggingIndex, entries]);

  const handleDragEnd = () => {
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  // Running totals
  const runningTotals: number[] = [];
  let runningSum = 0;
  for (const entry of entries) {
    runningSum += entry.value;
    runningTotals.push(runningSum);
  }

  // Preview of what the new entry would equal
  const previewValue = (() => {
    if (!newValue) return null;
    if (newUnit === 'c') {
      const parsed = parseFloat(newValue.replace(',', '.'));
      if (isNaN(parsed)) return null;
      return parsed;
    } else {
      return parseSexagesimalInput(newValue);
    }
  })();

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
              Additionnez vos heures en centièmes ou en heures sexagésimales — total converti automatiquement
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

      {/* Unit legend */}
      <div className="flex flex-wrap items-center gap-3 mb-4 text-[11px]">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-semibold">
          <Cpu className="w-3 h-3" />
          <span>Centièmes : 1h = 100c (ex: 7.33 = 7h33c)</span>
        </span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 font-semibold">
          <Clock className="w-3 h-3" />
          <span>Heures : 1h = 60min (ex: 1:30 = 1h30m)</span>
        </span>
        <span className="text-slate-500 hidden sm:inline">• Glissez les blocs pour réordonner</span>
      </div>

      {/* Entries list */}
      {entries.length > 0 && (
        <div className="space-y-2.5 mb-6">
          {entries.map((entry, idx) => {
            const cumul = runningTotals[idx];
            const cumulSex = centesimalToSexagesimal(cumul);
            const isDragging = draggingIndex === idx;
            const isDragOver = dragOverIndex === idx && draggingIndex !== idx;

            return (
              <div
                key={entry.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={() => handleDrop(idx)}
                onDragEnd={handleDragEnd}
                className={`group p-3.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
                  isDragging
                    ? 'bg-slate-900/90 border-violet-500/50 shadow-lg shadow-violet-500/10 opacity-60'
                    : isDragOver
                    ? 'bg-slate-900/90 border-violet-400 border-dashed shadow-lg shadow-violet-400/10'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Drag handle + Row number */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex flex-col items-center gap-0.5 text-slate-500 group-hover:text-slate-300 transition-colors">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                  </div>

                  {/* Label input */}
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={entry.label}
                      onChange={(e) => handleUpdateLabel(entry.id, e.target.value)}
                      className="w-full bg-transparent border-b border-transparent hover:border-slate-700 focus:border-violet-500 text-sm text-slate-200 font-medium focus:outline-none py-0.5 transition-colors"
                      placeholder="Libellé..."
                    />
                  </div>

                  {/* Unit toggle */}
                  <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 shrink-0">
                    <button
                      onClick={() => handleUpdateUnit(entry.id, 'c')}
                      className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                        entry.unit === 'c'
                          ? 'bg-cyan-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Mode centièmes (1h = 100c)"
                    >
                      c
                    </button>
                    <button
                      onClick={() => handleUpdateUnit(entry.id, 'h')}
                      className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                        entry.unit === 'h'
                          ? 'bg-sky-500 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Mode heures sexagésimales (1h = 60min)"
                    >
                      h
                    </button>
                  </div>

                  {/* Value input */}
                  <div className="relative shrink-0">
                    <input
                      type="text"
                      value={entry.valueRaw}
                      onChange={(e) => handleUpdateValue(entry.id, e.target.value)}
                      className={`w-24 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-sm font-mono font-bold text-right focus:outline-none focus:border-cyan-500 ${
                        entry.unit === 'c' ? 'text-cyan-300' : 'text-sky-300'
                      }`}
                      placeholder={entry.unit === 'c' ? '7.33' : '1:30'}
                    />
                    <span className={`absolute right-2.5 top-1.5 text-[10px] font-mono font-bold ${
                      entry.unit === 'c' ? 'text-cyan-500' : 'text-sky-500'
                    }`}>
                      {entry.unit === 'c' ? 'c' : 'h'}
                    </span>
                  </div>

                  {/* Sexagesimal equivalent */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Clock className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span className="text-sm font-mono font-semibold text-white whitespace-nowrap">
                      {formatSexagesimalDisplay(entry.value)}
                    </span>
                  </div>

                  {/* Running total badge */}
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-[11px] font-mono text-violet-300 whitespace-nowrap shrink-0">
                    Σ {cumul.toFixed(2)}h
                    <span className="text-violet-500">
                      ({cumulSex.hours}h{String(cumulSex.minutes).padStart(2, '0')})
                    </span>
                  </span>

                  {/* Delete button */}
                  <button
                    onClick={() => handleRemoveEntry(entry.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                    title="Supprimer cette ligne"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Mobile running total + drag hint */}
                <div className="sm:hidden mt-2 flex items-center justify-between text-[11px] font-mono text-violet-300">
                  <span>Cumul : {cumul.toFixed(2)}h ({cumulSex.hours}h{String(cumulSex.minutes).padStart(2, '0')})</span>
                  <span className="text-slate-500 text-[10px]">Glissez pour réordonner</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-10 text-slate-500 text-sm">
          Aucune entrée. Ajoutez votre première heure ci-dessous.
        </div>
      )}

      {/* Add new entry form */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-dashed border-slate-700 hover:border-violet-500/40 transition-colors">
        <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-3">
          Ajouter une heure :
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
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Unit toggle */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setNewUnit('c')}
              className={`px-3 py-2 rounded-md text-xs font-bold transition-all ${
                newUnit === 'c'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Centièmes (1h = 100c)"
            >
              <Cpu className="w-3.5 h-3.5 inline mr-1" />
              Centièmes
            </button>
            <button
              onClick={() => setNewUnit('h')}
              className={`px-3 py-2 rounded-md text-xs font-bold transition-all ${
                newUnit === 'h'
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Heures sexagésimales (1h = 60min)"
            >
              <Clock className="w-3.5 h-3.5 inline mr-1" />
              Heures
            </button>
          </div>

          {/* Value */}
          <div className="w-full sm:w-36">
            <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
              {newUnit === 'c' ? 'Valeur centièmes' : 'Heures (sexagésimales)'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={newUnit === 'c' ? '7.33' : '1:30'}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-violet-500 pr-8"
              />
              <span className={`absolute right-2.5 top-2 text-xs font-mono font-bold ${
                newUnit === 'c' ? 'text-cyan-500' : 'text-sky-500'
              }`}>
                {newUnit === 'c' ? 'c' : 'h'}
              </span>
            </div>
          </div>

          {/* Preview */}
          {previewValue !== null && (
            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border whitespace-nowrap self-end ${
              newUnit === 'c'
                ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300'
                : 'bg-sky-500/10 border-sky-500/20 text-sky-300'
            }`}>
              <ArrowRight className="w-3.5 h-3.5" />
              <span className="font-mono font-semibold text-xs">
                = {formatSexagesimalDisplay(previewValue)}
              </span>
            </div>
          )}

          {/* Add button */}
          <button
            onClick={handleAddEntry}
            disabled={!newValue}
            className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md transition-all self-end"
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

            {/* Total sexagesimal */}
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
