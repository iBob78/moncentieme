import React, { useState } from 'react';
import { X, Globe, Terminal, UploadCloud, Check, Copy, ExternalLink } from 'lucide-react';

interface VercelDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenZipModal?: () => void;
}

export const VercelDeployModal: React.FC<VercelDeployModalProps> = ({
  isOpen,
  onClose,
  onOpenZipModal,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 overflow-y-auto shadow-2xl text-slate-200">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-black border border-white/20 text-white shadow-xl flex items-center justify-center">
            {/* Vercel Triangle Logo */}
            <svg viewBox="0 0 76 65" className="w-6 h-6 fill-white">
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              Déploiement sur Vercel
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                100% Compatible
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Oui, vous pouvez uploader et héberger l'application directement sur Vercel en 3 méthodes simples !
            </p>
          </div>
        </div>

        {/* Configuration summary banner */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs space-y-1">
            <span className="font-bold text-sky-400 uppercase tracking-wider block">
              Configuration Vercel déjà prête :
            </span>
            <div className="flex flex-wrap gap-3 text-slate-300 font-mono text-[11px]">
              <span>Framework : <strong className="text-white">Vite</strong></span>
              <span>•</span>
              <span>Build : <strong className="text-white">npm run build</strong></span>
              <span>•</span>
              <span>Output : <strong className="text-white">dist</strong></span>
            </div>
          </div>
          <span className="text-xs text-emerald-400 bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-500/30 flex items-center gap-1.5 self-start sm:self-auto font-medium">
            <Check className="w-3.5 h-3.5" /> Fichier vercel.json inclus
          </span>
        </div>

        {/* 3 Methods */}
        <div className="space-y-4">
          
          {/* Method 1: Git Repo (Recommended) */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold text-xs flex items-center justify-center border border-sky-500/30">
                1
              </span>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400" />
                Méthode 1 : Via GitHub / GitLab / Bitbucket (Recommandé)
              </h3>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              Si votre projet est sur un dépôt Git, Vercel détecte automatiquement Vite et déploie le site en continu :
            </p>
            <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1.5 pl-2">
              <li>Rendez-vous sur <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline font-semibold inline-flex items-center gap-0.5">vercel.com/new <ExternalLink className="w-3 h-3" /></a>.</li>
              <li>Importez votre dépôt Git.</li>
              <li>Vercel détectera automatiquement <strong>Vite</strong>. Cliquez simplement sur <strong>« Deploy »</strong>.</li>
              <li>En 30 secondes, votre site est en ligne avec HTTPS gratuit et mises à jour automatiques !</li>
            </ol>
          </div>

          {/* Method 2: Vercel CLI */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center border border-cyan-500/30">
                  2
                </span>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  Méthode 2 : En ligne de commande avec Vercel CLI
                </h3>
              </div>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              Déployez en une seule ligne de commande depuis votre terminal :
            </p>
            <div className="p-3 bg-black rounded-xl border border-slate-800 flex items-center justify-between font-mono text-xs text-cyan-300">
              <code>npx vercel --prod</code>
              <button
                onClick={() => copyCode('npx vercel --prod', 'cli')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-[11px]"
              >
                {copiedIndex === 'cli' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-sans">Copié</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="font-sans">Copier</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Method 3: Drag & Drop of the dist folder */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center border border-purple-500/30">
                3
              </span>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-purple-400" />
                Méthode 3 : Glisser-déposer du dossier <code className="text-purple-300 font-mono">dist/</code>
              </h3>
            </div>
            <p className="text-xs text-slate-300 mb-2">
              Grâce au plugin <code className="text-sky-300">vite-plugin-singlefile</code> déjà configuré dans le projet, le build produit un fichier autonome :
            </p>
            <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1.5 pl-2">
              <li>Exécutez <code className="bg-slate-900 px-1 py-0.5 rounded text-white font-mono">npm run build</code>.</li>
              <li>Allez sur le dashboard Vercel ou <a href="https://vercel.com/deploy" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline inline-flex items-center gap-0.5">vercel.com/deploy <ExternalLink className="w-3 h-3" /></a>.</li>
              <li>Glissez-déposez le dossier <strong>dist/</strong> directement dans la fenêtre Vercel !</li>
            </ol>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          {onOpenZipModal ? (
            <button
              onClick={() => {
                onClose();
                onOpenZipModal();
              }}
              className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-semibold text-xs transition-colors flex items-center gap-2"
            >
              <span>📦 Télécharger le ZIP du projet pour GitHub</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400">
              Vous avez le choix d'afficher le mode double (Option A) ou centième exclusif (Option B).
            </span>
          )}
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-lg transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
