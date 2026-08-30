import React from 'react';
import { X, BookOpen, AlertTriangle, Lightbulb, CheckCircle2, Calculator } from 'lucide-react';

interface EducationalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EducationalModal: React.FC<EducationalModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 overflow-y-auto shadow-2xl text-slate-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Comprendre l'Heure Centésimale (ou Industrielle)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Pourquoi 13h30 s'affiche 13,50 sur une horloge au centième ?
            </p>
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-6 text-sm leading-relaxed">
          
          {/* Section 1: Le principe de base */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <h3 className="font-bold text-white text-base flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              1. Base 60 vs Base 100 : Quelle est la différence ?
            </h3>
            <p className="text-slate-300">
              Notre système horaire traditionnel est <strong>sexagésimal (base 60)</strong> : 1 heure compte 60 minutes.
              Cependant, pour les calculs informatiques, la paie, la facturation et les statistiques, il est difficile de faire des additions et des multiplications avec une base de 60.
            </p>
            <p className="mt-2 text-slate-300">
              L'<strong>heure centésimale (base 100)</strong> divise chaque heure en <strong>100 fractions égales appelées « centièmes d'heure »</strong>.
            </p>
          </div>

          {/* Section 2: Votre exemple : 13h30 ➔ 13.50 */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/50 to-cyan-950/50 border border-sky-500/30">
            <h3 className="font-bold text-cyan-300 text-base flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-cyan-400" />
              2. L'exemple concret : 13h30 = 13,50
            </h3>
            <p className="text-slate-200">
              À 13h30, il s'est écoulé 13 heures complètes et 30 minutes.
            </p>
            <div className="my-3 p-3 bg-slate-950/80 rounded-xl font-mono text-xs space-y-1 text-sky-200 border border-slate-800">
              <div>• 30 minutes représentent la moitié d'une heure : <strong className="text-cyan-400">30 ÷ 60 = 0,50 h</strong></div>
              <div>• On additionne aux 13 heures entières : <strong className="text-cyan-400">13 + 0,50 = 13,50 h</strong></div>
            </div>
            <p className="text-slate-300 text-xs">
              Sur le cadran centésimal, l'aiguille des centièmes pointe sur le <strong>50</strong> (tout droit vers le bas), exactement comme l'aiguille des minutes pointe vers le bas (sur 30 min) !
            </p>
          </div>

          {/* Section 3: Le piège classique à éviter */}
          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-rose-200">
            <h3 className="font-bold text-rose-300 text-base flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              3. Le piège classique : Ne confondez pas 13,30 et 13h30 !
            </h3>
            <p className="text-xs leading-normal">
              Une erreur très fréquente consiste à écrire <code className="bg-rose-950 px-1 py-0.5 rounded text-rose-200 font-mono">13.30</code> en pensant noter 13h30.
            </p>
            <p className="mt-1 text-xs leading-normal font-semibold">
              Or 13,30 centièmes = 13 heures + (0,30 × 60) = <strong>13 heures et 18 minutes</strong> !
              Vous perdriez ainsi 12 minutes de travail facturé !
            </p>
          </div>

          {/* Section 4: Où est-ce utilisé ? */}
          <div>
            <h3 className="font-bold text-white text-base mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              4. Où utilise-t-on les heures industrielles ?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-sky-300 block mb-1">Ressources Humaines & Paie</span>
                Calcul des heures supplémentaires, logiciels de paie (Sage, Cegid, ADP, Lucca) qui calculent en centièmes : Taux horaire × Heures décimales.
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-sky-300 block mb-1">Facturation professionnelle</span>
                Cabinets d'avocats, experts-comptables, consultants et agences facturant au temps passé.
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-sky-300 block mb-1">Industrie & Ateliers (BTP, Auto)</span>
                Pointage des temps gammes, devis de mécanique ou carrosserie (temps barémé en centièmes).
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-sky-300 block mb-1">Aéronautique & Pilotes</span>
                Les carnets de vol militaires et civils (normes ATA) enregistrent le temps de vol en heures et centièmes.
              </div>
            </div>
          </div>

          {/* Section 5: Règle mnémotechnique */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
            <span className="font-bold text-amber-300 block mb-1">
              Astuce de calcul mental : La règle des 6 minutes
            </span>
            <p className="text-slate-300">
              Puisque 60 ÷ 10 = 6, <strong>chaque tranche de 6 minutes correspond exactement à 0,10 h (10 centièmes)</strong> :
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 font-mono text-center">
              <div className="p-2 bg-slate-900 rounded border border-slate-800">6 min = <strong>0,10 h</strong></div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">12 min = <strong>0,20 h</strong></div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">18 min = <strong>0,30 h</strong></div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">24 min = <strong>0,40 h</strong></div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">30 min = <strong>0,50 h</strong></div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">36 min = <strong>0,60 h</strong></div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">42 min = <strong>0,70 h</strong></div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">48 min = <strong>0,80 h</strong></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-lg transition-colors"
          >
            Compris, fermer
          </button>
        </div>
      </div>
    </div>
  );
};
