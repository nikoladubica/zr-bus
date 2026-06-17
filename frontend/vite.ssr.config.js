import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    ssr: true,
    outDir: '.vite-ssg-temp',
    rollupOptions: {
      input: 'src/entry-server.jsx',
      output: {
        format: 'esm',
        entryFileNames: 'entry-server.mjs',
      },
    },
  },
  ssr: {
    noExternal: ['react-helmet-async'],
  },
});
