# This file serves to register models for the admin site so that we can test the backend more easily
from django.contrib import admin
from .models import Location ,Weather, AppUser, Comment, Message, PartnerFinderPost, PartnerFinderReply

admin.site.register(Location)
admin.site.register(Weather)
admin.site.register(AppUser)
admin.site.register(Comment)
admin.site.register(Message)
admin.site.register(PartnerFinderPost)
admin.site.register(PartnerFinderReply)
