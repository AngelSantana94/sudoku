import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/sudoku/',
  plugins: [
    tailwindcss(),
  ],
  test: {
    globals: true,      
    environment: 'jsdom',
  },
});