export type ViewType = 'home' | 'statistics' | 'country';

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
}

export interface CountryEarthquakeStats {
  country: string;
  count: number;
  magnitude: number;
  risk: string;
} 