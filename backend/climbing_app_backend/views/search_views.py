# This file contains all the views that provide the search functionality
from rest_framework.generics import ListAPIView
from rest_framework.generics import ListCreateAPIView
from django.shortcuts import render
import requests, os
from django.http import JsonResponse, HttpResponse
import json
from ..models import Location, Weather, AppUser, Comment, Message
from django.db.models.expressions import RawSQL
from django.views.decorators.csrf import csrf_exempt
from urllib.request import urlopen
from django.core import serializers
import re
from threading import Thread
from numpy import array_split

from django.contrib.auth import get_user_model,login,logout
from bs4 import BeautifulSoup
from rest_framework.authentication import SessionAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions,status
from rest_framework import permissions, status

# Searches locations by state
def state_search(query):
    states = Location.objects.none()
    for pair in Location.STATE_CHOICES:
        if query.lower() == pair[1].lower():
            states |= Location.objects.filter(state=pair[0])
    return states

# searches location by difficulty
def difficulty_search(query):
    data = Location.objects.none()
    for pair in Location.DIFFICULTY_LEVEL_CHOICES:
        if query.lower() == pair[1].lower():
            data |= Location.objects.filter(difficulty_level=pair[0])
    return data
# searches location by rock type
def rock_search(query):
    data = Location.objects.none()
    for pair in Location.ROCK_TYPE_CHOICES:
        if query.lower() == pair[1].lower():
            data |= Location.objects.filter(rock_type=pair[0])
    return data

# searches location by type
# more complicated since its a json type
def type_search(query):
    data = []
    types = query.split(' ')
    to_send = Location.objects.none()
    for location in Location.objects.all():
        add = True
        check = location.climbing_type
        # Must include all types that are searched
        for type in types:
            if type not in check:
                add = False
        if add:
            data.append(location.name)
    for name in data:
        to_send |= Location.objects.filter(name=name)
    return to_send

# basic search by name
def search(request):
    keyword = request.GET['keyword']
    keyword = keyword.replace("+"," ")
    locations = Location.objects.filter(name__icontains=keyword)
    states = state_search(keyword)
    locations |= states
    data = serializers.serialize("json", locations)
    return HttpResponse(data, content_type='application/json')


# From https://stackoverflow.com/questions/19703975/django-sort-by-distance
# Given a start location, find location in a given radius
def get_locations_nearby_coords(latitude, longitude, max_distance=None):
    is_prod = 'PROJECT_PATH' in os.environ

    """
    Return objects sorted by distance to specified coordinates
    which distance is less than max_distance given in kilometers
    """
    # Great circle distance formula
    if is_prod:
        gcd_formula = "6371 * acos(least(greatest(\
        cos(radians(%s)) * cos(radians(latitude)) \
        * cos(radians(longitude) - radians(%s)) + \
        sin(radians(%s)) * sin(radians(latitude)) \
        , -1), 1))"
    else:
        gcd_formula = "6371 * acos(min(max(\
        cos(radians(%s)) * cos(radians(latitude)) \
        * cos(radians(longitude) - radians(%s)) + \
        sin(radians(%s)) * sin(radians(latitude)) \
        , -1), 1))"
    distance_raw_sql = RawSQL(
        gcd_formula,
        (latitude, longitude, latitude)
    )
    qs = Location.objects.all() \
    .annotate(distance=distance_raw_sql) \
    .order_by('distance')
    if max_distance is not None:
        qs = qs.filter(distance__lt=max_distance)
    return qs

#Have to have this here or eval does not work
def get_locations():
    return Location.objects.all()

# Here is the advanced search functionality that calls a lot of the previous views
def advanced_search(request):
    distance = request.GET['dist']
    name = request.GET['name'].replace('+', ' ')
    state = request.GET['state']
    difficulty = request.GET['diff']
    rock = request.GET['rock']
    type = request.GET['type']
    if not (distance == ""):
        search_command = "get_locations_nearby_coords(distance.split(' ')[0],distance.split(' ')[1],int(distance.split(' ')[2]))"
    else:
        search_command ="get_locations()"
    if not (name == ""):
        name = name.replace("+"," ")
        search_command += ".filter(name__icontains=name)"
    if not (state == ""):
        state  = state.replace("+", " ")
        search_command +=" & state_search(state)"
    if not (difficulty == ""):
        difficulty = difficulty.replace("+", " ")
        search_command += " & difficulty_search(difficulty)"
    if not (rock == ""):
        rock = rock.replace("+", " ")
        search_command += " & rock_search(rock)"
    if not (type == ""):
        search_command += " & type_search(type)"
    filtered_areas = eval(search_command)
    data = serializers.serialize("json", filtered_areas)
    return HttpResponse(data, content_type='application/json')

# This searches users by name
def search_users(request):
    name = request.GET['name']
    users = AppUser.objects.filter(username__icontains=name)
    data = serializers.serialize("json", users)
    return HttpResponse(data, content_type='application/json')
