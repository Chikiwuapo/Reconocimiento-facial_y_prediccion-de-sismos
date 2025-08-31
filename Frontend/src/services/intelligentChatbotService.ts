import { OPENAI_CONFIG, SYSTEM_MESSAGES } from '../config/openai';

export interface ChatResponse {
  answer: string;
  suggestions: string[];
  context?: string;
  confidence?: number;
}

export interface ConversationContext {
  topic: string;
  depth: 'casual' | 'detailed' | 'expert';
  language: 'es' | 'en';
  mood: 'friendly' | 'professional' | 'casual';
}

class IntelligentChatbotService {
  private isOpenAIAvailable: boolean = false;
  private conversationHistory: Array<{role: string, content: string, timestamp: number}> = [];
  private currentContext: ConversationContext = {
    topic: 'general',
    depth: 'casual',
    language: 'es',
    mood: 'friendly'
  };
  private usageStats = {
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    averageResponseTime: 0
  };

  constructor() {
    console.log('🧠 Inicializando IntelligentChatbotService...');
    this.initializeOpenAI();
  }

  private initializeOpenAI(): void {
    console.log('🔑 Intentando inicializar OpenAI...');
    console.log('🔍 API Key disponible:', !!OPENAI_CONFIG.API_KEY);
    console.log('🔍 API Key valor:', OPENAI_CONFIG.API_KEY ? 'SÍ' : 'NO');
    console.log('🔍 Configuración completa:', OPENAI_CONFIG);
    
    if (OPENAI_CONFIG.isConfigured()) {
      console.log('✅ API Key encontrada, configurando servicio...');
      this.isOpenAIAvailable = true;
      console.log('✅ Servicio inteligente configurado con fetch directo');
    } else {
      console.warn('⚠️ OpenAI API key no encontrada. El chatbot funcionará en modo básico.');
      this.isOpenAIAvailable = false;
    }
  }

  public async processQuery(userQuery: string): Promise<ChatResponse> {
    console.log('🧠 IntelligentChatbotService.processQuery llamado con:', userQuery);
    const startTime = Date.now();
    this.usageStats.totalCalls++;

    try {
      // Analizar el contexto de la pregunta
      console.log('🔍 Analizando contexto de la pregunta...');
      this.analyzeQueryContext(userQuery);

      if (this.isOpenAIAvailable) {
        console.log('✅ OpenAI disponible, procesando con IA...');
        const response = await this.processWithOpenAI(userQuery);
        this.usageStats.successfulCalls++;
        this.updateResponseTime(Date.now() - startTime);
        console.log('✅ Respuesta de IA exitosa:', response);
        return response;
      } else {
        console.log('⚠️ OpenAI no disponible, usando fallback');
        return this.getFallbackResponse(userQuery);
      }
    } catch (error) {
      console.error('❌ Error en el servicio inteligente:', error);
      this.usageStats.failedCalls++;
      return this.getFallbackResponse(userQuery);
    }
  }

  private analyzeQueryContext(userQuery: string): void {
    console.log('🔍 analyzeQueryContext llamado con:', userQuery);
    const lowerQuery = userQuery.toLowerCase();
    
    // Detectar idioma
    console.log('🔍 Detectando idioma...');
    if (lowerQuery.includes('hello') || lowerQuery.includes('how are you') || lowerQuery.includes('what is')) {
      this.currentContext.language = 'en';
    } else {
      this.currentContext.language = 'es';
    }
    console.log('🔍 Idioma detectado:', this.currentContext.language);
    
    // Detectar tema principal
    console.log('🔍 Detectando tema principal...');
    if (lowerQuery.includes('sismo') || lowerQuery.includes('terremoto') || lowerQuery.includes('earthquake')) {
      this.currentContext.topic = 'seismic';
    } else if (lowerQuery.includes('program') || lowerQuery.includes('code') || lowerQuery.includes('programa') || lowerQuery.includes('código')) {
      this.currentContext.topic = 'programming';
    } else if (lowerQuery.includes('philosophy') || lowerQuery.includes('think') || lowerQuery.includes('filosofía') || lowerQuery.includes('pensar')) {
      this.currentContext.topic = 'philosophical';
    } else {
      this.currentContext.topic = 'general';
    }
    console.log('🔍 Tema principal detectado:', this.currentContext.topic);
    
    // Analizar complejidad
    console.log('🔍 Analizando complejidad...');
    if (lowerQuery.includes('explain') || lowerQuery.includes('how does') || lowerQuery.includes('why') || lowerQuery.includes('explica') || lowerQuery.includes('cómo') || lowerQuery.includes('por qué')) {
      this.currentContext.depth = 'detailed';
    } else if (lowerQuery.includes('define') || lowerQuery.includes('what is') || lowerQuery.includes('definir') || lowerQuery.includes('qué es')) {
      this.currentContext.depth = 'expert';
    } else {
      this.currentContext.depth = 'casual';
    }
    console.log('🔍 Complejidad detectada:', this.currentContext.depth);
    
    // Analizar tono emocional
    console.log('🔍 Analizando tono emocional...');
    if (lowerQuery.includes('help') || lowerQuery.includes('problem') || lowerQuery.includes('ayuda') || lowerQuery.includes('problema')) {
      this.currentContext.mood = 'professional';
    } else if (lowerQuery.includes('joke') || lowerQuery.includes('fun') || lowerQuery.includes('chiste') || lowerQuery.includes('divertido')) {
      this.currentContext.mood = 'casual';
    } else {
      this.currentContext.mood = 'friendly';
    }
    console.log('🔍 Tono emocional detectado:', this.currentContext.mood);
    
    console.log('🔍 Contexto actualizado:', this.currentContext);
  }

