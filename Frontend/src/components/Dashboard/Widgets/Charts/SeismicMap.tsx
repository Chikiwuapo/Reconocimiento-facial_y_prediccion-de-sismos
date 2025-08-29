import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap, ZoomControl } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Country } from '../../../../types/dashboard';
import AppModal from '../../../Common/AppModal';
import { useDashboard } from '../../Context/DashboardContext';

export type TimeRange = '24h' | '7d' | '30d';

export interface EarthquakePoint {
  id: string;
  lat: number;
  lng: number;
  magnitude: number;
  location: string;
  date: string; // ISO string
}

// Fix for default markers in React Leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getMarkerColor = (magnitude: number) => {
  if (magnitude >= 6) return '#ef4444'; // red
  if (magnitude >= 5) return '#f97316'; // orange
  if (magnitude >= 4) return '#f59e0b'; // amber
  return '#22c55e'; // green
};

const createCircleIcon = (color: string) => new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="9" fill="${color}" stroke="white" stroke-width="2"/>
    </svg>
  `)}`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

interface SeismicMapProps {
  data: EarthquakePoint[];
  center?: [number, number];
  zoom?: number;
  disableInteractions?: boolean;
  countries?: Country[]; // reference markers
}

const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
};

const InteractionController: React.FC<{ disabled: boolean }> = ({ disabled }) => {
  const map = useMap();
  useEffect(() => {
    if (disabled) {
      map.dragging.disable();
      map.scrollWheelZoom.disable();
      map.doubleClickZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
      // @ts-ignore optional
      map.touchZoom && map.touchZoom.disable();
    } else {
      map.dragging.enable();
      map.scrollWheelZoom.enable();
      map.doubleClickZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
      // @ts-ignore optional
      map.touchZoom && map.touchZoom.enable();
    }
  }, [disabled, map]);
  return null;
};

const riskToColor = (risk: Country['riskLevel']) => {
  switch (risk) {
    case 'very-high':
      return '#ef4444';
    case 'high':
      return '#f97316';
    case 'medium':
      return '#f59e0b';
    default:
      return '#22c55e';
  }
};

const normalize = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

const SeismicMap: React.FC<SeismicMapProps> = ({ data, center = [-15.78, -60], zoom = 4, disableInteractions = false, countries = [] }) => {
  const { setSelectedCountry: setCtxCountry, setCurrentView } = useDashboard();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  // Build latest quake per country (from currently filtered data)
  const latestByCountry = useMemo(() => {
    const map = new Map<string, EarthquakePoint>();
    data.forEach(eq => {
      const key = normalize(eq.location);
      const prev = map.get(key);
      if (!prev || new Date(eq.date).getTime() > new Date(prev.date).getTime()) {
        map.set(key, eq);
      }
    });
    return map;
  }, [data]);

  const selectedLatest = useMemo(() => {
    if (!selectedCountry) return null;
    return latestByCountry.get(normalize(selectedCountry.name)) ?? null;
  }, [selectedCountry, latestByCountry]);

  const openCountryModal = (country: Country | null) => {
    setSelectedCountry(country);
    setIsModalOpen(true);
  };

  const goToStats = () => {
    if (!selectedCountry) return;
    // Navegar dentro del Dashboard usando el contexto
    setCtxCountry(selectedCountry);
    setCurrentView('country');
    setIsModalOpen(false);
  };

  return (
    <div className="h-96 md:h-[28rem] relative rounded-lg overflow-hidden border border-gray-200">
      {disableInteractions && (
        <div className="absolute z-20 top-2 right-2 bg-white/90 text-gray-700 text-xs px-2 py-1 rounded-md shadow pointer-events-none">
          Mapa estático · selecciona un país para explorar
        </div>
      )}
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-10"
        minZoom={3}
        maxZoom={8}
        zoomControl={false}
      >
        <MapController center={center} zoom={zoom} />
        <InteractionController disabled={disableInteractions} />
        {!disableInteractions && <ZoomControl position="topright" />}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Country reference markers with risk color */}
        {countries.map((c) => (
          <Marker
            key={`country-${c.code}`}
            position={[c.coordinates[0], c.coordinates[1]]}
            icon={createCircleIcon(riskToColor(c.riskLevel))}
            eventHandlers={{
              click: () => openCountryModal(c),
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false} className="!bg-white !text-gray-800 !shadow !rounded !px-2 !py-1">
              <div className="text-xs">
                <div className="font-semibold">{c.name}</div>
                <div className="text-gray-600">Riesgo: {c.riskLevel.toUpperCase()}</div>
              </div>
            </Tooltip>
          </Marker>
        ))}
        {data.map((eq) => (
          <Marker
            key={eq.id}
            position={[eq.lat, eq.lng]}
            icon={createCircleIcon(getMarkerColor(eq.magnitude))}
            eventHandlers={{
              click: () => {
                const found = countries.find(co => normalize(co.name) === normalize(eq.location)) || null;
                openCountryModal(found);
              }
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false} className="!bg-white !text-gray-800 !shadow !rounded !px-2 !py-1">
              <div className="text-xs">
                <div className="font-semibold">Mw {eq.magnitude.toFixed(1)}</div>
                <div className="text-gray-600">{eq.location}</div>
                <div className="text-gray-500">{new Date(eq.date).toLocaleString()}</div>
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>

      {/* Modal de información */}
      <AppModal
        isOpen={isModalOpen}
        title={selectedCountry ? `🌎 Actividad Sísmica · ${selectedCountry.name}` : '🌎 Actividad Sísmica'}
        onClose={() => setIsModalOpen(false)}
        {...(selectedCountry ? { primaryActionLabel: `Ver estadísticas de ${selectedCountry.name}`, onPrimaryAction: goToStats } : {})}
      >
        {selectedCountry ? (
          <div className="space-y-2 text-sm">
            {selectedLatest ? (
              <>
                <div><span className="font-medium">📈 Último sismo:</span> Mw {selectedLatest.magnitude.toFixed(1)}</div>
                <div><span className="font-medium">🕒 Fecha y hora:</span> {new Date(selectedLatest.date).toLocaleString()}</div>
                <div><span className="font-medium">📍 Ubicación:</span> {selectedLatest.location}</div>
                <div><span className="font-medium">🧭 Coordenadas:</span> {selectedCountry.coordinates[0].toFixed(3)}, {selectedCountry.coordinates[1].toFixed(3)}</div>
              </>
            ) : (
              <div className="text-gray-600">⚠️ No hay sismos recientes registrados para este país en el rango seleccionado.</div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-600">🗺️ Selecciona un país o un sismo para ver detalles.</div>
        )}
      </AppModal>
    </div>
  );
};

export default SeismicMap;
