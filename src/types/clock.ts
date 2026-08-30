export type ClockTheme = 'modern' | 'industrial' | 'minimal' | 'dark-luxury';

export type SweepType = 'smooth' | 'tick';

export interface ClockSettings {
  theme: ClockTheme;
  sweep: SweepType;
  showSeconds: boolean;
  use24Hour: boolean;
  decimalPlaces: 2 | 3 | 4;
  decimalSeparator: '.' | ',';
  soundEnabled: boolean;
  showSubDials: boolean;
}

export interface TimeState {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  isLive: boolean;
}

export interface WorkPeriod {
  id: string;
  label: string;
  start: string; // "08:30"
  end: string;   // "12:00"
}
