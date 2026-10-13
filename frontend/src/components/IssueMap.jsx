import { useEffect, useRef, useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { SeverityBadge, StatusBadge, getCategoryIcon } from './StatusBadge';

const SEVERITY_COLORS = {
  1: '#006948', // green / low
  2: '#008378', // teal / monitored
  3: '#f59e0b', // amber / moderate
  4: '#ea580c', // orange / high
  5: '#ba1a1a', // red / critical
};

function MapBoundsController({ issues }) {
  const map = useMap();
  const prevIds = useRef('');

  useEffect(() => {
    if (issues && issues.length > 0) {
      const validIssues = issues.filter(
        (i) => i.lat != null && i.lng != null && !isNaN(i.lat) && !isNaN(i.lng)
      );

      if (validIssues.length > 0) {
        const currentIds = validIssues.map((i) => i.id).sort().join(',');
        if (currentIds !== prevIds.current) {
          prevIds.current = currentIds;
          const lats = validIssues.map((i) => i.lat);
          const lngs = validIssues.map((i) => i.lng);

          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          const minLng = Math.min(...lngs);
          const maxLng = Math.max(...lngs);

          const padLat = (maxLat - minLat) * 0.12 || 0.01;
          const padLng = (maxLng - minLng) * 0.12 || 0.01;

          map.fitBounds(
            [
              [minLat - padLat, minLng - padLng],
              [maxLat + padLat, maxLng + padLng],
            ],
            { maxZoom: 16 }
          );
        }
      }
    }
  }, [issues, map]);

  return null;
}

function MapResizeController() {
  const map = useMap();
  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [map]);
  return null;
}

function IssueMap({ issues = [], onIssueClick, selectedIssueId }) {
  const [activeLayerFilter, setActiveLayerFilter] = useState('all');

  // Filter issues by map quick filters
  const visibleIssues = useMemo(() => {
    if (activeLayerFilter === 'all') return issues;
    if (activeLayerFilter === 'pothole') return issues.filter((i) => i.type === 'pothole' || i.type === 'damaged_road');
    if (activeLayerFilter === 'water') return issues.filter((i) => i.type === 'drain_overflow' || i.department === 'Water & Drainage');
    if (activeLayerFilter === 'lighting') return issues.filter((i) => i.type === 'broken_streetlight' || i.department === 'Electricity Board');
    if (activeLayerFilter === 'sanitation') return issues.filter((i) => i.type === 'garbage' || i.department === 'Sanitation');
    return issues;
  }, [issues, activeLayerFilter]);

  // Default center (Indore or first valid issue)
  const defaultCenter = useMemo(() => {
    const firstWithCoords = issues.find((i) => i.lat != null && i.lng != null);
    if (firstWithCoords) return [firstWithCoords.lat, firstWithCoords.lng];
    return [22.7196, 75.8577];
  }, [issues]);

  return (
    <div className="flex flex-col h-full w-full bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/30 shadow-xs">
      {/* Map Header & Filter Toolbar */}
      <div className="p-3.5 border-b border-outline-variant/20 flex flex-wrap items-center justify-between gap-3 bg-surface-container-lowest z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">map</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-on-surface">Cartographic Sensor Feed & Active Clusters</h3>
            <p className="text-xs text-secondary font-mono">
              {visibleIssues.length} active sensor pins plotted
            </p>
          </div>
        </div>

        {/* Quick Layer Filter Buttons */}
        <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveLayerFilter('all')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              activeLayerFilter === 'all'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveLayerFilter('pothole')}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-all ${
              activeLayerFilter === 'pothole'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-error" />
            <span>Potholes</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveLayerFilter('water')}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-all ${
              activeLayerFilter === 'water'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-tertiary" />
            <span>Water</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveLayerFilter('lighting')}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-all ${
              activeLayerFilter === 'lighting'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Lighting</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveLayerFilter('sanitation')}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-all ${
              activeLayerFilter === 'sanitation'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span>Sanitation</span>
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative flex-1 w-full min-h-[380px] z-0">
        <MapContainer
          center={defaultCenter}
          zoom={14}
          minZoom={4}
          className="h-full w-full z-0"
          zoomControl={true}
        >
          <MapBoundsController issues={visibleIssues} />
          <MapResizeController />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {visibleIssues.map((issue) => {
            if (issue.lat == null || issue.lng == null || isNaN(issue.lat) || isNaN(issue.lng)) {
              return null;
            }

            const isSelected = issue.id === selectedIssueId;
            const color = SEVERITY_COLORS[issue.severity] || '#565e74';

            return (
              <CircleMarker
                key={issue.id}
                center={[issue.lat, issue.lng]}
                radius={isSelected ? 11 : issue.severity >= 4 ? 9 : 7}
                fillColor={color}
                color={isSelected ? '#0b1c30' : '#ffffff'}
                weight={isSelected ? 3 : 2}
                opacity={1}
                fillOpacity={0.92}
                eventHandlers={{
                  click: () => onIssueClick && onIssueClick(issue),
                }}
              >
                <Popup closeButton={false}>
                  <div
                    className="p-1 min-w-[210px] max-w-[260px] cursor-pointer"
                    onClick={() => onIssueClick && onIssueClick(issue)}
                  >
                    {issue.image_url && (
                      <div className="relative w-full h-28 rounded-lg overflow-hidden bg-surface-container mb-2">
                        <img
                          src={issue.image_url}
                          alt="Issue visual evidence"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <div className="absolute top-1.5 left-1.5">
                          <SeverityBadge severity={issue.severity} />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono text-xs font-bold text-primary">#CVL-{issue.id}</span>
                      <StatusBadge status={issue.status} />
                    </div>

                    <h4 className="font-bold text-sm text-on-surface capitalize leading-tight flex items-center gap-1">
                      <span className="material-symbols-outlined text-base text-secondary">
                        {getCategoryIcon(issue.type)}
                      </span>
                      <span>{issue.type.replace(/_/g, ' ')}</span>
                    </h4>

                    <p className="text-xs text-secondary mt-1 line-clamp-2 leading-relaxed">
                      {issue.description}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-outline-variant/30 flex items-center justify-between text-xs font-mono">
                      <span className="text-secondary font-medium">
                        Score: {issue.priority_score?.toFixed(1) || '0.0'}
                      </span>
                      <span className="text-primary font-bold hover:underline">
                        Inspect Panel →
                      </span>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* HUD Live GPS Status Overlay */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <div className="px-3 py-1.5 rounded-lg bg-surface-container-lowest/95 backdrop-blur-md shadow-sm border border-outline-variant/30 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono font-bold text-on-surface">GIS Cartography Live</span>
            <span className="text-xs font-mono text-secondary hidden sm:inline">
              ({visibleIssues.length} Pins)
            </span>
          </div>
        </div>

        {/* Empty state overlay */}
        {visibleIssues.length === 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-container-lowest/70 backdrop-blur-xs pointer-events-none">
            <div className="bg-surface-container-lowest px-4 py-3 rounded-xl shadow-md border border-outline-variant/30 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">map</span>
              <p className="text-secondary text-xs font-semibold">No issues matching this filter</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default IssueMap;
