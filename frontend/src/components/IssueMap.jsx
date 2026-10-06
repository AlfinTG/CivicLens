import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const SEVERITY_COLORS = {
  1: '#22c55e', // green
  2: '#22c55e', // green
  3: '#f59e0b', // amber
  4: '#ef4444', // red
  5: '#ef4444', // red
};

// Component to handle dynamic map bounds when issues change
function MapBoundsController({ issues }) {
  const map = useMap();
  const prevIds = useRef('');
  
  useEffect(() => {
    if (issues && issues.length > 0) {
      const validIssues = issues.filter(i => i.lat != null && i.lng != null);
      if (validIssues.length > 0) {
        const currentIds = validIssues.map(i => i.id).sort().join(',');
        if (currentIds !== prevIds.current) {
          prevIds.current = currentIds;
          const lats = validIssues.map(i => i.lat);
          const lngs = validIssues.map(i => i.lng);
          
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          const minLng = Math.min(...lngs);
          const maxLng = Math.max(...lngs);
          
          // Add a small padding to bounds
          const padLat = (maxLat - minLat) * 0.1 || 0.01;
          const padLng = (maxLng - minLng) * 0.1 || 0.01;
          
          map.fitBounds([
            [minLat - padLat, minLng - padLng],
            [maxLat + padLat, maxLng + padLng]
          ], { maxZoom: 16 });
        }
      }
    }
  }, [issues, map]);

  return null;
}

function IssueMap({ issues, onIssueClick }) {
  // Default to Indore if no valid issues
  const defaultCenter = [22.7196, 75.8577];
  
  return (
    <div className="h-full w-full relative z-0" style={{ minHeight: 380 }}>
      <MapContainer
        center={defaultCenter}
        zoom={14}
        className="h-full w-full z-0"
        zoomControl={true}
      >
        <MapBoundsController issues={issues} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {issues?.map((issue) => {
          if (issue.lat == null || issue.lng == null) return null;
          
          const color = SEVERITY_COLORS[issue.severity] || '#9ca3af';
          return (
            <CircleMarker
              key={issue.id}
              center={[issue.lat, issue.lng]}
              radius={8}
              fillColor={color}
              color="#fff"
              weight={2}
              opacity={1}
              fillOpacity={0.9}
              eventHandlers={{
                click: () => onIssueClick && onIssueClick(issue)
              }}
            >
              <Popup closeButton={false}>
                <div className="min-w-[160px] max-w-[220px] cursor-pointer" onClick={() => onIssueClick && onIssueClick(issue)}>
                  {issue.image_url && (
                    <img 
                      src={issue.image_url} 
                      alt="Issue" 
                      className="w-full h-28 object-cover rounded mb-2 bg-gray-100 block"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <p className="font-bold text-sm text-gray-900 capitalize leading-tight">
                    {issue.type.replace(/_/g, ' ')}
                  </p>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase mt-1 mb-1">
                    {(!issue.department || issue.department === "General") ? (
                      <span className="text-amber-600">Unassigned</span>
                    ) : (
                      issue.department
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{issue.description}</p>
                  <div className="text-blue-600 text-xs font-semibold mt-2 hover:underline">
                    View Details &rarr;
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {(!issues || issues.length === 0) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50/70 backdrop-blur-sm pointer-events-none">
          <div className="bg-white px-4 py-2 rounded-md shadow-sm border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">No issues to display</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default IssueMap;
