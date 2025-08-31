import { hybridChatbotService } from './hybridChatbotService';
import { intelligentChatbotService } from './intelligentChatbotService';

export interface SuperIntelligentResponse extends ChatResponse {
  context: string;
  confidence: number;
  mode: string;
  suggestions: string[];
  followUpQuestions?: string[];
  relatedTopics?: string[];
  complexity: 'basic' | 'intermediate' | 'advanced' | 'expert';
}

export interface ChatResponse {
  answer: string;
  suggestions: string[];
  context?: string;
  confidence?: number;
}

export interface TopicAnalysis {
  primaryTopic: string;
  secondaryTopics: string[];
  complexity: 'basic' | 'intermediate' | 'advanced' | 'expert';
  language: 'es' | 'en';
  requiresExpertise: boolean;
  emotionalTone: 'neutral' | 'positive' | 'negative' | 'curious' | 'concerned';
}

class SuperIntelligentChatbotService {
  private conversationMemory: Array<{
    query: string;
    response: string;
    context: string;
    timestamp: number;
    userSatisfaction?: number;
  }> = [];
  
  private topicExpertise: Record<string, number> = {
    'seismic': 0.95,
    'programming': 0.90,
    'philosophy': 0.88,
    'science': 0.92,
    'technology': 0.89,
    'history': 0.85,
    'arts': 0.82,
    'mathematics': 0.91,
    'literature': 0.84,
    'psychology': 0.86
  };

  private adaptiveLearning: {
    userPreferences: Record<string, number>;
    successfulTopics: string[];
    failedTopics: string[];
    averageResponseTime: number;
  } = {
    userPreferences: {},
    successfulTopics: [],
    failedTopics: [],
    averageResponseTime: 0
  };

  constructor() {
    this.initializeService();
  }

  private initializeService(): void {
    console.log('🚀 Inicializando Chatbot Súper Inteligente...');
    this.loadUserPreferences();
    this.analyzeServiceCapabilities();
  }

  private loadUserPreferences(): void {
    try {
      const saved = localStorage.getItem('chatbot_user_preferences');
      if (saved) {
        this.adaptiveLearning.userPreferences = JSON.parse(saved);
        console.log('📚 Preferencias del usuario cargadas');
      }
    } catch (error) {
      console.log('⚠️ No se pudieron cargar las preferencias del usuario');
    }
  }

  private saveUserPreferences(): void {
    try {
      localStorage.setItem('chatbot_user_preferences', JSON.stringify(this.adaptiveLearning.userPreferences));
    } catch (error) {
      console.log('⚠️ No se pudieron guardar las preferencias del usuario');
    }
  }

  private analyzeServiceCapabilities(): void {
    const status = hybridChatbotService.getStatus();
    console.log('🔍 Analizando capacidades del servicio:', status);
    
    if (status.intelligentAvailable) {
      console.log('✅ Servicios inteligentes disponibles');
    } else {
      console.log('⚠️ Solo servicios básicos disponibles');
    }
  }

  public async processQuery(userQuery: string): Promise<SuperIntelligentResponse> {
    const startTime = Date.now();
    
    try {
      // 1. Analizar la consulta del usuario
      const analysis = this.analyzeUserQuery(userQuery);
      
      // 2. Seleccionar el mejor modo de respuesta
      const selectedMode = this.selectOptimalMode(analysis);
      
      // 3. Procesar la consulta con el modo seleccionado
      const response = await this.processWithSelectedMode(userQuery, selectedMode, analysis);
      
      // 4. Mejorar la respuesta con contexto y sugerencias
      const enhancedResponse = this.enhanceResponse(response, analysis, selectedMode);
      
      // 5. Aprender de la interacción
      this.learnFromInteraction(userQuery, enhancedResponse, analysis);
      
      // 6. Actualizar estadísticas
      this.updateResponseTime(Date.now() - startTime);
      
      return enhancedResponse;
      
    } catch (error) {
      console.error('❌ Error en el servicio súper inteligente:', error);
      return this.getFallbackResponse(userQuery);
    }
  }

