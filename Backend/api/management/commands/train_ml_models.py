from django.core.management.base import BaseCommand
from api.ml_service import ml_service
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Entrenar modelos de machine learning para predicciones sísmicas'

    def add_arguments(self, parser):
        parser.add_argument(
            '--country',
            type=str,
            help='País específico para entrenar (opcional)',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Forzar reentrenamiento de modelos existentes',
        )

    def handle(self, *args, **options):
        country = options.get('country')
        force = options.get('force', False)
        
        self.stdout.write(
            self.style.SUCCESS(f'Iniciando entrenamiento de modelos ML...')
        )
        
        if country:
            self.stdout.write(f'Entrenando modelos para: {country}')
        else:
            self.stdout.write('Entrenando modelos globales')
        
        try:
            # Entrenar modelos
            success = ml_service.train_models(country_code=country)
            
            if success:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✅ Modelos entrenados exitosamente para {country or "todos los países"}'
                    )
                )
                
                # Mostrar información de los modelos
                self.stdout.write('\n📊 Información de los modelos:')
                self.stdout.write(f'  - Clasificador de riesgo: {"✅" if ml_service.models["risk_classifier"] else "❌"}')
                self.stdout.write(f'  - Regresor de magnitud: {"✅" if ml_service.models["magnitude_regressor"] else "❌"}')
                self.stdout.write(f'  - Regresor de frecuencia: {"✅" if ml_service.models["frequency_regressor"] else "❌"}')
                self.stdout.write(f'  - Escalador: {"✅" if ml_service.scaler else "❌"}')
                
            else:
                self.stdout.write(
                    self.style.ERROR('❌ Error al entrenar los modelos')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error durante el entrenamiento: {str(e)}')
            )
            logger.error(f"Error training models: {str(e)}")
