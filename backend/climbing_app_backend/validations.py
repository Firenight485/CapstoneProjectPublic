# These are our custom validation
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
UserModel = get_user_model()

def custom_validation(data):
    email = data['email'].strip()
    username = data['username'].strip()
    password = data['password'].strip()
    ## These send a specific message based on if the values given 
    if not email or UserModel.objects.filter(email=email).exists():
        data = 'bad email'
        return data
    ##
    elif not password or len(password) < 8:
        data = 'bad password'
        return data
    ##
    elif not username or UserModel.objects.filter(username=username).exists():
        data = 'bad name'
        return data
    
    upper = False
    for c in password:
        if c.isupper():
            upper = True
            break
        
    length = False
    if len(password) < 8:
        length = True
        
    special = any(not c.isalnum() for c in password)

    if length:
        raise ValueError("password must be at least 8 characters")
    if not upper:
        raise ValueError('password must contain an uppercase letter')
    if not special:
        raise ValueError('password must contain a special character')
    return data

    


def validate_email(data):
    email = data['email'].strip()
    if not email:
        raise ValidationError('an email is needed')
    return True

def validate_username(data):
    username = data['username'].strip()
    if not username:
        raise ValidationError('choose another username')
    return True

def validate_password(data):
    password = data['password'].strip()
    if not password:
        raise ValidationError('a password is needed')
    return True