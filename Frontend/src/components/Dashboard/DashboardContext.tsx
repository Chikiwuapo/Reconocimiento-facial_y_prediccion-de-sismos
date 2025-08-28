import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ViewType, Country, DashboardContextType } from '../../types/dashboard';

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

  const value: DashboardContextType = {
    currentView,
    setCurrentView,
    selectedCountry,
    setSelectedCountry,
    currentWorkspace,
    setCurrentWorkspace,
    searchQuery,
    setSearchQuery,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

// Re-export types for backward compatibility
export type { ViewType, Country, DashboardContextType }; 