# Generated by Django 5.1.1 on 2024-10-20 04:35

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0011_chat_message'),
    ]

    operations = [
        migrations.DeleteModel(
            name='ChatMessage',
        ),
    ]