  private async processWithOpenAI(userQuery: string): Promise<ChatResponse> {
    console.log('🧠 processWithOpenAI llamado con:', userQuery);

    // Agregar el mensaje del usuario al historial
    this.conversationHistory.push({ 
      role: "user", 
      content: userQuery,
      timestamp: Date.now()
    });

    // Seleccionar el contexto del sistema apropiado
    const systemMessage = this.selectSystemContext();
    console.log('🔧 Mensaje del sistema seleccionado:', systemMessage.role);
    
    // Preparar mensajes para OpenAI (últimos 15 para mantener contexto)
    const messages = [systemMessage, ...this.conversationHistory.slice(-15)];
    console.log('📝 Mensajes preparados para OpenAI:', messages.length);

    try {
      console.log('🚀 Llamando a la API de OpenAI con fetch directo...');
      
      // Usar fetch directo en lugar de la librería OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_CONFIG.API_KEY}`
        },
        body: JSON.stringify({
          model: OPENAI_CONFIG.MODEL,
          messages: messages,
          max_tokens: OPENAI_CONFIG.MAX_TOKENS,
          temperature: OPENAI_CONFIG.TEMPERATURE,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      });

      console.log('📡 Respuesta del servidor:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error del servidor:', response.status, errorData);
        throw new Error(`HTTP ${response.status}: ${errorData.error?.message || 'Error del servidor'}`);
      }

      const data = await response.json();
      console.log('✅ Respuesta de OpenAI recibida:', data);

      const aiResponse = data.choices[0]?.message?.content || "Lo siento, no pude procesar tu pregunta.";

      // Agregar la respuesta de la IA al historial
      this.conversationHistory.push({ 
        role: "assistant", 
        content: aiResponse,
        timestamp: Date.now()
      });

      // Generar sugerencias inteligentes y contextuales
      const suggestions = this.generateSmartSuggestions(userQuery, aiResponse);

      const responseObj = {
        answer: aiResponse,
        suggestions: suggestions,
        context: this.currentContext.topic,
        confidence: 0.95
      };

