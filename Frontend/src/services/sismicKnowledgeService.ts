// Servicio de Conocimiento Sísmico - Entrena al chatbot con datos reales
export interface SismicKnowledge {
  countries: CountryInfo[];
  earthquakeTypes: EarthquakeType[];
  magnitudeScales: MagnitudeScale[];
  safetyTips: SafetyTip[];
  historicalEvents: HistoricalEvent[];
  predictionMethods: PredictionMethod[];
}

export interface CountryInfo {
  name: string;
  spanishName: string;
  capital: string;
  seismicZones: string[];
  lastMajorEarthquake: string;
  averageMagnitude: number;
  totalEarthquakes: number;
  riskLevel: 'Alto' | 'Medio' | 'Bajo';
  tectonicPlates: string[];
}

export interface EarthquakeType {
  name: string;
  description: string;
  characteristics: string[];
  commonLocations: string[];
  warningSigns: string[];
}

export interface MagnitudeScale {
  name: string;
  range: string;
  description: string;
  effects: string[];
  examples: string[];
}

export interface SafetyTip {
  category: string;
  tips: string[];
  emergencyNumbers: string[];
}

export interface HistoricalEvent {
  year: number;
  location: string;
  magnitude: number;
  casualties: number;
  description: string;
  lessons: string[];
}

export interface PredictionMethod {
  name: string;
  description: string;
  accuracy: string;
  limitations: string[];
  currentResearch: string;
}

class SismicKnowledgeService {
  private knowledge: SismicKnowledge;

  constructor() {
    this.knowledge = this.initializeKnowledge();
  }

