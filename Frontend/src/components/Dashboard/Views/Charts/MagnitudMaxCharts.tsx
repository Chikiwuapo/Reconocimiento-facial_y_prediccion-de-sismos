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
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { Zap, TrendingUp, AlertTriangle, MapPin } from 'lucide-react';
import styles from './MagnitudMaxCharts.module.css';

interface MagnitudMaxChartsProps {
  countryData: any;
  selectedYear: number | 'all';
}

const MagnitudMaxCharts: React.FC<MagnitudMaxChartsProps> = ({ countryData, selectedYear }) => {
  // Datos para el gráfico de evolución de magnitud máxima
  const createAveragedData = (data: any[], groupSize: number = 20) => {
    const groups = [];
    for (let i = 0; i < data.length; i += groupSize) {
      const group = data.slice(i, i + groupSize);
      const avgMagnitude = group.reduce((sum, event) => sum + (event.magnitude || 0), 0) / group.length;
      const startDate = new Date(group[0]?.date || new Date());
      const endDate = new Date(group[group.length - 1]?.date || new Date());
      
      groups.push({
        period: `Grupo ${Math.floor(i / groupSize) + 1}`,
        magnitude: avgMagnitude,
        startDate: startDate,
        endDate: endDate,
        count: group.length,
        dateRange: `${startDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}`
      });
    }
    return groups;
  };

  // Datos para el gráfico de evolución de magnitud máxima
  let maxMagnitudeEvolution;
  if (selectedYear === 'all' && countryData?.yearly_breakdown) {
    // Para "Todos los años": mostrar evolución por año
    maxMagnitudeEvolution = countryData.yearly_breakdown
      .sort((a: any, b: any) => Number(a.year) - Number(b.year))
      .map((yearData: any) => ({
        period: yearData.year,
        magnitude: yearData.max_magnitude,
        year: yearData.year,
        total: yearData.total_earthquakes,
        avgMagnitude: yearData.avg_magnitude
      }));
  } else {
    // Para año específico: mostrar evolución temporal promediada
    maxMagnitudeEvolution = createAveragedData(
      (countryData?.recent_events || []).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    );
  }

  // Datos para el gráfico de distribución de magnitudes por rango
  const magnitudeRanges = [
    { range: '2.0-3.0', count: countryData?.recent_events?.filter((e: any) => e.magnitude >= 2.0 && e.magnitude < 3.0).length || 0, color: '#22C55E' },
    { range: '3.0-4.0', count: countryData?.recent_events?.filter((e: any) => e.magnitude >= 3.0 && e.magnitude < 4.0).length || 0, color: '#F59E0B' },
    { range: '4.0-5.0', count: countryData?.recent_events?.filter((e: any) => e.magnitude >= 4.0 && e.magnitude < 5.0).length || 0, color: '#F97316' },
    { range: '5.0-6.0', count: countryData?.recent_events?.filter((e: any) => e.magnitude >= 5.0 && e.magnitude < 6.0).length || 0, color: '#EF4444' },
    { range: '6.0+', count: countryData?.recent_events?.filter((e: any) => e.magnitude >= 6.0).length || 0, color: '#7C2D12' }
  ];

  // Datos para el gráfico de dispersión magnitud vs tiempo
  let magnitudeTimeScatter;
  if (selectedYear === 'all' && countryData?.yearly_breakdown) {
    // Para "Todos los años": mostrar dispersión por año
    magnitudeTimeScatter = countryData.yearly_breakdown
      .sort((a: any, b: any) => Number(a.year) - Number(b.year))
      .map((yearData: any, index: number) => ({
        x: index,
        y: yearData.max_magnitude,
        z: yearData.total_earthquakes,
        year: yearData.year,
        total: yearData.total_earthquakes,
        avgMagnitude: yearData.avg_magnitude
      }));
  } else {
    // Para año específico: mostrar dispersión temporal promediada
    magnitudeTimeScatter = createAveragedData(
      (countryData?.recent_events || []).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    ).map((group, index) => ({
      x: index,
      y: group.magnitude,
      z: group.count, // El tamaño del punto representa la cantidad de eventos en el grupo
      dateRange: group.dateRange,
      count: group.count
    }));
  }

  // Encontrar la magnitud máxima real
  const maxMagnitude = Math.max(...(countryData?.recent_events?.map((e: any) => e.magnitude || 0) || [0]));

  return (
    <div className={styles.chartsContainer}>
      <div className={styles.header}>
        <div className={styles.iconContainer}>
          <Zap className={styles.icon} />
        </div>
        <div>
          <h2 className={styles.title}>Análisis Detallado: Magnitud Máxima</h2>
          <p className={styles.subtitle}>
            Magnitud máxima registrada: M{maxMagnitude.toFixed(1)} en {selectedYear === 'all' ? 'todos los años' : selectedYear}
          </p>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        {/* Gráfico de evolución de magnitud máxima */}
        <div className={styles.chartCard}>
                      <h3 className={styles.chartTitle}>
              <TrendingUp className={styles.chartIcon} />
              {selectedYear === 'all' ? 'Evolución de Magnitud Máxima por Año' : 'Evolución de Magnitud Máxima (Promediado)'}
            </h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={maxMagnitudeEvolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis domain={[0, Math.max(maxMagnitude + 1, 7)]} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#111827'
                  }}
                  labelStyle={{
                    color: '#111827'
                  }}
                  itemStyle={{
                    color: '#111827'
                  }}
                  formatter={(value: any) => [
                    `M${value.toFixed(1)}`, 
                    selectedYear === 'all' ? 'Magnitud Máxima' : 'Magnitud Promedio'
                  ]}
                  labelFormatter={(label: any) => {
                    const event = maxMagnitudeEvolution.find((e: any) => e.period === label);
                    if (selectedYear === 'all' && event) {
                      return `Año ${label} - ${event.total} sismos (M${event.avgMagnitude?.toFixed(1) || '0.0'} prom.)`;
                    }
                    return event ? `${label} - ${event.dateRange}` : label;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="magnitude" 
                  stroke="#EF4444" 
                  strokeWidth={3}
                  dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de distribución por rangos de magnitud */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            <MapPin className={styles.chartIcon} />
            Distribución por Rangos de Magnitud
          </h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={magnitudeRanges}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#111827'
                  }}
                  labelStyle={{
                    color: '#111827'
                  }}
                  itemStyle={{
                    color: '#111827'
                  }}
                />
                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de dispersión magnitud vs tiempo */}
        <div className={styles.chartCard}>
                      <h3 className={styles.chartTitle}>
              <AlertTriangle className={styles.chartIcon} />
              {selectedYear === 'all' ? 'Dispersión Magnitud vs Tiempo por Año' : 'Dispersión Magnitud vs Tiempo (Promediado)'}
            </h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={magnitudeTimeScatter}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="x" 
                  name="Período"
                  type="number"
                  domain={[0, 'dataMax']}
                />
                <YAxis 
                  dataKey="y" 
                  name="Magnitud"
                  domain={[0, Math.max(maxMagnitude + 1, 7)]}
                />
                <ZAxis dataKey="z" range={[60, 400]} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#111827'
                  }}
                  labelStyle={{
                    color: '#111827'
                  }}
                  itemStyle={{
                    color: '#111827'
                  }}
                  formatter={(value: any, name: any) => [
                    name === 'x' ? (selectedYear === 'all' ? `Año ${value + 2020}` : `Grupo ${value + 1}`) : 
                    name === 'y' ? `M${value.toFixed(1)}` : 
                    `${value} eventos`, 
                    name === 'x' ? (selectedYear === 'all' ? 'Año' : 'Grupo') : 
                    name === 'y' ? (selectedYear === 'all' ? 'Magnitud Máxima' : 'Magnitud Promedio') : 'Cantidad de Eventos'
                  ]}
                  labelFormatter={(label: any) => {
                    const event = magnitudeTimeScatter[parseInt(label)];
                    if (selectedYear === 'all' && event) {
                      return `Año ${event.year} - ${event.total} sismos (M${event.avgMagnitude?.toFixed(1) || '0.0'} prom.)`;
                    }
                    return event ? `${event.dateRange} (${event.count} eventos)` : label;
                  }}
                />
                <Scatter 
                  dataKey="y" 
                  fill="#EF4444"
                  shape="circle"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Estadísticas de magnitud */}
        <div className={styles.statsCard}>
          <h3 className={styles.chartTitle}>Estadísticas de Magnitud</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Magnitud Máxima</span>
              <span className={styles.statValue}>M{maxMagnitude.toFixed(1)}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Magnitud Promedio</span>
              <span className={styles.statValue}>
                M{(countryData?.avg_magnitude || 0).toFixed(1)}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Sismos M4.0+</span>
              <span className={styles.statValue}>
                {countryData?.recent_events?.filter((e: any) => e.magnitude >= 4.0).length || 0}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Sismos M5.0+</span>
              <span className={styles.statValue}>
                {countryData?.recent_events?.filter((e: any) => e.magnitude >= 5.0).length || 0}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Sismos M6.0+</span>
              <span className={styles.statValue}>
                {countryData?.recent_events?.filter((e: any) => e.magnitude >= 6.0).length || 0}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Período de Análisis</span>
              <span className={styles.statValue}>
                {selectedYear === 'all' ? 'Multi-anual' : `${selectedYear}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MagnitudMaxCharts;
