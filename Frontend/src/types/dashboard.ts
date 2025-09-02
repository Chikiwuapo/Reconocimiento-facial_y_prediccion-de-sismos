export type ViewType = 'home' | 'statistics' | 'country' | 'predictions';

export interface Country {
  id: string;
  name: string;
  code: string;
  coordinates: [number, number];
  riskLevel: 'low' | 'medium' | 'high' | 'very-high';
  lastEarthquake: string;
  magnitude: number;
}

export interface DashboardContextType {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  selectedCountry: Country | null;
  setSelectedCountry: (country: Country | null) => void;
  currentWorkspace: string;
  setCurrentWorkspace: (workspace: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  countries: Country[];
  statistics: any;
  loading: boolean;
  error: string | null;
  // Estados para predicciones
  predictionCountry: string | null;
  setPredictionCountry: (country: string | null) => void;
  predictionData: any;
  setPredictionData: (data: any) => void;
  isPredicting: boolean;
  setIsPredicting: (predicting: boolean) => void;
  predictionError: string | null;
  setPredictionError: (error: string | null) => void;
}

export interface EarthquakeData {
  date: string;
  magnitude: number;
  depth: number;
  location: string;
}

export interface RiskDistribution {
  name: string;
  value: number;
  color: string;
  range?: string;
  count?: number;
}

export interface CountryEarthquakeStats {
  country: string;
  count: number;
  magnitude: number;
  risk: string;
}

export interface PredictionData {
  country: string;
  risk: 'low' | 'medium' | 'high' | 'very-high';
  totalEarthquakes: number;
  earthquakesPerDay: number;
  averageMagnitude: number;
  probability7d: number;
  probability30d: number;
  probability90d: number;
  predictionDate: string;
  confidence: number;
}

export interface PredictionContextType {
  selectedCountry: string | null;
  setSelectedCountry: (country: string | null) => void;
  predictionData: PredictionData | null;
  setPredictionData: (data: PredictionData | null) => void;
  isPredicting: boolean;
  setIsPredicting: (predicting: boolean) => void;
  predictionError: string | null;
  setPredictionError: (error: string | null) => void;
}
