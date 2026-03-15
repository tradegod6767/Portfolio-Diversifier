import { useState, useMemo } from 'react';

/**
 * AIAnalysisDisplay - Transforms AI text into scannable, professional content
 * Parses markdown-like content and renders with proper visual hierarchy
 */
export default function AIAnalysisDisplay({ content, isPro = false, user = null }) {
  const [expandedSections, setExpandedSections] = useState({});

  // Parse and structure the AI content
  const sections = useMemo(() => parseAIContent(content), [content]);

  const toggleSection = (index) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (!content) return null;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 bg-muted border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground flex-shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2z" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="13" r="1" fill="currentColor"/>
              <circle cx="15" cy="13" r="1" fill="currentColor"/>
              <path d="M9 17h6" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">AI Portfolio Analysis</h3>
            <p className="text-xs text-muted-foreground">Personalized insights based on your holdings</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-md self-start sm:self-auto">
          <span className="w-1.5 h-1.5 bg-gain rounded-full" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
          <span className="text-xs font-medium text-muted-foreground">AI-Powered</span>
        </div>
      </div>

      {/* Content Sections */}
      <div className="p-4 flex flex-col gap-3">
        {sections.map((section, index) => (
          <AISection
            key={index}
            section={section}
            index={index}
            isExpanded={expandedSections[index] !== false}
            onToggle={() => toggleSection(index)}
          />
        ))}
      </div>

      {/* Rate Limit Notice */}
      <div className="flex items-center justify-center gap-2 px-4 py-3 bg-muted border-t border-border">
        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-xs text-muted-foreground">
          {isPro
            ? 'Pro: 100 analyses/hour'
            : user
              ? 'Free: 20 analyses/hour'
              : '5 analyses/hour'}
          {!isPro && ' · Upgrade for more'}
        </span>
      </div>
    </div>
  );
}

/**
 * Individual section component with icon and content
 */
