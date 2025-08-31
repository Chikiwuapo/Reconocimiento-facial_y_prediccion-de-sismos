// Archivo de índice para importar todos los servicios
// Esto asegura que todos los servicios se carguen correctamente

export { simpleChatbotService } from './simpleChatbotService';
export { hybridChatbotService } from './hybridChatbotService';
export { intelligentChatbotService } from './intelligentChatbotService';
export { superIntelligentChatbotService } from './superIntelligentChatbotService';

// Hacer todos los servicios disponibles globalmente para debugging
if (typeof window !== 'undefined') {
  import('./simpleChatbotService').then(({ simpleChatbotService }) => {
    (window as any).simpleChatbotService = simpleChatbotService;
  });
  
  import('./hybridChatbotService').then(({ hybridChatbotService }) => {
    (window as any).hybridChatbotService = hybridChatbotService;
  });
  
  import('./intelligentChatbotService').then(({ intelligentChatbotService }) => {
    (window as any).intelligentChatbotService = intelligentChatbotService;
  });
  
  import('./superIntelligentChatbotService').then(({ superIntelligentChatbotService }) => {
    (window as any).superIntelligentChatbotService = superIntelligentChatbotService;
  });
  
  import('../config/openai').then(({ OPENAI_CONFIG }) => {
    (window as any).OPENAI_CONFIG = OPENAI_CONFIG;
  });
  
  console.log('🌐 Todos los servicios importados y disponibles globalmente');
} 