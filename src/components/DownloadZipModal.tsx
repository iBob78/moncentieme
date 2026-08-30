import React, { useState } from 'react';
import { X, Download, FolderArchive, Check, Copy, Terminal, GitBranch, ArrowRight, Sparkles } from 'lucide-react';
import { downloadProjectZip } from '../utils/projectZipGenerator';
import confetti from 'canvas-confetti';

interface DownloadZipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVercelModal?: () => void;
}

export const DownloadZipModal: React.FC<DownloadZipModalProps> = ({
  isOpen,
  onClose,
  onOpenVercelModal,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      setProgress(10);
      await downloadProjectZip((p) => {
        setProgress(p);
      });
      setIsGenerating(false);
      setHasDownloaded(true);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error('Download error:', err);
      setIsGenerating(false);
    }
  };

  const copyCommand = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const gitCommands = `cd horloge-temps-reel-centieme
git init
git add .
git commit -m "Initial commit - Horloge temps réel et centième"
git branch -M main
git remote add origin https://github.com/VOTRE_PSEUDO/horloge-temps-reel-centieme.git
git push -u origin main`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 overflow-y-auto shadow-2xl text-slate-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-sky-500/20 border border-purple-500/30 text-purple-400">
            <FolderArchive className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              Télécharger le Projet (.ZIP)
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono">
                Prêt pour GitHub
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Code source complet, configuré avec Vite, React, Tailwind & Vercel
            </p>
          </div>
        </div>

        {/* npm allowScripts fix notice */}
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] mb-4 flex items-start gap-2">
          <Check className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>Correctif inclus :</strong> esbuild est pré-approuvé dans le champ <code className="px-1 py-0.5 bg-black/50 rounded font-mono">allowScripts</code> du package.json —
            le warning <em>"npm warn allow-scripts esbuild"</em> de Vercel ne bloquera plus vos builds.
          </span>
        </div>

        {/* Main Big Download Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 border border-cyan-500/30 text-center flex flex-col items-center">
          <div className="p-4 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-3">
            <FolderArchive className="w-10 h-10" />
          </div>

          <h3 className="text-lg font-bold text-white mb-1">
            Archive Complète du Projet
          </h3>
          <p className="text-xs text-slate-400 max-w-md mb-5">
            Comprend tous les composants, les types, utilitaires de calcul, styles, configuration Vite, package.json, vercel.json et .gitignore.
          </p>

          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm shadow-xl transition-all ${
              hasDownloaded
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-extrabold'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Génération du ZIP ({progress}%)...</span>
              </>
            ) : hasDownloaded ? (
              <>
                <Check className="w-5 h-5" />
                <span>Re-télécharger l'archive ZIP (.zip)</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Télécharger l'archive ZIP (.zip)</span>
              </>
            )}
          </button>

          {hasDownloaded && (
            <span className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5" /> Téléchargement démarré dans votre navigateur !
            </span>
          )}
        </div>

        {/* Instructions to push to GitHub */}
        <div className="mt-6 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-sky-400" />
            Comment envoyer ce ZIP sur votre GitHub :
          </h4>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center shrink-0">1</span>
              <span>Décompressez le fichier <strong>horloge-temps-reel-centieme-github.zip</strong> sur votre ordinateur.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center shrink-0">2</span>
              <span>Créez un nouveau dépôt vide sur votre compte GitHub (ex: <code className="text-cyan-400">horloge-temps-reel-centieme</code>).</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center shrink-0">3</span>
              <span>Ouvrez votre terminal dans le dossier extrait et collez les commandes suivantes :</span>
            </div>
          </div>

          {/* Code block with copy button */}
          <div className="relative">
            <pre className="p-4 rounded-xl bg-black border border-slate-800 text-cyan-300 font-mono text-xs overflow-x-auto leading-relaxed">
              {gitCommands}
            </pre>
            <button
              onClick={() => copyCommand(gitCommands, 'git')}
              className="absolute top-3 right-3 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-xs"
            >
              {copiedIndex === 'git' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copié</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier les commandes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Link to Vercel */}
        <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Une fois sur GitHub, vous pouvez le connecter à Vercel en 1 clic.</span>
          </div>
          {onOpenVercelModal && (
            <button
              onClick={() => {
                onClose();
                onOpenVercelModal();
              }}
              className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold whitespace-nowrap"
            >
              <span>Voir le guide Vercel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Close footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
