#!/usr/bin/env python3
"""
Script de configuración para el sistema de predicciones sísmicas
"""

import os
import sys
import subprocess
import django
from pathlib import Path

def install_requirements():
    """Instalar dependencias de machine learning"""
    print("📦 Instalando dependencias de machine learning...")
    
    ml_packages = [
        'pandas==2.2.3',
        'scikit-learn==1.5.2',
        'joblib==1.4.2'
    ]
    
    for package in ml_packages:
        try:
            print(f"   Instalando {package}...")
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
            print(f"   ✅ {package} instalado")
        except subprocess.CalledProcessError as e:
            print(f"   ❌ Error instalando {package}: {e}")
            return False
    
    return True

def create_directories():
    """Crear directorios necesarios"""
    print("\n📁 Creando directorios necesarios...")
    
    directories = [
        'Backend/api/models',
        'Backend/logs',
        'Backend/api/management/commands'
    ]
    
    for directory in directories:
        try:
            Path(directory).mkdir(parents=True, exist_ok=True)
            print(f"   ✅ {directory}")
        except Exception as e:
            print(f"   ❌ Error creando {directory}: {e}")
            return False
    
    return True

def setup_django():
    """Configurar Django"""
    print("\n⚙️ Configurando Django...")
    
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'logic.settings')
        django.setup()
        print("   ✅ Django configurado")
        return True
    except Exception as e:
        print(f"   ❌ Error configurando Django: {e}")
        return False

def check_database():
    """Verificar base de datos"""
    print("\n🔍 Verificando base de datos...")
    
    try:
        from django.core.management import call_command
        from io import StringIO
        
        # Capturar output del comando
        output = StringIO()
        call_command('check_database', stdout=output)
        
        result = output.getvalue()
        if "✅" in result:
            print("   ✅ Base de datos verificada")
            return True
        else:
            print("   ⚠️ Problemas en la base de datos")
            print(result)
            return False
            
    except Exception as e:
        print(f"   ❌ Error verificando base de datos: {e}")
        return False

def train_initial_models():
    """Entrenar modelos iniciales"""
    print("\n🤖 Entrenando modelos iniciales...")
    
    try:
        from django.core.management import call_command
        
        # Entrenar modelos globales
        call_command('train_ml_models')
        print("   ✅ Modelos entrenados")
        return True
        
    except Exception as e:
        print(f"   ❌ Error entrenando modelos: {e}")
        return False

def run_tests():
    """Ejecutar pruebas del sistema"""
    print("\n🧪 Ejecutando pruebas del sistema...")
    
    try:
        result = subprocess.run([sys.executable, 'test_predictions.py'], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            print("   ✅ Todas las pruebas pasaron")
            return True
        else:
            print("   ❌ Algunas pruebas fallaron")
            print(result.stdout)
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"   ❌ Error ejecutando pruebas: {e}")
        return False

def create_sample_config():
    """Crear archivo de configuración de ejemplo"""
    print("\n📝 Creando configuración de ejemplo...")
    
    config_content = """# Configuración del Sistema de Predicciones Sísmicas

## Configuración de Django
DJANGO_SETTINGS_MODULE=logic.settings

## Configuración de ML
ML_MODEL_DIR=Backend/api/models
ML_LOG_LEVEL=INFO

## Configuración de Base de Datos
DATABASE_PATH=Backend/prediction.db

## Configuración de API
API_BASE_URL=http://localhost:8000
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

## Configuración de Logging
LOG_DIR=Backend/logs
LOG_FILE=predictions.log
LOG_LEVEL=INFO

## Configuración de Modelos
MODEL_RETRAIN_INTERVAL=7  # días
MODEL_CONFIDENCE_THRESHOLD=0.7
PREDICTION_CACHE_TTL=3600  # segundos
"""
    
    try:
        with open('Backend/.env.predictions', 'w') as f:
            f.write(config_content)
        print("   ✅ Archivo .env.predictions creado")
        return True
    except Exception as e:
        print(f"   ❌ Error creando configuración: {e}")
        return False

def main():
    """Función principal de configuración"""
    print("🚀 Configurando Sistema de Predicciones Sísmicas")
    print("=" * 50)
    
    steps = [
        ("Instalación de dependencias", install_requirements),
        ("Creación de directorios", create_directories),
        ("Configuración de Django", setup_django),
        ("Verificación de base de datos", check_database),
        ("Entrenamiento de modelos", train_initial_models),
        ("Ejecución de pruebas", run_tests),
        ("Creación de configuración", create_sample_config),
    ]
    
    results = []
    
    for step_name, step_func in steps:
        print(f"\n🔄 {step_name}...")
        try:
            result = step_func()
            results.append((step_name, result))
        except Exception as e:
            print(f"❌ Error inesperado en {step_name}: {e}")
            results.append((step_name, False))
    
    # Resumen final
    print("\n" + "=" * 50)
    print("📋 RESUMEN DE CONFIGURACIÓN")
    print("=" * 50)
    
    passed = 0
    for step_name, result in results:
        status = "✅ COMPLETADO" if result else "❌ FALLÓ"
        print(f"{step_name}: {status}")
        if result:
            passed += 1
    
    print(f"\n🎯 Resultado: {passed}/{len(results)} pasos completados")
    
    if passed == len(results):
        print("\n🎉 ¡Configuración completada exitosamente!")
        print("\n📚 Próximos pasos:")
        print("   1. Ejecutar el servidor Django: python manage.py runserver")
        print("   2. Probar la API: curl http://localhost:8000/api/predictions/generate")
        print("   3. Verificar logs en: Backend/logs/predictions.log")
        print("   4. Revisar documentación: Backend/README_PREDICTIONS.md")
    elif passed >= len(results) * 0.8:
        print("\n⚠️ Configuración mayormente exitosa. Revisar pasos fallidos.")
    else:
        print("\n🚨 Configuración falló. Revisar errores y dependencias.")
    
    return passed == len(results)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
