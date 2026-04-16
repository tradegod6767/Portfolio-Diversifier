import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { getBlogPostJsonLd } from '../lib/blog-jsonld';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
        } else {
          setPost(data);
        }
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="h-8 bg-muted rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
          <div className="h-64 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <>
        <SEO title="Post Not Found" noindex={true} />
        <div className="px-4 sm:px-6 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Post not found</h1>
          <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground underline">
            ← Back to blog
          </Link>
        </div>
      </>
    );
  }

  const jsonLd = getBlogPostJsonLd({
    title: post.title,
    excerpt: post.excerpt,
    slug: post.slug,
    ogImage: post.og_image || 'https://rebalancekit.com/og-image.png',
    publishedAt: post.published_at,
    updatedAt: post.updated_at,
    author: post.author || 'RebalanceKit',
    wordCount: post.word_count || 0,
    tags: post.tags || [],
  });

  return (
    <>
      <SEO
        title={post.title}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
        ogImage={post.og_image}
        ogType="article"
        publishedTime={post.published_at}
        modifiedTime={post.updated_at}
        author={post.author}
        jsonLd={jsonLd}
      />

      <article className="px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>›</span>
            <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <span>›</span>
            <span className="text-foreground">{post.title}</span>
          </nav>

          <header className="mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">{post.title}</h1>
            <p className="text-lg text-muted-foreground mb-4">{post.excerpt}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {post.author && <span>{post.author}</span>}
              {post.published_at && (
                <span>{new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              )}
              {post.word_count > 0 && <span>{Math.ceil(post.word_count / 200)} min read</span>}
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-sm max-w-none text-foreground">
            <div
              className="space-y-4 text-muted-foreground leading-relaxed [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2 [&_strong]:text-foreground [&_a]:text-foreground [&_a]:underline [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="mt-10 pt-6 border-t border-border flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-10 pt-8 border-t border-border bg-muted/30 rounded-xl p-6">
            <h2 className="text-base font-semibold text-foreground mb-2">Ready to rebalance your portfolio?</h2>
            <p className="text-sm text-muted-foreground mb-4">Free calculator — no signup required.</p>
            <Link
              to="/app"
              className="inline-flex items-center justify-center h-9 px-5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              Try Calculator Free
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
