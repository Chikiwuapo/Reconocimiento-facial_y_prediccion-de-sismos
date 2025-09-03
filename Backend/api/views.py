from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connection
from .serializers import CountryDataSerializer
from .ml_service import ml_service
import json
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
def south_american_countries(request):
    """Obtener datos de países sudamericanos desde prediction.db"""
    
    # Definir países sudamericanos y sus coordenadas
    south_american_data = {
        'Argentina': {'code': 'AR', 'coordinates': [-34.6118, -58.396]},
        'Bolivia': {'code': 'BO', 'coordinates': [-16.4897, -68.1193]},
        'Brazil': {'code': 'BR', 'coordinates': [-15.7801, -47.9292]},
        'Chile': {'code': 'CL', 'coordinates': [-33.4489, -70.6693]},
        'Colombia': {'code': 'CO', 'coordinates': [4.711, -74.0721]},
        'Ecuador': {'code': 'EC', 'coordinates': [-0.2299, -78.5249]},
        'Guyana': {'code': 'GY', 'coordinates': [6.8013, -58.1553]},
        'Paraguay': {'code': 'PY', 'coordinates': [-25.2637, -57.5759]},
        'Peru': {'code': 'PE', 'coordinates': [-12.0464, -77.0428]},
        'Suriname': {'code': 'SR', 'coordinates': [5.852, -55.2038]},
        'Uruguay': {'code': 'UY', 'coordinates': [-34.9011, -56.1645]},
        'Venezuela': {'code': 'VE', 'coordinates': [10.4806, -66.9036]},
    }
    
    countries_data = []
    
    with connection.cursor() as cursor:
        for country_name, country_info in south_american_data.items():
            # Obtener datos del país desde prediction.db
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_records,
                    AVG(max_mag_last90d) as avg_magnitude,
                    MAX(max_mag_last90d) as max_magnitude,
                    AVG(prob_m45_next7d) as avg_prob_7d,
                    AVG(prob_m50_next30d) as avg_prob_30d,
                    AVG(prob_m60_next90d) as avg_prob_90d,
                    MAX(event_date) as latest_date
                FROM prediction 
                WHERE country_code = %s
            """, [country_name])
            
            result = cursor.fetchone()
            
            if result and result[0] > 0:
                # País tiene datos en la base de datos
                total_records, avg_mag, max_mag, prob_7d, prob_30d, prob_90d, latest_date = result
                
                # Calcular nivel de riesgo
                if prob_7d and prob_7d > 0.3:
                    risk_level = 'very-high'
                elif prob_7d and prob_7d > 0.2:
                    risk_level = 'high'
                elif prob_7d and prob_7d > 0.1:
                    risk_level = 'medium'
                else:
                    risk_level = 'low'
                
                country_data = {
                    'id': country_name.lower().replace(' ', '-'),
                    'name': country_name,
                    'code': country_info['code'],
                    'coordinates': country_info['coordinates'],
                    'riskLevel': risk_level,
                    'lastEarthquake': str(latest_date) if latest_date else '2024-01-01',
                    'magnitude': max_mag if max_mag else avg_mag if avg_mag else 3.0,
                    'total_records': total_records,
                    'avg_prob_7d': prob_7d if prob_7d else 0.0,
                    'avg_prob_30d': prob_30d if prob_30d else 0.0,
                    'avg_prob_90d': prob_90d if prob_90d else 0.0,
                }
            else:
                # País no tiene datos, usar datos de otros países como fallback
                cursor.execute("""
                    SELECT 
                        AVG(max_mag_last90d) as avg_magnitude,
                        AVG(prob_m45_next7d) as avg_prob_7d
                    FROM prediction 
                    WHERE country_code IS NOT NULL
                """)
                
                fallback_result = cursor.fetchone()
                fallback_mag = fallback_result[0] if fallback_result and fallback_result[0] else 4.0
                fallback_prob = fallback_result[1] if fallback_result and fallback_result[1] else 0.1
                
                # Determinar riesgo basado en datos de fallback
                if fallback_prob > 0.2:
                    risk_level = 'medium'
                else:
                    risk_level = 'low'
                
                country_data = {
                    'id': country_name.lower().replace(' ', '-'),
                    'name': country_name,
                    'code': country_info['code'],
                    'coordinates': country_info['coordinates'],
                    'riskLevel': risk_level,
                    'lastEarthquake': '2024-01-01',
                    'magnitude': fallback_mag,
                    'total_records': 0,
                    'avg_prob_7d': fallback_prob,
                    'avg_prob_30d': fallback_prob * 1.5,
                    'avg_prob_90d': fallback_prob * 2.0,
                }
            
            countries_data.append(country_data)
    
    return Response(countries_data)

@api_view(['GET'])
def country_details(request, country_code):
    """Obtener detalles específicos de un país"""
    
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                country_code,
                event_date,
                location,
                max_mag_last90d,
                prob_m45_next7d,
                prob_m50_next30d,
                prob_m60_next90d,
                eq_count_m3_last7d,
                eq_count_m4_last30d
            FROM prediction 
            WHERE country_code = %s
            ORDER BY event_date DESC
            LIMIT 10
        """, [country_code])
        
        results = cursor.fetchall()
        
        if results:
            country_data = {
                'country_code': country_code,
                'recent_events': []
            }
            
            for row in results:
                event = {
                    'date': str(row[1]) if row[1] else None,
                    'location': row[2],
                    'magnitude': row[3],
                    'prob_7d': row[4],
                    'prob_30d': row[5],
                    'prob_90d': row[6],
                    'eq_count_7d': row[7],
                    'eq_count_30d': row[8]
                }
                country_data['recent_events'].append(event)
            
            return Response(country_data)
        else:
            return Response({'error': 'País no encontrado'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def earthquake_statistics(request):
    """Obtener estadísticas generales de terremotos"""
    
    with connection.cursor() as cursor:
        # Estadísticas generales
        cursor.execute("""
            SELECT 
                COUNT(*) as total_records,
                AVG(max_mag_last90d) as avg_magnitude,
                MAX(max_mag_last90d) as max_magnitude,
                COUNT(DISTINCT country_code) as total_countries
            FROM prediction
        """)
        
        general_stats = cursor.fetchone()
        
        # Estadísticas por país
        cursor.execute("""
            SELECT 
                country_code,
                COUNT(*) as record_count,
                AVG(max_mag_last90d) as avg_magnitude,
                MAX(max_mag_last90d) as max_magnitude
            FROM prediction 
            WHERE country_code IS NOT NULL
            GROUP BY country_code
            ORDER BY record_count DESC
            LIMIT 10
        """)
        
        country_stats = cursor.fetchall()
        
        statistics = {
            'general': {
                'total_records': general_stats[0],
                'avg_magnitude': general_stats[1],
                'max_magnitude': general_stats[2],
                'total_countries': general_stats[3]
            },
            'by_country': [
                {
                    'country': row[0],
                    'record_count': row[1],
                    'avg_magnitude': row[2],
                    'max_magnitude': row[3]
                }
                for row in country_stats
            ]
        }
        
        return Response(statistics)

@api_view(['GET'])
def yearly_statistics(request, year):
    """Obtener estadísticas de sismos por año específico"""
    
    # Validar que el año esté en el rango válido
    try:
        year_int = int(year)
        if year_int < 2020 or year_int > 2025:
            return Response({'error': 'Año debe estar entre 2020 y 2025'}, status=status.HTTP_400_BAD_REQUEST)
    except ValueError:
        return Response({'error': 'Año inválido'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Países sudamericanos
    south_american_countries = [
        'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 
        'Ecuador', 'Guyana', 'Paraguay', 'Peru', 'Suriname', 
        'Uruguay', 'Venezuela'
    ]
    
    with connection.cursor() as cursor:
        # Estadísticas generales del año
        cursor.execute("""
            SELECT 
                COUNT(*) as total_earthquakes,
                AVG(max_mag_last90d) as avg_magnitude,
                MAX(max_mag_last90d) as max_magnitude,
                MIN(event_date) as first_date,
                MAX(event_date) as last_date
            FROM prediction 
            WHERE strftime('%%Y', event_date) = %s
        """, [str(year)])
        
        year_stats = cursor.fetchone()
        
        if not year_stats or year_stats[0] == 0:
            return Response({
                'year': year,
                'general': {
                    'total_earthquakes': 0,
                    'avg_magnitude': 0,
                    'max_magnitude': 0,
                    'first_date': None,
                    'last_date': None
                },
                'by_country': []
            })
        
        total, avg_mag, max_mag, first_date, last_date = year_stats
        
        # Estadísticas por país sudamericano
        countries_data = []
        for country in south_american_countries:
            cursor.execute("""
                SELECT 
                    COUNT(*) as count,
                    AVG(max_mag_last90d) as avg_mag,
                    MAX(max_mag_last90d) as max_mag,
                    MIN(event_date) as first_date,
                    MAX(event_date) as last_date
                FROM prediction 
                WHERE country_code = %s AND strftime('%%Y', event_date) = %s
            """, [country, str(year)])
            
            country_stats = cursor.fetchone()
            if country_stats and country_stats[0] > 0:
                count, avg_mag_country, max_mag_country, first_date_country, last_date_country = country_stats
                countries_data.append({
                    'country': country,
                    'count': count,
                    'avg_magnitude': avg_mag_country,
                    'max_magnitude': max_mag_country,
                    'first_date': first_date_country,
                    'last_date': last_date_country
                })
        
        statistics = {
            'year': year,
            'general': {
                'total_earthquakes': total,
                'avg_magnitude': avg_mag,
                'max_magnitude': max_mag,
                'first_date': first_date,
                'last_date': last_date
            },
            'by_country': countries_data
        }
        
        return Response(statistics)

@api_view(['GET'])
def country_yearly_statistics(request, country_code, year):
    """Obtener estadísticas de sismos de un país específico por año"""
    
    # Validar que el año esté en el rango válido
    try:
        year_int = int(year)
        if year_int < 2020 or year_int > 2025:
            return Response({'error': 'Año debe estar entre 2020 y 2025'}, status=status.HTTP_400_BAD_REQUEST)
    except ValueError:
        return Response({'error': 'Año inválido'}, status=status.HTTP_400_BAD_REQUEST)
    
    with connection.cursor() as cursor:
        # Estadísticas del país para el año específico
        cursor.execute("""
            SELECT 
                COUNT(*) as total_earthquakes,
                AVG(max_mag_last90d) as avg_magnitude,
                MAX(max_mag_last90d) as max_magnitude,
                MIN(event_date) as first_date,
                MAX(event_date) as last_date,
                AVG(prob_m45_next7d) as avg_prob_7d,
                AVG(prob_m50_next30d) as avg_prob_30d,
                AVG(prob_m60_next90d) as avg_prob_90d
            FROM prediction 
            WHERE country_code = %s AND strftime('%%Y', event_date) = %s
        """, [country_code, str(year)])
        
        country_stats = cursor.fetchone()
        
        if not country_stats or country_stats[0] == 0:
            return Response({
                'country_code': country_code,
                'year': year,
                'total_earthquakes': 0,
                'avg_magnitude': 0,
                'max_magnitude': 0,
                'first_date': None,
                'last_date': None,
                'avg_prob_7d': 0,
                'avg_prob_30d': 0,
                'avg_prob_90d': 0,
                'recent_events': []
            })
        
        total, avg_mag, max_mag, first_date, last_date, avg_prob_7d, avg_prob_30d, avg_prob_90d = country_stats
        
        # Obtener todos los eventos del país para el año (sin límite para permitir paginación en el frontend)
        cursor.execute("""
            SELECT 
                event_date,
                location,
                max_mag_last90d as magnitude,
                prob_m45_next7d,
                prob_m50_next30d,
                prob_m60_next90d
            FROM prediction 
            WHERE country_code = %s AND strftime('%%Y', event_date) = %s
            ORDER BY event_date DESC
        """, [country_code, str(year)])
        
        recent_events = cursor.fetchall()
        
        events_data = []
        for event in recent_events:
            events_data.append({
                'date': event[0],
                'location': event[1] or 'Ubicación no especificada',
                'magnitude': event[2],
                'prob_7d': event[3],
                'prob_30d': event[4],
                'prob_90d': event[5]
            })
        
        statistics = {
            'country_code': country_code,
            'year': year,
            'total_earthquakes': total,
            'avg_magnitude': avg_mag,
            'max_magnitude': max_mag,
            'first_date': first_date,
            'last_date': last_date,
            'avg_prob_7d': avg_prob_7d,
            'avg_prob_30d': avg_prob_30d,
            'avg_prob_90d': avg_prob_90d,
            'recent_events': events_data
        }
        
        return Response(statistics)

@api_view(['GET'])
def dashboard_data(request):
    """Obtener datos del dashboard para las últimas 24h, semana y mes"""
    
    time_range = request.GET.get('range', '7d')  # 24h, 7d, 30d
    
    # Calcular la fecha límite basada en el rango
    from datetime import datetime, timedelta
    now = datetime.now()
    
    if time_range == '24h':
        limit_date = now - timedelta(days=1)
        days_back = 1
    elif time_range == '7d':
        limit_date = now - timedelta(days=7)
        days_back = 7
    elif time_range == '30d':
        limit_date = now - timedelta(days=30)
        days_back = 30
    else:
        return Response({'error': 'Rango inválido. Use: 24h, 7d, 30d'}, status=status.HTTP_400_BAD_REQUEST)
    
    with connection.cursor() as cursor:
        # Lista de países sudamericanos
        south_american_countries = [
            'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 
            'Ecuador', 'Guyana', 'Paraguay', 'Peru', 'Suriname', 
            'Uruguay', 'Venezuela'
        ]
        
        # Obtener todos los sismos en el rango de tiempo solo para países sudamericanos
        placeholders_map = ','.join(['%s' for _ in south_american_countries])
        cursor.execute(f"""
            SELECT 
                record_id,
                country_code,
                event_date,
                location,
                max_mag_last90d as magnitude,
                prob_m45_next7d,
                prob_m50_next30d,
                prob_m60_next90d
            FROM prediction 
            WHERE event_date >= %s AND country_code IN ({placeholders_map})
            ORDER BY event_date DESC
        """, [limit_date.strftime('%Y-%m-%d')] + south_american_countries)
        
        earthquakes = cursor.fetchall()
        
        # Procesar datos para el mapa
        map_data = []
        for eq in earthquakes:
            # Obtener coordenadas del país
            country_coords = {
                'Argentina': [-34.6118, -58.3960],
                'Bolivia': [-16.4897, -68.1193],
                'Brazil': [-15.7801, -47.9292],
                'Chile': [-33.4489, -70.6693],
                'Colombia': [4.7110, -74.0721],
                'Ecuador': [-0.2299, -78.5249],
                'Guyana': [6.8013, -58.1553],
                'Paraguay': [-25.2637, -57.5759],
                'Peru': [-12.0464, -77.0428],
                'Suriname': [5.8520, -55.2038],
                'Uruguay': [-34.9011, -56.1645],
                'Venezuela': [10.4806, -66.9036]
            }
            
            coords = country_coords.get(eq[1], [0, 0])
            
            map_data.append({
                'id': str(eq[0]),
                'lat': coords[0],
                'lng': coords[1],
                'magnitude': eq[4] or 0,
                'location': eq[1] or 'Ubicación desconocida',
                'date': eq[2],
                'prob_7d': eq[5],
                'prob_30d': eq[6],
                'prob_90d': eq[7]
            })
        
        # Obtener estadísticas solo por países sudamericanos
        placeholders = ','.join(['%s' for _ in south_american_countries])
        cursor.execute(f"""
            SELECT 
                country_code,
                COUNT(*) as count,
                AVG(max_mag_last90d) as avg_magnitude,
                MAX(max_mag_last90d) as max_magnitude,
                MAX(event_date) as last_date
            FROM prediction 
            WHERE event_date >= %s AND country_code IN ({placeholders})
            GROUP BY country_code
            ORDER BY count DESC
        """, [limit_date.strftime('%Y-%m-%d')] + south_american_countries)
        
        country_stats = cursor.fetchall()
        
        # Calcular niveles de riesgo basados en la actividad
        countries_with_risk = []
        for stat in country_stats:
            count = stat[1]
            avg_mag = stat[2] or 0
            max_mag = stat[3] or 0
            
            # Calcular nivel de riesgo basado en cantidad y magnitud
            if count > 50 or max_mag >= 6.0:
                risk_level = 'very-high'
            elif count > 20 or max_mag >= 5.0:
                risk_level = 'high'
            elif count > 10 or max_mag >= 4.0:
                risk_level = 'medium'
            else:
                risk_level = 'low'
            
            countries_with_risk.append({
                'country_code': stat[0],
                'count': count,
                'avg_magnitude': avg_mag,
                'max_magnitude': max_mag,
                'last_date': stat[4],
                'risk_level': risk_level
            })
        
        # Obtener el último sismo registrado solo de países sudamericanos
        placeholders_last = ','.join(['%s' for _ in south_american_countries])
        cursor.execute(f"""
            SELECT 
                country_code,
                event_date,
                location,
                max_mag_last90d as magnitude
            FROM prediction 
            WHERE event_date >= %s AND country_code IN ({placeholders_last})
            ORDER BY event_date DESC
            LIMIT 1
        """, [limit_date.strftime('%Y-%m-%d')] + south_american_countries)
        
        last_earthquake = cursor.fetchone()
        
        # Encontrar el país con mayor riesgo
        highest_risk_country = max(countries_with_risk, key=lambda x: x['count']) if countries_with_risk else None
        
        dashboard_data = {
            'time_range': time_range,
            'days_back': days_back,
            'map_data': map_data,
            'countries': countries_with_risk,
            'last_earthquake': {
                'country': last_earthquake[0] if last_earthquake else None,
                'date': last_earthquake[1] if last_earthquake else None,
                'location': last_earthquake[2] if last_earthquake else None,
                'magnitude': last_earthquake[3] if last_earthquake else None
            },
            'total_earthquakes': len(map_data),
            'highest_risk_country': highest_risk_country
        }
        
        return Response(dashboard_data)

@api_view(['GET'])
def all_years_statistics(request):
    """Obtener estadísticas de sismos de todos los años para países sudamericanos"""
    
    # Países sudamericanos
    south_american_countries = [
        'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 
        'Ecuador', 'Guyana', 'Paraguay', 'Peru', 'Suriname', 
        'Uruguay', 'Venezuela'
    ]
    
    with connection.cursor() as cursor:
        # Estadísticas generales de todos los años
        cursor.execute("""
            SELECT 
                COUNT(*) as total_earthquakes,
                AVG(max_mag_last90d) as avg_magnitude,
                MAX(max_mag_last90d) as max_magnitude,
                MIN(event_date) as first_date,
                MAX(event_date) as last_date
            FROM prediction 
            WHERE country_code IN ({})
        """.format(','.join(['%s' for _ in south_american_countries])), south_american_countries)
        
        general_stats = cursor.fetchone()
        
        if not general_stats or general_stats[0] == 0:
            return Response({
                'period': 'Todos los años',
                'general': {
                    'total_earthquakes': 0,
                    'avg_magnitude': 0,
                    'max_magnitude': 0,
                    'first_date': None,
                    'last_date': None
                },
                'by_country': []
            })
        
        total, avg_mag, max_mag, first_date, last_date = general_stats
        
        # Estadísticas por país sudamericano de todos los años
        countries_data = []
        for country in south_american_countries:
            cursor.execute("""
                SELECT 
                    COUNT(*) as count,
                    AVG(max_mag_last90d) as avg_mag,
                    MAX(max_mag_last90d) as max_mag,
                    MIN(event_date) as first_date,
                    MAX(event_date) as last_date
                FROM prediction 
                WHERE country_code = %s
            """, [country])
            
            country_stats = cursor.fetchone()
            if country_stats and country_stats[0] > 0:
                count, avg_mag_country, max_mag_country, first_date_country, last_date_country = country_stats
                countries_data.append({
                    'country': country,
                    'count': count,
                    'avg_magnitude': avg_mag_country,
                    'max_magnitude': max_mag_country,
                    'first_date': first_date_country,
                    'last_date': last_date_country
                })
        
        statistics = {
            'period': 'Todos los años',
            'general': {
                'total_earthquakes': total,
                'avg_magnitude': avg_mag,
                'max_magnitude': max_mag,
                'first_date': first_date,
                'last_date': last_date
            },
            'by_country': countries_data
        }
        
        return Response(statistics)

@api_view(['GET'])
def country_all_years_statistics(request, country_code):
    """Obtener estadísticas de sismos de todos los años para un país específico"""
    
    try:
        # Países sudamericanos permitidos
        south_american_countries = [
            'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 
            'Ecuador', 'Guyana', 'Paraguay', 'Peru', 'Suriname', 
            'Uruguay', 'Venezuela'
        ]
        
        if country_code not in south_american_countries:
            return Response(
                {'error': 'País no válido o no sudamericano'}, 
                status=400
            )
        
        with connection.cursor() as cursor:
            # Obtener estadísticas por año individual para el país
            cursor.execute("""
                SELECT 
                    substr(event_date, 1, 4) as year,
                    COUNT(*) as total_earthquakes,
                    AVG(max_mag_last90d) as avg_magnitude,
                    MAX(max_mag_last90d) as max_magnitude,
                    MIN(event_date) as first_date,
                    MAX(event_date) as last_date,
                    AVG(prob_m45_next7d) as avg_prob_7d,
                    AVG(prob_m50_next30d) as avg_prob_30d,
                    AVG(prob_m60_next90d) as avg_prob_90d
                FROM prediction 
                WHERE country_code = %s
                GROUP BY substr(event_date, 1, 4)
                ORDER BY year ASC
            """, [country_code])
            
            yearly_stats = cursor.fetchall()
        
            if not yearly_stats:
                return Response({
                    'country_code': country_code,
                    'period': 'Todos los años',
                    'total_earthquakes': 0,
                    'avg_magnitude': 0,
                    'max_magnitude': 0,
                    'first_date': None,
                    'last_date': None,
                    'avg_prob_7d': 0,
                    'avg_prob_30d': 0,
                    'avg_prob_90d': 0,
                    'recent_events': [],
                    'yearly_breakdown': []
                })
            
            # Calcular estadísticas generales sumando los totales de cada año
            total_earthquakes = sum(row[1] for row in yearly_stats)
            all_magnitudes = []
            all_prob_7d = []
            all_prob_30d = []
            all_prob_90d = []
            
            for row in yearly_stats:
                if row[2] is not None:  # Solo agregar si la magnitud no es None
                    all_magnitudes.extend([row[2]] * row[1])  # Repetir la magnitud promedio por la cantidad de eventos
                if row[6] is not None: 
                    all_prob_7d.extend([row[6]] * row[1])
                if row[7] is not None: 
                    all_prob_30d.extend([row[7]] * row[1])
                if row[8] is not None: 
                    all_prob_90d.extend([row[8]] * row[1])
            
            # Calcular estadísticas generales ponderadas por cantidad de eventos
            avg_magnitude = sum(all_magnitudes) / len(all_magnitudes) if all_magnitudes else 0
            avg_prob_7d = sum(all_prob_7d) / len(all_prob_7d) if all_prob_7d else 0
            avg_prob_30d = sum(all_prob_30d) / len(all_prob_30d) if all_prob_30d else 0
            avg_prob_90d = sum(all_prob_90d) / len(all_prob_90d) if all_prob_90d else 0
            
            # Obtener magnitud máxima general y fechas extremas
            max_magnitude = max((row[3] for row in yearly_stats if row[3] is not None), default=0)
            first_date = min((row[4] for row in yearly_stats if row[4] is not None), default=None)
            last_date = max((row[5] for row in yearly_stats if row[5] is not None), default=None)
            
            # Eventos recientes de todos los años
            cursor.execute("""
                SELECT 
                    event_date,
                    location,
                    max_mag_last90d,
                    prob_m45_next7d,
                    prob_m50_next30d,
                    prob_m60_next90d
                FROM prediction 
                WHERE country_code = %s
                ORDER BY event_date DESC
            """, [country_code])
            
            recent_events = []
            for row in cursor.fetchall():
                recent_events.append({
                    'date': str(row[0]),
                    'location': row[1] or 'N/A',
                    'magnitude': row[2] or 0,
                    'prob_7d': row[3] or 0,
                    'prob_30d': row[4] or 0,
                    'prob_90d': row[5] or 0
                })
        
        # Crear desglose por año
        yearly_breakdown = []
        for row in yearly_stats:
            yearly_breakdown.append({
                'year': row[0],
                'total_earthquakes': row[1],
                'avg_magnitude': row[2],
                'max_magnitude': row[3],
                'first_date': row[4],
                'last_date': row[5],
                'avg_prob_7d': row[6],
                'avg_prob_30d': row[7],
                'avg_prob_90d': row[8]
            })
        
        statistics = {
            'country_code': country_code,
            'period': 'Todos los años',
            'total_earthquakes': total_earthquakes,
            'avg_magnitude': avg_magnitude,
            'max_magnitude': max_magnitude,
            'first_date': first_date,
            'last_date': last_date,
            'avg_prob_7d': avg_prob_7d,
            'avg_prob_30d': avg_prob_30d,
            'avg_prob_90d': avg_prob_90d,
            'recent_events': recent_events,
            'yearly_breakdown': yearly_breakdown
        }
        
        return Response(statistics)
    
    except Exception as e:
        print(f"Error in country_all_years_statistics for {country_code}: {str(e)}")
        return Response(
            {
                'error': f'Error interno del servidor: {str(e)}',
                'country_code': country_code,
                'period': 'Todos los años'
            }, 
            status=500
        )

@api_view(['POST'])
def generate_prediction(request):
    """Generar predicción sísmica usando machine learning"""
    try:
        data = request.data
        country = data.get('country')
        timeframe = data.get('timeframe', '90d')
        
        if not country:
            return Response(
                {'error': 'País es requerido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar que el país sea sudamericano
        south_american_countries = [
            'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 
            'Ecuador', 'Guyana', 'Paraguay', 'Peru', 'Suriname', 
            'Uruguay', 'Venezuela'
        ]
        
        if country not in south_american_countries:
            return Response(
                {'error': 'País no válido o no sudamericano'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generar predicción usando ML
        prediction = ml_service.predict(country)
        
        if prediction:
            return Response({
                'success': True,
                'data': prediction
            })
        else:
            return Response({
                'success': False,
                'error': 'Error al generar predicción'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        logger.error(f"Error generating prediction: {str(e)}")
        return Response({
            'success': False,
            'error': f'Error interno del servidor: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def prediction_history(request):
    """Obtener historial de predicciones"""
    try:
        country = request.GET.get('country')
        
        with connection.cursor() as cursor:
            query = """
                SELECT 
                    country_code, event_date, location,
                    max_mag_last90d, prob_m45_next7d, prob_m50_next30d, prob_m60_next90d,
                    eq_count_m3_last7d, eq_count_m4_last30d, energy_sum_last365d
                FROM prediction
            """
            
            params = []
            if country:
                query += " WHERE country_code = %s"
                params.append(country)
            
            query += " ORDER BY event_date DESC LIMIT 100"
            
            cursor.execute(query, params)
            results = cursor.fetchall()
            
            history = []
            for row in results:
                # Calcular nivel de riesgo basado en probabilidades
                prob_7d = row[4] or 0
                if prob_7d > 0.3:
                    risk = 'very-high'
                elif prob_7d > 0.2:
                    risk = 'high'
                elif prob_7d > 0.1:
                    risk = 'medium'
                else:
                    risk = 'low'
                
                history.append({
                    'country': row[0],
                    'date': str(row[1]),
                    'location': row[2],
                    'magnitude': row[3],
                    'risk': risk,
                    'probability24h': (prob_7d * 0.3) * 100,
                    'probability7d': prob_7d * 100,
                    'probability30d': (row[5] or 0) * 100,
                    'earthquakes7d': row[7],
                    'earthquakes30d': row[8],
                    'energy365d': row[9]
                })
            
            return Response({
                'success': True,
                'data': history
            })
            
    except Exception as e:
        logger.error(f"Error fetching prediction history: {str(e)}")
        return Response({
            'success': False,
            'error': f'Error interno del servidor: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def prediction_accuracy(request):
    """Obtener precisión de las predicciones"""
    try:
        country = request.GET.get('country')
        
        with connection.cursor() as cursor:
            # Calcular precisión basada en etiquetas vs probabilidades
            query = """
                SELECT 
                    COUNT(*) as total_predictions,
                    AVG(CASE 
                        WHEN label_m45_next7d = 1 AND prob_m45_next7d > 0.2 THEN 1
                        WHEN label_m45_next7d = 0 AND prob_m45_next7d <= 0.2 THEN 1
                        ELSE 0
                    END) as accuracy_7d,
                    AVG(CASE 
                        WHEN label_m50_next30d = 1 AND prob_m50_next30d > 0.3 THEN 1
                        WHEN label_m50_next30d = 0 AND prob_m50_next30d <= 0.3 THEN 1
                        ELSE 0
                    END) as accuracy_30d
                FROM prediction
                WHERE label_m45_next7d IS NOT NULL AND prob_m45_next7d IS NOT NULL
            """
            
            params = []
            if country:
                query += " AND country_code = %s"
                params.append(country)
            
            cursor.execute(query, params)
            result = cursor.fetchone()
            
            if result and result[0] > 0:
                total_predictions, accuracy_7d, accuracy_30d = result
                overall_accuracy = (accuracy_7d + accuracy_30d) / 2
                
                return Response({
                    'success': True,
                    'data': {
                        'accuracy': round(overall_accuracy * 100, 2),
                        'totalPredictions': total_predictions,
                        'accuracy7d': round(accuracy_7d * 100, 2),
                        'accuracy30d': round(accuracy_30d * 100, 2)
                    }
                })
            else:
                return Response({
                    'success': True,
                    'data': {
                        'accuracy': 0,
                        'totalPredictions': 0,
                        'accuracy7d': 0,
                        'accuracy30d': 0
                    }
                })
                
    except Exception as e:
        logger.error(f"Error calculating prediction accuracy: {str(e)}")
        return Response({
            'success': False,
            'error': f'Error interno del servidor: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def train_models(request):
    """Entrenar modelos de machine learning"""
    try:
        data = request.data
        country = data.get('country')
        
        # Entrenar modelos
        success = ml_service.train_models(country_code=country)
        
        if success:
            return Response({
                'success': True,
                'message': f'Modelos entrenados exitosamente para {country or "todos los países"}'
            })
        else:
            return Response({
                'success': False,
                'error': 'Error al entrenar los modelos'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        logger.error(f"Error training models: {str(e)}")
        return Response({
            'success': False,
            'error': f'Error interno del servidor: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def prediction_features(request):
    """Obtener features disponibles para predicciones"""
    try:
        country = request.GET.get('country')
        
        with connection.cursor() as cursor:
            query = """
                SELECT 
                    country_code, event_date,
                    eq_count_m3_last7d, eq_count_m4_last30d, max_mag_last90d,
                    energy_sum_last365d, days_since_last_m5, gr_b_value_last365d,
                    gr_a_value_last365d, aftershock_rate, dist_to_fault_km,
                    fault_slip_rate_mm_yr, depth_to_slab_km, strain_rate,
                    gps_uplift_mm_yr, heat_flow_mw_m2, catalog_completeness_mc,
                    station_density, detection_threshold
                FROM prediction
            """
            
            params = []
            if country:
                query += " WHERE country_code = %s"
                params.append(country)
            
            query += " ORDER BY event_date DESC LIMIT 1"
            
            cursor.execute(query, params)
            result = cursor.fetchone()
            
            if result:
                features = {
                    'country': result[0],
                    'date': str(result[1]),
                    'eq_count_m3_last7d': result[2],
                    'eq_count_m4_last30d': result[3],
                    'max_mag_last90d': result[4],
                    'energy_sum_last365d': result[5],
                    'days_since_last_m5': result[6],
                    'gr_b_value_last365d': result[7],
                    'gr_a_value_last365d': result[8],
                    'aftershock_rate': result[9],
                    'dist_to_fault_km': result[10],
                    'fault_slip_rate_mm_yr': result[11],
                    'depth_to_slab_km': result[12],
                    'strain_rate': result[13],
                    'gps_uplift_mm_yr': result[14],
                    'heat_flow_mw_m2': result[15],
                    'catalog_completeness_mc': result[16],
                    'station_density': result[17],
                    'detection_threshold': result[18]
                }
                
                return Response({
                    'success': True,
                    'data': features
                })
            else:
                return Response({
                    'success': False,
                    'error': 'No se encontraron features para el país especificado'
                }, status=status.HTTP_404_NOT_FOUND)
                
    except Exception as e:
        logger.error(f"Error fetching prediction features: {str(e)}")
        return Response({
            'success': False,
            'error': f'Error interno del servidor: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
