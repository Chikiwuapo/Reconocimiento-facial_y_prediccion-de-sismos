from django.core.management.base import BaseCommand
from django.db import connection
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Verificar la base de datos prediction.db y mostrar estadísticas'

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🔍 Verificando base de datos prediction.db...')
        )
        
        try:
            with connection.cursor() as cursor:
                # Verificar si la tabla existe
                cursor.execute("""
                    SELECT name FROM sqlite_master 
                    WHERE type='table' AND name='prediction'
                """)
                
                table_exists = cursor.fetchone()
                
                if not table_exists:
                    self.stdout.write(
                        self.style.ERROR('❌ Tabla "prediction" no encontrada en la base de datos')
                    )
                    return
                
                self.stdout.write('✅ Tabla "prediction" encontrada')
                
                # Estadísticas generales
                cursor.execute("SELECT COUNT(*) FROM prediction")
                total_records = cursor.fetchone()[0]
                self.stdout.write(f'📊 Total de registros: {total_records:,}')
                
                # Países disponibles
                cursor.execute("""
                    SELECT country_code, COUNT(*) as count 
                    FROM prediction 
                    WHERE country_code IS NOT NULL 
                    GROUP BY country_code 
                    ORDER BY count DESC
                """)
                
                countries = cursor.fetchall()
                self.stdout.write(f'\n🌍 Países con datos ({len(countries)}):')
                for country, count in countries:
                    self.stdout.write(f'  - {country}: {count:,} registros')
                
                # Rango de fechas
                cursor.execute("""
                    SELECT MIN(event_date), MAX(event_date) 
                    FROM prediction 
                    WHERE event_date IS NOT NULL
                """)
                
                date_range = cursor.fetchone()
                if date_range[0] and date_range[1]:
                    self.stdout.write(f'\n📅 Rango de fechas: {date_range[0]} a {date_range[1]}')
                
                # Estadísticas de magnitudes
                cursor.execute("""
                    SELECT 
                        MIN(max_mag_last90d), 
                        MAX(max_mag_last90d), 
                        AVG(max_mag_last90d)
                    FROM prediction 
                    WHERE max_mag_last90d IS NOT NULL
                """)
                
                mag_stats = cursor.fetchone()
                if mag_stats[0] is not None:
                    self.stdout.write(f'\n📈 Estadísticas de magnitud:')
                    self.stdout.write(f'  - Mínima: {mag_stats[0]:.2f}')
                    self.stdout.write(f'  - Máxima: {mag_stats[1]:.2f}')
                    self.stdout.write(f'  - Promedio: {mag_stats[2]:.2f}')
                
                # Verificar features importantes
                cursor.execute("""
                    SELECT 
                        COUNT(CASE WHEN eq_count_m3_last7d IS NOT NULL THEN 1 END) as eq_7d,
                        COUNT(CASE WHEN eq_count_m4_last30d IS NOT NULL THEN 1 END) as eq_30d,
                        COUNT(CASE WHEN energy_sum_last365d IS NOT NULL THEN 1 END) as energy,
                        COUNT(CASE WHEN aftershock_rate IS NOT NULL THEN 1 END) as aftershock,
                        COUNT(CASE WHEN strain_rate IS NOT NULL THEN 1 END) as strain
                    FROM prediction
                """)
                
                features = cursor.fetchone()
                self.stdout.write(f'\n🔧 Completitud de features:')
                self.stdout.write(f'  - Sismos últimos 7 días: {features[0]:,} ({features[0]/total_records*100:.1f}%)')
                self.stdout.write(f'  - Sismos últimos 30 días: {features[1]:,} ({features[1]/total_records*100:.1f}%)')
                self.stdout.write(f'  - Energía acumulada: {features[2]:,} ({features[2]/total_records*100:.1f}%)')
                self.stdout.write(f'  - Tasa de réplicas: {features[3]:,} ({features[3]/total_records*100:.1f}%)')
                self.stdout.write(f'  - Tasa de deformación: {features[4]:,} ({features[4]/total_records*100:.1f}%)')
                
                # Verificar etiquetas para ML
                cursor.execute("""
                    SELECT 
                        COUNT(CASE WHEN label_m45_next7d IS NOT NULL THEN 1 END) as label_7d,
                        COUNT(CASE WHEN label_m50_next30d IS NOT NULL THEN 1 END) as label_30d,
                        COUNT(CASE WHEN prob_m45_next7d IS NOT NULL THEN 1 END) as prob_7d,
                        COUNT(CASE WHEN prob_m50_next30d IS NOT NULL THEN 1 END) as prob_30d
                    FROM prediction
                """)
                
                labels = cursor.fetchone()
                self.stdout.write(f'\n🏷️ Etiquetas para ML:')
                self.stdout.write(f'  - Etiquetas 7 días: {labels[0]:,} ({labels[0]/total_records*100:.1f}%)')
                self.stdout.write(f'  - Etiquetas 30 días: {labels[1]:,} ({labels[1]/total_records*100:.1f}%)')
                self.stdout.write(f'  - Probabilidades 7 días: {labels[2]:,} ({labels[2]/total_records*100:.1f}%)')
                self.stdout.write(f'  - Probabilidades 30 días: {labels[3]:,} ({labels[3]/total_records*100:.1f}%)')
                
                # Recomendaciones
                self.stdout.write(f'\n💡 Recomendaciones:')
                
                if features[0] < total_records * 0.8:
                    self.stdout.write('  ⚠️  Considera mejorar la completitud de datos de sismos recientes')
                
                if labels[0] < total_records * 0.5:
                    self.stdout.write('  ⚠️  Pocas etiquetas disponibles para entrenamiento de ML')
                
                if total_records < 1000:
                    self.stdout.write('  ⚠️  Pocos registros para entrenamiento robusto de ML')
                else:
                    self.stdout.write('  ✅ Suficientes registros para entrenamiento de ML')
                
                self.stdout.write(
                    self.style.SUCCESS('\n✅ Verificación completada exitosamente')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error verificando la base de datos: {str(e)}')
            )
            logger.error(f"Error checking database: {str(e)}")
