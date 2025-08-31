# 🤖 Configuración del Chatbot con Dialogflow

## 📋 Requisitos Previos

- Cuenta de Google Cloud Platform
- Proyecto habilitado para Dialogflow
- Python 3.8+ y pip
- Node.js 16+ y npm

## 🚀 Configuración de Dialogflow

### 1. Crear Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Dialogflow

### 2. Configurar Dialogflow

1. Ve a [Dialogflow Console](https://dialogflow.cloud.google.com/)
2. Crea un nuevo agente
3. Configura el idioma español
4. Crea intents básicos:
   - **Saludo**: "hola", "buenos días", "buenas tardes"
   - **Ayuda**: "ayuda", "ayudame", "qué puedes hacer"
   - **Sismos**: "sismo", "terremoto", "predicción"
   - **Facial**: "reconocimiento facial", "rostro", "cara"

### 3. Obtener Credenciales

1. En Google Cloud Console, ve a "APIs y servicios" > "Credenciales"
2. Crea una nueva clave de API
3. Copia el Project ID y la clave

## ⚙️ Configuración del Backend

### 1. Instalar Dependencias

```bash
cd Backend
pip install -r requirements.txt
```

### 2. Variables de Entorno

Crea un archivo `.env` en la carpeta `Backend`:

```env
DIALOGFLOW_PROJECT_ID=tu-proyecto-id-aqui
DIALOGFLOW_ACCESS_TOKEN=tu-access-token-aqui
SECRET_KEY=tu-secret-key-aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

### 3. Migraciones

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Ejecutar Backend

```bash
python manage.py runserver
```

## 🎨 Configuración del Frontend

### 1. Instalar Dependencias

```bash
cd Frontend
npm install
```

### 2. Configurar URL de la API

En `src/config/config.ts`, verifica que la URL sea correcta:

```typescript
export const API_BASE_URL = 'http://localhost:8000/api';
```

### 3. Ejecutar Frontend

```bash
npm run dev
```

## 🔧 Funcionalidades del Chatbot

### Respuestas Automáticas
- **Saludos**: Respuestas personalizadas
- **Ayuda**: Información sobre funcionalidades
- **Sismos**: Explicaciones sobre predicciones
- **Facial**: Información sobre reconocimiento

### Características
- ✅ Interfaz moderna y responsive
- ✅ Animaciones suaves
- ✅ Historial de conversaciones
- ✅ Indicador de escritura
- ✅ Fallback automático si Dialogflow falla

## 🎯 Uso del Chatbot

1. **Botón Flotante**: Aparece en la esquina inferior derecha
2. **Icono de Tres Puntos**: Animado al hacer hover
3. **Modal del Chat**: Interfaz completa de conversación
4. **Envío de Mensajes**: Enter o botón de envío

## 🐛 Solución de Problemas

### Error de Conexión con Dialogflow
- Verifica las credenciales en `.env`
- Confirma que la API esté habilitada
- Revisa los logs del backend

### Error de CORS
- Verifica `ALLOWED_HOSTS` en settings.py
- Confirma que el frontend esté en los orígenes permitidos

### Chatbot No Responde
- Revisa la consola del navegador
- Verifica los logs del backend
- Confirma que el servicio esté ejecutándose

## 📱 Personalización

### Cambiar Colores
Edita `ChatbotModal.module.css` y `ChatbotButton.module.css`

### Agregar Intents
1. Crea nuevos intents en Dialogflow
2. Agrega respuestas en `get_fallback_response()`
3. Entrena el modelo

### Modificar Mensajes
Edita `CHATBOT_CONFIG` en `config.ts`

## 🚀 Despliegue

### Backend
- Usa variables de entorno en producción
- Configura `DEBUG=False`
- Usa base de datos PostgreSQL para producción

### Frontend
- Build de producción: `npm run build`
- Sirve desde servidor web estático
- Configura `REACT_APP_API_URL` para producción

## 📞 Soporte

Para problemas técnicos:
1. Revisa los logs del backend
2. Verifica la consola del navegador
3. Confirma la configuración de Dialogflow
4. Verifica la conectividad de red

---

**¡El chatbot está listo para usar! 🎉** 