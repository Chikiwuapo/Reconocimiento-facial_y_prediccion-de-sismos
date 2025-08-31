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
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, AlertTriangle, MapPin, Activity, Calendar, ChevronDown } from 'lucide-react';
import { CountryEarthquakeStats, RiskDistribution } from '../../../types/dashboard';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import { earthquakeService, YearlyStatistics } from '../../../services/earthquakeService';

const StatisticsView: React.FC = () => {
  const { ErrorFallback } = useErrorHandler();
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(2025);
  const [yearlyData, setYearlyData] = useState<YearlyStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const years = [2020, 2021, 2022, 2023, 2024, 2025];

  // Cargar datos del año seleccionado o todos los años
  useEffect(() => {
    const loadYearlyData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let data: YearlyStatistics;
        if (selectedYear === 'all') {
          data = await earthquakeService.getAllYearsStatistics();
        } else {
          data = await earthquakeService.getYearlyStatistics(selectedYear);
        }
        setYearlyData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
        console.error('Error loading yearly data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadYearlyData();
  }, [selectedYear]);

  // Convertir datos de la API al formato de los gráficos
  const earthquakeData: CountryEarthquakeStats[] = yearlyData?.by_country.map(country => ({
    country: country.country,
    count: country.count,
    magnitude: country.max_magnitude || 0,
    risk: country.count > 200 ? 'very-high' : 
          country.count > 100 ? 'high' : 
          country.count > 50 ? 'medium' : 'low'
  })) || [];

  // Datos de magnitud por mes (simulados para el año seleccionado)
  const magnitudeData = [
    { month: 'Ene', avg: yearlyData?.general.avg_magnitude || 4.2, max: yearlyData?.general.max_magnitude || 6.8, min: 2.1 },
    { month: 'Feb', avg: (yearlyData?.general.avg_magnitude || 4.2) + 0.1, max: yearlyData?.general.max_magnitude || 6.8, min: 2.3 },
    { month: 'Mar', avg: (yearlyData?.general.avg_magnitude || 4.2) + 0.2, max: yearlyData?.general.max_magnitude || 6.8, min: 2.5 },
    { month: 'Abr', avg: (yearlyData?.general.avg_magnitude || 4.2) + 0.3, max: yearlyData?.general.max_magnitude || 6.8, min: 2.8 }
  ];

  // Distribución de riesgo basada en datos reales
  const riskDistribution: RiskDistribution[] = [
    { 
      name: 'Muy Alto', 
      value: earthquakeData.filter(c => c.risk === 'very-high').length * 10, 
      color: '#EF4444' 
    },
    { 
      name: 'Alto', 
      value: earthquakeData.filter(c => c.risk === 'high').length * 10, 
      color: '#F97316' 
    },
    { 
      name: 'Medio', 
      value: earthquakeData.filter(c => c.risk === 'medium').length * 10, 
      color: '#F59E0B' 
    },
    { 
      name: 'Bajo', 
      value: earthquakeData.filter(c => c.risk === 'low').length * 10, 
      color: '#22C55E' 
    }
  ];

  // Datos de actividad sísmica por hora del día (simulados)
  const hourlyActivity = [
    { hour: '00:00', count: 8 }, { hour: '02:00', count: 12 }, { hour: '04:00', count: 15 },
    { hour: '06:00', count: 18 }, { hour: '08:00', count: 22 }, { hour: '10:00', count: 25 },
    { hour: '12:00', count: 28 }, { hour: '14:00', count: 30 }, { hour: '16:00', count: 27 },
    { hour: '18:00', count: 24 }, { hour: '20:00', count: 20 }, { hour: '22:00', count: 16 }
  ];

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
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar estadísticas</h3>
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
      
      {/* Header de Estadísticas con Filtro de Año */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-transform duration-200 hover:shadow-md hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-900">Estadísticas de Sismos en Sudamérica</h1>
          </div>
          
          {/* Filtro de Año */}
          <div className="relative">
            <button
              onClick={() => document.getElementById('year-selector')?.classList.toggle('hidden')}
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
            >
              <Calendar className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">
                {selectedYear === 'all' ? 'Todos los años' : selectedYear}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-600" />
            </button>
            
            <div id="year-selector" className="hidden absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  setSelectedYear('all');
                  document.getElementById('year-selector')?.classList.add('hidden');
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
                    document.getElementById('year-selector')?.classList.add('hidden');
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
        <p className="text-gray-600">
          {selectedYear === 'all' 
            ? 'Análisis completo de la actividad sísmica en la región sudamericana en todos los años registrados'
            : `Análisis completo de la actividad sísmica en la región sudamericana durante el año ${selectedYear}`
          }
        </p>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-transform duration-200 hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sismos</p>
              <p className="text-3xl font-bold text-gray-900">{yearlyData?.general.total_earthquakes || 0}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-sm text-green-600 mt-2">
            {selectedYear === 'all' ? 'Todos los años' : `Año ${selectedYear}`}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Magnitud Promedio</p>
              <p className="text-3xl font-bold text-gray-900">
                {yearlyData?.general.avg_magnitude ? yearlyData.general.avg_magnitude.toFixed(1) : '0.0'}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
          <p className="text-sm text-orange-600 mt-2">Promedio anual</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Magnitud Máxima</p>
              <p className="text-3xl font-bold text-gray-900">
                {yearlyData?.general.max_magnitude ? yearlyData.general.max_magnitude.toFixed(1) : '0.0'}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-sm text-red-600 mt-2">Máximo registrado</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Países Activos</p>
              <p className="text-3xl font-bold text-gray-900">{yearlyData?.by_country.length || 0}</p>
            </div>
            <MapPin className="h-8 w-8 text-yellow-600" />
          </div>
          <p className="text-sm text-yellow-600 mt-2">Con actividad</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sismos por País */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sismos por País ({selectedYear === 'all' ? 'Todos los años' : selectedYear})
          </h3>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución de Niveles de Riesgo ({selectedYear === 'all' ? 'Todos los años' : selectedYear})
          </h3>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Evolución de Magnitud Promedio ({selectedYear === 'all' ? 'Todos los años' : selectedYear})
          </h3>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Actividad Sísmica por Hora del Día ({selectedYear === 'all' ? 'Todos los años' : selectedYear})
          </h3>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Resumen por País ({selectedYear === 'all' ? 'Todos los años' : selectedYear})
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">País</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Sismos</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Magnitud Promedio</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Magnitud Máxima</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Nivel de Riesgo</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Primer Sismo</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Último Sismo</th>
              </tr>
            </thead>
            <tbody>
              {yearlyData?.by_country.map((country, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{country.country}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{country.count}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {country.avg_magnitude ? country.avg_magnitude.toFixed(2) : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {country.max_magnitude ? country.max_magnitude.toFixed(2) : 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      country.count > 200 ? 'bg-red-100 text-red-800' :
                      country.count > 100 ? 'bg-orange-100 text-orange-800' :
                      country.count > 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {country.count > 200 ? 'Muy Alto' :
                       country.count > 100 ? 'Alto' :
                       country.count > 50 ? 'Medio' : 'Bajo'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {country.first_date ? new Date(country.first_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {country.last_date ? new Date(country.last_date).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatisticsView; 