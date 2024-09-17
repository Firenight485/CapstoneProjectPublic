# This file contain all the views that auto gen some locations from web scraping
# Most of these views are not actully used directly by the user
from rest_framework.generics import ListAPIView
from rest_framework.generics import ListCreateAPIView
from django.shortcuts import render
from django.utils import timezone
import requests, os
import json
import random
from django.http import JsonResponse, HttpResponse

from ..models import Location, Weather, AppUser, Comment, Message
from django.db.models.expressions import RawSQL
from ..serializers import LocationSerializer, WeatherSerializer, UserSerializer, CommentSerializer, MessageSerializer
from ..serializers import UserLoginSerializer, UserRegisterSerializer, UserSerializer
from django.views.decorators.csrf import csrf_exempt
from urllib.request import urlopen
from django.core import serializers
import re
from threading import Thread
import uuid
from numpy import array_split

from django.contrib.auth import get_user_model,login,logout
from bs4 import BeautifulSoup
from rest_framework.authentication import SessionAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions,status
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from ..validations import custom_validation, validate_email, validate_password, validate_username

STATE_NAMES = ["Alaska", "Alabama", "Arkansas", "American Samoa", "Arizona", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Guam", "Hawaii", "Iowa", "Idaho", "Illinois", "Indiana", "Kansas", "Kentucky", "Louisiana", "Massachusetts", "Maryland", "Maine", "Michigan", "Minnesota", "Missouri", "Mississippi", "Montana", "North-Carolina", "North-Dakota", "Nebraska", "New-Hampshire", "New-Jersey", "New-Mexico", "Nevada", "New-York", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Puerto-Rico", "Rhode-Island", "South-Carolina", "South-Dakota", "Tennessee", "Texas", "Utah", "Virginia", "Vermont", "Washington", "Wisconsin", "West-Virginia", "Wyoming", "International"]
ROUTE_NUM_THRESH = 800
BASE_URL = "https://www.mountainproject.com/route-guide"

# Gets name from a link
def parseUrl(link):
    index = link.rfind("/")
    name = link[index+1:]
    name = name.replace("-", " ")
    name = name.title()
    return name

# Gets state name from given link
def get_state(html):
    soup = BeautifulSoup(html, 'html.parser')
    div_paths = soup.find('div', {"class": "mb-half small text-warm"})
    urls = []
    for url in div_paths.find_all('a'):
        area_url = url.get('href')
        if (area_url is None):
            continue
        if (area_url.find("area") < 0):
            continue
        urls.append(area_url)
    if len(urls) == 0:
        return ""
    return parseUrl(urls[0])

# Scrapes the main info of the climbing location and puts it into a dict
def scrap_url(url):
    page = urlopen(url)
    html = page.read().decode("utf-8")

    # Finds the decimal coordinates, Longitude then Latitude for some reason
    coord_pattern = "[+-]?\d+\.\d{1,}\,[+-]?\d+\.\d{1,}"
    coord_results = re.search(coord_pattern, html, re.IGNORECASE)
    if coord_results is None:
        return None
    coords = coord_results.group()
    split = coords.index(",")

    views_pattern = "\d*,?\d*/month"
    views_results = re.search(views_pattern, html, re.IGNORECASE)
    views = views_results.group()
    views = views.replace(",", "")
    num_split = views.index("/")
    views = views[:num_split]

    location = {
        "name" : parseUrl(url).rstrip(),
        "latitude": float(coords[split+1:]),
        "longitude": float(coords[:split+1].replace(',','')),
        "monthly_page_views": views,
        "state": get_state(html)
    }
    return location

# Grabs all urls from the base page
def get_area_urls():
    all_urls=[]
    reqs = requests.get(BASE_URL)
    soup = BeautifulSoup(reqs.text, 'html.parser')
    for link in soup.find_all('a'):
        area_link = link.get('href')
        if (area_link is None):
            continue
        if (area_link.find("area") < 0 or area_link.find("in-progress") > 0):
            continue
        all_urls.append(area_link)
    return all_urls


def filter_states(url):
    for i in range(len(STATE_NAMES)):
        if url.find(STATE_NAMES[i].lower()) > 0:
            return True
    return False


def filter_dups(urls_array):
    urls_seen = []
    filtered_urls = []
    for i in range(len(urls_array)):
        # Filters outs base State Links
        if filter_states(urls_array[i]):
            continue
        if urls_array[i] not in urls_seen:
            filtered_urls.append(urls_array[i])
            urls_seen.append(urls_array[i])
    return filtered_urls

def scrap_area_info(filtered_urls):
    info = []
    for i in range(len(filtered_urls)):
        scraped_url = scrap_url(filtered_urls[i])
        if scraped_url is not None:
            info.append(scraped_url)
    return info

# converts state into values that are stored in the database
def state_conversion(state):
    for pair in Location.STATE_CHOICES:
        if pair[1].lower() == state.lower():
            return pair[0]
    return 'Error'

# saves all the info scraped to the database in Location modells
def save_info(request):
    locations = []
    num_threads = 15

    def scrap_area_info(filtered_urls):
        for i in range(len(filtered_urls)):
            scraped_url = scrap_url(filtered_urls[i])
            if scraped_url is not None:
                locations.append(scraped_url)

    # Uses threading to make it faster
    locations_tmp = array_split(filter_dups(get_area_urls()), num_threads)
    threads = []
    for i in range(num_threads):
        thread = Thread(target=scrap_area_info, args=[locations_tmp[i]])
        threads.append(thread)
        thread.start()

    for thread in threads:
        thread.join(timeout=5*60)

    # randomize some of the values to get a variety of samples
    for (i, location) in enumerate(locations):
        ct_num = random.randint(1,4)
        types = random.sample(Location.CLIMBING_TYPE_CHOICES,ct_num)
        ctypes = json.dumps(types)
        rt_choice = random.randint(0,4)
        dl_choice = random.randint(0,2)
        diff_level = Location.DIFFICULTY_LEVEL_CHOICES[dl_choice][0]
        rockType= Location.ROCK_TYPE_CHOICES[rt_choice][0]
        temp_loc = Location(name = location['name'], latitude = location['latitude'], longitude = location['longitude'], state = state_conversion(location['state']), 
                            location_id = uuid.uuid4(), monthly_page_views = location['monthly_page_views'], difficulty_level = diff_level, rock_type = rockType,
                            climbing_type = ctypes)
        temp_loc.save()
    return HttpResponse("Saved to Database")

