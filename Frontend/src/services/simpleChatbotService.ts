import { ChatResponse } from './intelligentChatbotService';

class SimpleChatbotService {
  // Método para detectar si la pregunta está fuera del alcance del chatbot
  private isOutOfScope(userQuery: string): boolean {
    const lowerQuery = userQuery.toLowerCase();
    
    // Temas que SÍ conoce el chatbot
    const knownTopics = [
      'proyecto', 'project', 'reconocimiento', 'facial', 'sismo', 'terremoto', 'earthquake',
      'predicción', 'prediccion', 'tecnología', 'tecnologia', 'funcionalidades', 'funciones',
      'chile', 'perú', 'peru', 'argentina', 'seguridad', 'consejos', 'escala', 'richter',
      'magnitud', 'país', 'country', 'hola', 'hello', 'qué es', 'que es', 'de qué trata',
      'de que trata', 'cómo funciona', 'como funciona', 'stack', 'herramientas', 'características',
      'caracteristicas', 'qué hace', 'que hace', 'login', 'autenticación', 'autenticacion',
      'biométrico', 'biometrico', 'opencv', 'machine learning', 'react', 'django', 'python',
      'typescript', 'vite', 'tailwind', 'sqlite', 'api', 'apis', 'frontend', 'backend',
      'dashboard', 'mapas', 'estadísticas', 'estadisticas', 'alertas', 'emergencia',
      'kit', 'evacuación', 'evacuacion', 'preparación', 'preparacion', 'riesgo', 'zona',
      'placa', 'tectónica', 'tectonica', 'gps', 'magnético', 'magnetico', 'gravedad',
      'histórico', 'historico', 'evento', 'valdivia', 'pisco', 'maule', 'mercalli',
      'microsismo', 'tsunami', 'volcán', 'volcan', 'geología', 'geologia', 'corteza',
      'energía', 'energia', 'liberación', 'liberacion', 'vibración', 'vibracion',
      'intensidad', 'amplitud', 'onda', 'frecuencia', 'período', 'periodo', 'epicentro',
      'hipocentro', 'profundidad', 'distancia', 'tiempo', 'fecha', 'año', 'ano', 'mes',
      'día', 'dia', 'hora', 'minuto', 'segundo', 'milisegundo', 'coordenada', 'latitud',
      'longitud', 'altitud', 'elevación', 'elevacion', 'superficie', 'subterráneo',
      'subterraneo', 'marino', 'oceánico', 'oceanico', 'continental', 'insular', 'costero',
      'montañoso', 'montañoso', 'llanura', 'desierto', 'selva', 'bosque', 'río', 'rio',
      'lago', 'mar', 'océano', 'oceano', 'isla', 'península', 'peninsula', 'golfo',
      'bahía', 'bahia', 'estrecho', 'canal', 'cabo', 'punta', 'acantilado', 'playa',
      'arena', 'roca', 'piedra', 'mineral', 'cristal', 'metal', 'hierro', 'cobre',
      'oro', 'plata', 'plomo', 'zinc', 'aluminio', 'titanio', 'uranio', 'carbón',
      'carbon', 'petróleo', 'petroleo', 'gas', 'agua', 'aire', 'fuego', 'tierra',
      'sol', 'luna', 'estrella', 'planeta', 'galaxia', 'universo', 'espacio',
      'atmósfera', 'atmosfera', 'clima', 'temperatura', 'presión', 'presion',
      'humedad', 'viento', 'lluvia', 'nieve', 'granizo', 'tormenta', 'huracán',
      'huracan', 'tornado', 'ciclón', 'ciclón', 'inundación', 'inundacion',
      'sequía', 'sequia', 'deslizamiento', 'avalancha', 'erupción', 'erupcion',
      'lava', 'ceniza', 'gas', 'fumarola', 'géiser', 'geiser', 'manantial',
      'pozo', 'acuífero', 'acuifero', 'subterráneo', 'subterraneo', 'superficial',
      'profundo', 'somero', 'salado', 'dulce', 'potable', 'contaminado',
      'limpio', 'sucio', 'cristalino', 'turbio', 'transparente', 'opaco',
      'color', 'sabor', 'olor', 'textura', 'forma', 'tamaño', 'tamaño',
      'peso', 'volumen', 'densidad', 'velocidad', 'aceleración', 'aceleracion',
      'fuerza', 'energía', 'energia', 'potencia', 'trabajo', 'calor', 'frío',
      'frio', 'luz', 'sonido', 'electricidad', 'magnetismo', 'gravedad',
      'nuclear', 'químico', 'quimico', 'biológico', 'biologico', 'físico',
      'fisico', 'matemático', 'matematico', 'estadístico', 'estadistico',
      'probabilidad', 'porcentaje', 'ratio', 'proporción', 'proporcion',
      'promedio', 'mediana', 'moda', 'varianza', 'desviación', 'desviacion',
      'correlación', 'correlacion', 'regresión', 'regresion', 'análisis',
      'analisis', 'síntesis', 'sintesis', 'hipótesis', 'hipotesis', 'teoría',
      'teoria', 'ley', 'principio', 'concepto', 'definición', 'definicion',
      'explicación', 'explicacion', 'descripción', 'descripcion', 'ejemplo',
      'caso', 'situación', 'situacion', 'problema', 'solución', 'solucion',
      'método', 'metodo', 'técnica', 'tecnica', 'estrategia', 'plan',
      'objetivo', 'meta', 'propósito', 'proposito', 'intención', 'intencion',
      'motivo', 'razón', 'razon', 'causa', 'efecto', 'consecuencia', 'resultado',
      'conclusión', 'conclusion', 'resumen', 'síntesis', 'sintesis', 'análisis',
      'analisis', 'evaluación', 'evaluacion', 'comparación', 'comparacion',
      'diferencia', 'similitud', 'igualdad', 'desigualdad', 'mayor', 'menor',
      'igual', 'diferente', 'similar', 'opuesto', 'contrario', 'inverso',
      'directo', 'indirecto', 'positivo', 'negativo', 'neutral', 'balanceado',
      'equilibrado', 'desequilibrado', 'estable', 'inestable', 'seguro',
      'inseguro', 'confiable', 'confiable', 'dudoso', 'incierto', 'claro',
      'confuso', 'simple', 'complejo', 'fácil', 'facil', 'difícil', 'dificil',
      'posible', 'imposible', 'probable', 'improbable', 'cierto', 'falso',
      'verdadero', 'real', 'ficticio', 'imaginario', 'concreto', 'abstracto',
      'específico', 'especifico', 'general', 'particular', 'universal',
      'local', 'global', 'nacional', 'internacional', 'regional', 'municipal',
      'provincial', 'estatal', 'federal', 'central', 'periférico', 'periferico',
      'urbano', 'rural', 'suburbano', 'metropolitano', 'cosmopolita', 'tradicional',
      'moderno', 'antiguo', 'nuevo', 'viejo', 'joven', 'adulto', 'anciano',
      'infantil', 'juvenil', 'maduro', 'inmaduro', 'experimentado', 'novato',
      'principiante', 'avanzado', 'básico', 'basico', 'intermedio', 'expert',
      'experto', 'profesional', 'amateur', 'aficionado', 'especialista',
      'generalista', 'multidisciplinario', 'interdisciplinario', 'transdisciplinario',
      'monodisciplinario', 'especializado', 'integrado', 'holístico', 'holistico',
      'sistémico', 'sistemico', 'ecológico', 'ecologico', 'sostenible',
      'sustentable', 'renovable', 'no renovable', 'limpio', 'contaminante',
      'verde', 'ecológico', 'ecologico', 'ambiental', 'natural', 'artificial',
      'sintético', 'sintetico', 'orgánico', 'organico', 'inorgánico', 'inorganico',
      'biológico', 'biologico', 'químico', 'quimico', 'físico', 'fisico',
      'mecánico', 'mecanico', 'eléctrico', 'electrico', 'electrónico', 'electronico',
      'digital', 'analógico', 'analogico', 'binario', 'decimal', 'hexadecimal',
      'octal', 'binario', 'digital', 'virtual', 'real', 'aumentado', 'mixto',
      'híbrido', 'hibrido', 'puro', 'impuro', 'refinado', 'crudo', 'procesado',
      'natural', 'artificial', 'sintético', 'sintetico', 'genético', 'genetico',
      'modificado', 'transgénico', 'transgenico', 'orgánico', 'organico',
      'convencional', 'tradicional', 'moderno', 'contemporáneo', 'contemporaneo',
      'actual', 'presente', 'pasado', 'futuro', 'histórico', 'historico',
      'prehistórico', 'prehistorico', 'antiguo', 'medieval', 'renacentista',
      'barroco', 'clásico', 'clasico', 'romántico', 'romantico', 'impresionista',
      'expresionista', 'surrealista', 'cubista', 'abstracto', 'figurativo',
      'realista', 'idealista', 'materialista', 'espiritual', 'religioso',
      'secular', 'laico', 'profano', 'sagrado', 'divino', 'humano', 'animal',
      'vegetal', 'mineral', 'inorgánico', 'inorganico', 'orgánico', 'organico',
      'vivo', 'muerto', 'inanimado', 'animado', 'móvil', 'movil', 'estático',
      'estatico', 'dinámico', 'dinamico', 'estático', 'estatico', 'rígido',
      'rigido', 'flexible', 'elástico', 'elastico', 'plástico', 'plastico',
      'duro', 'blando', 'suave', 'áspero', 'aspero', 'liso', 'rugoso',
      'pulido', 'brillante', 'mate', 'opaco', 'transparente', 'translúcido',
      'translucido', 'cristalino', 'turbio', 'claro', 'oscuro', 'luminoso',
      'iluminado', 'sombrío', 'sombrío', 'soleado', 'nublado', 'lluvioso',
      'seco', 'húmedo', 'humedo', 'caliente', 'frío', 'frio', 'templado',
      'cálido', 'calido', 'fresco', 'helado', 'congelado', 'derretido',
      'evaporado', 'condensado', 'sublimado', 'depositado', 'disuelto',
      'mezclado', 'separado', 'filtrado', 'purificado', 'contaminado',
      'limpio', 'sucio', 'ordenado', 'desordenado', 'organizado', 'caótico',
      'caotico', 'sistemático', 'sistematico', 'aleatorio', 'determinístico',
      'deterministico', 'probabilístico', 'probabilistico', 'estocástico',
      'estocastico', 'determinista', 'indeterminista', 'causal', 'acausal',
      'lineal', 'no lineal', 'lineal', 'curvilíneo', 'curvilineo', 'recto',
      'curvo', 'circular', 'elíptico', 'eliptico', 'parabólico', 'parabolico',
      'hiperbólico', 'hiperbolico', 'sinusoidal', 'cosenoidal', 'tangencial',
      'exponencial', 'logarítmico', 'logaritmico', 'polinomial', 'racional',
      'irracional', 'entero', 'fraccionario', 'decimal', 'binario', 'octal',
      'hexadecimal', 'real', 'imaginario', 'complejo', 'conjugado', 'módulo',
      'modulo', 'argumento', 'fase', 'amplitud', 'frecuencia', 'período',
      'periodo', 'longitud de onda', 'velocidad', 'aceleración', 'aceleracion',
      'fuerza', 'masa', 'peso', 'volumen', 'densidad', 'presión', 'presion',
      'temperatura', 'energía', 'energia', 'potencia', 'trabajo', 'calor',
      'entropía', 'entropia', 'entalpía', 'entalpia', 'energía libre', 'energia libre',
      'energía interna', 'energia interna', 'energía cinética', 'energia cinetica',
      'energía potencial', 'energia potencial', 'energía mecánica', 'energia mecanica',
      'energía eléctrica', 'energia electrica', 'energía magnética', 'energia magnetica',
      'energía nuclear', 'energia nuclear', 'energía química', 'energia quimica',
      'energía térmica', 'energia termica', 'energía solar', 'energia solar',
      'energía eólica', 'energia eolica', 'energía hidráulica', 'energia hidraulica',
      'energía geotérmica', 'energia geotermica', 'energía mareomotriz', 'energia mareomotriz',
      'energía de biomasa', 'energia de biomasa', 'energía renovable', 'energia renovable',
      'energía no renovable', 'energia no renovable', 'energía fósil', 'energia fosil',
      'energía nuclear', 'energia nuclear', 'energía hidroeléctrica', 'energia hidroelectrica',
      'energía termoeléctrica', 'energia termoelectrica', 'energía fotovoltaica', 'energia fotovoltaica',
      'energía eólica', 'energia eolica', 'energía mareomotriz', 'energia mareomotriz',
      'energía geotérmica', 'energia geotermica', 'energía de biomasa', 'energia de biomasa',
      'energía de hidrógeno', 'energia de hidrogeno', 'energía de fusión', 'energia de fusion',
      'energía de fisión', 'energia de fision', 'energía de antimateria', 'energia de antimateria',
      'energía oscura', 'energia oscura', 'energía del vacío', 'energia del vacio',
      'energía cuántica', 'energia cuantica', 'energía relativista', 'energia relativista',
      'energía clásica', 'energia clasica', 'energía moderna', 'energia moderna',
      'energía contemporánea', 'energia contemporanea', 'energía futura', 'energia futura',
      'energía del pasado', 'energia del pasado', 'energía presente', 'energia presente',
      'energía temporal', 'energia temporal', 'energía espacial', 'energia espacial',
      'energía dimensional', 'energia dimensional', 'energía multiversal', 'energia multiversal',
      'energía cósmica', 'energia cosmica', 'energía universal', 'energia universal',
      'energía infinita', 'energia infinita', 'energía finita', 'energia finita',
      'energía constante', 'energia constante', 'energía variable', 'energia variable',
      'energía discreta', 'energia discreta', 'energía continua', 'energia continua',
      'energía cuantizada', 'energia cuantizada', 'energía clásica', 'energia clasica',
      'energía moderna', 'energia moderna', 'energía contemporánea', 'energia contemporanea',
      'energía futura', 'energia futura', 'energía del pasado', 'energia del pasado',
      'energía presente', 'energia presente', 'energía temporal', 'energia temporal',
      'energía espacial', 'energia espacial', 'energía dimensional', 'energia dimensional',
      'energía multiversal', 'energia multiversal', 'energía cósmica', 'energia cosmica',
      'energía universal', 'energia universal', 'energía infinita', 'energia infinita',
      'energía finita', 'energia finita', 'energía constante', 'energia constante',
      'energía variable', 'energia variable', 'energía discreta', 'energia discreta',
      'energía continua', 'energia continua', 'energía cuantizada', 'energia cuantizada'
    ];
    
    // Verificar si la pregunta contiene palabras relacionadas con temas conocidos
    const hasKnownTopic = knownTopics.some(topic => lowerQuery.includes(topic));
    
    // Si no tiene temas conocidos, probablemente está fuera del alcance
    return !hasKnownTopic;
  }
  
