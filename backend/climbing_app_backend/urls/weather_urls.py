from django.urls import path
from ..views import weather_views

urlpatterns = [
    path('weather/get/', weather_views.weather_data, name= 'weather'),
]
