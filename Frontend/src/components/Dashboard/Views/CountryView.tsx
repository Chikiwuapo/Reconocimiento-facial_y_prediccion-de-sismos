import React from 'react';
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
  ScatterChart,
  Scatter
} from 'recharts';
import { MapPin, AlertTriangle, Activity, TrendingUp, Clock, Zap } from 'lucide-react';
import { Country, EarthquakeData, RiskDistribution } from '../../../types/dashboard';
import { useErrorHandler } from '../../../hooks/useErrorHandler';

interface CountryViewProps {
  country: Country;
}

const CountryView: React.FC<CountryViewProps> = ({ country }) => {
  const { ErrorFallback } = useErrorHandler();

  // Datos simulados para el país específico
  const earthquakeHistory: EarthquakeData[] = [
    { date: '2024-01-01', magnitude: 4.2, depth: 15, location: 'Santiago' },
    { date: '2024-01-03', magnitude: 3.8, depth: 22, location: 'Valparaíso' },
    { date: '2024-01-05', magnitude: 5.1, depth: 18, location: 'Concepción' },
    { date: '2024-01-08', magnitude: 4.7, depth: 25, location: 'Antofagasta' },
    { date: '2024-01-10', magnitude: 3.9, depth: 20, location: 'La Serena' },
    { date: '2024-01-12', magnitude: 4.5, depth: 16, location: 'Iquique' },
    { date: '2024-01-15', magnitude: 5.8, depth: 12, location: 'Arica' },
    { date: '2024-01-18', magnitude: 6.3, depth: 8, location: 'Punta Arenas' },
    { date: '2024-01-20', magnitude: 4.1, depth: 19, location: 'Temuco' },
    { date: '2024-01-22', magnitude: 3.7, depth: 24, location: 'Puerto Montt' },
    { date: '2024-01-25', magnitude: 4.9, depth: 14, location: 'Coyhaique' },
    { date: '2024-01-28', magnitude: 4.3, depth: 21, location: 'Osorno' }
  ];

  const magnitudeDistribution: RiskDistribution[] = [
    { range: '2.0-3.0', count: 15, color: '#22C55E' },
    { range: '3.0-4.0', count: 25, color: '#F59E0B' },
    { range: '4.0-5.0', count: 35, color: '#F97316' },
    { range: '5.0-6.0', count: 20, color: '#EF4444' },
    { range: '6.0+', count: 5, color: '#7C2D12' }
  ];

  const depthAnalysis = [
    { depth: '0-10km', count: 8, risk: 'high' },
    { depth: '10-20km', count: 15, risk: 'medium' },
    { depth: '20-30km', count: 22, risk: 'low' },
    { depth: '30-40km', count: 18, risk: 'very-low' },
    { depth: '40km+', count: 12, risk: 'very-low' }
  ];

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'very-high': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      case 'very-low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskLevelBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'very-high': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      case 'very-low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  try {
    return (
      <div className="space-y-6">
        <ErrorFallback />
        
        {/* Header del País */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-100 rounded-full">
                <MapPin className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{country.name}</h1>
                <p className="text-gray-600">Análisis detallado de actividad sísmica</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelBadge(country.riskLevel)}`}>
                {country.riskLevel === 'very-high' ? 'Muy Alto' :
                 country.riskLevel === 'high' ? 'Alto' :
                 country.riskLevel === 'medium' ? 'Medio' : 'Bajo'}
              </div>
              <p className="text-sm text-gray-500 mt-1">Nivel de Riesgo</p>
            </div>
          </div>

          {/* KPIs del País */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Total Sismos</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">{earthquakeHistory.length}</p>
              <p className="text-xs text-gray-500">Este mes</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-600">Magnitud Máx</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">M{Math.max(...earthquakeHistory.map(e => e.magnitude))}</p>
              <p className="text-xs text-gray-500">Último mes</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Promedio</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                M{(earthquakeHistory.reduce((sum, e) => sum + e.magnitude, 0) / earthquakeHistory.length).toFixed(1)}
              </p>
              <p className="text-xs text-gray-500">Magnitud</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">Último</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">{country.lastEarthquake}</p>
              <p className="text-xs text-gray-500">Sismo</p>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Historial de Sismos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Sismos (Último Mes)</h3>
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Magnitudes</h3>
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Profundidad vs Frecuencia</h3>
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sismos Recientes</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Fecha</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Magnitud</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Profundidad</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Ubicación</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Riesgo</th>
                </tr>
              </thead>
              <tbody>
                {earthquakeHistory.slice(-10).reverse().map((earthquake, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{earthquake.date}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-700">M{earthquake.magnitude}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{earthquake.depth}km</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{earthquake.location}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        earthquake.magnitude >= 6.0 ? 'bg-red-100 text-red-800' :
                        earthquake.magnitude >= 5.0 ? 'bg-orange-100 text-orange-800' :
                        earthquake.magnitude >= 4.0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {earthquake.magnitude >= 6.0 ? 'Alto' :
                         earthquake.magnitude >= 5.0 ? 'Medio' :
                         earthquake.magnitude >= 4.0 ? 'Bajo' : 'Muy Bajo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Predicciones y Alertas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Predicciones y Alertas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Alerta Preventiva</span>
              </div>
              <p className="text-sm text-yellow-700">
                Se detectó un patrón de actividad sísmica que sugiere un posible sismo de magnitud 5.0+ en los próximos 7 días.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Tendencia</span>
              </div>
              <p className="text-sm text-blue-700">
                La actividad sísmica está dentro de los parámetros normales para esta región y época del año.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in CountryView:', error);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar datos del país</h3>
        <p className="text-red-700 mb-4">
          No se pudieron cargar los datos para {country.name}. Por favor, intenta de nuevo.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Recargar Página
        </button>
      </div>
    );
  }
};

export default CountryView; 