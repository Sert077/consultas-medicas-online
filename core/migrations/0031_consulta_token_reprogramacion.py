# Generated by Django 4.2 on 2025-02-27 03:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0030_chatmessage_pdf'),
    ]

    operations = [
        migrations.AddField(
            model_name='consulta',
            name='token_reprogramacion',
            field=models.UUIDField(blank=True, null=True),
        ),
    ]
