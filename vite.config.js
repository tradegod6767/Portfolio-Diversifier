import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Get environment variables from process.env (Vercel sets these during build)
  // Trim any whitespace that might have been added
  const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim() || 'https://gfuarcyulekmrkivcjzk.supabase.co'
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY?.trim() || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmdWFyY3l1bGVrbXJraXZjanprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxODkxNzcsImV4cCI6MjA4MTc2NTE3N30.IepoTNmI_3M25wUnxuNjndivkQF3A1nQ8GCn-T98sFs'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || 'https://rebalancekit.com'

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
