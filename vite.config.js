import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  console.log('[Vite Build] Loading environment variables:')
  console.log('  VITE_SUPABASE_URL:', env.VITE_SUPABASE_URL ? 'SET' : 'MISSING')
  console.log('  VITE_SUPABASE_ANON_KEY:', env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING')
  console.log('  Mode:', mode)

  return {
    plugins: [react()],
    define: {
      // Expose Vercel environment variables to the client
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY),
      'import.meta.env.NEXT_PUBLIC_APP_URL': JSON.stringify(env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL),
    },
  }
})
