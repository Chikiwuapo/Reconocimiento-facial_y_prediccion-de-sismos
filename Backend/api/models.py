from django.db import models

# Create your models here.

class EarthquakePrediction(models.Model):
    record_id = models.AutoField(primary_key=True)
    cell_id = models.CharField(max_length=50, null=True, blank=True)
    country_code = models.CharField(max_length=100, null=True, blank=True)
    admin_region = models.CharField(max_length=100, null=True, blank=True)
    event_date = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=200, null=True, blank=True)
    eq_count_m3_last7d = models.IntegerField(null=True, blank=True)
    eq_count_m4_last30d = models.IntegerField(null=True, blank=True)
    max_mag_last90d = models.FloatField(null=True, blank=True)
    energy_sum_last365d = models.FloatField(null=True, blank=True)
    days_since_last_m5 = models.IntegerField(null=True, blank=True)
    gr_b_value_last365d = models.FloatField(null=True, blank=True)
    gr_a_value_last365d = models.FloatField(null=True, blank=True)
    aftershock_rate = models.FloatField(null=True, blank=True)
    dist_to_fault_km = models.FloatField(null=True, blank=True)
    fault_slip_rate_mm_yr = models.FloatField(null=True, blank=True)
    plate_boundary_type = models.CharField(max_length=50, null=True, blank=True)
    depth_to_slab_km = models.FloatField(null=True, blank=True)
    strain_rate = models.FloatField(null=True, blank=True)
    gps_uplift_mm_yr = models.FloatField(null=True, blank=True)
    heat_flow_mw_m2 = models.FloatField(null=True, blank=True)
    catalog_completeness_mc = models.FloatField(null=True, blank=True)
    station_density = models.FloatField(null=True, blank=True)
    detection_threshold = models.FloatField(null=True, blank=True)
    prob_m45_next7d = models.FloatField(null=True, blank=True)
    prob_m50_next30d = models.FloatField(null=True, blank=True)
    prob_m60_next90d = models.FloatField(null=True, blank=True)
    label_m45_next7d = models.IntegerField(null=True, blank=True)
    label_m50_next30d = models.IntegerField(null=True, blank=True)
    label_m60_next90d = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'prediction'
        managed = False  # Django no gestionará esta tabla, solo la leerá

    def __str__(self):
        return f"{self.country_code} - {self.event_date} - M{self.max_mag_last90d}"

class CountrySummary(models.Model):
    """Modelo para resumir datos por país"""
    country_code = models.CharField(max_length=100, primary_key=True)
    country_name = models.CharField(max_length=100)
    total_records = models.IntegerField(default=0)
    avg_magnitude = models.FloatField(null=True, blank=True)
    max_magnitude = models.FloatField(null=True, blank=True)
    avg_prob_7d = models.FloatField(null=True, blank=True)
    avg_prob_30d = models.FloatField(null=True, blank=True)
    avg_prob_90d = models.FloatField(null=True, blank=True)
    latest_date = models.DateField(null=True, blank=True)
    risk_level = models.CharField(max_length=20, default='low')
    coordinates = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.country_name} ({self.country_code})"

    @property
    def risk_level_display(self):
        """Calcular nivel de riesgo basado en probabilidades"""
        if self.avg_prob_7d and self.avg_prob_7d > 0.3:
            return 'very-high'
        elif self.avg_prob_7d and self.avg_prob_7d > 0.2:
            return 'high'
        elif self.avg_prob_7d and self.avg_prob_7d > 0.1:
            return 'medium'
        else:
            return 'low'
