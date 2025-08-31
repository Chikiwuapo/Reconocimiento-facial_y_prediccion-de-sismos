// Configuración de la API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Configuración del chatbot
export const CHATBOT_CONFIG = {
  maxMessages: 50,
  typingDelay: 1000,
  welcomeMessage: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte?',
}; 