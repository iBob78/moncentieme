import { useState, useEffect, useRef, useCallback } from 'react';
import { ClockSettings, TimeState } from './types/clock';
import { DualClockDisplay } from './components/DualClockDisplay';
import { OptionBCentesimalOnly } from './components/OptionBCentesimalOnly';
import { EquivalenceVisualizer } from './components/EquivalenceVisualizer';
import { TimeTravelController } from './components/TimeTravelController';
import { ConverterTool } from './components/ConverterTool';
import { ConversionTable } from './components/ConversionTable';
import { PayrollTimesheetCalculator } from './components/PayrollTimesheetCalculator';
import { DualStopwatch } from './components/DualStopwatch';
import { EducationalModal } from './components/EducationalModal';
import { SettingsModal } from './components/SettingsModal';
import { VercelDeployModal } from './components/VercelDeployModal';
import { DownloadZipModal } from './components/DownloadZipModal';
import { clockAudio } from './utils/audioTick';
import {
  Clock,
  Calculator,
  Table,
  Briefcase,
  Timer,
  Settings,
  HelpCircle,
  Volume2,
  VolumeX,
  Radio,
  ExternalLink,
  Cpu,
  FolderArchive,
} from 'lucide-react';

export function App() {
  // Master Clock Settings
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

  // View Mode: Option A (Duo clocks) or Option B (Centesimal only)
  const [viewMode, setViewMode] = useState<'option-a' | 'option-b'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const m = params.get('mode') || params.get('option') || params.get('view');
      if (m === 'b' || m === 'option-b') return 'option-b';
    }
    return 'option-a';
  });

  // Master Time State
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

  // Simulation controls
  const [isLive, setIsLive] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const simSecondsRef = useRef<number>(0);

  // Modals & Navigation
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isVercelOpen, setIsVercelOpen] = useState<boolean>(false);
  const [isZipModalOpen, setIsZipModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'clocks' | 'converter' | 'table' | 'payroll' | 'stopwatch'>('clocks');

  // Audio tick trigger reference
  const lastSecondRef = useRef<number>(-1);

  // Switch view mode and update URL param seamlessly
  const handleSelectViewMode = (mode: 'option-a' | 'option-b') => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (mode === 'option-b') {
        url.searchParams.set('view', 'option-b');
      } else {
        url.searchParams.delete('view');
        url.searchParams.delete('mode');
        url.searchParams.delete('option');
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Time loop (Live or Simulation)
  useEffect(() => {
    let animId: number;
    let lastTimestamp = performance.now();

    const loop = (currentTimestamp: number) => {
      const deltaMs = currentTimestamp - lastTimestamp;
      lastTimestamp = currentTimestamp;

      if (isLive) {
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
      } else if (isPlaying) {
        // Advance simulation time
        simSecondsRef.current = (simSecondsRef.current + (deltaMs / 1000) * simulationSpeed) % 86400;
        const totalSec = Math.floor(simSecondsRef.current);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        const ms = Math.floor((simSecondsRef.current % 1) * 1000);

        setTime({
          hours: h,
          minutes: m,
          seconds: s,
          milliseconds: ms,
          isLive: false,
        });

        if (settings.soundEnabled && s !== lastSecondRef.current) {
          clockAudio.playTick(s % 2 === 0 ? 'high' : 'low');
          lastSecondRef.current = s;
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isLive, isPlaying, simulationSpeed, settings.soundEnabled]);

  // Handler to return to live real time
  const handleGoLive = useCallback(() => {
    setIsLive(true);
    setIsPlaying(false);
    const now = new Date();
    setTime({
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds(),
      milliseconds: now.getMilliseconds(),
      isLive: true,
    });
  }, []);

  // Handler to seek specific time in simulation
  const handleSeekTime = useCallback((h: number, m: number, s: number) => {
    setIsLive(false);
    setIsPlaying(false);
    simSecondsRef.current = h * 3600 + m * 60 + s;
    setTime({
      hours: h,
      minutes: m,
      seconds: s,
      milliseconds: 0,
      isLive: false,
    });
  }, []);

  // Toggle play/pause in simulation
  const handleTogglePlay = useCallback(() => {
    if (isLive) {
      simSecondsRef.current = time.hours * 3600 + time.minutes * 60 + time.seconds;
      setIsLive(false);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  }, [isLive, isPlaying, time.hours, time.minutes, time.seconds]);

  const updateSettings = useCallback((newSettings: Partial<ClockSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      
      {/* Top Ambient Glow Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-80 bg-gradient-to-b from-sky-600/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* HEADER NAVBAR */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-sky-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                    Horloge <span className="text-sky-400">Classique</span> & <span className="text-cyan-400">Centième</span>
                  </h1>
                </div>
                <p className="text-[11px] text-slate-400">
                  Temps Réel & Industriel • 13h30 = 13,50
                </p>
              </div>
            </div>

            {/* Vercel deploy direct button (mobile visible) */}
            <button
              onClick={() => setIsVercelOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black border border-white/20 text-white text-xs font-bold shadow hover:bg-slate-900 transition-colors"
            >
              <svg viewBox="0 0 76 65" className="w-3.5 h-3.5 fill-white">
                <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
              </svg>
              <span>Vercel</span>
            </button>
          </div>

          {/* Navigation Pill Menu */}
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
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeTab === 'table'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Barème 1-60m</span>
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

          {/* Quick Action buttons & Vercel Trigger */}
          <div className="flex items-center gap-2">
            
            {/* Download ZIP for GitHub */}
            <button
              onClick={() => setIsZipModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md transition-all"
              title="Télécharger le projet complet en archive ZIP pour l'envoyer sur GitHub"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Télécharger ZIP</span>
              <span className="sm:hidden">ZIP</span>
            </button>

            {/* Deploy to Vercel Button */}
            <button
              onClick={() => setIsVercelOpen(true)}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black border border-white/20 hover:border-white/40 text-white text-xs font-bold shadow-md hover:bg-slate-950 transition-all"
              title="Guide et configuration pour déployer sur Vercel"
            >
              <svg viewBox="0 0 76 65" className="w-3.5 h-3.5 fill-white">
                <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
              </svg>
              <span>Vercel</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            {/* Live Indicator button */}
            <button
              onClick={handleGoLive}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isLive
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:border-emerald-500/50'
                  : 'bg-amber-950/40 text-amber-300 border-amber-500/40 hover:bg-amber-900/40'
              }`}
              title={isLive ? 'En direct' : 'Cliquez pour revenir au temps réel'}
            >
              <Radio className={`w-3.5 h-3.5 ${isLive ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
              <span className="hidden sm:inline">{isLive ? 'Direct' : 'Reprendre'}</span>
            </button>

            {/* Sound Mute Toggle */}
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

            {/* Help / Guide */}
            <button
              onClick={() => setIsInfoOpen(true)}
              className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors"
              title="Comprendre l'heure centésimale (Guide explicatif)"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Settings */}
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

      {/* OPTION A vs OPTION B SWITCHER BAR */}
      <div className="relative z-10 bg-slate-950 border-b border-slate-800/80 px-4 py-2">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
              Mode d'affichage :
            </span>
            <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-800">
              <button
                onClick={() => {
                  handleSelectViewMode('option-a');
                  setActiveTab('clocks');
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'option-a' && activeTab === 'clocks'
                    ? 'bg-sky-500 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Option A : Horloges Jumelles (Duo)</span>
              </button>

              <button
                onClick={() => {
                  handleSelectViewMode('option-b');
                  setActiveTab('clocks');
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'option-b' && activeTab === 'clocks'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-cyan-300'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Option B : Horloge Centième Dédiée</span>
              </button>
            </div>
          </div>

          {/* Quick preset 13h30 button */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => handleSeekTime(13, 30, 0)}
              className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 font-medium transition-colors"
            >
              Tester 13h30 ➔ 13,50
            </button>
            <button
              onClick={() => setIsInfoOpen(true)}
              className="text-slate-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
            >
              <span>Explication</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8 space-y-8">
        
        {activeTab === 'clocks' ? (
          <>
            {/* OPTION A: DUAL CLOCKS */}
            {viewMode === 'option-a' && (
              <DualClockDisplay
                time={time}
                settings={settings}
                onOpenInfo={() => setIsInfoOpen(true)}
              />
            )}

            {/* OPTION B: CENTESIMAL ONLY */}
            {viewMode === 'option-b' && (
              <OptionBCentesimalOnly
                time={time}
                settings={settings}
                onSwitchToOptionA={() => handleSelectViewMode('option-a')}
                onOpenInfo={() => setIsInfoOpen(true)}
              />
            )}

            {/* Linear comparison and time slider */}
            <EquivalenceVisualizer
              time={time}
              settings={settings}
            />

            <TimeTravelController
              time={time}
              isLive={isLive}
              isPlaying={isPlaying}
              simulationSpeed={simulationSpeed}
              onTogglePlay={handleTogglePlay}
              onSetSpeed={setSimulationSpeed}
              onGoLive={handleGoLive}
              onSeekTime={handleSeekTime}
            />

            {/* Quick conversion & table */}
            <div className="pt-4">
              <ConverterTool />
            </div>

            <ConversionTable />
          </>
        ) : (
          <>
            {/* Compact Mini Bar when in another tab */}
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

            {/* Render selected tool */}
            {activeTab === 'converter' && <ConverterTool />}
            {activeTab === 'table' && <ConversionTable />}
            {activeTab === 'payroll' && <PayrollTimesheetCalculator />}
            {activeTab === 'stopwatch' && <DualStopwatch />}
          </>
        )}

      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/90 py-8 px-4 text-xs text-slate-400 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-slate-200">
              Horloge Temps Réel & Centième (Option A & Option B)
            </p>
            <p className="text-slate-500 mt-0.5">
              Prêt pour un déploiement instantané sur Vercel, Netlify ou hébergement statique.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsZipModalOpen(true)}
              className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1.5"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Télécharger le ZIP (GitHub)</span>
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => setIsVercelOpen(true)}
              className="text-white hover:text-cyan-300 font-semibold flex items-center gap-1.5"
            >
              <svg viewBox="0 0 76 65" className="w-3 h-3 fill-current">
                <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
              </svg>
              <span>Déploiement Vercel</span>
            </button>
            <span className="text-slate-700">•</span>
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

      {/* MODALS */}
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

      <VercelDeployModal
        isOpen={isVercelOpen}
        onClose={() => setIsVercelOpen(false)}
        onOpenZipModal={() => setIsZipModalOpen(true)}
      />

      <DownloadZipModal
        isOpen={isZipModalOpen}
        onClose={() => setIsZipModalOpen(false)}
        onOpenVercelModal={() => setIsVercelOpen(true)}
      />

    </div>
  );
}

export default App;
