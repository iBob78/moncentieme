/**
 * Time calculation utilities for Sexagesimal (Base 60) and Centesimal (Base 100) conversions.
 */

export interface CentesimalBreakdown {
  hours: number;
  minutes: number;
  seconds: number;
  centesimalValue: number; // e.g. 13.50
  centesimalFraction: number; // e.g. 50 (centièmes portion 0-99.99)
  percentageOfHour: number; // 0 to 100%
  exactFormula: string;
}

/**
 * Converts sexagesimal time (h, m, s, ms) to decimal / centesimal hours.
 * Formula: Hours + (Minutes / 60) + (Seconds / 3600) + (Milliseconds / 3600000)
 */
export function timeToCentesimal(
  hours: number,
  minutes: number,
  seconds: number = 0,
  milliseconds: number = 0
): number {
  const totalMinutes = minutes + seconds / 60 + milliseconds / 60000;
  return hours + totalMinutes / 60;
}

/**
 * Converts decimal/centesimal hours back to sexagesimal components.
 */
export function centesimalToSexagesimal(decimalHours: number): {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
} {
  const totalSeconds = Math.round(decimalHours * 3600);
  const hours = Math.floor(totalSeconds / 3600);
  const remainingSeconds = totalSeconds % 3600;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const milliseconds = 0;

  return { hours, minutes, seconds, milliseconds };
}

/**
 * Formats centesimal time string with desired decimals and separator ('.' or ',').
 */
export function formatCentesimalTime(
  decimalHours: number,
  decimals: 2 | 3 | 4 = 2,
  separator: '.' | ',' = '.'
): string {
  const formatted = decimalHours.toFixed(decimals);
  if (separator === ',') {
    return formatted.replace('.', ',');
  }
  return formatted;
}

/**
 * Format normal time (HH:MM:SS)
 */
export function formatSexagesimalTime(
  hours: number,
  minutes: number,
  seconds: number,
  showSeconds: boolean = true,
  use24Hour: boolean = true
): { display: string; period?: string } {
  let h = hours;
  let period: string | undefined = undefined;

  if (!use24Hour) {
    period = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
  }

  const hh = String(h).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  if (showSeconds) {
    return { display: `${hh}:${mm}:${ss}`, period };
  }
  return { display: `${hh}:${mm}`, period };
}

/**
 * Row in the minute-to-centesimal conversion table (1 to 60 minutes).
 */
export interface MinuteConversionRow {
  minute: number;
  formatted: string; // centesimal display, e.g. "0.50"
  exactFraction?: string; // e.g. "1/2" for 30 min
}

/**
 * Generates the full 1-to-60 minute conversion table.
 */
export function generateMinuteConversionTable(): MinuteConversionRow[] {
  const rows: MinuteConversionRow[] = [];
  for (let m = 1; m <= 60; m++) {
    const decimal = m / 60;
    const formatted = decimal.toFixed(2);
    let exactFraction: string | undefined;
    if (m === 6) exactFraction = '1/10';
    else if (m === 12) exactFraction = '1/5';
    else if (m === 15) exactFraction = '1/4';
    else if (m === 18) exactFraction = '3/10';
    else if (m === 24) exactFraction = '2/5';
    else if (m === 30) exactFraction = '1/2';
    else if (m === 36) exactFraction = '3/5';
    else if (m === 42) exactFraction = '7/10';
    else if (m === 45) exactFraction = '3/4';
    else if (m === 48) exactFraction = '4/5';
    else if (m === 54) exactFraction = '9/10';
    else if (m === 60) exactFraction = '1';
    rows.push({ minute: m, formatted, exactFraction });
  }
  return rows;
}

/**
 * Calculate duration between two "HH:mm" strings
 */
export function calculateDuration(startTime: string, endTime: string): {
  minutesTotal: number;
  hours: number;
  minutes: number;
  centesimalHours: number;
} {
  if (!startTime || !endTime) {
    return { minutesTotal: 0, hours: 0, minutes: 0, centesimalHours: 0 };
  }

  const totalMStart = parseTimeOfDay(startTime);
  let totalMEnd = parseTimeOfDay(endTime);
  if (totalMStart === null || totalMEnd === null) return { minutesTotal: 0, hours: 0, minutes: 0, centesimalHours: 0 };

  if (totalMEnd < totalMStart) {
    // Crosses midnight
    totalMEnd += 24 * 60;
  }

  const diff = Math.max(0, totalMEnd - totalMStart);
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  const centesimalHours = hours + (minutes / 60);

  return {
    minutesTotal: diff,
    hours,
    minutes,
    centesimalHours,
  };
}

