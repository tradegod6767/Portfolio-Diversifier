-- Migration: Create blog_posts table for content marketing

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  published boolean DEFAULT false,
  published_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  author text DEFAULT 'RebalanceKit',
  og_image text DEFAULT 'https://rebalancekit.com/og-image.png',
  tags text[] DEFAULT '{}',
  word_count integer DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published) WHERE published = true;

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public read access for published posts
CREATE POLICY "Public can read published posts" ON blog_posts
  FOR SELECT USING (published = true);
