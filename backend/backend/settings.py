"""
Django settings for backend project.

Generated by 'django-admin startproject' using Django 4.2.5.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""

import os
from pathlib import Path
import django_heroku

#Tells us whether we are in productions or not

is_prod = False
if 'PROJECT_PATH' in os.environ:
    is_prod = True


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
MEDIA_ROOT=''
MEDIA_URL=''


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-__!^zl$^+u)gt+jwu5dzodcb-0(5$z@h^*eiy41be3y&mdn_q1'
# SECURITY WARNING: don't run with debug turned on in production!
if is_prod:
    DEBUG = True
else:
    DEBUG = True

if is_prod:
    SESSION_COOKIE_DOMAIN='.cruxconditions.live'
    DOMAIN_NAME = "cruxconditions.live"
    CSRF_COOKIE_DOMAIN = '.cruxconditions.live'

ALLOWED_HOSTS = [
    'https://api.cruxconditions.live',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
]

CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://crux-conditions-frontend-7c3f6d0e7519.herokuapp.com',
    'https://www.cruxconditions.live'
]

CORS_ORIGIN_WHITELIST = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://crux-conditions-frontend-7c3f6d0e7519.herokuapp.com',
    'https://www.cruxconditions.live'
]

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://crux-conditions-frontend-7c3f6d0e7519.herokuapp.com',
    'https://www.cruxconditions.live/',
    'https://www.cruxconditions.live'
]

CORS_ALLOW_ALL_ORIGINS = True

CORS_ALLOW_CREDENTIALS = True
# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'climbing_app_backend',
    'rest_framework',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

if is_prod:
    DATABASES = { 
        'default': { 
            'ENGINE': 'django.db.backends.postgresql_psycopg2', 
            'NAME': 'd6r81pgk9adij2', 
            'USER': 'cdhdeksyiraiqh', 
            'PASSWORD': 'a4370852506069c957cae3f83f180a8d8eb49746aaaf007ae364cd8c352a7da5', 
            'HOST': 'ec2-44-213-151-75.compute-1.amazonaws.com', 
            'PORT': '5432', 
        } 
    } 
    
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_USER_MODEL = 'climbing_app_backend.AppUser'

# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / "staticfiles"

#API key scrubbed in making project public
Google_Places_API = ''

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

django_heroku.settings(locals(), staticfiles=False)
AUTHENTICATION_BACKENDS = ("django.contrib.auth.backends.ModelBackend",
                           'climbing_app_backend.authentication.EmailBackend',)

# This is for our forgot password feature
# We use a gmail to send out forgot password links
# These lines link the email to our project
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_USE_TLS = True
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_HOST_USER = 'cruxconditions@gmail.com'
EMAIL_HOST_PASSWORD = 'agxu yxwv bzjv kezz'
EMAIL_PORT = 587

#Rec code for email server account C2CQ7AGT86TBSWW168D1H4KL