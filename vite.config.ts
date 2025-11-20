import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // Replaced process.cwd() with '.' to avoid TS error: Property 'cwd' does not exist on type 'Process'
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // This exposes the API_KEY from the build environment (Vercel) to the client code
      // ensuring `process.env.API_KEY` works as written in the source.
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})