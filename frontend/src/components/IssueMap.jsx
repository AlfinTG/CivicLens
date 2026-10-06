import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const SEVERITY_COLORS = {
  1: '#16a34a',
  2: '#16a34a',
  3: '#d97706',
  4: '#dc2626',
  5: '#dc2626',
};

function IssueMap({ issues }) {
  const center = [22.7196, 75.8577];

  return (
    <MapContainer
      center={center}
      zoom={14}
      className="h-full w-full"
      style={{ minHeight: 380 }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {issues.map((issue) => {
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
          >
            <Popup>
              <div className="min-w-[160px]">
                <p className="font-semibold text-sm text-gray-900 capitalize">
                  {issue.type.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{issue.description}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <span>Sev {issue.severity}</span>
                  <span>·</span>
                  <span>{issue.department}</span>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

export default IssueMap;
