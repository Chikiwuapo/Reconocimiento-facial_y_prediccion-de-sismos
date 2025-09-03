import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import ErrorBoundary from './components/Dashboard/Layout/ErrorBoundary';
import './styles/index.css';
import { ThemeProvider } from './context/ThemeContext';
import FacialLogin from './auth/FacialLogin';
import { me } from './services/auth';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<'checking' | 'authed' | 'guest'>('checking');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setAuthState('guest');
      return;
    }
    // Validar token con el backend; si falla, limpiar y mostrar login
    me(token)
      .then(() => setAuthState('authed'))
      .catch(() => {
        try { localStorage.removeItem('access_token'); } catch {}
        setAuthState('guest');
      });
  }, []);

  return (
    <ThemeProvider>
      <ErrorBoundary>
        {authState === 'checking' ? (
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}>Cargando…</div>
        ) : authState === 'authed' ? (
          <Dashboard />
        ) : (
          <FacialLogin />
        )}
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;