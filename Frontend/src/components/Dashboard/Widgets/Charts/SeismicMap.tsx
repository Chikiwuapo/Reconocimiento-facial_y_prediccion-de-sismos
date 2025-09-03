import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap, ZoomControl, Circle } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Country } from '../../../../types/dashboard';
import AppModal from '../../../Common/AppModal';
import { useDashboard } from '../../Context/DashboardContext';
import { useTheme } from '../../../../context/ThemeContext';

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
  shadeEnabled?: boolean;
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
  console.log(`[DEBUG] riskToColor(${risk})`);
  switch (risk) {
    case 'very-high':
      return '#dc2626'; // Rojo más oscuro para mejor contraste
    case 'high':
      return '#ea580c'; // Naranja más oscuro
    case 'medium':
      return '#d97706'; // Amarillo oscuro
    default:
      return '#16a34a'; // Verde más oscuro
  }
};

const normalize = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
// Alias para nombres de países reportados en distintas lenguas
const aliasCanonical: Record<string, string> = {
  'brasil': 'brazil',
  'brazil': 'brazil',
  'peru': 'peru',
  'peru\u0301': 'peru', // seguridad extra si viniera con combinados
  'guyana': 'guyana',
  'guayana': 'guyana',
  'colombia': 'colombia',
  'argentina': 'argentina',
  'bolivia': 'bolivia',
  'chile': 'chile',
  'ecuador': 'ecuador',
  'paraguay': 'paraguay',
  'suriname': 'suriname',
  'uruguay': 'uruguay',
  'venezuela': 'venezuela',
};
const normKey = (s: string) => {
  const n = normalize(s);
  return aliasCanonical[n] || n;
};

