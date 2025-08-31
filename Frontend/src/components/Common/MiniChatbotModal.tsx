import React, { useState, useEffect, useRef } from 'react';
import chatbotService, { ChatMessage } from '../../services/chatbotService';
import { CHATBOT_CONFIG } from '../../config/config';
import './MiniChatbotModal.module.css';

interface MiniChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MiniChatbotModal: React.FC<MiniChatbotModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const newSessionId = chatbotService.generateSessionId();
      setSessionId(newSessionId);
      setMessages([{
        message_type: 'bot',
        content: CHATBOT_CONFIG.welcomeMessage,
        session_id: newSessionId
      }]);
      
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      message_type: 'user',
      content: inputMessage.trim(),
      session_id: sessionId
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await chatbotService.sendMessage(userMessage.content, sessionId);
      
      setTimeout(() => {
        const botMessage: ChatMessage = {
          message_type: 'bot',
          content: response.response,
          session_id: sessionId
        };
        
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, CHATBOT_CONFIG.typingDelay);

    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      const errorMessage: ChatMessage = {
        message_type: 'bot',
        content: 'Lo siento, hubo un error al procesar tu mensaje. ¿Podrías intentar de nuevo?',
        session_id: sessionId
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="mini-chatbot-overlay" onClick={onClose}>
      <div className="mini-chatbot-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header compacto */}
        <div className="mini-chatbot-header">
          <div className="mini-chatbot-title">
            <div className="mini-chatbot-avatar">🤖</div>
            <div>
              <h3>AI Assistant</h3>
              <span className="mini-chatbot-status">Online</span>
            </div>
          </div>
          <button className="mini-chatbot-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Messages compactos */}
        <div className="mini-chatbot-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mini-chatbot-message ${message.message_type === 'user' ? 'user' : 'bot'}`}
            >
              <div className="mini-message-content">
                {message.content}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="mini-chatbot-message bot">
              <div className="mini-typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input compacto */}
        <div className="mini-chatbot-input">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="mini-send-button"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiniChatbotModal; 