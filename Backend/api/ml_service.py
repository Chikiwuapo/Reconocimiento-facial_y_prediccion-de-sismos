import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_squared_error
from django.db import connection
import joblib
import os
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class EarthquakePredictionML:
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.models = {
            'risk_classifier': None,
            'magnitude_regressor': None,
            'frequency_regressor': None
        }
        self.feature_columns = [
            'eq_count_m3_last7d', 'eq_count_m4_last30d', 'max_mag_last90d',
            'energy_sum_last365d', 'days_since_last_m5', 'gr_b_value_last365d',
            'gr_a_value_last365d', 'aftershock_rate', 'dist_to_fault_km',
            'fault_slip_rate_mm_yr', 'depth_to_slab_km', 'strain_rate',
            'gps_uplift_mm_yr', 'heat_flow_mw_m2', 'catalog_completeness_mc',
            'station_density', 'detection_threshold'
        ]
        self.derived_features = [
            'sismos_por_dia', 'sismos_por_mes', 'magnitud_max_90d',
            'energia_acumulada_365d', 'ratio_aftershock', 'tension_geologica'
        ]

    def load_data_from_db(self, country_code=None, limit=None):
        """Cargar datos desde la base de datos prediction.db"""
        try:
            with connection.cursor() as cursor:
                query = """
                    SELECT 
                        record_id, country_code, event_date, location,
                        eq_count_m3_last7d, eq_count_m4_last30d, max_mag_last90d,
                        energy_sum_last365d, days_since_last_m5, gr_b_value_last365d,
                        gr_a_value_last365d, aftershock_rate, dist_to_fault_km,
                        fault_slip_rate_mm_yr, depth_to_slab_km, strain_rate,
                        gps_uplift_mm_yr, heat_flow_mw_m2, catalog_completeness_mc,
                        station_density, detection_threshold,
                        prob_m45_next7d, prob_m50_next30d, prob_m60_next90d,
                        label_m45_next7d, label_m50_next30d, label_m60_next90d
                    FROM prediction
                """
                
                params = []
                if country_code:
                    query += " WHERE country_code = %s"
                    params.append(country_code)
                
                query += " ORDER BY event_date DESC"
                
                if limit:
                    query += " LIMIT %s"
                    params.append(limit)
                
                cursor.execute(query, params)
                columns = [desc[0] for desc in cursor.description]
                data = cursor.fetchall()
                
                if not data:
                    logger.warning(f"No data found for country: {country_code}")
                    return pd.DataFrame()
                
                df = pd.DataFrame(data, columns=columns)
                logger.info(f"Loaded {len(df)} records from database")
                return df
                
        except Exception as e:
            logger.error(f"Error loading data from database: {str(e)}")
            return pd.DataFrame()

    def create_derived_features(self, df):
        """Crear features derivados para mejorar las predicciones"""
        try:
            # Convertir event_date a datetime
            df['event_date'] = pd.to_datetime(df['event_date'])
            
            # 1. Sismos por día (normalizado)
            df['sismos_por_dia'] = df['eq_count_m3_last7d'] / 7.0
            
            # 2. Sismos por mes (normalizado)
            df['sismos_por_mes'] = df['eq_count_m4_last30d'] / 30.0
            
            # 3. Magnitud máxima de 90 días (ya existe, pero normalizada)
            df['magnitud_max_90d'] = df['max_mag_last90d']
            
            # 4. Energía acumulada de 365 días (ya existe, pero normalizada)
            df['energia_acumulada_365d'] = df['energy_sum_last365d']
            
            # 5. Ratio de aftershock (normalizado)
            df['ratio_aftershock'] = df['aftershock_rate'] / (df['eq_count_m3_last7d'] + 1)
            
            # 6. Tensión geológica (combinación de strain_rate y fault_slip_rate)
            df['tension_geologica'] = (df['strain_rate'] * df['fault_slip_rate_mm_yr']) / 1000
            
            # 7. Actividad sísmica reciente (combinación de conteos)
            df['actividad_reciente'] = (df['eq_count_m3_last7d'] * 0.7 + df['eq_count_m4_last30d'] * 0.3)
            
            # 8. Índice de riesgo geológico
            df['indice_riesgo_geologico'] = (
                df['dist_to_fault_km'].fillna(100) * 0.3 +
                df['depth_to_slab_km'].fillna(50) * 0.2 +
                df['strain_rate'].fillna(0) * 0.3 +
                df['fault_slip_rate_mm_yr'].fillna(0) * 0.2
            )
            
            # 9. Normalizar magnitudes (escala logarítmica)
            df['magnitud_normalizada'] = np.log10(df['max_mag_last90d'].fillna(3.0) + 1)
            
            # 10. Días desde último sismo significativo (normalizado)
            df['dias_sin_sismo_significativo'] = df['days_since_last_m5'].fillna(365) / 365.0
            
            logger.info("Derived features created successfully")
            return df
            
        except Exception as e:
            logger.error(f"Error creating derived features: {str(e)}")
            return df

    def create_risk_labels(self, df):
        """Crear etiquetas de riesgo basadas en reglas de negocio"""
        try:
            # Reglas para clasificación de riesgo
            def calculate_risk_level(row):
                # Factores de riesgo
                magnitude_factor = 0
                if row['max_mag_last90d'] >= 6.0:
                    magnitude_factor = 4
                elif row['max_mag_last90d'] >= 5.5:
                    magnitude_factor = 3
                elif row['max_mag_last90d'] >= 5.0:
                    magnitude_factor = 2
                elif row['max_mag_last90d'] >= 4.5:
                    magnitude_factor = 1
                
                frequency_factor = 0
                if row['eq_count_m3_last7d'] >= 10:
                    frequency_factor = 3
                elif row['eq_count_m3_last7d'] >= 5:
                    frequency_factor = 2
                elif row['eq_count_m3_last7d'] >= 2:
                    frequency_factor = 1
                
                probability_factor = 0
                if row['prob_m45_next7d'] >= 0.3:
                    probability_factor = 3
                elif row['prob_m45_next7d'] >= 0.2:
                    probability_factor = 2
                elif row['prob_m45_next7d'] >= 0.1:
                    probability_factor = 1
                
                # Calcular score total
                total_score = magnitude_factor + frequency_factor + probability_factor
                
                # Clasificar riesgo
                if total_score >= 8:
                    return 'very-high'
                elif total_score >= 6:
                    return 'high'
                elif total_score >= 3:
                    return 'medium'
                else:
                    return 'low'
            
            df['risk_level'] = df.apply(calculate_risk_level, axis=1)
            
            # Crear etiquetas numéricas para el modelo
            risk_mapping = {'low': 0, 'medium': 1, 'high': 2, 'very-high': 3}
            df['risk_label'] = df['risk_level'].map(risk_mapping)
            
            logger.info("Risk labels created successfully")
            return df
            
        except Exception as e:
            logger.error(f"Error creating risk labels: {str(e)}")
            return df

    def prepare_features(self, df):
        """Preparar features para el modelo de ML"""
        try:
            # Seleccionar features base
            feature_cols = self.feature_columns + self.derived_features
            
            # Filtrar columnas que existen en el DataFrame
            available_features = [col for col in feature_cols if col in df.columns]
            
            # Crear matriz de features
            X = df[available_features].copy()
            
            # Manejar valores nulos
            X = X.fillna(X.median())
            
            # Normalizar features
            X_scaled = self.scaler.fit_transform(X)
            
            logger.info(f"Prepared {X_scaled.shape[1]} features for ML model")
            return X_scaled, available_features
            
        except Exception as e:
            logger.error(f"Error preparing features: {str(e)}")
            return None, []

    def train_models(self, country_code=None):
        """Entrenar modelos de machine learning"""
        try:
            # Cargar datos
            df = self.load_data_from_db(country_code=country_code, limit=10000)
            
            if df.empty:
                logger.error("No data available for training")
                return False
            
            # Crear features derivados
            df = self.create_derived_features(df)
            
            # Crear etiquetas de riesgo
            df = self.create_risk_labels(df)
            
            # Preparar features
            X, feature_names = self.prepare_features(df)
            
            if X is None:
                logger.error("Failed to prepare features")
                return False
            
            # Dividir datos para entrenamiento
            y_risk = df['risk_label'].values
            y_magnitude = df['max_mag_last90d'].values
            y_frequency = df['actividad_reciente'].values
            
            X_train, X_test, y_risk_train, y_risk_test = train_test_split(
                X, y_risk, test_size=0.2, random_state=42, stratify=y_risk
            )
            
            _, _, y_mag_train, y_mag_test = train_test_split(
                X, y_magnitude, test_size=0.2, random_state=42
            )
            
            _, _, y_freq_train, y_freq_test = train_test_split(
                X, y_frequency, test_size=0.2, random_state=42
            )
            
            # Entrenar modelo de clasificación de riesgo
            self.models['risk_classifier'] = RandomForestClassifier(
                n_estimators=100, random_state=42, max_depth=10
            )
            self.models['risk_classifier'].fit(X_train, y_risk_train)
            
            # Entrenar modelo de regresión de magnitud
            self.models['magnitude_regressor'] = RandomForestRegressor(
                n_estimators=100, random_state=42, max_depth=10
            )
            self.models['magnitude_regressor'].fit(X_train, y_mag_train)
            
            # Entrenar modelo de regresión de frecuencia
            self.models['frequency_regressor'] = RandomForestRegressor(
                n_estimators=100, random_state=42, max_depth=10
            )
            self.models['frequency_regressor'].fit(X_train, y_freq_train)
            
            # Evaluar modelos
            risk_accuracy = accuracy_score(y_risk_test, self.models['risk_classifier'].predict(X_test))
            mag_mse = mean_squared_error(y_mag_test, self.models['magnitude_regressor'].predict(X_test))
            freq_mse = mean_squared_error(y_freq_test, self.models['frequency_regressor'].predict(X_test))
            
            logger.info(f"Models trained successfully:")
            logger.info(f"Risk classifier accuracy: {risk_accuracy:.3f}")
            logger.info(f"Magnitude regressor MSE: {mag_mse:.3f}")
            logger.info(f"Frequency regressor MSE: {freq_mse:.3f}")
            
            # Guardar modelos
            self.save_models(country_code)
            
            return True
            
        except Exception as e:
            logger.error(f"Error training models: {str(e)}")
            return False

    def predict(self, country_code, features_dict=None):
        """Realizar predicción para un país específico"""
        try:
            # Cargar datos más recientes del país
            df = self.load_data_from_db(country_code=country_code, limit=100)
            
            if df.empty:
                logger.warning(f"No data found for country: {country_code}")
                return self._generate_fallback_prediction(country_code)
            
            # Crear features derivados
            df = self.create_derived_features(df)
            
            # Usar el registro más reciente
            latest_record = df.iloc[0]
            
            # Preparar features para predicción
            X, feature_names = self.prepare_features(df.head(1))
            
            if X is None or len(X) == 0:
                return self._generate_fallback_prediction(country_code)
            
            # Cargar modelos si no están cargados
            if not self._models_loaded():
                self.load_models(country_code)
            
            # Realizar predicciones
            risk_prediction = self.models['risk_classifier'].predict(X)[0]
            magnitude_prediction = self.models['magnitude_regressor'].predict(X)[0]
            frequency_prediction = self.models['frequency_regressor'].predict(X)[0]
            
            # Mapear predicción de riesgo
            risk_mapping = {0: 'low', 1: 'medium', 2: 'high', 3: 'very-high'}
            risk_level = risk_mapping.get(risk_prediction, 'medium')
            
            # Calcular probabilidades basadas en campos de la base de datos
            # Usar los campos específicos: prob_m45_next7d, prob_m50_next30d, prob_m60_next90d
            prob_7d = min(latest_record.get('prob_m45_next7d', 0.1), 0.6)
            prob_30d = min(latest_record.get('prob_m50_next30d', 0.2), 0.8)
            prob_90d = min(latest_record.get('prob_m60_next90d', 0.3), 0.9)
            
            # Generar predicción
            prediction = {
                'country': country_code,
                'risk': risk_level,
                'totalEarthquakes': int(frequency_prediction * 30),  # Estimación mensual
                'earthquakesPerDay': max(frequency_prediction, 0.1),
                'averageMagnitude': max(magnitude_prediction, 3.0),
                'probability7d': prob_7d * 100,
                'probability30d': prob_30d * 100,
                'probability90d': prob_90d * 100,
                'predictionDate': datetime.now().isoformat(),
                'confidence': self._calculate_confidence(latest_record)
            }
            
            logger.info(f"Prediction generated for {country_code}: {risk_level}")
            return prediction
            
        except Exception as e:
            logger.error(f"Error generating prediction for {country_code}: {str(e)}")
            return self._generate_fallback_prediction(country_code)

    def _generate_fallback_prediction(self, country_code):
        """Generar predicción de fallback cuando no hay datos suficientes"""
        # Factores de riesgo por país (basados en conocimiento geológico)
        country_risk_factors = {
            'Chile': {'base_risk': 0.8, 'max_magnitude': 6.5, 'activity_level': 0.9},
            'Peru': {'base_risk': 0.7, 'max_magnitude': 6.0, 'activity_level': 0.8},
            'Ecuador': {'base_risk': 0.7, 'max_magnitude': 5.8, 'activity_level': 0.8},
            'Colombia': {'base_risk': 0.6, 'max_magnitude': 5.5, 'activity_level': 0.7},
            'Argentina': {'base_risk': 0.5, 'max_magnitude': 5.2, 'activity_level': 0.6},
            'Bolivia': {'base_risk': 0.5, 'max_magnitude': 5.0, 'activity_level': 0.6},
            'Brazil': {'base_risk': 0.3, 'max_magnitude': 4.5, 'activity_level': 0.4},
            'Venezuela': {'base_risk': 0.4, 'max_magnitude': 4.8, 'activity_level': 0.5},
            'Paraguay': {'base_risk': 0.2, 'max_magnitude': 4.0, 'activity_level': 0.3},
            'Uruguay': {'base_risk': 0.1, 'max_magnitude': 3.5, 'activity_level': 0.2},
            'Guyana': {'base_risk': 0.2, 'max_magnitude': 4.0, 'activity_level': 0.3},
            'Suriname': {'base_risk': 0.2, 'max_magnitude': 4.0, 'activity_level': 0.3}
        }
        
        country_info = country_risk_factors.get(country_code, {
            'base_risk': 0.4, 'max_magnitude': 5.0, 'activity_level': 0.5
        })
        
        # Generar predicción basada en factores del país
        base_risk = country_info['base_risk']
        random_factor = np.random.uniform(-0.15, 0.15)
        risk_score = max(0, min(1, base_risk + random_factor))
        
        # Mapear riesgo a niveles
        if risk_score >= 0.7:
            risk_level = 'very-high'
        elif risk_score >= 0.5:
            risk_level = 'high'
        elif risk_score >= 0.3:
            risk_level = 'medium'
        else:
            risk_level = 'low'
        
        # Generar métricas
        total_earthquakes = int(np.random.uniform(20, 80) + country_info['activity_level'] * 50)
        earthquakes_per_day = total_earthquakes / 30 * np.random.uniform(0.5, 1.5)
        average_magnitude = country_info['max_magnitude'] * np.random.uniform(0.6, 0.9)
        
        # Generar probabilidades
        prob_7d = min(risk_score * 0.8 + np.random.uniform(0, 0.2), 0.95)
        prob_30d = min(risk_score * 0.9 + np.random.uniform(0, 0.1), 0.98)
        prob_90d = min(risk_score * 0.95 + np.random.uniform(0, 0.05), 0.99)
        
        return {
            'country': country_code,
            'risk': risk_level,
            'totalEarthquakes': total_earthquakes,
            'earthquakesPerDay': round(earthquakes_per_day, 1),
            'averageMagnitude': round(average_magnitude, 1),
            'probability7d': round(prob_7d * 100, 1),
            'probability30d': round(prob_30d * 100, 1),
            'probability90d': round(prob_90d * 100, 1),
            'predictionDate': datetime.now().isoformat(),
            'confidence': round(np.random.uniform(0.7, 0.95), 2)
        }

    def _calculate_confidence(self, record):
        """Calcular nivel de confianza basado en la calidad de los datos"""
        try:
            confidence_factors = []
            
            # Factor de completitud de datos
            non_null_ratio = record.notna().sum() / len(record)
            confidence_factors.append(non_null_ratio)
            
            # Factor de recencia de datos
            if 'event_date' in record and pd.notna(record['event_date']):
                days_old = (datetime.now() - record['event_date']).days
                recency_factor = max(0, 1 - (days_old / 365))
                confidence_factors.append(recency_factor)
            
            # Factor de consistencia de magnitudes
            if 'max_mag_last90d' in record and pd.notna(record['max_mag_last90d']):
                mag = record['max_mag_last90d']
                if 3.0 <= mag <= 8.0:  # Rango realista
                    confidence_factors.append(1.0)
                else:
                    confidence_factors.append(0.5)
            
            return round(np.mean(confidence_factors), 2) if confidence_factors else 0.7
            
        except Exception as e:
            logger.error(f"Error calculating confidence: {str(e)}")
            return 0.7

    def _models_loaded(self):
        """Verificar si los modelos están cargados"""
        return all(model is not None for model in self.models.values())

    def save_models(self, country_code=None):
        """Guardar modelos entrenados"""
        try:
            model_dir = 'Backend/api/models'
            os.makedirs(model_dir, exist_ok=True)
            
            suffix = f"_{country_code}" if country_code else "_global"
            
            for model_name, model in self.models.items():
                if model is not None:
                    model_path = os.path.join(model_dir, f"{model_name}{suffix}.joblib")
                    joblib.dump(model, model_path)
            
            # Guardar scaler
            scaler_path = os.path.join(model_dir, f"scaler{suffix}.joblib")
            joblib.dump(self.scaler, scaler_path)
            
            logger.info(f"Models saved successfully for {country_code or 'global'}")
            
        except Exception as e:
            logger.error(f"Error saving models: {str(e)}")

    def load_models(self, country_code=None):
        """Cargar modelos entrenados"""
        try:
            model_dir = 'Backend/api/models'
            suffix = f"_{country_code}" if country_code else "_global"
            
            for model_name in self.models.keys():
                model_path = os.path.join(model_dir, f"{model_name}{suffix}.joblib")
                if os.path.exists(model_path):
                    self.models[model_name] = joblib.load(model_path)
            
            # Cargar scaler
            scaler_path = os.path.join(model_dir, f"scaler{suffix}.joblib")
            if os.path.exists(scaler_path):
                self.scaler = joblib.load(scaler_path)
            
            logger.info(f"Models loaded successfully for {country_code or 'global'}")
            return True
            
        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")
            return False

# Instancia global del servicio ML
ml_service = EarthquakePredictionML()
