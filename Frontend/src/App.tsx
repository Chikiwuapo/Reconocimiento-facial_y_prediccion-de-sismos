import React from 'react';
import { Dashboard } from './components/Dashboard';
import ErrorBoundary from './components/Dashboard/Layout/ErrorBoundary';
import './styles/index.css';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  );
};

export default App;