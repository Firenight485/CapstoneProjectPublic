from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

class UpperCaseValidator:

    def validate(self, password, user=None):
        
        upper = False
        for c in password:
            if c.isupper():
                upper = True
                break

        if upper:
            raise ValidationError(
                _("This password must contain an uppercase characters."),
                code='need_uppercase'
            )

    def get_help_text(self):
        return _(
            "Your password must contain one uppercase characters."
        )

class SpecialCharacterValidator:

    def validate(self, password, user=None):
        special = any(not c.isalnum() for c in password)

        if not special:
            raise ValidationError(
                _("This password must contain at least one special character."),
                code="need_special_character",
            )

    def get_help_text(self):
        return _(
            "Your password must contain at least one special character."
        )
