from django.urls import path
from ..views import profile_views

urlpatterns = [
    path('friend/get/', profile_views.get_friends, name='get-friends'),
    path('friend/add/', profile_views.add_friend, name='add-friend'),
    path('friend/remove/', profile_views.remove_friend, name ='remove-friend'),
    path('log/add/', profile_views.add_to_log, name='add-log-entry'),
    path('log/remove/', profile_views.remove_from_log, name= 'remove-log-entry'),
    path('log/get/', profile_views.get_logbook, name='get-log'),
    path('fav/add/', profile_views.add_to_favs, name='add-fav'),
    path('fav/remove/', profile_views.remove_from_favs, name='remove-fav'),
    path('fav/get/', profile_views.get_favs, name='get-favs'),
    path('fav/isfav/', profile_views.get_is_fav, name='get-is-favs'),
    path('recent/add/', profile_views.add_to_recents, name ='add-recent'),
    path('recent/remove/', profile_views.remove_from_recents, name='remove-recent'),
    path('recent/get/', profile_views.get_recents, name = 'get-recent'),
    #TODO Add Change profile pic
    path('pic/get/', profile_views.get_profile_pic, name = 'get-pic'),
    path('pic/get_specfic_pic/', profile_views.get_specific_profile_pic, name = 'get-pic'),
    path('pic/update/', profile_views.update_pic, name='update-pic'),
    path('pic/reset/', profile_views.reset_pic, name='reset-pic'),
    path('user/get-info', profile_views.get_profile_info, name='get-info'),
    path('user/get-created-locations/', profile_views.get_created_locations, name="get-created-locations"),
    path('user/get-logbook/', profile_views.get_any_logbook, name="get_any_logbook"),
]
