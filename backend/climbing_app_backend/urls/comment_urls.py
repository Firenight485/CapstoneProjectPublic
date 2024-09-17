from django.urls import path
from ..views import comment_views

urlpatterns = [
    path('pf/create/', comment_views.create_pfinder, name='create-pf'),
    path('pf/update/', comment_views.update_pfinder, name='pf-update'),
    path('pf/get/', comment_views.get_posts, name='get-posts'),
    path('pf/delete/', comment_views.delete_post, name='delete-post'),
    path('pf/reply/', comment_views.create_partner_reply, name='pf-reply'),
    path('pf/delete-reply/', comment_views.delete_pfreply, name='delete-pf-reply'),
    path('pf/update-reply/', comment_views.update_pfinder_reply, name='update-pf-reply'),
    path('comment/create/', comment_views.create_comment, name='create-comment'),
    path('comment/reply/', comment_views.create_reply, name='create-reply'),
    path('comment/delete/', comment_views.delete_comment, name='delete-comment'),
    path('comment/editcomment/', comment_views.edit_comment, name='edit-comment'),
    path('comment/editreply/', comment_views.edit_reply, name='edit-reply'),
]
