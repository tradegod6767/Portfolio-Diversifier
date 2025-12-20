import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Get environment variables from process.env (Vercel sets these during build)
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  console.log('[Vite Build] Environment variables from process.env:')
  console.log('  VITE_SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}... (length: ${supabaseUrl.length})` : 'MISSING')
  console.log('  VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}... (length: ${supabaseAnonKey.length})` : 'MISSING')
  console.log('  NEXT_PUBLIC_APP_URL:', appUrl || 'MISSING')
  console.log('  Mode:', mode)

  // Log full URL to check for truncation
  if (supabaseUrl && supabaseUrl.length !== 45) {
    console.warn(`[Vite Build] WARNING: VITE_SUPABASE_URL length is ${supabaseUrl.length}, expected 45`)
    console.warn(`[Vite Build] Full URL: ${supabaseUrl}`)
  }

  return {
    plugins: [react()],
    define: {
      // Explicitly inject environment variables into the client bundle
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
      'import.meta.env.NEXT_PUBLIC_APP_URL': JSON.stringify(appUrl),
    },
  }
})
