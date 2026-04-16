import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { CHANGELOG as changelog } from '../data/changelog';

export default function Changelog() {
  return (
    <>
      <SEO
        title="Changelog — What's New in RebalanceKit"
        description="Latest updates, improvements, and bug fixes in RebalanceKit. See what's new in the portfolio rebalancing calculator."
        path="/changelog"
      />

      <section className="px-4 sm:px-6 py-16 md:py-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">Changelog</h1>
          <p className="text-lg text-muted-foreground mb-10">
            What's new in RebalanceKit.
          </p>

          <div className="space-y-10">
            {changelog.map((version) => (
              <div key={version.version} className="border-l-2 border-border pl-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-base font-semibold text-foreground">v{version.version}</span>
                  {version.date && (
                    <span className="text-sm text-muted-foreground">{version.date}</span>
                  )}
                  {version.isNew && (
                    <span className="text-xs bg-gain-bg text-gain px-2 py-0.5 rounded font-medium">New</span>
                  )}
                </div>
                {version.changes && (
                  <ul className="space-y-2">
                    {version.changes.map((change, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-gain mt-0.5">+</span>
                        <span>{typeof change === 'string' ? change : change.text || change.description || JSON.stringify(change)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <Link to="/app" className="text-sm font-medium text-foreground hover:underline">
              ← Back to calculator
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
