import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Line, 
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';
import { TrendingUp, BarChart3, Target } from 'lucide-react';
import styles from './MagnitudPromedioCharts.module.css';

interface MagnitudPromedioChartsProps {
  countryData: any;
  selectedYear: number | 'all';
}

const MagnitudPromedioCharts: React.FC<MagnitudPromedioChartsProps> = ({ countryData, selectedYear }) => {
  // Función para crear datos promediados por grupos
  const createAveragedData = (data: any[], groupSize: number = 20) => {
    const groups = [];
    for (let i = 0; i < data.length; i += groupSize) {
      const group = data.slice(i, i + groupSize);
      const startDate = new Date(group[0]?.date || new Date());
      const endDate = new Date(group[group.length - 1]?.date || new Date());
      
      groups.push({
        period: `Grupo ${Math.floor(i / groupSize) + 1}`,
        startDate: startDate,
        endDate: endDate,
        count: group.length,
        dateRange: `${startDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}`
      });
    }
    return groups;
  };

  // Datos para el gráfico de evolución de magnitud promedio
  let averageMagnitudeEvolution;
  if (selectedYear === 'all' && countryData?.yearly_breakdown) {
    // Para "Todos los años": mostrar evolución por año
    averageMagnitudeEvolution = countryData.yearly_breakdown
      .sort((a: any, b: any) => Number(a.year) - Number(b.year))
      .map((yearData: any) => ({
        period: yearData.year,
        average: yearData.avg_magnitude,
        cumulative: yearData.avg_magnitude,
        year: yearData.year,
        total: yearData.total_earthquakes,
        maxMagnitude: yearData.max_magnitude
      }));
  } else {
    // Para año específico: mostrar evolución temporal promediada
    averageMagnitudeEvolution = createAveragedData(
      (countryData?.recent_events || []).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    ).map((group, groupIndex) => {
      const startIndex = groupIndex * 20;
      const endIndex = Math.min(startIndex + 20, (countryData?.recent_events || []).length);
      const eventsInGroup = (countryData?.recent_events || []).slice(startIndex, endIndex);
      const average = eventsInGroup.reduce((sum: number, e: any) => sum + (e.magnitude || 0), 0) / eventsInGroup.length;
      
      return {
        period: group.period,
        average: average,
        cumulative: average,
        date: group.startDate,
        dateRange: group.dateRange
      };
    });
  }

  // Datos para el gráfico de comparación magnitud promedio vs máxima
  let comparisonData;
  if (selectedYear === 'all' && countryData?.yearly_breakdown) {
    // Para "Todos los años": mostrar comparación por año
    comparisonData = countryData.yearly_breakdown
      .sort((a: any, b: any) => Number(a.year) - Number(b.year))
      .map((yearData: any) => ({
        period: yearData.year,
        average: yearData.avg_magnitude,
        maximum: yearData.max_magnitude,
        year: yearData.year,
        total: yearData.total_earthquakes
      }));
  } else {
    // Para año específico: mostrar comparación temporal promediada
    comparisonData = createAveragedData(
      (countryData?.recent_events || []).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    ).map((group, groupIndex) => {
      const startIndex = groupIndex * 20;
      const endIndex = Math.min(startIndex + 20, (countryData?.recent_events || []).length);
      const eventsInGroup = (countryData?.recent_events || []).slice(startIndex, endIndex);
      const average = eventsInGroup.reduce((sum: number, e: any) => sum + (e.magnitude || 0), 0) / eventsInGroup.length;
      const max = Math.max(...eventsInGroup.map((e: any) => e.magnitude || 0));
      
      return {
        period: group.period,
        average: average,
        maximum: max,
        date: group.startDate,
        dateRange: group.dateRange
      };
    });
  }

  // Datos para el gráfico de distribución de desviaciones
  let deviationAnalysis;
  if (selectedYear === 'all' && countryData?.yearly_breakdown) {
    // Para "Todos los años": mostrar análisis por año
    deviationAnalysis = countryData.yearly_breakdown
      .sort((a: any, b: any) => Number(a.year) - Number(b.year))
      .map((yearData: any) => {
        const avgDeviation = Math.abs((yearData.avg_magnitude || 0) - (countryData?.avg_magnitude || 0));
        return {
          magnitude: yearData.avg_magnitude,
          deviation: avgDeviation,
          year: yearData.year,
          total: yearData.total_earthquakes,
          maxMagnitude: yearData.max_magnitude
        };
      });
  } else {
    // Para año específico: mostrar análisis temporal promediado
    deviationAnalysis = createAveragedData(
      (countryData?.recent_events || []).sort((a: any, b: any) => a.magnitude - b.magnitude)
    ).map((group, groupIndex) => {
      const startIndex = groupIndex * 20;
      const endIndex = Math.min(startIndex + 20, (countryData?.recent_events || []).length);
      const eventsInGroup = (countryData?.recent_events || []).slice(startIndex, endIndex);
      const avgMagnitude = eventsInGroup.reduce((sum: number, e: any) => sum + (e.magnitude || 0), 0) / eventsInGroup.length;
      const avgDeviation = eventsInGroup.reduce((sum: number, e: any) => {
        return sum + Math.abs((e.magnitude || 0) - (countryData?.avg_magnitude || 0));
      }, 0) / eventsInGroup.length;
      
      return {
        magnitude: avgMagnitude,
        deviation: avgDeviation,
        date: group.startDate,
        dateRange: group.dateRange,
        count: eventsInGroup.length
      };
    });
  }

  // Calcular estadísticas de desviación
  const avgDeviation = deviationAnalysis.length > 0 
    ? deviationAnalysis.reduce((sum: number, item: any) => sum + item.deviation, 0) / deviationAnalysis.length 
    : 0;

  return (
    <div className={styles.chartsContainer}>
      <div className={styles.header}>
        <div className={styles.iconContainer}>
          <TrendingUp className={styles.icon} />
        </div>
        <div>
          <h2 className={styles.title}>Análisis Detallado: Magnitud Promedio</h2>
          <p className={styles.subtitle}>
            Magnitud promedio: M{(countryData?.avg_magnitude || 0).toFixed(1)} en {selectedYear === 'all' ? 'todos los años' : selectedYear}
          </p>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        {/* Gráfico de evolución de magnitud promedio */}
        <div className={styles.chartCard}>
                      <h3 className={styles.chartTitle}>
              <TrendingUp className={styles.chartIcon} />
              {selectedYear === 'all' ? 'Evolución de Magnitud Promedio por Año' : 'Evolución de Magnitud Promedio (Promediado)'}
            </h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={averageMagnitudeEvolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis domain={[0, 7]} />
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
                    `M${value.toFixed(2)}`, 
                    selectedYear === 'all' ? 'Magnitud Promedio' : 'Magnitud Promedio'
                  ]}
                  labelFormatter={(label: any) => {
                    const event = averageMagnitudeEvolution.find((e: any) => e.period === label);
                    if (selectedYear === 'all' && event) {
                      return `Año ${label} - ${event.total} sismos (M${event.maxMagnitude?.toFixed(1) || '0.0'} máx.)`;
                    }
                    return event ? `${label} - ${event.dateRange}` : label;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="average" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de comparación promedio vs máximo */}
        <div className={styles.chartCard}>
                      <h3 className={styles.chartTitle}>
              <BarChart3 className={styles.chartIcon} />
              {selectedYear === 'all' ? 'Comparación Promedio vs Máximo por Año' : 'Comparación Promedio vs Máximo (Promediado)'}
            </h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis domain={[0, 7]} />
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
                    `M${value.toFixed(2)}`, 
                    name === 'average' ? 'Promedio' : 'Máximo'
                  ]}
                  labelFormatter={(label: any) => {
                    const event = comparisonData.find((e: any) => e.period === label);
                    if (selectedYear === 'all' && event) {
                      return `Año ${label} - ${event.total} sismos`;
                    }
                    return label;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="average" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  name="Promedio"
                />
                <Line 
                  type="monotone" 
                  dataKey="maximum" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#EF4444', strokeWidth: 2, r: 3 }}
                  name="Máximo"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de análisis de desviaciones */}
        <div className={styles.chartCard}>
                      <h3 className={styles.chartTitle}>
              <Target className={styles.chartIcon} />
              {selectedYear === 'all' ? 'Análisis de Desviaciones por Año' : 'Análisis de Desviaciones (Promediado)'}
            </h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deviationAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="magnitude" />
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
                  formatter={(value: any, name: any) => [
                    name === 'deviation' ? `${value.toFixed(2)}` : `M${value.toFixed(1)}`, 
                    name === 'deviation' ? 'Desviación' : 'Magnitud'
                  ]}
                  labelFormatter={(label: any) => {
                    const event = deviationAnalysis.find((e: any) => e.magnitude === label);
                    return event ? `M${label} - ${new Date(event.date).toLocaleDateString()}` : `M${label}`;
                  }}
                />
                <Bar dataKey="deviation" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Estadísticas de magnitud promedio */}
        <div className={styles.statsCard}>
          <h3 className={styles.chartTitle}>Estadísticas de Magnitud Promedio</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Magnitud Promedio</span>
              <span className={styles.statValue}>
                M{(countryData?.avg_magnitude || 0).toFixed(2)}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Desviación Promedio</span>
              <span className={styles.statValue}>
                M{avgDeviation.toFixed(2)}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Magnitud Mínima</span>
              <span className={styles.statValue}>
                M{Math.min(...(countryData?.recent_events?.map((e: any) => e.magnitude || 0) || [0])).toFixed(1)}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Magnitud Máxima</span>
              <span className={styles.statValue}>
                M{Math.max(...(countryData?.recent_events?.map((e: any) => e.magnitude || 0) || [0])).toFixed(1)}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Rango de Magnitudes</span>
              <span className={styles.statValue}>
                M{(
                  Math.max(...(countryData?.recent_events?.map((e: any) => e.magnitude || 0) || [0])) -
                  Math.min(...(countryData?.recent_events?.map((e: any) => e.magnitude || 0) || [0]))
                ).toFixed(1)}
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

export default MagnitudPromedioCharts;
