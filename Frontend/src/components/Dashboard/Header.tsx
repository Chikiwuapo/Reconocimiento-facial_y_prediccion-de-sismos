import React from 'react';
import { 
  Menu, 
  Cloud, 
  Monitor, 
  Settings, 
  Download, 
  HelpCircle, 
  AlertTriangle,
  Bell
} from 'lucide-react';
import { useDashboard } from './DashboardContext';

const Header: React.FC = () => {
  const { currentView, selectedCountry } = useDashboard();

  const getViewTitle = () => {
    switch (currentView) {
      case 'home':
        return 'Dashboard General - Predicción de Sismos Sudamérica';
      case 'statistics':
        return 'Estadísticas Globales - Actividad Sísmica';
      case 'country':
        return selectedCountry ? `${selectedCountry.name} - Análisis Sísmico` : 'Análisis por País';
      default:
        return 'SISMOS SA - Sistema de Predicción';
    }
  };

  const getViewSubtitle = () => {
    switch (currentView) {
      case 'home':
        return 'Vista general de la actividad sísmica en la región sudamericana';
      case 'statistics':
        return 'Análisis estadístico completo de sismos y tendencias';
      case 'country':
        return selectedCountry ? `Datos específicos de ${selectedCountry.name}` : 'Selecciona un país para ver detalles';
      default:
        return 'Sistema de monitoreo y predicción de sismos';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Menu button and title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {getViewTitle()}
              </h1>
              <p className="text-sm text-gray-600">
                {getViewSubtitle()}
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
            <Cloud className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
            <Monitor className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
            <Settings className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
            <Download className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
            <HelpCircle className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="mt-4">
        <div className="max-w-2xl">
          <input
            type="text"
            placeholder="Buscar datos de sismos, países o análisis específicos..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Busca por país, fecha, magnitud o ubicación
            </span>
            <span className="text-sm text-red-600 font-medium">
              Última actualización: hace 5 minutos
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 