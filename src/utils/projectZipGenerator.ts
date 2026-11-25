import JSZip from 'jszip';

// Explicit raw imports: Vite embeds source text at build time, with no runtime glob.
import file0 from "../../.gitignore?raw";
import file1 from "../../AGENTS.md?raw";
import file2 from "../../README.md?raw";
import file3 from "../../index.html?raw";
import file4 from "../../package-lock.json?raw";
import file5 from "../../package.json?raw";
import file6 from "../../public/robots.txt?raw";
import file7 from "../App.tsx?raw";
import file8 from "../components/AnalogClockCentesimal.tsx?raw";
import file9 from "../components/AnalogClockNormal.tsx?raw";
import file10 from "../components/ClockStyles.ts?raw";
import file11 from "../components/ConversionTable.tsx?raw";
import file12 from "../components/ConverterTool.tsx?raw";
import file13 from "../components/CumulCalculator.tsx?raw";
import file14 from "../components/DownloadZipModal.tsx?raw";
import file15 from "../components/DualClockDisplay.tsx?raw";
import file16 from "../components/DualStopwatch.tsx?raw";
import file17 from "../components/EducationalModal.tsx?raw";
import file18 from "../components/EquivalenceVisualizer.tsx?raw";
import file19 from "../components/LegalModal.tsx?raw";
import file20 from "../components/OptionBCentesimalOnly.tsx?raw";
import file21 from "../components/PayrollTimesheetCalculator.tsx?raw";
import file22 from "../components/SettingsModal.tsx?raw";
import file23 from "../components/TimeTravelController.tsx?raw";
import file24 from "../components/VercelDeployModal.tsx?raw";
import file25 from "../index.css?raw";
import file26 from "../main.tsx?raw";
import file27 from "../types/clock.ts?raw";
import file28 from "./audioTick.ts?raw";
import file29 from "./cn.ts?raw";
import file30 from "./projectZipGenerator.ts?raw";
import file31 from "./timeCalculations.ts?raw";
import file32 from "../vite-env.d.ts?raw";
import file33 from "../../tests/timeCalculations.test.mjs?raw";
import file34 from "../../tsconfig.json?raw";
import file35 from "../../vercel.json?raw";
import file36 from "../../vite.config.ts?raw";

const sources: Record<string, string> = {
  ".gitignore": file0,
  "AGENTS.md": file1,
  "README.md": file2,
  "index.html": file3,
  "package-lock.json": file4,
  "package.json": file5,
  "public/robots.txt": file6,
  "src/App.tsx": file7,
  "src/components/AnalogClockCentesimal.tsx": file8,
  "src/components/AnalogClockNormal.tsx": file9,
  "src/components/ClockStyles.ts": file10,
  "src/components/ConversionTable.tsx": file11,
  "src/components/ConverterTool.tsx": file12,
  "src/components/CumulCalculator.tsx": file13,
  "src/components/DownloadZipModal.tsx": file14,
  "src/components/DualClockDisplay.tsx": file15,
  "src/components/DualStopwatch.tsx": file16,
  "src/components/EducationalModal.tsx": file17,
  "src/components/EquivalenceVisualizer.tsx": file18,
  "src/components/LegalModal.tsx": file19,
  "src/components/OptionBCentesimalOnly.tsx": file20,
  "src/components/PayrollTimesheetCalculator.tsx": file21,
  "src/components/SettingsModal.tsx": file22,
  "src/components/TimeTravelController.tsx": file23,
  "src/components/VercelDeployModal.tsx": file24,
  "src/index.css": file25,
  "src/main.tsx": file26,
  "src/types/clock.ts": file27,
  "src/utils/audioTick.ts": file28,
  "src/utils/cn.ts": file29,
  "src/utils/projectZipGenerator.ts": file30,
  "src/utils/timeCalculations.ts": file31,
  "src/vite-env.d.ts": file32,
  "tests/timeCalculations.test.mjs": file33,
  "tsconfig.json": file34,
  "vercel.json": file35,
  "vite.config.ts": file36,
};

export async function downloadProjectZip(onProgress?: (percent: number) => void): Promise<void> {
  const zip = new JSZip();
  for (const [path, content] of Object.entries(sources)) zip.file(path, content);
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 } }, metadata => onProgress?.(Math.round(metadata.percent)));
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'moncentieme-sources.zip';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
