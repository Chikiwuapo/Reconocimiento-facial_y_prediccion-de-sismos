import React from 'react';
import { Dashboard } from './components/Dashboard';
import ErrorBoundary from './components/Dashboard/Layout/ErrorBoundary';
import './styles/index.css';
import { ThemeProvider } from './context/ThemeContext';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Dashboard />
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;