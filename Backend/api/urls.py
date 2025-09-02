from django.urls import path
from . import views

urlpatterns = [
    path('countries/south-american/', views.south_american_countries, name='south_american_countries'),
    path('countries/<str:country_code>/all-years/', views.country_all_years_statistics, name='country_all_years_statistics'),
    path('countries/<str:country_code>/year/<int:year>/', views.country_yearly_statistics, name='country_yearly_statistics'),
    path('countries/<str:country_code>/', views.country_details, name='country_details'),
    path('statistics/', views.earthquake_statistics, name='earthquake_statistics'),
    path('statistics/year/<int:year>/', views.yearly_statistics, name='yearly_statistics'),
    path('statistics/all-years/', views.all_years_statistics, name='all_years_statistics'),
    path('dashboard/', views.dashboard_data, name='dashboard_data'),
    # Nuevos endpoints para predicciones
    path('predictions/generate', views.generate_prediction, name='generate_prediction'),
    path('predictions/history', views.prediction_history, name='prediction_history'),
    path('predictions/accuracy', views.prediction_accuracy, name='prediction_accuracy'),
    path('predictions/train', views.train_models, name='train_models'),
    path('predictions/features', views.prediction_features, name='prediction_features'),
]
