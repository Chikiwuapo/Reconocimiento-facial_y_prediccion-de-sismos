import React, { useState } from 'react';
import ChatbotModal from './ChatbotModal';
import './ChatbotButton.module.css';

const ChatbotButton: React.FC = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  return (
    <>
      {/* Botón flotante del chatbot */}
      <button 
        className="chatbot-floating-button"
        onClick={toggleChatbot}
        aria-label="Abrir asistente virtual"
      >
        <div className="chatbot-icon">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
        <div className="chatbot-tooltip">
          Asistente Virtual
        </div>
      </button>

      {/* Modal del chatbot */}
      <ChatbotModal 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)} 
      />
    </>
  );
};

export default ChatbotButton; 