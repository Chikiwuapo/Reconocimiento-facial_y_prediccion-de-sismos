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
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, AlertTriangle, MapPin, Activity } from 'lucide-react';
import { CountryEarthquakeStats, RiskDistribution } from '../../../types/dashboard';
import { useErrorHandler } from '../../../hooks/useErrorHandler';

const StatisticsView: React.FC = () => {
  const { ErrorFallback } = useErrorHandler();

  // Datos de sismos por país (últimos 30 días)
  const earthquakeData: CountryEarthquakeStats[] = [
    { country: 'Chile', count: 45, magnitude: 6.3, risk: 'very-high' },
    { country: 'Perú', count: 38, magnitude: 5.5, risk: 'high' },
    { country: 'Ecuador', count: 32, magnitude: 5.2, risk: 'high' },
    { country: 'Argentina', count: 28, magnitude: 5.1, risk: 'high' },
    { country: 'Colombia', count: 25, magnitude: 4.8, risk: 'medium' },
    { country: 'Brasil', count: 22, magnitude: 4.2, risk: 'medium' },
    { country: 'Bolivia', count: 18, magnitude: 4.5, risk: 'medium' },
    { country: 'Venezuela', count: 15, magnitude: 3.9, risk: 'low' },
    { country: 'Paraguay', count: 12, magnitude: 3.2, risk: 'low' },
    { country: 'Uruguay', count: 8, magnitude: 2.8, risk: 'low' },
    { country: 'Guyana', count: 6, magnitude: 3.1, risk: 'low' },
    { country: 'Suriname', count: 5, magnitude: 2.9, risk: 'low' }
  ];

  // Datos de magnitud por mes
  const magnitudeData = [
    { month: 'Oct', avg: 4.2, max: 6.8, min: 2.1 },
    { month: 'Nov', avg: 4.5, max: 7.1, min: 2.3 },
    { month: 'Dec', avg: 4.8, max: 7.5, min: 2.5 },
    { month: 'Jan', avg: 5.1, max: 7.8, min: 2.8 }
  ];

  // Distribución de riesgo
  const riskDistribution: RiskDistribution[] = [
    { name: 'Muy Alto', value: 15, color: '#EF4444' },
    { name: 'Alto', value: 25, color: '#F97316' },
    { name: 'Medio', value: 35, color: '#F59E0B' },
    { name: 'Bajo', value: 25, color: '#22C55E' }
  ];

  // Datos de actividad sísmica por hora del día
  const hourlyActivity = [
    { hour: '00:00', count: 8 }, { hour: '02:00', count: 12 }, { hour: '04:00', count: 15 },
    { hour: '06:00', count: 18 }, { hour: '08:00', count: 22 }, { hour: '10:00', count: 25 },
    { hour: '12:00', count: 28 }, { hour: '14:00', count: 30 }, { hour: '16:00', count: 27 },
    { hour: '18:00', count: 24 }, { hour: '20:00', count: 20 }, { hour: '22:00', count: 16 }
  ];

  try {
    return (
      <div className="space-y-6">
        <ErrorFallback />
        
        {/* Header de Estadísticas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="h-8 w-8 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-900">Estadísticas de Sismos en Sudamérica</h1>
          </div>
          <p className="text-gray-600">
            Análisis completo de la actividad sísmica en la región sudamericana durante los últimos 30 días
          </p>
        </div>

        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sismos</p>
                <p className="text-3xl font-bold text-gray-900">264</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-sm text-green-600 mt-2">+12% vs mes anterior</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Magnitud Promedio</p>
                <p className="text-3xl font-bold text-gray-900">4.8</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-sm text-orange-600 mt-2">+0.3 vs mes anterior</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">País Más Activo</p>
                <p className="text-3xl font-bold text-gray-900">Chile</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-sm text-red-600 mt-2">45 sismos este mes</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Riesgo Promedio</p>
                <p className="text-3xl font-bold text-gray-900">Medio</p>
              </div>
              <MapPin className="h-8 w-8 text-yellow-600" />
            </div>
            <p className="text-sm text-yellow-600 mt-2">Estable</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sismos por País */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sismos por País (Últimos 30 días)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={earthquakeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="country" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribución de Riesgo */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Niveles de Riesgo</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Gráficos de Línea */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Magnitud por Mes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolución de Magnitud Promedio</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={magnitudeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 8]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="avg" stroke="#3B82F6" strokeWidth={3} name="Promedio" />
                  <Line type="monotone" dataKey="max" stroke="#EF4444" strokeWidth={2} name="Máximo" />
                  <Line type="monotone" dataKey="min" stroke="#22C55E" strokeWidth={2} name="Mínimo" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Actividad por Hora */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Sísmica por Hora del Día</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tabla de Resumen */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen por País</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">País</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Sismos</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Magnitud Máx</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Nivel de Riesgo</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Último Sismo</th>
                </tr>
              </thead>
              <tbody>
                {earthquakeData.map((country, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{country.country}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{country.count}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">M{country.magnitude}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        country.risk === 'very-high' ? 'bg-red-100 text-red-800' :
                        country.risk === 'high' ? 'bg-orange-100 text-orange-800' :
                        country.risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {country.risk === 'very-high' ? 'Muy Alto' :
                         country.risk === 'high' ? 'Alto' :
                         country.risk === 'medium' ? 'Medio' : 'Bajo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">Hace 2 días</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in StatisticsView:', error);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar estadísticas</h3>
        <p className="text-red-700 mb-4">
          No se pudieron cargar las estadísticas. Por favor, intenta de nuevo.
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

export default StatisticsView; 