  private initializeKnowledge(): SismicKnowledge {
    return {
      countries: [
        {
          name: 'Peru',
          spanishName: 'Perú',
          capital: 'Lima',
          seismicZones: ['Costa', 'Sierra', 'Selva'],
          lastMajorEarthquake: '2007 (Pisco, 8.0)',
          averageMagnitude: 6.2,
          totalEarthquakes: 1250,
          riskLevel: 'Alto',
          tectonicPlates: ['Placa de Nazca', 'Placa Sudamericana']
        },
        {
          name: 'Chile',
          spanishName: 'Chile',
          capital: 'Santiago',
          seismicZones: ['Costa del Pacífico', 'Cordillera de los Andes'],
          lastMajorEarthquake: '2010 (Maule, 8.8)',
          averageMagnitude: 6.8,
          totalEarthquakes: 2100,
          riskLevel: 'Alto',
          tectonicPlates: ['Placa de Nazca', 'Placa Antártica']
        },
        {
          name: 'Argentina',
          spanishName: 'Argentina',
          capital: 'Buenos Aires',
          seismicZones: ['Cuyo', 'Patagonia', 'Noroeste'],
          lastMajorEarthquake: '1944 (San Juan, 7.4)',
          averageMagnitude: 5.8,
          totalEarthquakes: 890,
          riskLevel: 'Medio',
          tectonicPlates: ['Placa Sudamericana', 'Placa de Nazca']
        },
        {
          name: 'Colombia',
          spanishName: 'Colombia',
          capital: 'Bogotá',
          seismicZones: ['Costa Pacífica', 'Cordillera Central', 'Llanos'],
          lastMajorEarthquake: '1999 (Armenia, 6.2)',
          averageMagnitude: 5.5,
          totalEarthquakes: 650,
          riskLevel: 'Medio',
          tectonicPlates: ['Placa de Nazca', 'Placa Caribe']
        },
        {
          name: 'Ecuador',
          spanishName: 'Ecuador',
          capital: 'Quito',
          seismicZones: ['Costa', 'Sierra', 'Oriente'],
          lastMajorEarthquake: '2016 (Manabí, 7.8)',
          averageMagnitude: 6.0,
          totalEarthquakes: 720,
          riskLevel: 'Alto',
          tectonicPlates: ['Placa de Nazca', 'Placa Sudamericana']
        }
      ],
      earthquakeTypes: [
        {
          name: 'Tectónico',
          description: 'Causado por el movimiento de placas tectónicas',
          characteristics: ['Movimiento de fallas', 'Liberación de energía acumulada', 'Duración variable'],
          commonLocations: ['Límites de placas', 'Fallas geológicas', 'Zonas de subducción'],
          warningSigns: ['Microsismos', 'Cambios en el nivel del agua', 'Comportamiento animal anormal']
        },
        {
          name: 'Volcánico',
          description: 'Relacionado con actividad volcánica',
          characteristics: ['Precedido por erupciones', 'Magnitud generalmente baja', 'Múltiples réplicas'],
          commonLocations: ['Cercanías de volcanes', 'Zonas de actividad magmática'],
          warningSigns: ['Actividad volcánica', 'Emanaciones de gas', 'Temblores volcánicos']
        },
        {
          name: 'Inducido',
          description: 'Causado por actividades humanas',
          characteristics: ['Relacionado con minería', 'Construcción de presas', 'Fracking'],
          commonLocations: ['Zonas mineras', 'Áreas de construcción', 'Regiones de extracción'],
          warningSigns: ['Actividad industrial', 'Cambios en el suelo', 'Vibraciones artificiales']
        }
      ],
      magnitudeScales: [
        {
          name: 'Escala de Richter',
          range: '0.0 - 10.0+',
          description: 'Mide la energía liberada en el epicentro',
          effects: ['Microsismo (0-2.9)', 'Ligero (3.0-3.9)', 'Moderado (4.0-4.9)', 'Fuerte (5.0-5.9)', 'Mayor (6.0-6.9)', 'Gran (7.0-7.9)', 'Enorme (8.0-8.9)', 'Masivo (9.0+)'],
          examples: ['Vibración de hojas (2.0)', 'Movimiento de objetos (4.0)', 'Daños menores (6.0)', 'Destrucción masiva (8.0)']
        },
        {
          name: 'Escala de Mercalli',
          range: 'I - XII',
          description: 'Mide la intensidad percibida por las personas',
          effects: ['I: No perceptible', 'III: Débil', 'V: Moderado', 'VII: Muy fuerte', 'IX: Destructivo', 'XII: Catastrófico'],
          examples: ['I: Solo instrumentos', 'V: Despierta a todos', 'VII: Dificulta estar de pie', 'X: Destrucción total']
        }
      ],
      safetyTips: [
        {
          category: 'Antes del Sismo',
          tips: [
            'Prepara un kit de emergencia con agua, comida y medicinas',
            'Identifica zonas seguras en tu casa y trabajo',
            'Aprende a cerrar llaves de gas y electricidad',
            'Ten un plan familiar de evacuación',
            'Mantén objetos pesados en estantes bajos'
          ],
          emergencyNumbers: ['911', 'Defensa Civil', 'Bomberos', 'Policía']
        },
        {
          category: 'Durante el Sismo',
          tips: [
            'Mantén la calma y no corras',
            'Agáchate, cúbrete y agárrate (ACA)',
            'Aléjate de ventanas y objetos que puedan caer',
            'Si estás en la calle, aléjate de edificios',
            'No uses ascensores'
          ],
          emergencyNumbers: ['911', 'Defensa Civil', 'Bomberos', 'Policía']
        },
        {
          category: 'Después del Sismo',
          tips: [
            'Verifica si hay heridos y ayuda si puedes',
            'Revisa daños en tu casa',
            'Escucha la radio para información oficial',
            'No uses el teléfono a menos que sea urgente',
            'Prepara para réplicas'
          ],
          emergencyNumbers: ['911', 'Defensa Civil', 'Bomberos', 'Policía']
        }
      ],
      historicalEvents: [
        {
          year: 1960,
          location: 'Valdivia, Chile',
          magnitude: 9.5,
          casualties: 1000,
          description: 'El terremoto más fuerte registrado en la historia',
          lessons: ['Importancia de la preparación', 'Efectos de tsunamis', 'Necesidad de códigos de construcción']
        },
        {
          year: 2007,
          location: 'Pisco, Perú',
          magnitude: 8.0,
          casualties: 595,
          description: 'Terremoto devastador en la costa peruana',
          lessons: ['Vulnerabilidad de construcciones', 'Importancia de la respuesta rápida', 'Necesidad de educación sísmica']
        },
        {
          year: 2010,
          location: 'Maule, Chile',
          magnitude: 8.8,
          casualties: 525,
          description: 'Uno de los terremotos más destructivos de Chile',
          lessons: ['Efectividad de códigos de construcción', 'Importancia de sistemas de alerta', 'Preparación ciudadana']
        }
      ],
      predictionMethods: [
        {
          name: 'Análisis de Patrones',
          description: 'Estudio de secuencias sísmicas y recurrencia',
          accuracy: 'Baja a media (30-60%)',
          limitations: ['No puede predecir fechas exactas', 'Basado en datos históricos', 'No considera todos los factores'],
          currentResearch: 'Machine Learning y análisis de big data'
        },
        {
          name: 'Monitoreo de Precursores',
          description: 'Observación de señales antes de sismos',
          accuracy: 'Muy baja (10-30%)',
          limitations: ['Señales no siempre presentes', 'Falsos positivos frecuentes', 'Tecnología limitada'],
          currentResearch: 'Sensores avanzados y satélites'
        },
        {
          name: 'Modelos Tectónicos',
          description: 'Simulación de procesos geológicos',
          accuracy: 'Media (40-70%)',
          limitations: ['Complejidad de la Tierra', 'Datos insuficientes', 'Incertidumbre inherente'],
          currentResearch: 'Supercomputadoras y modelos 3D'
        }
      ]
    };
  }

