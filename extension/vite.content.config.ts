import { defineConfig } from 'vite';
import { resolve } from 'path';

// Manifest content scripts are classic scripts; bundle their dependencies into
// one IIFE rather than emitting shared ES module imports.
export default defineConfig({
  build: {
    outDir: 'dist', emptyOutDir: false, target: 'es2022',
    lib: { entry: resolve(__dirname, 'src/content/contentScript.ts'), name: 'CardWiseContent', formats: ['iife'], fileName: () => 'contentScript.js' }
  }
});
