import React, { useState, useCallback } from 'react';
import { centesimalToSexagesimal } from '../utils/timeCalculations';
import { Plus, Trash2, Clock, Cpu, RotateCcw, Copy, Check, GripVertical, ArrowRight, Flag, Timer, Coffee } from 'lucide-react';

type EntryUnit = 'c' | 'h';

interface CumulEntry {
  id: string;
  label: string;
  value: number; // centesimal hours (duration)
  valueRaw: string;
  unit: EntryUnit;
  isBreak?: boolean;
}

function parseTimeInput(raw: string): number | null {
  // Parses "7:30", "07:30", "7h30" into centesimal hours (e.g. 7.50)
  const cleaned = raw.trim().replace('h', ':').replace(',', ':');
  if (!cleaned || !cleaned.includes(':')) return null;
  const parts = cleaned.split(':').map(Number);
  if (parts.some(isNaN)) return null;
  const [h, m = 0] = parts;
  if (h < 0 || h > 24 || m < 0 || m >= 60) return null;
  return h + m / 60;
}

function parseDurationInput(raw: string, unit: EntryUnit): number | null {
  const cleaned = raw.trim().replace(',', '.');
  if (unit === 'c') {
    // centesimal: "7.33" = 7h33c
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }
  // sexagesimal: "1:30" = 1h30m, or "1.5" = 1h30m
  if (cleaned.includes(':')) {
    const parts = cleaned.split(':').map(Number);
    if (parts.some(isNaN)) return null;
    const [h, m = 0, s = 0] = parts;
    return h + m / 60 + s / 3600;
  }
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

function formatTimeOfDay(value: number): string {
  // value in centesimal hours (0-24) → "HH:MM"
  const totalMin = Math.round(value * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export const CumulCalculator: React.FC = () => {
  // === HEURE DE DÉPART (référence, NON additionnée) ===
  const [startTime, setStartTime] = useState<string>('07:30');
  const parsedStart = parseTimeInput(startTime);

  // === HEURE DE FIN (optionnelle, pour calculer la durée totale) ===
  const [endTime, setEndTime] = useState<string>('');
  const parsedEnd = parseTimeInput(endTime);

  // === DURÉES À AJOUTER / DÉDUIRE (pauses, heures supp...) ===
  const [entries, setEntries] = useState<CumulEntry[]>([]);
  const [newLabel, setNewLabel] = useState<string>('');
  const [newValue, setNewValue] = useState<string>('');
  const [newUnit, setNewUnit] = useState<EntryUnit>('h');
  const [newIsBreak, setNewIsBreak] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // === CALCULS ===
  // Durée totale de travail (centesimal hours) = (fin - début) si les deux sont renseignés
  // Sinon = 0 (seules les durées ajoutées comptent)
  const totalWorkHours = (() => {
    if (parsedStart === null || parsedEnd === null) return 0;
    let diff = parsedEnd - parsedStart;
    if (diff < 0) diff += 24; // passage minuit
    return diff;
  })();

  // Somme des durées "ajoutées" (non pauses)
  const addedDuration = entries
    .filter((e) => !e.isBreak)
    .reduce((acc, e) => acc + e.value, 0);

  // Somme des pauses à déduire
  const totalBreaks = entries
    .filter((e) => e.isBreak)
    .reduce((acc, e) => acc + e.value, 0);

  // Total final = durée (fin-début) + ajouts - pauses
  const totalCentesimal = Math.max(0, totalWorkHours + addedDuration - totalBreaks);
  const totalSexagesimal = centesimalToSexagesimal(totalCentesimal);

  // Heure de fin effective (si fin non renseignée, on calcule à partir du total)
  const effectiveEndTime = parsedEnd !== null ? parsedEnd : (parsedStart !== null ? parsedStart + totalCentesimal : 0);

  const handleAddEntry = () => {
    const parsedValue = parseDurationInput(newValue, newUnit);
    if (parsedValue === null) return;

    const entry: CumulEntry = {
      id: String(Date.now()),
      label: newLabel.trim() || (newIsBreak ? 'Pause' : `Ajout #${entries.length + 1}`),
      value: parsedValue,
      valueRaw: newValue,
      unit: newUnit,
      isBreak: newIsBreak,
    };

    setEntries([...entries, entry]);
    setNewLabel('');
    setNewValue('');
    setNewIsBreak(false);
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
    setEntries(entries.map((e) => (e.id === id ? { ...e, valueRaw: raw } : e)));
  };

  const handleUpdateLabel = (id: string, label: string) => {
    setEntries(entries.map((e) => (e.id === id ? { ...e, label } : e)));
  };

  const handleUpdateUnit = (id: string, unit: EntryUnit) => {
    setEntries(entries.map((e) => (e.id === id ? { ...e, unit, valueRaw: '' } : e)));
  };

  const handleToggleBreak = (id: string) => {
    setEntries(entries.map((e) => (e.id === id ? { ...e, isBreak: !e.isBreak } : e)));
  };

  const handleReset = () => {
    setEntries([]);
    setNewLabel('');
    setNewValue('');
    setNewIsBreak(false);
    setStartTime('07:30');
    setEndTime('');
  };

  const handleCopyTotal = () => {
    const lines = [
      `Journée : ${formatTimeOfDay(parsedStart || 0)} → ${endTime ? formatTimeOfDay(parsedEnd || 0) : 'en cours'}`,
    ];
    if (totalBreaks > 0) lines.push(`Pauses totales : ${totalBreaks.toFixed(2)}c = ${formatSexagesimalDisplay(totalBreaks)}`);
    lines.push(`TOTAL : ${totalCentesimal.toFixed(2)}h centésimal = ${totalSexagesimal.hours}h${String(totalSexagesimal.minutes).padStart(2, '0')}min`);
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Drag and drop
  const handleDragStart = (index: number) => setDraggingIndex(index);
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

  // Preview du champ en cours
  const previewValue = newValue ? parseDurationInput(newValue, newUnit) : null;

  return (
    <div className="w-full max-w-4xl mx-auto my-8 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/30 text-violet-400">
            <Timer className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Cumul de la journée
            </h2>
            <p className="text-xs text-slate-400">
              Référez votre heure de début, saisissez la fin (optionnel) et vos pauses — total converti automatiquement
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          disabled={entries.length === 0 && !endTime}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Réinitialiser</span>
        </button>
      </div>

      {/* === SECTION 1 : DÉBUT / FIN === */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950/20 border border-violet-500/30">
        <div className="flex items-center gap-2 mb-3">
          <Flag className="w-4 h-4 text-violet-400" />
          <span className="text-[11px] uppercase font-bold tracking-wider text-violet-300">
            Horaires de la journée
          </span>
          <span className="text-[10px] text-slate-500 ml-2">
            Le début sert de référence et n'est pas additionné
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Start time */}
          <div>
            <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
              🚀 Début de journée
            </label>
            <div className="relative">
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="07:30"
                className="w-full bg-slate-900 border border-violet-500/40 rounded-lg px-3 py-2.5 text-lg font-mono font-bold text-white text-center focus:outline-none focus:border-violet-400"
              />
              <span className="absolute right-3 top-2.5 text-xs font-mono text-violet-400">
                {parsedStart !== null ? `${parsedStart.toFixed(2)}h` : '?'}
              </span>
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden sm:flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-slate-500" />
          </div>
          <div className="sm:hidden flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-slate-500 rotate-90" />
          </div>

          {/* End time */}
          <div>
            <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
              🏁 Fin de journée (optionnel)
            </label>
            <div className="relative">
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="17:30"
                className="w-full bg-slate-900 border border-cyan-500/40 rounded-lg px-3 py-2.5 text-lg font-mono font-bold text-white text-center focus:outline-none focus:border-cyan-400"
              />
              <span className="absolute right-3 top-2.5 text-xs font-mono text-cyan-400">
                {parsedEnd !== null ? `${parsedEnd.toFixed(2)}h` : '?'}
              </span>
            </div>
          </div>
        </div>

        {parsedStart !== null && parsedEnd !== null && (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <span>⏱️ Durée brute de travail :</span>
            <span className="font-mono font-bold text-white">
              {formatSexagesimalDisplay(totalWorkHours)}
            </span>
            <span className="text-slate-600">=</span>
            <span className="font-mono font-bold text-cyan-300">
              {totalWorkHours.toFixed(2)}h
            </span>
          </div>
        )}
      </div>

      {/* Unit legend */}
      <div className="flex flex-wrap items-center gap-3 mb-4 text-[11px]">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-semibold">
          <Cpu className="w-3 h-3" />
          <span>Centièmes : 1h = 100c (ex: 0.33 = 33c)</span>
        </span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 font-semibold">
          <Clock className="w-3 h-3" />
          <span>Heures : 1h = 60min (ex: 1:30 = 1h30m)</span>
        </span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 font-semibold">
          <Coffee className="w-3 h-3" />
          <span>Les pauses sont déduites du total</span>
        </span>
      </div>

      {/* Entries list (pauses / ajouts) */}
      {entries.length > 0 && (
        <div className="space-y-2.5 mb-6">
          {entries.map((entry, idx) => {
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
                    : entry.isBreak
                    ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-400/50'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Drag handle + Row number */}
                  <div className="flex items-center gap-2 shrink-0">
                    <GripVertical className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                    <span
                      className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                        entry.isBreak
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {entry.isBreak ? <Coffee className="w-4 h-4" /> : idx + 1}
                    </span>
                  </div>

                  {/* Label input */}
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={entry.label}
                      onChange={(e) => handleUpdateLabel(entry.id, e.target.value)}
                      className="w-full bg-transparent border-b border-transparent hover:border-slate-700 focus:border-violet-500 text-sm text-slate-200 font-medium focus:outline-none py-0.5 transition-colors"
                      placeholder={entry.isBreak ? 'Pause déj...' : 'Libellé...'}
                    />
                  </div>

                  {/* Pause toggle */}
                  <button
                    onClick={() => handleToggleBreak(entry.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors shrink-0 border ${
                      entry.isBreak
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                    title="Marquer comme pause (déduite du total)"
                  >
                    <Coffee className="w-3 h-3" />
                    {entry.isBreak ? 'PAUSE' : 'Durée'}
                  </button>

                  {/* Unit toggle */}
                  <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 shrink-0">
                    <button
                      onClick={() => handleUpdateUnit(entry.id, 'c')}
                      className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                        entry.unit === 'c'
                          ? 'bg-cyan-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
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
                      className={`w-24 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-sm font-mono font-bold text-right focus:outline-none ${
                        entry.isBreak
                          ? 'focus:border-rose-500 text-rose-300'
                          : entry.unit === 'c'
                          ? 'focus:border-cyan-500 text-cyan-300'
                          : 'focus:border-sky-500 text-sky-300'
                      }`}
                      placeholder={entry.unit === 'c' ? '0.33' : '0:30'}
                    />
                    <span
                      className={`absolute right-2.5 top-1.5 text-[10px] font-mono font-bold ${
                        entry.isBreak
                          ? 'text-rose-500'
                          : entry.unit === 'c'
                          ? 'text-cyan-500'
                          : 'text-sky-500'
                      }`}
                    >
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

                  {/* Delete button */}
                  <button
                    onClick={() => handleRemoveEntry(entry.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                    title="Supprimer cette ligne"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-6 text-slate-500 text-sm mb-4">
          📝 Aucune pause ni durée supplémentaire. Ajoutez-les ci-dessous (ex : pause déjeuner, heures sup).
        </div>
      )}

      {/* Add new entry form */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-dashed border-slate-700 hover:border-violet-500/40 transition-colors">
        <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-3">
          Ajouter une durée ou une pause
        </span>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          {/* Type toggle: Duration vs Break */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setNewIsBreak(false)}
              className={`px-3 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                !newIsBreak
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Durée
            </button>
            <button
              onClick={() => setNewIsBreak(true)}
              className={`px-3 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                newIsBreak
                  ? 'bg-rose-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              Pause
            </button>
          </div>

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
              placeholder={newIsBreak ? 'Ex: Pause déj...' : 'Ex: Réunion, H supp...'}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Unit toggle */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
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
              h
            </button>
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
              c
            </button>
          </div>

          {/* Value */}
          <div className="w-full sm:w-32">
            <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
              {newIsBreak ? 'Durée de pause' : 'Durée'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={newUnit === 'c' ? '0.33' : '0:30'}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-violet-500 pr-8"
              />
              <span className={`absolute right-2.5 top-2 text-xs font-mono font-bold ${
                newIsBreak ? 'text-rose-500' : newUnit === 'c' ? 'text-cyan-500' : 'text-sky-500'
              }`}>
                {newUnit === 'c' ? 'c' : 'h'}
              </span>
            </div>
          </div>

          {/* Preview */}
          {previewValue !== null && (
            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border whitespace-nowrap self-end ${
              newIsBreak
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                : newUnit === 'c'
                ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300'
                : 'bg-sky-500/10 border-sky-500/20 text-sky-300'
            }`}>
              <ArrowRight className="w-3.5 h-3.5" />
              <span className="font-mono font-semibold text-xs">
                {newIsBreak ? '− ' : '+ '}
                {formatSexagesimalDisplay(previewValue)}
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
      <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950/30 border border-violet-500/30 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-center">
          {/* Duration of work */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-violet-500/20 text-violet-400">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-violet-300 block">
                {parsedEnd !== null ? 'Durée (fin − début)' : 'Total (sans fin)'}
              </span>
              <p className="text-2xl font-extrabold font-mono text-white">
                {formatSexagesimalDisplay(totalCentesimal)}
              </p>
              {parsedEnd !== null && (
                <p className="text-[11px] text-slate-500">
                  {formatTimeOfDay(parsedStart || 0)} → {formatTimeOfDay(effectiveEndTime)}
                </p>
              )}
            </div>
          </div>

          {/* Breaks */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-rose-300 block">
                Pauses déduites
              </span>
              <p className="text-2xl font-extrabold font-mono text-rose-300">
                {totalBreaks > 0 ? '−' : ''}{totalBreaks.toFixed(2)}
                <span className="text-sm text-rose-500 font-bold ml-1">h</span>
              </p>
              {totalBreaks > 0 && (
                <p className="text-[11px] text-slate-500">
                  = {formatSexagesimalDisplay(totalBreaks)}
                </p>
              )}
            </div>
          </div>

          {/* Total centésimal */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-cyan-300 block">
                TOTAL en Centièmes
              </span>
              <p className="text-3xl font-extrabold font-mono text-cyan-300">
                {totalCentesimal.toFixed(2)}
                <span className="text-lg text-cyan-500 font-bold ml-1">h</span>
              </p>
            </div>
          </div>

          {/* Total sexagesimal */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-sky-500/20 text-sky-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-sky-300 block">
                TOTAL en H & Min
              </span>
              <p className="text-3xl font-extrabold font-mono text-white">
                {totalSexagesimal.hours}h{String(totalSexagesimal.minutes).padStart(2, '0')}
              </p>
            </div>
          </div>
        </div>

        {/* Entries count & copy */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            {entries.length > 0
              ? `${entries.length} ligne${entries.length > 1 ? 's' : ''} (dont ${entries.filter((e) => e.isBreak).length} pause${entries.filter((e) => e.isBreak).length > 1 ? 's' : ''})`
              : 'Aucune pause ni durée supplémentaire'}
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
                <span>Copier le récapitulatif</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
