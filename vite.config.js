import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Bundle analyzer: run `npm run analyze` to generate a visual report.
// Requires: npm install -D rollup-plugin-visualizer
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Get environment variables from process.env (Vercel sets these during build)
  // SECURITY: No hardcoded fallbacks - env vars MUST be set in deployment
  const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim() || ''
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY?.trim() || ''
  const appUrl = process.env.VITE_APP_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim() || ''

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
  console.log('  VITE_APP_URL:', appUrl || 'MISSING (optional)')
  console.log('  Mode:', mode)

  return {
    plugins: [
      react(),
      ...(process.env.ANALYZE ? [visualizer({ open: true, gzipSize: true })] : []),
    ],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
      'import.meta.env.VITE_APP_URL': JSON.stringify(appUrl),
      // Note: VITE_APP_URL is already injected above; NEXT_PUBLIC_ prefix is not Vite convention.
      // Removed NEXT_PUBLIC_APP_URL define — use VITE_APP_URL throughout the codebase.
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            recharts: ['recharts'],
            pdf: ['jspdf', 'html2canvas', 'jspdf-autotable'],
          },
        },
      },
    },
  }
})
