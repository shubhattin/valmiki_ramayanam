import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@api': path.resolve(__dirname, '../src/api')
    }
  }
});
