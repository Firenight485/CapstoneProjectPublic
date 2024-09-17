# This file contains the serializers for our models
from django.forms import ValidationError
from rest_framework import serializers
from .models import Location, Weather, AppUser, Comment, Message
from django.contrib.auth import get_user_model, authenticate
from .authentication import EmailBackend
class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'

class WeatherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Weather
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppUser
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'

UserModel = get_user_model()
class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppUser
        fields = "__all__"
    # Registers a user
    def create(self, clean_data):
        user_obj = AppUser.objects.create_user(email = clean_data["email"], 
                                               password = clean_data['password'], 
                                               username = clean_data['username'])
        user_obj.save()
        return user_obj

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def check_user(self, clean_data):
        # Checks that the password matchs the given email or username
        user = authenticate(username=clean_data['username'], password=clean_data['password'])
        if not user:
            emailBackend = EmailBackend()
            euser = emailBackend.authenticate(username=clean_data['username'], password=clean_data['password'])
            if not euser:
                raise ValidationError('user not found')
            else:
                use_email = True
                return euser
        return user