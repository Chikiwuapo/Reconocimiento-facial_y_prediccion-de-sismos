# Sistema de Predicción Sísmica - Gráficos Dinámicos

## Descripción General

El sistema de predicción sísmica ahora incluye gráficos que se actualizan dinámicamente basándose en los datos específicos de cada país. Los gráficos no son estáticos, sino que se generan en tiempo real usando los datos de predicción obtenidos del backend.

## Funcionalidades de los Gráficos

### 1. Gráfico de Evolución de Magnitud (12 Semanas)
- **Datos**: Se generan dinámicamente basándose en la magnitud promedio predicha para el país
- **Variación**: Incluye variación realista (±1.0) para simular patrones naturales
- **Actualización**: Se regenera cada vez que se selecciona un país diferente

### 2. Gráfico de Frecuencia vs Predicción (12 Semanas)
- **Comparación**: Muestra datos históricos simulados vs predicciones actuales
- **Base**: Utiliza la frecuencia de sismos por día predicha para el país
- **Variación**: Los datos históricos tienen ±15% de variación, las predicciones ±10%

### 3. Gráfico de Probabilidades por Período
- **Datos Reales**: Usa las probabilidades reales del backend (7 días, 30 días, 90 días)
- **Colores**: Diferentes colores para cada período temporal
- **Formato**: Gráfico horizontal para mejor visualización

### 4. Gráfico de Frecuencia de Sismos por Semana
- **Datos**: Basado en la frecuencia predicha de sismos por día
- **Conversión**: Convierte sismos/día a sismos/semana
- **Variación**: Incluye variación temporal realista

## Cómo Funciona la Actualización Dinámica

### 1. Selección de País
```typescript
const generatePrediction = async () => {
  if (!selectedCountry) return;
  
  // Obtener predicción del backend
  const response = await predictionService.generatePrediction({
    country: selectedCountry,
    timeframe: '90d'
  });
  
  // Los gráficos se actualizan automáticamente
  setPredictionData(response.data);
};
```

### 2. Generación de Datos de Gráficos
```typescript
const generateHistoricalData = useMemo(() => {
  if (!predictionData) return [];
  
  const weeks = 12;
  const data = [];
  const baseMagnitude = predictionData.averageMagnitude;
  const baseFrequency = predictionData.earthquakesPerDay * 7;
  
  // Generar datos para cada semana
  for (let i = 0; i < weeks; i++) {
    const magnitudeVariation = (Math.random() - 0.5) * 2;
    const frequencyVariation = (Math.random() - 0.5) * 0.4;
    
    data.push({
      week: `Sem ${i + 1}`,
      magnitude: Math.max(2.0, Math.min(8.0, baseMagnitude + magnitudeVariation)),
      frequency: Math.max(1, Math.round(baseFrequency * (1 + frequencyVariation)))
    });
  }
  
  return data;
}, [predictionData]);
```

### 3. Actualización Automática
```typescript
useEffect(() => {
  if (predictionData) {
    setHistoricalData(generateHistoricalData);
    setChartData(generateChartData);
  }
}, [predictionData, generateHistoricalData, generateChartData]);
```

## Factores de Riesgo por País

### Países de Alto Riesgo
- **Chile**: Pacific Ring of Fire, riesgo base 85%
- **Perú**: Nazca Plate, riesgo base 75%
- **Ecuador**: Nazca Plate, riesgo base 80%

### Países de Riesgo Medio
- **Colombia**: Caribbean Plate, riesgo base 65%
- **Argentina**: South American Plate, riesgo base 55%
- **Bolivia**: South American Plate, riesgo base 60%

### Países de Bajo Riesgo
- **Brasil**: Stable Craton, riesgo base 25%
- **Venezuela**: Caribbean Plate, riesgo base 45%
- **Paraguay/Uruguay**: Stable Craton, riesgo base 15-20%

## Variaciones Temporales

### 1. Variación Diaria
```typescript
const timeVariation = Math.sin(Date.now() / (1000 * 60 * 60 * 24)) * 0.1;
```

### 2. Variación Estacional
```typescript
const seasonalFactor = 1 + Math.sin(Date.now() / (1000 * 60 * 60 * 24 * 365.25) * 2 * Math.PI) * 0.2;
```

### 3. Variación Aleatoria
```typescript
const randomFactor = (Math.random() - 0.5) * 0.15;
```

## Endpoints del Backend

### Generar Predicción
```
POST /api/predictions/generate
{
  "country": "Chile",
  "timeframe": "90d"
}
```

### Respuesta
```json
{
    "success": true,
    "data": {
        "country": "Chile",
    "risk": "very-high",
    "totalEarthquakes": 75,
    "earthquakesPerDay": 2.0,
    "averageMagnitude": 3.9,
    "probability7d": 73.6,
    "probability30d": 83.3,
    "probability90d": 85.7,
    "predictionDate": "2025-09-01T18:41:48.976920",
    "confidence": 0.89
    }
}
```

## Tecnologías Utilizadas

### Frontend
- **React 18** con TypeScript
- **Recharts** para gráficos interactivos
- **Tailwind CSS** para estilos
- **Hooks personalizados** para estado y efectos

### Backend
- **Django 5.2** con Django REST Framework
- **SQLite** para base de datos
- **Scikit-learn** para modelos de ML
- **Pandas** para procesamiento de datos

## Mejoras Futuras

### 1. Datos Históricos Reales
- Integrar con APIs de servicios geológicos
- Usar datos reales de terremotos históricos
- Implementar análisis de tendencias temporales

### 2. Gráficos Interactivos
- Zoom y pan en gráficos
- Filtros por rango de fechas
- Exportación de gráficos

### 3. Alertas en Tiempo Real
- Notificaciones push para cambios de riesgo
- Webhooks para integración con otros sistemas
- Dashboard de monitoreo continuo

## Uso del Sistema

### 1. Seleccionar País
- Elegir un país de la lista desplegable
- Los países se cargan automáticamente desde el backend

### 2. Generar Predicción
- Hacer clic en "Predecir"
- El sistema procesa los datos y genera predicciones
- Los gráficos se actualizan automáticamente

### 3. Interpretar Resultados
- **Riesgo**: Nivel de riesgo sísmico (bajo, medio, alto, muy alto)
- **Probabilidades**: Probabilidad de sismos en diferentes períodos
- **Métricas**: Frecuencia y magnitud promedio de sismos

## Solución de Problemas

### Gráficos No Se Actualizan
1. Verificar que `predictionData` no sea null
2. Comprobar que `useEffect` se ejecute correctamente
3. Verificar que los datos de predicción tengan el formato correcto

### Errores de API
1. Verificar que el backend esté ejecutándose
2. Comprobar la conectividad de red
3. Verificar que los endpoints estén correctamente configurados

### Rendimiento
1. Los gráficos se regeneran solo cuando cambia la predicción
2. Uso de `useMemo` para evitar cálculos innecesarios
3. Lazy loading de componentes de gráficos

## Conclusión

El sistema de gráficos de predicción sísmica ahora proporciona una experiencia visual dinámica y realista que refleja las características específicas de cada país. Los gráficos no son estáticos, sino que se adaptan y cambian basándose en los datos reales de predicción, proporcionando una herramienta valiosa para el análisis de riesgo sísmico.
