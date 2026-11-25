import React, { useState, useCallback } from 'react';
import { centesimalToSexagesimal, parseTimeOfDay, parseDurationInput, calculateNetHours, parseCumulStartTime, formatCumulStartTime, calculateCumulWorkHours, calculateEntryEnd } from '../utils/timeCalculations';
import { Plus, Trash2, Clock, Cpu, RotateCcw, Copy, Check, GripVertical, ArrowRight, Flag, Timer, Coffee } from 'lucide-react';

type EntryUnit = 'c' | 'h';

interface CumulEntry {
  id: string;
  label: string;
  value: number; // centesimal hours (duration)
  valueRaw: string;
  unit: EntryUnit;
  isBreak?: boolean;
  startRaw: string;
  startUnit: EntryUnit;
}

function EntrySchedule({ id, raw, unit, duration, onChange }: {
  id: string;
  raw: string;
  unit: EntryUnit;
  duration: number | null;
  onChange: (raw: string, unit: EntryUnit) => void;
}) {
  const start = parseCumulStartTime(raw, unit);
  const invalid = raw.trim() !== '' && start === null;
  const end = start !== null && duration !== null ? calculateEntryEnd(start, duration) : null;
  const changeUnit = (next: EntryUnit) => {
    if (next !== unit) onChange(start === null ? '' : formatCumulStartTime(start, next), next);
  };
  return (
    <div className="mt-3 rounded-xl border border-violet-500/25 bg-slate-900/70 p-3">
      <label htmlFor={id} className="block text-xs font-semibold text-violet-300 mb-2">Heure de début de cette activité (facultatif)</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
        <div className="min-w-0">
          <div role="group" aria-label="Format du début de cette activité" className="flex gap-1 rounded-lg bg-slate-950 p-1 mb-2">
            <button type="button" aria-pressed={unit === 'h'} onClick={() => changeUnit('h')} className={`flex-1 rounded-md px-2 py-2 text-xs font-semibold ${unit === 'h' ? 'bg-sky-500 text-slate-950' : 'text-slate-300'}`}>Heure normale</button>
            <button type="button" aria-pressed={unit === 'c'} onClick={() => changeUnit('c')} className={`flex-1 rounded-md px-2 py-2 text-xs font-semibold ${unit === 'c' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300'}`}>Centième</button>
          </div>
          <input id={id} type="text" value={raw} inputMode={unit === 'c' ? 'decimal' : 'text'} placeholder={unit === 'h' ? 'Ex. 07:30' : 'Ex. 7,50'} aria-invalid={invalid} aria-describedby={id + '-equivalent'} onChange={e => onChange(e.target.value, unit)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-base font-mono text-white focus:outline-none focus:border-violet-400" />
          <p id={id + '-equivalent'} className={`mt-1 text-xs ${invalid ? 'text-rose-300' : 'text-slate-400'}`} aria-live="polite">
            {invalid ? 'Horaire invalide (entre 00:00 et 24:00).' : start !== null ? `= ${formatCumulStartTime(start, unit === 'h' ? 'c' : 'h')}${unit === 'h' ? ' h décimales' : ''}` : 'Renseignez le départ de cette activité.'}
          </p>
        </div>
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/20 px-3 py-2" aria-live="polite">
          <span className="block text-xs font-semibold text-cyan-300">Heure de fin calculée</span>
          {end ? <>
            <span className="block text-xl font-mono font-bold text-white">{formatCumulStartTime(end.seconds, 'h')}{end.daysLater > 0 && <span className="ml-1 text-xs text-amber-300">J+{end.daysLater}</span>}</span>
            <span className="block text-xs text-cyan-300">{formatCumulStartTime(end.seconds, 'c')} h décimales</span>
          </> : <span className="block text-sm text-slate-400">—</span>}
        </div>
      </div>
    </div>
  );
}

function parseTimeInput(raw: string): number | null {
  const minutes = parseTimeOfDay(raw);
  return minutes === null ? null : minutes / 60;
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
  return formatCumulStartTime(Math.round(value * 3600), 'h');
}

export const CumulCalculator: React.FC<{ allowDrag?: boolean }> = ({ allowDrag = true }) => {
  // === HEURE DE DÉPART (référence, NON additionnée) ===
  const [startTime, setStartTime] = useState<string>('07:30');
  const [startUnit, setStartUnit] = useState<EntryUnit>('h');
  const startSeconds = parseCumulStartTime(startTime, startUnit);
  const parsedStart = startSeconds === null ? null : startSeconds / 3600;

  const handleStartUnitChange = (unit: EntryUnit) => {
    if (unit === startUnit) return;
    setStartTime(startSeconds === null ? '' : formatCumulStartTime(startSeconds, unit));
    setStartUnit(unit);
  };

  // === HEURE DE FIN (optionnelle, pour calculer la durée totale) ===
  const [endTime, setEndTime] = useState<string>('');
  const parsedEnd = parseTimeInput(endTime);

  // === DURÉES À AJOUTER / DÉDUIRE (pauses, heures supp...) ===
  const [entries, setEntries] = useState<CumulEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editingDay, setEditingDay] = useState(false);
  const [newLabel, setNewLabel] = useState<string>('');
  const [newValue, setNewValue] = useState<string>('');
  const [newUnit, setNewUnit] = useState<EntryUnit>('h');
  const [newIsBreak, setNewIsBreak] = useState<boolean>(false);
  const [newStartRaw, setNewStartRaw] = useState('');
  const [newStartUnit, setNewStartUnit] = useState<EntryUnit>('h');
  const invalidNewStart = newStartRaw.trim() !== '' && parseCumulStartTime(newStartRaw, newStartUnit) === null;
  const [copied, setCopied] = useState<boolean>(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // === CALCULS ===
  // Durée totale de travail (centesimal hours) = (fin - début) si les deux sont renseignés
  // Sinon = 0 (seules les durées ajoutées comptent)
  const totalWorkHours = calculateCumulWorkHours(startSeconds, parseTimeOfDay(endTime));

  // Somme des durées "ajoutées" (non pauses)
  const addedDuration = entries
    .filter((e) => !e.isBreak)
    .reduce((acc, e) => acc + e.value, 0);

  // Somme des pauses à déduire
  const totalBreaks = entries
    .filter((e) => e.isBreak)
    .reduce((acc, e) => acc + e.value, 0);

  // Total final = durée (fin-début) + ajouts - pauses
  const totalCentesimal = calculateNetHours(totalWorkHours, [addedDuration], [totalBreaks]);
  const invalidTotal = parsedStart === null || (endTime.trim() !== '' && parsedEnd === null) || entries.some(e => parseDurationInput(e.valueRaw, e.unit) === null);
  const totalSexagesimal = centesimalToSexagesimal(totalCentesimal);

  // Heure de fin effective (si fin non renseignée, on calcule à partir du total)
  const effectiveEndTime = parsedEnd !== null ? parsedEnd : (parsedStart !== null ? parsedStart + totalCentesimal : 0);

  const handleAddEntry = () => {
    const parsedValue = parseDurationInput(newValue, newUnit);
    if (parsedValue === null || invalidNewStart) return;

    const entry: CumulEntry = {
      id: String(Date.now()),
      label: newLabel.trim() || (newIsBreak ? 'Pause' : `Ajout #${entries.length + 1}`),
      value: parsedValue,
      valueRaw: newValue,
      unit: newUnit,
      isBreak: newIsBreak,
      startRaw: newStartRaw,
      startUnit: newStartUnit,
    };

    setEntries([...entries, entry]);
    setAdding(false);
    setNewLabel('');
    setNewValue('');
    setNewIsBreak(false);
    setNewStartRaw('');
    setNewStartUnit('h');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEntry();
    }
  };

  const handleRemoveEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleUpdateValue = (id: string, raw: string) => {
    setEntries(entries.map((e) => (e.id === id ? { ...e, valueRaw: raw, value: parseDurationInput(raw, e.unit) ?? 0 } : e)));
  };

  const handleUpdateSchedule = (id: string, startRaw: string, startUnit: EntryUnit) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, startRaw, startUnit } : e));
  };

  const handleUpdateLabel = (id: string, label: string) => {
    setEntries(entries.map((e) => (e.id === id ? { ...e, label } : e)));
  };

  const handleUpdateUnit = (id: string, unit: EntryUnit) => {
    setEntries(entries.map((e) => (e.id === id ? { ...e, unit, valueRaw: parseDurationInput(e.valueRaw, e.unit) === null ? '' : String(e.value) } : e)));
  };

  const handleToggleBreak = (id: string) => {
    setEntries(entries.map((e) => (e.id === id ? { ...e, isBreak: !e.isBreak } : e)));
  };

  const handleReset = () => {
    setEntries([]);
    setEditingId(null);
    setAdding(false);
    setEditingDay(false);
    setNewLabel('');
    setNewValue('');
    setNewIsBreak(false);
    setNewStartRaw('');
    setNewStartUnit('h');
    setStartTime('07:30');
    setStartUnit('h');
    setEndTime('');
  };

  const handleCopyTotal = () => {
    if (invalidTotal) return;
    const lines = [
      `Journée : ${formatTimeOfDay(parsedStart || 0)} → ${endTime ? formatTimeOfDay(parsedEnd || 0) : 'en cours'}`,
    ];
    for (const entry of entries) {
      const start = parseCumulStartTime(entry.startRaw, entry.startUnit);
      const end = start === null ? null : calculateEntryEnd(start, entry.value);
      const schedule = start !== null && end ? ` | ${formatCumulStartTime(start, 'h')} → ${formatCumulStartTime(end.seconds, 'h')}${end.daysLater ? ' (J+' + end.daysLater + ')' : ''}` : entry.startRaw.trim() ? ' | départ invalide' : '';
      lines.push(`${entry.isBreak ? 'Pause' : 'Activité'} : ${entry.label} — ${formatSexagesimalDisplay(entry.value)}${schedule}`);
    }
    if (totalBreaks > 0) lines.push(`Pauses totales : ${totalBreaks.toFixed(2)}c = ${formatSexagesimalDisplay(totalBreaks)}`);
    lines.push(`TOTAL : ${totalCentesimal.toFixed(2)}h centésimal = ${formatSexagesimalDisplay(totalCentesimal)}`);
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Accessible reordering works with touch, keyboard and mouse.
  const moveEntry = (index: number, direction: -1 | 1) => {
    setEntries(prev => {
      const next = index + direction;
      if (index < 0 || index >= prev.length || next < 0 || next >= prev.length) return prev;
      const reordered = [...prev];
      [reordered[index], reordered[next]] = [reordered[next], reordered[index]];
      return reordered;
    });
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
    <div className="cumul-panel tool-panel w-full max-w-4xl mx-auto my-3 sm:my-8 p-3 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="cumul-heading flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/30 text-violet-400">
            <Timer className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Cumul de la journée
            </h2>
            <p className="cumul-intro text-xs text-slate-400">Durées, pauses et horaires.</p>
          </div>
        </div>

        <button
          onClick={handleReset}
          disabled={entries.length === 0 && !endTime && startUnit === 'h' && startTime === '07:30' && !newValue && !newLabel && !newIsBreak && !newStartRaw && newStartUnit === 'h'}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Réinitialiser</span>
        </button>
      </div>

      {/* === SECTION 1 : DÉBUT / FIN === */}
      <div className="cumul-day mb-3 p-2 sm:p-4 rounded-xl bg-slate-950/70 border border-violet-500/30">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="block text-[11px] font-semibold text-violet-300">Horaires de la journée</span>
            <span className="text-sm font-mono font-semibold text-white">{startSeconds === null ? 'Début invalide' : formatCumulStartTime(startSeconds, 'h')} → {parsedEnd !== null ? formatTimeOfDay(parsedEnd) : endTime.trim() ? 'Fin invalide' : '—'}</span>
          </div>
          <button type="button" aria-expanded={editingDay} aria-controls="cumul-day-fields" onClick={() => setEditingDay(v => !v)} className="shrink-0 rounded-lg border border-slate-700 px-3 text-xs text-violet-300">{editingDay ? 'Terminer' : 'Modifier'}</button>
        </div>
        <div id="cumul-day-fields" hidden={!editingDay} className="mt-3">
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
            <label htmlFor="cumul-start-time" className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
              🚀 Début de journée
            </label>
            <div role="group" aria-label="Unité de l'heure de début" className="flex gap-1 bg-slate-950 rounded-lg p-1 mb-2 border border-slate-800">
              <button type="button" aria-pressed={startUnit === 'h'} onClick={() => handleStartUnitChange('h')}
                className={`flex-1 rounded-md py-1.5 px-1 text-xs font-semibold ${startUnit === 'h' ? 'bg-sky-500 text-slate-950' : 'text-slate-300 hover:text-white'}`}>Heure normale</button>
              <button type="button" aria-pressed={startUnit === 'c'} onClick={() => handleStartUnitChange('c')}
                className={`flex-1 rounded-md py-1.5 px-1 text-xs font-semibold ${startUnit === 'c' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:text-white'}`}>Centième</button>
            </div>
            <input
              id="cumul-start-time"
              type="text"
              inputMode={startUnit === 'c' ? 'decimal' : 'text'}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              placeholder={startUnit === 'h' ? '07:30' : '7,50'}
              aria-invalid={startSeconds === null}
              aria-describedby="cumul-start-equivalence"
              className="w-full bg-slate-900 border border-violet-500/40 rounded-lg px-3 py-2.5 text-lg font-mono font-bold text-white text-center focus:outline-none focus:border-violet-400"
            />
            <p id="cumul-start-equivalence" className={`mt-1 text-xs ${startSeconds === null ? 'text-rose-300' : 'text-violet-300'}`} aria-live="polite">
              {startSeconds === null
                ? (startUnit === 'h' ? 'Ex. 07:30 ou 07:19:48 (de 00:00 à 24:00).' : 'Ex. 7,50 ou 7.50 (de 0 à 24).')
                : (startUnit === 'h'
                  ? `≈ ${formatCumulStartTime(startSeconds, 'c')} h décimales`
                  : `= ${formatCumulStartTime(startSeconds, 'h')} en heure normale`)}
            </p>
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

      </div>
      {/* Unit legend */}
      <div className="cumul-legend flex flex-wrap items-center gap-3 mb-4 text-[11px]">
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
        <div className="space-y-1.5 mb-3">
          {entries.map((entry, idx) => {
            const isDragging = draggingIndex === idx;
            const isDragOver = dragOverIndex === idx && draggingIndex !== idx;
            const editing = editingId === entry.id;
            const validDuration = parseDurationInput(entry.valueRaw, entry.unit);
            const entryStart = parseCumulStartTime(entry.startRaw, entry.startUnit);
            const entryEnd = entryStart !== null && validDuration !== null ? calculateEntryEnd(entryStart, validDuration) : null;

            return (
              <div
                key={entry.id}
                draggable={allowDrag && !editing}
                onDragStart={() => { if (allowDrag) handleDragStart(idx); }}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={() => handleDrop(idx)}
                onDragEnd={handleDragEnd}
                className={`group p-2 rounded-xl border transition-all ${allowDrag && !editing ? 'cursor-grab active:cursor-grabbing' : ''} ${
                  isDragging
                    ? 'bg-slate-900/90 border-violet-500/50 shadow-lg shadow-violet-500/10 opacity-60'
                    : isDragOver
                    ? 'bg-slate-900/90 border-violet-400 border-dashed shadow-lg shadow-violet-400/10'
                    : entry.isBreak
                    ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-400/50'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="entry-summary flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white break-all">{entry.label || 'Sans libellé'}</span>
                      {entry.isBreak && <span className="text-xs text-rose-300">Pause</span>}
                      <span className={`text-xs font-mono font-semibold ${entry.isBreak ? 'text-rose-300' : 'text-cyan-300'}`}>{validDuration === null ? 'Durée invalide' : `${entry.isBreak ? '−' : ''}${entry.value.toFixed(2).replace('.', ',')} h · ${formatSexagesimalDisplay(entry.value)}`}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{entryStart !== null && entryEnd ? <>{formatCumulStartTime(entryStart, 'h')} → {formatCumulStartTime(entryEnd.seconds, 'h')}{entryEnd.daysLater ? ` J+${entryEnd.daysLater}` : ''}<span className="text-cyan-300"> · {formatCumulStartTime(entryStart, 'c')} → {formatCumulStartTime(entryEnd.seconds, 'c')}</span></> : entry.startRaw.trim() && entryStart === null ? <span className="text-rose-300">Départ invalide</span> : entryStart !== null ? 'Fin non calculable' : 'Départ non renseigné'}</p>
                  </div>
                  <button type="button" aria-expanded={editing} aria-controls={`entry-editor-${entry.id}`} onClick={() => setEditingId(editing ? null : entry.id)} className="shrink-0 rounded-lg border border-slate-700 px-3 py-1 text-xs font-semibold text-sky-300">{editing ? 'Terminer' : 'Modifier'}</button>
                </div>
                <div id={`entry-editor-${entry.id}`} hidden={!editing} className="mt-2 pt-2 border-t border-slate-800">
                <div className="cumul-entry-row flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Drag handle + Row number */}
                  <div className="entry-index flex items-center gap-2 shrink-0">
                    {allowDrag && <GripVertical className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />}
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
                  <div className="entry-label flex-1 min-w-0">
                    <input
                      aria-label={`Libellé activité ${idx + 1}`}
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
                    aria-pressed={!!entry.isBreak}
                    className={`entry-type flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors shrink-0 border ${
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
                  <div className="entry-unit flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 shrink-0" role="group" aria-label="Unité de durée">
                    <button
                      onClick={() => handleUpdateUnit(entry.id, 'c')} aria-label="Durée en centièmes" aria-pressed={entry.unit === 'c'}
                      className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                        entry.unit === 'c'
                          ? 'bg-cyan-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      c
                    </button>
                    <button
                      onClick={() => handleUpdateUnit(entry.id, 'h')} aria-label="Durée en heures" aria-pressed={entry.unit === 'h'}
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
                  <div className="entry-value relative w-full sm:w-28 shrink-0">
                    <input
                      type="text"
                      value={entry.valueRaw}
                      aria-label={`Durée activité ${idx + 1}`}
                      inputMode={entry.unit === 'c' ? 'decimal' : 'text'}
                       aria-invalid={parseDurationInput(entry.valueRaw, entry.unit) === null}
                      onChange={(e) => handleUpdateValue(entry.id, e.target.value)}
                      className={`w-full bg-slate-900 border border-slate-800 rounded-lg pl-2.5 pr-7 py-1 text-sm font-mono font-bold text-right focus:outline-none ${
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
                  <div className="entry-equivalent flex items-center gap-1 shrink-0">
                    <Clock className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span className="text-sm font-mono font-semibold text-white whitespace-nowrap">
                      {parseDurationInput(entry.valueRaw, entry.unit) === null ? 'Saisie invalide' : formatSexagesimalDisplay(entry.value)}
                    </span>
                  </div>

                  {/* Reorder and delete controls */}
                  <div className="entry-actions flex items-center gap-1 shrink-0">
                    <button type="button" onClick={() => moveEntry(idx, -1)} disabled={idx === 0} aria-label={`Monter ${entry.label}`} title="Monter" className="rounded-lg border border-slate-700 text-slate-300 px-2 py-1 disabled:opacity-30">↑</button>
                    <button type="button" onClick={() => moveEntry(idx, 1)} disabled={idx === entries.length - 1} aria-label={`Descendre ${entry.label}`} title="Descendre" className="rounded-lg border border-slate-700 text-slate-300 px-2 py-1 disabled:opacity-30">↓</button>
                  <button
                    onClick={() => handleRemoveEntry(entry.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                    title="Supprimer cette ligne" aria-label={`Supprimer ${entry.label}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  </div>
                </div>
                <EntrySchedule id={`entry-start-${entry.id}`} raw={entry.startRaw} unit={entry.startUnit}
                  duration={parseDurationInput(entry.valueRaw, entry.unit)}
                  onChange={(raw, unit) => handleUpdateSchedule(entry.id, raw, unit)} />
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
      <div className="p-2 sm:p-4 rounded-xl bg-slate-950/80 border border-dashed border-slate-700 hover:border-violet-500/40 transition-colors">
        <button type="button" aria-expanded={adding} aria-controls="cumul-add-fields" onClick={() => setAdding(v => !v)} className="w-full flex items-center justify-center gap-2 rounded-lg bg-violet-600/20 text-violet-200 font-semibold text-sm px-3 py-2"><Plus className="w-4 h-4" />{adding ? 'Replier le formulaire' : 'Ajouter une activité ou une pause'}</button>
        <div id="cumul-add-fields" hidden={!adding} className="mt-3">
        <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-3">
          Ajouter une durée ou une pause
        </span>

        <div className="cumul-add-row flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
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
                inputMode={newUnit === 'c' ? 'decimal' : 'text'}
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
            disabled={previewValue === null || invalidNewStart}
            className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md transition-all self-end"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter</span>
          </button>
        </div>
        <EntrySchedule id="new-entry-start" raw={newStartRaw} unit={newStartUnit} duration={previewValue}
          onChange={(raw, unit) => { setNewStartRaw(raw); setNewStartUnit(unit); }} />
        </div>
      </div>

      {newValue.trim() !== '' && previewValue === null && <p role="alert" className="text-sm text-rose-300">Durée invalide. Exemple : 0,50 ou 0:30.</p>}
      {invalidTotal && <p role="alert" className="text-sm text-rose-300">Corrigez les horaires ou durées invalides ; le total est provisoire et ne peut pas être copié.</p>}
      {!invalidTotal && totalBreaks > totalWorkHours + addedDuration && <p role="status" className="text-sm text-amber-300">Les pauses dépassent la durée disponible ; le total est ramené à zéro.</p>}
      {/* TOTAL BANNER */}
      <div className="cumul-total-banner mt-3 p-3 sm:p-5 rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950/30 border border-violet-500/30 shadow-xl">
        <div className="cumul-totals grid grid-cols-1 md:grid-cols-4 gap-5 items-center">
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
                TOTAL en H, Min & Sec
              </span>
              <p className="text-3xl font-extrabold font-mono text-white">
                {totalSexagesimal.hours}h{String(totalSexagesimal.minutes).padStart(2, '0')}{totalSexagesimal.seconds > 0 && <span className="text-base">:{String(totalSexagesimal.seconds).padStart(2, '0')}</span>}
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
             disabled={invalidTotal}
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
