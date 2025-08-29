import React from 'react';
import { 
  Plus, 
  X,
  Home,
  TrendingUp,
  MapPin,
  AlertTriangle
} from 'lucide-react';
import { useDashboard } from '../Context/DashboardContext';
import type { Country } from '../Context/DashboardContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { 
    currentView, 
    setCurrentView, 
    selectedCountry, 
    setSelectedCountry,
  } = useDashboard();

  const southAmericanCountries: Country[] = [
    { id: 'brazil', name: 'Brasil', code: 'BR', coordinates: [-15.7801, -47.9292] as [number, number], riskLevel: 'medium', lastEarthquake: '2024-01-15', magnitude: 4.2 },
    { id: 'argentina', name: 'Argentina', code: 'AR', coordinates: [-34.6118, -58.3960] as [number, number], riskLevel: 'high', lastEarthquake: '2024-01-20', magnitude: 5.1 },
    { id: 'chile', name: 'Chile', code: 'CL', coordinates: [-33.4489, -70.6693] as [number, number], riskLevel: 'very-high', lastEarthquake: '2024-01-18', magnitude: 6.3 },
    { id: 'colombia', name: 'Colombia', code: 'CO', coordinates: [4.7110, -74.0721] as [number, number], riskLevel: 'medium', lastEarthquake: '2024-01-22', magnitude: 4.8 },
    { id: 'peru', name: 'Perú', code: 'PE', coordinates: [-12.0464, -77.0428] as [number, number], riskLevel: 'high', lastEarthquake: '2024-01-19', magnitude: 5.5 },
    { id: 'venezuela', name: 'Venezuela', code: 'VE', coordinates: [10.4806, -66.9036] as [number, number], riskLevel: 'low', lastEarthquake: '2024-01-25', magnitude: 3.9 },
    { id: 'ecuador', name: 'Ecuador', code: 'EC', coordinates: [-0.2299, -78.5249] as [number, number], riskLevel: 'high', lastEarthquake: '2024-01-21', magnitude: 5.2 },
    { id: 'bolivia', name: 'Bolivia', code: 'BO', coordinates: [-16.4897, -68.1193] as [number, number], riskLevel: 'medium', lastEarthquake: '2024-01-23', magnitude: 4.5 },
    { id: 'paraguay', name: 'Paraguay', code: 'PY', coordinates: [-25.2637, -57.5759] as [number, number], riskLevel: 'low', lastEarthquake: '2024-01-24', magnitude: 3.2 },
    { id: 'uruguay', name: 'Uruguay', code: 'UY', coordinates: [-34.9011, -56.1645] as [number, number], riskLevel: 'low', lastEarthquake: '2024-01-26', magnitude: 2.8 },
    { id: 'guyana', name: 'Guyana', code: 'GY', coordinates: [6.8013, -58.1553] as [number, number], riskLevel: 'low', lastEarthquake: '2024-01-27', magnitude: 3.1 },
    { id: 'suriname', name: 'Suriname', code: 'SR', coordinates: [5.8520, -55.2038] as [number, number], riskLevel: 'low', lastEarthquake: '2024-01-28', magnitude: 2.9 }
  ];

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'very-high': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getRiskLevelIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'very-high': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <span className="text-white font-semibold text-lg">SISMOPREDICT</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col p-4 space-y-4">
          {/* Main Navigation */}
          <nav className="space-y-2">
            {/* Home View */}
            <button
              onClick={() => setCurrentView('home')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                currentView === 'home' 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Home className="h-4 w-4" />
              <span className="font-medium">Dashboard General</span>
            </button>

            {/* Statistics View */}
            <button
              onClick={() => setCurrentView('statistics')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                currentView === 'statistics' 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">Estadísticas Globales</span>
            </button>

            {/* Country Selector */}
            <div className="pt-2">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300 text-sm font-medium">Países Sudamericanos</span>
                </div>
                <Plus className="h-4 w-4 text-gray-400 hover:text-white cursor-pointer" />
              </div>
              
              <div className="ml-4 mt-2 space-y-1">
                {southAmericanCountries.map((country) => (
                  <button
                    key={country.id}
                    onClick={() => {
                      setSelectedCountry(country);
                      setCurrentView('country');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                      currentView === 'country' && selectedCountry?.id === country.id
                        ? 'bg-red-600 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getRiskLevelIcon(country.riskLevel)}</span>
                      <span>{country.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs ${getRiskLevelColor(country.riskLevel)}`}>
                        {country.riskLevel.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        M{country.magnitude}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 