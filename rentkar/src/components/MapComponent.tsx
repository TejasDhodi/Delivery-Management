import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: iconUrl.src,
  shadowUrl: iconShadow.src,
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
    start: {
        lat: number;
        lng: number;
        address: string;
    };
    end: {
        lat: number;
        lng: number;
        address: string;
    };
}
const MapComponent = ({ start, end }: MapComponentProps) => {
  if (!start || !end || !start.lat || !start.lng || !end.lat || !end.lng) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Invalid route data
      </div>
    );
  }

  const path = [start, end];

  return (
    <MapContainer center={start} zoom={12} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <Marker position={[start.lat, start.lng]}>
        <Popup>Pickup: {start.address}</Popup>
      </Marker>
      <Marker position={[end.lat, end.lng]}>
        <Popup>Delivery: {end.address}</Popup>
      </Marker>
      <Polyline positions={path.map(p => [p.lat, p.lng])} color="blue" />
    </MapContainer>
  );
};

  
  export default MapComponent;
  
