import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'RebalanceKit';
const SITE_URL = 'https://rebalancekit.com';
const DEFAULT_DESCRIPTION =
  'Calculate exact portfolio rebalancing trades in seconds. Tax-efficient add-only mode, health scoring, AI analysis, and PDF reports. Free to use, no signup required.';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
const TWITTER_HANDLE = '@rebalancekit';

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '',
  canonicalUrl,
  ogImage = DEFAULT_OG_IMAGE,
  ogImageAlt = 'RebalanceKit — Portfolio Rebalancing Tool',
  ogType = 'website',
  publishedTime,
  modifiedTime,
  author,
  robots,
  jsonLd,
  noindex = false,
  hreflangLinks,
}) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonical = canonicalUrl || `${SITE_URL}${path}`;
  const robotsContent = noindex ? 'noindex, nofollow' : robots || 'index, follow';
  const jsonLdArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={canonical} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={ogImageAlt} />
      <meta property="og:locale" content="en_US" />

      {ogType === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {ogType === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {ogType === 'article' && author && (
        <meta property="article:author" content={author} />
      )}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {hreflangLinks?.map((link) => (
        <link key={link.lang} rel="alternate" hrefLang={link.lang} href={link.href} />
      ))}
      {hreflangLinks && hreflangLinks.length > 0 && (
        <link rel="alternate" hrefLang="x-default" href={canonical} />
      )}

      {jsonLdArray.map((data, i) => (
        <script key={`jsonld-${i}`} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
}
