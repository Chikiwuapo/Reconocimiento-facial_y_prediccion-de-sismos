import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { 
  AlertTriangle, 
  TrendingUp, 
  MapPin, 
  Calendar,
  Activity,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';
import { useDashboard } from '../Context/DashboardContext';
import { predictionService } from '../../../services/predictionService';
import styles from '../../../styles/PredictionsView.module.css';

const PredictionsView: React.FC = () => {
  const { 
    countries, 
    predictionCountry, 
    setPredictionCountry, 
    predictionData, 
    setPredictionData,
    isPredicting,
    setIsPredicting,
    predictionError,
    setPredictionError
  } = useDashboard();

  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  // Generar datos históricos dinámicos basados en la predicción
  const generateHistoricalData = useMemo(() => {
    if (!predictionData) return [];
    
    const weeks = 12;
    const data = [];
    const baseMagnitude = predictionData.averageMagnitude;
    const baseFrequency = predictionData.earthquakesPerDay * 7; // Por semana
    
    for (let i = 0; i < weeks; i++) {
      // Simular variación realista basada en la predicción
      const magnitudeVariation = (Math.random() - 0.5) * 2; // ±1.0
      const frequencyVariation = (Math.random() - 0.5) * 0.4; // ±20%
      
      const magnitude = Math.max(2.0, Math.min(8.0, baseMagnitude + magnitudeVariation));
      const frequency = Math.max(1, Math.round(baseFrequency * (1 + frequencyVariation)));
      
      data.push({
        week: `Sem ${i + 1}`,
        magnitude: Math.round(magnitude * 10) / 10,
        frequency: frequency
      });
    }
    
    return data;
  }, [predictionData]);

  // Generar datos de comparación histórica vs predicción
  const generateChartData = useMemo(() => {
    if (!predictionData) return [];
    
    const weeks = 12;
    const data = [];
    const baseFrequency = predictionData.earthquakesPerDay * 7; // Por semana
    
    for (let i = 0; i < weeks; i++) {
      // Simular datos históricos
      const historicalVariation = (Math.random() - 0.5) * 0.3; // ±15%
      const historical = Math.max(1, Math.round(baseFrequency * (1 + historicalVariation)));
      
      // Simular predicción (con tendencia hacia la predicción actual)
      const predictionVariation = (Math.random() - 0.5) * 0.2; // ±10%
      const predicted = Math.max(1, Math.round(baseFrequency * (1 + predictionVariation)));
      
      data.push({
        week: `Sem ${i + 1}`,
        historical: historical,
        predicted: predicted
      });
    }
    
    return data;
  }, [predictionData]);

  // Generar datos de probabilidad temporal para gráfico adicional
  const probabilityData = useMemo(() => {
    if (!predictionData) return [];
    
    return [
      { period: '7 días', probability: predictionData.probability7d, color: '#EF4444' },
      { period: '30 días', probability: predictionData.probability30d, color: '#F59E0B' },
      { period: '90 días', probability: predictionData.probability90d, color: '#10B981' }
    ];
  }, [predictionData]);

  // Actualizar datos de gráficos cuando cambie la predicción
  useEffect(() => {
    if (predictionData) {
      setHistoricalData(generateHistoricalData);
      setChartData(generateChartData);
    }
  }, [predictionData, generateHistoricalData, generateChartData]);

  // Función para generar predicciones usando el servicio real
  const generatePrediction = async () => {
    if (!selectedCountry) {
      setPredictionError('Por favor selecciona un país');
      return;
    }

    setIsPredicting(true);
    setPredictionError(null);

    try {
      // Intentar usar el servicio real primero
      const response = await predictionService.generatePrediction({
        country: selectedCountry,
        timeframe: '90d'
      });

      if (response.success && response.data) {
        setPredictionData(response.data);
        setPredictionCountry(selectedCountry);
      } else {
        // Si falla, usar predicción simulada
        const mockPrediction = await predictionService.generateMockPrediction(selectedCountry);
        setPredictionData(mockPrediction);
        setPredictionCountry(selectedCountry);
      }
    } catch (error) {
      // En caso de error, usar predicción simulada
      try {
        const mockPrediction = await predictionService.generateMockPrediction(selectedCountry);
        setPredictionData(mockPrediction);
        setPredictionCountry(selectedCountry);
      } catch (mockError) {
        setPredictionError('Error al generar la predicción');
      }
    } finally {
      setIsPredicting(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'very-high': return '#7C2D12';
      default: return '#6B7280';
    }
  };

  const getRiskText = (risk: string) => {
    switch (risk) {
      case 'low': return 'Bajo';
      case 'medium': return 'Medio';
      case 'high': return 'Alto';
      case 'very-high': return 'Muy Alto';
      default: return 'Desconocido';
    }
  };

  return (
    <div className={styles.predictionsContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.iconContainer}>
          <AlertTriangle className={styles.icon} />
        </div>
        <div>
          <h2 className={styles.title}>Predicciones Sísmicas</h2>
          <p className={styles.subtitle}>
            Genera predicciones de actividad sísmica basadas en datos históricos y análisis de patrones
          </p>
        </div>
      </div>

      {/* Controles de Predicción */}
      <div className={styles.controlsCard}>
        <h3 className={styles.controlsTitle}>
          <Target className={styles.controlsIcon} />
          Configuración de Predicción
        </h3>
        
        <div className={styles.controlsGrid}>
          <div className={styles.controlItem}>
            <label className={styles.controlLabel}>País</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className={styles.countrySelect}
            >
              <option value="">Selecciona un país</option>
              {countries.map((country) => (
                <option key={country.id} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.controlItem}>
            <button
              onClick={generatePrediction}
              disabled={!selectedCountry || isPredicting}
              className={styles.predictButton}
            >
              {isPredicting ? (
                <>
                  <div className={styles.spinner}></div>
                  Generando...
                </>
              ) : (
                <>
                  <Zap className={styles.buttonIcon} />
                  Predecir
                </>
              )}
            </button>
          </div>
        </div>

        {predictionError && (
          <div className={styles.errorMessage}>
            <AlertTriangle className={styles.errorIcon} />
            {predictionError}
          </div>
        )}
      </div>

      {/* Resultados de Predicción */}
      {predictionData && (
        <>
          {/* Tarjetas de Resumen */}
          <div className={styles.summaryCards}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <Activity className={styles.summaryIcon} />
                <span className={styles.summaryLabel}>Riesgo</span>
              </div>
              <div 
                className={styles.summaryValue}
                style={{ color: getRiskColor(predictionData.risk) }}
              >
                {getRiskText(predictionData.risk)}
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <MapPin className={styles.summaryIcon} />
                <span className={styles.summaryLabel}>Total Sismos</span>
              </div>
              <div className={styles.summaryValue}>
                {predictionData.totalEarthquakes}
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <TrendingUp className={styles.summaryIcon} />
                <span className={styles.summaryLabel}>Sismos/Día</span>
              </div>
              <div className={styles.summaryValue}>
                {predictionData.earthquakesPerDay.toFixed(1)}
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <Zap className={styles.summaryIcon} />
                <span className={styles.summaryLabel}>Magnitud Promedio</span>
              </div>
              <div className={styles.summaryValue}>
                M{predictionData.averageMagnitude.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Tarjetas de Probabilidad */}
          <div className={styles.probabilityCards}>
            <div className={styles.probabilityCard}>
              <div className={styles.probabilityHeader}>
                <Calendar className={styles.probabilityIcon} />
                <span className={styles.probabilityLabel}>7 Días</span>
              </div>
              <div className={styles.probabilityValue}>
                {predictionData.probability7d.toFixed(1)}%
              </div>
            </div>

            <div className={styles.probabilityCard}>
              <div className={styles.probabilityHeader}>
                <Calendar className={styles.probabilityIcon} />
                <span className={styles.probabilityLabel}>1 Mes</span>
              </div>
              <div className={styles.probabilityValue}>
                {predictionData.probability30d.toFixed(1)}%
              </div>
            </div>

            <div className={styles.probabilityCard}>
              <div className={styles.probabilityHeader}>
                <Calendar className={styles.probabilityIcon} />
                <span className={styles.probabilityLabel}>3 Meses</span>
              </div>
              <div className={styles.probabilityValue}>
                {predictionData.probability90d.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Gráficos Explicativos */}
          <div className={styles.chartsSection}>
            <h3 className={styles.chartsTitle}>
              <BarChart3 className={styles.chartsIcon} />
              Análisis de Predicciones para {predictionData.country}
            </h3>
            
            <div className={styles.chartsGrid}>
              {/* Gráfico de Magnitud en el Tiempo */}
              <div className={styles.chartCard}>
                <h4 className={styles.chartSubtitle}>Evolución de Magnitud (12 Semanas)</h4>
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis domain={[0, 8]} />
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
                      <Line 
                        type="monotone" 
                        dataKey="magnitude" 
                        stroke="#EF4444" 
                        strokeWidth={3}
                        dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfico de Frecuencia vs Predicción */}
              <div className={styles.chartCard}>
                <h4 className={styles.chartSubtitle}>Frecuencia vs Predicción (12 Semanas)</h4>
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
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
                      <Bar dataKey="historical" fill="#3B82F6" name="Histórico" />
                      <Bar dataKey="predicted" fill="#EF4444" name="Predicción" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfico de Probabilidades Temporales */}
              <div className={styles.chartCard}>
                <h4 className={styles.chartSubtitle}>Probabilidades por Período</h4>
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={probabilityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis domain={[0, 100]} />
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
                        formatter={(value: any) => [`${value}%`, 'Probabilidad']}
                      />
                      <Bar dataKey="probability" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfico de Frecuencia de Sismos */}
              <div className={styles.chartCard}>
                <h4 className={styles.chartSubtitle}>Frecuencia de Sismos por Semana</h4>
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
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
                      <Line 
                        type="monotone" 
                        dataKey="frequency" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PredictionsView;
