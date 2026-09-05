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

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) {
    return { minutesTotal: 0, hours: 0, minutes: 0, centesimalHours: 0 };
  }

  let totalMStart = startH * 60 + startM;
  let totalMEnd = endH * 60 + endM;

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
