# Generated by Django 4.2 on 2024-12-09 17:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0020_rename_picture_image_perfil_user_picture'),
    ]

    operations = [
        migrations.AddField(
            model_name='perfil',
            name='verificado',
            field=models.BooleanField(default=False),
        ),
    ]
