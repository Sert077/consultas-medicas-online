# Generated by Django 5.1.1 on 2025-02-04 05:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0030_consulta_tipo_consulta'),
    ]

    operations = [
        migrations.AddField(
            model_name='consulta',
            name='archivo_pdf',
            field=models.FileField(blank=True, null=True, upload_to='profile_pictures/pdf_adjunt_consultas/'),
        ),
        migrations.AddField(
            model_name='consulta',
            name='embarazo',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='consulta',
            name='tipo_consulta',
            field=models.CharField(choices=[('presencial', 'Presencial'), ('virtual', 'Virtual')], default='virtual', max_length=10),
        ),
    ]