  // Obtener información de un país específico
  public getCountryInfo(countryName: string): CountryInfo | null {
    const country = this.knowledge.countries.find(c => 
      c.name.toLowerCase() === countryName.toLowerCase() || 
      c.spanishName.toLowerCase() === countryName.toLowerCase()
    );
    return country || null;
  }

  // Obtener todos los países
  public getAllCountries(): CountryInfo[] {
    return this.knowledge.countries;
  }

  // Obtener tipos de terremotos
  public getEarthquakeTypes(): EarthquakeType[] {
    return this.knowledge.earthquakeTypes;
  }

  // Obtener escalas de magnitud
  public getMagnitudeScales(): MagnitudeScale[] {
    return this.knowledge.magnitudeScales;
  }

  // Obtener consejos de seguridad
  public getSafetyTips(category?: string): SafetyTip[] {
    if (category) {
      return this.knowledge.safetyTips.filter(tip => tip.category === category);
    }
    return this.knowledge.safetyTips;
  }

  // Obtener eventos históricos
  public getHistoricalEvents(): HistoricalEvent[] {
    return this.knowledge.historicalEvents;
  }

  // Obtener métodos de predicción
  public getPredictionMethods(): PredictionMethod[] {
    return this.knowledge.predictionMethods;
  }

  // Buscar información general sobre sismos
  public searchSismicInfo(query: string): any {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('magnitud') || lowerQuery.includes('escala')) {
      return this.getMagnitudeScales();
    }
    
    if (lowerQuery.includes('seguridad') || lowerQuery.includes('consejo') || lowerQuery.includes('preparación')) {
      return this.getSafetyTips();
    }
    
    if (lowerQuery.includes('histórico') || lowerQuery.includes('evento') || lowerQuery.includes('pasado')) {
      return this.getHistoricalEvents();
    }
    
    if (lowerQuery.includes('predicción') || lowerQuery.includes('predecir') || lowerQuery.includes('futuro')) {
      return this.getPredictionMethods();
    }
    
    if (lowerQuery.includes('tipo') || lowerQuery.includes('clase') || lowerQuery.includes('categoría')) {
      return this.getEarthquakeTypes();
    }
    
