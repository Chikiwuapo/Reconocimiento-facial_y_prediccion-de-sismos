import React from 'react';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  collapsed?: boolean;
  onLogout?: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ collapsed = false, onLogout }) => {
  return (
    <button
      className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-2'} px-3 py-2 rounded-md bg-gray-800 text-gray-200 hover:bg-red-600 hover:text-white transition-colors`}
      title="Cerrar sesión"
      onClick={onLogout}
    >
      <LogOut className="h-5 w-5" />
      {!collapsed && <span className="text-sm font-medium">Cerrar sesión</span>}
    </button>
  );
};

export default LogoutButton;
