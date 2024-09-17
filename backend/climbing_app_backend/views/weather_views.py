# This calls the National Weather API
from rest_framework.generics import ListAPIView
from rest_framework.generics import ListCreateAPIView
from django.shortcuts import render
from django.utils import timezone
import requests
import json
from django.http import JsonResponse, HttpResponse

from ..models import Location, Weather, AppUser, Comment, Message
from django.views.decorators.csrf import csrf_exempt
from django.core import serializers


from rest_framework.authentication import SessionAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions,status
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
# Gets wather data for a location
def weather_data(request):
    area = request.GET['name'].replace('+', ' ')
    location = Location.objects.get(name__iexact=area)
    latitude = location.latitude
    longitude = location.longitude

    in_database = Weather.objects.filter(name__exact=location).exists()
    # If in the data get that data
    if in_database:
        print("Searches in database first")
        weatherObject = Weather.objects.get(name__exact=location)
        time_got = weatherObject.timestamp.replace(tzinfo=None).astimezone()
        time_now = timezone.now().astimezone()
        difference = time_now.second - time_got.second

        # if not updated in 3 hours, then re get the weather
        if abs(difference) >= 3 * 3600:
            print('Not updated in at least 3 hours')
            weatherObject.delete()
        else:
            to_send = Weather.objects.filter(name__exact=location)
            location_weather = serializers.serialize('json',to_send)
            return HttpResponse(location_weather, content_type='application/json')

    print("Creates Object")
    # From the National Weather Database. The general info for the location
    gen_info = requests.get(f'https://api.weather.gov/points/{latitude},{longitude}').json()
    hourly_forecast_link = requests.get(gen_info["properties"]["forecastHourly"]).json()
    hourly_forecast = hourly_forecast_link['properties']["periods"]
    hourlyWeatherData = []
    for x in hourly_forecast:
        start_time = x["startTime"]
        data = {
            "startTime": start_time[11:13],
            "temp": x["temperature"],
            "precip": x["probabilityOfPrecipitation"]["value"],
            "humidity": x["relativeHumidity"]["value"],
            "windSpeed": x["windSpeed"],
            "fdesc": x["shortForecast"],
        }
        hourlyWeatherData.append(data)

    daily_forecast_link = requests.get(gen_info["properties"]["forecast"]).json()
    daily_forecast = daily_forecast_link['properties']["periods"]
    dailyWeatherData = []
    for x in daily_forecast:
        start_time = x["startTime"]
        data = {
            "timePeriod" : x['name'],
            "startTime": start_time[11:13],
            "temp": x["temperature"],
            "precip": x["probabilityOfPrecipitation"]["value"],
            "humidity": x["relativeHumidity"]["value"],
            "windSpeed": x["windSpeed"],
            "fdesc": x["shortForecast"],
        }
        dailyWeatherData.append(data)
    hourlyWeatherData = json.dumps(hourlyWeatherData)
    dailyWeatherData = json.dumps(dailyWeatherData)
    weatherObject = Weather(name = location, hourly_forecast = hourlyWeatherData, daily_forecast = dailyWeatherData)
    weatherObject.save()
    to_send = Weather.objects.filter(name__exact=location)
    location_weather = serializers.serialize('json',to_send)
    return HttpResponse(location_weather, content_type='application/json')