function AISection({ section, isExpanded, onToggle }) {
  const { type, title, icon, color, items, content } = section;

  const iconSvg = getSectionIcon(icon);
  const colorClasses = getSectionColors(color);

  return (
    <div className={`bg-background border rounded-xl overflow-hidden transition-colors ${colorClasses.border}`}>
      {/* Section Header */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/50 transition-colors"
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClasses.icon}`}>
          {iconSvg}
        </div>
        <h4 className="flex-1 text-sm font-semibold text-foreground">{title}</h4>
        <svg
          className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Section Content */}
      {isExpanded && (
        <div className="px-4 pb-4 pl-[52px]">
          {type === 'bullets' && items && (
            <ul className="space-y-2.5">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className={`flex-shrink-0 mt-0.5 ${colorClasses.marker}`}>
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          )}

          {type === 'numbered' && items && (
            <ol className="space-y-3">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${colorClasses.number}`}>{i + 1}</span>
                  <span className="text-sm text-muted-foreground leading-relaxed pt-0.5">{item}</span>
                </li>
              ))}
            </ol>
          )}

          {type === 'callout' && content && (
            <div className={`px-4 py-3 rounded-lg border ${colorClasses.callout}`}>
              <p className="text-sm leading-relaxed">{content}</p>
            </div>
          )}

          {type === 'paragraph' && content && (
            <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
          )}

          {type === 'keyInsight' && content && (
            <div className="bg-muted border border-border rounded-lg p-4">
              <div className="inline-flex items-center px-2.5 py-1 bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wide rounded-md mb-3">
                Key Insight
              </div>
              <p className="text-sm text-foreground leading-relaxed font-medium">{content}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Parse AI content into structured sections
 */
function parseAIContent(text) {
  if (!text) return [];

  const sections = [];
  const lines = text.split('\n');
  let currentSection = null;
  let currentItems = [];
  let currentContent = [];

  const flushSection = () => {
    if (currentSection) {
      if (currentItems.length > 0) {
        currentSection.items = currentItems;
        currentItems = [];
      }
      if (currentContent.length > 0) {
        currentSection.content = currentContent.join(' ').trim();
        currentContent = [];
      }
      if (currentSection.items?.length > 0 || currentSection.content) {
        sections.push(currentSection);
      }
      currentSection = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) {
      if (currentContent.length > 0 && currentSection) {
        currentSection.content = currentContent.join(' ').trim();
        currentContent = [];
      }
      continue;
    }

    // Detect headers (## Header, **Header**, or HEADER:)
    const headerMatch = line.match(/^(?:#{1,3}\s*)?(?:\*\*)?([A-Za-z][A-Za-z\s&-]+?)(?:\*\*)?:?\s*$/);
    const isAllCaps = /^[A-Z][A-Z\s&-]+:?\s*$/.test(line);

    if (headerMatch || isAllCaps) {
      flushSection();
      const title = (headerMatch?.[1] || line).replace(/[*#:]/g, '').trim();
      const { icon, color, type } = detectSectionType(title);
      currentSection = { type, title, icon, color };
      continue;
    }

    // Detect bullet points
    if (line.match(/^[-•*]\s+/)) {
      if (!currentSection) {
        currentSection = { type: 'bullets', title: 'Insights', icon: 'lightbulb', color: 'neutral' };
      }
      currentSection.type = 'bullets';
      currentItems.push(line.replace(/^[-•*]\s+/, '').trim());
      continue;
    }

    // Detect numbered items
    if (line.match(/^\d+[.)]\s+/)) {
      if (!currentSection) {
        currentSection = { type: 'numbered', title: 'Recommendations', icon: 'list', color: 'gain' };
      }
      currentSection.type = 'numbered';
      currentItems.push(line.replace(/^\d+[.)]\s+/, '').trim());
      continue;
    }

    // Regular content
    if (currentSection) {
      currentContent.push(line);
    } else {
      // Create default section for orphan content
      currentSection = { type: 'paragraph', title: 'Overview', icon: 'overview', color: 'neutral' };
      currentContent.push(line);
    }
  }

  flushSection();

  // If no sections were created, create a default one
  if (sections.length === 0 && text.trim()) {
    sections.push({
      type: 'paragraph',
      title: 'Analysis Summary',
      icon: 'overview',
      color: 'neutral',
      content: text.trim()
    });
  }

  // Enhance sections with key insights
  return sections.map((section, i) => {
    // First section with substantial content becomes a key insight
    if (i === 0 && section.type === 'paragraph' && section.content && section.content.length > 100) {
      return { ...section, type: 'keyInsight' };
    }
    return section;
  });
}

/**
 * Detect section type and styling based on title keywords
 */
function detectSectionType(title) {
  const lower = title.toLowerCase();

  if (lower.includes('risk') || lower.includes('concern') || lower.includes('warning')) {
    return { icon: 'warning', color: 'loss', type: 'bullets' };
  }
  if (lower.includes('recommend') || lower.includes('action') || lower.includes('step') || lower.includes('suggestion')) {
    return { icon: 'list', color: 'gain', type: 'numbered' };
  }
  if (lower.includes('tax') || lower.includes('cost') || lower.includes('fee')) {
    return { icon: 'dollar', color: 'neutral', type: 'bullets' };
  }
  if (lower.includes('diversif') || lower.includes('allocation') || lower.includes('balance')) {
    return { icon: 'chart', color: 'neutral', type: 'bullets' };
  }
  if (lower.includes('strength') || lower.includes('positive') || lower.includes('good')) {
    return { icon: 'check', color: 'gain', type: 'bullets' };
  }
  if (lower.includes('overview') || lower.includes('summary') || lower.includes('current')) {
    return { icon: 'overview', color: 'neutral', type: 'paragraph' };
  }
  if (lower.includes('consider') || lower.includes('note') || lower.includes('important')) {
    return { icon: 'info', color: 'neutral', type: 'callout' };
  }

  return { icon: 'lightbulb', color: 'neutral', type: 'bullets' };
}

/**
 * Get icon component based on type
 */
const SECTION_ICONS = {
  warning: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  list: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  dollar: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  chart: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  overview: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  lightbulb: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
};

function getSectionIcon(iconType) {
  return SECTION_ICONS[iconType] || SECTION_ICONS.lightbulb;
}

/**
 * Get color classes for section styling
 */
function getSectionColors(color) {
  const colors = {
    gain: {
      border: 'border-gain/30',
      icon: 'bg-gain-bg text-gain',
      marker: 'text-gain',
      number: 'bg-gain-bg text-gain',
      callout: 'bg-gain-bg border-gain/30 text-gain'
    },
    loss: {
      border: 'border-loss/30',
      icon: 'bg-loss-bg text-loss',
      marker: 'text-loss',
      number: 'bg-loss-bg text-loss',
      callout: 'bg-loss-bg border-loss/30 text-loss'
    },
    neutral: {
      border: 'border-border',
      icon: 'bg-muted text-muted-foreground',
      marker: 'text-muted-foreground',
      number: 'bg-muted text-foreground',
      callout: 'bg-muted border-border text-muted-foreground'
    }
  };

  return colors[color] || colors.neutral;
}
