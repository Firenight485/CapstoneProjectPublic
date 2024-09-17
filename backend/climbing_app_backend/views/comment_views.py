# This file contains all the methods/views that deal will comments or partnerfinders usage
import sys
from rest_framework.generics import ListAPIView
from rest_framework.generics import ListCreateAPIView
import json
from django.http import JsonResponse, HttpResponse
from ..models import Location, Weather, AppUser, Comment, Message, PartnerFinderPost, PartnerFinderReply
from django.db.models.expressions import RawSQL
from ..serializers import LocationSerializer, WeatherSerializer, UserSerializer, CommentSerializer, MessageSerializer
from ..serializers import UserLoginSerializer, UserRegisterSerializer, UserSerializer
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
from django.core import serializers
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions,status
import uuid

# This method takes a post request and returns a partner finder post
@api_view(['POST'])
def create_pfinder(request):
    if request.method == 'POST':
        data = request.data
        # Makes sure the user is logged in 
        if request.user.is_authenticated:
            user = request.user
            try:
               loc = Location.objects.get(name = data['loc_name'].replace('+', ' '))
               post = PartnerFinderPost(
                   author = user,
                   location = loc,
                   post_id = uuid.uuid4(),
                   content = data['content'],
                   min_age = data['min_age'],
                   max_age = data['max_age'],
                   skill_level = data['skill_level']
               )
               post.save()
            except:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            return Response(status=status.HTTP_201_CREATED) 
        # Else user in not logged in
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)

# Very similar to the create pfinder view but updates it instead
@api_view(['PUT'])
def update_pfinder(request):
    if request.method == 'PUT':
        data = request.data
        if request.user.is_authenticated:
            user = request.user
            try:
                post = PartnerFinderPost.objects.get(post_id=request.data['id'])
                if post.author == user:
                    post.content = data['content']
                    post.max_age = data['max_age']
                    post.min_age = data['min_age']
                    post.skill_level = data['skill_level']
                    post.save()
                    return Response(status=status.HTTP_201_CREATED) 
                return Response(status=status.HTTP_403_FORBIDDEN)
            except:
                return Response(status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)

# This gets all the partner finder posts for a specific location
@api_view(['GET'])
def get_posts(request):
    loc = request.GET['location'].replace('+', ' ')
    pf_list = PartnerFinderPost.objects.filter(location=loc)
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

# From a POST request, make a partner finder reply
@api_view(['POST'])
def create_partner_reply(request):
    if request.method == 'POST':
        data = request.data
        # Must be logged in
        if request.user.is_authenticated:
            user = request.user
            try:
               loc = Location.objects.get(name = data['loc_name'].replace('+', ' '))
               # Make sure it replies to the correct post
               post = PartnerFinderPost.objects.get(post_id = data['parent_id'])
               reply = PartnerFinderReply(
                   author = user,
                   location = loc,
                   reply_id = uuid.uuid4(),
                   content = data['content'],
                   parent = post,
               )
               reply.save()
            except:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            return Response(status=status.HTTP_201_CREATED) 
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)

# Again, similar to the create pf reply but it updates the values
@api_view(['PUT'])
def update_pfinder_reply(request):
    if request.method == 'PUT':
        data = request.data
        if request.user.is_authenticated:
            user = request.user
            try:
                reply = PartnerFinderReply.objects.get(reply_id=request.data['id'])
                if reply.author == request.user:
                    reply.content = data['content']
                    reply.save()
                    return Response(status=status.HTTP_201_CREATED) 
                return Response(status=status.HTTP_403_FORBIDDEN)
            except:
                return Response(status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)

# To create a comment give information from POST request
@api_view(['POST'])
def create_comment(request):
    data = request.data
    # Must be logged in
    if request.user.is_authenticated:
        user = request.user
        try:
            loc = Location.objects.get(name = data['loc_name'].replace('+', ' '))
            comment = Comment(
                author = user,
                location = loc,
                comment_id = uuid.uuid4(),
                content = data['content'],
                rating = data['rating']
            )
            comment.save()
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_201_CREATED) 
    else:
        return Response(status=status.HTTP_403_FORBIDDEN)

@api_view(['POST'])
def create_reply(request):
    data = request.data
    if request.user.is_authenticated:
        user = request.user
        try:
            loc = Location.objects.get(name = data['loc_name'].replace('+', ' '))
            par = Comment.objects.get(comment_id = data['parent_id'])
            comment = Comment(
                author = user,
                location = loc,
                comment_id = uuid.uuid4(),
                content = data['content'],
                parent = par,
            )
            comment.save()
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_201_CREATED) 
    else:
        return Response(status=status.HTTP_403_FORBIDDEN)

# Gets all comments for a specific post
@api_view(['GET'])
def get_comments(request):
    if request.method == 'GET':
        try:
            loc = Location.objects.get(name=request.GET['location'].replace('+', ' '))
            comments = Comment.objects.filter(location=loc)
            data = serializers.serialize("json", comments)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        data = serializers.serialize("json", comments)
        return HttpResponse(data, content_type='application/json')
    else:
        return Response(status=status.HTTP_404_NOT_FOUND)

# Delete comment
@api_view(['DELETE'])
def delete_comment(request):
    id = request.data['id']
    if request.user.is_authenticated:
        # Get the correct comment
        user = AppUser.objects.get(username= request.user.username)
        comment = Comment.objects.filter(author=user).get(comment_id = id)
        comment.delete()
        return Response(status=status.HTTP_200_OK)
    else:
        return Response(status=status.HTTP_403_FORBIDDEN)

# Delete a partner finder post
@api_view(['DELETE'])
def delete_post(request):
    id = request.data['id']
    if request.user.is_authenticated:
        user = AppUser.objects.get(username= request.user.username)
        post = PartnerFinderPost.objects.filter(author=user).get(post_id = id)
        if not post:
            return Response(status=status.HTTP_404_NOT_FOUND)
        post.delete()
        return Response(status=status.HTTP_200_OK)
    else:
       return Response(status=status.HTTP_403_FORBIDDEN)
    
@api_view(['DELETE'])
def delete_pfreply(request):
    id = request.data['id']
    if request.user.is_authenticated:
        user = AppUser.objects.get(username= request.user.username)
        reply = PartnerFinderReply.objects.filter(author=user).get(reply_id = id)
        if not reply:
            return Response(status=status.HTTP_404_NOT_FOUND)
        reply.delete()
        return Response(status=status.HTTP_200_OK)
    else:
       return Response(status=status.HTTP_403_FORBIDDEN)

@api_view(['POST'])
def edit_reply(request):
    data = request.data
    if request.user.is_authenticated:
        try:
            comment = Comment.objects.get(comment_id = data['id'])
            if comment.author == request.user:
                comment.content = data['content']
                comment.save()
                return Response(status=status.HTTP_201_CREATED) 
            return Response(status=status.HTTP_403_FORBIDDEN)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)
    return Response(status=status.HTTP_403_FORBIDDEN)
    
@api_view(['POST'])
def edit_comment(request):
    data = request.data
    if request.user.is_authenticated:
        try:
            comment = Comment.objects.get(comment_id = data['id'])
            if comment.author == request.user:
                comment.content = data['content']
                comment.rating = data['rating']
                comment.save()
                return Response(status=status.HTTP_201_CREATED) 
            return Response(status=status.HTTP_403_FORBIDDEN)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)
    return Response(status=status.HTTP_403_FORBIDDEN)