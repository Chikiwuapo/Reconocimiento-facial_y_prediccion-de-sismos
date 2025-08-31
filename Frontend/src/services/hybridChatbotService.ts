import { simpleChatbotService } from './simpleChatbotService';
import { intelligentChatbotService } from './intelligentChatbotService';
import { OPENAI_CONFIG } from '../config/openai';

export interface ChatResponse {
  answer: string;
  suggestions: string[];
  context?: string;
  confidence?: number;
}

export interface ChatbotMode {
  mode: 'simple' | 'intelligent' | 'auto' | 'expert' | 'casual' | 'programming' | 'philosophical';
  description: string;
  icon: string;
}

class HybridChatbotService {
  private currentMode: 'simple' | 'intelligent' | 'auto' | 'expert' | 'casual' | 'programming' | 'philosophical' = 'auto';
  private fallbackToSimple: boolean = false;
  private modeHistory: Array<{mode: string, timestamp: number, success: boolean}> = [];

  // Modos disponibles mejorados
  public readonly modes: ChatbotMode[] = [
    {
      mode: 'simple',
      description: '🤖 Chatbot básico con respuestas predefinidas',
      icon: '🤖'
    },
    {
      mode: 'intelligent',
      description: '🧠 Chatbot inteligente con OpenAI (máxima inteligencia)',
      icon: '🧠'
    },
    {
      mode: 'auto',
      description: '🔄 Automático: usa IA si está disponible, sino básico',
      icon: '🔄'
    },
    {
      mode: 'expert',
      description: '👨‍🔬 Modo experto: respuestas técnicas y detalladas',
      icon: '👨‍🔬'
    },
    {
      mode: 'casual',
      description: '😊 Modo casual: conversaciones amigables y divertidas',
      icon: '😊'
    },
    {
      mode: 'programming',
      description: '💻 Modo programación: especializado en código y tecnología',
      icon: '💻'
    },
    {
      mode: 'philosophical',
      description: '🤔 Modo filosófico: análisis profundo y reflexivo',
      icon: '🤔'
    }
  ];

  constructor() {
    console.log('🚀 Inicializando HybridChatbotService...');
    this.checkIntelligentService();
  }

  private async checkIntelligentService(): Promise<void> {
    try {
      console.log('🔍 Verificando servicio inteligente...');
      const status = intelligentChatbotService.getStatus();
      console.log('📊 Estado del servicio inteligente:', status);
      
      if (status.isOpenAIReady) {
        console.log('✅ Servicio inteligente disponible');
        this.fallbackToSimple = false;
      } else {
        console.log('⚠️ Servicio inteligente no disponible, usando básico');
        this.fallbackToSimple = true;
      }
    } catch (error) {
      console.log('❌ Error verificando servicio inteligente:', error);
      this.fallbackToSimple = true;
    }
  }

  public async processQuery(userQuery: string): Promise<ChatResponse> {
    console.log('🤖 Procesando consulta:', userQuery);
    console.log('🎯 Modo actual:', this.currentMode);
    console.log('🔄 Fallback activo:', this.fallbackToSimple);
    
    try {
      console.log('🔍 Seleccionando modo de procesamiento...');
      switch (this.currentMode) {
        case 'simple':
          console.log('🤖 Usando modo simple');
          return this.processWithSimple(userQuery);
        
        case 'intelligent':
          console.log('🧠 Usando modo inteligente');
          return await this.processWithIntelligent(userQuery);
        
        case 'expert':
          console.log('👨‍🔬 Usando modo experto');
          return await this.processWithExpert(userQuery);
        
        case 'casual':
          console.log('😊 Usando modo casual');
          return await this.processWithCasual(userQuery);
        
        case 'programming':
          console.log('💻 Usando modo programación');
          return await this.processWithProgramming(userQuery);
        
        case 'philosophical':
          console.log('🤔 Usando modo filosófico');
          return await this.processWithPhilosophical(userQuery);
        
        case 'auto':
        default:
          console.log('🔄 Usando modo automático');
          return await this.processAuto(userQuery);
      }
    } catch (error) {
      console.error('❌ Error en el servicio híbrido:', error);
      console.log('🔄 Usando fallback simple...');
      return this.processWithSimple(userQuery);
    }
  }

  private processWithSimple(userQuery: string): ChatResponse {
    console.log('🤖 Usando chatbot simple');
    console.log('🔧 Llamando al servicio simple...');
    
    const response = simpleChatbotService.processQuery(userQuery);
    console.log('✅ Respuesta simple exitosa:', response);
    
    this.recordModeUsage('simple', true);
    return response;
  }

