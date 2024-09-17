# This file contains all the model/classes that are needed for this web app
from django.db import models
from datetime import datetime
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django import forms 
import uuid
from django.core.validators import MaxValueValidator, MinValueValidator

# Here we extend the base user manger class to fit our custom user model
class AppUserManager(BaseUserManager):
    # Implementing our own create_user class
    # Returns a user and saves it to the database
    def create_user(self, email, password=None,username=None):
        # These three if statements check if no email, username, or password was given
        if not email:
            raise ValueError('An email is required')
        if not password:
            raise ValueError('A password is required')
        if not username:
            raise ValueError('A username is required')
        
        # This checks if there is an uppercase letter in the password
        upper = False
        for c in password:
            if c.isupper():
                upper = True
                break
        
        # This checks if the password is at least 8 characters long
        length = False
        if len(password) < 8:
            length = True
        
        # This checks if there are any special characters in the password 
        special = any(not c.isalnum() for c in password)

        # Raise an error if the password does not meet any of the requirements
        if length:
            raise ValueError("password must be at least 8 characters")
        if not upper:
            raise ValueError('password must contain an uppercase letter')
        if not special:
            raise ValueError('password must contain a special character')

        # populate values and return user
        email = self.normalize_email(email)
        user = self.model(email=email)
        user.username = username
        user.set_password(password)
        user.save()
        return user
    def create_superuser(self, email, password=None, username=None):
       # Strictly for the admin site so we do not check password reqs
       if not email:
            raise ValueError('An email is required')
       if not password:
            raise ValueError('A password is required')
       if not username:
            raise ValueError('A username is required')
       user = self.create_user(email,password,username)
       # The two booleans give the user special priviledges
       user.is_admin = True
       user.is_superuser = True
       print(user.__str__())
       user.save()
       return user


# Our AppUser extends the built in user class
class AppUser(AbstractBaseUser, PermissionsMixin):
    # All of the AppUser fields
    email = models.EmailField(max_length=100, unique=True)
    # The username is the primary key so users may not have the same username and it is the primary identifier
    username = models.CharField(max_length=100, primary_key=True)
    is_admin = models.BooleanField(default=False)
    # Has a base path where every picture goes and a default picture
    profile_pic = models.ImageField(upload_to='climbing_app_backend/profilepics', default= 'climbing_app_backend/profilepics/360_F_346936114_RaxE6OQogebgAWTalE1myseY1Hbb5qPM.jpg', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    favorite_locs = models.ManyToManyField('climbing_app_backend.Location', related_name= "fav_locs_list", blank=True)
    friends = models.ManyToManyField("self", blank= True)
    logbook = models.ManyToManyField('climbing_app_backend.Location', related_name= "log_list", blank= True)
    insta_link = models.URLField(blank = True)
    vl_link = models.URLField(blank = True)
    recents = models.CharField(max_length = 1000, default = "Empty")
    forgot_pwd_key = models.CharField(max_length=1000, blank= True)
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    @property
    def is_staff(self):
        return self.is_admin
    
    
    objects = AppUserManager()
    
    def __str__(self):
        return self.username

class Location(models.Model):
    # These are the restricted choices for the states of a location
    # The first value of the tuple is the value stored in the database
    STATE_CHOICES = [
        ("AL", "Alabama"),
        ("AK", "Alaska"),
        ("AZ", "Arizona"),
        ("AR", "Arkansas"),
        ("CA", "California"),
        ("CO", "Colorado"),
        ("CT", "Connecticut"),
        ("DE", "Delaware"),
        ("FL", "Florida"),
        ("GA", "Georgia"),
        ("HI", "Hawaii"),
        ("ID", "Idaho"),
        ("IL", "Illinois"),
        ("IN", "Indiana"),
        ("IA", "Iowa"),
        ("KS", "Kansas"),
        ("KY", "Kentucky"),
        ("LA", "Louisiana"),
        ("ME", "Maine"),
        ("MD", "Maryland"),
        ("MA", "Massachusetts"),
        ("MI", "Michigan"),
        ("MN", "Minnesota"),
        ("MS", "Mississippi"),
        ("MO", "Missouri"),
        ("MT", "Montana"),
        ("NE", "Nebraska"),
        ("NV", "Nevada"),
        ("NH", "New Hampshire"),
        ("NJ", "New Jersey"),
        ("NM", "New Mexico"),
        ("NY", "New York"),
        ("NC", "North Carolina"),
        ("ND", "North Dakota"),
        ("OH", "Ohio"),
        ("OK", "Oklahoma"),
        ("OR", "Oregon"),
        ("PA", "Pennsylvania"),
        ("RI", "Rhode Island"),
        ("SC", "South Carolina"),
        ("SD", "South Dakota"),
        ("TN", "Tennessee"),
        ("TX", "Texas"),
        ("UT", "Utah"),
        ("VT", "Vermont"),
        ("VA", "Virginia"),
        ("WA", "Washington"),
        ("WV", "West Virginia"),
        ("WI", "Wisconsin"),
        ("WY", "Wyoming"),
        ("INTL", "International")
    ]

    # The four choices for climbing type
    CLIMBING_TYPE_CHOICES = [
        "Sport",
        "Bouldering",
        "Multi-Pitch",
        "Traditional",
    ]

    ROCK_TYPE_CHOICES = [
        ("G", "Granite"),
        ("L", "Limestone"),
        ("S", "Sandstone"),
        ("B", "Basalt"),
        ("Q", "Quartzite"),
    ]

    DIFFICULTY_LEVEL_CHOICES = [
        ("B", "Beginner"),
        ("I", "Intermediate"),
        ("A", "Advanced"),
    ]
   
    #Fields
    name =  models.CharField(max_length=100, help_text='Enter a location name', default="None", primary_key= True)
    # Since we auto generate some locations, this field can be null/blank
    author = models.ForeignKey(AppUser, on_delete=models.CASCADE, blank=True, null = True)
    location_id = models.UUIDField(default= uuid.uuid4(), editable = False,help_text="ID associated with location", unique = True)
    latitude = models.DecimalField(max_digits=18, decimal_places=15)
    longitude = models.DecimalField(max_digits=18, decimal_places=15)
    description = models.TextField(max_length=5000,
        help_text='Enter a description of the climbing location', default='This location was generated by default, and thus no description was entered.')
    state = models.CharField(max_length=100,
        choices=STATE_CHOICES, help_text= "What state the location is in")
    difficulty_level = models.CharField(max_length=20, help_text='Enter a difficulty level', choices = DIFFICULTY_LEVEL_CHOICES)
    rock_type = models.CharField(max_length=30,
        help_text='Enter the type of rock at this location', choices = ROCK_TYPE_CHOICES)
    climbing_type = models.JSONField(default=list)
    monthly_page_views = models.IntegerField(default = 0)
    is_published = models.BooleanField(default = False)

    def __str__(self):
        return self.name


class Weather (models.Model):
    # Weather is associated with a location
    name =  models.ForeignKey(Location, blank=True, default=None, on_delete=models.CASCADE, unique=True)
    # This stores the time that the weather was last gotten
    timestamp = models.DateTimeField(auto_now_add=True, blank=True)
    hourly_forecast = models.JSONField(default=list)
    daily_forecast =  models.JSONField(default=list)
    monthly_forecast = models.JSONField(default=list)



class Comment (models.Model):
    #Fields
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    comment_id = models.UUIDField(primary_key= True, default= uuid.uuid4, editable = False)
    author = models.ForeignKey(AppUser, on_delete=models.CASCADE)
    content = models.CharField(max_length= 250, help_text='Enter your comment')
    parent = models.ForeignKey("self", on_delete=models.CASCADE, blank =True, null = True)
    created_at = models.DateTimeField(auto_now_add=True, blank = True)
    # if the user would like to give the location a rating
    rating = models.IntegerField(blank = True, validators=[MaxValueValidator(5), MinValueValidator(0)], help_text= "number of stars out of 5", null= True)

    # Orders comments by time created
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['created_at']),
        ]

