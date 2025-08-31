import React, { useState } from 'react';
import GamerChatOverlay from './GamerChatOverlay';
import styles from './ElegantChatbotButton.module.css';

const ElegantChatbotButton: React.FC = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  return (
    <>
      {/* Botón elegante del chatbot */}
      <button 
        className={styles['elegant-chatbot-button']}
        onClick={toggleChatbot}
        aria-label="Abrir asistente virtual"
        title="Asistente Virtual"
      >
        {/* Esfera de energía elegante */}
        <div className={styles['energy-orb']}>
          {/* Núcleo central */}
          <div className={styles['orb-core']}>
            <div className={styles['orb-inner']}>
              <div className={styles['ai-dot']}></div>
            </div>
          </div>
          
          {/* Anillos de energía sutiles */}
          <div className={`${styles['orb-ring']} ${styles['ring-1']}`}></div>
          <div className={`${styles['orb-ring']} ${styles['ring-2']}`}></div>
          
          {/* Partículas flotantes */}
          <div className={`${styles['orb-particle']} ${styles['particle-1']}`}></div>
          <div className={`${styles['orb-particle']} ${styles['particle-2']}`}></div>
        </div>
      </button>

      {/* Chat overlay gamer */}
      <GamerChatOverlay 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)} 
      />
    </>
  );
};

export default ElegantChatbotButton; 