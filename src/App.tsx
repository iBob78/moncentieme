import { useState, useEffect, useRef, useCallback } from 'react';
import { ClockSettings, TimeState } from './types/clock';
import { DualClockDisplay } from './components/DualClockDisplay';
import { EquivalenceVisualizer } from './components/EquivalenceVisualizer';
import { ConverterTool } from './components/ConverterTool';
import { PayrollTimesheetCalculator } from './components/PayrollTimesheetCalculator';
import { DualStopwatch } from './components/DualStopwatch';
import { EducationalModal } from './components/EducationalModal';
import { SettingsModal } from './components/SettingsModal';
import { clockAudio } from './utils/audioTick';
import {
  Clock,
  Calculator,
  Briefcase,
  Timer,
  Settings,
  HelpCircle,
  Volume2,
  VolumeX,
  Radio,
} from 'lucide-react';

export function App() {
  const [settings, setSettings] = useState<ClockSettings>({
    theme: 'modern',
    sweep: 'smooth',
    showSeconds: true,
    use24Hour: true,
    decimalPlaces: 2,
    decimalSeparator: '.',
    soundEnabled: false,
    showSubDials: true,
  });

  const [time, setTime] = useState<TimeState>(() => {
    const now = new Date();
    return {
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds(),
      milliseconds: now.getMilliseconds(),
      isLive: true,
    };
  });

  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'clocks' | 'converter' | 'payroll' | 'stopwatch'>('clocks');

  const lastSecondRef = useRef<number>(-1);

  useEffect(() => {
    let animId: number;

    const loop = () => {
      const now = new Date();
      const s = now.getSeconds();
      setTime({
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: s,
        milliseconds: now.getMilliseconds(),
        isLive: true,
      });

      if (settings.soundEnabled && s !== lastSecondRef.current) {
        clockAudio.playTick(s % 2 === 0 ? 'high' : 'low');
        lastSecondRef.current = s;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [settings.soundEnabled]);

  const updateSettings = useCallback((newSettings: Partial<ClockSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-80 bg-gradient-to-b from-sky-600/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none" />

      <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-sky-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                Mon <span className="text-cyan-400">centième</span>
              </h1>
            </div>
          </div>

          <nav className="flex items-center bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-xs overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('clocks')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeTab === 'clocks'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Horloges</span>
            </button>

            <button
              onClick={() => setActiveTab('converter')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeTab === 'converter'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Convertisseur</span>
            </button>

            <button
              onClick={() => setActiveTab('payroll')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeTab === 'payroll'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Pointage RH</span>
            </button>

            <button
              onClick={() => setActiveTab('stopwatch')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeTab === 'stopwatch'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span>Chronomètre</span>
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Direct</span>
            </span>

            <button
              onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`p-2 rounded-xl border transition-colors ${
                settings.soundEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
              }`}
              title={settings.soundEnabled ? 'Désactiver le tic-tac audio' : 'Activer le tic-tac audio'}
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsInfoOpen(true)}
              className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors"
              title="Comprendre l'heure centésimale"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors"
              title="Paramètres d'affichage"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8 space-y-8">
        {activeTab === 'clocks' ? (
          <>
            <DualClockDisplay
              time={time}
              settings={settings}
              onOpenInfo={() => setIsInfoOpen(true)}
            />

            <EquivalenceVisualizer
              time={time}
              settings={settings}
            />

            <ConverterTool />
          </>
        ) : (
          <>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Heure Normale
                  </span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-white">
                    {String(time.hours).padStart(2, '0')}:{String(time.minutes).padStart(2, '0')}:{String(time.seconds).padStart(2, '0')}
                  </span>
                </div>

                <span className="text-slate-600 text-lg">➔</span>

                <div>
                  <span className="text-[10px] text-cyan-400 uppercase font-bold block">
                    Heure au Centième
                  </span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-300">
                    {(time.hours + time.minutes / 60 + time.seconds / 3600).toFixed(settings.decimalPlaces)} h
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('clocks')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
              >
                Retour aux Cadrans
              </button>
            </div>

            {activeTab === 'converter' && <ConverterTool />}
            {activeTab === 'payroll' && <PayrollTimesheetCalculator />}
            {activeTab === 'stopwatch' && <DualStopwatch />}
          </>
        )}
      </main>

      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/90 py-8 px-4 text-xs text-slate-400 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-slate-200">
              Horloge Temps Réel & Centième
            </p>
            <p className="text-slate-500 mt-0.5">
              Affichage jumelé : heure classique (base 60) et heure industrielle (base 100).
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsInfoOpen(true)}
              className="text-sky-400 hover:underline"
            >
              Guide 13h30 = 13.50
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-slate-400 hover:text-white"
            >
              Styles
            </button>
          </div>
        </div>
      </footer>

      <EducationalModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
      />
    </div>
  );
}

export default App;
