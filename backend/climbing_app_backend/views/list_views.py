# This file contains all the views that handle miscellaneous things that arent directly used by the user
from rest_framework.generics import ListAPIView
from rest_framework.generics import ListCreateAPIView
import json
from django.http import JsonResponse, HttpResponse
from ..models import Location, Weather, AppUser, Comment, Message, PartnerFinderPost, PartnerFinderReply
from django.db.models.expressions import RawSQL
from ..serializers import LocationSerializer, WeatherSerializer, UserSerializer, CommentSerializer, MessageSerializer
from ..serializers import UserLoginSerializer, UserRegisterSerializer, UserSerializer
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.core import serializers
from rest_framework import permissions,status
import uuid
from rest_framework import permissions,status
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
import requests

# This gives a list of all Locations
class LocationListView(ListAPIView):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    pagination_class = None

# This can handle POST requests and create a Location
class CreateLocationListView(ListCreateAPIView):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    pagination_class = None

# This gives a list of all weather models
class WeatherListView(ListAPIView):
    queryset = Weather.objects.all()
    serializer_class = WeatherSerializer
    pagination_class = None

# This gives a list of all the users
class UserListView(ListAPIView):
    queryset = AppUser.objects.all()
    serializer_class = UserSerializer
    pagination_class = None

# This gives a list of all the Comments
class CommentListView(ListAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    pagination_class = None

class MessageListView(ListAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    pagination_class = None

# Returns a json list of all state choices
@api_view(['GET'])
def get_states(request):
    return JsonResponse(json.dumps(Location.STATE_CHOICES), safe=False)

# Returns a json list of all the climbing type choices
@api_view(['GET'])
def get_climbing_types(request):
    return JsonResponse(json.dumps(Location.CLIMBING_TYPE_CHOICES), safe=False)

# Returns a json list of all the rock type choices
@api_view(['GET'])
def get_rock_types(request):
    return JsonResponse(json.dumps(Location.ROCK_TYPE_CHOICES), safe=False)

# Returns a json list of all the difficulty type choices
@api_view(['GET'])
def get_difficulty_levels(request):
    return JsonResponse(json.dumps(Location.DIFFICULTY_LEVEL_CHOICES), safe=False)

# Given a name, returns a specific location
def get_location(request):
    loc = request.GET['name'].replace('+', ' ')
    to_send = Location.objects.filter(name__iexact=loc)
    location = serializers.serialize('json',to_send)
    response = location[1:-1]
    return HttpResponse(response, content_type='application/json')

# This returns the 15 most popular locations
def get_popular_locations(request):
    popular_locations = Location.objects.order_by('-monthly_page_views')[:15]
    data = serializers.serialize('json', popular_locations)
    return HttpResponse(data, content_type='application/json')

@api_view(['POST'])
def create_location(request):
    if request.method == 'POST':
        data = request.data
        if request.user.is_authenticated:
            name = request.user.username
            user = AppUser.objects.get(username = name)
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)
        try:
            location = Location(
                name = data['name'].replace('+', ''),
                latitude = data['latitude'],
                longitude = data['longitude'],
                description = data['description'],
                state = data['state'],
                difficulty_level = data['difficulty_level'],
                rock_type = data['rock_type'],
                climbing_type = data['climbing_type'],
                location_id = uuid.uuid4(),
                author = user,
            )
            location.save()
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)
    return Response(status=status.HTTP_200_OK)

# This allows the user to update a location
@api_view(['PUT'])
def update_location(request):
     if request.method == 'PUT':
        data = request.data
        if request.user.is_authenticated:
            try:
                location = Location.objects.get(location_id = data['location_id'])
            except Location.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)
            try:
                name = Location.objects.filter(location_id = data['location_id']).update(name=data['name'])
                if data['latitude'] != location.latitude or data['longitude'] != location.longitude:
                    to_delete = Weather.objects.filter(name = location.name)
                    to_delete.delete()
                    location.latitude = data['latitude']
                    location.longitude = data['longitude']

                location.description = data['description']
                location.state = data['state']
                location.difficulty_level = data['difficulty_level']
                location.rock_type = data['rock_type']
                location.climbing_type = data['climbing_type']
                location.save()
            except:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            return Response(status=status.HTTP_200_OK) 
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)

# This allows the user to delete a location
@api_view(['POST'])   
def delete_location(request):
    name = request.data['name']
    # Must be logged in
    if request.user.is_authenticated:
        user = AppUser.objects.get(username= request.user.username)
        location = Location.objects.filter(author=user).filter(name = name)
        if not location:
            return Response(status=status.HTTP_404_NOT_FOUND)
        location.delete()
        return Response(status=status.HTTP_200_OK)
    else:
       return Response(status=status.HTTP_403_FORBIDDEN)
    