      console.log('✅ Respuesta final preparada:', responseObj);
      return responseObj;
      
    } catch (error) {
      console.error('❌ Error llamando a OpenAI:', error);
      throw error;
    }
  }

  private selectSystemContext(): { role: string, content: string } {
    let contextContent = SYSTEM_MESSAGES.DEFAULT;
    
    switch (this.currentContext.topic) {
      case 'seismic':
        contextContent = SYSTEM_MESSAGES.SISMIC_EXPERT;
        break;
      case 'programming':
        contextContent = SYSTEM_MESSAGES.CODER_ASSISTANT;
        break;
      case 'philosophical':
        contextContent = SYSTEM_MESSAGES.PHILOSOPHICAL;
        break;
      default:
        if (this.currentContext.mood === 'casual') {
          contextContent = SYSTEM_MESSAGES.FRIENDLY_CHAT;
        }
    }

    // Personalizar el contexto según el idioma y profundidad
    const languageInstruction = this.currentContext.language === 'en' 
      ? '\n\nIMPORTANTE: Responde en inglés de manera natural y conversacional.'
      : '\n\nIMPORTANTE: Responde en español de manera natural y conversacional.';

    const depthInstruction = this.currentContext.depth === 'expert'
      ? '\n\nProporciona información detallada y técnica, pero mantén la claridad.'
      : this.currentContext.depth === 'detailed'
      ? '\n\nExplica de manera clara y con ejemplos, pero no seas demasiado técnico.'
      : '\n\nMantén la respuesta casual y amigable, sin demasiados detalles técnicos.';

    return {
      role: "system",
      content: contextContent + languageInstruction + depthInstruction
    };
  }

  private generateSmartSuggestions(userQuery: string, aiResponse: string): string[] {
    const lowerQuery = userQuery.toLowerCase();
    
    // Sugerencias basadas en el contexto detectado
    switch (this.currentContext.topic) {
      case 'seismic':
        return [
          '🌍 ¿Quieres comparar con otros países?',
          '📊 ¿Te interesan las estadísticas detalladas?',
          '🛡️ ¿Necesitas consejos de seguridad?',
          '📚 ¿Quieres conocer eventos históricos?'
        ];
      
      case 'programming':
        return [
          '💻 ¿Quieres ver un ejemplo de código?',
          '🔧 ¿Necesitas ayuda con debugging?',
          '📖 ¿Te interesa aprender más sobre este tema?',
          '🚀 ¿Quieres optimizar tu código?'
        ];
      
      case 'philosophical':
        return [
          '🤔 ¿Quieres explorar otras perspectivas?',
          '📚 ¿Te interesa leer más sobre esto?',
          '💭 ¿Quieres profundizar en algún aspecto?',
          '🌱 ¿Te gustaría discutir las implicaciones?'
        ];
      
      default:
        // Sugerencias generales inteligentes
        if (lowerQuery.includes('país') || lowerQuery.includes('country')) {
          return [
            '🌍 ¿Quieres comparar con otros países?',
            '📊 ¿Te interesan las estadísticas?',
            '🗺️ ¿Quieres ver un mapa?',
            '📚 ¿Te interesa la historia del país?'
          ];
        }
        
        if (lowerQuery.includes('sismo') || lowerQuery.includes('terremoto') || lowerQuery.includes('earthquake')) {
          return [
            '🛡️ ¿Quieres consejos de seguridad?',
            '📏 ¿Te interesa saber sobre escalas?',
            '🌍 ¿Quieres información de otros países?',
            '📚 ¿Te gustaría conocer eventos históricos?'
          ];
        }
        
        if (lowerQuery.includes('seguridad') || lowerQuery.includes('safety') || lowerQuery.includes('consejo')) {
          return [
            '🏠 ¿Quieres consejos para tu hogar?',
            '📦 ¿Te interesa el kit de emergencia?',
            '🚨 ¿Quieres saber qué hacer durante?',
            '📋 ¿Necesitas un plan de evacuación?'
          ];
        }
        
        // Sugerencias generales versátiles
        return [
          '💡 ¿Tienes más preguntas sobre este tema?',
          '🧠 ¿Te gustaría que profundice en algo?',
          '🌍 ¿Quieres explorar otros temas relacionados?',
          '😊 ¿Hay algo más en lo que pueda ayudarte?'
        ];
    }
  }

  private getFallbackResponse(userQuery: string): ChatResponse {
    return {
      answer: "😊 ¡Hola! Estoy teniendo algunos problemas técnicos en este momento, pero puedo ayudarte con respuestas básicas. ¿Qué te gustaría saber?",
      suggestions: [
        '🌍 Información sobre países',
        '🛡️ Consejos de seguridad',
        '📏 Escalas de magnitud',
        '💻 ¿O prefieres hablar de programación?'
      ],
      context: 'fallback',
      confidence: 0.3
    };
  }

  // Verificar si OpenAI está disponible
  public isOpenAIReady(): boolean {
    console.log('🔍 Verificando si OpenAI está listo...');
    console.log('🔍 Estado interno:', this.isOpenAIAvailable);
    return this.isOpenAIAvailable;
  }

  // Obtener estado del servicio
  public getStatus(): { 
    isOpenAIReady: boolean; 
    hasHistory: boolean; 
    historyLength: number;
    currentContext: ConversationContext;
    usageStats: {
      totalCalls: number;
      successfulCalls: number;
      failedCalls: number;
      averageResponseTime: number;
    };
  } {
    console.log('🔍 getStatus llamado');
    console.log('🔍 isOpenAIAvailable:', this.isOpenAIAvailable);
    console.log('🔍 historial:', this.conversationHistory.length);
    
    const status = {
      isOpenAIReady: this.isOpenAIAvailable,
      hasHistory: this.conversationHistory.length > 0,
      historyLength: this.conversationHistory.length,
      currentContext: this.currentContext,
      usageStats: this.usageStats
    };
    
    console.log('🔍 Estado devuelto:', status);
    return status;
  }

  // Configurar API key dinámicamente
  public setApiKey(apiKey: string): void {
    console.log('🔑 setApiKey llamado con:', apiKey ? 'SÍ' : 'NO');
    console.log('🔑 API key longitud:', apiKey ? apiKey.length : 0);
    console.log('🔑 API key empieza con sk-:', apiKey ? apiKey.startsWith('sk-') : false);
    
    if (apiKey) {
      console.log('✅ API key válida, configurando servicio...');
      this.isOpenAIAvailable = true;
      console.log('✅ OpenAI configurado con nueva API key');
    } else {
      console.warn('⚠️ API key vacía o inválida');
      this.isOpenAIAvailable = false;
    }
  }

  // Limpiar historial
  public clearHistory(): void {
    this.conversationHistory = [];
    console.log('🧹 Historial de conversación limpiado');
  }

  // Cambiar el contexto de conversación
  public setConversationContext(context: Partial<ConversationContext>): void {
    console.log('🔄 setConversationContext llamado con:', context);
    console.log('🔄 Contexto anterior:', this.currentContext);
    
    this.currentContext = { ...this.currentContext, ...context };
    
    console.log('🔄 Contexto actualizado:', this.currentContext);
  }

  // Cambiar el contexto del sistema
  public setSystemContext(context: 'default' | 'seismic_expert' | 'friendly_chat' | 'coder_assistant' | 'philosophical'): void {
    console.log('🔄 setSystemContext llamado con:', context);
    console.log('🔄 Cambiando contexto del sistema a:', context);
    // Esto se aplicará en la próxima llamada a OpenAI
  }

  private updateResponseTime(responseTime: number): void {
    if (this.usageStats.averageResponseTime === 0) {
      this.usageStats.averageResponseTime = responseTime;
    } else {
      this.usageStats.averageResponseTime = (this.usageStats.averageResponseTime + responseTime) / 2;
    }
  }

  // Método para obtener estadísticas detalladas
  public getDetailedStats = (): {
    totalCalls: number;
    successRate: number;
    averageResponseTime: number;
    contextDistribution: Record<string, number>;
    languageDistribution: Record<string, number>;
  } => {
    const contextCounts: Record<string, number> = {};
    const languageCounts: Record<string, number> = {};
    const currentTopic = this.currentContext.topic;
    const currentLanguage = this.currentContext.language;
    const usageStats = this.usageStats;
    
    this.conversationHistory.forEach((msg: {role: string, content: string, timestamp: number}) => {
      if (msg.role === 'user') {
        // Aquí podrías implementar análisis más sofisticado del contexto
        contextCounts[currentTopic] = (contextCounts[currentTopic] || 0) + 1;
        languageCounts[currentLanguage] = (languageCounts[currentLanguage] || 0) + 1;
      }
    });

    return {
      totalCalls: usageStats.totalCalls,
      successRate: usageStats.totalCalls > 0 ? (usageStats.successfulCalls / usageStats.totalCalls) * 100 : 0,
      averageResponseTime: usageStats.averageResponseTime,
      contextDistribution: contextCounts,
      languageDistribution: languageCounts
    };
  }

  // Probar conectividad con OpenAI usando fetch directo
  public async testOpenAIConnectivity(): Promise<{success: boolean, error?: string, response?: any}> {
    console.log('🧪 testOpenAIConnectivity llamado');
    
    try {
      console.log('🔍 Probando conexión directa a OpenAI...');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_CONFIG.API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Hola' }],
          max_tokens: 50
        })
      });

      console.log('📡 Respuesta del servidor:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Conexión exitosa:', data);
        return { success: true, response: data };
      } else {
        const errorData = await response.json();
        console.error('❌ Error del servidor:', response.status, errorData);
        return { success: false, error: `HTTP ${response.status}: ${errorData.error?.message || 'Error desconocido'}` };
      }
    } catch (error) {
      console.error('❌ Error de red:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error de red' };
    }
  }

  // Probar diferentes endpoints de OpenAI
  public async testAlternativeEndpoints(): Promise<void> {
    console.log('🔍 Probando endpoints alternativos...');
    
    const endpoints = [
      'https://api.openai.com/v1/chat/completions',
      'https://api.openai.com/v1/models',
      'https://api.openai.com/v1/engines'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 Probando: ${endpoint}`);
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${OPENAI_CONFIG.API_KEY}`
          }
        });
        console.log(`📡 ${endpoint}: ${response.status} ${response.statusText}`);
      } catch (error) {
        console.error(`❌ ${endpoint}:`, error);
      }
    }
  }
}

export const intelligentChatbotService = new IntelligentChatbotService();

// Hacer el servicio disponible globalmente para debugging
if (typeof window !== 'undefined') {
  (window as any).intelligentChatbotService = intelligentChatbotService;
  console.log('🌐 Servicio inteligente disponible globalmente para debugging');
} 