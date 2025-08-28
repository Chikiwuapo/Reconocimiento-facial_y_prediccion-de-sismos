import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ProfitabilityMap: React.FC = () => {
  const southAmericanCountries = [
    { 
      name: 'BRAZIL', 
      profitability: 'Very High', 
      color: '#22C55E',
      coordinates: [-15.7801, -47.9292], // Brasilia
      capital: 'Brasilia'
    },
    { 
      name: 'ARGENTINA', 
      profitability: 'High', 
      color: '#3B82F6',
      coordinates: [-34.6118, -58.3960], // Buenos Aires
      capital: 'Buenos Aires'
    },
    { 
      name: 'CHILE', 
      profitability: 'High', 
      color: '#8B5CF6',
      coordinates: [-33.4489, -70.6693], // Santiago
      capital: 'Santiago'
    },
    { 
      name: 'COLOMBIA', 
      profitability: 'Medium', 
      color: '#F59E0B',
      coordinates: [4.7110, -74.0721], // Bogotá
      capital: 'Bogotá'
    },
    { 
      name: 'PERU', 
      profitability: 'Medium', 
      color: '#EF4444',
      coordinates: [-12.0464, -77.0428], // Lima
      capital: 'Lima'
    },
    { 
      name: 'VENEZUELA', 
      profitability: 'Low', 
      color: '#F97316',
      coordinates: [10.4806, -66.9036], // Caracas
      capital: 'Caracas'
    },
    { 
      name: 'ECUADOR', 
      profitability: 'Medium', 
      color: '#06B6D4',
      coordinates: [-0.2299, -78.5249], // Quito
      capital: 'Quito'
    },
    { 
      name: 'BOLIVIA', 
      profitability: 'Low', 
      color: '#84CC16',
      coordinates: [-16.4897, -68.1193], // La Paz
      capital: 'La Paz'
    },
    { 
      name: 'PARAGUAY', 
      profitability: 'Medium', 
      color: '#EC4899',
      coordinates: [-25.2637, -57.5759], // Asunción
      capital: 'Asunción'
    },
    { 
      name: 'URUGUAY', 
      profitability: 'High', 
      color: '#6366F1',
      coordinates: [-34.9011, -56.1645], // Montevideo
      capital: 'Montevideo'
    },
    { 
      name: 'GUYANA', 
      profitability: 'Low', 
      color: '#A855F7',
      coordinates: [6.8013, -58.1553], // Georgetown
      capital: 'Georgetown'
    },
    { 
      name: 'SURINAME', 
      profitability: 'Low', 
      color: '#F59E0B',
      coordinates: [5.8520, -55.2038], // Paramaribo
      capital: 'Paramaribo'
    }
  ];

  // Custom marker icon
  const createCustomIcon = (color: string) => {
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="8" fill="${color}" stroke="white" stroke-width="2"/>
          <circle cx="10" cy="10" r="3" fill="white"/>
        </svg>
      `)}`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -10]
    });
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Profitability BY SOUTH AMERICA COUNTRIES
      </h3>
      
      <div className="h-80 relative rounded-lg overflow-hidden border border-gray-200">
        <MapContainer
          center={[-15.7801, -60.0]} // Centrado en Sudamérica
          zoom={4} // Zoom más cercano para ver Sudamérica completa
          style={{ height: '100%', width: '100%' }}
          className="z-10"
          minZoom={3}
          maxZoom={8}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {southAmericanCountries.map((country, index) => (
            <Marker
              key={index}
              position={country.coordinates}
              icon={createCustomIcon(country.color)}
            >
              <Popup>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{country.name}</div>
                  <div className="text-sm text-gray-600 mb-2">{country.capital}</div>
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    country.profitability === 'Very High' ? 'bg-green-100 text-green-800' :
                    country.profitability === 'High' ? 'bg-blue-100 text-blue-800' :
                    country.profitability === 'Medium' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {country.profitability}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      {/* Enhanced Legend for South American Countries */}
      <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
        {southAmericanCountries.map((country, index) => (
          <div key={index} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div 
                className="w-3 h-3 rounded-full shadow-sm" 
                style={{ backgroundColor: country.color }}
              />
              <div className="flex flex-col">
                <span className="text-gray-700 font-medium">{country.name}</span>
                <span className="text-xs text-gray-500">{country.capital}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                country.profitability === 'Very High' ? 'bg-green-100 text-green-800' :
                country.profitability === 'High' ? 'bg-blue-100 text-blue-800' :
                country.profitability === 'Medium' ? 'bg-orange-100 text-orange-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {country.profitability}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer with better styling */}
      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 flex justify-between bg-gray-50 p-2 rounded">
        <span>© 2015 Microsoft Corporation</span>
        <span>© 2015 HERE</span>
      </div>
    </div>
  );
};

export default ProfitabilityMap; 