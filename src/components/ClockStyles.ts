import { ClockTheme } from '../types/clock';

export interface ThemeColors {
  bezelOuter: string;
  bezelInner: string;
  dialBg: string;
  dialRing: string;
  majorTick: string;
  minorTick: string;
  numerals: string;
  innerNumerals: string;
  hourHand: string;
  minuteHand: string;
  secondHand: string;
  centesimalHand: string;
  pivotBorder: string;
  pivotCenter: string;
  accentBadge: string;
  accentText: string;
  labelSecondary: string;
  glowClass: string;
}

export const THEME_CONFIGS: Record<ClockTheme, { name: string; description: string; colors: ThemeColors }> = {
  modern: {
    name: 'Bleu Moderne',
    description: 'Style contemporain bleu nuit et néon',
    colors: {
      bezelOuter: '#1e293b',
      bezelInner: '#0f172a',
      dialBg: '#0b1120',
      dialRing: '#334155',
      majorTick: '#38bdf8',
      minorTick: '#475569',
      numerals: '#f8fafc',
      innerNumerals: '#94a3b8',
      hourHand: '#f1f5f9',
      minuteHand: '#38bdf8',
      secondHand: '#f43f5e',
      centesimalHand: '#06b6d4',
      pivotBorder: '#38bdf8',
      pivotCenter: '#0f172a',
      accentBadge: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
      accentText: 'text-sky-400',
      labelSecondary: '#64748b',
      glowClass: 'glow-blue',
    },
  },
  industrial: {
    name: 'Industriel RH',
    description: 'Style chronomètre technique haute visibilité',
    colors: {
      bezelOuter: '#27272a',
      bezelInner: '#18181b',
      dialBg: '#121215',
      dialRing: '#3f3f46',
      majorTick: '#f59e0b',
      minorTick: '#52525b',
      numerals: '#fbbf24',
      innerNumerals: '#a1a1aa',
      hourHand: '#f4f4f5',
      minuteHand: '#fbbf24',
      secondHand: '#ef4444',
      centesimalHand: '#f59e0b',
      pivotBorder: '#f59e0b',
      pivotCenter: '#18181b',
      accentBadge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      accentText: 'text-amber-400',
      labelSecondary: '#71717a',
      glowClass: 'glow-amber',
    },
  },
  minimal: {
    name: 'Épuré Blanc',
    description: 'Design suisse intemporel haute lisibilité',
    colors: {
      bezelOuter: '#e2e8f0',
      bezelInner: '#f8fafc',
      dialBg: '#ffffff',
      dialRing: '#cbd5e1',
      majorTick: '#0f172a',
      minorTick: '#94a3b8',
      numerals: '#0f172a',
      innerNumerals: '#475569',
      hourHand: '#0f172a',
      minuteHand: '#1e293b',
      secondHand: '#e11d48',
      centesimalHand: '#0284c7',
      pivotBorder: '#0f172a',
      pivotCenter: '#ffffff',
      accentBadge: 'bg-slate-200 text-slate-800 border-slate-300',
      accentText: 'text-slate-900',
      labelSecondary: '#64748b',
      glowClass: 'shadow-lg shadow-slate-300/40',
    },
  },
  'dark-luxury': {
    name: 'Or & Émeraude',
    description: 'Élégance horlogère avec accents dorés',
    colors: {
      bezelOuter: '#18181b',
      bezelInner: '#09090b',
      dialBg: '#050c0a',
      dialRing: '#1c3d31',
      majorTick: '#10b981',
      minorTick: '#1f4d3c',
      numerals: '#fcd34d',
      innerNumerals: '#6ee7b7',
      hourHand: '#fde68a',
      minuteHand: '#34d399',
      secondHand: '#f59e0b',
      centesimalHand: '#10b981',
      pivotBorder: '#f59e0b',
      pivotCenter: '#064e3b',
      accentBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      accentText: 'text-emerald-400',
      labelSecondary: '#059669',
      glowClass: 'glow-emerald',
    },
  },
};
