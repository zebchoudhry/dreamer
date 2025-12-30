
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // This 'magic' line makes process.env.API_KEY work in the browser on Vercel
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
});
