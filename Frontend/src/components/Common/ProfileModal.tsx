import React from 'react';

interface UserInfo {
  name: string;
  email: string;
  role?: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserInfo;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user }) => {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const info = user || { name: 'Usuario', email: 'usuario@correo.com', role: 'Analista' };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`relative w-full max-w-4xl mx-4 md:mx-8 rounded-xl shadow-xl border overflow-hidden
        ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        transition-all duration-300 ease-out
        bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-800`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 id="profile-modal-title" className="text-lg font-semibold">Perfil de usuario</h3>
          <button
            onClick={onClose}
            className="px-2 py-1 rounded-md text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column: avatar + basic info */}
          <div className="md:col-span-1">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-red-500 to-orange-400 text-white flex items-center justify-center text-3xl font-bold select-none">
              {info.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-base font-medium">{info.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{info.email}</p>
              {info.role && (
                <span className="inline-flex items-center mt-2 px-2 py-0.5 rounded-md text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                  {info.role}
                </span>
              )}
            </div>
          </div>

          {/* Right column: actions and details */}
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button className="w-full px-4 py-2 rounded-md text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200">
                Modificar información
              </button>
              <button className="w-full px-4 py-2 rounded-md text-sm font-medium bg-white border border-gray-300 hover:bg-gray-50 transition-colors dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-800">
                Cambiar contraseña
              </button>
            </div>

            <div className="card">
              <h4 className="text-sm font-semibold mb-3">Información básica</h4>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Nombre</dt>
                  <dd>{info.name}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Correo</dt>
                  <dd>{info.email}</dd>
                </div>
                {info.role && (
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">Rol</dt>
                    <dd>{info.role}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm border border-gray-300 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
