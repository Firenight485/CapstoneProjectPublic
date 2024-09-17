from django.test import TestCase
from climbing_app_backend.models import Location, AppUser, Comment
import uuid

# Create your tests here.
class LocationModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        print("Setting up Location Tests!")
    
    def setUp(self):
        Location.objects.create(name = "Red River Gorge", location_id = 1, description='this is cool', state = 'KY',latitude=0,longitude=0,)
        Location.objects.create(location_id=2, state = "SC",latitude=0,longitude=0)
        user = AppUser.objects.create(username="wenshu", email='tester@gmail.com')
        Location.objects.create(name= "tester location" , location_id=3, state = "NY", author=user, latitude = 0, longitude = 1, description = "tester", difficulty_level='I',
                                rock_type="Basalt", climbing_type = "Sport", monthly_page_views = 1000)

    def test_name(self):
        location = Location.objects.get(location_id=1)
        field_label = location._meta.get_field('name').verbose_name
        self.assertEqual(field_label,'name')

    def test_name_length(self):
        location = Location.objects.get(location_id=1)
        max_length = location._meta.get_field('name').max_length
        self.assertEqual(max_length, 100)

    def test_default_name(self):
        location = Location.objects.get(location_id=2)
        field_value = getattr(location,'name')
        self.assertEqual(field_value,'None')

    def test_state(self):
        location = Location.objects.get(location_id=2)
        state_val = getattr(location,'state')
        self.assertEqual(state_val, 'SC')
    
    def test_description(self):
        location = Location.objects.get(location_id =3)
        desc_val = getattr(location, 'description')
        self.assertEqual(desc_val, 'tester')
    
    def test_rock_type(self):
        location = Location.objects.get(location_id =3)
        desc_val = getattr(location, 'rock_type')
        self.assertEqual(desc_val, 'Basalt')
    
    def test_difficulty_level(self):
        location = Location.objects.get(location_id =3)
        dl_val = getattr(location, 'difficulty_level')
        self.assertEqual(dl_val, 'I')
    
    def test_climbing_type(self):
        location = Location.objects.get(location_id =3)
        ctype_val = getattr(location, 'climbing_type')
        self.assertEqual(ctype_val, 'Sport')
    
    def test_author(self):
        location = Location.objects.get(location_id =3)
        auth_val = getattr(location, 'author')
        user = AppUser.objects.get(username='wenshu')
        self.assertEqual(auth_val, user)

    def test__default_monthly_page_views(self):
        location = Location.objects.get(location_id=1)
        page_views = getattr(location, 'monthly_page_views')
        self.assertEqual(page_views, 0)

    def test__default_monthly_page_views(self):
        location = Location.objects.get(location_id=3)
        page_views = getattr(location, 'monthly_page_views')
        self.assertEqual(page_views, 1000)