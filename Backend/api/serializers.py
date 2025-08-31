from rest_framework import serializers
from .models import EarthquakePrediction, CountrySummary

class EarthquakePredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EarthquakePrediction
        fields = '__all__'

class CountrySummarySerializer(serializers.ModelSerializer):
    risk_level_display = serializers.CharField(read_only=True)
    
    class Meta:
        model = CountrySummary
        fields = [
            'country_code', 'country_name', 'total_records', 
            'avg_magnitude', 'max_magnitude', 'avg_prob_7d', 
            'avg_prob_30d', 'avg_prob_90d', 'latest_date', 
            'risk_level', 'coordinates', 'risk_level_display'
        ]

class CountryDataSerializer(serializers.Serializer):
    """Serializer para datos de países sudamericanos"""
    id = serializers.CharField()
    name = serializers.CharField()
    code = serializers.CharField()
    coordinates = serializers.ListField(child=serializers.FloatField())
    riskLevel = serializers.CharField()
    lastEarthquake = serializers.DateField()
    magnitude = serializers.FloatField()
    total_records = serializers.IntegerField()
    avg_prob_7d = serializers.FloatField()
    avg_prob_30d = serializers.FloatField()
    avg_prob_90d = serializers.FloatField()
