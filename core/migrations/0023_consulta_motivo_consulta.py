# Generated by Django 5.1.1 on 2024-12-14 02:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0022_remove_doctor_horario_atencion_doctor_days_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='consulta',
            name='motivo_consulta',
            field=models.TextField(blank=True, null=True),
        ),
    ]
