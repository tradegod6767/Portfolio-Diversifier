export function getBlogPostJsonLd(post) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.excerpt,
      image: post.ogImage,
      author: {
        '@type': 'Person',
        name: post.author,
        worksFor: { '@id': 'https://rebalancekit.com/#organization' },
      },
      publisher: {
        '@type': 'Organization',
        name: 'RebalanceKit',
        logo: {
          '@type': 'ImageObject',
          url: 'https://rebalancekit.com/favicon-32x32.png',
        },
      },
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      mainEntityOfPage: `https://rebalancekit.com/blog/${post.slug}`,
      wordCount: post.wordCount,
      keywords: post.tags,
      articleSection: 'Investment Guides',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rebalancekit.com' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://rebalancekit.com/blog' },
        {
          '@type': 'ListItem',
          position: 3,
          name: post.title,
          item: `https://rebalancekit.com/blog/${post.slug}`,
        },
      ],
    },
  ];
}
