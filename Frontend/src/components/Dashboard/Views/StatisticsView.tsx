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
import { TrendingUp, AlertTriangle, MapPin, Activity, Calendar, ChevronDown, Clock, Zap, Globe, Target } from 'lucide-react';
import { CountryEarthquakeStats, RiskDistribution } from '../../../types/dashboard';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import { earthquakeService, YearlyStatistics } from '../../../services/earthquakeService';
import { useTheme } from '../../../context/ThemeContext';
import styles from './StatisticsView.module.css';

const StatisticsView: React.FC = () => {
  const { theme } = useTheme();
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
  const monthlyMagnitudeData = [
    { month: 'Ene', avg: yearlyData?.general.avg_magnitude || 4.2, max: yearlyData?.general.max_magnitude || 6.8, min: 2.1 },
    { month: 'Feb', avg: (yearlyData?.general.avg_magnitude || 4.2) + 0.1, max: yearlyData?.general.max_magnitude || 6.8, min: 2.3 },
    { month: 'Mar', avg: (yearlyData?.general.avg_magnitude || 4.2) + 0.2, max: yearlyData?.general.max_magnitude || 6.8, min: 2.5 },
    { month: 'Abr', avg: (yearlyData?.general.avg_magnitude || 4.2) + 0.3, max: yearlyData?.general.max_magnitude || 6.8, min: 2.8 },
    { month: 'May', avg: (yearlyData?.general.avg_magnitude || 4.2) + 0.4, max: yearlyData?.general.max_magnitude || 6.8, min: 2.9 },
    { month: 'Jun', avg: (yearlyData?.general.avg_magnitude || 4.2) + 0.5, max: yearlyData?.general.max_magnitude || 6.8, min: 3.0 },
    { month: 'Jul', avg: (yearlyData?.general.avg_magnitude || 4.2) + 0.6, max: yearlyData?.general.max_magnitude || 6.8, min: 3.1 },
    { month: 'Ago', avg: (yearlyData?.general.avg_magnitude || 4.2) + 0.7, max: yearlyData?.general.avg_magnitude || 6.8, min: 3.2 },
    { month: 'Sep', avg: (yearlyData?.general.avg_magnitude || 4.2) + 0.8, max: yearlyData?.general.max_magnitude || 6.8, min: 3.3 },
    { month: 'Oct', avg: (yearlyData?.general.avg_magnitude || 4.2) + 0.9, max: yearlyData?.general.max_magnitude || 6.8, min: 3.4 },
    { month: 'Nov', avg: (yearlyData?.general.avg_magnitude || 4.2) + 1.0, max: yearlyData?.general.max_magnitude || 6.8, min: 3.5 },
    { month: 'Dic', avg: (yearlyData?.general.avg_magnitude || 4.2) + 1.1, max: yearlyData?.general.max_magnitude || 6.8, min: 3.6 }
  ];

  // Datos de magnitud por año (simulados para todos los años)
  const yearlyMagnitudeData = [
    { year: '2020', avg: 4.2, max: 6.8, min: 2.1 },
    { year: '2021', avg: 4.5, max: 7.1, min: 2.3 },
    { year: '2022', avg: 4.8, max: 7.4, min: 2.5 },
    { year: '2023', avg: 5.1, max: 7.7, min: 2.8 },
    { year: '2024', avg: 5.4, max: 8.0, min: 3.0 },
    { year: '2025', avg: 5.7, max: 8.3, min: 3.2 }
  ];

  // Seleccionar datos según el filtro de año
  const magnitudeData = selectedYear === 'all' ? yearlyMagnitudeData : monthlyMagnitudeData;
  const magnitudeDataKey = selectedYear === 'all' ? 'year' : 'month';

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

  // Datos de actividad sísmica por mes (simulados)
  const monthlyActivity = [
    { month: 'Ene', count: 45 }, { month: 'Feb', count: 52 }, { month: 'Mar', count: 48 },
    { month: 'Abr', count: 61 }, { month: 'May', count: 55 }, { month: 'Jun', count: 58 },
    { month: 'Jul', count: 63 }, { month: 'Ago', count: 59 }, { month: 'Sep', count: 67 },
    { month: 'Oct', count: 71 }, { month: 'Nov', count: 65 }, { month: 'Dic', count: 73 }
  ];

  // Datos de actividad sísmica por año (simulados)
  const yearlyActivity = [
    { year: '2020', count: 1250 }, { year: '2021', count: 1380 }, { year: '2022', count: 1420 },
    { year: '2023', count: 1580 }, { year: '2024', count: 1650 }, { year: '2025', count: 1720 }
  ];

  // Seleccionar datos según el filtro de año
  const activityData = selectedYear === 'all' ? yearlyActivity : monthlyActivity;
  const dataKey = selectedYear === 'all' ? 'year' : 'month';
  const chartTitle = selectedYear === 'all' ? 'Actividad Sísmica por Año' : 'Actividad Sísmica por Mes';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`border rounded-lg p-6 text-center ${theme === 'dark' ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${theme === 'dark' ? 'bg-red-800' : 'bg-red-100'}`}>
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-red-300' : 'text-red-800'}`}>Error al cargar estadísticas</h3>
        <p className={`mb-4 ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
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
      <div className={`rounded-lg shadow-sm border p-6 transition-transform duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-red-600" />
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Estadísticas de Sismos en Sudamérica</h1>
          </div>
          
          {/* Filtro de Año */}
          <div className="relative">
            <button
              onClick={() => document.getElementById('year-selector')?.classList.toggle('hidden')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
            >
              <Calendar className="h-5 w-5" />
              <span className="font-medium">
                {selectedYear === 'all' ? 'Todos los años' : selectedYear}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>
            
            <div id="year-selector" className={`hidden absolute right-0 mt-2 w-48 border rounded-lg shadow-lg z-50 ${
              theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
            }`}>
              <button
                onClick={() => {
                  setSelectedYear('all');
                  document.getElementById('year-selector')?.classList.add('hidden');
                }}
                className={`w-full text-left px-4 py-2 transition-colors border-b ${
                  selectedYear === 'all' 
                    ? 'bg-red-600 text-white font-medium' 
                    : theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-700 border-gray-600'
                      : 'text-gray-700 hover:bg-gray-50 border-gray-100'
                }`}
              >
                Todos los años
              </button>
              <div className="max-h-20 overflow-y-auto">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      setSelectedYear(year);
                      document.getElementById('year-selector')?.classList.add('hidden');
                    }}
                    className={`w-full text-left px-4 py-2 transition-colors ${
                      selectedYear === year 
                        ? 'bg-red-600 text-white font-medium' 
                        : theme === 'dark'
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          {selectedYear === 'all' 
            ? 'Análisis completo de la actividad sísmica en la región sudamericana en todos los años registrados'
            : `Análisis completo de la actividad sísmica en la región sudamericana durante el año ${selectedYear}`
          }
        </p>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`rounded-lg shadow-sm border p-6 transition-transform duration-200 hover:shadow-md hover:-translate-y-0.5 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Sismos</p>
              <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{yearlyData?.general.total_earthquakes || 0}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-sm text-green-600 mt-2">
            {selectedYear === 'all' ? 'Todos los años' : `Año ${selectedYear}`}
          </p>
        </div>

        <div className={`rounded-lg shadow-sm border p-6 transition-transform duration-200 hover:shadow-md hover:-translate-y-0.5 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Magnitud Promedio</p>
              <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {yearlyData?.general.avg_magnitude ? yearlyData.general.avg_magnitude.toFixed(1) : '0.0'}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
          <p className="text-sm text-orange-600 mt-2">Promedio anual</p>
        </div>

        <div className={`rounded-lg shadow-sm border p-6 transition-transform duration-200 hover:shadow-md hover:-translate-y-0.5 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Magnitud Máxima</p>
              <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {yearlyData?.general.max_magnitude ? yearlyData.general.max_magnitude.toFixed(1) : '0.0'}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-sm text-red-600 mt-2">Máximo registrado</p>
        </div>

        <div className={`rounded-lg shadow-sm border p-6 transition-transform duration-200 hover:shadow-md hover:-translate-y-0.5 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Países Activos</p>
              <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{yearlyData?.by_country.length || 0}</p>
            </div>
            <MapPin className="h-8 w-8 text-yellow-600" />
          </div>
          <p className="text-sm text-yellow-600 mt-2">Con actividad</p>
        </div>
      </div>

      {/* Tarjetas adicionales de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`rounded-lg shadow-sm border p-6 transition-transform duration-200 hover:shadow-md hover:-translate-y-0.5 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Promedio Diario</p>
              <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {yearlyData?.general.total_earthquakes ? Math.round(yearlyData.general.total_earthquakes / 365) : 0}
              </p>
            </div>
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-sm text-purple-600 mt-2">Sismos por día</p>
        </div>

        <div className={`rounded-lg shadow-sm border p-6 transition-transform duration-200 hover:shadow-md hover:-translate-y-0.5 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Energía Total</p>
              <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {yearlyData?.general.total_earthquakes ? Math.round(yearlyData.general.total_earthquakes * 1.5) : 0}
              </p>
            </div>
            <Zap className="h-8 w-8 text-indigo-600" />
          </div>
          <p className="text-sm text-indigo-600 mt-2">GJ liberados</p>
        </div>

        <div className={`rounded-lg shadow-sm border p-6 transition-transform duration-200 hover:shadow-md hover:-translate-y-0.5 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Cobertura</p>
              <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {yearlyData?.by_country.length ? Math.round((yearlyData.by_country.length / 12) * 100) : 0}%
              </p>
            </div>
            <Globe className="h-8 w-8 text-teal-600" />
          </div>
          <p className="text-sm text-teal-600 mt-2">Países monitoreados</p>
        </div>

        <div className={`rounded-lg shadow-sm border p-6 transition-transform duration-200 hover:shadow-md hover:-translate-y-0.5 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Precisión</p>
              <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>98.5%</p>
            </div>
            <Target className="h-8 w-8 text-pink-600" />
          </div>
          <p className="text-sm text-pink-600 mt-2">Detección precisa</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sismos por País */}
        <div className={`rounded-lg shadow-sm border p-6 transition-transform duration-200 hover:shadow-md hover:-translate-y-0.5 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Sismos por País ({selectedYear === 'all' ? 'Todos los años' : selectedYear})
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={earthquakeData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="country" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: theme === 'dark' ? '#f9fafb' : '#111827'
                  }}
                />
                <Bar dataKey="count" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribución de Riesgo */}
        <div className={`${styles.riskCard} ${theme === 'dark' ? styles.riskCardDark : styles.riskCardLight} p-6`}>
          <h3 className={`${styles.riskTitle} ${theme === 'dark' ? styles.riskTitleDark : styles.riskTitleLight}`}>
            Distribución de Niveles de Riesgo ({selectedYear === 'all' ? 'Todos los años' : selectedYear})
          </h3>
          <div className={styles.riskChartContainer}>
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
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: theme === 'dark' ? '#ffffff' : '#111827'
                  }}
                  labelStyle={{
                    color: theme === 'dark' ? '#ffffff' : '#111827',
                    fontWeight: 'bold'
                  }}
                  itemStyle={{
                    color: theme === 'dark' ? '#d1d5db' : '#374151'
                  }}
                  formatter={(value, name) => [
                    <span style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>{value}</span>,
                    <span style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>{name}</span>
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Leyenda de Niveles de Riesgo */}
          <div className={styles.riskLegend}>
            <div className={styles.riskLegendGrid}>
              {riskDistribution.map((entry, index) => (
                <div key={index} className={styles.riskLegendItem}>
                  <div 
                    className={styles.riskLegendIndicator}
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <div className={styles.riskLegendText}>
                    <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {entry.name}:
                    </span>
                    <span className={`ml-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {entry.value / 10} países
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos de Línea */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Magnitud por Mes */}
        <div className={`rounded-lg shadow-sm border p-6 transition-transform duration-200 hover:shadow-md hover:-translate-y-0.5 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Evolución de Magnitud Promedio ({selectedYear === 'all' ? 'Todos los años' : selectedYear})
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={magnitudeData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey={magnitudeDataKey} stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                <YAxis domain={[0, 8]} stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: theme === 'dark' ? '#f9fafb' : '#111827'
                  }}
                />
                <Line type="monotone" dataKey="avg" stroke="#3B82F6" strokeWidth={3} name="Promedio" />
                <Line type="monotone" dataKey="max" stroke="#EF4444" strokeWidth={2} name="Máximo" />
                <Line type="monotone" dataKey="min" stroke="#22C55E" strokeWidth={2} name="Mínimo" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actividad Sísmica por Año/Mes */}
        <div className={`rounded-lg shadow-sm border p-6 transition-transform duration-200 hover:shadow-md hover:-translate-y-0.5 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {chartTitle} ({selectedYear === 'all' ? 'Todos los años' : selectedYear})
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey={dataKey} stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: theme === 'dark' ? '#f9fafb' : '#111827'
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>



      {/* Tabla de Resumen */}
      <div className={`rounded-lg shadow-sm border p-6 transition-transform duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Resumen por País ({selectedYear === 'all' ? 'Todos los años' : selectedYear})
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`text-left py-3 px-4 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>País</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Sismos</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Magnitud Promedio</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Magnitud Máxima</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Nivel de Riesgo</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Primer Sismo</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Último Sismo</th>
              </tr>
            </thead>
            <tbody>
              {yearlyData?.by_country.map((country, index) => (
                <tr key={index} className={`border-b ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}>
                  <td className={`py-3 px-4 text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{country.country}</td>
                  <td className={`py-3 px-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{country.count}</td>
                  <td className={`py-3 px-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {country.avg_magnitude ? country.avg_magnitude.toFixed(2) : 'N/A'}
                  </td>
                  <td className={`py-3 px-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
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
                  <td className={`py-3 px-4 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    {country.first_date ? new Date(country.first_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className={`py-3 px-4 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
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