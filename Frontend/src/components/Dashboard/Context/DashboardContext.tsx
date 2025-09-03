import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ViewType, Country, DashboardContextType } from '../../../types/dashboard';

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [currentWorkspace, setCurrentWorkspace] = useState('My Workspace');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estados para datos reales de la API
  const [countries, setCountries] = useState<Country[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para predicciones
  const [predictionCountry, setPredictionCountry] = useState<string | null>(null);
  const [predictionData, setPredictionData] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  // Cargar datos al inicializar
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Importación dinámica para evitar problemas de tipos
        const { earthquakeService } = await import('../../../services/earthquakeService');
        
        const [countriesData, statsData] = await Promise.all([
          earthquakeService.getSouthAmericanCountries(),
          earthquakeService.getEarthquakeStatistics()
        ]);
        
        // Convertir CountryData a Country
        const convertedCountries = countriesData.map((country: any) => ({
          id: country.id,
          name: country.name,
          code: country.code,
          coordinates: country.coordinates,
          riskLevel: country.riskLevel,
          lastEarthquake: country.lastEarthquake,
          magnitude: country.magnitude,
        }));
        
        setCountries(convertedCountries);
        setStatistics(statsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
        console.error('Error loading dashboard data:', err);
        
        // Datos de fallback en caso de error
        const fallbackCountries: Country[] = [
          {
            id: "brazil",
            name: "Brasil",
            code: "BR",
            coordinates: [-15.7801, -47.9292],
            riskLevel: "medium",
            lastEarthquake: "2024-01-15",
            magnitude: 4.2,
          },
          {
            id: "argentina",
            name: "Argentina",
            code: "AR",
            coordinates: [-34.6118, -58.396],
            riskLevel: "high",
            lastEarthquake: "2024-01-20",
            magnitude: 5.1,
          },
          {
            id: "chile",
            name: "Chile",
            code: "CL",
            coordinates: [-33.4489, -70.6693],
            riskLevel: "very-high",
            lastEarthquake: "2024-01-18",
            magnitude: 6.3,
          },
          {
            id: "colombia",
            name: "Colombia",
            code: "CO",
            coordinates: [4.711, -74.0721],
            riskLevel: "medium",
            lastEarthquake: "2024-01-22",
            magnitude: 4.8,
          },
          {
            id: "peru",
            name: "Perú",
            code: "PE",
            coordinates: [-12.0464, -77.0428],
            riskLevel: "high",
            lastEarthquake: "2024-01-19",
            magnitude: 5.5,
          },
          {
            id: "venezuela",
            name: "Venezuela",
            code: "VE",
            coordinates: [10.4806, -66.9036],
            riskLevel: "low",
            lastEarthquake: "2024-01-25",
            magnitude: 3.9,
          },
          {
            id: "ecuador",
            name: "Ecuador",
            code: "EC",
            coordinates: [-0.2299, -78.5249],
            riskLevel: "high",
            lastEarthquake: "2024-01-21",
            magnitude: 5.2,
          },
          {
            id: "bolivia",
            name: "Bolivia",
            code: "BO",
            coordinates: [-16.4897, -68.1193],
            riskLevel: "medium",
            lastEarthquake: "2024-01-23",
            magnitude: 4.5,
          },
          {
            id: "paraguay",
            name: "Paraguay",
            code: "PY",
            coordinates: [-25.2637, -57.5759],
            riskLevel: "low",
            lastEarthquake: "2024-01-24",
            magnitude: 3.2,
          },
          {
            id: "uruguay",
            name: "Uruguay",
            code: "UY",
            coordinates: [-34.9011, -56.1645],
            riskLevel: "low",
            lastEarthquake: "2024-01-26",
            magnitude: 2.8,
          },
          {
            id: "guyana",
            name: "Guyana",
            code: "GY",
            coordinates: [6.8013, -58.1553],
            riskLevel: "low",
            lastEarthquake: "2024-01-27",
            magnitude: 3.1,
          },
          {
            id: "suriname",
            name: "Suriname",
            code: "SR",
            coordinates: [5.852, -55.2038],
            riskLevel: "low",
            lastEarthquake: "2024-01-28",
            magnitude: 2.9,
          },
        ];
        
        setCountries(fallbackCountries);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const value: DashboardContextType = {
    currentView,
    setCurrentView,
    selectedCountry,
    setSelectedCountry,
    currentWorkspace,
    setCurrentWorkspace,
    searchQuery,
    setSearchQuery,
    countries,
    statistics,
    loading,
    error,
    // Estados para predicciones
    predictionCountry,
    setPredictionCountry,
    predictionData,
    setPredictionData,
    isPredicting,
    setIsPredicting,
    predictionError,
    setPredictionError,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

// Re-export types for backward compatibility
export type { ViewType, Country, DashboardContextType }; 