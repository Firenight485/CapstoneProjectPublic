# This is just a test file where we expiremented with the weather api
import requests
import json
from django.http import JsonResponse, HttpResponse
from datetime import datetime

latitude = 35.449
longitude = -82.2143 
#api_url = f'https://api.tomorrow.io/v4/weather/forecast?location={latitude},{longitude}&timesteps=1h&units=imperial&apikey=YIgF03zeoibQb9GtdM602uNqQsWDqinR'
#gen_info = requests.get(api_url).json()

"""
data = {
    "humidty" : gen_info["timelines"]["daily"][1]["values"]['humidityAvg'],
    "temp" : gen_info["timelines"]["daily"][1]["values"]['temperatureAvg'],
    "tempApp" : gen_info["timelines"]["daily"][1]["values"]['temperatureApparentAvg'],
    "tempMax" : gen_info["timelines"]["daily"][1]["values"]['temperatureMax'],
    "tempMin" : gen_info["timelines"]["daily"][1]["values"]['temperatureMin'],
    "wind" : gen_info["timelines"]["daily"][1]["values"]['windGustAvg']
}

print(data)
"""
print(datetime.today().strftime('%Y-%m-%d'))

def daily_weather_data(request):
    area = request.GET['name']
    location = Location.objects.get(name__iexact=area)
    date = datetime.today().strftime('%Y-%m-%d')
    allDayWeatherData = []

    latitude = location.latitude
    longitude = location.longitude
    # From the National Weather Database. The general info for the location
    gen_info = requests.get(f'https://api.weather.gov/points/{latitude},{longitude}').json()
    hourly_forecast = requests.get(gen_info["properties"]["forecastHourly"])['properties']["periods"].json()
    dayWeatherData = []
    for x in hourly_forecast:
        start_time = x["startTime"]
        if date in start_time:
            data = {
                "startTime": start_time[11:13],
                "temp": x["temperature"],
                "precip": x["probabilityOfPrecipitation"]["value"],
                "humidity": x["relativeHumidity"]["value"],
                "windSpeed": x["windSpeed"],
                "fdesc": x["shortForecast"]
            }
            dayWeatherData.append(data)
        to_send = {
            "name": location.name,
            "id": location.location_id,
            "weatherData": dayWeatherData
        }
        allDayWeatherData.append(to_send)


"""
def daily_weather_data(request):
    date = datetime.today().strftime('%Y-%m-%d')
    all_day_weather_data = []
    locations = Location.objects.all()

    for location in locations:
        latitude = location.latitude
        longitude = location.longitude

        # Using tomorrow.io API
        api_url = f'https://api.tomorrow.io/v4/weather/forecast?location={latitude},{longitude}&apikey=YIgF03zeoibQb9GtdM602uNqQsWDqinR'
        gen_info = requests.get(api_url).json()

        # Adjust the parsing based on the actual structure of the tomorrow.io response
        hourly_forecast = gen_info.get("hourly", {}).get("data", [])

        day_weather_data = []

        for x in hourly_forecast:
            start_time = x.get("timestampLocal", "")
            if date in start_time:
                data = {
                    "startTime": start_time[11:13],
                    "temp": x.get("temperature", {}).get("value", ""),
                    "precip": x.get("precipitationProbability", ""),
                    "humidity": x.get("humidity", {}).get("value", ""),
                    "windSpeed": x.get("windSpeed", {}).get("value", ""),
                    "fdesc": x.get("shortForecast", ""),
                    "visibility": x.get("visibility", {}).get("value", ""),
                    "windDirection": x.get("windDirection", {}).get("value", ""),
                }
                day_weather_data.append(data)

        to_send = {
            "name": location.name,
            "id": location.location_id,
            "weatherData": day_weather_data
        }

        all_day_weather_data.append(to_send)

    return JsonResponse(json.dumps(all_day_weather_data), safe=False)
"""