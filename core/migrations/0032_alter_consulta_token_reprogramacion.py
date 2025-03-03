# Generated by Django 4.2 on 2025-02-27 03:36

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0031_consulta_token_reprogramacion'),
    ]

    operations = [
        migrations.AlterField(
            model_name='consulta',
            name='token_reprogramacion',
            field=models.UUIDField(blank=True, default=uuid.uuid4, null=True, unique=True),
        ),
    ]
