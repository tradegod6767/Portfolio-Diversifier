import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I rebalance a three-fund portfolio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Enter your VTI (or VTSAX), VXUS (or VTIAX), and BND (or VBTLX) holdings with current values and target percentages. The calculator shows exactly how much to buy or sell of each fund to restore your allocation. Use add-only mode to rebalance without selling in taxable accounts.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the three-fund portfolio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The three-fund portfolio is a simple, diversified investment strategy popularized by the Bogleheads community. It consists of three index funds: total US stock market, total international stock market, and total bond market. Common ETF implementations: VTI + VXUS + BND (Vanguard), FSKAX + FTIHX + FXNAX (Fidelity).',
      },
    },
  ],
};

export default function ThreeFundPortfolio() {
  return (
    <>
      <SEO
        title="Three-Fund Portfolio Rebalancing Calculator & Guide"
        description="Rebalance your Bogleheads three-fund portfolio in minutes. Free calculator for US stocks, international stocks, and bonds. Get exact buy/sell amounts instantly."
        path="/portfolios/three-fund-portfolio"
        jsonLd={faqJsonLd}
      />
      <article className="px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>›</span>
            <span className="text-foreground">Three-Fund Portfolio</span>
          </nav>

          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            Three-fund portfolio rebalancing calculator
          </h1>
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            The Bogleheads three-fund portfolio is one of the most popular investment strategies for DIY investors. This free calculator helps you rebalance it in minutes.
          </p>

          {/* CTA */}
          <div className="bg-card border border-border rounded-xl p-6 mb-10">
            <h2 className="text-base font-semibold text-foreground mb-2">Interactive three-fund rebalancing calculator</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Pre-configured with VTI/VXUS/BND defaults. Enter your values and get instant recommendations.
            </p>
            <Link
              to="/app"
              className="inline-flex items-center h-9 px-5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              Open Calculator (Pre-configured) →
            </Link>
          </div>

          <div className="space-y-10 text-muted-foreground">
            {[
              'What is the three-fund portfolio?',
              'Common three-fund allocations by age',
              'How to rebalance step by step',
              'Tax-efficient rebalancing across multiple accounts',
              'How often to rebalance',
              'FAQ',
            ].map((heading) => (
              <section key={heading}>
                <h2 className="text-2xl font-semibold text-foreground mb-3">{heading}</h2>
                <p className="leading-relaxed">{/* TODO: expand content */}Coming soon.</p>
              </section>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-border space-y-2">
            {[
              { href: '/calculator', label: 'Free rebalancing calculator' },
              { href: '/portfolios/60-40-portfolio', label: '60/40 portfolio calculator' },
              { href: '/guides/how-to-rebalance-portfolio', label: 'How to rebalance guide' },
            ].map((item) => (
              <Link key={item.href} to={item.href} className="block text-sm text-muted-foreground hover:text-foreground hover:underline">
                {item.label} →
              </Link>
            ))}
          </div>
        </div>
      </article>
    </>
  );
}
