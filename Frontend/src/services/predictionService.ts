import { PredictionData } from '../types/dashboard';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface PredictionRequest {
  country: string;
  timeframe: '7d' | '30d' | '90d';
}

export interface PredictionResponse {
  success: boolean;
  data?: PredictionData;
  error?: string;
}

class PredictionService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('access_token');
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async generatePrediction(request: PredictionRequest): Promise<PredictionResponse> {
    try {
      const response = await this.makeRequest<PredictionResponse>('/api/predictions/generate', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      
      return response;
    } catch (error) {
      console.error('Error generating prediction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al generar predicción'
      };
    }
  }

  async getPredictionHistory(country?: string): Promise<PredictionData[]> {
    try {
      const endpoint = country ? `/api/predictions/history?country=${encodeURIComponent(country)}` : '/api/predictions/history';
      const response = await this.makeRequest<{ success: boolean; data: PredictionData[] }>(endpoint);
      
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Error fetching prediction history:', error);
      return [];
    }
  }

  async getPredictionAccuracy(country?: string): Promise<{ accuracy: number; totalPredictions: number }> {
    try {
      const endpoint = country ? `/api/predictions/accuracy?country=${encodeURIComponent(country)}` : '/api/predictions/accuracy';
      const response = await this.makeRequest<{ success: boolean; data: { accuracy: number; totalPredictions: number } }>(endpoint);
      
      return response.success ? response.data : { accuracy: 0, totalPredictions: 0 };
    } catch (error) {
      console.error('Error fetching prediction accuracy:', error);
      return { accuracy: 0, totalPredictions: 0 };
    }
  }

  // Función para simular predicciones cuando el backend no esté disponible
  async generateMockPrediction(country: string): Promise<PredictionData> {
    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Factores de riesgo por país (basados en conocimiento geológico real)
    const countryRiskFactors: Record<string, {
      baseRisk: number;
      maxMagnitude: number;
      activityLevel: number;
      tectonicZone: string;
    }> = {
      'Chile': { baseRisk: 0.85, maxMagnitude: 7.2, activityLevel: 0.95, tectonicZone: 'Pacific Ring of Fire' },
      'Peru': { baseRisk: 0.75, maxMagnitude: 6.8, activityLevel: 0.85, tectonicZone: 'Nazca Plate' },
      'Ecuador': { baseRisk: 0.80, maxMagnitude: 6.5, activityLevel: 0.90, tectonicZone: 'Nazca Plate' },
      'Colombia': { baseRisk: 0.65, maxMagnitude: 6.0, activityLevel: 0.75, tectonicZone: 'Caribbean Plate' },
      'Argentina': { baseRisk: 0.55, maxMagnitude: 5.5, activityLevel: 0.65, tectonicZone: 'South American Plate' },
      'Bolivia': { baseRisk: 0.60, maxMagnitude: 5.8, activityLevel: 0.70, tectonicZone: 'South American Plate' },
      'Brazil': { baseRisk: 0.25, maxMagnitude: 4.2, activityLevel: 0.35, tectonicZone: 'Stable Craton' },
      'Venezuela': { baseRisk: 0.45, maxMagnitude: 5.0, activityLevel: 0.55, tectonicZone: 'Caribbean Plate' },
      'Paraguay': { baseRisk: 0.20, maxMagnitude: 3.8, activityLevel: 0.30, tectonicZone: 'Stable Craton' },
      'Uruguay': { baseRisk: 0.15, maxMagnitude: 3.2, activityLevel: 0.25, tectonicZone: 'Stable Craton' },
      'Guyana': { baseRisk: 0.25, maxMagnitude: 4.0, activityLevel: 0.35, tectonicZone: 'Stable Craton' },
      'Suriname': { baseRisk: 0.20, maxMagnitude: 3.5, activityLevel: 0.30, tectonicZone: 'Stable Craton' }
    };
    
    const countryInfo = countryRiskFactors[country] || {
      baseRisk: 0.40, maxMagnitude: 5.0, activityLevel: 0.50, tectonicZone: 'Unknown'
    };
    
    // Generar predicción basada en factores del país y variación temporal
    const baseRisk = countryInfo.baseRisk;
    const timeVariation = Math.sin(Date.now() / (1000 * 60 * 60 * 24)) * 0.1; // Variación diaria
    const randomFactor = (Math.random() - 0.5) * 0.15; // Variación aleatoria
    const riskScore = Math.max(0, Math.min(1, baseRisk + timeVariation + randomFactor));
    
    // Mapear riesgo a niveles
    let riskLevel: 'low' | 'medium' | 'high' | 'very-high';
    if (riskScore >= 0.75) {
      riskLevel = 'very-high';
    } else if (riskScore >= 0.55) {
      riskLevel = 'high';
    } else if (riskScore >= 0.35) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'low';
    }
    
    // Generar métricas realistas basadas en el país
    const baseActivity = countryInfo.activityLevel;
    const seasonalFactor = 1 + Math.sin(Date.now() / (1000 * 60 * 60 * 24 * 365.25) * 2 * Math.PI) * 0.2;
    
    const totalEarthquakes = Math.round(
      (baseActivity * 50 + Math.random() * 30) * seasonalFactor
    );
    
    const earthquakesPerDay = Math.round(
      (baseActivity * 1.5 + Math.random() * 0.8) * seasonalFactor * 10
    ) / 10;
    
    const averageMagnitude = Math.round(
      (countryInfo.maxMagnitude * 0.6 + Math.random() * 1.5) * 10
    ) / 10;
    
    // Generar probabilidades basadas en el riesgo y la zona tectónica
    const tectonicMultiplier = countryInfo.tectonicZone.includes('Ring of Fire') ? 1.3 : 
                               countryInfo.tectonicZone.includes('Nazca') ? 1.2 : 
                               countryInfo.tectonicZone.includes('Caribbean') ? 1.1 : 0.9;
    
    const prob7d = Math.min(riskScore * 0.8 * tectonicMultiplier + Math.random() * 0.15, 0.95);
    const prob30d = Math.min(riskScore * 0.9 * tectonicMultiplier + Math.random() * 0.10, 0.98);
    const prob90d = Math.min(riskScore * 0.95 * tectonicMultiplier + Math.random() * 0.05, 0.99);
    
    // Calcular confianza basada en la calidad de los datos del país
    const dataQuality = countryInfo.activityLevel > 0.7 ? 0.9 : 
                       countryInfo.activityLevel > 0.5 ? 0.8 : 0.7;
    const confidence = Math.round((dataQuality + Math.random() * 0.1) * 100) / 100;
    
    return {
      country,
      risk: riskLevel,
      totalEarthquakes,
      earthquakesPerDay,
      averageMagnitude,
      probability7d: Math.round(prob7d * 100 * 10) / 10,
      probability30d: Math.round(prob30d * 100 * 10) / 10,
      probability90d: Math.round(prob90d * 100 * 10) / 10,
      predictionDate: new Date().toISOString(),
      confidence
    };
  }
}

export const predictionService = new PredictionService();
export default predictionService;
