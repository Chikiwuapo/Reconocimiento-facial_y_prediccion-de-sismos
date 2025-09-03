import React from 'react';
import { ChevronDown, ChevronRight, Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const [visible, setVisible] = React.useState(false);
  const [openFAQ, setOpenFAQ] = React.useState<Set<number>>(new Set());

  React.useEffect(() => {
    if (isOpen) {
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    } else {
      setVisible(false);
      setOpenFAQ(new Set());
      return undefined;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleFAQ = (i: number) => {
    setOpenFAQ((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const faq = [
    {
      q: '¿Cómo interpreto el mapa y las gráficas?',
      a: 'El mapa resalta regiones y países con actividad sísmica reciente. Las gráficas muestran tendencias de magnitud y frecuencia. Desplázate por el tiempo y compara picos para identificar patrones.'
    },
    {
      q: '¿Qué significan los niveles de riesgo?',
      a: 'Riesgo bajo indica actividad leve; medio sugiere vigilancia; alto y very-high requieren atención, ya que indican actividad creciente o eventos recientes significativos.'
    },
    {
      q: '¿Cómo encuentro la información de un país específico?',
      a: 'En el sidebar, abre "Países Sudamericanos" y selecciona el país. Verás métricas, último sismo y magnitud.'
    },
    {
      q: '¿Puedo cambiar el tema o cerrar sesión?',
      a: 'Sí. El botón de sol/luna cambia entre tema claro y oscuro. El botón "Cerrar sesión" está en la parte inferior del sidebar.'
    }
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`relative w-full max-w-4xl mx-4 md:mx-8 rounded-xl shadow-2xl border overflow-hidden
        ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        transition-all duration-300 ease-out
        ${theme === 'dark' ? 'bg-gray-900 text-gray-100 border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'} flex items-center justify-between`}>
          <h3 id="help-modal-title" className="text-lg font-semibold flex items-center gap-2">
            <Info className={`h-5 w-5 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}/> 
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Centro de Ayuda</span>
          </h3>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700'}`}
            aria-label="Cerrar modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Quick Guide */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/80' : 'bg-gray-50'}`}>
            <h4 className={`text-base font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Guía rápida</h4>
            <ul className={`list-disc pl-5 space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>Usa el sidebar para navegar entre el dashboard general, estadísticas y países.</li>
              <li>Haz clic en un país para ver su último sismo, magnitud y nivel de riesgo.</li>
              <li>Alterna el tema claro/oscuro desde el botón del header para mejorar la legibilidad.</li>
              <li>Pasa el cursor sobre elementos de gráficos para ver detalles.</li>
            </ul>
          </div>

          {/* Risk indicators */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/80' : 'bg-gray-50'}`}>
            <h4 className={`text-base font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Indicadores de riesgo</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2 p-3 rounded-md bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800">
                <span className="text-lg">🟢</span>
                <div>
                  <p className={`font-medium ${theme === 'dark' ? 'text-green-300' : 'text-green-950'}`}>Bajo</p>
                  <p className={`text-xs ${theme === 'dark' ? 'opacity-80' : 'text-green-800'}`}>Actividad leve; sin eventos relevantes recientes.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-md bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
                <span className="text-lg">🟡</span>
                <div>
                  <p className={`font-medium ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-950'}`}>Medio</p>
                  <p className={`text-xs ${theme === 'dark' ? 'opacity-80' : 'text-yellow-800'}`}>Requiere observación; posibles eventos moderados.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-md bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                <span className="text-lg">🟠</span>
                <div>
                  <p className={`font-medium ${theme === 'dark' ? 'text-orange-300' : 'text-orange-950'}`}>Alto</p>
                  <p className={`text-xs ${theme === 'dark' ? 'opacity-80' : 'text-orange-800'}`}>Atención; incremento notable de actividad.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-md bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800">
                <span className="text-lg">🔴</span>
                <div>
                  <p className={`font-medium ${theme === 'dark' ? 'text-red-300' : 'text-red-950'}`}>Muy Alto</p>
                  <p className={`text-xs ${theme === 'dark' ? 'opacity-80' : 'text-red-800'}`}>Prioridad; eventos recientes significativos.</p>
                </div>
              </div>
            </div>
          </div>

          {/* About project */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/80' : 'bg-gray-50'}`}>
            <h4 className={`text-base font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Sobre SISMOPREDICT</h4>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              SISMOPREDICT es una plataforma de monitoreo y análisis de actividad sísmica orientada a brindar información clara y accesible
              para la toma de decisiones. Integra visualizaciones, métricas y alertas visuales para facilitar la interpretación.
            </p>
          </div>

          {/* FAQ Section */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/80' : 'bg-gray-50'}`}>
            <h4 className={`text-base font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Preguntas frecuentes</h4>
            <div className="space-y-3">
              {faq.map((item, i) => {
                const open = openFAQ.has(i);
                return (
                  <div key={i}>
                    <button
                      onClick={() => toggleFAQ(i)}
                      className={`w-full flex items-center justify-between p-3 text-left rounded-md transition-colors border ${
                        theme === 'dark' 
                          ? 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-200' 
                          : 'bg-white hover:bg-gray-100 border-gray-200 text-gray-800'
                      }`}
                    >
                      <span className="text-sm font-medium">{item.q}</span>
                      {open ? <ChevronDown className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      <div className={`px-3 pb-3 pt-2 text-sm rounded-b-md mt-1 ${
                        theme === 'dark' 
                          ? 'text-gray-300 bg-gray-700/50' 
                          : 'text-gray-700 bg-white'
                      }`}>{item.a}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} flex justify-end`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-red-600 text-white hover:bg-red-700 border border-red-600'
                : 'bg-red-600 text-white hover:bg-red-700 border border-red-600'
            }`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
