# Generated by Django 5.1.1 on 2024-12-14 05:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0024_consulta_alergias_consulta_edad_consulta_genero_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='consulta',
            name='genero',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='consulta',
            name='tipo_sangre',
            field=models.CharField(blank=True, max_length=3, null=True),
        ),
    ]
