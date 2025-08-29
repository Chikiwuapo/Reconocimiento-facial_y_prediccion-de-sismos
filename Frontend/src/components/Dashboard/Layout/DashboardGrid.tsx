import React, { useMemo, useState } from 'react';
import SeismicMap, { EarthquakePoint } from '../Widgets/Charts/SeismicMap';
import { AlertTriangle, Activity, MapPin, TrendingUp, Timer, ListChecks } from 'lucide-react';
import type { Country } from '../../../types/dashboard';

const DashboardGrid: React.FC = () => {
  // Time range filter
  const [range, setRange] = useState<'24h' | '7d' | '30d'>('7d');
  // Countries list toggle and map view state
  const [showCountries, setShowCountries] = useState<boolean>(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-15.78, -60]);
  const [mapZoom, setMapZoom] = useState<number>(4);
  const [interactionsEnabled, setInteractionsEnabled] = useState<boolean>(false);

  // Mocked earthquake data (replace with API hook when available)
  const allData: EarthquakePoint[] = useMemo(() => ([
    { id: '1', lat: -33.45, lng: -70.67, magnitude: 5.6, location: 'Chile', date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
    { id: '2', lat: -12.0464, lng: -77.0428, magnitude: 4.8, location: 'Perú', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: '3', lat: -34.6037, lng: -58.3816, magnitude: 3.9, location: 'Argentina', date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() },
    { id: '4', lat: 4.7110, lng: -74.0721, magnitude: 4.2, location: 'Colombia', date: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString() },
    { id: '5', lat: -0.2299, lng: -78.5249, magnitude: 5.1, location: 'Ecuador', date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
  ]), []);

  const filteredData = useMemo(() => {
    const now = Date.now();
    const limits = { '24h': 24 * 60 * 60 * 1000, '7d': 7 * 24 * 60 * 60 * 1000, '30d': 30 * 24 * 60 * 60 * 1000 } as const;
    const windowMs = limits[range];
    return allData.filter(d => now - new Date(d.date).getTime() <= windowMs);
  }, [allData, range]);

  // KPI calculations
  const lastQuake = useMemo(() => allData.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0], [allData]);
  const weekCount = useMemo(() => filteredData.length, [filteredData]);
  const highestRisk = 'Perú (Alto)'; // Placeholder; compute from risk model when available

  const countries: Country[] = [
    { id: 'brazil', name: 'Brasil', code: 'BR', coordinates: [-15.7801, -47.9292], riskLevel: 'medium', lastEarthquake: new Date().toISOString(), magnitude: 4.2 },
    { id: 'argentina', name: 'Argentina', code: 'AR', coordinates: [-34.6118, -58.3960], riskLevel: 'high', lastEarthquake: new Date().toISOString(), magnitude: 5.1 },
    { id: 'chile', name: 'Chile', code: 'CL', coordinates: [-33.4489, -70.6693], riskLevel: 'very-high', lastEarthquake: new Date().toISOString(), magnitude: 6.3 },
    { id: 'colombia', name: 'Colombia', code: 'CO', coordinates: [4.7110, -74.0721], riskLevel: 'medium', lastEarthquake: new Date().toISOString(), magnitude: 4.8 },
    { id: 'peru', name: 'Perú', code: 'PE', coordinates: [-12.0464, -77.0428], riskLevel: 'high', lastEarthquake: new Date().toISOString(), magnitude: 5.5 },
    { id: 'venezuela', name: 'Venezuela', code: 'VE', coordinates: [10.4806, -66.9036], riskLevel: 'low', lastEarthquake: new Date().toISOString(), magnitude: 3.9 },
    { id: 'ecuador', name: 'Ecuador', code: 'EC', coordinates: [-0.2299, -78.5249], riskLevel: 'high', lastEarthquake: new Date().toISOString(), magnitude: 5.2 },
    { id: 'bolivia', name: 'Bolivia', code: 'BO', coordinates: [-16.4897, -68.1193], riskLevel: 'medium', lastEarthquake: new Date().toISOString(), magnitude: 4.5 },
    { id: 'paraguay', name: 'Paraguay', code: 'PY', coordinates: [-25.2637, -57.5759], riskLevel: 'low', lastEarthquake: new Date().toISOString(), magnitude: 3.2 },
    { id: 'uruguay', name: 'Uruguay', code: 'UY', coordinates: [-34.9011, -56.1645], riskLevel: 'low', lastEarthquake: new Date().toISOString(), magnitude: 2.8 },
    { id: 'guyana', name: 'Guyana', code: 'GY', coordinates: [6.8013, -58.1553], riskLevel: 'low', lastEarthquake: new Date().toISOString(), magnitude: 3.1 },
    { id: 'suriname', name: 'Suriname', code: 'SR', coordinates: [5.8520, -55.2038], riskLevel: 'low', lastEarthquake: new Date().toISOString(), magnitude: 2.9 },
  ];

  // Helper to normalize names for matching
  const normalize = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

  // Build stats per country from filtered data
  const countryStats = useMemo(() => {
    type Stat = { count: number; latestMw: number | null };
    const stats: Record<string, Stat> = {};
    countries.forEach(c => { stats[normalize(c.name)] = { count: 0, latestMw: null }; });
    filteredData.forEach(eq => {
      const key = normalize(eq.location);
      const current: Stat = stats[key] ?? { count: 0, latestMw: null };
      const nextCount = current.count + 1;
      const nextMw = current.latestMw === null ? eq.magnitude : Math.max(current.latestMw, eq.magnitude);
      stats[key] = { count: nextCount, latestMw: nextMw };
    });
    return stats;
  }, [filteredData, countries]);

  // Sort countries by current count desc to reflect context
  const sortedCountries = useMemo(() => {
    return countries.slice().sort((a, b) => {
      const ca = countryStats[normalize(a.name)]?.count ?? 0;
      const cb = countryStats[normalize(b.name)]?.count ?? 0;
      return cb - ca;
    });
  }, [countries, countryStats]);

  return (
    <div className="space-y-6">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex items-start space-x-4">
          <div className="p-2 bg-red-100 rounded-md"><AlertTriangle className="h-5 w-5 text-red-600"/></div>
          <div>
            <div className="text-sm text-gray-600">Último sismo registrado</div>
            <div className="text-xl font-semibold text-gray-900">{lastQuake ? `${lastQuake.magnitude.toFixed(1)} Mw, ${lastQuake.location}` : '—'}</div>
            <div className="text-xs text-gray-500">{lastQuake ? new Date(lastQuake.date).toLocaleString() : ''}</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex items-start space-x-4">
          <div className="p-2 bg-blue-100 rounded-md"><Activity className="h-5 w-5 text-blue-600"/></div>
          <div>
            <div className="text-sm text-gray-600">Sismos detectados ({range === '24h' ? '24h' : range === '7d' ? 'última semana' : 'último mes'})</div>
            <div className="text-2xl font-bold text-gray-900">{weekCount}</div>
            <div className="text-xs text-gray-500">Basado en filtros seleccionados</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex items-start space-x-4">
          <div className="p-2 bg-yellow-100 rounded-md"><TrendingUp className="h-5 w-5 text-yellow-700"/></div>
          <div>
            <div className="text-sm text-gray-600">País con mayor riesgo</div>
            <div className="text-xl font-semibold text-gray-900">{highestRisk}</div>
            <div className="text-xs text-gray-500">Estimado actual</div>
          </div>
        </div>
      </div>
      
      {/* Mapa de Sudamérica con filtros y lista de países */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Mapa de Actividad Sísmica en Sudamérica</h3>
          <div className="flex items-center space-x-2">
            <div className="hidden md:flex items-center text-gray-500 text-sm"><Timer className="h-4 w-4 mr-1"/>Rango:</div>
            {(['24h','7d','30d'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-md text-sm border ${range===r? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                {r === '24h' ? 'Últimas 24h' : r === '7d' ? 'Última semana' : 'Último mes'}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Static map; enables interactions only after selecting país */}
            <SeismicMap data={filteredData} center={mapCenter} zoom={mapZoom} disableInteractions={!interactionsEnabled} countries={countries} />
          </div>
          <div className="lg:col-span-1">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                <button
                  onClick={() => setShowCountries(v => !v)}
                  className="inline-flex items-center space-x-2 px-3 py-2 rounded-md text-sm bg-white border border-gray-300 hover:bg-gray-100"
                >
                  <MapPin className="h-4 w-4 text-gray-700"/>
                  <span className="font-medium text-gray-800">Países registrados</span>
                </button>
              </div>
              {showCountries && (
                <div className="max-h-80 overflow-y-auto divide-y">
                  {sortedCountries.map(c => {
                    const stat = countryStats[normalize(c.name)] || { count: 0, latestMw: null };
                    return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setMapCenter([c.coordinates[0], c.coordinates[1]]);
                        setMapZoom(6);
                        setInteractionsEnabled(true);
                      }}
                      className="w-full text-left flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{c.riskLevel === 'very-high' ? '🔴' : c.riskLevel === 'high' ? '🟠' : c.riskLevel === 'medium' ? '🟡' : '🟢'}</span>
                        <div className="flex flex-col">
                          <span className="text-gray-800 font-medium">{c.name}</span>
                          <span className="text-xs text-gray-500">{stat.count} evento(s){stat.latestMw ? ` · max Mw ${stat.latestMw.toFixed(1)}` : ''}</span>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold ${c.riskLevel==='very-high'?'text-red-600':c.riskLevel==='high'?'text-orange-600':c.riskLevel==='medium'?'text-yellow-600':'text-green-600'}`}>{c.riskLevel.toUpperCase()}</span>
                    </button>
                  );})}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Información Adicional */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feature Cards */}
          <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 flex items-start space-x-3">
              <div className="p-2 bg-green-100 rounded-md"><Activity className="h-5 w-5 text-green-700"/></div>
              <div>
                <div className="font-medium text-gray-900">Monitoreo en tiempo real</div>
                <div className="text-sm text-gray-600">Seguimiento continuo de eventos sísmicos y su evolución.</div>
              </div>
            </div>
            <div className="border rounded-lg p-4 flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-md"><TrendingUp className="h-5 w-5 text-blue-700"/></div>
              <div>
                <div className="font-medium text-gray-900">Análisis de tendencias</div>
                <div className="text-sm text-gray-600">Detección de patrones y estimaciones basadas en históricos.</div>
              </div>
            </div>
            <div className="border rounded-lg p-4 flex items-start space-x-3">
              <div className="p-2 bg-yellow-100 rounded-md"><AlertTriangle className="h-5 w-5 text-yellow-700"/></div>
              <div>
                <div className="font-medium text-gray-900">Alertas tempranas</div>
                <div className="text-sm text-gray-600">Avisos para regiones con incremento de riesgo.</div>
              </div>
            </div>
            <div className="border rounded-lg p-4 flex items-start space-x-3">
              <div className="p-2 bg-purple-100 rounded-md"><MapPin className="h-5 w-5 text-purple-700"/></div>
              <div>
                <div className="font-medium text-gray-900">Detalle por país</div>
                <div className="text-sm text-gray-600">Indicadores y datos específicos por región.</div>
              </div>
            </div>
          </div>
          {/* Roadmap */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-3"><ListChecks className="h-5 w-5 text-gray-700 mr-2"/><h4 className="font-medium text-gray-900">Próximas funcionalidades</h4></div>
            <ol className="relative ms-4 border-s border-gray-200 space-y-4">
              <li className="ms-6">
                <span className="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700">1</span>
                <div className="font-medium text-gray-900">Notificaciones en tiempo real</div>
                <div className="text-sm text-gray-600">Alertas push ante eventos relevantes.</div>
              </li>
              <li className="ms-6">
                <span className="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-orange-700">2</span>
                <div className="font-medium text-gray-900">Análisis de profundidad</div>
                <div className="text-sm text-gray-600">Contexto de energía liberada y efectos.</div>
              </li>
              <li className="ms-6">
                <span className="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-700">3</span>
                <div className="font-medium text-gray-900">Predicción de réplicas</div>
                <div className="text-sm text-gray-600">Modelos probabilísticos post-evento.</div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGrid;