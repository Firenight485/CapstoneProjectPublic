"""
WSGI config for backend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os
from django.core.wsgi import get_wsgi_application

# Check for the WEBSITE_HOSTNAME environment variable to see if we are running in Azure Ap Service
# If so, then load the settings from production.py
#settings_module = 'backend.production' if 'WEBSITE_HOSTNAME' in os.environ else 'backend.settings'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = get_wsgi_application()