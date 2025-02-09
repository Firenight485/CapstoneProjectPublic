# Generated by Django 4.2.7 on 2024-04-21 18:26

from django.conf import settings
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='AppUser',
            fields=[
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('email', models.EmailField(max_length=100, unique=True)),
                ('username', models.CharField(max_length=100, primary_key=True, serialize=False)),
                ('is_admin', models.BooleanField(default=False)),
                ('profile_pic', models.ImageField(blank=True, default='climbing_app_backend/profilepics/360_F_346936114_RaxE6OQogebgAWTalE1myseY1Hbb5qPM.jpg', upload_to='climbing_app_backend/profilepics')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('insta_link', models.URLField(blank=True)),
                ('vl_link', models.URLField(blank=True)),
                ('recents', models.CharField(default='Empty', max_length=1000)),
                ('forgot_pwd_key', models.CharField(blank=True, max_length=1000)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Location',
            fields=[
                ('name', models.CharField(default='None', help_text='Enter a location name', max_length=100, primary_key=True, serialize=False)),
                ('location_id', models.UUIDField(default=uuid.UUID('61d2f2ad-27e5-4dbc-b0f5-6b5d9a1ba90e'), editable=False, help_text='ID associated with location', unique=True)),
                ('latitude', models.DecimalField(decimal_places=15, max_digits=18)),
                ('longitude', models.DecimalField(decimal_places=15, max_digits=18)),
                ('description', models.TextField(default='This location was generated by default, and thus no description was entered.', help_text='Enter a description of the climbing location', max_length=5000)),
                ('state', models.CharField(choices=[('AL', 'Alabama'), ('AK', 'Alaska'), ('AZ', 'Arizona'), ('AR', 'Arkansas'), ('CA', 'California'), ('CO', 'Colorado'), ('CT', 'Connecticut'), ('DE', 'Delaware'), ('FL', 'Florida'), ('GA', 'Georgia'), ('HI', 'Hawaii'), ('ID', 'Idaho'), ('IL', 'Illinois'), ('IN', 'Indiana'), ('IA', 'Iowa'), ('KS', 'Kansas'), ('KY', 'Kentucky'), ('LA', 'Louisiana'), ('ME', 'Maine'), ('MD', 'Maryland'), ('MA', 'Massachusetts'), ('MI', 'Michigan'), ('MN', 'Minnesota'), ('MS', 'Mississippi'), ('MO', 'Missouri'), ('MT', 'Montana'), ('NE', 'Nebraska'), ('NV', 'Nevada'), ('NH', 'New Hampshire'), ('NJ', 'New Jersey'), ('NM', 'New Mexico'), ('NY', 'New York'), ('NC', 'North Carolina'), ('ND', 'North Dakota'), ('OH', 'Ohio'), ('OK', 'Oklahoma'), ('OR', 'Oregon'), ('PA', 'Pennsylvania'), ('RI', 'Rhode Island'), ('SC', 'South Carolina'), ('SD', 'South Dakota'), ('TN', 'Tennessee'), ('TX', 'Texas'), ('UT', 'Utah'), ('VT', 'Vermont'), ('VA', 'Virginia'), ('WA', 'Washington'), ('WV', 'West Virginia'), ('WI', 'Wisconsin'), ('WY', 'Wyoming'), ('INTL', 'International')], help_text='What state the location is in', max_length=100)),
                ('difficulty_level', models.CharField(choices=[('B', 'Beginner'), ('I', 'Intermediate'), ('A', 'Advanced')], help_text='Enter a difficulty level', max_length=20)),
                ('rock_type', models.CharField(choices=[('G', 'Granite'), ('L', 'Limestone'), ('S', 'Sandstone'), ('B', 'Basalt'), ('Q', 'Quartzite')], help_text='Enter the type of rock at this location', max_length=30)),
                ('climbing_type', models.JSONField(default=list)),
                ('monthly_page_views', models.IntegerField(default=0)),
                ('is_published', models.BooleanField(default=False)),
                ('author', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='PartnerFinderPost',
            fields=[
                ('content', models.TextField(blank=True, help_text='Enter your message')),
                ('max_age', models.IntegerField(blank=True, default=100, help_text='maximum age', validators=[django.core.validators.MaxValueValidator(100), django.core.validators.MinValueValidator(16)])),
                ('min_age', models.IntegerField(blank=True, default=16, help_text='minimum age', validators=[django.core.validators.MaxValueValidator(100), django.core.validators.MinValueValidator(16)])),
                ('skill_level', models.CharField(choices=[('B', 'Beginner'), ('I', 'Intermediate'), ('A', 'Advanced')], help_text='Enter a skill level', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('post_id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('location', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='climbing_app_backend.location')),
            ],
            options={
                'ordering': ['created_at'],
            },
        ),
        migrations.CreateModel(
            name='Weather',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('hourly_forecast', models.JSONField(default=list)),
                ('daily_forecast', models.JSONField(default=list)),
                ('monthly_forecast', models.JSONField(default=list)),
                ('name', models.ForeignKey(blank=True, default=None, on_delete=django.db.models.deletion.CASCADE, to='climbing_app_backend.location', unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField(help_text='Enter your message')),
                ('message_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='message_id', to=settings.AUTH_USER_MODEL)),
                ('reciever_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='receiver_id', to=settings.AUTH_USER_MODEL)),
                ('sender_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sender_id', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('comment_id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('content', models.CharField(help_text='Enter your comment', max_length=250)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('rating', models.IntegerField(blank=True, help_text='number of stars out of 5', null=True, validators=[django.core.validators.MaxValueValidator(5), django.core.validators.MinValueValidator(0)])),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('location', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='climbing_app_backend.location')),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='climbing_app_backend.comment')),
            ],
            options={
                'ordering': ['created_at'],
            },
        ),
        migrations.AddField(
            model_name='appuser',
            name='favorite_locs',
            field=models.ManyToManyField(blank=True, related_name='fav_locs_list', to='climbing_app_backend.location'),
        ),
        migrations.AddField(
            model_name='appuser',
            name='friends',
            field=models.ManyToManyField(blank=True, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='appuser',
            name='groups',
            field=models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups'),
        ),
        migrations.AddField(
            model_name='appuser',
            name='logbook',
            field=models.ManyToManyField(blank=True, related_name='log_list', to='climbing_app_backend.location'),
        ),
        migrations.AddField(
            model_name='appuser',
            name='user_permissions',
            field=models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions'),
        ),
        migrations.CreateModel(
            name='PartnerFinderReply',
            fields=[
                ('content', models.TextField(blank=True, help_text='Enter your message')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('reply_id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('location', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='climbing_app_backend.location')),
                ('parent', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='climbing_app_backend.partnerfinderpost')),
            ],
            options={
                'ordering': ['created_at'],
                'indexes': [models.Index(fields=['created_at'], name='climbing_ap_created_d12f2d_idx')],
            },
        ),
        migrations.AddIndex(
            model_name='partnerfinderpost',
            index=models.Index(fields=['created_at'], name='climbing_ap_created_2e8f22_idx'),
        ),
        migrations.AddIndex(
            model_name='comment',
            index=models.Index(fields=['created_at'], name='climbing_ap_created_635846_idx'),
        ),
    ]