  private async processWithIntelligent(userQuery: string): Promise<ChatResponse> {
    console.log('🧠 Usando chatbot inteligente');
    try {
      console.log('🔧 Llamando al servicio inteligente...');
      const response = await intelligentChatbotService.processQuery(userQuery);
      console.log('✅ Respuesta inteligente exitosa:', response);
      this.recordModeUsage('intelligent', true);
      return response;
    } catch (error) {
      console.warn('⚠️ IA falló, usando básico:', error);
      this.recordModeUsage('intelligent', false);
      return this.processWithSimple(userQuery);
    }
  }

  private async processWithExpert(userQuery: string): Promise<ChatResponse> {
    console.log('👨‍🔬 Usando modo experto');
    try {
      console.log('🔧 Configurando contexto para modo experto...');
      intelligentChatbotService.setConversationContext({
        topic: 'seismic',
        depth: 'expert',
        mood: 'professional'
      });
      console.log('🔧 Contexto configurado, procesando consulta...');
      
      const response = await intelligentChatbotService.processQuery(userQuery);
      console.log('✅ Respuesta de modo experto exitosa:', response);
      this.recordModeUsage('expert', true);
      return response;
    } catch (error) {
      console.warn('⚠️ Modo experto falló, usando básico:', error);
      this.recordModeUsage('expert', false);
      return this.processWithSimple(userQuery);
    }
  }

  private async processWithCasual(userQuery: string): Promise<ChatResponse> {
    console.log('😊 Usando modo casual');
    try {
      console.log('🔧 Configurando contexto para modo casual...');
      intelligentChatbotService.setConversationContext({
        topic: 'general',
        depth: 'casual',
        mood: 'casual'
      });
      console.log('🔧 Contexto configurado, procesando consulta...');
      
      const response = await intelligentChatbotService.processQuery(userQuery);
      console.log('✅ Respuesta de modo casual exitosa:', response);
      this.recordModeUsage('casual', true);
      return response;
    } catch (error) {
      console.warn('⚠️ Modo casual falló, usando básico:', error);
      this.recordModeUsage('casual', false);
      return this.processWithSimple(userQuery);
    }
  }

  private async processWithProgramming(userQuery: string): Promise<ChatResponse> {
    console.log('💻 Usando modo programación');
    try {
      console.log('🔧 Configurando contexto para modo programación...');
      intelligentChatbotService.setConversationContext({
        topic: 'programming',
        depth: 'detailed',
        mood: 'professional'
      });
      console.log('🔧 Contexto configurado, procesando consulta...');
      
      const response = await intelligentChatbotService.processQuery(userQuery);
      console.log('✅ Respuesta de modo programación exitosa:', response);
      this.recordModeUsage('programming', true);
      return response;
    } catch (error) {
      console.warn('⚠️ Modo programación falló, usando básico:', error);
      this.recordModeUsage('programming', false);
      return this.processWithSimple(userQuery);
    }
  }

  private async processWithPhilosophical(userQuery: string): Promise<ChatResponse> {
    console.log('🤔 Usando modo filosófico');
    try {
      console.log('🔧 Configurando contexto para modo filosófico...');
      intelligentChatbotService.setConversationContext({
        topic: 'philosophical',
        depth: 'expert',
        mood: 'friendly'
      });
      console.log('🔧 Contexto configurado, procesando consulta...');
      
      const response = await intelligentChatbotService.processQuery(userQuery);
      console.log('✅ Respuesta de modo filosófico exitosa:', response);
      this.recordModeUsage('philosophical', true);
      return response;
    } catch (error) {
      console.warn('⚠️ Modo filosófico falló, usando básico:', error);
      this.recordModeUsage('philosophical', false);
      return this.processWithSimple(userQuery);
    }
  }

