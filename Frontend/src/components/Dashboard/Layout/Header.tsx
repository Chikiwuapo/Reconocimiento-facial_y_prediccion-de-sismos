import React from 'react';
import { 
  Sun,
  Moon,
  Settings, 
  HelpCircle,
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import ProfileModal from '../../Common/ProfileModal';
import HelpModal from '../../Common/HelpModal';
import ElegantChatbotButton from '../../Common/ElegantChatbotButton';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [helpOpen, setHelpOpen] = React.useState(false);

  return (
    <>
      <header className={`${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} px-6 py-4 transition-colors duration-300`}>
        <div className="flex items-center justify-between">
          {/* Left side - Branding and Titles */}
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-md h-10 w-10 flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-red-900/30' : 'bg-red-100'}`}>
              {/* Simple seismograph/wave icon using SVG */}
              <svg className="h-6 w-6 text-red-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12h3l2-6 4 12 2-6h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h1 className={`text-xl md:text-2xl font-bold leading-tight transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Dashboard de Predicción de Sismos</h1>
              <p className={`text-sm md:text-base transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Monitoreo y predicción de actividad sísmica en Sudamérica</p>
            </div>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center space-x-2">
            {/* Botón de cambio de tema (lunita) */}
            <button
              className={`p-2 rounded-md transition-colors duration-300 ${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              onClick={toggleTheme}
              aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
              title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            {/* Botón elegante del chatbot - AL LADO DE LA LUNITA */}
            <ElegantChatbotButton />
            
            <button
              className={`p-2 rounded-md transition-colors duration-300 ${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              onClick={() => setProfileOpen(true)}
              aria-label="Abrir perfil de usuario"
              title="Perfil de usuario"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              className={`p-2 rounded-md transition-colors duration-300 ${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              onClick={() => setHelpOpen(true)}
              aria-label="Abrir ayuda"
              title="Ayuda"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Modals */}
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
};

export default Header;