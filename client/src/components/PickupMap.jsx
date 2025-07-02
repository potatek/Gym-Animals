import {
  MapContainer,
  TileLayer,
  Marker,
  CircleMarker,
  useMapEvents,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl:       require('leaflet/dist/images/marker-icon.png'),
  shadowUrl:     require('leaflet/dist/images/marker-shadow.png'),
});
const defaultIcon = new L.Icon.Default();

function ClickHandler({ onCenterChange }) {
  useMapEvents({ click: e => onCenterChange({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

function SelectedFlyer({ locations, selectedId }) {
  const map = useMap();
  useEffect(() => {
    const sel = locations.find(l => l.id === selectedId);
    if (sel) map.flyTo([sel.lat, sel.lng], 14, { duration: 0.5 });
  }, [selectedId, locations, map]);
  return null;
}

export default function PickupMap({
  center,
  locations = [],
  selectedId,
  onCenterChange,
  onSelect
}) {
  return (
    <MapContainer center={center} zoom={13} style={{ height: 300, width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ClickHandler onCenterChange={onCenterChange} />
      <SelectedFlyer locations={locations} selectedId={selectedId} />

      {/* pkt odniesienia */}
      <Marker position={center} icon={defaultIcon} />

      {/* kolorowe oznaczenia paczkomatów */}
      {locations.map(loc => (
        <CircleMarker
          key={loc.id}
          center={[loc.lat, loc.lng]}
          radius={8}
          pathOptions={{
            color: loc.id === selectedId ? 'red' : 'blue',
            fillColor: loc.id === selectedId ? 'red' : 'blue',
          }}
          eventHandlers={{ click: () => onSelect(loc.id) }}
        />
      ))}
    </MapContainer>
  );
}
