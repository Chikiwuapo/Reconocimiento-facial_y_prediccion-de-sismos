import { API_BASE_URL } from '../config/config';

export interface ChatMessage {
  id?: number;
  message_type: 'user' | 'bot';
  content: string;
  timestamp?: string;
  session_id?: string;
}

export interface ChatResponse {
  response: string;
  session_id: string;
  intent: string;
  confidence: number;
}

class ChatbotService {
  private baseURL = `${API_BASE_URL}/chat`;

  async sendMessage(message: string, sessionId?: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseURL}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error en la comunicación: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al enviar mensaje al chatbot:', error);
      throw error;
    }
  }

  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    try {
      const response = await fetch(`${this.baseURL}/history/?session_id=${sessionId}`);
      
      if (!response.ok) {
        throw new Error(`Error al obtener historial: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener historial del chat:', error);
      throw error;
    }
  }

  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default new ChatbotService(); 