function StatsBar({ stats }) {
  const items = [
    { label: 'Total Issues', value: stats.total },
    { label: 'Open', value: stats.open },
    { label: 'In Progress', value: stats.in_progress },
    { label: 'Resolved', value: stats.resolved },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.label} className="card p-4 flex flex-col justify-center shadow-sm bg-white border border-gray-200">
          <p className="text-sm font-medium text-gray-500 mb-1">{item.label}</p>
          <p className="text-3xl font-bold text-gray-900 tabular-nums leading-none tracking-tight">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export default StatsBar;