  private analyzeUserQuery(query: string): TopicAnalysis {
    const lowerQuery = query.toLowerCase();
    
    // Detectar idioma
    const language = this.detectLanguage(lowerQuery);
    
    // Detectar tema principal
    const primaryTopic = this.detectPrimaryTopic(lowerQuery);
    
    // Detectar temas secundarios
    const secondaryTopics = this.detectSecondaryTopics(lowerQuery);
    
    // Analizar complejidad
    const complexity = this.analyzeComplexity(lowerQuery);
    
    // Detectar si requiere expertise
    const requiresExpertise = this.requiresExpertise(lowerQuery, primaryTopic);
    
    // Analizar tono emocional
    const emotionalTone = this.analyzeEmotionalTone(lowerQuery);
    
    return {
      primaryTopic,
      secondaryTopics,
      complexity,
      language,
      requiresExpertise,
      emotionalTone
    };
  }

  private detectLanguage(query: string): 'es' | 'en' {
    const englishWords = ['what', 'how', 'why', 'when', 'where', 'who', 'which', 'the', 'and', 'or', 'but'];
    const spanishWords = ['qué', 'cómo', 'por qué', 'cuándo', 'dónde', 'quién', 'cuál', 'el', 'la', 'y', 'o', 'pero'];
    
    const englishCount = englishWords.filter(word => query.includes(word)).length;
    const spanishCount = spanishWords.filter(word => query.includes(word)).length;
    
    return englishCount > spanishCount ? 'en' : 'es';
  }

