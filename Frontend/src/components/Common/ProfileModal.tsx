import React from 'react';
import AppModal from './AppModal';

interface UserInfo {
  name: string;
  email: string;
  dni?: string;
  role?: string;
  avatar?: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserInfo;
  onLogout?: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user}) => {
  const info = user || { 
    name: 'Admin', 
    email: 'admin@correo.com',
    dni: '12345678',
    role: 'Administrador',
    avatar: 'https://ui-avatars.com/api/?name=Usuario&background=2563eb&color=fff'
  };

  return (
    <AppModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Perfil de Usuario"
      size="md"
    >
      <div className="flex flex-col items-center py-4 px-6">
        <div className="relative mb-4">
          <img 
            src={info.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(info.name)}&background=2563eb&color=fff`} 
            alt={info.name}
            className="w-24 h-24 rounded-full border-4 border-blue-100 dark:border-blue-900"
          />
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
        </div>
        
        <h3 className="text-xl font-semibold text-center mb-1">{info.name}</h3>
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-4">{info.role}</p>
        
        <div className="w-full space-y-3 mt-4">
          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-700 dark:text-gray-200">{info.email}</span>
          </div>

          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm text-gray-700 dark:text-gray-200">{info.dni || 'No especificado'}</span>
          </div>

          <button 
            onClick={() => {}}
            className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Registrar Usuario
          </button>
        </div>
      </div>
    </AppModal>
  );
};

export default ProfileModal;
