# This is the file that contain views that handle everything that is related to a users profile page
import sys
from django.http import HttpResponse
from ..models import Location, Weather, AppUser, Comment, Message
from django.views.decorators.csrf import csrf_exempt
from urllib.request import urlopen
from django.core import serializers
from rest_framework.authentication import SessionAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions,status
from rest_framework import permissions, status
from rest_framework.decorators import api_view
import datetime
import json
import os

# This allows a user to add friends
@api_view(['POST'])
def add_friend(request):
    user = request.user
    friend = request.data['friend']
    # Must be logged in
    if user.is_authenticated:
        try:
            # Makes sure the friend exists
            person = AppUser.objects.get(username=friend)
        except AppUser.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        try:
            # Make sure the person is not already friends with the person
            user.friends.get(username=friend) 
        except AppUser.DoesNotExist:
            # If friend DNE, probably got name wrong in url params
            user.friends.add(person)
            user.save()
            return Response(status=status.HTTP_200_OK)
    else:
        return Response(status=status.HTTP_403_FORBIDDEN)

# This allows user to remove a friend
@api_view(['DELETE'])
def remove_friend(request):
    user = request.user
    friend = request.data['friend']
    # Must be logged in
    if user.is_authenticated:
        try:
            person = AppUser.objects.get(username=friend)
        except AppUser.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        try:
            user.friends.get(username=friend) 
        except AppUser.DoesNotExist:
            # If friend in not in friends list then return error
            return Response(status=status.HTTP_400_BAD_REQUEST)
        # else remove the person
        user.friends.remove(person)
        user.save()
        return Response(status=status.HTTP_200_OK)
    else:
        Response(status=status.HTTP_403_FORBIDDEN)

# This allows the user to add Location to Logbook
@api_view(['POST'])
def add_to_log(request):
    user = request.user
    # Must be logged in
    if not user.is_authenticated:
        return Response(status=status.HTTP_403_FORBIDDEN)
    loc = request.data['loc'].replace('+', ' ')
    
    try:
        location = Location.objects.get(name=loc)
    except Location.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    try:
        user.logbook.get(name = loc)
        # Make sure Location is not already in logbook
    except Location.DoesNotExist:
        user.logbook.add(location)
        return Response(status=status.HTTP_200_OK)

    # Must mean location already exists inside log book. No dups allowed
    return Response(status=status.HTTP_400_BAD_REQUEST)

# This allows the user to delete a Location from logbook
@api_view(['DELETE'])
def remove_from_log(request):
    user = request.user
    if not user.is_authenticated:
        return Response(status=status.HTTP_403_FORBIDDEN)
    
    loc = request.data['loc'].replace('+', ' ')
    try:
        location = Location.objects.get(name=loc)
    except Location.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    try:
        user.logbook.get(name=loc)
    except Location.DoesNotExist:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
    user.logbook.remove(location)
    return Response(status=status.HTTP_200_OK)

# This allows the user to add favorite locations
@api_view(['POST'])
def add_to_favs(request):
    user = request.user
    if not user.is_authenticated:
        return Response(status=status.HTTP_403_FORBIDDEN)

    loc = request.data['loc'].replace('+', ' ')
    try:
        location = Location.objects.get(name=loc)
    except Location.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    try:
        user.favorite_locs.get(name = loc)
    except Location.DoesNotExist:
        print(loc)
        user.favorite_locs.add(location)
        return Response(status=status.HTTP_200_OK)

    # Must mean location already exists inside favs. No dups allowed
    return Response(status=status.HTTP_400_BAD_REQUEST)

# This allows user to remove a location from favorites
@api_view(['DELETE'])
def remove_from_favs(request):
    user = request.user
    if not user.is_authenticated:
        return Response(status=status.HTTP_403_FORBIDDEN)
    
    loc = request.data['loc'].replace('+', ' ')
    try:
        location = Location.objects.get(name=loc)
    except Location.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    try:
        user.favorite_locs.get(name=loc)
    except Location.DoesNotExist:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    user.favorite_locs.remove(location)
    return HttpResponse(status=status.HTTP_200_OK)

# This adds a location to a users recents
# This is stored in the database because the data must be stored when the user logs out
@api_view(['POST'])
def add_to_recents(request):
    user = request.user
    if not user.is_authenticated:
        return Response(status=status.HTTP_403_FORBIDDEN)

    loc = request.data['loc'].replace('+', ' ')
    try:
        location = Location.objects.get(name=loc)
    except Location.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    to_send = ""
    account = AppUser.objects.get(username=user.username)
    list = account.recents
    # If the recents is empty, just add the location
    if list == "Empty":
        account.recents = location.name
        account.save()
        return Response(status=status.HTTP_200_OK)
    
    # Essentially replicated a queue inside an array of names
    queue = list.split(",")
    length = len(queue)
    # This checks if location is already in recents
    for i in range(length):
        if location.name == queue[i]:
            return Response(status=status.HTTP_400_BAD_REQUEST)
    # if length is 10 or over, pop the first item in list and append the location to the end
    if length >= 10:
        print("INSIDE POP AREA")
        queue = queue[1:]
        queue.append(location.name)
        print(queue[0])
        for i in range(length):
            if i == length-1:
                to_send += queue[i]
            else:
                to_send += queue[i]+","
    else:
        to_send = account.recents
        to_send += "," + location.name

    print(to_send)
    account.recents = to_send
    account.save()
    return Response(status=status.HTTP_200_OK)


