from django.urls import path
from ..views import user_views

urlpatterns = [
    path("signup/", user_views.UserRegister.as_view(), name="signup-user"),
    path("login/", user_views.UserLogin.as_view(), name="login-user"),
    path("logout/", user_views.UserLogout.as_view(), name="logout-user"),
    path("is-logged-in/",user_views.is_logged_in, name="is-logged-in"),
    path('getaccountinfo/', user_views.get_account_info, name='get-account-info'),
    path('forgot_password/', user_views.send_forgot_pwd, name='forgot-password'),
    path('user/get-locations/', user_views.get_locations, name='get-locations'),
    path('user/update/', user_views.update_user, name='update-user'),
    path('user/email/', user_views.get_email, name='get-email'),
    path('user/delete/', user_views.delete_user, name='delete-user'),
    path('user/get-profile/', user_views.get_user_info_by_name, name="user-info-by-name"),
    path('user/profile_pic/', user_views.get_profile_pic_by_name, name="pic-by-name"),
    path('forgot_password/<str:key>', user_views.change_password, name='change-password' )
]