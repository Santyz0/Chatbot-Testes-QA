import { defineConfig } from 'vitest/config' 
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  test: {
    environment: 'jsdom', // Simula o navegador para os testes funcionarem
    globals: true
  }
})