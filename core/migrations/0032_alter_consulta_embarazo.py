# Generated by Django 5.1.1 on 2025-02-04 06:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0031_consulta_archivo_pdf_consulta_embarazo_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='consulta',
            name='embarazo',
            field=models.BooleanField(blank=True, null=True),
        ),
    ]
