import React, { useState, useMemo } from 'react';
import { generateMinuteConversionTable, MinuteConversionRow } from '../utils/timeCalculations';
import { Search, Table, Copy, Check, Filter } from 'lucide-react';

export const ConversionTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'quarters' | 'fiveMin' | 'sixMin'>('all');
  const [copiedMinute, setCopiedMinute] = useState<number | null>(null);

  const fullTable = useMemo(() => generateMinuteConversionTable(), []);

  const filteredData = useMemo(() => {
    return fullTable.filter((row: MinuteConversionRow) => {
      // Search filter
      if (searchTerm.trim() !== '') {
        const term = searchTerm.trim().toLowerCase();
        const matchesMin = String(row.minute).includes(term);
        const matchesCent = row.formatted.includes(term);
        if (!matchesMin && !matchesCent) return false;
      }

      // Filter mode
      if (filterMode === 'quarters') {
        return row.minute === 15 || row.minute === 30 || row.minute === 45 || row.minute === 60;
      }
      if (filterMode === 'fiveMin') {
        return row.minute % 5 === 0;
      }
      if (filterMode === 'sixMin') {
        // 6 minutes = exactly 0.10 hours! (1 tenth)
        return row.minute % 6 === 0;
      }
      return true;
    });
  }, [fullTable, searchTerm, filterMode]);

  const handleCopyRow = (row: MinuteConversionRow) => {
    navigator.clipboard.writeText(`${row.minute} min = ${row.formatted} h`);
    setCopiedMinute(row.minute);
    setTimeout(() => setCopiedMinute(null), 1800);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Table className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Barème de Correspondance (1 à 60 minutes)
            </h2>
            <p className="text-xs text-slate-400">
              Grille de conversion officielle Minutes ➔ Centièmes d'heure
            </p>
          </div>
        </div>

        {/* Search input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Rechercher (ex: 30, 45, 0.50)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-2">
          <Filter className="w-3.5 h-3.5" />
          <span>Filtres :</span>
        </div>
        {[
          { id: 'all', label: 'Toutes (60 min)' },
          { id: 'quarters', label: 'Quarts d’heure (15, 30, 45, 60)' },
          { id: 'fiveMin', label: 'Paliers de 5 min' },
          { id: 'sixMin', label: 'Paliers de 6 min (0.10h)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterMode(tab.id as typeof filterMode)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterMode === tab.id
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid Cards of Rows */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
        {filteredData.map((row: MinuteConversionRow) => {
          const isPromptExample = row.minute === 30;
          const isQuarter = row.minute === 15 || row.minute === 30 || row.minute === 45 || row.minute === 60;

          return (
            <div
              key={row.minute}
              onClick={() => handleCopyRow(row)}
              className={`group relative p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isPromptExample
                  ? 'bg-sky-950/40 border-sky-500/50 shadow-md shadow-sky-500/10'
                  : isQuarter
                  ? 'bg-slate-950/90 border-cyan-500/30 hover:border-cyan-400'
                  : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  {row.minute} min
                </span>
                {row.exactFraction && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono font-bold">
                    {row.exactFraction}
                  </span>
                )}
                {isPromptExample && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold">
                    Exemple
                  </span>
                )}
              </div>

              <div className="flex items-baseline justify-between mt-2 pt-1 border-t border-slate-800/50">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-extrabold font-mono-digits text-cyan-300">
                    {row.formatted}
                  </span>
                  <span className="text-[11px] font-mono text-cyan-500 font-bold">h</span>
                </div>

                <button
                  className="p-1 rounded text-slate-500 group-hover:text-cyan-300 transition-colors"
                  title="Copier"
                >
                  {copiedMinute === row.minute ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">
          Aucun résultat pour votre recherche "{searchTerm}".
        </div>
      )}

      {/* Pro tip footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-400 gap-2">
        <span className="italic">
          Astuce mémorisation : <strong>6 minutes = 0,10 h</strong> | <strong>15 min = 0,25 h</strong> | <strong>30 min = 0,50 h</strong> | <strong>45 min = 0,75 h</strong>
        </span>
        <span className="text-slate-500">Cliquez sur une case pour copier</span>
      </div>
    </div>
  );
};
