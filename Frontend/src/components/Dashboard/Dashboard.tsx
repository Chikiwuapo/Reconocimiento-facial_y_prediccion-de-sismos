import React, { useState } from 'react';
import Sidebar from './Layout/Sidebar';
import Header from './Layout/Header';
import DashboardGrid from './Layout/DashboardGrid';
import StatisticsView from './Views/StatisticsView';
import CountryView from './Views/CountryView';
import { DashboardProvider, useDashboard } from './Context/DashboardContext';

const DashboardContent: React.FC = () => {
  const { currentView, selectedCountry } = useDashboard();

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <DashboardGrid />;
      case 'statistics':
        return <StatisticsView />;
      case 'country':
        return selectedCountry ? <CountryView country={selectedCountry} /> : <DashboardGrid />;
      default:
        return <DashboardGrid />;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <Header />
      
      {/* Dashboard Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
        {renderContent()}
      </main>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DashboardProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        {/* Main Content */}
        <DashboardContent />
      </div>
    </DashboardProvider>
  );
};

export default Dashboard;