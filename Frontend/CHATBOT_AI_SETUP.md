# 🤖 Configuración del Chatbot Inteligente con OpenAI

## 🚀 ¿Qué hemos implementado?

Hemos creado un **sistema híbrido de chatbots** que combina:

1. **🤖 Chatbot Simple**: Respuestas predefinidas (funciona sin configuración)
2. **🧠 Chatbot Inteligente**: Usa OpenAI para respuestas dinámicas e inteligentes
3. **🔄 Chatbot Híbrido**: Automáticamente elige el mejor modo disponible

## 📋 Requisitos

- **Node.js** 16+ 
- **npm** o **yarn**
- **API Key de OpenAI** (opcional, para modo inteligente)

## 🔑 Configuración de OpenAI

### 1. Obtener API Key
1. Ve a [OpenAI Platform](https://platform.openai.com/)
2. Crea una cuenta o inicia sesión
3. Ve a "API Keys" en el menú
4. Crea una nueva API key
5. **⚠️ IMPORTANTE**: Guarda la key de forma segura

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `Frontend/`:

```env
# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-tu_api_key_aqui

# Alternative (for compatibility)
REACT_APP_OPENAI_API_KEY=sk-tu_api_key_aqui
```

### 3. Instalar Dependencias

```bash
cd Frontend/
npm install openai
```

## 🎯 Cómo Usar

### Importar el Servicio

```typescript
import { hybridChatbotService } from './services/hybridChatbotService';

// Usar el chatbot
const response = await hybridChatbotService.processQuery('Hola, ¿cómo estás?');
console.log(response.answer);
console.log(response.suggestions);
```

### Cambiar Modo del Chatbot

```typescript
// Modo automático (recomendado)
hybridChatbotService.setMode('auto');

// Solo modo básico
hybridChatbotService.setMode('simple');

// Solo modo inteligente
hybridChatbotService.setMode('intelligent');
```

### Configurar API Key Dinámicamente

```typescript
// Si quieres cambiar la API key en tiempo de ejecución
hybridChatbotService.setApiKey('nueva_api_key');
```

## 🔍 Verificar Estado

```typescript
// Ver estado del servicio
const status = hybridChatbotService.getStatus();
console.log('Modo actual:', status.currentMode);
console.log('IA disponible:', status.intelligentAvailable);

// Probar conexión con OpenAI
const isConnected = await hybridChatbotService.testOpenAIConnection();
console.log('Conectado a OpenAI:', isConnected);
```

## 💰 Costos de OpenAI

- **GPT-3.5-turbo**: ~$0.002 por 1K tokens
- **1 conversación típica**: ~$0.01-0.05
- **Uso moderado**: ~$5-20 por mes

## 🛠️ Solución de Problemas

### Error: "Cannot find module 'openai'"
```bash
npm install openai
```

### Error: "API key not found"
- Verifica que el archivo `.env` existe
- Verifica que `VITE_OPENAI_API_KEY` está configurado
- Reinicia el servidor de desarrollo

### Error: "OpenAI API error"
- Verifica que la API key es válida
- Verifica que tienes créditos en tu cuenta de OpenAI
- Verifica que no excediste los límites de rate

### Chatbot no responde
- Verifica la consola del navegador
- El chatbot automáticamente usa modo básico si falla la IA
- Usa `hybridChatbotService.getStatus()` para diagnosticar

## 🎨 Personalización

### Cambiar Contexto del Sistema

```typescript
// En intelligentChatbotService.ts
const systemMessage = {
  role: "system",
  content: "Tu personalización aquí..."
};
```

### Agregar Nuevas Sugerencias

```typescript
// En intelligentChatbotService.ts
private generateSmartSuggestions(userQuery: string, aiResponse: string): string[] {
  // Tu lógica personalizada aquí
}
```

## 📱 Integración con Componentes React

```typescript
import React, { useState } from 'react';
import { hybridChatbotService } from './services/hybridChatbotService';

function ChatbotComponent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    try {
      const response = await hybridChatbotService.processQuery(input);
      
      setMessages(prev => [...prev, 
        { type: 'user', content: input },
        { type: 'bot', content: response.answer, suggestions: response.suggestions }
      ]);
      
      setInput('');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      {/* Tu UI aquí */}
    </div>
  );
}
```

## 🚀 Próximos Pasos

1. **Configura tu API key** de OpenAI
2. **Prueba el chatbot** en modo automático
3. **Personaliza las respuestas** según tus necesidades
4. **Monitorea el uso** y costos de la API
5. **Implementa en tu UI** existente

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador
2. Verifica la configuración de variables de entorno
3. Prueba con el modo básico primero
4. Verifica tu conexión a internet

---

**¡Tu chatbot ahora es tan inteligente como ChatGPT! 🎉** 