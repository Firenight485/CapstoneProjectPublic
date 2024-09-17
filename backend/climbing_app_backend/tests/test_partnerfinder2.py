from django.test import TestCase
from climbing_app_backend.models import Location, AppUser, PartnerFinderPost, PartnerFinderReply
import uuid

class CoommentModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        print("Setting up Partner Finder Tests!")
    
    def setUp(self):
        user1 = AppUser.objects.create(username = 'wenshu', email = 'tester123@gmail.com')
        user2 = AppUser.objects.create(username = 'matthew', email = 'testee123@gmail.com')
        loc = Location.objects.create(name = "blah", location_id = 1, description='this is cool', state = 'KY',latitude=0,longitude=0,)
        pf = PartnerFinderPost.objects.create(location = loc, content = "Hello. This is a partner finder post", author =user1, skill_level = 'B', post_id = uuid.uuid4())
        pf_reply = PartnerFinderReply.objects.create(location = loc, content = 'Hello. This is a partner finder reply', parent = pf, author = user2, reply_id = uuid.uuid4())

    def test_pf_default_min_age(self):
        auth = AppUser.objects.get(username = 'wenshu')
        pf = PartnerFinderPost.objects.get(author = auth)
        min_age = getattr(pf, 'min_age')
        self.assertEqual(min_age, 16)
    
    def test_pf_default_max_age(self):
        auth = AppUser.objects.get(username = 'wenshu')
        pf = PartnerFinderPost.objects.get(author = auth)
        max_age = getattr(pf, 'max_age')
        self.assertEqual(max_age, 100)
    
    def test_content(self):
        auth = AppUser.objects.get(username = 'wenshu')
        pf = PartnerFinderPost.objects.get(author = auth)
        content = getattr(pf, 'content')
        self.assertEqual(content, "Hello. This is a partner finder post")
    
    def test_skill_level(self):
        auth = AppUser.objects.get(username = 'wenshu')
        pf = PartnerFinderPost.objects.get(author = auth)
        skill_level = getattr(pf, 'skill_level')
        self.assertEqual(skill_level, 'B')
    
    def test_pf_author(self):
        pf = PartnerFinderPost.objects.get(content = "Hello. This is a partner finder post")
        author = getattr(pf, 'author')
        auth = AppUser.objects.get(username = 'wenshu')
        self.assertEqual(author, auth)
    
    def test_pf_reply_content(self):
        auth = AppUser.objects.get(username = 'wenshu')
        auth2 = AppUser.objects.get(username = 'matthew')
        pf = PartnerFinderPost.objects.get(author = auth)
        pf_reply = PartnerFinderReply.objects.get(author=auth2)
        content = getattr(pf_reply, 'content')
        self.assertEqual(content, 'Hello. This is a partner finder reply')
    
    def test_pf_reply_auth(self):
        auth = AppUser.objects.get(username = 'wenshu')
        auth2 = AppUser.objects.get(username = 'matthew')
        pf = PartnerFinderPost.objects.get(author = auth)
        pf_reply = PartnerFinderReply.objects.get(author=auth2)
        author = getattr(pf_reply, 'author')
        self.assertEqual(author, auth2)
    
    def test_pf_reply_parent(self):
        auth = AppUser.objects.get(username = 'wenshu')
        auth2 = AppUser.objects.get(username = 'matthew')
        pf = PartnerFinderPost.objects.get(author = auth)
        pf_reply = PartnerFinderReply.objects.get(author=auth2)
        parent = getattr(pf_reply, 'parent')
        self.assertEqual(parent, pf)