# Really don't need this but here for now
# If implemented, need to be updated
def remove_from_recents(request):
    user = request.GET['name']
    loc = request.GET['loc'].replace('+', ' ')
    try:
        location = Location.objects.get(name=loc)
    except Location.DoesNotExist:
        return HttpResponse(status=status.HTTP_404_NOT_FOUND)
    try:
        AppUser.objects.get(username=user).recents
    except Location.DoesNotExist:
        return HttpResponse(status=status.HTTP_400_BAD_REQUEST)
    
    AppUser.objects.get(username=user).recents.remove(location)
    return HttpResponse(status=status.HTTP_200_OK)

# This returns a list of a specific person's friends
@api_view(['GET'])
def get_friends(request):
    user = request.user
    if user.is_authenticated:
        friends = AppUser.objects.get(username=user.username).friends.all()
        data = serializers.serialize("json", friends)
        return HttpResponse(data, content_type='application/json')

# Get a specific users logbook (whoever is logged in)
@api_view(['GET'])
def get_logbook(request):
    user = request.user
    if user.is_authenticated:
        log = AppUser.objects.get(username=user.username).logbook.all()
        data = serializers.serialize("json", log)
        return HttpResponse(data, content_type='application/json')

# Get a specific users recents
@api_view(['GET'])
def get_recents(request):
    user = request.user
    if not user.is_authenticated:
        return Response(status=status.HTTP_403_FORBIDDEN)
    recents = AppUser.objects.get(username=user).recents
    recents = recents.replace(" ", "+")
    return HttpResponse(recents)

# get a specifc persons favorites
@api_view(['GET'])
def get_favs(request):
    user = request.user
    if not user.is_authenticated:
        return Response(status=status.HTTP_403_FORBIDDEN)
    favs = AppUser.objects.get(username=user.username).favorite_locs.all()
    data = serializers.serialize("json", favs)
    return HttpResponse(data, content_type='application/json')

# Return if the given location is in a users favs
@api_view(['GET'])
def get_is_fav(request):
    user = request.user
    if not user.is_authenticated:
        return Response(status=status.HTTP_403_FORBIDDEN)
    location = Location.objects.get(name=request.GET['name'].replace('+', ' '))
    favs = AppUser.objects.get(username=user.username).favorite_locs.all()

    if location in favs:
        return Response(status=status.HTTP_200_OK)
    return Response(status=status.HTTP_404_NOT_FOUND)

# Returns the profile picture of the user
@api_view(['GET'])
def get_profile_pic(request):
    user = request.user
    if not user.is_authenticated:
        return Response(status=status.HTTP_403_FORBIDDEN)
    
    pic = AppUser.objects.get(username=user.username).profile_pic
    image_data = open(str(pic),'rb').read()
    return HttpResponse(image_data,content_type="image/png")

# Given a name, return the users profile picture
@api_view(['GET'])
def get_specific_profile_pic(request):
    try:
        pic = AppUser.objects.get(username = request.GET['name']).profile_pic
    except:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    image_data = open(str(pic),'rb').read()
    return HttpResponse(image_data,content_type="image/png")

# this allows the user to update their profile picture
@api_view(['POST'])
def update_pic(request):
    user = request.user
    if not user.is_authenticated:
        return Response(status=status.HTTP_403_FORBIDDEN)
    try:
        # This is the base profile picture
        try:
            if not '360_F_346936114_RaxE6OQogebgAWTalE1myseY1Hbb5qPM.jpg' in user.profile_pic.path:
                os.remove(user.profile_pic.path)
        except:
            pass
        user.profile_pic = request.FILES['image']
        user.save()
        return Response(status=status.HTTP_200_OK)
    except Exception as e:
        print(str(e))
        sys.stdout.flush()
        return Response(status=status.HTTP_400_BAD_REQUEST)

# This resets the profile pic to the default one
@api_view(['POST'])
def reset_pic(request):
    user = request.user
    if not user.is_authenticated:
        return Response(status=status.HTTP_403_FORBIDDEN)
    try:
        if '360_F_346936114_RaxE6OQogebgAWTalE1myseY1Hbb5qPM.jpg' not in user.profile_pic.path:
            os.remove(user.profile_pic.path)
        user.profile_pic = 'climbing_app_backend/profilepics/360_F_346936114_RaxE6OQogebgAWTalE1myseY1Hbb5qPM.jpg'
        user.save()
        return Response(status=status.HTTP_200_OK)
    except:
        return Response(status=status.HTTP_400_BAD_REQUEST)

# Returns user information to display on the profile
@api_view(['GET'])
def get_profile_info(request):
    user = request.user
    if user.is_authenticated:
        data = serializers.serialize("json", [user])
        return HttpResponse(data, content_type='application/json')
    else:
        Response(status=status.HTTP_400_BAD_REQUEST)

# Allows the user to look at others logbook
@api_view(['GET'])
def get_any_logbook(request):
    username = request.GET['name']
    log = AppUser.objects.get(username=username).logbook.all()
    data = serializers.serialize("json", log)
    return HttpResponse(data, content_type='application/json')

# Gets the locations that a user created 
@api_view(['GET'])
def get_created_locations(request):
    user = request.user
    if user.is_authenticated:
        data = Location.objects.filter(author=user)
        data = serializers.serialize("json", data)
        return HttpResponse(data, content_type='application/json')
    return Response(status=status.HTTP_400_BAD_REQUEST)
