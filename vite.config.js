import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Get environment variables from process.env (Vercel sets these during build)
  // SECURITY: No hardcoded fallbacks - env vars MUST be set in deployment
  const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim() || ''
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY?.trim() || ''
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || ''

  // Validate required environment variables
  const missingVars = []
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL')
  if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY')

  if (missingVars.length > 0 && mode === 'production') {
    console.error(`[Vite Build] ERROR: Missing required environment variables: ${missingVars.join(', ')}`)
    console.error('[Vite Build] The app will not function correctly without these variables.')
  }

  console.log('[Vite Build] Environment variables:')
  console.log('  VITE_SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}... (length: ${supabaseUrl.length})` : 'MISSING')
  console.log('  VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}... (length: ${supabaseAnonKey.length})` : 'MISSING')
  console.log('  NEXT_PUBLIC_APP_URL:', appUrl || 'MISSING (optional)')
  console.log('  Mode:', mode)

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
      'import.meta.env.NEXT_PUBLIC_APP_URL': JSON.stringify(appUrl),
    },
  }
})
