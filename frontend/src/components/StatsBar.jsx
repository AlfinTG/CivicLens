function StatsBar({ stats }) {
  const items = [
    { label: 'Total Issues', value: stats.total, border: 'border-l-gray-300' },
    { label: 'Open', value: stats.open, border: 'border-l-red-400' },
    { label: 'In Progress', value: stats.in_progress, border: 'border-l-amber-400' },
    { label: 'Resolved', value: stats.resolved, border: 'border-l-green-400' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.label} className={`card px-5 py-4 border-l-4 shadow-sm ${item.border}`}>
          <p className="text-sm font-medium text-gray-500 mb-1">{item.label}</p>
          <p className="text-3xl font-bold text-gray-900 tabular-nums tracking-tight">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export default StatsBar;
