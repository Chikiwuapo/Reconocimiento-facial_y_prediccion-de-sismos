import React, { useState, useEffect } from 'react';
 
import { MapPin, AlertTriangle, Activity, TrendingUp, Clock, Zap, Calendar, ChevronDown, X } from 'lucide-react';
import { Country } from '../../../types/dashboard';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import { earthquakeService, CountryYearlyStatistics } from '../../../services/earthquakeService';
import { useTheme } from '../../../context/ThemeContext';
import TotalSismosCharts from './Charts/TotalSismosCharts';
import MagnitudMaxCharts from './Charts/MagnitudMaxCharts';
import MagnitudPromedioCharts from './Charts/MagnitudPromedioCharts';
import UltimoSismoCharts from './Charts/UltimoSismoCharts';
import styles from './CountryView.module.css';

interface CountryViewProps {
  country: Country;
}

const CountryView: React.FC<CountryViewProps> = ({ country }) => {
  const { theme } = useTheme();
  const { ErrorFallback } = useErrorHandler();
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(2025);
  const [countryData, setCountryData] = useState<CountryYearlyStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(100);
  
  // Estados para filtros
  const [magnitudeFilter, setMagnitudeFilter] = useState<string>('');
  const [rangeFilter, setRangeFilter] = useState<string>('');

  const years = [2020, 2021, 2022, 2023, 2024, 2025];

  // Helpers para métricas alternativas cuando no hay probabilidades
  const getMagnitudeRange = (magnitude?: number): string => {
    const m = magnitude ?? 0;
    if (m >= 6.0) return '6.0+';
    if (m >= 5.0) return '5.0-6.0';
    if (m >= 4.0) return '4.0-5.0';
    if (m >= 3.0) return '3.0-4.0';
    return '2.0-3.0';
  };
  const getMagnitudeTrend = (current?: number, previous?: number): '↑' | '↓' | '→' => {
    const c = current ?? 0;
    const p = previous ?? 0;
    if (c > p) return '↑';
    if (c < p) return '↓';
    return '→';
  };

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

  // Resetear paginación cuando cambie el dataset (país/año) o los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [countryData, selectedYear, country.name, magnitudeFilter, rangeFilter]);

  // Aplicar filtros a los eventos
  const filteredEvents = (countryData?.recent_events || []).filter((event: any, index: number) => {
    const magnitude = event.magnitude || 0;
    const range = getMagnitudeRange(magnitude);
    
    // Filtro por magnitud
    if (magnitudeFilter && !magnitude.toString().includes(magnitudeFilter)) {
      return false;
    }
    
    // Filtro por rango
    if (rangeFilter && !range.toLowerCase().includes(rangeFilter.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Calcular paginación para la tabla de sismos recientes filtrados
  const totalItems = filteredEvents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pagedEvents = filteredEvents.slice(startIndex, endIndex);



  // (Se removió 'earthquakeHistory' al eliminar tarjetas relacionadas)

  // (Se eliminaron cálculos para tarjetas de gráficos removidas)

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
            
            <div id="country-year-selector" className="hidden absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
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
              <div className="max-h-20 overflow-y-auto">
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
        </div>

        {/* KPIs del País */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div 
            className={`bg-gray-50 rounded-lg p-4 cursor-pointer ${
              selectedKPI === 'total-sismos' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            } ${styles.kpiCard} ${selectedKPI === 'total-sismos' ? styles.kpiCardActive : ''}`}
            onClick={() => setSelectedKPI(selectedKPI === 'total-sismos' ? null : 'total-sismos')}
          >
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Total Sismos</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{countryData?.total_earthquakes || 0}</p>
            <p className="text-xs text-gray-500">
              {selectedYear === 'all' ? 'Todos los años' : `Año ${selectedYear}`}
            </p>
            <p className={`text-xs mt-2 ${styles.kpiIndicator} ${
              selectedKPI === 'total-sismos' ? 'text-blue-700 font-medium' : 'text-blue-600'
            }`}>
              {selectedKPI === 'total-sismos' ? '✓ Análisis visible - Click para ocultar' : 'Click para ver análisis detallado'}
            </p>
          </div>

          <div 
            className={`bg-gray-50 rounded-lg p-4 cursor-pointer ${
              selectedKPI === 'magnitud-max' ? 'ring-2 ring-orange-500 bg-orange-50' : ''
            } ${styles.kpiCard} ${selectedKPI === 'magnitud-max' ? styles.kpiCardActive : ''}`}
            onClick={() => setSelectedKPI(selectedKPI === 'magnitud-max' ? null : 'magnitud-max')}
          >
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
            <p className={`text-xs mt-2 ${styles.kpiIndicator} ${
              selectedKPI === 'magnitud-max' ? 'text-orange-700 font-medium' : 'text-orange-600'
            }`}>
              {selectedKPI === 'magnitud-max' ? '✓ Análisis visible - Click para ocultar' : 'Click para ver análisis detallado'}
            </p>
          </div>

          <div 
            className={`bg-gray-50 rounded-lg p-4 cursor-pointer ${
              selectedKPI === 'magnitud-promedio' ? 'ring-2 ring-green-500 bg-green-50' : ''
            } ${styles.kpiCard} ${selectedKPI === 'magnitud-promedio' ? styles.kpiCardActive : ''}`}
            onClick={() => setSelectedKPI(selectedKPI === 'magnitud-promedio' ? null : 'magnitud-promedio')}
          >
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Promedio</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              M{countryData?.avg_magnitude ? countryData.avg_magnitude.toFixed(1) : '0.0'}
            </p>
            <p className="text-xs text-gray-500">Magnitud</p>
            <p className={`text-xs mt-2 ${styles.kpiIndicator} ${
              selectedKPI === 'magnitud-promedio' ? 'text-green-700 font-medium' : 'text-green-600'
            }`}>
              {selectedKPI === 'magnitud-promedio' ? '✓ Análisis visible - Click para ocultar' : 'Click para ver análisis detallado'}
            </p>
          </div>

          <div 
            className={`bg-gray-50 rounded-lg p-4 cursor-pointer ${
              selectedKPI === 'ultimo-sismo' ? 'ring-2 ring-purple-500 bg-purple-50' : ''
            } ${styles.kpiCard} ${selectedKPI === 'ultimo-sismo' ? styles.kpiCardActive : ''}`}
            onClick={() => setSelectedKPI(selectedKPI === 'ultimo-sismo' ? null : 'ultimo-sismo')}
          >
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Último</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {countryData?.last_date ? new Date(countryData.last_date).toLocaleDateString() : 'N/A'}
            </p>
            <p className="text-xs text-gray-500">Sismo</p>
            <p className={`text-xs mt-2 ${styles.kpiIndicator} ${
              selectedKPI === 'ultimo-sismo' ? 'text-purple-700 font-medium' : 'text-purple-600'
            }`}>
              {selectedKPI === 'ultimo-sismo' ? '✓ Análisis visible - Click para ocultar' : 'Click para ver análisis detallado'}
            </p>
          </div>
        </div>
      </div>

              {/* Gráficos Detallados de KPIs */}
        {selectedKPI && (
          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${styles.animateIn}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedKPI === 'total-sismos' && 'Análisis Detallado: Total de Sismos'}
                {selectedKPI === 'magnitud-max' && 'Análisis Detallado: Magnitud Máxima'}
                {selectedKPI === 'magnitud-promedio' && 'Análisis Detallado: Magnitud Promedio'}
                {selectedKPI === 'ultimo-sismo' && 'Análisis Detallado: Último Sismo'}
              </h2>
              <button
                onClick={() => setSelectedKPI(null)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="Cerrar análisis"
              >
                <X className="h-5 w-5" />
              </button>
        </div>

          {selectedKPI === 'total-sismos' && (
            <TotalSismosCharts countryData={countryData} selectedYear={selectedYear} />
          )}
          
          {selectedKPI === 'magnitud-max' && (
            <MagnitudMaxCharts countryData={countryData} selectedYear={selectedYear} />
          )}
          
          {selectedKPI === 'magnitud-promedio' && (
            <MagnitudPromedioCharts countryData={countryData} selectedYear={selectedYear} />
          )}
          
          {selectedKPI === 'ultimo-sismo' && (
            <UltimoSismoCharts countryData={countryData} selectedYear={selectedYear} />
          )}
        </div>
      )}

      {/* Gráficos (se eliminaron: Historial de Sismos, Distribución de Magnitudes, Análisis de Profundidad) */}

      {/* Tabla de Sismos Recientes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-transform duration-200 hover:shadow-md hover:-translate-y-0.5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Sismos Recientes ({selectedYear === 'all' ? 'Todos los años' : selectedYear})
        </h3>
        
        {/* Filtros */}
        <div className={`mb-4 p-4 rounded-lg border ${styles.filtersContainer} ${theme === 'dark' ? styles.filtersContainerDark : styles.filtersContainerLight}`}>
          <div className="flex flex-wrap gap-4 items-center">
                          <div className="flex items-center gap-2">
                <label className={`text-sm font-medium ${styles.filterLabel} ${theme === 'dark' ? styles.filterLabelDark : styles.filterLabelLight}`}>Magnitud:</label>
                              <input
                  type="text"
                  placeholder="Ej: 5.2"
                  value={magnitudeFilter}
                  onChange={(e) => setMagnitudeFilter(e.target.value)}
                  className={`px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${styles.filterInput} ${theme === 'dark' ? styles.filterInputDark : styles.filterInputLight}`}
                />
            </div>
            
            <div className="flex items-center gap-2">
              <label className={`text-sm font-medium ${styles.filterLabel} ${theme === 'dark' ? styles.filterLabelDark : styles.filterLabelLight}`}>Rango:</label>
              <select
                value={rangeFilter}
                onChange={(e) => setRangeFilter(e.target.value)}
                className={`px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${styles.filterInput} ${theme === 'dark' ? styles.filterInputDark : styles.filterInputLight}`}
              >
                <option value="">Todos los rangos</option>
                <option value="2.0-3.0">2.0-3.0</option>
                <option value="3.0-4.0">3.0-4.0</option>
                <option value="4.0-5.0">4.0-5.0</option>
                <option value="5.0-6.0">5.0-6.0</option>
                <option value="6.0+">6.0+</option>
              </select>
            </div>
            

            
            <button
              onClick={() => {
                setMagnitudeFilter('');
                setRangeFilter('');
              }}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${styles.clearButton} ${theme === 'dark' ? styles.clearButtonDark : styles.clearButtonLight}`}
            >
              Limpiar Filtros
            </button>
          </div>
          
          {magnitudeFilter || rangeFilter ? (
            <div className={`mt-2 text-sm ${styles.activeFiltersText} ${theme === 'dark' ? styles.activeFiltersTextDark : styles.activeFiltersTextLight}`}>
              Filtros activos: 
              {magnitudeFilter && <span className={`ml-1 px-2 py-1 rounded ${styles.filterTag} ${styles.filterTagMagnitude} ${theme === 'dark' ? styles.filterTagDark : styles.filterTagLight}`}>Magnitud: {magnitudeFilter}</span>}
              {rangeFilter && <span className={`ml-1 px-2 py-1 rounded ${styles.filterTag} ${styles.filterTagRange} ${theme === 'dark' ? styles.filterTagDark : styles.filterTagLight}`}>Rango: {rangeFilter}</span>}
            </div>
          ) : null}
        </div>
        
        <div className={`${styles.tableScrollContainer} ${theme === 'dark' ? styles.tableScrollContainerDark : ''}`}>
          <table className="min-w-full">
            <thead className={`${styles.tableHeader} ${theme === 'dark' ? styles.tableHeaderDark : ''}`}>
              <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`text-left py-3 px-4 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Fecha</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Magnitud</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Ubicación</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Rango</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Desviación</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Tendencia</th>
              </tr>
            </thead>
            <tbody>
              {pagedEvents.map((event, index) => {
                const globalIndex = startIndex + index;
                return (
                  <tr key={globalIndex} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-700">
                    M{event.magnitude ? event.magnitude.toFixed(1) : '0.0'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">{event.location}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                      {getMagnitudeRange(event.magnitude)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                      {(() => {
                        const avg = countryData?.avg_magnitude ?? 0;
                        const dev = Math.abs((event.magnitude ?? 0) - avg);
                        return `Δ ${dev.toFixed(2)}`;
                      })()}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                      {(() => {
                        const prev = globalIndex > 0 ? countryData?.recent_events[globalIndex - 1]?.magnitude : undefined;
                        const trend = getMagnitudeTrend(event.magnitude, prev);
                        return `Tendencia ${trend}`;
                      })()}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Controles de paginación */}
        <div className="flex items-center justify-between mt-4 gap-4">
          <div className="text-sm text-gray-600">
            Mostrando {totalItems === 0 ? 0 : startIndex + 1}-{endIndex} de {totalItems}
            {magnitudeFilter || rangeFilter ? (
              <span className="ml-2 text-blue-600">
                (de {countryData?.recent_events?.length || 0} total)
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded border text-sm ${currentPage === 1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
              Anterior
            </button>
            <span className="text-sm text-gray-700">Página {currentPage} de {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className={`px-3 py-1 rounded border text-sm ${currentPage >= totalPages ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
              Siguiente
            </button>
            <div className="flex items-center gap-2 ml-2">
              <label className="text-sm text-gray-600">Filas:</label>
              <select
                className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                value={pageSize}
                onChange={(e) => {
                  const newSize = Number(e.target.value);
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
                <option value={500}>500</option>
              </select>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CountryView; 