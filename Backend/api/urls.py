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
    path('chat/', views.chat_with_bot, name='chat_with_bot'),
    path('chat/history/', views.get_chat_history, name='chat_history'),
]
