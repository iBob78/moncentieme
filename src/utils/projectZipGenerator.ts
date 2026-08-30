import JSZip from 'jszip';

/**
 * GÉNÉRATION DU ZIP DU PROJET - VERSION 100% STATIQUE
 *
 * Chaque fichier du projet est importé individuellement avec la requête `?raw`
 * de Vite (transformée à coup sûr au moment du build en simple chaîne de caractères).
 * Aucun appel `import.meta.glob()` ni `meta.glob()` n'existe dans ce module :
 * impossible d'avoir une erreur "xxx.glob is not a function" à l'exécution.
 */

// ===== Fichiers à la racine =====
import indexHtml from '../../index.html?raw';
import viteConfigTs from '../../vite.config.ts?raw';
import tsconfigJson from '../../tsconfig.json?raw';
import vercelJson from '../../vercel.json?raw';
import readmeMd from '../../README.md?raw';

// ===== Source principale =====
import mainTsx from '../main.tsx?raw';
import appTsx from '../App.tsx?raw';
import indexCss from '../index.css?raw';
import viteEnvDts from '../vite-env.d.ts?raw';

// ===== Types & Utilitaires =====
import clockTypes from '../types/clock.ts?raw';
import timeCalculations from '../utils/timeCalculations.ts?raw';
import audioTick from '../utils/audioTick.ts?raw';
import cnUtils from '../utils/cn.ts?raw';

// ===== Composants =====
import AnalogClockNormal from '../components/AnalogClockNormal.tsx?raw';
import AnalogClockCentesimal from '../components/AnalogClockCentesimal.tsx?raw';
import ClockStyles from '../components/ClockStyles.ts?raw';
import DualClockDisplay from '../components/DualClockDisplay.tsx?raw';
import OptionBCentesimalOnly from '../components/OptionBCentesimalOnly.tsx?raw';
import EquivalenceVisualizer from '../components/EquivalenceVisualizer.tsx?raw';
import TimeTravelController from '../components/TimeTravelController.tsx?raw';
import ConverterTool from '../components/ConverterTool.tsx?raw';
import ConversionTable from '../components/ConversionTable.tsx?raw';
import PayrollTimesheetCalculator from '../components/PayrollTimesheetCalculator.tsx?raw';
import DualStopwatch from '../components/DualStopwatch.tsx?raw';
import EducationalModal from '../components/EducationalModal.tsx?raw';
import SettingsModal from '../components/SettingsModal.tsx?raw';
import VercelDeployModal from '../components/VercelDeployModal.tsx?raw';
import DownloadZipModal from '../components/DownloadZipModal.tsx?raw';

// ===== Fichiers générés/édités à la main (contenus définis ci-dessous) =====
const gitignoreContent = `# Logs
logs
*.log
npm-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
`;

const packageJsonContent = `{
  "name": "horloge-temps-reel-et-centieme",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "canvas-confetti": "^1.9.4",
    "clsx": "^2.1.1",
    "jszip": "^3.10.1",
    "lucide-react": "^1.35.0",
    "react": "^19.2.6",
    "react-dom": "^19.2.6",
    "tailwind-merge": "^3.4.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.17",
    "@types/node": "^22.19.17",
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "tailwindcss": "^4.1.17",
    "typescript": "^5.9.3",
    "vite": "^7.3.2",
    "vite-plugin-singlefile": "^2.3.0"
  },
  "allowScripts": {
    "esbuild": true
  }
}
`;

/**
 * Manifeste statique du projet : chemin dans l'archive -> contenu du fichier.
 * L'ordre et le contenu sont entièrement déterminés au moment du BUILD.
 */
const projectFiles: Record<string, string> = {
  'index.html': indexHtml,
  'vite.config.ts': viteConfigTs,
  'tsconfig.json': tsconfigJson,
  'vercel.json': vercelJson,
  'README.md': readmeMd,
  '.gitignore': gitignoreContent,
  'package.json': packageJsonContent,
  'src/main.tsx': mainTsx,
  'src/App.tsx': appTsx,
  'src/index.css': indexCss,
  'src/vite-env.d.ts': viteEnvDts,
  'src/types/clock.ts': clockTypes,
  'src/utils/timeCalculations.ts': timeCalculations,
  'src/utils/audioTick.ts': audioTick,
  'src/utils/cn.ts': cnUtils,
  'src/components/AnalogClockNormal.tsx': AnalogClockNormal,
  'src/components/AnalogClockCentesimal.tsx': AnalogClockCentesimal,
  'src/components/ClockStyles.ts': ClockStyles,
  'src/components/DualClockDisplay.tsx': DualClockDisplay,
  'src/components/OptionBCentesimalOnly.tsx': OptionBCentesimalOnly,
  'src/components/EquivalenceVisualizer.tsx': EquivalenceVisualizer,
  'src/components/TimeTravelController.tsx': TimeTravelController,
  'src/components/ConverterTool.tsx': ConverterTool,
  'src/components/ConversionTable.tsx': ConversionTable,
  'src/components/PayrollTimesheetCalculator.tsx': PayrollTimesheetCalculator,
  'src/components/DualStopwatch.tsx': DualStopwatch,
  'src/components/EducationalModal.tsx': EducationalModal,
  'src/components/SettingsModal.tsx': SettingsModal,
  'src/components/VercelDeployModal.tsx': VercelDeployModal,
  'src/components/DownloadZipModal.tsx': DownloadZipModal,
};

export async function downloadProjectZip(onProgress?: (percent: number) => void): Promise<void> {
  const zip = new JSZip();

  // Ajout de tous les fichiers du manifeste statique
  for (const [filePath, content] of Object.entries(projectFiles)) {
    zip.file(filePath, content);
  }

  // Génération du blob ZIP compressé
  const blob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    },
    (metadata) => {
      if (onProgress) {
        onProgress(Math.round(metadata.percent));
      }
    }
  );

  // Déclenchement du téléchargement dans le navigateur
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'horloge-temps-reel-centieme-github.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
