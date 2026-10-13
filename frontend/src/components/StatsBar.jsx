function StatsBar({ stats }) {
  if (!stats) return null;

  const total = stats.total || 0;
  const open = stats.open || 0;
  const inProgress = stats.in_progress || 0;
  const resolved = stats.resolved || 0;
  const openRatio = total > 0 ? ((open / total) * 100).toFixed(0) : '0';

  const cards = [
    {
      title: 'Total Reports',
      subtitle: 'Recorded incidents',
      value: total,
      badgeText: '+12%',
      badgeType: 'positive',
      icon: 'stacked_bar_chart',
      iconBoxClass: 'bg-primary/10 text-primary',
      footerLabel: 'Telemetry vs historical median',
      hasSparkline: true,
    },
    {
      title: 'Open Issues',
      subtitle: 'Awaiting triage & review',
      value: open,
      badgeText: `${openRatio}% active`,
      badgeType: 'warning',
      icon: 'warning',
      iconBoxClass: 'bg-error-container text-error',
      footerLabel: 'Awaiting initial queue triage',
      footerHighlight: `${open} pending`,
    },
    {
      title: 'In Progress & Dispatched',
      subtitle: 'Field operations deployed',
      value: inProgress,
      badgeText: 'Active Crews',
      badgeType: 'neutral',
      icon: 'local_shipping',
      iconBoxClass: 'bg-secondary-container text-on-secondary-fixed',
      footerLabel: 'Active field units assigned',
      footerHighlight: 'Civic Rapid Response',
    },
    {
      title: 'Resolved & Closed',
      subtitle: 'Verified remediation',
      value: resolved,
      badgeText: '+18% Eff.',
      badgeType: 'positive',
      icon: 'verified',
      iconBoxClass: 'bg-primary/10 text-primary',
      footerLabel: 'Average turnaround SLA',
      footerHighlight: '~24-48h',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                {card.title}
              </span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-3xl font-extrabold text-on-surface tracking-tight font-mono">
                  {card.value}
                </span>
                {card.badgeType === 'positive' && (
                  <span className="inline-flex items-center text-xs font-bold font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    <span className="material-symbols-outlined text-xs mr-0.5">arrow_upward</span>
                    {card.badgeText}
                  </span>
                )}
                {card.badgeType === 'warning' && (
                  <span className="inline-flex items-center text-xs font-bold text-error bg-error-container px-2 py-0.5 rounded-full">
                    {card.badgeText}
                  </span>
                )}
                {card.badgeType === 'neutral' && (
                  <span className="inline-flex items-center text-xs font-semibold text-secondary bg-surface-container-high px-2 py-0.5 rounded-full">
                    {card.badgeText}
                  </span>
                )}
              </div>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.iconBoxClass}`}>
              <span className="material-symbols-outlined text-xl">{card.icon}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs text-secondary">
            <span className="truncate pr-2">{card.footerLabel}</span>
            {card.hasSparkline ? (
              <svg className="w-20 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 100 24">
                <path d="M0 20 L15 17 L30 19 L45 12 L60 14 L75 8 L90 10 L100 3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
              </svg>
            ) : (
              <span className="font-semibold font-mono text-on-surface shrink-0">
                {card.footerHighlight}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsBar;