const SeismicMap: React.FC<SeismicMapProps> = ({ data, center = [-15.78, -60], zoom = 3, disableInteractions = false, countries = [], shadeEnabled = true }) => {
  const { theme } = useTheme();
  const { setSelectedCountry: setCtxCountry, setCurrentView } = useDashboard();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  // Build latest quake per country (from currently filtered data)
  const latestByCountry = useMemo(() => {
    const map = new Map<string, EarthquakePoint>();
    data.forEach(eq => {
      const key = normKey(eq.location);
      const prev = map.get(key);
      if (!prev || new Date(eq.date).getTime() > new Date(prev.date).getTime()) {
        map.set(key, eq);
      }
    });
    return map;
  }, [data]);

  const selectedLatest = useMemo(() => {
    if (!selectedCountry) return null;
    // Intentar por nombre canónico y alias
    const k = normKey(selectedCountry.name);
    return latestByCountry.get(k) ?? null;
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
    <div className={`h-96 md:h-[28rem] relative rounded-lg overflow-hidden border ${
      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
    }`}>
      {disableInteractions && (
        <div className={`absolute z-20 top-2 right-2 text-xs px-2 py-1 rounded-md shadow pointer-events-none ${
          theme === 'dark' 
            ? 'bg-gray-800/90 text-gray-300 border border-gray-600' 
            : 'bg-white/90 text-gray-700 border border-gray-200'
        }`}>
          Mapa estático · selecciona un país para explorar
        </div>
      )}
      {/* Leyenda de colores */}
      <div className={`absolute z-20 bottom-3 left-3 backdrop-blur-sm border rounded-md shadow px-3 py-2 text-xs ${
        theme === 'dark' 
          ? 'bg-gray-800/95 border-gray-600 text-gray-300' 
          : 'bg-white/95 border-gray-200 text-gray-700'
      }`}>
        <div className={`font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Leyenda</div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{background:'#22c55e'}}></span>
            <span>Leve (&lt; 4.0)</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{background:'#f59e0b'}}></span>
            <span>Moderado (4.0–4.9)</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{background:'#f97316'}}></span>
            <span>Fuerte (5.0–5.9)</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{background:'#ef4444'}}></span>
            <span>Intenso (6.0+)</span>
          </div>
        </div>
      </div>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-10"
        minZoom={3}
        maxZoom={8}
        zoomControl={false}
        maxBounds={[[13, -95], [-56, -30]] as any}
        maxBoundsViscosity={0.9}
      >
        <MapController center={center} zoom={zoom} />
        <InteractionController disabled={disableInteractions} />
        {!disableInteractions && <ZoomControl position="topright" />}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Sombreado de áreas de interés: círculos por nivel de riesgo */}
        {shadeEnabled && countries
          .filter(c => c.riskLevel === 'medium' || c.riskLevel === 'high' || c.riskLevel === 'very-high')
          .map(c => {
            // Depuración para Brasil
            if (c.code === 'BR') {
              console.log(`[DEBUG] Mostrando sombra para Brasil:`, {
                code: c.code,
                name: c.name,
                riskLevel: c.riskLevel,
                color: riskToColor(c.riskLevel),
                coordinates: c.coordinates,
                radius: c.riskLevel === 'very-high' ? 600000 : c.riskLevel === 'high' ? 400000 : 250000
              });
            }
            
            return (
              <Circle
                key={`shade-${c.code}`}
                center={[c.coordinates[0], c.coordinates[1]]}
                radius={c.riskLevel === 'very-high' ? 800000 : c.riskLevel === 'high' ? 500000 : 300000}
                pathOptions={{ 
                  color: riskToColor(c.riskLevel), 
                  fillColor: riskToColor(c.riskLevel), 
                  fillOpacity: c.riskLevel === 'very-high' ? 0.25 : c.riskLevel === 'high' ? 0.2 : 0.15,
                  opacity: 0.6,
                  weight: 2,
                  dashArray: c.riskLevel === 'very-high' ? '10, 5' : '5, 5'
                }}
                eventHandlers={{
                  click: () => openCountryModal(c),
                }}
              />
            );
          })}
        {/* Country reference markers with risk color */}
        {countries.map((c) => (
          <Marker
            key={`country-${c.code}`}
            position={[c.coordinates[0], c.coordinates[1]]}
            icon={createCircleIcon(riskToColor(c.riskLevel))}
            eventHandlers={{
              click: () => openCountryModal(c),
            }}
            zIndexOffset={c.riskLevel === 'very-high' ? 1000 : c.riskLevel === 'high' ? 800 : 600}
          >
            <Tooltip 
              direction="top" 
              offset={[0, -10]} 
              opacity={1} 
              permanent={false} 
              className={`!shadow-lg !rounded !px-2 !py-1 !border ${
                theme === 'dark' 
                  ? '!bg-gray-800 !text-gray-200 !border-gray-600' 
                  : '!bg-white !text-gray-800 !border-gray-200'
              }`}
            >
              <div className="text-xs min-w-[120px]">
                <div className="font-bold text-sm mb-1">{c.name}</div>
                <div className="flex items-center justify-between">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Riesgo:</span>
                  <span className={`font-semibold ${
                    c.riskLevel === 'very-high' ? 'text-red-500' : 
                    c.riskLevel === 'high' ? 'text-orange-500' : 
                    c.riskLevel === 'medium' ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {c.riskLevel.toUpperCase()}
                  </span>
                </div>
                {c.magnitude > 0 && (
                  <div className="flex items-center justify-between mt-1">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Magnitud:</span>
                    <span className="font-semibold">{c.magnitude.toFixed(1)}</span>
                  </div>
                )}
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
                const locKey = normKey(eq.location);
                const found = countries.find(co => normKey(co.name) === locKey) || null;
                openCountryModal(found);
              }
            }}
          >
            <Tooltip 
              direction="top" 
              offset={[0, -10]} 
              opacity={1} 
              permanent={false} 
              className={`!shadow !rounded !px-2 !py-1 ${
                theme === 'dark' 
                  ? '!bg-gray-800 !text-gray-200 !border-gray-600' 
                  : '!bg-white !text-gray-800 !border-gray-200'
              }`}
            >
              <div className="text-xs">
                <div className="font-semibold">Mw {eq.magnitude.toFixed(1)}</div>
                <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{eq.location}</div>
                <div className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>{new Date(eq.date).toLocaleString()}</div>
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
          <div className="space-y-3 text-sm">
            {selectedLatest ? (
              <>
                <div className="border-b pb-2">
                  <div className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>🌍 {selectedCountry.name}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="font-medium">Nivel de Riesgo:</span> 
                      <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
                        selectedCountry.riskLevel === 'very-high' ? 'bg-red-100 text-red-800' :
                        selectedCountry.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                        selectedCountry.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {selectedCountry.riskLevel.toUpperCase()}
                      </span>
                    </div>
                    <div><span className="font-medium">Magnitud Máx:</span> M{selectedCountry.magnitude?.toFixed(1) || '0.0'}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>📈 Último Sismo Registrado</div>
                  <div><span className="font-medium">Magnitud:</span> Mw {selectedLatest.magnitude.toFixed(1)}</div>
                  <div><span className="font-medium">Fecha y hora:</span> {new Date(selectedLatest.date).toLocaleString()}</div>
                  <div><span className="font-medium">Ubicación:</span> {selectedLatest.location}</div>
                  <div><span className="font-medium">Coordenadas:</span> {selectedCountry.coordinates[0].toFixed(3)}, {selectedCountry.coordinates[1].toFixed(3)}</div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    💡 Haz clic en "Ver estadísticas" para obtener información detallada de {selectedCountry.name}
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="border-b pb-2">
                  <div className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>🌍 {selectedCountry.name}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="font-medium">Nivel de Riesgo:</span> 
                      <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
                        selectedCountry.riskLevel === 'very-high' ? 'bg-red-100 text-red-800' :
                        selectedCountry.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                        selectedCountry.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {selectedCountry.riskLevel.toUpperCase()}
                      </span>
                    </div>
                    <div><span className="font-medium">Magnitud Máx:</span> M{selectedCountry.magnitude?.toFixed(1) || '0.0'}</div>
                  </div>
                </div>
                
                <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  ⚠️ No hay sismos recientes registrados para este país en el rango seleccionado.
                </div>
                
                <div className="pt-2 border-t">
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    💡 Haz clic en "Ver estadísticas" para obtener información detallada de {selectedCountry.name}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>🗺️ Selecciona un país o un sismo para ver detalles.</div>
        )}
      </AppModal>
    </div>
  );
};

export default SeismicMap;
