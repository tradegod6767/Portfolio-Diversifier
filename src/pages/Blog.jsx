import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('slug, title, excerpt, published_at, author, tags')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .then(({ data }) => {
        setPosts(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <SEO
        title="Blog — Portfolio Rebalancing Guides & Strategies"
        description="In-depth guides on portfolio rebalancing strategies, tax optimization, and investment allocation. Written for DIY investors managing their own portfolios."
        path="/blog"
      />

      <section className="px-4 sm:px-6 py-16 md:py-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">Blog</h1>
          <p className="text-lg text-muted-foreground mb-10">
            Guides on portfolio rebalancing, tax optimization, and investment strategies for DIY investors.
          </p>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-muted-foreground mb-4">Blog posts coming soon.</p>
              <p className="text-sm text-muted-foreground">
                In the meantime, check out our{' '}
                <Link to="/guides/how-to-rebalance-portfolio" className="text-foreground hover:underline">
                  rebalancing guide
                </Link>.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="block bg-card border border-border rounded-xl p-6 hover:border-foreground/30 transition-colors"
                >
                  <h2 className="text-lg font-semibold text-foreground mb-2">{post.title}</h2>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {post.published_at && (
                      <span>{new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    )}
                    {post.author && <span>{post.author}</span>}
                    {post.tags?.slice(0, 2).map((tag) => (
                      <span key={tag} className="bg-muted px-2 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Recommended guides</h2>
            <div className="space-y-2">
              {[
                { href: '/guides/how-to-rebalance-portfolio', label: 'How to rebalance your portfolio' },
                { href: '/guides/rebalancing-strategies', label: 'Portfolio rebalancing strategies compared' },
                { href: '/guides/how-often-to-rebalance', label: 'How often should you rebalance?' },
              ].map((item) => (
                <Link key={item.href} to={item.href} className="block text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline">
                  {item.label} →
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