/** Strict decimal hours, with either decimal separator. */
export function parseNonNegativeDecimal(raw: string): number | null {
  const value = raw.trim().replace(',', '.');
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)) return null;
  const n = Number(value);
  return Number.isFinite(n) && n <= Number.MAX_SAFE_INTEGER / 3600 ? n : null;
}

/** Minutes since midnight; 24:00 is the only permitted hour 24. */
export function parseTimeOfDay(raw: string): number | null {
  const m = /^(\d{1,2})[:h,](\d{1,2})$/i.exec(raw.trim());
  if (!m) return null;
  const h = Number(m[1]), min = Number(m[2]);
  return h > 24 || min >= 60 || (h === 24 && min !== 0) ? null : h * 60 + min;
}

export function parseDurationInput(raw: string, unit: 'c' | 'h'): number | null {
  if (unit === 'h' && /[:h]/i.test(raw)) {
    const m = /^(\d+)[:h](\d{1,2})(?::(\d{1,2}))?$/i.exec(raw.trim());
    if (!m) return null;
    const h = Number(m[1]), min = Number(m[2]), s = Number(m[3] ?? 0);
    if (min >= 60 || s >= 60 || !Number.isSafeInteger(h * 3600 + min * 60 + s)) return null;
    return timeToCentesimal(h, min, s);
  }
  return parseNonNegativeDecimal(raw);
}

export function calculateNetHours(base: number, additions: number[], breaks: number[]): number {
  return Math.max(0, base + additions.reduce((sum, n) => sum + n, 0) - breaks.reduce((sum, n) => sum + n, 0));
}

/** Start of a workday in whole seconds from midnight, including 24:00.
 * Decimal input is rounded to the nearest second, not to the nearest minute.
 */
export function parseCumulStartTime(raw: string, unit: 'h' | 'c'): number | null {
  if (unit === 'c') {
    const hours = parseNonNegativeDecimal(raw);
    return hours === null || hours > 24 ? null : Math.round(hours * 3600);
  }
  const match = /^(\d{1,2})[:h,](\d{1,2})(?::(\d{1,2}))?$/i.exec(raw.trim());
  if (!match) return null;
  const h = Number(match[1]), m = Number(match[2]), s = Number(match[3] ?? 0);
  if (h > 24 || m >= 60 || s >= 60 || (h === 24 && (m !== 0 || s !== 0))) return null;
  return h * 3600 + m * 60 + s;
}