  private async processAuto(userQuery: string): Promise<ChatResponse> {
    console.log('🔄 Procesando en modo automático...');
    
    // Verificar si el servicio inteligente está disponible
    console.log('🔍 Verificando disponibilidad del servicio inteligente...');
    const isIntelligentReady = intelligentChatbotService.isOpenAIReady();
    console.log('🔍 Servicio inteligente listo:', isIntelligentReady);
    console.log('🔍 Fallback activo:', this.fallbackToSimple);
    
    if (isIntelligentReady && !this.fallbackToSimple) {
      try {
        console.log('🧠 Intentando usar IA...');
        const response = await intelligentChatbotService.processQuery(userQuery);
        console.log('✅ Respuesta de IA exitosa');
        this.recordModeUsage('auto', true);
        return response;
      } catch (error) {
        console.warn('⚠️ IA falló, usando básico:', error);
        
        // Detectar si es error de cuota excedida
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('quota') || errorMessage.includes('429')) {
          console.log('💰 Error de cuota detectado, activando modo básico automáticamente');
          this.fallbackToSimple = true;
          // Cambiar al modo simple permanentemente
          this.currentMode = 'simple';
        }
        
        this.recordModeUsage('auto', false);
        return this.processWithSimple(userQuery);
      }
    } else {
      console.log('🤖 Usando chatbot básico (fallback)');
      return this.processWithSimple(userQuery);
    }
  }

  private recordModeUsage(mode: string, success: boolean): void {
    console.log('📝 recordModeUsage llamado con:', mode, 'success:', success);
    console.log('📝 Historial antes:', this.modeHistory.length);
    
    this.modeHistory.push({
      mode,
      timestamp: Date.now(),
      success
    });
    
    console.log('📝 Historial después:', this.modeHistory.length);
    
    // Mantener solo los últimos 100 registros
    if (this.modeHistory.length > 100) {
      console.log('📝 Limpiando historial antiguo...');
      this.modeHistory = this.modeHistory.slice(-100);
      console.log('📝 Historial después de limpieza:', this.modeHistory.length);
    }
  }

  // Cambiar modo del chatbot
  public setMode(mode: 'simple' | 'intelligent' | 'auto' | 'expert' | 'casual' | 'programming' | 'philosophical'): void {
    console.log('🔄 setMode llamado con:', mode);
    console.log('🔍 Modo anterior:', this.currentMode);
    
    this.currentMode = mode;
    console.log(`🔄 Cambiando modo a: ${mode}`);
    
    if (mode === 'intelligent' || mode === 'expert' || mode === 'casual' || mode === 'programming' || mode === 'philosophical') {
      console.log('🔍 Verificando servicio inteligente para modo:', mode);
      this.checkIntelligentService();
    } else {
      console.log('🔍 Modo simple, no necesita verificación de servicio inteligente');
    }
  }

  // Obtener modo actual
  public getCurrentMode(): ChatbotMode {
    console.log('🔍 getCurrentMode llamado');
    console.log('🔍 Modo actual:', this.currentMode);
    
    const foundMode = this.modes.find(m => m.mode === this.currentMode);
    console.log('🔍 Modo encontrado:', foundMode);
    
    const result = foundMode || this.modes[2]!;
    console.log('🔍 Modo devuelto:', result);
    
    return result;
  }

  // Obtener estado del servicio
  public getStatus(): {
    currentMode: string;
    intelligentAvailable: boolean;
    fallbackActive: boolean;
    simpleAvailable: boolean;
    modeHistory: Array<{mode: string, timestamp: number, success: boolean}>;
  } {
    console.log('🔍 getStatus llamado');
    console.log('🔍 Modo actual:', this.currentMode);
    console.log('🔍 Fallback activo:', this.fallbackToSimple);
    
    const status = {
      currentMode: this.currentMode,
      intelligentAvailable: intelligentChatbotService.isOpenAIReady(),
      fallbackActive: this.fallbackToSimple,
      simpleAvailable: true,
      modeHistory: this.modeHistory
    };
    
    console.log('🔍 Estado devuelto:', status);
    return status;
  }

  // Configurar API key para el servicio inteligente
  public setApiKey(apiKey: string): void {
    console.log('🔑 setApiKey llamado con:', apiKey ? 'SÍ' : 'NO');
    console.log('🔑 API key longitud:', apiKey ? apiKey.length : 0);
    console.log('🔑 API key empieza con sk-:', apiKey ? apiKey.startsWith('sk-') : false);
    
    console.log('🔑 Configurando API key en el servicio inteligente...');
    intelligentChatbotService.setApiKey(apiKey);
    
    this.fallbackToSimple = false;
    console.log('🔑 API key configurada, fallback desactivado');
  }

  // Limpiar historial
  public clearHistory(): void {
    console.log('🧹 clearHistory llamado');
    console.log('🧹 Limpiando historial del servicio inteligente...');
    intelligentChatbotService.clearHistory();
    
    console.log('🧹 Limpiando historial del modo...');
    this.modeHistory = [];
    
    console.log('🧹 Historial limpiado');
  }

  // Obtener estadísticas de uso
  public getUsageStats(): {
    mode: string;
    intelligentCalls: number;
    simpleCalls: number;
    totalCalls: number;
    modeSuccessRates: Record<string, number>;
    averageResponseTime: number;
  } {
    console.log('📊 getUsageStats llamado');
    console.log('🔍 Historial disponible:', this.modeHistory.length);
    
    const intelligentCalls = this.modeHistory.filter(h => h.mode === 'intelligent' || h.mode === 'expert' || h.mode === 'casual' || h.mode === 'programming' || h.mode === 'philosophical').length;
    const simpleCalls = this.modeHistory.filter(h => h.mode === 'simple').length;
    const totalCalls = this.modeHistory.length;

    console.log('🔍 Llamadas inteligentes:', intelligentCalls);
    console.log('🔍 Llamadas simples:', simpleCalls);
    console.log('🔍 Total de llamadas:', totalCalls);

    // Calcular tasas de éxito por modo
    const modeSuccessRates: Record<string, number> = {};
    this.modes.forEach(mode => {
      const modeHistory = this.modeHistory.filter(h => h.mode === mode.mode);
      if (modeHistory.length > 0) {
        const successCount = modeHistory.filter(h => h.success).length;
        modeSuccessRates[mode.mode] = (successCount / modeHistory.length) * 100;
      }
    });

    console.log('🔍 Tasas de éxito por modo:', modeSuccessRates);

    // Obtener estadísticas del servicio inteligente
    const intelligentStats = intelligentChatbotService.getDetailedStats();
    console.log('🔍 Estadísticas del servicio inteligente:', intelligentStats);

    const stats = {
      mode: this.currentMode,
      intelligentCalls,
      simpleCalls,
      totalCalls,
      modeSuccessRates,
      averageResponseTime: intelligentStats.averageResponseTime
    };

    console.log('📊 Estadísticas devueltas:', stats);
    return stats;
  }

  // Probar conectividad con OpenAI
  public async testOpenAIConnection(): Promise<boolean> {
    console.log('🧪 testOpenAIConnection llamado');
    try {
      console.log('🔍 Verificando si OpenAI está listo...');
      const isReady = intelligentChatbotService.isOpenAIReady();
      console.log('🔍 OpenAI está listo:', isReady);
      
      if (isReady) {
        console.log('🧪 Probando conexión con OpenAI...');
        const testResponse = await intelligentChatbotService.processQuery('Hola');
        console.log('✅ Respuesta de prueba:', testResponse);
        return testResponse.answer.length > 0;
      } else {
        console.log('⚠️ OpenAI no está listo');
        return false;
      }
    } catch (error) {
      console.error('❌ Error probando conexión OpenAI:', error);
      return false;
    }
  }

  // Obtener recomendación de modo basada en el historial
  public getRecommendedMode(): string {
    console.log('🔍 getRecommendedMode llamado');
    console.log('🔍 Historial disponible:', this.modeHistory.length);
    
    if (this.modeHistory.length === 0) {
      console.log('🔍 Sin historial, usando modo auto por defecto');
      return 'auto';
    }

    // Analizar el historial para recomendar el mejor modo
    const modeStats: Record<string, {count: number, successRate: number}> = {};
    
    this.modes.forEach(mode => {
      const modeHistory = this.modeHistory.filter(h => h.mode === mode.mode);
      if (modeHistory.length > 0) {
        const successCount = modeHistory.filter(h => h.success).length;
        modeStats[mode.mode] = {
          count: modeHistory.length,
          successRate: (successCount / modeHistory.length) * 100
        };
      }
    });

    console.log('🔍 Estadísticas por modo:', modeStats);

    // Recomendar el modo con mejor tasa de éxito y más uso
    let bestMode = 'auto';
    let bestScore = 0;

    Object.entries(modeStats).forEach(([mode, stats]) => {
      const score = stats.successRate * (stats.count / 10); // Factor de uso
      console.log(`🔍 Modo ${mode}: score = ${score}`);
      if (score > bestScore) {
        bestScore = score;
        bestMode = mode;
      }
    });

    console.log('🔍 Mejor modo recomendado:', bestMode, 'con score:', bestScore);
    return bestMode;
  }

  // Cambiar automáticamente al modo recomendado
  public autoOptimizeMode(): void {
    console.log('🔄 autoOptimizeMode llamado');
    console.log('🔍 Modo actual:', this.currentMode);
    
    const recommendedMode = this.getRecommendedMode();
    console.log('🔍 Modo recomendado:', recommendedMode);
    
    if (recommendedMode !== this.currentMode) {
      console.log(`🔄 Optimizando automáticamente al modo: ${recommendedMode}`);
      this.setMode(recommendedMode as any);
    } else {
      console.log('✅ Ya estás en el modo óptimo');
    }
  }
}

export const hybridChatbotService = new HybridChatbotService();

// Hacer el servicio disponible globalmente para debugging
if (typeof window !== 'undefined') {
  (window as any).hybridChatbotService = hybridChatbotService;
  (window as any).intelligentChatbotService = intelligentChatbotService;
  (window as any).OPENAI_CONFIG = OPENAI_CONFIG;
  console.log('🌐 Servicios disponibles globalmente para debugging');
} 