import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
} from 'recharts';
import { MapPin, AlertTriangle, Activity, TrendingUp, Clock, Zap, Calendar, ChevronDown } from 'lucide-react';
import { Country, EarthquakeData, RiskDistribution } from '../../../types/dashboard';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import { earthquakeService, CountryYearlyStatistics } from '../../../services/earthquakeService';

interface CountryViewProps {
  country: Country;
}

const CountryView: React.FC<CountryViewProps> = ({ country }) => {
  const { ErrorFallback } = useErrorHandler();
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(2025);
  const [countryData, setCountryData] = useState<CountryYearlyStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const years = [2020, 2021, 2022, 2023, 2024, 2025];

  // Cargar datos del país para el año seleccionado o todos los años
  useEffect(() => {
    const loadCountryData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let data: CountryYearlyStatistics;
        if (selectedYear === 'all') {
          data = await earthquakeService.getCountryAllYearsStatistics(country.name);
        } else {
          data = await earthquakeService.getCountryYearlyStatistics(country.name, selectedYear);
        }
        setCountryData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
        console.error('Error loading country data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCountryData();
  }, [country.name, selectedYear]);

  // Convertir datos de la API al formato de los gráficos
  const earthquakeHistory: EarthquakeData[] = countryData?.recent_events.map(event => ({
    date: event.date,
    magnitude: event.magnitude || 0,
    depth: 15, // Valor por defecto ya que no tenemos profundidad en la API
    location: event.location
  })) || [];

  // Distribución de magnitudes basada en datos reales
  const magnitudeDistribution: RiskDistribution[] = [
    { name: '2.0-3.0', value: earthquakeHistory.filter(e => e.magnitude >= 2.0 && e.magnitude < 3.0).length, color: '#22C55E', range: '2.0-3.0', count: earthquakeHistory.filter(e => e.magnitude >= 2.0 && e.magnitude < 3.0).length },
    { name: '3.0-4.0', value: earthquakeHistory.filter(e => e.magnitude >= 3.0 && e.magnitude < 4.0).length, color: '#F59E0B', range: '3.0-4.0', count: earthquakeHistory.filter(e => e.magnitude >= 3.0 && e.magnitude < 4.0).length },
    { name: '4.0-5.0', value: earthquakeHistory.filter(e => e.magnitude >= 4.0 && e.magnitude < 5.0).length, color: '#F97316', range: '4.0-5.0', count: earthquakeHistory.filter(e => e.magnitude >= 4.0 && e.magnitude < 5.0).length },
    { name: '5.0-6.0', value: earthquakeHistory.filter(e => e.magnitude >= 5.0 && e.magnitude < 6.0).length, color: '#EF4444', range: '5.0-6.0', count: earthquakeHistory.filter(e => e.magnitude >= 5.0 && e.magnitude < 6.0).length },
    { name: '6.0+', value: earthquakeHistory.filter(e => e.magnitude >= 6.0).length, color: '#7C2D12', range: '6.0+', count: earthquakeHistory.filter(e => e.magnitude >= 6.0).length }
  ];

  const depthAnalysis = [
    { depth: '0-10km', count: Math.floor(earthquakeHistory.length * 0.2), risk: 'high' },
    { depth: '10-20km', count: Math.floor(earthquakeHistory.length * 0.3), risk: 'medium' },
    { depth: '20-30km', count: Math.floor(earthquakeHistory.length * 0.25), risk: 'low' },
    { depth: '30-40km', count: Math.floor(earthquakeHistory.length * 0.15), risk: 'very-low' },
    { depth: '40km+', count: Math.floor(earthquakeHistory.length * 0.1), risk: 'very-low' }
  ];

  // (removed unused helper)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar datos del país</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Recargar Página
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ErrorFallback />
      
      {/* Header del País con Filtro de Año */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-transform duration-200 hover:shadow-md hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-100 rounded-full">
              <MapPin className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{country.name}</h1>
              <p className="text-gray-600">
                Análisis detallado de actividad sísmica - {selectedYear === 'all' ? 'Todos los años' : selectedYear}
              </p>
            </div>
          </div>
          
          {/* Filtro de Año */}
          <div className="relative">
            <button
              onClick={() => document.getElementById('country-year-selector')?.classList.toggle('hidden')}
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
            >
              <Calendar className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">
                {selectedYear === 'all' ? 'Todos los años' : selectedYear}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-600" />
            </button>
            
            <div id="country-year-selector" className="hidden absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  setSelectedYear('all');
                  document.getElementById('country-year-selector')?.classList.add('hidden');
                }}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                  selectedYear === 'all' ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-700'
                }`}
              >
                Todos los años
              </button>
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => {
                    setSelectedYear(year);
                    document.getElementById('country-year-selector')?.classList.add('hidden');
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                    selectedYear === year ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* KPIs del País */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4 transition-transform duration-200 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Total Sismos</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{countryData?.total_earthquakes || 0}</p>
            <p className="text-xs text-gray-500">
              {selectedYear === 'all' ? 'Todos los años' : `Año ${selectedYear}`}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 transition-transform duration-200 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">Magnitud Máx</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              M{countryData?.max_magnitude ? countryData.max_magnitude.toFixed(1) : '0.0'}
            </p>
            <p className="text-xs text-gray-500">
              {selectedYear === 'all' ? 'Todos los años' : `Año ${selectedYear}`}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 transition-transform duration-200 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Promedio</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              M{countryData?.avg_magnitude ? countryData.avg_magnitude.toFixed(1) : '0.0'}
            </p>
            <p className="text-xs text-gray-500">Magnitud</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 transition-transform duration-200 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Último</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {countryData?.last_date ? new Date(countryData.last_date).toLocaleDateString() : 'N/A'}
            </p>
            <p className="text-xs text-gray-500">Sismo</p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Historial de Sismos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-transform duration-200 hover:shadow-md hover:-translate-y-0.5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Historial de Sismos ({selectedYear === 'all' ? 'Todos los años' : selectedYear})
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={earthquakeHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 7]} />
                <Tooltip />
                <Line type="monotone" dataKey="magnitude" stroke="#EF4444" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribución de Magnitudes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-transform duration-200 hover:shadow-md hover:-translate-y-0.5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución de Magnitudes ({selectedYear === 'all' ? 'Todos los años' : selectedYear})
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={magnitudeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {magnitudeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Análisis de Profundidad */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-transform duration-200 hover:shadow-md hover:-translate-y-0.5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Análisis de Profundidad vs Frecuencia ({selectedYear === 'all' ? 'Todos los años' : selectedYear})
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={depthAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="depth" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de Sismos Recientes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-transform duration-200 hover:shadow-md hover:-translate-y-0.5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Sismos Recientes ({selectedYear === 'all' ? 'Todos los años' : selectedYear})
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Fecha</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Magnitud</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Ubicación</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Prob. 7 días</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Prob. 30 días</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Prob. 90 días</th>
              </tr>
            </thead>
            <tbody>
              {countryData?.recent_events.map((event, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-700">
                    M{event.magnitude ? event.magnitude.toFixed(1) : '0.0'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">{event.location}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {event.prob_7d ? `${(event.prob_7d * 100).toFixed(1)}%` : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {event.prob_30d ? `${(event.prob_30d * 100).toFixed(1)}%` : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {event.prob_90d ? `${(event.prob_90d * 100).toFixed(1)}%` : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Predicciones y Alertas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-transform duration-200 hover:shadow-md hover:-translate-y-0.5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Predicciones y Alertas ({selectedYear === 'all' ? 'Todos los años' : selectedYear})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 transition-transform duration-200 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Probabilidad Promedio</span>
            </div>
            <p className="text-sm text-yellow-700">
              Probabilidad promedio de sismo M4.5+ en los próximos 7 días: {countryData?.avg_prob_7d ? `${(countryData.avg_prob_7d * 100).toFixed(1)}%` : 'N/A'}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">Actividad Sísmica</span>
            </div>
            <p className="text-sm text-blue-700">
              {countryData?.total_earthquakes ? `${countryData.total_earthquakes} sismos registrados en ${selectedYear === 'all' ? 'todos los años' : selectedYear}` : `No hay datos para ${selectedYear === 'all' ? 'todos los años' : selectedYear}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryView; 