  private detectPrimaryTopic(query: string): string {
    const topicKeywords: Record<string, string[]> = {
      'seismic': ['sismo', 'terremoto', 'earthquake', 'temblor', 'tectónica', 'placa'],
      'programming': ['código', 'programa', 'code', 'program', 'software', 'desarrollo'],
      'philosophy': ['filosofía', 'pensar', 'think', 'existencia', 'significado', 'ética'],
      'science': ['ciencia', 'científico', 'investigación', 'experimento', 'método'],
      'technology': ['tecnología', 'tecnológico', 'innovación', 'digital', 'futuro'],
      'history': ['historia', 'histórico', 'pasado', 'antiguo', 'civilización'],
      'arts': ['arte', 'artístico', 'creatividad', 'expresión', 'cultura'],
      'mathematics': ['matemáticas', 'matemático', 'cálculo', 'números', 'ecuación'],
      'literature': ['literatura', 'libro', 'escritura', 'autor', 'poesía'],
      'psychology': ['psicología', 'mente', 'comportamiento', 'emoción', 'personalidad']
    };

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => query.includes(keyword))) {
        return topic;
      }
    }
    
    return 'general';
  }

  private detectSecondaryTopics(query: string): string[] {
    const secondaryTopics: string[] = [];
    const allTopics = ['seismic', 'programming', 'philosophy', 'science', 'technology', 'history', 'arts', 'mathematics', 'literature', 'psychology'];
    
    allTopics.forEach(topic => {
      if (query.includes(topic) || query.includes(topic.slice(0, 3))) {
        secondaryTopics.push(topic);
      }
    });
    
    return secondaryTopics.slice(0, 3); // Máximo 3 temas secundarios
  }

  private analyzeComplexity(query: string): 'basic' | 'intermediate' | 'advanced' | 'expert' {
    const complexityIndicators = {
      basic: ['qué es', 'what is', 'cómo', 'how', 'cuándo', 'when'],
      intermediate: ['explica', 'explain', 'por qué', 'why', 'diferencias', 'differences'],
      advanced: ['análisis', 'analysis', 'investigación', 'research', 'teoría', 'theory'],
      expert: ['metodología', 'methodology', 'algoritmo', 'algorithm', 'paradigma', 'paradigm']
    };

    for (const [level, indicators] of Object.entries(complexityIndicators)) {
      if (indicators.some(indicator => query.includes(indicator))) {
        return level as any;
      }
    }
    
    return 'basic';
  }

  private requiresExpertise(query: string, topic: string): boolean {
    const expertKeywords = ['investigación', 'research', 'análisis', 'analysis', 'teoría', 'theory', 'metodología', 'methodology'];
    return expertKeywords.some(keyword => query.includes(keyword)) || this.topicExpertise[topic] > 0.9;
  }

  private analyzeEmotionalTone(query: string): 'neutral' | 'positive' | 'negative' | 'curious' | 'concerned' {
    const toneKeywords = {
      positive: ['me gusta', 'like', 'interesante', 'interesting', 'genial', 'great'],
      negative: ['no me gusta', 'dislike', 'problema', 'problem', 'difícil', 'difficult'],
      curious: ['curioso', 'curious', 'pregunta', 'question', 'duda', 'doubt'],
      concerned: ['preocupado', 'worried', 'miedo', 'fear', 'peligro', 'danger']
    };

    for (const [tone, keywords] of Object.entries(toneKeywords)) {
      if (keywords.some(keyword => query.includes(keyword))) {
        return tone as any;
      }
    }
    
    return 'neutral';
  }

  private selectOptimalMode(analysis: TopicAnalysis): string {
    // Si requiere expertise y tenemos servicios inteligentes disponibles
    if (analysis.requiresExpertise && hybridChatbotService.getStatus().intelligentAvailable) {
      if (analysis.primaryTopic === 'programming') return 'programming';
      if (analysis.primaryTopic === 'philosophy') return 'philosophical';
      if (analysis.complexity === 'expert') return 'expert';
      return 'intelligent';
    }
    
    // Si es un tema casual
    if (analysis.emotionalTone === 'curious' && analysis.complexity === 'basic') {
      return 'casual';
    }
    
    // Si es un tema técnico
    if (analysis.complexity === 'advanced' || analysis.complexity === 'expert') {
      return 'expert';
    }
    
    // Por defecto, usar modo automático
    return 'auto';
  }

  private async processWithSelectedMode(query: string, mode: string, analysis: TopicAnalysis): Promise<ChatResponse> {
    // Configurar el contexto apropiado
    if (mode !== 'simple' && mode !== 'auto') {
      intelligentChatbotService.setConversationContext({
        topic: analysis.primaryTopic,
        depth: analysis.complexity === 'expert' ? 'expert' : analysis.complexity === 'advanced' ? 'detailed' : 'casual',
        language: analysis.language,
        mood: analysis.emotionalTone === 'concerned' ? 'professional' : 'friendly'
      });
    }
    
    // Procesar con el modo seleccionado
    return await hybridChatbotService.processQuery(query);
  }

  private enhanceResponse(response: ChatResponse, analysis: TopicAnalysis, mode: string): SuperIntelligentResponse {
    // Generar preguntas de seguimiento
    const followUpQuestions = this.generateFollowUpQuestions(analysis);
    
    // Generar temas relacionados
    const relatedTopics = this.generateRelatedTopics(analysis);
    
    // Calcular confianza basada en expertise y modo
    const confidence = this.calculateConfidence(analysis, mode);
    
    return {
      ...response,
      context: analysis.primaryTopic,
      confidence,
      mode,
      suggestions: response.suggestions || [],
      followUpQuestions,
      relatedTopics,
      complexity: analysis.complexity
    };
  }

  private generateFollowUpQuestions(analysis: TopicAnalysis): string[] {
    const followUps: string[] = [];
    
    if (analysis.complexity === 'basic') {
      followUps.push(`¿Te gustaría que profundice en ${analysis.primaryTopic}?`);
      followUps.push(`¿Hay algún aspecto específico que te interese más?`);
    } else if (analysis.complexity === 'intermediate') {
      followUps.push(`¿Quieres que te explique más sobre ${analysis.primaryTopic}?`);
      followUps.push(`¿Te gustaría ver ejemplos prácticos?`);
    } else if (analysis.complexity === 'advanced') {
      followUps.push(`¿Quieres que profundice en la metodología?`);
      followUps.push(`¿Te interesa conocer las últimas investigaciones?`);
    }
    
    return followUps.slice(0, 2);
  }

  private generateRelatedTopics(analysis: TopicAnalysis): string[] {
    const relatedTopicsMap: Record<string, string[]> = {
      'seismic': ['geología', 'geofísica', 'ingeniería sísmica', 'prevención'],
      'programming': ['algoritmos', 'estructuras de datos', 'arquitectura de software', 'testing'],
      'philosophy': ['ética', 'lógica', 'metafísica', 'epistemología'],
      'science': ['método científico', 'investigación', 'estadísticas', 'publicaciones'],
      'technology': ['innovación', 'futuro', 'impacto social', 'sostenibilidad']
    };
    
    return relatedTopicsMap[analysis.primaryTopic] || ['conocimiento general', 'aprendizaje', 'investigación'];
  }

  private calculateConfidence(analysis: TopicAnalysis, mode: string): number {
    let baseConfidence = this.topicExpertise[analysis.primaryTopic] || 0.7;
    
    // Ajustar por modo
    if (mode === 'expert') baseConfidence += 0.1;
    if (mode === 'intelligent') baseConfidence += 0.05;
    if (mode === 'simple') baseConfidence -= 0.1;
    
    // Ajustar por complejidad
    if (analysis.complexity === 'expert') baseConfidence -= 0.05;
    if (analysis.complexity === 'basic') baseConfidence += 0.05;
    
    return Math.min(Math.max(baseConfidence, 0.1), 1.0);
  }

  private learnFromInteraction(query: string, response: SuperIntelligentResponse, analysis: TopicAnalysis): void {
    // Actualizar preferencias del usuario
    this.adaptiveLearning.userPreferences[analysis.primaryTopic] = 
      (this.adaptiveLearning.userPreferences[analysis.primaryTopic] || 0) + 0.1;
    
    // Registrar temas exitosos/fallidos
    if (response.confidence > 0.8) {
      this.adaptiveLearning.successfulTopics.push(analysis.primaryTopic);
    } else {
      this.adaptiveLearning.failedTopics.push(analysis.primaryTopic);
    }
    
    // Mantener solo los últimos 50 temas
    this.adaptiveLearning.successfulTopics = this.adaptiveLearning.successfulTopics.slice(-50);
    this.adaptiveLearning.failedTopics = this.adaptiveLearning.failedTopics.slice(-50);
    
    // Guardar preferencias
    this.saveUserPreferences();
  }

  private updateResponseTime(responseTime: number): void {
    if (this.adaptiveLearning.averageResponseTime === 0) {
      this.adaptiveLearning.averageResponseTime = responseTime;
    } else {
      this.adaptiveLearning.averageResponseTime = (this.adaptiveLearning.averageResponseTime + responseTime) / 2;
    }
  }

  private getFallbackResponse(query: string): SuperIntelligentResponse {
    return {
      answer: "😊 ¡Hola! Estoy teniendo algunos problemas técnicos en este momento, pero puedo ayudarte con respuestas básicas. ¿Qué te gustaría saber?",
      suggestions: [
        '🌍 Información sobre países',
        '🛡️ Consejos de seguridad',
        '📏 Escalas de magnitud',
        '💻 ¿O prefieres hablar de programación?'
      ],
      context: 'fallback',
      confidence: 0.3,
      mode: 'simple',
      followUpQuestions: ['¿En qué puedo ayudarte?', '¿Tienes alguna pregunta específica?'],
      relatedTopics: ['conocimiento general', 'ayuda básica'],
      complexity: 'basic'
    };
  }

  // Métodos públicos para gestión del servicio
  public getServiceStatus(): {
    isAvailable: boolean;
    intelligentAvailable: boolean;
    userPreferences: Record<string, number>;
    successfulTopics: string[];
    averageResponseTime: number;
    topicExpertise: Record<string, number>;
  } {
    return {
      isAvailable: true,
      intelligentAvailable: hybridChatbotService.getStatus().intelligentAvailable,
      userPreferences: this.adaptiveLearning.userPreferences,
      successfulTopics: this.adaptiveLearning.successfulTopics,
      averageResponseTime: this.adaptiveLearning.averageResponseTime,
      topicExpertise: this.topicExpertise
    };
  }

  public getRecommendedTopics(): string[] {
    const sortedTopics = Object.entries(this.adaptiveLearning.userPreferences)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);
    
    return sortedTopics;
  }

  public clearMemory(): void {
    this.conversationMemory = [];
    this.adaptiveLearning.userPreferences = {};
    this.adaptiveLearning.successfulTopics = [];
    this.adaptiveLearning.failedTopics = [];
    this.saveUserPreferences();
    console.log('🧹 Memoria del chatbot limpiada');
  }

  public setTopicExpertise(topic: string, expertise: number): void {
    this.topicExpertise[topic] = Math.min(Math.max(expertise, 0), 1);
    console.log(`🎯 Expertise en ${topic} actualizado a: ${expertise}`);
  }
}

export const superIntelligentChatbotService = new SuperIntelligentChatbotService(); 