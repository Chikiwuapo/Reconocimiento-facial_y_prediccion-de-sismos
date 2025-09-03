import React from 'react';
import { 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  CartesianGrid,
  XAxis,
  YAxis
} from 'recharts';
import { Clock, MapPin, AlertTriangle, TrendingUp } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import styles from '../../../../styles/UltimoSismoCharts.module.css';

interface UltimoSismoChartsProps {
  countryData: any;
  selectedYear: number | 'all';
}

const UltimoSismoCharts: React.FC<UltimoSismoChartsProps> = ({ countryData, selectedYear }) => {
  const { theme } = useTheme();
  
  // Obtener el último sismo
  const lastEarthquake = countryData?.recent_events?.[0] || null;
  
  // Datos para el gráfico de frecuencia de sismos por período
  const frequencyByPeriod = countryData?.recent_events?.reduce((acc: any, event: any) => {
    const date = new Date(event.date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) acc.recent++;
    else if (diffDays <= 7) acc.week++;
    else if (diffDays <= 30) acc.month++;
    else if (diffDays <= 90) acc.quarter++;
    else acc.older++;
    
    return acc;
  }, { recent: 0, week: 0, month: 0, quarter: 0, older: 0 }) || { recent: 0, week: 0, month: 0, quarter: 0, older: 0 };

  // Datos para el gráfico de radar de características del último sismo
  const lastEarthquakeRadar = lastEarthquake ? [
    { characteristic: 'Magnitud', value: (lastEarthquake.magnitude || 0) / 7 * 100, fullMark: 100 },
    { characteristic: 'Frecuencia', value: Math.min((countryData?.total_earthquakes || 0) / 100 * 100, 100), fullMark: 100 },
    { characteristic: 'Desviación', value: Math.min(((lastEarthquake.magnitude || 0) - 4.0) * 20, 100), fullMark: 100 }
  ] : [];

  // Datos para el gráfico de tendencia temporal
  const temporalTrend = countryData?.recent_events?.slice(0, 10).reverse().map((event: any, index: number) => ({
    period: `T-${10 - index}`,
    magnitude: event.magnitude || 0,
    date: event.date,
    location: event.location
  })) || [];

  return (
    <div className={styles.chartsContainer}>
      <div className={styles.header}>
        <div className={styles.iconContainer}>
          <Clock className={styles.icon} />
        </div>
        <div>
          <h2 className={styles.title}>Análisis Detallado: Último Sismo</h2>
          <p className={styles.subtitle}>
            {lastEarthquake ? 
              `Último sismo: M${lastEarthquake.magnitude?.toFixed(1) || '0.0'} - ${new Date(lastEarthquake.date).toLocaleDateString()}` :
              'No hay datos de sismos recientes'
            }
          </p>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        {/* Gráfico de frecuencia por período */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            <TrendingUp className={styles.chartIcon} />
            Frecuencia de Sismos por Período
          </h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: '24h', value: frequencyByPeriod.recent, color: '#ef4444' },
                    { name: '7 días', value: frequencyByPeriod.week, color: '#f97316' },
                    { name: '30 días', value: frequencyByPeriod.month, color: '#f59e0b' },
                    { name: '90 días', value: frequencyByPeriod.quarter, color: '#22c55e' },
                    { name: '90+ días', value: frequencyByPeriod.older, color: '#6b7280' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[
                    { name: '24h', value: frequencyByPeriod.recent, color: '#ef4444' },
                    { name: '7 días', value: frequencyByPeriod.week, color: '#f97316' },
                    { name: '30 días', value: frequencyByPeriod.month, color: '#f59e0b' },
                    { name: '90 días', value: frequencyByPeriod.quarter, color: '#22c55e' },
                    { name: '90+ días', value: frequencyByPeriod.older, color: '#6b7280' }
                  ].map((entry, index) => (
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
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de radar de características */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            <AlertTriangle className={styles.chartIcon} />
            Características del Último Sismo
          </h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={lastEarthquakeRadar}>
                <PolarGrid 
                  stroke={theme === 'dark' ? '#6b7280' : '#d1d5db'} 
                  strokeOpacity={0.3}
                />
                <PolarAngleAxis 
                  dataKey="characteristic" 
                  tick={{ fontSize: 12, fill: theme === 'dark' ? '#f9fafb' : '#111827' }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ fontSize: 12, fill: theme === 'dark' ? '#f9fafb' : '#111827' }}
                />
                <Radar 
                  name="Valor" 
                  dataKey="value" 
                  stroke={theme === 'dark' ? '#f87171' : '#ef4444'} 
                  fill={theme === 'dark' ? '#f87171' : '#ef4444'} 
                  fillOpacity={0.3} 
                  strokeWidth={2}
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
                  formatter={(value: any) => [`${value.toFixed(1)}%`, 'Valor']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de tendencia temporal */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            <MapPin className={styles.chartIcon} />
            Tendencia Temporal (Últimos 10)
          </h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={temporalTrend}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={theme === 'dark' ? '#6b7280' : '#d1d5db'} 
                  strokeOpacity={0.3}
                />
                <XAxis 
                  dataKey="period" 
                  stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                  tick={{ fontSize: 12, fill: theme === 'dark' ? '#f9fafb' : '#111827' }}
                />
                <YAxis 
                  domain={[0, 7]} 
                  stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                  tick={{ fontSize: 12, fill: theme === 'dark' ? '#f9fafb' : '#111827' }}
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
                  formatter={(value: any, name: any) => [
                    `M${value.toFixed(1)}`, 
                    'Magnitud'
                  ]}
                  labelFormatter={(label: any) => {
                    const event = temporalTrend.find((e: any) => e.period === label);
                    return event ? `${label} - ${new Date(event.date).toLocaleDateString()}` : label;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="magnitude" 
                  stroke={theme === 'dark' ? '#60a5fa' : '#3b82f6'} 
                  strokeWidth={3}
                  dot={{ 
                    fill: theme === 'dark' ? '#60a5fa' : '#3b82f6', 
                    strokeWidth: 2, 
                    r: 4,
                    stroke: theme === 'dark' ? '#1e3a8a' : '#1d4ed8'
                  }}
                  activeDot={{ 
                    r: 6, 
                    stroke: theme === 'dark' ? '#1e3a8a' : '#1d4ed8', 
                    strokeWidth: 2,
                    fill: theme === 'dark' ? '#93c5fd' : '#60a5fa'
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Información detallada del último sismo */}
        <div className={styles.statsCard}>
          <h3 className={styles.chartTitle}>Información del Último Sismo</h3>
          {lastEarthquake ? (
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Fecha</span>
                <span className={styles.statValue}>
                  {new Date(lastEarthquake.date).toLocaleDateString()}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Magnitud</span>
                <span className={styles.statValue}>
                  M{lastEarthquake.magnitude?.toFixed(1) || '0.0'}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Ubicación</span>
                <span className={styles.statValue}>
                  {lastEarthquake.location || 'N/A'}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Desviación</span>
                <span className={styles.statValue}>
                  {(() => {
                    const magnitude = lastEarthquake.magnitude || 0;
                    const deviation = (magnitude - 4.0) * 20;
                    const deviationFormatted = deviation.toFixed(1);
                    return deviation > 0 ? `+${deviationFormatted}%` : `${deviationFormatted}%`;
                  })()}
                </span>
              </div>
            </div>
          ) : (
            <div className={styles.noData}>
              <AlertTriangle className={styles.noDataIcon} />
              <p>No hay datos disponibles del último sismo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UltimoSismoCharts;
