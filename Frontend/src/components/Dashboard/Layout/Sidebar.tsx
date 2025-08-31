import React from "react";
import {
  X,
  Home,
  TrendingUp,
  MapPin,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useDashboard } from "../Context/DashboardContext";
import type { Country } from "../Context/DashboardContext";
import LogoutButton from "../../Common/LogoutButton";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [countriesOpen, setCountriesOpen] = React.useState(true);
  const { currentView, setCurrentView, selectedCountry, setSelectedCountry, countries, loading, error } =
    useDashboard();

  // Convertir datos de la API al formato del frontend
  const southAmericanCountries: Country[] = countries.map(country => ({
    id: country.id,
    name: country.name,
    code: country.code,
    coordinates: country.coordinates,
    riskLevel: country.riskLevel as 'low' | 'medium' | 'high' | 'very-high',
    lastEarthquake: country.lastEarthquake,
    magnitude: country.magnitude,
  }));

  // Mapa de banderas por país (nombre) para mostrar emojis en la lista
  const flagByCountryName: Record<string, string> = {
    'Argentina': '🇦🇷',
    'Bolivia': '🇧🇴',
    'Brazil': '🇧🇷',
    'Brasil': '🇧🇷',
    'Chile': '🇨🇱',
    'Colombia': '🇨🇴',
    'Ecuador': '🇪🇨',
    'Guyana': '🇬🇾',
    'Guayana': '🇬🇾',
    'Paraguay': '🇵🇾',
    'Peru': '🇵🇪',
    'Perú': '🇵🇪',
    'Suriname': '🇸🇷',
    'Uruguay': '🇺🇾',
    'Venezuela': '🇻🇪',
  };

  const getFlag = (name: string): string => {
    return flagByCountryName[name] || '🌎';
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
      <div
        className={`
        fixed inset-y-0 left-0 z-50 bg-gray-900 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${collapsed ? "w-20" : "w-72"}
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Header: Logo + Título */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
          <div
            className={`flex items-center ${
              collapsed ? "justify-center w-full" : "space-x-3"
            }`}
          >
            <AlertTriangle
              className={`text-red-400 transition-transform duration-300 ${
                collapsed ? "h-8 w-8" : "h-8 w-8"
              }`}
            />
            {!collapsed && (
              <span className="text-white font-semibold text-xl tracking-wide">
                SISMOPREDICT
              </span>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col p-3 space-y-3">
          {/* Main Navigation */}
          <nav className="space-y-2">
            {/* Home View */}
            <button
              onClick={() => setCurrentView("home")}
              className={`group w-full flex items-center ${
                collapsed ? "justify-center" : "space-x-3"
              } px-3 py-2 rounded-md transition-all duration-200 hover:translate-x-0.5 ${
                currentView === "home"
                  ? "bg-red-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
              title="Dashboard General"
            >
              <Home className="h-5 w-5" />
              {!collapsed && (
                <span className="font-medium">Dashboard General</span>
              )}
            </button>

            {/* Statistics View */}
            <button
              onClick={() => setCurrentView("statistics")}
              className={`group w-full flex items-center ${
                collapsed ? "justify-center" : "space-x-3"
              } px-3 py-2 rounded-md transition-all duration-200 hover:translate-x-0.5 ${
                currentView === "statistics"
                  ? "bg-red-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
              title="Estadísticas Globales"
            >
              <TrendingUp className="h-5 w-5" />
              {!collapsed && (
                <span className="font-medium">Estadísticas Globales</span>
              )}
            </button>

            {/* Country Selector */}
            <div className="pt-2">
              <button
                onClick={() => setCountriesOpen((v) => !v)}
                className={`w-full flex items-center ${
                  collapsed ? "justify-center" : "justify-between"
                } px-3 py-2 rounded-md text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors`}
                aria-expanded={countriesOpen}
                aria-controls="countries-panel"
                title="Países Sudamericanos"
              >
                <div
                  className={`flex items-center ${
                    collapsed ? "" : "space-x-2"
                  }`}
                >
                  <MapPin className="h-5 w-5 text-gray-400" />
                  {!collapsed && (
                    <span className="text-sm font-medium">
                      Países Sudamericanos
                    </span>
                  )}
                </div>
                {!collapsed &&
                  (countriesOpen ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  ))}
              </button>

              {/* Countries list */}
              {!collapsed && (
                <div
                  id="countries-panel"
                  className={`ml-4 mt-2 space-y-1 overflow-hidden transition-all duration-500 ease-in-out 
    ${
      countriesOpen
        ? "max-h-[800px] opacity-100 translate-y-0"
        : "max-h-0 opacity-0 -translate-y-2"
    }`}
                >
                  {loading ? (
                    <div className="text-gray-400 text-sm px-3 py-2">Cargando países...</div>
                  ) : error ? (
                    <div className="text-red-400 text-sm px-3 py-2">Error: {error}</div>
                  ) : (
                    southAmericanCountries.map((country) => (
                      <button
                        key={country.id}
                        onClick={() => {
                          setSelectedCountry(country);
                          setCurrentView("country");
                        }}
                        className={`w-full flex items-center px-3 py-2 rounded-md text-sm transition-all duration-300 hover:translate-x-1
            ${
              currentView === "country" && selectedCountry?.id === country.id
                ? "bg-red-600 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
                      >
                        <span className="mr-2 text-base leading-none">{getFlag(country.name)}</span>
                        <span>{country.name}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Footer: Logout + Collapse toggle */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-800 p-3">
          <div
            className={`flex items-center ${
              collapsed ? "justify-center" : "justify-between"
            } gap-2`}
          >
            <LogoutButton
              collapsed={collapsed}
              onLogout={() => {
                try {
                  localStorage.removeItem('access_token');
                } catch {}
                window.location.href = '/?mode=login';
              }}
            />

            <button
              className="h-9 w-9 rounded-full flex items-center justify-center bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors"
              onClick={() => setCollapsed((v) => !v)}
              aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            >
              {collapsed ? (
                <ChevronsRight className="h-5 w-5" />
              ) : (
                <ChevronsLeft className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
