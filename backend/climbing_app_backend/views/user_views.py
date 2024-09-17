# This file contains views that regard base user functions
from django.shortcuts import render
from django.utils import timezone
import requests, os

from django.core import serializers
from ..models import Location, Weather, AppUser, Comment, Message
from ..serializers import UserLoginSerializer, UserRegisterSerializer, UserSerializer
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
import json
from django.db import IntegrityError
from django.contrib.auth import get_user_model,login,logout
from rest_framework.authentication import SessionAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from ..validations import custom_validation, validate_email, validate_password, validate_username
from django.core.mail import send_mail
from hashlib import sha256

# This allows the user to register
class UserRegister(APIView):
    permission_classes = (permissions.AllowAny,)
    def post(self,request):
        try:
            clean_data = custom_validation(request.data)
        except ValueError:
            return Response('Password must have at least 1 capital letter, at least 1 special character, and be at least 8 characters long!',status=status.HTTP_400_BAD_REQUEST)

        # based on values return a certain error
        if clean_data == 'bad email':
            return Response('This email is already in use!',status=status.HTTP_400_BAD_REQUEST)
        elif clean_data == 'bad name':
            return Response('This username is already in use!',status=status.HTTP_400_BAD_REQUEST)
        elif clean_data == 'bad password':
            return Response('Password must have at least 1 capital letter, at least 1 special character, and be at least 8 characters long!',status=status.HTTP_400_BAD_REQUEST)
        
        serializer = UserRegisterSerializer(data=clean_data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.create(clean_data)
        if user:
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
# Allows user to Login
class UserLogin(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes =(SessionAuthentication,)

    def post(self, request):
        data = request.data
        assert validate_username(data)
        assert validate_password(data)
        serializer = UserLoginSerializer(data=data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.check_user(data)
            user.backend = 'django.contrib.auth.backends.ModelBackend'
            login(request, user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
class UserLogout(APIView):
    @csrf_exempt
    def post(self,request):
        logout(request)
        return Response(status=status.HTTP_200_OK)

# Gets username and email
@api_view(['GET'])    
def get_account_info(request):
    print(request.user.is_active)
    if request.user.is_authenticated:
        username = request.user.username
        email = request.user.email
        return Response({'username': username, 'email': email})
    else:
        return Response(status=status.HTTP_403_FORBIDDEN)

    
# returns 201 if user is not logged in, 200 otherwise
@api_view(['GET'])
def is_logged_in(request):
    if request.user.is_authenticated: 
        return Response(status=status.HTTP_200_OK)
    return Response(status=status.HTTP_201_CREATED)

# Sends forgot password email
@api_view(['POST'])
def send_forgot_pwd(request):
    email = request.data['email']
    try:
        user = AppUser.objects.get(email=email)
    except AppUser.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    # Changes link based on if in production
    is_prod = False
    if 'PROJECT_PATH' in os.environ:
        is_prod = True
    
    if is_prod:
        link = 'https://www.cruxconditions.live/forgot_password/'
    else:
        link = "localhost:3000/forgot_password/"
    #encrypts specific code for each email
    code = sha256(email.encode('utf-8')).hexdigest()
    url = link + code
    # saves this to DB so that it can be checked layer
    user.forgot_pwd_key = code
    user.save()

    # Sends the email
    send_mail(
        subject= 'Password Reset',
        message= "It seem like you have forgotten your Crux Conditions password. Please reset it at this link: \n" + url 
        + "\n\nThanks,\nCrux Conditions Team",
        recipient_list=[user.email],
        from_email=None
    )
    return HttpResponse(url)

@api_view(['POST'])
def change_password(request, key):
    # Given the key and new pass, make sure the user can change their password
    new_pass = request.data['password']
    user = AppUser.objects.get(forgot_pwd_key = key)
    print("\n"+ key)
    if not user:
        return Response(status=status.HTTP_404_NOT_FOUND)
    else:
        # This checks if there is an uppercase letter in the password
        upper = False
        for c in new_pass:
            if c.isupper():
                upper = True
                break
        
        # This checks if the password is at least 8 characters long
        length = False
        if len(new_pass) < 8:
            length = True
        
        # This checks if there are any special characters in the password 
        special = any(not c.isalnum() for c in new_pass)

        # Raise an error if the password does not meet any of the requirements
        if length or not upper or not special:
            return Response('Password must have at least 1 capital letter, at least 1 special character, and be at least 8 characters long!',status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_pass)
        user.save()
        return Response(status=status.HTTP_200_OK)

def get_locations(request):
    if request.user.is_authenticated:
        user = request.user
        locations = Location.objects.filter(author=user)
        data = serializers.serialize("json", locations)
        return HttpResponse(data, content_type='application/json')
    else:
        return HttpResponse(status.HTTP_403_FORBIDDEN)

# Get a users email
@api_view(['GET'])
def get_email(request):
    username = request.GET['username']
    user = AppUser.objects.get(username=username)
    return Response({'email': user.email})

# Send a POST request to this
@api_view(['POST'])
def update_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        if request.user.is_authenticated:
            user = request.user
            try:
                user.email = data['email']
                user.username = data['username']
                user.save()
            # Check if it fails a Unique Key Constraint
            except IntegrityError:
                return Response(status.HTTP_403_FORBIDDEN)
            
            return Response(status.HTTP_200_OK)
        else:
            return Response(status.HTTP_403_FORBIDDEN)


    

@api_view(['GET'])
def get_user_info_by_name(request):
    name = request.GET['name']
    user = AppUser.objects.get(username= name)
    data = serializers.serialize("json", [user])
    return HttpResponse(data, content_type='application/json')

@api_view(['GET'])
def get_profile_pic_by_name(request):
    name = request.GET['name']
    pic = AppUser.objects.get(username=name).profile_pic
    image_data = open(str(pic),'rb').read()
    return HttpResponse(image_data,content_type="image/png")

# This deletes a user
@api_view(['DELETE'])
def delete_user(request):
    user = request.user
    if user.is_authenticated:
        try:
            user.delete()
            return Response(status=status.HTTP_200_OK)
        except user.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
    else:
        return HttpResponse(status=status.HTTP_403_FORBIDDEN)