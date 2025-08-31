# 🚀 Configuración de OpenAI para el Chatbot Inteligente

## 📋 Requisitos Previos

Para que tu chatbot sea súper inteligente como yo, necesitas:

1. **Cuenta en OpenAI**: Regístrate en [https://platform.openai.com](https://platform.openai.com)
2. **API Key**: Genera una API key en tu dashboard de OpenAI
3. **Créditos**: Asegúrate de tener créditos disponibles (OpenAI cobra por uso)

## 🔑 Configuración de la API Key

### Opción 1: Archivo .env (Recomendado)

1. Crea un archivo `.env` en la carpeta `Frontend/`
2. Agrega tu API key:

```bash
# .env
VITE_OPENAI_API_KEY=sk-tu_api_key_aqui
```

### Opción 2: Variables de Entorno del Sistema

```bash
# Windows (PowerShell)
$env:VITE_OPENAI_API_KEY="sk-tu_api_key_aqui"

# Windows (CMD)
set VITE_OPENAI_API_KEY=sk-tu_api_key_aqui

# Linux/Mac
export VITE_OPENAI_API_KEY="sk-tu_api_key_aqui"
```

## ⚙️ Configuración Avanzada

### Modelo de IA
- **GPT-4**: Máxima inteligencia (más costoso)
- **GPT-3.5-turbo**: Buena inteligencia (más económico)

### Parámetros de Respuesta
- **Temperatura**: 0.8 (creativo pero coherente)
- **Tokens máximos**: 1000 (respuestas detalladas)
- **Presencia**: 0.1 (evita repeticiones)

## 🧪 Prueba de Configuración

1. Inicia tu aplicación
2. Abre la consola del navegador
3. Deberías ver: "✅ OpenAI configurado correctamente"
4. Prueba el chatbot con una pregunta compleja

## 💰 Costos Estimados

- **GPT-4**: ~$0.03 por 1K tokens
- **GPT-3.5-turbo**: ~$0.002 por 1K tokens
- **Conversación típica**: 2-5 centavos por chat

## 🚨 Solución de Problemas

### Error: "API key no encontrada"
- Verifica que el archivo `.env` esté en la carpeta correcta
- Reinicia tu aplicación después de crear el archivo
- Verifica que no haya espacios extra en la API key

### Error: "No se pudo crear el cliente OpenAI"
- Verifica que tu API key sea válida
- Asegúrate de tener créditos disponibles
- Revisa la consola para más detalles

### Error: "Rate limit exceeded"
- Espera unos minutos antes de hacer más preguntas
- Considera usar GPT-3.5-turbo para reducir costos

## 🔒 Seguridad

- **NUNCA** compartas tu API key
- **NUNCA** la subas a GitHub
- Usa variables de entorno para producción
- Considera usar un proxy para mayor seguridad

## 📱 Modos del Chatbot

Una vez configurado, tendrás acceso a:

- 🤖 **Simple**: Respuestas básicas predefinidas
- 🧠 **Inteligente**: Máxima inteligencia con GPT-4
- 🔄 **Automático**: Selección inteligente del mejor modo
- 👨‍🔬 **Experto**: Respuestas técnicas y detalladas
- 😊 **Casual**: Conversaciones amigables
- 💻 **Programación**: Especializado en código
- 🤔 **Filosófico**: Análisis profundo y reflexivo

## 🎯 Próximos Pasos

1. Configura tu API key
2. Prueba diferentes modos del chatbot
3. Personaliza los prompts según tus necesidades
4. Monitorea el uso y costos
5. ¡Disfruta de tu chatbot súper inteligente!

---

**💡 Consejo**: Comienza con GPT-3.5-turbo para probar, luego actualiza a GPT-4 para máxima inteligencia. 