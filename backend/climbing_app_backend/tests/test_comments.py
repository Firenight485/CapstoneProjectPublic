from django.test import TestCase
from climbing_app_backend.models import Location, AppUser, Comment
import uuid

class CoommentModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        print("Setting up Comment Tests!")
    
    def setUp(self):
        user1 = AppUser.objects.create(username = 'wenshu', email = 'tester123@gmail.com')
        user2 = AppUser.objects.create(username = 'matthew', email = 'testee123@gmail.com')
        loc = Location.objects.create(name = "blah", location_id = 1, description='this is cool', state = 'KY',latitude=0,longitude=0,)
        com1 = Comment.objects.create(location =loc, author = user1, comment_id = uuid.uuid4(), content= "This is a comment", rating = 1)
        reply =Comment.objects.create(location = loc, author = user2, comment_id=uuid.uuid4(), content= "This is a reply", parent=com1)

    def test_comment_content(self):
        user1 = AppUser.objects.get(username = 'wenshu')
        comment = Comment.objects.get(author = user1)
        content = getattr(comment, 'content')
        self.assertEqual(content, 'This is a comment')
    
    def test_comment_author(self):
        user1 = AppUser.objects.get(username = 'wenshu')
        comment = Comment.objects.get(content = "This is a comment")
        author = getattr(comment, 'author')
        self.assertEqual(author, user1)
    
    def test_rating(self):
        user1 = AppUser.objects.get(username = 'wenshu')
        comment = Comment.objects.get(content = "This is a comment")
        rating = getattr(comment, 'rating')
        self.assertEqual(rating, 1)
    
    def test_reply(self):
        user1 = AppUser.objects.get(username = 'wenshu')
        comment = Comment.objects.get(content = "This is a comment")
        reply = Comment.objects.get(content = "This is a reply")
        parent = getattr(reply, 'parent')
        self.assertEqual(comment, parent)
    
    def test_reply2(self):
        reply = Comment.objects.get(content = "This is a reply")
        content = getattr(reply, 'content')
        self.assertEqual(content, 'This is a reply')
    
    def test_reply_author(self):
        user1 = AppUser.objects.get(username = 'wenshu')
        user2 = AppUser.objects.get(username = 'matthew')
        reply = Comment.objects.get(content = "This is a reply")
        auth = getattr(reply, 'author')
        self.assertEqual(auth, user2)

