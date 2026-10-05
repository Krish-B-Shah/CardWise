import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

function copyManifestPlugin() {
  return {
    name: 'copy-manifest-plugin',
    closeBundle() {
      const srcManifest = resolve(__dirname, 'manifest.json');
      const distManifest = resolve(__dirname, 'dist/manifest.json');
      if (fs.existsSync(srcManifest)) {
        fs.copyFileSync(srcManifest, distManifest);
        console.log('[Build] Copied manifest.json to dist/');
      }

      // Copy icons directory to dist/icons
      const srcIcons = resolve(__dirname, 'icons');
      const distIcons = resolve(__dirname, 'dist/icons');
      if (fs.existsSync(srcIcons)) {
        if (!fs.existsSync(distIcons)) {
          fs.mkdirSync(distIcons, { recursive: true });
        }
        for (const file of fs.readdirSync(srcIcons)) {
          fs.copyFileSync(resolve(srcIcons, file), resolve(distIcons, file));
        }
        console.log('[Build] Copied icons to dist/icons/');
      }

      // If popup.html is placed inside dist/src/popup/popup.html, move it to dist/popup.html
      const nestedPopup = resolve(__dirname, 'dist/src/popup/popup.html');
      const targetPopup = resolve(__dirname, 'dist/popup.html');
      if (fs.existsSync(nestedPopup)) {
        fs.copyFileSync(nestedPopup, targetPopup);
      }
    }
  };
}

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        background: resolve(__dirname, 'src/background/serviceWorker.ts')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  },
  plugins: [copyManifestPlugin()]
});
