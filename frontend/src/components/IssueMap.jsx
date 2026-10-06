import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const SEVERITY_COLORS = {
  1: '#16a34a', // green
  2: '#16a34a', // green
  3: '#d97706', // amber
  4: '#dc2626', // red
  5: '#dc2626', // red
};

// Component to handle dynamic map bounds when issues change
function MapBoundsController({ issues }) {
  const map = useMap();
  
  useEffect(() => {
    if (issues && issues.length > 0) {
      // Filter out invalid coordinates AND coordinates outside India roughly
      const validIssues = issues.filter(i => 
        i.lat != null && i.lng != null && 
        i.lat >= 6 && i.lat <= 36 && 
        i.lng >= 68 && i.lng <= 98
      );
      
      if (validIssues.length > 0) {
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

function IssueMap({ issues, onSelectIssue }) {
  // Default to Indore if no valid issues
  const defaultCenter = [22.7196, 75.8577];
  
  // Approximate bounding box for India
  const indiaBounds = [
    [6.5, 68.1], // South-West
    [35.6, 97.4] // North-East
  ];
  
  return (
    <div className="h-full w-full relative z-0" style={{ minHeight: 380 }}>
      <MapContainer
        center={defaultCenter}
        zoom={14}
        minZoom={5}
        maxBounds={indiaBounds}
        maxBoundsViscosity={1.0}
        className="h-full w-full z-0"
        zoomControl={true}
      >
        <MapBoundsController issues={issues} />
        <MapResizeController />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {issues?.map((issue) => {
          if (issue.lat == null || issue.lng == null) return null;
          
          const color = SEVERITY_COLORS[issue.severity] || '#6b7280';
          return (
            <CircleMarker
              key={issue.id}
              center={[issue.lat, issue.lng]}
              radius={7}
              fillColor={color}
              color="#fff"
              weight={1.5}
              opacity={1}
              fillOpacity={0.85}
              eventHandlers={{
                click: () => onSelectIssue && onSelectIssue(issue.id)
              }}
            >
              <Popup>
                <div 
                  className="min-w-[160px] max-w-[220px] cursor-pointer group"
                  onClick={() => onSelectIssue && onSelectIssue(issue.id)}
                >
                  {issue.image_url && (
                    <img 
                      src={issue.image_url} 
                      alt="Issue" 
                      className="w-full h-24 object-cover rounded mb-2 bg-gray-100 group-hover:opacity-90 transition-opacity"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <p className="font-semibold text-sm text-gray-900 capitalize group-hover:text-blue-600 transition-colors">
                    {issue.type.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{issue.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 pb-1">
                    <span>Sev {issue.severity}</span>
                    <span>·</span>
                    <span>{issue.department}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs font-medium text-blue-600 flex items-center gap-1">
                      View Details &rarr;
                    </span>
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