# This calls the google places api and gets a nearby restaurants and food places for a given location
def get_nearby_restaurants(request):
    if request.method == 'GET':
        try:
            location_name = request.GET['name'].replace('+', ' ')
            radius = int(request.GET['radius']) * 1609
        except:
            return JsonResponse({'error': 'Parameter is missing'}, status=400)
    
        try:
            location = Location.objects.get(name=location_name)
        except:
            return JsonResponse({'error': 'Location not found'}, status=404)

        #API Key scrubbed in making project public
        google_places_api = ""
        url = f'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={location.latitude},{location.longitude}&radius={radius}&type=restaurant&key={google_places_api}'

        response = requests.get(url)
        if response.status_code == 200:
            data = response.json() 
            restaurants = []
            for place in data.get('results', []):
                try:
                    restaurant = {'name': place['name'], 'vicinity': place['vicinity'],
                                'lat': place['geometry']['location']['lat'],
                                'lng': place['geometry']['location']['lng']}
                    restaurants.append(restaurant)
                except KeyError:
                    continue
            return JsonResponse({'restaurants': restaurants}, status=200)
        else:
            return JsonResponse({'error': 'Failed to fetch nearby restaurants'}, status=response.status_code)
    else:
        return JsonResponse({'error': 'Only GET method is allowed'}, status=405)     
    
# Essentialy the same as the previous method but gets lodging instead
def get_nearby_lodging(request):
    if request.method == 'GET':
        try:
            location_name = request.GET['name'].replace('+', ' ')
            radius = int(request.GET['radius']) * 1609
        except:
            return JsonResponse({'error': 'Location parameter is missing'}, status=400)
    
        try:
            location = Location.objects.get(name=location_name)
        except:
            return JsonResponse({'error': 'Location not found'}, status=404)

        #API Key scrubbed in making project public
        google_places_api = ""
        url = f'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={location.latitude},{location.longitude}&radius={radius}&type=lodging&key={google_places_api}'

        response = requests.get(url)
        if response.status_code == 200:
            data = response.json() 
            lodging_list = []
            for place in data.get('results', []):
                try:
                    lodging = {'name': place['name'], 'vicinity': place['vicinity'],
                                'lat': place['geometry']['location']['lat'],
                                'lng': place['geometry']['location']['lng']}
                    lodging_list.append(lodging)
                except KeyError:
                    continue
            return JsonResponse({'lodging': lodging_list}, status=200)
        else:
            return JsonResponse({'error': 'Failed to fetch nearby lodging'}, status=response.status_code)
    else:
        return JsonResponse({'error': 'Only GET method is allowed'}, status=405)

# This returns every partner finder post including the replies
@api_view(['GET'])
def get_all_pf(request):
    pf_list = PartnerFinderPost.objects.all()
    to_send = []
    for post in pf_list:
        post_in = serializers.serialize("json", [post])
        replies = serializers.serialize("json", PartnerFinderReply.objects.filter(parent=post))
        entry = {
            "parent" : post_in,
            "replies" : replies
        }
        to_send.append(entry)
    data = json.dumps(to_send)
    return JsonResponse(data, safe=False)

# Gives a list of all usernames
@api_view(['GET'])
def get_all_usernames(request):
    users = AppUser.objects.all()
    name_list=[]
    for user in users:
        name = user.username
        name_list.append(name)
    data = json.dumps(name_list)
    return JsonResponse(data, safe=False)

# Given an abbreviated value (what is stored in the database), this view converts it into the full length video
@api_view(['GET'])
def translate_state(request):
    key = request.GET['key']
    for pair in Location.STATE_CHOICES:
         if pair[0].lower() == key.lower():
            print(pair[1])
            return HttpResponse(pair[1])
    return Response(status=status.HTTP_404_NOT_FOUND)

# Translates the abbreviated value in the database to a human readable value
@api_view(['GET'])
def translate_rock_type(request):
    key = request.GET['key']
    for pair in Location.ROCK_TYPE_CHOICES:
         # The second value in the tuple
         if pair[0].lower() == key.lower():
            print(pair[1])
            return HttpResponse(pair[1])
    return Response(status=status.HTTP_404_NOT_FOUND)

# Translates the abbreviated value in the database to a human readable value
@api_view(['GET'])
def translate_difficulty(request):
    key = request.GET['key']
    for pair in Location.DIFFICULTY_LEVEL_CHOICES:
         if pair[0].lower() == key.lower():
            print(pair[1])
            return HttpResponse(pair[1])
    return Response(status=status.HTTP_404_NOT_FOUND)