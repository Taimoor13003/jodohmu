'use client';

import { useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

type OfficeLocation = {
  name: string;
  status: string;
  phase: 'soon' | 'next' | 'third';
  position: [number, number];
};

type OfficeLocationMapProps = {
  locations: OfficeLocation[];
  label: string;
};

export function OfficeLocationMap({ locations, label }: OfficeLocationMapProps) {
  const markers = useMemo(() => locations.map((location) => ({
    ...location,
    icon: L.divIcon({
      className: 'office-location-marker',
      html: `<span class="office-location-marker__pin office-location-marker__pin--${location.phase}"></span>`,
      iconSize: [30, 40],
      iconAnchor: [15, 40],
      popupAnchor: [0, -36],
    }),
  })), [locations]);

  return (
    <div className="relative h-[360px] overflow-hidden rounded-[1.25rem] border border-[#173d82]/10 sm:h-[430px]" aria-label={label}>
      <MapContainer
        center={[-2.5, 118.25]}
        zoom={5}
        minZoom={4}
        maxZoom={9}
        maxBounds={[[-13, 93], [8, 143]]}
        maxBoundsViscosity={1}
        className="h-full w-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map(({ name, status, position, icon }) => (
          <Marker key={name} position={position} icon={icon}>
            <Popup>
              <strong>{name}</strong><br />{status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <p className="pointer-events-none absolute bottom-2 right-2 z-[500] rounded bg-white/90 px-2 py-1 text-[10px] text-[#52617c] shadow-sm">Drag or zoom to explore</p>
    </div>
  );
}
