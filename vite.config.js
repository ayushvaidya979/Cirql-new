import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // onnxruntime-web locates its .wasm via import.meta.url; pre-bundling breaks that in dev.
  optimizeDeps: { exclude: ['onnxruntime-web'] },
})
