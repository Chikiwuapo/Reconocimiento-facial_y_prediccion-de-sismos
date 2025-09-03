import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Activity, TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import styles from '../../../../styles/TotalSismosCharts.module.css';

interface TotalSismosChartsProps {
  countryData: any;
  selectedYear: number | 'all';
}

const TotalSismosCharts: React.FC<TotalSismosChartsProps> = ({ countryData, selectedYear }) => {
  // Datos para el gráfico de evolución acumulativa
  const cumulativeEvolution = selectedYear === 'all'
    ? (countryData?.yearly_breakdown || [])
        .sort((a: any, b: any) => Number(a.year) - Number(b.year)) // Order by year ascending
        .map((yearData: any) => ({
          period: `Año ${yearData.year}`,
          count: yearData.total_earthquakes,
          year: yearData.year
        }))
    : (countryData?.recent_events || [])
        .map((event: any, index: number) => ({
          period: new Date(event.date).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short'
          }),
          count: index + 1,
          date: event.date
        }));

  // Datos para el gráfico de distribución por mes
  const monthlyDistribution = selectedYear === 'all'
    ? (countryData?.yearly_breakdown || [])
        .sort((a: any, b: any) => Number(a.year) - Number(b.year))
        .map((yearData: any) => ({
          month: yearData.year,
          count: yearData.total_earthquakes,
          year: yearData.year
        }))
    : (() => {
        const monthlyData = Array.from({ length: 12 }, (_, i) => ({
          month: new Date(2025, i, 1).toLocaleDateString('es-ES', { month: 'short' }),
          count: 0,
          monthIndex: i
        }));
        
                 (countryData?.recent_events || []).forEach((event: any) => {
           const date = new Date(event.date);
           const monthIndex = date.getMonth();
           if (date.getFullYear() === selectedYear && monthlyData[monthIndex]) {
             monthlyData[monthIndex].count++;
           }
         });
        
        return monthlyData;
      })();

  

  // Datos para el gráfico de distribución por magnitud
  const magnitudeDistribution = [
    { range: '2.0-3.0', count: countryData?.recent_events?.filter((e: any) => e.magnitude >= 2.0 && e.magnitude < 3.0).length || 0, color: '#22C55E' },
    { range: '3.0-4.0', count: countryData?.recent_events?.filter((e: any) => e.magnitude >= 3.0 && e.magnitude < 4.0).length || 0, color: '#F59E0B' },
    { range: '4.0-5.0', count: countryData?.recent_events?.filter((e: any) => e.magnitude >= 4.0 && e.magnitude < 5.0).length || 0, color: '#F97316' },
    { range: '5.0-6.0', count: countryData?.recent_events?.filter((e: any) => e.magnitude >= 5.0 && e.magnitude < 6.0).length || 0, color: '#EF4444' },
    { range: '6.0+', count: countryData?.recent_events?.filter((e: any) => e.magnitude >= 6.0).length || 0, color: '#7C2D12' }
  ];

  const chartTitle = selectedYear === 'all' ? 'por Año' : `(${selectedYear})`;
  const tooltipTitle = selectedYear === 'all' ? 'Año' : 'Fecha';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.iconContainer}>
          <Activity className={styles.icon} />
        </div>
        <div>
          <h2 className={styles.title}>Análisis Detallado: Total de Sismos</h2>
          <p className={styles.subtitle}>
            Visualización completa de la actividad sísmica {chartTitle}
          </p>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        {/* Gráfico de evolución acumulativa */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            <TrendingUp className={styles.chartIcon} />
            {selectedYear === 'all' ? 'Evolución Acumulativa por Año' : 'Evolución Acumulativa de Sismos'}
          </h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cumulativeEvolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  dataKey="count"
                  tick={{ fontSize: 12 }}
                />
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
                  formatter={(value: any) => [`${value} sismos`, 'Total Acumulado']}
                  labelFormatter={(label: any) => tooltipTitle === 'Año' ? `Año ${label}` : label}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de distribución por mes */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            <BarChart3 className={styles.chartIcon} />
            {selectedYear === 'all' ? 'Distribución por Año' : 'Distribución Mensual'}
          </h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  dataKey="count"
                  tick={{ fontSize: 12 }}
                />
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
                  formatter={(value: any) => [`${value} sismos`, 'Cantidad']}
                  labelFormatter={(label: any) => tooltipTitle === 'Año' ? `Año ${label}` : label}
                />
                <Bar 
                  dataKey="count" 
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>



        {/* Gráfico de distribución por magnitud */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            <PieChartIcon className={styles.chartIcon} />
            Distribución por Magnitud
          </h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={magnitudeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, percent }) => `${range} (${((percent || 0) * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {magnitudeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
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
                  formatter={(value: any) => [`${value} sismos`, 'Cantidad']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Nueva tarjeta de estadísticas */}
        <div className={styles.statsCard}>
          <h3 className={styles.statsTitle}>
            <Activity className={styles.statsIcon} />
            Estadísticas Generales
          </h3>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Total de Sismos</span>
              <span className={styles.statValue}>{countryData?.total_earthquakes || 0}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Período de Análisis</span>
              <span className={styles.statValue}>
                {selectedYear === 'all' ? 'Multi-anual' : selectedYear}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Promedio Diario</span>
              <span className={styles.statValue}>
                {(() => {
                  const total = countryData?.total_earthquakes || 0;
                  const days = selectedYear === 'all' 
                    ? (countryData?.yearly_breakdown?.length || 1) * 365
                    : 365;
                  return (total / days).toFixed(2);
                })()}
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
          </div>
        </div>
      </div>


    </div>
  );
};

export default TotalSismosCharts;
