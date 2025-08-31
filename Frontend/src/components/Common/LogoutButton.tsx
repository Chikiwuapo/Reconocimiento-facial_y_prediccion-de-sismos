import React from 'react';
import { speakWait } from '@/utils/tts';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  collapsed?: boolean;
  onLogout?: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ collapsed = false, onLogout }) => {
  const handleClick = async () => {
    // Decir "Nos vemos, {usuario}" si está disponible
    try {
      const name = localStorage.getItem('username') || 'usuario';
      await speakWait(`Nos vemos, ${name}`);
    } catch {}
    // Si hay handler externo, delega tras TTS
    if (onLogout) {
      onLogout();
      return;
    }
    // Limpiar token y username
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('username');
    } catch {}
    // Redirige al login facial por defecto
    window.location.href = '/?mode=login';
  };

  return (
    <button
      className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-2'} px-3 py-2 rounded-md bg-gray-800 text-gray-200 hover:bg-red-600 hover:text-white transition-colors`}
      title="Cerrar sesión"
      onClick={handleClick}
    >
      <LogOut className="h-5 w-5" />
      {!collapsed && <span className="text-sm font-medium">Cerrar sesión</span>}
    </button>
  );
};

export default LogoutButton;
