import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import webfontDownload from 'vite-plugin-webfont-dl'
import { createRequire } from 'module'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

// vite-plugin-prerender's ESM build calls require() internally — load CJS build instead
const _require = createRequire(import.meta.url)
const vitePrerender = _require('vite-plugin-prerender')
const { PuppeteerRenderer } = vitePrerender

// Find a modern Chrome executable (Puppeteer 1.x bundles Chrome 77 which can't run ES2020)
function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH
  const candidates = process.platform === 'win32'
    ? ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
       'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe']
    : process.platform === 'darwin'
    ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
    : ['/usr/bin/google-chrome-stable', '/usr/bin/google-chrome',
       '/usr/bin/chromium-browser', '/usr/bin/chromium']
  for (const p of candidates) {
    if (fs.existsSync(p)) return p
  }
  // Last resort: try `which google-chrome`
  try { return execSync('which google-chrome 2>/dev/null || which chromium 2>/dev/null').toString().trim() } catch {}
  return undefined // fallback to puppeteer's bundled chrome
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Get environment variables from process.env (Vercel sets these during build)
  const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim() || ''
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY?.trim() || ''
  const appUrl = process.env.VITE_APP_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim() || ''

  const missingVars = []
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL')
  if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY')

  if (missingVars.length > 0 && mode === 'production') {
    console.error(`[Vite Build] ERROR: Missing required environment variables: ${missingVars.join(', ')}`)
  }

  console.log('[Vite Build] Environment variables:')
  console.log('  VITE_SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}... (length: ${supabaseUrl.length})` : 'MISSING')
  console.log('  VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}... (length: ${supabaseAnonKey.length})` : 'MISSING')
  console.log('  VITE_APP_URL:', appUrl || 'MISSING (optional)')
  console.log('  Mode:', mode)

  return {
    plugins: [
      react(),

      // Self-host Google Fonts at build time (eliminates render-blocking external CSS)
      webfontDownload([
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      ]),

      // Build-time image optimization
      ViteImageOptimizer({
        png: { quality: 80 },
        jpeg: { quality: 80 },
        webp: { quality: 80, lossless: false },
        avif: { quality: 65, lossless: false },
      }),

      // Prerender marketing pages at build time (skip during dev and analyze runs)
      ...(mode === 'production' && !process.env.ANALYZE
        ? [
            vitePrerender({
              staticDir: path.join(process.cwd(), 'dist'),
              routes: [
                '/',
                '/calculator',
                '/pricing',
                '/features',
                '/about',
                '/changelog',
                '/guides/how-to-rebalance-portfolio',
                '/guides/rebalancing-strategies',
                '/guides/how-often-to-rebalance',
                '/compare/best-rebalancing-tools',
                '/compare/portfolio-visualizer-alternative',
                '/compare/passiv-alternative',
                '/compare/m1-finance-alternative',
                '/compare/robo-advisor-alternative',
                '/portfolios/three-fund-portfolio',
                '/portfolios/60-40-portfolio',
                '/portfolios/lazy-portfolio',
                '/use-cases/401k-rebalancing',
                '/use-cases/ira-rebalancing',
                '/features/tax-smart-rebalancing',
                '/features/drift-tracking',
                '/features/multi-account',
                '/features/automatic-rebalancing',
              ],
              renderer: new PuppeteerRenderer({
                renderAfterDocumentEvent: 'prerender-ready',
                inject: { isPrerendering: true },
                headless: true,
                ...(findChrome() ? { executablePath: findChrome() } : {}),
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                skipThirdPartyRequests: true,
              }),
            }),
          ]
        : []),

      // Bundle analyzer (only when ANALYZE=true)
      ...(process.env.ANALYZE
        ? [visualizer({ open: true, gzipSize: true, brotliSize: true, filename: 'dist/stats.html' })]
        : []),
    ],

    // Only define these when the values are actually available in process.env (e.g. Vercel CI).
    // Locally, Vite reads VITE_* vars from .env automatically — don't override with empty strings.
    define: {
      ...(supabaseUrl && { 'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl) }),
      ...(supabaseAnonKey && { 'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey) }),
      ...(appUrl && { 'import.meta.env.VITE_APP_URL': JSON.stringify(appUrl) }),
    },

    build: {
      target: 'es2020',
      cssTarget: 'chrome100',
      sourcemap: true,
      chunkSizeWarningLimit: 400,
      reportCompressedSize: true,

      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',

          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
                return 'react-vendor'
              }
              if (id.includes('react-router') || id.includes('@remix-run')) {
                return 'router-vendor'
              }
              if (id.includes('recharts') || id.includes('d3')) {
                return 'charts-vendor'
              }
              if (id.includes('jspdf') || id.includes('html2canvas')) {
                return 'pdf-vendor'
              }
              if (id.includes('react-helmet')) {
                return 'seo-vendor'
              }
              return 'vendor'
            }
          },
        },
      },
    },

    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
  }
})
