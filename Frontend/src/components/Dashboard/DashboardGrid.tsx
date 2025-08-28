import React from 'react';
import ProfitabilityMap from './Widgets/ProfitabilityMap';

const DashboardGrid: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard de Predicción de Sismos</h1>
            <p className="text-gray-600">Vista general de la actividad sísmica en Sudamérica</p>
          </div>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sismos</p>
              <p className="text-3xl font-bold text-gray-900">264</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">+12% vs mes anterior</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Magnitud Promedio</p>
              <p className="text-3xl font-bold text-gray-900">4.8</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-full">
              <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-orange-600 mt-2">+0.3 vs mes anterior</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">País Más Activo</p>
              <p className="text-3xl font-bold text-gray-900">Chile</p>
            </div>
            <div className="p-2 bg-red-100 rounded-full">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-red-600 mt-2">45 sismos este mes</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Riesgo Promedio</p>
              <p className="text-3xl font-bold text-gray-900">Medio</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-full">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-yellow-600 mt-2">Estable</p>
        </div>
      </div>

      {/* Mapa de Sudamérica */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mapa de Actividad Sísmica en Sudamérica</h3>
        <ProfitabilityMap />
      </div>

      {/* Información Adicional */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Características del Dashboard</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Monitoreo en tiempo real de actividad sísmica</li>
              <li>• Análisis de patrones y tendencias</li>
              <li>• Predicciones basadas en datos históricos</li>
              <li>• Alertas tempranas para países en riesgo</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Próximas Funcionalidades</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Notificaciones en tiempo real</li>
              <li>• Análisis de profundidad de sismos</li>
              <li>• Predicciones de réplicas</li>
              <li>• Integración con sistemas de emergencia</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGrid; 