    return null;
  }

  // Generar respuesta inteligente basada en el conocimiento
  public generateIntelligentResponse(query: string, context?: any): string {
    const lowerQuery = query.toLowerCase();
    
    // Respuestas sobre países
    if (lowerQuery.includes('perú') || lowerQuery.includes('peru')) {
      const peru = this.getCountryInfo('Peru');
      if (peru) {
        return `🇵🇪 **${peru.spanishName}** - Información Sísmica:\n\n🏛️ **Capital:** ${peru.capital}\n🌋 **Zonas sísmicas:** ${peru.seismicZones.join(', ')}\n⚠️ **Nivel de riesgo:** ${peru.riskLevel}\n📊 **Magnitud promedio:** ${peru.averageMagnitude}\n🌍 **Placas tectónicas:** ${peru.tectonicPlates.join(', ')}\n\n${peru.lastMajorEarthquake} fue el último sismo importante. ¿Te gustaría saber más sobre seguridad sísmica en Perú?`;
      }
    }
    
    if (lowerQuery.includes('chile')) {
      const chile = this.getCountryInfo('Chile');
      if (chile) {
        return `🇨🇱 **${chile.spanishName}** - Información Sísmica:\n\n🏛️ **Capital:** ${chile.capital}\n🌋 **Zonas sísmicas:** ${chile.seismicZones.join(', ')}\n⚠️ **Nivel de riesgo:** ${chile.riskLevel}\n📊 **Magnitud promedio:** ${chile.averageMagnitude}\n🌍 **Placas tectónicas:** ${chile.tectonicPlates.join(', ')}\n\n${chile.lastMajorEarthquake} fue el último sismo importante. Chile es uno de los países más sísmicos del mundo. ¿Quieres saber sobre preparación sísmica?`;
      }
    }
    
    // Respuestas sobre seguridad
    if (lowerQuery.includes('seguridad') || lowerQuery.includes('consejo') || lowerQuery.includes('preparación')) {
      const tips = this.getSafetyTips();
      return `🛡️ **Consejos de Seguridad Sísmica:**\n\n📋 **Antes del sismo:**\n${tips[0].tips.slice(0, 3).map(tip => `• ${tip}`).join('\n')}\n\n🚨 **Durante el sismo:**\n${tips[1].tips.slice(0, 3).map(tip => `• ${tip}`).join('\n')}\n\n📞 **Números de emergencia:** ${tips[0].emergencyNumbers.join(', ')}\n\n¿Quieres más consejos específicos o información sobre algún país?`;
    }
    
    // Respuestas sobre magnitud
    if (lowerQuery.includes('magnitud') || lowerQuery.includes('escala') || lowerQuery.includes('richter')) {
      const scales = this.getMagnitudeScales();
      return `📏 **Escalas de Magnitud Sísmica:**\n\n🔬 **Escala de Richter:**\n${scales[0].effects.slice(0, 4).map(effect => `• ${effect}`).join('\n')}\n\n👥 **Escala de Mercalli:**\n${scales[1].effects.slice(0, 4).map(effect => `• ${effect}`).join('\n')}\n\n💡 **¿Sabías que?** La escala de Richter mide la energía liberada, mientras que Mercalli mide la intensidad percibida. ¿Te interesa saber más sobre algún rango específico?`;
    }
    
    // Respuestas sobre predicción
    if (lowerQuery.includes('predicción') || lowerQuery.includes('predecir') || lowerQuery.includes('futuro')) {
      const methods = this.getPredictionMethods();
      return `🔮 **Predicción de Sismos:**\n\n📊 **Métodos actuales:**\n${methods.map(method => `• **${method.name}:** ${method.description} (Precisión: ${method.accuracy})`).join('\n')}\n\n⚠️ **Limitaciones:** Los sismos no se pueden predecir con exactitud. Los métodos actuales solo estiman probabilidades.\n\n🔬 **Investigación actual:** Se están desarrollando nuevas tecnologías como IA y sensores avanzados. ¿Quieres saber más sobre algún método específico?`;
    }
    
    // Respuesta general
    return `🌋 **¡Hola! Soy tu experto en sismos.**\n\n📚 **Puedo ayudarte con:**\n\n• 🇵🇪 **Información de países** (Perú, Chile, Argentina, etc.)\n• 📏 **Escalas de magnitud** (Richter, Mercalli)\n• 🛡️ **Consejos de seguridad** (antes, durante, después)\n• 🔮 **Métodos de predicción** (estado actual)\n• 📖 **Eventos históricos** (lecciones aprendidas)\n• 🌍 **Zonas sísmicas** y placas tectónicas\n\n💡 **Ejemplos de preguntas:**\n• "¿Cuántos sismos tuvo Perú?"\n• "Consejos de seguridad sísmica"\n• "¿Qué es la escala de Richter?"\n• "Compara Chile y Perú"\n\n¿En qué puedo ayudarte hoy?`;
  }
}

export const sismicKnowledgeService = new SismicKnowledgeService(); 