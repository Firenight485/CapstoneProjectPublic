from django.urls import path
from ..views import list_views,scraper_views, comment_views

urlpatterns = [
    path('locations/', list_views.LocationListView.as_view(), name='location-list'),
    # For now I created a new endpoint to create locations, probably could just be merged with the other one
    path('create-location/', list_views.create_location, name = 'create-location'),
    path('user/', list_views.UserListView.as_view(), name='user-list'),
    path('comment/', list_views.CommentListView.as_view(), name='comment-list'),
    path('message/', list_views.MessageListView.as_view(), name='message-list'),
    path('locations/getstates/',list_views.get_states, name='getstates'),
    path('locations/rock-types/', list_views.get_rock_types, name = 'rock-types'),
    path('locations/climbing-types/', list_views.get_climbing_types, name='climbing-types'),
    path('locations/difficulty-levels/', list_views.get_difficulty_levels, name='difficulty-levels'),
    path('get-location/', list_views.get_location, name='get-location'),
    path('popular-locations/', list_views.get_popular_locations, name='popular-locations'),
    path('test/', scraper_views.save_info, name='save-info'),
    path('location/update-location/', list_views.update_location, name='update-location'),
    path('location/comments/', comment_views.get_comments, name='get-comments'),
    path('location/get_nearby_restaurants/', list_views.get_nearby_restaurants, name='get_nearby_restaurants'),
    path('location/get_nearby_lodging/', list_views.get_nearby_lodging, name='get_nearby_lodging'),
    path('get-pf-posts/', list_views.get_all_pf, name='get_pf_posts'),
    path('get-usernames/', list_views.get_all_usernames, name='get-usernames'),
    path('translate-state/', list_views.translate_state, name='translate-state'),
    path('translate-rock-type/', list_views.translate_rock_type, name='translate-rock-type'),
    path('translate-difficulty/', list_views.translate_difficulty, name= 'translate-diffculty'),
    path('location/delete/', list_views.delete_location, name='delete-location')
]
