import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Trash2, RefreshCw } from 'lucide-react';
import { simpleChatbotService, ChatResponse } from '../../services/simpleChatbotService';
import styles from './GamerChatOverlay.module.css';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
}

const GamerChatOverlay: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: '🤖 **¡Hola! Soy tu asistente virtual inteligente para análisis de sismos.**\n\n📚 **Puedo ayudarte con:**\n\n• 🇵🇪 **Información de países** (Perú, Chile, Argentina, etc.)\n• 📏 **Escalas de magnitud** (Richter, Mercalli)\n• 🛡️ **Consejos de seguridad** (antes, durante, después)\n• 🔮 **Métodos de predicción** (estado actual)\n• 📖 **Eventos históricos** (lecciones aprendidas)\n• 🌍 **Zonas sísmicas** y placas tectónicas\n\n💡 **Ejemplos de preguntas:**\n• "¿Cuántos sismos tuvo Perú?"\n• "Consejos de seguridad sísmica"\n• "¿Qué es la escala de Richter?"\n• "Compara Chile y Perú"\n• "Eventos históricos de sismos"\n\n¿En qué puedo ayudarte hoy?',
      sender: 'bot',
      timestamp: new Date(),
      suggestions: ['Ver países disponibles', 'Estadísticas generales', 'Consejos de seguridad', 'Eventos históricos']
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Usar el servicio simple del chatbot
      const response: ChatResponse = simpleChatbotService.processQuery(inputMessage);
      
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.answer,
        sender: 'bot',
        timestamp: new Date(),
        suggestions: response.suggestions
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error en el chatbot:', error);
      
      const fallbackResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Lo siento, tuve un problema procesando tu consulta. ¿Podrías intentar de nuevo?',
        sender: 'bot',
        timestamp: new Date(),
        suggestions: ['Reformular la pregunta', 'Hacer una pregunta más simple', 'Ver estadísticas generales']
      };
      
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChatHistory = () => {
    setMessages([
      {
        id: Date.now().toString(),
        content: '🧹 **¡Chat borrado exitosamente!** ✨\n\nHe limpiado toda nuestra conversación anterior. ¿Te gustaría empezar de nuevo?\n\nPuedes preguntarme cualquier cosa o simplemente saludarme. Estoy aquí para ayudarte y charlar contigo.',
        sender: 'bot',
        timestamp: new Date(),
        suggestions: ['¡Hola!', '¿Cómo estás?', 'Hablemos de sismos', '¿Qué sabes hacer?']
      }
    ]);
    setShowClearConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.chatWindow}>
        {/* Header gamer */}
        <div className={styles.chatHeader}>
          <div className={styles.headerContent}>
            <div className={styles.botIcon}>
              <Bot className={styles.botSvg} />
            </div>
            <div className={styles.headerText}>
              <h3 className={styles.title}>Asistente Virtual Inteligente</h3>
              <span className={styles.subtitle}>AI Sismic Analysis Expert</span>
            </div>
          </div>
          <div className={styles.headerActions}>
            {/* Botón de borrar chat */}
            <button 
              className={styles.clearButton}
              onClick={() => setShowClearConfirm(true)}
              aria-label="Borrar historial de chat"
              title="Borrar chat"
            >
              <Trash2 className={styles.clearIcon} />
            </button>
            
            {/* Botón de cerrar */}
            <button 
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Cerrar chat"
            >
              <X className={styles.closeIcon} />
            </button>
          </div>
        </div>

        {/* Confirmación de borrado */}
        {showClearConfirm && (
          <div className={styles.clearConfirm}>
            <div className={styles.clearConfirmContent}>
              <h4>🗑️ ¿Borrar todo el chat?</h4>
              <p>Esta acción no se puede deshacer. ¿Estás seguro?</p>
              <div className={styles.clearConfirmActions}>
                <button 
                  className={styles.clearConfirmButton}
                  onClick={clearChatHistory}
                >
                  <Trash2 className={styles.clearConfirmIcon} />
                  Sí, borrar todo
                </button>
                <button 
                  className={styles.cancelButton}
                  onClick={() => setShowClearConfirm(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messages area */}
        <div className={styles.messagesArea}>
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`${styles.message} ${message.sender === 'user' ? styles.userMessage : styles.botMessage}`}
            >
              <div className={styles.messageAvatar}>
                {message.sender === 'user' ? (
                  <User className={styles.avatarIcon} />
                ) : (
                  <Bot className={styles.avatarIcon} />
                )}
              </div>
              <div className={styles.messageContent}>
                <div 
                  className={styles.messageText}
                  dangerouslySetInnerHTML={{ 
                    __html: message.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                  }}
                />
                
                {/* Sugerencias del bot */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className={styles.suggestions}>
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className={styles.suggestionButton}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className={styles.messageTime}>
                  {message.timestamp.toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className={`${styles.message} ${styles.botMessage}`}>
              <div className={styles.messageAvatar}>
                <Bot className={styles.avatarIcon} />
              </div>
              <div className={styles.messageContent}>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className={styles.inputArea}>
          <div className={styles.inputContainer}>
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Pregunta sobre sismos, países, estadísticas o simplemente charla conmigo..."
              className={styles.messageInput}
            />
            <button 
              onClick={handleSendMessage}
              className={styles.sendButton}
              disabled={!inputMessage.trim()}
              aria-label="Enviar mensaje"
            >
              <Send className={styles.sendIcon} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamerChatOverlay; 