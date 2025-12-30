import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode`. 
  // Empty string as 3rd arg allows loading variables without VITE_ prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Explicitly check for API_KEY in env or process.env
  const apiKey = env.API_KEY || process.env.API_KEY || '';

  return {
    plugins: [react()],
    define: {
      // Direct replacement of the process.env.API_KEY string in source code
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
    }
  };
});