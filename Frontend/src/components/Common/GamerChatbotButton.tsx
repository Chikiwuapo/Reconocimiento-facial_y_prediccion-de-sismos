import React, { useState } from 'react';
import MiniChatbotModal from './MiniChatbotModal';
import './GamerChatbotButton.module.css';

const GamerChatbotButton: React.FC = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  return (
    <>
      {/* Botón flotante del chatbot estilo gamer */}
      <button 
        className="gamer-chatbot-button"
        onClick={toggleChatbot}
        aria-label="Abrir asistente virtual gamer"
      >
        {/* Esfera de energía exterior */}
        <div className="energy-sphere">
          {/* Núcleo central */}
          <div className="core">
            <div className="core-inner">
              <div className="ai-symbol">AI</div>
            </div>
          </div>
          
          {/* Anillos de energía */}
          <div className="energy-ring ring-1"></div>
          <div className="energy-ring ring-2"></div>
          <div className="energy-ring ring-3"></div>
          
          {/* Partículas flotantes */}
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
          <div className="particle particle-4"></div>
          
          {/* Efecto de pulso */}
          <div className="pulse-effect"></div>
        </div>
        
        {/* Tooltip gamer */}
        <div className="gamer-tooltip">
          <span className="tooltip-title">🎮 ASISTENTE VIRTUAL</span>
          <span className="tooltip-subtitle">Presiona para chatear</span>
        </div>
      </button>

      {/* Mini ventana del chatbot */}
      <MiniChatbotModal 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)} 
      />
    </>
  );
};

export default GamerChatbotButton; 