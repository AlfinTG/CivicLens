function StatsBar({ stats }) {
  const items = [
    { label: 'Total Issues', value: stats.total },
    { label: 'Open', value: stats.open },
    { label: 'In Progress', value: stats.in_progress },
    { label: 'Resolved', value: stats.resolved },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item) => (
        <div key={item.label} className="card px-4 py-3">
          <p className="text-2xl font-semibold text-gray-900 tabular-nums">{item.value}</p>
          <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

export default StatsBar;
