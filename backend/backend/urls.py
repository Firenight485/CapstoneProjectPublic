"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

# These are all the urls/paths we use for our project
urlpatterns = [
    # This is for the admin site for our own personal debugging
    path('admin/', admin.site.urls),
    # The 'list_urls' comprise of list view classes that allows us to easily look at a list of all out models
    # It also contains urls to miscellaneous views that the user does not directly user (eg. translate database values to readbale values)
    path('api/', include('climbing_app_backend.urls.list_urls')),
    # The 'profile_urls' comprises of urls to views that deal with the profile page of the user
    # This include the CRUD functions of Logbook, Friends, and Created Locations
    path('api/', include('climbing_app_backend.urls.profile_urls')),
    # The'search_urls' comprises of urls that deal with search and advanced search functions of the app.
    path('api/', include('climbing_app_backend.urls.search_urls')),
    # The 'user_urls' comprises of urls that deal with the CRUD of the App User model.
    path('api/', include('climbing_app_backend.urls.user_urls')),
    # The 'weather_urls' comprises of urls that deal with calling the weather api and getting it to the frontend
    path('api/', include('climbing_app_backend.urls.weather_urls')),
    # The 'comment_urls' comprises of urls that deal with comments and partnerfinder posts
    path('api/', include('climbing_app_backend.urls.comment_urls')),
]
