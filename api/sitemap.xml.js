import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const staticPages = [
  { loc: '/', lastmod: '2026-04-01', changefreq: 'weekly', priority: 1.0 },
  { loc: '/calculator', lastmod: '2026-04-01', changefreq: 'weekly', priority: 1.0 },
  { loc: '/pricing', lastmod: '2026-04-01', changefreq: 'monthly', priority: 0.9 },
  { loc: '/features', lastmod: '2026-04-01', changefreq: 'monthly', priority: 0.9 },
  { loc: '/blog', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: 0.8 },
  { loc: '/guides/how-to-rebalance-portfolio', lastmod: '2026-04-01', changefreq: 'monthly', priority: 0.9 },
  { loc: '/guides/rebalancing-strategies', lastmod: '2026-04-01', changefreq: 'monthly', priority: 0.8 },
  { loc: '/guides/how-often-to-rebalance', lastmod: '2026-04-01', changefreq: 'monthly', priority: 0.8 },
  { loc: '/compare/best-rebalancing-tools', lastmod: '2026-04-01', changefreq: 'monthly', priority: 0.7 },
  { loc: '/compare/portfolio-visualizer-alternative', lastmod: '2026-04-01', changefreq: 'monthly', priority: 0.7 },
  { loc: '/compare/passiv-alternative', lastmod: '2026-04-01', changefreq: 'monthly', priority: 0.6 },
  { loc: '/compare/m1-finance-alternative', lastmod: '2026-04-01', changefreq: 'monthly', priority: 0.6 },
  { loc: '/compare/robo-advisor-alternative', lastmod: '2026-04-01', changefreq: 'monthly', priority: 0.6 },
  { loc: '/portfolios/three-fund-portfolio', lastmod: '2026-04-01', changefreq: 'monthly', priority: 0.7 },
  { loc: '/portfolios/60-40-portfolio', lastmod: '2026-04-01', changefreq: 'monthly', priority: 0.7 },
  { loc: '/portfolios/lazy-portfolio', lastmod: '2026-04-01', changefreq: 'monthly', priority: 0.6 },
  { loc: '/use-cases/401k-rebalancing', lastmod: '2026-04-01', changefreq: 'monthly', priority: 0.6 },
  { loc: '/use-cases/ira-rebalancing', lastmod: '2026-04-01', changefreq: 'monthly', priority: 0.5 },
  { loc: '/features/tax-smart-rebalancing', lastmod: '2026-04-01', changefreq: 'monthly', priority: 0.6 },
  { loc: '/features/drift-tracking', lastmod: '2026-04-01', changefreq: 'monthly', priority: 0.6 },
  { loc: '/features/multi-account', lastmod: '2026-04-01', changefreq: 'monthly', priority: 0.6 },
  { loc: '/features/automatic-rebalancing', lastmod: '2026-04-01', changefreq: 'monthly', priority: 0.5 },
  { loc: '/about', lastmod: '2026-04-01', changefreq: 'monthly', priority: 0.6 },
  { loc: '/changelog', lastmod: '2026-04-01', changefreq: 'weekly', priority: 0.5 },
  { loc: '/terms', lastmod: '2026-04-01', changefreq: 'yearly', priority: 0.3 },
  { loc: '/privacy', lastmod: '2026-04-01', changefreq: 'yearly', priority: 0.3 },
];

export default async function handler(_req, res) {
  const baseUrl = 'https://rebalancekit.com';

  let blogPages = [];
  try {
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('published', true)
      .order('updated_at', { ascending: false });

    blogPages = (posts || []).map((post) => ({
      loc: `/blog/${post.slug}`,
      lastmod: new Date(post.updated_at).toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: 0.7,
    }));
  } catch {
    // blog_posts table may not exist yet — continue with static pages only
  }

  const allPages = [...staticPages, ...blogPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).send(sitemap);
}