class Message (models.Model):
    #Fields
    content = models.TextField(help_text='Enter your message')
    sender_id = models.ForeignKey("AppUser", on_delete=models.CASCADE, related_name="sender_id")
    reciever_id = models.ForeignKey("AppUser", on_delete=models.CASCADE, related_name="receiver_id")
    message_id = models.ForeignKey("AppUser",on_delete=models.CASCADE, related_name="message_id")

    def __str__(self):
        return self.message_id

class PartnerFinderPost (models.Model):
    # A few attributes that one may want to look for in a partner
    SKILL_LEVEL_CHOICES = [
        ("B", "Beginner"),
        ("I", "Intermediate"),
        ("A", "Advanced"),
    ]

    CLIMBING_TYPE_CHOICES = [
        "Sport",
        "Bouldering",
        "Muli-Pitch",
        "Traditional",
    ]

    #Fields
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    content = models.TextField(help_text='Enter your message', blank = True)
    # We have it set so that you cannot set your age under 16 or over 100
    max_age = models.IntegerField(default= 100, 
                                    validators=[MaxValueValidator(100), MinValueValidator(16)], blank = True, help_text = 'maximum age')
    min_age = models.IntegerField(default= 16, 
                                    validators=[MaxValueValidator(100), MinValueValidator(16)], blank = True, help_text = 'minimum age')
    author = models.ForeignKey(AppUser, on_delete = models.CASCADE)
    skill_level = models.CharField(max_length=50, help_text='Enter a skill level', choices = SKILL_LEVEL_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True, blank = True)
    post_id = models.UUIDField(primary_key= True, default= uuid.uuid4, editable = False)
    
    # Sorts them by most recently created
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['created_at']),
        ]

# This must be its own model unlike comments
class PartnerFinderReply(models.Model):
    
    #Fields
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    content = models.TextField(help_text='Enter your message', blank = True)
    parent = models.ForeignKey(PartnerFinderPost, on_delete=models.CASCADE)
    author = models.ForeignKey(AppUser, on_delete = models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True, blank = True)
    reply_id = models.UUIDField(primary_key= True, default= uuid.uuid4, editable = False)

    # Sorts them by most recently made
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['created_at']),
        ]