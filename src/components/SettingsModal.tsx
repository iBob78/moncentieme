import React from 'react';
import { ClockSettings, ClockTheme } from '../types/clock';
import { THEME_CONFIGS } from './ClockStyles';
import { X, Sliders, Volume2, VolumeX, Eye } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ClockSettings;
  onUpdateSettings: (newSettings: Partial<ClockSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const themes: ClockTheme[] = ['modern', 'industrial', 'minimal', 'dark-luxury'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Paramètres des Horloges</h2>
              <p className="text-xs text-slate-400">Personnalisez l'affichage, les cadrans et la précision</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options list */}
        <div className="space-y-5 text-sm">
          
          {/* Theme Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Style de Cadran & Couleurs
            </label>
            <div className="grid grid-cols-2 gap-2">
              {themes.map((th) => {
                const conf = THEME_CONFIGS[th];
                const isSelected = settings.theme === th;
                return (
                  <button
                    key={th}
                    onClick={() => onUpdateSettings({ theme: th })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-500/15 ring-1 ring-sky-500'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20"
                        style={{ backgroundColor: conf.colors.majorTick }}
                      />
                      <span className="font-bold text-xs text-white">{conf.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 line-clamp-1">{conf.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Decimal Precision */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Précision des Heures Centésimales
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([2, 3, 4] as const).map((dec) => (
                <button
                  key={dec}
                  onClick={() => onUpdateSettings({ decimalPlaces: dec })}
                  className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all ${
                    settings.decimalPlaces === dec
                      ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {dec} décimales ({dec === 2 ? '13.50' : dec === 3 ? '13.500' : '13.5000'})
                </button>
              ))}
            </div>
          </div>

          {/* Decimal Separator */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Séparateur décimal
              </label>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => onUpdateSettings({ decimalSeparator: '.' })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    settings.decimalSeparator === '.'
                      ? 'bg-sky-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Point (13.50)
                </button>
                <button
                  onClick={() => onUpdateSettings({ decimalSeparator: ',' })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    settings.decimalSeparator === ','
                      ? 'bg-sky-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Virgule (13,50)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Mouvement Aiguille
              </label>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => onUpdateSettings({ sweep: 'smooth' })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    settings.sweep === 'smooth'
                      ? 'bg-sky-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Fluide
                </button>
                <button
                  onClick={() => onUpdateSettings({ sweep: 'tick' })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    settings.sweep === 'tick'
                      ? 'bg-sky-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Trotteuse
                </button>
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            {/* Show Seconds */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
              <div className="flex items-center gap-2.5">
                <Eye className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-200">Afficher l'aiguille des secondes</span>
              </div>
              <input
                type="checkbox"
                checked={settings.showSeconds}
                onChange={(e) => onUpdateSettings({ showSeconds: e.target.checked })}
                className="w-4 h-4 rounded text-sky-500 accent-sky-500"
              />
            </label>

            {/* Sound */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
              <div className="flex items-center gap-2.5">
                {settings.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-xs font-medium text-slate-200">Tic-tac audio mécanique discret</span>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-sky-500 accent-sky-500"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-colors"
          >
            Appliquer et Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
