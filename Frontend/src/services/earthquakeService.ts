import { Country } from '../types/dashboard';
import { API_BASE_URL } from '../config/config';

export interface CountryData {
  id: string;
  name: string;
  code: string;
  coordinates: [number, number];
  riskLevel: 'low' | 'medium' | 'high' | 'very-high';
  lastEarthquake: string;
  magnitude: number;
  total_records: number;
  avg_prob_7d: number;
  avg_prob_30d: number;
  avg_prob_90d: number;
}

export interface CountryDetails {
  country_code: string;
  recent_events: Array<{
    date: string;
    location: string;
    magnitude: number;
    prob_7d: number;
    prob_30d: number;
    prob_90d: number;
    eq_count_7d: number;
    eq_count_30d: number;
  }>;
}

export interface EarthquakeStatistics {
  general: {
    total_records: number;
    avg_magnitude: number;
    max_magnitude: number;
    total_countries: number;
  };
  by_country: Array<{
    country: string;
    record_count: number;
    avg_magnitude: number;
    max_magnitude: number;
  }>;
}

export interface YearlyStatistics {
  year?: string;
  period?: string;
  general: {
    total_earthquakes: number;
    avg_magnitude: number;
    max_magnitude: number;
    first_date: string | null;
    last_date: string | null;
  };
  by_country: Array<{
    country: string;
    count: number;
    avg_magnitude: number;
    max_magnitude: number;
    first_date: string | null;
    last_date: string | null;
  }>;
}

export interface CountryYearlyStatistics {
  country_code: string;
  year?: string;
  period?: string;
  total_earthquakes: number;
  avg_magnitude: number;
  max_magnitude: number;
  first_date: string | null;
  last_date: string | null;
  avg_prob_7d: number;
  avg_prob_30d: number;
  avg_prob_90d: number;
  recent_events: Array<{
    date: string;
    location: string;
    magnitude: number;
    prob_7d: number;
    prob_30d: number;
    prob_90d: number;
  }>;
}

export interface DashboardData {
  time_range: string;
  days_back: number;
  map_data: Array<{
    id: string;
    lat: number;
    lng: number;
    magnitude: number;
    location: string;
    date: string;
    prob_7d: number;
    prob_30d: number;
    prob_90d: number;
  }>;
  countries: Array<{
    country_code: string;
    count: number;
    avg_magnitude: number;
    max_magnitude: number;
    last_date: string;
    risk_level: 'low' | 'medium' | 'high' | 'very-high';
  }>;
  last_earthquake: {
    country: string | null;
    date: string | null;
    location: string | null;
    magnitude: number | null;
  };
  total_earthquakes: number;
  highest_risk_country: {
    country_code: string;
    count: number;
    risk_level: string;
  } | null;
}

class EarthquakeService {
  private async makeRequest<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  async getSouthAmericanCountries(): Promise<CountryData[]> {
    return this.makeRequest<CountryData[]>('/countries/south-american/');
  }

  async getCountryDetails(countryCode: string): Promise<CountryDetails> {
    return this.makeRequest<CountryDetails>(`/countries/${countryCode}/`);
  }

  async getEarthquakeStatistics(): Promise<EarthquakeStatistics> {
    return this.makeRequest<EarthquakeStatistics>('/statistics/');
  }

  async getYearlyStatistics(year: number): Promise<YearlyStatistics> {
    return this.makeRequest<YearlyStatistics>(`/statistics/year/${year}/`);
  }

  async getAllYearsStatistics(): Promise<YearlyStatistics> {
    return this.makeRequest<YearlyStatistics>('/statistics/all-years/');
  }

  async getCountryYearlyStatistics(countryCode: string, year: number): Promise<CountryYearlyStatistics> {
    return this.makeRequest<CountryYearlyStatistics>(`/countries/${countryCode}/year/${year}/`);
  }

  async getCountryAllYearsStatistics(countryCode: string): Promise<CountryYearlyStatistics> {
    return this.makeRequest<CountryYearlyStatistics>(`/countries/${countryCode}/all-years/`);
  }

  async getDashboardData(timeRange: '24h' | '7d' | '30d' = '7d'): Promise<DashboardData> {
    return this.makeRequest<DashboardData>(`/dashboard/?range=${timeRange}`);
  }

  // Convertir datos de la API al formato del frontend
  convertToCountryFormat(countryData: CountryData): Country {
    return {
      id: countryData.id,
      name: countryData.name,
      code: countryData.code,
      coordinates: countryData.coordinates,
      riskLevel: countryData.riskLevel,
      lastEarthquake: countryData.lastEarthquake,
      magnitude: countryData.magnitude,
    };
  }
}

export const earthquakeService = new EarthquakeService();
