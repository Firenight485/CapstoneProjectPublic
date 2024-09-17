from django.urls import path
from ..views import search_views

urlpatterns = [
    path("search/", search_views.search, name="search-for" ),
    path('advanced-search/', search_views.advanced_search, name='advanced-search'),
]