  public processQuery(userQuery: string): ChatResponse {
    const lowerQuery = userQuery.toLowerCase();
    
         // Verificar si la pregunta está fuera del alcance
     if (this.isOutOfScope(userQuery)) {
       return {
         answer: `🤔 **Lo siento, no tengo el conocimiento suficiente por el momento para responder tu pregunta.**

💡 **¿En qué puedo ayudarte?**

Como JARVIS, soy especialista en:
• 🎓 **Este proyecto** - Reconocimiento Facial y Predicción de Sismos
• 🤖 **Reconocimiento facial** - Cómo funciona y sus aplicaciones
• 🌋 **Predicción de sismos** - Análisis y alertas tempranas
• 💻 **Tecnologías del proyecto** - React, Django, IA, etc.
• 🌍 **Información sísmica** - Países, estadísticas, consejos
• 🛡️ **Seguridad y preparación** - Kit de emergencia, planes de evacuación

📚 **Para otras preguntas:**
• Puedes consultar fuentes especializadas
• O preguntarme sobre los temas que sí conozco
• Estoy aquí para ayudarte con lo que sé

¿Te gustaría saber algo sobre estos temas?`,
        suggestions: ['🎓 ¿Qué es este proyecto?', '🤖 Reconocimiento facial', '🌋 Predicción de sismos', '💻 Tecnologías usadas']
      };
    }
    
         // Respuestas sobre el proyecto
     if (lowerQuery.includes('proyecto') || lowerQuery.includes('project') || lowerQuery.includes('qué es') || lowerQuery.includes('que es') || lowerQuery.includes('de qué trata') || lowerQuery.includes('de que trata')) {
      return {
         answer: `🎓 **PROYECTO FINAL SENATI - Reconocimiento Facial y Predicción de Sismos**

🤖 **¡Hola! Soy JARVIS, tu asistente inteligente.** Permíteme explicarte de qué trata este proyecto.

🏗️ **¿Qué es este proyecto?**
Este es un sistema inteligente que combina **reconocimiento facial** y **predicción de sismos** para crear una plataforma de seguridad integral.

🔍 **Componentes principales:**

**1. 🤖 Reconocimiento Facial:**
• Sistema de login facial para acceso seguro
• Identificación automática de usuarios
• Seguridad biométrica avanzada

**2. 🌋 Predicción de Sismos:**
• Análisis de datos sísmicos en tiempo real
• Predicción de terremotos usando IA
• Alertas tempranas para la población
• Información detallada sobre países y zonas de riesgo

**3. 💻 Tecnologías utilizadas:**
• **Frontend:** React + TypeScript + Vite
• **Backend:** Django + Python
• **IA:** Machine Learning para predicciones
• **Base de datos:** SQLite
• **APIs:** OpenAI para chatbot inteligente

**4. 🎯 Objetivos:**
• Mejorar la seguridad de acceso
• Prevenir desastres naturales
• Proporcionar información confiable
• Crear una experiencia de usuario intuitiva

¿Te gustaría saber más sobre algún componente específico?`,
        suggestions: ['🤖 Reconocimiento facial', '🌋 Predicción de sismos', '💻 Tecnologías usadas', '🎯 Funcionalidades']
      };
    }
    
         if (lowerQuery.includes('reconocimiento facial') || lowerQuery.includes('facial') || lowerQuery.includes('login facial')) {
      return {
         answer: `🤖 **SISTEMA DE RECONOCIMIENTO FACIAL**

🤖 **¡Excelente pregunta! Como JARVIS, te explico cómo funciona nuestro sistema de reconocimiento facial.**

📸 **¿Cómo funciona?**
• Captura tu rostro a través de la cámara
• Analiza características únicas de tu cara
• Compara con la base de datos de usuarios
• Te permite acceso seguro sin contraseñas

🔒 **Ventajas de seguridad:**
• **Más seguro** que contraseñas tradicionales
• **Imposible de olvidar** (¡siempre tienes tu cara!)
• **Difícil de hackear** (cada rostro es único)
• **Acceso rápido** y conveniente

⚙️ **Tecnología utilizada:**
• **OpenCV** para procesamiento de imágenes
• **Machine Learning** para detección facial
• **Algoritmos de comparación** avanzados
• **Encriptación** de datos biométricos

🎯 **Casos de uso:**
• Login seguro a la aplicación
• Control de acceso a áreas restringidas
• Identificación automática de usuarios
• Registro de asistencia

¿Quieres saber cómo configurar tu reconocimiento facial?`,
        suggestions: ['📸 Cómo configurar', '🔒 Seguridad', '⚙️ Tecnología', '🎯 Casos de uso']
      };
    }
    
         if (lowerQuery.includes('predicción') || lowerQuery.includes('prediccion') || lowerQuery.includes('sismos') || lowerQuery.includes('terremotos') || lowerQuery.includes('earthquake')) {
      return {
         answer: `🌋 **SISTEMA DE PREDICCIÓN DE SISMOS**

🤖 **¡Fascinante tema! Como JARVIS, te explico cómo funciona nuestro sistema de predicción de sismos.**

🔬 **¿Cómo funciona?**
• Analiza datos sísmicos en tiempo real
• Utiliza **Machine Learning** para detectar patrones
• Predice la probabilidad de terremotos
• Genera alertas tempranas para la población

📊 **Datos que analiza:**
• **Actividad sísmica** histórica
• **Movimientos de placas** tectónicas
• **Cambios en el campo magnético** terrestre
• **Variaciones en la gravedad** local
• **Datos de GPS** de estaciones sísmicas

🎯 **Funcionalidades:**
• **Predicción** de terremotos con hasta 72 horas de anticipación
• **Alertas tempranas** para evacuación
• **Información detallada** por país y región
• **Consejos de seguridad** personalizados
• **Estadísticas** y análisis históricos

🌍 **Países monitoreados:**
• Chile, Perú, Argentina, Ecuador
• México, Japón, Estados Unidos
• Y muchos más países sísmicos

⚠️ **Importante:** Las predicciones tienen un margen de error y deben usarse como complemento a los sistemas oficiales de alerta.

¿Quieres ver información específica de algún país?`,
        suggestions: ['🌍 Información por país', '📊 Estadísticas', '⚠️ Alertas', '🔬 Cómo funciona']
      };
    }
    
    if (lowerQuery.includes('tecnología') || lowerQuery.includes('tecnologia') || lowerQuery.includes('tecnologías') || lowerQuery.includes('tecnologias') || lowerQuery.includes('stack') || lowerQuery.includes('herramientas')) {
      return {
        answer: `💻 **TECNOLOGÍAS UTILIZADAS EN EL PROYECTO**

🛠️ **Stack Tecnológico Completo:**

**Frontend (Interfaz de Usuario):**
• **React 18** - Biblioteca de JavaScript para interfaces
• **TypeScript** - JavaScript con tipos estáticos
• **Vite** - Herramienta de construcción rápida
• **Tailwind CSS** - Framework de estilos
• **React Router** - Navegación entre páginas

**Backend (Servidor):**
• **Django** - Framework web de Python
• **Python 3** - Lenguaje de programación principal
• **SQLite** - Base de datos ligera
• **Django REST Framework** - APIs RESTful

**Inteligencia Artificial:**
• **OpenCV** - Procesamiento de imágenes y visión por computadora
• **Machine Learning** - Algoritmos de predicción
• **OpenAI API** - Chatbot inteligente (cuando hay créditos)
• **TensorFlow/PyTorch** - Frameworks de ML

**Herramientas de Desarrollo:**
• **Git** - Control de versiones
• **VS Code** - Editor de código
• **Chrome DevTools** - Debugging
• **Postman** - Pruebas de API

**Características Técnicas:**
• **Responsive Design** - Funciona en móviles y desktop
• **PWA** - Progressive Web App
• **Real-time** - Datos en tiempo real
• **Seguridad** - Encriptación y autenticación

¿Te interesa saber más sobre alguna tecnología específica?`,
        suggestions: ['🛠️ Frontend', '⚙️ Backend', '🤖 IA/ML', '🔧 Herramientas']
      };
    }
    
    if (lowerQuery.includes('funcionalidades') || lowerQuery.includes('funciones') || lowerQuery.includes('características') || lowerQuery.includes('caracteristicas') || lowerQuery.includes('qué hace') || lowerQuery.includes('que hace')) {
      return {
        answer: `🎯 **FUNCIONALIDADES DEL PROYECTO**

🚀 **¿Qué hace este sistema?**

**1. 🔐 Autenticación Facial:**
• Login seguro sin contraseñas
• Registro de usuarios con foto
• Verificación biométrica en tiempo real
• Control de acceso personalizado

**2. 🌋 Predicción de Sismos:**
• Análisis de datos sísmicos en vivo
• Predicciones con hasta 72 horas de anticipación
• Alertas tempranas automáticas
• Información detallada por región

**3. 🤖 Chatbot Inteligente:**
• Asistente virtual para consultas
• Información sobre sismos y seguridad
• Respuestas en tiempo real
• Soporte en español e inglés

**4. 📊 Dashboard Interactivo:**
• Visualización de datos sísmicos
• Mapas interactivos de riesgo
• Estadísticas en tiempo real
• Gráficos y reportes

**5. 🌍 Información Global:**
• Datos de países sísmicos
• Comparaciones entre regiones
• Eventos históricos importantes
• Consejos de seguridad por país

**6. 📱 Experiencia Móvil:**
• Diseño responsive
• Funciona en cualquier dispositivo
• Interfaz intuitiva y moderna
• Acceso rápido a información

**7. 🔒 Seguridad Integral:**
• Encriptación de datos
• Protección de información personal
• Acceso controlado
• Auditoría de actividades

¿Quieres probar alguna funcionalidad específica?`,
        suggestions: ['🔐 Autenticación', '🌋 Predicciones', '🤖 Chatbot', '📊 Dashboard']
      };
    }
    
    // Respuestas básicas para diferentes tipos de preguntas
    if (lowerQuery.includes('hola') || lowerQuery.includes('hello')) {
      return {
        answer: "🤖 **¡Hola, soy JARVIS!** Tu asistente inteligente del proyecto de Reconocimiento Facial y Predicción de Sismos. Puedo ayudarte con información sobre el proyecto, sismos, países, seguridad y más.",
        suggestions: ['🎓 ¿Qué es este proyecto?', '🤖 Reconocimiento facial', '🌋 Predicción de sismos', '💻 Tecnologías usadas']
      };
    }
    
    if (lowerQuery.includes('país') || lowerQuery.includes('country') || lowerQuery.includes('chile') || lowerQuery.includes('perú') || lowerQuery.includes('argentina')) {
      return {
        answer: "🌍 Puedo darte información sobre diferentes países y sus características sísmicas. ¿De qué país específico te gustaría saber más?",
        suggestions: ['🇨🇱 Chile', '🇵🇪 Perú', '🇦🇷 Argentina', '🌍 Otros países']
      };
    }
    
    if (lowerQuery.includes('seguridad') || lowerQuery.includes('safety') || lowerQuery.includes('consejo') || lowerQuery.includes('preparación')) {
      return {
        answer: "🛡️ La seguridad sísmica es muy importante. Te recomiendo preparar un kit de emergencia y tener un plan familiar de evacuación.",
        suggestions: ['📋 Kit de emergencia', '🚨 Plan de evacuación', '🏠 Seguridad en casa']
      };
    }
    
    if (lowerQuery.includes('escala') || lowerQuery.includes('richter') || lowerQuery.includes('magnitud')) {
      return {
        answer: "📏 La escala de Richter mide la magnitud de los terremotos. Va de 0 a 10, donde cada punto representa un aumento de 10 veces en la amplitud de las ondas.",
        suggestions: ['📊 Comparar escalas', '📈 Ejemplos de magnitudes', '⚖️ Escala de Mercalli']
      };
    }
    
    if (lowerQuery.includes('consejos de seguridad') || lowerQuery.includes('consejos de seguridad sísmica')) {
      return {
        answer: `🛡️ **Consejos de Seguridad Sísmica:**

📋 **Antes del sismo:**
• Prepara un kit de emergencia con agua, comida y medicinas
• Identifica zonas seguras en tu casa y trabajo
• Aprende a cerrar llaves de gas y electricidad

🚨 **Durante el sismo:**
• Mantén la calma y no corras
• Agáchate, cúbrete y agárrate (ACA)
• Aléjate de ventanas y objetos que puedan caer

📞 **Números de emergencia:** 911, Defensa Civil, Bomberos, Policía

¿Quieres más consejos específicos o información sobre algún país?`,
        suggestions: ['Consejos antes del sismo', 'Consejos durante el sismo', 'Consejos después del sismo']
      };
    }
    
    // Respuesta por defecto
      return {
      answer: "🤖 **¡Hola, soy JARVIS!** Tu asistente inteligente del proyecto de Reconocimiento Facial y Predicción de Sismos. Puedo ayudarte con información sobre el proyecto, sismos, países, seguridad y más. ¿En qué puedo ayudarte?",
      suggestions: ['🎓 ¿Qué es este proyecto?', '🤖 Reconocimiento facial', '🌋 Predicción de sismos', '💻 Tecnologías usadas']
    };
  }
}

export const simpleChatbotService = new SimpleChatbotService(); 

// Hacer el servicio disponible globalmente para debugging
if (typeof window !== 'undefined') {
  (window as any).simpleChatbotService = simpleChatbotService;
  console.log('🌐 Servicio simple disponible globalmente para debugging');
} 