/** Six decimal places are sufficient for a lossless round trip at second precision. */
export function formatCumulStartTime(seconds: number, unit: 'h' | 'c'): string {
  if (unit === 'c') {
    const [whole, fraction] = (seconds / 3600).toFixed(6).split('.');
    return whole + ',' + fraction.replace(/0+$/, '').padEnd(2, '0');
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = seconds % 60;
  return formatSexagesimalTime(h, m, s, s !== 0).display;
}

/** Single work period, with an optional midnight crossing, before breaks. */
export function calculateCumulWorkHours(startSeconds: number | null, endMinutes: number | null): number {
  if (startSeconds === null || endMinutes === null) return 0;
  const difference = endMinutes * 60 - startSeconds;
  return (difference < 0 ? difference + 86400 : difference) / 3600;
}

/** Optional entry schedule: start time + duration, independent of the daily total. */
export function calculateEntryEnd(startSeconds: number, durationHours: number): { seconds: number; daysLater: number } | null {
  if (!Number.isInteger(startSeconds) || startSeconds < 0 || startSeconds > 86400 || !Number.isFinite(durationHours) || durationHours < 0) return null;
  const total = startSeconds + Math.round(durationHours * 3600);
  if (!Number.isSafeInteger(total)) return null;
  return { seconds: total % 86400, daysLater: Math.floor(total / 86400) };
}

/** Move a list item to a final index, retaining the item and all its data. */
export function reorderEntries<T>(items: T[], from: number, to: number): T[] {
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < 0 || from >= items.length || to >= items.length || from === to) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Presentation only: one decimal in French; never use this to reconstruct a time. */
export function formatCumulDecimal(hours: number): string {
  return hours.toFixed(1).replace('.', ',');
}

export interface CumulSlot { start: number; end: number }
export interface CumulScheduleInput { id: string; start: number | null; duration: number | null; isBreak?: boolean }

/** Merge overlapping/touching intervals. Inputs and outputs use absolute seconds. */
function mergeCumulSlots(slots: CumulSlot[]): CumulSlot[] {
  const merged: CumulSlot[] = [];
  for (const slot of [...slots].sort((a,b) => a.start - b.start || a.end - b.end)) {
    if (slot.end <= slot.start) continue;
    const last = merged[merged.length - 1];
    if (last && slot.start <= last.end) last.end = Math.max(last.end, slot.end);
    else merged.push({ ...slot });
  }
  return merged;
}

/** When the explicitly entered day crosses midnight, morning times belong to the next day. */
export function normalizeCumulStart(start: number | null, dayStart: number | null, dayEndMinutes: number | null): number | null {
  if (start === null) return null;
  return dayStart !== null && dayEndMinutes !== null && dayEndMinutes * 60 < dayStart && start < dayStart ? start + 86400 : start;
}

/** Fixed pauses take priority, then the activity with the later requested start.
 * Equal starts use list order (first row wins). Earlier interrupted work resumes
 * in the next free slot. The original inputs are never mutated or duplicated.
 */
export function scheduleCumulEntries(entries: CumulScheduleInput[]): Map<string, CumulSlot[]> {
  const result = new Map<string, CumulSlot[]>();
  const valid = entries.map((e,index) => ({ ...e, index, seconds: e.duration === null ? NaN : Math.round(e.duration * 3600) }))
    .filter(e => e.start !== null && Number.isSafeInteger(e.start) && e.start >= 0 && Number.isSafeInteger(e.seconds) && e.seconds >= 0 && Number.isSafeInteger(e.start + e.seconds));
  const pauses = valid.filter(e => e.isBreak);
  let occupied = mergeCumulSlots(pauses.map(e => ({ start: e.start!, end: e.start! + e.seconds })));
  for (const e of pauses) result.set(e.id, [{ start: e.start!, end: e.start! + e.seconds }]);
  for (const e of valid.filter(e => !e.isBreak).sort((a,b) => b.start! - a.start! || a.index - b.index)) {
    let cursor = e.start!;
    let remaining = e.seconds;
    const slots: CumulSlot[] = [];
    if (remaining === 0) { result.set(e.id, [{ start: cursor, end: cursor }]); continue; }
    for (const busy of occupied) {
      if (busy.end <= cursor) continue;
      if (busy.start > cursor) {
        const length = Math.min(remaining, busy.start - cursor);
        slots.push({ start: cursor, end: cursor + length });
        remaining -= length;
        cursor += length;
        if (remaining === 0) break;
      }
      cursor = Math.max(cursor, busy.end);
    }
    if (remaining > 0) {
      if (!Number.isSafeInteger(cursor + remaining)) continue;
      slots.push({ start: cursor, end: cursor + remaining });
    }
    result.set(e.id, slots);
    occupied = mergeCumulSlots([...occupied, ...slots]);
  }
  return result;
}

/** Pauses are not deducted twice from scheduled work, whose duration is already net.
 * With a day interval, timed pauses are deducted only inside that interval (union).
 * Without a day interval or timed work, keep the traditional duration-only deduction.
 * Untimed pauses always retain the traditional deduction.
 */
export function calculateCumulPauseDeduction(entries: CumulScheduleInput[], dayStart: number | null, dayEndMinutes: number | null): number {
  const timed = entries.filter(e => e.isBreak && e.start !== null && e.duration !== null && e.duration >= 0 && Number.isSafeInteger(e.start + Math.round(e.duration * 3600)))
    .map(e => ({ start: e.start!, end: e.start! + Math.round(e.duration! * 3600) }));
  const untimed = entries.filter(e => e.isBreak && e.start === null && e.duration !== null).reduce((sum,e) => sum + e.duration!, 0);
  const hasTimedWork = entries.some(e => !e.isBreak && e.start !== null && e.duration !== null && e.duration > 0);
  if (dayStart !== null && dayEndMinutes !== null) {
    const end = dayEndMinutes * 60 + (dayEndMinutes * 60 < dayStart ? 86400 : 0);
    const overlap = mergeCumulSlots(timed.map(s => ({ start: Math.max(dayStart,s.start), end: Math.min(end,s.end) })));
    return untimed + overlap.reduce((sum,s) => sum + s.end - s.start, 0) / 3600;
  }
  return untimed + (hasTimedWork ? 0 : mergeCumulSlots(timed).reduce((sum,s) => sum + s.end - s.start, 0) / 3600);
}
