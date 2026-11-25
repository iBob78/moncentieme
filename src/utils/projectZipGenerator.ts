import JSZip from 'jszip';

// Vite expands these raw imports at build time, including this file as text.
const sources = import.meta.glob<string>([
  '../../README.md', '../../AGENTS.md', '../../package.json', '../../package-lock.json',
  '../../tsconfig.json', '../../vercel.json', '../../vite.config.ts', '../../index.html', '../../.gitignore',
  '../../src/**/*.{ts,tsx,css}', '../../public/robots.txt', '../../tests/**/*.mjs',
], { eager: true, query: '?raw', import: 'default' });

export async function downloadProjectZip(onProgress?: (percent: number) => void): Promise<void> {
  const zip = new JSZip();
  for (const [path, content] of Object.entries(sources)) zip.file(path.replace(/^\.\.\/\.\.\//, ''), content);
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
