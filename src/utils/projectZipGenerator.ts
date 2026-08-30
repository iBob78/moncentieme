import JSZip from 'jszip';

interface ViteImportMeta {
  glob: (pattern: string | string[], options?: Record<string, unknown>) => Record<string, string>;
}

// Vite eager glob to load files as text strings
const meta = import.meta as unknown as ViteImportMeta;
const srcFiles = meta.glob(
  ['/src/**/*', '/index.html', '/vite.config.ts', '/tsconfig.json', '/vercel.json', '/README.md'],
  { query: '?raw', import: 'default', eager: true }
);

// Additional root files to include
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
  }
}
`;

export async function downloadProjectZip(onProgress?: (percent: number) => void): Promise<void> {
  const zip = new JSZip();

  // Add gitignore and package.json
  zip.file('.gitignore', gitignoreContent);
  zip.file('package.json', packageJsonContent);

  // Add globbed files
  for (const [filePath, content] of Object.entries(srcFiles)) {
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    if (typeof content === 'string') {
      zip.file(cleanPath, content);
    }
  }

  // Generate blob
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

  // Trigger browser download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'horloge-temps-reel-centieme-github.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
